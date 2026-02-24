import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButton, MatFabButton, MatIconButton, MatMiniFabButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { XiriButton } from "../button/button.component";
import { MatTooltip } from "@angular/material/tooltip";

@Component( {
	            selector: 'xiri-buttonstyle',
	            imports: [
		            MatButton,
		            MatFabButton,
		            MatIcon,
		            MatIconButton,
		            MatMiniFabButton,
		            MatTooltip
	            ],
	            templateUrl: './buttonstyle.component.html',
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriButtonstyleComponent {
	button = input.required<XiriButton>();
	disabled = input.required<boolean>();
}
