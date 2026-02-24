import { Component, signal } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriStepperComponent, XiriStepperSettings } from 'projects/xiri-ng/src/lib/stepper/stepper.component';
import { XiriTabsComponent, XiriTabsSettings } from 'projects/xiri-ng/src/lib/tabs/tabs.component';
import { XiriQueryComponent, XiriQuerySettings } from 'projects/xiri-ng/src/lib/query/query.component';
import { XiriDynComponentComponent } from 'projects/xiri-ng/src/lib/dyncomponent/dyncomponent.component';
import { XiriTableSettings } from 'projects/xiri-ng/src/lib/table/table.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';

@Component( {
	            selector: 'app-workflow',
	            templateUrl: './workflow.component.html',
	            styleUrl: './workflow.component.scss',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriStepperComponent,
		            XiriTabsComponent,
		            XiriQueryComponent,
		            XiriDynComponentComponent,
		            XiriBreadcrumbComponent,
		            GoCodePanelComponent
	            ]
            } )
export class WorkflowComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Workflows' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Multi-Step Workflows',
		subtitle: 'Stepper und Query-basierte Tab-Workflows',
		icon: 'linear_scale',
		iconColor: 'primary',
	};

	sectionStepper: XiriSectionSettings = {
		title: 'XiriStepperComponent',
		subtitle: 'Multi-step wizard. Each step defines fields and buttons. The API dynamically provides fields for the next step.',
		icon: 'linear_scale',
		iconColor: 'primary',
	};

	sectionQueryTabs: XiriSectionSettings = {
		title: 'XiriQueryComponent + XiriTabsComponent',
		subtitle: 'DateRange filter combined with tab navigation. Each tab contains a server-side table that responds to the filter.',
		icon: 'filter_list',
		iconColor: 'accent',
	};

	// --- Stepper ---
	stepperSettings: XiriStepperSettings = {
		url: 'Test/Stepper/Step',
		steps: [
			{
				title: 'Personal Info',
				fields: [
					{ id: 'firstName', type: 'text', name: 'First Name', required: true },
					{ id: 'lastName', type: 'text', name: 'Last Name', required: true }
				],
				buttons: [
					{ text: 'Next', type: 'raised', action: 'next', default: true, color: 'primary' }
				]
			},
			{
				title: 'Contact',
				fields: [],
				buttons: []
			},
			{
				title: 'Summary',
				fields: [],
				buttons: []
			}
		]
	};

	// --- Query + Tabs ---
	filterData = signal<any>( null );

	querySettings: XiriQuerySettings = {
		fields: [
			{
				id: 'daterange',
				type: 'daterange',
				name: 'Date Range',
				value: {
					start: Math.floor( ( Date.now() - 7 * 24 * 60 * 60 * 1000 ) / 1000 ),
					end: Math.floor( Date.now() / 1000 )
				}
			}
		]
	};

	tabsSettings: XiriTabsSettings = {
		tabs: [
			{
				label: 'Type A',
				icon: 'category',
				data: [ {
					type: 'table',
					data: <XiriTableSettings> {
						url: '/api/tabs2/typea',
						hasFilter: true,
						fields: [
							{ id: 'id', name: 'ID' },
							{ id: 'name', name: 'Name' },
							{ id: 'date', name: 'Date' },
							{ id: 'status', name: 'Status' }
						],
						options: { reload: true, pagination: true, sort: true, search: true }
					}
				} ]
			},
			{
				label: 'Type B',
				icon: 'inventory_2',
				data: [ {
					type: 'table',
					data: <XiriTableSettings> {
						url: '/api/tabs2/typeb',
						hasFilter: true,
						fields: [
							{ id: 'id', name: 'ID' },
							{ id: 'name', name: 'Name' },
							{ id: 'date', name: 'Date' },
							{ id: 'status', name: 'Status' }
						],
						options: { reload: true, pagination: true, sort: true, search: true }
					}
				} ]
			},
			{
				label: 'Type C',
				icon: 'widgets',
				data: [ {
					type: 'table',
					data: <XiriTableSettings> {
						url: '/api/tabs2/typec',
						hasFilter: true,
						fields: [
							{ id: 'id', name: 'ID' },
							{ id: 'name', name: 'Name' },
							{ id: 'date', name: 'Date' },
							{ id: 'status', name: 'Status' }
						],
						options: { reload: true, pagination: true, sort: true, search: true }
					}
				} ]
			},
			{
				label: 'Type D',
				icon: 'extension',
				data: [ {
					type: 'table',
					data: <XiriTableSettings> {
						url: '/api/tabs2/typed',
						hasFilter: true,
						fields: [
							{ id: 'id', name: 'ID' },
							{ id: 'name', name: 'Name' },
							{ id: 'date', name: 'Date' },
							{ id: 'status', name: 'Status' }
						],
						options: { reload: true, pagination: true, sort: true, search: true }
					}
				} ]
			}
		],
		dynamicHeight: true,
		alignTabs: 'start',
		unload: true
	};

	// --- Query Collapsed ---
	sectionQueryCollapsed: XiriSectionSettings = {
		title: 'XiriQueryComponent (collapsed)',
		subtitle: 'Query with collapsed: true — filter panel starts collapsed and can be expanded by the user.',
		icon: 'filter_list_off',
		iconColor: 'accent',
	};

	filterDataCollapsed = signal<any>( null );

	querySettingsCollapsed: XiriQuerySettings = {
		collapsed: true,
		fields: [
			{
				id: 'daterange',
				type: 'daterange',
				name: 'Date Range',
				value: {
					start: Math.floor( ( Date.now() - 30 * 24 * 60 * 60 * 1000 ) / 1000 ),
					end: Math.floor( Date.now() / 1000 )
				}
			},
			{ id: 'search', type: 'text', name: 'Search' },
			{
				id: 'status', type: 'select', name: 'Status',
				list: [
					{ id: 1, name: 'Active' },
					{ id: 2, name: 'Inactive' },
					{ id: 3, name: 'Pending' }
				]
			}
		]
	};

	goQueryCode = `// Query expanded (default)
q := query.NewQueryWithFormGroup(fg, nil, u, bl, "stateId", nil)

// Query collapsed
q := query.NewQueryWithFormGroup(fg, nil, u, bl, "stateId", nil).
    Collapsed(true)`;

	filterChanged( event: any ) {
		this.filterData.set( event );
	}

	filterChangedCollapsed( event: any ) {
		this.filterDataCollapsed.set( event );
	}
}
