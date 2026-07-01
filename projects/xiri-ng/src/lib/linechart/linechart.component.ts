import { Component, computed, input } from '@angular/core';
import { XiriColor } from '../types/color.type';
import { XiriEchartsHostComponent } from '../echarts/echarts-host.component';
import { resolveColor } from '../echarts/color';
import { escapeHtml } from '../echarts/tooltip';
import { XiriEchartsTooltipParams } from '../echarts/params';

export interface XiriLineChartLine {
	name: string;
	values: number[];
	color?: XiriColor;
	dashed?: boolean;
	area?: boolean;     // fill area below the line
}

export interface XiriLineChartSettings {
	title?: string;
	xLabels: string[];
	lines: XiriLineChartLine[];
	yMin?: number;
	yMax?: number;
	smooth?: boolean;
	compact?: boolean;
	xLabelRotate?: number;   // rotate x-axis labels by degrees (-90..90), 90 = vertical
}

@Component( {
	selector: 'xiri-linechart',
	template: `
		<xiri-echarts-host
			[option]="option()"
			[compact]="compact()"
			[title]="settings().title">
		</xiri-echarts-host>
	`,
	imports: [ XiriEchartsHostComponent ]
} )
export class XiriLineChartComponent {

	settings = input.required<XiriLineChartSettings>();

	compact = computed<boolean>( () => !!this.settings().compact );

	option = computed( () => {
		const s = this.settings();
		const lines = s.lines ?? [];
		const labels = s.xLabels ?? [];

		const series = lines.map( ( line, i ) => {
			const color = resolveColor( line.color, FALLBACK_COLORS[ i % FALLBACK_COLORS.length ] );
			return {
				type: 'line',
				name: line.name,
				smooth: !!s.smooth,
				symbol: 'circle',
				symbolSize: 6,
				lineStyle: {
					width: 2,
					type: line.dashed ? 'dashed' : 'solid',
					color,
				},
				itemStyle: { color },
				areaStyle: line.area ? { color, opacity: 0.15 } : undefined,
				data: line.values,
			};
		} );

		return {
			grid: this.compact()
				? { left: 0, right: 0, top: 4, bottom: 0, containLabel: true }
				: { left: 32, right: 16, top: 24, bottom: 24, containLabel: true },
			tooltip: {
				trigger: 'axis',
				formatter: ( params: XiriEchartsTooltipParams ) => {
					const arr = Array.isArray( params ) ? params : [ params ];
					if ( !arr.length ) return '';
					const header = escapeHtml( String( arr[ 0 ].axisValueLabel ?? arr[ 0 ].name ?? '' ) );
					let body = '';
					for ( const p of arr ) {
						body += `<br/>${ p.marker }${ escapeHtml( String( p.seriesName ?? '' ) ) }: <b>${ p.value }</b>`;
					}
					return `<b>${ header }</b>${ body }`;
				}
			},
			legend: lines.length > 1 ? { top: 0, right: 0, type: 'scroll' } : undefined,
			xAxis: {
				type: 'category',
				data: labels,
				boundaryGap: false,
				axisLine: { show: false },
				axisTick: { show: false },
				axisLabel: s.xLabelRotate != null ? { rotate: s.xLabelRotate, interval: 0 } : undefined
			},
			yAxis: {
				type: 'value',
				min: s.yMin,
				max: s.yMax,
				splitLine: { lineStyle: { color: '#eee' } }
			},
			series,
		};
	} );
}

/** Fallback color rotation when a line has no explicit color. */
const FALLBACK_COLORS = [ '#8b5cf6', '#10b981', '#1e88e5', '#fb8c00', '#e53935', '#fbc02d', '#43a047', '#616161' ];
