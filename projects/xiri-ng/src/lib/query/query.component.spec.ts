import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import { XiriQueryComponent, XiriQueryResultCount, XiriQuerySettings } from './query.component';
import { XiriButton } from '../button/button.component';
import { XiriDataService } from '../services/data.service';
import { XiriFormService } from '../services/form.service';
import { XiriSessionStorageService } from '../services/sessionStorage.service';
import { MatExpansionPanel } from '@angular/material/expansion';
import { By } from '@angular/platform-browser';

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
