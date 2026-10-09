import { inject, Injectable, InjectionToken } from '@angular/core';
import { Router } from '@angular/router';


interface XiriHandlerResponse {
	page?: string;
	refresh?: string;
	table?: string;
	goto?: string;
	update?: string;
	id?: unknown;
	field?: unknown;
	content?: unknown;
}

/**
 * Nächstgelegener Panel-Container eines Auslösers: eine xiri-card oder ein mat-expansion-panel (Directive
 * xiriExpansionPanel). Beide stellen sich per Provider bereit; Button und Tabelle injizieren den Token optional
 * und rufen bei refresh:'panel' reloadPanel().
 */
export interface XiriPanelHost {
	reloadPanel(): void;
}

export const XIRI_PANEL_HOST = new InjectionToken<XiriPanelHost>( 'XIRI_PANEL_HOST' );

/**
 * Umschließende xiri-table eines xiri-button (Kopf-Buttons, Empty-State). Der Button gibt refreshTable() und
 * onTableUpdate() als Callbacks an den Handler; ohne Tabelle fällt refresh:'table' auf einen Page-Reload zurück.
 */
export interface XiriTableHost {
	refreshTable(): void;
	onTableUpdate( id: unknown, field: string, content: unknown ): void;
}

export const XIRI_TABLE_HOST = new InjectionToken<XiriTableHost>( 'XIRI_TABLE_HOST' );

@Injectable( {
	             providedIn: 'root',
             } )
export class XiriResponseHandlerService {

	private router = inject( Router );

	handle( result: unknown, callbacks?: {
		onTableRefresh?: () => void;
		onTableUpdate?: ( id: unknown, field: string, content: unknown ) => void;
		onPanelRefresh?: () => void;
	} ): void {
		if ( !result )
			return;
		const res = result as XiriHandlerResponse;
		// goto zuerst: Eine InlineEdit-Antwort kann refresh und goto tragen, ein Refresh vor dem Verlassen wäre verschwendet.
		if ( res.goto )
			this.router.navigate( [ res.goto ] ).then();
		else if ( res.page == 'refresh' || res.refresh == 'page' )
			this.router.navigate( [ this.router.url ] ).then();
		else if ( res.table == 'refresh' || res.refresh == 'table' ) {
			if ( callbacks?.onTableRefresh )
				callbacks.onTableRefresh();
			else
				this.router.navigate( [ this.router.url ] ).then();
		}
		else if ( res.refresh == 'panel' )
			callbacks?.onPanelRefresh?.();
		else if ( res.table == 'update' || res.update == 'table' )
			callbacks?.onTableUpdate?.( res.id, res.field as string, res.content );
	}
}
