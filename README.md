# xiri-ng

JSON-driven Angular UI component library for building modern data-driven applications.

## Overview

xiri-ng is a configuration-driven Angular component library where the backend controls the UI via JSON structures. Instead of writing Angular templates for every page, you define your UI as JSON on the server, and xiri-ng renders it automatically. This enables a clean separation: the backend decides **what** to show, and xiri-ng decides **how** to show it.

**Perfect companion to [xiri-go](https://github.com/xiriframework/xiri-go):** The Go backend framework that generates type-safe JSON structures for xiri-ng. Together, they form the Xiri Framework - a complete stack for building enterprise applications with Go backends and Angular frontends.

## Features

- **40+ standalone Angular components** ready for production use
- **Configuration-driven forms** with 20+ field types, validation, and server-side search
- **Feature-rich tables** with sorting, filtering, pagination, inline editing, and footer aggregations
- **Modern UI components**: Page headers, sections, toolbars, breadcrumbs, timelines, stats, description lists, skeletons, empty states
- **Dynamic page rendering**: URL → API call → fully rendered UI
- **Responsive grid system** (`xcol-md-{1-12}`)
- **Material Design 3** theming with light/dark/auto mode
- **Built on Angular 21** and Angular Material 21 with standalone components
- **Tree-shakeable**: Only import what you use
- **Extensible** via `xiri-dyncomponent` template overrides
- **Type-safe** when paired with [xiri-go](https://github.com/xiriframework/xiri-go)

## Installation

```bash
npm install @xiriframework/xiri-ng
```

### Peer Dependencies

Angular 21, Angular Material 21, date-fns 4, RxJS 7. See `package.json` for the full list.

## Quick Start

Configure the library in your application bootstrap:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideXiriServices } from '@xiriframework/xiri-ng';
import { AppComponent } from './app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideXiriServices({ api: '/api/' }),
  ]
});
```

Use `xiri-dyncomponent` to render JSON-driven UI:

```typescript
import { Component } from '@angular/core';
import { XiriDynComponentComponent, XiriDynData } from '@xiriframework/xiri-ng';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [XiriDynComponentComponent],
  template: `<xiri-dyncomponent [data]="components" />`
})
export class DashboardComponent {
  components: XiriDynData[] = [
    {
      type: 'card',
      display: 'xcol-md-6',
      data: {
        header: 'Users',
        headerIcon: 'people',
        data: { count: 42 },
        fields: [{ id: 'count', name: 'Total', format: 'number' }]
      }
    },
    {
      type: 'table',
      data: {
        url: '/api/users',
        fields: [
          { id: 'name', name: 'Name', format: 'text', sort: true },
          { id: 'email', name: 'Email', format: 'text', sort: true }
        ]
      }
    }
  ];
}
```

## Component Overview

### Data Entry

| Component | Type | Description |
|-----------|------|-------------|
| Form | `form` | Dynamic form with field generation from JSON configuration |
| Text, Email, Number, Password, Textarea | Field types | Standard input fields with validation |
| Select / Multi-Select | `select`, `multiselect` | Dropdowns with built-in search (ngx-mat-select-search) |
| Tree Select | `treeselect` | Hierarchical tree selection |
| Date / DateTime | `date`, `datetime` | Date and datetime pickers (date-fns) |
| Date Range / DateTime Range | `daterange`, `datetimerange` | Range pickers for start/end dates |
| File Upload | `file` | File upload with drag-and-drop, accepts filters |
| Volume | `volume` | Specialized volume/capacity input |
| Time Limit | `timelimit` | Duration input (days/hours/minutes) |

### Data Display

| Component | Type | Description |
|-----------|------|-------------|
| Table | `table` | Data table with server-side sorting, filtering, pagination, inline editing, footer aggregations |
| Raw Table | - | Simple table for basic data display |
| Card | `card` | Structured data display with header, icon, and action buttons |
| Card Link | `cardlink` | Clickable navigation card |
| List | `list` | List display |
| Stat | `stat` | Single statistic/KPI display with value, label, icon, trend, and color theming |
| Stat Grid | `stat-grid` | Grid layout for multiple statistics |
| Description List | `description-list` | Key-value pairs display (like a definition list) |
| Timeline | `timeline` | Vertical timeline for events/activities |
| Info Point | `infopoint` | Information tooltip |
| Image Text | `imagetext` | Image with text content |
| Links | `links` | Link list display |

### Layout and Navigation

| Component | Type | Description |
|-----------|------|-------------|
| Page Header | `page-header` | Modern page header with title, subtitle, icon, and color theming |
| Section | `section` | Content section with optional title, subtitle, icon, and divider |
| Toolbar | `toolbar` | Action toolbar with title and buttons |
| Header | `header` | Simple text header with color + size (e.g. for inline section titles) |
| Breadcrumb | `breadcrumb` | Breadcrumb navigation trail |
| Sidenav | - | Side navigation |
| Tabs | `tabs` | Tabbed content |
| Expansion | `expansion` | Expandable panels |
| Container | `container` | Nested component grouping |
| Spacer | `spacer` | Layout spacing |
| Divider | `divider` | Visual content divider with optional text |
| Button Line | `buttonline` | Row of action buttons |
| Button | - | Styled button (raised, flat, stroked, icon, fab) |
| Search | - | Search component |

### Feedback and Status

| Component | Type | Description |
|-----------|------|-------------|
| Alert | - | Alert messages |
| Dialog | - | Modal dialogs |
| Done | - | Success/completion display |
| Error | - | Error display |
| Multi Progress | `multiprogress` | Multiple progress indicators |
| Skeleton | - | Loading skeleton placeholders |
| Empty State | - | Empty state display |
| Snackbar Service | - | Toast notifications (success, error, info, warning) |

### Dynamic Rendering

| Component | Type | Description |
|-----------|------|-------------|
| DynComponent | - | Renders `XiriDynData[]` arrays into UI |
| Stepper | `stepper` | Multi-step workflows |
| Query | `query` | Search/filter interface with dynamic result rendering |

### Utilities

| Export | Description |
|--------|-------------|
| `SafehtmlPipe` | Pipe for rendering trusted HTML |
| `ColorType` | Theme color type definitions |

## Services

| Service | Description |
|---------|-------------|
| `XiriDataService` | Central HTTP service. Prepends the configured `api` base URL to all requests. Methods: `get()`, `post()`, `postFile()`, `postFileResponse()` |
| `XiriDateService` | Date manipulation utilities wrapping date-fns with timezone support |
| `XiriNumberService` | Number formatting and validation |
| `ThemeService` | Material Design 3 theme management. Supports `light`, `dark`, and `auto` modes. Persists preference to localStorage |
| `XiriFormService` | Form state management across components |
| `XiriLocalStorageService` | Type-safe `localStorage` wrapper |
| `XiriSessionStorageService` | Type-safe `sessionStorage` wrapper |
| `XiriSnackbarService` | Snackbar notifications with typed methods: `success()`, `error()`, `info()`, `warning()` |

## Dynamic Pages (DynPage)

The core pattern for xiri-ng applications: the current URL maps to an API call, and the response is rendered as a full page.

```
URL: /users         GET /api/users
                          |
                          v
                    { bread: [...], data: XiriDynData[] }
                          |
                          v
                    xiri-dyncomponent renders the page
