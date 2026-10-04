import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { mockApiInterceptor } from './mock-api.interceptor';

describe( 'mock API', () => {

	// The delays exist to show the loading state before the error; delay() alone lets errors through at once.
	it.each( [
		[ 'Test/Error/Fail', null ],
		[ 'Test/Form/Page', { name: 'fehler' } ],
		[ 'Test/InlineEdit/Save', { field: 'price', value: 'abc' } ],
	] )( 'answers %s with a delayed error', async ( url, body ) => {
		TestBed.configureTestingModule( { providers: [ provideHttpClient( withInterceptors( [ mockApiInterceptor ] ) ) ] } );
		const http = TestBed.inject( HttpClient );
		let failed = false;

		( body ? http.post( '/api/' + url, body ) : http.get( '/api/' + url ) ).subscribe( { error: () => failed = true } );

		// Shortest delay is 200 ms: before that the page must still be loading.
		await new Promise( resolve => setTimeout( resolve, 150 ) );
		expect( failed ).toBe( false );
		await vi.waitFor( () => expect( failed ).toBe( true ), { timeout: 2000 } );
	} );
} );
