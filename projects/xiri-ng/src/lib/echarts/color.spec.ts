import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { computed } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resolveColor, notifyThemeChanged, FALLBACK_COLORS } from './color';

describe( 'echarts color resolution', () => {

	beforeEach( () => {
		document.documentElement.style.setProperty( '--primary', '#2892D9' );
		document.documentElement.style.setProperty( '--secondary', '#4CAF50' );
		document.documentElement.style.setProperty( '--tertiary', '#9B8AAF' );
		document.documentElement.style.setProperty( '--error', '#FF5449' );
	} );

	afterEach( () => {
		for ( const v of [ '--primary', '--secondary', '--tertiary', '--error' ] )
			document.documentElement.style.removeProperty( v );
	} );

	// echarts renders on a canvas, where a literal "var(--primary)" is not a
	// valid colour — it has to be resolved to a concrete value first.
	it( 'resolves theme tokens to a concrete colour, never a var() string', () => {
		for ( const token of [ 'primary', 'secondary', 'tertiary', 'accent', 'error' ] ) {
			const c = resolveColor( token );
			expect( c, token ).not.toContain( 'var(' );
			expect( c, token ).toMatch( /^#|^rgb/ );
		}
	} );

	it( 'maps a theme token to the value of its CSS variable', () => {
		expect( resolveColor( 'primary' ) ).toBe( '#2892D9' );
		expect( resolveColor( 'secondary' ) ).toBe( '#4CAF50' );
		expect( resolveColor( 'error' ) ).toBe( '#FF5449' );
	} );

	it( 'follows the theme when the variable changes', () => {
		expect( resolveColor( 'primary' ) ).toBe( '#2892D9' );

		document.documentElement.style.setProperty( '--primary', '#112233' );

		expect( resolveColor( 'primary' ) ).toBe( '#112233' );
	} );

	it( 'uses the fallback when the theme variable is not set', () => {
		document.documentElement.style.removeProperty( '--primary' );

		expect( resolveColor( 'primary', '#abcdef' ) ).toBe( '#abcdef' );
	} );

	it( 'never returns currentColor, which a canvas cannot resolve either', () => {
		const c = resolveColor( 'inherit' );

		expect( c ).not.toBe( 'currentColor' );
		expect( c ).toMatch( /^#|^rgb/ );
	} );

	it( 'leaves fixed brand colours untouched', () => {
		expect( resolveColor( 'red' ) ).toBe( '#e53935' );
		expect( resolveColor( 'purple' ) ).toBe( '#8b5cf6' );
	} );

	it( 'falls back for an unknown token', () => {
		expect( resolveColor( 'nonsense', '#123456' ) ).toBe( '#123456' );
		expect( resolveColor( undefined, '#123456' ) ).toBe( '#123456' );
	} );

	it( 'keeps the categorical fallback palette free of variables', () => {
		for ( const c of FALLBACK_COLORS )
			expect( c ).not.toContain( 'var(' );
	} );

	// The chart components build their options in a computed(); reading the epoch
	// inside resolveColor is what makes them re-run on a theme switch.
	it( 'makes a computed re-evaluate after a theme change', () => {
		TestBed.runInInjectionContext( () => {
			const option = computed( () => resolveColor( 'primary' ) );
			expect( option() ).toBe( '#2892D9' );

			document.documentElement.style.setProperty( '--primary', '#000000' );
			notifyThemeChanged();

			expect( option() ).toBe( '#000000' );
		} );
	} );
} );
