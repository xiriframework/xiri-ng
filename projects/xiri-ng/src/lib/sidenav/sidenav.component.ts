import { ChangeDetectorRef, Component, effect, inject, input } from '@angular/core';
import { filter } from "rxjs";
import { Event, NavigationEnd, Router, RouterLink } from "@angular/router";
import { XiriUrlPipe } from "../pipes/url.pipe";
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
		            XiriUrlPipe,
	            ],
            } )
export class XiriSidenavComponent {
	
	private router: Router = inject( Router );
	private cdr: ChangeDetectorRef = inject( ChangeDetectorRef );
	
	settings = input<XiriSidebarSettings>();
	loading = true;
	fields: XiriNavigationField[] = [];
	private prefix = '';
	
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

			if ( !this.loading && value != null ) {
				this.fields = value.fields;
				this.prefix = value.prefix;

				this.compileRegex( this.fields );

				this.checkUrl( this.router.url );
			} else {
				this.fields = [];
			}
		} );
	}
	
	private compileRegex( fields: XiriNavigationField[] ): void {

		if ( !fields )
			return;

		for ( let i = 0; i != fields.length; i++ ) {
			const field = fields[ i ];

			if ( field.path )
				field.regex = new RegExp( '^' + field.path );

			if ( field.sub )
				this.compileRegex( field.sub );
		}
	}

	private checkUrl( url: string ): void {

		if ( !this.fields )
			return;

		if ( this.prefix ) {
			if ( url.startsWith( this.prefix ) )
				url = url.substring( this.prefix.length );
		}

		for ( let i = 0; i != this.fields.length; i++ )
			this.checkField( this.fields[ i ], url );

		this.cdr.markForCheck();
	}

	private checkField( field: XiriNavigationField, url: string ): boolean {

		const matchesSelf = ( field.link != null && field.link == url ) || ( field.regex != null && field.regex.test( url ) );

		if ( field.menu ) {

			let found = false;
			if ( field.sub ) {
				for ( let i = 0; i != field.sub.length; i++ ) {
					if ( this.checkField( field.sub[ i ], url ) )
						found = true;
				}
			}

			field.active = found || matchesSelf;
			field.showSubmenu = field.active;
			return field.active;
		}

		field.active = matchesSelf;
		return field.active;
	}

}
