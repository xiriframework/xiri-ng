import { Pipe, PipeTransform } from '@angular/core';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';

// Wandelt einen URL-String (inkl. optionalem ?query und #fragment) in eine UrlTree um,
// die RouterLink unverändert an die Navigation reicht. Ohne diese Umwandlung würde ein
// String wie "/pfad?config=98" als ein Segment behandelt und der "?" percent-encodiert → 404.
// Nutzt DefaultUrlSerializer (das, woran Router.parseUrl intern delegiert) statt inject(Router),
// damit die Pipe nicht an einem gemockten Router in Tests hängt.
const serializer = new DefaultUrlSerializer();

@Pipe( { name: 'xiriUrl' } )
export class XiriUrlPipe implements PipeTransform {

	transform( url: string | null | undefined ): UrlTree | null {
		if ( !url )
			return null;
		return serializer.parse( url );
	}
}
