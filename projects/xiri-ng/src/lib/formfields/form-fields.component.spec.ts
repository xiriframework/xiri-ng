import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { delay, of, Subject, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { XiriFormFieldsComponent } from './form-fields.component';
import { XiriDateComponent } from './date/date.component';
import { XiriVolumeComponent } from './volume/volume.component';
import { XiriChipsComponent } from './chips/chips.component';
import { XiriFormField, XiriFormFieldConditionOperator } from './field.interface';
import { UntypedFormGroup } from '@angular/forms';
import { XiriDataServiceConfig } from '../services/data.service';
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriLocaleService } from '../services/locale.service';
import { HttpClient } from '@angular/common/http';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { enUS } from 'date-fns/locale/en-US';

@Component( {
	selector: 'xiri-form-fields-test-host',
	template: `<xiri-form-fields
		[form]="fields()"
		[display]="display()"
		[disabled]="disabled()"
		[check]="checkSubject"
		(formChange)="onFormChange($event)" />`,
	imports: [ XiriFormFieldsComponent ],
} )
class TestHostComponent {
	fields = signal<XiriFormField[] | null>( null );
	display = signal<'full' | 'line' | 'small'>( 'full' );
	disabled = signal<boolean>( false );
	checkSubject = new Subject<void>();
	formChangeEvents: UntypedFormGroup[] = [];
	formFields = viewChild.required( XiriFormFieldsComponent );

	onFormChange( event: UntypedFormGroup ) {
		this.formChangeEvents.push( event );
	}
}

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

