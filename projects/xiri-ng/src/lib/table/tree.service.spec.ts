import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { XiriLocalStorageService } from '../services/localStorage.service';
import {
	buildTree,
	collectExpandableIds,
	flatten,
	normalizeParent,
	searchProjection,
	XiriTableRow,
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

const byName = ( name: string ) => ( row: XiriTableRow ) => row.name === name;

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
			const warn = vi.spyOn( console, 'warn' ).mockImplementation( () => { /* intentionally empty */ } );
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
			const rows = searchProjection( roots, byName( 'Inzersdorf' ), collectExpandableIds( roots ) );
			expect( rows.map( r => r.name ) ).toEqual( [ 'Wien', 'Favoriten', 'Inzersdorf' ] );
			expect( rows.find( r => r.name === 'Wien' )!._tree.dimmed ).toBe( true );
			expect( rows.find( r => r.name === 'Favoriten' )!._tree.dimmed ).toBe( true );
			expect( rows.find( r => r.name === 'Inzersdorf' )!._tree.dimmed ).toBe( false );
		} );

		it( 'shows the full subtree of a match (descendants included, not dimmed)', () => {
			const roots = buildTree( sampleRows(), 'id', 'parentId', 'name' );
			const rows = searchProjection( roots, byName( 'Wien' ), collectExpandableIds( roots ) );
			// Wien matches (root) → it and all descendants are shown, in tree order.
			expect( rows.map( r => r.name ) ).toEqual( [ 'Wien', 'Döbling', 'Favoriten', 'Inzersdorf' ] );
			// Nothing is dimmed: every shown node is inside the matched subtree.
			expect( rows.every( r => r._tree.dimmed === false ) ).toBe( true );
		} );

		it( 'shows dimmed ancestors AND full descendants for a mid-level match', () => {
			const roots = buildTree( sampleRows(), 'id', 'parentId', 'name' );
			const rows = searchProjection( roots, byName( 'Favoriten' ), collectExpandableIds( roots ) );
			expect( rows.map( r => r.name ) ).toEqual( [ 'Wien', 'Favoriten', 'Inzersdorf' ] );
			expect( rows.find( r => r.name === 'Wien' )!._tree.dimmed ).toBe( true );  // ancestor → context
			expect( rows.find( r => r.name === 'Favoriten' )!._tree.dimmed ).toBe( false ); // match
			expect( rows.find( r => r.name === 'Inzersdorf' )!._tree.dimmed ).toBe( false ); // descendant of match
		} );

		it( 'collapses a branch within the search result when its node is not in expandedIds', () => {
			const roots = buildTree( sampleRows(), 'id', 'parentId', 'name' );
			// Search "Wien" with everything expanded EXCEPT Favoriten (id 2) → Inzersdorf hidden.
			const expanded = collectExpandableIds( roots );
			expanded.delete( 2 );
			const rows = searchProjection( roots, byName( 'Wien' ), expanded );
			expect( rows.map( r => r.name ) ).toEqual( [ 'Wien', 'Döbling', 'Favoriten' ] );
			expect( rows.find( r => r.name === 'Favoriten' )!._tree.expanded ).toBe( false );
			expect( rows.find( r => r.name === 'Favoriten' )!._tree.hasChildren ).toBe( true );
		} );

		it( 'returns empty when nothing matches', () => {
			const roots = buildTree( sampleRows(), 'id', 'parentId', 'name' );
			expect( searchProjection( roots, byName( 'nope' ), collectExpandableIds( roots ) ) ).toEqual( [] );
		} );
	} );
} );

