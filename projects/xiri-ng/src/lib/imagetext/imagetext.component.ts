import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { XiriColor } from '../types/color.type';
import { MatIcon } from '@angular/material/icon';
import {
	MatCard,
	MatCardAvatar,
	MatCardContent,
	MatCardHeader,
	MatCardSubtitle,
	MatCardTitle
} from '@angular/material/card';

export interface XiriImagetextSettings {
	url: string;
	info: string;

	headerIcon?: string
	headerIconColor?: XiriColor
	headerSub?: string
	header?: string
	compact?: boolean
}


@Component( {
	            selector: 'xiri-imagetext',
	            templateUrl: './imagetext.component.html',
	            styleUrl: './imagetext.component.scss',
	            imports: [ MatCard,
	                       MatCardHeader,
	                       MatCardAvatar,
	                       MatIcon,
	                       MatCardTitle,
	                       MatCardSubtitle,
	                       MatCardContent,
	                       MatProgressSpinner ],
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            host: { '[class.compact]': 'compact()' }
            } )
export class XiriImagetextComponent {

	settings = input.required<XiriImagetextSettings>();
	loading = signal<boolean>( true )
	compact = computed<boolean>( () => !!this.settings().compact );
}
