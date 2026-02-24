import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { MatCard, MatCardHeader, MatCardAvatar, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { RouterLink } from '@angular/router';

export interface XiriCardlinkSettings {
	link: string
	icon?: string
	iconSet: string
	text?: string
	sub?: string
}

@Component( {
	            selector: 'xiri-cardlink',
	            templateUrl: './cardlink.component.html',
	            styleUrls: [ './cardlink.component.scss' ],
	            imports: [ RouterLink,
	                       MatCard,
	                       MatRipple,
	                       MatCardHeader,
	                       MatCardAvatar,
	                       MatIcon,
	                       MatCardTitle,
	                       MatCardSubtitle ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriCardlinkComponent {
	
	settings = input.required<XiriCardlinkSettings>();
	
}
