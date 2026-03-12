import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnDestroy, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { XiriDialogComponent } from "../dialog/dialog.component";
import { XiriColor } from '../types/color.type';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { XiriDataService } from "../services/data.service";
import { RouterLink } from "@angular/router";
import { Location } from "@angular/common";
import { XiriButtonstyleComponent } from "../buttonstyle/buttonstyle.component";
import { XiriDownloadService } from "../services/download.service";
import { XiriResponseHandlerService } from "../services/response-handler.service";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";


export interface XiriButton {
	text: string
	type: string
	action: string
	
	default?: boolean
	url?: string
	hide?: boolean
	color?: XiriColor
	icon?: string
	iconColor?: XiriColor
	fontIcon?: string
	fontSet?: string
	class?: string
	hint?: string
	tabIndex?: number
	inline?: boolean
	disabled?: boolean
	
	data?: any
	target?: string
	loading?: boolean
	filename?: string
	
	// send btns
	check?: any
	send?: any

	// menu items (for action "menu")
	menuItems?: { action: string, url?: string, icon?: string, color?: string, text?: string, data?: any }[]
}

export interface XiriButtonResult {
	button: XiriButton
	result: any
	done: boolean
	loading: boolean
}


@Component( {
	            selector: 'xiri-button',
	            templateUrl: './button.component.html',
	            styleUrl: './button.component.scss',
	            imports: [
		            XiriButtonstyleComponent,
		            RouterLink,
		            MatMenu, MatMenuItem, MatMenuTrigger,
		            MatIcon, MatIconButton, MatTooltip
	            ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriButtonComponent implements OnDestroy {
	button = input.required<XiriButton>();
	disabled = input<boolean>( false );
	filterData = input<any>( undefined );
	url = input<string>( undefined );
	
	// 		if ( JSON.stringify( this._filterData ) === JSON.stringify( values ) )
	// 			return;
	
	result = output<XiriButtonResult>();
	
	private dialogRef?: MatDialogRef<any> = undefined;
	private destroyRef = inject( DestroyRef );
	protected loading = signal<boolean>( false );
	
	private dataService = inject( XiriDataService );
	private location = inject( Location );
	private dialog = inject( MatDialog );
	private downloadService = inject( XiriDownloadService );
	private responseHandler = inject( XiriResponseHandlerService );
	
	_disabled = computed( () => {
		
		if ( this.filterData() === null )
			return true;
		else if ( this.button().disabled )
			return true;
		else if ( this.loading() )
			return true;
		
		return this.disabled();
	} );
	
	_url = computed( () => {
		if ( this.url() )
			return this.url();
		return this.button().url;
	} );
	
	clicked( event: MouseEvent ) {
		
		event.stopPropagation();
		
		if ( this._disabled() ) {
			this.result.emit( {
				                  button: this.button(),
				                  result: null,
				                  done: false,
				                  loading: false,
			                  } );
			return;
		}
		
		switch ( this.button().action ) {
			case 'link':
			case 'href':
			case 'close':
			case 'return':
				this.result.emit( {
					                  button: this.button(),
					                  result: null,
					                  done: true,
					                  loading: false,
				                  } );
				break;
			case 'dialog':
				this.actionDialog();
				break;
			case 'api':
				this.actionApi();
				break;
			case 'download':
				this.actionDownload();
				break;
			case 'back':
				this.location.back();
				break;
			case 'debug':
			case 'simulate':
				this.result.emit( {
					                  button: this.button(),
					                  result: true,
					                  done: true,
					                  loading: false,
				                  } );
				break;
			default:
				console.log( "xiri-button unknown action", this.button().action );
		}
	}
	
	private actionDialog( dialogData?: any ) {

		let data: any;
		if ( dialogData ) {
			data = dialogData;
		} else {
			data = <any> Object.assign( {}, this.button() );
			data.type = 'load';
		}
		data.filter = this.filterData();

		this.loading.set( true );

		this.dialogRef = this.dialog.open( XiriDialogComponent, {
			data: data,
		} );

		this.dialogRef.afterClosed().pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe( result => {
			this.responseHandler.handle( result );
			this.loading.set( false );
			this.result.emit( {
				                  button: this.button(),
				                  result: result,
				                  done: true,
				                  loading: false,
			                  } );
		} );
	}

	openMenuDialog( event: MouseEvent, item: any ) {
		event.stopPropagation();
		let data = <any> Object.assign( {}, item );
		data.type = 'load';
		this.actionDialog( data );
	}
	
	private actionApi() {
		
		let data = { ...this.filterData(), ...this.button().data };
		this.loading.set( true );
		
		this.result.emit( {
			                  button: this.button(),
			                  result: null,
			                  done: false,
			                  loading: true,
		                  } );
		
		this.dataService.post( this.button().url, data )
			.pipe( takeUntilDestroyed( this.destroyRef ) )
			.subscribe( {
				            next: ( result: any ) => {
						            this.responseHandler.handle( result );
						            this.result.emit( {
							                              button: this.button(),
							                              result: result,
							                              done: true,
							                              loading: false,
						                              } );
						            this.loading.set( false );
					            },
					            error: ( err: any ) => {
						            console.log( "xiri-button api error", err );
						            this.result.emit( {
							                              button: this.button(),
							                              result: null,
							                              done: true,
							                              loading: false,
						                              } );
						            this.loading.set( false );
					            }
				            } );
	}

	private actionDownload() {

		let data = { ...this.filterData(), ...this.button().data };
		this.loading.set( true );

		this.dataService.postFileResponse( this._url(), data )
			.pipe( takeUntilDestroyed( this.destroyRef ) )
			.subscribe(
					{
						next: ( result: any ) => {
							
							let filename: string;
							if ( this.button().filename != undefined )
								filename = this.button().filename;
							else
								filename =
									( this.button().text != undefined ? this.button().text : 'Download' ) + '.csv'
							
							this.downloadService.download( result, filename, false );
							
							this.result.emit( {
								                  button: this.button(),
								                  result: result,
								                  done: true,
								                  loading: false,
							                  } );
							this.loading.set( false );
						},
						error: ( err: any ) => {
							console.log( "xiri-button download error", err );
							this.result.emit( {
								                  button: this.button(),
								                  result: null,
								                  done: true,
								                  loading: false,
							                  } );
							this.loading.set( false );
						}
					} );
	}

	ngOnDestroy(): void {
		if ( this.dialogRef ) {
			this.dialogRef.close( null );
		}
	}
}
