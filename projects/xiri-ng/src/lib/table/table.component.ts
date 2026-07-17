import {
	ChangeDetectorRef,
	Component,
	computed,
	DestroyRef,
	effect,
	inject,
	input,
	OnDestroy,
	OnInit,
	output,
	signal,
	TemplateRef,
	viewChild,
	ViewEncapsulation
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable, MatSortHeader } from '@angular/material/sort';
import {
	MatCell, MatCellDef,
	MatColumnDef, MatFooterCell, MatFooterCellDef, MatFooterRow, MatFooterRowDef,
	MatHeaderCell, MatHeaderCellDef,
	MatHeaderRow, MatHeaderRowDef,
	MatRow, MatRowDef,
	MatTable,
	MatTableDataSource
} from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Router, RouterLink } from '@angular/router';
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { XiriDialogComponent } from "../dialog/dialog.component";
import { XiriDataService } from '../services/data.service';
import { XiriButton, XiriButtonComponent, XiriButtonResult } from "../button/button.component";
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriResponseHandlerService } from '../services/response-handler.service';
import { XiriDownloadService } from '../services/download.service';
import { XiriTableInlineEditService } from './inline-edit.service';
import { XiriTableCellValue, XiriTableRow, XiriTableTreeService, XiriTableTreeSettings } from './tree.service';
import { XiriButtonlineComponent, XiriButtonlineSettings } from "../buttonline/buttonline.component";
import { XiriDynData } from "../dyncomponent/dyndata.interface";
import { XiriTableField } from "../raw-table/tabefield.interface";
import { XiriSessionStorageService } from "../services/sessionStorage.service";
import { XiriNumberService } from "../services/number.service";
import { SafehtmlPipe } from '../pipes/safehtml.pipe';
import { XiriUrlPipe } from '../pipes/url.pipe';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatTooltip } from '@angular/material/tooltip';
import { XiriButtonstyleComponent } from '../buttonstyle/buttonstyle.component';
import { XiriSearchComponent } from '../search/search.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSelect, MatOption } from '@angular/material/select';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { XiriEmptyStateComponent } from '../empty-state/empty-state.component';
import { XiriColor } from '../types/color.type';


// Minimal shape of an HTTP error as surfaced by the data service (Angular HttpErrorResponse).
interface XiriHttpError {
	error?: { error?: string } | string;
	statusText?: string;
}

// Reads a human-readable message out of an unknown error value.
function errorMessage( err: unknown ): string | undefined {
	const e = err as XiriHttpError;
	const inner = e?.error;
	if ( inner && typeof inner === 'object' && 'error' in inner )
		return inner.error;
	return undefined;
}

// Shape of a server data response consumed by loadData().
export interface XiriTableResponse {
	data?: XiriTableRow[];
	fields?: XiriTableField[];
	summary?: XiriDynData[];
	components?: XiriDynData[];
	footer?: Record<string, XiriTableCellValue>;
	totalCount?: number;
	poll?: number;
	[key: string]: unknown;
}

// Dialog payload passed to XiriDialogComponent from a table button (copied from the button,
// with type/url/data overridden per action). `data` carries either the button's own payload
// or, for selection dialogs, the selected row ids.
type XiriTableDialogData = Omit<Partial<XiriButton>, 'data'> & {
	type: string;
	url?: string;
	data?: XiriButton['data'] | number[];
};

// Persisted (session-storage) table state restored on first data load.
interface XiriTableSavedState {
	pageIndex?: number;
	pageSize?: number;
	filter?: string;
	sort?: string;
	sortDirection?: 'asc' | 'desc' | '';
}

export interface XiriTableEmptyState {
	icon?: string
	iconColor?: XiriColor
	title?: string
	description?: string
}

export interface XiriTableOptions {
	reload?: boolean
	dense?: boolean
	density?: 'compact' | 'regular' | 'relaxed'
	sort?: boolean
	search?: boolean
	class?: string
	pagination?: boolean
	itemsPerPage?: number
	pageSizes?: number[]
	select?: boolean
	selectButtons?: XiriButton[]
	// UX-007 Bulk-Actions (additiv): when set, a selection column is shown and a sticky
	// context bar with these actions appears once at least one row is selected.
	bulkActions?: XiriButton[]
	// Offer "select all results" (whole filter, not just the current page) in the bulk bar.
	selectAllResults?: boolean
	// Keep the bulk context bar pinned to the top while scrolling.
	stickyBulkBar?: boolean
	title?: string
	textNoData?: string
	emptyState?: XiriTableEmptyState
	buttons?: XiriButtonlineSettings
	minWidth?: string
	saveState?: boolean
	saveStateId?: string
	saveInput?: string
	saveInputUrl?: string
	borders?: boolean
	bordersHeader?: boolean
	footer?: boolean
	serverSide?: boolean
	scrollHeight?: string
	editUrl?: string
	tree?: XiriTableTreeSettings // opt-in tree mode; delivered here by the Go builder (options.tree)
}

