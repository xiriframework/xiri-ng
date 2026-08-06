# Changelog

All notable changes to `@xiriframework/xiri-ng` are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.4.4] - 2026-08-06

### Added

- **Dependent fields show a progress bar while they reload.** Between a trigger change and the
  patch lie 200 ms of debounce plus the roundtrip, and until now nothing said so — the field kept
  showing its old list and stayed operable, so an option picked in that window could be dropped
  again by the pruning that follows. An indeterminate `mat-progress-bar` now sits above the field
  block for the duration. It is set on the trigger change rather than on the request, so the
  debounce window is covered too, and it survives a second trigger change cancelling the first
  request. Filters inherit it, since `xiri-query` renders the same `xiri-form-fields` component.

  Deliberately an indicator and not a lock: `control.disable()` would take the value out of
  `formGroup.value`, which is exactly what `xiri-query` and `xiri-form` read from the `formChange`
  event — a filter saved during the reload window would be missing that field. The bar is absolutely
  positioned, so showing and hiding it does not shift the fields.

### Fixed

- **`control.disable()` now reaches every field type.** Angular routes a disabled control to the
  accessor's `setDisabledState()`, but the composite field types keep their inputs in an inner
  `FormGroup` bound through `formControlName` — disabling the outer control never touched it.
  `XiriFieldMain.setDisabledState()` was an empty body, `volume` and `file` only set a boolean
  nobody read, `treeselect` never bound `disabled` in its template, and `chips` had no notion of
  being disabled at all. All of them stayed fully operable while their control was disabled.
  Fields with an inner group now register it with the base class; `treeselect` and `chips` bind it
  in their templates. `timelimit` was already correct.

  Two sources are now held apart and OR'ed — the declarative one (`field.disabled`, or the
  `disabled` input where a field type has no `field`) and the state of the outer control. That is
  required rather than tidy: Angular calls `setDisabledState(false)` during control setup
  (`callSetDisabledState` defaults to `'always'`), *after* the inputs, so a single flag would let
  the setup wipe a declarative `disabled`. The same applied to `doCheckLogic()`, which wrote the
  new control's state straight onto the field whenever the control instance was replaced — which
  happens routinely, because `track field.id` keeps the child component while a rebuilt form
  creates a fresh control.

  A disabled field also no longer writes its value back out. The render pass triggered by
  disabling reaches `doCheckLogic()` and from there `startChangeValue()`, so every
  `control.disable()` produced one extra `setValue` emission caused by nothing but a state change.

  `chips` additionally guards `add()`, `remove()` and `selected()`: `matChipInputAddOnBlur` would
  otherwise commit pending text on focus loss, an open autocomplete panel could still deliver, and
  Material forwards Delete/Backspace on a focused chip to `remove()` checking only `removable`.
  `file` guards the dialog click (it hangs on the form field, not the input), the `change` handler,
  and the async `FileReader` callback — the latter through a generation counter bumped both on
  locking and on every new selection, so neither a disable/enable in between nor a second, faster
  selection lets a stale read write back. `volume` re-checks in its deferred callback: it schedules
  `onChange` through a timer, and the lock can land in between.

  Unchanged on purpose: a `disabled: true` sent by the backend still does not disable the outer
  control when the form is built, so such a field stays in `formGroup.value`; arriving later
  through a reload patch, it does. And for text, number, textarea, select, multiselect and bool,
  backend `disabled` still has no effect at all, because the form template does not evaluate
  `field.disabled`.

- **A chips field crashed when its form was rebuilt.** `writeValue()` writes a signal, and Angular
  calls it from `setUpControlValueAccessor` — i.e. during template evaluation, where a signal write
  throws NG0600. Rebuilding a form that contained a chips field with the same field id therefore
  aborted change detection. The write is now `untracked`, matching what Angular's own
  `FormControl.setValue` does at the same spot.

### Changed

- **Dependencies bumped inside the existing ranges.** Angular 22.0.7 → 22.1.0, CLI and build →
  22.1.3, Material 22.0.5 → 22.1.1, via `npm update` — `package.json` itself is untouched. That
  clears four high findings in the build toolchain (`undici`, `fast-uri`, `ip-address`, and the
  `esbuild` nesting under `vite`); `npm audit` drops from 11 to 3. The remainder is a single chain
  (`@angular/cli` → `@modelcontextprotocol/sdk` → `@hono/node-server`) with no fix in 22.x. None of
  the findings ever reached the published package — its only dependency is `tslib`, everything else
  is a peer dependency.

