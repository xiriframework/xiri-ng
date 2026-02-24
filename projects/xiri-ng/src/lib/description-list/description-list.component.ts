import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { SafehtmlPipe } from '../pipes/safehtml.pipe';

export interface XiriDescriptionListItem {
	label: string
	value: string
	icon?: string
	color?: string
	type?: 'text' | 'link' | 'html' | 'badge'
}

export interface XiriDescriptionListSettings {
	items: XiriDescriptionListItem[]
	columns?: 1 | 2 | 3
	layout?: 'horizontal' | 'stacked'
}

@Component( {
	            selector: 'xiri-description-list',
	            templateUrl: './description-list.component.html',
	            styleUrl: './description-list.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatIcon, SafehtmlPipe ]
            } )
export class XiriDescriptionListComponent {

	settings = input.required<XiriDescriptionListSettings>();

	layoutClass = computed( () => {
		const s = this.settings();
		const layout = s.layout || 'stacked';
		return `${ layout } cols-${ s.columns || 2 }`;
	} );
}
