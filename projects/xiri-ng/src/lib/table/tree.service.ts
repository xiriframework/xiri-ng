import { inject, Injectable } from '@angular/core';
import { XiriLocalStorageService } from '../services/localStorage.service';
import { XiriTagChip } from '../formfields/field.interface';

// A single table cell value. Rows are JSON delivered by the Go builder, so cell values are
// genuinely dynamic (scalars, nested arrays for formats like "number"/"buttons", or chip objects).
// The recursive shape keeps deep template accesses (row[col][i], chip.label, …) type-checking
// under strictTemplates without resorting to `any`.
export type XiriTableCellValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| XiriTagChip
	| XiriTableCellValue[]
	| { [key: string]: XiriTableCellValue };

// A flat table row: arbitrary JSON keyed by column id, plus the tree metadata attached at runtime.
export interface XiriTableRow {
	[key: string]: XiriTableCellValue | XiriTreeMeta | undefined;
	id?: string | number;
	select?: boolean;
	_tree?: XiriTreeMeta;
}

// Identifier of a tree node (the value of the row's id field) — string or number in practice.
export type XiriTreeId = string | number;

/**
 * Opt-in tree-mode settings for xiri-table. When present on XiriTableSettings.tree, the
 * table renders rows hierarchically (indent + expand/collapse) based on each flat row's
 * id/parentId values. Without it the table renders as a flat list (unchanged behaviour).
 */
export interface XiriTableTreeSettings {
	idField: string                          // row field holding the node ID
	parentIdField: string                    // row field holding the parent ID; null/undefined/0 = root
	treeColumn?: string                      // column that renders the indentation; default: first column
	collapseAllByDefault?: boolean           // default: false → tree starts fully expanded
	persistStateKey?: string                 // localStorage key; without it no persistence
	showCounts?: boolean                     // "(5)" badge when collapsed; default: true
	addSubHandler?: ( parentRow: XiriTableRow ) => void // when set → "+ sub" button per row (Angular consumers)
	addSubUrl?: string                       // when set → "+ sub" button that navigates here ({id} placeholder)
	addSubField?: string                     // per-row field whose truthy value gates the "+ sub" button (xiri-go path)
	addSubWhen?: ( row: XiriTableRow ) => boolean // predicate gating the "+ sub" button per row (Angular consumers)
}

/** Per-row tree metadata, attached as row._tree by flatten()/searchProjection(). */
export interface XiriTreeMeta {
	level: number          // indentation depth (0 = root)
	hasChildren: boolean   // node has at least one (visible) child
	expanded: boolean      // node is currently expanded
	childCount: number     // number of direct (visible) children
	dimmed?: boolean       // ancestor-only context node during an active search
}

export interface XiriTreeNode {
	id: XiriTreeId
	row: XiriTableRow
	children: XiriTreeNode[]
	level: number
}

const STATE_PREFIX = 'xiri-tree-state-';

// ============================================================================
// Pure functions (no Angular dependencies — directly unit-testable)
// ============================================================================

/** Normalises a parent reference: null/undefined/0/'' are treated as "no parent" (root). */
export function normalizeParent( value: unknown ): XiriTreeId | null {
	if ( value === null || value === undefined || value === 0 || value === '' )
		return null;
	return value as XiriTreeId;
}

/**
 * Builds a node tree from a flat row list. Rows whose parentId is missing from the dataset
 * become roots. Cycles are detected and the offending node is treated as a root (with a
 * console warning) instead of crashing.
 */
export function buildTree( rows: XiriTableRow[], idField: string, parentIdField: string, treeColumn?: string ): XiriTreeNode[] {
	const nodeMap = new Map<XiriTreeId, XiriTreeNode>();
	for ( const row of rows ) {
		const id = row[ idField ] as XiriTreeId;
		nodeMap.set( id, { id, row, children: [], level: 0 } );
	}

	const roots: XiriTreeNode[] = [];

	for ( const row of rows ) {
		const node = nodeMap.get( row[ idField ] as XiriTreeId )!;
		const pid = normalizeParent( row[ parentIdField ] );
		const parent = pid !== null ? nodeMap.get( pid ) : undefined;

		if ( !parent ) {
			roots.push( node );
		} else if ( createsCycle( node.id, parent, nodeMap, idField, parentIdField ) ) {
			console.warn( `xiri-table tree: cycle detected for node "${ node.id }", treating it as a root` );
			roots.push( node );
		} else {
			parent.children.push( node );
		}
	}

	assignLevels( roots, 0 );
	if ( treeColumn )
		sortSiblings( roots, treeColumn );

	return roots;
}

