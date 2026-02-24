import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardAvatar, MatCardContent } from '@angular/material/card';
import { XiriColor } from '../types/color.type';


export interface XiriMultiprogressSettings {
	data: XiriMultiprogressItem[]
	headerIcon?: string
	headerIconColor?: XiriColor
	header?: string
	show?: number
}

export interface XiriMultiprogressItem {
	text: string
	value: string
	progress: number
	color?: XiriColor
}

@Component( {
	            selector: 'xiri-multiprogress',
	            templateUrl: './multiprogress.component.html',
	            styleUrls: [ './multiprogress.component.scss' ],
	            imports: [ MatCard, MatCardAvatar, MatIcon, MatIconButton, MatCardContent, MatProgressBar, SlicePipe ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriMultiprogressComponent {
	public isOpen = signal<boolean>(false);

	settings = input.required<XiriMultiprogressSettings>();
}
