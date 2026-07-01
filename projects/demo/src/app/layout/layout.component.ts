import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriDividerComponent, XiriDividerSettings } from 'projects/xiri-ng/src/lib/divider/divider.component';
import { XiriStatGridComponent, XiriStatGridSettings } from 'projects/xiri-ng/src/lib/stat-grid/stat-grid.component';
import { XiriToolbarComponent, XiriToolbarSettings } from 'projects/xiri-ng/src/lib/toolbar/toolbar.component';
import { XiriDescriptionListComponent, XiriDescriptionListSettings } from 'projects/xiri-ng/src/lib/description-list/description-list.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriDynComponentComponent } from 'projects/xiri-ng/src/lib/dyncomponent/dyncomponent.component';
import { XiriDynData } from 'projects/xiri-ng/src/lib/dyncomponent/dyndata.interface';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';

@Component( {
	            selector: 'app-layout',
	            templateUrl: './layout.component.html',
	            styleUrl: './layout.component.scss',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriDividerComponent,
		            XiriStatGridComponent,
		            XiriToolbarComponent,
		            XiriDescriptionListComponent,
		            XiriSectionComponent,
		            XiriDynComponentComponent,
		            GoCodePanelComponent,
		            XiriBreadcrumbComponent
	            ]
	            } )
