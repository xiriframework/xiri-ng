import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { XiriRawTableComponent, XiriRawTableSettings } from './xiri-raw-table.component';
import { XiriNumberService } from '../services/number.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component( {
	selector: 'xiri-raw-table-test-host',
	template: `<xiri-raw-table [settings]="settings()" />`,
	imports: [ XiriRawTableComponent ],
} )
class TestHostComponent {
	settings = signal<XiriRawTableSettings>( {
		data: [
			{ id: 1, name: 'Alice', age: '30' },
			{ id: 2, name: 'Bob', age: '25' },
		],
		fields: [
			{ id: 'name', name: 'name' },
			{ id: 'age', name: 'age' },
		],
	} );
	rawTable = viewChild.required( XiriRawTableComponent );
}

describe( 'XiriRawTableComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let component: XiriRawTableComponent;
	let mockNumberService: { formatNumber: ReturnType<typeof vi.fn> };

	beforeEach( () => {
		mockNumberService = { formatNumber: vi.fn().mockReturnValue( '0' ) };

		TestBed.configureTestingModule( {
			imports: [ TestHostComponent, NoopAnimationsModule ],
			providers: [
				{ provide: XiriNumberService, useValue: mockNumberService },
			],
		} );

		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
		component = host.rawTable();
	} );

	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );

	it( 'should set up displayed columns from fields', () => {
		expect( component.displayedColumns.length ).toBe( 2 );
		expect( component.columnsToDisplay ).toEqual( [ 'name', 'age' ] );
	} );

	it( 'should populate dataSource with provided data', () => {
		expect( component.dataSource.data.length ).toBe( 2 );
		expect( component.dataSource.data[ 0 ].name ).toBe( 'Alice' );
	} );

	it( 'should use default table class dense-6', () => {
		expect( component.tableClass ).toContain( 'dense-6' );
	} );

	it( 'should apply custom dense value', () => {
		host.settings.set( {
			data: [],
			fields: [ { id: 'x', name: 'x' } ],
			dense: 3,
		} );
		fixture.detectChanges();
		component = host.rawTable();

		expect( component.tableClass ).toContain( 'dense-3' );
	} );

	it( 'should add force-min-width class when forceMinWidth is true', () => {
		host.settings.set( {
			data: [],
			fields: [ { id: 'x', name: 'x' } ],
			forceMinWidth: true,
		} );
		fixture.detectChanges();
		component = host.rawTable();

		expect( component.tableClass ).toContain( 'force-min-width' );
	} );

	it( 'should skip fields with format "id"', () => {
		host.settings.set( {
			data: [],
			fields: [
				{ id: 'id', name: 'id', format: 'id' },
				{ id: 'name', name: 'name' },
			],
		} );
		fixture.detectChanges();
		component = host.rawTable();

		expect( component.columnsToDisplay ).toEqual( [ 'name' ] );
		expect( component.displayedColumns.length ).toBe( 1 );
	} );

	it( 'should apply alignment class to display', () => {
		host.settings.set( {
			data: [],
			fields: [
				{ id: 'val', name: 'val', align: 'right' },
			],
		} );
		fixture.detectChanges();
		component = host.rawTable();

		expect( component.displayedColumns[ 0 ].display ).toContain( 'align-right' );
	} );

	it( 'should initialize display to empty string if not set', () => {
		host.settings.set( {
			data: [],
			fields: [
				{ id: 'name', name: 'name' },
			],
		} );
		fixture.detectChanges();
		component = host.rawTable();

		expect( component.displayedColumns[ 0 ].display ).toBe( '' );
	} );

	it( 'should update when settings signal changes', () => {
		host.settings.set( {
			data: [ { id: 10, val: 'New' } ],
			fields: [ { id: 'val', name: 'val' } ],
		} );
		fixture.detectChanges();
		component = host.rawTable();

		expect( component.dataSource.data.length ).toBe( 1 );
		expect( component.dataSource.data[ 0 ].val ).toBe( 'New' );
		expect( component.columnsToDisplay ).toEqual( [ 'val' ] );
	} );

	it( 'should handle empty data array', () => {
		host.settings.set( {
			data: [],
			fields: [ { id: 'name', name: 'name' } ],
		} );
		fixture.detectChanges();
		component = host.rawTable();

		expect( component.dataSource.data ).toEqual( [] );
	} );

	it( 'should handle single field', () => {
		host.settings.set( {
			data: [ { id: 1, only: 'value' } ],
			fields: [ { id: 'only', name: 'only' } ],
		} );
		fixture.detectChanges();
		component = host.rawTable();

		expect( component.displayedColumns.length ).toBe( 1 );
		expect( component.columnsToDisplay ).toEqual( [ 'only' ] );
	} );

	it( 'should not apply force-min-width when forceMinWidth is false', () => {
		host.settings.set( {
			data: [],
			fields: [ { id: 'x', name: 'x' } ],
			forceMinWidth: false,
		} );
		fixture.detectChanges();
		component = host.rawTable();

		expect( component.tableClass ).not.toContain( 'force-min-width' );
	} );

	it( 'should handle multiple fields with mixed formats', () => {
		host.settings.set( {
			data: [],
			fields: [
				{ id: 'rowid', name: 'rowid', format: 'id' },
				{ id: 'col1', name: 'col1' },
				{ id: 'col2', name: 'col2', align: 'center' },
				{ id: 'col3', name: 'col3', align: 'left' },
			],
		} );
		fixture.detectChanges();
		component = host.rawTable();

		expect( component.displayedColumns.length ).toBe( 3 );
		expect( component.columnsToDisplay ).toEqual( [ 'col1', 'col2', 'col3' ] );
	} );
} );
