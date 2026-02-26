import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from "rxjs";
import { Location } from '@angular/common';
import { XiriButton } from "../button/button.component";
import { XiriFormService, XiriFormServiceData, XiriFormServiceError } from "../services/form.service";
import { XiriButtonstyleComponent } from '../buttonstyle/buttonstyle.component';
import { XiriDoneComponent } from '../done/done.component';
import { XiriErrorComponent } from '../error/error.component';
import { XiriFormFieldsComponent } from '../formfields/form-fields.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { XiriFormField } from "../formfields/field.interface";

export interface XiriFormSettings {
	load?: boolean
	url: string
	fields?: any[]
	buttons?: XiriButton[]
	header?: string
}

@Component( {
	            selector: 'xiri-form',
	            templateUrl: './form.component.html',
	            styleUrl: './form.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ CdkTrapFocus,
	                       MatProgressSpinner,
	                       XiriFormFieldsComponent,
	                       XiriErrorComponent,
	                       XiriDoneComponent,
	                       XiriButtonstyleComponent ]
            } )
export class XiriFormComponent implements OnInit {

	settings = input.required<XiriFormSettings>();

	private location = inject( Location );
	private formService = inject( XiriFormService );
	private destroyRef = inject( DestroyRef );

	public formFields = signal<XiriFormField[]>( null );
	public loading = signal<boolean>( true );
	public done = signal<boolean>( false );
	public error = signal<string>( '' );

	private url: string;
	public buttons: XiriButton[];
	private extra = {};
	private formValues: any = null;
	public formValid: boolean = true;
	public checkSubject: Subject<void> = new Subject<void>();
	
	
	ngOnInit(): void {
		
		this.url = this.settings().url;
		
		if ( this.settings().load ) {
			this.send( null );
		} else
			this.loadData( this.formService.parse( this.settings() ) );
	}
	
	private send( data: any ) {
		
		this.loading.set( true );
		this.error.set( '' );
		
		this.formService.get( this.url, data, this.extra ).pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe(
			{
				next: ( res: XiriFormServiceData ) => {
					this.loadData( res );
				},
				error: ( err: XiriFormServiceError ) => {
					this.loading.set( false );
					this.error.set( err.error ?? 'Unknown Error' );
					
					if ( this.buttons.length == 0 ) {
						this.buttons = [ {
							text: 'Close',
							action: 'close',
							type: 'raised',
						} ];
					}
				}
			} );
	}

	private loadData( res: XiriFormServiceData ): void {
		
		if ( res.buttons ) {
			if ( res.url )
				this.url = res.url;
			this.buttons = res.buttons;
			this.extra = res.extra;
			this.formFields.set( res.fields );
		} else if ( res.done ) {
			this.done.set( true );
			this.formFields.set( null );
			this.buttons = [];
			res.done.pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe();
		}
		
		this.loading.set( false );
	}
	
	clickButton( button: XiriButton ): void {

		if ( button.action == 'back' )
			this.location.back();
		else if ( button.action == 'get' ) {
			this.url = <string> button.url;
			this.startSend( null );
		} else if ( button.action == 'post' ) {
			this.url = <string> button.url;
			this.startSend( button.data );
		} else if ( button.action == 'debug' ) {
			this.checkSubject.next();
		} else if ( button.action == 'simulate' ) {
			if ( this.formValid ) {
				this.loading.set( true );
				this.error.set( '' );
				setTimeout( () => {
					this.loadData( this.formService.parse( {
						                                       done: true,
					                                       } ) );
				}, 5000 );
			} else
				this.checkSubject.next();
			
			
		} else {
			if ( this.loading() )
				return;
			
			this.startSend( this.formValues );
		}
	}
	
	private startSend( data: any ): void {
		
		setTimeout( () => {
			if ( this.formValid )
				this.send( data );
			else
				this.checkSubject.next();
		}, 10 );
	}
	
	public formChanged( event: any ) {
		
		this.formValid = event.valid;
		this.formValues = event.value;
		
		// data = { ...data, ...this.extra }
		// this.events.push( '' + this.formValid + ' => ' + JSON.stringify( event.value ) );
	}
	
}
