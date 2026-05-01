import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { XiriBarChartComponent, XiriBarChartSettings } from 'projects/xiri-ng/src/lib/barchart/barchart.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';

@Component({
	selector: 'app-barcharts',
	templateUrl: './barcharts.component.html',
	styleUrl: './barcharts.component.scss',
	imports: [
		XiriPageHeaderComponent,
		XiriSectionComponent,
		XiriBreadcrumbComponent,
		XiriBarChartComponent,
		GoCodePanelComponent,
	],
})
export class BarChartsComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Data Display' },
		{ label: 'Bar Charts' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Bar Charts',
		subtitle: 'Simple, stacked und heatmap bar-charts (echarts, optional peerDependency)',
		icon: 'bar_chart',
		iconColor: 'primary',
	};

	sectionSimple1: XiriSectionSettings = {
		title: '1: Simple — single value per category',
		subtitle: 'Mode: simple. Ein Wert pro Kategorie.',
		icon: 'calendar_view_week',
		iconColor: 'primary',
	};

	sectionSimple2: XiriSectionSettings = {
		title: '2: Simple — different range and color',
		subtitle: 'Gleicher Mode, andere Y-Achse und Farbe.',
		icon: 'pause_circle',
		iconColor: 'accent',
	};

	sectionStacked: XiriSectionSettings = {
		title: '3: Stacked — segmented bars',
		subtitle: 'Mode: stacked. Pro Kategorie mehrere farbige Segmente (grün/gelb/rot).',
		icon: 'stacked_bar_chart',
		iconColor: 'warn',
	};

	sectionHeatmap: XiriSectionSettings = {
		title: '4: Heatmap — sparse activity over time',
		subtitle: 'Mode: heatmap. Viele dünne Bars über eine Zeitachse.',
		icon: 'sensors',
		iconColor: 'tertiary',
	};

	simple1: XiriBarChartSettings = {
		title: 'Weekly activities',
		yMin: 0,
		yMax: 12,
		color: 'purple',
		bars: [
			{ label: 'M', name: 'Monday',    value: 3 },
			{ label: 'T', name: 'Tuesday',   value: 9 },
			{ label: 'W', name: 'Wednesday', value: 5 },
			{ label: 'T', name: 'Thursday',  value: 6 },
			{ label: 'F', name: 'Friday',    value: 4 },
			{ label: 'S', name: 'Saturday',  value: 1 },
			{ label: 'S', name: 'Sunday',    value: 1 },
		],
	};

	simple2: XiriBarChartSettings = {
		title: 'Idle time',
		yMin: 0,
		yMax: 4,
		color: 'purple',
		bars: [
			{ label: 'M', name: 'Monday',    value: 1 },
			{ label: 'T', name: 'Tuesday',   value: 2.9 },
			{ label: 'W', name: 'Wednesday', value: 1.5 },
			{ label: 'T', name: 'Thursday',  value: 2 },
			{ label: 'F', name: 'Friday',    value: 1.2 },
			{ label: 'S', name: 'Saturday',  value: 0.6 },
			{ label: 'S', name: 'Sunday',    value: 0.5 },
		],
	};

	stacked: XiriBarChartSettings = {
		title: 'Vehicle strain',
		yMin: 0,
		yMax: 4,
		bars: [
			{ label: 'M', name: 'Monday', segments: [
				{ value: 2,   color: 'green',  name: 'Low strain' },
				{ value: 1,   color: 'yellow', name: 'Medium strain' },
				{ value: 1,   color: 'red',    name: 'High strain' } ] },
			{ label: 'T', name: 'Tuesday', segments: [
				{ value: 3,   color: 'green',  name: 'Low strain' },
				{ value: 1,   color: 'yellow', name: 'Medium strain' } ] },
			{ label: 'W', name: 'Wednesday', segments: [
				{ value: 2.5, color: 'green',  name: 'Low strain' },
				{ value: 0.5, color: 'yellow', name: 'Medium strain' },
				{ value: 1,   color: 'red',    name: 'High strain' } ] },
			{ label: 'T', name: 'Thursday', segments: [
				{ value: 1,   color: 'green',  name: 'Low strain' },
				{ value: 2,   color: 'yellow', name: 'Medium strain' },
				{ value: 1,   color: 'red',    name: 'High strain' } ] },
			{ label: 'F', name: 'Friday', segments: [
				{ value: 3.5, color: 'green',  name: 'Low strain' },
				{ value: 0.5, color: 'yellow', name: 'Medium strain' } ] },
			{ label: 'S', name: 'Saturday', segments: [
				{ value: 4,   color: 'green',  name: 'Low strain' } ] },
			{ label: 'S', name: 'Sunday', segments: [
				{ value: 3.5, color: 'green',  name: 'Low strain' },
				{ value: 0.5, color: 'yellow', name: 'Medium strain' } ] },
		],
	};

	heatmap: XiriBarChartSettings = (() => {
		const start = new Date('2025-11-05T00:00:00Z').getTime();
		const points: { time: number; value: number; name?: string }[] = [];
		for (let i = 0; i < 200; i++) {
			const time = start + i * 6 * 3600 * 1000; // 6h spacing
			const noise = Math.sin(i / 7) * 0.5 + Math.random() * 0.4;
			points.push({ time, value: Math.max(0, noise) });
		}
		[ 30, 70, 110, 150, 188 ].forEach((i, n) => {
			points[i].value = 1;
			points[i].name = `Repeat #${n + 1}`;
		});
		return {
			title: 'Engine system — last 30 days',
			color: 'purple',
			yMin: 0,
			yMax: 1,
			points,
		};
	})();

	goSimpleCode = `bc := barchart.New("simple").
    Mode(barchart.ModeSimple).
    Title("Weekly activities").
    YAxis(0, 12).
    Color(core.ColorPurple).
    Bar("M", 3).Bar("T", 9).Bar("W", 5).
    Bar("T", 6).Bar("F", 4).Bar("S", 1).Bar("S", 1)`;

	goStackedCode = `bc := barchart.New("stacked").
    Mode(barchart.ModeStacked).
    Title("Vehicle strain").
    YAxis(0, 4).
    StackedBar("M",
        barchart.Seg(2, core.ColorGreen),
        barchart.Seg(1, core.ColorYellow),
        barchart.Seg(1, core.ColorRed)).
    StackedBar("T",
        barchart.Seg(3, core.ColorGreen),
        barchart.Seg(1, core.ColorYellow))
    // ... weitere Tage`;

	goHeatmapCode = `bc := barchart.New("heatmap").
    Mode(barchart.ModeHeatmap).
    Title("Engine system").
    Color(core.ColorPurple)

for _, s := range samples {
    bc.Point(s.TimestampMs, s.Value)
}`;
}