```

Implementation:

```typescript
@Component({
  template: `
    @if (loading) { <mat-spinner diameter="30" /> }
    <xiri-dyncomponent [data]="data()" />
  `,
  imports: [MatProgressSpinner, XiriDynComponentComponent]
})
export class DynpageComponent {
  private dataService = inject(XiriDataService);
  private router = inject(Router);
  data = signal<XiriDynData[] | null>(null);
  loading = true;

  constructor() {
    // Re-load on every navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.load());
  }

  private load() {
    const url = this.router.url.substring(1); // strip leading /
    this.dataService.get(url).subscribe((res: any) => {
      this.data.set(res.data);
      this.loading = false;
    });
  }
}
```

The backend returns `{ data: XiriDynData[] }` and `xiri-dyncomponent` renders cards, tables, forms, and any other component types automatically.

## Using with xiri-go

**[xiri-go](https://github.com/xiriframework/xiri-go)** is the official Go backend framework for xiri-ng. It provides type-safe builders for all xiri-ng components, eliminating manual JSON writing and preventing configuration errors.

### Why xiri-go?

- ✅ **Type-safe component generation** - No more JSON typos or missing fields
- ✅ **Fluent API** - Chainable builder methods for readable code
- ✅ **Full component coverage** - All xiri-ng components have Go equivalents
- ✅ **Integrated with Echo framework** - Built-in routing and middleware
- ✅ **Auto-complete support** - Your IDE knows all component options

### Example: Building a Dashboard

```go
package main

import (
    "time"

    "github.com/labstack/echo/v4"
    "github.com/xiriframework/xiri-go/component/core"
    "github.com/xiriframework/xiri-go/component/page"
    "github.com/xiriframework/xiri-go/component/pageheader"
    "github.com/xiriframework/xiri-go/component/stat"
    "github.com/xiriframework/xiri-go/component/statgrid"
    "github.com/xiriframework/xiri-go/component/table"
    xurl "github.com/xiriframework/xiri-go/component/url"
)

