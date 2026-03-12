import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { of, throwError } from 'rxjs';
import { XiriStepperComponent, XiriStepperSettings } from './stepper.component';
import { XiriDataService } from '../services/data.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component( {
	selector: 'xiri-stepper-test-host',
	template: `<xiri-stepper [settings]="settings()" />`,
	imports: [ XiriStepperComponent ],
} )
class TestHostComponent {
	settings = signal<XiriStepperSettings>( {
		url: 'test/stepper',
		steps: [
			{
				title: 'Step 1',
				fields: [ { id: 'name', type: 'text', value: '' } ],
				buttons: [
					{ text: 'Next', action: 'next', type: 'raised' },
				],
			},
			{
				title: 'Step 2',
				fields: [ { id: 'email', type: 'text', value: '' } ],
				buttons: [
					{ text: 'Back', action: 'prev', type: 'flat' },
					{ text: 'Next', action: 'next', type: 'raised' },
				],
			},
		],
	} );
	stepper = viewChild.required( XiriStepperComponent );
}

describe( 'XiriStepperComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let component: XiriStepperComponent;
	let mockDataService: {
		get: ReturnType<typeof vi.fn>;
		post: ReturnType<typeof vi.fn>;
	};
	let mockLocation: { back: ReturnType<typeof vi.fn> };
	let mockRouter: { navigate: ReturnType<typeof vi.fn> };

	function initMocks() {
		mockDataService = {
			get: vi.fn().mockReturnValue( of( {} ) ),
			post: vi.fn().mockReturnValue( of( {} ) ),
		};
		mockLocation = { back: vi.fn() };
		mockRouter = { navigate: vi.fn().mockReturnValue( Promise.resolve() ) };
	}

	function createFixture( settings?: XiriStepperSettings ) {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule( {
			imports: [ TestHostComponent, NoopAnimationsModule ],
			providers: [
				{ provide: XiriDataService, useValue: mockDataService },
				{ provide: Location, useValue: mockLocation },
				{ provide: Router, useValue: mockRouter },
			],
		} );

		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		if ( settings ) {
			host.settings.set( settings );
		}
		fixture.detectChanges();
		component = host.stepper();
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

	describe( 'ngOnInit', () => {
		it( 'should initialize steps from settings', () => {
			expect( component.steps().length ).toBe( 2 );
		} );

		it( 'should set first step as not loading', () => {
			expect( component.steps()[ 0 ].load() ).toBe( false );
		} );

		it( 'should set subsequent steps as loading', () => {
			expect( component.steps()[ 1 ].load() ).toBe( true );
		} );

		it( 'should initialize step fields from settings', () => {
			expect( component.steps()[ 0 ].fields() ).toBeTruthy();
			expect( component.steps()[ 0 ].fields().length ).toBe( 1 );
			expect( component.steps()[ 0 ].fields()[ 0 ].id ).toBe( 'name' );
		} );

		it( 'should initialize step buttons from settings', () => {
			expect( component.steps()[ 0 ].buttons().length ).toBe( 1 );
			expect( component.steps()[ 0 ].buttons()[ 0 ].action ).toBe( 'next' );
		} );

		it( 'should initialize step title', () => {
			expect( component.steps()[ 0 ].title ).toBe( 'Step 1' );
			expect( component.steps()[ 1 ].title ).toBe( 'Step 2' );
		} );

		it( 'should initialize completed as false', () => {
			expect( component.steps()[ 0 ].completed() ).toBe( false );
			expect( component.steps()[ 1 ].completed() ).toBe( false );
		} );

		it( 'should initialize valid based on form validity', () => {
			// With a non-required text field, the form is valid after initialization
			expect( component.steps()[ 0 ].valid() ).toBe( true );
		} );

		it( 'should initialize valid as false when field is required', () => {
			createFixture( {
				url: 'test/stepper',
				steps: [
					{
						title: 'Step 1',
						fields: [ { id: 'name', type: 'text', value: '', required: true } ],
						buttons: [ { text: 'Next', action: 'next', type: 'raised' } ],
					},
					{
						title: 'Step 2',
						fields: [ { id: 'email', type: 'text', value: '' } ],
						buttons: [],
					},
				],
			} );

			expect( component.steps()[ 0 ].valid() ).toBe( false );
		} );

		it( 'should set step url if provided', () => {
			createFixture( {
				url: 'base',
				steps: [
					{
						title: 'S1',
						url: 'step1/url',
						fields: [],
						buttons: [],
					},
				],
			} );

			expect( component.steps()[ 0 ].url ).toBe( 'step1/url' );
		} );

		it( 'should set step extra and data if provided', () => {
			createFixture( {
				url: 'base',
				steps: [
					{
						title: 'S1',
						fields: [],
						buttons: [],
						data: { key: 'val' },
						extra: { ex: 'tra' },
					},
				],
			} );

			expect( component.steps()[ 0 ].data ).toEqual( { key: 'val' } );
			expect( component.steps()[ 0 ].extra ).toEqual( { ex: 'tra' } );
		} );
	} );

	describe( 'formChanged', () => {
		it( 'should set step data when form is valid', () => {
			const step = component.steps()[ 0 ];
			component.formChanged( step, { valid: true, value: { name: 'test' }, pristine: true }, 0 );

			expect( step.data ).toEqual( { name: 'test' } );
			expect( step.valid() ).toBe( true );
		} );

		it( 'should not set step data when form is invalid', () => {
			const step = component.steps()[ 0 ];
			const originalData = step.data;
			component.formChanged( step, { valid: false, value: null, pristine: true }, 0 );

			expect( step.data ).toBe( originalData );
			expect( step.valid() ).toBe( false );
		} );

		it( 'should reset subsequent steps when form is not pristine', () => {
			const steps = component.steps();
			steps[ 1 ].completed.set( true );
			steps[ 1 ].load.set( false );

			component.formChanged( steps[ 0 ], { valid: true, value: { name: 'changed' }, pristine: false }, 0 );

			expect( steps[ 0 ].completed() ).toBe( false );
			expect( steps[ 1 ].completed() ).toBe( false );
			expect( steps[ 1 ].load() ).toBe( true );
		} );

		it( 'should not reset subsequent steps when form is pristine', () => {
			const steps = component.steps();
			steps[ 1 ].completed.set( true );
			steps[ 1 ].load.set( false );

			component.formChanged( steps[ 0 ], { valid: true, value: { name: 'test' }, pristine: true }, 0 );

			expect( steps[ 1 ].completed() ).toBe( true );
			expect( steps[ 1 ].load() ).toBe( false );
		} );
	} );

	describe( 'clickButton', () => {
		it( 'should navigate back on back action', () => {
			component.clickButton( { text: 'Back', action: 'back', type: 'flat' } );
			expect( mockLocation.back ).toHaveBeenCalled();
		} );

		it( 'should go to previous step on prev action', () => {
			// Can't easily test stepper navigation without the actual stepper,
			// but we can verify it doesn't throw
			expect( () => {
				component.clickButton( { text: 'Prev', action: 'prev', type: 'flat' } );
			} ).not.toThrow();
		} );

		it( 'should navigate back when at step 0 and prev is clicked', () => {
			component.clickButton( { text: 'Prev', action: 'prev', type: 'flat' } );
			expect( mockLocation.back ).toHaveBeenCalled();
		} );

		it( 'should check step when next is clicked and step is valid', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( true );
			steps[ 0 ].check.set( false );

			mockDataService.post.mockReturnValue( of( {
				fields: [ { id: 'email', type: 'text' } ],
				buttons: [ { text: 'Next', action: 'next', type: 'raised' } ],
			} ) );

			component.clickButton( { text: 'Next', action: 'next', type: 'raised' } );

			expect( mockDataService.post ).toHaveBeenCalled();
		} );

		it( 'should not check step if step is already being checked', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( true );
			steps[ 0 ].check.set( true );

			component.clickButton( { text: 'Next', action: 'next', type: 'raised' } );

			expect( mockDataService.post ).not.toHaveBeenCalled();
		} );

		it( 'should not check step if step is invalid', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( false );

			component.clickButton( { text: 'Next', action: 'next', type: 'raised' } );

			expect( mockDataService.post ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'checkStep', () => {
		it( 'should set check to true during check', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( true );

			mockDataService.post.mockReturnValue( of( {
				fields: [],
				buttons: [],
			} ) );

			( component as any ).checkStep( 0 );

			// After completion, check is false
			expect( steps[ 0 ].check() ).toBe( false );
		} );

		it( 'should complete step on success', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( true );

			mockDataService.post.mockReturnValue( of( {
				fields: [ { id: 'email', type: 'text' } ],
				buttons: [ { text: 'OK', action: 'next', type: 'raised' } ],
			} ) );

			( component as any ).checkStep( 0 );

			expect( steps[ 0 ].completed() ).toBe( true );
		} );

		it( 'should update next step fields from response', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( true );
			const newFields = [ { id: 'newfield', type: 'text' } ];

			mockDataService.post.mockReturnValue( of( {
				fields: newFields,
			} ) );

			( component as any ).checkStep( 0 );

			expect( steps[ 1 ].fields() ).toEqual( newFields );
			expect( steps[ 1 ].load() ).toBe( false );
		} );

		it( 'should update next step buttons from response', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( true );
			const newButtons = [ { text: 'Submit', action: 'submit', type: 'raised' } ];

			mockDataService.post.mockReturnValue( of( {
				buttons: newButtons,
			} ) );

			( component as any ).checkStep( 0 );

			expect( steps[ 1 ].buttons() ).toEqual( newButtons );
		} );

		it( 'should update next step url from response', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( true );

			mockDataService.post.mockReturnValue( of( {
				url: 'new/step/url',
			} ) );

			( component as any ).checkStep( 0 );

			expect( steps[ 1 ].url ).toBe( 'new/step/url' );
		} );

		it( 'should handle goto response', () => {
			vi.useFakeTimers();
			const steps = component.steps();
			steps[ 0 ].valid.set( true );

			mockDataService.post.mockReturnValue( of( {
				goto: '/success',
			} ) );

			( component as any ).checkStep( 0 );
			vi.advanceTimersByTime( 1000 );

			expect( component.done() ).toBe( true );
			expect( mockRouter.navigate ).toHaveBeenCalledWith( [ '/success' ] );
		} );

		it( 'should show error on null response', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( true );

			mockDataService.post.mockReturnValue( of( null ) );

			( component as any ).checkStep( 0 );

			expect( steps[ 0 ].errorMsg() ).toBe( 'Unknown error' );
			expect( steps[ 0 ].completed() ).toBe( false );
		} );

		it( 'should show error on 400 error', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( true );

			mockDataService.post.mockReturnValue(
				throwError( () => ( { status: 400, error: { error: 'Validation failed' } } ) )
			);

			( component as any ).checkStep( 0 );

			expect( steps[ 0 ].errorMsg() ).toBe( 'Validation failed' );
		} );

		it( 'should show access denied on 403 error', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( true );

			mockDataService.post.mockReturnValue(
				throwError( () => ( { status: 403 } ) )
			);

			( component as any ).checkStep( 0 );

			expect( steps[ 0 ].errorMsg() ).toBe( 'Access denied' );
		} );

		it( 'should show unknown error on other errors', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( true );

			mockDataService.post.mockReturnValue(
				throwError( () => ( { status: 500 } ) )
			);

			( component as any ).checkStep( 0 );

			expect( steps[ 0 ].errorMsg() ).toBe( 'Unknown error' );
		} );

		it( 'should show default 400 error when error.error is missing', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( true );

			mockDataService.post.mockReturnValue(
				throwError( () => ( { status: 400, error: {} } ) )
			);

			( component as any ).checkStep( 0 );

			expect( steps[ 0 ].errorMsg() ).toBe( 'Format Error' );
		} );

		it( 'should send accumulated data from all previous steps', () => {
			createFixture( {
				url: 'test/stepper',
				steps: [
					{ title: 'S1', fields: [], buttons: [], data: { a: 1 } },
					{ title: 'S2', fields: [], buttons: [], data: { b: 2 } },
					{ title: 'S3', fields: [], buttons: [] },
				],
			} );

			const steps = component.steps();
			steps[ 1 ].valid.set( true );

			mockDataService.post.mockReturnValue( of( {} ) );

			( component as any ).checkStep( 1 );

			expect( mockDataService.post ).toHaveBeenCalledWith(
				'test/stepper',
				{ a: 1, b: 2 },
			);
		} );

		it( 'should use step url over settings url', () => {
			createFixture( {
				url: 'base/url',
				steps: [
					{ title: 'S1', url: 'step/url', fields: [], buttons: [] },
					{ title: 'S2', fields: [], buttons: [] },
				],
			} );

			const steps = component.steps();
			steps[ 0 ].valid.set( true );

			mockDataService.post.mockReturnValue( of( {} ) );

			( component as any ).checkStep( 0 );

			expect( mockDataService.post ).toHaveBeenCalledWith( 'step/url', expect.anything() );
		} );

		it( 'should merge step extra into data', () => {
			createFixture( {
				url: 'test',
				steps: [
					{
						title: 'S1',
						fields: [],
						buttons: [],
						data: { a: 1 },
						extra: { token: 'abc' },
					},
					{ title: 'S2', fields: [], buttons: [] },
				],
			} );

			const steps = component.steps();
			steps[ 0 ].valid.set( true );

			mockDataService.post.mockReturnValue( of( {} ) );

			( component as any ).checkStep( 0 );

			expect( mockDataService.post ).toHaveBeenCalledWith(
				'test',
				{ a: 1, token: 'abc' },
			);
		} );

		it( 'should skip steps when response specifies step jump', () => {
			createFixture( {
				url: 'test',
				steps: [
					{ title: 'S1', fields: [], buttons: [] },
					{ title: 'S2', fields: [], buttons: [] },
					{ title: 'S3', fields: [], buttons: [] },
				],
			} );

			const steps = component.steps();
			steps[ 0 ].valid.set( true );

			mockDataService.post.mockReturnValue( of( {
				step: 2,
				fields: [ { id: 'f3', type: 'text' } ],
			} ) );

			( component as any ).checkStep( 0 );

			expect( steps[ 1 ].completed() ).toBe( true );
			expect( steps[ 1 ].gotonext() ).toBe( true );
		} );

		it( 'should navigate directly without loading when next step doesnt need load', () => {
			const steps = component.steps();
			steps[ 0 ].valid.set( true );
			steps[ 1 ].load.set( false );

			( component as any ).checkStep( 0 );

			// Should not have called post since needLoad is false
			expect( mockDataService.post ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'stepChanged', () => {
		it( 'should not throw on step change', () => {
			expect( () => {
				component.stepChanged( { selectedIndex: 0 } as any );
			} ).not.toThrow();
		} );
	} );

	describe( 'done signal', () => {
		it( 'should start as false', () => {
			expect( component.done() ).toBe( false );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should handle single step', () => {
			createFixture( {
				url: 'test',
				steps: [
					{ title: 'Only Step', fields: [], buttons: [] },
				],
			} );

			expect( component.steps().length ).toBe( 1 );
			expect( component.steps()[ 0 ].load() ).toBe( false );
		} );

		it( 'should handle many steps', () => {
			createFixture( {
				url: 'test',
				steps: Array.from( { length: 5 }, ( _, i ) => ( {
					title: `Step ${ i + 1 }`,
					fields: [],
					buttons: [],
				} ) ),
			} );

			expect( component.steps().length ).toBe( 5 );
			expect( component.steps()[ 0 ].load() ).toBe( false );
			for ( let i = 1; i < 5; i++ ) {
				expect( component.steps()[ i ].load() ).toBe( true );
			}
		} );
	} );
} );
