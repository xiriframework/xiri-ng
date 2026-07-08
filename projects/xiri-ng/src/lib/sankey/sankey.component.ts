import { Component, computed, input } from '@angular/core';
import { XiriColor } from '../types/color.type';
import { XiriEchartsHostComponent } from '../echarts/echarts-host.component';
import { resolveColor, FALLBACK_COLORS } from '../echarts/color';

export interface XiriSankeyNode {
	name: string;
	color?: XiriColor;
}

export interface XiriSankeyLink {
	source: string;
	target: string;
	value: number;
}

export interface XiriSankeySettings {
	title?: string;
	nodes: XiriSankeyNode[];
	links: XiriSankeyLink[];
	orient?: 'horizontal' | 'vertical';   // default 'horizontal'
	compact?: boolean;
}

@Component( {
	selector: 'xiri-sankey',
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
export class XiriSankeyComponent {

	settings = input.required<XiriSankeySettings>();

	compact = computed<boolean>( () => !!this.settings().compact );

	height = computed<string>( () => {
		const n = this.settings().nodes.length || 1;
		const px = Math.max( 280, n * 20 + 80 );
		return px + 'px';
	} );

	option = computed( () => {
		const s = this.settings();
		return {
			tooltip: { trigger: 'item', triggerOn: 'mousemove' },
			series: [ {
				type: 'sankey',
				orient: s.orient ?? 'horizontal',
				top: 16,
				bottom: 16,
				left: 16,
				right: 80,
				emphasis: { focus: 'adjacency' },
				lineStyle: { color: 'gradient', curveness: 0.5 },
				label: { fontSize: 12 },
				data: s.nodes.map( ( n, i ) => ( {
					name: n.name,
					itemStyle: { color: resolveColor( n.color, FALLBACK_COLORS[ i % FALLBACK_COLORS.length ] ) }
				} ) ),
				links: s.links
			} ]
		};
	} );
}
