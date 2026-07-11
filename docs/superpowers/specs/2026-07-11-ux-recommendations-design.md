# Design: xiri-ng UX-Empfehlungen umsetzen

**Datum:** 2026-07-11
**Branch:** `feat/ux-recommendations` (basiert auf `feat/ux-honest-primitives`)
**Grundlage:** `docs/ux-recommendations.md` (NotebookLM-Research)

## Kontext & Motivation

Aus der UX-Research entstand ein Katalog von Empfehlungen. Ein Teil (ehrliche
UI-States: Retry/Loading/Stale-while-revalidate, Stat-Referenzwert, Progress-
Component) ist auf `feat/ux-honest-primitives` bereits umgesetzt. Dieses Design
deckt die **noch offenen** Empfehlungen ab, gegliedert in vier einzeln testbare
Phasen.

**Leitprinzip: additiv, nicht breaking.** Bestehende JSON-Definitionen
(`display`-/`class`-Strings, `dense`, Spalten-`format`) bleiben gültig. Neue
APIs kommen additiv dazu; alte Felder bleiben als Alias/Override erhalten.

**Testebene (TDD, wie im Repo üblich):** pro Phase zuerst fehlschlagende
Vitest-Specs, dann minimale Implementierung. Verifikation zusätzlich manuell in
der Demo-App (`npm start`, Port 4301).

---

## Phase 1 — Tabellen-Feinschliff

**Ziel:** Zahlen rechtsbündig + `tabular-nums`; einheitliche Density-API.

### 1a. Numerische Spalten automatisch rechtsbündig + tabular-nums
- **Haupttabelle** (`table/`): Die Format-Klasse (`number`) liegt dank
  `table.component.ts:561-562` (prependet `format` an `column.display`) bereits
  an jeder `<td>/<th>/<tfoot td>` (`[class]="column.display"`, `table.component.html:62/199/310`).
  → **Reine SCSS-Ergänzung** in `table.component.scss`:
  ```scss
  td.number, th.number, td.mat-mdc-footer-cell.number {
      text-align: right;
      font-variant-numeric: tabular-nums;
  }
  ```
  **Platzierung: VOR den `.align-*`-Regeln** (`table.component.scss:176-187`),
  damit explizit gesetztes `align:'left'/'center'` (gleiche Spezifität) per
  Quellreihenfolge gewinnt.
- **raw-table** (`raw-table/`): `loadFields` prependet `format` NICHT
  (`xiri-raw-table.component.ts:86-89`, nur `align`). → dort `column.display`
  um `format` ergänzen (`:88`), dann dieselbe SCSS-Regel in
  `xiri-raw-table.component.scss`.
- **Zahlenwerte** kommen serverseitig vorformatiert (`row[col][0]`); `tabular-nums`
  ist rein kosmetisch. Keine TS-Änderung am Rendering nötig.

### 1b. Einheitliche Density
- Neues Feld `density?: 'compact' | 'regular' | 'relaxed'` in `XiriTableOptions`
  (`table.component.ts:122`), Default `'regular'` (`:259-278`).
- Klasse ans `<table>`-Element (`table.component.html:54`): `[class]="'density-'+density"`.
  In `table.component.scss` je Variante die fixen Höhen-Vars (`:132-134`) setzen:
  regular 42px / compact 32px / relaxed 52px. Ersetzt die reine Header-`.dense`-Regel (`:148-152`).
- **Alias (nicht breaking):** im Options-Merge (`table.component.ts:347`)
  `dense:true` → `density:'compact'` mappen, wenn `density` nicht gesetzt ist.
- **raw-table:** `dense:number` (`xiri-raw-table.component.ts:66-67`) auf dieselbe
  Enum mappen (echtes `mat.table-density`: compact≈-6, regular≈-2, relaxed≈0);
  `dense`-Zahl bleibt als Alias gültig.

### Risiken
- Auto-Rechtsbündigkeit ist ein **visueller** Breaking-Change für bestehende
  number-Spalten (gewollt) → in Demo + Snapshot/DOM-Test verifizieren.
- Spezifitäts-Reihenfolge (1a) ist kritisch — Test: Spalte mit `format:'number'`
  + `align:'left'` bleibt linksbündig.

### Tests
- `td.number` ist rechtsbündig + tabular-nums; `align:'left'` überstimmt.
- `density:'compact'` setzt Höhen-Var; `dense:true` erzeugt weiterhin compact.

---

## Phase 2 — Chart-Defaults

**Ziel:** Pie bei zu vielen Segmenten entschärfen; Bullet-Chart als Gauge-Alternative.

### 2a. Pie-Warnung
- In `piechart/piechart.component.ts`: `warn = computed(() => (settings().slices ?? []).length > 4)`.
- Template (`:25-31`) über dem `<xiri-echarts-host>`: `@if (warn()) { <div class="chart-hint">…</div> }`.
  Dezenter sichtbarer Hinweis, **kein** `console.warn` in Prod.

### 2b. Bullet-Chart
- Neue Component `bulletchart/bulletchart.component.ts` nach Vorbild
  `gaugechart/gaugechart.component.ts` (Composition über `<xiri-echarts-host>`,
  `settings`→`option`-computed). ECharts hat keinen nativen Bullet-Typ →
  horizontaler `bar` + `markLine` als Ziel/Target.
- Settings: `XiriBulletChartSettings { value; target?; ranges?; label?; color?; compact? }`.
- Registrieren: `public-api.ts` (neben `:49-52`) + dyncomponent-Case
  (`dyncomponent.component.html`, Default-Klasse analog gauge `'xcol xcol-md-6 xcol-xl-3'`)
  + `XiriDynDataType`-Union (`dyndata.interface.ts:2-7`).

