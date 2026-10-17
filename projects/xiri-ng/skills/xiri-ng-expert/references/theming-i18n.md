# Theming, Colors & i18n — xiri-ng Reference

## Farben

```typescript
export type XiriThemeColor =
  | 'primary' | 'secondary' | 'tertiary' | 'accent'
  | 'warn' | 'error' | 'success';

export type XiriExtendedColor =
  | 'emerald' | 'red' | 'yellow' | 'green' | 'blue' | 'purple'
  | 'gray' | 'lightgray' | 'darkgray' | 'orange'
  | 'white' | 'black' | 'inherit';

export type XiriColor = XiriThemeColor | XiriExtendedColor;
```

Wird in fast allen Settings-Interfaces genutzt (`iconColor`, `color`, `headerIconColor`). Für Backend-JSON: als String serialisiert (z.B. `"primary"`, `"warn"`).

## ThemeService

```typescript
import { ThemeService } from '@xiriframework/xiri-ng';

private theme = inject(ThemeService);

theme.mode                         // Signal<'light' | 'dark' | 'auto'>
theme.isDark                       // computed Signal<boolean>
theme.isLight                      // computed Signal<boolean>

theme.setTheme('dark' | 'light' | 'auto');   // persistiert in localStorage
theme.toggle();                               // light ↔ dark
theme.resetToAuto();                          // folgt System-Präferenz
```

Typischer Toolbar-Toggle:

```typescript
@Component({ ... })
export class HeaderComponent {
  private theme = inject(ThemeService);
  isDark = this.theme.isDark;
  toggle() { this.theme.toggle(); }
}
```

## Material-Design-3 Theming

xiri-ng setzt auf Angular Material 3. Das Theme wird über die **Mixins der Library** aufgesetzt,
nicht über `mat.theme()` — die Komponenten lesen Xiris eigene, unprefixed CSS-Variablen
(`--primary`, `--surface`, `--on-surface-variant`, …), und die schreibt `xirimat.theming()`.

```scss
// src/styles.scss
@use '@angular/material' as mat;
@use '@xiriframework/xiri-ng/styles/material' as xirimat;
@use 'material-symbols/outlined'; // Icon-Font, Pflicht-Peer; Set wählt provideXiriServices({ iconFontSet })

$light-theme: xirimat.create-theme(mat.$azure-palette, mat.$blue-palette, light, -1);
$dark-theme:  xirimat.create-theme(mat.$azure-palette, mat.$blue-palette, dark,  -1);

// Light: schreibt alle Theme-Variablen nach :root
@include xirimat.theming($light-theme, #2892D9, #4CAF50);

// Dark: muss NACH theming() kommen (gleiche Spezifität, Quellreihenfolge entscheidet).
// Emittiert @media (prefers-color-scheme: dark) :root:not(.light-theme) UND .dark-theme —
// passend zu den Klassen, die XiriThemeService auf <html> setzt.
@include xirimat.theming-dark($dark-theme);

@include xirimat.apply-themes();
```

`XiriThemeService` setzt `light-theme` bzw. `dark-theme` auf **`<html>`** (nicht `dark` auf
`<body>`); im Modus `auto` setzt er keine Klasse, dann greift die Media-Query.

### Welche Variablen ein Consumer bekommt

`theming()` schreibt nach `:root`: `--primary`, `--on-primary`, `--primary-container`,
`--on-primary-container`, `--primary-light`, `--primary-dark`, `--secondary`, `--on-secondary`,
`--secondary-container`, `--on-secondary-container`, `--tertiary`, `--on-tertiary`, `--error`,
`--on-error`, `--error-container`, `--on-error-container`, `--surface`, `--on-surface`,
`--surface-variant`, `--on-surface-variant`, `--surface-dim`, `--surface-bright`,
`--surface-container`, `--background`, `--on-background`, `--outline`, `--outline-variant`,
`--ripple`, `--color-primary/-secondary/-warning/-success/-info` und `--color-gray-100…900`.

`theming-dark()` überschreibt davon die Surface-, Outline-, Container- und Gray-Werte sowie
`--sidenav-background`, `--ripple`, `--color-success/-info`, die `--xiri-shadow-*` und setzt
`color-scheme: dark`. Die nicht aus M3 ableitbaren Werte (`--primary-dark`, Statusfarben, Schatten,
Grautöne) sind Defaults — nach dem Include überschreibbar.

Statusfarben: `--color-warning` ist Amber (`#B07700` hell, `#FFC94D` dunkel), nicht mehr das Error-Rot.
`--on-success` (Text auf `--color-success`) ist hell wie dunkel gesetzt und dunkel; wer `--color-success` auf ein
dunkles Grün überschreibt, setzt `--on-success` mit. Der Auto-Dark-Selektor hat `:root`-Spezifität, eigene
`:root { --… }`-Werte nach dem Include gelten also auch im Modus `auto`.

### Look-Tokens (ab v0.9)

Der Standard-Look folgt Material 3. Jede Abweichung lässt sich über ein Token in `:root` (nach dem Theme-Include)
zurückdrehen oder anpassen:

