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
		expect( el.querySelector( 'script' ) ).toBeNull();
		expect( el.querySelector( 'img' )?.getAttribute( 'onerror' ) ).toBeNull();
		expect( el.querySelector( 'a' )?.getAttribute( 'href' ) ?? '' ).not.toMatch( /^javascript:/ );
	} );
} );
