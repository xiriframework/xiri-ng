import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { ThemeService } from 'projects/xiri-ng/src/lib/services/theme.service';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { COMPONENT_CATALOG } from './component-catalog';

@Component( {
	            selector: 'app-overview',
	            templateUrl: './overview.component.html',
	            styleUrl: './overview.component.scss',
	            imports: [
		            XiriPageHeaderComponent, XiriSectionComponent, MatButton, MatIcon, XiriBreadcrumbComponent,
		            RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatChipsModule,
	            ],
            } )
export class OverviewComponent {

	protected themeService = inject( ThemeService );

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', icon: 'home' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'XIRI UI Library',
		subtitle: 'Durchsuchbarer Component-Katalog',
		icon: 'dashboard',
		iconColor: 'primary',
	};

	sectionTheme: XiriSectionSettings = {
		title: 'ThemeService',
		icon: 'palette',
	};

	sectionCatalog: XiriSectionSettings = {
		title: 'Component-Katalog',
		icon: 'grid_view',
	};

	protected readonly catalog = COMPONENT_CATALOG;
	protected readonly categories = [ ...new Set( COMPONENT_CATALOG.map( ( e ) => e.category ) ) ];

	protected readonly search = signal( '' );
	protected readonly category = signal<string | null>( null );

	protected readonly filtered = computed( () => {
		const term = this.search().trim().toLowerCase();
		const cat = this.category();
		return this.catalog.filter( ( e ) => {
			if ( cat && e.category !== cat ) {
				return false;
			}
			if ( !term ) {
				return true;
			}
			return e.name.toLowerCase().includes( term )
				|| e.type.toLowerCase().includes( term )
				|| e.keywords.some( ( k ) => k.toLowerCase().includes( term ) );
		} );
	} );

	protected selectCategory( cat: string | null ): void {
		this.category.set( this.category() === cat ? null : cat );
	}
}
