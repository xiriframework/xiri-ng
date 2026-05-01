import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
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
	compact?: boolean
}

@Component( {
	            selector: 'xiri-stat',
	            templateUrl: './stat.component.html',
	            styleUrl: './stat.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ MatIcon, MatCard, MatCardContent, NgTemplateOutlet ],
	            host: { '[class.compact]': 'compact()' }
            } )
export class XiriStatComponent {

	settings = input.required<XiriStatSettings>();

	compact = computed<boolean>( () => !!this.settings().compact );
}
