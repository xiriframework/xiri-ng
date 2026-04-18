# Tables — xiri-ng Reference

Zwei Komponenten: `xiri-raw-table` (minimal) und `xiri-table` (voll — Paging, Sort, Search, Inline-Edit, Selection, Server-Side).

## XiriRawTableComponent

### Selector

`xiri-raw-table`

### Inputs

```typescript
@input.required settings: XiriRawTableSettings;

export interface XiriRawTableSettings {
  data: any[];                    // Zeilen
  fields?: XiriTableField[];      // Spalten
  dense?: number;                 // 6-12, CSS-Klasse 'dense-X'
  forceMinWidth?: boolean;
}
```

### Outputs

Keine.

Kein Sorting, kein Paging, kein Editing. Nur Daten rendern.

## XiriTableComponent

### Selector

`xiri-table`

### Inputs

```typescript
@input.required settings: XiriTableSettings;
@input          filterData: any = undefined;
@input          dyncomponent: TemplateRef<any> = undefined;   // Custom-Cell-Rendering
```

### Outputs

```typescript
@output clickedRow: EventEmitter<any>;   // volles Row-Object
```

### Öffentliche Methoden

```typescript
reload(): void
searchDo(text: string): void
selection: SelectionModel<any>         // Checkbox-Selection (wenn options.select)
isAllSelected(): boolean
masterToggle(): void

// Inline-Edit
startInlineEdit(row: any, column: XiriTableField, skipSavingCheck?: boolean): void
cancelInlineEdit(): void
saveInlineEdit(row: any, column: XiriTableField): void
isEditing(row: any, fieldId: string): boolean
isSaving(row: any, fieldId: string): boolean
```

### XiriTableSettings

```typescript
export interface XiriTableSettings {
  url?: string;                       // API-Endpoint (POST mit filterData-payload)
  data?: any[];                       // Alternative zu url — statische Daten
  fields?: XiriTableField[];
  options?: XiriTableOptions;
  hasFilter?: boolean;                // True wenn filterData extern gesetzt
}
```

### XiriTableOptions

```typescript
export interface XiriTableOptions {
  reload?: boolean;
  dense?: boolean;
  sort?: boolean = true;
  search?: boolean = true;
  class?: string;

  pagination?: boolean = true;
  itemsPerPage?: number = 50;
  pageSizes?: number[] = [10, 25, 50, 100, 500];

  select?: boolean;                    // Checkbox für Row-Selection
  selectButtons?: XiriButton[];        // Buttons die auf Selection wirken

  title?: string;
  textNoData?: string = 'no data found';
  emptyState?: XiriTableEmptyState;

  buttons?: XiriButtonlineSettings;    // Action-Buttons über der Tabelle

  minWidth?: string;
  scrollHeight?: string;

  saveState?: boolean = false;         // Persist in SessionStorage
  saveStateId?: string;

  // Inline-Edit
  saveInput?: string;
  saveInputUrl?: string;
  editUrl?: string;                    // POST-URL für Inline-Edit-Save

  borders?: boolean;
  bordersHeader?: boolean;
  footer?: boolean;                    // Footer-Row mit count/sum/static

  serverSide?: boolean;                // Paging/Sort/Search serverseitig
}
```

### XiriTableField

```typescript
export interface XiriTableField {
  id: string;
  name: string;
  format?: string;              // 'text' | 'number' | 'html' | 'icon' | 'button' | ...
  search?: boolean;
  sort?: boolean;

  buttons?: XiriButton[];       // Action-Buttons in der Zelle
  icons?: { icon: string; color?: string; hint?: string }[];

  display?: string;             // CSS-Klasse auf <td>
  header?: string;              // Custom Header-Text (falls ≠ name)
  sticky?: boolean;

  // Inline-Edit
  inputType?: string;
  inputRequired?: boolean;
  inputLang?: string;
  inputPaste?: boolean;

  // Formatierung
  textPrefix?: string;
  textSuffix?: string;
  width?: string;
  minWidth?: string;

  hide?: boolean;
  headerSpan?: number;          // colspan für Header-Gruppen

  align?: 'left' | 'center' | 'right';
  footer?: 'no' | 'count' | 'sum' | 'static';
  webformat?: string;           // 'integer' | 'float1'-'float4'

  editable?: boolean;
  editableOptions?: { value: string; label: string; color?: string }[];
  editableOptionsUrl?: string;
}
```

## Server-Side-Pagination — Flow

Wenn `options.serverSide: true`, postet die Tabelle bei jeder Änderung (Sort/Filter/Page) an `settings.url` mit Payload:

```json
{
  "pageIndex": 0,
  "pageSize": 50,
  "sortBy": "name",
  "sortDir": "asc",
  "search": "foo",
  "filter": { ... filterData ... }
}
```

Erwartete Response:

```typescript
{
  data: any[];
  total: number;
}
```

## Beispiel — voll konfigurierte Tabelle

```typescript
tableSettings: XiriTableSettings = {
  url: '/api/devices',
  options: {
    serverSide: true,
    pagination: true,
    itemsPerPage: 50,
    sort: true,
    search: true,
    saveState: true,
    saveStateId: 'devices-table',
    select: true,
    selectButtons: [
      { text: 'Löschen', type: 'raised', color: 'warn',
        action: 'api', url: '/api/devices/bulk-delete' },
    ],
    editUrl: '/api/devices/inline-edit',
    footer: true,
    buttons: {
      class: 'small',
      buttons: [
        { text: 'Neu', type: 'raised', color: 'primary',
          action: 'dialog', url: '/api/devices/add' },
      ],
    },
  },
  fields: [
    { id: 'id',     name: 'ID',     format: 'number', sticky: true, width: '80px' },
    { id: 'name',   name: 'Name',   search: true, sort: true },
    { id: 'status', name: 'Status', format: 'icon',
      icons: [
        { icon: 'check_circle', color: 'success', hint: 'Aktiv' },
        { icon: 'cancel',       color: 'warn',    hint: 'Inaktiv' },
      ]},
    { id: 'count',  name: 'Anzahl', format: 'number',
      webformat: 'integer', align: 'right', footer: 'sum' },
    { id: 'note',   name: 'Notiz', editable: true, inputType: 'text' },
    { id: 'actions', name: '', format: 'button',
      buttons: [
        { text: '', type: 'icon', icon: 'edit',
          action: 'dialog', url: '/api/devices/edit' },
        { text: '', type: 'icon', icon: 'delete', color: 'warn',
          action: 'dialog', url: '/api/devices/delete' },
      ]},
  ],
};
```

## Reload nach Edit

```typescript
@ViewChild(XiriTableComponent) table!: XiriTableComponent;

onButtonResult(res: XiriButtonResult) {
  this.responseHandler.handle(res.result, {
    onTableRefresh: () => this.table.reload(),
    onTableUpdate: (id, field, content) => { /* optimistic UI */ },
  });
}
```
