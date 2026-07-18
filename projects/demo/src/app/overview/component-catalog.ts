// Component-Katalog für den Demo-Explorer (UX-009-Kern).
//
// Abgeleitet aus den tatsächlichen Fakten im Code:
//   - `type`         : die @case-Typen aus dyncomponent.component.html.
//   - `dyncomponent` : true, weil der Typ einen Renderer-@case besitzt (alle hier).
//   - `goBuilder`    : true, wenn der Go-Code diesen "type" ausgibt
//                      (xiri-go/component/**; via `grep '"type": "X"'`).
//                      Nur `cardlink` hat aktuell keinen Go-Builder.
//   - `angular`      : true, wenn eine eigene, aus public-api.ts exportierte
//                      Lib-Component existiert. Die Inline-Primitive
//                      (spacer/container/infotext/html) werden ohne eigene
//                      Component direkt im Renderer gezeichnet → false.
//   - `route`        : die Demo-Route (app-routing.module.ts), die den Typ zeigt.
//
// Die Paritäts-Invariante (jeder @case-Typ ist im Katalog) wird von
// projects/xiri-ng/src/lib/dyncomponent/catalog-parity.spec.ts abgesichert.

export interface CatalogEntry {
	type: string;
	name: string;
	category: string;
	angular: boolean;
	dyncomponent: boolean;
	goBuilder: boolean;
	route: string;
	keywords: string[];
}

