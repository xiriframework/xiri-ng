# Components — xiri-ng Reference

Kompakt-Signaturen aller Komponenten die in `public-api.ts` exportiert werden. Inputs + Outputs mit Typen.

## Form & Dialog

### xiri-form

```typescript
@input.required settings: XiriFormSettings;

interface XiriFormSettings {
  load?: boolean;             // Auto-load url im ngOnInit
  url: string;
  fields?: XiriFormField[];   // Init-Fields wenn load=false
  buttons?: XiriButton[];
  header?: string;
}
```

Outputs: keine.

### xiri-dialog (via MatDialog)

```typescript
dialog.open(XiriDialogComponent, {
  data: XiriDialogSettings,
});

type XiriDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface XiriDialogSettings {
  url?: string;
  size?: XiriDialogSize | string;                             // Token oder rohes CSS, Default 'md' (600px)
  type: 'form' | 'data' | 'question' | 'waiting' | 'table';
  data?: any;
  filter?: any;
}
```

Größen-Tokens (Desktop): `sm`=400px, `md`=600px, `lg`=900px, `xl`=1200px, `full`=95vw (mit `xiri-dialog-full` Panel-Class, hebt MatDialogs `max-width: 80vw` auf). Mobile-Breakpoints (XSmall/Small) ignorieren `size` und nutzen `90vw`. Unbekannte Werte werden als rohes CSS durchgereicht (Backward-Compat). Im Backend bevorzugt typsicher via `dialog.WithSize(dialog.SizeLg)`.

Bei `type: 'table'` wird der Backend-`content` (mit `data` + `fields`) direkt als `XiriRawTableSettings` an die eingebettete `xiri-raw-table` durchgereicht. Optionales `showHeader: true` im content (Backend: `dialog.Dialog.WithTableHeader()`) aktiviert die Spalten-Header-Zeile — Default aus.

### xiri-query

```typescript
@input.required settings: XiriQuerySettings;
@input          dyncomponent: TemplateRef<any>;

interface XiriQuerySettings {
  fields?: XiriFormField[];
  dyn?: XiriDynData[];         // Initiale Komponenten (Results)
  url?: string;                // POST-URL bei Filter-Change
  buttonline?: XiriDynData;
  extra?: any;
  saveState?: boolean;
  saveStateId?: string;
  collapsed?: boolean;
}

@output change: EventEmitter<any>;  // debounced 300ms
```

### xiri-alert (via MatDialog)

```typescript
dialog.open(XiriAlertComponent, {
  data: { header: string; text: string; icon: string; buttons: XiriButton[] },
});
```

## Cards & Links

### xiri-card

```typescript
@input.required settings: XiriCardSettings;

interface XiriCardSettings {
  url?: string;                    // POST mit null → Load
  reload?: boolean;
  data?: any;
  fields?: XiriTableField[];       // Card als Mini-Table
  components?: XiriDynData[];      // Multi-Component-Modus (xcol-Grid mit Sub-Components)
  header?: string;
  headerSub?: string;
  headerIcon?: string;
  headerIconColor?: XiriColor;
  buttonsTop?: XiriButtonlineSettings;
  buttonsBottom?: XiriButtonlineSettings;
  dense?: number;
  forceMinWidth?: boolean;
  showHeader?: boolean;            // Default false. Bei true zeigt die eingebettete
                                   // xiri-raw-table die <thead>-Zeile mit Spalten-Headern.
                                   // Backend setzt es via card.*Card.WithTableHeader().
  collapsible?: boolean;
  collapsed?: boolean;
  maxHeight?: string;
  padding?: string;                // 'xs'|'sm'|'md'|'lg'|'xl' Token oder CSS-Wert.
                                   // Wirkt nur im Multi-Component-Modus.
                                   // Default 'md'. Auf xs-Viewport (<576px) immer 8px.
}
```

**Render-Reihenfolge im Card-Body:**

1. Wenn `components` befüllt ist → `<xiri-dyncomponent class="xrow">` (Multi-Component-Modus). Layout pro Sub-Component via `display: 'xcol-…'` auf jedem `XiriDynData`-Eintrag. Card-Header bleibt darüber. Beispiel:
   ```ts
   {
     header: 'Activity', headerIcon: 'show_chart', headerIconColor: 'primary',
     components: [
       { type: 'barchart', mode: 'simple', display: 'xcol-12', data: { /* XiriBarChartSettings */ } },
       { type: 'stat',                    display: 'xcol-6',  data: { value: '18h', label: 'Today',       compact: true } },
       { type: 'stat',                    display: 'xcol-6',  data: { value: '32h', label: 'Last 7 days', compact: true } },
     ],
   }
   ```
