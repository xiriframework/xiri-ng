import { computed, Directive, forwardRef, inject, Injector, input } from '@angular/core';
import { XiriResponseHandlerService, XiriPanelHost, XIRI_PANEL_HOST } from '../services/response-handler.service';
import { createPanelLoader } from '../services/panel-loader';
import { XiriExpansionPanelSettings } from './expansion.component';

/**
 * Macht ein mat-expansion-panel zum Panel-Host für refresh:'panel' und lädt es bei gesetzter url nach.
 * Sitzt als Directive direkt auf dem Material-Panel, damit der Element-Injector des Panels den Token trägt:
 * Header-Buttons und (über ngTemplateOutletInjector) der Inhalt finden so genau dieses Panel.
 */
@Directive( {
	            selector: 'mat-expansion-panel[xiriExpansionPanel]',
	            exportAs: 'xiriExpansionPanel',
	            providers: [ { provide: XIRI_PANEL_HOST, useExisting: forwardRef( () => XiriExpansionPanelDirective ) } ],
            } )
export class XiriExpansionPanelDirective implements XiriPanelHost {

	/**
	 * Shell-Settings des Panels aus XiriExpansionSettings.panels. Nicht `required`: der Loader-Effect einer Directive
	 * läuft in der Host-View und kann vor dem ersten Setzen der Inputs feuern (NG0950) – der leere Default hat keine url.
	 */
	settings = input<XiriExpansionPanelSettings>( { title: '', data: [] }, { alias: 'xiriExpansionPanel' } );

	/** Element-Injector des Panels – als ngTemplateOutletInjector für den Inhalt, sonst löst der über die deklarierende View auf. */
	injector = inject( Injector );

	private responseHandler = inject( XiriResponseHandlerService );
	// Nächster äußerer Host (z. B. eine url-Card um das Akkordeon). Ziel für refresh:'panel', wenn dieses Panel keine url hat.
	// Innerhalb eingebetteter Views überspringt skipSelf Zwischenknoten – ein Reload landet dann höchstens zu grob, nie falsch.
	private parentPanel = inject( XIRI_PANEL_HOST, { optional: true, skipSelf: true } );

	// ponytail: lädt beim Init, unabhängig von lazy. Upgrade: params erst setzen, wenn das Panel zum ersten Mal offen war.
	private loader = createPanelLoader<XiriExpansionPanelSettings>( { url: () => this.settings().url, key: 'panel' } );

	loading = this.loader.loading;
	errorMsg = this.loader.errorMsg;

	/**
	 * Shell, überlagert von title/description/icon/buttons/data der letzten Antwort.
	 * expanded/disabled/lazy/unload bleiben Shell-Werte – sonst klappte ein Reload ohne `expanded` das Panel zu.
	 */
	panel = computed<XiriExpansionPanelSettings>( () => {
		const s = this.settings();
		const l = this.loader.loaded();
		if ( !l ) return s;
		return { ...s, title: l.title, description: l.description, icon: l.icon, buttons: l.buttons, data: l.data ?? [] };
	} );

	/** Skeleton nur, solange noch nie etwas geladen wurde (auch nicht gepuffert) und die Shell keinen Inhalt hat. */
	showSkeleton = computed( () => this.loading() && this.loader.raw() == null && !this.loader.loaded()
		&& !( this.settings().data?.length ) );

	/** refresh:'panel' aus Header-Button, Inhalt oder Tabelle in diesem Panel. Ohne url: äußerer Host, sonst Page-Reload. */
	reloadPanel(): void {
		if ( !this.settings().url ) {
			if ( this.parentPanel )
				this.parentPanel.reloadPanel();
			else
				this.responseHandler.handle( { refresh: 'page' } );
			return;
		}
		this.loader.reloadOrQueue();
	}
}
