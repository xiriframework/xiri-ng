import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';


@Injectable( {
	             providedIn: 'root',
             } )
export class XiriResponseHandlerService {

	private router = inject( Router );

	handle( result: any, callbacks?: {
		onTableRefresh?: () => void;
		onTableUpdate?: ( id: any, field: string, content: any ) => void;
	} ): void {
		if ( !result )
			return;
		if ( result.page == 'refresh' || result.refresh == 'page' )
			this.router.navigate( [ this.router.url ] ).then();
		else if ( result.table == 'refresh' || result.refresh == 'table' ) {
			if ( callbacks?.onTableRefresh )
				callbacks.onTableRefresh();
			else
				this.router.navigate( [ this.router.url ] ).then();
		}
		else if ( result.goto )
			this.router.navigate( [ result.goto ] ).then();
		else if ( result.table == 'update' || result.update == 'table' )
			callbacks?.onTableUpdate?.( result.id, result.field, result.content );
	}
}
