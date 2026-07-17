# XiriLocaleService Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein reaktiver Frontend-Sprach-Service, den die App beim Login setzt und an den die Validierungs-Fehlertexte + der Material-Datepicker-Locale gebunden sind (Sprachwechsel ohne Reload).

**Architecture:** `XiriLocaleService` hält die aktive Sprache als Signal (Muster 1:1 vom bestehenden `ThemeService`), persistiert in `localStorage`. Ein `effect` gleicht den Material-`DateAdapter`-Locale an. `form-fields` liest die Sprache reaktiv aus dem Service statt aus dem statischen `LOCALE_ID`. Backend führt die Sprache (liefert Texte + Zahlen/Daten schon übersetzt/formatiert); der Service gleicht nur frontend-eigene Bausteine an.

**Tech Stack:** Angular 22 (standalone, signals, `@Service()`-Decorator), Angular Material `DateAdapter`, `date-fns/locale`, Vitest + TestBed.

## Global Constraints

- Kein Git in dieser Umgebung → **keine** commit-Steps; jeder Task endet mit grünen Tests + Lint.
- Code-Konventionen (CLAUDE.md): Tabs für Einrückung, single quotes, semicolons immer, max 140 Zeichen. Standalone Components, OnPush, Angular signals / `input()`.
- Deutsche Texte mit korrekten Umlauten (ä/ö/ü/ß) — niemals ASCII-Ersatz.
- Kein Hinweis auf Claude in Code, Kommentaren oder sonstigem Text.
- Sprachumfang: nur `'de' | 'en'`.
- **Backend führt:** kein Sprach-Header an Requests, kein Neuladen, keine `XiriDataService`-Änderung.
- **Out of scope:** Ausgabeformatierung von Zahlen/Daten aus Backend-Daten (macht xiri-go) — der Service triggert `XiriNumberService.setLocale` NICHT und ändert keine Ausgabeformate.
- Verifikation je Task:
  `cd /workspace/xiri/xiri-ng && npx ng test xiri-ng --watch=false --include="<spec>"` und `npx ng lint xiri-ng`; am Ende jedes Tasks zusätzlich die volle Suite `npx ng test xiri-ng --watch=false`.

## File Structure

- **Create:** `projects/xiri-ng/src/lib/services/locale.service.ts` — der Sprach-Service (Signal + Persistenz + optionaler DateAdapter-effect).
- **Create:** `projects/xiri-ng/src/lib/services/locale.service.spec.ts` — Service-Tests.
- **Modify:** `projects/xiri-ng/src/public-api.ts` — Export ergänzen (nach Zeile 79, `theme.service`).
- **Modify:** `projects/xiri-ng/src/lib/formfields/form-fields.component.ts` — `LOCALE_ID`-Read durch reaktiven `XiriLocaleService.language()`-Read ersetzen.
- **Modify:** `projects/xiri-ng/src/lib/formfields/form-fields.component.spec.ts` — i18n-Tests von `LOCALE_ID`-Provider auf `XiriLocaleService` umstellen + Reaktivitäts-Test.

---

### Task 1: XiriLocaleService

**Files:**
- Create: `projects/xiri-ng/src/lib/services/locale.service.ts`
- Test: `projects/xiri-ng/src/lib/services/locale.service.spec.ts`
- Modify: `projects/xiri-ng/src/public-api.ts` (nach Zeile 79)

**Interfaces:**
- Consumes: Material `DateAdapter<unknown>` aus `@angular/material/core`, **optional** injiziert (`inject(DateAdapter, { optional: true })`) — keine harte Abhängigkeit, damit reine Text-Formulare ohne `provideDateFnsAdapter()` nicht mit `NG0201` crashen.
- Produces:
  - `type XiriLanguage = 'de' | 'en'`
  - `XiriLocaleService.language: Signal<XiriLanguage>` (readonly)
  - `XiriLocaleService.localeString: Signal<string>` (computed, `'de-DE'` | `'en-GB'`)
  - `XiriLocaleService.setLanguage(lang: XiriLanguage): void`

