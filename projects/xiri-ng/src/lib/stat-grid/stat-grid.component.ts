import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { XiriStatComponent, XiriStatSettings } from '../stat/stat.component';

export interface XiriStatGridSettings {
	stats: XiriStatSettings[]
	columns?: number
	title?: string
}

@Component( {
	            selector: 'xiri-stat-grid',
	            templateUrl: './stat-grid.component.html',
	            styleUrl: './stat-grid.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ XiriStatComponent ]
            } )
export class XiriStatGridComponent {

	settings = input.required<XiriStatGridSettings>();
}
