import { Injectable } from '@angular/core';
import { XiriStorageServiceBase } from './storage-base';


@Injectable( {
	             providedIn: 'root'
             } )
export class XiriSessionStorageService extends XiriStorageServiceBase {

	constructor() {
		super( window.sessionStorage );
	}

}
