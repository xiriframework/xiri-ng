import { Component, signal } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriHeaderComponent, XiriHeaderSettings } from 'projects/xiri-ng/src/lib/header/header.component';
import { XiriButtonlineComponent, XiriButtonlineSettings } from 'projects/xiri-ng/src/lib/buttonline/buttonline.component';
import { XiriSearchComponent } from 'projects/xiri-ng/src/lib/search/search.component';
import { XiriTabsComponent, XiriTabsSettings } from 'projects/xiri-ng/src/lib/tabs/tabs.component';
import { XiriExpansionComponent, XiriExpansionSettings } from 'projects/xiri-ng/src/lib/expansion/expansion.component';
import { XiriDynComponentComponent } from 'projects/xiri-ng/src/lib/dyncomponent/dyncomponent.component';
import { XiriDynData } from 'projects/xiri-ng/src/lib/dyncomponent/dyndata.interface';
import { XiriCardSettings } from 'projects/xiri-ng/src/lib/card/card.component';
import { XiriFormSettings } from 'projects/xiri-ng/src/lib/form/form.component';
import { XiriListSettings } from 'projects/xiri-ng/src/lib/list/list.component';

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
		            XiriExpansionComponent,
		            XiriDynComponentComponent
	            ]
            } )
export class NavigationComponent {

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Navigation & Layout',
		subtitle: 'Header, Buttons, Suche, Tabs und Expansion',
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

	sectionExpansion: XiriSectionSettings = {
		title: 'XiriExpansionComponent',
		subtitle: 'Collapsible panels. Three variants: multi+flat+lazy, single+unload, togglePosition+hideToggle.',
		icon: 'expand_more',
		iconColor: 'accent',
	};

	// --- Headers ---
	header = <XiriHeaderSettings> { text: 'Default (null)', color: 'primary', size: null };
	headerX1 = <XiriHeaderSettings> { text: 'Size x1', size: 'x1', color: 'primary' };
	headerX15 = <XiriHeaderSettings> { text: 'Size x15', size: 'x15', color: 'accent' };
	headerX2 = <XiriHeaderSettings> { text: 'Size x2', size: 'x2', color: 'primary' };
	headerX25 = <XiriHeaderSettings> { text: 'Size x25', size: 'x25', color: 'warn' };
	headerX3 = <XiriHeaderSettings> { text: 'Size x3', size: 'x3', color: 'primary' };

	// --- Buttonline ---
	buttonline = <XiriButtonlineSettings> {
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
	};

	buttonline2 = <XiriButtonlineSettings> {
		class: 'right',
		buttons: [
			{ text: 'link', type: 'raised', hint: 'link', action: 'link', url: '/Forms' },
			{ text: 'href', type: 'raised', hint: 'href', action: 'href', url: 'https://www.google.at', color: 'primary' },
			{ text: 'dialog', type: 'raised', hint: 'dialog', action: 'dialog', url: 'Test', color: 'tertiary' },
			{ text: 'api', type: 'raised', hint: 'api', action: 'api', url: 'Test/Wait/Wait', color: 'accent' },
			{ text: 'download', type: 'raised', hint: 'download', action: 'download', url: 'Test', color: 'warn' },
		]
	};

	// --- Search ---
	searchFocus = signal<number>( 0 );
	searchReset = signal<number>( 0 );

	searchChange( ev: any ): void {
		console.log( 'Search:', ev );
		setTimeout( () => {
			this.searchFocus.set( this.searchFocus() + 1 );
		}, 1000 );
	}

