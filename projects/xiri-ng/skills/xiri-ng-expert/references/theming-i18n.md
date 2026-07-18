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

xiri-ng setzt auf Angular Material 3 mit SCSS-Theme-Konfiguration im konsumierenden Projekt. Typisches Setup:

```scss
// src/styles.scss
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: (
      primary: mat.$azure-palette,
      tertiary: mat.$blue-palette,
    ),
    typography: Roboto,
    density: 0,
  ));
}

// Dark-Mode via ThemeService's 'dark'-Klasse auf <body>
body.dark {
  color-scheme: dark;
}
```

Die Komponenten nutzen `mat.*-theme` Tokens — kein Hart-kodiertes CSS.

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
