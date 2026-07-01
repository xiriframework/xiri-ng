import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnDestroy, signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogContent,
	MatDialogRef,
	MatDialogTitle
} from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { XiriDataService } from '../services/data.service';
import { XiriButton } from "../button/button.component";
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriRawTableComponent, XiriRawTableSettings } from "../raw-table/xiri-raw-table.component";
import { Router } from "@angular/router";
import { XiriButtonstyleComponent } from '../buttonstyle/buttonstyle.component';
import { MatDivider } from '@angular/material/divider';
import { XiriDoneComponent } from '../done/done.component';
import { XiriErrorComponent } from '../error/error.component';
import { XiriFormFieldsComponent } from '../formfields/form-fields.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { XiriFormField } from "../formfields/field.interface";
import { XiriDownloadService } from "../services/download.service";
import { parseHttpError } from '../services/error.util';
import { HttpErrorResponse } from '@angular/common/http';


export type XiriDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface XiriDialogSettings {
	url?: string
	size?: XiriDialogSize | string

	type: "form" | "data" | "question" | "waiting" | "table" | "component"
	data?: unknown
	filter?: Record<string, unknown> | null
}

// Backend response loaded into the dialog (form definition, question, table, done/goto etc.).
export interface XiriDialogResponse {
	buttons?: XiriButton[]
	size?: XiriDialogSize | string
	url?: string
	header?: string
	type?: string
	content?: unknown
	fields?: unknown
	model?: Record<string, unknown>
	extra?: Record<string, unknown>
	time?: number
	done?: boolean
	error?: string
	goto?: string
	[ key: string ]: unknown
}

const DIALOG_SIZE_MAP: Record<string, string> = {
	sm: '400px',
	md: '600px',
	lg: '900px',
	xl: '1200px',
	full: '95vw',
};

@Component( {
	            selector: 'xiri-dialog',
	            templateUrl: './dialog.component.html',
	            styleUrls: [ './dialog.component.scss' ],
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatDialogTitle,
	                       MatDialogContent,
	                       MatProgressSpinner,
	                       XiriRawTableComponent,
	                       XiriFormFieldsComponent,
	                       NgComponentOutlet,
	                       XiriErrorComponent,
	                       XiriDoneComponent,
	                       MatDivider,
	                       MatDialogActions,
	                       XiriButtonstyleComponent ]
            } )
export class XiriDialogComponent implements OnDestroy {
	dialogRef = inject<MatDialogRef<XiriDialogComponent>>( MatDialogRef );
	initData = inject<XiriDialogSettings>( MAT_DIALOG_DATA );
	private breakpointObserver = inject( BreakpointObserver );
	private dataService = inject( XiriDataService );
	private router = inject( Router );
	private snackbar = inject( XiriSnackbarService );
	
	
	type = signal('form');
	header = signal('');
	public buttons = signal<XiriButton[]>([]);
	private url = '';
	private extra = {};
	private destroyRef = inject( DestroyRef );

	private downloadService = inject( XiriDownloadService );
	
	public formFields = signal<XiriFormField[]>( null );
	public componentData = signal<unknown>( null );
	// Dynamisch nachgeladene XiriDynComponentComponent (vermeidet zirkulären Import dialog -> dyncomponent)
	public dynComponentType = signal<Type<unknown>>( null );
	public loading = signal<boolean>( true );
	public done = signal<boolean>( false );
	public error = signal<string>( '' );
	
	private formValues: Record<string, unknown> | null = null;
	public formValid = signal<boolean>(false);
	public checkSubject: Subject<void> = new Subject<void>();
	
	private to = null;
	private refreshTime = 2000;
	rawTable: XiriRawTableSettings;

	private effectiveSize: string | undefined;

