import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { XiriDateService } from "projects/xiri-ng/src/lib/services/date.service";
import { ThemeService } from "projects/xiri-ng/src/lib/services/theme.service";
import { Subscription } from "rxjs";
import { BreakpointObserver, Breakpoints, BreakpointState } from "@angular/cdk/layout";
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { XiriSidebarSettings } from "projects/xiri-ng/src/lib/sidenav/sidenav.component";
import { MatIconRegistry, MatIcon } from "@angular/material/icon";
import { XiriSidenavComponent } from 'projects/xiri-ng/src/lib/sidenav/sidenav.component';
import { MatNavList } from '@angular/material/list';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { de } from "date-fns/locale/de";

@Component( {
	            selector: 'app-root',
	            templateUrl: './app.component.html',
	            styleUrl: './app.component.scss',
	            imports: [ MatToolbar,
	                       MatToolbarRow,
	                       MatIconButton,
	                       MatIcon,
	                       RouterLink,
	                       MatTooltip,
	                       MatSidenavContainer,
	                       MatSidenav,
	                       MatNavList,
	                       XiriSidenavComponent,
	                       MatSidenavContent,
	                       RouterOutlet ]
            } )
export class AppComponent implements OnInit, OnDestroy {
	private breakpointObserver = inject( BreakpointObserver );
	private router = inject( Router );
	private iconRegistry = inject( MatIconRegistry );
	private dateService = inject( XiriDateService );
	protected themeService = inject( ThemeService );


	public navsettings: XiriSidebarSettings = {
		prefix: '/',
		fields: [ {
			name: 'Overview',
			icon: 'home',
			link: 'Overview'
		}, {
			name: 'Forms',
			icon: 'edit_note',
			menu: true,
			regex: /^(Forms|Dates|Selects|SpecialFields)/,
			sub: [ {
				name: 'Basic Fields',
				icon: 'text_fields',
				link: 'Forms'
			}, {
				name: 'Date & Time',
				icon: 'calendar_month',
				link: 'Dates'
			}, {
				name: 'Select Fields',
				icon: 'checklist',
				link: 'Selects'
			}, {
				name: 'Special Fields',
				icon: 'extension',
				link: 'SpecialFields'
			} ]
		}, {
			name: 'Tables',
			icon: 'table_chart',
			menu: true,
			regex: /^(Tables|InlineEditTable)/,
			sub: [ {
				name: 'Tables',
				icon: 'table_chart',
				link: 'Tables'
			}, {
				name: 'Inline Edit',
				icon: 'edit_note',
				link: 'InlineEditTable'
			} ]
		}, {
			name: 'Cards',
			icon: 'dashboard',
			link: 'Cards'
		}, {
			name: 'Navigation & Layout',
			icon: 'menu_open',
			menu: true,
			regex: /^(Navigation|Breadcrumb|Layout)/,
			sub: [ {
				name: 'Layout',
				icon: 'menu_open',
				link: 'Navigation'
			}, {
				name: 'Page Layout',
				icon: 'space_dashboard',
				link: 'Layout'
			}, {
				name: 'Breadcrumb',
				icon: 'chevron_right',
				link: 'Breadcrumb'
			} ]
		}, {
			name: 'Feedback & Status',
			icon: 'notifications',
			menu: true,
			regex: /^(Feedback|Snackbar|Skeleton|EmptyState)/,
			sub: [ {
				name: 'Alerts & Status',
				icon: 'report',
				link: 'Feedback'
			}, {
				name: 'Snackbar',
				icon: 'chat_bubble',
				link: 'Snackbar'
			}, {
				name: 'Skeleton',
				icon: 'hourglass_empty',
				link: 'Skeleton'
			}, {
				name: 'Empty State',
				icon: 'inbox',
				link: 'EmptyState'
			} ]
		}, {
			name: 'Data Display',
			icon: 'visibility',
			menu: true,
			regex: /^(Display|Stats|Timeline|BarCharts)/,
			sub: [ {
				name: 'Components',
				icon: 'visibility',
				link: 'Display'
			}, {
				name: 'Stats / KPI',
				icon: 'bar_chart',
				link: 'Stats'
			}, {
				name: 'Bar Charts',
				icon: 'stacked_bar_chart',
				link: 'BarCharts'
			}, {
				name: 'Timeline',
				icon: 'timeline',
				link: 'Timeline'
			} ]
		}, {
			name: 'Workflows',
			icon: 'account_tree',
			link: 'Workflow'
		}, {
			name: 'Dynamic',
			icon: 'dynamic_form',
			link: 'Dynamic'
		}, {
			name: 'Services',
			icon: 'build',
			link: 'Services'
		}, {
			name: 'Server (DynPage)',
			icon: 'cloud',
			menu: true,
			regex: /^(Home\/|Test\/)/,
			sub: [ {
				name: 'Login',
				icon: 'login',
				link: 'Home/Login/Test',
				path: 'Home/Login/'
			}, {
				name: 'Dialogs',
				icon: 'chat_bubble',
				link: 'Test/Test/Dialogs'
			}, {
				name: 'Query',
				icon: 'search',
				link: 'Test/Query/Page'
			}, {
				name: 'Simulation',
				icon: 'play_arrow',
				link: 'Test/Test/Home',
				path: 'Test/Test/'
			}, {
				name: 'Groups',
				icon: 'group',
				link: 'Test/Group/Table',
				path: 'Test/Group/'
			}, {
				name: 'Form',
				icon: 'description',
				link: 'Test/Form/Page',
				path: 'Test/Form/'
			} ]
		} ]
	};
	public navLoaded: boolean = false;

	public isSmall = false;
	public opened = false;
	private sub: Subscription = null;
	private subSidebar: Subscription = null;

	constructor() {

		this.iconRegistry.setDefaultFontSetClass( 'material-symbols-outlined' );
		this.dateService.setLocale( 'de', de );
		this.dateService.setTimezone( 'Europe/London' );
	}

	ngOnInit() {

		this.sub = this.breakpointObserver.observe( [ Breakpoints.XSmall, Breakpoints.Small ] )
			.subscribe( ( state: BreakpointState ) => {
				this.isSmall = state.matches;
				this.opened = !state.matches;
			} );

		this.navLoaded = true;
	}

	ngOnDestroy() {
		if ( this.sub )
			this.sub.unsubscribe();
		if ( this.subSidebar )
			this.subSidebar.unsubscribe();
	}
}
