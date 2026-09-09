import { Component, signal } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriHeaderComponent, XiriHeaderSettings } from 'projects/xiri-ng/src/lib/header/header.component';
import { XiriButtonlineComponent, XiriButtonlineSettings } from 'projects/xiri-ng/src/lib/buttonline/buttonline.component';
import { XiriSearchComponent } from 'projects/xiri-ng/src/lib/search/search.component';
import { XiriTabsComponent, XiriTabsSettings } from 'projects/xiri-ng/src/lib/tabs/tabs.component';
import { XiriTableSettings } from 'projects/xiri-ng/src/lib/table/table.component';
import { XiriDynComponentComponent } from 'projects/xiri-ng/src/lib/dyncomponent/dyncomponent.component';
import { XiriDynData } from 'projects/xiri-ng/src/lib/dyncomponent/dyndata.interface';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';
import { XiriCardSettings } from 'projects/xiri-ng/src/lib/card/card.component';
import { XiriFormSettings } from 'projects/xiri-ng/src/lib/form/form.component';
import { XiriListSettings } from 'projects/xiri-ng/src/lib/list/list.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { XiriButtonResult } from 'projects/xiri-ng/src/lib/button/button.component';

@Component( {
	            selector: 'app-navigation',
	            templateUrl: './navigation.component.html',
	            styleUrl: './navigation.component.scss',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriHeaderComponent,
		            XiriButtonlineComponent,
		            XiriSearchComponent,
		            XiriTabsComponent,
		            XiriDynComponentComponent,
		            GoCodePanelComponent,
		            XiriBreadcrumbComponent
	            ]
            } )
