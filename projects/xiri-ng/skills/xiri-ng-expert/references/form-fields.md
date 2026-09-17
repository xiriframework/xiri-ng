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
  disabled?: boolean;        // greift beim Aufbau nur bei den zusammengesetzten Feldtypen, s.u.
  collapsible?: boolean;     // header
  collapsed?: boolean;       // header initial

  // --- Constraints ---
  min?: number;              // number | date | array-length
  max?: number;
  pattern?: string;          // regex

  // --- Select / Model / Treeselect ---
  multiple?: boolean;
  selectAll?: boolean;       // select + multiple: „Alle / Keine“-Toggle über der Optionsliste
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

  // --- Server-driven content ---
  reloadOn?: string[];       // Feld-IDs, deren Änderung dieses Feld neu lädt
  reloadUrl?: string;        // Endpoint für den Reload (beides oder keins)
  addUrl?: string;           // „+“-Button: Dialog (GET) legt eine neue Option an, POST → {done, created:{id,name}}

  // --- Weitere ---
  rows?: number;             // textarea
  array?: any[];             // alt zu list
  tree?: boolean;
  control?: FormControl;     // Internal
}
```

**`disabled` beim Aufbau.** Das Feld deaktiviert beim Formularaufbau **nicht** das äußere
FormControl — `createControl()` legt es immer `enabled` an. Ausgewertet wird es nur von den
zusammengesetzten Feldtypen (`date`, `daterange`, `datetimerange`, `yearmonth`, `treeselect`,
`volume`, `file`), die es in ihrem eigenen `field`-Setter lesen. Bei `text`, `number`, `textarea`,
`select`, `multiselect` und `bool` bleibt es beim Aufbau wirkungslos, weil das Template
`field.disabled` nicht auswertet.

Was zuverlässig wirkt: `formGroup.get(id).disable()` von außen (seit 0.4.4 auf allen Feldtypen),
der `disabled`-Input der ganzen `xiri-form-fields`, und ein `disabled` aus einem `reloadOn`-Patch —
letzterer geht über das FormControl, das Feld fällt dann also auch aus `formGroup.value`.

### Feld-Typen

| `type`          | Rendered als                                      | Wichtige Properties                |
| --------------- | ------------------------------------------------- | ---------------------------------- |
| `text`          | Mat-Input                                         | `subtype` (email/url), `pattern`   |
| `email`         | Mat-Input type=email                              |                                    |
| `password`      | Mat-Input type=password                           | `pwdhide`                          |
| `textarea`      | Mat-Textarea                                      | `rows`                             |
| `number`        | Mat-Input type=number                             | `min`, `max`, `textSuffix`         |
| `bool`          | Mat-Checkbox / Slide-Toggle                       | `placeholder` für Begleittext      |
| `select`        | Mat-Select mit `list`                             | `multiple`, `search`, `selectAll`  |
| `multiselect`   | Checkbox-Liste (flacher Treeselect)               | `list` oder `url`, `min`, `max`    |
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

**Laufzeitverhalten (ab 0.4.14):** Ein per `showWhen` verstecktes Feld wird im FormGroup **disabled**.
Es fehlt damit in `formGroup.value` und im Submit-Body, und seine Validatoren zählen nicht — ein
verstecktes Pflichtfeld blockiert den Submit nicht. Wird es wieder sichtbar, wird es enabled und
behält seinen letzten Wert; ein vom Backend gesetztes `disabled: true` oder das globale
`disabled`-Input bleiben dabei bestehen. Felder in **eingeklappten Sections** gelten nicht als
versteckt und bleiben enabled. Bedingungen lesen `control.value` direkt, ein disabled Trigger-Feld
funktioniert also weiterhin als Trigger. Server-seitig bindet xiri-go für den fehlenden Key den
Konstruktor-Default.

### reloadOn — Inhalt vom Server nachladen

`showWhen` blendet ein Feld ein und aus. `reloadOn` lädt seinen **Inhalt** neu, sobald sich ein
anderes Feld ändert — für Optionslisten, die nur der Server kennen kann.

```typescript
{ id: 'tags', type: 'multiselect', name: 'Tags',
  list: [ { id: 4, name: 'Alpha' } ],
  reloadOn: [ 'status' ], reloadUrl: '/Thing/FormReload' }
