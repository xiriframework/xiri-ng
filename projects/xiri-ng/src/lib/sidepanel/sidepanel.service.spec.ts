import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { XiriSidepanelService } from './sidepanel.service';

describe( 'XiriSidepanelService', () => {
	let service: XiriSidepanelService;

	beforeEach( () => {
		TestBed.configureTestingModule( {} );
		service = TestBed.inject( XiriSidepanelService );
	} );

	it( 'open() liefert eine Ref, close(result) schließt und emittiert', async () => {
		const ref = service.open( { title: 'Detail', data: { x: 1 } } );
		const closed = firstValueFrom( ref.afterClosed() );
		ref.close( 'ok' );
		expect( await closed ).toBe( 'ok' );
	} );

	it( 'Escape-Taste schließt das Panel (CDK keydown dispatcher)', async () => {
		const ref = service.open( { title: 'Detail', data: { x: 1 } } );
		const closed = firstValueFrom( ref.afterClosed() );

		document.body.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Escape', keyCode: 27, bubbles: true } ) );

		await expect( closed ).resolves.toBeUndefined();
	} );

	it( 'stellt beim Schließen den Fokus auf das auslösende Element zurück', () => {
		const trigger = document.createElement( 'button' );
		document.body.appendChild( trigger );
		trigger.focus();
		expect( document.activeElement ).toBe( trigger );

		const ref = service.open( { title: 'Detail' } );

		// Simuliere, dass der Fokus in das Panel gewandert ist.
		const inside = document.createElement( 'input' );
		document.body.appendChild( inside );
		inside.focus();
		expect( document.activeElement ).not.toBe( trigger );

		ref.close();
		expect( document.activeElement ).toBe( trigger );

		trigger.remove();
		inside.remove();
	} );
} );
