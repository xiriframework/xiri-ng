import { inject, Injectable } from '@angular/core';
import { XiriDataService } from './data.service';
import { Router } from "@angular/router";
import { XiriButton } from "../button/button.component";
import { XiriFormField } from "../formfields/field.interface";
import { catchError, map, Observable, throwError, timer } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { XiriSessionStorageService } from "./sessionStorage.service";


interface XiriFormServiceReturn {
	url?: string
	fields?: XiriFormField[]
	buttons?: XiriButton[]
	done?: boolean
	goto?: string
	model?: object
	extra?: object

	// dialog
	type?: string
	header?: string
	time?: number
}

export interface XiriFormServiceData {
	url: string
	fields?: XiriFormField[]
	buttons?: XiriButton[]
	extra?: object
	done?: Observable<void>

	// dialog
	type?: string // form, data
	header?: string
	time?: number
}

export interface XiriFormServiceError {
	error: string
}

@Injectable( {
	providedIn: 'root',
} )
export class XiriFormService {

	private dataService: XiriDataService = inject( XiriDataService );
	private router: Router = inject( Router );
	private sessionStorageService: XiriSessionStorageService = inject( XiriSessionStorageService );
	
	
	public get( url: string, data?: any, extra?: any ): Observable<XiriFormServiceData> {

		const req: Observable<XiriFormServiceReturn> = data === null ? this.dataService.get( url ) : this.dataService.post( url, { ...data, ...extra } );

		return req.pipe(
			map( res => this.parse( res ) ),
			catchError( ( err: HttpErrorResponse ): Observable<never> => {
				console.log( 'XiriFormService error', err );
				let error: string = 'Unknown error';
				if ( err.status == 400 || err.status == 424 )
					error = err.error?.error || 'Format Error';
				else if ( err.status == 403 )
					error = err.error?.error || 'Access denied';
				
				return throwError( () => <XiriFormServiceError>{
					error: error
				} );
			} )
		);
	}

	public parse( res: XiriFormServiceReturn ): XiriFormServiceData {

		if ( res.buttons ) {
			let fields: XiriFormField[] = [];
			let model = res.model || {};
			let type = res.type ? res.type : 'form';

			if ( type == 'form' ) {
				res.fields.forEach( ( field: any ) => {
					if ( field.hide == true )
						return;
					if ( model[ field.id ] !== undefined )
						field.value = model[ field.id ];

					fields.push( field );
				} );
			} else if ( type == 'question' ) {
				let obj = <any>res.fields;
				obj.type = 'question';
				fields.push( obj );
			} else if ( type == 'waiting' ) {
				let obj = <any>res.fields;
				obj.type = 'waiting';
				obj.done = false;
				obj.value = obj.text;
				fields.push( obj );
			} else {
				console.log( 'XiriFormService unknown form type', type );

			}

			return <XiriFormServiceData>{
				url:     res.url,
				buttons: res.buttons,
				extra:   res.extra || {},
				fields:  fields,

				type: type,
				time: res.time || 2000,
			};

		} else if ( res.goto ) {
			return <XiriFormServiceData>{
				done: timer( res.done ? 1000 : 0 ).pipe( map( () => {
					this.router.navigate( [res.goto] ).then();
				} ) )
			};
		} else {
			return <XiriFormServiceData>{
				done: timer( res.done ? 1000 : 0 ).pipe( map( () => {
				} ) )
			};
		}
	}
	
	public loadState( saveStateId: string|null|undefined, fields: XiriFormField[] ): XiriFormField[] {
		
		if ( !saveStateId )
			return fields;
		
		let data = this.sessionStorageService.getTimeout( saveStateId, 3600 );
		if ( !data )
			return fields;
		
		for ( let field of fields ) {
			
			if ( data[ field.id ] === undefined )
				continue;
			
			let value = data[ field.id ];
			
			switch ( field.type ) {
				case 'bool':
					field.value = value;
					break;
				case 'select':
				case 'object':
				case 'model':
					if ( !field.list )
						break;
					for ( let item of field.list ) {
						if ( item.id == value ) {
							field.value = value;
							break;
						}
					}
					break;
				case 'date':
					if ( field.min && field.min > value )
						break;
					if ( field.max && field.max < value )
						break;
					field.value = value;
					break;
				
				case 'daterange':
				case 'datetimerange':
					console.log( 'query save check daterange', field, value );
					break;
				
				default:
					break;
			}
		}
		
		return fields;
	}
	
	public saveState( saveStateId: string|null|undefined, values: any ): void {
		
		if ( !saveStateId )
			return;
		
		this.sessionStorageService.set( saveStateId, values );
	}
}
