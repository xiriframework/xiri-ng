---
name: xiri-ng-expert
description: Experte für die xiri-ng Angular-Library. Verwende diesen Skill IMMER wenn Angular-Code geschrieben wird der @xiriframework/xiri-ng importiert, oder wenn der User nach xiri-Komponenten (xiri-dyncomponent, xiri-form-fields, xiri-table, xiri-card usw.), XiriDataService, XiriSnackbarService, provideXiriServices, Form-Feldern mit showWhen-Bedingungen, oder Server-Side-Tables fragt.
---

# xiri-ng Expert

Du bist Experte für die **xiri-ng** Library (`@xiriframework/xiri-ng`) — eine Angular-21-Komponentenbibliothek, die vom Go-Backend (`xiri-go`) erzeugte JSON-Strukturen in Material-Design-3-UIs rendert.

**Wichtig:** Diese Datei enthält die häufigsten API-Signaturen. Lies `references/*.md` **nur** wenn du eine Komponente oder ein Feature brauchst, das hier nicht dokumentiert ist.

## Architektur

Backend-JSON → `xiri-dyncomponent` → Standalone-Components → Material Design 3.

- **Angular 21** mit Standalone-Components, Signals, OnPush, `input()`/`output()` API
- **Angular Material 3** mit SCSS-Theming (`ThemeService` mit `mode`-Signal)
- **Reactive Forms** (`UntypedFormGroup`) für `XiriFormFieldsComponent`
- **JSON-Driven**: Backend schickt `XiriDynData[]` → Frontend rendert per `xiri-dyncomponent`
- **Public API**: `projects/xiri-ng/src/public-api.ts` — jede Komponente, jedes Interface wird dort exportiert

## Setup — provideXiriServices

```typescript
import { provideXiriServices } from '@xiriframework/xiri-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideXiriServices({ api: '/api/' }),   // Default: '/api/'
  ],
};
```

Alle Services sind `providedIn: 'root'` (automatisch verfügbar nach Provider-Registrierung).

## Services — Quick Reference

```typescript
import {
  XiriDataService, XiriSnackbarService, XiriResponseHandlerService,
  XiriFormService, XiriDownloadService, XiriDateService, XiriNumberService,
  XiriLocalStorageService, XiriSessionStorageService, ThemeService,
} from '@xiriframework/xiri-ng';

// HTTP-Client mit Snackbar-Integration
data.get(url): Observable<Object>
data.post(url, payload): Observable<any>
data.postFile(url, payload): Observable<any>                   // responseType blob
data.postFileResponse(url, payload): Observable<HttpResponse>  // für download service
data.getConfigApi(): string                                    // Base-URL

// Toast-Notifications
snackbar.success(msg, duration?, action?)
snackbar.error(msg, duration?, action?)
snackbar.info(msg, duration?, action?)
snackbar.warning(msg, duration?, action?)
snackbar.handleResponse(response): boolean   // parst response.message + response.messageType

// Backend-Response-Handler (navigation / page-refresh / table-refresh)
responseHandler.handle(result, { onTableRefresh?, onTableUpdate? })

// File-Download
download.download(httpResponse, filename, openInNewTab): boolean

// Theme (Signal-basiert)
theme.mode          // Signal<'light' | 'dark' | 'auto'>
theme.isDark        // computed Signal<boolean>
theme.setTheme('dark' | 'light' | 'auto')
theme.toggle()
theme.resetToAuto()

// Storage — wrapper mit in-memory-Fallback
localStorage.set(name, value)
localStorage.get(name)
localStorage.getTimeout(name, maxSeconds)   // null wenn älter
localStorage.remove(name)
localStorage.clear()
// XiriSessionStorageService hat gleiche API
```

## xiri-dyncomponent — der JSON-Renderer

```html
<xiri-dyncomponent [data]="components" [filterData]="filter"></xiri-dyncomponent>
```

