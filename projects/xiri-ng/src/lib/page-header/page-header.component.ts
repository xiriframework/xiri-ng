import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { XiriButtonlineComponent, XiriButtonlineSettings } from '../buttonline/buttonline.component';

export interface XiriPageHeaderSettings {
	title: string
	subtitle?: string
	icon?: string
	iconColor?: string
	buttons?: XiriButtonlineSettings
}

@Component( {
	            selector: 'xiri-page-header',
	            templateUrl: './page-header.component.html',
	            styleUrl: './page-header.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatIcon, XiriButtonlineComponent ]
            } )
export class XiriPageHeaderComponent {

	settings = input.required<XiriPageHeaderSettings>();
}
