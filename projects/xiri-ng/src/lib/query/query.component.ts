import {
	ChangeDetectorRef,
	Component,
	computed,
	DestroyRef,
	inject,
	input,
	OnInit,
	output,
	signal,
	TemplateRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject } from "rxjs";
import { XiriFormField } from "../formfields/field.interface";
import { XiriDynData } from "../dyncomponent/dyndata.interface";
import { NgTemplateOutlet } from '@angular/common';
import { XiriFormFieldsComponent } from '../formfields/form-fields.component';
import { XiriDataService } from "../services/data.service";
import { XiriFormService } from "../services/form.service";
import { XiriButtonlineComponent } from "../buttonline/buttonline.component";
import { XiriButtonResult } from "../button/button.component";
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from "@angular/material/expansion";
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatChip, MatChipRemove, MatChipSet } from "@angular/material/chips";
import { HttpErrorResponse } from "@angular/common/http";

export interface XiriQuerySettings {
	fields?: XiriFormField[]
	dyn?: XiriDynData[]
	url?: string
	buttonline?: XiriDynData
	extra?: Record<string, unknown>
	saveState?: boolean
	saveStateId?: string
	collapsed?: boolean
	showActiveFilters?: boolean
	showResultCount?: boolean
}

// A single active filter, rendered as a removable chip.
export interface XiriQueryActiveFilter {
	id: string
	label: string
	value: string
}

// Result count for the query. `total` (unfiltered) is optional.
export interface XiriQueryResultCount {
	filtered: number
	total?: number
}

// Field types that never carry a filter value (structural/informational).
const NON_FILTER_FIELD_TYPES = new Set( [ 'header', 'divider', 'info', 'html', 'question', 'waiting' ] );

// Event emitted by xiri-form-fields (carries the underlying FormGroup, exposing valid/value/pristine).
export interface XiriQueryFormChangeEvent {
	valid: boolean
	value: Record<string, unknown> | null
	pristine?: boolean
}

@Component( {
	            selector: 'xiri-query',
	            templateUrl: './query.component.html',
	            styleUrl: './query.component.scss',
	            imports: [ XiriFormFieldsComponent, NgTemplateOutlet, XiriButtonlineComponent, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatIcon, MatButton, MatProgressSpinner, MatChipSet, MatChip, MatChipRemove ],
            } )
export class XiriQueryComponent implements OnInit {

	private dataService: XiriDataService = inject( XiriDataService );
	private formService = inject( XiriFormService );
	private cdr = inject( ChangeDetectorRef );
	private destroyRef = inject( DestroyRef );

	settings = input.required<XiriQuerySettings>();
	dyncomponent = input<TemplateRef<unknown>>();
	// Host-provided result count (e.g. client-side filtering). URL loads may override it via the response.
	count = input<XiriQueryResultCount | null>( null );
	filterChange = output<Record<string, unknown> | null>();

	private waiter: Subject<XiriQueryFormChangeEvent> = new Subject<XiriQueryFormChangeEvent>();

	public dynData: {
		data: XiriDynData[] | null,
		filterData: Record<string, unknown> | null,
	} = { data: null, filterData: null };

	private saveState = false;
	private saveStateId: string | null = null;
	private extra: Record<string, unknown> | null = null;
	private _initialChangeDone = false;

	private get effectiveSaveKey(): string | null {
		return this.saveStateId ? this.saveStateId + ':filter' : null;
	}
	
	public data = signal<XiriDynData[] | null>( null );
	public error = signal<string | null>( null );
	public formFields = signal<XiriFormField[] | null>( null );
	public formValid = signal<boolean>( true );
	public filterData = signal<Record<string, unknown> | null>( null );
	public loading = signal<boolean>( false );

	// Raw (un-merged with `extra`) form value, used to derive the visible active-filter chips.
	private rawValue = signal<Record<string, unknown> | null>( null );
	// Result count picked up from a URL load response (`count`/`total`), overrides the `count` input.
	private responseCount = signal<XiriQueryResultCount | null>( null );

	public resultCount = computed<XiriQueryResultCount | null>( () => this.responseCount() ?? this.count() );

	public activeFilters = computed<XiriQueryActiveFilter[]>( () => {
		const fields = this.formFields();
		const value = this.rawValue();
		if ( !fields || !value )
			return [];

		const result: XiriQueryActiveFilter[] = [];
		for ( const field of fields ) {
			if ( NON_FILTER_FIELD_TYPES.has( field.type ) )
				continue;
			const raw = value[ field.id ];
			if ( isEmptyFilterValue( raw ) )
				continue;
			result.push( { id: field.id, label: field.name ?? field.id, value: formatFilterValue( field, raw ) } );
		}
		return result;
	} );

	ngOnInit(): void {
		
		const settings = this.settings();
		if ( settings.dyn !== undefined && settings.dyn !== null && settings.dyn.length != 0 )
			this.dynData.data = settings.dyn;
		
		this.saveState = settings.saveState === undefined ? false : settings.saveState;
		this.saveStateId = settings.saveStateId === undefined ? null : settings.saveStateId;
		this.formFields.set( this.formService.loadState( this.effectiveSaveKey, settings.fields ?? [] ) );
		this.extra = settings.extra || null;
		
		this.waiter.pipe( debounceTime( 300 ), takeUntilDestroyed( this.destroyRef ) ).subscribe( event => {

			if ( event.valid ) {
				this.dynData.filterData = this.filterData();
				this.filterChange.emit( this.filterData() );
				if ( this.saveState )
					this.formService.saveState( this.effectiveSaveKey, event.value );

				if ( this.settings().url )
					this.load();
			} else {
				this.data.set( null );
				this.dynData.filterData = null;
				this.filterChange.emit( null );
			}
			this.cdr.markForCheck();
		} );
	}

