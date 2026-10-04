import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { renderDemo, mainText } from './demo-harness';

describe( 'demo harness', () => {

	it( 'renders a demo page inside the real AppComponent', async () => {
		const fixture = await renderDemo( '/Overview' );

		expect( fixture.nativeElement.querySelector( 'mat-sidenav xiri-sidenav' ) ).not.toBeNull();
		expect( mainText( fixture ).length ).toBeGreaterThan( 0 );
	} );

	it( 'answers API paths the mock does not know with 404 instead of going to the network', async () => {
		await renderDemo( '/Overview' );

		const error = await firstValueFrom( TestBed.inject( HttpClient ).get( '/api/Does/Not/Exist' ) )
			.catch( ( e: HttpErrorResponse ) => e );

		expect( ( error as HttpErrorResponse ).status ).toBe( 404 );
	} );

	it( 'starts every test without a stored language', async () => {
		localStorage.setItem( 'xiri-language', 'en' );

		await renderDemo( '/Overview' );

		expect( localStorage.getItem( 'xiri-language' ) ).toBeNull();
	} );
} );
