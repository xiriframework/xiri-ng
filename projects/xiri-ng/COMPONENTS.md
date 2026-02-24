# Xiri NG Components

This document provides a complete reference for the xiri-ng library.

## Overview

**Xiri NG is a JSON-driven component library for Angular SPAs.**

The library is designed around a central component (`xiri-dyncomponent`) that accepts JSON configuration and dynamically renders the appropriate components. This architecture allows you to build entire applications by providing JSON structures, making it ideal for data-driven SPAs where the UI is configured by backend APIs.

### Architecture

```typescript
// Main entry point - pass JSON array to dyncomponent
<xiri-dyncomponent [data]="jsonConfig"></xiri-dyncomponent>

// JSON structure
interface XiriDynData {
  type: string      // Component type to render
  data?: any        // Component-specific settings
  display?: string  // CSS classes for layout
  id?: number       // Optional unique ID
}
```

### Supported Component Types

The library contains 30+ components organized into categories. The dyncomponent supports 17+ component types out of the box:

- **Core Components** - Main functional components (forms, tables, cards, dialogs)
- **Form Field Components** - Individual form input types
- **Layout Components** - Navigation and page structure
- **Utility Components** - Helper components for feedback and dynamic content
- **Services** - Data handling and utility services
- **Pipes** - Data transformation utilities

---

## Dynamic Component - Main Entry Point

### Xiri Dynamic Component (`xiri-dyncomponent`)
**File:** `dyncomponent/dyncomponent.component.ts`
**Selector:** `<xiri-dyncomponent>`

The central component that powers the JSON-driven architecture.

**Inputs:**
- `data: XiriDynData[]` - Array of component configurations (required)
- `filterData?: any` - Optional filter data passed to child components
- `dyncomponent?: TemplateRef<any>` - Optional custom template for unknown types

**Supported Types:**

| Type | Renders | Description |
|------|---------|-------------|
| `card` | `xiri-card` | Data display card with optional actions |
| `table` | `xiri-table` | Full-featured data table |
| `form` | `xiri-form` | Dynamic form with validation |
| `buttonline` | `xiri-buttonline` | Row of action buttons |
| `cardlink` | `xiri-cardlink` | Clickable card with routing |
| `links` | `xiri-links` | Link list component |
| `query` | `xiri-query` | Search/filter component |
| `stepper` | `xiri-stepper` | Multi-step workflow |
| `header` | `xiri-header` | Page header |
| `list` | `xiri-list` | List display |
| `infopoint` | `xiri-infopoint` | Information tooltip |
| `multiprogress` | `xiri-multiprogress` | Multiple progress bars |
| `imagetext` | `xiri-imagetext` | Image with text |
| `container` | Nested `xiri-dyncomponent` | Container for nested components |
| `spacer` | `<div>` | Empty spacer for layout |
| `infotext` | `<div>` | Simple text display |
| `html` | `<div>` | Raw HTML content (sanitized) |

**Example JSON Configuration:**

```json
[
  {
    "type": "header",
    "data": {
      "title": "Dashboard",
      "subtitle": "Welcome back"
    }
  },
  {
    "type": "table",
    "data": {
      "url": "/api/users",
      "fields": [...],
      "actions": [...]
    }
  },
  {
    "type": "form",
    "data": {
      "url": "/api/users/create",
      "fields": [...],
      "buttons": [...]
    }
  }
]
```

**Layout System:**

The `display` property accepts CSS classes for grid layout:
- `xcol` - Full width column
- `xcol-md-6` - Half width on medium screens
- `xcol-md-4` - Third width on medium screens
- `xcol-xl-4` - Third width on extra large screens

---

## Core Components

### Form (`xiri-form`)
**File:** `form/form.component.ts`
**Selector:** `<xiri-form>`

Dynamic form component with automatic field generation and validation.

**Settings Interface:** `XiriFormSettings`
```typescript
{
  load?: boolean          // Auto-load data from URL
  url: string            // API endpoint for form submission
  fields?: any[]         // Form field definitions
  buttons?: XiriButton[] // Action buttons
  header?: string        // Form header text
}
```

**Key Features:**
- Dynamic field rendering
- Built-in loading states
- Error handling
- Success feedback
- Form validation

---

### Table (`xiri-table`)
**File:** `table/table.component.ts`
**Selector:** `<xiri-table>`

Full-featured data table with sorting, filtering, pagination, and selection.

**Settings Interface:** `XiriTableSettings`

