import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderDemo, waitFor } from '../../testing/demo-harness';

const session = '3f2b8c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f';

// Antwort der Brücke: Text in Stücken, Session-ID im Header.
function streamed( chunks: string[], status = 200 ): Response {
	const enc = new TextEncoder();
	const body = new ReadableStream<Uint8Array>( {
		start( c ) {
			chunks.forEach( t => c.enqueue( enc.encode( t ) ) );
			c.close();
		},
	} );
	return new Response( body, { status, headers: { 'X-Session-Id': session } } );
}

function type( el: HTMLElement, selector: string, value: string ): void {
	const input = el.querySelector( selector ) as HTMLInputElement | HTMLTextAreaElement;
	input.value = value;
	input.dispatchEvent( new Event( 'input' ) );
}

describe( 'OpenUI demo: Frag Claude', () => {
	afterEach( () => vi.restoreAllMocks() );

	it( 'schickt Frage und Schlüssel an die Brücke, rendert den Stream und setzt die Session fort', async () => {
		const fetch = vi.spyOn( globalThis, 'fetch' )
			.mockResolvedValueOnce( streamed( [ 'root = Card("Von ', 'Claude", [s])\ns = Stat("KPI", 1)' ] ) )
			.mockResolvedValueOnce( streamed( [ 'root = Card("Zweite", [])' ] ) );
		const fixture = await renderDemo( '/OpenUI' );
		const el = fixture.nativeElement as HTMLElement;

		type( el, 'input.token', 'geheim' );
		type( el, 'textarea.ask-input', 'Zeig eine KPI' );
		await fixture.whenStable();
		( el.querySelector( 'button.ask' ) as HTMLButtonElement ).click();

		await waitFor( fixture, () => el.querySelector( 'openui-renderer xiri-section h2' )?.textContent === 'Von Claude' );
		await waitFor( fixture, () => !( el.querySelector( 'button.stream' ) as HTMLButtonElement ).disabled );
		expect( el.querySelectorAll( 'openui-renderer xiri-stat' ).length ).toBe( 1 );
		expect( ( el.querySelector( 'textarea.program' ) as HTMLTextAreaElement ).value ).toContain( 'Stat("KPI", 1)' );

		const [ url, init ] = fetch.mock.calls[ 0 ];
		expect( url ).toBe( '/openui-bridge' );
		expect( ( init!.headers as Record<string, string> )[ 'X-Bridge-Token' ] ).toBe( 'geheim' );
		expect( JSON.parse( init!.body as string ) ).toEqual( { message: 'Zeig eine KPI', sessionId: null } );

		type( el, 'textarea.ask-input', 'Mach einen neuen Titel' );
		await fixture.whenStable();
		( el.querySelector( 'button.ask' ) as HTMLButtonElement ).click();
		await waitFor( fixture, () => el.querySelector( 'openui-renderer xiri-section h2' )?.textContent === 'Zweite' );
		expect( JSON.parse( fetch.mock.calls[ 1 ][ 1 ]!.body as string ) ).toEqual( { message: 'Mach einen neuen Titel', sessionId: session } );

		await fixture.whenStable();
		( el.querySelector( 'button.reset' ) as HTMLButtonElement ).click();
		type( el, 'textarea.ask-input', 'Neu' );
		fetch.mockResolvedValueOnce( streamed( [ 'root = Card("Drei", [])' ] ) );
		await fixture.whenStable();
		( el.querySelector( 'button.ask' ) as HTMLButtonElement ).click();
		await waitFor( fixture, () => fetch.mock.calls.length === 3 );
		expect( JSON.parse( fetch.mock.calls[ 2 ][ 1 ]!.body as string ).sessionId ).toBeNull();
	} );

	it( 'meldet einen falschen Schlüssel und eine nicht laufende Brücke', async () => {
		const fetch = vi.spyOn( globalThis, 'fetch' ).mockResolvedValueOnce( new Response( 'Schlüssel fehlt oder ist falsch', { status: 401 } ) );
		const fixture = await renderDemo( '/OpenUI' );
		const el = fixture.nativeElement as HTMLElement;
		const status = () => el.querySelector( '.ask-status' )?.textContent ?? '';

		type( el, 'input.token', 'falsch' );
		type( el, 'textarea.ask-input', 'hi' );
		await fixture.whenStable();
		( el.querySelector( 'button.ask' ) as HTMLButtonElement ).click();
		await waitFor( fixture, () => status().includes( 'Schlüssel' ) );

		fetch.mockRejectedValueOnce( new TypeError( 'Failed to fetch' ) );
		await fixture.whenStable();
		( el.querySelector( 'button.ask' ) as HTMLButtonElement ).click();
		await waitFor( fixture, () => status().includes( 'npm run openui-bridge' ) );

		// 502 mit Text kommt von der Brücke (Claude-Fehler), ohne Text vom Proxy (Brücke läuft nicht).
		fetch.mockResolvedValueOnce( new Response( 'Claude hat nicht geantwortet (Details im Log der Brücke)', { status: 502 } ) );
		( el.querySelector( 'button.ask' ) as HTMLButtonElement ).click();
		await waitFor( fixture, () => status().includes( 'Claude hat nicht geantwortet' ) );

		fetch.mockResolvedValueOnce( new Response( '', { status: 502 } ) );
		( el.querySelector( 'button.ask' ) as HTMLButtonElement ).click();
		await waitFor( fixture, () => status().includes( 'npm run openui-bridge' ) );
		expect( el.querySelector( 'openui-renderer xiri-section h2' )?.textContent ).toBe( 'Support-Überblick' );
	} );
} );
