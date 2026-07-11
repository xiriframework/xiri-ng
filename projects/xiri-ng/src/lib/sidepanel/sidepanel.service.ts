import { Injectable, inject } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { XiriSidepanelComponent } from './sidepanel.component';
import { XiriSidepanelRef } from './sidepanel-ref';

export interface XiriSidepanelConfig {
	title?: string;
	width?: string;
	data?: unknown;
	url?: string;
}

@Injectable( { providedIn: 'root' } )
export class XiriSidepanelService {
	private readonly overlay = inject( Overlay );

	open( config: XiriSidepanelConfig ): XiriSidepanelRef {

		const overlayRef = this.overlay.create( {
			positionStrategy: this.overlay.position().global().right( '0' ).top( '0' ),
			height: '100%',
			width: config.width ?? '420px',
			hasBackdrop: true,
			panelClass: 'xiri-sidepanel-overlay'
		} );

		const ref = new XiriSidepanelRef( overlayRef );

		const portal = new ComponentPortal( XiriSidepanelComponent );
		const cmp = overlayRef.attach( portal );
		cmp.setInput( 'config', config );
		cmp.setInput( 'ref', ref );

		overlayRef.backdropClick().subscribe( () => ref.close() );

		return ref;
	}
}