describe( 'XiriFormFieldsComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let component: XiriFormFieldsComponent;

	let httpStub: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };
	let snackbarStub: { error: ReturnType<typeof vi.fn>; handleResponse: ReturnType<typeof vi.fn> };

	beforeEach( () => {
		stubLocalStorage();

		httpStub = { get: vi.fn().mockReturnValue( of( {} ) ), post: vi.fn().mockReturnValue( of( {} ) ) };
		// handleResponse gehört zum Vertrag: XiriDataService ruft es in einem tap auf jeder Antwort.
		snackbarStub = { error: vi.fn(), handleResponse: vi.fn() };

		TestBed.configureTestingModule( {
			imports: [ TestHostComponent ],
			providers: [
				{ provide: XiriDataServiceConfig, useValue: { api: '/api/' } },
				{ provide: HttpClient, useValue: httpStub },
				{ provide: XiriSnackbarService, useValue: snackbarStub },
				{ provide: MAT_DATE_LOCALE, useValue: enUS },
				...provideDateFnsAdapter(),
			],
		} );

		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
		component = host.formFields();
	} );

	afterEach( () => {
		vi.unstubAllGlobals();
	} );

	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );

	it( 'should have empty form group initially', () => {
		expect( Object.keys( component.formGroup.controls ).length ).toBe( 0 );
	} );

	describe( 'field creation', () => {
		it( 'should create form controls for text fields', () => {
			host.fields.set( [
				{ id: 'name', type: 'text', value: 'Alice' },
				{ id: 'email', type: 'text', value: 'alice@test.com' },
			] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'name' ) ).toBeTruthy();
			expect( component.formGroup.get( 'email' ) ).toBeTruthy();
			expect( component.formGroup.get( 'name' )!.value ).toBe( 'Alice' );
		} );

		it( 'should default text field value to empty string', () => {
			host.fields.set( [ { id: 'name', type: 'text' } ] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'name' )!.value ).toBe( '' );
		} );

		it( 'should default textarea value to empty string', () => {
			host.fields.set( [ { id: 'desc', type: 'textarea' } ] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'desc' )!.value ).toBe( '' );
		} );

		it( 'should default bool value to false', () => {
			host.fields.set( [ { id: 'active', type: 'bool' } ] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'active' )!.value ).toBe( false );
		} );

		it( 'should handle email type as text with email subtype', () => {
			host.fields.set( [ { id: 'email', type: 'email', value: '' } ] );
			fixture.detectChanges();

			const fields = component.fields()!;
			expect( fields[ 0 ].type ).toBe( 'text' );
			expect( fields[ 0 ].subtype ).toBe( 'email' );
		} );

		it( 'should handle password type', () => {
			host.fields.set( [ { id: 'pwd', type: 'password', value: '' } ] );
			fixture.detectChanges();

			const fields = component.fields()!;
			expect( fields[ 0 ].subtype ).toBe( 'password' );
			expect( fields[ 0 ].pwdhide ).toBe( true );
		} );

		it( 'should set class to xcol if not specified', () => {
			host.fields.set( [ { id: 'f1', type: 'text', value: '' } ] );
			fixture.detectChanges();

			expect( component.fields()![ 0 ].class ).toBe( 'xcol' );
		} );

		it( 'should preserve custom class', () => {
			host.fields.set( [ { id: 'f1', type: 'text', value: '', class: 'custom' } ] );
			fixture.detectChanges();

			expect( component.fields()![ 0 ].class ).toBe( 'custom' );
		} );

		it( 'should apply formtype to type', () => {
			host.fields.set( [ { id: 'f1', type: 'text', formtype: 'number', value: 0 } ] );
			fixture.detectChanges();

			expect( component.fields()![ 0 ].type ).toBe( 'number' );
		} );
	} );

	describe( 'redundant placeholder', () => {
		it( 'should not repeat the label as a placeholder on a text field', () => {
			host.fields.set( [ { id: 'name', type: 'text', name: 'Full Name', value: '' } ] );
			fixture.detectChanges();

			const input: HTMLInputElement = fixture.nativeElement.querySelector( 'input' );
			expect( input.getAttribute( 'placeholder' ) ).not.toBe( 'Full Name' );
		} );
	} );

	describe( 'select field handling', () => {
		it( 'should transform array into list for select', () => {
			host.fields.set( [ {
				id: 'color',
				type: 'select',
				array: [ 'red', 'blue', 'green' ],
			} ] );
			fixture.detectChanges();

			const field = component.fields()![ 0 ];
			expect( field.list ).toBeTruthy();
			expect( field.list!.length ).toBe( 3 );
			expect( field.list![ 0 ] ).toEqual( { id: 'red', name: 'red' } );
		} );

		it( 'should set default value for model select to first item', () => {
			host.fields.set( [ {
				id: 'item',
				type: 'model',
				list: [ { id: 1, name: 'First' }, { id: 2, name: 'Second' } ],
			} ] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'item' )!.value ).toBe( 1 );
		} );

		it( 'should set default value for non-model select to empty array', () => {
			host.fields.set( [ {
				id: 'items',
				type: 'select',
				list: [ { id: 1, name: 'A' } ],
			} ] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'items' )!.value ).toEqual( [] );
		} );

		it( 'should set serverSideSearch when url is provided', () => {
			host.fields.set( [ {
				id: 'user',
				type: 'object',
				list: [ { id: 1, name: 'User' } ],
				url: '/api/search',
			} ] );
			fixture.detectChanges();

			expect( component.fields()![ 0 ].serverSideSearch ).toBe( true );
		} );
	} );

	describe( 'radio field handling', () => {
		it( 'rendert eine mat-radio-button pro Option', () => {
			host.fields.set( [ {
				id: 'anrede',
				type: 'radio',
				name: 'Anrede',
				array: [ 'f', 'm' ],
			} ] );
			fixture.detectChanges();

			const radios = fixture.nativeElement.querySelectorAll( 'mat-radio-button' );
			expect( radios.length ).toBe( 2 );
		} );

		it( 'should transform array into list for radio', () => {
			host.fields.set( [ {
				id: 'anrede',
				type: 'radio',
				array: [ 'f', 'm' ],
			} ] );
			fixture.detectChanges();

			const field = component.fields()![ 0 ];
			expect( field.list ).toEqual( [ { id: 'f', name: 'f' }, { id: 'm', name: 'm' } ] );
			expect( field.multiple ).toBe( false );
		} );

		it( 'should default value to first list item', () => {
			host.fields.set( [ {
				id: 'anrede',
				type: 'radio',
				list: [ { id: 'f', name: 'Frau' }, { id: 'm', name: 'Herr' } ],
			} ] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'anrede' )!.value ).toBe( 'f' );
		} );

		it( 'should update the form control when the user clicks a radio option in the DOM', () => {
			host.fields.set( [ {
				id: 'anrede',
				type: 'radio',
				list: [ { id: 'f', name: 'Frau' }, { id: 'm', name: 'Herr' } ],
			} ] );
			fixture.detectChanges();

			const inputs: NodeListOf<HTMLInputElement> =
				fixture.nativeElement.querySelectorAll( 'mat-radio-button input[type="radio"]' );
			expect( inputs.length ).toBe( 2 );

			inputs[ 1 ].click();
			fixture.detectChanges();

			expect( component.formGroup.get( 'anrede' )!.value ).toBe( 'm' );
		} );
	} );

	describe( 'treeselect field handling', () => {
		it( 'should set tree=true for treeselect', () => {
			host.fields.set( [ {
				id: 'tree',
				type: 'treeselect',
				value: [],
			} ] );
			fixture.detectChanges();

			expect( component.fields()![ 0 ].tree ).toBe( true );
		} );

		it( 'should set tree=false for multiselect', () => {
			host.fields.set( [ {
				id: 'multi',
				type: 'multiselect',
				value: [],
			} ] );
			fixture.detectChanges();

			expect( component.fields()![ 0 ].tree ).toBe( false );
			expect( component.fields()![ 0 ].type ).toBe( 'treeselect' );
		} );
	} );

	describe( 'volume and date fields', () => {
		it( 'should force required on volume', () => {
			host.fields.set( [ { id: 'vol', type: 'volume', value: [ 0, 0, 0 ] } ] );
			fixture.detectChanges();

			expect( component.fields()![ 0 ].required ).toBe( true );
		} );

		it( 'should set type to date for datetime', () => {
			host.fields.set( [ { id: 'dt', type: 'datetime', value: '' } ] );
			fixture.detectChanges();

			expect( component.fields()![ 0 ].type ).toBe( 'date' );
			expect( component.fields()![ 0 ].class ).toContain( 'datetime' );
		} );

		it( 'should keep type yearmonth and add yearmonth class', () => {
			host.fields.set( [ { id: 'ym', type: 'yearmonth', value: '' } ] );
			fixture.detectChanges();

			expect( component.fields()![ 0 ].type ).toBe( 'yearmonth' );
			expect( component.fields()![ 0 ].class ).toContain( 'yearmonth' );
			expect( component.fields()![ 0 ].required ).toBe( true );
		} );

		it( 'should not force required when explicitly set false on yearmonth', () => {
			host.fields.set( [ { id: 'ym', type: 'yearmonth', required: false, value: '' } ] );
			fixture.detectChanges();
			expect( component.fields()![ 0 ].required ).toBe( false );
		} );
	} );

	describe( 'bool field handling', () => {
		it( 'should use placeholder as name when name is undefined', () => {
			host.fields.set( [ {
				id: 'check',
				type: 'bool',
				placeholder: 'Is Active',
			} ] );
			fixture.detectChanges();

			expect( component.fields()![ 0 ].name ).toBe( 'Is Active' );
		} );
	} );

	describe( 'validations', () => {
		it( 'should add required validator when field.required is true', () => {
			host.fields.set( [ {
				id: 'name',
				type: 'text',
				required: true,
				value: '',
			} ] );
			fixture.detectChanges();

			const control = component.formGroup.get( 'name' )!;
			expect( control.valid ).toBe( false );
			control.setValue( 'test' );
			expect( control.valid ).toBe( true );
		} );

		it( 'should add minLength validator', () => {
			host.fields.set( [ {
				id: 'code',
				type: 'text',
				min: 3,
				value: 'ab',
			} ] );
			fixture.detectChanges();

			const control = component.formGroup.get( 'code' )!;
			expect( control.valid ).toBe( false );
			control.setValue( 'abc' );
			expect( control.valid ).toBe( true );
		} );

		it( 'should add maxLength validator', () => {
			host.fields.set( [ {
				id: 'code',
				type: 'text',
				max: 5,
				value: '123456',
			} ] );
			fixture.detectChanges();

			const control = component.formGroup.get( 'code' )!;
			expect( control.valid ).toBe( false );
			control.setValue( '12345' );
			expect( control.valid ).toBe( true );
		} );

		it( 'should add min validator for number type', () => {
			host.fields.set( [ {
				id: 'count',
				type: 'number',
				min: 5,
				value: 3,
			} ] );
			fixture.detectChanges();

			const control = component.formGroup.get( 'count' )!;
			expect( control.valid ).toBe( false );
			control.setValue( 10 );
			expect( control.valid ).toBe( true );
		} );

		it( 'should add max validator for number type', () => {
			host.fields.set( [ {
				id: 'count',
				type: 'number',
				max: 10,
				value: 15,
			} ] );
			fixture.detectChanges();

			const control = component.formGroup.get( 'count' )!;
			expect( control.valid ).toBe( false );
			control.setValue( 8 );
			expect( control.valid ).toBe( true );
		} );

		it( 'should add pattern validator', () => {
			host.fields.set( [ {
				id: 'code',
				type: 'text',
				pattern: '^[A-Z]+$',
				value: 'abc',
			} ] );
			fixture.detectChanges();

			const control = component.formGroup.get( 'code' )!;
			expect( control.valid ).toBe( false );
			control.setValue( 'ABC' );
			expect( control.valid ).toBe( true );
		} );

		it( 'should add email validator for email subtype', () => {
			host.fields.set( [ {
				id: 'email',
				type: 'email',
				value: 'invalid',
			} ] );
			fixture.detectChanges();

			const control = component.formGroup.get( 'email' )!;
			expect( control.valid ).toBe( false );
			control.setValue( 'test@example.com' );
			expect( control.valid ).toBe( true );
		} );

		it( 'should skip custom validations if validations array is provided', () => {
			host.fields.set( [ {
				id: 'custom',
				type: 'text',
				value: '',
				validations: [],
			} ] );
			fixture.detectChanges();

			const control = component.formGroup.get( 'custom' )!;
			// No validators, so empty string should be valid
			expect( control.valid ).toBe( true );
		} );
	} );

	describe( 'formChange output', () => {
		it( 'should emit formChange on value changes', async () => {
			host.fields.set( [ { id: 'name', type: 'text', value: '' } ] );
			fixture.detectChanges();
			await new Promise( r => queueMicrotask( () => r( undefined ) ) );
			host.formChangeEvents = [];

			component.formGroup.get( 'name' )!.setValue( 'new value' );
			await new Promise( r => queueMicrotask( () => r( undefined ) ) );

			expect( host.formChangeEvents.length ).toBeGreaterThan( 0 );
		} );

		it( 'should not emit when value does not change', async () => {
			host.fields.set( [ { id: 'name', type: 'text', value: 'same' } ] );
			fixture.detectChanges();
			await new Promise( r => queueMicrotask( () => r( undefined ) ) );
			host.formChangeEvents = [];

			// Set same value
			component.formGroup.get( 'name' )!.setValue( 'same' );
			await new Promise( r => queueMicrotask( () => r( undefined ) ) );

			expect( host.formChangeEvents.length ).toBe( 0 );
		} );
	} );

	describe( 'isFieldVisible / showWhen', () => {
		it( 'should return true when no showWhen condition', () => {
			host.fields.set( [
				{ id: 'name', type: 'text', value: '' },
			] );
			fixture.detectChanges();

			const fields = component.fields()!;
			expect( component.isFieldVisible( fields[ 0 ] ) ).toBe( true );
		} );

		it( 'should evaluate equals condition', () => {
			host.fields.set( [
				{ id: 'type', type: 'text', value: 'A' },
				{
					id: 'detail',
					type: 'text',
					value: '',
					showWhen: { field: 'type', operator: 'equals', value: 'A' },
				},
			] );
			fixture.detectChanges();

			const fields = component.fields()!;
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'type' )!.setValue( 'B' );
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( false );
		} );

		it( 'should evaluate notEquals condition', () => {
			host.fields.set( [
				{ id: 'type', type: 'text', value: 'A' },
				{
					id: 'detail',
					type: 'text',
					value: '',
					showWhen: { field: 'type', operator: 'notEquals', value: 'B' },
				},
			] );
			fixture.detectChanges();

			const fields = component.fields()!;
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'type' )!.setValue( 'B' );
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( false );
		} );

		it( 'should evaluate contains condition', () => {
			host.fields.set( [
				{ id: 'tags', type: 'text', value: 'hello world' },
				{
					id: 'detail',
					type: 'text',
					value: '',
					showWhen: { field: 'tags', operator: 'contains', value: 'world' },
				},
			] );
			fixture.detectChanges();

			const fields = component.fields()!;
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'tags' )!.setValue( 'hello' );
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( false );
		} );

		it( 'should evaluate greaterThan condition', () => {
			host.fields.set( [
				{ id: 'count', type: 'number', value: 10 },
				{
					id: 'detail',
					type: 'text',
					value: '',
					showWhen: { field: 'count', operator: 'greaterThan', value: 5 },
				},
			] );
			fixture.detectChanges();

			const fields = component.fields()!;
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'count' )!.setValue( 3 );
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( false );
		} );

		it( 'should evaluate lessThan condition', () => {
			host.fields.set( [
				{ id: 'count', type: 'number', value: 3 },
				{
					id: 'detail',
					type: 'text',
					value: '',
					showWhen: { field: 'count', operator: 'lessThan', value: 5 },
				},
			] );
			fixture.detectChanges();

			const fields = component.fields()!;
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'count' )!.setValue( 10 );
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( false );
		} );

		it( 'should evaluate in condition', () => {
			host.fields.set( [
				{ id: 'status', type: 'text', value: 'active' },
				{
					id: 'detail',
					type: 'text',
					value: '',
					showWhen: { field: 'status', operator: 'in', value: [ 'active', 'pending' ] },
				},
			] );
			fixture.detectChanges();

			const fields = component.fields()!;
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'status' )!.setValue( 'closed' );
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( false );
		} );

		it( 'should evaluate notEmpty condition', () => {
			host.fields.set( [
				{ id: 'name', type: 'text', value: 'filled' },
				{
					id: 'detail',
					type: 'text',
					value: '',
					showWhen: { field: 'name', operator: 'notEmpty' },
				},
			] );
			fixture.detectChanges();

			const fields = component.fields()!;
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'name' )!.setValue( '' );
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( false );
		} );

		it( 'should evaluate multiple conditions (AND)', () => {
			host.fields.set( [
				{ id: 'type', type: 'text', value: 'A' },
				{ id: 'status', type: 'text', value: 'active' },
				{
					id: 'detail',
					type: 'text',
					value: '',
					showWhen: [
						{ field: 'type', operator: 'equals', value: 'A' },
						{ field: 'status', operator: 'equals', value: 'active' },
					],
				},
			] );
			fixture.detectChanges();

			const fields = component.fields()!;
			expect( component.isFieldVisible( fields[ 2 ] ) ).toBe( true );

			component.formGroup.get( 'type' )!.setValue( 'B' );
			expect( component.isFieldVisible( fields[ 2 ] ) ).toBe( false );
		} );

		it( 'should return false when referenced field does not exist', () => {
			host.fields.set( [
				{
					id: 'detail',
					type: 'text',
					value: '',
					showWhen: { field: 'nonexistent', operator: 'equals', value: 'x' },
				},
			] );
			fixture.detectChanges();

			const fields = component.fields()!;
			expect( component.isFieldVisible( fields[ 0 ] ) ).toBe( false );
		} );

		it( 'should return true for unknown operator', () => {
			host.fields.set( [
				{ id: 'name', type: 'text', value: 'test' },
				{
					id: 'detail',
					type: 'text',
					value: '',
					showWhen: { field: 'name', operator: 'unknownOp' as XiriFormFieldConditionOperator, value: 'x' },
				},
			] );
			fixture.detectChanges();

			const fields = component.fields()!;
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );
		} );
	} );

	describe( 'collapsible sections', () => {
		it( 'should toggle section collapsed state', () => {
			const header: XiriFormField = {
				id: 'section',
				type: 'header',
				collapsible: true,
			};
			host.fields.set( [ header, { id: 'name', type: 'text', value: '' } ] );
			fixture.detectChanges();

			component.toggleSection( header );
			expect( component.isSectionCollapsed( 'section' ) ).toBe( true );

			component.toggleSection( header );
			expect( component.isSectionCollapsed( 'section' ) ).toBe( false );
		} );

		it( 'should hide fields in collapsed section', () => {
			const header: XiriFormField = {
				id: 'section',
				type: 'header',
				collapsible: true,
			};
			const field: XiriFormField = { id: 'name', type: 'text', value: '' };
			host.fields.set( [ header, field ] );
			fixture.detectChanges();

			component.toggleSection( header );
			expect( component.isFieldVisible( field ) ).toBe( false );
		} );

		// Ein Options-Reload rendert gepatchte Felder als Kopie, damit die Kind-Komponenten eine
		// neue Input-Identität sehen. Die Section-Zuordnung muss dafür über die ID laufen — eine
		// Identitätssuche findet die Kopie nicht und zeigt das Feld fälschlich an.
		it( 'should hide a copied field in a collapsed section', () => {
			const header: XiriFormField = {
				id: 'section',
				type: 'header',
				collapsible: true,
			};
			const field: XiriFormField = { id: 'name', type: 'text', value: '' };
			host.fields.set( [ header, field ] );
			fixture.detectChanges();

			component.toggleSection( header );
			expect( component.isFieldVisible( { ...field } ) ).toBe( false );
		} );

		it( 'should show fields after divider even if section is collapsed', () => {
			const header: XiriFormField = {
				id: 'section',
				type: 'header',
				collapsible: true,
			};
			const divider: XiriFormField = { id: 'div', type: 'divider' };
			const field: XiriFormField = { id: 'name', type: 'text', value: '' };
			host.fields.set( [ header, divider, field ] );
			fixture.detectChanges();

			component.toggleSection( header );
			expect( component.isFieldVisible( field ) ).toBe( true );
		} );

		it( 'should keep stacked sections as siblings when one is collapsed', () => {
			const h1: XiriFormField = { id: 'h1', type: 'header', collapsible: true };
			const b1: XiriFormField = { id: 'b1', type: 'text', value: '' };
			const h2: XiriFormField = { id: 'h2', type: 'header', collapsible: true };
			const b2: XiriFormField = { id: 'b2', type: 'text', value: '' };
			host.fields.set( [ h1, b1, h2, b2 ] );
			fixture.detectChanges();

			component.toggleSection( h1 );

			// Inhalt der ersten Section ist versteckt ...
			expect( component.isFieldVisible( b1 ) ).toBe( false );
			// ... aber die zweite Section bleibt als Geschwister sichtbar (kein Nesting).
			expect( component.isFieldVisible( h2 ) ).toBe( true );
			expect( component.isFieldVisible( b2 ) ).toBe( true );
		} );

		it( 'should not nest initially collapsed sections', () => {
			const h1: XiriFormField = { id: 'h1', type: 'header', collapsible: true, collapsed: false };
			const b1: XiriFormField = { id: 'b1', type: 'text', value: '' };
			const h2: XiriFormField = { id: 'h2', type: 'header', collapsible: true, collapsed: true };
			const b2: XiriFormField = { id: 'b2', type: 'text', value: '' };
			const h3: XiriFormField = { id: 'h3', type: 'header', collapsible: true, collapsed: true };
			const b3: XiriFormField = { id: 'b3', type: 'text', value: '' };
			host.fields.set( [ h1, b1, h2, b2, h3, b3 ] );
			fixture.detectChanges();

			// Alle drei Header sind sichtbar (gestapelt) ...
			expect( component.isFieldVisible( h1 ) ).toBe( true );
			expect( component.isFieldVisible( h2 ) ).toBe( true );
			expect( component.isFieldVisible( h3 ) ).toBe( true );
			// ... nur die Inhalte der initial eingeklappten Sections sind versteckt.
			expect( component.isFieldVisible( b1 ) ).toBe( true );
			expect( component.isFieldVisible( b2 ) ).toBe( false );
			expect( component.isFieldVisible( b3 ) ).toBe( false );
		} );

		it( 'should toggle an inner section without affecting the outer one', () => {
			const h1: XiriFormField = { id: 'h1', type: 'header', collapsible: true };
			const b1: XiriFormField = { id: 'b1', type: 'text', value: '' };
			const h2: XiriFormField = { id: 'h2', type: 'header', collapsible: true };
			const b2: XiriFormField = { id: 'b2', type: 'text', value: '' };
			const h3: XiriFormField = { id: 'h3', type: 'header', collapsible: true };
			host.fields.set( [ h1, b1, h2, b2, h3 ] );
			fixture.detectChanges();

			component.toggleSection( h2 );

			// Toggeln von Section B beeinflusst A und C nicht.
			expect( component.isFieldVisible( h1 ) ).toBe( true );
			expect( component.isFieldVisible( b1 ) ).toBe( true );
			expect( component.isFieldVisible( h3 ) ).toBe( true );
			// Nur der Inhalt von B ist versteckt.
			expect( component.isFieldVisible( b2 ) ).toBe( false );
		} );
	} );

	describe( 'disabled state', () => {
		it( 'should disable form group when disabled input is true', () => {
			host.fields.set( [ { id: 'name', type: 'text', value: '' } ] );
			fixture.detectChanges();

			host.disabled.set( true );
			fixture.detectChanges();

			expect( component.formGroup.disabled ).toBe( true );
		} );

		it( 'should re-enable form group when disabled input is false', () => {
			host.fields.set( [ { id: 'name', type: 'text', value: '' } ] );
			fixture.detectChanges();

			host.disabled.set( true );
			fixture.detectChanges();
			host.disabled.set( false );
			fixture.detectChanges();

			expect( component.formGroup.enabled ).toBe( true );
		} );

		it( 'should keep backend-disabled fields disabled after re-enable', () => {
			host.fields.set( [
				{ id: 'readonly', type: 'text', value: 'locked', disabled: true },
				{ id: 'editable', type: 'text', value: '' },
			] );
			fixture.detectChanges();

			host.disabled.set( true );
			fixture.detectChanges();
			host.disabled.set( false );
			fixture.detectChanges();

			expect( component.formGroup.get( 'readonly' )!.disabled ).toBe( true );
			expect( component.formGroup.get( 'editable' )!.enabled ).toBe( true );
		} );

		// Die zusammengesetzten Feldtypen halten ihre Eingaben in einer eigenen inneren FormGroup.
		// control.disable() erreicht die nur über setDisabledState() des CVA -- und das war bei den
		// meisten ein leerer Rumpf, die Felder blieben trotz gesperrtem Control bedienbar.
		describe( 'control.disable() erreicht jeden Feldtyp', () => {

			// Die wertverändernden Elemente pro Feldtyp. Ein einzelnes Element zu prüfen reicht
			// nicht: der Treeselect hat Blatt- und Gruppen-Checkboxen, die Zeitbereiche zusätzlich
			// mat-selects für Stunde und Minute.
			//
			// Der Treeselect bekommt bewusst einen Gruppenknoten mit Kind, sonst rendert nur der
			// eine der beiden mat-tree-node-Zweige.
			// backendDisabled: false, wo field.disabled die Komponente gar nicht erreicht.
			const CASES: {
				type: string, field: Partial<XiriFormField>, selector: string, backendDisabled?: boolean
			}[] = [
				{ type: 'date', field: {}, selector: 'input' },
				{ type: 'yearmonth', field: {}, selector: 'input' },
				{ type: 'daterange', field: {}, selector: 'input' },
				{ type: 'datetimerange', field: {}, selector: 'input, mat-select' },
				{ type: 'volume', field: {}, selector: 'input' },
				{ type: 'file', field: {}, selector: 'input' },
				// timelimit bekommt in form-fields.component.html kein [field]; seine deklarative
				// Sperre laeuft ausschliesslich ueber den @Input() disabled.
				{ type: 'timelimit', field: {}, selector: 'input[type=checkbox], mat-select', backendDisabled: false },
				{
					type: 'treeselect',
					field: {
						list: [ { id: 1, name: 'Gruppe', isGroup: true, children: [ { id: 2, name: 'Alpha' } ] } ],
						search: false,
						tree: true,
					},
					selector: 'mat-checkbox input',
				},
				{
					type: 'chips',
					field: { value: [ 'Alpha' ], list: [ { id: 'Alpha', name: 'Alpha' } ] },
					selector: 'mat-form-field input, mat-chip-row button',
				},
			];

			// mat-select ist kein natives Element; Material spiegelt den Zustand in aria-disabled.
			function elements( selector: string ): { disabled: boolean }[] {
				return Array.from( fixture.nativeElement.querySelectorAll( selector ) )
				            .map( ( e ) => {
					            const el = e as HTMLElement & { disabled?: boolean };
					            return {
						            disabled: el.disabled === true
						                      || el.getAttribute( 'aria-disabled' ) === 'true'
						                      || el.hasAttribute( 'disabled' ),
					            };
				            } );
			}

			for ( const c of CASES ) {
				it( `sperrt ${ c.type } bei control.disable()`, () => {
					host.fields.set( [ { id: 'f', type: c.type, ...c.field } as XiriFormField ] );
					fixture.detectChanges();

					const before = elements( c.selector );
					expect( before.length ).toBeGreaterThan( 0 );
					expect( before.every( e => e.disabled ) ).toBe( false );

					component.formGroup.get( 'f' )!.disable();
					fixture.detectChanges();

					expect( elements( c.selector ).every( e => e.disabled ) ).toBe( true );
				} );

				it( `gibt ${ c.type } bei control.enable() wieder frei`, () => {
					host.fields.set( [ { id: 'f', type: c.type, ...c.field } as XiriFormField ] );
					fixture.detectChanges();

					component.formGroup.get( 'f' )!.disable();
					fixture.detectChanges();
					component.formGroup.get( 'f' )!.enable();
					fixture.detectChanges();

					expect( elements( c.selector ).some( e => e.disabled ) ).toBe( false );
				} );
			}

			// Der wichtigste Test des Umbaus: Angular ruft beim Control-Setup setDisabledState(false)
			// (forms.mjs:1886, callSetDisabledState ist per Default 'always'), und zwar NACH dem
			// field-Input. Ohne getrennt gehaltene Quellen hebt das ein Backend-disabled wieder auf.
			// Über alle Feldtypen, weil jeder seine eigene Quellentrennung mitbringt.
			for ( const c of CASES.filter( x => x.backendDisabled !== false ) ) {
				it( `lässt setDisabledState(false) beim Setup Backend-disabled von ${ c.type } nicht aufheben`, () => {
					host.fields.set( [
						{ id: 'f', type: c.type, disabled: true, ...c.field } as XiriFormField,
					] );
					fixture.detectChanges();

					expect( elements( c.selector ).every( e => e.disabled ) ).toBe( true );
				} );

				// doCheckLogic() schrieb bei einem Wechsel der äußeren Control-Instanz direkt auf
				// `disabled`. Mit `track field.id` bleibt die Kindkomponente erhalten, während
				// createControl() ein frisches enabled Control anlegt -- das darf nicht öffnen.
				it( `hält Backend-disabled von ${ c.type } beim Ersetzen der Feldliste fest`, () => {
					const field = () => ( { id: 'f', type: c.type, disabled: true, ...c.field } as XiriFormField );

					host.fields.set( [ field() ] );
					fixture.detectChanges();
					host.fields.set( [ field() ] );
					fixture.detectChanges();

					expect( elements( c.selector ).every( e => e.disabled ) ).toBe( true );
				} );
			}

			// `timelimit` bekommt kein [field], seine deklarative Sperre läuft über den
			// @Input() disabled. Der ist dieselbe Quelle und darf vom Setup ebenso wenig
			// überschrieben werden.
			it( 'lässt setDisabledState(false) einen gesetzten [disabled]-Input nicht aufheben', () => {
				host.fields.set( [ { id: 'f', type: 'date', value: null } as XiriFormField ] );
				fixture.detectChanges();

				const child = fixture.debugElement.query( By.directive( XiriDateComponent ) )
				                     .componentInstance as XiriDateComponent;
				child.disabled = true;
				fixture.detectChanges();

				// Simuliert, was Angular beim Setup eines enabled Controls tut.
				child.setDisabledState( false );
				fixture.detectChanges();

				expect( child.disabled ).toBe( true );
			} );

			// Ein reiner Zustandswechsel darf keinen Wert nach außen schreiben. Nicht über
			// formChange prüfen: die Dedup über JSON.stringify(formGroup.value) verdeckt das,
			// weil ein deaktiviertes Control dort ohnehin fehlt.
			it( 'schreibt beim Sperren keinen Wert über den CVA zurück', () => {
				host.fields.set( [ { id: 'f', type: 'date', value: null } as XiriFormField ] );
				fixture.detectChanges();

				const control = component.formGroup.get( 'f' )!;
				const emissions: unknown[] = [];
				control.valueChanges.subscribe( v => emissions.push( v ) );

				control.disable();
				fixture.detectChanges();

				// Genau die eine Emission, die disable() selbst auslöst -- kein zusätzlicher
				// Rückschreiber aus der Feldkomponente.
				expect( emissions.length ).toBe( 1 );
			} );

			// volume erbt nicht von XiriFieldMain, der Guard in runChangeValue greift dort nicht.
			// Es plant sein onChange über setTimeout -- zwischen Planung und Callback kann gesperrt
			// worden sein.
			it( 'verwirft einen bereits geplanten volume-Rückschreiber, wenn zwischendurch gesperrt wird', () => {
				vi.useFakeTimers();
				try {
					host.fields.set( [ { id: 'f', type: 'volume', value: null } as XiriFormField ] );
					fixture.detectChanges();

					const child = fixture.debugElement.query( By.directive( XiriVolumeComponent ) )
					                     .componentInstance as XiriVolumeComponent;
					const control = component.formGroup.get( 'f' )!;
					const emissions: unknown[] = [];

					child.parts.get( 'voll' )!.setValue( 5 );
					control.valueChanges.subscribe( v => emissions.push( v ) );
					control.disable();
					vi.advanceTimersByTime( 50 );

					expect( emissions.length ).toBe( 1 );
				} finally {
					vi.useRealTimers();
				}
			} );

			describe( 'Guards gegen Wege, die am gesperrten Control vorbeigehen', () => {

				function chips(): XiriChipsComponent {
					host.fields.set( [ {
						id: 'f', type: 'chips', value: [ 'Alpha' ],
						list: [ { id: 'Beta', name: 'Beta' } ],
					} as XiriFormField ] );
					fixture.detectChanges();
					component.formGroup.get( 'f' )!.disable();
					fixture.detectChanges();
					return fixture.debugElement.query( By.directive( XiriChipsComponent ) )
					              .componentInstance as XiriChipsComponent;
				}

				// matChipInputAddOnBlur übernimmt ausstehenden Text beim Fokusverlust.
				it( 'chips.add() fügt im gesperrten Zustand nichts hinzu', () => {
					const c = chips();
					c.add( { value: 'Neu', chipInput: { clear: () => { /* noop */ } } } as never );

					expect( component.formGroup.get( 'f' )!.value ).toEqual( [ 'Alpha' ] );
				} );

				// Material leitet Delete/Backspace am fokussierten Chip weiter und prüft nur
				// `removable`, nicht den Disabled-Zustand.
				it( 'chips.remove() entfernt im gesperrten Zustand nichts', () => {
					const c = chips();
					c.remove( 'Alpha' );

					expect( component.formGroup.get( 'f' )!.value ).toEqual( [ 'Alpha' ] );
				} );

				// Ein bereits offenes Autocomplete-Overlay kann nach dem Sperren noch liefern.
				it( 'chips.selected() übernimmt im gesperrten Zustand keine Option', () => {
					const c = chips();
					c.selected( { option: { value: { id: 'Beta', name: 'Beta' } } } as never );

					expect( component.formGroup.get( 'f' )!.value ).toEqual( [ 'Alpha' ] );
				} );

				// Der Dateidialog hängt am mat-form-field, nicht am Input -- ein gesperrtes `parts`
				// blockiert ihn nicht.
				it( 'file öffnet im gesperrten Zustand keinen Dateidialog', () => {
					host.fields.set( [ { id: 'f', type: 'file' } as XiriFormField ] );
					fixture.detectChanges();
					component.formGroup.get( 'f' )!.disable();
					fixture.detectChanges();

					let clicks = 0;
					const formField = fixture.nativeElement.querySelector( 'mat-form-field.fileselect' );
					fixture.nativeElement.querySelector( 'input[type=file]' )
					       .addEventListener( 'click', () => clicks++ );
					formField.click();

					expect( clicks ).toBe( 0 );
				} );
			} );
		} );
	} );

	describe( 'check observable', () => {
		it( 'should validate all form fields on check', () => {
			host.fields.set( [
				{ id: 'name', type: 'text', required: true, value: '' },
			] );
			fixture.detectChanges();

			host.checkSubject.next();
			fixture.detectChanges();

			expect( component.formGroup.dirty ).toBe( true );
		} );
	} );

	describe( 'fields signal re-creation', () => {
		it( 'should remove old controls and create new ones when fields change', async () => {
			host.fields.set( [ { id: 'old', type: 'text', value: 'x' } ] );
			fixture.detectChanges();
			await new Promise( r => queueMicrotask( () => r( undefined ) ) );

			expect( component.formGroup.get( 'old' ) ).toBeTruthy();

			host.fields.set( [ { id: 'new', type: 'text', value: 'y' } ] );
			fixture.detectChanges();
			await new Promise( r => queueMicrotask( () => r( undefined ) ) );

			expect( component.formGroup.get( 'old' ) ).toBeNull();
			expect( component.formGroup.get( 'new' ) ).toBeTruthy();
		} );
	} );

	describe( 'null form input', () => {
		it( 'should return null fields when form is null', () => {
			host.fields.set( null );
			fixture.detectChanges();

			expect( component.fields() ).toBeNull();
		} );
	} );

	describe( 'objectlist type', () => {
		it( 'should set multiple=true for objectlist', () => {
			host.fields.set( [ {
				id: 'items',
				type: 'objectlist',
				subtype: 'select',
				value: [],
				list: [ { id: 1, name: 'A' } ],
			} ] );
			fixture.detectChanges();

			expect( component.fields()![ 0 ].multiple ).toBe( true );
		} );

		it( 'should convert objectlist without subtype to treeselect', () => {
			host.fields.set( [ {
				id: 'items',
				type: 'objectlist',
				value: [],
			} ] );
			fixture.detectChanges();

			expect( component.fields()![ 0 ].type ).toBe( 'treeselect' );
			expect( component.fields()![ 0 ].tree ).toBe( true );
		} );
	} );

	describe( 'question type', () => {
		it( 'should set value from question property', () => {
			host.fields.set( [ {
				id: 'q',
				type: 'question',
				question: 'Are you sure?',
			} ] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'q' )!.value ).toBe( 'Are you sure?' );
		} );
	} );

	describe( 'validation messages (i18n)', () => {
		function createLocalizedFixture( lang: 'de' | 'en' ) {
			TestBed.resetTestingModule();
			stubLocalStorage();
			TestBed.configureTestingModule( {
				imports: [ TestHostComponent ],
				providers: [
					{ provide: XiriDataServiceConfig, useValue: { api: '/api/' } },
					{ provide: HttpClient, useValue: { get: vi.fn().mockReturnValue( of( {} ) ), post: vi.fn().mockReturnValue( of( {} ) ) } },
					{ provide: XiriSnackbarService, useValue: { error: vi.fn() } },
					{ provide: MAT_DATE_LOCALE, useValue: enUS },
					...provideDateFnsAdapter(),
				],
			} );
			TestBed.inject( XiriLocaleService ).setLanguage( lang );
			const localFixture = TestBed.createComponent( TestHostComponent );
			const localHost = localFixture.componentInstance;
			localFixture.detectChanges();
			return { fixture: localFixture, host: localHost, component: localHost.formFields() };
		}

		it( 'shows the German required message for de', () => {
			const { fixture: f, host: h, component: c } = createLocalizedFixture( 'de' );
			h.fields.set( [ { id: 'name', type: 'text', required: true, value: '' } ] );
			f.detectChanges();

			const validation = c.fields()![ 0 ].validations!.find( v => v.id === 'required' )!;
			expect( validation.message ).toBe( 'Pflichtfeld – bitte ausfüllen' );
		} );

		it( 'shows the English required message for en', () => {
			const { fixture: f, host: h, component: c } = createLocalizedFixture( 'en' );
			h.fields.set( [ { id: 'name', type: 'text', required: true, value: '' } ] );
			f.detectChanges();

			const validation = c.fields()![ 0 ].validations!.find( v => v.id === 'required' )!;
			expect( validation.message ).toBe( 'Required field' );
		} );

		it( 'includes the configured limit in the German maxlength message', () => {
			const { fixture: f, host: h, component: c } = createLocalizedFixture( 'de' );
			h.fields.set( [ { id: 'code', type: 'text', max: 5, value: '' } ] );
			f.detectChanges();

			const validation = c.fields()![ 0 ].validations!.find( v => v.id === 'maxlength' )!;
			expect( validation.message ).toBe( 'Maximal 5 Zeichen erlaubt' );
		} );

		it( 'includes the configured limit in the English minlength message', () => {
			const { fixture: f, host: h, component: c } = createLocalizedFixture( 'en' );
			h.fields.set( [ { id: 'code', type: 'text', min: 3, value: '' } ] );
			f.detectChanges();

			const validation = c.fields()![ 0 ].validations!.find( v => v.id === 'minlength' )!;
			expect( validation.message ).toBe( 'At least 3 characters required' );
		} );

		it( 'renders the localized minLength message in the mat-error element (verifies the hasError(vali.id) key match)', () => {
			const { fixture: f, host: h, component: c } = createLocalizedFixture( 'de' );
			h.fields.set( [ { id: 'code', type: 'text', min: 3, value: 'ab' } ] );
			f.detectChanges();

			c.formGroup.get( 'code' )!.markAsTouched();
			f.detectChanges();

			const matError: HTMLElement | null = f.nativeElement.querySelector( 'mat-error' );
			expect( matError?.textContent ).toContain( 'Mindestens 3 Zeichen erforderlich' );
		} );

		it( 'wechselt Validierungs-Fehlertexte reaktiv bei setLanguage (ohne Reload)', () => {
			const locale = TestBed.inject( XiriLocaleService );
			locale.setLanguage( 'de' );

			host.fields.set( [ { id: 'name', type: 'text', required: true, value: '' } ] );
			fixture.detectChanges();
			component.formGroup.get( 'name' )!.markAsTouched();
			fixture.detectChanges();

			const errDe = fixture.nativeElement.querySelector( 'mat-error' )?.textContent ?? '';
			expect( errDe ).toContain( 'Pflichtfeld' );

			locale.setLanguage( 'en' );
			fixture.detectChanges();

			const errEn = fixture.nativeElement.querySelector( 'mat-error' )?.textContent ?? '';
			expect( errEn ).toContain( 'Required' );
		} );

		it( 'zeigt Validierungstexte einer client-registrierten Custom-Sprache', () => {
			const locale = TestBed.inject( XiriLocaleService );
			locale.registerLanguage( 'fr', {
				localeString: 'fr-FR',
				validationMessages: {
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
				},
			} );
			locale.setLanguage( 'fr' );

			host.fields.set( [ { id: 'name', type: 'text', required: true, value: '' } ] );
			fixture.detectChanges();
			component.formGroup.get( 'name' )!.markAsTouched();
			fixture.detectChanges();

			const err = fixture.nativeElement.querySelector( 'mat-error' )?.textContent ?? '';
			expect( err ).toContain( 'Champ requis' );
		} );
	} );

	describe( 'reines Text-Formular ohne DateAdapter', () => {
		it( 'rendert ohne NG0201, wenn kein provideDateFnsAdapter() bereitgestellt wird', () => {
			TestBed.resetTestingModule();
			stubLocalStorage();
			TestBed.configureTestingModule( {
				imports: [ TestHostComponent ],
				providers: [
					{ provide: XiriDataServiceConfig, useValue: { api: '/api/' } },
					{ provide: HttpClient, useValue: { get: vi.fn().mockReturnValue( of( {} ) ), post: vi.fn().mockReturnValue( of( {} ) ) } },
					{ provide: XiriSnackbarService, useValue: { error: vi.fn() } },
				],
			} );

			const textOnlyFixture = TestBed.createComponent( TestHostComponent );
			const textOnlyHost = textOnlyFixture.componentInstance;
			textOnlyHost.fields.set( [ { id: 'name', type: 'text', required: true, value: '' } ] );

			expect( () => textOnlyFixture.detectChanges() ).not.toThrow();
			expect( textOnlyFixture.componentInstance.formFields() ).toBeTruthy();
		} );
	} );

	describe( 'auto focus', () => {
		it( 'should focus the first visible interactive field, skipping a leading non-interactive header', async () => {
			host.fields.set( [
				{ id: 'section', type: 'header', value: 'Section' },
				{ id: 'name', type: 'text', value: '' },
			] );
			fixture.detectChanges();
			await fixture.whenStable();

			const input: HTMLInputElement = fixture.nativeElement.querySelector( 'input' );
			expect( document.activeElement ).toBe( input );
		} );

		it( 'should skip a leading hidden field and focus the next visible field', async () => {
			host.fields.set( [
				{ id: 'token', type: 'text', value: '', hide: true },
				{ id: 'name', type: 'text', value: '' },
			] );
			fixture.detectChanges();
			await fixture.whenStable();

			const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll( 'input' );
			expect( inputs.length ).toBe( 2 );
			expect( document.activeElement ).toBe( inputs[ 1 ] );
		} );

		it( 'should focus the input, not a leading collapsible header toggle', async () => {
			host.fields.set( [
				{ id: 'section', type: 'header', value: 'Section', collapsible: true },
				{ id: 'name', type: 'text', value: '' },
			] );
			fixture.detectChanges();
			await fixture.whenStable();

			const input: HTMLInputElement = fixture.nativeElement.querySelector( 'input' );
			expect( document.activeElement ).toBe( input );
		} );
	} );

	// Ein Feld mit `reloadOn` hängt inhaltlich von anderen Feldern ab: ändert sich einer dieser
	// Werte, postet die Komponente die Trigger-Werte an `reloadUrl` und merged den zurückgelieferten
	// Feld-Patch. Nur die Trigger-Werte gehen raus — nicht das ganze Formular.
	describe( 'reloadOn', () => {

		const RELOAD_URL = '/Thing/FormReload';

		function statusField( value: unknown = 1 ): XiriFormField {
			return {
				id: 'status', type: 'select', required: false, search: false, value,
				list: [ { id: 1, name: 'aktiv' }, { id: 2, name: 'inaktiv' } ],
			};
		}

		function tagsField( over: Partial<XiriFormField> = {} ): XiriFormField {
			return {
				id: 'tags', type: 'select', multiple: true, required: false, search: false, value: [ 10 ],
				list: [ { id: 10, name: 'Alpha' }, { id: 11, name: 'Beta' } ],
				reloadOn: [ 'status' ], reloadUrl: RELOAD_URL,
				...over,
			};
		}

		function setFields( fields: XiriFormField[] ) {
			host.fields.set( fields );
			fixture.detectChanges();
			vi.advanceTimersByTime( 250 );
		}

		function respondWith( fields: Record<string, unknown> ) {
			httpStub.post.mockReturnValue( of( { fields } ) );
		}

		beforeEach( () => {
			vi.useFakeTimers();
			httpStub.post.mockReturnValue( of( { fields: {} } ) );
		} );

		afterEach( () => {
			vi.useRealTimers();
		} );

		it( 'posts only the trigger values to the reload url', () => {
			setFields( [ statusField(), tagsField() ] );

			expect( httpStub.post ).toHaveBeenCalledTimes( 1 );
			expect( httpStub.post ).toHaveBeenCalledWith( '/api/' + RELOAD_URL, { status: 1 } );
		} );

		it( 'reloads again when a trigger value changes', () => {
			setFields( [ statusField(), tagsField() ] );
			httpStub.post.mockClear();

			component.formGroup.get( 'status' )!.setValue( 2 );
			vi.advanceTimersByTime( 250 );

			expect( httpStub.post ).toHaveBeenCalledTimes( 1 );
			expect( httpStub.post ).toHaveBeenCalledWith( '/api/' + RELOAD_URL, { status: 2 } );
		} );

		it( 'does not reload when a field nobody depends on changes', () => {
			setFields( [ statusField(), tagsField(), { id: 'note', type: 'text', value: '' } ] );
			httpStub.post.mockClear();

			component.formGroup.get( 'note' )!.setValue( 'hello' );
			vi.advanceTimersByTime( 250 );

			expect( httpStub.post ).not.toHaveBeenCalled();
		} );

		it( 'sends one request for two dependants sharing a url', () => {
			setFields( [ statusField(), tagsField(), tagsField( { id: 'groups' } ) ] );

			expect( httpStub.post ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'sends one request per distinct url', () => {
			setFields( [ statusField(), tagsField(), tagsField( { id: 'groups', reloadUrl: '/Thing/OtherReload' } ) ] );

			expect( httpStub.post ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'applies the patched option list', () => {
			respondWith( { tags: { list: [ { id: 10, name: 'Alpha neu' } ] } } );
			setFields( [ statusField(), tagsField() ] );

			const tags = component.formGroup.get( 'tags' )!;
			expect( tags.value ).toEqual( [ 10 ] );
			expect( host.fields()![ 1 ].list ).toEqual( [ { id: 10, name: 'Alpha neu' } ] );
		} );

		it( 'drops values the new list no longer offers and keeps the rest', () => {
			respondWith( { tags: { list: [ { id: 11, name: 'Beta' } ] } } );
			setFields( [ statusField(), tagsField( { value: [ 10, 11 ] } ) ] );

			expect( component.formGroup.get( 'tags' )!.value ).toEqual( [ 11 ] );
		} );

		it( 'clears a single value that is gone', () => {
			respondWith( { status: { list: [ { id: 2, name: 'inaktiv' } ] } } );
			setFields( [
				tagsField( { id: 'status', type: 'select', multiple: false, value: 1, reloadOn: [ 'kind' ] } ),
				{ id: 'kind', type: 'text', value: '' },
			] );

			expect( component.formGroup.get( 'status' )!.value ).toBeNull();
		} );

		it( 'keeps recursive child ids when pruning a tree list', () => {
			respondWith( {
				tags: { list: [ { id: 10, name: 'Gruppe', children: [ { id: 11, name: 'Beta' } ] } ] },
			} );
			setFields( [ statusField(), tagsField( { value: [ 11, 99 ] } ) ] );

			expect( component.formGroup.get( 'tags' )!.value ).toEqual( [ 11 ] );
		} );

		it( 'does not prune a chips field - its list is only a suggestion', () => {
			respondWith( { tags: { list: [ { id: 11, name: 'Beta' } ] } } );
			setFields( [ statusField(), tagsField( { type: 'chips', value: [ 'freitext' ] } ) ] );

			expect( component.formGroup.get( 'tags' )!.value ).toEqual( [ 'freitext' ] );
		} );

		it( 'does not prune a server-search select - its list is only the static base', () => {
			respondWith( { tags: { list: [ { id: 11, name: 'Beta' } ] } } );
			setFields( [ statusField(), tagsField( { url: '/Thing/Search', value: [ 10 ] } ) ] );

			expect( component.formGroup.get( 'tags' )!.value ).toEqual( [ 10 ] );
		} );

		it( 'does not prune when the patch carries no list', () => {
			respondWith( { tags: { hint: 'neuer Hinweis' } } );
			setFields( [ statusField(), tagsField( { value: [ 10, 99 ] } ) ] );

			expect( component.formGroup.get( 'tags' )!.value ).toEqual( [ 10, 99 ] );
			expect( host.fields()![ 1 ].hint ).toBe( 'neuer Hinweis' );
		} );

		it( 'rebuilds the validators when required is patched', () => {
			respondWith( { tags: { required: true } } );
			setFields( [ statusField(), tagsField( { value: [] } ) ] );

			expect( component.formGroup.get( 'tags' )!.valid ).toBe( false );
		} );

		// Der zweite Patch prunt (Wert 10 fällt raus) und ändert required. Ohne die Unterdrückung
		// des valueChanges-Emits während der Anwendung wären das zwei Emits statt einem: einer
		// vom setValue des Prunings, einer vom Patch selbst.
		it( 'emits formChange exactly once per patch', () => {
			// Der initiale Reload lässt den Wert in Ruhe, damit erst der zweite prunt.
			httpStub.post
				.mockReturnValueOnce( of( { fields: { tags: { list: [ { id: 10, name: 'Alpha' } ] } } } ) )
				.mockReturnValue( of( { fields: { tags: { list: [ { id: 11, name: 'Beta' } ], required: true } } } ) );

			setFields( [ statusField(), tagsField( { value: [ 10 ] } ) ] );
			expect( component.formGroup.get( 'tags' )!.value ).toEqual( [ 10 ] );

			component.formGroup.get( 'status' )!.setValue( 2 );
			host.formChangeEvents = []; // der Emit zur Nutzereingabe selbst zählt nicht
			vi.advanceTimersByTime( 250 );

			expect( component.formGroup.get( 'tags' )!.value ).toEqual( [] ); // es wurde wirklich geprunt
			expect( host.formChangeEvents.length ).toBe( 1 );
		} );

		it( 'does not re-enable a control while the whole form is disabled', () => {
			respondWith( { tags: { disabled: false } } );
			host.disabled.set( true );
			setFields( [ statusField(), tagsField( { disabled: true } ) ] );

			expect( component.formGroup.get( 'tags' )!.disabled ).toBe( true );
		} );

		// Ein Reload, der dasselbe zurückgibt, ist der Normalfall - z.B. weil sich ein anderer
		// Trigger geändert hat. Er darf nichts anstoßen: kein Klon (der einen Treeselect neu
		// aufbauen und bei gesetzter url erneut laden würde), kein Validator-Neubau, kein Emit.
		it( 'does nothing when the patch repeats the current values', () => {
			respondWith( { tags: { list: [ { id: 10, name: 'Alpha' }, { id: 11, name: 'Beta' } ], required: false } } );
			setFields( [ statusField(), tagsField() ] );

			expect( component.displayFields()![ 1 ] ).toBe( host.fields()![ 1 ] );

			host.formChangeEvents = [];
			component.formGroup.get( 'status' )!.setValue( 2 );
			const emitsFromTheEdit = 1;
			vi.advanceTimersByTime( 250 );

			expect( host.formChangeEvents.length ).toBe( emitsFromTheEdit );
		} );

		it( 'clones the field only when the patch really changes something', () => {
			respondWith( { tags: { list: [ { id: 11, name: 'Beta' } ] } } );
			setFields( [ statusField(), tagsField() ] );

			expect( component.displayFields()![ 1 ] ).not.toBe( host.fields()![ 1 ] );
		} );

		// Der Trigger wechselt, während die Antwort zum vorherigen Stand noch unterwegs ist. Diese
		// Antwort ist überholt und darf nicht mehr angewendet werden — sonst verwirft sie einen
		// Wert, der für den neuen Stand gültig wäre, und der neue Patch stellt ihn nicht wieder her.
		it( 'discards the answer of a request that a newer trigger superseded', () => {
			setFields( [ statusField( 1 ), tagsField( { value: [ 10 ] } ) ] );

			httpStub.post.mockImplementation( ( _url: string, payload: { status: number } ) =>
				payload.status === 2
					// Antwort zum überholten Stand: käme sie an, würde sie die 10 verwerfen.
					? of( { fields: { tags: { list: [ { id: 11, name: 'Beta' } ] } } } ).pipe( delay( 100 ) )
					: of( { fields: { tags: { list: [ { id: 10, name: 'Alpha' }, { id: 11, name: 'Beta' } ] } } } ) );

			component.formGroup.get( 'status' )!.setValue( 2 );  // t=0, Request startet bei 200, Antwort bei 300
			vi.advanceTimersByTime( 250 );
			component.formGroup.get( 'status' )!.setValue( 3 );  // t=250 - der Stand von oben ist jetzt überholt
			vi.advanceTimersByTime( 1000 );

			expect( component.formGroup.get( 'tags' )!.value ).toEqual( [ 10 ] );
		} );

		// Der Treeselect haengt beim Aufbau parent-Referenzen an die Optionsknoten. Bei
		// verschachtelten Listen wird die Liste dadurch zyklisch — ein Vergleich per
		// JSON.stringify würde beim naechsten Patch werfen und die Pipeline killen.
		it( 'survives a second patch of a nested treeselect list', () => {
			respondWith( { tags: { list: [ { id: 10, name: 'Gruppe', children: [ { id: 11, name: 'Beta' } ] } ] } } );
			setFields( [ statusField(), tagsField( { type: 'multiselect', value: [] } ) ] );

			respondWith( { tags: { list: [ { id: 20, name: 'Andere', children: [ { id: 21, name: 'Gamma' } ] } ] } } );
			component.formGroup.get( 'status' )!.setValue( 2 );
			vi.advanceTimersByTime( 250 );

			expect( host.fields()![ 1 ].list?.map( o => o.id ) ).toEqual( [ 20 ] );
		} );

		// Ein neues Formular muss seinen Initial-Reload bekommen, auch wenn die Trigger zufaellig
		// dieselben Werte tragen — Felder, Abhaengigkeiten und URL koennen komplett andere sein.
		it( 'reloads a replaced form even when the trigger values are identical', () => {
			setFields( [ statusField( 1 ), tagsField() ] );
			httpStub.post.mockClear();

			setFields( [ statusField( 1 ), tagsField( { id: 'other' } ) ] );

			expect( httpStub.post ).toHaveBeenCalledTimes( 1 );
		} );

		// Ein Patch an einem Feld darf die Render-Identitaet der anderen nicht anfassen, sonst
		// laeuft deren Kind-Input-Setter erneut (Treeselect: kompletter Neuaufbau).
		it( 'keeps the render identity of fields that this patch did not touch', () => {
			httpStub.post.mockImplementation( ( _url: string, payload: { status: number } ) =>
				of( payload.status === 1
				    ? { fields: { tags: { hint: 'erster' } } }
				    : { fields: { groups: { hint: 'zweiter' } } } ) );

			setFields( [ statusField( 1 ), tagsField(), tagsField( { id: 'groups' } ) ] );
			const tagsAfterFirstPatch = component.displayFields()![ 1 ];

			component.formGroup.get( 'status' )!.setValue( 2 );
			vi.advanceTimersByTime( 250 );

			expect( host.fields()![ 2 ].hint ).toBe( 'zweiter' );
			expect( component.displayFields()![ 1 ] ).toBe( tagsAfterFirstPatch );
		} );

		it( 'sends each url only the trigger values its own fields depend on', () => {
			setFields( [
				statusField(),
				{ id: 'secret', type: 'text', value: 'geheim' },
				tagsField(),
				tagsField( { id: 'groups', reloadUrl: '/Thing/OtherReload', reloadOn: [ 'secret' ] } ),
			] );

			const byUrl = Object.fromEntries(
				httpStub.post.mock.calls.map( ( c: unknown[] ) => [ c[ 0 ] as string, c[ 1 ] ] ) );

			expect( byUrl[ '/api/' + RELOAD_URL ] ).toEqual( { status: 1 } );
			expect( byUrl[ '/api//Thing/OtherReload' ] ).toEqual( { secret: 'geheim' } );
		} );

		it( 'rejects an option list with malformed children', () => {
			respondWith( { tags: { list: [ { id: 10, name: 'A', children: { length: 1 } } ] } } );
			setFields( [ statusField(), tagsField( { value: [ 10 ] } ) ] );

			expect( host.fields()![ 1 ].list ).toEqual( [ { id: 10, name: 'Alpha' }, { id: 11, name: 'Beta' } ] );
			expect( component.formGroup.get( 'tags' )!.value ).toEqual( [ 10 ] );
		} );

		it( 'clears a hint when the server sends null', () => {
			respondWith( { tags: { hint: null } } );
			setFields( [ statusField(), tagsField( { hint: 'alt' } ) ] );

			expect( host.fields()![ 1 ].hint ).toBeFalsy();
		} );

		// Der eigentliche Beweis für den Klon-Mechanismus: ein Treeselect liest seine Daten im
		// @Input-Setter und würde eine reine Mutation des Feld-Objekts nie mitbekommen.
		it( 'reaches a child component that snapshots its input', () => {
			respondWith( { tags: { list: [ { id: 12, name: 'Gamma' } ] } } );
			setFields( [
				statusField(),
				tagsField( { type: 'multiselect', value: [] } ),
			] );
			fixture.detectChanges();

			const labels = Array.from(
				fixture.nativeElement.querySelectorAll( 'xiri-treeselect mat-checkbox' ) as NodeListOf<HTMLElement>
			).map( el => el.textContent!.trim() );

			expect( labels ).toContain( 'Gamma' );
			expect( labels ).not.toContain( 'Alpha' );
		} );

		// Der Server ist eine Trust-Boundary: eine Antwort darf nur die abhängigen Felder genau
		// dieser URL anfassen, nur bekannte Properties setzen und nichts mit falschem Typ.
		it( 'ignores patches for fields that did not declare a dependency', () => {
			respondWith( { note: { hint: 'gekapert' } } );
			setFields( [ statusField(), tagsField(), { id: 'note', type: 'text', value: '' } ] );

			expect( host.fields()![ 2 ].hint ).toBeUndefined();
		} );

		it( 'ignores patches addressed to a different reload url', () => {
			// Nur die FormReload-URL antwortet, und zwar mit einem Patch für ein Feld, das an
			// der anderen URL hängt.
			httpStub.post.mockImplementation( ( url: string ) =>
				of( url.endsWith( '/Thing/FormReload' ) ? { fields: { groups: { hint: 'falsche url' } } } : { fields: {} } ) );

			setFields( [ statusField(), tagsField(), tagsField( { id: 'groups', reloadUrl: '/Thing/OtherReload' } ) ] );

			expect( host.fields()![ 2 ].hint ).toBeUndefined();
		} );

		it( 'ignores unknown fields, unknown properties and wrong types', () => {
			respondWith( {
				ghost: { list: [] },
				tags: { list: null, min: '3', required: 'yes', type: 'text', id: 'hijacked', value: [ 999 ] },
			} );
			setFields( [ statusField(), tagsField( { value: [ 10 ] } ) ] );

			const tags = host.fields()![ 1 ];
			expect( tags.list ).toEqual( [ { id: 10, name: 'Alpha' }, { id: 11, name: 'Beta' } ] );
			expect( tags.min ).toBeUndefined();
			expect( tags.type ).toBe( 'select' );
			expect( tags.id ).toBe( 'tags' );
			expect( component.formGroup.get( 'tags' )!.value ).toEqual( [ 10 ] );
		} );

		it( 'keeps the other url patch when one request fails', () => {
			httpStub.post.mockImplementation( ( url: string ) =>
				url.endsWith( '/Thing/FormReload' )
					? throwError( () => ( { status: 500 } ) )
					: of( { fields: { groups: { hint: 'ok' } } } ) );

			setFields( [ statusField(), tagsField(), tagsField( { id: 'groups', reloadUrl: '/Thing/OtherReload' } ) ] );

			expect( host.fields()![ 2 ].hint ).toBe( 'ok' );
			expect( snackbarStub.error ).toHaveBeenCalled();
		} );

		// Pruning entfernt nur Werte, ist also monoton: sobald nichts mehr zu entfernen ist,
		// ändert sich der Trigger-Snapshot nicht mehr und die Kette läuft aus.
		it( 'terminates a chain instead of reloading forever', () => {
			respondWith( { tags: { list: [] }, groups: { list: [] } } );
			setFields( [
				statusField(),
				tagsField( { value: [ 10 ] } ),
				tagsField( { id: 'groups', value: [ 10 ], reloadOn: [ 'tags' ] } ),
			] );

			vi.advanceTimersByTime( 5000 );

			expect( httpStub.post.mock.calls.length ).toBeLessThan( 6 );
			expect( component.formGroup.get( 'groups' )!.value ).toEqual( [] );
		} );

		// Solange der Reload läuft, zeigt das Feld noch die alte Liste. Ein Balken über dem
		// Feldblock ist die einzige Rückmeldung, die ohne Eingriff in die Formular-Semantik
		// auskommt: control.disable() würde den Wert aus formGroup.value nehmen, und genau den
		// lesen xiri-query und xiri-form.
		describe( 'Ladeanzeige', () => {

			function bar(): Element | null {
				fixture.detectChanges();
				return fixture.nativeElement.querySelector( 'mat-progress-bar' );
			}

			// Hängender Request: das Subject antwortet erst, wenn der Test es will.
			function pending(): Subject<unknown> {
				const answer = new Subject<unknown>();
				httpStub.post.mockReturnValue( answer );
				return answer;
			}

			it( 'zeigt den Balken, solange der Request läuft', () => {
				pending();
				setFields( [ statusField(), tagsField() ] );

				expect( bar() ).not.toBeNull();
			} );

			it( 'blendet den Balken nach der Antwort wieder aus', () => {
				const answer = pending();
				setFields( [ statusField(), tagsField() ] );

				answer.next( { fields: {} } );
				answer.complete();

				expect( bar() ).toBeNull();
			} );

			// Der Balken hängt am Trigger-Wechsel, nicht am Request: würde er erst in
			// fetchPatches() gesetzt, bliebe die erste Fünftelsekunde ohne Rückmeldung.
			it( 'zeigt den Balken schon während der 200ms Entprellung', () => {
				pending();
				setFields( [ statusField(), tagsField() ] );
				component.formGroup.get( 'status' )!.setValue( 2 );

				vi.advanceTimersByTime( 100 );

				expect( bar() ).not.toBeNull();
			} );

			// switchMap räumt den alten Inner-Stream ab, bevor die Projektion des neuen läuft.
			// Liefe es andersherum, würde das finalize des abgebrochenen Requests den gerade
			// gesetzten Balken wieder löschen.
			it( 'lässt den Balken an, wenn ein zweiter Trigger-Wechsel den Request abbricht', () => {
				pending();
				setFields( [ statusField(), tagsField() ] );

				component.formGroup.get( 'status' )!.setValue( 2 );
				vi.advanceTimersByTime( 250 );

				expect( bar() ).not.toBeNull();
			} );

			it( 'blendet den Balken auch bei einem Fehler aus', () => {
				httpStub.post.mockReturnValue( throwError( () => new Error( 'kaputt' ) ) );
				setFields( [ statusField(), tagsField() ] );

				expect( bar() ).toBeNull();
			} );

			it( 'zeigt ohne reloadOn nie einen Balken', () => {
				setFields( [ statusField(), { id: 'note', type: 'text', value: '' } ] );

				expect( bar() ).toBeNull();
			} );
		} );
	} );
} );
