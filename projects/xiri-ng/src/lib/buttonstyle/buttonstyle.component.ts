import { Component, computed, DestroyRef, ElementRef, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
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
		            MatProgressSpinner,
		            NgTemplateOutlet
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

	// Consumers pass their own [disabled] expression, so button.disabled counts here too.
	protected off = computed( () => this.disabled() || this.loading() || !!this.button().disabled );

	constructor() {
		// Consumers listen with (click) on this host. Under a disabled button (pointer-events: none)
		// a real click hits the inline host itself; with disabledInteractive it bubbles up from the
		// button, which Material only blocks on <a>. Capture phase, because Angular merges a
		// host listener with the consumer's (click) into one DOM listener that
		// stopImmediatePropagation() cannot split. stopPropagation also keeps the click away
		// from an enclosing <a routerLink>, preventDefault from its href.
		const host: HTMLElement = inject( ElementRef ).nativeElement;
		const block = ( event: Event ) => {
			if ( this.off() ) {
				event.preventDefault();
				event.stopPropagation();
			}
		};
		host.addEventListener( 'click', block, true );
		inject( DestroyRef ).onDestroy( () => host.removeEventListener( 'click', block, true ) );
	}
}
