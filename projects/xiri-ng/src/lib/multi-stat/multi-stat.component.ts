import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { XiriStatSettings } from '../stat/stat.component';
import { XiriColor } from '../types/color.type';
import { XiriUrlPipe } from '../pipes/url.pipe';
import { XiriDataService } from '../services/data.service';
import { XiriSkeletonComponent } from '../skeleton/skeleton.component';

export interface XiriMultiStatSettings {
	title?: string
	icon?: string
	iconColor?: XiriColor
	items?: XiriStatSettings[]
	url?: string
	reload?: boolean
	verticalItems?: boolean
}

@Component( {
	            selector: 'xiri-multi-stat',
	            templateUrl: './multi-stat.component.html',
	            styleUrl: './multi-stat.component.scss',
	            imports: [ MatIcon, MatIconButton, MatCard, MatCardContent, RouterLink, NgTemplateOutlet, XiriUrlPipe, XiriSkeletonComponent ]
            } )
export class XiriMultiStatComponent {

	private dataService = inject( XiriDataService );

	settings = input.required<XiriMultiStatSettings>();

	// AJAX-Modus: lädt die Items von settings().url (Card-Muster). Bleibt idle,
	// solange keine url gesetzt ist (rxResource ruft stream nur bei definierten params).
	private resource = rxResource( {
		params: () => this.settings().url,
		stream: ( { params } ) => this.dataService.post( params, null ),
	} );

	loading = this.resource.isLoading;

	errorMsg = computed<string>( () => {
		const e = this.resource.error() as { cause?: unknown } | undefined;
		if ( !e ) return '';
		const http = ( e.cause ?? e ) as { error?: { error?: string } };
		return http.error?.error || 'Fehler beim Laden';
	} );

	// Antwort auspacken ({ data: ... } → data), sonst inline settings.items.
	private loaded = computed<XiriMultiStatSettings | null | undefined>( () => {
		const res = this.resource.value();
		if ( res == null ) return res;
		return ( ( res as { data?: unknown } ).data ?? res ) as XiriMultiStatSettings;
	} );

	items = computed<XiriStatSettings[]>( () => this.loaded()?.items ?? this.settings().items ?? [] );

	reload(): void {
		if ( this.loading() ) return;
		this.resource.reload();
	}
}
