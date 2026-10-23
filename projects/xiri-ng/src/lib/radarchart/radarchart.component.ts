import { Component, computed, input } from '@angular/core';
import { XiriColor } from '../types/color.type';
import { XiriEchartsHostComponent } from '../echarts/echarts-host.component';
import { resolveColor, seriesColor } from '../echarts/color';

export interface XiriRadarChartIndicator {
	name: string;
	max?: number;      // without max echarts scales the axis itself
}

export interface XiriRadarChartSeries {
	name: string;
	values: number[];  // one value per indicator, same order
	color?: XiriColor;
}

export interface XiriRadarChartSettings {
	title?: string;
	indicators: XiriRadarChartIndicator[];
	series: XiriRadarChartSeries[];
	area?: boolean;    // fill the area of each series
	compact?: boolean;
}

@Component( {
	selector: 'xiri-radarchart',
	template: `
		<xiri-echarts-host [option]="option()" [compact]="compact()" chartHeight="280px" [title]="settings().title">
		</xiri-echarts-host>
	`,
	imports: [ XiriEchartsHostComponent ]
} )
export class XiriRadarChartComponent {

	settings = input.required<XiriRadarChartSettings>();

	compact = computed<boolean>( () => !!this.settings().compact );

	option = computed( () => {
		const s = this.settings();
		const series = s.series ?? [];
		return {
			tooltip: { trigger: 'item' },
			legend: series.length > 1 ? { top: 0, right: 0, type: 'scroll' } : undefined,
			radar: {
				indicator: ( s.indicators ?? [] ).map( i => ( { name: i.name, max: i.max } ) ),
				// Mit Legende oben rückt das Netz nach unten, sonst verdeckt sie die oberste Achsenbeschriftung.
				center: [ '50%', series.length > 1 ? '56%' : '50%' ],
				radius: this.compact() ? '70%' : '62%',
			},
			series: [ {
				type: 'radar',
				data: series.map( ( x, i ) => {
					const color = resolveColor( x.color, seriesColor( i ) );
					return {
						name: x.name,
						value: x.values,
						itemStyle: { color },
						lineStyle: { color, width: 2 },
						areaStyle: s.area ? { color, opacity: 0.15 } : undefined,
					};
				} ),
			} ],
		};
	} );
}
