import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	computed,
	DestroyRef,
	effect,
	ElementRef,
	inject,
	input,
	NgZone,
	OnDestroy,
	signal,
	viewChild,
	ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCard, MatCardContent } from '@angular/material/card';
import { XiriColor } from '../types/color.type';

export type XiriBarChartMode = 'simple' | 'stacked' | 'heatmap';

export interface XiriBarChartSegment {
	value: number;
	color?: XiriColor;
	name?: string;
}

export interface XiriBarChartBar {
	label: string;
	value?: number;
	segments?: XiriBarChartSegment[];
	name?: string;
}

export interface XiriBarChartPoint {
	time: number;
	value: number;
	name?: string;
}

export interface XiriBarChartSettings {
	title?: string;
	yMin?: number;
	yMax?: number;
	color?: XiriColor;
	bars?: XiriBarChartBar[];
	points?: XiriBarChartPoint[];
	compact?: boolean;
}

const COLOR_CSS_VAR: Record<string, string> = {
	primary: 'var(--mat-sys-primary)',
	secondary: 'var(--mat-sys-secondary)',
	tertiary: 'var(--mat-sys-tertiary)',
	accent: 'var(--mat-sys-tertiary)',
	warn: '#f5a623',
	error: 'var(--mat-sys-error)',
	success: '#2e7d32',
	emerald: '#10b981',
	red: '#e53935',
	yellow: '#fbc02d',
	green: '#43a047',
	blue: '#1e88e5',
	purple: '#8b5cf6',
	orange: '#fb8c00',
	gray: '#9e9e9e',
	lightgray: '#cfcfcf',
	darkgray: '#616161',
	white: '#ffffff',
	black: '#000000',
	inherit: 'currentColor'
};

function resolveColor(color: XiriColor | string | undefined, fallback = '#8b5cf6'): string {
	if (!color) return fallback;
	return COLOR_CSS_VAR[color] ?? fallback;
}

@Component({
	selector: 'xiri-barchart',
	templateUrl: './barchart.component.html',
	styleUrl: './barchart.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	imports: [MatCard, MatCardContent],
	host: { '[class.compact]': 'compact()' }
})
export class XiriBarChartComponent implements AfterViewInit, OnDestroy {

	mode = input<XiriBarChartMode | string>('simple');
	settings = input.required<XiriBarChartSettings>();

	compact = computed<boolean>(() => !!this.settings().compact);

	chartHost = viewChild.required<ElementRef<HTMLDivElement>>('chartHost');

	private zone = inject(NgZone);
	private destroyRef = inject(DestroyRef);

	private chart: any | null = null;
	private echarts: any | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private loadError = signal<string | null>(null);

	readonly error = this.loadError.asReadonly();

	constructor() {
		effect(() => {
			// re-render when inputs change
			this.mode();
			this.settings();
			if (this.chart) {
				this.render();
			}
		});
	}

	async ngAfterViewInit(): Promise<void> {
		try {
			this.echarts = await import('echarts');
		} catch (err) {
			this.loadError.set('echarts is not installed. Add `npm install echarts` to your app.');
			return;
		}

		this.zone.runOutsideAngular(() => {
			this.chart = this.echarts.init(this.chartHost().nativeElement);
			this.render();

			this.resizeObserver = new ResizeObserver(() => this.chart?.resize());
			this.resizeObserver.observe(this.chartHost().nativeElement);
		});

		this.destroyRef.onDestroy(() => this.dispose());
	}

	ngOnDestroy(): void {
		this.dispose();
	}

	private dispose(): void {
		this.resizeObserver?.disconnect();
		this.resizeObserver = null;
		this.chart?.dispose();
		this.chart = null;
	}

	private render(): void {
		if (!this.chart) return;
		const m = this.mode();
		let option: any;
		switch (m) {
			case 'stacked':
				option = this.stackedOption();
				break;
			case 'heatmap':
				option = this.heatmapOption();
				break;
			default:
				option = this.simpleOption();
				break;
		}
		this.chart.setOption(option, true);
	}

	private baseGrid() {
		// In compact mode the surrounding card already provides padding,
		// so we shrink the echarts grid to avoid a "double margin" look.
		// containLabel: true ensures axis labels still get the space they need.
		if (this.compact()) {
			return { left: 0, right: 0, top: 4, bottom: 0, containLabel: true };
		}
		return { left: 32, right: 16, top: 24, bottom: 24, containLabel: true };
	}