describe( 'XiriTableTreeService', () => {
	let service: XiriTableTreeService;
	let mockLocalStorage: Record<string, string>;

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

	it( 'is fully expanded by default (all nodes visible)', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', treeColumn: 'name' }, 'name' );
		service.build( sampleRows() );
		expect( service.visibleRows().length ).toBe( 6 );
	} );

	it( 'honours collapseAllByDefault (only roots visible)', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', treeColumn: 'name', collapseAllByDefault: true }, 'name' );
		service.build( sampleRows() );
		expect( service.visibleRows().map( r => r.name ) ).toEqual( [ 'Graz', 'Orphan', 'Wien' ] );
	} );

	it( 'toggles a single node', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', treeColumn: 'name', collapseAllByDefault: true }, 'name' );
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
		service.init( { idField: 'id', parentIdField: 'parentId', treeColumn: 'name', collapseAllByDefault: true, persistStateKey: 'demo' }, 'name' );
		service.build( sampleRows() );
		service.toggle( { id: 1 } ); // expand Wien → persisted

		expect( mockLocalStorage[ 'xiri-tree-state-demo' ] ).toBeDefined();

		// Rebuilding reads the persisted state back (Wien stays expanded → Favoriten visible).
		service.build( sampleRows() );
		expect( service.visibleRows().some( r => r.name === 'Favoriten' ) ).toBe( true );
	} );

	it( 'saves and restores expand-state across a search (Spec §5)', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', treeColumn: 'name', collapseAllByDefault: true }, 'name' );
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

	it( 'allows collapse/expand within an active search (re-uses the expanded state)', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', treeColumn: 'name' }, 'name' );
		service.build( sampleRows() );

		const matcher = byName( 'Wien' );
		// Search starts fully expanded → match + whole subtree visible.
		expect( service.applySearch( matcher ).map( r => r.name ) )
			.toEqual( [ 'Wien', 'Döbling', 'Favoriten', 'Inzersdorf' ] );

		// Collapse Favoriten (id 2) during the search → Inzersdorf disappears.
		service.toggle( { id: 2 } );
		expect( service.applySearch( matcher ).map( r => r.name ) )
			.toEqual( [ 'Wien', 'Döbling', 'Favoriten' ] );

		// Expand again → Inzersdorf back.
		service.toggle( { id: 2 } );
		expect( service.applySearch( matcher ).some( r => r.name === 'Inzersdorf' ) ).toBe( true );
	} );

	it( 'does not persist toggles made during a search and restores the pre-search state on reset', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', treeColumn: 'name', collapseAllByDefault: true, persistStateKey: 'demo2' }, 'name' );
		service.build( sampleRows() ); // collapsed by default (collapseAllByDefault)

		service.applySearch( byName( 'Wien' ) ); // activates search (fully expanded internally)
		service.toggle( { id: 2 } );             // collapse during search

		// Transient search toggle must not hit localStorage.
		expect( mockLocalStorage[ 'xiri-tree-state-demo2' ] ).toBeUndefined();

		// Reset → pre-search state (collapsed: only roots).
		expect( service.applySearch( null ).map( r => r.name ) ).toEqual( [ 'Graz', 'Orphan', 'Wien' ] );
	} );

	it( 'resolves the +sub url with the {id} placeholder', () => {
		service.init( { idField: 'id', parentIdField: 'parentId', addSubUrl: '/Group/Add?parent={id}' }, 'name' );
		service.build( sampleRows() );
		expect( service.addSubUrlFor( { id: 42 } ) ).toBe( '/Group/Add?parent=42' );
	} );

	describe( 'canAddSub', () => {
		it( 'returns true for every row when neither addSubField nor addSubWhen is set', () => {
			service.init( { idField: 'id', parentIdField: 'parentId', addSubUrl: '/x' }, 'name' );
			expect( service.canAddSub( { id: 1 } ) ).toBe( true );
		} );

		it( 'gates on a truthy addSubField value', () => {
			service.init( { idField: 'id', parentIdField: 'parentId', addSubUrl: '/x', addSubField: '_addSub' }, 'name' );
			expect( service.canAddSub( { id: 1, _addSub: true } ) ).toBe( true );
			expect( service.canAddSub( { id: 2, _addSub: false } ) ).toBe( false );
			expect( service.canAddSub( { id: 3 } ) ).toBe( false ); // missing → falsy
		} );

		it( 'gates on the addSubWhen predicate (takes precedence over addSubField)', () => {
			service.init( {
				idField: 'id', parentIdField: 'parentId', addSubUrl: '/x',
				addSubField: '_addSub',
				addSubWhen: ( row ) => row.id === 1,
			}, 'name' );
			expect( service.canAddSub( { id: 1, _addSub: false } ) ).toBe( true );  // predicate wins
			expect( service.canAddSub( { id: 2, _addSub: true } ) ).toBe( false );
		} );
	} );
} );