- [ ] **Step 1: Failing test schreiben** (`locale.service.spec.ts`)

Orientiere dich am Vitest/TestBed-Muster von `services/theme.service.spec.ts` (falls vorhanden) bzw. `sidepanel.service.spec.ts`. `DateAdapter` als Spy bereitstellen, um den `effect` zu prüfen. `localStorage` ist im Projekt-jsdom-Setup nicht bare vorhanden — per `vi.stubGlobal('localStorage', {...})` stubben (nicht `localStorage.clear()`).

```typescript
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DateAdapter } from '@angular/material/core';
import { de } from 'date-fns/locale/de';
import { enGB } from 'date-fns/locale/en-GB';
import { XiriLocaleService } from './locale.service';

describe( 'XiriLocaleService', () => {
	let service: XiriLocaleService;
	let dateAdapterSetLocale: ReturnType<typeof vi.fn>;
	let localStorageStore: Record<string, string>;

	beforeEach( () => {
		dateAdapterSetLocale = vi.fn();
		localStorageStore = {};
		vi.stubGlobal( 'localStorage', {
			getItem: ( key: string ) => localStorageStore[key] ?? null,
			setItem: ( key: string, value: string ) => { localStorageStore[key] = value; },
			removeItem: vi.fn(),
			clear: vi.fn(),
			length: 0,
			key: vi.fn(),
		} );

		TestBed.configureTestingModule( {
			providers: [ { provide: DateAdapter, useValue: { setLocale: dateAdapterSetLocale } } ]
		} );
		service = TestBed.inject( XiriLocaleService );
	} );

	afterEach( () => {
		vi.unstubAllGlobals();
	} );

	it( 'Default-Sprache ist de', () => {
		expect( service.language() ).toBe( 'de' );
		expect( service.localeString() ).toBe( 'de-DE' );
	} );

	it( 'setLanguage setzt Signal, localeString und localStorage', () => {
		service.setLanguage( 'en' );
		expect( service.language() ).toBe( 'en' );
		expect( service.localeString() ).toBe( 'en-GB' );
		expect( localStorage.getItem( 'xiri-language' ) ).toBe( 'en' );
	} );

	it( 'gleicht den DateAdapter-Locale bei Sprachwechsel an', () => {
		TestBed.tick(); // initialer effect
		dateAdapterSetLocale.mockClear();
		service.setLanguage( 'en' );
		TestBed.tick();
		expect( dateAdapterSetLocale ).toHaveBeenCalledWith( enGB );
	} );

	it( 'gleicht den DateAdapter-Locale beim initialen Aufruf an (de)', () => {
		TestBed.tick();
		expect( dateAdapterSetLocale ).toHaveBeenCalledWith( de );
	} );

	it( 'ist ohne bereitgestellten DateAdapter instanziierbar und setLanguage crasht nicht', () => {
		TestBed.resetTestingModule();
		vi.stubGlobal( 'localStorage', {
			getItem: vi.fn( () => null ), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn(), length: 0, key: vi.fn(),
		} );
		TestBed.configureTestingModule( {} );
		const noAdapterService = TestBed.inject( XiriLocaleService );

		expect( noAdapterService ).toBeTruthy();
		expect( () => {
			noAdapterService.setLanguage( 'en' );
			TestBed.tick();
		} ).not.toThrow();
	} );
} );
```

- [ ] **Step 2: Test rot verifizieren**

Run: `npx ng test xiri-ng --watch=false --include="projects/xiri-ng/src/lib/services/locale.service.spec.ts"`
Expected: FAIL — Modul `./locale.service` existiert nicht.

- [ ] **Step 3: Service implementieren** (`locale.service.ts`)

Nutze den `@Service()`-Decorator (wie `ThemeService`, NICHT `@Injectable`). date-fns-Locale-Import-Pfad verifizieren (date.service nutzt `date-fns`; die Locale-Objekte liegen unter `date-fns/locale`). `DateAdapter` **optional** injizieren (`inject(DateAdapter, { optional: true })`, Import aus `@angular/material/core`) — kein `XiriDateService`, damit reine Text-Formulare ohne `provideDateFnsAdapter()` nicht mit `NG0201` crashen.

