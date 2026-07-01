import { Component, input } from '@angular/core';
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
            } )
export class XiriButtonstyleComponent {
	button = input.required<XiriButton>();
	disabled = input.required<boolean>();
	loading = input<boolean>( false );
	// Remaining seconds until the next poll tick; shown inside the button while > 0.
	countdown = input<number>( 0 );
	// Optional backend-defined label shown while polling; overrides the countdown when set.
	pollText = input<string>( '' );
}
