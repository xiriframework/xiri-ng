import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { XiriColor } from '../types/color.type';
import { XiriEchartsClick, XiriEchartsHostComponent } from '../echarts/echarts-host.component';
import { resolveColor } from '../echarts/color';
import { escapeHtml } from '../echarts/tooltip';
import { XiriEchartsCallbackParams, XiriEchartsTooltipParams } from '../echarts/params';

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
	url?: string;
	text?: string;   // overrides the on-bar label (when showValues is on)
}

export interface XiriBarChartPoint {
	time: number;
	value: number;
	name?: string;
	url?: string;
}

export interface XiriBarChartSettings {
	title?: string;
	yMin?: number;
	yMax?: number;
	color?: XiriColor;
	bars?: XiriBarChartBar[];
	points?: XiriBarChartPoint[];
	compact?: boolean;
	showValues?: boolean;                  // show value/text labels on bars
	labelPosition?: 'top' | 'inside';      // default 'top'
	xLabelRotate?: number;                 // rotate x-axis labels by degrees (-90..90), 90 = vertical
}

@Component( {
	selector: 'xiri-barchart',
	template: `
		<xiri-echarts-host
			[option]="option()"
			[compact]="compact()"
			[title]="settings().title"
			(itemClick)="onItemClick($event)">
		</xiri-echarts-host>
	`,
	imports: [ XiriEchartsHostComponent ]
} )
export class XiriBarChartComponent {

	mode = input<XiriBarChartMode | string>( 'simple' );
	settings = input.required<XiriBarChartSettings>();

	private router = inject( Router );

	compact = computed<boolean>( () => !!this.settings().compact );

