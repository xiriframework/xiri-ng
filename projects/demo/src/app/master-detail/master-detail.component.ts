import { Component, computed, inject, signal } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { XiriCalloutComponent, XiriCalloutSettings } from 'projects/xiri-ng/src/lib/callout/callout.component';
import { XiriQueryComponent, XiriQueryResultCount, XiriQuerySettings } from 'projects/xiri-ng/src/lib/query/query.component';
import { XiriTableComponent, XiriTableSettings, XiriTableRow } from 'projects/xiri-ng/src/lib/table/table.component';
import { XiriTagChip } from 'projects/xiri-ng/src/lib/formfields/field.interface';
import { XiriSidepanelService } from 'projects/xiri-ng/src/lib/sidepanel/sidepanel.service';
import { XiriDynData } from 'projects/xiri-ng/src/lib/dyncomponent/dyndata.interface';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';

interface DemoOrder {
	ref: string;
	title: string;
	statusId: number;
	category: string;
	assignee: string;
	cost: number;
	machine: string;
	due: string;
}

@Component( {
	            selector: 'app-master-detail',
	            templateUrl: './master-detail.component.html',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriBreadcrumbComponent,
		            XiriCalloutComponent,
		            XiriQueryComponent,
		            XiriTableComponent,
		            GoCodePanelComponent
	            ]
            } )
export class MasterDetailComponent {

	private sidepanel = inject( XiriSidepanelService );

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Patterns' },
		{ label: 'Master-Detail' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Master-Detail (Rezept)',
		subtitle: 'Query + Table als Master-Liste, Detail als Sidepanel-Overlay – ohne eigene Detail-Route.',
		icon: 'vertical_split',
		iconColor: 'primary',
	};

	// Kernpunkt des Rezepts als Callout: Overlay statt Detail-Route.
	recipeCallout: XiriCalloutSettings = {
		tone: 'info',
		icon: 'lightbulb',
		title: 'Warum ein Sidepanel-Overlay statt einer Detail-Route?',
		text: 'Das Detail öffnet als Overlay über der Liste – die Master-Tabelle bleibt montiert. ' +
			'Deshalb bleiben aktive Filter (Query-Chips) und die Scrollposition beim Öffnen und Schließen erhalten. ' +
			'Eine eigene Detail-Route (/orders/:id) würde die Listen-Komponente zerstören und beim Zurücknavigieren ' +
			'Filter und Scrollposition verlieren.',
	};

	sectionRecipe: XiriSectionSettings = {
		title: 'Das Rezept',
		subtitle: 'Kombination bestehender Komponenten – keine neue Lib-Komponente, kein Renderer-Eingriff.',
		icon: 'menu_book',
		iconColor: 'accent',
	};

	sectionList: XiriSectionSettings = {
		title: 'Master-Liste mit Filter',
		subtitle: 'Zeile anklicken öffnet das Detail rechts. Filter setzen, scrollen, Detail öffnen/schließen – ' +
			'der Listenzustand bleibt erhalten.',
		icon: 'list_alt',
		iconColor: 'primary',
	};

	private readonly statusList = [
		{ id: 1, name: 'Offen' },
		{ id: 2, name: 'In Arbeit' },
		{ id: 3, name: 'Erledigt' },
	];

	private readonly statusChipColor: Record<number, XiriTagChip[ 'color' ]> = {
		1: 'warn',
		2: 'primary',
		3: 'success',
	};

	// Clientseitiger Beispiel-Datensatz (kein Backend, kein Mock-Interceptor).
	private readonly orders: DemoOrder[] = Array.from( { length: 24 }, ( _, i ) => {
		const n = i + 1;
		const categories = [ 'Wartung', 'Inspektion', 'Beschaffung' ];
		const machines = [ 'Bagger CAT 320', 'Radlader L120', 'Kran LTM 1050', 'Walze BW 213' ];
		const assignees = [ 'Max', 'Anna', 'Tom', 'Lisa' ];
		return {
			ref: 'A-' + ( 1000 + n ),
			title: [ 'Hydraulikpumpe tauschen', 'Getriebeöl nachfüllen', 'Bremsbeläge prüfen',
				'Schlauch bestellen', 'Filter wechseln', 'Sicherheitscheck' ][ i % 6 ] + ' #' + n,
			statusId: ( i % 3 ) + 1,
			category: categories[ i % 3 ],
			assignee: assignees[ i % 4 ],
			cost: 120 + ( i * 37 ) % 900,
			machine: machines[ i % 4 ],
			due: '2026-0' + ( ( i % 6 ) + 1 ) + '-1' + ( ( i % 8 ) + 1 ),
		};
	} );

	querySettings: XiriQuerySettings = {
		showActiveFilters: true,
		showResultCount: true,
		fields: [
			{ id: 'search', type: 'text', name: 'Suchbegriff' },
			{ id: 'status', type: 'select', name: 'Status', required: false, value: null, list: this.statusList },
			{
				id: 'categories', type: 'multiselect', name: 'Kategorie', required: false, value: [], list: [
					{ id: 'Wartung', name: 'Wartung' },
					{ id: 'Inspektion', name: 'Inspektion' },
					{ id: 'Beschaffung', name: 'Beschaffung' },
				]
			},
		],
	};

	private filter = signal<Record<string, unknown> | null>( null );

