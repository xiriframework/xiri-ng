import { Component, inject } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { ThemeService } from 'projects/xiri-ng/src/lib/services/theme.service';
import { XiriCardlinkComponent, XiriCardlinkSettings } from 'projects/xiri-ng/src/lib/cardlink/cardlink.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';

@Component( {
	            selector: 'app-overview',
	            templateUrl: './overview.component.html',
	            styleUrl: './overview.component.scss',
	            imports: [ XiriPageHeaderComponent, XiriSectionComponent, XiriCardlinkComponent, MatButton, MatIcon, XiriBreadcrumbComponent ]
            } )
export class OverviewComponent {

	protected themeService = inject( ThemeService );

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', icon: 'home' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'XIRI UI Library',
		subtitle: 'Angular UI Component Library',
		icon: 'dashboard',
		iconColor: 'primary',
	};

	sectionTheme: XiriSectionSettings = {
		title: 'ThemeService',
		icon: 'palette',
	};

	sectionCategories: XiriSectionSettings = {
		title: 'All Categories',
		icon: 'grid_view',
	};

	cardlinks: XiriCardlinkSettings[] = [
		{ link: '/Forms', icon: 'edit_note', iconSet: 'material-symbols-outlined', text: 'Basic Fields', sub: 'Text, Number, Email, Select, ...' },
		{ link: '/Dates', icon: 'calendar_month', iconSet: 'material-symbols-outlined', text: 'Date & Time', sub: 'Date, DateTime, DateRange' },
		{ link: '/Selects', icon: 'checklist', iconSet: 'material-symbols-outlined', text: 'Select Fields', sub: 'MultiSelect, TreeSelect' },
		{ link: '/SpecialFields', icon: 'tune', iconSet: 'material-symbols-outlined', text: 'Special Fields', sub: 'File, Volume, Timelimit' },
		{ link: '/Tables', icon: 'table_chart', iconSet: 'material-symbols-outlined', text: 'Tables', sub: '6 Tables + RawTable' },
		{ link: '/Cards', icon: 'dashboard', iconSet: 'material-symbols-outlined', text: 'Cards', sub: 'Card Variants & DynComponent' },
		{ link: '/Navigation', icon: 'menu_open', iconSet: 'material-symbols-outlined', text: 'Navigation & Layout', sub: 'Header, Buttonline, Search, Tabs' },
		{ link: '/Feedback', icon: 'notifications', iconSet: 'material-symbols-outlined', text: 'Feedback & Status', sub: 'Done, Error, Alert, Dialog' },
		{ link: '/Display', icon: 'visibility', iconSet: 'material-symbols-outlined', text: 'Data Display', sub: 'Infopoint, Links, List, Imagetext' },
		{ link: '/Workflow', icon: 'account_tree', iconSet: 'material-symbols-outlined', text: 'Workflows', sub: 'Stepper, Query + Tabs' },
		{ link: '/Dynamic', icon: 'dynamic_form', iconSet: 'material-symbols-outlined', text: 'Dynamic', sub: 'DynComponent & DynPage' },
		{ link: '/Services', icon: 'build', iconSet: 'material-symbols-outlined', text: 'Services', sub: 'Theme, Data, Date, Number, Storage' },
	];
}
