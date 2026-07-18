# Changelog

All notable changes to `@xiriframework/xiri-ng` are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

No unreleased changes yet.

## [0.3.0] - 2026-07-18

First release with **breaking changes** since the 0.2 series: the locale services are consolidated into `XiriLocaleService` and languages are now client-extensible. Also includes the additive enhancements previously collected under "Unreleased".

### ⚠️ Breaking Changes

- **`XiriDateService` and `XiriNumberService` removed** — fully merged into `XiriLocaleService`. All methods (`setTimezone`, `unixToLocal`, `unixToStringDateTime`/`Date`/`DateYear`, `dateToUnix`, `formatNumber`) now live there.
- **`setLocale()` removed** (on both former services). The Material datepicker locale is derived automatically from the active language — control it via `XiriLocaleService.setLanguage()`.
- **peerDependency `ngx-mat-select-search` raised to `^9.0.0`** (was `^8.0.6`). Consumers must upgrade to 9.x (requires `@angular/material` ≥ 17 — satisfied on Angular 22).
- **Behavioral changes**: English validation dates now use `en-GB` (D/M/Y instead of M/D/Y, consistent with the datepicker); client-side formatted table numbers follow the frontend language (previously fixed to `de-DE`).

### Migration

**1. Switch service imports** — `XiriDateService` / `XiriNumberService` → `XiriLocaleService` (method names are unchanged):

```diff
- import { XiriDateService, XiriNumberService } from '@xiriframework/xiri-ng';
- private date = inject(XiriDateService);
- private number = inject(XiriNumberService);
+ import { XiriLocaleService } from '@xiriframework/xiri-ng';
+ private locale = inject(XiriLocaleService);

- this.date.unixToLocal(unix);        this.number.formatNumber(v, 'float2');
+ this.locale.unixToLocal(unix);      this.locale.formatNumber(v, 'float2');
```

**2. Replace `setLocale()` calls with `setLanguage()`** (datepicker locale + number/date formats follow automatically):

```diff
- this.date.setLocale('de-DE', de);
- this.number.setLocale('de-DE');
+ this.locale.setLanguage('de');   // 'de' | 'en' built in
```

**3. Update `ngx-mat-select-search`:**

```bash
npm install ngx-mat-select-search@^9
```

**4. (optional) Additional languages** are now registered by you at runtime:

```typescript
import { fr } from 'date-fns/locale/fr';
locale.registerLanguage('fr', { localeString: 'fr-FR', dateFnsLocale: fr, validationMessages: { /* 14 keys */ } });
locale.setLanguage('fr');
```

### Added

- **Progress component**: determinate "current of total" plus an indeterminate mode.
- **Sidepanel**: service-driven side panel as a dialog alternative — ESC closes, ARIA dialog role, focus trap, and focus return to the triggering element.
- **Bulletchart component**: compact gauge alternative (bar + target `markLine`, value and target labels).
- **Layout `cols`**: declarative column model (directive + mapper), usable in `dyncomponent` and `form-fields` (`display`/`class` as overrides).
- **Grid container queries**: opt-in `.xrow-cq` in addition to the media-query grid.
- **Table density API**: unified `compact` / `regular` / `relaxed` (numeric `dense` value as an alias); numeric columns right-aligned with `tabular-nums`, `format` class on cells.
- **radio field type** for small option sets (incl. `aria-labelledby`).
- **Internationalization**: `XiriLocaleService` (languages `de`/`en`, Material datepicker locale) + localized validation messages.
- **Client-extensible languages**: `XiriLocaleService.registerLanguage(code, def)` allows arbitrary languages (locale string + optional date-fns locale + validation messages); `setLanguage()` and the `XiriLanguage` type are widened to arbitrary codes. New public types `XiriLanguageDefinition`, `XiriValidationMessages`.
- **Accessibility**: `forced-colors` support (high-contrast mode), WCAG-compliant `line-height` defaults for body text/headings, dialog icon buttons.
- **Piechart**: hint when there are more than 4 segments.

### Changed

- **Locale services consolidated**: `XiriDateService` + `XiriNumberService` merged into `XiriLocaleService` (a single i18n/context service, analogous to Go's `uicontext`) — see Breaking Changes.
- **Honest UI states** for Query / Table / Stat — clear empty, loading, and error states instead of silent emptiness.
- **Dependencies**: `ngx-mat-select-search` raised to 9.0.0 (requires `@angular/material` ≥ 17, satisfied on Angular 22); Angular to 22.0.7 / CDK+Material 22.0.4→22.0.5, eslint 10.7.0.

### Fixed

- **Date month names**: `unixToString*` now follow the active language (previously always English, since formatted without a locale).
- **Charts**: clipped or missing axis labels.
- **Bulletchart**: value and target labels were not displayed (chart was unreadable without numbers).
- **Grid**: `$size` was not interpolated in the `@container` condition.
- **Table**: density class is derived reactively from the settings (live switching works).
- **Form-fields**: radio hint renders as a block below the group (no more overlap).

[Unreleased]: https://github.com/xiriframework/xiri-ng/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/xiriframework/xiri-ng/compare/v0.2.49...v0.3.0
