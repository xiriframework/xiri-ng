import { describe, it, expect } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { XiriUrlPipe } from './url.pipe';

describe( 'XiriUrlPipe', () => {
	const pipe = new XiriUrlPipe();

	it( 'trennt Pfad und Query', () => {
		expect( pipe.transform( '/Admin/Devices/Table?config=98&x=1' ) )
			.toEqual( { path: '/Admin/Devices/Table', queryParams: { config: '98', x: '1' } } );
	} );

	it( 'relativer Link ohne Slash bleibt relativ', () => {
		expect( pipe.transform( 'Test/Query/Page' ) )
			.toEqual( { path: 'Test/Query/Page', queryParams: {} } );
	} );

	it( 'URL ohne Query liefert leere Query-Params', () => {
		expect( pipe.transform( '/a/b' )?.queryParams ).toEqual( {} );
	} );

	it( 'leerer/undefined Input liefert null', () => {
		expect( pipe.transform( '' ) ).toBeNull();
		expect( pipe.transform( undefined ) ).toBeNull();
	} );
} );

// Regressionstest für den eigentlichen Bug: Ein an [routerLink] gebundener UrlTree
// navigiert IMMER absolut → der Route-Prefix geht bei relativen Links verloren.
// Dieser Test rendert einen echten RouterLink unter einem Prefix (/parent) und prüft
// das aufgelöste href. Nur die Pipe-in-Isolation zu testen (oben) fängt das NICHT.
@Component( {
	template: `@let u = link | xiriUrl;<a [routerLink]="u?.path" [queryParams]="u?.queryParams">go</a>`,
	imports: [ RouterLink, XiriUrlPipe ],
} )
class LinkHostComponent {
	link = 'child?config=98';
}

@Component( { template: '' } )
class BlankComponent {}

describe( 'XiriUrlPipe + RouterLink (Integration)', () => {

	it( 'relativer Link behält den Prefix und übernimmt Query-Params', async () => {
		TestBed.configureTestingModule( {
			providers: [ provideRouter( [ {
				path: 'parent',
				component: LinkHostComponent,
				children: [ { path: 'child', component: BlankComponent } ],
			} ] ) ],
		} );

		const harness = await RouterTestingHarness.create( '/parent' );
		harness.detectChanges();

		const href = harness.routeNativeElement!.querySelector( 'a' )!.getAttribute( 'href' );
		// Mit dem Bug (UrlTree an [routerLink]) wäre das absolut → "/child?config=98".
		expect( href ).toBe( '/parent/child?config=98' );
	} );
} );
