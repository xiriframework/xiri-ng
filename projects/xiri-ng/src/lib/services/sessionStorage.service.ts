import { Injectable } from '@angular/core';


@Injectable( {
	             providedIn: 'root'
             } )
export class XiriSessionStorageService {
	
	private readonly isSupported: boolean = false;
	private data: { [ name: string ]: any } = {};
	
	constructor() {
		
		if ( window.sessionStorage )
			this.isSupported = true;
	}
	
	public clear() {
		
		this.data = {};
		if ( this.isSupported )
			sessionStorage.clear();
	}
	
	public set( name: string, value: any ) {
		
		let val = {
			time: Date.now(),
			value: value,
		}
		
		this.data[ name ] = val;
		if ( this.isSupported )
			sessionStorage.setItem( name, JSON.stringify( val ) );
	}
	
	private getStruct( name: string ): any {
		
		if ( this.data[ name ] )
			return this.data[ name ];
		
		if ( this.isSupported ) {
			const valstr = sessionStorage.getItem( name );
			if ( valstr ) {
				const val = JSON.parse( valstr );
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
	
	public get( name: string ): any {
		
		let val = this.getStruct( name );
		if ( !val )
			return null;
		
		return val.value;
	}
	
	/**
	 * @param name
	 * @param maxTime in seconds
	 */
	public getTimeout( name: string, maxTime: number ): any {
		
		let val = this.getStruct( name );
		if ( !val )
			return null;
		
		if ( val.time < Date.now() - maxTime * 1000 ) {
			this.remove( name );
			return null;
		}
		
		return val.value;
	}
	
}
