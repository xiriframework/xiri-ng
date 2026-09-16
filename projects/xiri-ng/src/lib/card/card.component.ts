import { Component, computed, effect, forwardRef, inject, input, linkedSignal, signal, Signal } from '@angular/core';
import { XiriResponseHandlerService, XiriPanelHost, XIRI_PANEL_HOST } from '../services/response-handler.service';
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
	flat?: boolean    // Ohne Schatten/Hintergrund/Radius; Header nur wenn er Inhalt hat.
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
	            providers: [ { provide: XIRI_PANEL_HOST, useExisting: forwardRef( () => XiriCardComponent ) } ],
            } )
export class XiriCardComponent implements XiriPanelHost {

	private dataService = inject( XiriDataService );
	private responseHandler = inject( XiriResponseHandlerService );
	// Nächste äußere Card (Provider dieser Card übersprungen). Ziel für refresh:'panel', wenn diese Card keine url hat.
	private parentPanel = inject( XIRI_PANEL_HOST, { optional: true, skipSelf: true } );
	// Ein während eines laufenden Loads angeforderter Reload wird nachgeholt, sobald der Load fertig ist.
	// Signal, kein Boolean: der Effect muss darauf reagieren, wenn es gesetzt wird.
	private pendingReload = signal( false );

	settings = input.required<XiriCardSettings>();

	// Bei flat nur rendern, wenn der Header Inhalt hat; sonst bliebe eine leere 32px-Leiste.
	showHeader = computed( () => {
		const s = this.card();
		return !s.flat || !!( s.header || s.headerSub || s.headerIcon || s.buttonsTop?.buttons?.length
			|| s.collapsible || ( s.reload && s.url ) );
	} );

	isCollapsed = linkedSignal<boolean | undefined, boolean>( {
		source: () => this.card().collapsed,
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

	// value() wirft im Fehlerzustand (ResourceValueError) – deshalb nur nach hasValue() lesen.
	private _raw = computed<unknown>( () => this.cardResource.hasValue() ? this.cardResource.value() : undefined );

	/** Komplette Card aus der aktuellen Antwort: Top-Level-Schlüssel `card` mit Objektwert. Sonst null. */
	private responseCard = computed<XiriCardSettings | null>( () => {
		const r = this._raw() as { card?: unknown } | null | undefined;
		const c = r && typeof r === 'object' && !Array.isArray( r ) ? r.card : undefined;
		return c && typeof c === 'object' && !Array.isArray( c ) ? c as XiriCardSettings : null;
	} );

	/**
	 * Zuletzt erfolgreich geladene komplette Card. Bleibt bei Reload-Fehler stehen (keine Antwort vorhanden),
	 * wird bei url-Wechsel und bei einer erfolgreichen Zeilen-Antwort ({data: rows}) geleert.
	 */
	private loadedCard = linkedSignal<{ url: string | undefined; card: XiriCardSettings | null; hasValue: boolean },
		XiriCardSettings | null>( {
		source: () => ( { url: this.settings().url, card: this.responseCard(), hasValue: this._raw() != null } ),
		computation: ( s, prev ) => {
			if ( s.card ) return s.card;
			if ( s.hasValue ) return null;
			return prev && prev.source.url === s.url ? prev.value : null;
		},
	} );

	/** Inhaltszeilen aus einer Nicht-Card-Antwort: {data: rows} → rows, sonst die Antwort selbst. */
	private _loaded = computed( () => {
		if ( this.loadedCard() ) return undefined;
		const res = this._raw();
		if ( res == null ) return res;
		return ( res as { data?: unknown } ).data ?? res;
	} );

	/** settings(), überlagert von einer nachgeladenen kompletten Card. Inhaltsfelder kommen dann nur aus der Antwort. */
	card = computed<XiriCardSettings>( () => {
		const s = this.settings();
		const c = this.loadedCard();
		if ( !c ) return s;
		return { ...s, ...c, fields: c.fields, data: c.data, dense: c.dense, components: c.components,
			showHeader: c.showHeader, forceMinWidth: c.forceMinWidth };
	} );

	cardData = computed( () => this.loadedCard() ? this.loadedCard()!.data : ( this._loaded() ?? this.settings().data ) );

	/** Skeleton nur, solange noch nie etwas geladen wurde (auch nicht gepuffert) und kein statischer Inhalt da ist. */
	showSkeleton = computed( () => this.loading() && this._raw() == null && !this.loadedCard()
		&& this.settings().data == null && !( this.settings().components?.length ) );

	hasComponents = computed( () => ( this.card().components?.length ?? 0 ) > 0 );

	/** Resolves padding setting (token or free CSS value) into a CSS length string. */
	componentsPadding = computed<string>( () => {
		const v = this.card().padding;
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
			fields: this.card().fields,
			dense: this.card().dense,
			forceMinWidth: this.card().forceMinWidth,
			showHeader: this.card().showHeader,
		};

		if ( !this.card().fields && ( data as { length?: number } ).length !== 0 ) {

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

	/** Klick irgendwo im Header toggelt; Buttons/Links (Collapse, Reload, buttonsTop) behalten ihre eigene Aktion. */
	onHeaderClick( event: MouseEvent ): void {
		if ( !this.card().collapsible ) return;
		if ( ( event.target as HTMLElement ).closest( 'button, a' ) ) return;
		this.toggleCollapse();
	}

	reload() {
		if ( this.loading() ) return;
		this.cardResource.reload();
	}

	constructor() {
		// pendingReload zuerst lesen, damit beide Signale als Abhängigkeit registriert sind.
		effect( () => {
			const pending = this.pendingReload();
			const loading = this.cardResource.isLoading();
			if ( pending && !loading ) {
				this.pendingReload.set( false );
				this.cardResource.reload();
			}
		} );
	}

	/** refresh:'panel' aus Button/Tabelle in dieser Card. Ohne url: äußere Card, sonst Page-Reload. */
	reloadPanel(): void {
		if ( !this.settings().url ) {
			if ( this.parentPanel )
				this.parentPanel.reloadPanel();
			else
				this.responseHandler.handle( { refresh: 'page' } );
			return;
		}
		// reload() gibt false zurück, solange der erste Load läuft – dann nachholen.
		// ponytail: bei url-Wechsel während pending läuft danach ein Reload zu viel; harmlos.
		if ( !this.cardResource.reload() )
			this.pendingReload.set( true );
	}

}
