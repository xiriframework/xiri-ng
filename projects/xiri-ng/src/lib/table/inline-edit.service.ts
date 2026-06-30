import { afterNextRender, inject, Injectable, Injector, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { XiriDataService } from '../services/data.service';
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriTableField } from '../raw-table/tabefield.interface';
import { XiriTableCellValue, XiriTableRow } from './tree.service';

export interface EditableOption { value: string; label: string; color?: string }

// A single chip value as stored on a chips-format cell.
interface ChipValue { label: string; color?: string }

// Shape of the per-cell save response: optional field updates applied back to the row.
interface InlineEditResult { updates?: Record<string, XiriTableCellValue> }

// Reads a human-readable message out of an unknown HTTP error value.
function errorMessage( err: unknown ): string | undefined {
	const inner = ( err as { error?: { error?: string } | string } )?.error;
	if ( inner && typeof inner === 'object' && 'error' in inner )
		return inner.error;
	return undefined;
}


@Injectable()
export class XiriTableInlineEditService {

	private dataService = inject( XiriDataService );
	private snackbar = inject( XiriSnackbarService );
	private injector = inject( Injector );

	editingCell = signal<{ row: XiriTableRow; field: string } | null>( null );
	editingChipsValues = signal<string[]>( [] );
	editableOptionsLoading = signal( false );
	loadedEditableOptions = signal<EditableOption[]>( [] );
	savingCell = signal<{ row: XiriTableRow; field: string } | null>( null );

	// Inline-edit select search (client- and server-side)
	searchControl = new FormControl<string>( '', { nonNullable: true } );
	searching = signal( false );
	displayedOptions = signal<EditableOption[]>( [] );

	private editingOriginalValue: XiriTableCellValue = null;
	private editableOptionsSub: Subscription | null = null;
	private optionCache = new Map<string, EditableOption>();
	private searchSub: Subscription | null = null;
	private searchReqSub: Subscription | null = null;

	private getEditUrl: () => string;
	private getDisplayedColumns: () => XiriTableField[];
	private abort$: Subject<void>;
	private onSaved: ( row: XiriTableRow, fieldId: string ) => void;
	private onDataUpdate: () => void;
	private onCallReturn: ( result: unknown ) => void;

	private get editUrl(): string { return this.getEditUrl?.(); }
	private get displayedColumns(): XiriTableField[] { return this.getDisplayedColumns?.() ?? []; }

	init( config: {
		getEditUrl: () => string;
		getDisplayedColumns: () => XiriTableField[];
		abort$: Subject<void>;
		onSaved: ( row: XiriTableRow, fieldId: string ) => void;
		onDataUpdate: () => void;
		onCallReturn: ( result: unknown ) => void;
	} ): void {
		this.getEditUrl = config.getEditUrl;
		this.getDisplayedColumns = config.getDisplayedColumns;
		this.abort$ = config.abort$;
		this.onSaved = config.onSaved;
		this.onDataUpdate = config.onDataUpdate;
		this.onCallReturn = config.onCallReturn;
	}

