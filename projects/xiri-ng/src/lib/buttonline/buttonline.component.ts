import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { XiriButton, XiriButtonComponent, XiriButtonResult } from "../button/button.component";


export interface XiriButtonlineSettings {
	buttons: XiriButton[]
	class: string
}

@Component( {
	            selector: 'xiri-buttonline',
	            templateUrl: './buttonline.component.html',
	            styleUrl: './buttonline.component.scss',
	            imports: [
		            XiriButtonComponent
	            ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriButtonlineComponent {
	
	settings = input.required<XiriButtonlineSettings>();
	disabled = input<boolean>( false );
	filterData = input<any>( undefined );
	
	result = output<XiriButtonResult>();
}
