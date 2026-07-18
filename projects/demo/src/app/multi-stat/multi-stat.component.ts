import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriMultiStatComponent, XiriMultiStatSettings } from 'projects/xiri-ng/src/lib/multi-stat/multi-stat.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';

@Component( {
	            selector: 'app-multi-stat',
	            templateUrl: './multi-stat.component.html',
	            styleUrl: './multi-stat.component.scss',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriMultiStatComponent,
		            GoCodePanelComponent,
		            XiriBreadcrumbComponent
	            ]
            } )
export class MultiStatComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Data Display' },
		{ label: 'Multi Stat' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Multi Stat',
		subtitle: 'Mehrere Kennzahlen in einer Karte — je mit eigener Farbe, Icon und Trend.',
		icon: 'view_column',
		iconColor: 'primary',
	};

	// --- Variante 1: KPI mit Header, Icons, Farben, Trend ---
	sectionKpi: XiriSectionSettings = {
		title: 'Mit Header + Icons',
		subtitle: 'Titel und Kopf-Icon, jede Zahl mit eigenem Icon, eigener Farbe und optionalem Trend.',
		icon: 'shopping_cart',
		iconColor: 'primary',
	};

	kpi: XiriMultiStatSettings = {
		title: 'Bestellungen heute',
		icon: 'shopping_cart',
		iconColor: 'primary',
		items: [
			{ value: 12, label: 'Offen', icon: 'inventory', color: 'orange' },
			{ value: 8, label: 'Läuft', icon: 'sync', color: 'blue' },
			{ value: 45, label: 'Fertig', icon: 'check_circle', color: 'green', trend: { value: 5, direction: 'up' } },
		],
	};

	goKpi = `multistat.New().
    Title("Bestellungen heute").
    Icon("shopping_cart").
    IconColor("primary").
    Add(stat.New(12, "Offen").Icon("inventory").Color("orange")).
    Add(stat.New(8, "Läuft").Icon("sync").Color("blue")).
    Add(stat.New(45, "Fertig").Icon("check_circle").Color("green").
        SetTrend(5, stat.TrendUp))`;

	// --- Variante 2: ohne Header, nur Zahlen ---
	sectionPlain: XiriSectionSettings = {
		title: 'Ohne Header',
		subtitle: 'Kein Titel, kein Kopf-Icon — nur die nackten Kennzahlen nebeneinander.',
		icon: 'tag',
		iconColor: 'tertiary',
	};

	plain: XiriMultiStatSettings = {
		items: [
			{ value: 128, label: 'Nutzer', color: 'primary' },
			{ value: 34, label: 'Aktiv', color: 'success' },
			{ value: 7, label: 'Gesperrt', color: 'error' },
		],
	};

	goPlain = `multistat.New().
    Add(stat.New(128, "Nutzer").Color("primary")).
    Add(stat.New(34, "Aktiv").Color("success")).
    Add(stat.New(7, "Gesperrt").Color("error"))`;

	// --- Variante 3: Einheiten (prefix/suffix) + Trends ---
	sectionUnits: XiriSectionSettings = {
		title: 'Mit Einheiten & Trend',
		subtitle: 'Präfix/Suffix für Währung und Prozent, jede Zahl mit Trend-Indikator.',
		icon: 'payments',
		iconColor: 'accent',
	};

	units: XiriMultiStatSettings = {
		title: 'Quartalszahlen',
		icon: 'insights',
		iconColor: 'accent',
		items: [
			{ value: '8,4', label: 'Umsatz', prefix: '€', suffix: ' Mio', icon: 'payments', color: 'green', trend: { value: 12.5, direction: 'up' } },
			{ value: 97.8, label: 'Uptime', suffix: '%', icon: 'speed', color: 'blue', trend: { value: 0.1, direction: 'neutral' } },
			{ value: 3.2, label: 'Churn', suffix: '%', icon: 'trending_down', color: 'orange', trend: { value: -1.4, direction: 'down' } },
		],
	};

	goUnits = `multistat.New().
    Title("Quartalszahlen").
    Icon("insights").
    IconColor("accent").
    Add(stat.New("8,4", "Umsatz").Prefix("€").Suffix(" Mio").
        Icon("payments").Color("green").SetTrend(12.5, stat.TrendUp)).
    Add(stat.New(97.8, "Uptime").Suffix("%").
        Icon("speed").Color("blue").SetTrend(0.1, stat.TrendNeutral)).
    Add(stat.New(3.2, "Churn").Suffix("%").
        Icon("trending_down").Color("orange").SetTrend(-1.4, stat.TrendDown))`;

	// --- Variante 4: viele Kennzahlen ---
	sectionMany: XiriSectionSettings = {
		title: 'Viele Kennzahlen',
		subtitle: 'Fünf Zahlen in einer Karte — bricht auf schmalen Kacheln automatisch um.',
		icon: 'dashboard',
		iconColor: 'secondary',
	};

	many: XiriMultiStatSettings = {
		title: 'Tickets nach Status',
		icon: 'confirmation_number',
		iconColor: 'secondary',
		items: [
			{ value: 42, label: 'Neu', icon: 'fiber_new', color: 'blue' },
			{ value: 18, label: 'Zugewiesen', icon: 'assignment_ind', color: 'purple' },
			{ value: 9, label: 'Wartet', icon: 'hourglass_empty', color: 'orange' },
			{ value: 3, label: 'Eskaliert', icon: 'priority_high', color: 'error' },
			{ value: 156, label: 'Gelöst', icon: 'task_alt', color: 'green', trend: { value: 8, direction: 'up' } },
		],
	};

	goMany = `multistat.New().
    Title("Tickets nach Status").
    Icon("confirmation_number").
    IconColor("secondary").
    Add(stat.New(42, "Neu").Icon("fiber_new").Color("blue")).
    Add(stat.New(18, "Zugewiesen").Icon("assignment_ind").Color("purple")).
    Add(stat.New(9, "Wartet").Icon("hourglass_empty").Color("orange")).
    Add(stat.New(3, "Eskaliert").Icon("priority_high").Color("error")).
    Add(stat.New(156, "Gelöst").Icon("task_alt").Color("green").
        SetTrend(8, stat.TrendUp))`;

	// --- Variante 4b: vertikale Items (opt-in, Standard ist horizontal) ---
	sectionVertical: XiriSectionSettings = {
		title: 'Vertikale Items',
		subtitle: 'Standard ist horizontal (Icon links). Mit verticalItems: true wird jeder Eintrag gestapelt (Icon oben).',
		icon: 'view_agenda',
		iconColor: 'secondary',
	};

	vertical: XiriMultiStatSettings = {
		title: 'Bestellungen heute',
		icon: 'shopping_cart',
		iconColor: 'primary',
		verticalItems: true,
		items: [
			{ value: 12, label: 'Offen', icon: 'inventory', color: 'orange' },
			{ value: 8, label: 'Läuft', icon: 'sync', color: 'blue' },
			{ value: 45, label: 'Fertig', icon: 'check_circle', color: 'green', trend: { value: 5, direction: 'up' } },
		],
	};

	goVertical = `multistat.New().
    Title("Bestellungen heute").
    Icon("shopping_cart").
    IconColor("primary").
    VerticalItems().   // Standard ist horizontal
    Add(stat.New(12, "Offen").Icon("inventory").Color("orange")).
    Add(stat.New(8, "Läuft").Icon("sync").Color("blue")).
    Add(stat.New(45, "Fertig").Icon("check_circle").Color("green").
        SetTrend(5, stat.TrendUp))`;

	// --- Variante 5: klickbare Zahlen (Navigation mit Query-Params) ---
	sectionLinks: XiriSectionSettings = {
		title: 'Klickbare Zahlen',
		subtitle: 'Jede Zahl navigiert zu einer eigenen URL — Query-Parameter inklusive.',
		icon: 'link',
		iconColor: 'primary',
	};

	links: XiriMultiStatSettings = {
		title: 'Nach Status',
		icon: 'filter_list',
		iconColor: 'primary',
		items: [
			{ value: 12, label: 'Offen', icon: 'inventory', color: 'orange', link: '/Stats?status=open' },
			{ value: 8, label: 'Läuft', icon: 'sync', color: 'blue', link: '/Stats?status=running' },
			{ value: 45, label: 'Fertig', icon: 'check_circle', color: 'green', link: '/Stats?status=done' },
		],
	};

	goLinks = `multistat.New().
    Title("Nach Status").
    Icon("filter_list").
    IconColor("primary").
    Add(stat.New(12, "Offen").Icon("inventory").Color("orange").
        Link(xurl.NewUrl("/Orders/Table?status=open"))).
    Add(stat.New(8, "Läuft").Icon("sync").Color("blue").
        Link(xurl.NewUrl("/Orders/Table?status=running"))).
    Add(stat.New(45, "Fertig").Icon("check_circle").Color("green").
        Link(xurl.NewUrl("/Orders/Table?status=done")))`;

	// --- Variante 6: AJAX-Nachladen mit Reload-Button ---
	sectionAjax: XiriSectionSettings = {
		title: 'AJAX-Nachladen',
		subtitle: 'SetURL + WithReload: Karte lädt Zahlen vom Backend, Reload-Button aktualisiert (braucht einen Endpoint — hier nur der Go-Code).',
		icon: 'autorenew',
		iconColor: 'accent',
	};

	goAjax = `multistat.New().
    Title("Live-Kennzahlen").
    Icon("monitoring").
    IconColor("accent").
    SetURL(c.apiUrl("multistat", "live")).   // Frontend lädt Items per POST
    WithReload(true)                          // manueller Reload-Button

// Endpoint liefert die Items:
func (c *Controller) MultiStatLive(ctx echo.Context) error {
    ms := multistat.New().
        Add(stat.New(12, "Offen").Icon("inventory").Color("orange")).
        Add(stat.New(45, "Fertig").Icon("check_circle").Color("green"))
    return wc.Data(ms)   // DataResponse(ctx)
}`;
}
