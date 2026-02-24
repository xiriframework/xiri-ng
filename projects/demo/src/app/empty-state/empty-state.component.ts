import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriEmptyStateComponent, XiriEmptyStateSettings } from 'projects/xiri-ng/src/lib/empty-state/empty-state.component';
import { XiriTableComponent, XiriTableSettings } from 'projects/xiri-ng/src/lib/table/table.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';

@Component( {
	            selector: 'app-empty-state',
	            templateUrl: './empty-state.component.html',
	            styleUrl: './empty-state.component.scss',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriEmptyStateComponent,
		            XiriTableComponent,
		            XiriBreadcrumbComponent
	            ]
            } )
export class EmptyStateComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Feedback & Status' },
		{ label: 'Empty State' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Empty State',
		subtitle: 'Leerer Zustand mit Icon, Titel und optionalem Button',
		icon: 'inbox',
		iconColor: 'primary',
	};

	sectionStandalone: XiriSectionSettings = {
		title: 'Standalone',
		icon: 'inbox',
		iconColor: 'accent',
	};

	sectionTableIntegration: XiriSectionSettings = {
		title: 'Table Integration',
		subtitle: 'Tables with emptyState option show a rich empty state instead of plain text.',
		icon: 'table_chart',
		iconColor: 'primary',
	};

	basicEmpty: XiriEmptyStateSettings = {
		icon: 'inbox',
		iconColor: 'gray',
		title: 'No items found',
		description: 'Try adjusting your search or filters to find what you\'re looking for.',
	};

	withButton: XiriEmptyStateSettings = {
		icon: 'add_circle',
		iconColor: 'primary',
		title: 'No projects yet',
		description: 'Create your first project to get started.',
		button: {
			text: 'Create Project',
			type: 'raised',
			action: 'debug',
			icon: 'add',
			color: 'primary'
		}
	};

	tableSettings: XiriTableSettings = {
		data: [],
		fields: [
			{ id: 'name', name: 'Name' },
			{ id: 'email', name: 'Email' },
			{ id: 'status', name: 'Status' },
		],
		options: {
			title: 'Users',
			search: false,
			pagination: false,
			emptyState: {
				icon: 'person_off',
				iconColor: 'gray',
				title: 'No users found',
				description: 'No users match your current filter criteria.',
			}
		}
	};
}