export interface XiriTableSettings {
	url?: string
	data?: XiriTableRow[]
	fields?: XiriTableField[]
	options?: XiriTableOptions
	hasFilter?: boolean
	tree?: XiriTableTreeSettings // opt-in tree mode; for direct Angular consumers (Spec §6)
}

export type { XiriTableTreeSettings, XiriTableRow, XiriTableCellValue } from './tree.service';

@Component( {
	            selector: 'xiri-table',
	            templateUrl: './table.component.html',
	            styleUrl: './table.component.scss',
	            encapsulation: ViewEncapsulation.None,
	            providers: [ XiriTableInlineEditService, XiriTableTreeService ],
	            imports: [ MatCard,
	                       MatIconButton,
	                       MatIcon,
	                       XiriButtonlineComponent,
	                       XiriSearchComponent,
	                       MatButton,
	                       MatTable,
	                       MatSort,
	                       MatColumnDef,
	                       MatHeaderCell,
	                       MatSortHeader,
	                       MatCell,
	                       RouterLink,
	                       XiriButtonstyleComponent,
	                       MatTooltip,
	                       MatFormField, MatSuffix,
	                       MatInput,
	                       FormsModule,
	                       ReactiveFormsModule,
	                       NgxMatSelectSearchModule,
	                       MatCheckbox,
	                       MatHeaderRow,
	                       MatRow,
	                       MatProgressSpinner,
	                       MatPaginator,
	                       NgTemplateOutlet,
	                       DatePipe,
	                       SafehtmlPipe, XiriUrlPipe, XiriButtonComponent, MatHeaderCellDef, MatCellDef, MatHeaderRowDef, MatRowDef,
	                       MatFooterRow, MatFooterRowDef, MatFooterCell, MatFooterCellDef,
	                       MatMenu, MatMenuItem, MatMenuTrigger,
	                       MatSelect, MatOption,
	                       XiriEmptyStateComponent ]
            } )
export class XiriTableComponent implements OnInit, OnDestroy {
	
	private dialog: MatDialog = inject( MatDialog );
	private dataService: XiriDataService = inject( XiriDataService );
	private router: Router = inject( Router );
	private sessionStorageService: XiriSessionStorageService = inject( XiriSessionStorageService );
	private numberService: XiriNumberService = inject( XiriNumberService );
	private snackbar = inject( XiriSnackbarService );
	private responseHandler = inject( XiriResponseHandlerService );
	private downloadService = inject( XiriDownloadService );
	inlineEdit = inject( XiriTableInlineEditService );
	tree = inject( XiriTableTreeService );
	protected _changeDetectorRef: ChangeDetectorRef = inject( ChangeDetectorRef );
	private destroyRef = inject( DestroyRef );
	
	dyncomponent = input<TemplateRef<unknown>>();
	settings = input.required<XiriTableSettings>();
	filterData = input<Record<string, unknown> | null | undefined>( undefined );
	clickedRow = output<XiriTableRow>();

	paginator = viewChild.required<MatPaginator>( MatPaginator );
	sort = viewChild.required<MatSort>( MatSort );
	table = viewChild.required<MatTable<XiriTableRow>>( MatTable );
	loading = signal<boolean>( true );
	private _totalCount = signal<number>( 0 );

	displayedColumns: XiriTableField[] = [];
	columnsToDisplay: string[] = [];
	columnsToSearch: string[] = [];
	dataSource = new MatTableDataSource<XiriTableRow>();
	protected _displayeddata: readonly XiriTableRow[] = [];
	_alldata = signal<XiriTableRow[] | null>( null );
	footer: Record<string, XiriTableCellValue> = {};

	extraHeaderFields: XiriTableField[] = [];
	extraHeaders: string[] = [];

	public selection = new SelectionModel<XiriTableRow>( true, [] );
	// UX-007: true once the user opted into "all results" (whole filter) instead of just the
	// selected rows on the current page. Reset whenever the selection is cleared or changed.
	public bulkAllResults = signal<boolean>( false );
	private dialogRef?: MatDialogRef<unknown>;
	private reloadAbort$ = new Subject<void>();

	// Auto-refresh (backend-driven polling): activated when the table data response
	// contains a "poll" interval (ms). While active the whole table reloads after that
	// interval and a table-wide indicator with countdown is shown. Stops automatically
	// when a response no longer contains "poll".
	private autoRefreshTimer?: ReturnType<typeof setTimeout>;
	private countdownTimer?: ReturnType<typeof setInterval>;
	autoRefresh = signal<{ intervalMs: number; nextAt: number } | null>( null );
	// Timestamp of the last successful load, shown as "Stand HH:MM" so a stale/polled
	// view never lets the user act on silently outdated numbers.
	lastUpdated = signal<Date | null>( null );
	private _now = signal<number>( Date.now() );
	countdown = computed<number>( () => {
		const ar = this.autoRefresh();
		if ( !ar )
			return 0;
		const secs = Math.ceil( ( ar.nextAt - this._now() ) / 1000 );
		return secs > 0 ? secs : 0;
	} );