**Key Features:**
- Column sorting
- Pagination
- Row selection
- Inline filtering
- Custom actions
- Dialog integration
- Export functionality
- Footer support with aggregations

---

### Raw Table (`xiri-raw-table`)
**File:** `raw-table/xiri-raw-table.component.ts`
**Selector:** `<xiri-raw-table>`

Simplified table component for displaying data without advanced features.

**Settings Interface:** `XiriRawTableSettings`

**Key Features:**
- Basic data display
- Field definitions via `XiriTableField[]`
- Lightweight alternative to full table

---

### Card (`xiri-card`)
**File:** `card/card.component.ts`
**Selector:** `<xiri-card>`

Card component for displaying structured data with optional actions.

**Settings Interface:** `XiriCardSettings`
```typescript
{
  data: any                          // Data to display
  fields?: XiriTableField[]          // Field definitions
  header?: string                    // Card header
  headerSub?: string                 // Card subtitle
  headerIcon?: string                // Material icon name
  headerIconColor?: ThemePalette     // Icon color
  buttons?: XiriButton[]             // Deprecated, use buttonsTop/Bottom
  buttonsTop?: XiriButtonlineSettings    // Top action buttons
  buttonsBottom?: XiriButtonlineSettings // Bottom action buttons
  dense?: number                     // Compact display level
  forceMinWidth?: boolean            // Force minimum width
}
```

---

### Card Link (`xiri-cardlink`)
**File:** `cardlink/cardlink.component.ts`
**Selector:** `<xiri-cardlink>`

Clickable card component with routing support.

---

### Dialog (`xiri-dialog`)
**File:** `dialog/dialog.component.ts`
**Selector:** `<xiri-dialog>`

Modal dialog component for displaying content in overlays.

---

### Query (`xiri-query`)
**File:** `query/query.component.ts`
**Selector:** `<xiri-query>`

Search and filter component for data queries.

---

### Search (`xiri-search`)
**File:** `search/search.component.ts`
**Selector:** `<xiri-search>`

Search input component with debouncing.

---

## Form Field Components

All form field components are located in `formfields/` directory.

### Form Fields Container (`xiri-form-fields`)
**File:** `formfields/form-fields.component.ts`
**Selector:** `<xiri-form-fields>`

Container component that renders multiple form fields dynamically.

**Common Interface:** `XiriFormField` (defined in `formfields/field.interface.ts`)

---

### Date Picker (`xiri-date`)
**File:** `formfields/date/date.component.ts`
**Selector:** `<xiri-date>`

Date input with Material date picker integration using date-fns.

---

### Date Range (`xiri-daterange`)
**File:** `formfields/daterange/daterange.component.ts`
**Selector:** `<xiri-daterange>`

Date range picker with start and end dates.

---

### DateTime Range (`xiri-datetimerange`)
**File:** `formfields/datetimerange/datetimerange.component.ts`
**Selector:** `<xiri-datetimerange>`

Date and time range picker.

---

### File Upload (`xiri-file`)
**File:** `formfields/file/file.component.ts`
**Selector:** `<xiri-file>`

File upload component with drag-and-drop support and multiple file handling.

---

### Select (`xiri-select`)
**File:** `formfields/select/`
**Selector:** `<xiri-select>`

Dropdown select component with search functionality (using ngx-mat-select-search).

---

### Tree Select (`xiri-treeselect`)
**File:** `formfields/treeselect/treeselect.component.ts`
**Selector:** `<xiri-treeselect>`

Hierarchical tree selection component.

---

### Time Limit (`xiri-timelimit`)
**File:** `formfields/timelimit/timelimit.component.ts`
**Selector:** `<xiri-timelimit>`

Time limit input component.

---

### Volume (`xiri-volume`)
**File:** `formfields/volume/volume.component.ts`
**Selector:** `<xiri-volume>`

Volume/capacity input component.

---

### Helper Components
**Directory:** `formfields/helper/`

Helper components for form field functionality.

---

## Layout Components

### Header (`xiri-header`)
**File:** `header/header.component.ts`
**Selector:** `<xiri-header>`

Application header/navbar component.

---

### Sidenav (`xiri-sidenav`)
**File:** `sidenav/sidenav.component.ts`
**Selector:** `<xiri-sidenav>`

Side navigation component.

---

### Stepper (`xiri-stepper`)
**File:** `stepper/stepper.component.ts`
**Selector:** `<xiri-stepper>`

Multi-step workflow/wizard component.

---

