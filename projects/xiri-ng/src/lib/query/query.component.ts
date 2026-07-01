import {
	ChangeDetectorRef,
	Component,
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
import { MatProgressSpinner } from "@angular/material/progress-spinner";
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
}

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
	            imports: [ XiriFormFieldsComponent, NgTemplateOutlet, XiriButtonlineComponent, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatIcon, MatProgressSpinner ],
            } )
export class XiriQueryComponent implements OnInit {

	private dataService: XiriDataService = inject( XiriDataService );
	private formService = inject( XiriFormService );
	private cdr = inject( ChangeDetectorRef );
	private destroyRef = inject( DestroyRef );

	settings = input.required<XiriQuerySettings>();
	dyncomponent = input<TemplateRef<unknown>>();
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
	
	private load() {
		
		this.data.set( null );
		this.error.set( null );
		
		const call = this.dataService.post( this.settings().url ?? '', this.dynData.filterData );
		
		call.pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe(
			{
				next: ( res: unknown ) => {
					if ( !res ) {
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
					this.cdr.markForCheck();
				},
				error: ( err: HttpErrorResponse ) => {
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