	public options: XiriTableOptions = {
		reload: false,
		dense: false,
		density: 'regular',
		sort: true,
		search: true,
		pagination: true,
		itemsPerPage: 50,
		pageSizes: [ 10, 25, 50, 100, 500 ],
		select: false,
		title: '',
		textNoData: 'no data found',
		saveInput: undefined,
		saveInputUrl: undefined,
		saveState: false,
		saveStateId: undefined,
		borders: false,
		bordersHeader: false,
		footer: false,
		serverSide: false,
	};
	
	public dynData: {
		data: XiriDynData[] | null,
		filterData: Record<string, unknown> | null | undefined,
	} = { data: null, filterData: undefined };
	public errorMsg = '';
	private _firstData = true;
	public searchText = '';
	public searchTextInit = '';

	// Resolves the legacy dense:true alias to density:'compact' when density itself is not set explicitly.
	public mergeOptions( incoming: XiriTableOptions ): XiriTableOptions {
		const merged: XiriTableOptions = { ...incoming };
		if ( merged.density === undefined && merged.dense === true )
			merged.density = 'compact';
		return merged;
	}

	// Density-Klasse reaktiv aus settings() ableiten, damit ein Live-Umschalten des density-Werts
	// wirkt (options wird sonst nur einmal in ngOnInit gemergt und würde nicht reagieren).
	public densityClass = computed( () => 'density-' + ( this.mergeOptions( this.settings().options ?? {} ).density ?? 'regular' ) );

	private tableStateKey(): string | null {
		return this.options.saveStateId ? this.options.saveStateId + ':table' : null;
	}

	trackByRowId = ( index: number, row: XiriTableRow ): string | number => row.id ?? index;

	// Inline edit signals delegated to inlineEdit service
	get editingCell() { return this.inlineEdit.editingCell; }
	get editingChipsValues() { return this.inlineEdit.editingChipsValues; }
	get editableOptionsLoading() { return this.inlineEdit.editableOptionsLoading; }
	get loadedEditableOptions() { return this.inlineEdit.loadedEditableOptions; }
	get savingCell() { return this.inlineEdit.savingCell; }
	get inlineSearchControl() { return this.inlineEdit.searchControl; }
	get inlineSearching() { return this.inlineEdit.searching; }
	
	_filterData = computed( () => {
		
		const values = this.filterData();
		
		if ( values === undefined )
			return undefined;
		else if ( values === null )
			return null;
		
		return values;
	} );
	
	constructor() {
		
		effect( () => {
			const filterData = this._filterData();

			this.loading.set( true );
			this.reloadAbort$.next();
			this.clearAutoRefresh();

			if ( filterData === null )
				return;

			this.loadData();
		} );
		
		effect( () => {
			const all = this._alldata();
			if ( all === null ) {
				this.dataSource.data = [];
			} else if ( this.tree.enabled ) {
				this.tree.build( all );
				this.refreshTree();
			} else {
				this.dataSource.data = all;
			}
		} );
	}
	
