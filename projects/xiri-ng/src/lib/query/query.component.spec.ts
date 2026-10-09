import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import { XiriQueryComponent, XiriQueryResultCount, XiriQuerySettings } from './query.component';
import { XiriButton, XiriButtonComponent } from '../button/button.component';
import { XiriDataService } from '../services/data.service';
import { XiriFormService } from '../services/form.service';
import { XiriSessionStorageService } from '../services/sessionStorage.service';
import { MatExpansionPanel } from '@angular/material/expansion';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { XIRI_PANEL_HOST } from '../services/response-handler.service';
import { XiriCardComponent } from '../card/card.component';

function stubLocalStorage(): void {
	const store: Record<string, string> = {};
	vi.stubGlobal( 'localStorage', {
		getItem: vi.fn( ( key: string ) => store[ key ] ?? null ),
		setItem: vi.fn( ( key: string, value: string ) => { store[ key ] = value; } ),
		removeItem: vi.fn(),
		clear: vi.fn(),
		length: 0,
		key: vi.fn(),
	} );
}

@Component( {
	selector: 'xiri-query-test-host',
	template: `<xiri-query [settings]="settings()" [count]="count()" (filterChange)="onChange($event)" />`,
	imports: [ XiriQueryComponent ],
} )
class TestHostComponent {
	settings = signal<XiriQuerySettings>( {
		fields: [
			{ id: 'search', type: 'text', value: '' },
		],
	} );
	count = signal<XiriQueryResultCount | null>( null );
	query = viewChild.required( XiriQueryComponent );
	changeEvents: ( Record<string, unknown> | null )[] = [];
	onChange( event: Record<string, unknown> | null ) {
		this.changeEvents.push( event );
	}
}