2. Sonst wenn `data` + `fields` vorhanden → bestehendes `xiri-raw-table`-Rendering (Mini-Table-Card).
3. Sonst → bestehendes Content-Rendering.

Das **Vorhandensein** von `components` schaltet automatisch in den Multi-Component-Modus — kein eigener `cardType` nötig.

#### `compact?: boolean` auf Sub-Components

Die folgenden Components zeichnen sonst eine eigene `<mat-card>` mit Schatten — in einer `xiri-card` ergibt das einen Card-in-Card-Look. `compact: true` lässt die innere mat-card weg:

| Type | Settings-Interface | Wo |
| --- | --- | --- |
| `stat` | `XiriStatSettings.compact` | jede Stat-Verwendung |
| `barchart` | `XiriBarChartSettings.compact` | jede BarChart-Verwendung |
| `cardlink` | `XiriCardlinkSettings.compact` | jede Cardlink-Verwendung |
| `imagetext` | `XiriImagetextSettings.compact` | jede Imagetext-Verwendung |
| `infopoint` | `XiriInfopointSettings.compact` | jede InfoPoint-Verwendung |
| `links` | `XiriLinksSettings.compact` | jede Links-Verwendung |
| `multiprogress` | `XiriMultiprogressSettings.compact` | jede MultiProgress-Verwendung |

Implementierung pro Component: `[class.compact]` auf dem Host, `:host(.compact)`-Selectoren in SCSS (transparenter Background, kein Schatten, reduziertes Padding).

### xiri-cardlink

```typescript
@input.required settings: XiriCardlinkSettings;

interface XiriCardlinkSettings {
  link: string;
  icon?: string;
  iconSet: string;
  text?: string;
  sub?: string;
  compact?: boolean;        // Skipt eigene mat-card-Hülle (nesting in xiri-card).
}
```

### xiri-links

```typescript
@input.required settings: XiriLinksSettings;

interface XiriLinksSettings {
  data: XiriButton[];
  header?: string;
  headerSub?: string;
  headerIcon?: string;
  headerIconColor?: XiriColor;
  compact?: boolean;        // Skipt eigene mat-card-Hülle (nesting in xiri-card).
}
```

## Buttons

### xiri-button

```typescript
@input.required button: XiriButton;
@input          disabled: boolean = false;
@input          filterData: any = undefined;
@input          url: string = undefined;      // Override button.url

@output result: EventEmitter<XiriButtonResult>;

interface XiriButtonResult {
  button: XiriButton;
  result: any;
  done: boolean;
  loading: boolean;
}
```

**Custom-Payload (`button.data`):** Für `action: 'api'` und `action: 'download'` baut die Button-Komponente den POST-Body als `{ ...filterData, ...button.data }`. `data` ist `Record<string, any>`. Klassisches Beispiel: CSV-Download-Buttons des `xiri-go`-Tabellen-Builders setzen `data: { _csv: true }`, das Backend (`LoadFilterData`) erkennt das Flag und liefert CSV statt Web-JSON. Backend-Setter: `button.WithData(map[string]any{...})` (siehe xiri-go-expert).

### xiri-buttonline

```typescript
@input.required settings: XiriButtonlineSettings;
@input          disabled: boolean = false;
@input          filterData: any = undefined;

@output result: EventEmitter<XiriButtonResult>;

interface XiriButtonlineSettings {
  buttons: XiriButton[];
  class: string;         // z.B. 'small'
}
```

### xiri-buttonstyle (interne Hilfskomponente)

```typescript
@input.required button: XiriButton;
@input.required disabled: boolean;
@input          loading: boolean = false;
```

### XiriButton

