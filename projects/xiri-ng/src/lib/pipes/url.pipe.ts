import { Pipe, PipeTransform } from '@angular/core';
import { DefaultUrlSerializer, Params } from '@angular/router';

export interface XiriUrl {
	path: string;
	queryParams: Params;
}

// Trennt einen URL-String in Pfad und Query-Params. Der Pfad wird als String an
// [routerLink] gebunden, damit RouterLink relative Links (z. B. "Test/Query/Page")
// weiterhin relativ zur ActivatedRoute auflöst (Prefix bleibt erhalten). Ein an
// [routerLink] gebundener UrlTree würde dagegen IMMER absolut navigieren und den
// Prefix verlieren. Die Query kommt separat über [queryParams] rein — sonst würde
// ein "?" im Pfad-String von createUrlTree als Segment percent-encodiert → 404.
const serializer = new DefaultUrlSerializer();

@Pipe( { name: 'xiriUrl' } )
export class XiriUrlPipe implements PipeTransform {

	transform( url: string | null | undefined ): XiriUrl | null {
		if ( !url )
			return null;
		const tree = serializer.parse( url );
		return { path: url.split( /[?#]/ )[ 0 ], queryParams: tree.queryParams };
	}
}
