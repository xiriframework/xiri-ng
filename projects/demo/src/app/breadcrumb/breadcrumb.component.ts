import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';

@Component( {
	            selector: 'app-breadcrumb',
	            templateUrl: './breadcrumb.component.html',
	            styleUrl: './breadcrumb.component.scss',
	            imports: [ XiriPageHeaderComponent, XiriSectionComponent, XiriBreadcrumbComponent, GoCodePanelComponent ]
            } )
export class BreadcrumbComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Navigation & Layout' },
		{ label: 'Breadcrumb' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Breadcrumb Navigation',
		subtitle: 'Navigationspfad mit konfigurierbaren Links',
		icon: 'account_tree',
		iconColor: 'primary',
	};

	sectionBasic: XiriSectionSettings = {
		title: 'Basic Breadcrumbs',
		subtitle: 'Simple breadcrumb with home icon and text items. Last item without link is active (non-clickable); with link it becomes clickable.',
		icon: 'chevron_right',
	};

	sectionDeep: XiriSectionSettings = {
		title: 'Deep Navigation',
		subtitle: 'Longer breadcrumb path with multiple levels. Wraps on small screens.',
		icon: 'account_tree',
		iconColor: 'accent',
	};

	sectionExternal: XiriSectionSettings = {
		title: 'External Links',
		subtitle: 'Breadcrumbs with extern: true open in a new tab via href instead of routerLink.',
		icon: 'open_in_new',
	};

	sectionIcons: XiriSectionSettings = {
		title: 'All Items with Icons',
		subtitle: 'Every item has a Material icon via the icon property.',
		icon: 'local_offer',
		iconColor: 'primary',
	};

	basicBreadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/', icon: 'home' },
		{ label: 'Settings', link: '/Settings' },
		{ label: 'Profile', link: '/Breadcrumb' },
	];

	longBreadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Dashboard', link: '/', icon: 'dashboard' },
		{ label: 'Projects', link: '/Projects' },
		{ label: 'Project Alpha', link: '/Projects/Alpha' },
		{ label: 'Tasks', link: '/Projects/Alpha/Tasks' },
		{ label: 'Task #42' },
	];

	externalBreadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/', icon: 'home' },
		{ label: 'External Docs', link: 'https://angular.dev', extern: true },
		{ label: 'Current Page' },
	];

	iconBreadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/', icon: 'home' },
		{ label: 'Users', link: '/Users', icon: 'people' },
		{ label: 'Admin', link: '/Users/Admin', icon: 'admin_panel_settings' },
		{ label: 'Details', icon: 'info' },
	];

	goBreadcrumbBasicCode = `p := page.NewPage()
p.Bread("Home", "/", false)
p.Bread("Settings", "/Settings", false)
p.Bread("Profile", "", false)`;

	goBreadcrumbDeepCode = `p := page.NewPage()
p.Bread("Dashboard", "/", false)
p.Bread("Projects", "/Projects", false)
p.Bread("Project Alpha", "/Projects/Alpha", false)
p.Bread("Tasks", "/Projects/Alpha/Tasks", false)
p.Bread("Task #42", "", false)`;

	goBreadcrumbExternCode = `p := page.NewPage()
p.Bread("Home", "/", false)
p.Bread("External Docs", "https://angular.dev", true)
p.Bread("Current Page", "", false)`;

	goBreadcrumbIconCode = `// Icons werden über NewBreadcrumbItem gesetzt
items := []page.BreadcrumbItem{
    page.NewBreadcrumbItem("Home", "/", false),
    page.NewBreadcrumbItem("Users", "/Users", false),
    page.NewBreadcrumbItem("Admin", "/Users/Admin", false),
    page.NewBreadcrumbItem("Details", "", false),
}`;
}
