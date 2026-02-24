import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

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
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatIcon, RouterLink ]
            } )
export class XiriBreadcrumbComponent {

	settings = input.required<XiriBreadcrumbItem[]>();
}