	// --- Tabs ---
	tabsSettings: XiriTabsSettings = {
		tabs: [
			{
				label: 'Cards',
				icon: 'dashboard',
				data: <XiriDynData[]> [
					{
						type: 'card',
						data: <XiriCardSettings> {
							header: 'Card 1',
							headerIcon: 'home',
							headerSub: 'First card example',
							data: { 'Name': 'Example Item', 'Status': 'Active', 'Created': '2024-01-15' }
						}
					},
					{
						type: 'card',
						data: <XiriCardSettings> {
							header: 'Card 2',
							headerIcon: 'person',
							data: { 'User': 'John Doe', 'Role': 'Administrator' }
						}
					}
				]
			},
			{
				label: 'List',
				icon: 'list',
				data: <XiriDynData[]> [
					{
						type: 'list',
						data: <XiriListSettings> {
							sections: [ {
								name: 'Section 1',
								data: [
									{ name: 'Dashboard', info: 'Main overview', icon: 'dashboard', iconColor: 'primary', url: '/Overview' },
									{ name: 'Settings', info: 'Configuration', icon: 'settings', iconColor: 'accent', url: '/Overview' },
								]
							} ]
						}
					}
				]
			},
			{
				label: 'Form (Lazy)',
				icon: 'edit',
				lazy: true,
				data: <XiriDynData[]> [
					{
						type: 'form',
						data: <XiriFormSettings> {
							header: 'Sample Form (Lazy Loaded)',
							fields: [
								{ id: 'name', name: 'Name', type: 'text', required: true },
								{ id: 'email', name: 'Email', type: 'email' },
							],
							buttons: [
								{ text: 'Submit', type: 'raised', action: 'submit', color: 'primary' }
							]
						}
					}
				]
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

	// --- Expansion ---
	expansionSettings: XiriExpansionSettings = {
		multi: true,
		displayMode: 'flat',
		lazy: true,
		panels: [
			{
				title: 'Users',
				description: 'User management',
				icon: 'person',
				expanded: true,
				data: <XiriDynData[]> [ {
					type: 'card',
					data: <XiriCardSettings> {
						header: 'User Info',
						headerIcon: 'person',
						headerSub: 'Lazy loaded',
						data: { 'Name': 'John Doe', 'Role': 'Administrator', 'Status': 'Active' }
					}
				} ]
			},
			{
				title: 'Settings',
				description: 'System configuration',
				icon: 'settings',
				data: <XiriDynData[]> [ {
					type: 'card',
					data: <XiriCardSettings> {
						header: 'System',
						headerIcon: 'settings',
						data: { 'Theme': 'Dark', 'Language': 'English', 'Version': '1.0.0' }
					}
				} ]
			},
			{
				title: 'Reports',
				description: 'Read-only',
				icon: 'assessment',
				disabled: true,
				data: []
			}
		]
	};

	expansionSettings2: XiriExpansionSettings = {
		multi: false,
		displayMode: 'default',
		unload: true,
		panels: [
			{
				title: 'Panel A',
				description: 'Unloaded when closed',
				icon: 'folder',
				data: <XiriDynData[]> [ {
					type: 'card',
					data: <XiriCardSettings> {
						header: 'Panel A Content',
						headerIcon: 'folder',
						data: { 'Info': 'This content is unloaded when the panel is closed' }
					}
				} ]
			},
			{
				title: 'Panel B',
				icon: 'inventory',
				data: <XiriDynData[]> [ {
					type: 'card',
					data: <XiriCardSettings> {
						header: 'Panel B Content',
						headerIcon: 'inventory',
						data: { 'Info': 'Only one panel open at a time (multi: false)' }
					}
				} ]
			}
		]
	};

	expansionSettings3: XiriExpansionSettings = {
		multi: true,
		displayMode: 'default',
		togglePosition: 'before',
		hideToggle: true,
		panels: [
			{
				title: 'Toggle Before Title',
				description: 'togglePosition: before, hideToggle: true',
				icon: 'swap_horiz',
				expanded: true,
				data: <XiriDynData[]> [ {
					type: 'card',
					data: <XiriCardSettings> {
						header: 'Content',
						headerIcon: 'swap_horiz',
						data: { 'Info': 'Toggle icon is hidden, toggle position is before the title' }
					}
				} ]
			},
			{
				title: 'Second Panel',
				icon: 'visibility_off',
				data: <XiriDynData[]> [ {
					type: 'card',
					data: <XiriCardSettings> {
						header: 'Hidden Toggle',
						headerIcon: 'visibility_off',
						data: { 'Info': 'No visible expand arrow' }
					}
				} ]
			}
		]
	};

	ret( event: any ): void {
		console.log( 'button ret', event );
	}
}
