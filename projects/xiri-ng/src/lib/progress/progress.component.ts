import { Component, computed, input } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { XiriColor } from '../types/color.type';

export interface XiriProgressSettings {
	label: string
	current: number
	total: number
	value: number
	color?: XiriColor
	indeterminate?: boolean
}

@Component( {
	            selector: 'xiri-progress',
	            templateUrl: './progress.component.html',
	            styleUrl: './progress.component.scss',
	            imports: [ MatProgressBar ]
            } )
export class XiriProgressComponent {

	settings = input.required<XiriProgressSettings>();

	mode = computed<'determinate' | 'indeterminate'>(
		() => this.settings().indeterminate ? 'indeterminate' : 'determinate' );
}
