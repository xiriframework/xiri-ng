import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

	describe( 'Aktualisierung', () => {
		afterEach( () => {
			vi.useRealTimers();
			vi.unstubAllGlobals();
		} );

		it( 'pollt mit Cursor und ersetzt geänderte Nachrichten per id', async () => {
			vi.useFakeTimers();
			const f = await render( {
				url: 'Chat', poll: 2, cursor: 'c1', messages: [ { id: 'm1', text: 'Hi', time: T, own: true, status: 'sent' } ],
			} );
			await vi.advanceTimersByTimeAsync( 2000 );
			http.expectOne( '/api/Chat?cursor=c1' )
				.flush( { messages: [ { id: 'm1', text: 'Hi', time: T, own: true, status: 'read' } ], cursor: 'c2' } );
			f.detectChanges();
			expect( bubbles( f ).length ).toBe( 1 );
			expect( el( f ).querySelector( '[aria-label="Gelesen"]' ) ).toBeTruthy();
			await vi.advanceTimersByTimeAsync( 2000 );
			http.expectOne( '/api/Chat?cursor=c2' ).flush( { messages: [], cursor: 'c2' } );
		} );

		it( 'Poll-Antwort vor der POST-Antwort ergibt keine doppelte Nachricht', async () => {
			vi.useFakeTimers();
			const f = await render( { url: 'Chat', poll: 1, cursor: 'c1', messages: [] } );
			type( f, 'Hallo' );
			enter( f );
			const post = http.expectOne( r => r.method === 'POST' );
			const clientId = post.request.body.clientId;
			const saved = { id: 'm5', text: 'Hallo', time: T, own: true, status: 'sent' as const, clientId };
			await vi.advanceTimersByTimeAsync( 1000 );
			http.expectOne( '/api/Chat?cursor=c1' ).flush( { messages: [ saved ], cursor: 'c2' } );
			post.flush( { message: saved } );
			f.detectChanges();
			expect( bubbles( f ).length ).toBe( 1 );
		} );

		it( 'pollt nach gescheiterter Startseite weiter (wirkt als Retry)', async () => {
			vi.useFakeTimers();
			await render( { url: 'Chat', poll: 1 } );
			http.expectOne( '/api/Chat' ).flush( null, { status: 500, statusText: 'x' } );
			await vi.advanceTimersByTimeAsync( 1000 );
			http.expectOne( '/api/Chat?cursor=' ).flush( { messages: [], cursor: 'c1' } );
		} );

		it( 'SSE: Event macht Upsert, kaputtes JSON wird verworfen, Destroy schließt', async () => {
			const sources: { url: string; onmessage?: ( e: { data: string } ) => void; close: () => void; closed: boolean }[] = [];
			vi.stubGlobal( 'EventSource', class {
				onmessage?: ( e: { data: string } ) => void;
				closed = false;
				constructor( public url: string ) { sources.push( this ); }
				close() { this.closed = true; }
			} );
			vi.useFakeTimers();
			const f = await render( { url: 'Chat', stream: 'Chat/Stream', poll: 1, cursor: 'c1', messages: [] } );
			expect( sources.map( s => s.url ) ).toEqual( [ '/api/Chat/Stream?cursor=c1' ] );

			sources[ 0 ].onmessage!( { data: '{kaputt' } );
			sources[ 0 ].onmessage!( { data: 'null' } );
			sources[ 0 ].onmessage!( { data: JSON.stringify( { messages: [ { id: 'm2', text: 'per SSE', time: T } ], cursor: 'c2' } ) } );
			f.detectChanges();
			expect( el( f ).textContent ).toContain( 'per SSE' );
			await vi.advanceTimersByTimeAsync( 1000 );
			http.expectNone( r => r.url.includes( 'cursor=' ) ); // stream ersetzt poll

			f.destroy();
			expect( sources[ 0 ].closed ).toBe( true );
		} );

		describe( 'ältere Nachrichten', () => {
			let trigger: ( visible: boolean ) => void;

			beforeEach( () => {
				vi.stubGlobal( 'IntersectionObserver', class {
					constructor( private cb: IntersectionObserverCallback ) {
						trigger = v => this.cb( [ { isIntersecting: v } as IntersectionObserverEntry ], this as never );
					}
					observe() {}
					disconnect() {}
				} );
			} );

			it( 'lädt über before nach und stoppt bei hasOlder=false', async () => {
				const f = await render( { url: 'Chat', hasOlder: true, messages: [ { id: 'm5', text: 'neu', time: T } ] } );
				await f.whenStable(); // ready wird erst nach dem ersten Rendern (afterNextRender) gesetzt
				trigger( true );
				http.expectOne( '/api/Chat?before=m5' ).flush( { messages: [ { id: 'm1', text: 'uralt', time: T - 86400 * 3 } ], hasOlder: false } );
				await f.whenStable();
				expect( el( f ).textContent ).toContain( 'uralt' );
				expect( el( f ).querySelector( '.sentinel' ) ).toBeNull();
			} );

			it( 'stellt das Nachladen nach einem Fehler ein (keine Endlosschleife)', async () => {
				const f = await render( { url: 'Chat', hasOlder: true, messages: [ { id: 'm5', text: 'neu', time: T } ] } );
				await f.whenStable(); // ready wird erst nach dem ersten Rendern (afterNextRender) gesetzt
				trigger( true );
				http.expectOne( '/api/Chat?before=m5' ).flush( null, { status: 500, statusText: 'x' } );
				await f.whenStable();
				trigger( true );
				http.expectNone( r => r.url.includes( 'before=' ) );
				expect( el( f ).querySelector( '.sentinel' ) ).toBeNull();
			} );
		} );

		it( 'zeigt den Chip „Neue Nachrichten“, wenn der Nutzer nicht unten ist', async () => {
			vi.useFakeTimers();
			const f = await render( { url: 'Chat', poll: 1, cursor: 'c1', messages: [ { id: 'm1', text: 'a', time: T } ] } );
			const scroller = el( f ).querySelector( '.messages' ) as HTMLElement;
			Object.defineProperty( scroller, 'scrollHeight', { value: 1000, configurable: true } );
			Object.defineProperty( scroller, 'clientHeight', { value: 300, configurable: true } );
			// Fest auf 0: Ein noch ausstehender Scroll nach unten (afterNextRender) darf den Zustand nicht überschreiben.
			Object.defineProperty( scroller, 'scrollTop', { get: () => 0, set: () => undefined, configurable: true } );

			await vi.advanceTimersByTimeAsync( 1000 );
			http.expectOne( '/api/Chat?cursor=c1' ).flush( { messages: [ { id: 'm2', text: 'b', time: T + 1, from: 'Anna' } ], cursor: 'c2' } );
			f.detectChanges();
			const chip = el( f ).querySelector( '.unseen' ) as HTMLButtonElement;
			expect( chip.textContent ).toContain( 'Neue Nachrichten' );
			chip.click();
			f.detectChanges();
			expect( el( f ).querySelector( '.unseen' ) ).toBeNull();
		} );
	} );
} );