export class LayoutComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Navigation & Layout' },
		{ label: 'Page Layout' },
	];

	// --- Seiten-Intro ---
	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Page Layout Components',
		subtitle: 'Page-level components for structuring content',
		icon: 'dashboard_customize',
		iconColor: 'primary',
	};

	// --- Section-Wrapper für Demo-Bereiche ---
	sectionPageHeader: XiriSectionSettings = {
		title: 'XiriPageHeaderComponent',
		subtitle: 'Seitenkopf mit Titel, Icon, Subtitle und Buttons',
		icon: 'wysiwyg',
		iconColor: 'primary',
	};

	sectionSection: XiriSectionSettings = {
		title: 'XiriSectionComponent',
		subtitle: 'Inhaltsbereich mit optionalem Header, Collapse und DynComponents',
		icon: 'view_agenda',
		iconColor: 'accent',
	};

	sectionDivider: XiriSectionSettings = {
		title: 'XiriDividerComponent',
		subtitle: 'Visueller Trenner mit Text, Icon und Spacing-Varianten',
		icon: 'horizontal_rule',
	};

	sectionStatGrid: XiriSectionSettings = {
		title: 'XiriStatGridComponent',
		subtitle: 'Grid-Layout für Statistik-Karten mit konfigurierbaren Spalten',
		icon: 'bar_chart',
		iconColor: 'success',
	};

	sectionToolbar: XiriSectionSettings = {
		title: 'XiriToolbarComponent',
		subtitle: 'Aktionsleiste mit Titel, Suche und Buttons',
		icon: 'toolbar',
		iconColor: 'primary',
	};

	sectionDescList: XiriSectionSettings = {
		title: 'XiriDescriptionListComponent',
		subtitle: 'Key-Value-Liste mit Badge, Link und HTML-Typen',
		icon: 'list_alt',
		iconColor: 'accent',
	};

	sectionDynComponent: XiriSectionSettings = {
		title: 'DynComponent Integration',
		subtitle: 'Alle neuen Komponenten via XiriDynComponentComponent kombiniert',
		icon: 'widgets',
		iconColor: 'orange',
		collapsible: true,
	};

	// --- PageHeader ---
	pageHeader1: XiriPageHeaderSettings = {
		title: 'Dashboard',
		subtitle: 'Overview of all key metrics',
		icon: 'dashboard',
		iconColor: 'primary',
		buttons: {
			buttons: [
				{ text: 'Export', type: 'stroked', action: 'debug', icon: 'download' },
				{ text: 'Settings', type: 'flat', action: 'debug', icon: 'settings', color: 'primary' }
			],
			class: ''
		}
	};

	pageHeader2: XiriPageHeaderSettings = {
		title: 'User Management',
	};

	pageHeader3: XiriPageHeaderSettings = {
		title: 'Reports',
		subtitle: 'Monthly analytics report',
		icon: 'assessment',
		iconColor: 'accent',
	};

	// --- Divider ---
	dividerPlain: XiriDividerSettings = {};

	dividerText: XiriDividerSettings = {
		text: 'or',
	};

	dividerIconText: XiriDividerSettings = {
		text: 'Section Break',
		icon: 'horizontal_rule',
	};

	dividerCompact: XiriDividerSettings = {
		text: 'compact',
		spacing: 'compact',
	};

	dividerNormal: XiriDividerSettings = {
		text: 'normal',
		spacing: 'normal',
	};

	dividerLarge: XiriDividerSettings = {
		text: 'large',
		spacing: 'large',
	};

	// --- StatGrid ---
	statGrid1: XiriStatGridSettings = {
		stats: [
			{ value: '1,234', label: 'Total Users', icon: 'group', iconColor: 'primary', trend: { value: 12.5, direction: 'up' } },
			{ value: '€8,456', label: 'Revenue', icon: 'payments', iconColor: 'success', trend: { value: -3.2, direction: 'down' } },
			{ value: '97.8%', label: 'Uptime', icon: 'speed', iconColor: 'accent' },
			{ value: '42', label: 'Active Projects', icon: 'folder_open', iconColor: 'orange' },
		]
	};

	statGrid2: XiriStatGridSettings = {
		title: 'Monthly Report',
		columns: 3,
		stats: [
			{ value: '328', label: 'New Signups', icon: 'person_add', iconColor: 'primary' },
			{ value: '89%', label: 'Retention', icon: 'loyalty', iconColor: 'success' },
			{ value: '4.8', label: 'Avg Rating', icon: 'star', iconColor: 'orange' },
		]
	};

	// --- Toolbar ---
	toolbar1: XiriToolbarSettings = {
		title: 'Documents',
		icon: 'description',
		buttons: {
			buttons: [
				{ text: 'Add', type: 'flat', action: 'debug', icon: 'add', color: 'primary' },
				{ text: 'Filter', type: 'stroked', action: 'debug', icon: 'filter_list' },
			],
			class: ''
		}
	};

	toolbar2: XiriToolbarSettings = {
		title: 'Search Results',
		icon: 'search',
		search: { placeholder: 'Search documents...' },
		buttons: {
			buttons: [
				{ text: 'Refresh', type: 'icon', action: 'debug', icon: 'refresh' },
			],
			class: ''
		}
	};

	toolbar3: XiriToolbarSettings = {
		title: 'Minimal Toolbar',
	};

	// --- Section ---
	section1: XiriSectionSettings = {
		title: 'General Settings',
		subtitle: 'Basic configuration options',
		icon: 'settings',
		iconColor: 'primary',
		components: [
			{ type: 'html', data: { html: '<p>Static content inside the section.</p>' } }
		]
	};

	section2: XiriSectionSettings = {
		title: 'Advanced Options',
		subtitle: 'Expand to see more settings',
		icon: 'tune',
		iconColor: 'accent',
		collapsible: true,
		collapsed: false,
		buttons: {
			buttons: [
				{ text: 'Reset', type: 'stroked', action: 'debug', icon: 'restart_alt' }
			],
			class: ''
		},
		components: [
			{ type: 'html', data: { html: '<p>This section can be collapsed. It also has a button in the header.</p>' } }
		]
	};

	section3: XiriSectionSettings = {
		title: 'Collapsed by Default',
		icon: 'visibility_off',
		collapsible: true,
		collapsed: true,
		components: [
			{ type: 'html', data: { html: '<p>This content is hidden by default. Click the header to expand.</p>' } }
		]
	};

	section4: XiriSectionSettings = {
		title: 'Section with DynComponents',
		icon: 'widgets',
		iconColor: 'primary',
		components: [
			{ type: 'stat', data: { value: '42', label: 'Active Users', icon: 'group', iconColor: 'primary' } },
			{ type: 'stat', data: { value: '99.9%', label: 'Uptime', icon: 'speed', iconColor: 'success' } },
			{ type: 'stat', data: { value: '€12,340', label: 'Revenue', icon: 'payments', iconColor: 'accent' } },
		]
	};

	// --- DynComponent Integration ---
	dynData: XiriDynData[] = [
		{
			type: 'page-header',
			data: {
				title: 'Server Dashboard',
				subtitle: 'Real-time infrastructure overview',
				icon: 'cloud',
				iconColor: 'primary',
				buttons: { buttons: [ { text: 'Refresh', type: 'stroked', action: 'debug', icon: 'refresh' } ], class: '' }
			} satisfies XiriPageHeaderSettings
		},
		{
			type: 'stat-grid',
			data: {
				stats: [
					{ value: '4', label: 'Servers', icon: 'dns', iconColor: 'primary' },
					{ value: '99.9%', label: 'Uptime', icon: 'speed', iconColor: 'success' },
					{ value: '1.2s', label: 'Avg Response', icon: 'timer', iconColor: 'accent' },
					{ value: '0', label: 'Errors', icon: 'bug_report', iconColor: 'success' },
				]
			} satisfies XiriStatGridSettings
		},
		{
			type: 'toolbar',
			newRow: true,
			data: {
				title: 'Server List',
				icon: 'dns',
				search: { placeholder: 'Filter servers...' },
			} satisfies XiriToolbarSettings
		},
		{
			type: 'divider',
			data: {
				text: 'Details',
				icon: 'info',
				spacing: 'large'
			} satisfies XiriDividerSettings
		},
		{
			type: 'section',
			data: {
				title: 'Server Info',
				icon: 'info',
				iconColor: 'primary',
				collapsible: true,
				components: [
					{
						type: 'description-list',
						data: {
							layout: 'horizontal',
							columns: 2,
							items: [
								{ label: 'Hostname', value: 'prod-eu-01' },
								{ label: 'IP', value: '10.0.1.42' },
								{ label: 'OS', value: 'Ubuntu 24.04' },
								{ label: 'Status', value: 'Running', type: 'badge', color: 'success' },
							]
						} satisfies XiriDescriptionListSettings
					}
				]
			} satisfies XiriSectionSettings
		},
		{
			type: 'description-list',
			newRow: true,
			data: {
				layout: 'stacked',
				columns: 2,
				items: [
					{ label: 'Region', value: 'EU West' },
					{ label: 'Provider', value: 'AWS', type: 'badge', color: 'primary' },
				]
			} satisfies XiriDescriptionListSettings
		},
	];

	// --- DescriptionList ---
	descList1: XiriDescriptionListSettings = {
		layout: 'stacked',
		columns: 2,
		items: [
			{ label: 'Full Name', value: 'Max Mustermann' },
			{ label: 'Email', value: 'max@example.com', icon: 'mail', type: 'link' },
			{ label: 'Role', value: 'Administrator', type: 'badge', color: 'primary' },
			{ label: 'Department', value: 'Engineering' },
			{ label: 'Location', value: 'Vienna, Austria', icon: 'location_on' },
			{ label: 'Status', value: 'Active', type: 'badge', color: 'success' },
		]
	};

	descList2: XiriDescriptionListSettings = {
		layout: 'horizontal',
		columns: 1,
		items: [
			{ label: 'Server', value: 'prod-eu-west-1' },
			{ label: 'Version', value: 'v2.4.1', type: 'badge' },
			{ label: 'Last Deploy', value: '2026-02-24 14:30 UTC' },
			{ label: 'Documentation', value: 'View Docs', type: 'link' },
			{ label: 'Health', value: 'Healthy', type: 'badge', color: 'success' },
		]
	};

	descList3: XiriDescriptionListSettings = {
		layout: 'stacked',
		columns: 3,
		items: [
			{ label: 'CPU', value: '24%', icon: 'memory' },
			{ label: 'Memory', value: '4.2 GB / 8 GB', icon: 'storage' },
			{ label: 'Disk', value: '67%', icon: 'hard_drive' },
			{ label: 'Network In', value: '1.2 Mbps', icon: 'arrow_downward' },
			{ label: 'Network Out', value: '0.8 Mbps', icon: 'arrow_upward' },
			{ label: 'Uptime', value: '14d 6h 32m', icon: 'schedule' },
		]
	};

	goPageHeaderCode = `// Vollständig
ph := pageheader.New("Dashboard").
    Subtitle("Overview of all key metrics").
    Icon("dashboard", "primary").
    Buttons(buttonLine)

// Minimal
ph2 := pageheader.New("User Management")

// Mit Icon, ohne Buttons
ph3 := pageheader.New("Reports").
    Subtitle("Monthly analytics report").
    Icon("assessment", "accent")`;

	goSectionCode = `// Non-collapsible
s1 := section.New().
    Title("General Settings").
    Subtitle("Basic configuration options").
    Icon("settings", "primary")
s1.Add(htmlComponent)

// Collapsible with buttons
s2 := section.New().
    Title("Advanced Options").
    Subtitle("Expand to see more settings").
    Icon("tune", "accent").
    Collapsible(false).
    Buttons(buttonLine)

// Collapsed by default
s3 := section.New().
    Title("Collapsed by Default").
    Icon("visibility_off", "").
    Collapsible(true)`;

	goDividerCode = `// Plain
d1 := layout.NewDivider()

// Mit Text
d2 := layout.NewDivider().Text("or")

// Mit Icon und Text
d3 := layout.NewDivider().
    Text("Section Break").
    Icon("horizontal_rule")

// Spacing-Varianten
d4 := layout.NewDivider().Text("compact").Spacing("compact")
d5 := layout.NewDivider().Text("normal").Spacing("normal")
d6 := layout.NewDivider().Text("large").Spacing("large")`;

	goStatGridCode = `// Standard 4-spaltig
grid := statgrid.New()
grid.Add(stat.New("1,234", "Total Users").
    Icon("group").IconColor("primary").
    SetTrend(12.5, stat.TrendUp))
grid.Add(stat.New("€8,456", "Revenue").
    Icon("payments").IconColor("success").
    SetTrend(-3.2, stat.TrendDown))
grid.Add(stat.New("97.8%", "Uptime").
    Icon("speed").IconColor("accent"))
grid.Add(stat.New("42", "Active Projects").
    Icon("folder_open").IconColor("orange"))

// 3-spaltig mit Titel
grid2 := statgrid.New().Columns(3).Title("Monthly Report")
grid2.Add(stat.New("328", "New Signups").
    Icon("person_add").IconColor("primary"))
grid2.Add(stat.New("89%", "Retention").
    Icon("loyalty").IconColor("success"))
grid2.Add(stat.New("4.8", "Avg Rating").
    Icon("star").IconColor("orange"))`;

	goToolbarCode = `// Mit Titel, Icon und Buttons
tb1 := toolbar.New().
    Title("Documents").
    Icon("description").
    Buttons(buttonLine)

// Mit Suche
tb2 := toolbar.New().
    Title("Search Results").
    Icon("search").
    Search("Search documents...").
    Buttons(buttonLine)

// Minimal
tb3 := toolbar.New().Title("Minimal Toolbar")`;

	goDescListCode = `// Stacked, 2 Spalten
dl := descriptionlist.New().Layout("stacked").Columns(2)
dl.Add("Full Name", "Max Mustermann")
dl.Add("Email", "max@example.com").Icon("mail").Type("link")
dl.Add("Role", "Administrator").Type("badge").Color("primary")
dl.Add("Department", "Engineering")
dl.Add("Location", "Vienna, Austria").Icon("location_on")
dl.Add("Status", "Active").Type("badge").Color("success")

// Horizontal, 1 Spalte
dl2 := descriptionlist.New().Layout("horizontal").Columns(1)
dl2.Add("Server", "prod-eu-west-1")
dl2.Add("Version", "v2.4.1").Type("badge")
dl2.Add("Health", "Healthy").Type("badge").Color("success")`;
}