### Documentation

- **The shipped `xiri-ng-expert` skill claimed two limitations that this release removes.**
  `references/form-fields.md` stated that `treeselect` and `chips` cannot show themselves as
  disabled, and that there is no loading state during a reload. Both now describe the actual
  behaviour, including why the reload shows a bar rather than locking the fields. The same file now
  documents what `field.disabled` actually does — it was listed in the interface without a word,
  while it has no effect at all on `text`, `number`, `textarea`, `select`, `multiselect` and `bool`.

## [0.4.3] - 2026-08-06

### Added

- **Query: the collapsed filter panel remembers what the user left open.** `collapsed` set the panel
  state on every load, so a filter opened by hand snapped shut again on the next navigation. The panel
  state is now stored per `saveStateId` (key `<saveStateId>:collapsed`, session storage, same 1 h
  lifetime as the saved filter values) and wins over the value from the backend. Without a
  `saveStateId` nothing is stored and `collapsed` behaves exactly as before; an absent `collapsed`
  still means no panel at all.

- **Dependent fields: reload a field's content from the server (`reloadOn`/`reloadUrl`).** Until now
  `showWhen` could only show or hide a field based on another value — its **content** was fixed once
  the form had rendered. A field can now declare `reloadOn: ['status']` plus a `reloadUrl`: whenever
  one of those values changes, the form posts the trigger values to that endpoint and merges the
  returned `{fields: {id: {...}}}` patch. The case this exists for is a select set to "active" and a
  multiselect that must then only offer the entries valid for "active" — a list only the server knows.

  Only the trigger values are sent, not the whole form: an options endpoint has no business receiving
  a password field. Requests are debounced by 200 ms, one per distinct URL, and run through
  `switchMap` so only the newest answer is applied; a failing URL does not suppress the patches of
  the others. Values survive the patch where the new list still offers them (recursively, so a
  treeselect keeps its selected leaves) and are dropped otherwise — except for `chips` and
  server-search selects, whose lists are suggestions rather than a constraint. The patch itself is
  restricted to a typed whitelist, so a malformed response cannot corrupt validators or pruning.

  One reload always runs right after the controls are built. This is required rather than cosmetic:
  `xiri-query` restores saved filter values through `formService.loadState()` *before* the controls
  exist, so the option list shipped with the first render can already be stale.

  Requires a `xiri-go` version that emits `reloadOn`. Both directions stay backward compatible — an
  older backend simply never sends the keys, and a form without `reloadOn` behaves exactly as before.
  Filters inherit the behaviour, since `xiri-query` renders the same `xiri-form-fields` component.

### Fixed

- **A treeselect kept its old selection when its options were replaced.** `ngAfterViewInit` re-applied
  the current value by calling `treeItemSelectionToggle()` for each id, but never cleared the
  `SelectionModel` first. Rebuilding the tree — which happens whenever the bound field object is
  replaced — therefore left the *old* node objects selected alongside the new ones, so the value
  getter returned every kept id twice; the re-toggling also wrote back to the `FormControl`, turning
  a pure re-render into a value change. It now reuses the existing `applyInputSelection()`, which
  clears the selection, resets the node state and suppresses the CVA emit.

- **A stale query response could overwrite a newer one.** `XiriQueryComponent.load()` subscribed to
  every request separately and never cancelled the previous one, so with two loads in flight the
  slower-but-older answer won. Loads now run through a `switchMap`. This was always possible on
  rapid filter changes; dependent fields make it routine, because discarding a filter value that is
  no longer valid triggers a second load by design.

- **A collapsed section did not hide a re-rendered field.** `isInCollapsedSection()` located the
  field via `indexOf`, i.e. by object identity. A field rendered as a copy — which is how patched
  fields reach child components — was not found and became visible. It now matches by `id`.

- **Validation-error lists were tracked by identity.** The `@for` over `field.validations` used
  `track vali`, so rebuilding a field's validators re-created every `mat-error` node and logged
  NG0956. Harmless while validators were built exactly once, but a `required`/`min`/`max` patch
  rebuilds them at runtime. Now tracked by `vali.id`, which is unique per field.

- **`XiriDataServiceConfig` had no default provider.** It was only ever supplied through
  `provideXiriServices()`, so an application that forgot the call crashed with a NullInjector error
  instead of falling back to the documented `/api/` base. It is now `providedIn: 'root'`;
  `provideXiriServices()` still overrides it.

