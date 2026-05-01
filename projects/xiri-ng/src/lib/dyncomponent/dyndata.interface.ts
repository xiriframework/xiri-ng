
export type XiriDynDataType = 'card' | 'buttonline' | 'table' | 'cardlink' | 'links' | 'form' |
	'query' | 'stepper' | 'header' | 'list' | 'spacer' | 'container' | 'infopoint' |
	'multiprogress' | 'imagetext' | 'tabs' | 'expansion' | 'infotext' | 'html' | 'stat' |
	'empty-state' | 'timeline' | 'page-header' | 'section' | 'divider' | 'stat-grid' |
	'toolbar' | 'description-list' | 'barchart' | 'linechart' | 'piechart' | 'gaugechart' |
	'heatmap' | 'calendar' | 'tree' | 'sankey' | 'gantt';

export interface XiriDynData {
	id?: number
	type: XiriDynDataType | ( string & {} )
	data?: any
	display?: string
	newRow?: boolean
	mode?: string
}
