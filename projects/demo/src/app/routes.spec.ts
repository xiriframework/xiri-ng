import { describe, it, expect, vi, afterEach } from 'vitest';
import { AppRoutes } from './app-routing.module';
import { renderDemo, mainText, navLinks } from '../testing/demo-harness';
import { demoNavFields } from './app.component';

const routePaths = AppRoutes.map( r => r.path ?? '' ).filter( p => p !== '' && p !== '**' );
const dynPaths = navLinks( demoNavFields ).filter( l => !routePaths.includes( l ) );

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
	} );
} );

describe( 'demo sidebar', () => {

	it( 'links every demo page', () => {
		expect( routePaths.filter( p => !navLinks( demoNavFields ).includes( p ) ) ).toEqual( [] );
	} );
} );