```typescript
import { XiriDynData } from '@xiriframework/xiri-ng';

components: XiriDynData[] = [
  { type: 'card', data: { header: 'Titel', fields: [...], data: {...} } },
  { type: 'table', data: { url: '/api/items', fields: [...] } },
  { type: 'stat', data: { value: 42, label: 'Offen' } },
];

// type ist einer von:
// card | buttonline | table | cardlink | links | form | query
// stepper | header | list | spacer | container | infopoint | multiprogress
// imagetext | tabs | expansion | infotext | html | stat | empty-state
// timeline | page-header | section | divider | stat-grid | toolbar
// description-list
```

## xiri-form-fields — Forms

```html
<xiri-form-fields
  [form]="fields"
  [display]="'full'"
  [disabled]="submitting()"
  (formChange)="onFormChange($event)">
</xiri-form-fields>
```

```typescript
import { XiriFormField } from '@xiriframework/xiri-ng';

fields: XiriFormField[] = [
  { id: 'name',  type: 'text',   name: 'Name',   required: true, validations: [...] },
  { id: 'email', type: 'text',   subtype: 'email', name: 'E-Mail' },
  { id: 'group', type: 'model',  name: 'Gruppe', url: '/api/groups' },
  { id: 'active',type: 'bool',   name: 'Aktiv',  value: true },
  { id: 'desc',  type: 'textarea', name: 'Beschreibung', rows: 4,
    showWhen: { field: 'active', operator: 'equals', value: true } },
];
```

Verfügbare `type`-Werte: `text`, `email`, `password`, `textarea`, `number`, `bool`, `select`, `object`, `model`, `multiselect`, `treeselect`, `date`, `datetime`, `daterange`, `datetimerange`, `file`, `volume`, `timelimit`, `chips`, `question`, `waiting`, `header`.

`display` = `'full' | 'line' | 'small'` — Layout-Modus.

**showWhen-Operators:** `equals`, `notEquals`, `contains`, `greaterThan`, `lessThan`, `in`, `notEmpty`.

Zugriff auf die reactive Form:

```typescript
@ViewChild(XiriFormFieldsComponent) fieldsCmp!: XiriFormFieldsComponent;

submit() {
  const values = this.fieldsCmp.formGroup.value;
  if (this.fieldsCmp.formGroup.valid) { ... }
}
```

## xiri-form — Backend-integriertes Formular

```html
<xiri-form [settings]="{
  url: '/api/users/add',
  load: true,
  header: 'Neuer User'
}"></xiri-form>
```

Lädt Felder + Buttons vom Backend, submit → POST → response-handler navigiert/refresht.

## xiri-table — volle Datentabelle

```html
<xiri-table [settings]="tableSettings" (clickedRow)="openEdit($event)"></xiri-table>
```

```typescript
tableSettings = {
  url: '/api/devices',
  serverSide: true,
  options: {
    pagination: true, itemsPerPage: 50, sort: true, search: true,
    saveState: true, saveStateId: 'devices-table',
    select: true, selectButtons: [ ... ],
    editUrl: '/api/devices/inline-edit',
    buttons: { buttons: [...], class: 'small' },
  },
  fields: [
    { id: 'id',     name: 'ID',     format: 'number' },
    { id: 'name',   name: 'Name',   search: true, sort: true, sticky: true },
    { id: 'status', name: 'Status', format: 'icon', icons: [...] },
    { id: 'count',  name: 'Anzahl', format: 'number', webformat: 'integer', align: 'right', footer: 'sum' },
    { id: 'note',   name: 'Notiz',  editable: true, inputType: 'text' },
  ],
};
```

Öffentliche Methoden: `reload()`, `searchDo(text)`, `startInlineEdit(row, column)`, `cancelInlineEdit()`, `saveInlineEdit(row, column)`, `selection` (SelectionModel), `isAllSelected()`, `masterToggle()`.

## xiri-raw-table — minimale Tabelle

```html
<xiri-raw-table [settings]="{ data: rows, fields: cols, dense: 8 }"></xiri-raw-table>
```