	public formChanged( event: XiriQueryFormChangeEvent ) {
		this.formValid.set( event.valid );
		this.rawValue.set( event.value );

		if ( this.extra !== null ) {
			if ( event.value && typeof event.value === 'object' )
				this.filterData.set( { ...this.extra, ...event.value } );
			else
				this.filterData.set( this.extra );
		} else
			this.filterData.set( event.value );

		// Emit immediately on first valid change (for initial load), debounce subsequent changes
		if ( !this._initialChangeDone && event.valid ) {
			this._initialChangeDone = true;
			this.dynData.filterData = this.filterData();
			this.filterChange.emit( this.filterData() );
			if ( this.saveState )
				this.formService.saveState( this.effectiveSaveKey, event.value );
			if ( this.settings().url )
				this.load();
		} else {
			this.waiter.next( event );
		}
	}
	
	// Re-runs the last URL load after an error; filter payload is retained in dynData.filterData.
	public retry() {
		if ( this.settings().url )
			this.load();
	}

	public clickedButton( event: XiriButtonResult ) {
		
		if ( !event.loading && event.done ) {
			this.data.set( event.result as XiriDynData[] | null );
			this.error.set( null );
			this.filterChange.emit( this.filterData() );
		} else {
			this.data.set( null );
			this.error.set( null );
		}
		
		this.loading.set( event.loading );
	}
	
	// Clears a single filter. Mutating the control fires the form's valueChanges, which routes back through
	// formChanged() — i.e. exactly the same filter flow as editing/applying the form, not just a visual removal.
	public removeFilter( id: string ) {
		const field = this.formFields()?.find( f => f.id === id );
		field?.control?.reset( emptyValueForField( field ) );
	}

	// Clears all filters; each reset re-runs the same (debounced) filter flow as apply.
	public resetFilters() {
		for ( const field of this.formFields() ?? [] )
			field.control?.reset( emptyValueForField( field ) );
	}

	private load() {

		// Stale-while-revalidate: keep the previous data() visible (dimmed via loading())
		// instead of flashing empty on every navigation/filter change.
		this.error.set( null );
		this.loading.set( true );

		const call = this.dataService.post( this.settings().url ?? '', this.dynData.filterData );

		call.pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe(
			{
				next: ( res: unknown ) => {
					this.loading.set( false );
					if ( !res ) {
						this.data.set( null );
						this.error.set( 'Unknown Error' );
						this.cdr.markForCheck();
						return;
					}

					const data = ( res as { data: XiriDynData[] | XiriDynData } ).data;
					// check if res is an array
					if ( Array.isArray( data ) )
						this.data.set( data );
					else
						this.data.set( [ data ] );

					// Pick up an optional result count from the response (backend-driven counts).
					const counted = res as { count?: number, total?: number };
					if ( typeof counted.count === 'number' )
						this.responseCount.set( { filtered: counted.count, total: counted.total } );

					this.cdr.markForCheck();
				},
				error: ( err: HttpErrorResponse ) => {
					this.loading.set( false );
					this.data.set( null );
					if ( err.status === 404 )
						this.error.set( 'Page not found' );
					else if ( err.status === 401 )
						this.error.set( 'No permission to view page' );
					else if ( err.status === 403 )
						this.error.set( 'Access denied' );
					else if ( err.status === 500 )
						this.error.set( 'Internal Error' );
					else
						this.error.set( 'Unknown Error' );

					console.log( 'XiriQueryComponent error', err );
					this.cdr.markForCheck();
				}
			} );
	}
}

// A filter counts as active unless it is null/undefined, an empty string, an empty array,
// a boolean false, or a range object with no bounds set.
function isEmptyFilterValue( value: unknown ): boolean {
	if ( value === null || value === undefined || value === '' || value === false )
		return true;
	if ( Array.isArray( value ) )
		return value.length === 0;
	if ( typeof value === 'object' ) {
		const vals = Object.values( value as Record<string, unknown> );
		return vals.length === 0 || vals.every( v => v === null || v === undefined || v === '' );
	}
	return false;
}

// Renders a readable value for the chip. Scalar and list-backed (select/multiselect) fields map
// cleanly to their option name(s); anything else (e.g. range objects) falls back to a plain string.
function formatFilterValue( field: XiriFormField, value: unknown ): string {
	const optionName = ( id: unknown ): string => {
		const opt = field.list?.find( o => o.id === id );
		return opt ? opt.name : String( id );
	};

	if ( Array.isArray( value ) )
		return value.map( optionName ).join( ', ' );
	if ( field.list && ( typeof value === 'string' || typeof value === 'number' ) )
		return optionName( value );
	if ( value === true )
		return field.name ?? 'Ja';
	return String( value );
}

// The "empty" value used to clear a control, matching the shape the control currently holds.
function emptyValueForField( field: XiriFormField ): unknown {
	const value = field.control?.value;
	if ( Array.isArray( value ) )
		return [];
	if ( typeof value === 'string' )
		return '';
	return null;
}
