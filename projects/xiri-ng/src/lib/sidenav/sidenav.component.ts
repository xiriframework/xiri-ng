import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input } from '@angular/core';
import { filter } from "rxjs";
import { Event, NavigationEnd, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemMeta, MatListItemTitle } from '@angular/material/list';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

export interface XiriSidebarSettings {
	
	prefix: string
	fields: XiriNavigationField[]
}

export interface XiriNavigationField {
	name: string
	link?: string
	icon: string
	iconSet?: string
	extern?: string
	active?: boolean
	path?: string
	regex?: RegExp
	
	menu?: boolean
	showSubmenu?: boolean
	sub?: XiriNavigationField[]
}

@Component( {
	            selector: 'xiri-sidenav',
	            templateUrl: './sidenav.component.html',
	            styleUrls: [ './sidenav.component.scss' ],
	            imports: [
		            MatProgressSpinner,
		            MatListItem,
		            RouterLink,
		            MatIcon,
		            MatListItemIcon,
		            MatListItemTitle,
		            MatListItemMeta,
	            ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriSidenavComponent {
	
	private router: Router = inject( Router );
	private cdr: ChangeDetectorRef = inject( ChangeDetectorRef );
	
	settings = input<XiriSidebarSettings>();
	loading: boolean = true;
	fields: XiriNavigationField[] = [];
	private prefix: string;
	
	constructor() {

		this.router.events.pipe(
			filter( ( event: Event ) => event instanceof NavigationEnd ),
			takeUntilDestroyed()
		).subscribe( ( route: NavigationEnd ) => {
			this.checkUrl( route.urlAfterRedirects );
		} );

		effect( () => {
			const value = this.settings();

			this.loading = value == null || value.fields == null;

			if ( !this.loading ) {
				this.fields = value.fields;
				this.prefix = value.prefix;

				for ( let i = 0; i != this.fields.length; i++ ) {
					let field = this.fields[ i ];

					if ( field.path )
						field.regex = new RegExp( '^' + field.path )
				}

				this.checkUrl( this.router.url );
			} else {
				this.fields = [];
			}
		} );
	}
	
	private checkUrl( url: string ): void {
		
		if ( !this.fields )
			return;
		
		if ( this.prefix ) {
			if ( url.startsWith( this.prefix ) )
				url = url.substring( this.prefix.length );
		}
		
		for ( let i = 0; i != this.fields.length; i++ ) {
			
			let field = this.fields[ i ];
			
			if ( field.menu ) {
				
				let found = false;
				for ( let j = 0; j != field.sub.length; j++ ) {
					let sub = field.sub[ j ];
					sub.active = sub.link == url;
					if ( sub.active || ( field.regex && field.regex.test( url ) ) ) {
						field.active = true;
						found = true;
					}
				}
				
				field.active = found;
				field.showSubmenu = found;
				
			} else {
				field.active = field.link == url;
				if ( field.active )
					continue;

				if ( field.regex && field.regex.test( url ) )
					field.active = true;
			}
		}

		this.cdr.markForCheck();
	}
	
}
