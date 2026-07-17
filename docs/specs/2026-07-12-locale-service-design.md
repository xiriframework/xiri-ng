# Design: XiriLocaleService — dynamische Sprachumschaltung im Frontend

**Datum:** 2026-07-12
**Status:** Design (zur Umsetzung freigegeben)

## Problem / Kontext

Die Validierungs-Fehlertexte in `form-fields.component.ts` (neu in der Formular-UX-Welle) sind an Angulars `LOCALE_ID` gebunden. `LOCALE_ID` ist konstruktionszeitlich fix und kann zur Laufzeit nicht umgeschaltet werden — ein Sprachwechsel beim Login (ohne Reload) ist damit unmöglich, und ohne explizite `LOCALE_ID`-Konfiguration defaultet Angular auf `en-US`.

Es braucht eine reaktive Frontend-Sprachquelle, die die App beim Login setzt und an die sich die wenigen frontend-eigenen sprachabhängigen Bausteine binden.

## Entscheidungen (geklärt)

1. **Backend führt, Frontend gleicht an.** Das Go-Backend kennt die User-Sprache (Profil/DB) und liefert alle sichtbaren Texte **bereits übersetzt** als fertige Strings. Das Frontend meldet die Sprache **nicht** ans Backend zurück; kein Sprach-Header, kein Neuladen, keine `XiriDataService`-Änderung.
2. **xiri-go formatiert Zahlen und Daten bereits sprachrichtig** (locale-abhängige Ausgabewerte kommen fertig formatiert im JSON). Der Frontend-Service fasst die **Ausgabeformatierung** von Datenwerten daher **nicht** an — kein Sync von `XiriNumberService`/`XiriDateService`-Ausgabeformaten.

## Scope

### Im Scope
1. **Sprach-Signal:** `XiriLocaleService` hält die aktive Sprache (`'de' | 'en'`) als Signal, persistiert in `localStorage` (SSR-sicher), Default `'de'`. Public API: `language` (readonly Signal), `localeString` (computed, `'de-DE'`/`'en-GB'`), `setLanguage(lang)`.
2. **Validierungs-Fehlertexte reaktiv:** `form-fields.component.ts` liest die Sprache künftig aus `XiriLocaleService.language()` **statt** `inject(LOCALE_ID)`. Die Fehlertext-Auswahl wird ein `computed`/Signal-Read → Meldungen wechseln bei `setLanguage()` ohne Reload.
3. **Material `DateAdapter`-Locale:** Der Kalender-Picker (Monats-/Wochentagsnamen, Eingabe-Parsing) ist reine Frontend-Interaktion, die das Backend nicht abdeckt. Der Service injiziert den Material-`DateAdapter` **optional und direkt** (`inject<DateAdapter<unknown>>(DateAdapter, { optional: true })`, aus `@angular/material/core`) und gleicht per `effect` dessen Locale an (`this.dateAdapter?.setLocale(...)`). Eine harte Abhängigkeit auf `XiriDateService` entfällt bewusst: reine Text-Formulare ohne Datepicker stellen keinen `DateAdapter` bereit (kein `provideDateFnsAdapter()`), eine Pflicht-Injektion würde dort mit `NG0201` crashen. Das date-fns-Locale-Objekt (`de` / `enGB`) wird im Service gemappt.

### Nicht im Scope (bewusst)
- **Ausgabeformatierung von Zahlen/Daten aus Backend-Daten** — macht xiri-go.
- **Sprache ans Backend propagieren / Requests neu laden** — Backend führt.
- **Angular-eigene `LOCALE_ID`-Pipes** (`| date`, `| number` in Templates) — konstruktionszeitlich fix, nicht dynamisch umschaltbar (Angular-Einschränkung). Die xiri-Komponenten nutzen überwiegend backend-formatierte Werte, nicht diese Pipes; die Grenze wird dokumentiert.

## Architektur

`XiriLocaleService` (neu, `services/locale.service.ts`) — Muster 1:1 vom bestehenden `ThemeService`:

```typescript
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

### Datenfluss
1. App-Start: Service liest `localStorage` (Default `'de'`).
2. Login: die konsumierende App liest die User-Sprache aus ihrem Login-/Profil-Response und ruft `localeService.setLanguage('de'|'en')`. (Wie die App die Sprache erfährt, ist App-Sache — Library-Grenze.)
3. `setLanguage` setzt das Signal → (a) der `effect` gleicht — sofern ein `DateAdapter` bereitgestellt ist — dessen Locale an (`dateAdapter?.setLocale(...)`; ohne Datepicker im Formular wird der Aufruf übersprungen); (b) `form-fields` re-evaluiert seine Fehlertexte reaktiv.
4. Backend-Texte + backend-formatierte Zahlen/Daten sind ohnehin schon in der richtigen Sprache (Backend führt).

### form-fields-Integration
- `private validationLang = resolveValidationLang(inject(LOCALE_ID))` wird ersetzt durch `private readonly localeService = inject(XiriLocaleService)`.
- Umgesetzt über einen `get message()`-Getter je Validation-Eintrag: `langFor()` liest `localeService.language()`, `messagesFor()` wählt darüber die Fehlertext-Map; beide werden bei **jedem Zugriff** auf `message` frisch ausgewertet (kein einmalig im Konstruktor aufgelöster Wert, kein Eingriff ins Template). Damit wechseln bereits angezeigte Fehler bei Sprachwechsel automatisch mit.

## Bekannte Grenzen
- Angular-`LOCALE_ID`-Pipes bleiben statisch (dokumentiert). Kein Defekt des Service.
- Sprachumfang vorerst DE/EN (deckt die bestehende Fehlertext-Map). Erweiterung über das Backend-`language`-Enum später möglich, ohne die Service-API zu brechen.

## Testing
- **Service:** Unit-Test (Vitest/TestBed) mit `DateAdapter`-Spy (`{ provide: DateAdapter, useValue: { setLocale: vi.fn() } }`): Default `'de'`; `setLanguage('en')` setzt Signal + `localStorage`; Konstruktor liest `localStorage`; `localeString` mappt korrekt; `effect` ruft `dateAdapter.setLocale` beim initialen Aufruf sowie bei Sprachwechsel mit dem richtigen Locale-Objekt. Zusätzlicher Test: Service ohne bereitgestellten `DateAdapter` (optional → `null`) ist instanziierbar, `setLanguage` crasht nicht. `localStorage` wird im Projekt-jsdom-Setup per `vi.stubGlobal('localStorage', {...})` gestubt (bare `localStorage` ist dort undefined).
- **form-fields:** bestehende i18n-Tests von `LOCALE_ID` auf `XiriLocaleService` umstellen; neuer Test: `setLanguage` wechselt eine bereits sichtbare Fehlermeldung von DE auf EN ohne Reload. Zusätzlicher Test: ein reines Text-Formular ohne `provideDateFnsAdapter()` rendert ohne `NG0201` (belegt die optionale `DateAdapter`-Injektion).
- Volle Suite + Lint grün, keine Regression.

## Offene Punkte
- Keine. (Sprachen DE/EN, Persistenz localStorage, Date/Number-Ausgabe out-of-scope — alle bestätigt.)
