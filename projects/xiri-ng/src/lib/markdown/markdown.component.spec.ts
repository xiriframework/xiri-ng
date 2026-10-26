import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { XiriMarkdownComponent } from './markdown.component';

describe( 'XiriMarkdownComponent', () => {
	async function render( text: string ): Promise<HTMLElement> {
		TestBed.configureTestingModule( { imports: [ XiriMarkdownComponent ] } );
		const f = TestBed.createComponent( XiriMarkdownComponent );
		f.componentRef.setInput( 'settings', { text } );
		const el = f.nativeElement as HTMLElement;
		// marked wird lazy geladen
		await vi.waitFor( () => {
			f.detectChanges();
			expect( el.querySelector( '.xiri-markdown' )?.innerHTML ).not.toBe( '' );
		} );
		return el;
	}

	it( 'rendert Überschriften, Listen, Tabellen und Code', async () => {
		const el = await render( '## Titel\n\n- **eins**\n- zwei\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n`code`' );
		expect( el.querySelector( 'h2' )?.textContent ).toBe( 'Titel' );
		expect( el.querySelectorAll( 'li' ).length ).toBe( 2 );
		expect( el.querySelector( 'li strong' )?.textContent ).toBe( 'eins' );
		expect( el.querySelector( 'table td' )?.textContent ).toBe( '1' );
		expect( el.querySelector( 'code' )?.textContent ).toBe( 'code' );
	} );

	it( 'entfernt Skripte, Event-Handler und javascript:-Links (Text kann von einem LLM kommen)', async () => {
		const el = await render( '<script>alert(1)</script><img src="x" onerror="alert(1)">\n\n[klick](javascript:alert(1))' );
		expect( el.querySelector( 'script, img' ) ).toBeNull();
		expect( el.querySelector( 'a' )?.getAttribute( 'href' ) ?? '' ).not.toMatch( /^javascript:/ );
	} );

	it( 'zeigt Roh-HTML als Text, Block und Inline', async () => {
		const el = await render( '<div>x</div>\n\na <b>y</b> c' );
		expect( el.querySelector( '.xiri-markdown div, .xiri-markdown b' ) ).toBeNull();
		expect( el.textContent ).toContain( '<div>x</div>' );
		expect( el.textContent ).toContain( 'a <b>y</b> c' );
	} );

	it( 'lässt nur ein nacktes <br> als Umbruch durch, etwa in Tabellenzellen', async () => {
		const el = await render( '| A |\n|---|\n| eins<br>zwei<BR/>drei |\n\nx <br onclick="alert(1)"> y' );
		expect( el.querySelectorAll( 'td br' ).length ).toBe( 2 );
		expect( el.querySelector( 'p br' ) ).toBeNull();
		expect( el.querySelector( 'p' )?.textContent ).toContain( '<br onclick="alert(1)">' );
	} );

	it( 'zeigt ohne installiertes marked den Text als Klartext', async () => {
		vi.doMock( 'marked', () => { throw new Error( 'not installed' ); } );
		const error = vi.spyOn( console, 'error' ).mockImplementation( () => undefined );
		try {
			const el = await render( '<b>x</b>\nzwei' );
			const box = el.querySelector( '.xiri-markdown' )!;
			expect( box.querySelector( 'b' ) ).toBeNull();
			expect( box.querySelector( 'br' ) ).toBeTruthy();
			expect( box.textContent ).toBe( '<b>x</b>zwei' );
			expect( error ).toHaveBeenCalled();
		} finally {
			vi.doUnmock( 'marked' );
			error.mockRestore();
		}
	} );
} );