```

Beide Angaben sind Pflicht — ohne `reloadUrl` ist die Abhängigkeit nicht auflösbar und wird
ignoriert.

**Ablauf**

1. Ändert sich ein Wert, den irgendein Feld in seinem `reloadOn` nennt, postet die Komponente
   **nur die Trigger-Werte** an `reloadUrl` — und pro URL nur die, von denen deren eigene Felder
   abhängen. 200 ms entprellt, ein Request pro distinkter URL. Ein noch laufender Request wird
   abgebrochen, sobald sich der Stand ändert: eine Antwort zu einem überholten Stand darf nicht
   mehr ankommen, sie würde sonst Werte verwerfen, die für den neuen Stand gültig sind. Bei
   mehreren URLs wird trotzdem bei jeder Trigger-Änderung jede URL angefragt. Alles, was nicht im
   Formular steht, gehört in die URL.
2. Antwort: `{ "fields": { "<id>": { …Properties… } } }`, optional mit `message`/`messageType`
   für eine Snackbar.
3. Der Patch wird ins Feld gemerged, danach feuert genau ein `formChange`.

Ein Reload läuft **immer auch einmal direkt nach dem Aufbau der Controls**. Das ist nötig, weil
`xiri-query` gespeicherte Filterwerte über `formService.loadState()` wiederherstellt, bevor die
Controls entstehen — die vom Server mitgelieferte Liste passt dann nicht mehr zum Trigger-Wert.
Die Listen im ersten Render sind damit optional; sie verhindern nur kurzzeitig leere Felder.

**Werte**

Nach einem `list`-Patch behält das Feld alle Werte, die die neue Liste noch anbietet
(rekursiv über `children`), und verwirft die übrigen. Ein `value` im Patch wird ignoriert — der
Wert gehört dem Client.

Nicht geprunt wird, wo die Liste nicht autoritativ ist: bei `chips` (nur Vorschläge) und bei
Selects mit `url` (dort ist `list` nur der statische Sockel der Server-Suche).

**Patchbare Properties**

`list`, `name`, `hint`, `class`, `required`, `disabled`, `hide`, `search`, `min`, `max`, `params` —
jeweils nur mit passendem Typ, `list` rekursiv inklusive `children`. Alles andere wird verworfen,
ebenso ein Patch für ein Feld ohne `reloadOn` oder mit einer anderen `reloadUrl`.

Ein Patch ist additiv: eine Property, die nicht im Patch steht, bleibt unverändert. `hint` lässt
sich mit `null` abräumen (so exportiert xiri-go einen leeren Hinweis), für `min`/`max` gibt es
keinen solchen Leerwert. `disabled` kommt aus xiri-go nicht — es steht nicht im Basis-Export.

Bewusst nicht patchbar: `value` (siehe oben), `id`/`type`/`subtype` (werden beim Aufbau der
Controls einmalig normalisiert), `url` (ob ein Select Server-Suche macht, entscheidet sich beim
Aufbau) und `showWhen` (wird ohnehin live aus den Werten ausgewertet).

**Grenzen**

- Ein abhängiges `treeselect`/`multiselect` darf kein `url` setzen — mit URL lädt es seinen Baum
  selbst per GET und ignoriert die gepatchte `list`.
- Ein bereits geöffnetes Chips-Autocomplete-Panel übernimmt neue Vorschläge erst beim nächsten
  Tastendruck.
- Keine Step-übergreifenden Abhängigkeiten — jeder Schritt eines `xiri-stepper` hat seine eigene
  `xiri-form-fields`-Instanz.

**Ladeanzeige**

Solange ein Reload läuft, liegt ein `mat-progress-bar` über dem Feldblock — absolut positioniert,
das Ein- und Ausblenden verschiebt also nichts. Er wird beim Trigger-Wechsel gesetzt, nicht erst
beim Request, deckt die 200 ms Entprellung also mit ab, und bleibt bei schnell aufeinander
folgenden Änderungen durchgehend an. `xiri-query` rendert dieselbe Komponente, Filter bekommen ihn
also mit.

Bewusst eine Anzeige und keine Sperre: ein `disable()` würde das Feld aus `formGroup.value`
entfernen, und genau das lesen `xiri-query` und `xiri-form` aus dem `formChange` — ein in diesem
Fenster gespeicherter Filter verlöre das Feld.

Ketten funktionieren: hängt C an B und wird Bs Wert durch einen Patch verworfen, lädt C nach. Das
terminiert, weil Pruning nur entfernt.

### addUrl — neue Option per Dialog anlegen

Für `select` (single und `multiple`), `multiselect`/`treeselect`, `object`/`model` und `chips`.
Mit `addUrl` rendert die Komponente neben dem Control einen `mat-icon-button` „+“ (`button.add-option`,
`aria-label="Neu anlegen"`); Control und Button liegen in einem Flex-Wrapper `.add-wrap`, der
`field.class` und `[hidden]` trägt.

```typescript
{ id: 'tags', type: 'select', multiple: true, name: 'Tags', search: false,
  list: [ { id: 1, name: 'Produktion' } ], addUrl: 'Tag/AddDialog' }
