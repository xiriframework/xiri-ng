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

Alles läuft über den zentralen `XiriLocaleService` (ab v0.3.0; früher getrennte `XiriDateService`/`XiriNumberService`). Backend (`xiri-go`) liefert sichtbare Texte + Zahlen/Datum bereits sprachrichtig; die App setzt beim Login nur Sprache + Timezone:

```typescript
// z.B. in einem auth-response-handler:
this.locale.setLanguage('de');            // 'de' | 'en' eingebaut
this.locale.setTimezone('Europe/Vienna');
// Datepicker-Locale + Validierungstexte + Zahlen/Datumsformate folgen automatisch.
```

### Weitere Sprachen registrieren (Client-erweiterbar)

```typescript
import { fr } from 'date-fns/locale/fr';

this.locale.registerLanguage('fr', {
  localeString: 'fr-FR',
  dateFnsLocale: fr,                       // optional (Datepicker + Monatsnamen)
  validationMessages: { required: 'Champ requis', /* … alle 14 Keys */ },
});
this.locale.setLanguage('fr');
```

### Date-Format-Helper

```typescript
locale.unixToStringDateTime(1708800000)   // '2024-02-24 18:00'
locale.unixToStringDate(1708800000)       // '24. Feb.'  (Monatsnamen folgen der Sprache)
locale.unixToStringDateYear(1708800000)   // '24. Feb. 24'
locale.unixToLocal(1708800000)            // Date-Objekt oder null
locale.dateToUnix(new Date())             // number
```

### Number-Format-Helper

```typescript
locale.formatNumber(1234.567, 'integer')  // '1.235'   (folgt der aktiven Sprache)
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
