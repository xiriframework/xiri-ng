import { Directive, computed, input } from '@angular/core';

export type XiriCols = number | { sm?: number; md?: number; lg?: number; xl?: number };

export function colsToClasses(cols: XiriCols | undefined): string {
	if (cols === undefined) return 'xcol';
	if (typeof cols === 'number') return `xcol xcol-md-${ cols }`;
	const parts = ['xcol'];
	for (const bp of ['sm', 'md', 'lg', 'xl'] as const)
		if (cols[bp] !== undefined) parts.push(`xcol-${ bp }-${ cols[bp] }`);
	return parts.join(' ');
}

@Directive({
	selector: '[xiriCols]',
	host: { '[class]': 'classes()' }
})
export class XiriColsDirective {
	xiriCols = input<XiriCols>();
	classes = computed(() => colsToClasses(this.xiriCols()));
}
