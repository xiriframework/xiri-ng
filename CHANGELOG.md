# Changelog

All notable changes to `@xiriframework/xiri-ng` are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- **Dialogs no longer have a 6px horizontal scrollbar.** `.dialog-header` had no horizontal
  padding, so the close icon-button sat flush against the dialog edge. Material renders a 48px
  wide, absolutely positioned `.mat-mdc-button-touch-target` centred on that button — at density
  `-1` the button is only 36px wide, so the touch target overhung the edge by 6px. Since Material
  sets `overflow-y: auto` on `.mat-mdc-dialog-surface` (which makes `overflow-x` compute to
  `auto`), the surface became a horizontal scroll container and scrolled by exactly those 6px.
  This affected **every** dialog, at every viewport width, regardless of content — the 0.3.1
  grid-blowout fix addressed a different mechanism inside `mat-dialog-content` and could not
  catch it.

  The header now carries `padding-right: var(--xiri-spacing-lg)`, the same 24px
  `mat-dialog-actions` already uses. Side effect: the close button is now indented as far as the
  title, which Material already inset by 24px via `[mat-dialog-title]` — the header was visually
  asymmetric before.

- **`xiri-raw-table` cells wrap unbreakable tokens instead of widening the table.** A serial
  number, hash, JSON blob or URL with no break opportunity forced its column to the token's full
  width and pushed the table past its container — in a 600px table dialog that meant a horizontal
  scrollbar on `mat-dialog-content`. `td.mat-mdc-cell` now sets `overflow-wrap: anywhere`
  (`anywhere`, not `break-word`: only `anywhere` affects `min-content` sizing, which is what fixes
  the width), and `.table-out` gets `overflow-x: auto` as a backstop so a genuinely wide table —
  many columns rather than long tokens — scrolls inside itself instead of dragging the dialog
  content or card along. Measured on a 420px viewport: a raw table of telemetry keys went from
  822px wide (440px of overflow) to 382px, exactly its container.

  The redundant `word-wrap: anywhere` on right-aligned raw-table cells is gone — `word-wrap` is the
  legacy alias of `overflow-wrap`, which is now set unconditionally.

  **`xiri-table` deliberately does not get this rule.** It looks like the same bug, but `anywhere`
  also affects `min-content`, so it breaks *ordinary* words as soon as a column is merely tight,
  not just genuinely unbreakable tokens. Applying it to the full table turned the inline-edit demo
  into `1,299.|00`, `Comput|ers`, `Disconti|nued` — while saving only 48px of width that
  `.xiritable { overflow: auto }` already absorbs by scrolling in place. Raw tables show untouched
  backend values, where breaking mid-token beats scrolling; the full table shows formatted columns,
  where it does not. Full tables keep the opt-in `.canbreak` class (`word-break: break-all`) for
  cases that want it.

- **Selected table row ids are no longer coerced to `number`.** `getSelectionIDs` applied a unary
  plus to each selected row's `id`, so a non-numeric id (`'abc'`) became `NaN` in the request body
  and an id above 2⁵³ would have been rounded. Ids now pass through verbatim as `string | number`
  for bulk actions, selection dialogs, the API action and the CSV download. Rows without an `id`
  are skipped instead of being sent as `NaN`.

  Note this fixes the *frontend* side only. `xiri-go`'s selection endpoint accepts numbers and
  decimal numeric strings within ±(2⁵³−1); a genuinely non-numeric id is still skipped there. The
  change means the backend now receives what was selected instead of `NaN`, not that arbitrary
  string ids became supported end to end.

### Changed

- **`xiri-treeselect` ids are typed `string | number` (`XiriTreeselectId`) instead of `number`.**
  The component never converted the values — only the types claimed `number[]`, which forced casts
  like `id as unknown as number` on consumers and hid the fact that string keys already worked.
  Type-only change, no runtime behaviour differs. `writeValue`, the `value` getter/setter and
  `MatFormFieldControl<…>` widen accordingly; `number[]` stays assignable, so existing consumers
  keep compiling. The component is reached through `xiri-form-fields` (JSON-driven) rather than
  imported directly, so this is not a public-API break.

  Background: ids come from `xiri-go`, whose form-field layer moved from `int32` to `int64` in the
  same release cycle. Ids travel as JSON numbers, so the exact range is ±(2⁵³−1).

### Documentation

- **`xiri-ng-expert` skill: the id contract is documented.** `references/table.md` and
  `references/form-fields.md` now state that row ids and option ids are `string | number`, are
  passed through untouched, and must never be run through `+id` / `Number(id)` / `parseInt(id)` —
  that rounds anything above 2⁵³ and turns a non-numeric id into `NaN`.

### Internal

- **`release.sh` runs `npm test` and `npm run typecheck` before bumping the version.** Neither the
  release script nor CI ran the suite, so a red test could be tagged and published. Both now run
  *before* `npm run version`, so a failure leaves no version commit behind. The new `typecheck`
  script (`tsc -p projects/xiri-ng/tsconfig.spec.json --noEmit`) exists because `ng test` builds
  through esbuild and strips types without checking them — a spec that pins a type contract rather
  than runtime behaviour would otherwise pass no matter what the types say.

## [0.3.1] - 2026-07-22

### Fixed

- **Form dialogs no longer show a horizontal scrollbar from grid blowout.** `.xrow` used
  `grid-template-columns: repeat(12, 1fr)`; `1fr` has an implicit `minmax(auto, 1fr)`, so a
  multi-column field whose `min-content` width exceeded the fixed dialog width inflated its track
  and widened the whole row. The row now uses `repeat(12, minmax(0, 1fr))`. Date fields
  additionally switched from a fixed `min-width` to `min(<value>, 100%)`, keeping their minimum
  width while the grid cell is wide enough and clamping to the cell otherwise.

  Note: this addressed blowout *inside* `mat-dialog-content`. A separate 6px scrollbar caused by
  the dialog header's close button affected every dialog and is fixed in Unreleased.

- **`container` components render their children again.** The `@case ('container')` renderer passed
  `obj.data` (`{ components: [...] }`) straight into the nested `<xiri-dyncomponent [data]>` input,
  which expects an array — `dataInt()` wrapped the object into a single-element array with no
  `type` and the renderer printed `unknown type` instead of the children. It now unwraps
  `.components`, matching how Card and Section already did it, and maps `class=row` to `xrow` for
  grid consistency.

### Documentation

- **`xiri-ng-expert` skill: `container` takes `{ components: XiriDynData[] }`,** not a bare array.

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
