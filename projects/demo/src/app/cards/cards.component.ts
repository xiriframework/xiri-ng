import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriDynData } from "projects/xiri-ng/src/lib/dyncomponent/dyndata.interface";
import { XiriCardSettings } from "projects/xiri-ng/src/lib/card/card.component";
import { XiriButton } from "projects/xiri-ng/src/lib/button/button.component";
import { XiriTagChip } from 'projects/xiri-ng/src/lib/formfields/field.interface';
import { XiriButtonlineSettings } from "projects/xiri-ng/src/lib/buttonline/buttonline.component";
import { XiriDynComponentComponent } from 'projects/xiri-ng/src/lib/dyncomponent/dyncomponent.component';
import { XiriCardComponent } from 'projects/xiri-ng/src/lib/card/card.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';

@Component( {
	            selector: 'app-cards',
	            templateUrl: './cards.component.html',
	            styleUrls: [ './cards.component.scss' ],
	            imports: [ XiriPageHeaderComponent, XiriSectionComponent, XiriDynComponentComponent, XiriCardComponent, GoCodePanelComponent, XiriBreadcrumbComponent ]
            } )
export class CardsComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Cards' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Cards & Card Layouts',
		subtitle: 'Card-basierte UI-Layouts mit DynComponent-Integration',
		icon: 'grid_view',
		iconColor: 'primary',
	};

	sectionDynCards: XiriSectionSettings = {
		title: 'DynComponent Cards',
		subtitle: '7 card variants via XiriDynComponentComponent: with/without header icon, subheader, buttons, link rows, and an unknown type fallback.',
		icon: 'widgets',
		iconColor: 'primary',
	};

	sectionTableCard: XiriSectionSettings = {
		title: 'Table Card',
		subtitle: "type: 'table' — Card with tabular data display (ID/text columns) and forceMinWidth.",
		icon: 'table',
		iconColor: 'accent',
	};

	sectionCardButtons: XiriSectionSettings = {
		title: 'Card with Buttons',
		subtitle: 'buttonsTop (small icon buttons) + buttonsBottom (action buttons). headerIconColor: accent.',
		icon: 'smart_button',
	};

	sectionDenseCard: XiriSectionSettings = {
		title: 'Dense Card',
		subtitle: 'dense: 2 — Compact display with reduced padding.',
		icon: 'density_small',
	};

	sectionIconCard: XiriSectionSettings = {
		title: 'Card with Icon Values',
		subtitle: "format: 'icon' — Right column displays icons instead of text. Built with NewCardListIconContent() on the Go side.",
		icon: 'emoji_symbols',
		iconColor: 'tertiary',
	};

	sectionMenuCard: XiriSectionSettings = {
		title: 'Card with Menu Button',
		subtitle: "action: 'menu' — Icon button opens a dropdown menu with menuItems (link, href, dialog). Works in buttonsTop and buttonsBottom.",
		icon: 'menu',
	};

	sectionChipsCard: XiriSectionSettings = {
		title: 'Card with Chips Column',
		subtitle: "format: 'chips' — Farbige Tag-Chips als Spalte in einer Card (über XiriRawTable).",
		icon: 'label',
		iconColor: 'primary',
	};

	cardChips: XiriCardSettings = {
		header: 'Team Skills',
		headerIcon: 'label',
		headerIconColor: 'primary',
		fields: [
			{ id: 'member', name: 'Member', format: 'text', display: 'info' },
			{ id: 'skills', name: 'Skills', format: 'chips', display: 'right' },
		],
		data: [
			{ member: 'Alice', skills: <XiriTagChip[]>[ { label: 'Frontend', color: 'primary' }, { label: 'Angular', color: 'emerald' } ] },
			{ member: 'Bob', skills: <XiriTagChip[]>[ { label: 'Backend', color: 'accent' }, { label: 'Docker', color: 'blue' } ] },
			{ member: 'Charlie', skills: <XiriTagChip[]>[ { label: 'DevOps', color: 'warn' }, { label: 'Kubernetes', color: 'orange' } ] },
			{ member: 'Diana', skills: <XiriTagChip[]>[ { label: 'Design', color: 'purple' }, { label: 'UX', color: 'success' } ] },
		]
	};

	private content = {
		Line1: 'Lane 1',
		Line2: 'Lane 2',
	};
	private buttons: XiriButton[] = [ {
		type: 'icon',
		text: 'Name',
		action: 'api',
		icon: 'home',
	}, {
		type: 'icon',
		text: 'Name',
		action: 'api',
		icon: 'home',
	}, {
		type: 'icon',
		text: 'Name',
		action: 'api',
		icon: 'home',
	} ];

	data: XiriDynData[] = [ {
		type: 'card',
		data: <XiriCardSettings> {
			header: 'Card',
			headerIcon: 'home',
			data: this.content,
			buttonsTop: <XiriButtonlineSettings> {
				buttons: this.buttons
			}
		}
	}, {
		type: 'card',
		data: <XiriCardSettings> {
			header: 'Card',
			data: this.content
		}
	}, {
		type: 'card',
		data: <XiriCardSettings> {
			header: 'Card',
			headerSub: 'subheader',
			data: this.content
		}
	}, {
		type: 'card',
		data: <XiriCardSettings> {
			header: 'Card',
			headerSub: 'subheader',
			headerIcon: 'home',
			data: this.content,
			buttons: this.buttons,
		}
	}, {
		type: 'card',
		data: <XiriCardSettings> {
			header: 'Card5',
			headerSub: 'subheader',
			headerIcon: 'home',
			data: [ {
				text: 'Lane 1',
				textLink: 'test',
				icon: 'home'
			}, {
				text: 'Lane 1',
				textLink: 'test',
				icon: 'home'
			} ],
			fields: [ { id: 'text', name: 'Link', format: 'linkrow' } ],
			buttons: this.buttons,
		}
	}, {
		type: 'card',
		data: <XiriCardSettings> {
			header: 'Card6',
			headerSub: 'subheader',
			headerIcon: 'home',
			data: [ {
				text: 'Lane 1',
				textLink: 'test'
			}, {
				text: 'Lane 1',
				textLink: 'test'
			} ],
			fields: [ { id: 'text', name: 'Link', format: 'linkrow' } ],
			buttons: this.buttons,
		}
	}, {
		type: 'test',
		data: '123 test out'
	} ];

	public card = <XiriCardSettings> {
		"header": "Admin",
		"headerSub": null,
		"headerIcon": "admin_panel_settings",
		"headerIconColor": null,
		"type": "table",
		"buttonsBottom": null,
		"buttonsTop": null,
		"forceMinWidth": true,
		"fields": [
			{
				"id": "id",
				"name": "ID",
				"format": "text",
				"display": "info"
			},
			{
				"id": "text",
				"name": "TEXT",
				"format": "text",
				"display": "right"
			}
		],
		"data": [
			{
				"id": "DEVICENAME",
				"text": "WZ J-XXX"
			},
			{
				"id": "DigitalInput1",
				"text": "{\"stop\":1723638509,\"start\":1723639158,\"total\":4530373} - since 3 min."
			},
			{
				"id": "TachographDriver1CumulativeDrivingTime",
				"text": "843 - now"
			},
			{
				"id": "TachographDriver1DailyDrivingTime",
				"text": "247 - now"
			},
			{
				"id": "TachographDriver1DurationOfNextBreakRest",
				"text": "30 - now"
			},
			{
				"id": "TachographDriver1OpenCompensationIn2NdWeekBeforeLast",
				"text": "0 - now"
			},
			{
				"id": "TachographVehicleIdentificationNumber",
				"text": "W1T123123123123 - since 56 min."
			}
		]
	};

	public card2 = <XiriCardSettings> {
		header: 'Card with Buttons',
		headerSub: 'buttonsTop + buttonsBottom',
		headerIcon: 'dashboard',
		headerIconColor: 'accent',
		buttonsTop: {
			class: 'small',
			buttons: [
				{ text: 'New', type: 'icon', action: 'debug', icon: 'add', color: 'primary', hint: 'New entry' },
				{ text: 'Refresh', type: 'icon', action: 'debug', icon: 'refresh', hint: 'Refresh data' },
			]
		},
		buttonsBottom: {
			class: '',
			buttons: [
				{ text: 'Cancel', type: 'basic', action: 'debug' },
				{ text: 'Save', type: 'raised', action: 'debug', color: 'primary' },
			]
		},
		data: {
			'Created': '2025-01-01',
			'Modified': '2025-02-15',
			'Status': 'Active',
		}
	};

	public card3 = <XiriCardSettings> {
		header: 'Dense Card',
		headerIcon: 'compress',
		headerIconColor: 'warn',
		dense: 2,
		fields: [
			{ id: 'key', name: 'Key', format: 'text', display: 'info' },
			{ id: 'value', name: 'Value', format: 'text', display: 'right' },
		],
		data: [
			{ key: 'Host', value: 'server-01.local' },
			{ key: 'Port', value: '8080' },
			{ key: 'Protocol', value: 'HTTPS' },
			{ key: 'Uptime', value: '14 days' },
		]
	};

	public cardIcon = <XiriCardSettings> {
		header: 'Status Overview',
		headerIcon: 'verified',
		headerIconColor: 'tertiary',
		fields: [
			{ id: 'id', name: 'Name', format: 'text', display: 'info', minWidth: '30px' },
			{
				id: 'text', name: 'Icon', format: 'icon', display: 'right',
				icons: {
					'0': { icon: 'check_circle', color: 'success', hint: 'Active' },
					'1': { icon: 'visibility', color: 'primary', hint: '' },
					'2': { icon: 'lock', color: 'error', hint: 'Locked' },
					'3': { icon: 'schedule', color: 'warn', hint: 'Pending' },
					'4': { icon: 'cloud_done', color: 'success', hint: 'Synced' },
				} as any
			},
		],
		data: [
			{ id: 'Active', text: '0' },
			{ id: 'Visible', text: '1' },
			{ id: 'Locked', text: '2' },
			{ id: 'Scheduled', text: '3' },
			{ id: 'Cloud Sync', text: '4' },
		]
	};

	public card4 = <XiriCardSettings> {
		header: 'Card with Menu Button',
		headerSub: 'buttonsTop with action: menu',
		headerIcon: 'menu_open',
		headerIconColor: 'primary',
		buttonsTop: {
			class: 'small',
			buttons: [
				{ text: 'New', type: 'icon', action: 'debug', icon: 'add', color: 'primary', hint: 'New entry' },
				{
					text: 'Actions', type: 'icon', action: 'menu', icon: 'more_vert', hint: 'More actions',
					menuItems: [
						{ action: 'link', url: '/web/cards', icon: 'open_in_new', color: 'primary', text: 'Open Cards' },
						{ action: 'href', url: 'https://material.angular.io', icon: 'launch', text: 'Angular Material' },
						{ action: 'link', url: '/web/table', icon: 'table_chart', text: 'Go to Table' },
					]
				},
			]
		},
		buttonsBottom: {
			class: '',
			buttons: [
				{
					text: 'Options', type: 'basic', action: 'menu', icon: 'expand_more',
					menuItems: [
						{ action: 'link', url: '/web/cards', icon: 'credit_card', color: 'primary', text: 'Cards' },
						{ action: 'link', url: '/web/table', icon: 'table_chart', color: 'accent', text: 'Table' },
					]
				},
			]
		},
		data: {
			'Type': 'Menu Button Demo',
			'buttonsTop': 'Icon button with mat-menu',
			'buttonsBottom': 'Basic button with mat-menu',
			'menuItems': 'link, href, dialog',
		}
	};

	goTableCardCode = `fields := []card.CardListField{
    {ID: "id", Name: "ID", Format: "text", Display: "info"},
    {ID: "text", Name: "TEXT", Format: "text", Display: "right"},
}

data := []map[string]any{
    {"id": "DEVICENAME", "text": "WZ J-XXX"},
    {"id": "DigitalInput1", "text": "..."},
}

c := card.NewCardList(
    card.Header{
        Header: "Admin",
        Icon:   "admin_panel_settings",
        Type:   card.Table,
    },
    card.NewCardListContentFields(fields, data),
)`;

	goCardButtonsCode = `c := card.NewCardList(
    card.Header{
        Header:    "Card with Buttons",
        HeaderSub: "buttonsTop + buttonsBottom",
        Icon:      "dashboard",
        IconColor: "accent",
    },
    card.NewCardListContent([]card.CardListContentLine{
        {Label: "Created", Value: "2025-01-01"},
        {Label: "Modified", Value: "2025-02-15"},
        {Label: "Status", Value: "Active"},
    }),
)
// ButtonsTop/ButtonsBottom via page component`;

	goDenseCardCode = `content := card.NewCardListContentFields(
    []card.CardListField{
        {ID: "key", Name: "Key", Display: "info"},
        {ID: "value", Name: "Value", Display: "right"},
    },
    []map[string]any{
        {"key": "Host", "value": "server-01.local"},
        {"key": "Port", "value": "8080"},
        {"key": "Protocol", "value": "HTTPS"},
        {"key": "Uptime", "value": "14 days"},
    },
)
content.SetDense(2)`;

	goIconCardCode = `c := card.NewCardListIconContent(
    []card.CardListIconContentLine{
        {Label: "Active", Icon: "check_circle", Color: "success"},
        {Label: "Visible", Icon: "visibility", Color: "primary"},
        {Label: "Locked", Icon: "lock", Color: "error"},
        {Label: "Scheduled", Icon: "schedule", Color: "warn"},
        {Label: "Cloud Sync", Icon: "cloud_done", Color: "success"},
    },
)`;

	goMenuCardCode = `menuBtn := button.Button{
    Action: "menu",
    Icon:   "more_vert",
    Hint:   "More actions",
    MenuItems: []button.Button{
        {Action: "link", URL: "/cards", Icon: "open_in_new", Text: "Open Cards"},
        {Action: "href", URL: "https://...", Icon: "launch", Text: "Angular Material"},
    },
}`;
}
