import { ChangeDetectionStrategy, Component, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { XiriDataService } from "../services/data.service";
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import {
	MatListItem,
	MatListItemIcon,
	MatListItemLine,
	MatListItemMeta,
	MatListItemTitle,
	MatListSubheaderCssMatStyler,
	MatNavList
} from '@angular/material/list';

export interface XiriListSettings {
	sections: XiriListSection[];
}

export interface XiriListSection {
	name: string;
	data: XiriListItem[];
}

export interface XiriListItem {
	name: string;
	info: string;
	icon: string;
	iconSet?: string;
	iconColor: string;
	url: string;
	hasFavorite?: boolean;
	isFavorite?: boolean;
	favoriteUrl?: string;
	favoriteHint?: string;
}

@Component( {
	            selector: 'xiri-list',
	            templateUrl: './list.component.html',
	            styleUrl: './list.component.scss',
	            imports: [
		            MatListSubheaderCssMatStyler,
		            MatCard,
		            MatCardContent,
		            MatNavList,
		            MatListItem,
		            RouterLink,
		            MatListItemIcon,
		            MatIcon,
		            MatListItemTitle,
		            MatListItemLine,
		            MatListItemMeta,
		            MatIconButton,
		            MatTooltip,
	            ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriListComponent {

	settings = input.required<XiriListSettings>();
	private dataService = inject( XiriDataService );
	private destroyRef = inject( DestroyRef );

	changeFavorite( item: XiriListItem, event: Event ) {

		event.stopPropagation();
		event.preventDefault();

		let url = item.favoriteUrl + ( item.isFavorite ? '0' : '1' );
		this.dataService.get( url ).pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe();
		item.isFavorite = !item.isFavorite;
	}
}