type User struct {
    ID        int64
    Name      string
    Email     string
    LastLogin time.Time
}

func dashboardPage(c echo.Context) error {
    // Page header with title, subtitle, icon
    header := pageheader.New("User Dashboard").
        Subtitle("Overview of all users").
        Icon("dashboard", core.ColorPrimary)

    // Statistics grid — stat.New(value, label)
    stats := statgrid.New().Columns(2)
    stats.Add(stat.New("1,234", "Total Users").
        Icon("people").
        SetTrend(12.0, stat.TrendUp))
    stats.Add(stat.New("892", "Active Today").
        Icon("trending_up").
        IconColor("accent"))   // stat.IconColor takes a string (not core.Color)

    // Data table — generic builder over Row type
    b := table.NewBuilder[User]()
    b.IdField  ("id",        "ID",         func(r User) int64     { return r.ID })
    b.TextField("name",      "Name",       func(r User) string    { return r.Name }).WithSort(true)
    b.TextField("email",     "Email",      func(r User) string    { return r.Email }).WithSort(true)
    b.DateTimeField("login", "Last Login", func(r User) time.Time { return r.LastLogin }).WithSort(true)
    tbl := b.Build()
    tbl.SetURL(xurl.NewUrlPrefix("/users/data", "/api"))

    // Assemble page and return
    p := page.NewPage()
    p.Add(header)
    p.Add(stats)
    p.Add(tbl)
    return c.JSON(200, p.Print(nil))
}
```

This Go code produces the JSON that xiri-ng's `xiri-dyncomponent` automatically renders into a complete dashboard page with header, statistics, and data table. See the [xiri-go-expert Claude skill](https://github.com/xiriframework/xiri-go#claude-code-integration--xiri-go-expert-skill) bundled in that repo for a full API reference.

### Getting Started with xiri-go

```bash
go get github.com/xiriframework/xiri-go
```

See the [xiri-go repository](https://github.com/xiriframework/xiri-go) for full documentation, examples, and API reference.

## Grid System

Use the `display` property on `XiriDynData` to control responsive layout:

| Class | Breakpoint |
|-------|-----------|
| `xcol` | Full width (default) |
| `xcol-sm-{1-12}` | Small screens |
| `xcol-md-{1-12}` | Medium screens (>= 768px) |
| `xcol-lg-{1-12}` | Large screens (>= 1024px) |
| `xcol-xl-{1-12}` | Extra large screens (>= 1280px) |

Combine classes for responsive behavior:

```json
{ "display": "xcol-md-6 xcol-lg-4" }
```

This renders full width on mobile, half width on medium screens, and one-third on large screens.

## Theming

xiri-ng uses the Angular Material Design 3 theming system with SCSS.

The `ThemeService` manages theme state:

```typescript
import { ThemeService } from '@xiriframework/xiri-ng';

export class MyComponent {
  private theme = inject(ThemeService);

  toggleTheme() {
    this.theme.toggle(); // Switches between light and dark
  }

  setAuto() {
    this.theme.resetToAuto(); // Follow system preference
  }
}
```

Modes: `light`, `dark`, `auto` (follows `prefers-color-scheme`). The preference is persisted in `localStorage`.

## Development

### Setup

```bash
# Install dependencies
npm install

# Start dev server (localhost:4301, proxies /api to localhost:8080)
npm start

# Build the library
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

### Publishing (for maintainers)

```bash
# Automated release workflow (recommended)
npm run publish
# This will:
# 1. Bump patch version (0.2.0 → 0.2.1)
# 2. Build the library
# 3. Create git commit and tag (v0.2.1)
# 4. Push to GitHub
# 5. GitHub Actions automatically publishes to npm

# Manual version bumps
cd projects/xiri-ng
npm version minor  # or major
cd ../..
git add projects/xiri-ng/package.json
git commit -m "Bump to version X.Y.Z"
git tag vX.Y.Z
git push --follow-tags
```

## Demo Application

The `projects/demo/` directory contains a demo application that showcases library components:

```bash
npm start
# Open http://localhost:4301/web/
```

The demo proxies `/api` requests to `http://localhost:8080`, so you can run a backend (e.g., a xiri-go application) alongside it.

## API Reference

