import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import { XiriQueryComponent, XiriQuerySettings } from './query.component';
import { XiriButton } from '../button/button.component';
import { XiriDataService } from '../services/data.service';
import { XiriFormService } from '../services/form.service';

@Component( {
	selector: 'xiri-query-test-host',
	template: `<xiri-query [settings]="settings()" (filterChange)="onChange($event)" />`,
	imports: [ XiriQueryComponent ],
} )
class TestHostComponent {
	settings = signal<XiriQuerySettings>( {
		fields: [
			{ id: 'search', type: 'text', value: '' },
		],
	} );
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

	function initMocks() {
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
		TestBed.configureTestingModule( {
			imports: [ TestHostComponent ],
			providers: [
				{ provide: XiriDataService, useValue: mockDataService },
				{ provide: XiriFormService, useValue: mockFormService },
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
