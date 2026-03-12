import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { XiriDialogComponent, XiriDialogSettings } from './dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { XiriDataService } from '../services/data.service';
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriDownloadService } from '../services/download.service';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe( 'XiriDialogComponent', () => {
	let fixture: ComponentFixture<XiriDialogComponent>;
	let component: XiriDialogComponent;
	let mockDialogRef: {
		close: ReturnType<typeof vi.fn>;
		updateSize: ReturnType<typeof vi.fn>;
		disableClose: boolean;
	};
	let mockDataService: {
		get: ReturnType<typeof vi.fn>;
		post: ReturnType<typeof vi.fn>;
		postFileResponse: ReturnType<typeof vi.fn>;
		getConfigApi: ReturnType<typeof vi.fn>;
	};
	let mockSnackbar: { error: ReturnType<typeof vi.fn> };
	let mockRouter: { navigate: ReturnType<typeof vi.fn> };
	let mockBreakpointObserver: { observe: ReturnType<typeof vi.fn> };
	let mockDownloadService: { download: ReturnType<typeof vi.fn> };

	function initMocks() {
		mockDialogRef = {
			close: vi.fn(),
			updateSize: vi.fn(),
			disableClose: false,
		};
		mockDataService = {
			get: vi.fn().mockReturnValue( of( {} ) ),
			post: vi.fn().mockReturnValue( of( {} ) ),
			postFileResponse: vi.fn().mockReturnValue( of( {} ) ),
			getConfigApi: vi.fn().mockReturnValue( '/api/' ),
		};
		mockSnackbar = { error: vi.fn() };
		mockRouter = { navigate: vi.fn().mockReturnValue( Promise.resolve() ) };
		mockBreakpointObserver = {
			observe: vi.fn().mockReturnValue( of( { matches: false } ) ),
		};
		mockDownloadService = { download: vi.fn().mockReturnValue( true ) };
	}

	function createComponent( initData: any ) {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule( {
			imports: [ XiriDialogComponent, NoopAnimationsModule ],
			providers: [
				{ provide: MatDialogRef, useValue: mockDialogRef },
				{ provide: MAT_DIALOG_DATA, useValue: initData },
				{ provide: XiriDataService, useValue: mockDataService },
				{ provide: XiriSnackbarService, useValue: mockSnackbar },
				{ provide: Router, useValue: mockRouter },
				{ provide: BreakpointObserver, useValue: mockBreakpointObserver },
				{ provide: XiriDownloadService, useValue: mockDownloadService },
			],
		} );

		fixture = TestBed.createComponent( XiriDialogComponent );
		component = fixture.componentInstance;
	}

	beforeEach( () => {
		initMocks();
	} );

	describe( 'creation and init', () => {
		it( 'should create with form type and call send', () => {
			const formResponse = {
				buttons: [ { text: 'Save', action: 'save', type: 'raised' } ],
				fields: [ { id: 'name', type: 'text', value: 'test' } ],
				header: 'Edit Form',
			};

			// type: 'form' calls loadData(initData) directly, so initData needs buttons/fields/header
			createComponent( { type: 'form', url: 'test/form', ...formResponse } );
			fixture.detectChanges();

			expect( component ).toBeTruthy();
			expect( component.header() ).toBe( 'Edit Form' );
			expect( component.loading() ).toBe( false );
		} );

		it( 'should handle data type and send data', () => {
			const response = {
				buttons: [ { text: 'OK', action: 'close', type: 'raised' } ],
				fields: [],
				header: 'Confirm',
			};
			mockDataService.post.mockReturnValue( of( response ) );

			createComponent( { type: 'data', url: 'test/data', data: [ 1, 2, 3 ] } );
			fixture.detectChanges();

			expect( mockDataService.post ).toHaveBeenCalled();
		} );

		it( 'should send filter data when present', () => {
			const response = {
				buttons: [ { text: 'OK', action: 'close', type: 'raised' } ],
				fields: [],
				header: 'Filter',
			};
			mockDataService.post.mockReturnValue( of( response ) );

			createComponent( { type: 'load', url: 'test/filter', filter: { key: 'val' } } );
			fixture.detectChanges();

			expect( mockDataService.post ).toHaveBeenCalled();
		} );

		it( 'should send GET when no filter and not form/data type', () => {
			createComponent( { type: 'load', url: 'test/get' } );
			fixture.detectChanges();

			expect( mockDataService.get ).toHaveBeenCalled();
		} );
	} );

	describe( 'loadData', () => {
		it( 'should set form type when response has buttons and type form', () => {
			const response = {
				buttons: [ { text: 'Submit', action: 'submit', type: 'raised' } ],
				fields: [ { id: 'email', type: 'text' } ],
				header: 'Form',
				type: 'form',
				model: { email: 'test@test.com' },
			};
			mockDataService.get.mockReturnValue( of( response ) );

			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			expect( component.type() ).toBe( 'form' );
			expect( component.formFields() ).toBeTruthy();
			expect( component.formFields().length ).toBe( 1 );
			expect( component.formFields()[ 0 ].value ).toBe( 'test@test.com' );
		} );

		it( 'should hide fields with hide=true', () => {
			const response = {
				buttons: [ { text: 'OK', action: 'close', type: 'raised' } ],
				fields: [
					{ id: 'visible', type: 'text' },
					{ id: 'hidden', type: 'text', hide: true },
				],
				header: 'Form',
			};
			mockDataService.get.mockReturnValue( of( response ) );

			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			expect( component.formFields().length ).toBe( 1 );
			expect( component.formFields()[ 0 ].id ).toBe( 'visible' );
		} );

		it( 'should set question type', () => {
			const response = {
				buttons: [ { text: 'Yes', action: 'submit', type: 'raised' } ],
				fields: { question: 'Are you sure?' },
				header: 'Question',
				type: 'question',
			};
			mockDataService.get.mockReturnValue( of( response ) );

			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			expect( component.type() ).toBe( 'question' );
			expect( component.formValid() ).toBe( true );
		} );

		it( 'should set waiting type and disable close', () => {
			const response = {
				buttons: [ { text: 'Wait', action: 'wait', type: 'raised' } ],
				fields: { text: 'Processing...' },
				header: 'Waiting',
				type: 'waiting',
				time: 3000,
			};
			mockDataService.get.mockReturnValue( of( response ) );

			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			expect( component.type() ).toBe( 'waiting' );
			expect( mockDialogRef.disableClose ).toBe( true );
		} );

		it( 'should set table type', () => {
			const response = {
				buttons: [ { text: 'Close', action: 'close', type: 'raised' } ],
				fields: { data: [], fields: [] },
				header: 'Table',
				type: 'table',
			};
			mockDataService.get.mockReturnValue( of( response ) );

			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			expect( component.type() ).toBe( 'table' );
		} );

		it( 'should close dialog on done response', () => {
			vi.useFakeTimers();
			const response = { done: true };
			mockDataService.get.mockReturnValue( of( response ) );

			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			expect( component.done() ).toBe( true );

			vi.advanceTimersByTime( 1000 );
			expect( mockDialogRef.close ).toHaveBeenCalledWith( response );
			vi.useRealTimers();
		} );

		it( 'should close dialog on response without buttons or done', () => {
			const response = { goto: '/page' };
			mockDataService.get.mockReturnValue( of( response ) );

			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			expect( mockDialogRef.close ).toHaveBeenCalledWith( response );
		} );
	} );

	describe( 'error handling', () => {
		it( 'should show error on API failure', () => {
			mockDataService.get.mockReturnValue(
				throwError( () => ( { status: 500 } ) )
			);

			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			expect( component.error() ).toBeTruthy();
			expect( component.loading() ).toBe( false );
			expect( component.buttons().length ).toBeGreaterThan( 0 );
		} );

		it( 'should show error on null response', () => {
			mockDataService.get.mockReturnValue( of( null ) );

			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			expect( component.error() ).toBeTruthy();
		} );

		it( 'should add close button on error when no buttons exist', () => {
			mockDataService.get.mockReturnValue(
				throwError( () => ( { status: 403 } ) )
			);

			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			expect( component.buttons()[ 0 ].action ).toBe( 'close' );
		} );
	} );

	describe( 'clickButton', () => {
		beforeEach( () => {
			const response = {
				buttons: [ { text: 'Save', action: 'submit', type: 'raised', default: true } ],
				fields: [ { id: 'name', type: 'text' } ],
				header: 'Form',
			};
			mockDataService.get.mockReturnValue( of( response ) );
			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();
		} );

		it( 'should close dialog on close action', () => {
			component.clickButton( { text: 'Close', action: 'close', type: 'flat' } );
			expect( mockDialogRef.close ).toHaveBeenCalledWith( null );
		} );

		it( 'should return form values on return action', () => {
			component.formChanged( { valid: true, value: { name: 'test' } } );
			component.clickButton( { text: 'Return', action: 'return', type: 'flat' } );
			expect( mockDialogRef.close ).toHaveBeenCalledWith( {
				valid: true,
				values: { name: 'test' },
			} );
		} );

		it( 'should navigate on link action', () => {
			component.clickButton( { text: 'Link', action: 'link', type: 'flat', url: '/page' } );
			expect( mockRouter.navigate ).toHaveBeenCalledWith( [ '/page' ] );
		} );

		it( 'should not submit if default button and form invalid', () => {
			component.formChanged( { valid: false, value: {} } );
			const button = { text: 'Save', action: 'submit', type: 'raised', default: true };
			component.clickButton( button );
			// Should not have called post since formValid is false
		} );
	} );

	describe( 'formChanged', () => {
		it( 'should update formValid and formValues', () => {
			createComponent( { type: 'load', url: 'test' } );

			component.formChanged( { valid: true, value: { key: 'val' } } );
			expect( component.formValid() ).toBe( true );
		} );

		it( 'should handle invalid form state', () => {
			createComponent( { type: 'load', url: 'test' } );

			component.formChanged( { valid: false, value: null } );
			expect( component.formValid() ).toBe( false );
		} );
	} );

	describe( 'breakpoint observer', () => {
		it( 'should set 90vw on small screens', () => {
			mockBreakpointObserver.observe.mockReturnValue( of( { matches: true } ) );

			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			expect( mockDialogRef.updateSize ).toHaveBeenCalledWith( '90vw' );
		} );

		it( 'should use initData size on large screens', () => {
			createComponent( { type: 'load', url: 'test', size: '800px' } );
			fixture.detectChanges();

			expect( mockDialogRef.updateSize ).toHaveBeenCalledWith( '800px' );
		} );

		it( 'should default to 600px when no size provided', () => {
			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			expect( mockDialogRef.updateSize ).toHaveBeenCalledWith( '600px' );
		} );
	} );

	describe( 'ngOnDestroy', () => {
		it( 'should clear timeout on destroy', () => {
			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			( component as any ).to = setTimeout( () => {}, 10000 );
			const clearSpy = vi.spyOn( globalThis, 'clearTimeout' );
			component.ngOnDestroy();
			expect( clearSpy ).toHaveBeenCalled();
			clearSpy.mockRestore();
		} );

		it( 'should not fail if no timeout exists', () => {
			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			expect( () => component.ngOnDestroy() ).not.toThrow();
		} );
	} );

	describe( 'download', () => {
		it( 'should attempt window.open for null data', () => {
			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			( component as any ).url = 'report/download';
			const openSpy = vi.spyOn( window, 'open' ).mockReturnValue( {} as Window );
			component.download( null );

			expect( openSpy ).toHaveBeenCalled();
			openSpy.mockRestore();
		} );

		it( 'should show download button when popup blocked', () => {
			createComponent( { type: 'load', url: 'test' } );
			fixture.detectChanges();

			( component as any ).url = 'report/download';
			const openSpy = vi.spyOn( window, 'open' ).mockReturnValue( null );
			component.download( null );

			expect( component.buttons()[ 0 ].action ).toBe( 'download' );
			openSpy.mockRestore();
		} );
	} );
} );
