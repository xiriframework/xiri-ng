import {
	ChangeDetectionStrategy,
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

export interface XiriQuerySettings {
	fields?: XiriFormField[]
	dyn?: any[]
	url?: string
	buttonline?: XiriDynData
	extra?: any
	saveState?: boolean
	saveStateId?: string
	collapsed?: boolean
}

@Component( {
	            selector: 'xiri-query',
	            templateUrl: './query.component.html',
	            styleUrl: './query.component.scss',
	            imports: [ XiriFormFieldsComponent, NgTemplateOutlet, XiriButtonlineComponent, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatIcon, MatProgressSpinner ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriQueryComponent implements OnInit {

	private dataService: XiriDataService = inject( XiriDataService );
	private formService = inject( XiriFormService );
	private cdr = inject( ChangeDetectorRef );
	private destroyRef = inject( DestroyRef );

	settings = input.required<XiriQuerySettings>();
	dyncomponent = input<TemplateRef<any>>();
	change = output<any>();

	private waiter: Subject<any> = new Subject<any>();
	
	public dynData: {
		data: XiriDynData[],
		filterData: any,
	} = { data: null, filterData: null };
	
	private saveState: boolean = false;
	private saveStateId: string | null = null;
	private extra: any = null;
	private _initialChangeDone: boolean = false;
	
	public data = signal<XiriDynData[] | null>( null );
	public error = signal<string | null>( null );
	public formFields = signal<XiriFormField[]>( null );
	public formValid = signal<boolean>( true );
	public filterData = signal<any>( null );
	public loading = signal<boolean>( false );
	
	ngOnInit(): void {
		
		let settings = this.settings();
		if ( settings.dyn !== undefined && settings.dyn !== null && settings.dyn.length != 0 )
			this.dynData.data = settings.dyn;
		
		this.saveState = settings.saveState === undefined ? false : settings.saveState;
		this.saveStateId = settings.saveStateId === undefined ? null : settings.saveStateId;
		this.formFields.set( this.formService.loadState( settings.saveStateId, settings.fields ) );
		this.extra = settings.extra || null;
		
		this.waiter.pipe( debounceTime( 300 ), takeUntilDestroyed( this.destroyRef ) ).subscribe( event => {

			if ( event.valid ) {
				this.dynData.filterData = this.filterData();
				this.change.emit( this.filterData() );
				if ( this.saveState )
					this.formService.saveState( this.saveStateId, event.value );

				if ( this.settings().url )
					this.load();
			} else {
				this.data.set( null );
				this.dynData.filterData = null;
				this.change.emit( null );
			}
			this.cdr.markForCheck();
		} );
	}

	public formChanged( event: any ) {
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
			this.change.emit( this.filterData() );
			if ( this.saveState )
				this.formService.saveState( this.saveStateId, event.value );
			if ( this.settings().url )
				this.load();
		} else {
			this.waiter.next( event );
		}
	}
	
	public clickedButton( event: XiriButtonResult ) {
		
		if ( !event.loading && event.done ) {
			this.data.set( event.result );
			this.error.set( null );
			this.change.emit( this.filterData() );
		} else {
			this.data.set( null );
			this.error.set( null );
		}
		
		this.loading.set( event.loading );
	}
	
	private load() {
		
		this.data.set( null );
		this.error.set( null );
		
		let call = this.dataService.post( this.settings().url, this.dynData.filterData );
		
		call.pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe(
			{
				next: ( res: any ) => {
					if ( !res ) {
						this.error.set( 'Unknown Error' );
						this.cdr.markForCheck();
						return;
					}

					// check if res is an array
					if ( Array.isArray( res.data ) )
						this.data.set( res.data );
					else
						this.data.set( [ res.data ] );
					this.cdr.markForCheck();
				},
				error: ( err: any ) => {
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
