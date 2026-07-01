import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';


@Injectable( {
	             providedIn: 'root',
             } )
export class XiriDownloadService {

	public download( result: HttpResponse<Blob>, filename: string, open: boolean ): boolean {

		const contentDisposition = result.headers.get( 'content-disposition' );
		if ( contentDisposition ) {
			filename = contentDisposition.split( 'filename=' )[ 1 ];
			filename = filename.replace( /"/g, '' );
		}

		const contentType = result.headers.get( 'content-type' ) ?? undefined;
		const file = new File( [ result.body as BlobPart ], filename, { type: contentType } );
		const fileData = URL.createObjectURL( file );

		if ( open ) {
			const ret = window.open( fileData, '_blank' )
			return !( ret === null || typeof ( ret ) == 'undefined' );
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
