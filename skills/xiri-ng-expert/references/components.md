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

interface XiriDialogSettings {
  url?: string;
  size?: string;                                              // Default '600px'
  type: 'form' | 'data' | 'question' | 'waiting' | 'table';
  data?: any;
  filter?: any;
}
```

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
  header?: string;
  headerSub?: string;
  headerIcon?: string;
  headerIconColor?: XiriColor;
  buttonsTop?: XiriButtonlineSettings;
  buttonsBottom?: XiriButtonlineSettings;
  dense?: number;
  forceMinWidth?: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
  maxHeight?: string;
}
```

### xiri-cardlink

```typescript
@input.required settings: XiriCardlinkSettings;

interface XiriCardlinkSettings {
  link: string;
  icon?: string;
  iconSet: string;
  text?: string;
  sub?: string;
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