| Token | Default / wirkt auf | Alter Look (bis v0.8) |
|---|---|---|
| `--xiri-surface-border`, `--xiri-surface-shadow`, `--xiri-surface-background` | Karten und Tabellen (Klasse `.xiri-surface`): Rand statt Schatten, `surface`-Fläche | `--xiri-surface-border: transparent; --xiri-surface-shadow: var(--mat-app-elevation-shadow-level-2)` |
| `--xiri-icon-button-background-color`, `--xiri-icon-button-shadow` | Icon-Buttons flach | `var(--color-gray-100)` bzw. `var(--mat-app-elevation-shadow-level-2)` |
| `--xiri-sidenav-active-color`, `--xiri-sidenav-active-icon-color`, `--xiri-sidenav-icon-color`, `--xiri-sidenav-active-radius`, `--xiri-sidenav-active-decoration` | Sidenav: aktiver Eintrag in `secondary-container`, Icons `on-surface-variant` | Pille: `--xiri-sidenav-active-radius: var(--xiri-radius-full)` |
| `--xiri-page-header-border` | Page-Header ohne Linie | `3px solid var(--primary)` |
| `--xiri-treeselect-max-height` | Tree-/Multiselect-Liste wächst bis 300 px | — |

Die Lib-Karten tragen keine `mat-elevation-z2`/`z3` mehr. Sidenav-Gruppen-Schalter sind `<button mat-list-item>`
(CSS auf `mat-list-item.parent` greift nicht mehr). Tonale Tags/Chips haben kein Token.

### `mat.theme()`-Kompatibilität

Wer stattdessen `mat.theme()` nutzt (das war hier früher dokumentiert), bekommt `--mat-sys-*`
statt der unprefixed Variablen. Die Komponenten lesen deshalb in einer Kette:

```scss
color: var(--on-surface-variant, var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6)));
```

Xiris Contract gewinnt, `mat.theme()` funktioniert weiter, und ohne jedes Theme greift der
Literal-Fallback. Die `--mat-sys-*`-Stufe ist ein Übergang — `xirimat.theming()` ist der
empfohlene Weg, weil nur damit alle Variablen gesetzt sind.

## Locale & Sprache

Alles läuft über den zentralen `XiriLocaleService` (ab v0.3.0; früher getrennte `XiriDateService`/`XiriNumberService`). Backend (`xiri-go`) liefert sichtbare Texte + Zahlen/Datum bereits sprachrichtig; die App setzt beim Login Sprache + Timezone (und `setLocale()`, wenn Sprache und Format getrennt geführt werden, siehe unten):

```typescript
// z.B. in einem auth-response-handler:
this.locale.setLanguage('de');            // 'de' | 'en' eingebaut
this.locale.setTimezone('Europe/Vienna');
// Datepicker-Locale + Validierungstexte + Zahlen/Datumsformate folgen automatisch.
```

Führt die App Sprache und Format getrennt (z. B. Texte Englisch, Zahlen/Datum Deutsch), setzt sie zusätzlich das
Format-Locale. An der Sprache hängen die Texte (Validierung, Datepicker-/Paginator-Labels), am Locale `localeString`,
`formatNumber`, Monatsnamen und der Datepicker (Wochenbeginn, Eingabeformat). Codes kommen aus derselben Registry:

```typescript
this.locale.setLanguage('en');
this.locale.setLocale('de');               // null = wieder der Sprache folgen; gemerkt unter 'xiri-locale'
```

### Weitere Sprachen registrieren (Client-erweiterbar)

```typescript
import { fr } from 'date-fns/locale/fr';

this.locale.registerLanguage('fr', {
  localeString: 'fr-FR',
  dateFnsLocale: fr,                       // optional (Datepicker + Monatsnamen)
  validationMessages: { required: 'Champ requis', /* … alle 14 Pflicht-Keys */ },  // optional maxFileSize(size), sonst deutscher Text
  // optional: Material-Datepicker-/Paginator-Texte; fehlende Keys = englische Material-Defaults
  materialLabels: { datepicker: { openCalendarLabel: 'Ouvrir le calendrier' /* … */ }, paginator: { itemsPerPageLabel: 'Par page :' } },
});
this.locale.setLanguage('fr');
```

### Date-Format-Helper

```typescript
locale.unixToStringDateTime(1708800000)   // '2024-02-24 18:00'
locale.unixToStringDate(1708800000)       // '24. Feb.'  (Monatsnamen folgen dem Locale)
locale.unixToStringDateYear(1708800000)   // '24. Feb. 24'
locale.unixToLocal(1708800000)            // Date-Objekt oder null
locale.dateToUnix(new Date())             // number
```

### Number-Format-Helper

```typescript
locale.formatNumber(1234.567, 'integer')  // '1.235'   (folgt dem Format-Locale, ohne setLocale der Sprache)
locale.formatNumber(1234.567, 'float2')   // '1.234,57'
locale.formatNumber(1234.567, 'float4')   // '1.234,5670'
```

## SafehtmlPipe

```html
{{ htmlString | safeHtml }}
```

Nur verwenden wenn der HTML-String vertrauenswürdig ist (nicht aus User-Input). Umgeht Angulars DomSanitizer.

## Conventions im Library-Code

- Alle Komponenten: **standalone**, `OnPush`, kebab-case-Selector mit `xiri-`-Prefix
- Alle Directives: camelCase-Selector (z.B. `[xiriSelect]`)
- Signals für State, `input()`/`output()` für Komponenten-API
- `UntypedFormGroup` für dynamisch konstruierte Forms (Field-Liste aus JSON)
- `Observable` für HTTP, keine Promises
- Kein NgModule — niemand importiert xiri-ng als Modul
