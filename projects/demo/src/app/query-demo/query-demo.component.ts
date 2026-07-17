import { Component, computed, signal } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import {
	XiriQueryComponent,
	XiriQueryResultCount,
	XiriQuerySettings
} from 'projects/xiri-ng/src/lib/query/query.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';

interface DemoOrder {
	ref: string;
	title: string;
	status: number;
	category: string;
}

@Component( {
	            selector: 'app-query-demo',
	            templateUrl: './query-demo.component.html',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriBreadcrumbComponent,
		            XiriQueryComponent,
		            GoCodePanelComponent
	            ]
            } )
export class QueryDemoComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Query' },
		{ label: 'Filterzustand' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Query – sichtbarer Filterzustand',
		subtitle: 'Aktive Filter als entfernbare Chips, Trefferzahl und „Alle zurücksetzen".',
		icon: 'filter_list',
		iconColor: 'primary',
	};

	sectionDemo: XiriSectionSettings = {
		title: 'Aktive Filter & Trefferzahl',
		subtitle: 'Rein clientseitig gefiltert – ohne Backend.',
		icon: 'filter_alt',
		iconColor: 'accent',
	};

	private readonly statusList = [
		{ id: 1, name: 'Offen' },
		{ id: 2, name: 'In Arbeit' },
		{ id: 3, name: 'Erledigt' },
	];

	// Beispiel-Datensatz (clientseitig, kein Mock-Interceptor).
	private readonly orders: DemoOrder[] = [
		{ ref: 'A-1001', title: 'Hydraulikpumpe tauschen', status: 1, category: 'Wartung' },
		{ ref: 'A-1002', title: 'Getriebeöl nachfüllen', status: 2, category: 'Wartung' },
		{ ref: 'A-1003', title: 'Bremsbeläge prüfen', status: 3, category: 'Inspektion' },
		{ ref: 'A-1004', title: 'Hydraulikschlauch bestellen', status: 1, category: 'Beschaffung' },
		{ ref: 'A-1005', title: 'Filter wechseln', status: 2, category: 'Wartung' },
		{ ref: 'A-1006', title: 'Sicherheitscheck Fahrwerk', status: 3, category: 'Inspektion' },
	];

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

	results = computed<DemoOrder[]>( () => {
		const f = this.filter();
		if ( !f )
			return this.orders;

		const search = String( f[ 'search' ] ?? '' ).trim().toLowerCase();
		const status = f[ 'status' ] as number | null;
		const categories = ( f[ 'categories' ] as string[] ) ?? [];

		return this.orders.filter( o => {
			if ( search && !o.title.toLowerCase().includes( search ) && !o.ref.toLowerCase().includes( search ) )
				return false;
			if ( status !== null && status !== undefined && o.status !== status )
				return false;
			if ( categories.length && !categories.includes( o.category ) )
				return false;
			return true;
		} );
	} );

	count = computed<XiriQueryResultCount>( () => ( { filtered: this.results().length, total: this.orders.length } ) );

	statusName( status: number ): string {
		return this.statusList.find( s => s.id === status )?.name ?? String( status );
	}

	onFilterChange( filter: Record<string, unknown> | null ): void {
		this.filter.set( filter );
	}

	goQueryCode = `q := query.NewQueryWithFormGroup(fg, nil, nil, nil, nil, nil).
    ShowActiveFilters(true).
    ShowResultCount(true)

// fg is a *group.FormGroup with the filter fields (search, status, categories).
// The frontend renders the active filters as removable chips and shows the
// result count; removing a chip re-runs the same filter flow as applying.`;
}
