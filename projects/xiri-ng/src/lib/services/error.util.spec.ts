import { describe, it, expect } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { parseHttpError } from './error.util';

describe( 'parseHttpError', () => {
	it.each( [ 409, 503 ] )( 'zeigt die Server-Meldung bei %s', status => {
		const err = new HttpErrorResponse( { status, error: { error: 'Die Tour hat noch offene Lieferscheine.' } } );
		expect( parseHttpError( err ) ).toBe( 'Die Tour hat noch offene Lieferscheine.' );
	} );

	it( 'fällt ohne Body auf die festen Texte zurück', () => {
		expect( parseHttpError( new HttpErrorResponse( { status: 500 } ) ) ).toBe( 'Unknown error' );
		expect( parseHttpError( new HttpErrorResponse( { status: 404 } ) ) ).toBe( 'Not found' );
	} );

	it( 'ignoriert eine Meldung, die kein String ist', () => {
		expect( parseHttpError( new HttpErrorResponse( { status: 409, error: { error: 42 } } ) ) ).toBe( 'Unknown error' );
	} );
} );