```typescript
interface XiriButton {
  text: string;
  type: string;      // 'raised' | 'flat' | 'fab' | 'icon' | 'stroked' | 'mini-fab' | …
  action: string;    // 'api' | 'dialog' | 'download' | 'link' | 'back' |
                     // 'close' | 'return' | 'menu' | …

  default?: boolean;
  url?: string;
  hide?: boolean;
  color?: XiriColor;
  icon?: string;
  iconColor?: XiriColor;
  fontIcon?: string;
  fontSet?: string;
  class?: string;
  hint?: string;
  tabIndex?: number;
  inline?: boolean;
  disabled?: boolean;

  data?: any;
  target?: string;
  loading?: boolean;
  filename?: string;

  // Send-Buttons (z.B. in Tables)
  check?: any[];
  send?: any[];

  // action: 'menu'
  menuItems?: {
    action: string;
    url?: string;
    icon?: string;
    color?: string;
    text?: string;
    data?: any;
  }[];
}
```

## Wizard

### xiri-stepper

```typescript
@input.required settings: XiriStepperSettings;

interface XiriStepperSettings {
  url?: string;                   // Default-URL für Steps
  steps: XiriStepperStep[];
}

interface XiriStepperStep {
  url?: string;
  title: string;
  fields: XiriFormField[];
  data?: any;
  extra?: any;
  buttons: XiriButton[];
}
```

### xiri-done

Keine Inputs / Outputs. Zeigt ein Success-Checkmark-Icon.

### xiri-error

```typescript
@input.required text: string;
```

## Headers, Page-Header, Toolbar, Section, Divider

### xiri-header

```typescript
@input.required settings: XiriHeaderSettings;

interface XiriHeaderSettings {
  text: string;
  color: string;
  size: string;   // 'h1' | 'h2' | 'h3' | …
}
```

### xiri-page-header

```typescript
@input.required settings: XiriPageHeaderSettings;

interface XiriPageHeaderSettings {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  buttons?: XiriButtonlineSettings;
}
```

### xiri-toolbar

```typescript
@input.required settings: XiriToolbarSettings;
@input          filterData: any = undefined;

interface XiriToolbarSettings {
  title?: string;
  icon?: string;
  search?: boolean | { placeholder?: string };
  buttons?: XiriButtonlineSettings;
}

@output searchChanged: EventEmitter<string>;
```

### xiri-section

```typescript
@input.required settings: XiriSectionSettings;
@input          dyncomponent: TemplateRef<any>;

interface XiriSectionSettings {
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  buttons?: XiriButtonlineSettings;
  components?: XiriDynData[];     // rekursive Nested-Komponenten
}
```

### xiri-divider

```typescript
@input.required settings: XiriDividerSettings;

interface XiriDividerSettings {
  text?: string;
  icon?: string;
  spacing?: 'compact' | 'normal' | 'large';
}
```

## Listen, Infos, Fortschritt

### xiri-list

```typescript
@input.required settings: XiriListSettings;

interface XiriListSettings {
  sections: XiriListSection[];
}

interface XiriListSection {
  name: string;
  data: XiriListItem[];
}

interface XiriListItem {
  name: string;
  info: string;
  icon: string;
  iconSet?: string;
  iconColor: XiriColor;
  url: string;
  hasFavorite?: boolean;
  isFavorite?: boolean;
  favoriteUrl?: string;
  favoriteHint?: string;
}
```

### xiri-infopoint

```typescript
@input.required settings: XiriInfopointSettings;

interface XiriInfopointSettings {
  text: string;
  info: string;
  url?: string;
  urlParams?: object;
  icon: string;
  iconSet?: string;
  iconColor: XiriColor;
  dense?: boolean;
  compact?: boolean;            // Skipt eigene mat-card-Hülle (nesting in xiri-card).
}
```

### xiri-multiprogress

```typescript
@input.required settings: XiriMultiprogressSettings;

interface XiriMultiprogressSettings {
  data: XiriMultiprogressItem[];
  header?: string;
  headerIcon?: string;
  headerIconColor?: XiriColor;
  show?: number;                // initiale Zahl sichtbarer Items
  compact?: boolean;            // Skipt eigene mat-card-Hülle (nesting in xiri-card).
}

interface XiriMultiprogressItem {
  text: string;
  value: string;
  progress: number;             // 0-100
  color?: XiriColor;
}
```

### xiri-imagetext

```typescript
@input.required settings: XiriImagetextSettings;

interface XiriImagetextSettings {
  url: string;
  info: string;
  header?: string;
  headerSub?: string;
  headerIcon?: string;
  headerIconColor?: XiriColor;
  compact?: boolean;            // Skipt eigene mat-card-Hülle (nesting in xiri-card).
}
```

## Search & Navigation

### xiri-search

