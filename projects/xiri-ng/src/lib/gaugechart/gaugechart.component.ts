import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { XiriColor } from '../types/color.type';
import { XiriEchartsHostComponent } from '../echarts/echarts-host.component';
import { resolveColor } from '../echarts/color';

export interface XiriGaugeChartSettings {
	title?: string;
	value: number;
	min?: number;       // default 0
	max?: number;       // default 100
	color?: XiriColor;
	label?: string;     // detail label below the value (e.g. "%", "MB/s")
	compact?: boolean;
}

@Component( {
	selector: 'xiri-gaugechart',
	template: `
		<xiri-echarts-host
			[option]="option()"
			[compact]="compact()"
			[title]="settings().title">
		</xiri-echarts-host>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ XiriEchartsHostComponent ]
} )
export class XiriGaugeChartComponent {

	settings = input.required<XiriGaugeChartSettings>();

	compact = computed<boolean>( () => !!this.settings().compact );

	option = computed( () => {
		const s = this.settings();
		const min = s.min ?? 0;
		const max = s.max ?? 100;
		const color = resolveColor( s.color, '#8b5cf6' );

		return {
			series: [ {
				type: 'gauge',
				min,
				max,
				center: [ '50%', '60%' ],
				radius: this.compact() ? '90%' : '80%',
				progress: {
					show: true,
					width: 12,
					itemStyle: { color }
				},
				axisLine: {
					lineStyle: { width: 12, color: [ [ 1, '#eee' ] ] }
				},
				pointer: { show: false },
				axisTick: { show: !this.compact() },
				splitLine: { show: !this.compact() },
				axisLabel: { show: !this.compact(), distance: 18, fontSize: 11 },
				anchor: { show: false },
				title: { show: false },
				detail: {
					valueAnimation: true,
					offsetCenter: [ 0, '15%' ],
					fontSize: this.compact() ? 18 : 24,
					fontWeight: 'bold',
					formatter: s.label ? `{value}\n{label|${ s.label }}` : '{value}',
					rich: { label: { fontSize: 11, fontWeight: 'normal', color: '#888' } },
					color
				},
				data: [ { value: s.value } ]
			} ]
		};
	} );
}