	start( row: XiriTableRow, column: XiriTableField, skipSavingCheck = false ): void {
		if ( !column.editable || !this.editUrl || ( !skipSavingCheck && this.savingCell() ) )
			return;
		const val = row[ column.id ] as XiriTableCellValue;
		this.editingOriginalValue = Array.isArray( val ) ? JSON.parse( JSON.stringify( val ) ) : val;
		if ( column.format === 'chips' && Array.isArray( val ) && !column.editableOptionsUrl ) {
			this.editingChipsValues.set( ( val as unknown as ChipValue[] ).map( ( c ) => {
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
			const optionsUrl = column.editableOptionsUrl + separator + 'id=' + encodeURIComponent( String( row.id ) ) + '&field=' + encodeURIComponent( column.id );
			this.editableOptionsSub = this.dataService.get( optionsUrl ).subscribe( {
				next: ( raw: unknown ) => {
					const result = ( raw ?? [] ) as EditableOption[];
					this.loadedEditableOptions.set( result );
					this.editableOptionsLoading.set( false );
					if ( column.format === 'chips' && Array.isArray( val ) ) {
						this.editingChipsValues.set( ( val as unknown as ChipValue[] ).map( ( c ) => {
							const opt = result.find( ( o ) => o.label === c.label );
							return opt?.value || c.label;
						} ) );
					}
					this.editableOptionsSub = null;
					this.initSearch( column, row );
					this.focus();
				},
				error: () => {
					this.editableOptionsLoading.set( false );
					this.editableOptionsSub = null;
					this.cancel();
					this.snackbar.error( 'Optionen konnten nicht geladen werden' );
				}
			} );
		} else {
			this.initSearch( column, row );
			this.focus();
		}
	}

	/** Sets up the search box + subscription for searchable inline-edit selects. */
	private initSearch( column: XiriTableField, row: XiriTableRow ): void {
		this.teardownSearch();
		if ( !column.editableOptionsSearch && !column.editableSearchUrl )
			return;
		const base = this.baseOptions( column );
		base.forEach( o => this.optionCache.set( o.value, o ) );
		this.displayedOptions.set( base.slice() );
		this.searchControl.setValue( '', { emitEvent: false } );
		this.searchSub = this.searchControl.valueChanges.pipe(
			debounceTime( 200 ),
			takeUntil( this.abort$ )
		).subscribe( term => this.runSearch( column, row, term ?? '' ) );
	}

	/** Runs the search: server-side POST when editableSearchUrl is set, otherwise local label filter. */
	private runSearch( column: XiriTableField, row: XiriTableRow, term: string ): void {
		const base = this.baseOptions( column );
		if ( column.editableSearchUrl ) {
			if ( !term ) {
				this.searchReqSub?.unsubscribe();
				this.searchReqSub = null;
				this.searching.set( false );
				this.displayedOptions.set( base.slice() );
				return;
			}
			this.searching.set( true );
			this.searchReqSub?.unsubscribe();
			this.searchReqSub = this.dataService.post( column.editableSearchUrl, { id: row.id, field: column.id, search: term } )
				.pipe( takeUntil( this.abort$ ) ).subscribe( {
					next: ( result: unknown ) => {
						const opts: EditableOption[] = ( result ?? [] ) as EditableOption[];
						opts.forEach( o => this.optionCache.set( o.value, o ) );
						this.displayedOptions.set( opts );
						this.searching.set( false );
						this.searchReqSub = null;
					},
					error: () => {
						this.searching.set( false );
						this.searchReqSub = null;
					}
				} );
		} else {
			const t = term.toLowerCase();
			this.displayedOptions.set( t ? base.filter( o => o.label.toLowerCase().includes( t ) ) : base.slice() );
		}
	}

	private teardownSearch(): void {
		this.searchSub?.unsubscribe();
		this.searchSub = null;
		this.searchReqSub?.unsubscribe();
		this.searchReqSub = null;
		this.searching.set( false );
		this.displayedOptions.set( [] );
		this.optionCache.clear();
		this.searchControl.setValue( '', { emitEvent: false } );
	}

	/** The unfiltered option list: static options on the column, or those loaded via editableOptionsUrl. */
	private baseOptions( column: XiriTableField ): EditableOption[] {
		return column.editableOptions ?? this.loadedEditableOptions();
	}

	cancel(): void {
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
		this.teardownSearch();
	}

	save( row: XiriTableRow, column: XiriTableField ): void {
		const editing = this.editingCell();
		if ( !editing || editing.row !== row || editing.field !== column.id ) return;
		const newValue = row[ column.id ] as XiriTableCellValue;
		const originalValue = this.editingOriginalValue;
		this.editingCell.set( null );
		this.editingOriginalValue = null;
		this.loadedEditableOptions.set( [] );
		this.editableOptionsLoading.set( false );
		this.teardownSearch();

		const unchanged = Array.isArray( newValue )
			? JSON.stringify( newValue ) === JSON.stringify( originalValue )
			: newValue === originalValue;
		if ( unchanged ) {
			return;
		}

		const value: XiriTableCellValue = column.format === 'chips' && Array.isArray( newValue )
			? ( newValue as unknown as ChipValue[] ).map( ( c ) => c.label )
			: newValue;
		const payload = { id: row.id, field: column.id, value };
		this.savingCell.set( { row, field: column.id } );
		this.dataService.post( this.editUrl, payload ).pipe( takeUntil( this.abort$ ) ).subscribe( {
			next: ( raw: unknown ) => {
				const result = raw as InlineEditResult | null;
				this.savingCell.set( null );
				if ( result?.updates ) {
					const updates = result.updates;
					Object.keys( updates ).forEach( key => {
						row[ key ] = updates[ key ];
					} );
					this.onDataUpdate();
				}
				this.onSaved( row, column.id );
				this.onCallReturn( result );
			},
			error: ( err: unknown ) => {
				this.savingCell.set( null );
				row[ column.id ] = originalValue;
				this.onDataUpdate();
				this.snackbar.error( errorMessage( err ) || 'Unknown Error' );
			}
		} );
	}

	isEditing( row: XiriTableRow, fieldId: string ): boolean {
		const editing = this.editingCell();
		return editing !== null && editing.row === row && editing.field === fieldId;
	}

	isSaving( row: XiriTableRow, fieldId: string ): boolean {
		const saving = this.savingCell();
		return saving !== null && saving.row === row && saving.field === fieldId;
	}

	onKeydown( event: KeyboardEvent, row: XiriTableRow, column: XiriTableField ): void {
		if ( event.key === 'Enter' ) {
			event.preventDefault();
			this.save( row, column );
		} else if ( event.key === 'Escape' ) {
			event.preventDefault();
			this.cancel();
		} else if ( event.key === 'Tab' ) {
			const matSelect = ( event.target as HTMLElement ).closest( 'mat-select' );
			if ( matSelect && matSelect.classList.contains( 'mat-mdc-select-open' ) ) {
				return;
			}
			event.preventDefault();
			const direction = event.shiftKey ? -1 : 1;
			const nextColumn = this.getAdjacentEditableColumn( column.id, direction );
			this.save( row, column );
			if ( nextColumn ) {
				this.start( row, nextColumn, true );
			}
		}
	}

	focus(): void {
		afterNextRender( () => {
			const el = document.querySelector( '.xiri-inline-edit input, .xiri-inline-edit mat-select' ) as HTMLElement;
			el?.focus();
		}, { injector: this.injector } );
	}

	getAdjacentEditableColumn( currentField: string, direction: 1 | -1 ): XiriTableField | null {
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

	flashSaved( row: XiriTableRow, fieldId: string, dataSource: MatTableDataSource<XiriTableRow> ): void {
		afterNextRender( () => {
			const rowIndex = dataSource.data.indexOf( row );
			const colIndex = this.displayedColumns.findIndex( c => c.id === fieldId );
			if ( rowIndex === -1 || colIndex === -1 ) return;
			const rows = document.querySelectorAll( '.xiritable tr.mat-mdc-row' );
			const rowEl = rows[ rowIndex ];
			if ( !rowEl ) return;
			const cells = rowEl.querySelectorAll( 'td.mat-mdc-cell' );
			const cell = cells[ colIndex ] as HTMLElement;
			if ( !cell ) return;
			cell.classList.add( 'xiri-cell-saved' );
			setTimeout( () => cell.classList.remove( 'xiri-cell-saved' ), 500 );
		}, { injector: this.injector } );
	}

	getOptions( column: XiriTableField ): EditableOption[] {
		if ( !column.editableOptionsSearch && !column.editableSearchUrl )
			return this.baseOptions( column );
		// While searching, return the currently shown options but always keep the
		// selected value(s) present so the trigger label stays correct even when
		// the active search result no longer contains them.
		const shown = this.displayedOptions().slice();
		const present = new Set( shown.map( o => o.value ) );
		for ( const val of this.selectedValues( column ) ) {
			if ( !present.has( val ) )
				shown.unshift( this.optionCache.get( val ) ?? { value: val, label: val } );
		}
		return shown;
	}

	/** The currently selected value(s) of the editing cell. */
	private selectedValues( column: XiriTableField ): string[] {
		if ( column.format === 'chips' )
			return this.editingChipsValues();
		const row = this.editingCell()?.row;
		const v = row ? row[ column.id ] : null;
		return v !== null && v !== undefined && v !== '' ? [ String( v ) ] : [];
	}

	onChipsChange( row: XiriTableRow, column: XiriTableField, selectedValues: string[] ): void {
		this.editingChipsValues.set( selectedValues );
		row[ column.id ] = selectedValues.map( val => {
			const opt = this.optionCache.get( val ) ?? this.getOptions( column ).find( o => o.value === val );
			return { label: opt?.label || val, color: opt?.color || '' };
		} );
	}
}