```typescript
@input placeholder: string = '';
@input open: boolean = false;
@input reset: number = -1;       // Trigger-Reset bei Änderung
@input escape: boolean = true;
@input focus: number = -1;       // Trigger-Focus bei Änderung
@input text: string = '';

@output changed: EventEmitter<string>;   // debounced 200ms
```

### xiri-sidenav

```typescript
@input settings: XiriSidebarSettings;

interface XiriSidebarSettings {
  prefix: string;                  // Route-Prefix zum Überspringen
  fields: XiriNavigationField[];
}

interface XiriNavigationField {
  name: string;
  link?: string;
  icon: string;
  iconSet?: string;
  extern?: string;
  active?: boolean;
  path?: string;
  regex?: RegExp;
  menu?: boolean;
  showSubmenu?: boolean;
  sub?: XiriNavigationField[];
}
```

### xiri-breadcrumb

```typescript
@input.required settings: XiriBreadcrumbItem[];

interface XiriBreadcrumbItem {
  label: string;
  link?: string;
  icon?: string;
  extern?: boolean;
}
```

## Tabs & Expansion

### xiri-tabs

```typescript
@input.required settings: XiriTabsSettings;
@input          filterData: any;
@input          dyncomponent: TemplateRef<any>;

interface XiriTabsSettings {
  tabs: XiriTabSettings[];
  selectedIndex?: number;
  dynamicHeight?: boolean;
  animationDuration?: string;
  lazy?: boolean;                    // Content erst bei tab-select
  unload?: boolean;                  // Content bei deselect zerstören
  headerPosition?: 'above' | 'below';
  alignTabs?: 'start' | 'center' | 'end';
  stretchTabs?: boolean;
}

interface XiriTabSettings {
  label: string;
  icon?: string;
  disabled?: boolean;
  data: XiriDynData[];
  lazy?: boolean;
  unload?: boolean;
}
```

### xiri-expansion

```typescript
@input.required settings: XiriExpansionSettings;
@input          filterData: any;
@input          dyncomponent: TemplateRef<any>;

interface XiriExpansionSettings {
  panels: XiriExpansionPanelSettings[];
  multi?: boolean;
  displayMode?: 'default' | 'flat';
  togglePosition?: 'before' | 'after';
  hideToggle?: boolean;
  lazy?: boolean;
  unload?: boolean;
}

interface XiriExpansionPanelSettings {
  title: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
  expanded?: boolean;
  data: XiriDynData[];
  lazy?: boolean;
  unload?: boolean;
}
```

## Skeleton & Empty-State

### xiri-skeleton

```typescript
@input type: XiriSkeletonType = 'text';
  // 'text' | 'circle' | 'rect' | 'table-row'

@input width: string = '100%';
@input height: string = '1em';
@input lines: number = 1;
@input columns: number = 4;        // für 'table-row'
@input animate: boolean = true;
@input fill: boolean = false;
```

### xiri-empty-state

```typescript
@input.required settings: XiriEmptyStateSettings;

interface XiriEmptyStateSettings {
  icon?: string;
  iconColor?: XiriColor;
  title?: string;
  description?: string;
  button?: XiriButton;
}

@output buttonResult: EventEmitter<XiriButtonResult>;
```

## Stats & Timeline & Description-List

### xiri-stat

```typescript
@input.required settings: XiriStatSettings;

interface XiriStatSettings {
  value: string | number;
  label: string;
  icon?: string;
  iconColor?: XiriColor;
  trend?: XiriStatTrend;
  prefix?: string;
  suffix?: string;
  color?: XiriColor;
  compact?: boolean;            // Skipt eigene mat-card-Hülle, kleinere Schrift —
                                // für Stats die in einer äußeren Card geschachtelt sind
                                // (Card-in-Card-Look vermeiden).
}

interface XiriStatTrend {
  value: number;
  direction: 'up' | 'down' | 'neutral';
}
```

### xiri-stat-grid

```typescript
@input.required settings: XiriStatGridSettings;

interface XiriStatGridSettings {
  stats: XiriStatSettings[];
  columns?: number;
  title?: string;
}
```

### xiri-timeline

```typescript
@input.required settings: XiriTimelineSettings;

interface XiriTimelineSettings {
  items: XiriTimelineItem[];
  orientation?: 'horizontal' | 'vertical';
}

interface XiriTimelineItem {
  title: string;
  description?: string;
  datetime?: string;
  icon?: string;
  iconColor?: XiriColor;
}
```

