import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, inject, input, OnDestroy, signal, Signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { XiriButton } from "../button/button.component";
import { XiriButtonlineSettings, XiriButtonlineComponent } from "../buttonline/buttonline.component";
import { XiriColor } from '../types/color.type';
import { XiriRawTableSettings, XiriRawTableComponent } from "../raw-table/xiri-raw-table.component";
import { XiriTableField } from "../raw-table/tabefield.interface";
import { XiriDataService } from '../services/data.service';
import { XiriSkeletonComponent } from '../skeleton/skeleton.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import {
	MatCard,
	MatCardHeader,
	MatCardAvatar,
	MatCardTitle,
	MatCardSubtitle,
	MatCardContent,
	MatCardActions
} from '@angular/material/card';

export interface XiriCardSettings {
	url?: string
	reload?: boolean
	data?: any
	fields?: XiriTableField[]
	header?: string
	headerSub?: string
	headerIcon?: string
	headerIconColor?: XiriColor
	buttons?: XiriButton[] // TODO: remove
	buttonsTop?: XiriButtonlineSettings
	buttonsBottom?: XiriButtonlineSettings
	dense?: number
	forceMinWidth?: boolean
	collapsible?: boolean
	collapsed?: boolean
	maxHeight?: string
}

@Component( {
	            selector: 'xiri-card',
	            templateUrl: './card.component.html',
	            styleUrl: './card.component.scss',
	            imports: [ MatCard,
	                       MatCardHeader,
	                       MatCardAvatar,
	                       MatIcon,
	                       MatIconButton,
	                       MatCardTitle,
	                       MatCardSubtitle,
	                       XiriButtonlineComponent,
	                       MatCardContent,
	                       XiriRawTableComponent,
	                       XiriSkeletonComponent,
	                       MatCardActions ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriCardComponent implements OnDestroy {

	private dataService = inject( XiriDataService );
	private cdr = inject( ChangeDetectorRef );
	private subs = new Subscription();

	settings = input.required<XiriCardSettings>();

	loading = signal<boolean>( false );
	errorMsg = signal<string>( '' );
	isCollapsed = signal<boolean>( false );
	private _data = signal<any>( null );

	cardData = computed( () => this._data() ?? this.settings().data );

	rawTable: Signal<XiriRawTableSettings | null> = computed( () => {

		const data = this.cardData();
		if ( data == null ) return null;

		let rt: XiriRawTableSettings = {
			data: data,
			fields: this.settings().fields,
			dense: this.settings().dense,
			forceMinWidth: this.settings().forceMinWidth,
		};

		if ( !this.settings().fields && data.length !== 0 ) {

			let fields: XiriTableField[] = [];
			if ( Array.isArray( data ) ) {
				fields.push( {
					             id: '0',
					             name: '0',
					             format: 'text',
					             display: 'info',
					             minWidth: '30px',
				             } );
				fields.push( {
					             id: '1',
					             name: '1',
					             format: 'html',
					             display: 'right',
					             minWidth: '30px',
				             } );
			} else {

				fields.push( {
					             id: 'f0',
					             name: 'f0',
					             format: 'text',
					             display: 'info',
					             minWidth: '30px',
				             } );
				fields.push( {
					             id: 'f1',
					             name: 'f1',
					             format: 'html',
					             display: 'right',
					             minWidth: '30px',
				             } );

				let transformedData = [];
				for ( let key in data ) {
					if ( data.hasOwnProperty( key ) ) {
						transformedData.push( {
							                      'f0': key,
							                      'f1': data[ key ],
						                      } );
					}
				}

				rt.data = transformedData;
			}

			rt.fields = fields;
		}

		return rt;
	} );

	constructor() {
		effect( () => {
			const s = this.settings();
			if ( s.collapsed !== undefined ) {
				this.isCollapsed.set( s.collapsed );
			}
		} );
		effect( () => {
			const url = this.settings().url;
			if ( url ) {
				this.loadData();
			}
		} );
	}

	toggleCollapse(): void {
		this.isCollapsed.update( v => !v );
	}

	private loadData() {
		this.loading.set( true );
		this.errorMsg.set( '' );
		this.subs.add(
			this.dataService.post( this.settings().url!, null ).subscribe( {
				next: ( res ) => {
					this._data.set( res.data ?? res );
					this.loading.set( false );
					this.cdr.markForCheck();
				},
				error: ( err ) => {
					this.errorMsg.set( err.error?.error || 'Fehler beim Laden' );
					this.loading.set( false );
					this.cdr.markForCheck();
				}
			} )
		);
	}

	reload() {
		if ( this.loading() ) return;
		this.loadData();
	}

	ngOnDestroy() {
		this.subs.unsubscribe();
	}

}
