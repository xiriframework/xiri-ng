import { Injectable } from '@angular/core';


@Injectable( {
	             providedIn: 'root',
             } )
export class XiriDownloadService {
	
	public download( result: any, filename: string, open: boolean ): boolean {
		
		if ( result.headers.get( 'content-disposition' ) ) {
			filename = result.headers.get( 'content-disposition' ).split( 'filename=' )[ 1 ];
			filename = filename.replace( /"/g, '' );
		}
		
		let contentType = result.headers.get( 'content-type' );
		let file = new File( [ result.body ], filename, { type: contentType } );
		let fileData = URL.createObjectURL( file );
		
		if ( open ) {
			let ret = window.open( fileData, '_blank' )
			return !( ret === null || typeof ( ret ) == 'undefined' );
		}
		
		const a: any = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'a' )
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
