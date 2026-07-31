import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';


@Injectable( {
	             providedIn: 'root',
             } )
export class XiriDownloadService {

	/**
	 * Opens an empty tab and returns its handle for a later download( …, tab ).
	 *
	 * MUST be called synchronously from the click handler: after an HTTP round trip the
	 * transient user activation is gone and the browser blocks the popup. Returns null
	 * when it was blocked anyway — pass that through, download() then saves the file.
	 */
	public openTab(): Window | null {
		return window.open( 'about:blank', '_blank' );
	}

	/**
	 * Turns the response body into a file. With a tab handle from openTab() the file is
	 * displayed in that tab, otherwise it is saved via a download anchor.
	 */
	public download( result: HttpResponse<Blob>, filename: string, tab?: Window | null ): boolean {

		const contentDisposition = result.headers.get( 'content-disposition' );
		if ( contentDisposition ) {
			filename = contentDisposition.split( 'filename=' )[ 1 ];
			filename = filename.replace( /"/g, '' );
		}

		const contentType = result.headers.get( 'content-type' ) ?? undefined;
		const file = new File( [ result.body as BlobPart ], filename, { type: contentType } );
		const fileData = URL.createObjectURL( file );

		if ( tab ) {
			// ponytail: caps window.opener reach. A blob: document is same-origin anyway, so this is
			// no licence to display untrusted HTML — only a correct Content-Type keeps it a viewer.
			tab.opener = null;
			tab.location.replace( fileData );
			// ponytail: 60s is plenty to load; without it the blob lives until the page reloads.
			setTimeout( () => URL.revokeObjectURL( fileData ), 60 * 1000 )
			return true;
		}

		const a = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'a' ) as HTMLAnchorElement;
		a.download = filename;
		a.rel = 'noopener';
		a.href = fileData;
		// a.target = '_blank';
		
		setTimeout( () => {
			URL.revokeObjectURL( fileData );
		}, 2 * 1000 )
		setTimeout( () => a.click(), 0 )
		
		return true;
	}
}
