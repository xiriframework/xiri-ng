import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriTimelineComponent, XiriTimelineSettings } from 'projects/xiri-ng/src/lib/timeline/timeline.component';

@Component( {
	            selector: 'app-timeline',
	            templateUrl: './timeline.component.html',
	            styleUrl: './timeline.component.scss',
	            imports: [ XiriPageHeaderComponent, XiriSectionComponent, XiriTimelineComponent ]
            } )
export class TimelineComponent {

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
}
