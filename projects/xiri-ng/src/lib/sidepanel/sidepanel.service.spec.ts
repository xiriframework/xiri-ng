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
} );
