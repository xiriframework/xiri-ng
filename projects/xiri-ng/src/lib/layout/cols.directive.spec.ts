import { describe, it, expect } from 'vitest';
import { colsToClasses } from './cols.directive';

describe('colsToClasses', () => {
	it('Zahl → volle + Breakpoint-Klassen', () => {
		expect(colsToClasses(6)).toBe('xcol xcol-md-6');
	});

	it('Objekt → je Breakpoint', () => {
		expect(colsToClasses({ sm: 12, md: 6, xl: 4 })).toBe('xcol xcol-sm-12 xcol-md-6 xcol-xl-4');
	});

	it('leer → xcol', () => {
		expect(colsToClasses(undefined)).toBe('xcol');
	});
});
