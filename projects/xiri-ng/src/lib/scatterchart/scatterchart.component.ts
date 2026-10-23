import { Component, computed, input } from '@angular/core';
import { XiriColor } from '../types/color.type';
import { XiriEchartsHostComponent } from '../echarts/echarts-host.component';
import { resolveColor, seriesColor } from '../echarts/color';
import { escapeHtml } from '../echarts/tooltip';

export interface XiriScatterChartPoint {
	x: number;
	y: number;
	name?: string;     // shown in the tooltip
}

export interface XiriScatterChartSeries {
	name: string;
	points: XiriScatterChartPoint[];
	color?: XiriColor;
}

export interface XiriScatterChartSettings {
	title?: string;
	series: XiriScatterChartSeries[];
	xLabel?: string;   // axis titles
	yLabel?: string;
	compact?: boolean;
}

interface ScatterTooltipParams {
	seriesName?: string;
	name?: string;
	value: number[];
	marker: string;
}

@Component( {
	selector: 'xiri-scatterchart',
	template: `
		<xiri-echarts-host [option]="option()" [compact]="compact()" chartHeight="280px" [title]="settings().title">
		</xiri-echarts-host>
	`,
	imports: [ XiriEchartsHostComponent ]
} )
export class XiriScatterChartComponent {

	settings = input.required<XiriScatterChartSettings>();

	compact = computed<boolean>( () => !!this.settings().compact );

	option = computed( () => {
		const s = this.settings();
		const series = s.series ?? [];
		// Achsentitel mittig an der Achse; den Platz dafür deckt containLabel nicht ab, darum der Rand im grid.
		const axis = ( name?: string, rotate?: number ) => ( {
			type: 'value', name, nameLocation: 'middle', nameRotate: rotate, nameGap: rotate ? 40 : 28, scale: true,
			splitLine: { lineStyle: { color: '#eee' } },
		} );
		return {
			grid: this.compact()
				? { left: 0, right: 0, top: 4, bottom: 0, containLabel: true }
				: { left: s.yLabel ? 48 : 32, right: 16, top: series.length > 1 ? 32 : 24, bottom: s.xLabel ? 32 : 24, containLabel: true },
			tooltip: {
				trigger: 'item',
				formatter: ( p: ScatterTooltipParams ) => {
					const head = p.name ? `<b>${ escapeHtml( p.name ) }</b><br/>` : '';
					return `${ head }${ p.marker }${ escapeHtml( p.seriesName ?? '' ) }: ${ p.value[ 0 ] } / ${ p.value[ 1 ] }`;
				},
			},
			legend: series.length > 1 ? { top: 0, right: 0, type: 'scroll' } : undefined,
			xAxis: axis( s.xLabel ),
			yAxis: axis( s.yLabel, 90 ),
			series: series.map( ( x, i ) => ( {
				type: 'scatter',
				name: x.name,
				symbolSize: 10,
				itemStyle: { color: resolveColor( x.color, seriesColor( i ) ) },
				data: ( x.points ?? [] ).map( p => ( { value: [ p.x, p.y ], name: p.name } ) ),
			} ) ),
		};
	} );
}
