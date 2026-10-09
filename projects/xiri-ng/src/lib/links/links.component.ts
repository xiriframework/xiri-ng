import { Component, computed, inject, input, OnDestroy } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { XiriButton } from "../button/button.component";
import { XiriColor } from '../types/color.type';
import { XiriDialogComponent } from "../dialog/dialog.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { RouterLink } from "@angular/router";
import { XiriUrlPipe } from "../pipes/url.pipe";
import { XiriResponseHandlerService, XIRI_PANEL_HOST } from '../services/response-handler.service';
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import {
	MatCard,
	MatCardAvatar,
	MatCardContent,
	MatCardHeader,
	MatCardSubtitle,
	MatCardTitle
} from '@angular/material/card';

export interface XiriLinksSettings {
	data: XiriButton[]
	headerIcon?: string
	headerIconColor?: XiriColor
	headerSub?: string
	header?: string
	compact?: boolean
}

@Component( {
	            selector: 'xiri-links',
	            templateUrl: './links.component.html',
	            styleUrl: './links.component.scss',
	            imports: [ MatCard,
	                       MatCardHeader,
	                       MatCardAvatar,
	                       MatIcon,
	                       MatCardSubtitle,
	                       MatCardTitle,
	                       MatCardContent,
	                       MatNavList,
	                       MatListItem,
	                       MatListItemIcon,
	                       MatListItemTitle,
	                       RouterLink,
	                       NgTemplateOutlet,
	                       XiriUrlPipe ],
	            host: { '[class.compact]': 'compact()' }
            } )
export class XiriLinksComponent implements OnDestroy {

	settings = input.required<XiriLinksSettings>();
	compact = computed<boolean>( () => !!this.settings().compact );
	private dialog = inject( MatDialog );
	private responseHandler = inject( XiriResponseHandlerService );
	private panelHost = inject( XIRI_PANEL_HOST, { optional: true } );
	
	private dialogRef?: MatDialogRef<unknown>;

	ngOnDestroy(): void {
		if ( this.dialogRef )
			this.dialogRef.close( null );
	}
	
	openDialog( item: XiriButton ) {
		
		const data = {
			type: 'load',
			url: item.url,
		};
		
		this.dialogRef = this.dialog.open( XiriDialogComponent, {
			data: data,
		} );
		
		this.dialogRef.afterClosed().subscribe( result => this.responseHandler.handle( result, { onPanelRefresh: () => this.refreshPanel() } ) );
		
		return true;
	}

	// Ohne umschließende Card: wie eine Card ohne url → Page-Reload.
	private refreshPanel() {
		if ( this.panelHost )
			this.panelHost.reloadPanel();
		else
			this.responseHandler.handle( { refresh: 'page' } );
	}

}
