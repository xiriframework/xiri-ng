import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { createLibrary, defineComponent, ElementNode, injectOpenUiContext, OpenUiRenderNodeComponent } from '@openuidev/angular-lang';
import { z } from 'zod/v4';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriStatComponent, XiriStatSettings } from 'projects/xiri-ng/src/lib/stat/stat.component';
import { XiriBarChartComponent, XiriBarChartSettings } from 'projects/xiri-ng/src/lib/barchart/barchart.component';
import { XiriRadarChartComponent, XiriRadarChartSettings } from 'projects/xiri-ng/src/lib/radarchart/radarchart.component';
import { XiriScatterChartComponent, XiriScatterChartSettings } from 'projects/xiri-ng/src/lib/scatterchart/scatterchart.component';
import { XiriMarkdownComponent } from 'projects/xiri-ng/src/lib/markdown/markdown.component';

// OpenUI Lang → xiri: pro Komponente ein zod-Schema (Key-Reihenfolge = positionelle Reihenfolge) und ein
// Wrapper, der die props in xiri-Settings übersetzt. angular-lang setzt props, renderNode und statementId
// per setInput, darum deklariert jeder Wrapper alle drei.
// Gespeicherte Programme kennen keine Prop-Namen: Props nur hinten anfügen, nie umsortieren oder entfernen.

const colors = [ 'primary', 'secondary', 'tertiary', 'accent', 'warn', 'error', 'success' ] as const;

const statProps = z.object( {
	label: z.string().describe( 'Beschriftung unter dem Wert' ),
	value: z.union( [ z.string(), z.number() ] ).describe( 'Kennzahl' ),
	suffix: z.string().optional().describe( 'Einheit hinter dem Wert, z. B. " €"' ),
	icon: z.string().optional().describe( 'Material-Symbol-Name mit Unterstrich, z. B. "trending_up"' ),
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
	horizontal: z.boolean().optional().describe( 'liegende Balken, für lange Beschriftungen und Ranglisten' ),
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
		// Nur vollständige Paare: beim Streamen oder bei ungleich langen Listen fehlt sonst der Wert.
		return { title: p?.title, horizontal: p?.horizontal, bars: ( p?.labels ?? [] ).slice( 0, values.length ).map( ( label, i ) => ( { label, value: values[ i ] } ) ) };
	} );
}

const Stat = defineComponent( {
	name: 'Stat', description: 'Eine Kennzahl (KPI) mit Beschriftung', props: statProps, component: OpenUiStatComponent,
} );
const BarChart = defineComponent( {
	name: 'BarChart', description: 'Balkendiagramm', props: barChartProps, component: OpenUiBarChartComponent,
} );

// Series und ScatterSeries sind Datenträger: sie zeichnen nichts, das Diagramm liest ihre props.
@Component( { selector: 'app-openui-data', template: '', changeDetection: ChangeDetectionStrategy.OnPush } )
class OpenUiDataComponent {
	props = input<unknown>( null );
	renderNode = input<unknown>( null );
	statementId = input<string>();
}

const childProps = <T>( children: unknown[] | undefined ): T[] =>
	( children ?? [] ).map( c => ( c as ElementNode | null )?.props as T | undefined ).filter( p => !!p ) as T[];

const seriesProps = z.object( {
	name: z.string(),
	values: z.array( z.number() ).describe( 'ein Wert je Achse, gleiche Reihenfolge' ),
} );
const Series = defineComponent( {
	name: 'Series', description: 'Datenreihe für RadarChart', props: seriesProps, component: OpenUiDataComponent,
} );

const radarChartProps = z.object( {
	indicators: z.array( z.string() ).describe( 'Achsen (Kriterien)' ),
	series: z.array( Series.ref ),
	title: z.string().optional(),
	max: z.number().optional().describe( 'gemeinsames Maximum aller Achsen' ),
} );