For a deep API reference (every component's inputs/outputs, services, pipes, types) use the bundled Claude Code skill — see [Claude Code Integration](#claude-code-integration) below. The skill has 7 reference files covering setup, dyncomponent, form fields, tables, components, and theming.

## Requirements

| Dependency | Version |
|-----------|---------|
| Angular | ^21 |
| Angular Material | ^21 |
| Angular CDK | ^21 |
| date-fns | ^4.1 |
| @date-fns/tz | ^1.4 |
| RxJS | ^7.8.1 |
| ngx-mat-select-search | ^8.0.4 |
| material-symbols | >= 0.40 |

## Claude Code Integration — `xiri-ng-expert` Skill

Dieses Repo enthält einen bundled [Claude Code](https://claude.com/claude-code) Skill unter `skills/xiri-ng-expert/`, der Claude beim Schreiben von Angular-Code mit xiri-ng unterstützt. Der Skill wird **mit jedem Library-Release mit-versioniert**, sodass die Skill-Inhalte (Komponenten-APIs, Interfaces, Patterns) zur installierten Library-Version passen.

### Was der Skill kann

Sobald aktiviert, triggert der Skill automatisch, wenn du Angular-Code schreibst oder Fragen stellst zu:

- **Setup**: `provideXiriServices`, `XiriDataService`, `XiriSnackbarService`, `XiriResponseHandlerService`, Theme + Storage Services
- **`xiri-dyncomponent`**: Rendering von `XiriDynData[]`, alle 27 type-Werte, Custom-Rendering via TemplateRef
- **Formulare**: `XiriFormFieldsComponent`, alle 19 Feldtypen, `showWhen`-Conditional-Visibility, `select`-Directive
- **Tabellen**: `XiriTableComponent` und `XiriRawTableComponent` — Settings, Fields, Server-Side-Pagination, Inline-Edit
- **Komponenten**: Card, Dialog, Stepper, Tabs, Expansion, Timeline, Stat/StatGrid, Page-Header, Toolbar, …
- **Farben/Types**: `XiriColor` (Theme + Extended), `XiriButton`, `XiriButtonResult`, etc.
- **Theming & i18n**: Material Design 3, `ThemeService`-Signals, Locale-Propagation

### Installation — Variante A: via `skills-lock.json`

Wenn dein Projekt den standardisierten `skills-lock.json`-Mechanismus nutzt, trage einen Eintrag ein, der auf einen Release-Tag verweist:

```json
{
  "version": 1,
  "skills": {
    "xiri-ng-expert": {
      "source": "xiriframework/xiri-ng",
      "sourceType": "github",
      "ref": "v0.2.18"
    }
  }
}
```

Ersetze `v0.2.18` durch den Tag, der zu deiner installierten `@xiriframework/xiri-ng`-Version passt (`npm list @xiriframework/xiri-ng`).

### Installation — Variante B: Direkt aus `node_modules`

Weil der Skill nicht im npm-Package liegt (er lebt im Git-Repo), clone oder sparse-checkout das Repo und verlinke den Skill-Ordner:

```bash
# Sparse clone (nur skills/ holen)
git clone --depth 1 --branch v0.2.18 --filter=blob:none --sparse \
  https://github.com/xiriframework/xiri-ng.git /tmp/xiri-ng-skill
cd /tmp/xiri-ng-skill && git sparse-checkout set skills
cd -

# Als Symlink in dein Projekt
mkdir -p .claude/skills
ln -s /tmp/xiri-ng-skill/skills/xiri-ng-expert .claude/skills/xiri-ng-expert

# ODER Kopieren (statisch):
cp -r /tmp/xiri-ng-skill/skills/xiri-ng-expert .claude/skills/
```

### Installation — Variante C: Global als User-Skill

Wenn du xiri-ng in mehreren Projekten nutzt:

```bash
git clone --depth 1 --branch v0.2.18 https://github.com/xiriframework/xiri-ng.git /tmp/xiri-ng
cp -r /tmp/xiri-ng/skills/xiri-ng-expert ~/.claude/skills/
rm -rf /tmp/xiri-ng
```

Aktualisieren nach einem `npm update`: den globalen Skill-Ordner mit dem passenden Tag neu ziehen.

### Skill-Struktur

```
skills/xiri-ng-expert/
├── SKILL.md                    # Navigation + Quick-Refs (always-loaded sobald Skill triggert)
├── references/                  # On-demand (nur wenn Claude liest)
│   ├── setup.md                 # provideXiriServices + alle Services im Detail
│   ├── dyncomponent.md          # xiri-dyncomponent + alle XiriDynData-Typen
│   ├── form-fields.md           # XiriFormFieldsComponent + 19 Feldtypen + showWhen
│   ├── table.md                 # XiriTable + XiriRawTable + Server-Side-Flow
│   ├── components.md            # Kompakt-Signaturen aller weiteren Komponenten
│   └── theming-i18n.md          # XiriColor, ThemeService, Locale-Setup
└── evals/
    └── evals.json               # Test-Prompts für skill-creator
```

### Kompatibilität

Der Skill ist an den Source-Code **dieses Tags** gekoppelt. Skill und Library-Version sollten immer synchron sein.

## License

Apache-2.0
