import { XiriColor } from '../types/color.type';

/**
 * Maps semantic XiriColor names to concrete CSS color values.
 *
 * Theme tokens use Material 3 system variables; extended tokens use
 * fixed brand colors that work both in light and dark themes.
 */
export const COLOR_CSS_VAR: Record<string, string> = {
	primary:   'var(--mat-sys-primary)',
	secondary: 'var(--mat-sys-secondary)',
	tertiary:  'var(--mat-sys-tertiary)',
	accent:    'var(--mat-sys-tertiary)',
	warn:      '#f5a623',
	error:     'var(--mat-sys-error)',
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
 * Resolves a XiriColor token (or a freeform CSS color) to a CSS-color string
 * usable in echarts options. Unknown tokens fall back to the given fallback.
 */
export function resolveColor( color: XiriColor | string | undefined, fallback = '#8b5cf6' ): string {
	if ( !color ) return fallback;
	return COLOR_CSS_VAR[ color ] ?? fallback;
}
