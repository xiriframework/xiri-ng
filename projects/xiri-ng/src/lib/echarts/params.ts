/**
 * Minimal structural types for the echarts callback params that the xiri chart
 * components read inside tooltip / label / renderItem formatters.
 *
 * echarts is an optional peer dependency and is loaded lazily, so we avoid a
 * static import of its (large) option/param types here and describe only the
 * fields the chart components actually access. The shapes intentionally mirror
 * echarts' `CallbackDataParams` / `CustomSeriesRenderItem*` surfaces.
 */

/** Params object passed to a single-series tooltip / label formatter callback. */
export interface XiriEchartsCallbackParams {
	componentType?: string;
	seriesType?: string;
	seriesIndex?: number;
	seriesName?: string;
	dataIndex: number;
	name?: string;
	axisValueLabel?: string;
	marker?: string;
	percent?: number;
	value?: unknown;
	data?: { value?: unknown };
}

/** Params for an 'axis'-trigger tooltip: either a single params object or an array of them. */
export type XiriEchartsTooltipParams = XiriEchartsCallbackParams | XiriEchartsCallbackParams[];

/** The `api` object handed to a custom-series `renderItem` callback. */
export interface XiriEchartsRenderItemApi {
	value( dimension: number ): number;
	coord( point: number[] ): number[];
	size( dataSize: number[] ): number[];
}