```

Ablauf:

1. Klick öffnet `XiriDialogComponent` mit `{ type: 'load', url: addUrl }` — also ein GET, das einen
   normalen Form-Dialog liefert (`header`, `type: 'form'`, `url`, `fields`, `buttons`).
2. Der Dialog postet das Formular an seine `url`. Antwortet der Server mit
   `{ done: true, created: { id, name } }` (Go: `response.NewReturnDone().WithCreated(id, name)`),
   zeigt der Dialog kurz die Erfolgsanzeige und schließt mit der Antwort. Während dieser Anzeige sind
   Escape, Backdrop und das Kreuz gesperrt, damit das Ergebnis nicht verloren geht.
3. Die Komponente hängt `{ id, name }` an `field.list` (falls noch nicht enthalten) und setzt den Wert:
   Einzelwert → `id`; Mehrfachwert (`multiple`, `treeselect`, `chips`) → bestehende Werte plus `id`,
   ohne Duplikat. Das Feld wird wie bei einem `reloadOn`-Patch als Kopie neu gerendert.

Verworfen wird das Ergebnis, wenn der Dialog ohne `created` schließt (Abbrechen), das Formular
inzwischen gewechselt hat (die Control-Identität entscheidet, nicht die Feld-ID), das Control
deaktiviert ist oder `created` ungültig ist (`id` muss String oder endliche Zahl sein, `name` ein
String; `0` ist gültig). Der Button ist deaktiviert, solange die Form oder das Control deaktiviert ist.

Grenzen:

- `id` muss den JSON-Typ der vorhandenen Options-IDs haben; der Vergleich ist strikt. `chips` löst
  Labels nur für numerische IDs auf (Strings sind dort Freitext).
- Ein `treeselect` mit `url` ignoriert `list` und lädt seinen Baum nach dem Anlegen selbst neu — der
  Server muss die neue Entität dann sofort liefern.
- Ein späterer `reloadOn`-Patch ersetzt die Liste; liefert der Server die neue Option nicht mit, wird
  der Wert verworfen. Serverseitig validieren `SelectField` und Chips beim Submit gegen ihre
  Optionsliste — die neue Entität muss dort enthalten sein; `ModelField`/`ModelListField` prüfen nur
  Typ und Anzahl.

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

`id` ist `number | string` und wird **unverändert** durchgereicht — auch von `treeselect`
(`XiriTreeselectId = string | number`) und `chips`. Nicht per `+id` / `Number(id)` casten: das
Backend (`xiri-go`) liefert `int64`-IDs, eine Coercion rundet alles über 2^53 und macht aus einer
nicht-numerischen ID `NaN`. Der exakte Bereich ist ±(2^53−1), weil IDs als JSON-Zahl transportiert
werden; die Go-Seite lehnt größere Werte beim Binden ab.

Inline (statisch):

```typescript
{ id: 'status', type: 'select', name: 'Status',
  list: [
    { id: 1, name: 'Aktiv',    color: 'success' },
    { id: 2, name: 'Inaktiv',  color: 'warn' },
    { id: 3, name: 'Gesperrt', color: 'error', disabled: true },
  ]}
```

Mehrfachauswahl mit „Alle / Keine“-Toggle (`selectAll` — Checkbox von `ngx-mat-select-search` über der Liste; wirkt auf die
aktuell sichtbaren, also bei aktiver Suche nur die gefilterten Optionen, lässt `disabled`-Optionen unangetastet und wird
ausgeblendet, wenn kein Treffer wählbar ist. Mit `selectAll` wird immer der Such-Zweig gerendert, auch bei `search: false`.
Go-Seite: `SelectField.SetMultiple(true).SetSelectAll(true)`):

```typescript
{ id: 'tags', type: 'select', name: 'Tags', multiple: true, selectAll: true, value: [],
  list: [ { id: 1, name: 'Produktion' }, { id: 2, name: 'Logistik' }, { id: 3, name: 'Archiv', disabled: true } ] }
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
