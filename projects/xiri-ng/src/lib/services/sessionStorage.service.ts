import { Injectable } from '@angular/core';


@Injectable( {
	             providedIn: 'root'
             } )
export class XiriSessionStorageService {
	
	private readonly isSupported: boolean = false;
	private data: Record<string, XiriStorageEntry> = {};

	constructor() {

		if ( window.sessionStorage )
			this.isSupported = true;
	}

	public clear() {

		this.data = {};
		if ( this.isSupported )
			sessionStorage.clear();
	}

	public set( name: string, value: unknown ) {

		const val = {
			time: Date.now(),
			value: value,
		}

		this.data[ name ] = val;
		if ( this.isSupported )
			sessionStorage.setItem( name, JSON.stringify( val ) );
	}

	private getStruct( name: string ): XiriStorageEntry | null {

		if ( this.data[ name ] )
			return this.data[ name ];
		
		if ( this.isSupported ) {
			const valstr = sessionStorage.getItem( name );
			if ( valstr ) {
				const val = JSON.parse( valstr ) as XiriStorageEntry;
				this.data[ name ] = val;
				return val;
			}
		}

		return null;
	}

	public remove( name: string ) {

		delete this.data[ name ];
		if ( this.isSupported )
			sessionStorage.removeItem( name );
	}

	public get( name: string ): unknown {

		const val = this.getStruct( name );
		if ( !val )
			return null;

		return val.value;
	}

	/**
	 * @param name
	 * @param maxTime in seconds
	 */
	public getTimeout( name: string, maxTime: number ): unknown {

		const val = this.getStruct( name );
		if ( !val )
			return null;

		if ( val.time < Date.now() - maxTime * 1000 ) {
			this.remove( name );
			return null;
		}

		return val.value;
	}

}

interface XiriStorageEntry {
	time: number;
	value: unknown;
}
