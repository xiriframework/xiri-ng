import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DateAdapter } from '@angular/material/core';
import { de } from 'date-fns/locale/de';
import { enGB } from 'date-fns/locale/en-GB';
import { fr } from 'date-fns/locale/fr';
import { XiriLocaleService, XiriLanguageDefinition, XiriValidationMessages } from './locale.service';

function frMessages(): XiriValidationMessages {
	return {
		required: 'Champ requis',
		invalidFormat: 'Format invalide',
		invalidEmail: 'E-mail invalide',
		valueRequired: 'Valeur requise',
		minLength: n => `Au moins ${ n } caractères`,
		maxLength: n => `Au plus ${ n } caractères`,
		minNumber: n => `Minimum ${ n }`,
		maxNumber: n => `Maximum ${ n }`,
		minDate: d => `Pas avant ${ d }`,
		maxDate: d => `Pas après ${ d }`,
		minDateRange: d => `Début après ${ d }`,
		maxDateRange: d => `Fin avant ${ d }`,
		minSelection: n => `Au moins ${ n }`,
		maxSelection: n => `Au plus ${ n }`,
	};
}

const frDef: XiriLanguageDefinition = { localeString: 'fr-FR', dateFnsLocale: fr, validationMessages: frMessages() };

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

	describe( 'client-erweiterbare Sprachen', () => {
		it( 'registerLanguage + setLanguage schaltet auf eine Custom-Sprache', () => {
			service.registerLanguage( 'fr', frDef );
			service.setLanguage( 'fr' );

			expect( service.language() ).toBe( 'fr' );
			expect( service.localeString() ).toBe( 'fr-FR' );
			expect( service.validationMessagesFor().required ).toBe( 'Champ requis' );
			expect( localStorage.getItem( 'xiri-language' ) ).toBe( 'fr' );
		} );

		it( 'gleicht den DateAdapter-Locale auf das Custom-date-fns-Locale an', () => {
			service.registerLanguage( 'fr', frDef );
			TestBed.tick();
			dateAdapterSetLocale.mockClear();

			service.setLanguage( 'fr' );
			TestBed.tick();
			expect( dateAdapterSetLocale ).toHaveBeenCalledWith( fr );
		} );

		it( 'setLanguage auf unregistrierte Sprache warnt und wechselt nicht', () => {
			const warn = vi.spyOn( console, 'warn' ).mockImplementation( () => undefined );

			service.setLanguage( 'xx' );

			expect( service.language() ).toBe( 'de' );
			expect( warn ).toHaveBeenCalled();
			warn.mockRestore();
		} );

		it( 'klinkt eine über localStorage persistierte Custom-Sprache bei (Nach-)Registrierung ein', () => {
			localStorageStore[ 'xiri-language' ] = 'fr'; // vor Registrierung persistiert (z. B. aus vorherigem Reload)
			expect( service.language() ).toBe( 'de' ); // Konstruktor kennt nur de/en → bleibt de

			service.registerLanguage( 'fr', frDef );
			expect( service.language() ).toBe( 'fr' );
		} );
	} );

	describe( 'Zeitzone + Datumsformatierung', () => {
		it( 'unixToLocal gibt null für null/undefined', () => {
			expect( service.unixToLocal( null as unknown as number ) ).toBeNull();
			expect( service.unixToLocal( undefined as unknown as number ) ).toBeNull();
		} );

		it( 'unixToLocal wandelt einen Unix-Timestamp in ein Date', () => {
			expect( service.unixToLocal( 1700000000 ) ).toBeInstanceOf( Date );
		} );

		it( 'setTimezone beeinflusst die Umrechnung', () => {
			service.setTimezone( 'Europe/Vienna' );
			const vienna = service.unixToLocal( 1704067200 );
			service.setTimezone( 'America/New_York' );
			const newYork = service.unixToLocal( 1704067200 );
			expect( vienna!.getHours() ).not.toBe( newYork!.getHours() );
		} );

		it( 'unixToStringDateTime formatiert yyyy-MM-dd HH:mm zeitzonengerecht', () => {
			service.setTimezone( 'UTC' );
			expect( service.unixToStringDateTime( 1705321800 ) ).toBe( '2024-01-15 12:30' );
		} );

		it( 'dateToUnix wandelt ein Date in einen ganzzahligen Unix-Timestamp', () => {
			service.setTimezone( 'UTC' );
			const result = service.dateToUnix( new Date( '2024-01-15T12:30:45.123Z' ) );
			expect( result ).toBe( Math.floor( result ) );
			expect( result ).toBeGreaterThan( 0 );
		} );

		it( 'Monatsnamen folgen der aktiven Sprache', () => {
			service.setTimezone( 'UTC' );
			const march = 1710504000; // 2024-03-15 12:00 UTC
			service.setLanguage( 'de' );
			expect( service.unixToStringDate( march ) ).toContain( 'Mär' );
			service.setLanguage( 'en' );
			const en = service.unixToStringDate( march );
			expect( en ).toContain( 'Mar' );
			expect( en ).not.toContain( 'Mär' );
		} );
	} );

	describe( 'Zahlenformatierung folgt der Sprache', () => {
		it( 'formatiert mit deutschen Trennzeichen (Default de)', () => {
			expect( service.formatNumber( 1234.56 ) ).toBe( '1.234,56' );
		} );

		it( 'formatiert mit englischen Trennzeichen nach setLanguage(en)', () => {
			service.setLanguage( 'en' );
			expect( service.formatNumber( 1234.56, 'float2' ) ).toBe( '1,234.56' );
		} );

		it( 'respektiert integer- und float-Webformate', () => {
			expect( service.formatNumber( 1234.56, 'integer' ) ).toBe( '1.235' );
			expect( service.formatNumber( 5, 'float1' ) ).toBe( '5,0' );
			expect( service.formatNumber( 1.999, 'float2' ) ).toBe( '2,00' );
		} );

		it( 'gibt leeren String für null/undefined', () => {
			expect( service.formatNumber( null as unknown as number ) ).toBe( '' );
			expect( service.formatNumber( undefined as unknown as number ) ).toBe( '' );
		} );
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
