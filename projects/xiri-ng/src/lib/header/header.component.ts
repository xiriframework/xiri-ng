import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface XiriHeaderSettings {
	text: string
	color: string
	size: string
}

@Component( {
	            selector: 'xiri-header',
	            templateUrl: './header.component.html',
	            styleUrl: './header.component.scss',
	            imports: [],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriHeaderComponent {
	
	settings = input.required<XiriHeaderSettings>();
}
