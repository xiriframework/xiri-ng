import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild, TemplateRef } from '@angular/core';
import { XiriDynComponentComponent } from './dyncomponent.component';
import { XiriDynData } from './dyndata.interface';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { XiriDataService } from '../services/data.service';
import { XiriFormService } from '../services/form.service';
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriSessionStorageService } from '../services/sessionStorage.service';
import { XiriNumberService } from '../services/number.service';
import { of } from 'rxjs';

@Component( {
	selector: 'xiri-dyn-test-host',
	template: `<xiri-dyncomponent [data]="data()" [filterData]="filterData()" />`,
	imports: [ XiriDynComponentComponent ],
} )
class TestHostComponent {
	data = signal<XiriDynData[]>( [] );
	filterData = signal<any>( undefined );
	dynComponent = viewChild.required( XiriDynComponentComponent );
}

describe( 'XiriDynComponentComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let component: XiriDynComponentComponent;

	beforeEach( () => {
		TestBed.configureTestingModule( {
			imports: [ TestHostComponent, NoopAnimationsModule ],
			providers: [
				{ provide: XiriDataService, useValue: { get: vi.fn().mockReturnValue( of( {} ) ), post: vi.fn().mockReturnValue( of( {} ) ), postDownload: vi.fn() } },
				{ provide: XiriFormService, useValue: { get: vi.fn().mockReturnValue( of( {} ) ), parse: vi.fn().mockReturnValue( {} ), loadState: vi.fn().mockImplementation( ( _: any, f: any ) => f ), saveState: vi.fn() } },
				{ provide: XiriSnackbarService, useValue: { error: vi.fn(), success: vi.fn(), handleResponse: vi.fn() } },
				{ provide: XiriSessionStorageService, useValue: { set: vi.fn(), getTimeout: vi.fn().mockReturnValue( null ) } },
				{ provide: XiriNumberService, useValue: { formatNumber: vi.fn().mockReturnValue( '0' ) } },
			],
		} );

		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
		component = host.dynComponent();
	} );

	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );

	describe( 'dataInt computed', () => {
		it( 'should return empty array for empty data', () => {
			host.data.set( [] );
			fixture.detectChanges();

			expect( component.dataInt() ).toEqual( [] );
		} );

		it( 'should return empty array for null data', () => {
			host.data.set( null as any );
			fixture.detectChanges();

			expect( component.dataInt() ).toEqual( [] );
		} );

		it( 'should return empty array for undefined data', () => {
			host.data.set( undefined as any );
			fixture.detectChanges();

			expect( component.dataInt() ).toEqual( [] );
		} );

		it( 'should assign random id to items without id', () => {
			host.data.set( [
				{ type: 'card', data: { title: 'Test' } },
			] );
			fixture.detectChanges();

			const result = component.dataInt();
			expect( result.length ).toBe( 1 );
			expect( result[ 0 ].id ).toBeDefined();
			expect( typeof result[ 0 ].id ).toBe( 'number' );
		} );

		it( 'should preserve existing id', () => {
			host.data.set( [
				{ id: 42, type: 'card', data: { title: 'Test' } },
			] );
			fixture.detectChanges();

			expect( component.dataInt()[ 0 ].id ).toBe( 42 );
		} );

		it( 'should handle multiple items', () => {
			host.data.set( [
				{ id: 1, type: 'card', data: {} },
				{ id: 2, type: 'table', data: {} },
				{ type: 'form', data: {} },
			] );
			fixture.detectChanges();

			const result = component.dataInt();
			expect( result.length ).toBe( 3 );
			expect( result[ 0 ].id ).toBe( 1 );
			expect( result[ 1 ].id ).toBe( 2 );
			expect( result[ 2 ].id ).toBeDefined();
		} );

		it( 'should wrap non-array data in array', () => {
			host.data.set( { type: 'card', data: {} } as any );
			fixture.detectChanges();

			const result = component.dataInt();
			expect( Array.isArray( result ) ).toBe( true );
			expect( result.length ).toBe( 1 );
		} );

		it( 'should preserve all properties of data items', () => {
			host.data.set( [
				{ id: 1, type: 'card', data: { title: 'T' }, display: 'half', newRow: true },
			] );
			fixture.detectChanges();

			const item = component.dataInt()[ 0 ];
			expect( item.type ).toBe( 'card' );
			expect( item.data.title ).toBe( 'T' );
			expect( item.display ).toBe( 'half' );
			expect( item.newRow ).toBe( true );
		} );
	} );

	describe( 'inputs', () => {
		it( 'should accept filterData input', () => {
			host.filterData.set( { key: 'value' } );
			fixture.detectChanges();

			expect( component.filterData() ).toEqual( { key: 'value' } );
		} );

		it( 'should default filterData to undefined', () => {
			expect( component.filterData() ).toBeUndefined();
		} );

		it( 'should accept null filterData', () => {
			host.filterData.set( null );
			fixture.detectChanges();

			expect( component.filterData() ).toBeNull();
		} );
	} );

	describe( 'reactivity', () => {
		it( 'should update dataInt when data changes', () => {
			host.data.set( [ { id: 1, type: 'card', data: {} } ] );
			fixture.detectChanges();
			expect( component.dataInt().length ).toBe( 1 );

			host.data.set( [
				{ id: 1, type: 'card', data: {} },
				{ id: 2, type: 'table', data: {} },
			] );
			fixture.detectChanges();
			expect( component.dataInt().length ).toBe( 2 );
		} );

		it( 'should handle data being cleared', () => {
			host.data.set( [ { id: 1, type: 'card', data: {} } ] );
			fixture.detectChanges();
			expect( component.dataInt().length ).toBe( 1 );

			host.data.set( [] );
			fixture.detectChanges();
			expect( component.dataInt().length ).toBe( 0 );
		} );
	} );

	describe( 'various component types', () => {
		it( 'should handle card type', () => {
			host.data.set( [ { type: 'card', data: { title: 'Card', content: 'Body' } } ] );
			fixture.detectChanges();
			expect( component.dataInt()[ 0 ].type ).toBe( 'card' );
		} );

		it( 'should handle table type', () => {
			host.data.set( [ { type: 'table', data: { fields: [], data: [] } } ] );
			fixture.detectChanges();
			expect( component.dataInt()[ 0 ].type ).toBe( 'table' );
		} );

		it( 'should handle form type', () => {
			host.data.set( [ { type: 'form', data: { url: '/form' } } ] );
			fixture.detectChanges();
			expect( component.dataInt()[ 0 ].type ).toBe( 'form' );
		} );

		it( 'should handle html type', () => {
			host.data.set( [ { type: 'html', data: '<p>Hello</p>' } ] );
			fixture.detectChanges();
			expect( component.dataInt()[ 0 ].type ).toBe( 'html' );
		} );

		it( 'should handle unknown type gracefully', () => {
			host.data.set( [ { type: 'unknown', data: {} } ] );
			fixture.detectChanges();
			expect( component.dataInt()[ 0 ].type ).toBe( 'unknown' );
		} );
	} );
} );