	public ngOnInit() {
		
		if ( this.settings().options )
			this.options = { ...this.options, ...this.mergeOptions( this.settings().options as XiriTableOptions ) };
		const settingsFields = this.settings().fields;
		if ( settingsFields )
			this.loadFields( settingsFields );

		// Tree mode: accept config from top-level settings (Angular consumers) or options (Go builder).
		const treeCfg = this.settings().tree ?? this.options.tree;
		if ( treeCfg && this.displayedColumns.length > 0 )
			this.tree.init( treeCfg, this.displayedColumns[ 0 ].id );

		this.inlineEdit.init( {
			getEditUrl: () => this.options.editUrl ?? '',
			getDisplayedColumns: () => this.displayedColumns,
			abort$: this.reloadAbort$,
			onSaved: ( row, fieldId ) => this.inlineEdit.flashSaved( row, fieldId, this.dataSource ),
			onDataUpdate: () => this.dataSource._updateChangeSubscription(),
			onCallReturn: ( result ) => this.callReturn( result ),
		} );

		if ( this.options.pagination )
			this.paginator().pageSize = this.options.itemsPerPage as number;
		if ( this.options.pagination && !this.options.serverSide )
			this.dataSource.paginator = this.paginator();
		// In tree mode column sorting is disabled (Spec §5); siblings are sorted alphabetically
		// at build time. Connecting MatSort would re-order rows globally and break tree order.
		if ( this.options.sort && !this.options.serverSide && !this.tree.enabled ) {
			this.dataSource.sort = this.sort();
			this.dataSource.sortingDataAccessor = this.getSortingDataAccessor();
			if ( this.options.pagination )
				this.sort().sortChange.subscribe( () => this.paginator().firstPage() );
		}

		if ( this.options.serverSide ) {
			this.paginator().page
				.pipe( takeUntilDestroyed( this.destroyRef ) )
				.subscribe( () => {
					this.reload();
				} );

			if ( this.options.sort ) {
				this.sort().sortChange
					.pipe( takeUntilDestroyed( this.destroyRef ) )
					.subscribe( () => {
						this.paginator().firstPage();
						this.reload();
					} );
			}
		}
		
		// Tree mode uses its own search projection (matches + ancestors), not the flat filter predicate.
		if ( this.options.search && !this.options.serverSide && !this.tree.enabled ) {
			this.dataSource.filterPredicate = ( data: XiriTableRow, filter: string ): boolean => {
				const dataStr = this.columnsToSearch.reduce( ( currentTerm: string, key: string ) => {
					return currentTerm + data[ key ] + '◬';
				}, '' ).toLowerCase();
				return dataStr.indexOf( filter ) !== -1;
			};
		}
		
		if ( this.options.buttons )
			this.options.buttons.class = 'small';
		
		this.dataSource.connect()
			.pipe( takeUntilDestroyed( this.destroyRef ) )
			.subscribe( data => {
					this._displayeddata = data || [];
					
					const stateKey = this.tableStateKey();
					if ( this.options.saveState && this._firstData === false && stateKey ) {
						this.sessionStorageService.set( stateKey, {
							pageIndex: this.paginator()?.pageIndex,
							pageSize: this.paginator()?.pageSize,
							filter: this.searchText,
							sort: this.sort()?.active,
							sortDirection: this.sort()?.direction,
						} );
					}
					
					if ( this.options.footer ) {
						this.displayedColumns.forEach( ( column: XiriTableField ) => {
							if ( column.footer === 'no' )
								return;
							
							if ( column.footer === 'count' ) {
								this.footer[ column.id ] = this._displayeddata.length + '#';
							} else if ( column.footer === 'sum' ) {
								let sum = 0;
								this._displayeddata.forEach( ( row: XiriTableRow ) => {
									const cell = row[ column.id ] as XiriTableCellValue[] | undefined;
									sum += +( cell ? cell[ 1 ] as number : 0 );
								} );
								
								if ( !column.webformat )
									this.footer[ column.id ] = sum;
								else
									this.footer[ column.id ] = this.numberService.formatNumber( sum, column.webformat );
							}
						} );
					}
					
				} );

		// if ( !this.settings().hasFilter )
		//	this.loadData();
	}
	
	private loadData() {
		
		this.errorMsg = '';
		this.selection.clear();
		this.bulkAllResults.set( false );
		this.dynData.data = null;
		// Cancel any pending auto-refresh while this load is in flight; the response decides
		// whether to reschedule (res.poll present) or stop (clearAutoRefresh).
		this.cancelAutoRefreshTimers();

		const inlineData = this.settings().data;
		if ( inlineData ) {
			this.options.reload = false;
			this.clearAutoRefresh();
			this.setData( inlineData );
			this.loading.set( false );
		} else if ( this.settings().url ) {

			const url = this.settings().url ?? '';
			const payload: Record<string, unknown> = this.settings().hasFilter
				? { ...( this._filterData() as Record<string, unknown> ) }
				: {};

			if ( this.options.serverSide ) {
				payload._page = this.paginator().pageIndex;
				payload._pageSize = this.paginator().pageSize;
				if ( this.sort().active ) {
					payload._sort = this.sort().active;
					payload._sortDir = this.sort().direction;
				}
				if ( this.searchText ) {
					payload._search = this.searchText;
				}
			}

			const api: Observable<unknown> = this.dataService.post(
				url, Object.keys( payload ).length > 0 ? payload : null );

			api.pipe( takeUntil( this.reloadAbort$ ) ).subscribe( {
				next: ( raw: unknown ) => {
					const res = raw as XiriTableResponse | null;

					if ( !res || !res.data ) {
						this.errorMsg = 'ERROR: unknown server response';
						this._alldata.set( [] );
						this.clearAutoRefresh();
						this.loading.set( false );
						this._changeDetectorRef.markForCheck();
						return;
					}

					if ( res.fields )
						this.loadFields( res.fields );
					if ( res.summary )
						this.dynData.data = res.summary;
					else if ( res.components )
						this.dynData.data = res.components;

					if ( res.footer )
						this.setFooter( res.footer );
					if ( res.totalCount !== undefined && this.options.serverSide ) {
						this._totalCount.set( res.totalCount );
						this.paginator().length = res.totalCount;
					}
					this.setData( res.data );
					this.lastUpdated.set( new Date() );
					if ( res.poll )
						this.scheduleAutoRefresh( res.poll );
					else
						this.clearAutoRefresh();
					this.loading.set( false );
					this._changeDetectorRef.markForCheck();
				}, error: ( err: unknown ) => {
					this.errorMsg = errorMessage( err ) ?? ( err as XiriHttpError )?.statusText ?? '';
					this._alldata.set( [] );
					this.clearAutoRefresh();
					this.loading.set( false );
					this._changeDetectorRef.markForCheck();
				}
			} );
		}
	}
	