```typescript
import { Service, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DateAdapter } from '@angular/material/core';
import { de } from 'date-fns/locale/de';
import { enGB } from 'date-fns/locale/en-GB';

export type XiriLanguage = 'de' | 'en';

@Service()
export class XiriLocaleService {
	private readonly platformId = inject( PLATFORM_ID );
	private readonly isBrowser = isPlatformBrowser( this.platformId );
	private readonly dateAdapter = inject<DateAdapter<unknown>>( DateAdapter, { optional: true } );

	private readonly _language = signal<XiriLanguage>( 'de' );
	readonly language = this._language.asReadonly();
	readonly localeString = computed( () => this._language() === 'en' ? 'en-GB' : 'de-DE' );

	constructor() {
		if ( this.isBrowser ) {
			const stored = localStorage.getItem( 'xiri-language' );
			if ( stored === 'de' || stored === 'en' )
				this._language.set( stored );
		}
		// Material-Datepicker-Locale (Picker-UI) an die Sprache angleichen — reine Frontend-Interaktion.
		// Ohne bereitgestellten DateAdapter (z. B. Text-only-Formular ohne provideDateFnsAdapter()) gibt es
		// ohnehin keinen Datepicker, daher wird der effect dann übersprungen.
		effect( () => {
			this.dateAdapter?.setLocale( this._language() === 'en' ? enGB : de );
		} );
	}

	setLanguage( lang: XiriLanguage ): void {
		this._language.set( lang );
		if ( this.isBrowser )
			localStorage.setItem( 'xiri-language', lang );
	}
}
```

- [ ] **Step 4: Export ergänzen** (`public-api.ts`, nach Zeile 79)

```typescript
export * from './lib/services/locale.service';
```

- [ ] **Step 5: Tests grün verifizieren**

Run: `npx ng test xiri-ng --watch=false --include="projects/xiri-ng/src/lib/services/locale.service.spec.ts"`
Expected: PASS (alle Fälle inkl. DateAdapter-Spy und der Variante ohne bereitgestellten `DateAdapter`). Falls `date-fns/locale/de` nicht auflöst: auf `import { de, enGB } from 'date-fns/locale'` ausweichen und Test erneut laufen lassen.

- [ ] **Step 6: Lint + volle Suite**

Run: `npx ng lint xiri-ng` → All files pass.
Run: `npx ng test xiri-ng --watch=false` → alle grün, keine Regression.

---

### Task 2: form-fields an XiriLocaleService binden (reaktive Fehlertexte)

**Files:**
- Modify: `projects/xiri-ng/src/lib/formfields/form-fields.component.ts`
- Modify: `projects/xiri-ng/src/lib/formfields/form-fields.component.spec.ts`

**Interfaces:**
- Consumes: `XiriLocaleService.language(): Signal<'de'|'en'>` aus Task 1.
- Produces: keine neuen öffentlichen Interfaces.

**Kontext:** Aktuell steht in `form-fields.component.ts` (~Zeile 161) `private validationLang = resolveValidationLang(inject(LOCALE_ID))` — ein einmalig im Konstruktor aufgelöster Wert. Die Fehlertext-Auswahl (`validationMessages`-Map, DE/EN, ~Zeile 68–116) nutzt `this.validationLang`. Da `LOCALE_ID` statisch ist, sind die Texte nicht umschaltbar.

- [ ] **Step 1: Failing test schreiben** (`form-fields.component.spec.ts`)

Neuer Test: Sprache über `XiriLocaleService` steuern und prüfen, dass eine bereits sichtbare Fehlermeldung nach `setLanguage` wechselt. Nutze den echten `XiriLocaleService` (kein `LOCALE_ID`-Provider mehr für diese Tests).

