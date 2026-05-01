import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { XiriEchartsHostComponent } from '../echarts/echarts-host.component';

export interface XiriTreeNode {
	name: string;
	value?: number;
	children?: XiriTreeNode[];
	collapsed?: boolean;
}

export interface XiriTreeSettings {
	title?: string;
	root: XiriTreeNode;
	orient?: 'LR' | 'RL' | 'TB' | 'BT';   // default 'LR'
	layout?: 'orthogonal' | 'radial';      // default 'orthogonal'
	compact?: boolean;
}

@Component( {
	selector: 'xiri-tree',
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
export class XiriTreeComponent {

	settings = input.required<XiriTreeSettings>();

	compact = computed<boolean>( () => !!this.settings().compact );

	height = computed<string>( () => {
		// Estimate based on leaf count
		const leaves = countLeaves( this.settings().root );
		const px = Math.max( 240, leaves * 24 + 80 );
		return px + 'px';
	} );

	option = computed( () => {
		const s = this.settings();
		const orient = s.orient ?? 'LR';
		const layout = s.layout ?? 'orthogonal';

		return {
			tooltip: {
				trigger: 'item',
				triggerOn: 'mousemove',
				formatter: ( p: any ) => {
					const v = p.data?.value;
					const head = `<b>${ escapeText( p.name ) }</b>`;
					return v != null ? `${ head }<br/>${ p.marker }<b>${ v }</b>` : head;
				}
			},
			series: [ {
				type: 'tree',
				data: [ s.root ],
				top: 16,
				bottom: 16,
				// Reserve enough space for leaf labels so they don't get truncated by echarts.
				left: layout === 'radial' ? '5%' : ( orient === 'LR' ? 96 : ( orient === 'RL' ? 16 : 16 ) ),
				right: layout === 'radial' ? '5%' : ( orient === 'RL' ? 96 : ( orient === 'LR' ? 96 : 16 ) ),
				layout,
				orient,
				symbol: 'emptyCircle',
				symbolSize: 7,
				initialTreeDepth: 3,
				label: {
					position: orient === 'TB' ? 'top' : 'left',
					align: orient === 'LR' ? 'right' : 'center',
					verticalAlign: 'middle',
					fontSize: 12,
					overflow: 'none'
				},
				leaves: {
					label: {
						position: orient === 'TB' ? 'bottom' : 'right',
						align: orient === 'LR' ? 'left' : 'center',
						overflow: 'none'
					}
				},
				expandAndCollapse: true,
				animationDuration: 250,
				animationDurationUpdate: 250
			} ]
		};
	} );
}

function countLeaves( n: XiriTreeNode ): number {
	if ( !n.children?.length ) return 1;
	return n.children.reduce( ( sum, c ) => sum + countLeaves( c ), 0 );
}

function escapeText( s: string ): string {
	return String( s ?? '' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}
