import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { XiriCardComponent, XiriCardSettings } from 'projects/xiri-ng/src/lib/card/card.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';

@Component( {
	selector: 'app-multi-card',
	templateUrl: './multi-card.component.html',
	styleUrl: './multi-card.component.scss',
	imports: [
		XiriPageHeaderComponent,
		XiriSectionComponent,
		XiriBreadcrumbComponent,
		XiriCardComponent,
		GoCodePanelComponent,
	],
} )
export class MultiCardComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Layout' },
		{ label: 'Multi-Component Cards' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Multi-Component Cards',
		subtitle: 'Eine Card hostet beliebige Sub-Components in einem xcol-Grid (Card-Header bleibt darüber).',
		icon: 'view_quilt',
		iconColor: 'primary',
	};

	section1: XiriSectionSettings = {
		title: '1: Chart + zwei Compact-Stats',
		subtitle: 'Card-Header darüber, Bar-Chart in voller Breite und zwei kompakte Stats nebeneinander (xcol-6 / xcol-6).',
		icon: 'auto_awesome_mosaic',
		iconColor: 'primary',
	};

	section2: XiriSectionSettings = {
		title: '2: Drei Compact-Stats horizontal',
		subtitle: 'Card als KPI-Trio. Jeder Stat in xcol-4.',
		icon: 'view_column',
		iconColor: 'accent',
	};

	section3: XiriSectionSettings = {
		title: '3: Chart + Description-List',
		subtitle: 'Beliebige xiri-Komponenten lassen sich verschachteln — hier ein Bar-Chart und eine Description-List untereinander.',
		icon: 'list_alt',
		iconColor: 'tertiary',
	};

	// --- 1: Chart + 2 Compact-Stats ---
	cardChartAndStats: XiriCardSettings = {
		header: 'Activity',
		headerIcon: 'show_chart',
		headerIconColor: 'primary',
		padding: 'md',
		components: [
			{
				type: 'barchart',
				mode: 'simple',
				display: 'xcol xcol-12',
				data: {
					yMin: 0,
					yMax: 12,
					color: 'purple',
					compact: true,
					bars: [
						{ label: 'M', name: 'Monday',    value: 3 },
						{ label: 'T', name: 'Tuesday',   value: 9 },
						{ label: 'W', name: 'Wednesday', value: 5 },
						{ label: 'T', name: 'Thursday',  value: 6 },
						{ label: 'F', name: 'Friday',    value: 4 },
						{ label: 'S', name: 'Saturday',  value: 1 },
						{ label: 'S', name: 'Sunday',    value: 1 },
					],
				},
			},
			{
				type: 'stat',
				display: 'xcol xcol-6',
				data: { value: '18h', label: 'Today',       compact: true },
			},
			{
				type: 'stat',
				display: 'xcol xcol-6',
				data: { value: '32h', label: 'Last 7 days', compact: true },
			},
		],
	};

	// --- 2: Drei Compact-Stats ---
	cardThreeStats: XiriCardSettings = {
		header: 'Quick KPIs',
		headerIcon: 'speed',
		headerIconColor: 'accent',
		components: [
			{ type: 'stat', display: 'xcol xcol-md-4', data: { value: 1234, label: 'Items',        icon: 'inventory_2', iconColor: 'primary',  compact: true } },
			{ type: 'stat', display: 'xcol xcol-md-4', data: { value: '87%', label: 'Uptime',      icon: 'check_circle', iconColor: 'success',  compact: true } },
			{ type: 'stat', display: 'xcol xcol-md-4', data: { value: 12,    label: 'Open Issues', icon: 'bug_report',   iconColor: 'warn',     compact: true } },
		],
	};

	// --- 3: Chart + Description-List ---
	cardChartAndList: XiriCardSettings = {
		header: 'Run summary',
		headerIcon: 'analytics',
		headerIconColor: 'tertiary',
		padding: 'lg',  // mehr Innen-Padding als Default
		components: [
			{
				type: 'barchart',
				mode: 'stacked',
				display: 'xcol xcol-12',
				data: {
					yMin: 0,
					yMax: 4,
					compact: true,
					bars: [
						{ label: 'M', name: 'Monday',    segments: [ { value: 2, color: 'green', name: 'Low' }, { value: 1, color: 'yellow', name: 'Medium' }, { value: 1, color: 'red', name: 'High' } ] },
						{ label: 'T', name: 'Tuesday',   segments: [ { value: 3, color: 'green', name: 'Low' }, { value: 1, color: 'yellow', name: 'Medium' } ] },
						{ label: 'W', name: 'Wednesday', segments: [ { value: 2.5, color: 'green', name: 'Low' }, { value: 0.5, color: 'yellow', name: 'Medium' }, { value: 1, color: 'red', name: 'High' } ] },
						{ label: 'T', name: 'Thursday',  segments: [ { value: 1, color: 'green', name: 'Low' }, { value: 2, color: 'yellow', name: 'Medium' }, { value: 1, color: 'red', name: 'High' } ] },
						{ label: 'F', name: 'Friday',    segments: [ { value: 3.5, color: 'green', name: 'Low' }, { value: 0.5, color: 'yellow', name: 'Medium' } ] },
					],
				},
			},
			{
				type: 'description-list',
				display: 'xcol xcol-12',
				data: {
					columns: 2,
					layout: 'horizontal',
					items: [
						{ label: 'Total time',   value: '2h 14m' },
						{ label: 'Avg. per day', value: '27m' },
						{ label: 'Peak day',     value: 'Tuesday' },
						{ label: 'Status',       value: 'Healthy', type: 'badge', color: 'success' },
					],
				},
			},
		],
	};

	go1Code = `bc := barchart.New("activity").Mode(barchart.ModeSimple).
    Color(core.ColorPurple).YAxis(0, 12).Compact().
    BarNamed("M", "Monday", 3).BarNamed("T", "Tuesday", 9). /* ... */

c := card.NewCard(core.CardTypeTable, nil, "Activity",
    nil, ptr("show_chart"), ptr("primary"), false, false, nil)
c.WithPadding("md").  // Innen-Padding (Default md)
  Add(bc.WithDisplay("xcol-12")).
  Add(stat.New("18h", "Today").Compact().WithDisplay("xcol-6")).
  Add(stat.New("32h", "Last 7 days").Compact().WithDisplay("xcol-6"))`;

	go2Code = `c := card.NewCard(core.CardTypeTable, nil, "Quick KPIs",
    nil, ptr("speed"), ptr("accent"), false, false, nil)

c.Add(stat.New(1234, "Items").
        Icon("inventory_2").IconColor("primary").
        Compact().WithDisplay("xcol-md-4")).
  Add(stat.New("87%", "Uptime").
        Icon("check_circle").IconColor("success").
        Compact().WithDisplay("xcol-md-4")).
  Add(stat.New(12, "Open Issues").
        Icon("bug_report").IconColor("warn").
        Compact().WithDisplay("xcol-md-4"))`;

	go3Code = `bc := barchart.New("strain").Mode(barchart.ModeStacked).YAxis(0, 4).Compact().
    StackedBarNamed("M", "Monday",
        barchart.SegNamed(2, "Low",    core.ColorGreen),
        barchart.SegNamed(1, "Medium", core.ColorYellow),
        barchart.SegNamed(1, "High",   core.ColorRed))
    /* ... weitere Tage */

dl := descriptionlist.New().WithColumns(2).
    Add("Total time",   "2h 14m").
    Add("Avg. per day", "27m").
    Add("Peak day",     "Tuesday")

c := card.NewCard(core.CardTypeTable, nil, "Run summary", /* ... */)
c.WithPadding("lg").
  Add(bc.WithDisplay("xcol-12")).
  Add(dl.WithDisplay("xcol-12"))`;
}
