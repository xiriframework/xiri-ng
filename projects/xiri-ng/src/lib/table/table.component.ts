import {
	ChangeDetectionStrategy,
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
import { Observable, Subscription } from "rxjs";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { XiriDialogComponent } from "../dialog/dialog.component";
import { XiriDataService } from '../services/data.service';
import { XiriButton, XiriButtonComponent, XiriButtonResult } from "../button/button.component";
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriButtonlineComponent, XiriButtonlineSettings } from "../buttonline/buttonline.component";
import { XiriDynData } from "../dyncomponent/dyndata.interface";
import { XiriTableField } from "../raw-table/tabefield.interface";
import { XiriSessionStorageService } from "../services/sessionStorage.service";
import { XiriNumberService } from "../services/number.service";
import { SafehtmlPipe } from '../pipes/safehtml.pipe';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatTooltip } from '@angular/material/tooltip';
import { XiriButtonstyleComponent } from '../buttonstyle/buttonstyle.component';
import { XiriSearchComponent } from '../search/search.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSelect, MatOption } from '@angular/material/select';
import { NgTemplateOutlet } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { XiriEmptyStateComponent } from '../empty-state/empty-state.component';
import { XiriColor } from '../types/color.type';


export interface XiriTableEmptyState {
	icon?: string
	iconColor?: XiriColor
	title?: string
	description?: string
}

export interface XiriTableOptions {
	reload?: boolean
	dense?: boolean
	sort?: boolean
	search?: boolean
	class?: string
	pagination?: boolean
	itemsPerPage?: number
	pageSizes?: number[]
	select?: boolean
	selectButtons?: XiriButton[]
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
}

export interface XiriTableSettings {
	url?: string
	data?: any
	fields?: XiriTableField[]
	options?: XiriTableOptions
	hasFilter?: boolean
}

