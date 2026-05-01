import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { XiriColor } from '../types/color.type';
import { XiriEchartsHostComponent } from '../echarts/echarts-host.component';
import { resolveColor } from '../echarts/color';
import { escapeHtml } from '../echarts/tooltip';

export interface XiriPieChartSlice {
	name: string;
	value: number;
	color?: XiriColor;
}

export interface XiriPieChartSettings {
	title?: string;
	slices: XiriPieChartSlice[];
	donut?: boolean;     // ring instead of full pie
	compact?: boolean;
}

@Component( {
	selector: 'xiri-piechart',
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
export class XiriPieChartComponent {

	settings = input.required<XiriPieChartSettings>();

	compact = computed<boolean>( () => !!this.settings().compact );

	option = computed( () => {
		const s = this.settings();
		const slices = s.slices ?? [];
		const radius: [ string, string ] = s.donut ? [ '55%', '78%' ] : [ '0', '78%' ];

		return {
			tooltip: {
				trigger: 'item',
				formatter: ( p: any ) => {
					const name = escapeHtml( String( p.name ?? '' ) );
					return `<b>${ name }</b><br/>${ p.marker }<b>${ p.value }</b> (${ p.percent }%)`;
				}
			},
			legend: { bottom: 0, type: 'scroll' },
			series: [ {
				type: 'pie',
				radius,
				center: [ '50%', '45%' ],
				avoidLabelOverlap: true,
				label: {
					show: !s.donut && !this.compact(),
					formatter: '{b}\n{d}%',
				},
				labelLine: { show: !s.donut && !this.compact() },
				data: slices.map( ( slice, i ) => ( {
					name: slice.name,
					value: slice.value,
					itemStyle: { color: resolveColor( slice.color, FALLBACK_COLORS[ i % FALLBACK_COLORS.length ] ) }
				} ) )
			} ]
		};
	} );
}

const FALLBACK_COLORS = [ '#8b5cf6', '#10b981', '#1e88e5', '#fb8c00', '#e53935', '#fbc02d', '#43a047', '#616161' ];
