import { afterNextRender, ChangeDetectorRef, Component, DestroyRef, effect, ElementRef, inject, input } from '@angular/core';
import { filter } from "rxjs";
import { Event, NavigationEnd, Router, RouterLink } from "@angular/router";
import { XiriUrlPipe } from "../pipes/url.pipe";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemMeta, MatListItemTitle } from '@angular/material/list';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';

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
	
	// Leaves the entry out entirely — it never reaches the DOM, so no routerLink
	// stays behind. Meant for a backend that omits routes a user cannot open;
	// client-side filtering is not authorization, the routes must be gated anyway.
	hide?: boolean

	menu?: boolean
	showSubmenu?: boolean
	sub?: XiriNavigationField[]
}

let nextUniqueIdXiriSidenav = 0;

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
	            host: { '(click)': 'onClick( $event )' },
            } )
export class XiriSidenavComponent {

	// Verknüpft Gruppen-Schalter und Untermenü (aria-controls), eindeutig auch bei mehreren Sidenavs.
	protected readonly uid = `xiri-sidenav-${ nextUniqueIdXiriSidenav++ }`;
	
	private router: Router = inject( Router );
	private cdr: ChangeDetectorRef = inject( ChangeDetectorRef );
	// The surrounding mat-sidenav/mat-drawer, if any — MatSidenav provides itself as MatDrawer.
	private drawer = inject( MatDrawer, { optional: true } );
	private container = inject( MatDrawerContainer, { optional: true } );
	
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

		// The drawer is width: auto, so a scrollbar appearing in it (submenu expanded, nav loaded)
		// widens it. MatDrawerContainer only recomputes the content margin on open/mode change or
		// window resize, so the drawer would cover the content's left padding.
		const host: HTMLElement = inject( ElementRef ).nativeElement;
		const destroyRef = inject( DestroyRef );
		afterNextRender( () => {
			const drawerEl = host.closest( '.mat-drawer' );
			if ( !this.container || !drawerEl || typeof ResizeObserver === 'undefined' )
				return;

			const observer = new ResizeObserver( () => this.container?.updateContentMargins() );
			observer.observe( drawerEl );
			destroyRef.onDestroy( () => observer.disconnect() );
		} );
	}
	
	// An overlay drawer (mobile) covers the page, so close it once a link is chosen.
	// Clicks on submenu toggles are no <a> and keep it open; a side drawer (desktop) stays.
	protected onClick( event: MouseEvent ): void {

		if ( this.drawer?.mode === 'over' && ( event.target as Element ).closest( 'a' ) )
			this.drawer.close();
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

		// A hidden entry is not rendered, so it must not activate or expand its parent either.
		if ( field.hide ) {
			field.active = false;
			return false;
		}

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