## [0.4.2] - 2026-08-04

### Fixed

- **Client-side sorting of `chips` columns sorted by chip count.** The cell value of a `chips` column
  is an `Array<{label, color}>`; `sortingDataAccessor` only special-cased `format: 'number'` and
  passed everything else to `MatTableDataSource` untouched. Its comparator coerces the array to
  `"[object Object],[object Object]"`, so what actually got compared was the length of that chain —
  silently, with no error. Chips columns now sort by the first chip's label (empty or missing cell →
  `''`). Only affects columns with sorting enabled: xiri-go sends `sort: false` for `chips` by
  default, columns defined directly in the frontend are sortable by default.

### Documentation

- **The shipped `xiri-ng-expert` skill documented the wrong server-side payload.** `references/table.md`
  showed a nested `{pageIndex, pageSize, sortBy, sortDir, search, filter}` object; the table actually
  posts the pagination params flat alongside the filter fields, `_`-prefixed (`_page`, `_pageSize`,
  `_sort`, `_sortDir`, `_search`) — which is what xiri-go's `LoadPaginationParams()` reads. Anyone
  implementing server-side against the old doc would have found none of the documented keys.
- Chips columns now document their sorting behaviour (xiri-go default `sort: false`, client-side
  sorting by the first chip's label).

## [0.4.1] - 2026-08-01

Two visible behaviour changes despite the patch bump: dark mode is slightly darker in five derived
values (see below), and `hide: true` on a button now actually hides it — anyone who sent the field
expecting it to be ignored will lose those buttons.

### Fixed

- **Dark mode: ten components fell back to hardcoded light colours.** 22 declarations across
  `breadcrumb`, `timeline`, `table`, `treeselect`, `form-fields`, `echarts-host`, `sidepanel`,
  `query`, `links` and `imagetext` read `--mat-sys-*` — variables the library never writes.
  `theming()` uses `mat.define-theme()` + `all-component-themes()` without `use-system-variables`,
  and that combination emits **no** `--mat-sys-*` at all, so those reads could never resolve and
  the hardcoded light literals (`#555`, `rgba(0,0,0,.6)`, `#fff`) always won. Most visibly the
  breadcrumb rendered dark text on a dark surface. The other 26 component stylesheets already read
  the unprefixed variables that `theming()` does write — this was an inconsistency inside the
  library, not a missing consumer contract.

  The reads now go through a chain — `var(--on-surface-variant, var(--mat-sys-on-surface-variant,
  rgba(0,0,0,.6)))` — so Xiri's own contract wins while a consumer on `mat.theme()` (which the
  docs used to recommend, and which does emit `--mat-sys-*`) keeps working.

- **`--sidenav-background` and `--xiri-shadow-*` stayed light in dark mode.** `material-vars.scss`
  declared its variables on `body`, and a declaration on `body` beats a value merely inherited from
  `<html>` — so every dark override on `:root` / `.dark-theme` lost against it. Now declared on
  `:root`.

- **Chart series coloured `primary`, `secondary`, `tertiary`, `accent`, `error` or `inherit` got no
  colour at all.** `echarts/color.ts` mapped those tokens to the literal strings `var(--mat-sys-…)`
  and `currentColor` and handed them straight to echarts. Two problems at once: the library never
  writes `--mat-sys-*` (see above), and echarts draws on a **canvas**, where neither `var()` nor
  `currentColor` is a valid colour — so even the right variable name would not have worked. The
  tokens now point at the theme variables and are resolved to a concrete value before they reach
  echarts.

  Charts also follow a theme switch now: `resolveColor()` reads an epoch signal that
  `XiriThemeService` bumps, so the `computed()` building a chart option re-evaluates and the chart
  re-renders — without every chart component having to know about the theme.

- **`XiriButton.hide` had no effect anywhere.** The field was part of the contract but never read:
  a backend sending `hide: true` still got its button rendered. The guard sits in
  `xiri-buttonstyle`, the leaf every button ends up in — that covers `xiri-button` as well as
  form, dialog, alert and stepper, which render `XiriButton` through buttonstyle directly. The
  table (bulk actions, cell buttons, selection buttons) and the links component build their own
  markup and carry their own guard. An `autoLoad` button that is hidden no longer fires its action.

