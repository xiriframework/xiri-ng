import { describe, it, expect } from 'vitest';
import { inputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { colsToClasses, XiriCols, XiriColsDirective } from './cols.directive';

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

describe( 'XiriColsDirective – Host-Klassen', () => {
	it( 'setzt die Klassen aus xiriCols auf das Host-Element', async () => {
		const fixture = TestBed.createDirective( XiriColsDirective, { tagName: 'div', bindings: [ inputBinding( 'xiriCols', () => 6 ) ] } );
		await fixture.whenStable();

		expect( fixture.nativeElement.className ).toBe( 'xcol xcol-md-6' );
	} );

	it( 'aktualisiert die Klassen, wenn sich xiriCols ändert', async () => {
		const cols = signal<XiriCols>( 6 );
		const fixture = TestBed.createDirective( XiriColsDirective, { tagName: 'div', bindings: [ inputBinding( 'xiriCols', cols ) ] } );
		await fixture.whenStable();

		cols.set( { sm: 12, xl: 4 } );
		await fixture.whenStable();

		expect( fixture.nativeElement.className ).toBe( 'xcol xcol-sm-12 xcol-xl-4' );
	} );
} );
