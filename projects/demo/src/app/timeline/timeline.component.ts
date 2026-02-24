import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriTimelineComponent, XiriTimelineSettings } from 'projects/xiri-ng/src/lib/timeline/timeline.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';

@Component( {
	            selector: 'app-timeline',
	            templateUrl: './timeline.component.html',
	            styleUrl: './timeline.component.scss',
	            imports: [ XiriPageHeaderComponent, XiriSectionComponent, XiriTimelineComponent, GoCodePanelComponent, XiriBreadcrumbComponent ]
            } )
export class TimelineComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Data Display' },
		{ label: 'Timeline' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Timeline',
		subtitle: 'Chronologische Ereignisliste',
		icon: 'timeline',
		iconColor: 'primary',
	};

	sectionActivityLog: XiriSectionSettings = {
		title: 'Activity Log',
		subtitle: 'Full-featured timeline with icons, colors, descriptions, and timestamps.',
		icon: 'history',
		iconColor: 'accent',
	};

	sectionOrderStatus: XiriSectionSettings = {
		title: 'Order Status',
		subtitle: 'Compact timeline for status tracking.',
		icon: 'local_shipping',
		iconColor: 'primary',
	};

	sectionSimpleSteps: XiriSectionSettings = {
		title: 'Simple Steps',
		subtitle: 'Minimal timeline with just titles (no icons, no timestamps).',
		icon: 'checklist',
	};

	activityTimeline: XiriTimelineSettings = {
		items: [
			{
				title: 'Project Created',
				description: 'New project "xiri-ng" was initialized with Angular 21.',
				datetime: '2024-01-15 09:30',
				icon: 'add_circle',
				iconColor: 'success',
			},
			{
				title: 'First Commit',
				description: 'Initial component library structure with form and table components.',
				datetime: '2024-01-15 14:00',
				icon: 'code',
				iconColor: 'primary',
			},
			{
				title: 'Build Pipeline Configured',
				description: 'ng-packagr setup for library distribution.',
				datetime: '2024-01-16 10:15',
				icon: 'settings',
				iconColor: 'accent',
			},
			{
				title: 'Breaking Change Warning',
				description: 'API change in form field interface detected. Migration guide required.',
				datetime: '2024-02-01 16:45',
				icon: 'warning',
				iconColor: 'warn',
			},
			{
				title: 'Version 1.0 Released',
				description: 'First stable release with 28 components.',
				datetime: '2024-03-01 12:00',
				icon: 'celebration',
				iconColor: 'success',
			},
		]
	};

	statusTimeline: XiriTimelineSettings = {
		items: [
			{
				title: 'Order Placed',
				datetime: '10:00',
				icon: 'shopping_cart',
				iconColor: 'primary',
			},
			{
				title: 'Payment Confirmed',
				datetime: '10:02',
				icon: 'paid',
				iconColor: 'success',
			},
			{
				title: 'Processing',
				description: 'Your order is being prepared.',
				datetime: '10:15',
				icon: 'inventory_2',
				iconColor: 'primary',
			},
			{
				title: 'Shipped',
				datetime: '14:30',
				icon: 'local_shipping',
				iconColor: 'accent',
			},
		]
	};

	simpleTimeline: XiriTimelineSettings = {
		items: [
			{ title: 'Step 1: Requirements' },
			{ title: 'Step 2: Design' },
			{ title: 'Step 3: Implementation' },
			{ title: 'Step 4: Testing' },
			{ title: 'Step 5: Deployment' },
		]
	};

	goActivityCode = `tl := timeline.New()

tl.Add("Project Created").
    Description("New project initialized with Angular 21.").
    Datetime("2024-01-15 09:30").
    Icon("add_circle").
    IconColor("success")

tl.Add("First Commit").
    Description("Initial component library structure.").
    Datetime("2024-01-15 14:00").
    Icon("code").
    IconColor("primary")

tl.Add("Build Pipeline Configured").
    Description("ng-packagr setup for library distribution.").
    Datetime("2024-01-16 10:15").
    Icon("settings").
    IconColor("accent")

tl.Add("Breaking Change Warning").
    Description("API change in form field interface detected.").
    Datetime("2024-02-01 16:45").
    Icon("warning").
    IconColor("warn")

tl.Add("Version 1.0 Released").
    Description("First stable release with 28 components.").
    Datetime("2024-03-01 12:00").
    Icon("celebration").
    IconColor("success")`;

	goOrderCode = `tl := timeline.New()

tl.Add("Order Placed").
    Datetime("10:00").
    Icon("shopping_cart").IconColor("primary")

tl.Add("Payment Confirmed").
    Datetime("10:02").
    Icon("paid").IconColor("success")

tl.Add("Processing").
    Description("Your order is being prepared.").
    Datetime("10:15").
    Icon("inventory_2").IconColor("primary")

tl.Add("Shipped").
    Datetime("14:30").
    Icon("local_shipping").IconColor("accent")`;

	goSimpleCode = `tl := timeline.New()

tl.Add("Step 1: Requirements")
tl.Add("Step 2: Design")
tl.Add("Step 3: Implementation")
tl.Add("Step 4: Testing")
tl.Add("Step 5: Deployment")`;
}