- **Eight icon-only buttons had no accessible name.** `matTooltip` contributes
  `aria-describedby`, never a name, so screen readers announced unlabelled buttons and
  `getByRole('button', { name })` could not find them. Affected: both menu triggers (the block
  exists twice, in `button.component.html` and copy-pasted into `table.component.html`), the three
  table selection buttons, the inline-edit confirm button, the list favourite toggle (which now
  also exposes `aria-pressed`) and the chips remove button. Note for icon-type buttons built by
  `xiri-go`: `hint` is the only possible label source, because `Print()` does not emit `text` for
  those types — xiri-go warns when it is missing.

### Added

- **`theming-dark()` — dark mode now ships with the library.** Consumers had to maintain ~30
  variables themselves, in two identical blocks (media query + `.dark-theme`); the demo shrank by
  80 lines. The mixin derives surface, outline, background and container values from the passed
  dark theme, so they follow any palette, and it sets `color-scheme: dark` (previously missing
  entirely, which left native controls and scrollbars light). Values that are not part of M3
  (`--primary-dark`, status colours, shadows, gray scale) are defaults and can be overridden after
  the include. `theming()` keeps its signature — this is purely additive.

  Because the values are derived rather than copied, five of them differ from the literals the demo
  used to hand-maintain: `--surface`, `--background` and `--surface-dim` `#1A1C1E` → `#121416`,
  `--surface-bright` `#393B3E` → `#37393C`, `--on-surface-variant` `#C2C7CF` → `#DEE3EB`. Dark mode
  is therefore slightly darker with a lighter secondary text colour than before.

- **`--secondary-container`, `--on-secondary-container` and the `--surface-container*` family in
  `theming()`** (`-container`, `-low`, `-high`, `-highest`). The first two are needed by the table
  header, `--surface-container` was already read by table and toolbar but never written by
  anything.

- **`--mat-list-active-indicator-shape` is restored inside the dark block.** Angular's
  `all-component-colors()` also emits a handful of non-colour tokens, and this is the one the
  library sets itself — without restoring it, active nav items would have been pill-shaped in dark
  mode and square in light mode after the `body` → `:root` change. It is the only such collision;
  verified against the compiled CSS.

- **`XiriNavigationField.hide`** — leaves a sidebar entry out entirely, on all three levels. It is
  removed structurally, so no `routerLink` is left in the DOM, and a hidden child no longer
  activates or expands its parent. Deliberately not called `access`: client-side filtering is not
  authorization and the backend must gate the routes regardless.

### Documentation

- **`SKILL.md` documents `hide`, `target` on downloads, and the `hint` requirement for icon
  buttons** — the last one matters because `xiri-go` emits no `text` for icon types, so a missing
  `hint` leaves the button nameless for screen readers.

- **`theming-i18n.md` contradicted the implementation in three places** and is rewritten: it
  recommended `mat.theme()` (not the API `theming()` uses), named a `dark` class on `<body>` when
  `XiriThemeService` sets `dark-theme` on `<html>`, and claimed "no hardcoded CSS" while 22
  declarations carried hardcoded fallbacks. It now documents, for the first time, **which CSS
  variables a consumer actually gets** — plus the `mat.theme()` compatibility path.

## [0.4.0] - 2026-07-31

Minor bump rather than a patch: the `XiriDownloadService.download()` signature changed. Rendered
buttons are unaffected — the change is additive in the JSON (`target: "_blank"`) and only reaches
consumers who call the service directly.

### Added

- **`target: "_blank"` on a download button displays the file in a new tab instead of saving it.**
  The "view the generated PDF" case: the button still POSTs and receives the bytes, but they are
  shown in a tab rather than dropped into the download folder. Works on standalone buttons
  (page, toolbar, buttonline, card, section, …), table cell buttons, table bulk/selection buttons
  and dialog buttons.

  Only the **Content-Type** decides whether the browser renders it (`application/pdf`) — the
  server's `Content-Disposition` has no say, because the frontend builds its own `File` and
  `blob:` URL from the response body and reads the header for the filename only.

  Requires the matching `xiri-go` release for `WithTarget("_blank")`,
  `TableButton.WithTarget()` and `FieldBuilder.WithButtonTarget()`.

  Without a user gesture — an `autoLoad` download button — the browser blocks the tab and the
  file is saved instead. Deliberate: a popup that opens by itself is worse than a download.

### ⚠️ Breaking Changes

