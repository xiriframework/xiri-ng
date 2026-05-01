import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { XiriEchartsHostComponent } from '../echarts/echarts-host.component';
import { escapeHtml } from '../echarts/tooltip';

export interface XiriCalendarCell {
	date: string;     // 'YYYY-MM-DD'
	value: number;
}

export interface XiriCalendarSettings {
	title?: string;
	range: string | [ string, string ];   // year 'YYYY' | ['YYYY-MM-DD', 'YYYY-MM-DD']
	cells: XiriCalendarCell[];
	min?: number;
	max?: number;
	colorRange?: [ string, string ];      // CSS colors for low/high; default light green → dark green (GitHub-like)
	cellSize?: number;                    // cell size in px (default 16, compact 12)
	compact?: boolean;
}

@Component( {
	selector: 'xiri-calendar',
	template: `
		<xiri-echarts-host
			[option]="option()"
			[compact]="compact()"
			[title]="settings().title"
			[chartHeight]="height()">
		</xiri-echarts-host>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ XiriEchartsHostComponent ]
} )
export class XiriCalendarComponent {

	settings = input.required<XiriCalendarSettings>();

	compact = computed<boolean>( () => !!this.settings().compact );

	private cellSize = computed<number>( () => this.settings().cellSize ?? ( this.compact() ? 12 : 16 ) );

	height = computed<string>( () => {
		// 7 weekday rows + label space
		const px = this.cellSize() * 7 + 60;
		return px + 'px';
	} );

	option = computed( () => {
		const s = this.settings();
		const cells = s.cells ?? [];
		const values = cells.map( c => c.value );
		const min = s.min ?? Math.min( 0, ...values );
		const max = s.max ?? Math.max( 0, ...values );
		const [ lowColor, highColor ] = s.colorRange ?? [ '#e6f4ea', '#2e7d32' ];
		const sz = this.cellSize();

		return {
			tooltip: {
				formatter: ( p: any ) => {
					const date = String( p.value[ 0 ] );
					const v = p.value[ 1 ];
					return `<b>${ escapeHtml( date ) }</b><br/>${ p.marker }<b>${ v }</b>`;
				}
			},
			visualMap: {
				min,
				max,
				orient: 'horizontal',
				left: 'center',
				bottom: 0,
				show: !this.compact(),
				inRange: { color: [ lowColor, highColor ] }
			},
			calendar: {
				range: s.range,
				cellSize: [ sz, sz ],
				splitLine: { show: false },
				itemStyle: { borderColor: '#fff', borderWidth: 2 },
				yearLabel: { show: false },
				dayLabel: { fontSize: 10 },
				monthLabel: { fontSize: 11 },
				top: 24,
				left: 32,
				right: 16,
			},
			series: [ {
				type: 'heatmap',
				coordinateSystem: 'calendar',
				data: cells.map( c => [ c.date, c.value ] )
			} ]
		};
	} );
}