### xiri-description-list

```typescript
@input.required settings: XiriDescriptionListSettings;

interface XiriDescriptionListSettings {
  items: XiriDescriptionListItem[];
  columns?: 1 | 2 | 3;
  layout?: 'horizontal' | 'stacked';
}

interface XiriDescriptionListItem {
  label: string;
  value: string;
  icon?: string;
  color?: string;
  type?: 'text' | 'link' | 'html' | 'badge';
}
```

### xiri-barchart

```typescript
@input            mode: XiriBarChartMode = 'simple';   // 'simple' | 'stacked' | 'heatmap'
@input.required   settings: XiriBarChartSettings;

interface XiriBarChartSettings {
  title?: string;
  yMin?: number;
  yMax?: number;
  color?: XiriColor;                  // Default-Farbe (simple/heatmap)
  bars?: XiriBarChartBar[];           // simple + stacked
  points?: XiriBarChartPoint[];       // heatmap
  compact?: boolean;                  // Skipt eigene mat-card-Hülle (nesting in xiri-card).
}

interface XiriBarChartBar {
  label: string;                      // Achsen-Label (kurz)
  value?: number;                     // simple
  segments?: XiriBarChartSegment[];   // stacked
  name?: string;                      // optionaler Tooltip-Name (Vollbezeichnung)
}

interface XiriBarChartSegment {
  value: number;
  color?: XiriColor;
  name?: string;                      // Tooltip-Name pro Segment ("Low strain" …)
}

interface XiriBarChartPoint {
  time: number;                       // unix milliseconds
  value: number;
  name?: string;                      // optionaler Tooltip-Name (z. B. "Repeat #3")
}
```

**Rendering:** Verwendet **echarts v6**. Die Library deklariert `echarts` als optionale `peerDependency` — Apps installieren `echarts` nur, wenn sie `xiri-barchart` (oder `type: 'barchart'`) verwenden. Der Component lädt echarts lazy via `await import('echarts')` (eigener Bundle-Chunk).

**Tooltip:** Pro Mode eigener Formatter. Wenn `bar.name` / `segment.name` / `point.name` gesetzt sind, erscheinen sie im Tooltip; sonst Fallback auf `label` bzw. echarts-Default. Demo-Pattern: `label: 'M', name: 'Monday'` → X-Achse zeigt "M", Tooltip zeigt "Monday".

**Resize:** intern via `ResizeObserver` — kein manuelles `resize()` nötig.

**Im dyncomponent:** `{ type: 'barchart', mode: 'stacked', data: XiriBarChartSettings }`.

### xiri-linechart

```typescript
@input.required settings: XiriLineChartSettings;

interface XiriLineChartSettings {
  title?: string;
  xLabels: string[];
  lines: XiriLineChartLine[];
  yMin?: number;
  yMax?: number;
  smooth?: boolean;          // alle Linien als geglättete Kurve
  compact?: boolean;
}

interface XiriLineChartLine {
  name: string;
  values: number[];          // Werte parallel zu xLabels
  color?: XiriColor;
  dashed?: boolean;
  area?: boolean;            // Fläche unter der Linie füllen
}
```

Im dyncomponent: `{ type: 'linechart', data: XiriLineChartSettings }`.

### xiri-piechart

```typescript
@input.required settings: XiriPieChartSettings;

interface XiriPieChartSettings {
  title?: string;
  slices: XiriPieChartSlice[];
  donut?: boolean;             // Ring statt Pie
  nightingale?: boolean;       // Rose-Style: Slice-Radien skalieren mit Wert
  nightingaleType?: 'radius' | 'area';   // Default 'radius'
  compact?: boolean;
}

interface XiriPieChartSlice {
  name: string;
  value: number;
  color?: XiriColor;
}
```

Im dyncomponent: `{ type: 'piechart', data: XiriPieChartSettings }`.

### xiri-gaugechart

```typescript
@input.required settings: XiriGaugeChartSettings;

interface XiriGaugeChartSettings {
  title?: string;
  value: number;
  min?: number;              // Default 0
  max?: number;              // Default 100
  color?: XiriColor;
  label?: string;            // Einheits-Label unter dem Wert ('%', 'GB', …)
  compact?: boolean;
}
```

Im dyncomponent: `{ type: 'gaugechart', data: XiriGaugeChartSettings }`.

### xiri-heatmap

