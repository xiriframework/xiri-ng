import { afterNextRender, inject, Injectable, Injector, signal } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { XiriDataService } from '../services/data.service';
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriTableField } from '../raw-table/tabefield.interface';


@Injectable()
export class XiriTableInlineEditService {

	private dataService = inject( XiriDataService );
	private snackbar = inject( XiriSnackbarService );
	private injector = inject( Injector );

	editingCell = signal<{ row: any; field: string } | null>( null );
	editingChipsValues = signal<string[]>( [] );
	editableOptionsLoading = signal( false );
	loadedEditableOptions = signal<{ value: string; label: string; color?: string }[]>( [] );
	savingCell = signal<{ row: any; field: string } | null>( null );

	private editingOriginalValue: any = null;
	private editableOptionsSub: Subscription | null = null;

	private getEditUrl: () => string;
	private getDisplayedColumns: () => XiriTableField[];
	private abort$: Subject<void>;
	private onSaved: ( row: any, fieldId: string ) => void;
	private onDataUpdate: () => void;
	private onCallReturn: ( result: any ) => void;

	private get editUrl(): string { return this.getEditUrl?.(); }
	private get displayedColumns(): XiriTableField[] { return this.getDisplayedColumns?.() ?? []; }

	init( config: {
		getEditUrl: () => string;
		getDisplayedColumns: () => XiriTableField[];
		abort$: Subject<void>;
		onSaved: ( row: any, fieldId: string ) => void;
		onDataUpdate: () => void;
		onCallReturn: ( result: any ) => void;
	} ): void {
		this.getEditUrl = config.getEditUrl;
		this.getDisplayedColumns = config.getDisplayedColumns;
		this.abort$ = config.abort$;
		this.onSaved = config.onSaved;
		this.onDataUpdate = config.onDataUpdate;
		this.onCallReturn = config.onCallReturn;
	}

	start( row: any, column: XiriTableField, skipSavingCheck = false ): void {
		if ( !column.editable || !this.editUrl || ( !skipSavingCheck && this.savingCell() ) )
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
			this.focus();
		}
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
	}

	save( row: any, column: XiriTableField ): void {
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
		this.dataService.post( this.editUrl, payload ).pipe( takeUntil( this.abort$ ) ).subscribe( {
			next: ( result: any ) => {
				this.savingCell.set( null );
				if ( result?.updates ) {
					Object.keys( result.updates ).forEach( key => {
						row[ key ] = result.updates[ key ];
					} );
					this.onDataUpdate();
				}
				this.onSaved( row, column.id );
				this.onCallReturn( result );
			},
			error: ( err: any ) => {
				this.savingCell.set( null );
				row[ column.id ] = originalValue;
				this.onDataUpdate();
				this.snackbar.error( err.error?.error || 'Unknown Error' );
			}
		} );
	}

	isEditing( row: any, fieldId: string ): boolean {
		const editing = this.editingCell();
		return editing !== null && editing.row === row && editing.field === fieldId;
	}

	isSaving( row: any, fieldId: string ): boolean {
		const saving = this.savingCell();
		return saving !== null && saving.row === row && saving.field === fieldId;
	}

	onKeydown( event: KeyboardEvent, row: any, column: XiriTableField ): void {
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

	flashSaved( row: any, fieldId: string, dataSource: any ): void {
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

	getOptions( column: XiriTableField ): { value: string; label: string; color?: string }[] {
		return column.editableOptions ?? this.loadedEditableOptions();
	}

	onChipsChange( row: any, column: XiriTableField, selectedValues: string[] ): void {
		this.editingChipsValues.set( selectedValues );
		const opts = this.getOptions( column );
		row[ column.id ] = selectedValues.map( val => {
			const opt = opts.find( o => o.value === val );
			return { label: opt?.label || val, color: opt?.color || '' };
		} );
	}
}
