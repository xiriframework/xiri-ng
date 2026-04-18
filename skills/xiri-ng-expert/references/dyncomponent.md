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
}

export type XiriDynDataType =
  | 'card' | 'buttonline' | 'table' | 'cardlink' | 'links'
  | 'form' | 'query' | 'stepper' | 'header' | 'list'
  | 'spacer' | 'container'
  | 'infopoint' | 'multiprogress' | 'imagetext'
  | 'tabs' | 'expansion' | 'infotext' | 'html'
  | 'stat' | 'empty-state' | 'timeline'
  | 'page-header' | 'section' | 'divider'
  | 'stat-grid' | 'toolbar' | 'description-list';
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
| `spacer`            | vertical spacer div    | `{ size?: string }`                  |
| `container`         | wrapper div            | `{ components: XiriDynData[] }`      |
| `infotext`          | Text-Absatz            | `{ text: string }`                   |
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
