import { ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatLine } from "@angular/material/core";
import { XiriButton } from "../button/button.component";
import { XiriColor } from '../types/color.type';
import { XiriDialogComponent } from "../dialog/dialog.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Router, RouterLink } from "@angular/router";
import { MatIconButton } from '@angular/material/button';
import { MatListItem, MatNavList } from '@angular/material/list';
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
	                       RouterLink,
	                       MatLine,
	                       MatIconButton,
	                       NgTemplateOutlet ],
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            host: { '[class.compact]': 'compact()' }
            } )
export class XiriLinksComponent implements OnDestroy {

	settings = input.required<XiriLinksSettings>();
	compact = computed<boolean>( () => !!this.settings().compact );
	private dialog = inject( MatDialog );
	private router = inject( Router );
	
	private dialogRef?: MatDialogRef<any>;
	
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
		
		this.dialogRef.afterClosed().subscribe( ( result: any ) => {
			if ( !result )
				return;
			if ( result.page == 'refresh' || result.refresh == 'page' )
				this.router.navigate( [ this.router.url ] ).then();
		} );
		
		return true;
	}
	
}
