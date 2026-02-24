import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { XiriColor } from '../types/color.type';

export interface XiriTimelineItem {
	title: string;
	description?: string;
	datetime?: string;
	icon?: string;
	iconColor?: XiriColor;
}

export interface XiriTimelineSettings {
	items: XiriTimelineItem[];
}

@Component( {
	            selector: 'xiri-timeline',
	            templateUrl: './timeline.component.html',
	            styleUrl: './timeline.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatIcon ]
            } )
export class XiriTimelineComponent {

	settings = input.required<XiriTimelineSettings>();
}
