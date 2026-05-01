import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { XiriColor } from '../types/color.type';
import { XiriEchartsHostComponent } from '../echarts/echarts-host.component';
import { resolveColor } from '../echarts/color';
import { escapeHtml } from '../echarts/tooltip';

export interface XiriGanttTask {
	row: number;          // index into rows[]
	name: string;
	start: number;        // unix milliseconds
	end: number;          // unix milliseconds
	color?: XiriColor;
}

export interface XiriGanttSettings {
	title?: string;
	rows: string[];                    // y-axis categories (top to bottom in render order)
	tasks: XiriGanttTask[];
	rangeStart?: number;               // optional x-axis start (ms)
	rangeEnd?: number;                 // optional x-axis end (ms)
	compact?: boolean;
}

@Component( {
	selector: 'xiri-gantt',
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
export class XiriGanttComponent {

	settings = input.required<XiriGanttSettings>();

	compact = computed<boolean>( () => !!this.settings().compact );

	height = computed<string>( () => {
		const rows = this.settings().rows.length || 1;
		const px = Math.max( 220, rows * 36 + 80 );
		return px + 'px';
	} );

	option = computed( () => {
		const s = this.settings();
		const rows = s.rows ?? [];

		// Each datum: [rowIndex, start, end, name, color]
		const data = ( s.tasks ?? [] ).map( t => [
			t.row,
			t.start,
			t.end,
			t.name,
			resolveColor( t.color, '#8b5cf6' )
		] );

		const renderItem = ( _params: any, api: any ) => {
			const rowIdx = api.value( 0 );
			const start  = api.coord( [ api.value( 1 ), rowIdx ] );
			const end    = api.coord( [ api.value( 2 ), rowIdx ] );
			const cellH  = api.size( [ 0, 1 ] )[ 1 ];
			const height = Math.max( 4, cellH * 0.6 );
			return {
				type: 'rect',
				transition: [ 'shape' ],
				shape: {
					x: start[ 0 ],
					y: start[ 1 ] - height / 2,
					width: Math.max( 1, end[ 0 ] - start[ 0 ] ),
					height,
					r: 4
				},
				style: { fill: api.value( 4 ) }
			};
		};

		return {
			tooltip: {
				formatter: ( p: any ) => {
					const v = p.value;
					const fmt = ( ms: number ) => new Date( ms ).toLocaleString();
					const row = rows[ v[ 0 ] ] ?? '';
					return `<b>${ escapeHtml( v[ 3 ] ) }</b><br/>${ escapeHtml( row ) }<br/>${ escapeHtml( fmt( v[ 1 ] ) ) } → ${ escapeHtml( fmt( v[ 2 ] ) ) }`;
				}
			},
			grid: { left: 8, right: 16, top: 16, bottom: 24, containLabel: true },
			xAxis: {
				type: 'time',
				min: s.rangeStart,
				max: s.rangeEnd,
				splitLine: { lineStyle: { color: '#eee' } }
			},
			yAxis: {
				type: 'category',
				data: rows,
				inverse: true,
				splitLine: { show: false },
				axisLine: { show: false },
				axisTick: { show: false }
			},
			series: [ {
				type: 'custom',
				encode: { x: [ 1, 2 ], y: 0 },
				clip: true,
				renderItem,
				data
			} ]
		};
	} );
}
