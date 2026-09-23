import { DomSanitizer } from '@angular/platform-browser';
import { inject, Pipe, PipeTransform, SecurityContext } from '@angular/core';


// HTML aus dem Backend enthält oft Record-Daten (Status, Adressen, Notizen). Angulars Sanitizer
// behält Formatierung und class, entfernt aber Scripts, Event-Handler und javascript:-URLs.
@Pipe( {
	       name: 'safeHtml'
       } )
export class SafehtmlPipe implements PipeTransform {

	private sanitizer: DomSanitizer = inject( DomSanitizer );

	transform( value: string | null | undefined ): string {
		return this.sanitizer.sanitize( SecurityContext.HTML, value ?? '' ) ?? '';
	}
}
