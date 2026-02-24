import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogContent,
	MatDialogRef,
	MatDialogTitle
} from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
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


export interface XiriDialogSettings {
	url?: string
	size?: string
	
	type: "form" | "data" | "question" | "waiting" | "table"
	data?: any
	filter?: any
}

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
	                       XiriErrorComponent,
	                       XiriDoneComponent,
	                       MatDivider,
	                       MatDialogActions,
	                       XiriButtonstyleComponent ]
            } )
export class XiriDialogComponent implements OnDestroy {
	dialogRef = inject<MatDialogRef<XiriDialogComponent>>( MatDialogRef );
	initData = inject( MAT_DIALOG_DATA );
	private breakpointObserver = inject( BreakpointObserver );
	private dataService = inject( XiriDataService );
	private router = inject( Router );
	private snackbar = inject( XiriSnackbarService );
	
	
	type = signal('form');
	header = signal('');
	public buttons = signal<XiriButton[]>([]);
	private url = '';
	private extra = {};
	private subs: Subscription = new Subscription();
	
	private downloadService = inject( XiriDownloadService );
	
	public formFields = signal<XiriFormField[]>( null );
	public loading = signal<boolean>( true );
	public done = signal<boolean>( false );
	public error = signal<string>( '' );
	
	private formValues: any = null;
	public formValid = signal<boolean>(false);
	public checkSubject: Subject<void> = new Subject<void>();
	
	private to = null;
	private refreshTime = 2000;
	rawTable: XiriRawTableSettings;
	
	constructor() {
		
		this.subs.add( this.breakpointObserver
			               .observe( [ Breakpoints.XSmall, Breakpoints.Small ] )
			               .subscribe( ( state: BreakpointState ) => {
				               if ( state.matches )
					               this.dialogRef.updateSize( '90vw' );
				               else
					               this.dialogRef.updateSize( this.initData.size || '600px' );
			               } ) );
		
		if ( this.initData.url )
			this.url = this.initData.url;
		
		if ( this.initData.type == 'form' )
			this.loadData( this.initData );
		else if ( this.initData.type == 'data' )
			this.send( { data: this.initData.data } );
		else if ( this.initData.filter )
			this.send( this.initData.filter );
		else
			this.send( null );
		
	}
	
	private send( data: any ) {
		
		this.loading.set( true );
		this.error.set( '' );
		
		const req = data === null ?
		            this.dataService.get( this.url ) :
		            this.dataService.post( this.url, { ...data, ...this.extra } );
		
		// this.buttons = [];
		
		this.subs.add( req.subscribe(
			{
				next: ( res: any ) => {
					if ( res )
						this.loadData( res );
					else
						this.showError( { status: 500 } );
				},
				error: ( err ) => {
					this.showError( err );
				}
			} ) );
	}
	
	private showError( err: any ) {
		this.loading.set( false );
		
		if ( err.status == 400 || err.status == 424 ) {
			this.error.set( err.error.error || 'Format Error' );
		} else {
			if ( err.status == 403 )
				this.error.set( 'Access denied' );
			else
				this.error.set( 'Unknown error' );
		}
		
		// this.header = 'Error';
		if ( this.buttons().length == 0 ) {
			this.buttons.set( [ {
				text: 'Close',
				action: 'close',
				type: 'raised',
			} ] );
		}
	}
	
	private loadData( res: any ): void {
		
		if ( res.buttons ) {
			if ( res.url )
				this.url = res.url;
			
			let formData = [];
			let inFields = res.content || res.fields;
			const model = res.model || {};
			this.header.set( res.header );
			this.buttons.set( res.buttons );
			this.type.set( res.type ? res.type : 'form' );
			this.extra = res.extra || {};

			if ( this.type() == 'form' ) {
				inFields.forEach( ( field: any ) => {
					if ( field.hide == true )
						return;
					if ( model[ field.id ] !== undefined )
						field.value = model[ field.id ];
					
					formData.push( field );
				} );
			} else if ( this.type() == 'question' ) {
				inFields.type = 'question';
				formData.push( inFields );
				this.formValid.set( true );
			} else if ( this.type() == 'waiting' ) {
				inFields.type = 'waiting';
				inFields.done = false;
				inFields.value = inFields.text;
				formData.push( inFields );
			} else if ( this.type() == 'table' ) {
				this.rawTable = inFields;
				formData = [];
			} else {
				this.formValid.set( true );
				formData = inFields;
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
			
			this.subs.add( this.dataService.get( this.url ).subscribe(
				{
					next: ( res: any ) => {
						if ( res.done ) {
							// this.formData.done = true;
							// this.formData.text = res.blocked;
							this.url = res.url;
							this.extra = res;
							
							this.download( null );
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
				} ) );
		}, this.refreshTime );
	}
	
	public download( data: any ) {
		
		if ( data === null ) {
			// TODO: fix, this is actually an external link
			
			let file = window.open( this.dataService.getConfigApi() + this.url, 'Report' );
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
		
		this.subs.add(
			this.dataService.postFileResponse( this.url, data )
				.subscribe(
					{
						next: ( result: any ) => {

							let ret = this.downloadService.download( result, 'Report', false );
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
							
						}, error: ( err: any ) => {
							this.snackbar.error( err.error?.error || 'Unknown Error' );
						}
					}
				) );
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
	
	private startSend( data: any ): void {

		setTimeout( () => {
			if ( this.formValid() )
				this.send( data );
			else
				this.checkSubject.next();
		}, 10 );
	}

	public formChanged( event: any ) {

		this.formValid.set( event.valid );
		this.formValues = event.value;
	}
	
	ngOnDestroy() {
		this.subs.unsubscribe();
		if ( this.to )
			clearTimeout( this.to );
	}
}
