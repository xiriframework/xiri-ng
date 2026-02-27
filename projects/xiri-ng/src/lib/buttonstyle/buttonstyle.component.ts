import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButton, MatFabButton, MatIconButton, MatMiniFabButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { XiriButton } from "../button/button.component";
import { MatTooltip } from "@angular/material/tooltip";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component( {
	            selector: 'xiri-buttonstyle',
	            imports: [
		            MatButton,
		            MatFabButton,
		            MatIcon,
		            MatIconButton,
		            MatMiniFabButton,
		            MatTooltip,
		            MatProgressSpinner
	            ],
	            templateUrl: './buttonstyle.component.html',
	            styleUrl: './buttonstyle.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriButtonstyleComponent {
	button = input.required<XiriButton>();
	disabled = input.required<boolean>();
	loading = input<boolean>( false );
}
