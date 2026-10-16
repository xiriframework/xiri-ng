import { describe, it, expect, vi, afterEach } from 'vitest';
import { AppRoutes } from './app-routing.module';
import { renderDemo, mainText, navLinks } from '../testing/demo-harness';
import { demoNavFields } from './app.component';
import { XiriNavigationField } from 'projects/xiri-ng/src/lib/sidenav/sidenav.component';

const routePaths = AppRoutes.map( r => r.path ?? '' ).filter( p => p !== '' && p !== '**' );
const dynPaths = navLinks( demoNavFields ).filter( l => !routePaths.includes( l ) );

// [link, names of the menus above it] for every link inside a menu
function nested( fields: XiriNavigationField[], parents: string[] = [] ): [ string, string[] ][] {
	return fields.flatMap( f => [
		...( f.link && parents.length ? [ [ f.link, parents ] as [ string, string[] ] ] : [] ),
		...nested( f.sub ?? [], f.menu ? [ ...parents, f.name ] : parents ),
	] );
}

// Deliberate exceptions, per page — a global allowance would hide real breakage.
const showsUnknownType = [ 'Cards' ];          // demos the dyncomponent fallback
const showsNotFound = [ 'Test/Error/Fail' ];   // demos the error page

describe( 'every demo page', () => {
	afterEach( () => vi.restoreAllMocks() );

	it.each( [ ...routePaths, ...dynPaths, ...showsNotFound ] )( '%s renders without errors', async path => {
		const errors = vi.spyOn( console, 'error' );

		const fixture = await renderDemo( '/' + path );
		const text = mainText( fixture );

		expect( errors ).not.toHaveBeenCalled();
		expect( text.trim().length ).toBeGreaterThan( 0 );
		// The fallback output itself; the Cards subtitle mentions "unknown type" too.
		expect( /unknown type( OUT)?:/.test( text ) ).toBe( showsUnknownType.includes( path ) );
		expect( text.includes( 'Page not found' ) ).toBe( showsNotFound.includes( path ) );
		// Without mat-card-content the form fields sit on the card edge.
		expect( fixture.nativeElement.querySelectorAll( 'mat-card > xiri-form' ).length ).toBe( 0 );
	} );
} );

// Same DOM as a dynpage of a client app, so spacing measured here is the spacing there.
describe( 'demo page structure', () => {

	it.each( [ ...routePaths, ...dynPaths, ...showsNotFound ] )( '%s has the client dynpage structure', async path => {
		const fixture = await renderDemo( '/' + path );

		const container = fixture.nativeElement.querySelector( '.mainpage .xcontainer-fluid' ) as HTMLElement;
		const rows = container.querySelectorAll( ':scope > .xrow' );
		expect( rows.length ).toBe( 1 );

		const cols = rows[ 0 ].querySelectorAll( ':scope > .xcol' );
		const bread = rows[ 0 ].querySelectorAll( ':scope > .xcol.bread' );
		expect( bread.length ).toBeLessThanOrEqual( 1 );
		if ( bread.length )
			expect( cols[ 0 ] ).toBe( bread[ 0 ] );

		const content = cols[ cols.length - 1 ];
		expect( content.classList.contains( 'bread' ) ).toBe( false );
		expect( content.querySelectorAll( ':scope > .xrow, :scope > xiri-dyncomponent.xrow' ).length ).toBe( 1 );
	} );
} );

describe( 'demo sidebar', () => {

	it( 'links every demo page', () => {
		expect( routePaths.filter( p => !navLinks( demoNavFields ).includes( p ) ) ).toEqual( [] );
	} );

	// Catches a link that also opens a foreign menu. Not the menus' regex: an exact link match opens its menu anyway.
	it.each( nested( demoNavFields ) )( 'opens only the menus above %s', async ( link, parents ) => {
		const fixture = await renderDemo( '/' + link );

		const expanded = Array.from( fixture.nativeElement.querySelectorAll( 'xiri-sidenav .parent[aria-expanded="true"]' ) )
			.map( el => ( el as HTMLElement ).querySelector( '[matListItemTitle]' )?.textContent?.trim() );

		expect( expanded ).toEqual( parents );
	} );
} );
