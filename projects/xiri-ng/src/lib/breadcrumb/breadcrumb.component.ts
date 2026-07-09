import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { XiriUrlPipe } from '../pipes/url.pipe';

export interface XiriBreadcrumbItem {
	label: string;
	link?: string;
	icon?: string;
	extern?: boolean;
}

@Component( {
	            selector: 'xiri-breadcrumb',
	            templateUrl: './breadcrumb.component.html',
	            styleUrl: './breadcrumb.component.scss',
	            imports: [ MatIcon, RouterLink, XiriUrlPipe ]
            } )
export class XiriBreadcrumbComponent {

	settings = input.required<XiriBreadcrumbItem[]>();
}
