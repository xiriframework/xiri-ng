import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { createLibrary, defineComponent, ElementNode, injectOpenUiContext, OpenUiRenderNodeComponent } from '@openuidev/angular-lang';
import { z } from 'zod/v4';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriStatComponent, XiriStatSettings } from 'projects/xiri-ng/src/lib/stat/stat.component';
import { XiriBarChartComponent, XiriBarChartSettings } from 'projects/xiri-ng/src/lib/barchart/barchart.component';

// OpenUI Lang → xiri: pro Komponente ein zod-Schema (Key-Reihenfolge = positionelle Reihenfolge) und ein
// Wrapper, der die props in xiri-Settings übersetzt. angular-lang setzt props, renderNode und statementId
// per setInput, darum deklariert jeder Wrapper alle drei.
// Gespeicherte Programme kennen keine Prop-Namen: Props nur hinten anfügen, nie umsortieren oder entfernen.

const colors = [ 'primary', 'secondary', 'tertiary', 'accent', 'warn', 'error', 'success' ] as const;

const statProps = z.object( {
	label: z.string().describe( 'Beschriftung unter dem Wert' ),
	value: z.union( [ z.string(), z.number() ] ).describe( 'Kennzahl' ),
	suffix: z.string().optional().describe( 'Einheit hinter dem Wert, z. B. " €"' ),
	icon: z.string().optional().describe( 'Material-Symbol-Name, z. B. "payments"' ),
	color: z.enum( colors ).optional().describe( 'Farbe des Werts' ),
} );

@Component( {
	selector: 'app-openui-stat',
	template: '<xiri-stat [settings]="settings()" />',
	imports: [ XiriStatComponent ],
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
class OpenUiStatComponent {
	props = input<z.infer<typeof statProps> | null>( null );
	renderNode = input<( ( value: unknown ) => unknown ) | null>( null );
	statementId = input<string>();

	settings = computed<XiriStatSettings>( () => {
		const p = this.props();
		return { label: p?.label ?? '', value: p?.value ?? '', suffix: p?.suffix, icon: p?.icon, color: p?.color };
	} );
}

const barChartProps = z.object( {
	labels: z.array( z.string() ).describe( 'Beschriftung je Balken' ),
	values: z.array( z.number() ).describe( 'Wert je Balken, gleiche Reihenfolge wie labels' ),
	title: z.string().optional(),
} );

@Component( {
	selector: 'app-openui-barchart',
	template: '<xiri-barchart [settings]="settings()" />',
	imports: [ XiriBarChartComponent ],
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
class OpenUiBarChartComponent {
	props = input<z.infer<typeof barChartProps> | null>( null );
	renderNode = input<( ( value: unknown ) => unknown ) | null>( null );
	statementId = input<string>();

	settings = computed<XiriBarChartSettings>( () => {
		const p = this.props();
		const values = p?.values ?? [];
		return { title: p?.title, bars: ( p?.labels ?? [] ).map( ( label, i ) => ( { label, value: values[ i ] } ) ) };
	} );
}

const Stat = defineComponent( {
	name: 'Stat', description: 'Eine Kennzahl (KPI) mit Beschriftung', props: statProps, component: OpenUiStatComponent,
} );
const BarChart = defineComponent( {
	name: 'BarChart', description: 'Balkendiagramm', props: barChartProps, component: OpenUiBarChartComponent,
} );

const cardProps = z.object( {
	title: z.string(),
	children: z.array( z.union( [ Stat.ref, BarChart.ref ] ) ).describe( 'Inhalt; Stats stehen nebeneinander' ),
	subtitle: z.string().optional(),
	icon: z.string().optional().describe( 'Material-Symbol-Name' ),
} );

// Grid-Regeln erwarten direkte Kinder von .xrow: openui-render-node (display: contents) reicht dafür nicht,
// darum bekommt jedes Kind seine eigene Spalte.
@Component( {
	selector: 'app-openui-card',
	template: `
		<xiri-section [settings]="settings()">
			<div class="xrow">
				@for ( child of props()?.children ?? []; track $index ) {
					<div [class]="colClass( child )">
						<openui-render-node [value]="renderNode()?.( child ) ?? child" [library]="ctx.library" [context]="ctx" />
					</div>
				}
			</div>
		</xiri-section>`,
	imports: [ XiriSectionComponent, OpenUiRenderNodeComponent ],
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
class OpenUiCardComponent {
	props = input<{ title: string, children: unknown[], subtitle?: string, icon?: string } | null>( null );
	renderNode = input<( ( value: unknown ) => unknown ) | null>( null );
	statementId = input<string>();

	protected readonly ctx = injectOpenUiContext();

	settings = computed<XiriSectionSettings>( () => {
		const p = this.props();
		return { title: p?.title, subtitle: p?.subtitle, icon: p?.icon, iconColor: 'primary' };
	} );

	colClass( child: unknown ): string {
		return ( child as ElementNode | null )?.typeName === 'Stat' ? 'xcol-sm-6 xcol-lg-3' : 'xcol';
	}
}

const Card = defineComponent( {
	name: 'Card', description: 'Abschnitt mit Titel; Wurzel jeder Antwort', props: cardProps, component: OpenUiCardComponent,
} );

export const xiriOpenUiLibrary = createLibrary( { components: [ Card, Stat, BarChart ], root: 'Card' } );