### Tests
- `warn()` true ab 5 Slices, false bei ≤4.
- Bullet-`option` enthält `series[0].type==='bar'` (horizontal) + `markLine` für `target`.

---

## Phase 3 — Neue Bausteine

### 3a. Radio-Feldtyp (`type: 'radio'`)
- **Kein** eigenes Sub-Component (anders als treeselect/date). Reiner Template-Case
  + Mini-Normalisierung.
- Normalisierung: neuer `case 'radio':` in `form-fields.component.ts` neben `select`
  (`:250`). Wiederverwendbar: `array`→`list` (`:261-270`), Single-Default-Value
  (`:272-274`), `field.multiple=false`. Kein `url`/serverSideSearch.
- Rendering: neuer `@case ('radio')` in `form-fields.component.html` analog `bool`
  (`:234-248`): `<mat-radio-group [formControlName]="field.id">` +
  `@for (x of field.list; track x.id) { <mat-radio-button [value]="x.id"> }` +
  Label/hint/Error-Block aus dem bool-Case.
- Imports: `MatRadioButton, MatRadioGroup` (`@angular/material/radio`) in
  `@Component.imports` (`:55-84`).
- `showWhen`/Sichtbarkeit/Validierung greifen automatisch (typ-agnostisch,
  `:449-463/:504-530`). `type` ist freier String (`field.interface.ts:36`), keine
  Whitelist zu pflegen.

### 3b. Side-Panel (`xiri-sidepanel` + Service)
- **Service-API analog `XiriDialog`.** Neuer `XiriSidepanelService` mit
  `open(config)` / `close()`, der eine `XiriSidepanelComponent` als seitliches
  Overlay einblendet (CDK `Overlay` mit Seiten-Position oder `MatDrawer`).
  Content per dyncomponent (URL/Daten wie Dialog).
- Vorbild: `dialog/dialog.component.ts` (MatDialogRef-Muster, `:83-84`); der
  Sidepanel-Ref liefert analog ein Close-Result-Observable.
- Registrieren in `public-api.ts`. Nutzung: aus Tabellen-Zeilen heraus
  kontextuelle Detail-/Edit-Ansicht öffnen, ohne Kontextverlust.

### Tests
- Radio: rendert eine `mat-radio-button` pro Option; Auswahl schreibt ins
  FormControl; `showWhen` blendet korrekt ein/aus.
- Side-Panel: `open()` fügt Panel ins DOM, `close(result)` entfernt es und
  emittiert das Result.

---

## Phase 4 — Layout-Architektur

**Ziel:** deklaratives Breitenmodell + Container Queries — beides **additiv/opt-in**.

### 4a. Deklaratives `cols`-Modell
- Neues Feld `cols?: number | { sm?: number; md?: number; lg?: number; xl?: number }`
  in `XiriDynData` (`dyndata.interface.ts:9-16`) und `XiriFormField`
  (`field.interface.ts:42`).
- Zentraler Mapper (Attribut-Directive `xiriCols` oder Getter), der `cols` in
  CSS-Var `--col-span` bzw. die passenden `xcol`-Klassen übersetzt. Vorbild:
  `description-list` (`columns` → `--dl-cols` → `repeat(var(--dl-cols),1fr)`,
  `description-list.component.html:1` / `.scss:3`) und `stat-grid` (`--stat-cols`).
- **`display`/`class` behalten Vorrang** (Override). Wird `cols` nicht gesetzt,
  bleibt alles wie heute (`dyncomponent`: `obj.display || 'default'`;
  form-fields: `field.class` Default `'xcol'`, `form-fields.component.ts:205-206`).
  → **Null Breaking.**

### 4b. Container Queries (opt-in)
- Opt-in-Kontext-Klasse `.xrow-cq` mit `container-type: inline-size` auf `.xrow`
  (bzw. Wrapper). Grid-Klassen (`grid.scss`, Mixin `:4-97`) bekommen
  `@container`-Varianten der bestehenden `@media (min-width)`-Blöcke (`:48-69`).
- Blaupause im Repo: `timeline.component.scss:7-10` (`container-type: inline-size`)
  + `:113` (`@container (min-width:…)`).
- Optional: `description-list`/`stat-grid` Media-Queries auf `@container` umstellen
  (portabel in schmalen Containern). Das media-query-Grid bleibt als Default
  bestehen — CQ ist zusätzlich, nicht ersetzend.
- `.xcol*`-Klassennamen bleiben unverändert (externe Consumer-Stylesheets hängen daran).

### Risiken
- CQ ändert Umbruchverhalten (relativ zur Container- statt Viewport-Breite) →
  deshalb opt-in. `contain: inline-size` kann Höhen-Auto-Sizing beeinflussen.
- `cols`-Mapper darf `display`/`class` nicht überschreiben.

### Tests
- `cols:{md:6}` erzeugt korrekten `--col-span`/Klassen; gesetztes `display`
  überstimmt `cols`.
- `.xrow-cq` setzt `container-type`; `@container`-Regel greift bei schmalem Container
  (Breiten-Test via Host-Resize).

---

## Reihenfolge & Abgrenzung

1 → 2 → 3 → 4 (Quick-Wins zuerst, Layout-Architektur zuletzt). Jede Phase ist
eigenständig committbar und testbar. Phase 4 ist die risikoreichste; falls sie
zu groß wird, kann `4b` (Container Queries) in einen Folge-Branch ausgelagert
werden — der Plan hält 4a/4b bewusst getrennt.

**Nicht in Scope:** Entfernen/Umbenennen bestehender Contracts (`display`,
`class`, `dense`, `.xcol*`); Änderungen am Go-Backend; Type-Scale-/Spacing-Token-
Konsolidierung (separates Doku-/Token-Thema).