	private loadFields( fields: XiriTableField[] ) {
		
		this.displayedColumns = [];
		this.columnsToDisplay = [];
		this.columnsToSearch = [];
		this.extraHeaderFields = [];
		this.extraHeaders = [];
		
		if ( this.showSelectColumn )
			this.columnsToDisplay.push( 'select' );
		
		for ( let fid = 0; fid != fields.length; fid++ ) {
			const column = fields[ fid ];
			
			if ( column.format == 'header' ) {
				this.extraHeaderFields.push( column );
				this.extraHeaders.push( column.id );
				continue;
			}
			
			if ( column.id === undefined )
				column.id = '' + fid;
			if ( column.format == 'id' )
				continue;
			if ( !column.display )
				column.display = '';
			if ( column.format )
				column.display = column.format + ' ' + column.display;
			if ( column.align )
				column.display += ` align-${ column.align }`;
			
			column.sort = column.sort === undefined ? true : column.sort;
			column.search = column.search === undefined ? true : column.search;
			column.sticky = column.sticky === undefined ? false : column.sticky;
			column.hide = column.hide === undefined ? false : column.hide;
			
			if ( !column.hide ) {
				this.displayedColumns.push( column );
				this.columnsToDisplay.push( column.id );
			}
			
			if ( column.search )
				this.columnsToSearch.push( column.id );
		}
	}
	
	private setData( data: XiriTableRow[] ): void {

		this._alldata.set( data );

		if ( this._firstData ) {
			this._firstData = false;

			const stateKey = this.tableStateKey();
			if ( this.options.saveState && stateKey ) {
				const saved = this.sessionStorageService.getTimeout( stateKey, 3600 ) as XiriTableSavedState | null;
				if ( !saved )
					return;

				if ( saved.filter !== undefined ) {
					this.searchText = saved.filter;
					this.searchTextInit = saved.filter;
				}
				if ( saved.sort !== undefined && saved.sortDirection !== undefined )
					this.sort().sort( ( { id: saved.sort, start: saved.sortDirection } ) as MatSortable );
				if ( saved.pageSize !== undefined && saved.pageIndex !== undefined ) {
					this.paginator().pageIndex = saved.pageIndex;
					this.paginator()._changePageSize( saved.pageSize );
				}
			}
		}
	}

	private setFooter( footer: Record<string, XiriTableCellValue> ): void {
		this.footer = footer;

		this.displayedColumns.forEach( ( column: XiriTableField ) => {
			const value = this.footer[ column.id ];
			if ( Array.isArray( value ) )
				this.footer[ column.id ] = value[ 0 ];
		} );
	}
	
	reload(): void {
		if ( this.loading() )
			return;

		this.loading.set( true );
		this.loadData();
	}

	// Schedules the next auto-refresh reload and (re)starts the 1s countdown ticker.
	private scheduleAutoRefresh( intervalMs: number ): void {
		this.cancelAutoRefreshTimers();
		const now = Date.now();
		this.autoRefresh.set( { intervalMs, nextAt: now + intervalMs } );
		this._now.set( now );
		this.autoRefreshTimer = setTimeout( () => {
			this.autoRefreshTimer = undefined;
			this.reload();
		}, intervalMs );
		this.countdownTimer = setInterval( () => {
			this._now.set( Date.now() );
			this._changeDetectorRef.markForCheck();
		}, 1000 );
	}

	// Clears pending timers without touching the indicator (used while a load is in flight).
	private cancelAutoRefreshTimers(): void {
		if ( this.autoRefreshTimer ) {
			clearTimeout( this.autoRefreshTimer );
			this.autoRefreshTimer = undefined;
		}
		if ( this.countdownTimer ) {
			clearInterval( this.countdownTimer );
			this.countdownTimer = undefined;
		}
	}

	// Fully stops auto-refresh and hides the indicator.
	private clearAutoRefresh(): void {
		this.cancelAutoRefreshTimers();
		this.autoRefresh.set( null );
	}
	
	searchDo( $event: string ) {
		this.searchText = $event.trim().toLowerCase();

		if ( this.options.serverSide ) {
			this.paginator().firstPage();
			this.reload();
		} else if ( this.tree.enabled ) {
			this.refreshTree();
			if ( this.dataSource.paginator )
				this.dataSource.paginator.firstPage();
		} else {
			this.dataSource.filter = this.searchText;
			if ( this.dataSource.paginator ) {
				this.dataSource.paginator.firstPage();
			}
		}
	}

	// ============================================================================
	// Tree mode (only active when settings.tree / options.tree is set)
	// ============================================================================

	get treeEnabled(): boolean { return this.tree.enabled; }
	get treeColumnId(): string { return this.tree.treeColumn; }
	get treeShowCounts(): boolean { return this.tree.showCounts; }
	get treeHasAddSub(): boolean { return this.tree.hasAddSub; }
	treeCanAddSub( row: XiriTableRow ): boolean { return this.tree.canAddSub( row ); }