```typescript
it( 'wechselt Validierungs-Fehlertexte reaktiv bei setLanguage (ohne Reload)', () => {
	const locale = TestBed.inject( XiriLocaleService );
	locale.setLanguage( 'de' );
	// ... Formular mit required-Feld rendern, Feld touched/leer machen, detectChanges ...
	const errDe = fixture.nativeElement.querySelector( 'mat-error' )?.textContent ?? '';
	expect( errDe ).toContain( 'Pflichtfeld' );

	locale.setLanguage( 'en' );
	fixture.detectChanges();
	const errEn = fixture.nativeElement.querySelector( 'mat-error' )?.textContent ?? '';
	expect( errEn ).toContain( 'Required' );
} );
```
Stelle außerdem die **bestehenden** i18n-Tests um: statt `{ provide: LOCALE_ID, useValue: 'en' }` nun `TestBed.inject(XiriLocaleService).setLanguage('en')` vor dem Rendern. Zusätzlicher Test: ein reines Text-Formular (kein Datumsfeld, kein `provideDateFnsAdapter()` bereitgestellt) rendert ohne `NG0201` — belegt, dass die `DateAdapter`-Injektion im Service optional ist.

- [ ] **Step 2: Test rot verifizieren**

Run: `npx ng test xiri-ng --watch=false --include="projects/xiri-ng/src/lib/formfields/form-fields.component.spec.ts"`
Expected: FAIL — Sprache ändert die gerenderte Meldung nicht (statisches `LOCALE_ID`).

- [ ] **Step 3: form-fields umstellen** (`form-fields.component.ts`)

- `inject(LOCALE_ID)`-Auflösung und `resolveValidationLang(...)` als **statisches Feld** entfernen. Stattdessen den Service injizieren: `private readonly localeService = inject( XiriLocaleService );`
- Umsetzung ohne Template-Eingriff: pro Validation-Eintrag ein `get message()`-Getter. Zwei kleine Hilfsfunktionen kapseln den Read — `langFor(): XiriValidationLang => localeService.language()` und `messagesFor() => validationMessages[langFor()]` — und jeder `get message()`-Getter ruft `messagesFor()....` auf. Da es sich um Getter (nicht einmalig berechnete Felder) handelt, liest jeder Zugriff `localeService.language()` **frisch**; bei Sprachwechsel + Change-Detection wird die Anzeige automatisch neu ausgewertet.
- `resolveValidationLang` wird obsolet, da `language()` bereits `'de'|'en'` liefert (= die Map-Keys). Funktion und `LOCALE_ID`-Import entfernen, falls nicht mehr genutzt.
- Kommentar (~Zeile 57–59) zur alten `LOCALE_ID`-Herkunft entfernen/ersetzen.

- [ ] **Step 4: Tests grün verifizieren**

Run: `npx ng test xiri-ng --watch=false --include="projects/xiri-ng/src/lib/formfields/form-fields.component.spec.ts"`
Expected: PASS (neuer Reaktivitäts-Test + umgestellte i18n-Tests + bestehende Tests).

- [ ] **Step 5: Lint + volle Suite**

Run: `npx ng lint xiri-ng` → All files pass.
Run: `npx ng test xiri-ng --watch=false` → alle grün, keine Regression.

---

## Verifikation (End-to-End, nach beiden Tasks)

- Volle Suite grün, Lint sauber.
- Manuell/Demo (optional): In `projects/demo` `localeService.setLanguage('en')` aufrufen und prüfen, dass (a) ein Pflichtfeld-Fehler auf Englisch erscheint, (b) der Material-Datepicker-Kalender englische Monats-/Wochentagsnamen zeigt — beides ohne Reload. `npm start` (Port 4301).

## Hinweis für die konsumierende App

Die App liest die User-Sprache aus ihrem Login-/Profil-Response und ruft `inject(XiriLocaleService).setLanguage('de'|'en')`. Die vom Backend gelieferten Texte und formatierten Zahlen/Daten kommen bereits in der richtigen Sprache; der Service gleicht nur Validierungstexte + Datepicker-UI an. Angular-eigene `LOCALE_ID`-Pipes (`| date`, `| number`) bleiben statisch (Angular-Einschränkung).