/** Walks up from candidateParent; returns true if it reaches nodeId (would create a cycle). */
function createsCycle( nodeId: XiriTreeId, candidateParent: XiriTreeNode, nodeMap: Map<XiriTreeId, XiriTreeNode>,
                       idField: string, parentIdField: string ): boolean {
	let current: XiriTreeNode | undefined = candidateParent;
	const seen = new Set<XiriTreeId>();
	while ( current ) {
		if ( current.id === nodeId )
			return true;
		if ( seen.has( current.id ) )
			return true; // pre-existing cycle further up
		seen.add( current.id );
		const ppid = normalizeParent( current.row[ parentIdField ] );
		current = ppid !== null ? nodeMap.get( ppid ) : undefined;
	}
	return false;
}

function assignLevels( nodes: XiriTreeNode[], level: number ): void {
	for ( const node of nodes ) {
		node.level = level;
		assignLevels( node.children, level + 1 );
	}
}

/** Sorts siblings alphabetically by the tree column at every level. */
export function sortSiblings( nodes: XiriTreeNode[], treeColumn: string ): void {
	nodes.sort( ( a, b ) =>
		String( a.row[ treeColumn ] ?? '' ).localeCompare( String( b.row[ treeColumn ] ?? '' ), undefined, { sensitivity: 'base' } ) );
	for ( const node of nodes )
		sortSiblings( node.children, treeColumn );
}

/**
 * Projects the tree to the flat, ordered list of currently visible rows, annotating each
 * row with its tree metadata (row._tree). Children are only included when their parent is
 * in expandedIds.
 */
export function flatten( roots: XiriTreeNode[], expandedIds: Set<XiriTreeId> ): XiriTableRow[] {
	const out: XiriTableRow[] = [];
	const walk = ( nodes: XiriTreeNode[] ) => {
		for ( const node of nodes ) {
			const hasChildren = node.children.length > 0;
			const expanded = hasChildren && expandedIds.has( node.id );
			node.row._tree = {
				level:       node.level,
				hasChildren,
				expanded,
				childCount:  node.children.length,
			} as XiriTreeMeta;
			out.push( node.row );
			if ( expanded )
				walk( node.children );
		}
	};
	walk( roots );
	return out;
}

/**
 * Search projection: returns each match together with its full subtree (all descendants)
 * plus the ancestor path leading to it; everything else is hidden. Matches and their
 * descendants are shown fully; ancestor-only context nodes are flagged dimmed. Within the
 * filtered result, expand/collapse follows `expandedIds` (same state model as the flat view) —
 * pass an all-expanded set to show everything. The `matches` predicate decides hits.
 */
export function searchProjection( roots: XiriTreeNode[], matches: ( row: XiriTableRow ) => boolean,
                                  expandedIds: Set<XiriTreeId> ): XiriTableRow[] {
	const visible = new Set<XiriTreeNode>();
	const inMatchSubtree = new Set<XiriTreeNode>(); // node matches itself or sits under a match → shown fully

	// underMatch: an ancestor of this node already matched, so the whole subtree is shown.
	const mark = ( node: XiriTreeNode, underMatch: boolean ): boolean => {
		const selfMatch = matches( node.row );
		const inSubtree = underMatch || selfMatch;
		if ( inSubtree )
			inMatchSubtree.add( node );

		let descendantVisible = false;
		for ( const child of node.children )
			descendantVisible = mark( child, inSubtree ) || descendantVisible;

		// Visible if part of a matched subtree, or an ancestor on the path to a deeper match.
		if ( inSubtree || descendantVisible ) {
			visible.add( node );
			return true;
		}
		return false;
	};
	for ( const root of roots )
		mark( root, false );

	const out: XiriTableRow[] = [];
	const walk = ( nodes: XiriTreeNode[] ) => {
		for ( const node of nodes ) {
			if ( !visible.has( node ) )
				continue;
			const visibleChildren = node.children.filter( c => visible.has( c ) );
			const hasChildren = visibleChildren.length > 0;
			const expanded = hasChildren && expandedIds.has( node.id );
			node.row._tree = {
				level:      node.level,
				hasChildren,
				expanded,
				childCount: visibleChildren.length,
				dimmed:     !inMatchSubtree.has( node ),
			} as XiriTreeMeta;
			out.push( node.row );
			if ( expanded )
				walk( node.children );
		}
	};
	walk( roots );
	return out;
}

/** Collects the ids of every node that has at least one child (i.e. is expandable). */
export function collectExpandableIds( roots: XiriTreeNode[] ): Set<XiriTreeId> {
	const ids = new Set<XiriTreeId>();
	const walk = ( nodes: XiriTreeNode[] ) => {
		for ( const node of nodes ) {
			if ( node.children.length > 0 ) {
				ids.add( node.id );
				walk( node.children );
			}
		}
	};
	walk( roots );
	return ids;
}

// ============================================================================
// Stateful service (one instance per table, provided in the component)
// ============================================================================

@Injectable()
export class XiriTableTreeService {

	private localStorage = inject( XiriLocalStorageService );

