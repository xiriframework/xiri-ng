import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { XiriLocaleService } from '../services/locale.service';
import { XiriChatComponent } from './chat.component';
import { XiriChatSettings } from './chat.types';

const T = Date.UTC( 2026, 9, 16, 10, 0 ) / 1000;

describe( 'XiriChatComponent', () => {
	let http: HttpTestingController;

	beforeEach( () => {
		TestBed.configureTestingModule( { providers: [ provideHttpClient(), provideHttpClientTesting() ] } );
		http = TestBed.inject( HttpTestingController );
		TestBed.inject( XiriLocaleService ).setLanguage( 'de' );
	} );

	afterEach( () => http.verify() );

	async function render( settings: XiriChatSettings ): Promise<ComponentFixture<XiriChatComponent>> {
		const fixture = TestBed.createComponent( XiriChatComponent );
		fixture.componentRef.setInput( 'settings', settings );
		// Kein whenStable hier: offene Requests (HttpTestingController) würden es blockieren. Tests flushen erst, dann whenStable.
		fixture.detectChanges();
		return fixture;
	}

	const el = ( f: ComponentFixture<unknown> ) => f.nativeElement as HTMLElement;
	const bubbles = ( f: ComponentFixture<unknown> ) => [ ...el( f ).querySelectorAll( '.bubble' ) ] as HTMLElement[];
	const textarea = ( f: ComponentFixture<unknown> ) => el( f ).querySelector( 'textarea' ) as HTMLTextAreaElement;

	function type( f: ComponentFixture<unknown>, value: string ): void {
		textarea( f ).value = value;
		textarea( f ).dispatchEvent( new Event( 'input' ) );
		f.detectChanges();
	}

	function enter( f: ComponentFixture<unknown>, init: KeyboardEventInit = {} ): void {
		textarea( f ).dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Enter', cancelable: true, ...init } ) );
		f.detectChanges();
	}

	it( 'rendert eigene rechts, fremde mit Name und Initialen', async () => {
		const f = await render( { url: 'Chat', messages: [
			{ id: '1', text: 'Hallo', time: T, from: 'Anna Berger' },
			{ id: '2', text: 'Hi', time: T + 60, own: true, status: 'read' },
		] } );
		const rows = [ ...el( f ).querySelectorAll( '.row' ) ];
		expect( rows[ 0 ].classList.contains( 'own' ) ).toBe( false );
		expect( rows[ 0 ].textContent ).toContain( 'Anna Berger' );
		expect( rows[ 0 ].querySelector( '.avatar' )?.textContent?.trim() ).toBe( 'AB' );
		expect( rows[ 1 ].classList.contains( 'own' ) ).toBe( true );
		expect( rows[ 1 ].querySelector( '[aria-label="Gelesen"]' ) ).toBeTruthy();
		expect( el( f ).querySelector( '[role="log"]' ) ).toBeTruthy();
	} );

	it( 'zeigt Text wörtlich, nie als HTML', async () => {
		const f = await render( { url: 'Chat', messages: [ { id: '1', text: '<b>x</b><img src=x onerror="alert(1)">', time: T } ] } );
		expect( el( f ).querySelector( '.bubble b, .bubble img' ) ).toBeNull();
		expect( bubbles( f )[ 0 ].textContent ).toContain( '<b>x</b>' );
	} );

	it( 'lädt die Startseite per GET, wenn keine Nachrichten mitkommen', async () => {
		const f = await render( { url: 'Chat' } );
		http.expectOne( '/api/Chat' ).flush( { messages: [ { id: '1', text: 'geladen', time: T } ], cursor: 'c1' } );
		await f.whenStable();
		expect( el( f ).textContent ).toContain( 'geladen' );
	} );

	it( 'sendet mit Enter optimistisch und ersetzt per clientId', async () => {
		const f = await render( { url: 'Chat', messages: [] } );
		type( f, '  Hallo Welt  ' );
		enter( f );

		expect( textarea( f ).value ).toBe( '' );
		expect( el( f ).querySelector( '[aria-label="Wird gesendet"]' ) ).toBeTruthy();
		const req = http.expectOne( r => r.method === 'POST' && r.url === '/api/Chat' );
		expect( req.request.body.text ).toBe( 'Hallo Welt' );
		const clientId = req.request.body.clientId as string;
		expect( clientId ).toBeTruthy();

		req.flush( { message: { id: 'm9', text: 'Hallo Welt', time: T, own: true, status: 'sent', clientId } } );
		await f.whenStable();
		expect( bubbles( f ).length ).toBe( 1 );
		expect( el( f ).querySelector( '[aria-label="Gesendet"]' ) ).toBeTruthy();
	} );

	it( 'markiert Fehler und sendet erneut mit derselben clientId', async () => {
		const f = await render( { url: 'Chat', messages: [] } );
		type( f, 'Hallo' );
		enter( f );
		const first = http.expectOne( r => r.method === 'POST' );
		const clientId = first.request.body.clientId;
		first.flush( { error: 'kaputt' }, { status: 500, statusText: 'Server Error' } );
		await f.whenStable();

		const retry = [ ...el( f ).querySelectorAll( 'button' ) ].find( b => b.textContent?.includes( 'Erneut senden' ) )!;
		expect( retry ).toBeTruthy();
		retry.click();
		f.detectChanges();
		const second = http.expectOne( r => r.method === 'POST' );
		expect( second.request.body ).toEqual( { text: 'Hallo', clientId } );
		second.flush( { message: { id: 'm1', text: 'Hallo', time: T, own: true, status: 'sent', clientId } } );
		await f.whenStable();
		expect( bubbles( f ).length ).toBe( 1 );
	} );

	it( 'Shift+Enter, IME-Komposition und leerer Text senden nicht', async () => {
		const f = await render( { url: 'Chat', messages: [] } );
		type( f, 'Zeile' );
		enter( f, { shiftKey: true } );
		enter( f, { isComposing: true } );
		type( f, '   ' );
		enter( f );
		http.expectNone( r => r.method === 'POST' );
	} );

	it( 'readonly blendet die Eingabe aus', async () => {
		const f = await render( { url: 'Chat', messages: [], readonly: true } );
		expect( textarea( f ) ).toBeNull();
	} );

	it( 'übernimmt Platzhalter und maxLength', async () => {
		const f = await render( { url: 'Chat', messages: [], placeholder: 'Schreib was', maxLength: 10 } );
		expect( textarea( f ).placeholder ).toBe( 'Schreib was' );
		expect( textarea( f ).getAttribute( 'maxlength' ) ).toBe( '10' );
	} );
} );
