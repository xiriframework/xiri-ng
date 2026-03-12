import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { XiriAlertComponent, XiriAlertConfig } from './alert.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe( 'XiriAlertComponent', () => {
	let fixture: ComponentFixture<XiriAlertComponent>;
	let component: XiriAlertComponent;
	let mockDialogRef: {
		close: ReturnType<typeof vi.fn>;
		updateSize: ReturnType<typeof vi.fn>;
	};
	let mockBreakpointObserver: { observe: ReturnType<typeof vi.fn> };

	function createComponent( initData: XiriAlertConfig ) {
		mockDialogRef = {
			close: vi.fn(),
			updateSize: vi.fn(),
		};
		mockBreakpointObserver = {
			observe: vi.fn().mockReturnValue( of( { matches: false } ) ),
		};

		TestBed.configureTestingModule( {
			imports: [ XiriAlertComponent, NoopAnimationsModule ],
			providers: [
				{ provide: MatDialogRef, useValue: mockDialogRef },
				{ provide: MAT_DIALOG_DATA, useValue: initData },
				{ provide: BreakpointObserver, useValue: mockBreakpointObserver },
			],
		} );

		fixture = TestBed.createComponent( XiriAlertComponent );
		component = fixture.componentInstance;
	}

	describe( 'creation', () => {
		it( 'should create', () => {
			createComponent( {
				header: 'Alert',
				text: 'Something happened',
				icon: 'warning',
				buttons: [ { text: 'OK', action: 'close', type: 'raised' } ],
			} );
			fixture.detectChanges();

			expect( component ).toBeTruthy();
		} );
	} );

	describe( 'ngOnInit', () => {
		it( 'should load data from initData with buttons', () => {
			createComponent( {
				header: 'Warning',
				text: 'Are you sure?',
				icon: 'error',
				buttons: [
					{ text: 'Yes', action: 'yes', type: 'raised' },
					{ text: 'No', action: 'no', type: 'flat' },
				],
			} );
			fixture.detectChanges();

			expect( component.header() ).toBe( 'Warning' );
			expect( component.text() ).toBe( 'Are you sure?' );
			expect( component.icon() ).toBe( 'error' );
			expect( component.buttons().length ).toBe( 2 );
			expect( component.loading() ).toBe( false );
		} );

		it( 'should default icon to warning when not provided', () => {
			createComponent( {
				header: 'Alert',
				text: 'Text',
				icon: '',
				buttons: [ { text: 'OK', action: 'close', type: 'raised' } ],
			} );
			fixture.detectChanges();

			expect( component.icon() ).toBe( 'warning' );
		} );

		it( 'should default icon to warning when icon is null/undefined', () => {
			createComponent( {
				header: 'Alert',
				text: 'Text',
				icon: undefined as any,
				buttons: [ { text: 'OK', action: 'close', type: 'raised' } ],
			} );
			fixture.detectChanges();

			expect( component.icon() ).toBe( 'warning' );
		} );

		it( 'should close dialog when initData has no buttons', () => {
			const data = {
				header: 'Alert',
				text: 'Text',
				icon: 'info',
			} as any;

			createComponent( data );
			fixture.detectChanges();

			expect( mockDialogRef.close ).toHaveBeenCalledWith( data );
		} );

		it( 'should set loading to false after loadData', () => {
			createComponent( {
				header: 'Test',
				text: 'Test text',
				icon: 'check',
				buttons: [ { text: 'OK', action: 'close', type: 'raised' } ],
			} );
			fixture.detectChanges();

			expect( component.loading() ).toBe( false );
		} );
	} );

	describe( 'breakpoint observer', () => {
		it( 'should set 80vw on small screens', () => {
			createComponent( {
				header: 'Alert',
				text: 'Text',
				icon: 'info',
				buttons: [ { text: 'OK', action: 'close', type: 'raised' } ],
			} );
			mockBreakpointObserver.observe.mockReturnValue( of( { matches: true } ) );
			fixture.detectChanges();

			expect( mockDialogRef.updateSize ).toHaveBeenCalledWith( '80vw' );
		} );

		it( 'should set 600px on large screens', () => {
			createComponent( {
				header: 'Alert',
				text: 'Text',
				icon: 'info',
				buttons: [ { text: 'OK', action: 'close', type: 'raised' } ],
			} );
			fixture.detectChanges();

			expect( mockDialogRef.updateSize ).toHaveBeenCalledWith( '600px' );
		} );
	} );

	describe( 'clickButton', () => {
		it( 'should close dialog with the button as result', () => {
			createComponent( {
				header: 'Alert',
				text: 'Text',
				icon: 'info',
				buttons: [ { text: 'Confirm', action: 'confirm', type: 'raised' } ],
			} );
			fixture.detectChanges();

			const button = component.buttons()[ 0 ];
			component.clickButton( button );

			expect( mockDialogRef.close ).toHaveBeenCalledWith( button );
		} );

		it( 'should close dialog with different button data', () => {
			createComponent( {
				header: 'Alert',
				text: 'Delete?',
				icon: 'delete',
				buttons: [
					{ text: 'Delete', action: 'delete', type: 'raised' },
					{ text: 'Cancel', action: 'cancel', type: 'flat' },
				],
			} );
			fixture.detectChanges();

			const cancelButton = component.buttons()[ 1 ];
			component.clickButton( cancelButton );

			expect( mockDialogRef.close ).toHaveBeenCalledWith( cancelButton );
		} );
	} );

	describe( 'signals initial state', () => {
		it( 'should have loading=true initially before ngOnInit', () => {
			createComponent( {
				header: 'Test',
				text: 'Text',
				icon: 'info',
				buttons: [ { text: 'OK', action: 'close', type: 'raised' } ],
			} );

			// Before detectChanges (ngOnInit)
			expect( component.loading() ).toBe( true );
			expect( component.header() ).toBe( '' );
			expect( component.buttons() ).toEqual( [] );
			expect( component.text() ).toBe( '' );
			expect( component.icon() ).toBe( 'warning' );
		} );
	} );
} );
