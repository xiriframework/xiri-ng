import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, OnDestroy, output, signal } from '@angular/core';
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
	// When true, the button triggers its action automatically once on load,
	// as soon as it is no longer disabled (i.e. filter is valid/present).
	autoLoad?: boolean

	data?: Record<string, unknown>
	target?: string
	loading?: boolean
	filename?: string

	// send btns
	check?: string[]
	send?: string[]

	// menu items (for action "menu")
	menuItems?: { action: string, url?: string, icon?: string, color?: string, text?: string, data?: Record<string, unknown> }[]
}

export interface XiriButtonResult {
	button: XiriButton
	result: unknown
	done: boolean
	loading: boolean
}

// Backend response handled by the button (api result, dialog afterClosed result or poll tick).
export interface XiriButtonResponse {
	poll?: number
	pollUrl?: string
	text?: string
	button?: Partial<XiriButton>
	[ key: string ]: unknown
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
	filterData = input<Record<string, unknown> | null | undefined>( undefined );
	url = input<string | undefined>( undefined );
	
	// 		if ( JSON.stringify( this._filterData ) === JSON.stringify( values ) )
	// 			return;
	
	result = output<XiriButtonResult>();
	
	private dialogRef?: MatDialogRef<XiriDialogComponent> = undefined;
	private destroyRef = inject( DestroyRef );
	protected loading = signal<boolean>( false );
	// Guards the one-shot auto-load trigger (see constructor) so it fires only once.
	private _autoTriggered = false;

	// Self-polling: when a processed response (api result or dialog afterClosed) contains a
	// "poll" interval (ms), the button keeps GET-polling "pollUrl" until a response without
	// "poll" arrives, showing a countdown inside the button.
	private pollTimer?: ReturnType<typeof setTimeout>;
	private countdownTimer?: ReturnType<typeof setInterval>;
	protected polling = signal<{ intervalMs: number; nextAt: number; url: string; text?: string } | null>( null );
	private _now = signal<number>( Date.now() );
	protected countdown = computed<number>( () => {
		const p = this.polling();
		if ( !p )
			return 0;
		const secs = Math.ceil( ( p.nextAt - this._now() ) / 1000 );
		return secs > 0 ? secs : 0;
	} );
	// Optional backend-defined label shown in the button while polling (overrides the countdown).
	protected pollText = computed<string>( () => this.polling()?.text ?? '' );

	// Backend-driven overrides applied to the button via a "button" patch in a response
	// (text, color, icon, type, hint, disabled). Persists until the next action starts.
	private buttonOverride = signal<Partial<XiriButton> | null>( null );
	protected displayButton = computed<XiriButton>( () => {
		const o = this.buttonOverride();
		return o ? { ...this.button(), ...o } : this.button();
	} );
	
	private dataService = inject( XiriDataService );
	private location = inject( Location );
	private dialog = inject( MatDialog );
	private downloadService = inject( XiriDownloadService );
	private responseHandler = inject( XiriResponseHandlerService );
	
	_disabled = computed( () => {
		
		if ( this.filterData() === null )
			return true;
		else if ( this.displayButton().disabled )
			return true;
		else if ( this.loading() )
			return true;

		return this.disabled();
	} );
	
	_url = computed( () => {
		if ( this.url() )
			return this.url();
		return this.displayButton().url;
	} );

	constructor() {
		// Auto-load: when the button opts in via autoLoad, run its action once as soon
		// as it becomes enabled (filter valid/present). Subsequent filter changes do not
		// re-trigger it — only the initial load is automatic.
		effect( () => {
			this.filterData(); // track filter changes so the effect re-evaluates
			if ( this.button().autoLoad && !this._autoTriggered && !this._disabled() ) {
				this._autoTriggered = true;
				this.runAction();
			}
		} );
	}

	clicked( event: MouseEvent ) {
		event.stopPropagation();
		this.runAction();
	}

	private runAction() {

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
	
	private actionDialog( dialogData?: Record<string, unknown> ) {

		let data: Record<string, unknown>;
		if ( dialogData ) {
			data = dialogData;
		} else {
			data = Object.assign( {}, this.button() ) as unknown as Record<string, unknown>;
			data['type'] = 'load';
		}
		data['filter'] = this.filterData();

		this.buttonOverride.set( null );
		this.loading.set( true );

		this.dialogRef = this.dialog.open( XiriDialogComponent, {
			data: data,
		} );

		this.dialogRef.afterClosed().pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe( result => {
			this.processResult( result );
		} );
	}

	openMenuDialog( event: MouseEvent, item: Record<string, unknown> ) {
		event.stopPropagation();
		const data = Object.assign( {}, item ) as Record<string, unknown>;
		data['type'] = 'load';
		this.actionDialog( data );
	}
	
	private actionApi() {

		const data = { ...this.filterData(), ...this.button().data };
		this.buttonOverride.set( null );
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
				            next: ( result: unknown ) => {
						            this.processResult( result as XiriButtonResponse );
					            },
					            error: ( err: unknown ) => {
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

	// Decides what to do with a response (api result or dialog afterClosed result):
	// poll present → keep polling; otherwise → final handling (snackbar/refresh/goto + emit).
	private processResult( result: XiriButtonResponse | null ) {
		if ( result && result.button )
			this.buttonOverride.set( { ...( this.buttonOverride() ?? {} ), ...result.button } );
		if ( result && result.poll && result.poll > 0 ) {
			this.startPolling( result.pollUrl || this.button().url, result.poll, result.text );
			return;
		}
		this.stopPolling();
		this.responseHandler.handle( result );
		this.result.emit( {
			                  button: this.button(),
			                  result: result,
			                  done: true,
			                  loading: false,
		                  } );
	}

	private startPolling( url: string, intervalMs: number, text?: string ) {
		this.cancelPollTimers();
		const now = Date.now();
		this.polling.set( { intervalMs, nextAt: now + intervalMs, url, text } );
		this._now.set( now );
		this.loading.set( true );
		this.pollTimer = setTimeout( () => {
			this.pollTimer = undefined;
			this.pollTick( url );
		}, intervalMs );
		this.countdownTimer = setInterval( () => this._now.set( Date.now() ), 1000 );
	}

	private pollTick( url: string ) {
		this.dataService.get( url )
			.pipe( takeUntilDestroyed( this.destroyRef ) )
			.subscribe( {
				            next: ( res: unknown ) => this.processResult( res as XiriButtonResponse ),
				            error: ( err: unknown ) => {
						            console.log( "xiri-button poll error", err );
						            this.stopPolling();
						            this.result.emit( {
							                              button: this.button(),
							                              result: null,
							                              done: true,
							                              loading: false,
						                              } );
					            }
			            } );
	}

	private cancelPollTimers() {
		if ( this.pollTimer ) {
			clearTimeout( this.pollTimer );
			this.pollTimer = undefined;
		}
		if ( this.countdownTimer ) {
			clearInterval( this.countdownTimer );
			this.countdownTimer = undefined;
		}
	}

	private stopPolling() {
		this.cancelPollTimers();
		this.polling.set( null );
		this.loading.set( false );
	}

	private actionDownload() {

		const data = { ...this.filterData(), ...this.button().data };
		this.loading.set( true );

		this.dataService.postFileResponse( this._url(), data )
			.pipe( takeUntilDestroyed( this.destroyRef ) )
			.subscribe(
					{
						next: ( result ) => {

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
						error: ( err: unknown ) => {
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
		this.stopPolling();
		if ( this.dialogRef ) {
			this.dialogRef.close( null );
		}
	}
}