describe( 'XiriQueryComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let component: XiriQueryComponent;
	let mockDataService: {
		get: ReturnType<typeof vi.fn>;
		post: ReturnType<typeof vi.fn>;
	};
	let mockFormService: {
		loadState: ReturnType<typeof vi.fn>;
		saveState: ReturnType<typeof vi.fn>;
	};
	let mockStorage: {
		set: ReturnType<typeof vi.fn>;
		getTimeout: ReturnType<typeof vi.fn>;
	};

	function initMocks() {
		mockStorage = {
			set: vi.fn(),
			getTimeout: vi.fn().mockReturnValue( null ),
		};
		mockDataService = {
			get: vi.fn().mockReturnValue( of( {} ) ),
			post: vi.fn().mockReturnValue( of( {} ) ),
		};
		mockFormService = {
			loadState: vi.fn().mockImplementation( ( _id: string | null, fields: unknown ) => fields ),
			saveState: vi.fn(),
		};
	}

	function createFixture( settings?: XiriQuerySettings ) {
		TestBed.resetTestingModule();
		stubLocalStorage();
		TestBed.configureTestingModule( {
			imports: [ TestHostComponent ],
			providers: [
				{ provide: XiriDataService, useValue: mockDataService },
				{ provide: XiriFormService, useValue: mockFormService },
				{ provide: XiriSessionStorageService, useValue: mockStorage },
			],
		} );

		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		if ( settings ) {
			host.settings.set( settings );
		}
		fixture.detectChanges();
		component = host.query();
	}

	beforeEach( () => {
		initMocks();
		createFixture();
	} );

	afterEach( () => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	} );

	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );

	it( 'should initialize form fields from settings', () => {
		expect( component.formFields() ).toBeTruthy();
		expect( component.formFields()!.length ).toBe( 1 );
	} );

	describe( 'ngOnInit', () => {
		it( 'should set dynData from dyn settings', () => {
			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				dyn: [ { type: 'card', data: {} } ],
			} );

			expect( component.dynData.data ).toBeTruthy();
			expect( component.dynData.data!.length ).toBe( 1 );
		} );

		it( 'should not set dynData when dyn is undefined', () => {
			expect( component.dynData.data ).toBeNull();
		} );

		it( 'should not set dynData when dyn is empty array', () => {
			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				dyn: [],
			} );

			expect( component.dynData.data ).toBeNull();
		} );

		it( 'should call formService.loadState', () => {
			expect( mockFormService.loadState ).toHaveBeenCalled();
		} );

		it( 'should set extra from settings', () => {
			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				extra: { token: '123' },
			} );

			expect( ( component as unknown as { extra: unknown } ).extra ).toEqual( { token: '123' } );
		} );
	} );

	describe( 'formChanged', () => {
		it( 'should emit immediately on first valid change', () => {
			// Reset the initial change state to test the first-emit path
			( component as unknown as { _initialChangeDone: boolean } )._initialChangeDone = false;
			host.changeEvents = [];

			component.formChanged( { valid: true, value: { search: 'test' } } );

			expect( host.changeEvents.length ).toBe( 1 );
		} );

		it( 'should debounce subsequent changes', () => {
			vi.useFakeTimers();
			component.formChanged( { valid: true, value: { search: 'first' } } );
			host.changeEvents = [];

			component.formChanged( { valid: true, value: { search: 'second' } } );
			expect( host.changeEvents.length ).toBe( 0 );

			vi.advanceTimersByTime( 350 );
			expect( host.changeEvents.length ).toBe( 1 );
		} );

		it( 'should emit null on invalid form', () => {
			vi.useFakeTimers();
			component.formChanged( { valid: true, value: { search: 'init' } } );
			host.changeEvents = [];

			component.formChanged( { valid: false, value: null } );
			vi.advanceTimersByTime( 350 );

			expect( host.changeEvents[ host.changeEvents.length - 1 ] ).toBeNull();
		} );

		it( 'should merge extra with form values', () => {
			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				extra: { base: 'value' },
			} );

			component.formChanged( { valid: true, value: { f: 'test' } } );

			expect( component.filterData() ).toEqual( { base: 'value', f: 'test' } );
		} );

		it( 'should use only extra when value is not an object', () => {
			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				extra: { base: 'value' },
			} );

			component.formChanged( { valid: true, value: null } );
			expect( component.filterData() ).toEqual( { base: 'value' } );
		} );

		// Sind alle Controls disabled, ist die FormGroup selbst DISABLED (valid false, invalid false).
		// Ein Filter nur aus gesperrten Feldern muss trotzdem initial laden und Folgeereignisse
		// über den Debounce-Pfad durchreichen.
		it( 'lädt initial, wenn alle Filterfelder disabled sind', async () => {
			createFixture( { fields: [ { id: 'x', type: 'text', value: 'v', disabled: true } ] } );
			await fixture.whenStable();
			fixture.detectChanges();

			expect( component.formValid() ).toBe( true );
			expect( host.changeEvents.length ).toBe( 1 );
		} );

		// Sichtbares disabled Feld plus per showWhen verstecktes Feld: komplett disabled Gruppe, Angular
		// liefert den Rohwert. Der veraltete versteckte Wert darf nicht in die Filterdaten.
		it( 'filtert bei komplett disabled Gruppe nicht mit versteckten Werten', async () => {
			createFixture( { fields: [
				{ id: 'kind', type: 'text', value: 'standard', disabled: true },
				{ id: 'details', type: 'text', value: 'stale', showWhen: { field: 'kind', operator: 'equals', value: 'special' } },
			] } );
			await fixture.whenStable();
			fixture.detectChanges();

			expect( host.changeEvents ).toEqual( [ {} ] );
		} );

		it( 'reicht ein DISABLED-Formular auch über den Debounce-Pfad durch', () => {
			vi.useFakeTimers();
			createFixture( { fields: [ { id: 'x', type: 'text', value: 'v', disabled: true } ] } );
			vi.advanceTimersByTime( 400 );
			const before = host.changeEvents.length;

			// Zweites Ereignis, wie es die FormGroup liefert: valid false, disabled true. Der
			// Ungültig-Zweig würde null emittieren, der Gültig-Zweig die Filterwerte.
			component.formChanged( { valid: false, disabled: true, value: { x: 'v' } } );
			vi.advanceTimersByTime( 400 );

			expect( host.changeEvents.length ).toBe( before + 1 );
			expect( host.changeEvents.at( -1 ) ).toEqual( {} );
		} );

		it( 'lädt nicht initial, wenn ein Pflichtfeld invalid ist', async () => {
			createFixture( { fields: [ { id: 'x', type: 'text', value: '', required: true } ] } );
			await fixture.whenStable();
			fixture.detectChanges();

			expect( component.formValid() ).toBe( false );
			expect( host.changeEvents.length ).toBe( 0 );
		} );

		it( 'should update formValid signal', () => {
			component.formChanged( { valid: true, value: {} } );
			expect( component.formValid() ).toBe( true );

			component.formChanged( { valid: false, value: {} } );
			expect( component.formValid() ).toBe( false );
		} );

		it( 'should save state when saveState is true', () => {
			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				saveState: true,
				saveStateId: 'test-id',
			} );

			component.formChanged( { valid: true, value: { f: 'saved' } } );

			expect( mockFormService.saveState ).toHaveBeenCalledWith( 'test-id:filter', { f: 'saved' } );
		} );
	} );

	describe( 'URL loading', () => {
		it( 'should load data from URL on first valid change', () => {
			mockDataService.post.mockReturnValue( of( { data: [ { type: 'card' } ] } ) );

			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				url: 'search/results',
			} );

			component.formChanged( { valid: true, value: { f: 'test' } } );

			expect( mockDataService.post ).toHaveBeenCalled();
		} );

		it( 'should set data signal from response array', () => {
			mockDataService.post.mockReturnValue( of( { data: [ { type: 'card', data: {} } ] } ) );

			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				url: 'search/results',
			} );

			component.formChanged( { valid: true, value: { f: 'test' } } );

			expect( component.data() ).toBeTruthy();
			expect( component.data()!.length ).toBe( 1 );
		} );

		it( 'should wrap non-array response in array', () => {
			mockDataService.post.mockReturnValue( of( { data: { type: 'card', data: {} } } ) );

			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				url: 'search/results',
			} );

			component.formChanged( { valid: true, value: { f: 'test' } } );

			expect( Array.isArray( component.data() ) ).toBe( true );
		} );

		// Zwei Loads kurz hintereinander sind normal, sobald ein abhängiges Feld seine Optionen
		// nachlädt und dabei einen ungültig gewordenen Filterwert verwirft. Die späte Antwort des
		// überholten Requests darf die neuere nicht überschreiben.
		it( 'should ignore the response of a superseded request', () => {
			vi.useFakeTimers();

			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				url: 'search/results',
			} );

			const first = new Subject<unknown>();
			const second = new Subject<unknown>();
			mockDataService.post.mockReset();
			mockDataService.post.mockReturnValueOnce( first ).mockReturnValueOnce( second );

			component.formChanged( { valid: true, value: { f: 'a' } } );
			vi.advanceTimersByTime( 300 );
			component.formChanged( { valid: true, value: { f: 'b' } } );
			vi.advanceTimersByTime( 300 );

			expect( mockDataService.post ).toHaveBeenCalledTimes( 2 );

			second.next( { data: [ { type: 'card', data: { n: 2 } } ] } );
			first.next( { data: [ { type: 'card', data: { n: 1 } } ] } );

			expect( component.data() ).toEqual( [ { type: 'card', data: { n: 2 } } ] );
		} );

		it( 'should set error on null response', () => {
			mockDataService.post.mockReturnValue( of( null ) );

			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				url: 'search/results',
			} );

			component.formChanged( { valid: true, value: { f: 'test' } } );

			expect( component.error() ).toBe( 'Unknown Error' );
		} );

		it( 'should handle 404 error', () => {
			mockDataService.post.mockReturnValue( throwError( () => ( { status: 404 } ) ) );

			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				url: 'search/results',
			} );

			component.formChanged( { valid: true, value: { f: 'test' } } );

			expect( component.error() ).toBe( 'Page not found' );
		} );

		it( 'should handle 401 error', () => {
			mockDataService.post.mockReturnValue( throwError( () => ( { status: 401 } ) ) );

			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				url: 'search/results',
			} );

			component.formChanged( { valid: true, value: { f: 'test' } } );

			expect( component.error() ).toBe( 'No permission to view page' );
		} );

		it( 'should handle 403 error', () => {
			mockDataService.post.mockReturnValue( throwError( () => ( { status: 403 } ) ) );

			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				url: 'search/results',
			} );

			component.formChanged( { valid: true, value: { f: 'test' } } );

			expect( component.error() ).toBe( 'Access denied' );
		} );

		it( 'should handle 500 error', () => {
			mockDataService.post.mockReturnValue( throwError( () => ( { status: 500 } ) ) );

			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				url: 'search/results',
			} );

			component.formChanged( { valid: true, value: { f: 'test' } } );

			expect( component.error() ).toBe( 'Internal Error' );
		} );

		it( 'should handle unknown error status', () => {
			mockDataService.post.mockReturnValue( throwError( () => ( { status: 999 } ) ) );

			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				url: 'search/results',
			} );

			component.formChanged( { valid: true, value: { f: 'test' } } );

			expect( component.error() ).toBe( 'Unknown Error' );
		} );
	} );

	describe( 'clickedButton', () => {
		it( 'should set data and clear error on done result', () => {
			const result = [ { type: 'card', data: {} } ];
			component.clickedButton( {
				loading: false,
				done: true,
				result: result,
				button: {} as XiriButton,
			} );

			expect( component.data() ).toBe( result );
			expect( component.error() ).toBeNull();
		} );

		it( 'should clear data when not done', () => {
			component.clickedButton( {
				loading: true,
				done: false,
				result: null,
				button: {} as XiriButton,
			} );

			expect( component.data() ).toBeNull();
			expect( component.loading() ).toBe( true );
		} );

		it( 'should set loading state', () => {
			component.clickedButton( {
				loading: true,
				done: false,
				result: null,
				button: {} as XiriButton,
			} );
			expect( component.loading() ).toBe( true );

			component.clickedButton( {
				loading: false,
				done: true,
				result: [],
				button: {} as XiriButton,
			} );
			expect( component.loading() ).toBe( false );
		} );
	} );

	describe( 'stale-while-revalidate', () => {
		it( 'should keep old data and set loading while a reload is pending', () => {
			mockDataService.post.mockReturnValue( of( { data: [ { type: 'card', data: {} } ] } ) );

			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				url: 'search/results',
			} );

			component.formChanged( { valid: true, value: { f: 'a' } } );
			expect( component.data() ).toBeTruthy();

			const pending = new Subject<unknown>();
			mockDataService.post.mockReturnValue( pending.asObservable() );
			component.retry();

			// Old data must stay visible (no empty flash) while the request is in flight.
			expect( component.data() ).toBeTruthy();
			expect( component.loading() ).toBe( true );

			pending.next( { data: [ { type: 'card', data: {} } ] } );
			expect( component.loading() ).toBe( false );
		} );
	} );

	// Wird der Filter ungültig, leert der Debounce das Ergebnis; ein noch laufender Load (Tippen, Retry, reloadPanel)
	// darf es danach nicht zurückbringen.
	describe( 'ungültiger Filter während eines Loads', () => {
		it( 'verwirft die Antwort eines laufenden Loads, sobald der Filter ungültig geworden ist', () => {
			vi.useFakeTimers();
			const pending = new Subject<unknown>();
			mockDataService.post.mockReturnValue( pending.asObservable() );
			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				url: 'search/results',
			} );
			component.formChanged( { valid: true, value: { f: 'a' } } );
			expect( component.loading() ).toBe( true );

			component.formChanged( { valid: false, value: null } );
			vi.advanceTimersByTime( 350 );
			pending.next( { data: [ { type: 'card', data: {} } ] } );

			expect( component.data() ).toBeNull();
			expect( component.loading() ).toBe( false );
		} );
	} );

	describe( 'retry', () => {
		it( 'should show a retry button on error and re-load on click', () => {
			mockDataService.post.mockReturnValue( throwError( () => ( { status: 500 } ) ) );

			createFixture( {
				fields: [ { id: 'f', type: 'text', value: '' } ],
				url: 'search/results',
			} );

			component.formChanged( { valid: true, value: { f: 'test' } } );
			fixture.detectChanges();

			const btn = fixture.nativeElement.querySelector( '[data-testid="query-retry"]' ) as HTMLButtonElement;
			expect( btn ).toBeTruthy();

			const callsBefore = mockDataService.post.mock.calls.length;
			btn.click();
			expect( mockDataService.post.mock.calls.length ).toBe( callsBefore + 1 );
		} );
	} );

	// Filter rendern dieselbe xiri-form-fields-Komponente wie Formulare, erben also das
	// Nachladen abhängiger Felder. Hier zählt das Zusammenspiel: Reload-Request und
	// Filter-Request dürfen sich nicht in die Quere kommen.
	describe( 'reloadOn in filters', () => {

		const RELOAD_URL = '/Thing/FormReload';

		function postsTo( url: string ) {
			return mockDataService.post.mock.calls.filter( ( call: unknown[] ) => call[ 0 ] === url );
		}

		it( 'reloads the dependent filter field without disturbing the filter request', () => {
			vi.useFakeTimers();
			mockDataService.post.mockImplementation( ( url: string ) =>
				of( url === RELOAD_URL
				    ? { fields: { status: { list: [ { id: 2, name: 'Erledigt' } ] } } }
				    : { data: [ { type: 'card', data: {} } ] } ) );

			createFixture( {
				fields: [
					{ id: 'kind', type: 'text', name: 'Art', value: '' },
					{
						id: 'status', type: 'select', name: 'Status', value: 1, required: false, search: false,
						list: [ { id: 1, name: 'Offen' }, { id: 2, name: 'Erledigt' } ],
						reloadOn: [ 'kind' ], reloadUrl: RELOAD_URL,
					},
				],
				url: 'search/results',
			} );
			vi.advanceTimersByTime( 400 );

			expect( postsTo( RELOAD_URL ).length ).toBe( 1 );
			expect( postsTo( RELOAD_URL )[ 0 ][ 1 ] ).toEqual( { kind: '' } );
			expect( postsTo( 'search/results' ).length ).toBeGreaterThan( 0 );

			// Wert 1 gibt es nicht mehr -> verworfen, und die Tabelle sieht den neuen Filter.
			expect( component.filterData() ).toEqual( { kind: '', status: null } );
		} );

		it( 'refreshes an active-filter chip when the patch renames an option', () => {
			vi.useFakeTimers();
			mockDataService.post.mockImplementation( ( url: string ) =>
				of( url === RELOAD_URL
				    ? { fields: { status: { list: [ { id: 1, name: 'Offen (neu)' } ] } } }
				    : { data: [] } ) );

			createFixture( {
				fields: [
					{ id: 'kind', type: 'text', name: 'Art', value: '' },
					{
						id: 'status', type: 'select', name: 'Status', value: 1, required: false, search: false,
						list: [ { id: 1, name: 'Offen' } ],
						reloadOn: [ 'kind' ], reloadUrl: RELOAD_URL,
					},
				],
				showActiveFilters: true,
			} );
			vi.advanceTimersByTime( 400 );

			expect( component.activeFilters().find( f => f.id === 'status' )?.value ).toBe( 'Offen (neu)' );
		} );
	} );

	describe( 'active filters', () => {
		it( 'should expose active filters with readable label and formatted value', async () => {
			createFixture( {
				fields: [
					{ id: 'search', type: 'text', name: 'Suchbegriff', value: 'Hydraulik' },
					{ id: 'status', type: 'select', name: 'Status', value: 2, required: false, list: [
						{ id: 1, name: 'Offen' },
						{ id: 2, name: 'Erledigt' },
					] },
				],
				showActiveFilters: true,
			} );
			await fixture.whenStable();
			fixture.detectChanges();

			const filters = component.activeFilters();
			expect( filters.length ).toBe( 2 );
			expect( filters[ 0 ] ).toEqual( { id: 'search', label: 'Suchbegriff', value: 'Hydraulik' } );
			expect( filters.find( f => f.id === 'status' )?.value ).toBe( 'Erledigt' );
		} );

		it( 'should not list empty fields as active filters', async () => {
			createFixture( {
				fields: [ { id: 'search', type: 'text', name: 'Suchbegriff', value: '' } ],
				showActiveFilters: true,
			} );
			await fixture.whenStable();
			fixture.detectChanges();

			expect( component.activeFilters().length ).toBe( 0 );
		} );

		it( 'should render removable chips in the DOM when showActiveFilters is set', async () => {
			createFixture( {
				fields: [ { id: 'search', type: 'text', name: 'Suchbegriff', value: 'Hydraulik' } ],
				showActiveFilters: true,
			} );
			await fixture.whenStable();
			fixture.detectChanges();

			const chip = fixture.nativeElement.querySelector( '[data-testid="query-filter-chip"]' );
			expect( chip ).toBeTruthy();
			expect( chip.textContent ).toContain( 'Suchbegriff' );
			expect( chip.textContent ).toContain( 'Hydraulik' );
		} );

		it( 'removing a chip clears the field and triggers the same filter flow as apply', async () => {
			vi.useFakeTimers();
			createFixture( {
				fields: [ { id: 'search', type: 'text', name: 'Suchbegriff', value: 'Hydraulik' } ],
				showActiveFilters: true,
			} );
			await vi.runOnlyPendingTimersAsync();
			fixture.detectChanges();

			expect( component.activeFilters().length ).toBe( 1 );
			host.changeEvents = [];

			component.removeFilter( 'search' );

			// Field value cleared immediately, chip gone.
			const field = component.formFields()!.find( f => f.id === 'search' )!;
			expect( field.control!.value ).toBe( '' );
			expect( component.activeFilters().length ).toBe( 0 );

			// The filter flow runs (debounced) just like editing/applying the form.
			vi.advanceTimersByTime( 350 );
			expect( host.changeEvents.length ).toBeGreaterThan( 0 );
		} );

		it( 'reset clears all filters and triggers the filter flow', async () => {
			vi.useFakeTimers();
			createFixture( {
				fields: [
					{ id: 'search', type: 'text', name: 'Suchbegriff', value: 'Hydraulik' },
					{ id: 'ref', type: 'text', name: 'Referenz', value: 'A-100' },
				],
				showActiveFilters: true,
			} );
			await vi.runOnlyPendingTimersAsync();
			fixture.detectChanges();

			expect( component.activeFilters().length ).toBe( 2 );
			host.changeEvents = [];

			component.resetFilters();

			expect( component.activeFilters().length ).toBe( 0 );
			vi.advanceTimersByTime( 350 );
			expect( host.changeEvents.length ).toBeGreaterThan( 0 );
		} );
	} );

	describe( 'result count', () => {
		it( 'should display the result count when showResultCount is set', async () => {
			createFixture( {
				fields: [ { id: 'search', type: 'text', value: '' } ],
				showResultCount: true,
			} );
			host.count.set( { filtered: 12, total: 40 } );
			await fixture.whenStable();
			fixture.detectChanges();

			const el = fixture.nativeElement.querySelector( '[data-testid="query-result-count"]' );
			expect( el ).toBeTruthy();
			expect( el.textContent ).toContain( '12' );
			expect( el.textContent ).toContain( '40' );
		} );

		it( 'should not render the count when showResultCount is not set', async () => {
			host.count.set( { filtered: 12 } );
			await fixture.whenStable();
			fixture.detectChanges();

			expect( fixture.nativeElement.querySelector( '[data-testid="query-result-count"]' ) ).toBeNull();
		} );
	} );

	describe( 'collapsed panel', () => {
		const fields = [ { id: 'search', type: 'text', value: '' } ];

		function panel(): MatExpansionPanel | null {
			const de = fixture.debugElement.query( By.directive( MatExpansionPanel ) );
			return de ? de.componentInstance as MatExpansionPanel : null;
		}

		it( 'should render no panel when collapsed is absent', () => {
			createFixture( { fields } );

			expect( panel() ).toBeNull();
		} );

		it( 'should start collapsed when the backend says so', () => {
			createFixture( { fields, collapsed: true } );

			expect( panel()?.expanded ).toBe( false );
		} );

		it( 'should restore the stored panel state over the backend default', () => {
			mockStorage.getTimeout.mockReturnValue( false );
			createFixture( { fields, collapsed: true, saveStateId: 'devices' } );

			expect( mockStorage.getTimeout ).toHaveBeenCalledWith( 'devices:collapsed', 3600 );
			expect( panel()?.expanded ).toBe( true );
		} );

		it( 'should persist the panel state when the user toggles it', () => {
			createFixture( { fields, collapsed: true, saveStateId: 'devices' } );

			panel()!.open();
			fixture.detectChanges();

			expect( mockStorage.set ).toHaveBeenCalledWith( 'devices:collapsed', false );
		} );

		it( 'should not persist without a saveStateId', () => {
			createFixture( { fields, collapsed: true } );

			panel()!.open();
			fixture.detectChanges();

			expect( mockStorage.set ).not.toHaveBeenCalled();
		} );

		// Only real toggles are written — the initial render must not refresh a stored state.
		it( 'should not persist on the initial render', () => {
			createFixture( { fields, collapsed: false, saveStateId: 'devices' } );

			expect( mockStorage.set ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'initial state', () => {
		it( 'should have null data initially', () => {
			expect( component.data() ).toBeNull();
		} );

		it( 'should have null error initially', () => {
			expect( component.error() ).toBeNull();
		} );

		it( 'should have true formValid initially', () => {
			expect( component.formValid() ).toBe( true );
		} );

		it( 'should not be loading initially', () => {
			expect( component.loading() ).toBe( false );
		} );
	} );
} );

// Integrationsebene: echter xiri-button im Query-Ergebnis, echter Handler und Router. Das Ergebnis-Template ist wie
// beim dyncomponent außerhalb der Query deklariert; die Query reicht ihren Injector durch und ist so Panel-Host.
@Component( {
	selector: 'xiri-query-result-host',
	template: `<xiri-query [settings]="settings()" [dyncomponent]="result" />
		<ng-template #result>
			@if (inCard()) {
				<xiri-card [settings]="{ header: 'Karte', buttonsTop: { class: '', buttons: [ button ] } }" />
			} @else {
				<xiri-button [button]="button" />
			}
		</ng-template>`,
	imports: [ XiriQueryComponent, XiriButtonComponent, XiriCardComponent ],
} )
class ResultHostComponent {
	// Ergebnis = Card ohne url mit dem Button im Kopf: Die Card reicht refresh:'panel' per skipSelf weiter.
	inCard = signal( false );
	settings = signal<XiriQuerySettings>( { fields: [ { id: 'f', type: 'text', value: '' } ], url: 'search/results' } );
	button: XiriButton = { text: 'Erledigt', type: 'raised', action: 'api', url: '/row/done' };
	query = viewChild.required( XiriQueryComponent );
}

describe( 'XiriQueryComponent als Panel-Host (echter xiri-button im Ergebnis)', () => {
	let fixture: ComponentFixture<ResultHostComponent>;
	let post: ReturnType<typeof vi.fn>;
	let navigate: ReturnType<typeof vi.spyOn>;

	// outer: Panel-Host um die Query herum (wie eine umschließende Card), am Host-Element der Test-Komponente.
	function setup( settings?: XiriQuerySettings, outer?: { reloadPanel: ReturnType<typeof vi.fn> } ) {
		TestBed.resetTestingModule();
		stubLocalStorage();
		post = vi.fn().mockImplementation( ( url: string ) =>
			of( url === '/row/done' ? { done: true, refresh: 'panel' } : { data: [ { type: 'card' } ] } ) );
		TestBed.configureTestingModule( {
			imports: [ ResultHostComponent ],
			providers: [
				provideRouter( [] ),
				{ provide: XiriDataService, useValue: { get: vi.fn(), post } },
				{ provide: XiriFormService, useValue: { loadState: ( _id: string | null, fields: unknown ) => fields, saveState: vi.fn() } },
				{ provide: XiriSessionStorageService, useValue: { set: vi.fn(), getTimeout: vi.fn().mockReturnValue( null ) } },
			],
		} );
		if ( outer )
			TestBed.overrideComponent( ResultHostComponent, { set: { providers: [ { provide: XIRI_PANEL_HOST, useValue: outer } ] } } );
		navigate = vi.spyOn( TestBed.inject( Router ), 'navigate' ).mockResolvedValue( true );
		fixture = TestBed.createComponent( ResultHostComponent );
		if ( settings )
			fixture.componentInstance.settings.set( settings );
		fixture.detectChanges();
	}

	const queryLoads = () => post.mock.calls.filter( c => c[ 0 ] === 'search/results' ).length;

	afterEach( () => {
		vi.unstubAllGlobals();
	} );

	it( 'führt bei refresh:panel aus dem Ergebnis die Query neu aus und navigiert nicht', () => {
		setup();
		fixture.componentInstance.query().formChanged( { valid: true, value: { f: 'a' } } );
		fixture.detectChanges();
		expect( queryLoads() ).toBe( 1 );

		fixture.nativeElement.querySelector( 'xiri-button xiri-buttonstyle' )?.click();

		expect( queryLoads() ).toBe( 2 );
		expect( post.mock.calls[ post.mock.calls.length - 1 ][ 1 ] ).toEqual( { f: 'a' } );
		expect( navigate ).not.toHaveBeenCalled();
	} );

	// Die Filterleiste liegt in der eigenen View der Query: Ihre Antworten gehen zusätzlich an clickedButton() und würden
	// ein neu geladenes Ergebnis überschreiben. Panel-Host ist die Query deshalb nur für ihr Ergebnis.
	it( 'hat für das Ergebnis Vorrang vor einem äußeren Panel-Host', () => {
		const outer = { reloadPanel: vi.fn() };
		setup( undefined, outer );
		fixture.componentInstance.query().formChanged( { valid: true, value: { f: 'a' } } );
		fixture.detectChanges();

		fixture.nativeElement.querySelector( 'xiri-button xiri-buttonstyle' )?.click();

		expect( queryLoads() ).toBe( 2 );
		expect( outer.reloadPanel ).not.toHaveBeenCalled();
	} );

	it( 'führt bei refresh:panel aus einer Card ohne url im Ergebnis die Query neu aus', () => {
		const outer = { reloadPanel: vi.fn() };
		setup( undefined, outer );
		fixture.componentInstance.inCard.set( true );
		fixture.componentInstance.query().formChanged( { valid: true, value: { f: 'a' } } );
		fixture.detectChanges();

		fixture.nativeElement.querySelector( 'xiri-card xiri-buttonstyle' )?.click();

		expect( queryLoads() ).toBe( 2 );
		expect( outer.reloadPanel ).not.toHaveBeenCalled();
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'reicht ohne url (Ergebnis kommt vom Button) refresh:panel an den äußeren Panel-Host weiter', () => {
		const outer = { reloadPanel: vi.fn() };
		setup( { fields: [ { id: 'f', type: 'text', value: '' } ] }, outer );
		fixture.componentInstance.query().clickedButton( {
			button: { text: 'Suchen', type: 'raised', action: 'api', url: '/search' }, result: [ { type: 'card' } ], done: true, loading: false,
		} );
		fixture.detectChanges();

		fixture.nativeElement.querySelector( 'xiri-button xiri-buttonstyle' )?.click();

		expect( outer.reloadPanel ).toHaveBeenCalledTimes( 1 );
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'lädt bei refresh:panel aus der Filterleiste nicht die Query, sondern wie bisher die Seite', () => {
		setup( {
			fields:     [ { id: 'f', type: 'text', value: '' } ],
			url:        'search/results',
			buttonline: { type: 'buttonline', data: { class: '', buttons: [ { text: 'Neu', type: 'raised', action: 'api', url: '/row/done' } ] } },
		} );
		fixture.componentInstance.query().formChanged( { valid: true, value: { f: 'a' } } );
		fixture.detectChanges();
		expect( queryLoads() ).toBe( 1 );

		fixture.nativeElement.querySelector( '.formbtnline xiri-buttonstyle' )?.click();

		expect( queryLoads() ).toBe( 1 );
		expect( navigate ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'lädt ohne url (Ergebnis kommt vom Button) bei refresh:panel die Seite', () => {
		setup( { fields: [ { id: 'f', type: 'text', value: '' } ] } );
		fixture.componentInstance.query().clickedButton( {
			button: { text: 'Suchen', type: 'raised', action: 'api', url: '/search' }, result: [ { type: 'card' } ], done: true, loading: false,
		} );
		fixture.detectChanges();

		fixture.nativeElement.querySelector( 'xiri-button xiri-buttonstyle' )?.click();

		expect( navigate ).toHaveBeenCalledTimes( 1 );
	} );
} );
