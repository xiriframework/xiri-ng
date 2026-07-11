# xiri-ng UX-Empfehlungen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die offenen UX-Empfehlungen aus `docs/ux-recommendations.md` in xiri-ng umsetzen — Tabellen-Feinschliff, Chart-Defaults, Radio-Feld + Side-Panel, deklaratives `cols`-Modell + Container Queries.

**Architecture:** Vier einzeln testbare Phasen, durchgängig **additiv/nicht-breaking**. Bestehende JSON-Contracts (`display`/`class`, `dense`, Spalten-`format`, `.xcol*`) bleiben gültig; neue APIs kommen additiv dazu, alte Felder als Alias/Override.

**Tech Stack:** Angular 22 (standalone, signals, OnPush), Angular Material M3, ECharts, SCSS, Vitest (`@angular/build:unit-test`, jsdom).

## Global Constraints

- Standalone components, OnPush, `input()`/`output()`/signals — keine NgModules.
- SCSS, Tabs zur Einrückung, Single Quotes, Semikolons, max. 140 Zeichen/Zeile.
- Component-Selektoren kebab-case, Directive-Selektoren camelCase.
- TDD: erst fehlschlagender Test (Red), dann minimale Implementierung (Green). Gegenprobe, dass der Test ohne den Fix rot ist.
- **jsdom wertet kein SCSS aus** — reine Style-Regeln werden per Klassen-Assertion + Demo verifiziert, nicht per `getComputedStyle`.
- Commits **ohne** `Co-Authored-By` und ohne Erwähnung von Claude (siehe CLAUDE.md).
- Testlauf: `cd xiri-ng && npm test`. Einzeltest: `npm test -- <pattern>`. Lint: `npm run lint`.
- Branch: `feat/ux-recommendations`.

---

## Dateiübersicht

**Phase 1 (Tabellen):**
- Modify: `projects/xiri-ng/src/lib/table/table.component.scss`, `.ts`, `.html`
- Modify: `projects/xiri-ng/src/lib/raw-table/xiri-raw-table.component.ts`, `.scss`
- Test: `table.component.spec.ts`, `xiri-raw-table.component.spec.ts`

**Phase 2 (Charts):**
- Modify: `projects/xiri-ng/src/lib/piechart/piechart.component.ts`
- Create: `projects/xiri-ng/src/lib/bulletchart/bulletchart.component.ts` (+ `.spec.ts`)
- Modify: `public-api.ts`, `dyncomponent/dyncomponent.component.html`, `dyncomponent/dyndata.interface.ts`

**Phase 3 (Bausteine):**
- Modify: `formfields/form-fields.component.ts`, `.html` (+ spec)
- Create: `sidepanel/sidepanel.component.ts`, `sidepanel.service.ts`, `sidepanel-ref.ts` (+ spec)
- Modify: `public-api.ts`

**Phase 4 (Layout):**
- Modify: `dyncomponent/dyndata.interface.ts`, `formfields/field.interface.ts`
- Create: `layout/cols.directive.ts` (+ spec)
- Modify: `dyncomponent/dyncomponent.component.html`, `formfields/form-fields.component.ts`
- Modify: `styles/grid.scss`, `styles/_grid-container.scss` (neu, optional)

---

# Phase 1 — Tabellen-Feinschliff

### Task 1: Numerische Spalten rechtsbündig + tabular-nums (Haupttabelle)

**Files:**
- Modify: `projects/xiri-ng/src/lib/table/table.component.scss` (vor Zeile 176, den `.align-*`-Regeln)
- Test: `projects/xiri-ng/src/lib/table/table.component.spec.ts`

**Interfaces:**
- Consumes: bestehende Format-Klasse `number`, die `table.component.ts:561-562` an `column.display` prependet und via `[class]="column.display"` an `<td>/<th>/<tfoot td>` hängt.
- Produces: SCSS-Regel `td.number/th.number/footer.number` → rechtsbündig + tabular-nums.

**Hinweis:** Die eigentliche Ausrichtung ist SCSS (in jsdom nicht messbar). Der Test sichert die Voraussetzung ab: numerische Spalten tragen die Klasse `number` an der Zelle. Visuelle Verifikation via Demo.

- [ ] **Step 1: Failing test — numerische Zelle trägt `number`-Klasse**

In `table.component.spec.ts` einen Test ergänzen (Muster der bestehenden Tests im File übernehmen — TestBed + Host-Fixture):

```ts
it( 'gibt numerischen Spalten die number-Klasse (Basis für Rechtsbündigkeit)', () => {
	// Tabelle mit einer number-Spalte konfigurieren (analog bestehende Table-Setups im File)
	component.loadFields( [ { id: 'betrag', name: 'Betrag', format: 'number' } ] as any );
	fixture.detectChanges();
	const col = component.columns.find( c => c.id === 'betrag' );
	expect( col!.display ).toContain( 'number' );
} );
```

- [ ] **Step 2: Test ausführen, Rot erwarten**

