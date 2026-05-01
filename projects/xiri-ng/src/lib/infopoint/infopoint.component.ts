import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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
	compact?: boolean
}

@Component( {
	            selector: 'xiri-infopoint',
	            templateUrl: './infopoint.component.html',
	            styleUrl: './infopoint.component.scss',
	            imports: [ RouterLink, MatCard, MatCardContent, MatIcon ],
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            host: { '[class.compact]': 'compact()' }
            } )
export class XiriInfopointComponent {

	settings = input.required<XiriInfopointSettings>();

	compact = computed<boolean>( () => !!this.settings().compact );
}