	/** Recomputes the visible rows from the tree (respecting the active search), into the data source. */
	private refreshTree(): void {
		const term = this.searchText;
		const matcher = term ? ( row: XiriTableRow ) => this.rowMatches( row, term ) : null;
		this.dataSource.data = this.tree.applySearch( matcher );
	}

	private rowMatches( row: XiriTableRow, term: string ): boolean {
		let dataStr = '';
		for ( const key of this.columnsToSearch )
			dataStr += row[ key ] + '◬';
		return dataStr.toLowerCase().indexOf( term ) !== -1;
	}

	toggleNode( event: MouseEvent, row: XiriTableRow ): void {
		event.stopPropagation();
		this.tree.toggle( row );
		this.refreshTree();
	}

	expandAllNodes(): void {
		this.tree.expandAll();
		this.refreshTree();
	}

	collapseAllNodes(): void {
		this.tree.collapseAll();
		this.refreshTree();
	}

	addSub( event: MouseEvent, row: XiriTableRow ): void {
		event.stopPropagation();
		const cfg = this.tree.settings;
		if ( cfg?.addSubHandler ) {
			cfg.addSubHandler( row );
			return;
		}
		const url = this.tree.addSubUrlFor( row );
		if ( url )
			this.router.navigateByUrl( url );
	}
	
	isAllSelected() {
		let found = 0;
		this._displayeddata.forEach( row => {
			if ( row.select !== false ) {
				if ( !this.selection.isSelected( row ) )
					found++;
			}
		} );
		return found === 0;
	}
	
	masterToggle() {
		this.bulkAllResults.set( false );
		if ( this.isAllSelected() ) {
			this.selection.clear();
		} else {
			this._displayeddata.forEach( row => {
				if ( row.select !== false )
					this.selection.select( row );
			} );
		}
	}

	// Toggles a single row and drops the "all results" mode: an individual change means the
	// user is now working with an explicit per-row selection again, not the whole filter.
	toggleRow( row: XiriTableRow ) {
		this.bulkAllResults.set( false );
		this.selection.toggle( row );
	}

	// ============================================================================
	// UX-007 Bulk actions
	// ============================================================================

	get bulkActionsEnabled(): boolean {
		return ( this.options.bulkActions?.length ?? 0 ) > 0;
	}

	// The selection column is shown for legacy select mode OR when bulk actions are configured.
	get showSelectColumn(): boolean {
		return !!this.options.select || this.bulkActionsEnabled;
	}

	// The sticky context bar is only meaningful in bulk mode and only once something is selected.
	get bulkBarActive(): boolean {
		return this.bulkActionsEnabled && this.selection.hasValue();
	}

	// Exact total number of results behind the current filter (all pages), NOT just the page:
	// the server-side totalCount when known, otherwise every filtered client-side row.
	bulkTotalCount(): number {
		return this.options.serverSide ? this._totalCount() : this.dataSource.filteredData.length;
	}

	// The count the triggered action operates on: the whole filtered result in "all results"
	// mode, otherwise the explicitly selected rows on the current page.
	bulkCount(): number {
		return this.bulkAllResults() ? this.bulkTotalCount() : this.selection.selected.length;
	}

	// Offer "select all results" only when the current page is fully selected and there are
	// genuinely more results behind the filter than are selected right now.
	canSelectAllResults(): boolean {
		return !!this.options.selectAllResults
			&& !this.bulkAllResults()
			&& this.selection.hasValue()
			&& this.isAllSelected()
			&& this.bulkTotalCount() > this.selection.selected.length;
	}

	selectAllResults(): void {
		this.bulkAllResults.set( true );
	}

	cancelBulk(): void {
		this.selection.clear();
		this.bulkAllResults.set( false );
	}

	// Dispatches a bulk action. The payload always carries the selected ids, the selection
	// mode (page vs. all results) and the exact count; in "all results" mode it additionally
	// carries the active filter so the backend acts on the whole result set, never silently
	// on just the current page. Destructive actions (color 'warn') confirm with the exact count.
	bulkAction( event: MouseEvent, button: XiriButton ): void {
		event.stopPropagation();
		if ( this.selection.isEmpty() )
			return;

		const allResults = this.bulkAllResults();
		const count = this.bulkCount();

		if ( button.color === 'warn' ) {
			const label = button.text || 'Aktion ausführen';
			if ( !confirm( `${ label }: ${ count } ${ count === 1 ? 'Eintrag' : 'Einträge' }? Dies kann nicht rückgängig gemacht werden.` ) )
				return;
		}

		const payload: Record<string, unknown> = {
			ids:   this.getSelectionIDs(),
			mode:  allResults ? 'allResults' : 'page',
			count: count,
		};
		if ( allResults )
			payload.filter = this._filterData() ?? null;

		switch ( button.action ) {
			case 'dialog': {
				const data: XiriTableDialogData = { ...button, type: 'data', data: payload };
				this.dialogRef = this.dialog.open( XiriDialogComponent, { data } );
				this.dialogRef.afterClosed().subscribe( ( result ) => {
					this.clearBulk();
					this.callReturn( result );
				} );
				break;
			}
			case 'download':
				this.dataService.postFileResponse( button.url ?? '', payload ).pipe( takeUntil( this.reloadAbort$ ) ).subscribe( {
					next: ( result ) => this.downloadService.download( result, button.filename || 'download.csv', false ),
					error: ( err: unknown ) => this.snackbar.error( errorMessage( err ) || 'Download Error' ),
				} );
				break;
			default:
				this.dataService.post( button.url ?? '', payload ).pipe( takeUntil( this.reloadAbort$ ) ).subscribe( {
					next: ( result: unknown ) => {
						this.clearBulk();
						this.callReturn( result );
					},
					error: ( err: unknown ) => this.snackbar.error( errorMessage( err ) || 'Unknown Error' ),
				} );
		}
	}

