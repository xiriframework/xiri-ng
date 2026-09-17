import { afterNextRender, inject, Injectable, Injector, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { XiriDataService } from '../services/data.service';
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriTableField } from '../raw-table/tabefield.interface';
import { XiriTableCellValue, XiriTableRow } from './tree.service';
import { asCellObject, isCellObject, normalizeEditValue } from './cell';

export interface EditableOption { value: string; label: string; color?: string }

// A single chip value as stored on a chips-format cell.
interface ChipValue { label: string; color?: string }

// Shape of the per-cell save response: optional field updates applied back to the row.
// update/id/content only for typing acted (a single-cell update alias) below.
interface InlineEditResult {
	updates?: Record<string, XiriTableCellValue>;
	refresh?: string; goto?: string; page?: string; table?: string; field?: string;
	update?: string; id?: unknown; content?: XiriTableCellValue;
}

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
	// Draft of v while a cellObject cell is edited. The cell itself is never mutated by the editor:
	// cancel drops the draft, the server (or the save fallback) replaces the whole cell.
	// editStart is the normalised v at start(): "unchanged" compares against it, never against the
	// live cell, which another save's updates may have patched meanwhile (Tab navigation).
	private editDraft: string | number | null = null;
	private editStart: string | number | null = null;
	private hasUrl!: () => boolean;
	// Hochgezählt bei jedem start()/cancel(): ein verspäteter Save-Fehler öffnet die Zelle nur wieder, wenn seitdem nichts passiert ist.
	private editSeq = 0;
	private editableOptionsSub: Subscription | null = null;
	private optionCache = new Map<string, EditableOption>();
	private searchSub: Subscription | null = null;
	private searchReqSub: Subscription | null = null;

	private getEditUrl!: () => string;
	private getDisplayedColumns!: () => XiriTableField[];
	private abort$!: Subject<void>;
	private onSaved!: ( row: XiriTableRow, fieldId: string ) => void;
	private onDataUpdate!: () => void;
	private onCallReturn!: ( result: unknown ) => void;
	private isRowLive!: ( row: XiriTableRow ) => boolean;

	private get editUrl(): string { return this.getEditUrl?.(); }
	private get displayedColumns(): XiriTableField[] { return this.getDisplayedColumns?.() ?? []; }

	init( config: {
		getEditUrl: () => string;
		getDisplayedColumns: () => XiriTableField[];
		abort$: Subject<void>;
		onSaved: ( row: XiriTableRow, fieldId: string ) => void;
		onDataUpdate: () => void;
		onCallReturn: ( result: unknown ) => void;
		isRowLive: ( row: XiriTableRow ) => boolean;
		hasUrl: () => boolean;
	} ): void {
		this.getEditUrl = config.getEditUrl;
		this.getDisplayedColumns = config.getDisplayedColumns;
		this.abort$ = config.abort$;
		this.onSaved = config.onSaved;
		this.onDataUpdate = config.onDataUpdate;
		this.onCallReturn = config.onCallReturn;
		this.isRowLive = config.isRowLive;
		this.hasUrl = config.hasUrl;
	}

	start( row: XiriTableRow, column: XiriTableField, skipSavingCheck = false ): void {
		if ( !column.editable || !this.editUrl || ( !skipSavingCheck && this.savingCell() ) )
			return;
		this.editSeq++;
		if ( column.cellObject && !isCellObject( row[ column.id ] as XiriTableCellValue ) )
			row[ column.id ] = asCellObject( row[ column.id ] as XiriTableCellValue );
		const val = row[ column.id ] as XiriTableCellValue;
		this.editingOriginalValue = Array.isArray( val ) ? JSON.parse( JSON.stringify( val ) ) : val;
		if ( column.cellObject ) {
			this.editStart = normalizeEditValue( column, isCellObject( val ) ? val.v : null );
			this.editDraft = this.editStart;
		}
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

	/** Value the inline editor shows: the draft of a cellObject cell while editing, else v, else the cell. */
	editValue( row: XiriTableRow, column: XiriTableField ): XiriTableCellValue {
		const cell = row[ column.id ] as XiriTableCellValue;
		if ( column.cellObject )
			return this.isEditing( row, column.id ) ? this.editDraft : ( isCellObject( cell ) ? cell.v : null );
		return cell;
	}

	setEditValue( row: XiriTableRow, column: XiriTableField, value: XiriTableCellValue ): void {
		if ( column.cellObject )
			// Raw browser value, kept as is: [ngModel] is one-way, so normalising here (e.g. a leading
			// "-" or a trailing "." on a numeric column) would write a mangled value back into the input
			// and break typing. Normalisation happens once, in save().
			this.editDraft = value as string | number | null;
		else
			row[ column.id ] = value;
	}

	/** compareWith for mat-select: option values are strings, v of a duration cell is a number. */
	compareEditValue( a: unknown, b: unknown ): boolean {
		return String( a ?? '' ) === String( b ?? '' );
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
		this.editSeq++;
		const editing = this.editingCell();
		if ( editing ) {
			// A cellObject cell was never mutated by the editor: restoring it here could revert a
			// patch another save's response applied to it meanwhile (Tab to another cell, whose save
			// then patches this one via updates) — the draft is dropped, the cell is left as is.
			const column = this.displayedColumns.find( c => c.id === editing.field );
			if ( !column?.cellObject )
				editing.row[ editing.field ] = this.editingOriginalValue;
			this.editingCell.set( null );
			this.editingOriginalValue = null;
		}
		this.editDraft = null;
		this.editStart = null;
		this.editableOptionsSub?.unsubscribe();
		this.editableOptionsSub = null;
		this.loadedEditableOptions.set( [] );
		this.editableOptionsLoading.set( false );
		this.teardownSearch();
	}

	save( row: XiriTableRow, column: XiriTableField ): void {
		const editing = this.editingCell();
		if ( !editing || editing.row !== row || editing.field !== column.id ) return;
		// Normalised here, not in setEditValue: the draft holds the raw browser value while typing (see
		// setEditValue), so "-" or "7200." are not clobbered mid-edit; only the committed save normalises.
		const draft = column.cellObject ? normalizeEditValue( column, this.editDraft ) : null;
		const newValue = column.cellObject ? draft : row[ column.id ] as XiriTableCellValue;
		const originalValue = column.cellObject ? this.editStart : this.editingOriginalValue;
		const seq = this.editSeq;
		const snapshot = {
			chips: this.editingChipsValues(),
			options: this.loadedEditableOptions(),
			cache: new Map( this.optionCache ),   // enthält auch nur per editableSearchUrl gefundene Optionen
		};
		this.editingCell.set( null );
		this.editingOriginalValue = null;
		this.loadedEditableOptions.set( [] );
		this.editableOptionsLoading.set( false );
		this.teardownSearch();

		const unchanged = column.cellObject
			? draft === originalValue
			: Array.isArray( newValue ) ? JSON.stringify( newValue ) === JSON.stringify( originalValue ) : newValue === originalValue;
		if ( unchanged ) {
			return;
		}

		const value: XiriTableCellValue = column.cellObject
			? draft
			: column.format === 'chips' && Array.isArray( newValue )
				? ( newValue as unknown as ChipValue[] ).map( ( c ) => c.label )
				: newValue;
		const payload = { id: row.id, field: column.id, value };
		this.savingCell.set( { row, field: column.id } );
		this.dataService.post( this.editUrl, payload ).pipe( takeUntil( this.abort$ ) ).subscribe( {
			next: ( raw: unknown ) => {
				const result = raw as InlineEditResult | null;
				this.savingCell.set( null );
				// Reference of the cell as it is NOW, not at send time: another save's response may have
				// replaced it meanwhile (overlapping Tab saves) — that must not count as this save's patch.
				const cellBefore = row[ column.id ] as XiriTableCellValue;
				if ( result?.updates ) {
					const updates = result.updates;
					Object.keys( updates ).forEach( key => {
						const col = this.displayedColumns.find( c => c.id === key );
						if ( col?.cellObject && !isCellObject( updates[ key ] ) )
							console.warn( `xiri-table: updates.${ key } for a cellObject column is not a {d, v} object; it will sort as empty` );
						row[ key ] = col?.cellObject ? asCellObject( updates[ key ] ) : updates[ key ];
					} );
				}
				// Let the handler apply refresh/goto/page and single-cell updates (table:update / update:table) first …
				this.onCallReturn( result );
				// … then judge by what actually happened to THIS cell: a new cell object replaced the old reference.
				const patched = row[ column.id ] !== cellBefore && isCellObject( row[ column.id ] as XiriTableCellValue );
				if ( column.cellObject && !patched ) {
					// No new cell from the server: show the draft as text so d never lags behind v; url tables reload below.
					row[ column.id ] = { ...asCellObject( cellBefore ), d: draft === null ? '' : String( draft ), v: draft };
				}
				this.onDataUpdate();
				this.onSaved( row, column.id );
				// A refresh/navigation already replaces or leaves this table; a single-cell update for another
				// row/field does not, so the url table still reloads to get d for this cell.
				const acted = !!( result?.refresh || result?.goto || result?.page || result?.table === 'refresh' );
				if ( column.cellObject && !patched && !acted && this.hasUrl() )
					this.onCallReturn( { done: true, refresh: 'table' } );
			},
			error: ( err: unknown ) => {
				this.savingCell.set( null );
				if ( this.editSeq !== seq || !this.isRowLive( row ) ) {
					// User ist schon woanders (Tab, Escape, neue Zelle) oder ein Reload hat die Row ersetzt: nichts kapern,
					// Wert verwerfen. Bei Zellobjekten wurde die Zelle nie verändert, also nichts zurückzusetzen.
					if ( !column.cellObject )
						row[ column.id ] = originalValue;
					this.onDataUpdate();
				} else {
					// Abgelehnten Wert stehen lassen und Zelle wieder öffnen; Escape stellt weiterhin das Original her
					// (bei Zellobjekten per cancel() nur noch fürs Draft, die Zelle bleibt sowieso unberührt).
					this.loadedEditableOptions.set( snapshot.options );
					this.editingChipsValues.set( snapshot.chips );
					this.editingOriginalValue = originalValue;
					this.editingCell.set( { row, field: column.id } );
					this.initSearch( column, row );
					snapshot.cache.forEach( ( o, k ) => this.optionCache.set( k, o ) );   // nach initSearch, das den Cache leert
					this.focus();
				}
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
			// Nur weiterspringen, wenn der Save die Zelle nicht (synchron abgelehnt) wieder geöffnet hat
			if ( nextColumn && !this.editingCell() ) {
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
			if ( col.editable && !noInlineEdit.has( col.format ?? '' ) ) {
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
		const v = row ? this.editValue( row, column ) : null;
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