Keine Pagination, kein Sort, keine API — nur Daten rendern.

## xiri-query — Suchformular mit Live-Ergebnis

```html
<xiri-query [settings]="{
  fields: filterFields,
  url: '/api/search',
  collapsed: false,
  saveState: true, saveStateId: 'search-x',
  buttonline: { ... }
}" (change)="onFilterChange($event)"></xiri-query>
```

Debounce 300ms, ergebnis unter dem Filter als `XiriDynData[]`.

## xiri-dialog — Modal-Dialog

```typescript
import { MatDialog } from '@angular/material/dialog';
import { XiriDialogComponent } from '@xiriframework/xiri-ng';

constructor(private dialog: MatDialog) {}

open() {
  this.dialog.open(XiriDialogComponent, {
    data: { url: '/api/user/edit/42', type: 'form', size: '800px' },
  });
}
```

`type`: `'form' | 'data' | 'question' | 'waiting' | 'table'`.

## xiri-button / xiri-buttonline

```typescript
import { XiriButton, XiriButtonResult } from '@xiriframework/xiri-ng';

buttons: XiriButton[] = [
  { text: 'Speichern', type: 'raised', color: 'primary', action: 'api',
    url: '/api/save', default: true },
  { text: 'Löschen',  type: 'flat', color: 'warn', action: 'dialog',
    url: '/api/delete/confirm' },
  { text: 'Zurück',   type: 'flat', action: 'back' },
];
```

```html
<xiri-buttonline [settings]="{ buttons, class: 'small' }"
                 [filterData]="filter"
                 (result)="onResult($event)"></xiri-buttonline>
```

`action`: `'api' | 'dialog' | 'download' | 'link' | 'back' | 'close' | 'return' | 'menu' | …`.

## xiri-stepper — Multi-Step Wizard

```typescript
stepperSettings = {
  url: '/api/onboarding',
  steps: [
    { title: 'Daten',   fields: [...], buttons: [...] },
    { title: 'Kontakt', fields: [...], buttons: [...] },
    { title: 'Review',  fields: [...], buttons: [...], extra: { finalize: true } },
  ],
};
```

## Layout / Container

```html
<xiri-page-header [settings]="{ title: 'Users', subtitle: '42 aktiv',
                                 icon: 'group', buttons: { buttons: [...] } }"/>
<xiri-toolbar [settings]="{ title: 'Items', search: true, buttons: {...} }"
              (searchChanged)="onSearch($event)"/>
<xiri-section [settings]="{ title: 'Details', collapsible: true, components: [...] }"/>
<xiri-divider [settings]="{ text: 'Weitere Optionen', spacing: 'normal' }"/>
<xiri-tabs [settings]="{ tabs: [...], lazy: true }"/>
<xiri-expansion [settings]="{ panels: [...], multi: false, lazy: true }"/>
<xiri-sidenav [settings]="{ prefix: '/app/', fields: navItems }"/>
<xiri-breadcrumb [settings]="breadcrumbItems"/>
<xiri-skeleton type="table-row" [lines]="5" [columns]="4"/>
<xiri-empty-state [settings]="{ icon: 'inbox', title: 'Leer', button: {...} }"/>
```

## Info / Display

