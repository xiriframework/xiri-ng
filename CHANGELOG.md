# Changelog

Alle nennenswerten Änderungen an `@xiriframework/xiri-ng` werden hier festgehalten.

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung nach [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

Änderungen seit `v0.2.48`, noch nicht veröffentlicht. Alle Ergänzungen sind additiv (nicht breaking).

### Added

- **Progress-Component**: determinate „current of total" plus indeterminate-Modus.
- **Sidepanel**: Service-gesteuertes Side-Panel als Dialog-Alternative — ESC schließt, ARIA-Dialog-Rolle, Fokusfalle und Fokus-Rückgabe an das öffnende Element.
- **Bulletchart-Component**: kompakte Gauge-Alternative (Balken + Ziel-`markLine`, Wert- und Ziel-Label).
- **Layout `cols`**: deklaratives Spalten-Modell (Directive + Mapper), nutzbar in `dyncomponent` und `form-fields` (`display`/`class` als Override).
- **Grid Container-Queries**: opt-in `.xrow-cq` zusätzlich zum Media-Query-Grid.
- **Tabellen density-API**: einheitlich `compact` / `regular` / `relaxed` (numerischer `dense`-Wert als Alias); numerische Spalten rechtsbündig mit `tabular-nums`, `format`-Klasse an Zellen.
- **radio-Feldtyp** für kleine Optionsmengen (inkl. `aria-labelledby`).
- **Internationalisierung**: `XiriLocaleService` (Sprache `de`/`en`, Material-Datepicker-Locale) + lokalisierte Validierungsmeldungen.
- **Accessibility**: `forced-colors`-Support (High-Contrast-Mode), WCAG-konforme `line-height`-Defaults für Fließtext/Überschriften, Dialog-Icon-Buttons.
- **Piechart**: Hinweis bei mehr als 4 Segmenten.

### Changed

- **Ehrliche UI-States** für Query / Table / Stat — klare Leer-, Lade- und Fehlerzustände statt stiller Leere.
- **Dependencies**: `ngx-mat-select-search` auf 9.0.0 angehoben (setzt `@angular/material` ≥ 17 voraus, auf Angular 22 erfüllt); Angular auf 22.0.7 / CDK+Material 22.0.4→22.0.5, eslint 10.7.0.

### Fixed

- **Charts**: abgeschnittene bzw. fehlende Achsen-Labels.
- **Bulletchart**: Wert- und Ziel-Label wurden nicht angezeigt (Chart war ohne Zahlen unleserlich).
- **Grid**: `$size` wurde in der `@container`-Bedingung nicht interpoliert.
- **Table**: density-Klasse wird reaktiv aus den Settings abgeleitet (Live-Umschalten wirkt).
- **Form-fields**: radio-Hint als Block unter der Gruppe (kein Überlappen mehr).

[Unreleased]: https://github.com/xiriframework/xiri-ng/compare/v0.2.48...HEAD
