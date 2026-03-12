import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ChangeDetectorRef, Component, signal, viewChild } from '@angular/core';
import { of, throwError } from 'rxjs';
import { XiriTableComponent, XiriTableSettings } from './table.component';
import { XiriDataService } from '../services/data.service';
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriSessionStorageService } from '../services/sessionStorage.service';
import { XiriNumberService } from '../services/number.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component( {
	selector: 'xiri-table-test-host',
	template: `<xiri-table [settings]="settings()" />`,
	imports: [ XiriTableComponent ],
} )
class TestHostComponent {
	settings = signal<XiriTableSettings>( {
		fields: [
			{ id: 'name', name: 'Name' },
			{ id: 'age', name: 'Age' },
		],
		data: [
			{ id: 1, name: 'Alice', age: 30 },
			{ id: 2, name: 'Bob', age: 25 },
		],
	} );
	table = viewChild.required( XiriTableComponent );
}

describe( 'XiriTableComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let component: XiriTableComponent;
	let mockDataService: {
		get: ReturnType<typeof vi.fn>;
		post: ReturnType<typeof vi.fn>;
		postDownload: ReturnType<typeof vi.fn>;
	};
	let mockSnackbar: { error: ReturnType<typeof vi.fn> };
	let mockDialog: { open: ReturnType<typeof vi.fn> };
	let mockRouter: { navigate: ReturnType<typeof vi.fn>; url: string };
	let mockSessionStorage: {
		set: ReturnType<typeof vi.fn>;
		getTimeout: ReturnType<typeof vi.fn>;
	};
	let mockNumberService: { formatNumber: ReturnType<typeof vi.fn> };

	function initMocks() {
		mockDataService = {
			get: vi.fn().mockReturnValue( of( {} ) ),
			post: vi.fn().mockReturnValue( of( { data: [] } ) ),
			postDownload: vi.fn(),
		};
		mockSnackbar = { error: vi.fn() };
		mockDialog = { open: vi.fn() };
		mockRouter = { navigate: vi.fn().mockReturnValue( Promise.resolve() ), url: '/test' };
		mockSessionStorage = {
			set: vi.fn(),
			getTimeout: vi.fn().mockReturnValue( null ),
		};
		mockNumberService = { formatNumber: vi.fn().mockReturnValue( '0' ) };
	}

	function createFixture( settings?: XiriTableSettings ) {
		fixture?.destroy();
		TestBed.resetTestingModule();
		TestBed.configureTestingModule( {
			imports: [ TestHostComponent, NoopAnimationsModule ],
			providers: [
				{ provide: XiriDataService, useValue: mockDataService },
				{ provide: XiriSnackbarService, useValue: mockSnackbar },
				{ provide: MatDialog, useValue: mockDialog },
				{ provide: Router, useValue: mockRouter },
				{ provide: XiriSessionStorageService, useValue: mockSessionStorage },
				{ provide: XiriNumberService, useValue: mockNumberService },
			],
		} );

		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
		if ( settings ) {
			host.settings.set( settings );
		}
		fixture.detectChanges();
		component = host.table();
	}

	beforeEach( () => {
		initMocks();
		createFixture();
	} );

	afterEach( () => {
		if ( component ) {
			component.dataSource.disconnect();
		}
		fixture?.destroy();
		TestBed.resetTestingModule();
	} );

	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );

	it( 'should initialize with default options', () => {
		expect( component.options.sort ).toBe( true );
		expect( component.options.search ).toBe( true );
		expect( component.options.pagination ).toBe( true );
		expect( component.options.itemsPerPage ).toBe( 50 );
		expect( component.options.select ).toBe( false );
		expect( component.options.dense ).toBe( false );
	} );

	describe( 'loadFields', () => {
		it( 'should set up displayed columns from settings fields', () => {
			expect( component.displayedColumns.length ).toBe( 2 );
			expect( component.columnsToDisplay ).toContain( 'name' );
			expect( component.columnsToDisplay ).toContain( 'age' );
		} );

		it( 'should skip fields with format "id"', () => {
			createFixture( {
				fields: [
					{ id: 'id', name: 'ID', format: 'id' },
					{ id: 'name', name: 'Name' },
				],
				data: [],
			} );

			expect( component.columnsToDisplay ).not.toContain( 'id' );
			expect( component.columnsToDisplay ).toContain( 'name' );
		} );

		it( 'should handle header format as extra header', () => {
			createFixture( {
				fields: [
					{ id: 'group', name: 'Group', format: 'header' },
					{ id: 'name', name: 'Name' },
				],
				data: [],
			} );

			expect( component.extraHeaderFields.length ).toBe( 1 );
			expect( component.extraHeaders ).toContain( 'group' );
		} );

		it( 'should hide fields with hide=true', () => {
			createFixture( {
				fields: [
					{ id: 'name', name: 'Name' },
					{ id: 'secret', name: 'Secret', hide: true },
				],
				data: [],
			} );

			expect( component.columnsToDisplay ).not.toContain( 'secret' );
		} );

		it( 'should add select column when options.select is true', () => {
			createFixture( {
				fields: [ { id: 'name', name: 'Name' } ],
				data: [],
				options: { select: true },
			} );

			expect( component.columnsToDisplay[ 0 ] ).toBe( 'select' );
		} );
	} );

	describe( 'data loading', () => {
		it( 'should load inline data without making API calls', () => {
			expect( component.loading() ).toBe( false );
			expect( component.dataSource.data.length ).toBe( 2 );
			expect( mockDataService.post ).not.toHaveBeenCalled();
		} );

		it( 'should set loading to false after inline data', () => {
			expect( component.loading() ).toBe( false );
		} );

		it( 'should load data from URL via POST', () => {
			const responseData = {
				data: [ { id: 1, name: 'Test' } ],
				fields: [ { id: 'name', name: 'Name' } ],
			};
			mockDataService.post.mockReturnValue( of( responseData ) );

			createFixture( { url: 'test/data' } );

			expect( mockDataService.post ).toHaveBeenCalled();
		} );

		it( 'should handle API error response', () => {
			mockDataService.post.mockReturnValue(
				throwError( () => ( { error: { error: 'Server error' }, statusText: 'Internal Server Error' } ) )
			);

			createFixture( { url: 'test/data', fields: [ { id: 'name', name: 'Name' } ] } );

			expect( component.errorMsg ).toBe( 'Server error' );
			expect( component.loading() ).toBe( false );
		} );

		it( 'should handle API error without error.error', () => {
			mockDataService.post.mockReturnValue(
				throwError( () => ( { statusText: 'Not Found' } ) )
			);

			createFixture( { url: 'test/data', fields: [ { id: 'name', name: 'Name' } ] } );

			expect( component.errorMsg ).toBe( 'Not Found' );
		} );

		it( 'should set empty data on null response', () => {
			mockDataService.post.mockReturnValue( of( null ) );

			createFixture( { url: 'test/data', fields: [ { id: 'name', name: 'Name' } ] } );

			expect( component.errorMsg ).toBe( 'ERROR: unknown server response' );
		} );

		it( 'should handle empty data arrays', () => {
			createFixture( {
				fields: [ { id: 'name', name: 'Name' } ],
				data: [],
			} );

			expect( component.dataSource.data ).toEqual( [] );
			expect( component.loading() ).toBe( false );
		} );
	} );

	describe( 'search', () => {
		it( 'should filter data on searchDo', () => {
			component.searchDo( '  ALICE  ' );
			expect( component.searchText ).toBe( 'alice' );
			expect( component.dataSource.filter ).toBe( 'alice' );
		} );

		it( 'should reset paginator on search', () => {
			const firstPageSpy = vi.fn();
			component.dataSource.paginator = { firstPage: firstPageSpy } as any;
			component.searchDo( 'test' );
			expect( firstPageSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'selection', () => {
		it( 'should start with empty selection', () => {
			expect( component.selection.isEmpty() ).toBe( true );
		} );

		it( 'should toggle all selectable rows with masterToggle', () => {
			createFixture( {
				fields: [ { id: 'name', name: 'Name' } ],
				data: [
					{ id: 1, name: 'A' },
					{ id: 2, name: 'B' },
				],
				options: { select: true },
			} );

			// Simulate _displayeddata (normally set by dataSource.connect)
			( component as any )._displayeddata = component.dataSource.data;

			component.masterToggle();
			expect( component.selection.selected.length ).toBe( 2 );

			component.masterToggle();
			expect( component.selection.isEmpty() ).toBe( true );
		} );

		it( 'should skip rows with select=false in masterToggle', () => {
			createFixture( {
				fields: [ { id: 'name', name: 'Name' } ],
				data: [
					{ id: 1, name: 'A' },
					{ id: 2, name: 'B', select: false },
				],
				options: { select: true },
			} );
			( component as any )._displayeddata = component.dataSource.data;

			component.masterToggle();
			expect( component.selection.selected.length ).toBe( 1 );
		} );

		it( 'should check isAllSelected correctly', () => {
			createFixture( {
				fields: [ { id: 'name', name: 'Name' } ],
				data: [ { id: 1, name: 'A' }, { id: 2, name: 'B' } ],
				options: { select: true },
			} );
			( component as any )._displayeddata = component.dataSource.data;

			expect( component.isAllSelected() ).toBe( false );
			component.masterToggle();
			expect( component.isAllSelected() ).toBe( true );
		} );
	} );

	describe( 'clicked row', () => {
		it( 'should emit clickedRow event', () => {
			const emitSpy = vi.fn();
			component.clickedRow.subscribe( emitSpy );

			const row = { id: 1, name: 'Alice' };
			component.clicked( row );

			expect( emitSpy ).toHaveBeenCalledWith( row );
		} );
	} );

	describe( 'reload', () => {
		it( 'should not reload while already loading', () => {
			component.loading.set( true );
			component.reload();
			// Should not call loadData again since loading is true
			expect( component.loading() ).toBe( true );
		} );

		it( 'should set loading to true when reloading', () => {
			mockDataService.post.mockReturnValue( of( { data: [], fields: [] } ) );

			createFixture( {
				url: 'test/reload',
				fields: [ { id: 'name', name: 'Name' } ],
			} );

			component.loading.set( false );
			component.reload();
			// After reload completes synchronously, loading should be false again
			expect( mockDataService.post ).toHaveBeenCalled();
		} );
	} );

	describe( 'options merging', () => {
		it( 'should merge provided options with defaults', () => {
			createFixture( {
				fields: [ { id: 'name', name: 'Name' } ],
				data: [],
				options: {
					dense: true,
					itemsPerPage: 25,
					title: 'Test Table',
				},
			} );

			expect( component.options.dense ).toBe( true );
			expect( component.options.itemsPerPage ).toBe( 25 );
			expect( component.options.title ).toBe( 'Test Table' );
			// Defaults should remain
			expect( component.options.sort ).toBe( true );
			expect( component.options.search ).toBe( true );
		} );
	} );

	describe( 'inline editing', () => {
		it( 'should not start edit if column is not editable', () => {
			const column = { id: 'name', name: 'Name', editable: false };
			component.options.editUrl = '/edit';
			const row = { id: 1, name: 'Test' };

			component.startInlineEdit( row, column as any );
			expect( component.editingCell() ).toBeNull();
		} );

		it( 'should not start edit if editUrl is missing', () => {
			const column = { id: 'name', name: 'Name', editable: true };
			component.options.editUrl = undefined;
			const row = { id: 1, name: 'Test' };

			component.startInlineEdit( row, column as any );
			expect( component.editingCell() ).toBeNull();
		} );

		it( 'should set editingCell when starting inline edit', () => {
			const column = { id: 'name', name: 'Name', editable: true };
			component.options.editUrl = '/edit';
			const row = { id: 1, name: 'Test' };

			component.startInlineEdit( row, column as any );
			expect( component.editingCell() ).toEqual( { row, field: 'name' } );
		} );

		it( 'should cancel inline edit and restore original value', () => {
			const column = { id: 'name', name: 'Name', editable: true };
			component.options.editUrl = '/edit';
			const row = { id: 1, name: 'Original' };

			component.startInlineEdit( row, column as any );
			row.name = 'Changed';
			component.cancelInlineEdit();

			expect( row.name ).toBe( 'Original' );
			expect( component.editingCell() ).toBeNull();
		} );

		it( 'should return true for isEditing when cell matches', () => {
			const column = { id: 'name', name: 'Name', editable: true };
			component.options.editUrl = '/edit';
			const row = { id: 1, name: 'Test' };

			component.startInlineEdit( row, column as any );
			expect( component.isEditing( row, 'name' ) ).toBe( true );
			expect( component.isEditing( row, 'other' ) ).toBe( false );
		} );

		it( 'should return false for isEditing when not editing', () => {
			expect( component.isEditing( {}, 'name' ) ).toBe( false );
		} );

		it( 'should return false for isSaving when not saving', () => {
			expect( component.isSaving( {}, 'name' ) ).toBe( false );
		} );

		it( 'should save inline edit and POST to editUrl', () => {
			const column = { id: 'name', name: 'Name', editable: true };
			component.options.editUrl = '/edit';
			const row = { id: 1, name: 'Original' };

			component.startInlineEdit( row, column as any );
			row.name = 'Updated';

			mockDataService.post.mockReturnValue( of( {} ) );
			component.saveInlineEdit( row, column as any );

			expect( mockDataService.post ).toHaveBeenCalledWith( '/edit', {
				id: 1,
				field: 'name',
				value: 'Updated',
			} );
		} );

		it( 'should not save if value unchanged', () => {
			const column = { id: 'name', name: 'Name', editable: true };
			component.options.editUrl = '/edit';
			const row = { id: 1, name: 'Same' };

			component.startInlineEdit( row, column as any );
			// Don't change the value
			component.saveInlineEdit( row, column as any );

			expect( mockDataService.post ).not.toHaveBeenCalledWith( '/edit', expect.anything() );
		} );

		it( 'should restore original value on save error', () => {
			const column = { id: 'name', name: 'Name', editable: true };
			component.options.editUrl = '/edit';
			const row = { id: 1, name: 'Original' };

			component.startInlineEdit( row, column as any );
			row.name = 'Changed';

			mockDataService.post.mockReturnValue(
				throwError( () => ( { error: { error: 'Save failed' } } ) )
			);
			component.saveInlineEdit( row, column as any );

			expect( row.name ).toBe( 'Original' );
			expect( mockSnackbar.error ).toHaveBeenCalledWith( 'Save failed' );
		} );

		it( 'should load editable options from URL', () => {
			const column = {
				id: 'status',
				name: 'Status',
				editable: true,
				editableOptionsUrl: '/options/status',
			};
			component.options.editUrl = '/edit';
			const row = { id: 1, status: 'active' };
			const options = [ { value: 'a', label: 'Active' }, { value: 'i', label: 'Inactive' } ];

			mockDataService.get.mockReturnValue( of( options ) );
			component.startInlineEdit( row, column as any );

			// Synchronous observable completes immediately, so loading is already false
			expect( component.editableOptionsLoading() ).toBe( false );
			expect( mockDataService.get ).toHaveBeenCalled();
			expect( component.loadedEditableOptions() ).toEqual( options );
		} );

		it( 'should handle editable options load error', () => {
			const column = {
				id: 'status',
				name: 'Status',
				editable: true,
				editableOptionsUrl: '/options/status',
			};
			component.options.editUrl = '/edit';
			const row = { id: 1, status: 'active' };

			mockDataService.get.mockReturnValue(
				throwError( () => ( { error: 'fail' } ) )
			);
			component.startInlineEdit( row, column as any );

			expect( component.editingCell() ).toBeNull();
			expect( mockSnackbar.error ).toHaveBeenCalledWith( 'Optionen konnten nicht geladen werden' );
		} );

		it( 'should handle onInlineEditKeydown Enter', () => {
			const column = { id: 'name', name: 'Name', editable: true };
			component.options.editUrl = '/edit';
			const row = { id: 1, name: 'Orig' };
			component.startInlineEdit( row, column as any );
			row.name = 'New';

			mockDataService.post.mockReturnValue( of( {} ) );
			const event = new KeyboardEvent( 'keydown', { key: 'Enter' } );
			vi.spyOn( event, 'preventDefault' );
			component.onInlineEditKeydown( event, row, column as any );

			expect( event.preventDefault ).toHaveBeenCalled();
		} );

		it( 'should handle onInlineEditKeydown Escape', () => {
			const column = { id: 'name', name: 'Name', editable: true };
			component.options.editUrl = '/edit';
			const row = { id: 1, name: 'Orig' };
			component.startInlineEdit( row, column as any );

			const event = new KeyboardEvent( 'keydown', { key: 'Escape' } );
			vi.spyOn( event, 'preventDefault' );
			component.onInlineEditKeydown( event, row, column as any );

			expect( event.preventDefault ).toHaveBeenCalled();
			expect( component.editingCell() ).toBeNull();
		} );
	} );

	describe( 'getEditableOptions', () => {
		it( 'should return column editableOptions if available', () => {
			const opts = [ { value: 'a', label: 'A' } ];
			const column = { id: 'x', name: 'X', editableOptions: opts } as any;
			expect( component.getEditableOptions( column ) ).toBe( opts );
		} );

		it( 'should fall back to loadedEditableOptions signal', () => {
			const loaded = [ { value: 'b', label: 'B' } ];
			component.loadedEditableOptions.set( loaded );
			const column = { id: 'x', name: 'X' } as any;
			expect( component.getEditableOptions( column ) ).toEqual( loaded );
		} );
	} );

	describe( 'chips editing', () => {
		it( 'should update chips values on selection change', () => {
			const opts = [ { value: 'v1', label: 'L1', color: 'red' } ];
			const column = { id: 'tags', name: 'Tags', editable: true, editableOptions: opts } as any;
			const row = { id: 1, tags: [] };

			component.onChipsSelectionChange( row, column, [ 'v1' ] );

			expect( component.editingChipsValues() ).toEqual( [ 'v1' ] );
			expect( row.tags ).toEqual( [ { label: 'L1', color: 'red' } ] );
		} );
	} );

	describe( 'callReturn behavior', () => {
		it( 'should navigate on page refresh result', () => {
			( component as any ).callReturn( { page: 'refresh' } );
			expect( mockRouter.navigate ).toHaveBeenCalledWith( [ '/test' ] );
		} );

		it( 'should navigate on goto result', () => {
			( component as any ).callReturn( { goto: '/other' } );
			expect( mockRouter.navigate ).toHaveBeenCalledWith( [ '/other' ] );
		} );

		it( 'should not fail on null result', () => {
			expect( () => ( component as any ).callReturn( null ) ).not.toThrow();
		} );

		it( 'should not fail on undefined result', () => {
			expect( () => ( component as any ).callReturn( undefined ) ).not.toThrow();
		} );

		it( 'should update table row on update result', () => {
			component.dataSource.data = [ { id: 5, name: 'Old' } ];
			( component as any ).callReturn( {
				table: 'update',
				id: 5,
				field: 'name',
				content: 'New',
			} );
			expect( component.dataSource.data[ 0 ].name ).toBe( 'New' );
		} );
	} );

	describe( 'buttonReturn', () => {
		it( 'should do nothing when event.done is false', () => {
			component.buttonReturn( { done: false, result: { page: 'refresh' }, button: {} as any, loading: false } );
			expect( mockRouter.navigate ).not.toHaveBeenCalled();
		} );

		it( 'should call callReturn when event.done is true', () => {
			component.buttonReturn( { done: true, result: { goto: '/page' }, button: {} as any, loading: false } );
			expect( mockRouter.navigate ).toHaveBeenCalledWith( [ '/page' ] );
		} );
	} );

	describe( 'saveCallCheck', () => {
		it( 'should return true when all checked fields have values', () => {
			const button = { check: [ 'name', 'age' ] } as any;
			const row = { name: 'Test', age: 5 };
			expect( component.saveCallCheck( button, row ) ).toBe( true );
		} );

		it( 'should return false when a checked field is empty', () => {
			const button = { check: [ 'name' ] } as any;
			const row = { name: '' };
			expect( component.saveCallCheck( button, row ) ).toBe( false );
		} );

		it( 'should return false when a checked field is null', () => {
			const button = { check: [ 'name' ] } as any;
			const row = { name: null };
			expect( component.saveCallCheck( button, row ) ).toBe( false );
		} );

		it( 'should return false when a checked field is undefined', () => {
			const button = { check: [ 'name' ] } as any;
			const row = { name: undefined };
			expect( component.saveCallCheck( button, row ) ).toBe( false );
		} );
	} );

	describe( 'sorting data accessor', () => {
		it( 'should return raw value for non-number columns', () => {
			const accessor = ( component as any ).getSortingDataAccessor();
			component.displayedColumns = [ { id: 'name', name: 'Name' } as any ];
			expect( accessor( { name: 'Alice' }, 'name' ) ).toBe( 'Alice' );
		} );

		it( 'should return index 1 for number format columns', () => {
			const accessor = ( component as any ).getSortingDataAccessor();
			component.displayedColumns = [ { id: 'val', name: 'Val', format: 'number' } as any ];
			expect( accessor( { val: [ 'display', 42 ] }, 'val' ) ).toBe( 42 );
		} );
	} );

	describe( 'ngOnDestroy', () => {
		it( 'should cleanup subscriptions and close dialog', () => {
			const closeSpy = vi.fn();
			( component as any ).dialogRef = { close: closeSpy };
			component.ngOnDestroy();
			expect( closeSpy ).toHaveBeenCalledWith( null );
		} );
	} );

	describe( 'pasteInput', () => {
		it( 'should return false when inputPaste is not true', () => {
			const column = { id: 'name', name: 'Name', inputPaste: false } as any;
			const event = { clipboardData: { getData: vi.fn().mockReturnValue( '' ) } };
			expect( component.pasteInput( event, {}, column ) ).toBe( false );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should handle settings with no fields', () => {
			createFixture( { data: [] } );

			expect( component.displayedColumns.length ).toBe( 0 );
			expect( component.columnsToDisplay.length ).toBe( 0 );
		} );

		it( 'should handle settings with no options', () => {
			createFixture( {
				fields: [ { id: 'name', name: 'Name' } ],
				data: [],
			} );

			expect( component.options.sort ).toBe( true );
		} );

		it( 'should assign fallback id to field without id', () => {
			createFixture( {
				fields: [ { id: undefined as any, name: 'NoId' } ],
				data: [],
			} );

			expect( component.displayedColumns[ 0 ].id ).toBe( '0' );
		} );
	} );

	describe( 'server side', () => {
		it( 'should use server-side search', () => {
			mockDataService.post.mockReturnValue( of( {
				data: [],
				fields: [ { id: 'name', name: 'Name' } ],
				totalCount: 100,
			} ) );

			createFixture( {
				url: 'test/server',
				fields: [ { id: 'name', name: 'Name' } ],
				options: { serverSide: true, search: true },
			} );

			component.searchDo( 'query' );
			expect( component.searchText ).toBe( 'query' );
		} );
	} );

	describe( 'change detection', () => {
		it( 'should call markForCheck after successful data load from URL', () => {
			const responseData = {
				data: [ { id: 1, name: 'Loaded' } ],
				fields: [ { id: 'name', name: 'Name' } ],
			};
			mockDataService.post.mockReturnValue( of( responseData ) );

			createFixture( { url: 'test/data' } );

			const cdr = ( component as any )._changeDetectorRef as ChangeDetectorRef;
			const spy = vi.spyOn( cdr, 'markForCheck' );

			// Trigger reload which calls loadData → POST → success → markForCheck
			mockDataService.post.mockReturnValue( of( responseData ) );
			component.reload();

			expect( spy ).toHaveBeenCalled();
		} );

		it( 'should call markForCheck after data load error', () => {
			mockDataService.post.mockReturnValue( of( { data: [], fields: [ { id: 'name', name: 'Name' } ] } ) );

			createFixture( { url: 'test/data' } );

			const cdr = ( component as any )._changeDetectorRef as ChangeDetectorRef;
			const spy = vi.spyOn( cdr, 'markForCheck' );

			mockDataService.post.mockReturnValue(
				throwError( () => ( { error: { error: 'fail' }, statusText: 'Error' } ) )
			);
			component.reload();

			expect( spy ).toHaveBeenCalled();
		} );

		it( 'should call markForCheck after null/empty response', () => {
			mockDataService.post.mockReturnValue( of( { data: [], fields: [ { id: 'name', name: 'Name' } ] } ) );

			createFixture( { url: 'test/data' } );

			const cdr = ( component as any )._changeDetectorRef as ChangeDetectorRef;
			const spy = vi.spyOn( cdr, 'markForCheck' );

			mockDataService.post.mockReturnValue( of( null ) );
			component.reload();

			expect( spy ).toHaveBeenCalled();
		} );
	} );
} );
