import { XiriCols } from '../layout/cols.directive';

/**
 * Vertrag über alle "type"-Werte, die xiri-dyncomponent rendert. Einzige Quelle für die Union
 * XiriDynDataType und den COMPONENT_CATALOG; xiri-go führt dieselbe Liste als core.ComponentTypes().
 */
export const XIRI_COMPONENT_TYPES = [
	'card', 'buttonline', 'table', 'cardlink', 'links', 'form',
	'query', 'stepper', 'header', 'list', 'spacer', 'container', 'infopoint',
	'multiprogress', 'progress', 'imagetext', 'tabs', 'expansion', 'infotext', 'html', 'stat',
	'empty-state', 'timeline', 'page-header', 'section', 'divider', 'stat-grid', 'multi-stat',
	'toolbar', 'description-list', 'barchart', 'linechart', 'piechart', 'gaugechart',
	'bulletchart', 'heatmap', 'calendar', 'tree', 'sankey', 'gantt', 'radarchart', 'scatterchart',
	'status', 'callout', 'chat', 'markdown',
] as const;

export type XiriDynDataType = typeof XIRI_COMPONENT_TYPES[number];

export interface XiriDynData {
	id?: number
	type: XiriDynDataType | ( string & {} )
	data?: unknown
	display?: string
	newRow?: boolean
	mode?: string
	cols?: XiriCols
}
