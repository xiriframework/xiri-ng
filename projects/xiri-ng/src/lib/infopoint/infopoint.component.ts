import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { XiriColor } from '../types/color.type';


export interface XiriInfopointSettings {
	text: string
	info: string

	url?: string
	urlParams?: object

	icon: string
	iconSet?: string;
	iconColor: XiriColor

	dense?: boolean
}

@Component( {
	            selector: 'xiri-infopoint',
	            templateUrl: './infopoint.component.html',
	            styleUrl: './infopoint.component.scss',
	            imports: [ RouterLink, MatCard, MatCardContent, MatIcon ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriInfopointComponent {
	
	settings = input.required<XiriInfopointSettings>();
}
