# xiri-dyncomponent — JSON-Renderer

Die `xiri-dyncomponent` ist der Kern des JSON-Driven-UI Patterns: ein Array von `XiriDynData`-Objekten wird zu einer Kette von xiri-Komponenten gerendert.

## Selector

`xiri-dyncomponent`

## Inputs

```typescript
@input.required data: XiriDynData[];
@input          filterData: any = undefined;
@input          dyncomponent: TemplateRef<any> = undefined;
  // Optional: TemplateRef für Custom-Rendering (type: 'custom' oder unbekannter type).
```

## Outputs

Keine.

## XiriDynData Interface

```typescript
export interface XiriDynData {
  id?: number;                            // Wird auto-generiert wenn fehlt.
  type: XiriDynDataType | (string & {});  // Komponenten-Typ.
  data?: any;                             // Settings-Objekt der Ziel-Komponente.
  display?: string;                       // CSS-Klassen für Wrapper.
  newRow?: boolean;                       // Grid-Layout: neue Zeile beginnen.
  mode?: string;                          // Nur für 'barchart': 'simple' | 'stacked' | 'heatmap'
}

export type XiriDynDataType =
  | 'card' | 'buttonline' | 'table' | 'cardlink' | 'links'
  | 'form' | 'query' | 'stepper' | 'header' | 'list'
  | 'spacer' | 'container'
  | 'infopoint' | 'multiprogress' | 'imagetext'
  | 'tabs' | 'expansion' | 'infotext' | 'html'
  | 'stat' | 'empty-state' | 'timeline'
  | 'page-header' | 'section' | 'divider'
  | 'stat-grid' | 'toolbar' | 'description-list'
  | 'barchart' | 'linechart' | 'piechart' | 'gaugechart'
  | 'heatmap' | 'calendar' | 'tree' | 'sankey' | 'gantt';
```

## Mapping type → Komponente

| `type`              | Rendered Component     | `data` = Settings-Interface          |
| ------------------- | ---------------------- | ------------------------------------ |
| `card`              | `xiri-card`            | `XiriCardSettings`                   |
| `buttonline`        | `xiri-buttonline`      | `XiriButtonlineSettings`             |
| `table`             | `xiri-table`           | `XiriTableSettings`                  |
| `cardlink`          | `xiri-cardlink`        | `XiriCardlinkSettings`               |
| `links`             | `xiri-links`           | `XiriLinksSettings`                  |
| `form`              | `xiri-form`            | `XiriFormSettings`                   |
| `query`             | `xiri-query`           | `XiriQuerySettings`                  |
| `stepper`           | `xiri-stepper`         | `XiriStepperSettings`                |
| `header`            | `xiri-header`          | `XiriHeaderSettings`                 |
| `list`              | `xiri-list`            | `XiriListSettings`                   |
| `infopoint`         | `xiri-infopoint`       | `XiriInfopointSettings`              |
| `multiprogress`     | `xiri-multiprogress`   | `XiriMultiprogressSettings`          |
| `imagetext`         | `xiri-imagetext`       | `XiriImagetextSettings`              |
| `tabs`              | `xiri-tabs`            | `XiriTabsSettings`                   |
| `expansion`         | `xiri-expansion`       | `XiriExpansionSettings`              |
| `stat`              | `xiri-stat`            | `XiriStatSettings`                   |
| `empty-state`       | `xiri-empty-state`     | `XiriEmptyStateSettings`             |
| `timeline`          | `xiri-timeline`        | `XiriTimelineSettings`               |
| `page-header`       | `xiri-page-header`     | `XiriPageHeaderSettings`             |
| `section`           | `xiri-section`         | `XiriSectionSettings` (rekursiv!)    |
| `divider`           | `xiri-divider`         | `XiriDividerSettings`                |
| `stat-grid`         | `xiri-stat-grid`       | `XiriStatGridSettings`               |
| `toolbar`           | `xiri-toolbar`         | `XiriToolbarSettings`                |
| `description-list`  | `xiri-description-list`| `XiriDescriptionListSettings`        |
| `barchart`          | `xiri-barchart`        | `XiriBarChartSettings` (+ `mode` auf XiriDynData) |
| `linechart`         | `xiri-linechart`       | `XiriLineChartSettings`              |
| `piechart`          | `xiri-piechart`        | `XiriPieChartSettings`               |
| `gaugechart`        | `xiri-gaugechart`      | `XiriGaugeChartSettings`             |
| `heatmap`           | `xiri-heatmap`         | `XiriHeatmapSettings`                |
| `calendar`          | `xiri-calendar`        | `XiriCalendarSettings`               |
| `tree`              | `xiri-tree`            | `XiriTreeSettings`                   |
| `sankey`            | `xiri-sankey`          | `XiriSankeySettings`                 |
| `gantt`             | `xiri-gantt`           | `XiriGanttSettings`                  |
| `spacer`            | vertical spacer div    | `{ size?: string }`                  |
| `container`         | wrapper div            | `{ components: XiriDynData[] }`      |
| `infotext`          | Text-Absatz            | `{ text: string, html?: boolean }`   |
| `html`              | innerHTML (SafeHtml)   | `{ html: string }`                   |

