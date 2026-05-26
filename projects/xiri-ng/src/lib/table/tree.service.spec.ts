import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { XiriLocalStorageService } from '../services/localStorage.service';
import {
	buildTree,
	collectExpandableIds,
	flatten,
	normalizeParent,
	searchProjection,
	XiriTableTreeService,
} from './tree.service';

// Shared fixture: 3 roots (Graz, Orphan, Wien), Wien has two children, Favoriten one grandchild.
function sampleRows() {
	return [
		{ id: 1, parentId: 0, name: 'Wien' },
		{ id: 2, parentId: 1, name: 'Favoriten' },
		{ id: 3, parentId: 1, name: 'Döbling' },
		{ id: 4, parentId: 2, name: 'Inzersdorf' },
		{ id: 5, parentId: 0, name: 'Graz' },
		{ id: 6, parentId: 99, name: 'Orphan' }, // parent 99 missing → treated as root
	];
}

const byName = ( name: string ) => ( row: any ) => row.name === name;

describe( 'tree pure functions', () => {

	describe( 'normalizeParent', () => {
		it( 'treats null/undefined/0/"" as root', () => {
			expect( normalizeParent( null ) ).toBeNull();
			expect( normalizeParent( undefined ) ).toBeNull();
			expect( normalizeParent( 0 ) ).toBeNull();
			expect( normalizeParent( '' ) ).toBeNull();
		} );
		it( 'keeps real parent ids', () => {
			expect( normalizeParent( 5 ) ).toBe( 5 );
			expect( normalizeParent( 'abc' ) ).toBe( 'abc' );
		} );
	} );

	describe( 'buildTree', () => {
		it( 'builds multi-root tree with correct depth', () => {
			const roots = buildTree( sampleRows(), 'id', 'parentId', 'name' );
			// Roots sorted alphabetically: Graz, Orphan, Wien
			expect( roots.map( r => r.row.name ) ).toEqual( [ 'Graz', 'Orphan', 'Wien' ] );

			const wien = roots.find( r => r.row.name === 'Wien' )!;
			// Siblings sorted: Döbling before Favoriten
			expect( wien.children.map( c => c.row.name ) ).toEqual( [ 'Döbling', 'Favoriten' ] );
			expect( wien.level ).toBe( 0 );

			const favoriten = wien.children.find( c => c.row.name === 'Favoriten' )!;
			expect( favoriten.level ).toBe( 1 );
			expect( favoriten.children[ 0 ].row.name ).toBe( 'Inzersdorf' );
			expect( favoriten.children[ 0 ].level ).toBe( 2 );
		} );

		it( 'treats nodes with missing parents as roots', () => {
			const roots = buildTree( sampleRows(), 'id', 'parentId', 'name' );
			expect( roots.some( r => r.row.name === 'Orphan' ) ).toBe( true );
		} );

		it( 'detects cycles and treats nodes as roots without crashing', () => {
			const warn = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const rows = [
				{ id: 1, parentId: 2, name: 'A' },
				{ id: 2, parentId: 1, name: 'B' },
			];
			const roots = buildTree( rows, 'id', 'parentId', 'name' );
			expect( roots.length ).toBe( 2 );
			expect( warn ).toHaveBeenCalled();
			warn.mockRestore();
		} );
	} );

	describe( 'collectExpandableIds', () => {
		it( 'returns only ids of nodes that have children', () => {
			const roots = buildTree( sampleRows(), 'id', 'parentId', 'name' );
			const ids = collectExpandableIds( roots );
			expect( ids.has( 1 ) ).toBe( true ); // Wien
			expect( ids.has( 2 ) ).toBe( true ); // Favoriten
			expect( ids.has( 5 ) ).toBe( false ); // Graz (leaf)
			expect( ids.has( 4 ) ).toBe( false ); // Inzersdorf (leaf)
		} );
	} );

	describe( 'flatten', () => {
		it( 'shows only roots when nothing is expanded', () => {
			const roots = buildTree( sampleRows(), 'id', 'parentId', 'name' );
			const rows = flatten( roots, new Set() );
			expect( rows.map( r => r.name ) ).toEqual( [ 'Graz', 'Orphan', 'Wien' ] );
			expect( rows.find( r => r.name === 'Wien' )!._tree.hasChildren ).toBe( true );
			expect( rows.find( r => r.name === 'Wien' )!._tree.expanded ).toBe( false );
			expect( rows.find( r => r.name === 'Wien' )!._tree.childCount ).toBe( 2 );
		} );

		it( 'reveals children of expanded nodes in tree order', () => {
			const roots = buildTree( sampleRows(), 'id', 'parentId', 'name' );
			const rows = flatten( roots, new Set( [ 1, 2 ] ) ); // Wien + Favoriten expanded
			expect( rows.map( r => r.name ) ).toEqual(
				[ 'Graz', 'Orphan', 'Wien', 'Döbling', 'Favoriten', 'Inzersdorf' ] );
			expect( rows.find( r => r.name === 'Inzersdorf' )!._tree.level ).toBe( 2 );
		} );
	} );

	describe( 'searchProjection', () => {
		it( 'shows matches plus their ancestor path, dimming ancestors', () => {
			const roots = buildTree( sampleRows(), 'id', 'parentId', 'name' );
			const rows = searchProjection( roots, byName( 'Inzersdorf' ) );
			expect( rows.map( r => r.name ) ).toEqual( [ 'Wien', 'Favoriten', 'Inzersdorf' ] );
			expect( rows.find( r => r.name === 'Wien' )!._tree.dimmed ).toBe( true );
			expect( rows.find( r => r.name === 'Favoriten' )!._tree.dimmed ).toBe( true );
			expect( rows.find( r => r.name === 'Inzersdorf' )!._tree.dimmed ).toBe( false );
		} );

		it( 'returns empty when nothing matches', () => {
			const roots = buildTree( sampleRows(), 'id', 'parentId', 'name' );
			expect( searchProjection( roots, byName( 'nope' ) ) ).toEqual( [] );
		} );
	} );
} );

