# @xiriframework/xiri-ng

Angular UI component library for the [Xiri Framework](https://github.com/xiriframework) — a JSON-driven approach where your backend defines the UI and `xiri-ng` renders it. Pairs with [xiri-go](https://github.com/xiriframework/xiri-go) (Go backend) or any backend that emits the expected JSON shape.

## Installation

```bash
npm install @xiriframework/xiri-ng
```

## Setup

Register the Xiri services in your application config. `api` is the base URL prepended to HTTP requests made by `XiriDataService`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideXiriServices } from '@xiriframework/xiri-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    provideXiriServices({ api: '/api/' }),
  ],
};
```

## The main entry point: `xiri-dyncomponent`

`xiri-ng` is designed around a central component that dynamically renders an array of JSON component definitions:

```html
<xiri-dyncomponent [data]="components"></xiri-dyncomponent>
```

```typescript
import { XiriDynComponentComponent, XiriDynData } from '@xiriframework/xiri-ng';

components: XiriDynData[] = [
  { type: 'page-header', data: { title: 'Dashboard' } },
  { type: 'stat-grid',   data: { stats: [...], columns: 4 } },
  { type: 'table',       data: { url: '/api/devices', ... } },
];
```

Individual components can also be used directly (all are standalone):

```typescript
import { XiriTableComponent } from '@xiriframework/xiri-ng';

@Component({
  selector: 'app-devices',
  imports: [XiriTableComponent],
  template: `<xiri-table [settings]="tableSettings" />`,
})
export class DevicesComponent { /* ... */ }
```

## Components

40+ standalone Material-Design components. Import individually for tree-shaking.

### Forms & data

| Component                    | Use case                                           |
| ---------------------------- | -------------------------------------------------- |
| `XiriFormComponent`          | Dynamic form with backend-driven fields + submit    |
| `XiriFormFieldsComponent`    | Just the fields — full control over submit flow    |
| `XiriQueryComponent`         | Filter form + live results via `xiri-dyncomponent` |
| `XiriTableComponent`         | Full data table — sort, paginate, filter, inline-edit, export |
| `XiriRawTableComponent`      | Minimal table for static data                      |
| `XiriDialogComponent`        | Modal dialogs (question / form / table / waiting)  |
| `XiriStepperComponent`       | Multi-step wizard                                  |

### Layout & navigation

| Component                    | Use case                                           |
| ---------------------------- | -------------------------------------------------- |
| `XiriPageHeaderComponent`    | Page title + subtitle + actions                    |
| `XiriToolbarComponent`       | Toolbar with title, search, buttons                |
| `XiriSectionComponent`       | Collapsible content sections                       |
| `XiriDividerComponent`       | Section divider with optional text/icon            |
| `XiriTabsComponent`          | Material tabs with lazy-loading                    |
| `XiriExpansionComponent`     | Accordion panels with lazy-loading                 |
| `XiriSidenavComponent`       | Side navigation with nested items                  |
| `XiriBreadcrumbComponent`    | Breadcrumb trail                                   |

### Cards, lists, info

| Component                         | Use case                                      |
| --------------------------------- | --------------------------------------------- |
| `XiriCardComponent`               | Card container with header + content          |
| `XiriCardlinkComponent`           | Clickable card as a navigation link           |
| `XiriLinksComponent`              | List of navigation links/buttons              |
| `XiriListComponent`               | Sectioned list with favorites                 |
| `XiriInfopointComponent`          | Info card (icon + text + optional link)       |
| `XiriImagetextComponent`          | Image + text card                             |
| `XiriDescriptionListComponent`    | Key/value pairs in 1-3 columns                |

### Stats, progress, feedback

| Component                     | Use case                                          |
| ----------------------------- | ------------------------------------------------- |
| `XiriStatComponent`           | Single KPI tile with value + label + trend        |
| `XiriStatGridComponent`       | Grid of KPI tiles                                 |
| `XiriMultiprogressComponent`  | Multi-row progress bars                           |
| `XiriTimelineComponent`       | Vertical or horizontal timeline                   |
| `XiriEmptyStateComponent`     | Empty-state placeholder with optional action      |
| `XiriSkeletonComponent`       | Loading skeleton (text/circle/rect/table-row)     |
| `XiriAlertComponent`          | Alert / confirmation dialog content               |
| `XiriDoneComponent`           | Success checkmark                                  |
| `XiriErrorComponent`          | Error message display                              |
| `XiriHeaderComponent`         | In-page section header                             |

### Buttons & search

| Component                     | Use case                                          |
| ----------------------------- | ------------------------------------------------- |
| `XiriButtonComponent`         | Single button with action handling                |
| `XiriButtonlineComponent`     | Horizontal button line                            |
| `XiriButtonstyleComponent`    | Internal — button visual renderer                 |
| `XiriSearchComponent`         | Debounced search input                            |

## Services

All services are `providedIn: 'root'` and are activated by `provideXiriServices()`:

| Service                         | Purpose                                                           |
| ------------------------------- | ----------------------------------------------------------------- |
| `XiriDataService`               | HTTP client with automatic snackbar response handling             |
| `XiriSnackbarService`           | Toast notifications (success, error, info, warning)               |
| `XiriResponseHandlerService`    | Parses backend responses (refresh, goto, table-update) centrally  |
| `XiriFormService`               | Form data fetch/submit + state persistence                        |
| `XiriDownloadService`           | File download handling (blob → browser)                           |
| `XiriDateService`               | Unix timestamp ↔ locale-formatted strings (via `date-fns`)        |
| `XiriNumberService`             | Locale-aware number formatting                                    |
| `XiriLocalStorageService`       | Typed localStorage wrapper with timestamp-based expiry            |
| `XiriSessionStorageService`     | Typed sessionStorage wrapper                                      |
| `ThemeService`                  | Theme management (light / dark / auto) via signals                |

## Pipes

- `SafehtmlPipe` (`| safeHtml`) — bypass DomSanitizer for trusted HTML. Never feed user input into this pipe.

## Claude Code support

The main repository ships a [Claude Code](https://claude.com/claude-code) skill (`xiri-ng-expert`) that teaches Claude the full API, patterns, and conventions. See the [main README](https://github.com/xiriframework/xiri-ng#claude-code-integration) for installation.

## Peer dependencies

- Angular 21+
- Angular Material 21+
- Angular CDK 21+
- RxJS 7.8+
- `date-fns` 4+
- `@date-fns/tz` 1+
- `ngx-mat-select-search` 8+
- `material-symbols` ≥ 0.40

## License

Apache-2.0
