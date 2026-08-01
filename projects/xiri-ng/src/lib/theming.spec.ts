import { describe, it, expect, beforeAll } from 'vitest';
import * as sass from 'sass';

/**
 * Compiles the library theme the way a consumer does. Nothing else covers this:
 * `ng build xiri-ng` ships material.scss as an asset without compiling it, so a
 * broken mixin would only surface in a consumer's build.
 */
describe( 'theming mixins', () => {
	let css: string;
	let root: string;
	let dark: string;

	beforeAll( () => {
		// loadPaths sind relativ zum CWD des Test-Runners (Repo-Root).
		const result = sass.compileString( `
			@use 'projects/xiri-ng/styles/material' as xirimat;
			@use '@angular/material' as mat;
			$l: xirimat.create-theme(mat.$azure-palette, mat.$magenta-palette, light, -1);
			$d: xirimat.create-theme(mat.$azure-palette, mat.$magenta-palette, dark, -1);
			@include xirimat.theming($l, #2892D9, #4CAF50);
			@include xirimat.theming-dark($d);
		`, { loadPaths: [ '.', 'node_modules' ] } );

		css = result.css;
		root = css.slice( css.indexOf( ':root {' ) );
		dark = css.slice( css.indexOf( '.dark-theme {' ) );
	}, 120_000 );

	it( 'writes the variables the components read', () => {
		// Each of these is read by a component; a missing one silently falls back.
		for ( const v of [ '--primary', '--surface', '--on-surface', '--on-surface-variant',
			'--outline-variant', '--error', '--surface-container',
			'--secondary-container', '--on-secondary-container' ] )
			expect( root, v ).toContain( `${ v }:` );
	} );

	it( 'emits both dark selectors, matching the classes XiriThemeService sets', () => {
		expect( css ).toContain( '@media (prefers-color-scheme: dark)' );
		expect( css ).toContain( ':root:not(.light-theme)' );
		expect( css ).toContain( '.dark-theme' );
	} );

	it( 'sets color-scheme so native controls follow', () => {
		expect( dark ).toContain( 'color-scheme: dark' );
	} );

	it( 'overrides the container variables in dark mode too', () => {
		// Without these the table header would inherit its light colours.
		for ( const v of [ '--surface', '--on-surface-variant', '--secondary-container',
			'--on-secondary-container', '--surface-container', '--sidenav-background' ] )
			expect( dark, v ).toContain( `${ v }:` );
	} );

	// mat.all-component-colors() also emits a handful of non-colour tokens.
	// This is the only one the library sets itself — it must not be reverted to
	// Material's pill shape in dark mode only.
	it( 'keeps the list indicator square in dark mode', () => {
		const shapes = dark.match( /--mat-list-active-indicator-shape:[^;]*/g ) ?? [];

		expect( shapes.length ).toBeGreaterThan( 0 );
		expect( shapes[ shapes.length - 1 ] ).toContain( '0' );
		expect( shapes[ shapes.length - 1 ] ).not.toContain( '9999px' );
	} );
} );