describe( 'XiriTableTreeService', () => {
	let service: XiriTableTreeService;
	let mockLocalStorage: { [ key: string ]: string };

	beforeEach( () => {
		mockLocalStorage = {};
		vi.stubGlobal( 'localStorage', {
			getItem:    ( k: string ) => mockLocalStorage[ k ] || null,
			setItem:    ( k: string, v: string ) => { mockLocalStorage[ k ] = v; },
			removeItem: ( k: string ) => { delete mockLocalStorage[ k ]; },
			clear:      () => { mockLocalStorage = {}; },
			length: 0, key: vi.fn(),
		} );

		TestBed.configureTestingModule( {
			providers: [ XiriLocalStorageService, XiriTableTreeService ],
		} );
		service = TestBed.inject( XiriTableTreeService );
	} );

	afterEach( () => vi.unstubAllGlobals() );

	it( 'is collapsed by default (only roots visible)', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', treeColumn: 'name' }, 'name' );
		service.build( sampleRows() );
		expect( service.visibleRows().map( r => r.name ) ).toEqual( [ 'Graz', 'Orphan', 'Wien' ] );
	} );

	it( 'honours expandAllByDefault', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', treeColumn: 'name', expandAllByDefault: true }, 'name' );
		service.build( sampleRows() );
		expect( service.visibleRows().length ).toBe( 6 );
	} );

	it( 'toggles a single node', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', treeColumn: 'name' }, 'name' );
		service.build( sampleRows() );
		service.toggle( { id: 1 } ); // expand Wien
		expect( service.visibleRows().some( r => r.name === 'Favoriten' ) ).toBe( true );
		service.toggle( { id: 1 } ); // collapse Wien
		expect( service.visibleRows().some( r => r.name === 'Favoriten' ) ).toBe( false );
	} );

	it( 'expandAll / collapseAll', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', treeColumn: 'name' }, 'name' );
		service.build( sampleRows() );
		service.expandAll();
		expect( service.visibleRows().length ).toBe( 6 );
		service.collapseAll();
		expect( service.visibleRows().length ).toBe( 3 );
	} );

	it( 'persists expand-state to localStorage and restores it on rebuild', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', treeColumn: 'name', persistStateKey: 'demo' }, 'name' );
		service.build( sampleRows() );
		service.toggle( { id: 1 } ); // expand Wien → persisted

		expect( mockLocalStorage[ 'xiri-tree-state-demo' ] ).toBeDefined();

		// Rebuilding reads the persisted state back (Wien stays expanded → Favoriten visible).
		service.build( sampleRows() );
		expect( service.visibleRows().some( r => r.name === 'Favoriten' ) ).toBe( true );
	} );

	it( 'saves and restores expand-state across a search (Spec §5)', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', treeColumn: 'name' }, 'name' );
		service.build( sampleRows() );
		service.toggle( { id: 1 } ); // expand Wien

		// Activate search → projection (matches + ancestors)
		const searched = service.applySearch( byName( 'Inzersdorf' ) );
		expect( searched.map( r => r.name ) ).toEqual( [ 'Wien', 'Favoriten', 'Inzersdorf' ] );

		// Reset search → previous expand-state restored (Wien still expanded, Favoriten visible)
		const restored = service.applySearch( null );
		expect( restored.some( r => r.name === 'Favoriten' ) ).toBe( true );
		expect( restored.some( r => r.name === 'Inzersdorf' ) ).toBe( false ); // Favoriten not expanded
	} );

	it( 'resolves the +sub url with the {id} placeholder', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', addSubUrl: '/Group/Add?parent={id}' }, 'name' );
		service.build( sampleRows() );
		expect( service.addSubUrlFor( { id: 42 } ) ).toBe( '/Group/Add?parent=42' );
	} );
} );
