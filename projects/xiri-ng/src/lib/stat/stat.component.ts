import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';
import { XiriColor } from '../types/color.type';

export interface XiriStatTrend {
	value: number
	direction: 'up' | 'down' | 'neutral'
}

export interface XiriStatSettings {
	value: string | number
	label: string
	icon?: string
	iconColor?: XiriColor
	trend?: XiriStatTrend
	prefix?: string
	suffix?: string
	color?: XiriColor
}

@Component( {
	            selector: 'xiri-stat',
	            templateUrl: './stat.component.html',
	            styleUrl: './stat.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatIcon, MatCard, MatCardContent ]
            } )
export class XiriStatComponent {

	settings = input.required<XiriStatSettings>();
}
