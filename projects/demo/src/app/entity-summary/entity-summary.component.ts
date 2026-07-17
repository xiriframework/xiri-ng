import { Component } from '@angular/core';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriStatusComponent, XiriStatusSettings } from 'projects/xiri-ng/src/lib/status/status.component';
import { XiriStatGridComponent, XiriStatGridSettings } from 'projects/xiri-ng/src/lib/stat-grid/stat-grid.component';
import { XiriDescriptionListComponent, XiriDescriptionListSettings } from 'projects/xiri-ng/src/lib/description-list/description-list.component';
import { XiriButtonlineComponent, XiriButtonlineSettings } from 'projects/xiri-ng/src/lib/buttonline/buttonline.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';

// Rezept "Entity Summary": KEIN eigener Component-Typ, sondern eine feste Komposition
// bestehender xiri-Komponenten für einen Detailkopf (hier: Auftrag/Kunde/Gerät).
// Reihenfolge: Breadcrumb → Page-Header (Identität + primäre Aktion) → Status →
// Stat-Grid (max 3 Kennzahlen) → Description-List (max ~4 Metadaten) → Buttonline (sekundär).
@Component( {
	            selector:    'app-entity-summary',
	            templateUrl: './entity-summary.component.html',
	            imports:     [
		            XiriBreadcrumbComponent,
		            XiriPageHeaderComponent,
		            XiriStatusComponent,
		            XiriStatGridComponent,
		            XiriDescriptionListComponent,
		            XiriButtonlineComponent,
		            XiriSectionComponent,
		            GoCodePanelComponent
	            ]
            } )
export class EntitySummaryComponent {

	// 1. Breadcrumb — Herkunft/Navigation
	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Aufträge', link: '/Tables' },
		{ label: 'AB-2026-0473' }
	];

	// 2. Page-Header — Identität (Titel, Subtitle, Icon) + genau EINE primäre Aktion.
	//    Keine primäre Aktion im Overflow; sekundäre Aktionen kommen weiter unten.
	pageHeader: XiriPageHeaderSettings = {
		title:     'Auftrag AB-2026-0473',
		subtitle:  'Kunde: Musterbau GmbH · Gerät: Bagger CAT 320',
		icon:      'assignment',
		iconColor: 'primary',
		buttons:   {
			class:   '',
			buttons: [
				{ text: 'Bearbeiten', type: 'flat', action: 'link', url: '/Forms', icon: 'edit', color: 'primary' }
			]
		} as XiriButtonlineSettings
	};

	// 3. Status — aktueller Zustand des Objekts (Label immer sichtbar, Farbe nur redundant).
	status: XiriStatusSettings = {
		label:   'In Bearbeitung',
		tone:    'info',
		variant: 'badge',
		icon:    'sync',
		hint:    'Auftrag wurde eingeplant und wird aktuell bearbeitet'
	};

	// 4. Stat-Grid — MAX 3 kompakte Kennzahlen.
	stats: XiriStatGridSettings = {
		columns: 3,
		stats:   [
			{ value: '12.480', label: 'Auftragswert', suffix: ' €', icon: 'euro', iconColor: 'primary', compact: true },
			{ value: 7, label: 'Positionen', icon: 'list', iconColor: 'accent', compact: true },
			{ value: '3', label: 'Tage bis Termin', icon: 'event', iconColor: 'orange', compact: true }
		]
	};

	// 5. Description-List — MAX ~4 Metadaten.
	meta: XiriDescriptionListSettings = {
		layout:  'stacked',
		columns: 2,
		items:   [
			{ label: 'Auftragsnummer', value: 'AB-2026-0473', icon: 'tag' },
			{ label: 'Erstellt am', value: '02.07.2026', icon: 'calendar_today' },
			{ label: 'Verantwortlich', value: 'M. Friedl', icon: 'person' },
			{ label: 'Standort', value: 'Wien, Lager Nord', icon: 'place' }
		]
	};

	// 6. Buttonline — sekundäre Aktionen (nie die primäre Aktion hier).
	secondaryActions: XiriButtonlineSettings = {
		class:   '',
		buttons: [
			{ text: 'Duplizieren', type: 'stroked', action: 'link', url: '/Forms', icon: 'content_copy' },
			{ text: 'PDF export', type: 'stroked', action: 'link', url: '/Tables', icon: 'picture_as_pdf' },
			{ text: 'Archivieren', type: 'basic', action: 'link', url: '/Overview', icon: 'archive' }
		]
	};

	sectionRecipe: XiriSectionSettings = {
		title:     'Rezept, kein Component-Typ',
		subtitle:  'Entity-Summary ist eine feste Komposition bestehender Komponenten',
		icon:      'info',
		iconColor: 'accent'
	};

	// Skizze der gleichen Komposition über die bestehenden xiri-go-Builder.
	goCode = `// Entity-Summary ist ein Rezept: dieselben Bausteine serverseitig zusammengesetzt.
ph := pageheader.New("Auftrag AB-2026-0473").
    Subtitle("Kunde: Musterbau GmbH · Gerät: Bagger CAT 320").
    Icon("assignment", "primary").
    // genau EINE primäre Aktion im Header
    Button(button.NewLinkButton("Bearbeiten", "/orders/473/edit", "edit").Flat().Color("primary"))

sg := stat.NewGrid().Columns(3).
    Add(stat.New("12.480", "Auftragswert").Suffix(" €").Icon("euro", "primary").Compact()).
    Add(stat.New("7", "Positionen").Icon("list", "accent").Compact()).
    Add(stat.New("3", "Tage bis Termin").Icon("event", "orange").Compact())

dl := descriptionlist.New().Columns(2).
    Add("Auftragsnummer", "AB-2026-0473").
    Add("Erstellt am", "02.07.2026").
    Add("Verantwortlich", "M. Friedl").
    Add("Standort", "Wien, Lager Nord")

// sekundäre Aktionen als eigene Buttonline (NICHT im Header)
bl := buttonline.New().
    Add(button.NewLinkButton("Duplizieren", "/orders/473/copy", "content_copy").Stroked()).
    Add(button.NewLinkButton("PDF Export", "/orders/473/pdf", "picture_as_pdf").Stroked()).
    Add(button.NewLinkButton("Archivieren", "/orders/473/archive", "archive"))`;
}