Run: `cd xiri-ng && npm test -- table.component`
Erwartung: FAIL, falls `loadFields`/`columns` nicht wie angenommen zugreifbar — dann Zugriff an die real existierende API im File anpassen (Gegenprobe: Test muss ohne Step 3 rot sein).

- [ ] **Step 3: SCSS-Regel einfügen**

In `table.component.scss` **unmittelbar vor** dem `.align-*`-Block (aktuell ab Zeile ~176) einfügen:

```scss
// Numerische Spalten: rechtsbündig + gleiche Ziffernbreite.
// MUSS vor den .align-* Regeln stehen, damit explizites align:'left'/'center' gewinnt.
td.number,
th.number,
td.mat-mdc-footer-cell.number {
	text-align: right;
	font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 4: Tests grün**

Run: `cd xiri-ng && npm test -- table.component`
Erwartung: PASS.

- [ ] **Step 5: Commit**

```bash
git add projects/xiri-ng/src/lib/table/table.component.scss projects/xiri-ng/src/lib/table/table.component.spec.ts
git commit -m "feat(table): numerische Spalten rechtsbündig mit tabular-nums"
```

---

### Task 2: raw-table — Format-Klasse + rechtsbündige Zahlen

**Files:**
- Modify: `projects/xiri-ng/src/lib/raw-table/xiri-raw-table.component.ts:86-89` (loadFields)
- Modify: `projects/xiri-ng/src/lib/raw-table/xiri-raw-table.component.scss`
- Test: `projects/xiri-ng/src/lib/raw-table/xiri-raw-table.component.spec.ts`

**Interfaces:**
- Consumes: `column.format`, `column.display` in raw-table `loadFields`.
- Produces: `format` als Klasse an `column.display` → `td.number`/`th.number` ansprechbar.

- [ ] **Step 1: Failing test — number-Spalte bekommt Klasse**

```ts
it( 'hängt die format-Klasse an display an (number)', () => {
	host.settings.set( { fields: [ { id: 'n', name: 'N', format: 'number' } ], rows: [] } as any );
	fixture.detectChanges();
	const col = component.columns().find( c => c.id === 'n' );
	expect( col!.display ).toContain( 'number' );
} );
```

- [ ] **Step 2: Rot verifizieren**

Run: `cd xiri-ng && npm test -- xiri-raw-table`
Erwartung: FAIL (display enthält heute nur `align`, nicht `format`).

- [ ] **Step 3: format an display prependen**

In `xiri-raw-table.component.ts` bei der display-Zusammensetzung (~Zeile 88) den `format` ergänzen, analog zur Haupttabelle:

```ts
// vorher wurde nur align angehängt; format-Klasse ergänzen, damit td.number greift
column.display = [ column.format, column.display, column.align ? 'align-' + column.align : '' ]
	.filter( Boolean ).join( ' ' );