- **`XiriDownloadService.download()` third parameter changed from `open: boolean` to
  `tab?: Window | null`.** The old `open: true` could not work: it called `window.open()` from
  inside the HTTP response callback, where the transient user activation is long gone, so
  Firefox and Safari blocked the popup. A tab has to be opened *synchronously in the click* and
  the handle carried through the request — which is what the new parameter is. The boolean was
  never reachable from JSON, so no rendered button ever used it.

### Migration

Pass a tab handle from the new `openTab()` instead of `true`, and `null` instead of `false`:

```diff
- this.downloadService.download( result, filename, false );
+ this.downloadService.download( result, filename, null );
```

```diff
+ // synchronously in the click handler, BEFORE the request
+ const tab = this.downloadService.openTab();
  this.dataService.postFileResponse( url, data ).subscribe( {
-     next: result => this.downloadService.download( result, filename, true ),
+     next:  result => this.downloadService.download( result, filename, tab ),
+     error: err => { tab?.close(); /* … */ },
  } );
```

`openTab()` returns `null` when the popup was blocked; passing that through makes `download()`
save the file, so there is no dead end.

### Fixed

- **Blob URLs of files displayed in a tab are released again.** The old `open` path never called
  `URL.revokeObjectURL()`, so every opened file leaked until the page reloaded. Now revoked 60s
  after the tab was navigated — long enough to load, short enough not to accumulate. The download
  path already revoked after 2s.
- **No more `.csv` appended to the filename when a file is displayed in a tab.** A download button
  without an explicit `filename` fell back to `<text>.csv`, so a PDF opened as `Report.csv` and
  the viewer offered that name on save.

### Documentation

- **`xiri-ng-expert` skill**: `XiriDownloadService` in `setup.md` rewritten for `openTab()` plus
  the new `download()` signature, with both the save and the display-in-tab example; `target` on
  `action: 'download'` documented in `components.md` and the service line in `SKILL.md` updated.

## [0.3.2] - 2026-07-29

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

- **A too-wide `xiri-raw-table` scrolls in itself instead of dragging its container along.** A
  serial number, hash, JSON blob or URL with no break opportunity forces its column to the token's
  full width and pushed the table past its container — in a 600px table dialog that meant a
  horizontal scrollbar on `mat-dialog-content`, and in a card it widened the card. `.table-out` now
  sets `overflow-x: auto`, which is what `.xiritable` in the full table component has had all
  along. Measured on a 420px viewport: an 822px raw table of telemetry keys overflows its 382px
  container by 440px, and that overflow now stays inside `.table-out` — `mat-dialog-content` went
  from 473px of scroll to 0.

  Cells deliberately do **not** get `overflow-wrap: anywhere`. It would keep the table inside its
  container rather than scrolling, but `anywhere` also lowers `min-content`, so it breaks *ordinary*
  words as soon as a column is merely tight — trying it on the full table turned the inline-edit
  demo into `1,299.|00`, `Comput|ers`, `Disconti|nued`. Both table components now agree on this,
  and both keep the opt-in `.canbreak` class (`word-break: break-all`) for cases that want the hard
  break.

- **Selected table row ids are no longer coerced to `number`.** `getSelectionIDs` applied a unary
  plus to each selected row's `id`, so a non-numeric id (`'abc'`) became `NaN` in the request body
  and an id above 2⁵³ would have been rounded. Ids now pass through verbatim as `string | number`
  for bulk actions, selection dialogs, the API action and the CSV download.

  Note this fixes the *frontend* side only. `xiri-go`'s selection endpoint accepts numbers and
  decimal numeric strings within ±(2⁵³−1); a genuinely non-numeric id is still skipped there. The
  change means the backend now receives what was selected instead of `NaN`, not that arbitrary
  string ids became supported end to end.

- **Rows without an `id` can no longer be selected.** Every selection payload carries ids only, so
  such a row could never be acted on — it used to be sent as `NaN`. Dropping it from the payload
  alone would have been worse in a different way: `bulkCount()` and the destructive-action
  confirmation still counted it, so „archive 2 entries?" could post a single id, and a selection
  made up entirely of id-less rows would post an empty list while passing the `isEmpty()` guard.
  The new `isSelectable(row)` gate (`select !== false` **and** an `id` that is neither `undefined`
  nor `null`) governs `isAllSelected`, `masterToggle`, `toggleRow` and the row checkbox alike, so
  count and ids can no longer disagree.

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
