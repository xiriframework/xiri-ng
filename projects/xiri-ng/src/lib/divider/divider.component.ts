import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';

export interface XiriDividerSettings {
	text?: string
	icon?: string
	spacing?: 'compact' | 'normal' | 'large'
}

@Component( {
	            selector: 'xiri-divider',
	            templateUrl: './divider.component.html',
	            styleUrl: './divider.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatIcon, MatDivider ]
            } )
export class XiriDividerComponent {

	settings = input.required<XiriDividerSettings>();
}
