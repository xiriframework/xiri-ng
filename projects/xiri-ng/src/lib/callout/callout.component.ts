import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { XiriButton, XiriButtonComponent, XiriButtonResult } from '../button/button.component';

export type XiriCalloutTone = 'info' | 'success' | 'warning' | 'error';

export interface XiriCalloutSettings {
	tone: XiriCalloutTone
	text: string

	title?: string
	icon?: string
	actions?: XiriButton[]
	dismissible?: boolean
	compact?: boolean
}

@Component( {
	            selector: 'xiri-callout',
	            templateUrl: './callout.component.html',
	            styleUrl: './callout.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatIcon, MatIconButton, XiriButtonComponent ]
	            } )
export class XiriCalloutComponent {

	settings = input.required<XiriCalloutSettings>();
	buttonResult = output<XiriButtonResult>();

	// Dismiss ist rein lokaler Component-State — der Hinweis verschwindet nur clientseitig.
	dismissed = signal<boolean>( false );

	compact = computed<boolean>( () => !!this.settings().compact );

	// Nur ein dynamisch als Fehler eingesetzter Hinweis ist eine aggressive Live-Region.
	// Statische Hinweise sind ein semantisches "note" ohne Live-Ansage.
	role = computed<string>( () => this.settings().tone === 'error' ? 'alert' : 'note' );

	dismiss(): void {
		this.dismissed.set( true );
	}
}
