import { TestBed } from '@angular/core/testing';
import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { provideRouter, Router, withRouterConfig } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { XiriSidepanelRef } from './sidepanel-ref';
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

@Component( { template: '' } )
class EmptyRouteComponent {
}

// Öffnet das Panel beim Aktivieren der Route – simuliert einen Deep-Link auf ein Detail.
@Component( { template: '' } )
class OpensPanelRouteComponent {
	static ref: XiriSidepanelRef | null = null;

	constructor() {
		OpensPanelRouteComponent.ref = inject( XiriSidepanelService ).open( { title: 'Deep-Link' } );
	}
}

describe( 'XiriSidepanelService – Navigation', () => {
	let service: XiriSidepanelService;
	let harness: RouterTestingHarness;

	beforeEach( async () => {
		TestBed.configureTestingModule( {
			providers: [ provideRouter( [
				{ path: 'a', component: EmptyRouteComponent },
				{ path: 'b', component: EmptyRouteComponent },
				{ path: 'deep', component: OpensPanelRouteComponent },
			], withRouterConfig( { onSameUrlNavigation: 'reload' } ) ) ]
		} );
		harness = await RouterTestingHarness.create( '/a' );
		service = TestBed.inject( XiriSidepanelService );
	} );

	it( 'schließt bei Navigation und emittiert afterClosed', async () => {
		const ref = service.open( { title: 'Detail' } );
		let completed = false;
		ref.afterClosed().subscribe( { complete: () => completed = true } );

		await harness.navigateByUrl( '/b' );

		expect( completed ).toBe( true );
		expect( document.querySelector( 'xiri-sidepanel' ) ).toBeNull();
	} );

	it( 'schließt auch, wenn sich nur Query-Params ändern', async () => {
		const ref = service.open( { title: 'Detail' } );
		let completed = false;
		ref.afterClosed().subscribe( { complete: () => completed = true } );

		await harness.navigateByUrl( '/a?id=2' );

		expect( completed ).toBe( true );
	} );

	it( 'schließt beim Zurück-Button (popstate)', async () => {
		await harness.navigateByUrl( '/b' );
		const ref = service.open( { title: 'Detail' } );
		let completed = false;
		ref.afterClosed().subscribe( { complete: () => completed = true } );

		TestBed.inject( Location ).back();
		await harness.fixture.whenStable();

		expect( completed ).toBe( true );
	} );

	// Wie XiriResponseHandlerService bei refresh: page – gleiche URL, Router schreibt sie per replaceState neu.
	it( 'schließt auch bei Refresh (Navigation auf dieselbe URL)', async () => {
		const ref = service.open( { title: 'Detail' } );
		let completed = false;
		ref.afterClosed().subscribe( { complete: () => completed = true } );

		const router = TestBed.inject( Router );
		await router.navigate( [ router.url ] );

		expect( completed ).toBe( true );
	} );

	it( 'gibt beim Schließen durch Navigation den Fokus zurück', async () => {
		const trigger = document.createElement( 'button' );
		document.body.appendChild( trigger );
		trigger.focus();

		service.open( { title: 'Detail' } );
		const inside = document.createElement( 'input' );
		document.body.appendChild( inside );
		inside.focus();

		await harness.navigateByUrl( '/b' );

		expect( document.activeElement ).toBe( trigger );
		trigger.remove();
		inside.remove();
	} );

	it( 'close() nach dem Schließen durch Navigation emittiert nicht erneut', async () => {
		const ref = service.open( { title: 'Detail' } );
		const emitted: unknown[] = [];
		ref.afterClosed().subscribe( v => emitted.push( v ) );

		await harness.navigateByUrl( '/b' );
		expect( () => ref.close( 'spät' ) ).not.toThrow();

		expect( emitted ).toEqual( [ undefined ] );
	} );

	it( 'bleibt offen, wenn es beim Aktivieren der Ziel-Route geöffnet wird (Deep-Link)', async () => {
		await harness.navigateByUrl( '/deep' );

		let completed = false;
		OpensPanelRouteComponent.ref!.afterClosed().subscribe( { complete: () => completed = true } );
		expect( completed ).toBe( false );
		expect( document.querySelector( 'xiri-sidepanel' ) ).not.toBeNull();

		OpensPanelRouteComponent.ref!.close();
	} );
} );
