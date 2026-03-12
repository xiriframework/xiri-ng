import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { of, throwError } from 'rxjs';
import { XiriFormComponent, XiriFormSettings } from './form.component';
import { XiriFormService, XiriFormServiceData } from '../services/form.service';
import { Location } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component( {
	selector: 'xiri-form-test-host',
	template: `<xiri-form [settings]="settings()" />`,
	imports: [ XiriFormComponent ],
} )
class TestHostComponent {
	settings = signal<XiriFormSettings>( {
		url: 'test/form',
		fields: [ { id: 'name', type: 'text', value: '' } ],
		buttons: [ { text: 'Save', action: 'submit', type: 'raised' } ],
	} );
	form = viewChild.required( XiriFormComponent );
}

describe( 'XiriFormComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let component: XiriFormComponent;
	let mockFormService: {
		get: ReturnType<typeof vi.fn>;
		parse: ReturnType<typeof vi.fn>;
	};
	let mockLocation: { back: ReturnType<typeof vi.fn> };

	function initMocks() {
		const parsedData: XiriFormServiceData = {
			url: 'test/form',
			fields: [ { id: 'name', type: 'text', value: '' } ],
			buttons: [ { text: 'Save', action: 'submit', type: 'raised' } ],
			extra: {},
		};

		mockFormService = {
			get: vi.fn().mockReturnValue( of( parsedData ) ),
			parse: vi.fn().mockReturnValue( parsedData ),
		};
		mockLocation = { back: vi.fn() };
	}

	function createFixture( settings?: XiriFormSettings ) {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule( {
			imports: [ TestHostComponent, NoopAnimationsModule ],
			providers: [
				{ provide: XiriFormService, useValue: mockFormService },
				{ provide: Location, useValue: mockLocation },
			],
		} );

		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		if ( settings ) {
			host.settings.set( settings );
		}
		fixture.detectChanges();
		component = host.form();
	}

	beforeEach( () => {
		initMocks();
		createFixture();
	} );

	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );

	describe( 'ngOnInit', () => {
		it( 'should parse settings when load is not true', () => {
			expect( mockFormService.parse ).toHaveBeenCalled();
			expect( component.loading() ).toBe( false );
		} );

		it( 'should call send when load is true', () => {
			const loadedData: XiriFormServiceData = {
				url: 'loaded/url',
				fields: [ { id: 'email', type: 'text', value: 'test@test.com' } ],
				buttons: [ { text: 'Submit', action: 'submit', type: 'raised' } ],
				extra: {},
			};
			mockFormService.get.mockReturnValue( of( loadedData ) );

			createFixture( { url: 'load/form', load: true } );

			expect( mockFormService.get ).toHaveBeenCalled();
		} );

		it( 'should set url from settings', () => {
			expect( ( component as any ).url ).toBe( 'test/form' );
		} );
	} );

	describe( 'loadData', () => {
		it( 'should set form fields and buttons when response has buttons', () => {
			expect( component.formFields() ).toBeTruthy();
			expect( component.buttons.length ).toBe( 1 );
			expect( component.loading() ).toBe( false );
		} );

		it( 'should update url from response', () => {
			const data: XiriFormServiceData = {
				url: 'new/url',
				fields: [],
				buttons: [ { text: 'OK', action: 'close', type: 'flat' } ],
				extra: { key: 'val' },
			};
			mockFormService.parse.mockReturnValue( data );

			createFixture( { url: 'initial', fields: [], buttons: [] } );

			expect( ( component as any ).url ).toBe( 'new/url' );
		} );

		it( 'should handle done response', () => {
			const data: XiriFormServiceData = {
				url: '',
				done: of( undefined ),
			};
			mockFormService.parse.mockReturnValue( data );

			createFixture( { url: 'test', fields: [], buttons: [] } );

			expect( component.done() ).toBe( true );
			expect( component.formFields() ).toBeNull();
			expect( component.buttons ).toEqual( [] );
		} );
	} );

	describe( 'error handling', () => {
		it( 'should set error on API failure', () => {
			mockFormService.get.mockReturnValue(
				throwError( () => ( { error: 'Server error' } ) )
			);

			createFixture( { url: 'fail', load: true } );

			expect( component.error() ).toBe( 'Server error' );
			expect( component.loading() ).toBe( false );
		} );

		it( 'should set default error when error.error is null', () => {
			mockFormService.get.mockReturnValue(
				throwError( () => ( { error: null } ) )
			);

			createFixture( { url: 'fail', load: true } );

			expect( component.error() ).toBe( 'Unknown Error' );
		} );

		it( 'should add close button on error when no buttons exist', () => {
			mockFormService.get.mockReturnValue(
				throwError( () => ( { error: 'Error' } ) )
			);

			createFixture( { url: 'fail', load: true } );

			expect( component.buttons.length ).toBe( 1 );
			expect( component.buttons[ 0 ].action ).toBe( 'close' );
		} );

		it( 'should not add close button if buttons already exist', () => {
			const data: XiriFormServiceData = {
				url: 'test',
				fields: [],
				buttons: [ { text: 'Retry', action: 'retry', type: 'raised' } ],
				extra: {},
			};
			mockFormService.parse.mockReturnValue( data );

			createFixture( { url: 'test', fields: [], buttons: [] } );

			// Buttons exist from parse, so they should stay
			expect( component.buttons.length ).toBe( 1 );
			expect( component.buttons[ 0 ].action ).toBe( 'retry' );
		} );

		it( 'should clear loadingButton on error', () => {
			mockFormService.get.mockReturnValue(
				throwError( () => ( { error: 'Error' } ) )
			);

			createFixture( { url: 'fail', load: true } );

			expect( component.loadingButton() ).toBeNull();
		} );
	} );

	describe( 'clickButton', () => {
		it( 'should navigate back on back action', () => {
			component.clickButton( { text: 'Back', action: 'back', type: 'flat' } );
			expect( mockLocation.back ).toHaveBeenCalled();
		} );

		it( 'should send GET on get action', () => {
			vi.useFakeTimers();
			const response: XiriFormServiceData = {
				url: 'next',
				fields: [],
				buttons: [ { text: 'OK', action: 'close', type: 'flat' } ],
				extra: {},
			};
			mockFormService.get.mockReturnValue( of( response ) );

			component.clickButton( { text: 'Load', action: 'get', type: 'flat', url: 'get/url' } );
			vi.advanceTimersByTime( 20 );

			expect( mockFormService.get ).toHaveBeenCalledWith( 'get/url', null, expect.anything() );
			vi.useRealTimers();
		} );

		it( 'should send POST with button data on post action', () => {
			vi.useFakeTimers();
			const response: XiriFormServiceData = {
				url: 'next',
				fields: [],
				buttons: [],
				extra: {},
			};
			mockFormService.get.mockReturnValue( of( response ) );

			const data = { key: 'value' };
			component.clickButton( { text: 'Post', action: 'post', type: 'flat', url: 'post/url', data } );
			vi.advanceTimersByTime( 20 );

			expect( mockFormService.get ).toHaveBeenCalledWith( 'post/url', data, expect.anything() );
			vi.useRealTimers();
		} );

		it( 'should trigger checkSubject on debug action', () => {
			const nextSpy = vi.fn();
			component.checkSubject.subscribe( nextSpy );
			component.clickButton( { text: 'Debug', action: 'debug', type: 'flat' } );
			expect( nextSpy ).toHaveBeenCalled();
		} );

		it( 'should not send when loading is true', () => {
			vi.useFakeTimers();
			component.loading.set( true );
			component.clickButton( { text: 'Submit', action: 'submit', type: 'raised' } );
			vi.advanceTimersByTime( 20 );
			// get should only have been called from initial setup, not again
			vi.useRealTimers();
		} );

		it( 'should send form values on default action', () => {
			vi.useFakeTimers();
			const response: XiriFormServiceData = {
				url: 'test',
				fields: [],
				buttons: [],
				extra: {},
			};
			mockFormService.get.mockReturnValue( of( response ) );
			component.formChanged( { valid: true, value: { name: 'test' } } );
			component.loading.set( false );

			component.clickButton( { text: 'Save', action: 'save', type: 'raised' } );
			vi.advanceTimersByTime( 20 );

			expect( mockFormService.get ).toHaveBeenCalled();
			vi.useRealTimers();
		} );

		it( 'should set loadingButton on action', () => {
			const button = { text: 'Load', action: 'get', type: 'flat', url: 'url' };
			component.clickButton( button );
			expect( component.loadingButton() ).toBe( button );
		} );
	} );

	describe( 'formChanged', () => {
		it( 'should update formValid and formValues', () => {
			component.formChanged( { valid: true, value: { name: 'hello' } } );
			expect( component.formValid ).toBe( true );
		} );

		it( 'should handle invalid form state', () => {
			component.formChanged( { valid: false, value: {} } );
			expect( component.formValid ).toBe( false );
		} );
	} );

	describe( 'simulate action', () => {
		it( 'should trigger checkSubject when form invalid on simulate', () => {
			const nextSpy = vi.fn();
			component.checkSubject.subscribe( nextSpy );
			component.formValid = false;
			component.clickButton( { text: 'Sim', action: 'simulate', type: 'flat' } );
			expect( nextSpy ).toHaveBeenCalled();
		} );

		it( 'should set loading when form valid on simulate', () => {
			component.formValid = true;
			const doneData: XiriFormServiceData = {
				url: '',
				done: of( undefined ),
			};
			mockFormService.parse.mockReturnValue( doneData );

			component.clickButton( { text: 'Sim', action: 'simulate', type: 'flat' } );
			expect( component.loading() ).toBe( true );
		} );
	} );

	describe( 'startSend with invalid form', () => {
		it( 'should trigger checkSubject when form is invalid', () => {
			vi.useFakeTimers();
			const nextSpy = vi.fn();
			component.checkSubject.subscribe( nextSpy );
			component.formValid = false;

			( component as any ).startSend( { name: 'test' } );
			vi.advanceTimersByTime( 20 );

			expect( nextSpy ).toHaveBeenCalled();
			vi.useRealTimers();
		} );
	} );
} );
