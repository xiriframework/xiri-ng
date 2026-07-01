import { Component, computed, input } from '@angular/core';
import { XiriEchartsHostComponent } from '../echarts/echarts-host.component';
import { escapeHtml } from '../echarts/tooltip';
import { XiriEchartsCallbackParams } from '../echarts/params';

export interface XiriHeatmapCell {
	x: number;        // index into xLabels
	y: number;        // index into yLabels
	value: number;
	label?: string;   // optional override for the cell's display value
}

export interface XiriHeatmapSettings {
	title?: string;
	xLabels: string[];
	yLabels: string[];
	cells: XiriHeatmapCell[];
	min?: number;
	max?: number;
	colorRange?: [ string, string ];   // CSS colors for low/high; default light → purple
	showValues?: boolean;              // print values inside cells (only readable for small grids)
	compact?: boolean;
	xLabelRotate?: number;             // rotate x-axis labels by degrees (-90..90), 90 = vertical
}

@Component( {
	selector: 'xiri-heatmap',
	template: `
		<xiri-echarts-host
			[option]="option()"
			[compact]="compact()"
			[title]="settings().title"
			[chartHeight]="height()">
		</xiri-echarts-host>
	`,
	imports: [ XiriEchartsHostComponent ]
} )
export class XiriHeatmapComponent {

	settings = input.required<XiriHeatmapSettings>();

	compact = computed<boolean>( () => !!this.settings().compact );

	height = computed<string>( () => {
		const rows = this.settings().yLabels.length || 1;
		const px = Math.max( 200, rows * 32 + 40 );
		return px + 'px';
	} );

	option = computed( () => {
		const s = this.settings();
		const cells = s.cells ?? [];
		const values = cells.map( c => c.value );
		const min = s.min ?? Math.min( 0, ...values );
		const max = s.max ?? Math.max( 0, ...values );
		const [ lowColor, highColor ] = s.colorRange ?? [ '#ede9fe', '#7c3aed' ];

		return {
			grid: this.compact()
				? { left: 0, right: 0, top: 4, bottom: 0, containLabel: true }
				: { left: 32, right: 16, top: 24, bottom: 24, containLabel: true },
			tooltip: {
				position: 'top',
				formatter: ( p: XiriEchartsCallbackParams ) => {
					const val = p.value as number[];
					const x = s.xLabels[ val[ 0 ] ] ?? '';
					const y = s.yLabels[ val[ 1 ] ] ?? '';
					return `<b>${ escapeHtml( y ) }</b> / <b>${ escapeHtml( x ) }</b><br/>${ p.marker }<b>${ val[ 2 ] }</b>`;
				}
			},
			xAxis: {
				type: 'category',
				data: s.xLabels,
				splitArea: { show: true },
				axisLine: { show: false },
				axisTick: { show: false },
				axisLabel: s.xLabelRotate != null ? { rotate: s.xLabelRotate, interval: 0 } : undefined
			},
			yAxis: {
				type: 'category',
				data: s.yLabels,
				splitArea: { show: true },
				axisLine: { show: false },
				axisTick: { show: false }
			},
			visualMap: {
				min,
				max,
				calculable: true,
				orient: 'horizontal',
				left: 'center',
				bottom: 0,
				inRange: { color: [ lowColor, highColor ] },
				show: !this.compact()
			},
			series: [ {
				type: 'heatmap',
				data: cells.map( c => [ c.x, c.y, c.value ] ),
				label: { show: !!s.showValues, formatter: ( p: XiriEchartsCallbackParams ) => String( ( p.value as number[] )[ 2 ] ) },
				emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0, 0, 0, 0.3)' } }
			} ]
		};
	} );
}
