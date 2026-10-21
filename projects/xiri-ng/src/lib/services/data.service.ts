import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError, from, mergeMap, Observable, OperatorFunction, tap, throwError } from 'rxjs';
import { XiriSnackbarService } from './snackbar.service';

// providedIn 'root' so the class doubles as its own default: an app that never calls
// provideXiriServices() gets the documented '/api/' base instead of a NullInjector error.
// provideXiriServices() still overrides it with a useValue provider.
@Injectable( { providedIn: 'root' } )
export class XiriDataServiceConfig {
	api = '/api/';
}

// Bei responseType 'blob' kommt auch der Fehler-Body als Blob. Enthält er JSON (xiri-go `{"error": "…"}`),
// wird er als Objekt weitergegeben, damit err.error.error wie bei post() funktioniert. Sonst bleibt der Fehler, wie er ist.
async function readBlobError( err: unknown ): Promise<unknown> {
	if ( !( err instanceof HttpErrorResponse ) || !( err.error instanceof Blob ) )
		return err;
	try {
		const body: unknown = JSON.parse( await err.error.text() );
		if ( !body || typeof body !== 'object' )
			return err;
		return new HttpErrorResponse( { error: body, headers: err.headers, status: err.status, statusText: err.statusText,
			                              url: err.url ?? undefined } );
	} catch {
		return err;
	}
}

function parseBlobError<T>(): OperatorFunction<T, T> {
	return catchError( ( err: unknown ) => from( readBlobError( err ) ).pipe( mergeMap( e => throwError( () => e ) ) ) );
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

	public get( url: string ): Observable<object> {
		return this.http.get( this.config.api + url ).pipe(
			tap( ( res: object ) => this.snackbar.handleResponse( res ) )
		);
	}

	public post( url: string, data: unknown ): Observable<unknown> {
		return this.http.post( this.config.api + url, data ).pipe(
			tap( ( res: unknown ) => this.snackbar.handleResponse( res ) )
		);
	}

	public postFile( url: string, data: unknown ): Observable<Blob> {
		return this.http.post( this.config.api + url, data, { responseType: 'blob' } ).pipe( parseBlobError() );
	}

	public postFileResponse( url: string, data: unknown ): Observable<HttpResponse<Blob>> {
		return this.http.post( this.config.api + url, data, { observe: 'response', responseType: 'blob' } ).pipe( parseBlobError() );
	}

	/** @deprecated Use postFileResponse() + XiriDownloadService.download() instead */
	public postDownload( url: string, data: unknown ) {
		console.warn( 'XiriDataService.postDownload() is deprecated. Use postFileResponse() + XiriDownloadService.download() instead.' );
		const downForm = document.createElement( 'form' );
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
