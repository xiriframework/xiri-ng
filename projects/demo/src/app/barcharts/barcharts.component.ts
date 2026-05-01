import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { XiriBarChartComponent, XiriBarChartSettings } from 'projects/xiri-ng/src/lib/barchart/barchart.component';
import { XiriLineChartComponent, XiriLineChartSettings } from 'projects/xiri-ng/src/lib/linechart/linechart.component';
import { XiriPieChartComponent, XiriPieChartSettings } from 'projects/xiri-ng/src/lib/piechart/piechart.component';
import { XiriGaugeChartComponent, XiriGaugeChartSettings } from 'projects/xiri-ng/src/lib/gaugechart/gaugechart.component';
import { XiriHeatmapComponent, XiriHeatmapSettings } from 'projects/xiri-ng/src/lib/heatmap/heatmap.component';
import { XiriCalendarComponent, XiriCalendarSettings } from 'projects/xiri-ng/src/lib/calendar/calendar.component';
import { XiriTreeComponent, XiriTreeSettings } from 'projects/xiri-ng/src/lib/tree/tree.component';
import { XiriSankeyComponent, XiriSankeySettings } from 'projects/xiri-ng/src/lib/sankey/sankey.component';
import { XiriGanttComponent, XiriGanttSettings } from 'projects/xiri-ng/src/lib/gantt/gantt.component';
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
		XiriLineChartComponent,
		XiriPieChartComponent,
		XiriGaugeChartComponent,
		XiriHeatmapComponent,
		XiriCalendarComponent,
		XiriTreeComponent,
		XiriSankeyComponent,
		XiriGanttComponent,
		GoCodePanelComponent,
	],
})
export class BarChartsComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Data Display' },
		{ label: 'Charts' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Charts',
		subtitle: 'Bar, Line, Pie und Gauge charts — alle auf einer geteilten echarts-Basis (xiri-echarts-host).',
		icon: 'insert_chart',
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

	// --- Line Chart Sections ---

	sectionLine: XiriSectionSettings = {
		title: '5: Line — multi-series + smoothed',
		subtitle: 'xiri-linechart: gemeinsame X-Achse, mehrere Linien, optional dashed/area/smooth.',
		icon: 'show_chart',
		iconColor: 'primary',
	};

	line: XiriLineChartSettings = {
		title: 'Monthly revenue',
		xLabels: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug' ],
		smooth: true,
		yMin: 0,
		yMax: 220,
		lines: [
			{ name: 'Product A', values: [ 100, 120, 150, 180, 170, 195, 205, 210 ], color: 'blue' },
			{ name: 'Product B', values: [ 80,  95,  110, 130, 125, 145, 150, 160 ], color: 'green' },
			{ name: 'Forecast',  values: [ 90,  108, 130, 155, 148, 170, 178, 185 ], color: 'purple', dashed: true },
		],
	};

	goLineCode = `lc := linechart.New("revenue").
    Title("Monthly revenue").
    XLabels("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug").
    Line("Product A", []float64{100,120,150,180,170,195,205,210}).Color(core.ColorBlue).Done().
    Line("Product B", []float64{80,95,110,130,125,145,150,160}).Color(core.ColorGreen).Done().
    Line("Forecast",  []float64{90,108,130,155,148,170,178,185}).Color(core.ColorPurple).Dashed().Done().
    Smooth().YAxis(0, 220)`;

	// --- Pie / Donut Sections ---

	sectionPie: XiriSectionSettings = {
		title: '6: Pie & Donut',
		subtitle: 'xiri-piechart: Anteile/Verteilung. donut:true rendert als Ring.',
		icon: 'pie_chart',
		iconColor: 'accent',
	};

	pie: XiriPieChartSettings = {
		title: 'Traffic sources',
		slices: [
			{ name: 'Direct', value: 1234, color: 'blue' },
			{ name: 'Search', value: 856,  color: 'green' },
			{ name: 'Social', value: 423,  color: 'purple' },
			{ name: 'Email',  value: 187,  color: 'orange' },
			{ name: 'Other',  value: 92,   color: 'gray' },
		],
	};

	donut: XiriPieChartSettings = {
		title: 'Storage usage',
		donut: true,
		slices: [
			{ name: 'Used',  value: 78, color: 'warn' },
			{ name: 'Free',  value: 22, color: 'lightgray' },
		],
	};

	goPieCode = `pc := piechart.New("traffic").
    Title("Traffic sources").
    Slice("Direct", 1234, core.ColorBlue).
    Slice("Search", 856,  core.ColorGreen).
    Slice("Social", 423,  core.ColorPurple).
    Slice("Email",  187,  core.ColorOrange).
    Slice("Other",  92,   core.ColorGray)

donut := piechart.New("storage").
    Title("Storage usage").Donut().
    Slice("Used", 78, core.ColorWarning).
    Slice("Free", 22, core.ColorLightGray)`;

	// --- Gauge Sections ---

	sectionGauge: XiriSectionSettings = {
		title: '7: Gauge',
		subtitle: 'xiri-gaugechart: Einzelwert auf einem Bogen. Compact-Modus rendert ohne Achsen-Beschriftung.',
		icon: 'speed',
		iconColor: 'tertiary',
	};

	gaugeCpu: XiriGaugeChartSettings = {
		title: 'CPU',
		value: 72,
		min: 0,
		max: 100,
		label: '%',
		color: 'warn',
	};

	gaugeMem: XiriGaugeChartSettings = {
		title: 'Memory',
		value: 4.2,
		min: 0,
		max: 8,
		label: 'GB',
		color: 'blue',
	};

	gaugeDisk: XiriGaugeChartSettings = {
		title: 'Disk',
		value: 91,
		min: 0,
		max: 100,
		label: '%',
		color: 'red',
	};

	goGaugeCode = `g := gaugechart.New("cpu").
    Title("CPU").Value(72).Range(0, 100).
    Color(core.ColorWarning).Label("%")`;

	// --- Nightingale (Pie variant) ---

	sectionNightingale: XiriSectionSettings = {
		title: '8: Nightingale (Pie-Variante)',
		subtitle: 'piechart mit nightingale:true — die Slice-Radien skalieren mit dem Wert. Variante "radius" (Default) oder "area".',
		icon: 'donut_small',
		iconColor: 'accent',
	};

	nightingale: XiriPieChartSettings = {
		title: 'Bug severity',
		nightingale: true,
		slices: [
			{ name: 'Critical', value: 8,  color: 'red' },
			{ name: 'High',     value: 22, color: 'warn' },
			{ name: 'Medium',   value: 41, color: 'yellow' },
			{ name: 'Low',      value: 73, color: 'green' },
			{ name: 'Trivial',  value: 12, color: 'gray' },
		],
	};

	goNightingaleCode = `pc := piechart.New("severity").
    Title("Bug severity").
    Nightingale().
    Slice("Critical", 8,  core.ColorRed).
    Slice("High",     22, core.ColorWarning).
    Slice("Medium",   41, core.ColorYellow).
    Slice("Low",      73, core.ColorGreen).
    Slice("Trivial",  12, core.ColorGray)`;

	// --- Heatmap (Matrix) ---

	sectionHeatmap2: XiriSectionSettings = {
		title: '9: Heatmap (Matrix)',
		subtitle: 'xiri-heatmap: 2D-Matrix mit X/Y-Kategorien und Werten — z. B. Aktivitäts-Verteilung pro Wochentag und Stunde.',
		icon: 'grid_on',
		iconColor: 'primary',
	};

	heatmapMatrix: XiriHeatmapSettings = (() => {
		const days = [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ];
		const hours = [ '00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22' ];
		const cells: { x: number; y: number; value: number }[] = [];
		for ( let y = 0; y < days.length; y++ ) {
			for ( let x = 0; x < hours.length; x++ ) {
				const business = x >= 4 && x <= 9 && y < 5 ? 1 : 0.2;
				cells.push( { x, y, value: Math.round( business * (10 + Math.random() * 20) ) } );
			}
		}
		return {
			title: 'Activity by hour and weekday',
			xLabels: hours,
			yLabels: days,
			cells,
			min: 0,
			max: 30,
		};
	})();

	goHeatmapCode2 = `h := heatmap.New("activity").
    Title("Activity by hour and weekday").
    XLabels("00","02","04","06","08","10","12","14","16","18","20","22").
    YLabels("Mon","Tue","Wed","Thu","Fri","Sat","Sun").
    Range(0, 30)

for _, m := range measurements {
    h.Cell(m.HourIdx, m.DayIdx, m.Value)
}`;

	// --- Calendar Heatmap ---

	sectionCalendar: XiriSectionSettings = {
		title: '10: Calendar Heatmap',
		subtitle: 'xiri-calendar: GitHub-Style Aktivitäts-Kalender für ein Jahr.',
		icon: 'calendar_month',
		iconColor: 'success',
	};

	calendar: XiriCalendarSettings = (() => {
		const cells: { date: string; value: number }[] = [];
		const start = new Date( '2025-01-01' ).getTime();
		for ( let i = 0; i < 365; i++ ) {
			const d = new Date( start + i * 86400000 );
			const yyyy = d.getFullYear();
			const mm = String( d.getMonth() + 1 ).padStart( 2, '0' );
			const dd = String( d.getDate() ).padStart( 2, '0' );
			const dow = d.getDay();
			const value = dow === 0 || dow === 6 ? Math.round( Math.random() * 2 ) : Math.round( Math.random() * 8 );
			if ( value > 0 ) cells.push( { date: `${ yyyy }-${ mm }-${ dd }`, value } );
		}
		return {
			title: '2025 contributions',
			range: '2025',
			cells,
			min: 0,
			max: 8,
		};
	})();

	goCalendarCode = `c := calendar.New("contributions").
    Title("2025 contributions").
    Year("2025").
    MinMax(0, 8)

for _, day := range days {
    c.Cell(day.Date, day.Count)
}`;

	// --- Tree ---

	sectionTree: XiriSectionSettings = {
		title: '11: Tree',
		subtitle: 'xiri-tree: Hierarchischer Baum mit recursive children.',
		icon: 'account_tree',
		iconColor: 'tertiary',
	};

	tree: XiriTreeSettings = {
		title: 'Org chart',
		orient: 'LR',
		root: {
			name: 'Company',
			value: 200,
			children: [
				{
					name: 'Engineering', value: 80, children: [
						{ name: 'Frontend', value: 30 },
						{ name: 'Backend',  value: 30 },
						{ name: 'DevOps',   value: 20 },
					]
				},
				{
					name: 'Sales', value: 60, children: [
						{ name: 'EMEA', value: 30 },
						{ name: 'AMER', value: 20 },
						{ name: 'APAC', value: 10 },
					]
				},
				{
					name: 'Operations', value: 40, children: [
						{ name: 'HR',      value: 12 },
						{ name: 'Finance', value: 18 },
						{ name: 'Legal',   value: 10 },
					]
				},
				{ name: 'Other', value: 20 },
			]
		}
	};

	goTreeCode = `root := tree.NewNode("Company").WithValue(200).AppendChild(
    tree.NewNode("Engineering").WithValue(80).AppendChild(
        tree.NewNode("Frontend").WithValue(30),
        tree.NewNode("Backend").WithValue(30),
        tree.NewNode("DevOps").WithValue(20),
    ),
    tree.NewNode("Sales").WithValue(60).AppendChild(...),
    tree.NewNode("Operations").WithValue(40).AppendChild(...),
    tree.NewNode("Other").WithValue(20),
)

t := tree.New("org").Title("Org chart").Root(root).Orient("LR")`;

	// --- Sankey ---

	sectionSankey: XiriSectionSettings = {
		title: '12: Sankey',
		subtitle: 'xiri-sankey: Flussdiagramm mit nodes + links{source, target, value}.',
		icon: 'linear_scale',
		iconColor: 'primary',
	};

	sankey: XiriSankeySettings = {
		title: 'Energy flow',
		nodes: [
			{ name: 'Coal',  color: 'gray' },
			{ name: 'Gas',   color: 'blue' },
			{ name: 'Solar', color: 'yellow' },
			{ name: 'Wind',  color: 'green' },
			{ name: 'Grid',  color: 'purple' },
			{ name: 'Industry'    },
			{ name: 'Residential' },
			{ name: 'Commercial'  },
		],
		links: [
			{ source: 'Coal',  target: 'Grid', value: 30 },
			{ source: 'Gas',   target: 'Grid', value: 25 },
			{ source: 'Solar', target: 'Grid', value: 15 },
			{ source: 'Wind',  target: 'Grid', value: 20 },
			{ source: 'Grid',  target: 'Industry',    value: 38 },
			{ source: 'Grid',  target: 'Residential', value: 30 },
			{ source: 'Grid',  target: 'Commercial',  value: 22 },
		],
	};

	goSankeyCode = `s := sankey.New("energy").Title("Energy flow")

s.Node("Coal", core.ColorGray).Node("Gas", core.ColorBlue).
  Node("Solar", core.ColorYellow).Node("Wind", core.ColorGreen).
  Node("Grid", core.ColorPurple).
  Node("Industry", "").Node("Residential", "").Node("Commercial", "")

s.Link("Coal", "Grid", 30).Link("Gas", "Grid", 25).
  Link("Solar", "Grid", 15).Link("Wind", "Grid", 20).
  Link("Grid", "Industry", 38).Link("Grid", "Residential", 30).
  Link("Grid", "Commercial", 22)`;

	// --- Gantt ---

	sectionGantt: XiriSectionSettings = {
		title: '13: Gantt',
		subtitle: 'xiri-gantt: Tasks mit Start/Ende auf Zeitachse pro Kategorie.',
		icon: 'view_timeline',
		iconColor: 'warn',
	};

	gantt: XiriGanttSettings = (() => {
		const day = 86400000;
		const t0 = new Date( '2025-03-01' ).getTime();
		return {
			title: 'Project plan',
			rows: [ 'Design', 'Build', 'Test', 'Release' ],
			tasks: [
				{ row: 0, name: 'Wireframes',  start: t0,            end: t0 + 7  * day,  color: 'blue' },
				{ row: 0, name: 'Mockups',     start: t0 + 5 * day,  end: t0 + 12 * day,  color: 'purple' },
				{ row: 1, name: 'API',         start: t0 + 7 * day,  end: t0 + 24 * day,  color: 'green' },
				{ row: 1, name: 'Frontend',    start: t0 + 12 * day, end: t0 + 30 * day,  color: 'emerald' },
				{ row: 2, name: 'QA',          start: t0 + 24 * day, end: t0 + 32 * day,  color: 'warn' },
				{ row: 2, name: 'UAT',         start: t0 + 30 * day, end: t0 + 35 * day,  color: 'yellow' },
				{ row: 3, name: 'Go-live',     start: t0 + 35 * day, end: t0 + 36 * day,  color: 'red' },
			],
			rangeStart: t0,
			rangeEnd:   t0 + 40 * day,
		};
	})();

	goGanttCode = `t0 := time.Date(2025, 3, 1, 0, 0, 0, 0, time.UTC).UnixMilli()
day := int64(86400000)

g := gantt.New("project").Title("Project plan").
    Rows("Design", "Build", "Test", "Release").
    Task(0, "Wireframes", t0,         t0+7*day,  core.ColorBlue).
    Task(0, "Mockups",    t0+5*day,   t0+12*day, core.ColorPurple).
    Task(1, "API",        t0+7*day,   t0+24*day, core.ColorGreen).
    Task(1, "Frontend",   t0+12*day,  t0+30*day, core.ColorEmerald).
    Task(2, "QA",         t0+24*day,  t0+32*day, core.ColorWarning).
    Task(2, "UAT",        t0+30*day,  t0+35*day, core.ColorYellow).
    Task(3, "Go-live",    t0+35*day,  t0+36*day, core.ColorRed).
    XRange(t0, t0+40*day)`;
}