	private results = computed<DemoOrder[]>( () => {
		const f = this.filter();
		if ( !f )
			return this.orders;

		const search = String( f[ 'search' ] ?? '' ).trim().toLowerCase();
		// Select/Multiselect emittieren ihren Wert als Array (leer = kein Filter).
		const statusArr = Array.isArray( f[ 'status' ] ) ? f[ 'status' ] as unknown[] : [];
		const status = statusArr.length ? Number( statusArr[ 0 ] ) : null;
		const categories = ( f[ 'categories' ] as string[] ) ?? [];

		return this.orders.filter( o => {
			if ( search && !o.title.toLowerCase().includes( search ) && !o.ref.toLowerCase().includes( search ) )
				return false;
			if ( status !== null && o.statusId !== status )
				return false;
			if ( categories.length && !categories.includes( o.category ) )
				return false;
			return true;
		} );
	} );

	count = computed<XiriQueryResultCount>( () => ( { filtered: this.results().length, total: this.orders.length } ) );

	// Gefilterte Ergebnisse als Tabellen-Settings. scrollHeight erzeugt einen Scrollbereich,
	// damit sichtbar wird, dass die Scrollposition beim Öffnen/Schließen des Detail-Overlays erhalten bleibt.
	tableSettings = computed<XiriTableSettings>( () => ( {
		data: this.results().map( o => ( {
			ref: o.ref,
			title: o.title,
			status: [ { label: this.statusName( o.statusId ), color: this.statusChipColor[ o.statusId ] } ] as XiriTagChip[],
			category: o.category,
			assignee: o.assignee,
		} ) ),
		fields: [
			{ id: 'ref', name: 'Referenz', sticky: true },
			{ id: 'title', name: 'Auftrag' },
			{ id: 'status', name: 'Status', format: 'chips' },
			{ id: 'category', name: 'Kategorie' },
			{ id: 'assignee', name: 'Zuständig' },
		],
		options: {
			sort: true, borders: true,
			title: 'Aufträge',
			textNoData: 'Keine Treffer für die aktuellen Filter.',
			scrollHeight: '320px',
		},
		hasFilter: false,
	} ) );

	statusName( statusId: number ): string {
		return this.statusList.find( s => s.id === statusId )?.name ?? String( statusId );
	}

	onFilterChange( filter: Record<string, unknown> | null ): void {
		this.filter.set( filter );
	}

	// Zeilenauswahl öffnet das Detail als Sidepanel-Overlay. Inhalt ist ein XiriDynData[]
	// (description-list + stat + buttonline) – genau die Struktur, die auch ein Go-Backend liefern würde.
	onRowClicked( row: XiriTableRow ): void {
		const order = this.orders.find( o => o.ref === row[ 'ref' ] );
		if ( !order )
			return;

		const detail: XiriDynData[] = [
			{
				type: 'description-list',
				data: {
					layout: 'stacked',
					columns: 1,
					items: [
						{ label: 'Referenz', value: order.ref },
						{ label: 'Auftrag', value: order.title },
						{ label: 'Maschine', value: order.machine, icon: 'precision_manufacturing' },
						{ label: 'Kategorie', value: order.category, type: 'badge', color: 'primary' },
						{ label: 'Zuständig', value: order.assignee, icon: 'person' },
						{ label: 'Fällig am', value: order.due, icon: 'event' },
						{
							label: 'Status', value: this.statusName( order.statusId ),
							type: 'badge', color: this.statusChipColor[ order.statusId ],
						},
					],
				},
			},
			{
				type: 'stat',
				data: { value: order.cost + ' EUR', label: 'Geschätzte Kosten', icon: 'payments', iconColor: 'accent', compact: true },
			},
			{
				type: 'buttonline',
				data: {
					class: '',
					buttons: [
						{ text: 'Bearbeiten', type: 'flat', action: 'link', url: '/Forms', color: 'primary' },
						{ text: 'Als erledigt markieren', type: 'raised', action: 'link', url: '/Overview', color: 'success' },
					],
				},
			},
		];

		this.sidepanel.open( { title: order.ref + ' – Detail', data: detail } );
	}

	goCode = `// Serverseitige Variante desselben Rezepts.
// Master-Liste: Query (FormGroup) + Table wie gehabt.
// Detail: eigener Handler, der auf Zeilenauswahl per POST ein XiriDynData[]
//         für das Sidepanel liefert – dieselbe Struktur wie oben clientseitig.

func (h *Handler) OrderDetail(c echo.Context, ctx *uicontext.UiContext) error {
    ref := c.Param("ref")
    o := h.repo.FindOrder(ref)

    dl := descriptionlist.New().Stacked().
        Item("Referenz", o.Ref).
        Item("Auftrag", o.Title).
        ItemBadge("Status", o.StatusLabel(), o.StatusColor())

    st := stat.New(fmt.Sprintf("%d EUR", o.Cost), "Geschätzte Kosten").
        Icon("payments").Color(core.ColorAccent)

    bl := buttonline.New(
        button.NewLink("Bearbeiten", xurl.NewUrl("Orders/Edit/"+o.Ref)),
        button.NewLink("Erledigt", xurl.NewUrl("Orders/Done/"+o.Ref)),
    )

    // Frontend rendert das Array im Sidepanel via xiri-dyncomponent.
    return wc.Components(dl, st, bl)
}`;
}
