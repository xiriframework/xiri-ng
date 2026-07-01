import { Component, computed, forwardRef, inject, input, linkedSignal, Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
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
	data?: unknown
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
            } )
export class XiriCardComponent {

	private dataService = inject( XiriDataService );

	settings = input.required<XiriCardSettings>();

	isCollapsed = linkedSignal<boolean | undefined, boolean>( {
		source: () => this.settings().collapsed,
		computation: ( collapsed, previous ) => collapsed ?? previous?.value ?? false,
	} );

	private cardResource = rxResource( {
		params: () => this.settings().url,
		stream: ( { params } ) => this.dataService.post( params, null ),
	} );

	loading = this.cardResource.isLoading;

	errorMsg = computed( () => {
		const e = this.cardResource.error() as { cause?: unknown } | undefined;
		if ( !e ) return '';
		const http = ( e.cause ?? e ) as { error?: { error?: string } };
		return http.error?.error || 'Fehler beim Laden';
	} );

	private _loaded = computed( () => {
		const res = this.cardResource.value();
		if ( res == null ) return res;
		return ( res as { data?: unknown } ).data ?? res;
	} );

	cardData = computed( () => this._loaded() ?? this.settings().data );

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

		const rt: XiriRawTableSettings = {
			data: data,
			fields: this.settings().fields,
			dense: this.settings().dense,
			forceMinWidth: this.settings().forceMinWidth,
			showHeader: this.settings().showHeader,
		};

		if ( !this.settings().fields && ( data as { length?: number } ).length !== 0 ) {

			const fields: XiriTableField[] = [];
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

				const transformedData = [];
				const record = data as Record<string, unknown>;
				for ( const key in record ) {
					if ( Object.prototype.hasOwnProperty.call( record, key ) ) {
						transformedData.push( {
							                      'f0': key,
							                      'f1': record[ key ],
						                      } );
					}
				}

				rt.data = transformedData;
			}

			rt.fields = fields;
		}

		return rt;
	} );

	toggleCollapse(): void {
		this.isCollapsed.update( v => !v );
	}

	reload() {
		if ( this.loading() ) return;
		this.cardResource.reload();
	}

}
