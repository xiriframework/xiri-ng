import { DomSanitizer } from '@angular/platform-browser';
import { inject, Pipe, PipeTransform } from '@angular/core';


@Pipe( {
	       name: 'safeHtml'
       } )
export class SafehtmlPipe implements PipeTransform {
	
	private sanitizer: DomSanitizer = inject( DomSanitizer );
	
	transform( style: string ): string {
		return <string> this.sanitizer.bypassSecurityTrustHtml( style );
	}
}
