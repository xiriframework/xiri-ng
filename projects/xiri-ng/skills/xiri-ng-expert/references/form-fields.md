# Form-Fields — xiri-ng Reference

## XiriFormFieldsComponent

Renderer für `XiriFormField[]`. Baut intern eine `UntypedFormGroup` mit Reactive Validators, handhabt `showWhen`, collapsible Headers und alle 19 Feldtypen.

### Selector

`xiri-form-fields`

### Inputs

```typescript
@input form: XiriFormField[] | null = null
@input display: XiriFormFieldDisplay = 'full'       // 'full' | 'line' | 'small'
@input disabled: boolean = false
@input check: Observable<void> = null                // Trigger für Revalidierung
```

### Outputs

```typescript
@output formChange: EventEmitter<any>
  // Emittet die UntypedFormGroup (nicht nur values) bei Änderungen.
```

### Öffentliche API

```typescript
formGroup: UntypedFormGroup                       // Reactive Form

isFieldVisible(field: XiriFormField): boolean
toggleSection(header: XiriFormField): void
isSectionCollapsed(headerId: string): boolean
```

### Zugriff auf Werte und Validität

```typescript
@ViewChild(XiriFormFieldsComponent) fieldsCmp!: XiriFormFieldsComponent;

submit() {
  if (this.fieldsCmp.formGroup.invalid) {
    this.fieldsCmp.formGroup.markAllAsTouched();
    return;
  }
  const payload = this.fieldsCmp.formGroup.value;
  this.data.post('/api/save', payload)
    .subscribe(res => this.responseHandler.handle(res));
}
```

## XiriFormField Interface

```typescript
export interface XiriFormField {
  // --- Basis ---
  id: string;
  type: string;               // siehe Liste unten
  subtype?: string;           // z.B. 'email' subtype von 'text'
  formtype?: string;          // Alt-Weg, gleich wie type

  // --- Label & Display ---
  name?: string;              // Label
  hint?: string;
  class?: string;
  textPrefix?: string;
  textSuffix?: string;
  iconPrefix?: string;
  iconSuffix?: string;
  locale?: string;
  placeholder?: string;       // v.a. für bool / header

  // --- Wert & Validierung ---
  value?: any;
  validations?: XiriFormValidator[];
  list?: XiriFormFieldSelectOption[];   // für select/treeselect
  texts?: object;                        // für timelimit

  // --- State ---
  hide?: boolean;
  required?: boolean;
  disabled?: boolean;
  collapsible?: boolean;     // header
  collapsed?: boolean;       // header initial

  // --- Constraints ---
  min?: number;              // number | date | array-length
  max?: number;
  pattern?: string;          // regex

  // --- Select / Model / Treeselect ---
  multiple?: boolean;
  url?: string;              // load options von Backend
  search?: boolean;
  serverSideSearch?: boolean;
  params?: object;

  // --- File ---
  accept?: string;
  pwdhide?: boolean;         // password

  // --- Question / Waiting ---
  icon?: string;
  iconColor?: XiriColor;
  done?: boolean;

  // --- Conditional Display ---
  showWhen?: XiriFormFieldCondition | XiriFormFieldCondition[];

  // --- Weitere ---
  rows?: number;             // textarea
  array?: any[];             // alt zu list
  tree?: boolean;
  control?: FormControl;     // Internal
}
```

### Feld-Typen