@Component( {
	            selector: 'xiri-table',
	            templateUrl: './table.component.html',
	            styleUrl: './table.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            encapsulation: ViewEncapsulation.None,
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
	                       MatCheckbox,
	                       MatHeaderRow,
	                       MatRow,
	                       MatProgressSpinner,
	                       MatPaginator,
	                       NgTemplateOutlet,
	                       SafehtmlPipe, XiriButtonComponent, MatHeaderCellDef, MatCellDef, MatHeaderRowDef, MatRowDef,
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
	protected _changeDetectorRef: ChangeDetectorRef = inject( ChangeDetectorRef );
	private destroyRef = inject( DestroyRef );
	
	dyncomponent = input<TemplateRef<any>>();
	settings = input.required<XiriTableSettings>();
	filterData = input<any>( undefined );
	clickedRow = output<any>();

	paginator = viewChild.required<MatPaginator>( MatPaginator );
	sort = viewChild.required<MatSort>( MatSort );
	table = viewChild.required<MatTable<any>>( MatTable );
	loading = signal<boolean>( true );
	private _totalCount = signal<number>( 0 );
	
	displayedColumns: XiriTableField[] = [];
	columnsToDisplay: string[] = [];
	columnsToSearch: string[] = [];
	dataSource: MatTableDataSource<any> = new MatTableDataSource();
	protected _displayeddata: readonly any[];
	_alldata = signal<any[] | null>( null );
	footer = [];
	
	extraHeaderFields: XiriTableField[] = [];
	extraHeaders: string[] = [];
	
	public selection = new SelectionModel<any>( true, [] );
	private dialogRef?: MatDialogRef<any>;
	private subs: Subscription = new Subscription();
	public options: XiriTableOptions = {
		reload: false,
		dense: false,
		sort: true,
		search: true,
		pagination: true,
		itemsPerPage: 50,
		pageSizes: [ 10, 25, 50, 100, 500 ],
		select: false,
		title: '',
		textNoData: 'no data found',
		saveInput: null,
		saveInputUrl: null,
		saveState: false,
		saveStateId: null,
		borders: false,
		bordersHeader: false,
		footer: false,
		serverSide: false,
	};
	
	public dynData: {
		data: XiriDynData[],
		filterData: any,
	} = { data: null, filterData: undefined };
	public errorMsg: string = '';
	private _firstData: boolean = true;
	public searchText: string = '';

	editingCell = signal<{ row: any; field: string } | null>( null );
	editingChipsValues = signal<string[]>( [] );
	editableOptionsLoading = signal( false );
	loadedEditableOptions = signal<{ value: string; label: string; color?: string }[]>( [] );
	savingCell = signal<{ row: any; field: string } | null>( null );
	private editingOriginalValue: any = null;
	private editableOptionsSub: Subscription | null = null;
	
	_filterData = computed( () => {
		
		let values = this.filterData();
		
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
			this.cleanup();
			this.subs = new Subscription();

			if ( filterData === null )
				return;

			this.loadData();
		} );
		
		effect( () => {
			if ( this._alldata() === null )
				this.dataSource.data = [];
			else
				this.dataSource.data = this._alldata();
		} );
	}
	
	public ngOnInit() {
		
		if ( this.settings().options )
			this.options = { ...this.options, ...this.settings().options };
		if ( this.settings().fields )
			this.loadFields( this.settings().fields );
		
		if ( this.options.pagination )
			this.paginator().pageSize = <number> this.options.itemsPerPage;
		if ( this.options.pagination && !this.options.serverSide )
			this.dataSource.paginator = this.paginator();
		if ( this.options.sort && !this.options.serverSide ) {
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
		
		if ( this.options.search && !this.options.serverSide ) {
			this.dataSource.filterPredicate = ( data: object, filter: string ): boolean => {
				const dataStr = this.columnsToSearch.reduce( ( currentTerm: string, key: string ) => {
					return currentTerm + ( data as { [ key: string ]: any } )[ key ] + '◬';
				}, '' ).toLowerCase();
				return dataStr.indexOf( filter ) != -1;
			};
		}
		
		if ( this.options.buttons )
			this.options.buttons.class = 'small';
		
		this.dataSource.connect()
			.pipe( takeUntilDestroyed( this.destroyRef ) )
			.subscribe( data => {
					this._displayeddata = data || [];
					
					if ( this.options.saveState && this._firstData === false ) {
						this.sessionStorageService.set( this.options.saveStateId, {
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
								this._displayeddata.forEach( ( row: any ) => {
									sum += +row[ column.id ][ 1 ];
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
		this.dynData.data = null;
		
		if ( this.settings().data ) {
			this.options.reload = false;
			this.setData( this.settings().data );
			this.loading.set( false );
		} else if ( this.settings().url ) {

			let api: Observable<any>;
			let payload: any = this.settings().hasFilter ? { ...this._filterData() } : {};

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

			api = this.dataService.post( this.settings().url, Object.keys( payload ).length > 0 ? payload : null );
			
			this.subs.add( api.subscribe(
				{
					next: ( res: any ) => {

						if ( !res || !res.data ) {
							this.errorMsg = 'ERROR: unknown server response';
							this._alldata.set( [] );
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
						this.loading.set( false );
						this._changeDetectorRef.markForCheck();
					}, error: ( err: any ) => {
						this.errorMsg = err.error?.error ? err.error.error : err.statusText;
						this._alldata.set( [] );
						this.loading.set( false );
						this._changeDetectorRef.markForCheck();
					}
				} ) );
		}
	}
	
	private loadFields( fields: XiriTableField[] ) {
		
		this.displayedColumns = [];
		this.columnsToDisplay = [];
		this.columnsToSearch = [];
		this.extraHeaderFields = [];
		this.extraHeaders = [];
		
		if ( this.options.select )
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
	
	private setData( data: any[] ): void {
		
		this._alldata.set( data );
		
		if ( this._firstData ) {
			this._firstData = false;
			
			if ( this.options.saveState ) {
				let data = this.sessionStorageService.getTimeout( this.options.saveStateId, 3600 );
				if ( !data )
					return;
				
				if ( data.filter !== undefined )
					this.searchText = data.filter;
				if ( data.sort !== undefined && data.sortDirection !== undefined )
					this.sort().sort( ( { id: data.sort, start: data.sortDirection } ) as MatSortable );
				if ( data.pageSize !== undefined && data.pageIndex !== undefined ) {
					this.paginator().pageIndex = data.pageIndex;
					this.paginator()._changePageSize( data.pageSize );
				}
			}
		}
	}
	
	private setFooter( footer: any ): void {
		this.footer = footer;
		
		this.displayedColumns.forEach( ( column: XiriTableField ) => {
			if ( Array.isArray( this.footer[ column.id ] ) )
				this.footer[ column.id ] = this.footer[ column.id ][ 0 ];
		} );
	}
	
	reload(): void {
		if ( this.loading() )
			return;
		
		this.loading.set( true );
		this.loadData();
	}
	
	searchDo( $event: any ) {
		this.searchText = $event.trim().toLowerCase();

		if ( this.options.serverSide ) {
			this.paginator().firstPage();
			this.reload();
		} else {
			this.dataSource.filter = this.searchText;
			if ( this.dataSource.paginator ) {
				this.dataSource.paginator.firstPage();
			}
		}
	}
	
	isAllSelected() {
		let found: number = 0;
		this._displayeddata.forEach( row => {
			if ( row.select !== false ) {
				if ( !this.selection.isSelected( row ) )
					found++;
			}
		} );
		return found === 0;
	}
	
	masterToggle() {
		this.isAllSelected() ? this.selection.clear() : this._displayeddata.forEach( row => {
			if ( row.select !== false )
				this.selection.select( row );
		} );
	}
	
	clicked( row: any ) {
		this.clickedRow.emit( row );
	}
	
	openDialog( event: MouseEvent, button: any, id: any, subid: any, row: any ) {
		
		event.stopPropagation();
		let data = Object.assign( {}, button );
		data.type = 'load';
		data.url = row[ id ][ subid ];
		
		this.startDialog( data );
	}
	
	openMenuDialog( event: MouseEvent, item: any, columnId: string, buttonIndex: number, menuItemIndex: number, row: any ) {
		event.stopPropagation();
		let data = Object.assign( {}, item );
		data.type = 'load';
		data.url = row[ columnId ][ buttonIndex ][ menuItemIndex ];
		this.startDialog( data );
	}

	openDialogSelection( event: MouseEvent, button: XiriButton ) {
		
		event.stopPropagation();
		if ( this.selection.isEmpty() )
			return true;
		
		let data = <any> Object.assign( {}, button );
		data.type = 'data';
		data.data = this.getSelectionIDs();
		
		this.startDialog( data );
		return true;
	}
	
	private startDialog( data: object ) {
		
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
		
		let data = { data: this.getSelectionIDs() };
		
		this.makeApiCall( this.dataService.post( button.url ? button.url : '', data ) );
	}
	
	saveCall( event: MouseEvent, button: XiriButton, row, url: string ) {
		event.stopPropagation();
		
		if ( !this.saveCallCheck( button, row ) )
			return;
		
		let data = {};
		for ( let i = 0; i != button.send.length; i++ ) {
			let k = button.send[ i ];
			data[ k ] = row[ k ];
		}
		
		this.subs.add( this.dataService.post( url, data ).subscribe( {
			                                                             next: ( result ) => this.callReturn( result ),
			                                                             error: ( err: any ) => {
				                                                             console.log( "table save error", err );
				                                                             this.snackbar.error( err.error?.error || 'Unknown Error' );
			                                                             }
		                                                             } ) );
	}
	
	saveCallCheck( button: XiriButton, row ): boolean {
		
		for ( let i = 0; i != button.check.length; i++ ) {
			let k = button.check[ i ];
			
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
		
		this.dataService.postDownload( button.url ? button.url : '', this.getSelectionIDs() );
	}
	
	private makeApiCall( apicall: Observable<object> ) {
		
		this.subs.add( apicall.subscribe( {
			                                  next: ( result ) => this.callReturn( result ),
			                                  error: ( err: any ) => {
				                                  console.log( "table api error", err );
				                                  this.snackbar.error( err.error?.error || 'Unknown Error' );
			                                  }
		                                  } ) );
	}
	
	public buttonReturn( event: XiriButtonResult ) {
		
		if ( !event.done )
			return;
		
		this.callReturn( event.result );
	}
	
	private callReturn( result: any ) {
		
		if ( !result )
			return;
		if ( result.page == 'refresh' || result.refresh == 'page' )
			this.router.navigate( [ this.router.url ] ).then();
		else if ( result.table == 'refresh' || result.refresh == 'table' )
			this.reload();
		else if ( result.goto )
			this.router.navigate( [ result.goto ] ).then();
		else if ( result.table == 'update' || result.update == 'table' ) {
			const rowId = result.id;
			const i = this.dataSource.data.findIndex( ( x: any ) => x.id === rowId );
			if ( i == -1 )
				return;
			
			this.dataSource.data[ i ][ result.field ] = result.content;
			this.dataSource._updateChangeSubscription();
		}
	}
	
	private getSelectionIDs(): number[] {
		
		return this.selection.selected.map( ( item ) => {
			return +item[ 'id' ];
		} );
	}
	
	startInlineEdit( row: any, column: XiriTableField, skipSavingCheck = false ): void {
		if ( !column.editable || !this.options.editUrl || ( !skipSavingCheck && this.savingCell() ) )
			return;
		const val = row[ column.id ];
		this.editingOriginalValue = Array.isArray( val ) ? JSON.parse( JSON.stringify( val ) ) : val;
		if ( column.format === 'chips' && Array.isArray( val ) && !column.editableOptionsUrl ) {
			this.editingChipsValues.set( val.map( ( c: any ) => {
				const opt = column.editableOptions?.find( o => o.label === c.label );
				return opt?.value || c.label;
			} ) );
		}
		this.editingCell.set( { row, field: column.id } );

		if ( column.editableOptionsUrl ) {
			this.editableOptionsLoading.set( true );
			this.loadedEditableOptions.set( [] );
			this.editableOptionsSub?.unsubscribe();
			const separator = column.editableOptionsUrl.includes( '?' ) ? '&' : '?';
			const optionsUrl = column.editableOptionsUrl + separator + 'id=' + encodeURIComponent( row.id ) + '&field=' + encodeURIComponent( column.id );
			this.editableOptionsSub = this.dataService.get( optionsUrl ).subscribe( {
				next: ( result: any ) => {
					this.loadedEditableOptions.set( result );
					this.editableOptionsLoading.set( false );
					if ( column.format === 'chips' && Array.isArray( val ) ) {
						this.editingChipsValues.set( val.map( ( c: any ) => {
							const opt = result.find( ( o: any ) => o.label === c.label );
							return opt?.value || c.label;
						} ) );
					}
					this.editableOptionsSub = null;
					this.focusInlineEdit();
				},
				error: () => {
					this.editableOptionsLoading.set( false );
					this.editableOptionsSub = null;
					this.cancelInlineEdit();
					this.snackbar.error( 'Optionen konnten nicht geladen werden' );
				}
			} );
		} else {
			this.focusInlineEdit();
		}
	}

	cancelInlineEdit(): void {
		const editing = this.editingCell();
		if ( editing ) {
			editing.row[ editing.field ] = this.editingOriginalValue;
			this.editingCell.set( null );
			this.editingOriginalValue = null;
		}
		this.editableOptionsSub?.unsubscribe();
		this.editableOptionsSub = null;
		this.loadedEditableOptions.set( [] );
		this.editableOptionsLoading.set( false );
	}

	saveInlineEdit( row: any, column: XiriTableField ): void {
		const editing = this.editingCell();
		if ( !editing || editing.row !== row || editing.field !== column.id ) return;
		const newValue = row[ column.id ];
		const originalValue = this.editingOriginalValue;
		this.editingCell.set( null );
		this.editingOriginalValue = null;
		this.loadedEditableOptions.set( [] );
		this.editableOptionsLoading.set( false );

		const unchanged = Array.isArray( newValue )
			? JSON.stringify( newValue ) === JSON.stringify( originalValue )
			: newValue === originalValue;
		if ( unchanged ) {
			return;
		}

		const value = column.format === 'chips' && Array.isArray( newValue )
			? newValue.map( ( c: any ) => c.label )
			: newValue;
		const payload = { id: row.id, field: column.id, value };
		this.savingCell.set( { row, field: column.id } );
		this.subs.add( this.dataService.post( this.options.editUrl, payload ).subscribe( {
			next: ( result: any ) => {
				this.savingCell.set( null );
				if ( result?.updates ) {
					Object.keys( result.updates ).forEach( key => {
						row[ key ] = result.updates[ key ];
					} );
					this.dataSource._updateChangeSubscription();
				}
				this.callReturn( result );
			},
			error: ( err: any ) => {
				this.savingCell.set( null );
				row[ column.id ] = originalValue;
				this.dataSource._updateChangeSubscription();
				this.snackbar.error( err.error?.error || 'Unknown Error' );
			}
		} ) );
	}

	isEditing( row: any, fieldId: string ): boolean {
		const editing = this.editingCell();
		return editing !== null && editing.row === row && editing.field === fieldId;
	}

	isSaving( row: any, fieldId: string ): boolean {
		const saving = this.savingCell();
		return saving !== null && saving.row === row && saving.field === fieldId;
	}

	onInlineEditKeydown( event: KeyboardEvent, row: any, column: XiriTableField ): void {
		if ( event.key === 'Enter' ) {
			event.preventDefault();
			this.saveInlineEdit( row, column );
		} else if ( event.key === 'Escape' ) {
			event.preventDefault();
			this.cancelInlineEdit();
		} else if ( event.key === 'Tab' ) {
			const matSelect = ( event.target as HTMLElement ).closest( 'mat-select' );
			if ( matSelect && matSelect.classList.contains( 'mat-mdc-select-open' ) ) {
				return;
			}
			event.preventDefault();
			const direction = event.shiftKey ? -1 : 1;
			const nextColumn = this.getAdjacentEditableColumn( column.id, direction );
			this.saveInlineEdit( row, column );
			if ( nextColumn ) {
				this.startInlineEdit( row, nextColumn, true );
			}
		}
	}

	private focusInlineEdit(): void {
		this._changeDetectorRef.detectChanges();
		setTimeout( () => {
			const el = document.querySelector( '.xiri-inline-edit input, .xiri-inline-edit mat-select' ) as HTMLElement;
			el?.focus();
		} );
	}

	private getAdjacentEditableColumn( currentField: string, direction: 1 | -1 ): XiriTableField | null {
		const noInlineEdit = new Set( [ 'buttons', 'icon', 'html', 'link', 'input', 'text2', 'textn', 'number', 'header' ] );
		const currentIndex = this.displayedColumns.findIndex( c => c.id === currentField );
		if ( currentIndex === -1 ) return null;
		for ( let i = currentIndex + direction; i >= 0 && i < this.displayedColumns.length; i += direction ) {
			const col = this.displayedColumns[ i ];
			if ( col.editable && !noInlineEdit.has( col.format ) ) {
				return col;
			}
		}
		return null;
	}

	getEditableOptions( column: XiriTableField ): { value: string; label: string; color?: string }[] {
		return column.editableOptions ?? this.loadedEditableOptions();
	}

	onChipsSelectionChange( row: any, column: XiriTableField, selectedValues: string[] ): void {
		this.editingChipsValues.set( selectedValues );
		const opts = this.getEditableOptions( column );
		row[ column.id ] = selectedValues.map( val => {
			const opt = opts.find( o => o.value === val );
			return { label: opt?.label || val, color: opt?.color || '' };
		} );
	}

	ngOnDestroy(): void {
		this.cleanup();
	}
	
	public pasteInput( $event: any, row: any, column: XiriTableField ) {
		
		if ( column.inputPaste !== true )
			return false;
		
		// Get the clipboard text
		const clipboardText = $event.clipboardData.getData( 'text' );
		
		// Split into rows
		let clipRowsArray = clipboardText.split( "\n" );
		
		// Split rows into columns
		for ( let i = 0; i < clipRowsArray.length; i++ ) {
			clipRowsArray[ i ] = clipRowsArray[ i ].split( "\t" );
		}
		
		if ( clipRowsArray.length < 2 ) {
			if ( clipRowsArray[ 0 ].length < 2 )
				return null;
		}
		
		const startRow = this.dataSource.data.findIndex( ( x: any ) => x.id === row.id );
		if ( startRow == -1 )
			return false;
		const startCol = this.displayedColumns.findIndex( ( x: any ) => x.id === column.id );
		if ( startCol == -1 )
			return false;
		
		for ( let i = 0; i < clipRowsArray.length; i++ ) {
			let curRow = i + startRow;
			if ( curRow >= this.dataSource.data.length )
				break;
			
			let result = this.dataSource.data[ curRow ];
			for ( let j = 0; j < clipRowsArray[ i ].length; j++ ) {
				let curCol = j + startCol;
				if ( curCol >= this.displayedColumns.length )
					break;
				
				let col = this.displayedColumns[ curCol ];
				result[ col.id ] = clipRowsArray[ i ][ j ];
			}
		}
		
		this.dataSource._updateChangeSubscription();
		return false;
	}
	
	public saveInputData() {
		
		// this.loading.set( true );
		let data = this.dataSource.data;
		if ( this.settings().url ) {
			this._alldata.set( [] );
			// this.dataSource.data = [];
			this.dataSource._updateChangeSubscription();
		}
		this._changeDetectorRef.markForCheck();
		
		this.subs.add(
			this.dataService.post( this.options.saveInputUrl, data ).subscribe(
				{
					next: ( result ) => {
						// this.loading.set( false );
						this.callReturn( result );
					},
					error: ( err: any ) => {

						this._alldata.set( data );
						// this.dataSource.data = data;
						// this.loading.set( false );
						this.dataSource._updateChangeSubscription();

						console.log( "table save error", err );
						this.snackbar.error( err.error?.error || 'Unknown Error' );
						this._changeDetectorRef.markForCheck();
					}
				} ) );
	}
	
	private cleanup(): void {
		
		if ( this.dialogRef )
			this.dialogRef.close( null );
		
		this.subs.unsubscribe();
	}
	
	private getSortingDataAccessor(): ( data: any, sortHeaderId: string ) => string | number {
		return ( data: any, sortHeaderId: string ): string | number => {
			const column = this.displayedColumns.find( col => col.id === sortHeaderId );
			if ( column && column.format === 'number' )
				return data[ sortHeaderId ][ 1 ];
			
			return data[ sortHeaderId ];
		};
	}
}
