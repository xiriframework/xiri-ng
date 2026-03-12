import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { of, Subject } from 'rxjs';
import { XiriFormFieldsComponent } from './form-fields.component';
import { XiriFormField } from './field.interface';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { XiriDataService, XiriDataServiceConfig } from '../services/data.service';
import { XiriSnackbarService } from '../services/snackbar.service';
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
	formChangeEvents: any[] = [];
	formFields = viewChild.required( XiriFormFieldsComponent );

	onFormChange( event: any ) {
		this.formChangeEvents.push( event );
	}
}

describe( 'XiriFormFieldsComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let component: XiriFormFieldsComponent;

	beforeEach( () => {
		TestBed.configureTestingModule( {
			imports: [ TestHostComponent, NoopAnimationsModule ],
			providers: [
				{ provide: XiriDataServiceConfig, useValue: { api: '/api/' } },
				{ provide: HttpClient, useValue: { get: vi.fn().mockReturnValue( of( {} ) ), post: vi.fn().mockReturnValue( of( {} ) ) } },
				{ provide: XiriSnackbarService, useValue: { error: vi.fn() } },
				{ provide: MAT_DATE_LOCALE, useValue: enUS },
				...provideDateFnsAdapter(),
			],
		} );

		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
		component = host.formFields();
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
			expect( component.formGroup.get( 'name' ).value ).toBe( 'Alice' );
		} );

		it( 'should default text field value to empty string', () => {
			host.fields.set( [ { id: 'name', type: 'text' } ] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'name' ).value ).toBe( '' );
		} );

		it( 'should default textarea value to empty string', () => {
			host.fields.set( [ { id: 'desc', type: 'textarea' } ] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'desc' ).value ).toBe( '' );
		} );

		it( 'should default bool value to false', () => {
			host.fields.set( [ { id: 'active', type: 'bool' } ] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'active' ).value ).toBe( false );
		} );

		it( 'should handle email type as text with email subtype', () => {
			host.fields.set( [ { id: 'email', type: 'email', value: '' } ] );
			fixture.detectChanges();

			const fields = component.fields();
			expect( fields[ 0 ].type ).toBe( 'text' );
			expect( fields[ 0 ].subtype ).toBe( 'email' );
		} );

		it( 'should handle password type', () => {
			host.fields.set( [ { id: 'pwd', type: 'password', value: '' } ] );
			fixture.detectChanges();

			const fields = component.fields();
			expect( fields[ 0 ].subtype ).toBe( 'password' );
			expect( fields[ 0 ].pwdhide ).toBe( true );
		} );

		it( 'should set class to xcol if not specified', () => {
			host.fields.set( [ { id: 'f1', type: 'text', value: '' } ] );
			fixture.detectChanges();

			expect( component.fields()[ 0 ].class ).toBe( 'xcol' );
		} );

		it( 'should preserve custom class', () => {
			host.fields.set( [ { id: 'f1', type: 'text', value: '', class: 'custom' } ] );
			fixture.detectChanges();

			expect( component.fields()[ 0 ].class ).toBe( 'custom' );
		} );

		it( 'should apply formtype to type', () => {
			host.fields.set( [ { id: 'f1', type: 'text', formtype: 'number', value: 0 } ] );
			fixture.detectChanges();

			expect( component.fields()[ 0 ].type ).toBe( 'number' );
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

			const field = component.fields()[ 0 ];
			expect( field.list ).toBeTruthy();
			expect( field.list.length ).toBe( 3 );
			expect( field.list[ 0 ] ).toEqual( { id: 'red', name: 'red' } );
		} );

		it( 'should set default value for model select to first item', () => {
			host.fields.set( [ {
				id: 'item',
				type: 'model',
				list: [ { id: 1, name: 'First' }, { id: 2, name: 'Second' } ],
			} ] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'item' ).value ).toBe( 1 );
		} );

		it( 'should set default value for non-model select to empty array', () => {
			host.fields.set( [ {
				id: 'items',
				type: 'select',
				list: [ { id: 1, name: 'A' } ],
			} ] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'items' ).value ).toEqual( [] );
		} );

		it( 'should set serverSideSearch when url is provided', () => {
			host.fields.set( [ {
				id: 'user',
				type: 'object',
				list: [ { id: 1, name: 'User' } ],
				url: '/api/search',
			} ] );
			fixture.detectChanges();

			expect( component.fields()[ 0 ].serverSideSearch ).toBe( true );
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

			expect( component.fields()[ 0 ].tree ).toBe( true );
		} );

		it( 'should set tree=false for multiselect', () => {
			host.fields.set( [ {
				id: 'multi',
				type: 'multiselect',
				value: [],
			} ] );
			fixture.detectChanges();

			expect( component.fields()[ 0 ].tree ).toBe( false );
			expect( component.fields()[ 0 ].type ).toBe( 'treeselect' );
		} );
	} );

	describe( 'volume and date fields', () => {
		it( 'should force required on volume', () => {
			host.fields.set( [ { id: 'vol', type: 'volume', value: [ 0, 0, 0 ] } ] );
			fixture.detectChanges();

			expect( component.fields()[ 0 ].required ).toBe( true );
		} );

		it( 'should set type to date for datetime', () => {
			host.fields.set( [ { id: 'dt', type: 'datetime', value: '' } ] );
			fixture.detectChanges();

			expect( component.fields()[ 0 ].type ).toBe( 'date' );
			expect( component.fields()[ 0 ].class ).toContain( 'datetime' );
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

			expect( component.fields()[ 0 ].name ).toBe( 'Is Active' );
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

			const control = component.formGroup.get( 'name' );
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

			const control = component.formGroup.get( 'code' );
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

			const control = component.formGroup.get( 'code' );
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

			const control = component.formGroup.get( 'count' );
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

			const control = component.formGroup.get( 'count' );
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

			const control = component.formGroup.get( 'code' );
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

			const control = component.formGroup.get( 'email' );
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

			const control = component.formGroup.get( 'custom' );
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

			component.formGroup.get( 'name' ).setValue( 'new value' );
			await new Promise( r => queueMicrotask( () => r( undefined ) ) );

			expect( host.formChangeEvents.length ).toBeGreaterThan( 0 );
		} );

		it( 'should not emit when value does not change', async () => {
			host.fields.set( [ { id: 'name', type: 'text', value: 'same' } ] );
			fixture.detectChanges();
			await new Promise( r => queueMicrotask( () => r( undefined ) ) );
			host.formChangeEvents = [];

			// Set same value
			component.formGroup.get( 'name' ).setValue( 'same' );
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

			const fields = component.fields();
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

			const fields = component.fields();
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'type' ).setValue( 'B' );
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

			const fields = component.fields();
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'type' ).setValue( 'B' );
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

			const fields = component.fields();
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'tags' ).setValue( 'hello' );
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

			const fields = component.fields();
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'count' ).setValue( 3 );
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

			const fields = component.fields();
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'count' ).setValue( 10 );
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

			const fields = component.fields();
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'status' ).setValue( 'closed' );
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

			const fields = component.fields();
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );

			component.formGroup.get( 'name' ).setValue( '' );
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

			const fields = component.fields();
			expect( component.isFieldVisible( fields[ 2 ] ) ).toBe( true );

			component.formGroup.get( 'type' ).setValue( 'B' );
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

			const fields = component.fields();
			expect( component.isFieldVisible( fields[ 0 ] ) ).toBe( false );
		} );

		it( 'should return true for unknown operator', () => {
			host.fields.set( [
				{ id: 'name', type: 'text', value: 'test' },
				{
					id: 'detail',
					type: 'text',
					value: '',
					showWhen: { field: 'name', operator: 'unknownOp' as any, value: 'x' },
				},
			] );
			fixture.detectChanges();

			const fields = component.fields();
			expect( component.isFieldVisible( fields[ 1 ] ) ).toBe( true );
		} );
	} );

	describe( 'collapsible sections', () => {
		it( 'should toggle section collapsed state', () => {
			const header: XiriFormField = {
				id: 'section',
				type: 'header',
				collapsible: true,
				collapsed: false,
			};
			host.fields.set( [ header, { id: 'name', type: 'text', value: '' } ] );
			fixture.detectChanges();

			component.toggleSection( header );
			expect( header.collapsed ).toBe( true );

			component.toggleSection( header );
			expect( header.collapsed ).toBe( false );
		} );

		it( 'should hide fields in collapsed section', () => {
			const header: XiriFormField = {
				id: 'section',
				type: 'header',
				collapsible: true,
				collapsed: true,
			};
			const field: XiriFormField = { id: 'name', type: 'text', value: '' };
			host.fields.set( [ header, field ] );
			fixture.detectChanges();

			expect( component.isFieldVisible( field ) ).toBe( false );
		} );

		it( 'should show fields after divider even if section is collapsed', () => {
			const header: XiriFormField = {
				id: 'section',
				type: 'header',
				collapsible: true,
				collapsed: true,
			};
			const divider: XiriFormField = { id: 'div', type: 'divider' };
			const field: XiriFormField = { id: 'name', type: 'text', value: '' };
			host.fields.set( [ header, divider, field ] );
			fixture.detectChanges();

			expect( component.isFieldVisible( field ) ).toBe( true );
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

			expect( component.formGroup.get( 'readonly' ).disabled ).toBe( true );
			expect( component.formGroup.get( 'editable' ).enabled ).toBe( true );
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

			expect( component.fields()[ 0 ].multiple ).toBe( true );
		} );

		it( 'should convert objectlist without subtype to treeselect', () => {
			host.fields.set( [ {
				id: 'items',
				type: 'objectlist',
				value: [],
			} ] );
			fixture.detectChanges();

			expect( component.fields()[ 0 ].type ).toBe( 'treeselect' );
			expect( component.fields()[ 0 ].tree ).toBe( true );
		} );
	} );

	describe( 'question type', () => {
		it( 'should set value from question property', () => {
			host.fields.set( [ {
				id: 'q',
				type: 'question',
				question: 'Are you sure?',
			} as any ] );
			fixture.detectChanges();

			expect( component.formGroup.get( 'q' ).value ).toBe( 'Are you sure?' );
		} );
	} );
} );
