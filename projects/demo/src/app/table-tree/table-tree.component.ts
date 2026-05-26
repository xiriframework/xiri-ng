import { Component, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriTableComponent, XiriTableSettings } from 'projects/xiri-ng/src/lib/table/table.component';
import { XiriTableField } from 'projects/xiri-ng/src/lib/raw-table/tabefield.interface';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';

@Component( {
	            selector: 'app-table-tree',
	            templateUrl: './table-tree.component.html',
	            styleUrl: './table-tree.component.scss',
	            imports: [ XiriPageHeaderComponent, XiriSectionComponent, XiriTableComponent, GoCodePanelComponent, XiriBreadcrumbComponent ]
            } )
export class TableTreeComponent {

	private _snackBar = inject( MatSnackBar );

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Tree Table' },
	];

	pageHeader: XiriPageHeaderSettings = {
		title:     'Tree Table',
		subtitle:  'Hierarchische Tabelle mit Einrückung, Expand/Collapse, Suche über Vorfahren und State-Persistenz',
		icon:      'account_tree',
		iconColor: 'primary',
	};

	// Multi-root hierarchy (3 roots), depth 4: Österreich > Wien > Favoriten > Inzersdorf.
	// "Orphan" has a parentId that is not in the dataset → treated as a root.
	private regions = [
		{ id: 1,    parentId: 0,   name: 'Österreich',  manager: 'A. Huber', count: 218 },
		{ id: 10,   parentId: 1,   name: 'Wien',        manager: 'B. Wolf',  count: 95 },
		{ id: 100,  parentId: 10,  name: 'Favoriten',   manager: 'C. Berg',  count: 28 },
		{ id: 101,  parentId: 10,  name: 'Döbling',     manager: 'D. Klein', count: 19 },
		{ id: 1000, parentId: 100, name: 'Inzersdorf',  manager: 'E. Stern', count: 8 },
		{ id: 11,   parentId: 1,   name: 'Graz',        manager: 'F. Maier', count: 41 },
		{ id: 2,    parentId: 0,   name: 'Deutschland', manager: 'G. Bauer', count: 320 },
		{ id: 20,   parentId: 2,   name: 'Bayern',      manager: 'H. Vogel', count: 140 },
		{ id: 200,  parentId: 20,  name: 'München',     manager: 'I. Frank', count: 88 },
		{ id: 3,    parentId: 0,   name: 'Schweiz',     manager: 'J. Roth',  count: 73 },
		{ id: 99,   parentId: 7777, name: 'Verwaiste Region', manager: 'K. Lang', count: 5 },
	];

	private treeFields: XiriTableField[] = [
		{ id: 'id', name: 'ID', format: 'id' },
		{ id: 'parentId', name: 'Parent', format: 'id' },
		{ id: 'name', name: 'Region / Bezirk' },
		{ id: 'manager', name: 'Verantwortlich' },
		{ id: 'count', name: 'Anzahl', align: 'right' },
	];

	sectionBasic: XiriSectionSettings = {
		title:    '1: Basis-Baum (collapse/expand, Suche, Persistenz)',
		subtitle: 'Mehrere Roots, Tiefe 4. Pfeile klappen einzelne Knoten auf, die Toolbar-Buttons alle. Der Expand-State wird im localStorage gespeichert (persistStateKey). Die Suche zeigt Treffer + gedimmte Vorfahren.',
		icon:     'account_tree',
	};

	basicTree: XiriTableSettings = {
		data:   this.regions.map( r => ( { ...r } ) ), // own row objects (tree metadata is attached per-row)
		fields: this.treeFields,
		options: {
			search:  true,
			borders: true,
			title:   'Regionen',
		},
		tree: {
			idField:         'id',
			parentIdField:   'parentId',
			treeColumn:      'name',
			persistStateKey: 'demo-regions',
			showCounts:      true,
		},
		hasFilter: false,
	};

	sectionAddSub: XiriSectionSettings = {
		title:    '2: Mit "+ Sub-Eintrag" und expandAllByDefault',
		subtitle: 'addSubHandler aktiviert einen Plus-Button pro Zeile (beim Hover sichtbar). Initial sind alle Knoten ausgeklappt.',
		icon:     'add_circle',
	};

	addSubTree: XiriTableSettings = {
		data:   this.regions.map( r => ( { ...r } ) ), // own row objects (tree metadata is attached per-row)
		fields: this.treeFields,
		options: {
			search:  true,
			borders: true,
			title:   'Regionen (mit Sub-Anlage)',
		},
		tree: {
			idField:           'id',
			parentIdField:     'parentId',
			treeColumn:        'name',
			expandAllByDefault: true,
			showCounts:        true,
			addSubHandler:     ( parentRow: any ) =>
				this._snackBar.open( `Sub-Eintrag unter "${ parentRow.name }" (id ${ parentRow.id }) anlegen`, 'OK', { duration: 3000 } ),
		},
		hasFilter: false,
	};

	goCode = `b := xiriTable.NewBuilder[Region]()
b.IdField("id", "ID", func(r Region) int64 { return r.ID })
b.IdField("parentId", "Parent", func(r Region) int64 { return r.ParentID }) // id-format → in data, not shown
b.TextField("name", "Region / Bezirk", func(r Region) string { return r.Name })
b.TextField("manager", "Verantwortlich", func(r Region) string { return r.Manager })
b.IntField("count", "Anzahl", func(r Region) int32 { return r.Count }).WithAlign(xiriTable.AlignRight)

b.Tree(xiriTable.TreeConfig{
    IdField:         "id",
    ParentIdField:   "parentId",
    TreeColumn:      "name",
    PersistStateKey: "demo-regions",
    AddSubURL:       xurl.NewUrl("/Portal/Region/Add?parent={id}"),
})

tbl := b.Build()
tbl.SetData(regions)`;
}