	constructor() {

		this.dialogRef.addPanelClass( 'xiri-dialog-sized' );
		this.effectiveSize = this.initData.size;

		this.breakpointObserver
			.observe( [ Breakpoints.XSmall, Breakpoints.Small ] )
			.pipe( takeUntilDestroyed( this.destroyRef ) )
			.subscribe( ( state: BreakpointState ) => {
				this.applyDialogSize( state.matches );
			} );
		
		if ( this.initData.url )
			this.url = this.initData.url;
		
		if ( this.initData.type == 'form' )
			this.loadData( this.initData as unknown as XiriDialogResponse );
		else if ( this.initData.type == 'data' )
			this.send( { data: this.initData.data } );
		else if ( this.initData.filter )
			this.send( this.initData.filter );
		else
			this.send( null );
		
	}
	
	private send( data: unknown ) {

		this.loading.set( true );
		this.error.set( '' );

		const req = data === null ?
		            this.dataService.get( this.url ) :
		            this.dataService.post( this.url, { ...( data as object ), ...this.extra } );

		// this.buttons = [];

		req.pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe(
			{
				next: ( res: unknown ) => {
					if ( res )
						this.loadData( res as XiriDialogResponse );
					else
						this.showError( { status: 500 } );
				},
				error: ( err ) => {
					this.showError( err );
				}
			} );
	}

	private showError( err: unknown ) {
		this.loading.set( false );
		this.error.set( parseHttpError( err as HttpErrorResponse ) );
		
		// this.header = 'Error';
		if ( this.buttons().length == 0 ) {
			this.buttons.set( [ {
				text: 'Close',
				action: 'close',
				type: 'raised',
			} ] );
		}
	}
	
	private applyDialogSize( isMobile: boolean ): void {
		if ( isMobile ) {
			this.dialogRef.updateSize( '90vw' );
			return;
		}
		const raw = this.effectiveSize;
		const width = DIALOG_SIZE_MAP[ raw ] ?? raw ?? '600px';
		this.dialogRef.updateSize( width );
		if ( raw === 'full' )
			this.dialogRef.addPanelClass( 'xiri-dialog-full' );
	}

	private loadData( res: XiriDialogResponse ): void {

		if ( res.buttons ) {
			if ( res.size && res.size !== this.effectiveSize ) {
				this.effectiveSize = res.size;
				this.applyDialogSize( this.breakpointObserver.isMatched( [ Breakpoints.XSmall, Breakpoints.Small ] ) );
			}
			if ( res.url )
				this.url = res.url;

			let formData: XiriFormField[] | null = [];
			const inFields: unknown = res.content || res.fields;
			const model = res.model || {};
			this.header.set( res.header );
			this.buttons.set( res.buttons );
			this.type.set( res.type ? res.type : 'form' );
			this.extra = res.extra || {};

			if ( this.type() == 'form' ) {
				( inFields as XiriFormField[] ).forEach( ( field: XiriFormField ) => {
					if ( field.hide == true )
						return;
					if ( model[ field.id ] !== undefined )
						field.value = model[ field.id ];

					formData!.push( field );
				} );
			} else if ( this.type() == 'question' ) {
				const field = inFields as XiriFormField;
				field.type = 'question';
				formData.push( field );
				this.formValid.set( true );
			} else if ( this.type() == 'waiting' ) {
				const field = inFields as XiriFormField & { text?: unknown };
				field.type = 'waiting';
				field.done = false;
				field.value = field.text;
				formData.push( field );
			} else if ( this.type() == 'table' ) {
				this.rawTable = inFields as XiriRawTableSettings;
				formData = [];
			} else if ( this.type() == 'component' ) {
				this.componentData.set( inFields );
				this.formValid.set( true );
				formData = null;
				// dyncomponent lazy laden, um den zirkulären Import zu vermeiden
				import( '../dyncomponent/dyncomponent.component' ).then(
					m => this.dynComponentType.set( m.XiriDynComponentComponent )
				);
			} else {
				this.formValid.set( true );
				formData = inFields as XiriFormField[];
			}
			
			this.formFields.set( formData );

			if ( this.type() == 'waiting' ) {
				this.dialogRef.disableClose = true;
				this.refreshTime = res.time || 2000;
				// formData.done = false;
				// this.formFields.set( formData );
				this.refresh();
			}
			
		} else if ( res.done ) {
			
			this.done.set( true );
			this.formFields.set( null );

			this.type.set( '' );
			setTimeout( () => {
				this.dialogRef.close( res );
			}, 1000 );
		} else {
			this.dialogRef.close( res );
		}
		
		this.loading.set( false );
	}
	
