import { Injectable, inject } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { ESCAPE } from '@angular/cdk/keycodes';
import { filter } from 'rxjs/operators';
import { XiriSidepanelComponent } from './sidepanel.component';
import { XiriSidepanelRef } from './sidepanel-ref';

export interface XiriSidepanelConfig {
	title?: string;
	width?: string;
	data?: unknown;
}

@Injectable( { providedIn: 'root' } )
export class XiriSidepanelService {
	private readonly overlay = inject( Overlay );
	private readonly focusTrapFactory = inject( ConfigurableFocusTrapFactory );

	open( config: XiriSidepanelConfig ): XiriSidepanelRef {

		// Element merken, das das Panel geöffnet hat, um den Fokus beim Schließen zurückzugeben.
		const previouslyFocused = document.activeElement as HTMLElement | null;

		const overlayRef = this.overlay.create( {
			positionStrategy: this.overlay.position().global().right( '0' ).top( '0' ),
			height: '100%',
			width: config.width ?? '420px',
			hasBackdrop: true,
			panelClass: 'xiri-sidepanel-overlay'
		} );

		const ref = new XiriSidepanelRef( overlayRef, previouslyFocused );

		const portal = new ComponentPortal( XiriSidepanelComponent );
		const cmp = overlayRef.attach( portal );
		cmp.setInput( 'config', config );
		cmp.setInput( 'ref', ref );

		// Fokus im Panel halten (CDK Overlay macht das nicht automatisch, anders als MatDialog).
		const focusTrap = this.focusTrapFactory.create( overlayRef.overlayElement );
		focusTrap.focusInitialElementWhenReady();
		overlayRef.detachments().subscribe( () => focusTrap.destroy() );

		overlayRef.backdropClick().subscribe( () => ref.close() );
		overlayRef.keydownEvents().pipe( filter( e => e.keyCode === ESCAPE ) ).subscribe( () => ref.close() );

		return ref;
	}
}
