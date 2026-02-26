import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriInfopointComponent, XiriInfopointSettings } from 'projects/xiri-ng/src/lib/infopoint/infopoint.component';
import { XiriImagetextComponent, XiriImagetextSettings } from 'projects/xiri-ng/src/lib/imagetext/imagetext.component';
import { XiriLinksComponent, XiriLinksSettings } from 'projects/xiri-ng/src/lib/links/links.component';
import { XiriListComponent, XiriListSettings } from 'projects/xiri-ng/src/lib/list/list.component';
import { XiriCardlinkComponent, XiriCardlinkSettings } from 'projects/xiri-ng/src/lib/cardlink/cardlink.component';
import { SafehtmlPipe } from 'projects/xiri-ng/src/lib/pipes/safehtml.pipe';
import { MatCard } from '@angular/material/card';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';

@Component( {
	            selector: 'app-display',
	            templateUrl: './display.component.html',
	            styleUrl: './display.component.scss',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriInfopointComponent,
		            XiriImagetextComponent,
		            XiriLinksComponent,
		            XiriListComponent,
		            XiriCardlinkComponent,
		            SafehtmlPipe,
		            MatCard,
		            GoCodePanelComponent,
		            XiriBreadcrumbComponent
	            ]
            } )
export class DisplayComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Data Display' },
		{ label: 'Components' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Data Display',
		subtitle: 'Anzeige-Komponenten: Infopoint, Links, Liste und SafeHtml',
		icon: 'dataset',
		iconColor: 'primary',
	};

	sectionInfopoint: XiriSectionSettings = {
		title: 'XiriInfopointComponent',
		subtitle: 'Displays an icon with text and optional info tooltip.',
		icon: 'info',
		iconColor: 'accent',
	};

	sectionImagetext: XiriSectionSettings = {
		title: 'XiriImagetextComponent',
		subtitle: 'Image with header, icon, and info text. Suitable for preview cards.',
		icon: 'image',
		iconColor: 'primary',
	};

	sectionLinks: XiriSectionSettings = {
		title: 'XiriLinksComponent',
		subtitle: 'Link list with icons and various actions (link, dialog, href).',
		icon: 'link',
		iconColor: 'accent',
	};

	sectionList: XiriSectionSettings = {
		title: 'XiriListComponent',
		subtitle: 'Sectioned list with icons, favorite functionality, and navigation links.',
		icon: 'list',
	};

	sectionCardlink: XiriSectionSettings = {
		title: 'XiriCardlinkComponent',
		subtitle: 'Navigation cards with icon, text, and subtitle. Link to other pages.',
		icon: 'grid_view',
		iconColor: 'primary',
	};

	sectionSafeHtml: XiriSectionSettings = {
		title: 'SafehtmlPipe',
		subtitle: 'Pipe for safe rendering of HTML content. Prevents XSS while allowing permitted tags.',
		icon: 'code',
		iconColor: 'accent',
	};

	// --- Infopoint ---
	infopoint = <XiriInfopointSettings> {
		text: 'Test',
		info: 'Info text longer',
		icon: 'wifi',
		iconColor: 'red'
	};
	infopoint2 = <XiriInfopointSettings> {
		info: 'Info',
		icon: 'directions_car',
		iconColor: 'emerald'
	};

	// --- ImageText ---
	imagetext1: XiriImagetextSettings = {
		url: 'https://via.placeholder.com/300x200',
		info: 'Sample image',
		header: 'Project Preview',
		headerIcon: 'image',
		headerIconColor: 'primary',
		headerSub: 'With icon and subtitle'
	};
	imagetext2: XiriImagetextSettings = {
		url: 'https://via.placeholder.com/300x200',
		info: 'Second example',
		header: 'Dashboard',
		headerIcon: 'dashboard',
		headerIconColor: 'accent',
		headerSub: 'Status view'
	};

	// --- Links ---
	linksSettings: XiriLinksSettings = {
		header: 'Helpful Links',
		headerIcon: 'link',
		headerIconColor: 'primary',
		headerSub: 'External and internal links',
		data: [
			{ text: 'Home', type: 'flat', action: 'link', icon: 'home', url: '/Overview' },
			{ text: 'Forms', type: 'flat', action: 'link', icon: 'edit', url: '/Forms' },
			{ text: 'Info Dialog', type: 'flat', action: 'dialog', icon: 'info', url: '' },
			{ text: 'Tables', type: 'flat', action: 'link', icon: 'table_chart', url: '/Tables' }
		]
	};

	// --- List ---
	listSettings: XiriListSettings = {
		sections: [ {
			name: 'Favorites',
			data: [ {
				name: 'test',
				info: 'info',
				icon: 'home',
				iconColor: 'emerald',
				url: 'test',
				hasFavorite: true,
				isFavorite: true
			}, {
				name: 'test',
				info: 'info',
				icon: 'home',
				iconColor: 'emerald',
				url: 'test',
				hasFavorite: true,
			}, {
				name: 'test',
				info: 'info',
				icon: 'home',
				iconColor: 'emerald',
				url: 'test',
				hasFavorite: true,
			} ]
		}, {
			name: 'Various Icons',
			data: [ {
				name: 'Dashboard',
				info: 'Main overview',
				icon: 'dashboard',
				iconColor: 'primary',
				url: '/Overview',
				hasFavorite: true,
				isFavorite: false,
				favoriteUrl: 'Test/Favorite/',
				favoriteHint: 'Mark as favorite',
			}, {
				name: 'Settings',
				info: 'System configuration',
				icon: 'settings',
				iconColor: 'accent',
				url: '/Services',
				hasFavorite: true,
				isFavorite: true,
				favoriteUrl: 'Test/Favorite/',
				favoriteHint: 'Remove favorite',
			}, {
				name: 'Reports',
				info: 'Analytics and reports',
				icon: 'assessment',
				iconColor: 'warn',
				url: '/Tables',
			}, {
				name: 'Notifications',
				info: 'Recent messages',
				icon: 'notifications',
				iconColor: 'orange',
				url: '/Feedback',
			} ]
		} ]
	};

	// --- Cardlinks ---
	cardlinks: XiriCardlinkSettings[] = [
		{ link: '/Overview', icon: 'home', iconSet: 'material-symbols-outlined', text: 'Home', sub: 'Go to home page' },
		{ link: '/Forms', icon: 'edit', iconSet: 'material-symbols-outlined', text: 'Forms', sub: 'Form demos' },
		{ link: '/Tables', icon: 'table_chart', iconSet: 'material-symbols-outlined', text: 'Tables', sub: 'Table demos' },
		{ link: '/Feedback', icon: 'widgets', iconSet: 'material-symbols-outlined', text: 'Feedback', sub: 'Feedback demos' }
	];

	// --- SafeHtml ---
	safeHtmlExample = '<strong style="color: green;">Safe HTML content</strong> with <em>formatting</em> and <a href="/Overview">link</a>.';

	goImagetextCode = `it := imagetext.New(
    "https://via.placeholder.com/300x200",
    "Sample image",
).
    Header("Project Preview").
    HeaderSub("With icon and subtitle").
    HeaderIcon("image", "primary")`;

	goLinksCode = `l := links.New().
    Header("Helpful Links").
    HeaderSub("External and internal links").
    HeaderIcon("link", "primary")

l.Add(button.NewLinkButton("Home", "/Overview", "home"))
l.Add(button.NewLinkButton("Forms", "/Forms", "edit"))
l.Add(button.NewDialogButton("Info Dialog", "", "info"))
l.Add(button.NewLinkButton("Tables", "/Tables", "table_chart"))`;
}