```typescript
@input.required settings: XiriHeatmapSettings;

interface XiriHeatmapSettings {
  title?: string;
  xLabels: string[];
  yLabels: string[];
  cells: XiriHeatmapCell[];        // [{x: number, y: number, value: number}]
  min?: number;
  max?: number;
  colorRange?: [string, string];   // CSS low → high (Default light → purple)
  showValues?: boolean;            // Werte in Zellen anzeigen
  compact?: boolean;
}

interface XiriHeatmapCell { x: number; y: number; value: number; label?: string; }
```

Im dyncomponent: `{ type: 'heatmap', data: XiriHeatmapSettings }`.

### xiri-calendar

```typescript
@input.required settings: XiriCalendarSettings;

interface XiriCalendarSettings {
  title?: string;
  range: string | [string, string];   // 'YYYY' oder ['YYYY-MM-DD', 'YYYY-MM-DD']
  cells: XiriCalendarCell[];          // [{date: 'YYYY-MM-DD', value: number}]
  min?: number;
  max?: number;
  colorRange?: [string, string];      // Default light-green → dark-green (GitHub-Style)
  cellSize?: number;                  // px (Default 16, compact 12)
  compact?: boolean;
}
```

Im dyncomponent: `{ type: 'calendar', data: XiriCalendarSettings }`.

### xiri-tree

```typescript
@input.required settings: XiriTreeSettings;

interface XiriTreeSettings {
  title?: string;
  root: XiriTreeNode;
  orient?: 'LR' | 'RL' | 'TB' | 'BT';   // Default 'LR'
  layout?: 'orthogonal' | 'radial';      // Default 'orthogonal'
  compact?: boolean;
}

interface XiriTreeNode {
  name: string;
  value?: number;
  children?: XiriTreeNode[];
  collapsed?: boolean;          // initial eingeklappt
}
```

Im dyncomponent: `{ type: 'tree', data: XiriTreeSettings }`.

### xiri-sankey

```typescript
@input.required settings: XiriSankeySettings;

interface XiriSankeySettings {
  title?: string;
  nodes: { name: string; color?: XiriColor }[];
  links: { source: string; target: string; value: number }[];
  orient?: 'horizontal' | 'vertical';   // Default 'horizontal'
  compact?: boolean;
}
```

Im dyncomponent: `{ type: 'sankey', data: XiriSankeySettings }`.

### xiri-gantt

Echarts-Custom-Series-basierter Gantt. Zeiten in unix milliseconds.

```typescript
@input.required settings: XiriGanttSettings;

interface XiriGanttSettings {
  title?: string;
  rows: string[];                       // Y-Achsen-Kategorien (top-down)
  tasks: XiriGanttTask[];
  rangeStart?: number;                  // unix ms (optional X-Achsen-Range)
  rangeEnd?: number;
  compact?: boolean;
}

interface XiriGanttTask {
  row: number;        // Index in rows[]
  name: string;
  start: number;      // unix ms
  end: number;        // unix ms
  color?: XiriColor;
}
```

Im dyncomponent: `{ type: 'gantt', data: XiriGanttSettings }`.

### xiri-echarts-host (geteilte Basis)

Internes Plumbing für alle echarts-basierten Charts. Public exportiert, falls eigene Custom-Charts gebaut werden sollen.

```typescript
@input.required option: any;             // Vollständige echarts-Option
@input          compact: boolean = false;
@input          title?: string;
@input          headerIcon?: string;
@input          headerIconColor?: XiriColor;
@input          chartHeight: string = '200px';
```

Übernimmt: Lazy `await import('echarts')`, ResizeObserver, mat-card-Hülle (mit Compact-Modus = flat), Title-Header, Error-Display. Re-render via `effect` auf `option()`.

Eigenes Chart bauen:

```typescript
@Component({
  selector: 'app-my-chart',
  template: `<xiri-echarts-host [option]="option()" [compact]="compact()" [title]="settings().title"/>`,
  imports: [XiriEchartsHostComponent]
})
export class MyChart {
  settings = input.required<MySettings>();
  compact  = computed(() => !!this.settings().compact);
  option   = computed(() => buildMyEchartsOption(this.settings(), this.compact()));
}
```

Helper-Funktionen aus `lib/echarts/`: `resolveColor(token, fallback)` — XiriColor → CSS-Wert; `escapeHtml(s)` — für Tooltip-Strings.
