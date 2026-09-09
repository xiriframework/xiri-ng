import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriExpansionComponent, XiriExpansionPanelSettings, XiriExpansionSettings } from 'projects/xiri-ng/src/lib/expansion/expansion.component';
import { XiriDynComponentComponent } from 'projects/xiri-ng/src/lib/dyncomponent/dyncomponent.component';
import { XiriDynData } from 'projects/xiri-ng/src/lib/dyncomponent/dyndata.interface';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { XiriCardSettings } from 'projects/xiri-ng/src/lib/card/card.component';
import { XiriTableRow, XiriTableSettings } from 'projects/xiri-ng/src/lib/table/table.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';

@Component( {
	            selector: 'app-expansion',
	            templateUrl: './expansion.component.html',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriExpansionComponent,
		            XiriDynComponentComponent,
		            XiriBreadcrumbComponent,
		            GoCodePanelComponent
	            ]
            } )
export class ExpansionComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Navigation & Layout' },
		{ label: 'Expansion' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'XiriExpansionComponent',
		subtitle: 'Ausklappbare Panels: displayMode, multi, lazy/unload, Header-Buttons und Tabellen im Panel',
		icon: 'expand_more',
		iconColor: 'primary',
	};

	// --- displayMode vs multi ---
	sectionFlatMulti: XiriSectionSettings = {
		title: 'displayMode vs multi',
		subtitle: 'Zwei unabhängige Schalter: displayMode ist Optik, multi ist Verhalten. Alle vier Accordions zeigen dieselben Panels.',
		icon: 'compare_arrows',
		iconColor: 'primary',
	};

	// displayMode ('flat' vs 'default') und multi (mehrere offen vs eines) sind unabhaengig voneinander.
	// Die vier Accordions teilen dieselben Panels, variiert wird jeweils nur ein Flag.
	private comparePanels: XiriExpansionPanelSettings[] = [
		{
			title: 'Panel 1',
			description: 'beim Start offen',
			icon: 'folder',
			expanded: true,
			// flat Card, damit nur das Accordion selbst Abstand und Schatten bestimmt
			data: [ { type: 'card', cols: 12, data: { flat: true, data: { 'Inhalt': 'Panel 1' } } as XiriCardSettings } ] as XiriDynData[]
		},
		{
			title: 'Panel 2',
			icon: 'folder',
			data: [ { type: 'card', cols: 12, data: { flat: true, data: { 'Inhalt': 'Panel 2' } } as XiriCardSettings } ] as XiriDynData[]
		},
		{
			title: 'Panel 3',
			icon: 'folder',
			data: [ { type: 'card', cols: 12, data: { flat: true, data: { 'Inhalt': 'Panel 3' } } as XiriCardSettings } ] as XiriDynData[]
		}
	];

	expansionDefaultSingle: XiriExpansionSettings = { multi: false, displayMode: 'default', panels: this.comparePanels };
	expansionFlatSingle: XiriExpansionSettings = { multi: false, displayMode: 'flat', panels: this.comparePanels };
	expansionDefaultMulti: XiriExpansionSettings = { multi: true, displayMode: 'default', panels: this.comparePanels };
	expansionFlatMulti: XiriExpansionSettings = { multi: true, displayMode: 'flat', panels: this.comparePanels };

	// --- Tabellen im Panel ---
	sectionTables: XiriSectionSettings = {
		title: 'Tabellen im Panel',
		subtitle: 'Tabelle als Panel-Inhalt: options.flat gegen den doppelten Rahmen, lazy/unload gegen unnötige Requests.',
		icon: 'table_chart',
		iconColor: 'accent',
	};

	private deviceFields = [
		{ id: 'name', name: 'Gerät' },
		{ id: 'imei', name: 'IMEI' },
		{ id: 'status', name: 'Status' },
	];

	private wienDevices: XiriTableRow[] = [
		{ name: 'Bagger 14', imei: '862272080384789', status: 'aktiv' },
		{ name: 'Radlader 3', imei: '862272080384112', status: 'aktiv' },
		{ name: 'Walze 7', imei: '862272080385004', status: 'Wartung' },
	];

	private grazDevices: XiriTableRow[] = [
		{ name: 'Kran 2', imei: '862272080390221', status: 'aktiv' },
		{ name: 'Bagger 9', imei: '862272080390878', status: 'offline' },
	];

	private linzDevices: XiriTableRow[] = [
		{ name: 'Mischer 1', imei: '862272080399001', status: 'aktiv' },
	];

	private deviceTable( rows: XiriTableRow[], flat: boolean ): XiriDynData {
		return {
			type: 'table',
			cols: 12,
			data: {
				data: rows,
				fields: this.deviceFields,
				options: { flat: flat, density: 'compact', pagination: false, search: false, sort: true, reload: false }
			} as XiriTableSettings
		};
	}

	// options.flat: ohne Elevation, Hintergrund und Außen-Margin — das Panel liefert den Rahmen schon.
	expansionTableFlat: XiriExpansionSettings = {
		multi: true,
		panels: [
			{
				title: 'Tabelle mit options.flat',
				description: 'ein Rahmen',
				icon: 'table_rows',
				expanded: true,
				data: [ this.deviceTable( this.wienDevices, true ) ]
			},
			{
				title: 'Tabelle ohne options.flat',
				description: 'Rahmen im Rahmen',
				icon: 'table_chart',
				expanded: true,
				data: [ this.deviceTable( this.wienDevices, false ) ]
			}
		]
	};

	// Ein Panel pro Standort, Tabelle als Inhalt: multi: false hält genau einen Standort offen,
	// unload: true entfernt die Tabelle beim Schließen wieder aus dem DOM.
	expansionTableGroups: XiriExpansionSettings = {
		multi: false,
		displayMode: 'flat',
		unload: true,
		panels: [
			{
				title: 'Standort Wien',
				description: '3 Geräte',
				icon: 'place',
				expanded: true,
				data: [ this.deviceTable( this.wienDevices, true ) ]
			},
			{
				title: 'Standort Graz',
				description: '2 Geräte',
				icon: 'place',
				data: [ this.deviceTable( this.grazDevices, true ) ]
			},
			{
				title: 'Standort Linz',
				description: '1 Gerät',
				icon: 'place',
				data: [ this.deviceTable( this.linzDevices, true ) ]
			}
		]
	};

	// Tabelle mit url: lazy verschiebt den ersten Request auf das erste Öffnen,
	// unload lädt bei jedem Öffnen neu (Netzwerk-Tab zeigt den Unterschied).
	expansionTableLazy: XiriExpansionSettings = {
		multi: true,
		lazy: true,
		panels: [
			{
				title: 'Lädt beim ersten Öffnen (lazy)',
				description: 'url-Tabelle, danach im DOM',
				icon: 'cloud_download',
				data: [ {
					type: 'table',
					cols: 12,
					data: {
						url: 'Test/Test/Table1Data',
						fields: [ { id: 'id', name: 'ID' }, { id: 'name', name: 'Name' }, { id: 'status', name: 'Status' } ],
						options: { flat: true, density: 'compact', pagination: false, search: false, title: 'Lazy' }
					} as XiriTableSettings
				} ] as XiriDynData[]
			},
			{
				title: 'Lädt bei jedem Öffnen (unload)',
				description: 'panel.unload überschreibt lazy',
				icon: 'refresh',
				unload: true,
				data: [ {
					type: 'table',
					cols: 12,
					data: {
						url: 'Test/Test/Table1Data',
						fields: [ { id: 'id', name: 'ID' }, { id: 'name', name: 'Name' }, { id: 'status', name: 'Status' } ],
						options: { flat: true, density: 'compact', pagination: false, search: false, title: 'Unload' }
					} as XiriTableSettings
				} ] as XiriDynData[]
			}
		]
	};

	goTableInPanelCode = `tb := table.NewBuilder[Device]()
tb.TextField("name", "Gerät", nameAcc)
tb.TextField("imei", "IMEI", imeiAcc)
tb.TextField("status", "Status", statusAcc)
tb.SetFlat(true) // kein eigener Rahmen — das Panel liefert ihn
tb.SetDensity(table.DensityCompact)
tb.SetPagination(false)

tbl := tb.Build()
tbl.SetData(devices)

e := expansion.NewExpansion().
    WithMulti(false).
    WithUnload(true).
    AddPanel(expansion.NewPanel("Standort Wien").
        WithIcon("place").
        WithDescription("3 Geräte").
        AddContent(tbl))`;

	// --- Lazy & Unload ---
	sectionLazy: XiriSectionSettings = {
		title: 'Lazy & Unload',
		subtitle: 'lazy: Inhalt erst beim ersten Öffnen rendern. unload: beim Schließen wieder entfernen. Global oder pro Panel.',
		icon: 'hourglass_empty',
		iconColor: 'primary',
	};

	expansionSettings: XiriExpansionSettings = {
		multi: true,
		displayMode: 'flat',
		lazy: true,
		panels: [
			{
				title: 'Users',
				description: 'User management',
				icon: 'person',
				expanded: true,
				data: [ {
					type: 'card',
					data: {
						header: 'User Info',
						headerIcon: 'person',
						headerSub: 'Lazy loaded',
						data: { 'Name': 'John Doe', 'Role': 'Administrator', 'Status': 'Active' }
					} as XiriCardSettings
				} ] as XiriDynData[]
			},
			{
				title: 'Settings',
				description: 'System configuration',
				icon: 'settings',
				data: [ {
					type: 'card',
					data: {
						header: 'System',
						headerIcon: 'settings',
						data: { 'Theme': 'Dark', 'Language': 'English', 'Version': '1.0.0' }
					} as XiriCardSettings
				} ] as XiriDynData[]
			},
			{
				title: 'Reports',
				description: 'Read-only',
				icon: 'assessment',
				disabled: true,
				data: []
			}
		]
	};

	expansionSettings2: XiriExpansionSettings = {
		multi: false,
		displayMode: 'default',
		unload: true,
		panels: [
			{
				title: 'Panel A',
				description: 'Unloaded when closed',
				icon: 'folder',
				data: [ {
					type: 'card',
					data: {
						header: 'Panel A Content',
						headerIcon: 'folder',
						data: { 'Info': 'This content is unloaded when the panel is closed' }
					} as XiriCardSettings
				} ] as XiriDynData[]
			},
			{
				title: 'Panel B',
				icon: 'inventory',
				data: [ {
					type: 'card',
					data: {
						header: 'Panel B Content',
						headerIcon: 'inventory',
						data: { 'Info': 'Only one panel open at a time (multi: false)' }
					} as XiriCardSettings
				} ] as XiriDynData[]
			}
		]
	};

	// --- Toggle ---
	sectionToggle: XiriSectionSettings = {
		title: 'Toggle-Position & hideToggle',
		subtitle: 'togglePosition schiebt den Pfeil vor den Titel, hideToggle blendet ihn ganz aus.',
		icon: 'swap_horiz',
		iconColor: 'accent',
	};

	expansionSettings3: XiriExpansionSettings = {
		multi: true,
		displayMode: 'default',
		togglePosition: 'before',
		hideToggle: true,
		panels: [
			{
				title: 'Toggle Before Title',
				description: 'togglePosition: before, hideToggle: true',
				icon: 'swap_horiz',
				expanded: true,
				data: [ {
					type: 'card',
					data: {
						header: 'Content',
						headerIcon: 'swap_horiz',
						data: { 'Info': 'Toggle icon is hidden, toggle position is before the title' }
					} as XiriCardSettings
				} ] as XiriDynData[]
			},
			{
				title: 'Second Panel',
				icon: 'visibility_off',
				data: [ {
					type: 'card',
					data: {
						header: 'Hidden Toggle',
						headerIcon: 'visibility_off',
						data: { 'Info': 'No visible expand arrow' }
					} as XiriCardSettings
				} ] as XiriDynData[]
			}
		]
	};

	// --- Header-Buttons ---
	sectionButtons: XiriSectionSettings = {
		title: 'Buttons im Panel-Header',
		subtitle: 'panel.buttons + Card mit flat: true. Klick, Enter und Space auf einem Button klappen das Panel nicht um.',
		icon: 'smart_button',
		iconColor: 'primary',
	};

	gpsData = { 'IMEI': '862272080384789', 'Eingebaut': 'seit 15.04.2026', 'Box-Status': 'Ja (Status 1)', 'Letzte Meldung': '09.09.2026 16:15' };

	expansionButtonsSettings: XiriExpansionSettings = {
		multi: true,
		panels: [
			{
				title: 'GPS-Einbau',
				description: 'buttons + flat Card',
				icon: 'gps_fixed',
				expanded: true,
				buttons: {
					class: 'small',
					buttons: [
						{ text: 'Map', type: 'icon', action: 'debug', icon: 'map', hint: 'Auf Karte zeigen' },
						{ text: 'Edit', type: 'icon', action: 'debug', icon: 'edit', hint: 'Bearbeiten' },
					]
				},
				data: [ { type: 'card', cols: 12, data: { flat: true, data: this.gpsData } as XiriCardSettings } ] as XiriDynData[]
			},
			{
				title: 'GPS-Korrektur',
				description: 'Text-Button im Header',
				icon: 'my_location',
				buttons: {
					class: 'small',
					buttons: [ { text: 'Korrigieren', type: 'stroked', action: 'debug', icon: 'tune' } ]
				},
				data: [ { type: 'card', cols: 12, data: { flat: true, data: { 'Offset': '+2,4 m', 'Zuletzt': '08.09.2026' } } as XiriCardSettings } ] as XiriDynData[]
			},
			{
				title: 'Vorher: Card mit buttonsTop im Panel',
				description: 'doppelter Titel, Schatten',
				icon: 'history',
				expanded: true,
				data: [ {
					type: 'card',
					cols: 12,
					data: {
						header: 'GPS-Einbau',
						buttonsTop: { class: 'small', buttons: [ { text: 'Map', type: 'icon', action: 'debug', icon: 'map' } ] },
						data: this.gpsData
					} as XiriCardSettings
				} ] as XiriDynData[]
			},
		]
	};

	goExpansionButtonsCode = `p := expansion.NewPanel("GPS-Einbau").
    WithIcon("gps_fixed").
    WithExpanded(true).
    Buttons(button.NewButtonLine("small", nil).
        Add(button.NewSimpleDialogButton("Map", url.NewUrl("/gps/map"), core.ColorPrimary))).
    AddContent(card.NewCardList("", content).WithFlat(true).WithDisplay("xcol xcol-md-12"))

e := expansion.NewExpansion().WithMulti(true).AddPanel(p)`;
}