	private clearBulk(): void {
		this.selection.clear();
		this.bulkAllResults.set( false );
	}

	clicked( row: XiriTableRow ) {
		this.clickedRow.emit( row );
	}

	openDialog( event: MouseEvent, button: XiriButton, id: string, subid: number, row: XiriTableRow ) {

		event.stopPropagation();
		const data: XiriTableDialogData = { ...button, type: 'load' };
		data.url = ( row[ id ] as XiriTableCellValue[] )[ subid ] as string;

		this.startDialog( data );
	}

	openMenuDialog( event: MouseEvent, item: NonNullable<XiriButton['menuItems']>[number], columnId: string, buttonIndex: number, menuItemIndex: number, row: XiriTableRow ) {
		event.stopPropagation();
		const data: XiriTableDialogData = { ...item, type: 'load' } as XiriTableDialogData;
		const cell = ( ( row[ columnId ] as XiriTableCellValue[] )[ buttonIndex ] as XiriTableCellValue[] )[ menuItemIndex ];
		data.url = cell as string;
		this.startDialog( data );
	}

	openDialogSelection( event: MouseEvent, button: XiriButton ) {

		event.stopPropagation();
		if ( this.selection.isEmpty() )
			return true;

		const data: XiriTableDialogData = { ...button, type: 'data' };
		data.data = this.getSelectionIDs();

		this.startDialog( data );
		return true;
	}

	private startDialog( data: XiriTableDialogData ) {
		
		this.dialogRef = this.dialog.open( XiriDialogComponent, {
			data: data,
		} );
		
		this.dialogRef.afterClosed().subscribe( {
			                                        next: ( result ) => this.callReturn( result )
		                                        } );
	}
	
	apiCall( event: MouseEvent, url: string ) {
		event.stopPropagation();
		this.makeApiCall( this.dataService.get( url ) );
	}
	
	apiCallSelection( event: MouseEvent, button: XiriButton ) {
		event.stopPropagation();
		if ( this.selection.isEmpty() )
			return;
		
		const data = { data: this.getSelectionIDs() };
		
		this.makeApiCall( this.dataService.post( button.url ? button.url : '', data ) );
	}
	
	saveCall( event: MouseEvent, button: XiriButton, row: XiriTableRow, url: string ) {
		event.stopPropagation();

		if ( !this.saveCallCheck( button, row ) )
			return;

		const data: Record<string, XiriTableCellValue> = {};
		const send = button.send ?? [];
		for ( let i = 0; i != send.length; i++ ) {
			const k = send[ i ];
			data[ k ] = row[ k ] as XiriTableCellValue;
		}

		this.dataService.post( url, data ).pipe( takeUntil( this.reloadAbort$ ) ).subscribe( {
			next: ( result: unknown ) => this.callReturn( result ),
			error: ( err: unknown ) => {
				console.log( "table save error", err );
				this.snackbar.error( errorMessage( err ) || 'Unknown Error' );
			}
		} );
	}

	saveCallCheck( button: XiriButton, row: XiriTableRow ): boolean {

		const check = button.check ?? [];
		for ( let i = 0; i != check.length; i++ ) {
			const k = check[ i ];

			if ( row[ k ] === null || row[ k ] === undefined || row[ k ] === '' ) {
				return false;
			}
		}

		return true;
	}

	downloadSelection( event: MouseEvent, button: XiriButton ) {
		event.stopPropagation();
		if ( this.selection.isEmpty() )
			return;

		const url = button.url ? button.url : '';
		this.dataService.postFileResponse( url, this.getSelectionIDs() ).pipe( takeUntil( this.reloadAbort$ ) ).subscribe( {
			next: ( result ) => {
				this.downloadService.download( result, 'download.csv', false );
			},
			error: ( err: unknown ) => {
				this.snackbar.error( errorMessage( err ) || 'Download Error' );
			}
		} );
	}

	private makeApiCall( apicall: Observable<unknown> ) {

		apicall.pipe( takeUntil( this.reloadAbort$ ) ).subscribe( {
			next: ( result: unknown ) => this.callReturn( result ),
			error: ( err: unknown ) => {
				console.log( "table api error", err );
				this.snackbar.error( errorMessage( err ) || 'Unknown Error' );
			}
		} );
	}
	
