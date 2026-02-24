import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { XiriButton, XiriButtonComponent, XiriButtonResult } from '../button/button.component';
import { XiriColor } from '../types/color.type';

export interface XiriEmptyStateSettings {
	icon?: string
	iconColor?: XiriColor
	title?: string
	description?: string
	button?: XiriButton
}

@Component( {
	            selector: 'xiri-empty-state',
	            templateUrl: './empty-state.component.html',
	            styleUrl: './empty-state.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatIcon, XiriButtonComponent ]
            } )
export class XiriEmptyStateComponent {

	settings = input.required<XiriEmptyStateSettings>();
	buttonResult = output<XiriButtonResult>();
}