	private refresh() {
		
		this.to = setTimeout( () => {
			this.to = null;
			
			this.dataService.get( this.url ).pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe(
				{
					next: ( res: XiriDialogResponse ) => {
						if ( res.done ) {
							if ( res.error ) {
								this.dialogRef.disableClose = false;
								this.error.set( res.error );
								this.formFields.set( null );
								this.snackbar.error( res.error );
							} else {
								this.url = res.url;
								this.extra = res;
								this.download( null );
							}
						} else
							this.refresh();
					},
					error: ( err ) => {
						console.log( "dialog refresh error", err );
						this.snackbar.error( err.error?.error || 'Unknown Error' );
						
						if ( this.refreshTime < 10000 )
							this.refreshTime += 2000;
						this.refresh();
					}
				} );
		}, this.refreshTime );
	}
	
	public download( data: unknown ) {

		if ( data === null ) {
			// TODO: fix, this is actually an external link
			
			const file = window.open( this.dataService.getConfigApi() + this.url, 'Report' );
			if ( file === null || typeof ( file ) == 'undefined' ) {
				this.buttons.set( [ {
					text: 'Download',
					action: 'download',
					type: 'raised',
					default: true,
				} ] );
			} else
				this.dialogRef.close( this.extra );
			
			return;
		}
		
		this.dataService.postFileResponse( this.url, data )
			.pipe( takeUntilDestroyed( this.destroyRef ) )
			.subscribe(
					{
						next: ( result ) => {

							const ret = this.downloadService.download( result, 'Report', false );
							if ( !ret )
								this.buttons.set( [ {
									text: 'Download',
									action: 'href',
									type: 'raised',
									default: true,
									url: this.url
								} ] );
							else
								this.dialogRef.close( this.extra );
							
						}, error: ( err: HttpErrorResponse ) => {
							this.snackbar.error( err.error?.error || 'Unknown Error' );
						}
					}
				);
	}
	
	clickButton( button: XiriButton ): void {

		if ( button.default && !this.formValid() )
			return;

		if ( button.action == 'close' )
			this.dialogRef.close( null );
		else if ( button.action == 'return' )
			this.dialogRef.close( {
				                      valid: this.formValid(),
				                      values: this.formValues
			                      } );
		else if ( button.action == 'get' ) {
			this.url = button.url ? button.url : '';
			this.startSend( null );
		} else if ( button.action == 'post' ) {
			this.url = button.url ? button.url : '';
			this.startSend( button.data );
		} else if ( button.action == 'download' ) {
			this.download( this.type() == 'form' ? this.formValues : null );
		} else if ( button.action == 'link' ) {
			this.router.navigate( [ button.url ] ).then();
		} else if ( button.action == 'href' ) {
			window.location.href = button.url;
		} else {
			if ( this.loading() )
				return;

			if ( this.type() == 'form' )
				this.startSend( this.formValues );
			else
				this.startSend( [] );
		}
	}
	
	private startSend( data: unknown ): void {

		setTimeout( () => {
			if ( this.formValid() )
				this.send( data );
			else
				this.checkSubject.next();
		}, 10 );
	}

	public formChanged( event: { valid: boolean; value: Record<string, unknown> | null } ) {

		this.formValid.set( event.valid );
		this.formValues = event.value;
	}
	
	ngOnDestroy() {
		if ( this.to )
			clearTimeout( this.to );
	}
}
