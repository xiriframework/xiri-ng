import { Injectable } from '@angular/core';
import { XiriStorageServiceBase } from './storage-base';


@Injectable( {
	             providedIn: 'root'
             } )
export class XiriLocalStorageService extends XiriStorageServiceBase {

	constructor() {
		super( window.localStorage );
	}

}
