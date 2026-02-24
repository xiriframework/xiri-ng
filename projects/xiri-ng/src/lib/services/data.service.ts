import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { XiriSnackbarService } from './snackbar.service';

export class XiriDataServiceConfig {
	api = '/api/';
}

export const defaultXiriDataServiceConfig: XiriDataServiceConfig = {
	api: '/api/',
};

@Injectable( {
	             providedIn: 'root',
             } )
export class XiriDataService {
	
	private http: HttpClient = inject( HttpClient );
	private config: XiriDataServiceConfig = inject( XiriDataServiceConfig );
	private snackbar = inject( XiriSnackbarService );

	public get( url: string ): Observable<Object> {
		return this.http.get( this.config.api + url ).pipe(
			tap( ( res: any ) => this.snackbar.handleResponse( res ) )
		);
	}

	public post( url: string, data: any ): Observable<any> {
		return this.http.post( this.config.api + url, data ).pipe(
			tap( ( res: any ) => this.snackbar.handleResponse( res ) )
		);
	}
	
	public postFile( url: string, data: any ): Observable<any> {
		return this.http.post( this.config.api + url, data, { responseType: 'blob' } );
	}
	
	public postFileResponse( url: string, data: any ): Observable<any> {
		return this.http.post( this.config.api + url, data, { observe: 'response', responseType: 'blob' } );
	}
	
	public postDownload( url: string, data: any ) {
		const downForm = <any> document.createElement( 'form' );
		downForm.target = '_blank';
		downForm.method = 'POST';
		downForm.action = url;
		
		const input = document.createElement( 'input' );
		input.type = 'hidden';
		input.name = 'data';
		input.setAttribute( 'value', JSON.stringify( data ) );
		downForm.appendChild( input );
		
		document.body.appendChild( downForm );
		downForm.submit();
	}
	
	public getConfigApi(): string {
		return this.config.api;
	}
}
