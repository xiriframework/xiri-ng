import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DateAdapter } from '@angular/material/core';
import { de } from 'date-fns/locale/de';
import { enGB } from 'date-fns/locale/en-GB';
import { XiriLocaleService } from './locale.service';

describe( 'XiriLocaleService', () => {
	let service: XiriLocaleService;
	let dateAdapterSetLocale: ReturnType<typeof vi.fn>;
	let localStorageStore: Record<string, string>;
	let setItemSpy: ReturnType<typeof vi.fn>;
	let getItemSpy: ReturnType<typeof vi.fn>;

	beforeEach( () => {
		dateAdapterSetLocale = vi.fn();
		localStorageStore = {};
		getItemSpy = vi.fn( ( key: string ) => localStorageStore[key] ?? null );
		setItemSpy = vi.fn( ( key: string, value: string ) => {
			localStorageStore[key] = value;
		} );
		vi.stubGlobal( 'localStorage', {
			getItem: getItemSpy,
			setItem: setItemSpy,
			removeItem: vi.fn(),
			clear: vi.fn(),
			length: 0,
			key: vi.fn(),
		} );

		TestBed.configureTestingModule( {
			providers: [ { provide: DateAdapter, useValue: { setLocale: dateAdapterSetLocale } } ]
		} );
		service = TestBed.inject( XiriLocaleService );
	} );

	afterEach( () => {
		vi.unstubAllGlobals();
	} );

	it( 'Default-Sprache ist de', () => {
		expect( service.language() ).toBe( 'de' );
		expect( service.localeString() ).toBe( 'de-DE' );
	} );

	it( 'setLanguage setzt Signal, localeString und localStorage', () => {
		service.setLanguage( 'en' );
		expect( service.language() ).toBe( 'en' );
		expect( service.localeString() ).toBe( 'en-GB' );
		expect( localStorage.getItem( 'xiri-language' ) ).toBe( 'en' );
	} );

	it( 'gleicht den DateAdapter-Locale bei Sprachwechsel an', () => {
		TestBed.tick(); // initialer effect
		dateAdapterSetLocale.mockClear();
		service.setLanguage( 'en' );
		TestBed.tick();
		expect( dateAdapterSetLocale ).toHaveBeenCalledWith( enGB );
	} );

	it( 'gleicht den DateAdapter-Locale beim initialen Aufruf an (de)', () => {
		TestBed.tick();
		expect( dateAdapterSetLocale ).toHaveBeenCalledWith( de );
	} );

	it( 'ist ohne bereitgestellten DateAdapter instanziierbar und setLanguage crasht nicht', () => {
		TestBed.resetTestingModule();
		vi.stubGlobal( 'localStorage', {
			getItem: vi.fn( () => null ),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			length: 0,
			key: vi.fn(),
		} );

		TestBed.configureTestingModule( {} );
		const noAdapterService = TestBed.inject( XiriLocaleService );

		expect( noAdapterService ).toBeTruthy();
		expect( () => {
			noAdapterService.setLanguage( 'en' );
			TestBed.tick();
		} ).not.toThrow();
	} );
} );
