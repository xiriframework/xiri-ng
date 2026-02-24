import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component( {
	            selector: 'xiri-done',
	            templateUrl: './done.component.html',
	            styleUrl: './done.component.scss',
	            imports: [ MatIcon ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriDoneComponent {
}