export const COMPONENT_CATALOG: CatalogEntry[] = [
	// Data Entry
	{ type: 'form', name: 'Form', category: 'Data Entry', angular: true, dyncomponent: true, goBuilder: true, route: '/Forms', keywords: [ 'form', 'field', 'input', 'formular', 'eingabe' ] },

	// Data Display
	{ type: 'table', name: 'Table', category: 'Data Display', angular: true, dyncomponent: true, goBuilder: true, route: '/Tables', keywords: [ 'table', 'grid', 'tabelle', 'daten', 'rows' ] },
	{ type: 'card', name: 'Card', category: 'Data Display', angular: true, dyncomponent: true, goBuilder: true, route: '/Cards', keywords: [ 'card', 'karte', 'panel' ] },
	{ type: 'cardlink', name: 'Card Link', category: 'Data Display', angular: true, dyncomponent: true, goBuilder: false, route: '/Cards', keywords: [ 'cardlink', 'link', 'navigation', 'tile', 'kachel' ] },
	{ type: 'links', name: 'Links', category: 'Data Display', angular: true, dyncomponent: true, goBuilder: true, route: '/Display', keywords: [ 'links', 'anchor', 'verweise' ] },
	{ type: 'list', name: 'List', category: 'Data Display', angular: true, dyncomponent: true, goBuilder: true, route: '/Display', keywords: [ 'list', 'liste', 'items' ] },
	{ type: 'infopoint', name: 'Infopoint', category: 'Data Display', angular: true, dyncomponent: true, goBuilder: true, route: '/Display', keywords: [ 'infopoint', 'info', 'detail', 'label' ] },
	{ type: 'imagetext', name: 'Image Text', category: 'Data Display', angular: true, dyncomponent: true, goBuilder: true, route: '/Display', keywords: [ 'imagetext', 'image', 'bild', 'media' ] },
	{ type: 'infotext', name: 'Info Text', category: 'Data Display', angular: false, dyncomponent: true, goBuilder: true, route: '/Display', keywords: [ 'infotext', 'text', 'hinweis' ] },
	{ type: 'html', name: 'HTML', category: 'Data Display', angular: false, dyncomponent: true, goBuilder: true, route: '/Display', keywords: [ 'html', 'raw', 'markup' ] },
	{ type: 'stat', name: 'Stat', category: 'Data Display', angular: true, dyncomponent: true, goBuilder: true, route: '/Stats', keywords: [ 'stat', 'kpi', 'metric', 'kennzahl' ] },
	{ type: 'stat-grid', name: 'Stat Grid', category: 'Data Display', angular: true, dyncomponent: true, goBuilder: true, route: '/Stats', keywords: [ 'stat-grid', 'stat', 'kpi', 'grid', 'dashboard' ] },
	{ type: 'multi-stat', name: 'Multi Stat', category: 'Data Display', angular: true, dyncomponent: true, goBuilder: true, route: '/MultiStat', keywords: [ 'multi-stat', 'stat', 'kpi', 'metric', 'kennzahl' ] },
	{ type: 'description-list', name: 'Description List', category: 'Data Display', angular: true, dyncomponent: true, goBuilder: true, route: '/Layout', keywords: [ 'description-list', 'definition', 'key value', 'metadaten' ] },
	{ type: 'timeline', name: 'Timeline', category: 'Data Display', angular: true, dyncomponent: true, goBuilder: true, route: '/Timeline', keywords: [ 'timeline', 'verlauf', 'history', 'events' ] },

	// Layout & Navigation
	{ type: 'header', name: 'Header', category: 'Layout & Navigation', angular: true, dyncomponent: true, goBuilder: true, route: '/Navigation', keywords: [ 'header', 'kopf', 'title' ] },
	{ type: 'buttonline', name: 'Button Line', category: 'Layout & Navigation', angular: true, dyncomponent: true, goBuilder: true, route: '/Navigation', keywords: [ 'buttonline', 'button', 'actions', 'aktionen' ] },
	{ type: 'tabs', name: 'Tabs', category: 'Layout & Navigation', angular: true, dyncomponent: true, goBuilder: true, route: '/Navigation', keywords: [ 'tabs', 'reiter', 'tab' ] },
	{ type: 'expansion', name: 'Expansion', category: 'Layout & Navigation', angular: true, dyncomponent: true, goBuilder: true, route: '/Navigation', keywords: [ 'expansion', 'accordion', 'panel', 'ausklappen' ] },
	{ type: 'toolbar', name: 'Toolbar', category: 'Layout & Navigation', angular: true, dyncomponent: true, goBuilder: true, route: '/Layout', keywords: [ 'toolbar', 'leiste', 'actions' ] },
	{ type: 'section', name: 'Section', category: 'Layout & Navigation', angular: true, dyncomponent: true, goBuilder: true, route: '/Layout', keywords: [ 'section', 'abschnitt', 'gruppe' ] },
	{ type: 'page-header', name: 'Page Header', category: 'Layout & Navigation', angular: true, dyncomponent: true, goBuilder: true, route: '/Layout', keywords: [ 'page-header', 'header', 'seitenkopf', 'title' ] },
	{ type: 'divider', name: 'Divider', category: 'Layout & Navigation', angular: true, dyncomponent: true, goBuilder: true, route: '/Layout', keywords: [ 'divider', 'trenner', 'separator', 'line' ] },
	{ type: 'spacer', name: 'Spacer', category: 'Layout & Navigation', angular: false, dyncomponent: true, goBuilder: true, route: '/Layout', keywords: [ 'spacer', 'abstand', 'gap', 'space' ] },
	{ type: 'container', name: 'Container', category: 'Layout & Navigation', angular: false, dyncomponent: true, goBuilder: true, route: '/Layout', keywords: [ 'container', 'wrapper', 'group', 'nested' ] },

	// Feedback & Status
	{ type: 'status', name: 'Status', category: 'Feedback & Status', angular: true, dyncomponent: true, goBuilder: true, route: '/Status', keywords: [ 'status', 'badge', 'zustand', 'tone' ] },
	{ type: 'callout', name: 'Callout', category: 'Feedback & Status', angular: true, dyncomponent: true, goBuilder: true, route: '/Callout', keywords: [ 'callout', 'alert', 'banner', 'hinweis', 'inline' ] },
	{ type: 'empty-state', name: 'Empty State', category: 'Feedback & Status', angular: true, dyncomponent: true, goBuilder: true, route: '/EmptyState', keywords: [ 'empty-state', 'empty', 'leer', 'placeholder' ] },
	{ type: 'progress', name: 'Progress', category: 'Feedback & Status', angular: true, dyncomponent: true, goBuilder: true, route: '/Feedback', keywords: [ 'progress', 'fortschritt', 'bar', 'loading' ] },
	{ type: 'multiprogress', name: 'Multi Progress', category: 'Feedback & Status', angular: true, dyncomponent: true, goBuilder: true, route: '/Feedback', keywords: [ 'multiprogress', 'progress', 'fortschritt', 'stacked' ] },

	// Workflows
	{ type: 'stepper', name: 'Stepper', category: 'Workflows', angular: true, dyncomponent: true, goBuilder: true, route: '/Workflow', keywords: [ 'stepper', 'wizard', 'steps', 'schritte' ] },
	{ type: 'query', name: 'Query', category: 'Workflows', angular: true, dyncomponent: true, goBuilder: true, route: '/Workflow', keywords: [ 'query', 'filter', 'suche', 'search' ] },

	// Charts & Visualization
	{ type: 'barchart', name: 'Bar Chart', category: 'Charts & Visualization', angular: true, dyncomponent: true, goBuilder: true, route: '/BarCharts', keywords: [ 'barchart', 'bar', 'chart', 'balken', 'diagramm' ] },
	{ type: 'linechart', name: 'Line Chart', category: 'Charts & Visualization', angular: true, dyncomponent: true, goBuilder: true, route: '/BarCharts', keywords: [ 'linechart', 'line', 'chart', 'linie', 'diagramm' ] },
	{ type: 'piechart', name: 'Pie Chart', category: 'Charts & Visualization', angular: true, dyncomponent: true, goBuilder: true, route: '/BarCharts', keywords: [ 'piechart', 'pie', 'donut', 'chart', 'torte' ] },
	{ type: 'gaugechart', name: 'Gauge Chart', category: 'Charts & Visualization', angular: true, dyncomponent: true, goBuilder: true, route: '/BarCharts', keywords: [ 'gaugechart', 'gauge', 'tacho', 'chart' ] },
	{ type: 'bulletchart', name: 'Bullet Chart', category: 'Charts & Visualization', angular: true, dyncomponent: true, goBuilder: true, route: '/BarCharts', keywords: [ 'bulletchart', 'bullet', 'chart', 'ziel', 'target' ] },
	{ type: 'heatmap', name: 'Heatmap', category: 'Charts & Visualization', angular: true, dyncomponent: true, goBuilder: true, route: '/BarCharts', keywords: [ 'heatmap', 'heat', 'matrix', 'chart' ] },
	{ type: 'calendar', name: 'Calendar', category: 'Charts & Visualization', angular: true, dyncomponent: true, goBuilder: true, route: '/BarCharts', keywords: [ 'calendar', 'kalender', 'heatmap', 'chart' ] },
	{ type: 'tree', name: 'Tree', category: 'Charts & Visualization', angular: true, dyncomponent: true, goBuilder: true, route: '/BarCharts', keywords: [ 'tree', 'baum', 'hierarchy', 'chart' ] },
	{ type: 'sankey', name: 'Sankey', category: 'Charts & Visualization', angular: true, dyncomponent: true, goBuilder: true, route: '/BarCharts', keywords: [ 'sankey', 'flow', 'fluss', 'chart' ] },
	{ type: 'gantt', name: 'Gantt', category: 'Charts & Visualization', angular: true, dyncomponent: true, goBuilder: true, route: '/BarCharts', keywords: [ 'gantt', 'timeline', 'projekt', 'chart' ] },
];