@Component( {
	selector: 'app-openui-radarchart',
	template: '<xiri-radarchart [settings]="settings()" />',
	imports: [ XiriRadarChartComponent ],
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
class OpenUiRadarChartComponent {
	props = input<{ indicators?: string[], series?: unknown[], title?: string, max?: number } | null>( null );
	renderNode = input<( ( value: unknown ) => unknown ) | null>( null );
	statementId = input<string>();

	settings = computed<XiriRadarChartSettings>( () => {
		const p = this.props();
		return {
			title: p?.title, area: true,
			indicators: ( p?.indicators ?? [] ).map( name => ( { name, max: p?.max } ) ),
			series: childProps<z.infer<typeof seriesProps>>( p?.series ).map( s => ( { name: s.name, values: s.values ?? [] } ) ),
		};
	} );
}

const RadarChart = defineComponent( {
	name: 'RadarChart', description: 'Netzdiagramm: Serien über mehrere Kriterien vergleichen', props: radarChartProps,
	component: OpenUiRadarChartComponent,
} );

const scatterSeriesProps = z.object( {
	name: z.string(),
	points: z.array( z.array( z.number() ) ).describe( 'Punkte als [x, y]' ),
} );
const ScatterSeries = defineComponent( {
	name: 'ScatterSeries', description: 'Punktgruppe für ScatterChart, Punkte als [x, y]', props: scatterSeriesProps,
	component: OpenUiDataComponent,
} );

const scatterChartProps = z.object( {
	series: z.array( ScatterSeries.ref ),
	title: z.string().optional(),
	xLabel: z.string().optional(),
	yLabel: z.string().optional(),
} );

@Component( {
	selector: 'app-openui-scatterchart',
	template: '<xiri-scatterchart [settings]="settings()" />',
	imports: [ XiriScatterChartComponent ],
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
class OpenUiScatterChartComponent {
	props = input<{ series?: unknown[], title?: string, xLabel?: string, yLabel?: string } | null>( null );
	renderNode = input<( ( value: unknown ) => unknown ) | null>( null );
	statementId = input<string>();

	settings = computed<XiriScatterChartSettings>( () => {
		const p = this.props();
		return {
			title: p?.title, xLabel: p?.xLabel, yLabel: p?.yLabel,
			// Nur vollständige Punkte: beim Streamen kann das letzte Paar noch halb sein.
			series: childProps<z.infer<typeof scatterSeriesProps>>( p?.series ).map( s => ( {
				name: s.name, points: ( s.points ?? [] ).filter( pt => pt.length >= 2 ).map( ( [ x, y ] ) => ( { x, y } ) ),
			} ) ),
		};
	} );
}

const ScatterChart = defineComponent( {
	name: 'ScatterChart', description: 'Streudiagramm: Zusammenhang zweier Größen', props: scatterChartProps,
	component: OpenUiScatterChartComponent,
} );

const markdownProps = z.object( {
	text: z.string(),
} );

@Component( {
	selector: 'app-openui-markdown',
	template: '<xiri-markdown [settings]="{ text: props()?.text ?? \'\' }" />',
	imports: [ XiriMarkdownComponent ],
	changeDetection: ChangeDetectionStrategy.OnPush,
} )
class OpenUiMarkdownComponent {
	props = input<z.infer<typeof markdownProps> | null>( null );
	renderNode = input<( ( value: unknown ) => unknown ) | null>( null );
	statementId = input<string>();
}

const Markdown = defineComponent( {
	name: 'Markdown', description: 'Formatierter Text (Markdown: Überschriften, Listen, Tabellen)', props: markdownProps,
	component: OpenUiMarkdownComponent,
} );

const cardProps = z.object( {
	title: z.string(),
	children: z.array( z.union( [ Stat.ref, BarChart.ref, RadarChart.ref, ScatterChart.ref, Markdown.ref ] ) ).describe( 'Inhalt; Stats stehen nebeneinander' ),
	subtitle: z.string().optional(),
	icon: z.string().optional().describe( 'Material-Symbol-Name mit Unterstrich, z. B. "support_agent"' ),
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

export const xiriOpenUiLibrary = createLibrary( { components: [ Card, Stat, BarChart, RadarChart, Series, ScatterChart, ScatterSeries, Markdown ], root: 'Card' } );

// Feldbeschreibungen (.describe) erscheinen nicht im Prompt; Regeln für Werte gehören hierher.
export const xiriOpenUiPrompt = xiriOpenUiLibrary.prompt( {
	additionalRules: [
		'icon values are Material Symbols names in snake_case, e.g. "trending_up", "shopping_cart", "payments" (never kebab-case).',
		'Write all visible texts in the language of the user\'s message.',
		'Markdown text is one string: write line breaks as \\n.',
	],
} );