	public buttonReturn( event: XiriButtonResult ) {
		
		if ( !event.done )
			return;
		
		this.callReturn( event.result );
	}
	
	private callReturn( result: unknown ) {
		this.responseHandler.handle( result, {
			onTableRefresh: () => this.reload(),
			onTableUpdate: ( id, field, content ) => {
				const i = this.dataSource.data.findIndex( ( x: XiriTableRow ) => x.id === id );
				if ( i == -1 )
					return;
				this.dataSource.data[ i ][ field ] = content as XiriTableCellValue;
				this.dataSource._updateChangeSubscription();
			}
		} );
	}

	private getSelectionIDs(): number[] {

		return this.selection.selected.map( ( item ) => {
			return +( item[ 'id' ] as string | number );
		} );
	}

	startInlineEdit( row: XiriTableRow, column: XiriTableField, skipSavingCheck = false ): void {
		this.inlineEdit.start( row, column, skipSavingCheck );
	}

	cancelInlineEdit(): void {
		this.inlineEdit.cancel();
	}

	saveInlineEdit( row: XiriTableRow, column: XiriTableField ): void {
		this.inlineEdit.save( row, column );
	}

	isEditing( row: XiriTableRow, fieldId: string ): boolean {
		return this.inlineEdit.isEditing( row, fieldId );
	}

	isSaving( row: XiriTableRow, fieldId: string ): boolean {
		return this.inlineEdit.isSaving( row, fieldId );
	}

	onInlineEditKeydown( event: KeyboardEvent, row: XiriTableRow, column: XiriTableField ): void {
		this.inlineEdit.onKeydown( event, row, column );
	}

	getEditableOptions( column: XiriTableField ): { value: string; label: string; color?: string }[] {
		return this.inlineEdit.getOptions( column );
	}

	onChipsSelectionChange( row: XiriTableRow, column: XiriTableField, selectedValues: string[] ): void {
		this.inlineEdit.onChipsChange( row, column, selectedValues );
	}

	ngOnDestroy(): void {
		this.reloadAbort$.next();
		this.reloadAbort$.complete();
		this.clearAutoRefresh();
		if ( this.dialogRef )
			this.dialogRef.close( null );
	}
	
	public pasteInput( $event: ClipboardEvent, row: XiriTableRow, column: XiriTableField ) {

		if ( column.inputPaste !== true )
			return false;

		// Get the clipboard text
		const clipboardText = $event.clipboardData!.getData( 'text' );

		// Split into rows, then each row into columns.
		const clipRowsArray: string[][] = clipboardText.split( "\n" ).map( line => line.split( "\t" ) );

		if ( clipRowsArray.length < 2 ) {
			if ( clipRowsArray[ 0 ].length < 2 )
				return null;
		}

		const startRow = this.dataSource.data.findIndex( ( x: XiriTableRow ) => x.id === row.id );
		if ( startRow == -1 )
			return false;
		const startCol = this.displayedColumns.findIndex( ( x: XiriTableField ) => x.id === column.id );
		if ( startCol == -1 )
			return false;

		for ( let i = 0; i < clipRowsArray.length; i++ ) {
			const curRow = i + startRow;
			if ( curRow >= this.dataSource.data.length )
				break;

			const result = this.dataSource.data[ curRow ];
			for ( let j = 0; j < clipRowsArray[ i ].length; j++ ) {
				const curCol = j + startCol;
				if ( curCol >= this.displayedColumns.length )
					break;

				const col = this.displayedColumns[ curCol ];
				result[ col.id ] = clipRowsArray[ i ][ j ];
			}
		}

		this.dataSource._updateChangeSubscription();
		return false;
	}
	
	public saveInputData() {
		
		// this.loading.set( true );
		const data = this.dataSource.data;
		if ( this.settings().url ) {
			this._alldata.set( [] );
			// this.dataSource.data = [];
			this.dataSource._updateChangeSubscription();
		}
		this._changeDetectorRef.markForCheck();
		
		this.dataService.post( this.options.saveInputUrl ?? '', data ).pipe( takeUntil( this.reloadAbort$ ) ).subscribe( {
			next: ( result: unknown ) => {
				this.callReturn( result );
			},
			error: ( err: unknown ) => {
				this._alldata.set( data );
				this.dataSource._updateChangeSubscription();
				console.log( "table save error", err );
				this.snackbar.error( errorMessage( err ) || 'Unknown Error' );
				this._changeDetectorRef.markForCheck();
			}
		} );
	}

	private getSortingDataAccessor(): ( data: XiriTableRow, sortHeaderId: string ) => string | number {
		return ( data: XiriTableRow, sortHeaderId: string ): string | number => {
			const column = this.displayedColumns.find( col => col.id === sortHeaderId );
			if ( column && column.format === 'number' )
				return ( data[ sortHeaderId ] as XiriTableCellValue[] )[ 1 ] as number;

			return data[ sortHeaderId ] as string | number;
		};
	}
}
