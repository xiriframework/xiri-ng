import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriTableComponent, XiriTableSettings } from 'projects/xiri-ng/src/lib/table/table.component';
import { XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';
import { DemoPageComponent } from '../demo-page/demo-page.component';

@Component( {
	            selector: 'app-table-reorder',
	            templateUrl: './table-reorder.component.html',
	            styleUrl: './table-reorder.component.scss',
	            imports: [ DemoPageComponent, XiriPageHeaderComponent, XiriSectionComponent, XiriTableComponent, GoCodePanelComponent ]
            } )
export class TableReorderComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Drag & Drop' },
	];

	pageHeader: XiriPageHeaderSettings = {
		title:     'Drag & Drop',
		subtitle:  'Zeilen per Ziehgriff umsortieren; die App speichert die Reihenfolge, die Tabelle lädt danach neu',
		icon:      'drag_indicator',
		iconColor: 'primary',
	};

	section: XiriSectionSettings = {
		title:    'Firewall-Regeln',
		subtitle: 'Am Griff ziehen, um eine Regel zu verschieben. Mit Spaltensortierung (dritter Klick hebt sie auf) oder '
		          + 'Suchtext ist der Griff ausgegraut. Die Standardregel ist gesperrt: Verschieben liefert einen Fehler, '
		          + 'der Reload zeigt wieder die gespeicherte Reihenfolge.',
		icon:     'swap_vert',
	};

	rules: XiriTableSettings = {
		url:    'Test/Reorder/Data',
		fields: [
			{ id: 'id', name: 'ID', format: 'id' },
			{ id: 'pos', name: 'Pos.', align: 'right' },
			{ id: 'name', name: 'Regel' },
			{ id: 'source', name: 'Quelle' },
			{ id: 'target', name: 'Ziel' },
			{ id: 'action', name: 'Aktion' },
		],
		options: {
			title:      'Regeln',
			search:     true,
			pagination: false,
			borders:    true,
			reorderUrl: 'Test/Reorder/Move',
		},
		hasFilter: false,
	};

	goCode = `type Rule struct {
    ID     int64
    Pos    int
    Name   string
    Source string
    Target string
    Action string
}

func (ctrl *RuleController) table() *table.Table[Rule] {
    b := table.NewBuilder[Rule]()
    b.IdField("id", "ID", func(r Rule) int64 { return r.ID }) // Pflicht für Drag&Drop
    b.IntField("pos", "Pos.", func(r Rule) int { return r.Pos })
    b.TextField("name", "Regel", func(r Rule) string { return r.Name })
    b.TextField("source", "Quelle", func(r Rule) string { return r.Source })
    b.TextField("target", "Ziel", func(r Rule) string { return r.Target })
    b.TextField("action", "Aktion", func(r Rule) string { return r.Action })
    b.SetTitle("Regeln")
    b.SetPagination(false) // Drag&Drop nur mit allen Zeilen auf einer Seite
    b.SetReorderURL(ctrl.apiUrl("reorder"))
    return b.Build()
}

// POST {id, before, after}: Nachbarn unter und über der Ablagestelle (nil = Listenende/-anfang).
// Mit Filter-Formular zählen nur die sichtbaren Zeilen: bei before == nil gehört die Zeile hinter after.
func (ctrl *RuleController) Reorder(c echo.Context) error {
    var req table.ReorderRequest
    if err := c.Bind(&req); err != nil {
        return err
    }
    if err := ctrl.rules.Move(req.ID, req.Before, req.After); err != nil {
        // Snackbar; die Tabelle lädt trotzdem neu und zeigt die gespeicherte Reihenfolge
        return c.JSON(409, response.NewErrorResponse(err.Error()))
    }
    return c.JSON(200, response.NewReturnSuccess("Reihenfolge gespeichert"))
}`;
}
