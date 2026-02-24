import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriStatComponent, XiriStatSettings } from 'projects/xiri-ng/src/lib/stat/stat.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';

@Component( {
	            selector: 'app-stats',
	            templateUrl: './stats.component.html',
	            styleUrl: './stats.component.scss',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriStatComponent,
		            GoCodePanelComponent
	            ]
            } )
export class StatsComponent {

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Stat / KPI Cards',
		subtitle: 'Statistik-Karten mit Trend-Indikator',
		icon: 'bar_chart',
		iconColor: 'primary',
	};

	sectionDashboard: XiriSectionSettings = {
		title: 'Dashboard Layout',
		icon: 'dashboard',
		iconColor: 'primary',
	};

	sectionMinimal: XiriSectionSettings = {
		title: 'Minimal Variant',
		subtitle: 'Without icon - simple value + label.',
		icon: 'minimize',
		iconColor: 'accent',
	};

	stat1: XiriStatSettings = {
		value: '1,234',
		label: 'Total Users',
		icon: 'group',
		iconColor: 'primary',
		trend: { value: 12.5, direction: 'up' },
	};

	stat2: XiriStatSettings = {
		value: '8,456',
		label: 'Revenue',
		icon: 'payments',
		iconColor: 'success',
		prefix: '\u20AC',
		trend: { value: -3.2, direction: 'down' },
	};

	stat3: XiriStatSettings = {
		value: 97.8,
		label: 'Uptime',
		icon: 'speed',
		iconColor: 'accent',
		suffix: '%',
		trend: { value: 0.1, direction: 'neutral' },
	};

	stat4: XiriStatSettings = {
		value: 42,
		label: 'Active Projects',
		icon: 'folder_open',
		iconColor: 'orange',
	};

	goDashboardCode = `grid := statgrid.New()

grid.Add(
    stat.New("1,234", "Total Users").
        Icon("group").
        IconColor("primary").
        SetTrend(12.5, stat.TrendUp),
)

grid.Add(
    stat.New("8,456", "Revenue").
        Icon("payments").
        IconColor("success").
        Prefix("€").
        SetTrend(-3.2, stat.TrendDown),
)

grid.Add(
    stat.New(97.8, "Uptime").
        Icon("speed").
        IconColor("accent").
        Suffix("%").
        SetTrend(0.1, stat.TrendNeutral),
)

grid.Add(
    stat.New(42, "Active Projects").
        Icon("folder_open").
        IconColor("orange"),
)`;

	goMinimalCode = `grid := statgrid.New().Columns(3)

grid.Add(stat.New("128", "Open Tickets"))
grid.Add(stat.New("99.9%", "SLA Compliance").Color("success"))`;
}
