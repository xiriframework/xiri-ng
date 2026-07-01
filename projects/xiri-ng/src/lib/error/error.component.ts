import { Component, input } from '@angular/core';

@Component( {
	            selector: 'xiri-error',
	            templateUrl: './error.component.html',
	            styleUrl: './error.component.scss',
            } )
export class XiriErrorComponent {
	
	text = input.required<string>();
}
