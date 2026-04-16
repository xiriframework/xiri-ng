import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { XiriResponseHandlerService } from './response-handler.service';


describe( 'XiriResponseHandlerService', () => {
	let service: XiriResponseHandlerService;
	let router: { navigate: ReturnType<typeof vi.fn>; url: string };

	beforeEach( () => {
		router = {
			navigate: vi.fn().mockResolvedValue( true ),
			url: '/current',
		};
		TestBed.configureTestingModule( {
			providers: [
				XiriResponseHandlerService,
				{ provide: Router, useValue: router },
			],
		} );
		service = TestBed.inject( XiriResponseHandlerService );
	} );

	it( 'does nothing on null/undefined result', () => {
		service.handle( null );
		service.handle( undefined );
		expect( router.navigate ).not.toHaveBeenCalled();
	} );

	it( 'navigates to current url on refresh page', () => {
		service.handle( { refresh: 'page' } );
		expect( router.navigate ).toHaveBeenCalledWith( [ '/current' ] );
	} );

	it( 'accepts legacy "page":"refresh" form', () => {
		service.handle( { page: 'refresh' } );
		expect( router.navigate ).toHaveBeenCalledWith( [ '/current' ] );
	} );

	it( 'invokes onTableRefresh and does NOT navigate when callback is registered', () => {
		const onTableRefresh = vi.fn();
		service.handle( { refresh: 'table' }, { onTableRefresh } );
		expect( onTableRefresh ).toHaveBeenCalledTimes( 1 );
		expect( router.navigate ).not.toHaveBeenCalled();
	} );

	it( 'falls back to router.navigate when refresh:table without callback', () => {
		service.handle( { refresh: 'table' } );
		expect( router.navigate ).toHaveBeenCalledWith( [ '/current' ] );
	} );

	it( 'navigates to goto url', () => {
		service.handle( { goto: '/other' } );
		expect( router.navigate ).toHaveBeenCalledWith( [ '/other' ] );
	} );

	it( 'calls onTableUpdate with id/field/content', () => {
		const onTableUpdate = vi.fn();
		service.handle( { update: 'table', id: 7, field: 'name', content: 'X' }, { onTableUpdate } );
		expect( onTableUpdate ).toHaveBeenCalledWith( 7, 'name', 'X' );
		expect( router.navigate ).not.toHaveBeenCalled();
	} );
} );
