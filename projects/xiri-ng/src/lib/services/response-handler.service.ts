import { inject, Injectable } from '@angular/core';
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

@Injectable( {
	             providedIn: 'root',
             } )
export class XiriResponseHandlerService {

	private router = inject( Router );

	handle( result: unknown, callbacks?: {
		onTableRefresh?: () => void;
		onTableUpdate?: ( id: unknown, field: string, content: unknown ) => void;
	} ): void {
		if ( !result )
			return;
		const res = result as XiriHandlerResponse;
		if ( res.page == 'refresh' || res.refresh == 'page' )
			this.router.navigate( [ this.router.url ] ).then();
		else if ( res.table == 'refresh' || res.refresh == 'table' ) {
			if ( callbacks?.onTableRefresh )
				callbacks.onTableRefresh();
			else
				this.router.navigate( [ this.router.url ] ).then();
		}
		else if ( res.goto )
			this.router.navigate( [ res.goto ] ).then();
		else if ( res.table == 'update' || res.update == 'table' )
			callbacks?.onTableUpdate?.( res.id, res.field as string, res.content );
	}
}