export class NavigationComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Navigation & Layout' },
		{ label: 'Layout' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Navigation & Layout',
		subtitle: 'Header, Buttons, Suche und Tabs',
		icon: 'navigation',
		iconColor: 'primary',
	};

	sectionHeader: XiriSectionSettings = {
		title: 'XiriHeaderComponent',
		subtitle: 'Headings in 6 sizes (null, x1, x15, x2, x25, x3) and 3 colors (primary, accent, warn).',
		icon: 'title',
		iconColor: 'primary',
	};

	sectionButtonline: XiriSectionSettings = {
		title: 'XiriButtonlineComponent',
		subtitle: '8 button styles: raised, basic, stroked, flat, minifab, fab, icon, icontext. Actions: debug, link, href, dialog, api, download.',
		icon: 'smart_button',
		iconColor: 'accent',
	};

	sectionSearch: XiriSectionSettings = {
		title: 'XiriSearchComponent',
		subtitle: 'Search field with focus/reset/escape options. Emits search text via (changed) event.',
		icon: 'search',
	};

	sectionTabs: XiriSectionSettings = {
		title: 'XiriTabsComponent',
		subtitle: 'Tab navigation with lazy loading, dynamicHeight, and alignTabs. Each tab contains DynData content.',
		icon: 'tab',
		iconColor: 'primary',
	};

	// --- Headers ---
	header = { text: 'Default', color: 'primary', size: '' } as XiriHeaderSettings;
	headerX1 = { text: 'Size x1', size: 'x1', color: 'primary' } as XiriHeaderSettings;
	headerX15 = { text: 'Size x15', size: 'x15', color: 'accent' } as XiriHeaderSettings;
	headerX2 = { text: 'Size x2', size: 'x2', color: 'primary' } as XiriHeaderSettings;
	headerX25 = { text: 'Size x25', size: 'x25', color: 'warn' } as XiriHeaderSettings;
	headerX3 = { text: 'Size x3', size: 'x3', color: 'primary' } as XiriHeaderSettings;

	// --- Buttonline ---
	buttonline = {
		class: 'right',
		buttons: [
			{ text: 'raised', type: 'raised', hint: 'raised', action: 'debug' },
			{ text: 'basic', type: 'basic', hint: 'basic', default: true, action: 'debug' },
			{ text: 'stroked', type: 'stroked', hint: 'stroked', default: true, action: 'debug' },
			{ text: 'flat', type: 'flat', hint: 'flat', default: true, action: 'debug' },
			{ text: 'minifab', type: 'minifab', hint: 'minifab', icon: 'home', default: true, action: 'debug' },
			{ text: 'fab', type: 'fab', hint: 'fab', icon: 'home', default: true, action: 'debug' },
			{ text: 'icon', type: 'icon', hint: 'icon', icon: 'home', default: true, action: 'debug' },
			{ text: 'icontext', type: 'icontext', hint: 'icontext', icon: 'home', default: true, action: 'debug', disabled: true }
		]
	} as XiriButtonlineSettings;

	buttonline2 = {
		class: 'right',
		buttons: [
			{ text: 'link', type: 'raised', hint: 'link', action: 'link', url: '/Forms' },
			{ text: 'href', type: 'raised', hint: 'href', action: 'href', url: 'https://www.google.at', color: 'primary' },
			{ text: 'dialog', type: 'raised', hint: 'dialog', action: 'dialog', url: 'Test', color: 'tertiary' },
			{ text: 'api', type: 'raised', hint: 'api', action: 'api', url: 'Test/Wait/Wait', color: 'accent' },
			{ text: 'download', type: 'raised', hint: 'download', action: 'download', url: 'Test', color: 'warn' },
		]
	} as XiriButtonlineSettings;

	// --- Search ---
	searchFocus = signal<number>( 0 );
	searchReset = signal<number>( 0 );

	searchChange( ev: string ): void {
		console.log( 'Search:', ev );
		setTimeout( () => {
			this.searchFocus.set( this.searchFocus() + 1 );
		}, 1000 );
	}

	// --- Tabs ---
	// Gleicher Inhalt in „Cards" und „Cards (randlos)": zeigt direkt, dass Cards ohne Padding
	// an der Kante kleben und der Tab-Body ihre Schatten abschneidet.
	private readonly tabCards: XiriDynData[] = [
		{
			type: 'card',
			data: {
				header: 'Card 1',
				headerIcon: 'home',
				headerSub: 'First card example',
				data: { 'Name': 'Example Item', 'Status': 'Active', 'Created': '2024-01-15' }
			} as XiriCardSettings
		},
		{
			type: 'card',
			data: {
				header: 'Card 2',
				headerIcon: 'person',
				data: { 'User': 'John Doe', 'Role': 'Administrator' }
			} as XiriCardSettings
		}
	];

	tabsSettings: XiriTabsSettings = {
		tabs: [
			{
				label: 'Cards',
				icon: 'dashboard',
				data: this.tabCards
			},
			{
				label: 'Cards (randlos)',
				icon: 'dashboard',
				noPadding: true,
				data: this.tabCards
			},
			{
				// noPadding: Tabelle sitzt bündig im Tab-Body. Nur für randlose Inhalte —
				// Cards brauchen das Padding, sonst schneidet der Tab-Body ihre Schatten ab.
				label: 'Table (randlos)',
				icon: 'table_chart',
				noPadding: true,
				data: [
					{
						type: 'table',
						data: {
							url: 'Test/Test/Table1Data',
							fields: [
								{ id: 'id', name: 'ID' },
								{ id: 'name', name: 'Name' },
								{ id: 'status', name: 'Status' }
							],
							options: { title: 'Table 1', pagination: true, search: true, sort: true }
						} as XiriTableSettings
					}
				] as XiriDynData[]
			},
			{
				label: 'List',
				icon: 'list',
				data: [
					{
						type: 'list',
						data: {
							sections: [ {
								name: 'Section 1',
								data: [
									{ name: 'Dashboard', info: 'Main overview', icon: 'dashboard', iconColor: 'primary', url: '/Overview' },
									{ name: 'Settings', info: 'Configuration', icon: 'settings', iconColor: 'accent', url: '/Overview' },
								]
							} ]
						} as XiriListSettings
					}
				] as XiriDynData[]
			},
			{
				label: 'Form (Lazy)',
				icon: 'edit',
				lazy: true,
				data: [
					{
						type: 'form',
						data: {
							header: 'Sample Form (Lazy Loaded)',
							fields: [
								{ id: 'name', name: 'Name', type: 'text', required: true },
								{ id: 'email', name: 'Email', type: 'email' },
							],
							buttons: [
								{ text: 'Save', type: 'raised', action: 'submit', color: 'primary' }
							]
						} as XiriFormSettings
					}
				] as XiriDynData[]
			},
			{
				label: 'Disabled',
				icon: 'block',
				disabled: true,
				data: []
			}
		],
		dynamicHeight: true,
		alignTabs: 'start'
	};

	goHeaderCode = `h1 := layout.NewHeader("Default", "primary", "", "")
h2 := layout.NewHeader("Size x1", "primary", "x1", "")
h3 := layout.NewHeader("Size x15", "accent", "x15", "")
h4 := layout.NewHeader("Size x2", "primary", "x2", "")
h5 := layout.NewHeader("Size x25", "accent", "x25", "")
h6 := layout.NewHeader("Size x3", "warn", "x3", "")`;

	goButtonlineCode = `bl := []button.Button{
    button.NewButton("raised", "Raised", "", "primary", ...),
    button.NewButton("basic", "Basic", "", "", ...),
    button.NewButton("stroked", "Stroked", "", "", ...),
    button.NewButton("flat", "Flat", "", "accent", ...),
    button.NewButton("minifab", "", "", "primary", ...),
    button.NewApiButton("API", "url", "primary", "flat", ...),
    button.NewLinkButton("Link", "/path", "icon"),
}`;

	ret( event: XiriButtonResult ): void {
		console.log( 'button ret', event );
	}
}
