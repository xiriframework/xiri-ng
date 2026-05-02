import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, forwardRef, inject, input, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { XiriButton } from "../button/button.component";
import { XiriButtonlineSettings, XiriButtonlineComponent } from "../buttonline/buttonline.component";
import { XiriColor } from '../types/color.type';
import { XiriRawTableSettings, XiriRawTableComponent } from "../raw-table/xiri-raw-table.component";
import { XiriTableField } from "../raw-table/tabefield.interface";
import { XiriDataService } from '../services/data.service';
import { XiriSkeletonComponent } from '../skeleton/skeleton.component';
import { XiriDynData } from '../dyncomponent/dyndata.interface';
import { XiriDynComponentComponent } from '../dyncomponent/dyncomponent.component';
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
	components?: XiriDynData[]
	header?: string
	headerSub?: string
	headerIcon?: string
	headerIconColor?: XiriColor
	buttonsTop?: XiriButtonlineSettings
	buttonsBottom?: XiriButtonlineSettings
	dense?: number
	forceMinWidth?: boolean
	showHeader?: boolean
	collapsible?: boolean
	collapsed?: boolean
	maxHeight?: string
	padding?: string  // Token 'xs'|'sm'|'md'|'lg'|'xl' oder freier CSS-Wert ('16px', '1rem', 'var(--…)').
	                  // Wirkt nur im Multi-Component-Modus (settings.components).
	                  // Auf xs-Viewport (<576px) immer 8px.
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
	                       MatCardActions,
	                       forwardRef( () => XiriDynComponentComponent ) ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriCardComponent {

	private dataService = inject( XiriDataService );
	private destroyRef = inject( DestroyRef );

	settings = input.required<XiriCardSettings>();

	loading = signal<boolean>( false );
	errorMsg = signal<string>( '' );
	isCollapsed = signal<boolean>( false );
	private _data = signal<any>( null );

	cardData = computed( () => this._data() ?? this.settings().data );

	hasComponents = computed( () => ( this.settings().components?.length ?? 0 ) > 0 );

	/** Resolves padding setting (token or free CSS value) into a CSS length string. */
	componentsPadding = computed<string>( () => {
		const v = this.settings().padding;
		if ( !v ) return 'var(--xiri-spacing-md, 16px)';
		switch ( v ) {
			case 'xs': return 'var(--xiri-spacing-xs, 4px)';
			case 'sm': return 'var(--xiri-spacing-sm, 8px)';
			case 'md': return 'var(--xiri-spacing-md, 16px)';
			case 'lg': return 'var(--xiri-spacing-lg, 24px)';
			case 'xl': return 'var(--xiri-spacing-xl, 32px)';
			default:   return v; // freier CSS-Wert
		}
	} );

	rawTable: Signal<XiriRawTableSettings | null> = computed( () => {

		const data = this.cardData();
		if ( data == null ) return null;

		let rt: XiriRawTableSettings = {
			data: data,
			fields: this.settings().fields,
			dense: this.settings().dense,
			forceMinWidth: this.settings().forceMinWidth,
			showHeader: this.settings().showHeader,
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
		this.dataService.post( this.settings().url!, null )
			.pipe( takeUntilDestroyed( this.destroyRef ) )
			.subscribe( {
				next: ( res ) => {
					this._data.set( res.data ?? res );
					this.loading.set( false );
				},
				error: ( err ) => {
					this.errorMsg.set( err.error?.error || 'Fehler beim Laden' );
					this.loading.set( false );
				}
			} );
	}

	reload() {
		if ( this.loading() ) return;
		this.loadData();
	}

}
