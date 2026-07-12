import { Component, computed, input } from '@angular/core';
import { XiriColor } from '../types/color.type';
import { XiriEchartsHostComponent } from '../echarts/echarts-host.component';
import { resolveColor } from '../echarts/color';

export interface XiriBulletChartSettings {
	title?: string;
	value: number;
	target?: number;
	max?: number;       // default: max(value, target) * 1.2
	label?: string;
	color?: XiriColor;
	compact?: boolean;
}

@Component( {
	selector: 'xiri-bulletchart',
	template: `
		<xiri-echarts-host
			[option]="option()"
			[compact]="compact()"
			[title]="settings().title">
		</xiri-echarts-host>
	`,
	imports: [ XiriEchartsHostComponent ]
} )
export class XiriBulletChartComponent {

	settings = input.required<XiriBulletChartSettings>();

	compact = computed<boolean>( () => !!this.settings().compact );

	option = computed( () => {
		const s = this.settings();
		const color = resolveColor( s.color, '#8b5cf6' );
		const max = s.max ?? Math.max( s.value, s.target ?? 0 ) * 1.2;
		const compact = this.compact();
		const valueText = s.label ? `${ s.value } ${ s.label }` : `${ s.value }`;

		return {
			// right: Platz für das Value-Label; top: Platz für das Ziel-Label über der Linie.
			grid: { left: 8, right: 56, top: 22, bottom: 8, containLabel: false },
			xAxis: { type: 'value', min: 0, max, show: false },
			yAxis: { type: 'category', data: [ '' ], show: false },
			series: [ {
				type: 'bar',
				data: [ s.value ],
				barWidth: compact ? 14 : 20,
				itemStyle: { color, borderRadius: 4 },
				label: {
					show: true,
					position: 'right',
					formatter: valueText,
					fontWeight: 'bold',
					color: '#333'
				},
				markLine: s.target !== undefined ? {
					symbol: 'none',
					precision: 0,
					label: {
						show: true,
						position: 'end',
						formatter: `Ziel ${ s.target }`,
						color: '#666',
						fontSize: 11
					},
					data: [ { xAxis: s.target, lineStyle: { color: '#333', width: 2, type: 'solid' } } ]
				} : undefined
			} ]
		};
	} );
}