| `type`          | Rendered als                                      | Wichtige Properties                |
| --------------- | ------------------------------------------------- | ---------------------------------- |
| `text`          | Mat-Input                                         | `subtype` (email/url), `pattern`   |
| `email`         | Mat-Input type=email                              |                                    |
| `password`      | Mat-Input type=password                           | `pwdhide`                          |
| `textarea`      | Mat-Textarea                                      | `rows`                             |
| `number`        | Mat-Input type=number                             | `min`, `max`, `textSuffix`         |
| `bool`          | Mat-Checkbox / Slide-Toggle                       | `placeholder` für Begleittext      |
| `select`        | Mat-Select mit `list`                             | `multiple`, `search`               |
| `multiselect`   | Mat-Select mit `multiple: true`                   | `list` oder `url`                  |
| `model`         | Mat-Select mit Backend-Load                       | `url`, `serverSideSearch`          |
| `object`        | Komplexes Objekt-Select (JSON-Value)              | `url`, `list`                      |
| `treeselect`    | Tree-Picker                                       | `url`, `tree: true`                |
| `date`          | Mat-Datepicker (Unix-Timestamp)                   | `min`, `max`                       |
| `datetime`      | Date + Time Picker                                | `min`, `max`                       |
| `daterange`     | Start- + End-Date                                 | `min`, `max`                       |
| `datetimerange` | Start- + End-DateTime                             |                                    |
| `yearmonth`     | Monats-Picker (Multi-Year-View, MM.yyyy)          | `min`, `max` (Unix), `required`    |
| `file`          | File-Upload Button                                | `accept`                           |
| `volume`        | Volume-Slider (mit Einheit via `textSuffix`)      | `min`, `max`                       |
| `timelimit`     | Time-Limit Auswahl                                | `texts` (Label-Overrides)          |
| `chips`         | Mat-Chip-List                                     | `list`, `validations`              |
| `question`      | Read-Only Frage + Icon (z.B. Confirmation-Dialog) | `icon`, `iconColor`, `done`        |
| `waiting`       | Loading-Spinner                                   |                                    |
| `header`        | Sektions-Header (mit optional Collapse)           | `collapsible`, `collapsed`         |

#### Collapsible Sections (`header` mit `collapsible: true`)

Es gibt **keine** explizite Section-Grenze im Datenmodell — das Frontend gruppiert heuristisch:
ein collapsible Header beginnt eine Section, die für **alle Folgefelder bis zum nächsten Header**
gilt (`isInCollapsedSection()` läuft vom Feld rückwärts zum nächsten Header; ein `divider` bricht
die Section ab). Initial eingeklappt via `collapsed: true`.

**Mehrere collapsible Header stapeln als unabhängige Geschwister** — jeder Header startet seine
eigene Section und wird nie von einer vorherigen, eingeklappten Section versteckt. Beispiel:

```typescript
fields: [
  { id: 'h1', type: 'header', value: 'Basic',         collapsible: true, collapsed: false },
  { id: 'firstName', type: 'text', name: 'First Name' },
  { id: 'h2', type: 'header', value: 'Advanced',      collapsible: true, collapsed: true },
  { id: 'role', type: 'select', name: 'Role', list: [...] },
  { id: 'h3', type: 'header', value: 'Notifications',  collapsible: true, collapsed: false },
  { id: 'notify', type: 'bool', name: 'E-Mail' },
]
// 'Advanced' eingeklappt -> 'role' verborgen, aber 'Notifications' (+ Inhalt) bleibt sichtbar.
```

Backend-Pendant: `field.NewHeaderField(id, text).SetCollapsible(true).SetCollapsed(...)`
(siehe xiri-go-expert). Für read-only Detail-Ansichten mit echtem Akkordeon (nestbare Inhalte,
auch in Dialogen nutzbar) stattdessen die `expansion`-Komponente.

#### `yearmonth` — Monats-Auswahl

Render: eigener `<xiri-yearmonth>`, intern Mat-Datepicker mit `startView="multi-year"`.
Value wird auf den **1. des Monats 00:00 (lokal)** normalisiert und als Unix-Timestamp
(Sekunden) zurückgegeben. Anzeige-Format `MM.yyyy`, Picker-Labels `MMM yyyy` /
`MMMM yyyy`. Default `required: true`, wenn nicht explizit gesetzt.

```typescript
{ id: 'period', type: 'yearmonth', name: 'Berichtsmonat',
  required: true,
  min: <unixSeconds>,   // optional, untere Schranke
  max: <unixSeconds>    // optional, obere Schranke
}
```