### Button (`xiri-button`)
**File:** `button/button.component.ts`
**Selector:** `<xiri-button>`

Button component with loading states and action handling.

**Interface:** `XiriButton`

---

### Button Line (`xiri-buttonline`)
**File:** `buttonline/buttonline.component.ts`
**Selector:** `<xiri-buttonline>`

Container for multiple buttons with consistent spacing.

**Settings Interface:** `XiriButtonlineSettings`

---

### Button Style (`xiri-buttonstyle`)
**File:** `buttonstyle/buttonstyle.component.ts`
**Selector:** `<xiri-buttonstyle>`

Styled button wrapper component.

---

### Image Text (`xiri-imagetext`)
**File:** `imagetext/imagetext.component.ts`
**Selector:** `<xiri-imagetext>`

Component combining images with text content.

---

### Info Point (`xiri-infopoint`)
**File:** `infopoint/infopoint.component.ts`
**Selector:** `<xiri-infopoint>`

Information tooltip/popover component.

---

### Links (`xiri-links`)
**File:** `links/links.component.ts`
**Selector:** `<xiri-links>`

Link list component.

---

### List (`xiri-list`)
**File:** `list/list.component.ts`
**Selector:** `<xiri-list>`

List display component.

---

## Utility Components

### Alert (`xiri-alert`)
**File:** `alert/alert.component.ts`
**Selector:** `<xiri-alert>`

Alert message component for displaying notifications.

---

### Error (`xiri-error`)
**File:** `error/error.component.ts`
**Selector:** `<xiri-error>`

Error message display component.

---

### Done (`xiri-done`)
**File:** `done/done.component.ts`
**Selector:** `<xiri-done>`

Success message component.

---

### Dynamic Component (`xiri-dyncomponent`)
**File:** `dyncomponent/dyncomponent.component.ts`
**Selector:** `<xiri-dyncomponent>`

Dynamic component loader for runtime component instantiation.

**Interface:** `XiriDynData` (defined in `dyncomponent/dyndata.interface.ts`)

---

### Multi Progress (`xiri-multiprogress`)
**File:** `multiprogress/multiprogress.component.ts`
**Selector:** `<xiri-multiprogress>`

Multiple progress indicators component.

---

## Services

All services are located in `services/` directory.

### Data Service (`XiriDataService`)
**File:** `services/data.service.ts`

Core service for HTTP data operations with configurable endpoints.

**Features:**
- GET, POST, PUT, DELETE operations
- Configurable base URLs via `forRoot()`
- Error handling
- Observable-based

---

### Form Service (`XiriFormService`)
**File:** `services/form.service.ts`

Service for managing form state and operations.

**Interfaces:**
- `XiriFormServiceData`
- `XiriFormServiceError`

---

### Date Service (`XiriDateService`)
**File:** `services/date.service.ts`

Utilities for date manipulation and formatting using date-fns.

---

### Number Service (`XiriNumberService`)
**File:** `services/number.service.ts`

Number formatting and manipulation utilities.

---

### Download Service (`XiriDownloadService`)
**File:** `services/download.service.ts`

File download utilities.

---

### Local Storage Service (`XiriLocalStorageService`)
**File:** `services/localStorage.service.ts`

Type-safe localStorage wrapper.

---

### Session Storage Service (`XiriSessionStorageService`)
**File:** `services/sessionStorage.service.ts`

Type-safe sessionStorage wrapper.

---

## Pipes

All pipes are located in `pipes/` directory.

### Available Pipes:
- Safe HTML pipe for sanitizing HTML content
- Additional transformation pipes

---

## Shared Interfaces

### XiriButton
**File:** `button/button.component.ts`

Button configuration interface used across components.

**Result Interface:** `XiriButtonResult`

---

### XiriTableField
**File:** `raw-table/tabefield.interface.ts`

Field definition for table columns and card data display.

---

### XiriFormField
**File:** `formfields/field.interface.ts`

Form field definition interface for dynamic form generation.

---

### XiriDynData
**File:** `dyncomponent/dyndata.interface.ts`

Data interface for dynamic component loading.

---

## Component Count Summary

- **Core Components:** 9
- **Form Field Components:** 9
- **Layout Components:** 10
- **Utility Components:** 5
- **Services:** 7
- **Total:** 40+ components and services

---

## Notes

- All components use Angular 20.1+ features (signals, input/output)
- Components follow standalone component architecture
- Material Design 3 theming integration
- Fully typed with TypeScript
- OnPush change detection where applicable