	private config: XiriTableTreeSettings | null = null;
	private treeColumnId = '';
	private roots: XiriTreeNode[] = [];
	private expanded = new Set<XiriTreeId>();
	private savedExpanded: Set<XiriTreeId> | null = null; // expand-state snapshot taken when a search starts
	private searchActive = false;

	/** Whether tree mode is active for this table. */
	get enabled(): boolean { return this.config !== null; }
	get settings(): XiriTableTreeSettings | null { return this.config; }
	get treeColumn(): string { return this.treeColumnId; }
	get showCounts(): boolean { return this.config?.showCounts !== false; }
	get hasAddSub(): boolean { return !!( this.config?.addSubHandler || this.config?.addSubUrl ); }

	/** Initialises the service from the table's tree settings. treeColumn falls back to firstColumnId. */
	init( config: XiriTableTreeSettings, firstColumnId: string ): void {
		this.config = config;
		this.treeColumnId = config.treeColumn || firstColumnId;
	}

	/** Builds the tree from flat rows and initialises the expand-state. */
	build( rows: XiriTableRow[] ): void {
		if ( !this.config )
			return;

		this.roots = buildTree( rows, this.config.idField, this.config.parentIdField, this.treeColumnId );

		const persisted = this.loadPersisted();
		if ( persisted )
			this.expanded = new Set( persisted );           // persisted state wins
		else if ( this.config.collapseAllByDefault )
			this.expanded = new Set();                       // opt-in: start collapsed
		else
			this.expanded = collectExpandableIds( this.roots ); // default: start fully expanded
	}

	/** Returns the visible rows: search projection when searching, otherwise the expand-state flatten. */
	visibleRows( matches?: ( row: XiriTableRow ) => boolean ): XiriTableRow[] {
		if ( this.searchActive && matches )
			return searchProjection( this.roots, matches, this.expanded );
		return flatten( this.roots, this.expanded );
	}

	/**
	 * Applies (or clears) a search. On the empty→active transition the current expand-state is
	 * snapshotted and the tree is fully expanded (so all matches are visible); during the search
	 * the same `expanded` state drives expand/collapse, so the arrows work. On active→empty the
	 * pre-search state is restored (Spec §5). Returns the new visible rows.
	 */
	applySearch( matches: ( ( row: XiriTableRow ) => boolean ) | null ): XiriTableRow[] {
		if ( matches ) {
			if ( !this.searchActive ) {
				this.savedExpanded = new Set( this.expanded );
				this.expanded = collectExpandableIds( this.roots ); // start fully expanded
				this.searchActive = true;
			}
			return searchProjection( this.roots, matches, this.expanded );
		}

		if ( this.searchActive ) {
			if ( this.savedExpanded )
				this.expanded = new Set( this.savedExpanded );
			this.savedExpanded = null;
			this.searchActive = false;
		}
		return flatten( this.roots, this.expanded );
	}

	toggle( row: XiriTableRow ): void {
		const id = row[ this.config!.idField ] as XiriTreeId;
		if ( this.expanded.has( id ) )
			this.expanded.delete( id );
		else
			this.expanded.add( id );
		// Don't persist transient expand changes made while searching — savedExpanded holds the
		// real state and is restored on reset.
		if ( !this.searchActive )
			this.persist();
	}

	expandAll(): void {
		this.expanded = collectExpandableIds( this.roots );
		this.persist();
	}

	collapseAll(): void {
		this.expanded = new Set();
		this.persist();
	}

	/**
	 * Whether the "+ sub" button should be shown for a given row. Opt-in: an addSubWhen predicate
	 * or a truthy addSubField value gates it; without either, the button shows on every row.
	 */
	canAddSub( row: XiriTableRow ): boolean {
		if ( !this.config )
			return false;
		if ( this.config.addSubWhen )
			return this.config.addSubWhen( row );
		if ( this.config.addSubField )
			return !!row[ this.config.addSubField ];
		return true;
	}

	/** Resolves the "+ sub" target URL for a row, substituting the {id} placeholder. */
	addSubUrlFor( row: XiriTableRow ): string | null {
		if ( !this.config?.addSubUrl )
			return null;
		return this.config.addSubUrl.replace( '{id}', encodeURIComponent( String( row[ this.config.idField ] ) ) );
	}

	private storageKey(): string | null {
		return this.config?.persistStateKey ? STATE_PREFIX + this.config.persistStateKey : null;
	}

	private loadPersisted(): XiriTreeId[] | null {
		const key = this.storageKey();
		if ( !key )
			return null;
		const value = this.localStorage.get( key );
		return Array.isArray( value ) ? value as XiriTreeId[] : null;
	}

	private persist(): void {
		const key = this.storageKey();
		if ( key )
			this.localStorage.set( key, Array.from( this.expanded ) );
	}
}