## Custom-Rendering via TemplateRef

Für Typen außerhalb der Liste: übergib einen `dyncomponent` TemplateRef als Fallback.

```html
<xiri-dyncomponent [data]="components" [dyncomponent]="customTpl"/>

<ng-template #customTpl let-item>
  <app-my-custom-widget [data]="item.data"/>
</ng-template>
```

Der TemplateRef erhält das gesamte `XiriDynData`-Item als Context (`$implicit`).

## Verschachtelung

`section`, `tabs`, `expansion` und `container` akzeptieren in ihren `data`-Feldern wieder `XiriDynData[]` (rekursiv) — die `xiri-dyncomponent` rendert alle Ebenen durch.

```typescript
const page: XiriDynData[] = [
  { type: 'page-header', data: { title: 'Dashboard' } },
  { type: 'stat-grid',   data: { stats: [...], columns: 4 } },
  { type: 'section', data: {
      title: 'Details',
      collapsible: true,
      components: [
        { type: 'table', data: { url: '/api/items' } },
        { type: 'divider', data: {} },
        { type: 'infopoint', data: { text: 'Hinweis', icon: 'info' } },
      ],
  }},
];
```

## filterData — Weitergabe an Tabellen und Buttons

`filterData` wird automatisch an alle `xiri-table`-, `xiri-buttonline`- und `xiri-toolbar`-Kinder weitergereicht. Das ist wichtig, wenn ein `xiri-query` Filter-Werte setzt, die Tabellen oder API-Buttons konsumieren sollen.

```html
<xiri-query [settings]="qs" (change)="filter = $event"></xiri-query>
<xiri-dyncomponent [data]="results" [filterData]="filter"/>
```

## DynPage — der seitenweite Loader (Wildcard-Route)

Es gibt **keine** Library-Page-Komponente — jede App implementiert einen kleinen
`DynpageComponent`, der auf der `**`-Wildcard-Route hängt: jede URL → API-Call → die
Response `{ bread?, data: XiriDynData[] }` wird via `xiri-dyncomponent` gerendert. Neue
Screens entstehen damit rein im Backend. Standard-Implementierung (= Demo-App):

```typescript
@Component({
  selector: 'app-dynpage',
  imports: [MatProgressSpinner, XiriDynComponentComponent],
  template: `
    @if (loading) { <mat-spinner diameter="30" /> }
    @if (error) { <h1>Page not found</h1> }
    <xiri-dyncomponent [data]="data()" />`,
})
export class DynpageComponent implements OnInit, OnDestroy {
  private dataService = inject(XiriDataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  loading = true; error = false; bread: any = null;
  data = signal<XiriDynData[] | null>(null);
  private subs = new Subscription();

  constructor() {
    this.router.events.pipe(
      filter((e: Event) => e instanceof NavigationEnd), takeUntilDestroyed(),
    ).subscribe(() => this.load());
  }
  ngOnInit() { this.load(); }

  private load() {
    this.loading = true; this.data.set(null); this.bread = null; this.error = false;
    let url = this.router.url;
    if (url.startsWith('/')) url = url.substring(1);
    const qp = this.route.snapshot.queryParams;
    const call = Object.keys(qp).length === 0
      ? this.dataService.get(url)            // ohne Query-Params → GET
      : this.dataService.post(url, qp);      // mit Query-Params → POST (qp als Body)
    this.subs.add(call.subscribe({
      next: (res: any) => { this.bread = res.bread; this.data.set(res.data); this.loading = false; },
      error: () => { this.error = true; this.loading = false; },
    }));
  }
  ngOnDestroy() { this.subs.unsubscribe(); }
}
```

Registrierung (`main.ts`): `provideRouter([{ path: '**', component: DynpageComponent }],
withRouterConfig({ onSameUrlNavigation: 'reload' }))` — das `reload` sorgt dafür, dass
`refresh:"page"` und Navigation auf dieselbe URL die Seite tatsächlich neu laden.
Backend (xiri-go): `page.NewPage().Add(...).Print(ctx)` liefert genau `{ bread, data }`.
