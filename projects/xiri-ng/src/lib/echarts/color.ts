import { signal } from '@angular/core';
import { XiriColor } from '../types/color.type';

/**
 * Maps semantic XiriColor names to CSS color values.
 *
 * Theme tokens reference the theme variables written by `xirimat.theming()`;
 * extended tokens are fixed brand colors that work in light and dark alike.
 * Anything referencing a variable is resolved by `resolveColor()` before it
 * reaches echarts — see there for why.
 */
export const COLOR_CSS_VAR: Record<string, string> = {
	primary:   'var(--primary)',
	secondary: 'var(--secondary)',
	tertiary:  'var(--tertiary)',
	accent:    'var(--tertiary)',
	warn:      '#f5a623',
	error:     'var(--error)',
	success:   '#2e7d32',
	emerald:   '#10b981',
	red:       '#e53935',
	yellow:    '#fbc02d',
	green:     '#43a047',
	blue:      '#1e88e5',
	purple:    '#8b5cf6',
	orange:    '#fb8c00',
	gray:      '#9e9e9e',
	lightgray: '#cfcfcf',
	darkgray:  '#616161',
	white:     '#ffffff',
	black:     '#000000',
	inherit:   'currentColor'
};

/**
 * Bumped whenever the active theme changes. `resolveColor()` reads it, so the
 * `computed()` that builds a chart option re-evaluates on a theme switch and
 * the chart is re-rendered with the new colors — without every chart component
 * having to know about the theme.
 */
const themeEpoch = signal( 0 );

/** Called by XiriThemeService after it applied a theme class. */
export function notifyThemeChanged(): void {
	themeEpoch.update( v => v + 1 );
}

/**
 * Reads a `var(--x)` / `var(--x, y)` expression off the document root.
 * Returns undefined when there is no document (SSR) or the variable is unset.
 */
function readCssVar( expression: string ): string | undefined {
	if ( typeof document === 'undefined' ) return undefined;

	const name = expression.slice( 4, -1 ).split( ',' )[ 0 ].trim();
	const value = getComputedStyle( document.documentElement ).getPropertyValue( name ).trim();
	return value || undefined;
}

/**
 * Resolves a XiriColor token to a concrete CSS color usable in echarts options.
 *
 * echarts draws on a canvas, where neither `var(--x)` nor `currentColor` is a
 * valid color — both have to be resolved to a literal first, or the series ends
 * up with no color at all. Unknown tokens fall back to the given fallback.
 */
export function resolveColor( color: XiriColor | string | undefined, fallback = '#8b5cf6' ): string {
	themeEpoch(); // track theme changes, see notifyThemeChanged()

	if ( !color ) return fallback;

	const mapped = COLOR_CSS_VAR[ color ];
	if ( mapped === undefined ) return fallback;

	if ( mapped.startsWith( 'var(' ) )
		return readCssVar( mapped ) ?? fallback;

	// "inherit" means the surrounding text color, which a canvas cannot inherit.
	if ( mapped === 'currentColor' ) {
		if ( typeof document === 'undefined' ) return fallback;
		return getComputedStyle( document.documentElement ).color || fallback;
	}

	return mapped;
}

/**
 * Default categorical palette used by charts (line/pie/sankey) to color series
 * when no explicit color is provided. Indexed via `FALLBACK_COLORS[i % length]`.
 */
export const FALLBACK_COLORS = [ '#8b5cf6', '#10b981', '#1e88e5', '#fb8c00', '#e53935', '#fbc02d', '#43a047', '#616161' ];
