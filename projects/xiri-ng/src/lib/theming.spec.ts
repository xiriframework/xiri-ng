import { describe, it, expect, beforeAll } from 'vitest';
import * as sass from 'sass';

// WCAG contrast ratio of two CSS colours given as #rgb, #rrggbb or a few keywords.
function contrast( a: string, b: string ): number {
	const keywords: Record<string, string> = { white: '#ffffff', black: '#000000' };
	const luminance = ( color: string ) => {
		let hex = ( keywords[ color.trim() ] ?? color.trim() ).slice( 1 );
		if ( hex.length === 3 ) hex = [ ...hex ].map( c => c + c ).join( '' );
		const [ r, g, b ] = [ 0, 2, 4 ].map( i => parseInt( hex.slice( i, i + 2 ), 16 ) / 255 )
			.map( v => v <= 0.03928 ? v / 12.92 : ( ( v + 0.055 ) / 1.055 ) ** 2.4 );
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const [ hi, lo ] = [ luminance( a ), luminance( b ) ].sort( ( x, y ) => y - x );
	return ( hi + 0.05 ) / ( lo + 0.05 );
}

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

	it( 'gives warning its own colour instead of the error colour', () => {
		expect( css ).not.toMatch( /--color-warning:\s*var\(--error\)/ );
		expect( root ).toMatch( /--color-warning:\s*#B07700/i );
		expect( dark ).toMatch( /--color-warning:\s*#FFC94D/i );
	} );

	// Without these the error box and chat bubbles keep their light colours in dark mode.
	it( 'overrides the container pairs in dark mode', () => {
		for ( const v of [ '--primary-container', '--on-primary-container', '--error-container',
			'--on-error-container', '--on-success' ] ) {
			expect( root, v ).toMatch( new RegExp( `${ v }:` ) );
			expect( dark, v ).toMatch( new RegExp( `${ v }:` ) );
		}
		const light = root.match( /--error-container:\s*([^;]+);/ )?.[ 1 ];
		const darkVal = dark.match( /--error-container:\s*([^;]+);/ )?.[ 1 ];
		expect( darkVal ).toBeDefined();
		expect( darkVal ).not.toBe( light );
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
	// Der DOM-Test der Tabs beweist nur die Klasse; hier die ausgelieferte Regel samt Kind-Kombinator,
	// damit verschachtelte Tabs ihr Padding behalten.
	it( 'ships the no-padding rule for tab bodies with a child combinator', () => {
		expect( css ).toMatch( /\.mat-mdc-tab-body\.xiri-tab-no-padding > \.mat-mdc-tab-body-content \{\s*padding: 0;/ );
	} );

	// Material 22 liest nur --mat-snack-bar-*, und "Material Icons" ist kein Peer: beides fiel sonst still aus.
	it( 'styles the snackbar variants with tokens and a font Material 22 actually uses', () => {
		for ( const type of [ 'success', 'error', 'info', 'warning' ] ) {
			// matchAll: the shared animation rule also ends in ".xiri-snackbar-warning {".
			const block = [ ...css.matchAll( new RegExp( `\\.xiri-snackbar-${ type } \\{[^}]*\\}`, 'g' ) ) ].join( '' );
			expect( block, type ).toContain( '--mat-snack-bar-container-color:' );
			expect( block, type ).toContain( '--mat-snack-bar-supporting-text-color:' );
		}
		expect( css ).not.toContain( '--mdc-snackbar-' );
		expect( css ).not.toMatch( /font-family: "?Material Icons/ );
		expect( css ).toMatch( /\.mdc-snackbar__label::before \{[^}]*font-family: "Material Symbols Outlined"/ );
	} );

	// Form fields use subscriptSizing="dynamic" so long hints grow; a field without hint must still keep
	// the 20px the fixed subscript reserved, or every form row moves up. Rows cells (.cell) stay compact.
	it( 'reserves the former fixed subscript height for form fields without hint', () => {
		expect( css ).toMatch( /xiri-form-fields mat-form-field:not\(\.cell\) > \.mat-mdc-form-field-subscript-dynamic-size \{\s*min-height: 20px;/ );
	} );

	it( 'gives every snackbar variant at least 4.5:1 text contrast', () => {
		for ( const type of [ 'success', 'error', 'info', 'warning' ] ) {
			const block = [ ...css.matchAll( new RegExp( `\\.xiri-snackbar-${ type } \\{[^}]*\\}`, 'g' ) ) ].join( '' );
			const bg = block.match( /--mat-snack-bar-container-color:\s*([^;]+);/ )![ 1 ];
			const fg = block.match( /--mat-snack-bar-supporting-text-color:\s*([^;]+);/ )![ 1 ];
			expect( contrast( bg, fg ), type ).toBeGreaterThanOrEqual( 4.5 );
		}
	} );

	// Same hardening as .material-symbols-outlined: inherited tracking or text-transform would break the ligature into plain text.
	it( 'protects the snackbar icon ligature from inherited text styles', () => {
		const before = css.match( /\.mdc-snackbar__label::before \{[^}]*font-family: "Material Symbols Outlined"[^}]*\}/ )?.[ 0 ] ?? '';
		for ( const decl of [ 'letter-spacing: normal', 'text-transform: none', 'white-space: nowrap', 'direction: ltr' ] )
			expect( before, decl ).toContain( decl );
	} );

	// The label sits in the snackbar's aria-live region: without empty alt text the ligature name ("check_circle") is announced.
	it( 'hides the snackbar icon ligature from screen readers', () => {
		for ( const name of [ 'check_circle', 'error', 'info', 'warning' ] )
			expect( css, name ).toMatch( new RegExp( `content: "${ name }"\\s*/\\s*""` ) );
	} );
} );