Backend-Pendant: `field.NewYearMonthField(...)` (siehe xiri-go-expert).

### showWhen — Conditional Visibility

```typescript
export interface XiriFormFieldCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains'
          | 'greaterThan' | 'lessThan' | 'in' | 'notEmpty';
  value?: any;
}
```

Einzelne Bedingung:

```typescript
{ id: 'reason', type: 'text', name: 'Grund',
  showWhen: { field: 'active', operator: 'equals', value: false } }
```

Array = **UND**-Verknüpfung:

```typescript
{ id: 'priorityNote', type: 'textarea', name: 'Prio-Notiz',
  showWhen: [
    { field: 'priority', operator: 'in', value: ['high', 'critical'] },
    { field: 'note',     operator: 'notEmpty' },
  ]}
```

### Select-Optionen

```typescript
export interface XiriFormFieldSelectOption {
  id: number | string;
  name: string;
  disabled?: boolean;
  color?: XiriColor;
  isGroup?: boolean;                       // markiert einen Gruppen-/Elternknoten (treeselect)
  children?: XiriFormFieldSelectOption[];  // verschachtelte Optionen → Hierarchie für treeselect
}
```

Inline (statisch):

```typescript
{ id: 'status', type: 'select', name: 'Status',
  list: [
    { id: 1, name: 'Aktiv',    color: 'success' },
    { id: 2, name: 'Inaktiv',  color: 'warn' },
    { id: 3, name: 'Gesperrt', color: 'error', disabled: true },
  ]}
```

Hierarchisch (`treeselect` — Optionen über `children` verschachteln; auswählbar sind die Blattknoten, `isGroup` markiert Elternknoten):

```typescript
{ id: 'region', type: 'treeselect', name: 'Region',
  list: [
    { id: 'eu', name: 'Europa', isGroup: true, children: [
      { id: 'at', name: 'Österreich' },
      { id: 'de', name: 'Deutschland' },
    ]},
    { id: 'us', name: 'USA' },
  ]}
```

Per Backend (`model` oder `select` mit `url`):

```typescript
{ id: 'group', type: 'model', name: 'Gruppe',
  url: '/api/groups/options',
  serverSideSearch: true,
  params: { tenant: 42 } }
```

Das Backend liefert `XiriFormFieldSelectOption[]` zurück.

## XiriFormValidator

```typescript
export interface XiriFormValidator {
  type: 'required' | 'minlength' | 'maxlength' | 'pattern' |
        'min' | 'max' | 'email' | ...;
  value?: any;
  message?: string;
}
```

Beispiel:

```typescript
{ id: 'pwd', type: 'password', name: 'Passwort',
  validations: [
    { type: 'required' },
    { type: 'minlength', value: 8, message: 'Mind. 8 Zeichen' },
    { type: 'pattern',   value: '.*[0-9].*', message: '≥1 Zahl' },
  ]}
```

## XiriSelectDirective

Interne Directive für Mat-Select mit Client- oder Server-side-Search. Wird normalerweise nicht direkt verwendet — `XiriFormFieldsComponent` setzt sie automatisch für `select`, `multiselect`, `model`, `object`.

### Selector

`[xiriSelect]` auf `<mat-select>`

### Inputs (mit Alias)

```typescript
@input({ alias: 'values' })
  values: XiriFormFieldSelectOption[] = [];

@input({ alias: 'serverSideSearch' })
  serverSideSearch: boolean = false;

@input({ alias: 'serverUrl' })
  serverUrl: string = '';

@input({ alias: 'serverParams' })
  serverParams: any = {};

@input({ alias: 'predicate' })
  predicate: XiriSelectPredicate = DEFAULT_PREDICATE;   // (option, term) => boolean

@input({ alias: 'compare' })
  compare: XiriSelectCompare = DEFAULT_COMPARE;          // (a, b) => boolean
```

### API

```typescript
get formControl(): UntypedFormControl;
get filter(): Observable<XiriFormFieldSelectOption[]>;
```