```html
<xiri-stat [settings]="{ value: 1234, label: 'Umsatz', prefix: '€', color: 'primary',
                         trend: { value: 12, direction: 'up' } }"/>
<xiri-stat-grid [settings]="{ stats: [...], columns: 4, title: 'KPIs' }"/>
<xiri-timeline [settings]="{ items: [...], orientation: 'vertical' }"/>
<xiri-description-list [settings]="{ items: [...], columns: 2, layout: 'horizontal' }"/>
<xiri-list [settings]="{ sections: [...] }"/>
<xiri-infopoint [settings]="{ text: 'Info', info: 'Detail', icon: 'info', iconColor: 'primary' }"/>
<xiri-multiprogress [settings]="{ data: [...], show: 5, header: 'Top 5' }"/>
<xiri-imagetext [settings]="{ url: '/img.png', info: '...', header: '...' }"/>
<xiri-header [settings]="{ text: 'Abschnitt', color: 'primary', size: 'h2' }"/>
<xiri-card [settings]="{ url: '/api/overview', header: 'Übersicht', collapsible: true }"/>
<xiri-cardlink [settings]="{ link: '/app/users', icon: 'group', iconSet: '', text: 'Users' }"/>
<xiri-links [settings]="{ data: [...], header: 'Schnellzugriff' }"/>
<xiri-done/>
<xiri-error text="Fehler beim Laden"/>
```

## Farben

```typescript
import { XiriColor } from '@xiriframework/xiri-ng';

// Theme: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'warn' | 'error' | 'success'
// Extended: 'emerald' | 'red' | 'yellow' | 'green' | 'blue' | 'purple'
//   'gray' | 'lightgray' | 'darkgray' | 'orange' | 'white' | 'black' | 'inherit'
```

## Pipes

```html
{{ htmlString | safeHtml }}   <!-- bypass DomSanitizer -->
```

## Typische Patterns

### 1. Seite rendert Backend-JSON

```typescript
@Component({
  selector: 'app-overview',
  imports: [XiriDynComponentComponent],
  template: `<xiri-dyncomponent [data]="components()"/>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent {
  private data = inject(XiriDataService);
  components = signal<XiriDynData[]>([]);

  ngOnInit() {
    this.data.get('/api/overview').subscribe((res: any) => this.components.set(res.data));
  }
}
```

### 2. Form mit showWhen + Submit

```typescript
onSubmit() {
  if (this.fieldsCmp.formGroup.invalid) return;
  this.data.post('/api/save', this.fieldsCmp.formGroup.value)
    .subscribe(res => this.responseHandler.handle(res));
}
```

### 3. Server-Side-Table mit Refresh nach Edit

```typescript
@ViewChild(XiriTableComponent) table!: XiriTableComponent;

onEditSaved(res: any) {
  this.responseHandler.handle(res, {
    onTableRefresh: () => this.table.reload(),
  });
}
```

### 4. Dialog öffnen für Edit

```typescript
edit(row: any) {
  this.dialog.open(XiriDialogComponent, {
    data: { url: `/api/items/edit/${row.id}`, type: 'form', size: '700px' },
  }).afterClosed().subscribe(() => this.table.reload());
}
```

## Wann Reference-Dateien lesen

| Datei                       | Wann                                                             |
| --------------------------- | ---------------------------------------------------------------- |
| `references/setup.md`       | Alle Services im Detail (Methoden-Signaturen, Rückgabe-Typen)    |
| `references/dyncomponent.md`| Vollständige XiriDynData-Type-Liste + Custom-Rendering           |
| `references/form-fields.md` | Jeder Feldtyp im Detail, alle Validator-Keys, select-Directive   |
| `references/table.md`       | Table-Options-Felder, Inline-Edit, Selection, Footer-Aggregation |
| `references/components.md`  | Kompakte Signatur-Liste aller 30+ Komponenten                    |
| `references/theming-i18n.md`| ThemeService, Colors, Date/Number-Locale-Propagation             |

## Was NICHT tun

- Nicht `{ ... }`-Casts statt typisierter Interfaces (nutze `XiriDynData`, `XiriFormField`, `XiriTableField`)
- Nicht `NgModule` — alle xiri-Komponenten sind **standalone**
- Nicht `ChangeDetectionStrategy.Default` ohne Grund — `OnPush` ist Convention
- Nicht `FormBuilder` direkt — `XiriFormFieldsComponent` baut die `UntypedFormGroup` selbst
- Nicht API-Calls in Templates — in Component-Code via `XiriDataService`
- Keine erfundenen Selectors / Inputs — wenn unsicher, `public-api.ts` lesen