	onItemClick( e: XiriEchartsClick ): void {
		const s = this.settings();
		const coll = this.mode() === 'heatmap' ? s.points : s.bars;
		const url = coll?.[ e.dataIndex ]?.url;
		if ( !url )
			return;
		if ( /^https?:\/\//.test( url ) )
			window.open( url, '_blank' );
		else
			this.router.navigateByUrl( url );
	}

	option = computed( () => {
		const m = this.mode();
		switch ( m ) {
			case 'stacked': return this.stackedOption();
			case 'heatmap': return this.heatmapOption();
			default:        return this.simpleOption();
		}
	} );

	// Rotated x-axis labels (interval: 0 forces all labels — no thinning on narrow bars).
	private xLabelConfig() {
		const r = this.settings().xLabelRotate;
		return r != null ? { rotate: r, interval: 0 } : undefined;
	}

	private baseGrid() {
		// Compact mode: outer card already provides padding — shrink the
		// echarts grid so we don't get a "double margin".
		if ( this.compact() ) {
			return { left: 0, right: 0, top: 4, bottom: 0, containLabel: true };
		}
		return { left: 32, right: 16, top: 24, bottom: 24, containLabel: true };
	}

	private simpleOption() {
		const s = this.settings();
		const bars = s.bars ?? [];
		const color = resolveColor( s.color, '#8b5cf6' );
		return {
			grid: this.baseGrid(),
			tooltip: {
				trigger: 'axis',
				formatter: ( params: XiriEchartsTooltipParams ) => {
					const arr = Array.isArray( params ) ? params : [ params ];
					if ( !arr.length ) return '';
					const p = arr[ 0 ];
					const bar = bars[ p.dataIndex ];
					const header = bar?.name ?? bar?.label ?? p.axisValueLabel ?? '';
					return `<b>${ escapeHtml( header ) }</b><br/>${ p.marker }${ p.value }`;
				}
			},
			xAxis: {
				type: 'category',
				data: bars.map( b => b.label ),
				axisLine: { show: false },
				axisTick: { show: false },
				axisLabel: this.xLabelConfig()
			},
			yAxis: {
				type: 'value',
				min: s.yMin,
				max: s.yMax,
				splitLine: { lineStyle: { color: '#eee' } }
			},
			series: [ {
				type: 'bar',
				data: bars.map( b => ( {
					value: b.value ?? 0,
					itemStyle: { cursor: b.url ? 'pointer' : 'default' }
				} ) ),
				itemStyle: { color, borderRadius: [ 3, 3, 0, 0 ] },
				barCategoryGap: '40%',
				label: {
					show: !!s.showValues,
					position: s.labelPosition === 'inside' ? 'inside' : 'top',
					color: s.labelPosition === 'inside' ? '#fff' : undefined,
					formatter: ( p: XiriEchartsCallbackParams ) => bars[ p.dataIndex ]?.text ?? String( p.value )
				}
			} ]
		};
	}

	private stackedOption() {
		const s = this.settings();
		const bars = s.bars ?? [];
		const segCount = Math.max( 0, ...bars.map( b => b.segments?.length ?? 0 ) );

		// Derive a default series name per segment-position from the first bar that has it.
		const seriesNames: string[] = [];
		for ( let i = 0; i < segCount; i++ ) {
			const found = bars.find( b => b.segments?.[ i ]?.name )?.segments?.[ i ]?.name;
			seriesNames.push( found ?? '' );
		}

		const series: unknown[] = [];
		for ( let i = 0; i < segCount; i++ ) {
			series.push( {
				type: 'bar',
				stack: 'total',
				name: seriesNames[ i ] || `Segment ${ i + 1 }`,
				barCategoryGap: '40%',
				label: {
					show: !!s.showValues,
					position: 'inside',
					color: '#fff',
					formatter: ( p: XiriEchartsCallbackParams ) => ( p.value === 0 ? '' : String( p.value ) )
				},
				data: bars.map( b => {
					const seg = b.segments?.[ i ];
					if ( !seg ) return { value: 0, itemStyle: { color: 'transparent' } };
					return {
						value: seg.value,
						name: seg.name ?? seriesNames[ i ] ?? '',
						itemStyle: { color: resolveColor( seg.color, '#9e9e9e' ), cursor: b.url ? 'pointer' : 'default' }
					};
				} )
			} );
		}

		return {
			grid: this.baseGrid(),
			tooltip: {
				trigger: 'axis',
				formatter: ( params: XiriEchartsTooltipParams ) => {
					const arr = Array.isArray( params ) ? params : [ params ];
					if ( !arr.length ) return '';
					const idx = arr[ 0 ].dataIndex;
					const bar = bars[ idx ];
					const header = bar?.name ?? bar?.label ?? '';
					let body = '';
					for ( const p of arr ) {
						if ( !p.value && p.value !== 0 ) continue;
						if ( p.value === 0 ) continue;
						const seg = bar?.segments?.[ p.seriesIndex ?? 0 ];
						const label = seg?.name ?? p.seriesName ?? '';
						body += `<br/>${ p.marker }${ escapeHtml( label ) }: <b>${ p.value }</b>`;
					}
					return `<b>${ escapeHtml( header ) }</b>${ body }`;
				}
			},
			xAxis: {
				type: 'category',
				data: bars.map( b => b.label ),
				axisLine: { show: false },
				axisTick: { show: false },
				axisLabel: this.xLabelConfig()
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
		const color = resolveColor( s.color, '#8b5cf6' );
		return {
			grid: { ...this.baseGrid(), left: 8, right: 8 },
			tooltip: {
				trigger: 'axis',
				formatter: ( params: XiriEchartsTooltipParams ) => {
					const arr = Array.isArray( params ) ? params : [ params ];
					if ( !arr.length ) return '';
					const p = arr[ 0 ];
					const point = points[ p.dataIndex ];
					const val = p.value as number[];
					const date = new Date( val[ 0 ] ).toLocaleString();
					const head = point?.name ? `<b>${ escapeHtml( point.name ) }</b><br/>` : '';
					return `${ head }${ escapeHtml( date ) }<br/>${ p.marker }<b>${ val[ 1 ] }</b>`;
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
			series: [ {
				type: 'bar',
				barMinWidth: 1,
				barMaxWidth: 3,
				data: points.map( p => ( {
					value: [ p.time, p.value ],
					itemStyle: { cursor: p.url ? 'pointer' : 'default' }
				} ) ),
				itemStyle: { color }
			} ]
		};
	}
}
