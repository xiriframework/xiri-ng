import { inject, Injectable } from '@angular/core';
import { XiriDataService } from './data.service';
import { Router } from "@angular/router";
import { XiriButton } from "../button/button.component";
import { XiriFormField } from "../formfields/field.interface";
import { catchError, map, Observable, throwError, timer } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { XiriSessionStorageService } from "./sessionStorage.service";
import { parseHttpError } from './error.util';


export interface XiriFormServiceReturn {
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
	
	
	public get( url: string, data?: object | null, extra?: object ): Observable<XiriFormServiceData> {

		const req: Observable<XiriFormServiceReturn> = data === null
			? this.dataService.get( url ) as Observable<XiriFormServiceReturn>
			: this.dataService.post( url, { ...data, ...extra } ) as Observable<XiriFormServiceReturn>;

		return req.pipe(
			map( res => this.parse( res ) ),
			catchError( ( err: HttpErrorResponse ): Observable<never> => {
				return throwError( () => ({
					error: parseHttpError( err )
				} as XiriFormServiceError) );
			} )
		);
	}

	public parse( res: XiriFormServiceReturn ): XiriFormServiceData {

		if ( res.buttons ) {
			const fields: XiriFormField[] = [];
			const model = ( res.model || {} ) as Record<string, unknown>;
			const type = res.type ? res.type : 'form';

			if ( type == 'form' ) {
				res.fields?.forEach( ( field: XiriFormField ) => {
					if ( field.hide == true )
						return;
					if ( model[ field.id ] !== undefined )
						field.value = model[ field.id ];

					fields.push( field );
				} );
			} else if ( type == 'question' ) {
				const obj = res.fields as unknown as XiriFormField;
				obj.type = 'question';
				fields.push( obj );
			} else if ( type == 'waiting' ) {
				const obj = res.fields as unknown as XiriFormField & { text?: string };
				obj.type = 'waiting';
				obj.done = false;
				obj.value = obj.text;
				fields.push( obj );
			} else {
				console.log( 'XiriFormService unknown form type', type );

			}

			return {
				url:     res.url,
				buttons: res.buttons,
				extra:   res.extra || {},
				fields:  fields,

				type: type,
				time: res.time || 2000,
			} as XiriFormServiceData;

		} else if ( res.goto ) {
			return {
				done: timer( res.done ? 1000 : 0 ).pipe( map( () => {
					this.router.navigate( [res.goto] ).then();
				} ) )
			} as XiriFormServiceData;
		} else {
			return {
				done: timer( res.done ? 1000 : 0 ).pipe( map( () => {
					/* intentionally empty */
				} ) )
			} as XiriFormServiceData;
		}
	}
	
	public loadState( saveStateId: string|null|undefined, fields: XiriFormField[] ): XiriFormField[] {
		
		if ( !saveStateId )
			return fields;
		
		const data = this.sessionStorageService.getTimeout( saveStateId, 3600 ) as Record<string, unknown> | null;
		if ( !data )
			return fields;

		for ( const field of fields ) {

			if ( data[ field.id ] === undefined )
				continue;

			const value = data[ field.id ];

			switch ( field.type ) {
				case 'bool':
					field.value = value;
					break;
				case 'select':
				case 'object':
				case 'model':
					if ( !field.list )
						break;
					for ( const item of field.list ) {
						if ( item.id == value ) {
							field.value = value;
							break;
						}
					}
					break;
				case 'date':
					if ( field.min && field.min > ( value as number ) )
						break;
					if ( field.max && field.max < ( value as number ) )
						break;
					field.value = value;
					break;
				
				case 'daterange':
				case 'datetimerange':
						break;
				
				default:
					break;
			}
		}
		
		return fields;
	}
	
	public saveState( saveStateId: string|null|undefined, values: unknown ): void {
		
		if ( !saveStateId )
			return;
		
		this.sessionStorageService.set( saveStateId, values );
	}
}