```

(Exakte Zusammensetzung an die im File vorhandene Zeile anpassen — Ziel: `format` ist Teil von `display`.)

- [ ] **Step 4: SCSS-Regel** — dieselbe wie Task 1, in `xiri-raw-table.component.scss` **vor** den dortigen `.align-*`-Regeln (~Zeile 93):

```scss
td.number,
th.number {
	text-align: right;
	font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 5: Grün + Commit**

Run: `cd xiri-ng && npm test -- xiri-raw-table` → PASS
```bash
git add projects/xiri-ng/src/lib/raw-table/xiri-raw-table.component.ts projects/xiri-ng/src/lib/raw-table/xiri-raw-table.component.scss projects/xiri-ng/src/lib/raw-table/xiri-raw-table.component.spec.ts
git commit -m "feat(raw-table): format-Klasse an Zellen, numerisch rechtsbündig"
```

---

### Task 3: Einheitliche Density-API (Haupttabelle) mit `dense`-Alias

**Files:**
- Modify: `projects/xiri-ng/src/lib/table/table.component.ts` (Interface `XiriTableOptions` ~:122; Options-Default ~:259-278; Merge ~:347)
- Modify: `projects/xiri-ng/src/lib/table/table.component.html:54` (table-Element), ersetzt die reine Header-`.dense`-Nutzung
- Modify: `projects/xiri-ng/src/lib/table/table.component.scss:132-152`
- Test: `projects/xiri-ng/src/lib/table/table.component.spec.ts`

**Interfaces:**
- Produces: `XiriTableOptions.density?: 'compact' | 'regular' | 'relaxed'` (Default `'regular'`); `dense:true` bleibt als Alias → `'compact'`.

- [ ] **Step 1: Failing tests**

```ts
it( 'setzt density-Klasse am table-Element', () => {
	component.options = { ...component.options, density: 'compact' } as any;
	fixture.detectChanges();
	const table = fixture.nativeElement.querySelector( 'table' );
	expect( table.classList.contains( 'density-compact' ) ).toBe( true );
} );

it( 'mappt dense:true auf density compact (Alias)', () => {
	const merged = component.mergeOptions( { dense: true } as any );
	expect( merged.density ).toBe( 'compact' );
} );
```

(Namen `options`/`mergeOptions` an die reale API im File angleichen; falls das Merging privat ist, Test über das gerenderte Ergebnis führen.)

- [ ] **Step 2: Rot verifizieren** — `npm test -- table.component` → FAIL.

- [ ] **Step 3: Interface + Default + Alias**

Im Interface `XiriTableOptions` ergänzen:
```ts
density?: 'compact' | 'regular' | 'relaxed'
```
Im Options-Default `density: 'regular'` setzen. Im Merge (~:347) vor Rückgabe:
```ts
// Alias: altes dense:true entspricht compact, wenn density nicht explizit gesetzt ist
if ( merged.density === undefined && merged.dense === true )
	merged.density = 'compact';
```

- [ ] **Step 4: Template + SCSS**

`table.component.html:54` am `<table>`: `[class]="'density-' + options.density"`.
`table.component.scss`: die fixen Höhen (`:132-134`) in Varianten überführen:
```scss
table.density-regular { --mat-table-header-container-height: 42px; --mat-table-footer-container-height: 42px; --mat-table-row-item-container-height: 42px; }
table.density-compact { --mat-table-header-container-height: 32px; --mat-table-footer-container-height: 32px; --mat-table-row-item-container-height: 32px; }
table.density-relaxed { --mat-table-header-container-height: 52px; --mat-table-footer-container-height: 52px; --mat-table-row-item-container-height: 52px; }
```
Die alte Regel `tr.mat-mdc-header-row.dense { height: 28px; }` (`:148-152`) entfernen.

- [ ] **Step 5: Grün + Commit**

Run: `npm test -- table.component` → PASS
```bash
git add projects/xiri-ng/src/lib/table/table.component.ts projects/xiri-ng/src/lib/table/table.component.html projects/xiri-ng/src/lib/table/table.component.scss projects/xiri-ng/src/lib/table/table.component.spec.ts
git commit -m "feat(table): einheitliche density-API (compact/regular/relaxed) mit dense-Alias"
```

---

### Task 4: raw-table Density auf Enum mappen

**Files:**
- Modify: `projects/xiri-ng/src/lib/raw-table/xiri-raw-table.component.ts:29,62,66-67`
- Test: `projects/xiri-ng/src/lib/raw-table/xiri-raw-table.component.spec.ts`

**Interfaces:**
- Produces: `density?: 'compact'|'regular'|'relaxed'` in den raw-table-Settings; `dense:number` bleibt als Alias.

- [ ] **Step 1: Failing test**

```ts
it( 'mappt density regular auf table-density -2', () => {
	host.settings.set( { density: 'regular', fields: [], rows: [] } as any );
	fixture.detectChanges();
	expect( component.tableClass() ).toContain( 'dense-2' );
} );
```

- [ ] **Step 2: Rot** — `npm test -- xiri-raw-table` → FAIL.

- [ ] **Step 3: Mapping** im Effect (~:66-67):
```ts
const DENSITY_TO_LEVEL = { compact: 6, regular: 2, relaxed: 0 } as const;
const density = this.settings().density;
const level = density ? DENSITY_TO_LEVEL[ density ] : ( this.settings().dense ?? 6 );
this.tableClass.set( 'dense-' + level + ( this.settings().forceMinWidth ? ' force-min-width' : '' ) );
```
Falls die Stufe `-2` in `xiri-raw-table.component.scss` nicht existiert (nur 1/2/3/4/6/8 vorhanden — 2 existiert), passt es; sonst nächste vorhandene Stufe wählen.

- [ ] **Step 4: Grün + Commit**

Run: `npm test -- xiri-raw-table` → PASS
```bash
git add projects/xiri-ng/src/lib/raw-table/xiri-raw-table.component.ts projects/xiri-ng/src/lib/raw-table/xiri-raw-table.component.spec.ts
git commit -m "feat(raw-table): density-Enum, dense-Zahl als Alias"
```

---

# Phase 2 — Chart-Defaults

### Task 5: Pie-Warnung bei > 4 Segmenten

**Files:**
- Modify: `projects/xiri-ng/src/lib/piechart/piechart.component.ts`
- Test: `projects/xiri-ng/src/lib/piechart/piechart.component.spec.ts` (neu, falls nicht vorhanden)

**Interfaces:**
- Produces: `warn = computed<boolean>()` (true bei > 4 Slices), sichtbarer Hinweis im Template.

- [ ] **Step 1: Failing test**

```ts
import { XiriPieChartComponent } from './piechart.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe( 'XiriPieChartComponent warn', () => {
	let fixture: ComponentFixture<XiriPieChartComponent>;
	let component: XiriPieChartComponent;
	beforeEach( () => {
		TestBed.configureTestingModule( { imports: [ XiriPieChartComponent ] } );
		fixture = TestBed.createComponent( XiriPieChartComponent );
		component = fixture.componentInstance;
	} );

	it( 'warnt ab 5 Segmenten', () => {
		fixture.componentRef.setInput( 'settings', { slices: [1,2,3,4,5].map( n => ( { name: '' + n, value: n } ) ) } );
		expect( component.warn() ).toBe( true );
	} );
	it( 'warnt nicht bei 4 Segmenten', () => {
		fixture.componentRef.setInput( 'settings', { slices: [1,2,3,4].map( n => ( { name: '' + n, value: n } ) ) } );
		expect( component.warn() ).toBe( false );
	} );
} );
```

- [ ] **Step 2: Rot** — `npm test -- piechart` → FAIL (`warn` existiert nicht).

- [ ] **Step 3: Implementieren** in `piechart.component.ts`:

`warn`-Signal in der Klasse ergänzen:
```ts
warn = computed<boolean>( () => ( this.settings().slices ?? [] ).length > 4 );
```
Template (inline, `:25-31`) erweitern — über den Host:
```html
@if (warn()) {
	<div class="chart-hint">Mehr als 4 Segmente erschweren den Vergleich — Balken- oder Tabellendarstellung erwägen.</div>
}
<xiri-echarts-host [option]="option()" [compact]="compact()" [title]="settings().title"></xiri-echarts-host>
```
Minimales Styling optional (Klasse `.chart-hint`, dezent). `@if` verlangt keine zusätzlichen Imports (built-in control flow).

- [ ] **Step 4: Grün + Commit**

Run: `npm test -- piechart` → PASS
```bash
git add projects/xiri-ng/src/lib/piechart/piechart.component.ts projects/xiri-ng/src/lib/piechart/piechart.component.spec.ts
git commit -m "feat(piechart): Hinweis bei mehr als 4 Segmenten"
```

---

### Task 6: Bullet-Chart-Component

**Files:**
- Create: `projects/xiri-ng/src/lib/bulletchart/bulletchart.component.ts`
- Create: `projects/xiri-ng/src/lib/bulletchart/bulletchart.component.spec.ts`
- Modify: `projects/xiri-ng/src/public-api.ts` (neben Gauge-Export ~:52)
- Modify: `projects/xiri-ng/src/lib/dyncomponent/dyncomponent.component.html` (neuer `@case ('bulletchart')`)
- Modify: `projects/xiri-ng/src/lib/dyncomponent/dyndata.interface.ts:2-7` (Union erweitern)

**Interfaces:**
- Produces: `XiriBulletChartSettings { title?; value; target?; max?; label?; color?; compact? }`; Component `xiri-bulletchart` (Composition über `xiri-echarts-host`, exakt nach `XiriGaugeChartComponent`-Muster).

- [ ] **Step 1: Failing test**

```ts
import { XiriBulletChartComponent } from './bulletchart.component';
import { TestBed } from '@angular/core/testing';

describe( 'XiriBulletChartComponent', () => {
	it( 'baut horizontalen Balken mit Ziel-markLine', () => {
		TestBed.configureTestingModule( { imports: [ XiriBulletChartComponent ] } );
		const fixture = TestBed.createComponent( XiriBulletChartComponent );
		fixture.componentRef.setInput( 'settings', { value: 70, target: 90, max: 100 } );
		const opt: any = fixture.componentInstance.option();
		expect( opt.series[0].type ).toBe( 'bar' );
		expect( opt.xAxis.max ).toBe( 100 );
		expect( opt.series[0].markLine.data[0].xAxis ).toBe( 90 );
	} );
} );
```

- [ ] **Step 2: Rot** — `npm test -- bulletchart` → FAIL (Datei fehlt).

- [ ] **Step 3: Component erstellen** — `bulletchart.component.ts`:

```ts
import { Component, computed, input } from '@angular/core';
import { XiriColor } from '../types/color.type';
import { XiriEchartsHostComponent } from '../echarts/echarts-host.component';
import { resolveColor } from '../echarts/color';

export interface XiriBulletChartSettings {
	title?: string;
	value: number;
	target?: number;
	max?: number;       // default: max(value, target) * 1.2
	label?: string;
	color?: XiriColor;
	compact?: boolean;
}

@Component( {
	selector: 'xiri-bulletchart',
	template: `
		<xiri-echarts-host
			[option]="option()"
			[compact]="compact()"
			[title]="settings().title">
		</xiri-echarts-host>
	`,
	imports: [ XiriEchartsHostComponent ]
} )
export class XiriBulletChartComponent {

	settings = input.required<XiriBulletChartSettings>();

	compact = computed<boolean>( () => !!this.settings().compact );

	option = computed( () => {
		const s = this.settings();
		const color = resolveColor( s.color, '#8b5cf6' );
		const max = s.max ?? Math.max( s.value, s.target ?? 0 ) * 1.2;

		return {
			grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: false },
			xAxis: { type: 'value', max, show: false },
			yAxis: { type: 'category', data: [ s.label ?? '' ], show: false },
			series: [ {
				type: 'bar',
				data: [ s.value ],
				barWidth: this.compact() ? 12 : 18,
				itemStyle: { color, borderRadius: 4 },
				markLine: s.target !== undefined ? {
					symbol: 'none',
					data: [ { xAxis: s.target, lineStyle: { color: '#333', width: 2, type: 'solid' } } ]
				} : undefined
			} ]
		};
	} );
}
```

- [ ] **Step 4: Registrieren**

`public-api.ts` (neben `:52`): `export * from './lib/bulletchart/bulletchart.component';`
`dyndata.interface.ts:2-7`: `'bulletchart'` zur `XiriDynDataType`-Union ergänzen.
`dyncomponent.component.html`: neuer Case analog Gauge:
```html
@case ('bulletchart') {
	<div [class]="obj.display || 'xcol xcol-md-6 xcol-xl-3'" [class.xcol-start]="obj.newRow">
		<xiri-bulletchart [settings]="$any(obj.data)"></xiri-bulletchart>
	</div>
}
```
Import `XiriBulletChartComponent` in `dyncomponent.component.ts` (imports-Array).

- [ ] **Step 5: Grün + Commit**

Run: `npm test -- bulletchart` → PASS
```bash
git add projects/xiri-ng/src/lib/bulletchart/ projects/xiri-ng/src/public-api.ts projects/xiri-ng/src/lib/dyncomponent/dyncomponent.component.html projects/xiri-ng/src/lib/dyncomponent/dyncomponent.component.ts projects/xiri-ng/src/lib/dyncomponent/dyndata.interface.ts
git commit -m "feat(bulletchart): kompakte Gauge-Alternative (Balken + Ziel-markLine)"
```

---

# Phase 3 — Neue Bausteine

### Task 7: Radio-Feldtyp

**Files:**
- Modify: `projects/xiri-ng/src/lib/formfields/form-fields.component.ts` (Normalisierung neben `select` ~:250; imports ~:55-84)
- Modify: `projects/xiri-ng/src/lib/formfields/form-fields.component.html` (neuer `@case ('radio')` nach dem bool-Case, ~:248)
- Test: `projects/xiri-ng/src/lib/formfields/form-fields.component.spec.ts`

**Interfaces:**
- Consumes: `field.list` / `field.array` (wie `select`), `field.id`, `formGroup`.
- Produces: gerendertes `mat-radio-group` je Feld mit `type:'radio'`.

- [ ] **Step 1: Failing test**

```ts
it( 'rendert eine mat-radio-button pro Option', () => {
	component.form = { fields: [ { id: 'anrede', type: 'radio', name: 'Anrede',
		array: [ { id: 'f', name: 'Frau' }, { id: 'm', name: 'Herr' } ] } ] } as any;
	fixture.detectChanges();
	const radios = fixture.nativeElement.querySelectorAll( 'mat-radio-button' );
	expect( radios.length ).toBe( 2 );
} );
```

(Zugriff `component.form` an die reale Input-API angleichen.)

- [ ] **Step 2: Rot** — `npm test -- form-fields` → FAIL (kein radio-Case).

- [ ] **Step 3: Normalisierung** in `form-fields.component.ts` — neuer `case 'radio':` direkt vor `case 'select':` (~:250):
```ts
case 'radio':
	if ( field.array && !field.list )
		field.list = field.array.map( a => ( { id: a.id, name: a.name, disabled: a.disabled } ) );
	if ( field.value === undefined && field.list?.length )
		field.value = field.list[0].id;
	field.multiple = false;
	if ( field.required === undefined ) field.required = true;
	break;
```
(An die exakte array→list-Umwandlung von `select` (:261-270) angleichen — dieselbe Hilfslogik nutzen, nicht duplizieren.)

- [ ] **Step 4: Template** — neuer `@case ('radio')` nach dem bool-Case (`:248`), Struktur analog bool:
```html
@case ('radio') {
	<div class="radio" [class]="field.class" [formGroup]="formGroup" [hidden]="field.hide">
		@if (field.name) { <label class="radio-label">{{ field.name }}</label> }
		<mat-radio-group [formControlName]="field.id">
			@for (x of field.list; track x.id) {
				<mat-radio-button [value]="x.id" [disabled]="x.disabled">{{ x.name }}</mat-radio-button>
			}
		</mat-radio-group>
		@if (field.hint) { <mat-hint>{{ field.hint }}</mat-hint> }
		@for (vali of field.validations; track vali) {
			<ng-container ngProjectAs="mat-error">
				@if (formGroup.get(field.id)?.hasError(vali.id)) { <mat-error>{{ vali.message }}</mat-error> }
			</ng-container>
		}
	</div>
}
```
Imports in `@Component.imports` (`:55-84`): `MatRadioButton, MatRadioGroup` aus `@angular/material/radio`.

- [ ] **Step 5: Grün + Commit**

Run: `npm test -- form-fields` → PASS
```bash
git add projects/xiri-ng/src/lib/formfields/form-fields.component.ts projects/xiri-ng/src/lib/formfields/form-fields.component.html projects/xiri-ng/src/lib/formfields/form-fields.component.spec.ts
git commit -m "feat(form-fields): radio-Feldtyp für kleine Optionsmengen"
```

---

### Task 8: Side-Panel (Service + Component)

**Files:**
- Create: `projects/xiri-ng/src/lib/sidepanel/sidepanel.component.ts` (+ `.scss`)
- Create: `projects/xiri-ng/src/lib/sidepanel/sidepanel.service.ts`
- Create: `projects/xiri-ng/src/lib/sidepanel/sidepanel-ref.ts`
- Create: `projects/xiri-ng/src/lib/sidepanel/sidepanel.service.spec.ts`
- Modify: `projects/xiri-ng/src/public-api.ts`

**Interfaces:**
- Produces:
  - `XiriSidepanelConfig { title?: string; width?: string; data?: unknown; url?: string }`
  - `XiriSidepanelRef { afterClosed(): Observable<unknown>; close(result?: unknown): void }`
  - `XiriSidepanelService.open(config): XiriSidepanelRef`

Umsetzung über **CDK Overlay** (rechts angedockt), Content per dyncomponent (analog Dialog-Nutzung von `data`/`url`). Kein MatDialog — eigenständiges Panel.

- [ ] **Step 1: Failing test (Service)**

```ts
import { TestBed } from '@angular/core/testing';
import { XiriSidepanelService } from './sidepanel.service';
import { firstValueFrom } from 'rxjs';

describe( 'XiriSidepanelService', () => {
	let service: XiriSidepanelService;
	beforeEach( () => {
		TestBed.configureTestingModule( {} );
		service = TestBed.inject( XiriSidepanelService );
	} );

	it( 'open() liefert eine Ref, close(result) schließt und emittiert', async () => {
		const ref = service.open( { title: 'Detail', data: { x: 1 } } );
		const closed = firstValueFrom( ref.afterClosed() );
		ref.close( 'ok' );
		expect( await closed ).toBe( 'ok' );
	} );
} );
```

- [ ] **Step 2: Rot** — `npm test -- sidepanel` → FAIL (Dateien fehlen).

- [ ] **Step 3: Ref**

`sidepanel-ref.ts`:
```ts
import { Subject, Observable } from 'rxjs';
import { OverlayRef } from '@angular/cdk/overlay';

export class XiriSidepanelRef {
	private readonly closed$ = new Subject<unknown>();
	constructor( private readonly overlayRef?: OverlayRef ) {}
	afterClosed(): Observable<unknown> { return this.closed$.asObservable(); }
	close( result?: unknown ): void {
		this.overlayRef?.dispose();
		this.closed$.next( result );
		this.closed$.complete();
	}
}
```

- [ ] **Step 4: Component**

`sidepanel.component.ts` (standalone, OnPush) — Panel-Rahmen mit Titelzeile, Close-Button und dyncomponent-Content-Slot. Nimmt `config` + `ref` per Injection-Token oder Inputs. Minimal:
```ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { XiriDyncomponentComponent } from '../dyncomponent/dyncomponent.component';
import { XiriSidepanelConfig } from './sidepanel.service';
import { XiriSidepanelRef } from './sidepanel-ref';

@Component( {
	selector: 'xiri-sidepanel',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrl: './sidepanel.component.scss',
	imports: [ MatIconButton, MatIcon, XiriDyncomponentComponent ],
	template: `
		<div class="sidepanel-header">
			<span class="sidepanel-title">{{ config().title }}</span>
			<button mat-icon-button (click)="ref().close()" aria-label="Schließen"><mat-icon>close</mat-icon></button>
		</div>
		<div class="sidepanel-content">
			@if (config().data) { <xiri-dyncomponent [data]="$any(config().data)"></xiri-dyncomponent> }
		</div>
	`
} )
export class XiriSidepanelComponent {
	config = input.required<XiriSidepanelConfig>();
	ref = input.required<XiriSidepanelRef>();
}
```
`sidepanel.component.scss`: rechts angedockt, volle Höhe, Header-Flex, `--xiri-*`-Tokens für Spacing.

- [ ] **Step 5: Service**

`sidepanel.service.ts` mit CDK Overlay:
```ts
import { Injectable, inject } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { XiriSidepanelComponent } from './sidepanel.component';
import { XiriSidepanelRef } from './sidepanel-ref';

export interface XiriSidepanelConfig { title?: string; width?: string; data?: unknown; url?: string; }

@Injectable( { providedIn: 'root' } )
export class XiriSidepanelService {
	private readonly overlay = inject( Overlay );

	open( config: XiriSidepanelConfig ): XiriSidepanelRef {
		const overlayRef = this.overlay.create( {
			positionStrategy: this.overlay.position().global().right( '0' ).top( '0' ),
			height: '100%',
			width: config.width ?? '420px',
			hasBackdrop: true,
			panelClass: 'xiri-sidepanel-overlay'
		} );
		const ref = new XiriSidepanelRef( overlayRef );
		const portal = new ComponentPortal( XiriSidepanelComponent );
		const cmp = overlayRef.attach( portal );
		cmp.setInput( 'config', config );
		cmp.setInput( 'ref', ref );
		overlayRef.backdropClick().subscribe( () => ref.close() );
		return ref;
	}
}
```
(Für den Unit-Test aus Step 1 ohne echtes DOM: der Service kann in der Testumgebung ohne `attach` fehlschlagen — falls so, im Test `overlay` mocken oder den Ref-Pfad ohne Overlay testen. Ziel des Tests ist das Ref-Contract `afterClosed/close`, nicht das Overlay-Rendering.)

- [ ] **Step 6: Grün + Registrieren + Commit**

`public-api.ts`: exportiere `sidepanel.component`, `sidepanel.service`, `sidepanel-ref`.
Run: `npm test -- sidepanel` → PASS
```bash
git add projects/xiri-ng/src/lib/sidepanel/ projects/xiri-ng/src/public-api.ts
git commit -m "feat(sidepanel): Service-gesteuertes Side-Panel als Dialog-Alternative"
```

---

# Phase 4 — Layout-Architektur

### Task 9: `cols`-Directive (deklaratives Breitenmodell)

**Files:**
- Create: `projects/xiri-ng/src/lib/layout/cols.directive.ts`
- Create: `projects/xiri-ng/src/lib/layout/cols.directive.spec.ts`
- Modify: `projects/xiri-ng/src/lib/dyncomponent/dyndata.interface.ts` (Feld `cols`)
- Modify: `projects/xiri-ng/src/lib/formfields/field.interface.ts:42` (Feld `cols`)
- Modify: `projects/xiri-ng/src/public-api.ts`

**Interfaces:**
- Produces:
  - Typ `XiriCols = number | { sm?: number; md?: number; lg?: number; xl?: number }`
  - Directive `[xiriCols]`, die aus `cols` die passenden `xcol`-Klassen erzeugt (`xcol`, `xcol-md-6`, …). Verwendet die bestehenden Grid-Klassen (kein neuer Klassen-Zoo).

- [ ] **Step 1: Failing test**

```ts
import { colsToClasses } from './cols.directive';

describe( 'colsToClasses', () => {
	it( 'Zahl → volle + Breakpoint-Klassen', () => {
		expect( colsToClasses( 6 ) ).toBe( 'xcol xcol-md-6' );
	} );
	it( 'Objekt → je Breakpoint', () => {
		expect( colsToClasses( { sm: 12, md: 6, xl: 4 } ) ).toBe( 'xcol xcol-sm-12 xcol-md-6 xcol-xl-4' );
	} );
	it( 'leer → xcol', () => {
		expect( colsToClasses( undefined ) ).toBe( 'xcol' );
	} );
} );
```

- [ ] **Step 2: Rot** — `npm test -- cols.directive` → FAIL.

- [ ] **Step 3: Implementieren** — `cols.directive.ts`:

```ts
import { Directive, computed, input } from '@angular/core';

export type XiriCols = number | { sm?: number; md?: number; lg?: number; xl?: number };

export function colsToClasses( cols: XiriCols | undefined ): string {
	if ( cols === undefined ) return 'xcol';
	if ( typeof cols === 'number' ) return `xcol xcol-md-${ cols }`;
	const parts = [ 'xcol' ];
	for ( const bp of [ 'sm', 'md', 'lg', 'xl' ] as const )
		if ( cols[ bp ] !== undefined ) parts.push( `xcol-${ bp }-${ cols[ bp ] }` );
	return parts.join( ' ' );
}

@Directive( {
	selector: '[xiriCols]',
	host: { '[class]': 'classes()' }
} )
export class XiriColsDirective {
	xiriCols = input<XiriCols>();
	classes = computed( () => colsToClasses( this.xiriCols() ) );
}
```

- [ ] **Step 4: Interfaces erweitern**

`dyndata.interface.ts` (`XiriDynData`): `cols?: XiriCols;` (Import des Typs).
`field.interface.ts:42` (neben `class?`): `cols?: XiriCols;`.
`public-api.ts`: `export * from './lib/layout/cols.directive';`.

- [ ] **Step 5: Grün + Commit**

Run: `npm test -- cols.directive` → PASS
```bash
git add projects/xiri-ng/src/lib/layout/ projects/xiri-ng/src/lib/dyncomponent/dyndata.interface.ts projects/xiri-ng/src/lib/formfields/field.interface.ts projects/xiri-ng/src/public-api.ts
git commit -m "feat(layout): deklaratives cols-Modell (Directive + Mapper)"
```

---

### Task 10: `cols` in dyncomponent & form-fields anwenden (mit Override)

**Files:**
- Modify: `projects/xiri-ng/src/lib/dyncomponent/dyncomponent.component.html`
- Modify: `projects/xiri-ng/src/lib/dyncomponent/dyncomponent.component.ts` (Import Directive + Helper)
- Modify: `projects/xiri-ng/src/lib/formfields/form-fields.component.ts:205-206`
- Test: `dyncomponent.component.spec.ts`

**Interfaces:**
- Consumes: `colsToClasses`, `obj.cols`, `obj.display`, `field.cols`, `field.class`.
- Regel: **`display`/`class` haben Vorrang.** Nur wenn nicht gesetzt, wird `cols` gemappt; sonst Default wie bisher.

- [ ] **Step 1: Failing test (dyncomponent)**

```ts
it( 'display überstimmt cols', () => {
	expect( component.resolveClass( { type: 'stat', display: 'xcol xcol-md-12', cols: 6 } as any ) ).toBe( 'xcol xcol-md-12' );
} );
it( 'cols wird gemappt, wenn kein display', () => {
	expect( component.resolveClass( { type: 'stat', cols: { md: 6 } } as any ) ).toBe( 'xcol xcol-md-6' );
} );
```

- [ ] **Step 2: Rot** — `npm test -- dyncomponent` → FAIL.

- [ ] **Step 3: Helper in dyncomponent.component.ts**

```ts
import { colsToClasses } from '../layout/cols.directive';
// ...
resolveClass( obj: XiriDynData, fallback: string ): string {
	if ( obj.display ) return obj.display;
	if ( obj.cols !== undefined ) return colsToClasses( obj.cols );
	return fallback;
}
```
In `dyncomponent.component.html` die `[class]="obj.display || '<default>'"`-Ausdrücke ersetzen durch `[class]="resolveClass(obj, '<default>')"` (Default je Case beibehalten). Für den Test ggf. eine Signatur mit optionalem Fallback (`fallback = 'xcol'`).

- [ ] **Step 4: form-fields**

In `form-fields.component.ts:205-206`:
```ts
if ( !field.class )
	field.class = field.cols !== undefined ? colsToClasses( field.cols ) : 'xcol';
```
(Import `colsToClasses`.)

- [ ] **Step 5: Grün + Commit**

Run: `npm test -- dyncomponent form-fields` → PASS
```bash
git add projects/xiri-ng/src/lib/dyncomponent/ projects/xiri-ng/src/lib/formfields/form-fields.component.ts
git commit -m "feat(layout): cols in dyncomponent und form-fields (display/class als Override)"
```

---

### Task 11: Container Queries (opt-in)

**Files:**
- Modify: `projects/xiri-ng/styles/grid.scss`
- Test: manuell (SCSS, nicht in jsdom testbar) — Demo-Verifikation

**Interfaces:**
- Produces: Opt-in-Klasse `.xrow-cq` (setzt `container-type: inline-size`) + `@container`-Varianten der `.xcol-{bp}-{n}`-Spannen. Media-Query-Grid bleibt Default.

**Hinweis:** Container-Query-Verhalten hängt von echtem Layout ab → jsdom kann es nicht prüfen. Verifikation ausschließlich in der Demo (Task 12).

- [ ] **Step 1: `.xrow-cq` + Container-Varianten**

In `grid.scss` im Mixin ergänzen:
```scss
.xrow-cq {
	container-type: inline-size;
	container-name: xrow;
}
```
Für jeden Breakpoint einen `@container xrow (min-width: $size)`-Block, der `.xrow-cq > .xcol-{bp}-{n}` auf `grid-column-end: span $i` setzt — spiegelbildlich zum bestehenden `@media (min-width:$size)`-Block (`:48-69`). Bestehende `.xcol*`-Klassen und Media-Queries **unverändert** lassen.

- [ ] **Step 2: Verifikation** — visuell in der Demo (Task 12). Kein Unit-Test.

- [ ] **Step 3: Commit**

```bash
git add projects/xiri-ng/styles/grid.scss
git commit -m "feat(grid): opt-in Container-Queries (.xrow-cq) zusätzlich zum Media-Query-Grid"
```

---

### Task 12: Demo-Erweiterung & manuelle Verifikation

**Files:**
- Modify: `projects/demo/src/app/...` (passende Demo-Seiten für Tabelle, Bullet-Chart, Radio-Feld, Side-Panel, cols/Container-Queries)

**Interfaces:** keine (nur Demo).

- [ ] **Step 1** Demo-Beispiele ergänzen: eine Tabelle mit `density`-Umschalter und number-Spalten; ein `xiri-bulletchart`; ein Formular mit `type:'radio'`; ein Button, der `XiriSidepanelService.open(...)` aufruft; ein `.xrow-cq`-Container mit `cols`-Feldern.
- [ ] **Step 2** `cd xiri-ng && npm start` → auf Port 4301 prüfen: Zahlen rechtsbündig/tabular, Density-Höhen, Pie-Hinweis ab 5 Segmenten, Bullet, Radio, Side-Panel öffnet/schließt rechts, `.xrow-cq` bricht abhängig von Containerbreite um.
- [ ] **Step 3** `cd xiri-ng && npm run lint && npm test` → alles grün.
- [ ] **Step 4: Commit**

```bash
git add projects/demo/
git commit -m "docs(demo): Beispiele für density, bullet, radio, sidepanel, cols/container-queries"
```

---

## Verifikation (gesamt)

1. `cd xiri-ng && npm test` — alle Specs grün.
2. `cd xiri-ng && npm run lint` — keine Fehler.
3. `cd xiri-ng && npm start` — Demo auf 4301, die fünf Feature-Bereiche manuell durchklicken (Task 12, Step 2).
4. Nicht-breaking-Gegenprobe: bestehende Demo-Seiten (die `display`/`class`/`dense` nutzen) unverändert korrekt gerendert.