	private simpleOption() {
		const s = this.settings();
		const bars = s.bars ?? [];
		const color = resolveColor(s.color, '#8b5cf6');
		return {
			grid: this.baseGrid(),
			tooltip: {
				trigger: 'axis',
				formatter: (params: any) => {
					const arr = Array.isArray(params) ? params : [params];
					if (!arr.length) return '';
					const p = arr[0];
					const bar = bars[p.dataIndex];
					const header = bar?.name ?? bar?.label ?? p.axisValueLabel ?? '';
					return `<b>${escapeHtml(header)}</b><br/>${p.marker}${p.value}`;
				}
			},
			xAxis: {
				type: 'category',
				data: bars.map(b => b.label),
				axisLine: { show: false },
				axisTick: { show: false }
			},
			yAxis: {
				type: 'value',
				min: s.yMin,
				max: s.yMax,
				splitLine: { lineStyle: { color: '#eee' } }
			},
			series: [{
				type: 'bar',
				data: bars.map(b => b.value ?? 0),
				itemStyle: { color, borderRadius: [3, 3, 0, 0] },
				barCategoryGap: '40%'
			}]
		};
	}

	private stackedOption() {
		const s = this.settings();
		const bars = s.bars ?? [];
		const segCount = Math.max(0, ...bars.map(b => b.segments?.length ?? 0));
		// derive a default series name per segment-position from the first bar that has it
		const seriesNames: string[] = [];
		for (let i = 0; i < segCount; i++) {
			const found = bars.find(b => b.segments?.[i]?.name)?.segments?.[i]?.name;
			seriesNames.push(found ?? '');
		}
		const series: any[] = [];
		for (let i = 0; i < segCount; i++) {
			series.push({
				type: 'bar',
				stack: 'total',
				name: seriesNames[i] || `Segment ${i + 1}`,
				barCategoryGap: '40%',
				data: bars.map(b => {
					const seg = b.segments?.[i];
					if (!seg) return { value: 0, itemStyle: { color: 'transparent' } };
					return {
						value: seg.value,
						name: seg.name ?? seriesNames[i] ?? '',
						itemStyle: { color: resolveColor(seg.color, '#9e9e9e') }
					};
				})
			});
		}
		return {
			grid: this.baseGrid(),
			tooltip: {
				trigger: 'axis',
				formatter: (params: any) => {
					const arr = Array.isArray(params) ? params : [params];
					if (!arr.length) return '';
					const idx = arr[0].dataIndex;
					const bar = bars[idx];
					const header = bar?.name ?? bar?.label ?? '';
					let body = '';
					for (const p of arr) {
						if (!p.value && p.value !== 0) continue;
						if (p.value === 0) continue;
						const seg = bar?.segments?.[p.seriesIndex];
						const label = seg?.name ?? p.seriesName ?? '';
						body += `<br/>${p.marker}${escapeHtml(label)}: <b>${p.value}</b>`;
					}
					return `<b>${escapeHtml(header)}</b>${body}`;
				}
			},
			xAxis: {
				type: 'category',
				data: bars.map(b => b.label),
				axisLine: { show: false },
				axisTick: { show: false }
			},
			yAxis: {
				type: 'value',
				min: s.yMin,
				max: s.yMax,
				splitLine: { lineStyle: { color: '#eee' } }
			},
			series
		};
	}

	private heatmapOption() {
		const s = this.settings();
		const points = s.points ?? [];
		const color = resolveColor(s.color, '#8b5cf6');
		return {
			grid: { ...this.baseGrid(), left: 8, right: 8 },
			tooltip: {
				trigger: 'axis',
				formatter: (params: any) => {
					const arr = Array.isArray(params) ? params : [params];
					if (!arr.length) return '';
					const p = arr[0];
					const point = points[p.dataIndex];
					const date = new Date(p.value[0]).toLocaleString();
					const head = point?.name ? `<b>${escapeHtml(point.name)}</b><br/>` : '';
					return `${head}${escapeHtml(date)}<br/>${p.marker}<b>${p.value[1]}</b>`;
				}
			},
			xAxis: {
				type: 'time',
				axisLine: { show: false },
				axisTick: { show: false },
				splitLine: { show: false }
			},
			yAxis: {
				type: 'value',
				min: s.yMin ?? 0,
				max: s.yMax,
				show: false
			},
			series: [{
				type: 'bar',
				barMinWidth: 1,
				barMaxWidth: 3,
				data: points.map(p => [p.time, p.value]),
				itemStyle: { color }
			}]
		};
	}
}

function escapeHtml(s: string): string {
	return String(s ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
