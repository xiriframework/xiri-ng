# Xiri NG REST API Specification

This document provides precise JSON schemas for backend REST API implementation to work with the xiri-ng library.

## Table of Contents

1. [Overview](#overview)
2. [Main Entry Point](#main-entry-point)
3. [Table Component API](#table-component-api)
4. [Form Component API](#form-component-api)
5. [Query Component API](#query-component-api)
6. [Button Actions API](#button-actions-api)
7. [Data Type Definitions](#data-type-definitions)

---

## Overview

The xiri-ng library is JSON-driven. Components expect specific JSON structures from REST API endpoints. This document specifies the exact format required for each component type.

### General Conventions

- **All dates are Unix timestamps in seconds** (not ISO strings): `1736899200`
- All endpoints should return JSON with `Content-Type: application/json`
- Error responses should follow the format: `{"error": "Error message here"}`
- HTTP status codes: `200` for success, `400` for client errors, `500` for server errors

---

## Main Entry Point

The main entry point is `xiri-dyncomponent` which accepts an array of component configurations.

### XiriDynData Structure

```typescript
{
  "type": string,        // Required: Component type
  "data": object,        // Optional: Component-specific data
  "display": string,     // Optional: CSS classes for layout
  "id": number          // Optional: Unique ID (auto-generated if omitted)
}
```

### Supported Type Values

- `"card"` - Data display card
- `"table"` - Data table with pagination
- `"form"` - Dynamic form
- `"buttonline"` - Action buttons
- `"cardlink"` - Clickable navigation card
- `"links"` - Link list
- `"query"` - Search/filter component
- `"stepper"` - Multi-step workflow
- `"header"` - Page header
- `"list"` - List display
- `"infopoint"` - Information tooltip
- `"multiprogress"` - Progress indicators
- `"imagetext"` - Image with text
- `"container"` - Nested components
- `"spacer"` - Empty space
- `"infotext"` - Simple text
- `"html"` - Raw HTML content

---

## Table Component API

### Endpoint Pattern

**Without Filters:**
```
GET /api/resource
```

**With Filters (hasFilter: true):**
```
POST /api/resource
Content-Type: application/json

{filter data object}
```

### Request (POST with filters)

```json
{
  "search": "search term",
  "status": "active",
  "dateFrom": "2025-01-01",
  "dateTo": "2025-12-31",
  ...additional filter fields
}
```

### Response Structure

```json
{
  "data": [...],           // Required: Array of table rows
  "fields": [...],         // Optional: Field definitions (can be in component config instead)
  "summary": [...],        // Optional: Summary components to display above table
  "components": [...],     // Optional: Additional components to display
  "footer": {...}          // Optional: Footer data for aggregations
}
```

### Complete Response Example

```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "status": "active",
      "created": "2025-01-15T10:30:00Z",
      "balance": 1250.50
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "status": "inactive",
      "created": "2025-02-10T14:20:00Z",
      "balance": 890.00
    }
  ],
  "fields": [
    {
      "id": "id",
      "name": "ID",
      "format": "text",
      "width": "80px",
      "sort": false,
      "search": false
    },
    {
      "id": "name",
      "name": "Name",
      "format": "text",
      "sort": true,
      "search": true
    },
    {
      "id": "email",
      "name": "Email",
      "format": "text",
      "sort": true,
      "search": true
    },
    {
      "id": "status",
      "name": "Status",
      "format": "text",
      "sort": true,
      "search": true
    },
    {
      "id": "created",
      "name": "Created",
      "format": "date",
      "sort": true,
      "search": false
    },
    {
      "id": "balance",
      "name": "Balance",
      "format": "number",
      "sort": true,
      "search": false,
      "align": "right",
      "textPrefix": "$",
      "footer": "sum",
      "webformat": "2"
    }
  ],
  "footer": {
    "balance": 2140.50
  }
}
```

### XiriTableField Schema

```typescript
{
  "id": string,                    // Required: Data property key
  "name": string,                  // Required: Display label
  "format": string,                // Optional: "text"|"date"|"number"|"icon"|"html"|"input"|"buttons"|"linkrow"|"header"|"id"
  "search": boolean,               // Optional: Default true - Enable search
  "sort": boolean,                 // Optional: Default true - Enable sorting
  "buttons": XiriButton[],         // Optional: Action buttons for this field
  "icons": Array<{                 // Optional: Icons to display
    "icon": string,
    "color": string,
    "hint": string
  }>,
  "display": string,               // Optional: CSS classes
  "header": string,                // Optional: Custom header text
  "sticky": boolean,               // Optional: Sticky column
  "inputType": string,             // Optional: For editable fields
  "inputRequired": boolean,        // Optional: For editable fields
  "inputLang": string,             // Optional: Language for input
  "inputPaste": boolean,           // Optional: Allow paste from Excel
  "textPrefix": string,            // Optional: Text before value (e.g., "$")
  "textSuffix": string,            // Optional: Text after value (e.g., "kg")
  "width": string,                 // Optional: Column width (e.g., "120px")
  "minWidth": string,              // Optional: Minimum width
  "hide": boolean,                 // Optional: Hide column
  "headerSpan": number,            // Optional: Header colspan
  "align": "left"|"center"|"right", // Optional: Text alignment
  "footer": "no"|"count"|"sum"|"static", // Optional: Footer aggregation
  "webformat": string              // Optional: Number format (e.g., "2" for 2 decimals)
}
```

### Special Data Formats

#### Number Fields (format: "number")
Return as array: `[display_value, sort_value]`
```json
{
  "balance": ["$1,250.50", 1250.50]
}
```

#### Icon Fields (format: "icon")
Data value is an index into the `icons` array defined in field:
```json
// Field definition:
{
  "id": "status",
  "name": "Status",
  "format": "icon",
  "icons": [
    {"icon": "done"},                    // index 0
    {"icon": "close", "color": "warn"}   // index 1
  ]
}

// Row data:
{
  "status": 0  // Shows "done" icon
}
{
  "status": 1  // Shows "close" icon with warn color
}
```

#### HTML Fields (format: "html")
Raw HTML content (sanitized):
```json
{
  "content": "<b>Bold text</b> with <a href='/link'>link</a>"
}
```

#### Input Fields (format: "input")
Editable table cells:
```json
// Field definition:
{
  "id": "price",
  "name": "Price",
  "format": "input",
  "inputType": "number",
  "inputLang": "de",
  "inputPaste": true  // Allow paste from Excel
}

// Row data - normal value:
{
  "price": 12.99
}
```

#### Button Fields (format: "buttons")
Action buttons in table cells. Data is array where first element is boolean (show/hide):
```json
// Field definition:
{
  "id": "actions",
  "name": "Actions",
  "format": "buttons",
  "buttons": [
    {
      "type": "icon",
      "action": "api",
      "icon": "edit",
      "hint": "Edit",
      "color": "primary"
    }
  ]
}

// Row data:
{
  "actions": [true, "additional data"]  // Show button
}
{
  "actions": [false, false]  // Hide button
}
{
  "actions": []  // Hide button
}
```

#### Link Row Fields (format: "linkrow")
Clickable row with icon and link:
```json
// Field definition:
{
  "id": "link",
  "name": "Link",
  "format": "linkrow"
}

// Row data:
{
  "text": "Link text to display",
  "textLink": "/path/to/navigate",
  "icon": "home"  // Optional Material icon
}
```

#### Link Fields with Buttons
Return URL in nested array:
```json
{
  "actions": ["Label", "/api/action/123"]
}
```

#### Footer Aggregations
- `"count"`: Count of visible rows (calculated client-side)
- `"sum"`: Sum of values (calculated client-side or sent in footer object)
- `"static"`: Static value provided in footer object

---

## Form Component API

### Endpoint for Form Data Loading (GET)

**Request:**
```
GET /api/form/edit/123
```

**Response:**
```json
{
  "fields": [...],         // Required: Form field definitions with values
  "buttons": [...],        // Required: Action buttons
  "url": "/api/form/submit", // Optional: Override submit URL
  "extra": {...}           // Optional: Extra data to include in submission
}
```

### Endpoint for Form Submission (POST)

**Request:**
```
POST /api/form/submit
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": 2,
  "active": true,
  ...field values
}
```

**Success Response:**
```json
{
  "done": true,
  "message": "User created successfully"
}
```

**Or redirect response:**
```json
{
  "goto": "/users/123",
  "message": "User updated successfully"
}
```

**Or reload response:**
```json
{
  "refresh": "page"
}
```

**Error Response (HTTP 400):**
```json
{
  "error": "Email address already exists"
}
```

### XiriFormField Schema

```typescript
{
  "id": string,                    // Required: Form control name
  "type": string,                  // Required: Field type (see below)
  "subtype": string,               // Optional: Field subtype
  "name": string,                  // Optional: Field label
  "hint": string,                  // Optional: Help text below field
  "class": string,                 // Optional: CSS classes
  "textPrefix": string,            // Optional: Text before input
  "textSuffix": string,            // Optional: Text after input
  "iconPrefix": string,            // Optional: Icon before input
  "iconSuffix": string,            // Optional: Icon after input
  "locale": string,                // Optional: Locale for formatting
  "value": any,                    // Optional: Initial/current value
  "validations": Array<{           // Optional: Validation rules
    "id": string,
    "name": string,
    "message": string,
    "validator": any
  }>,
  "list": Array<{                  // Optional: Options for select fields
    "id": number|string,
    "name": string,
    "disabled": boolean
  }>,
  "texts": object,                 // Optional: Custom text labels
  "hide": boolean,                 // Optional: Hide field
  "required": boolean,             // Optional: Required field
  "disabled": boolean,             // Optional: Disabled field
  "min": number,                   // Optional: Min value (number/date)
  "max": number,                   // Optional: Max value (number/date)
  "pattern": string,               // Optional: Regex validation
  "multiple": boolean,             // Optional: Multiple selection
  "url": string,                   // Optional: URL for loading options
  "search": boolean,               // Optional: Enable search in select
  "serverSideSearch": boolean,     // Optional: Server-side search
  "params": object,                // Optional: Additional parameters
  "rows": number,                  // Optional: Textarea rows
  "accept": string,                // Optional: File accept types
  "pwdhide": boolean,              // Optional: Password hide toggle
  "icon": string,                  // Optional: Field icon
  "iconColor": string,             // Optional: Icon color
  "done": boolean,                 // Optional: Completion state
  "placeholder": string            // Optional: Placeholder text
}
```

### Supported Field Types

- `"text"` - Text input
- `"email"` - Email input (standalone type, not subtype)
- `"password"` - Password input
- `"number"` - Number input
- `"textarea"` - Multi-line text
- `"bool"` - Boolean checkbox
- `"select"` - Dropdown select (single selection)
- `"multiselect"` - Multiple select
- `"treeselect"` - Hierarchical tree select
- `"date"` - Date picker (date only)
- `"datetime"` - Date and time picker (standalone type)
- `"daterange"` - Date range picker
- `"datetimerange"` - Date and time range
- `"timelimit"` - Time limit input
- `"file"` - File upload
- `"volume"` - Volume input
- `"info"` - Info text (display only)
- `"header"` - Section header (display only)
- `"html"` - HTML content (display only)
- `"question"` - Question/warning display
- `"waiting"` - Loading/completion indicator

**Note:** All date/time values use **Unix timestamps in seconds**, not ISO strings.

### Form Field Value Examples

```json
{
  "fields": [
    {
      "id": "name",
      "type": "text",
      "name": "Full Name",
      "required": true,
      "value": "John Doe"
    },
    {
      "id": "email",
      "type": "email",
      "name": "Email Address",
      "required": true,
      "value": "john@example.com"
    },
    {
      "id": "role",
      "type": "select",
      "name": "Role",
      "required": true,
      "value": 2,
      "list": [
        {"id": 1, "name": "User"},
        {"id": 2, "name": "Admin"},
        {"id": 3, "name": "Manager"}
      ]
    },
    {
      "id": "active",
      "type": "bool",
      "name": "Active",
      "value": true
    },
    {
      "id": "birthdate",
      "type": "date",
      "name": "Birth Date",
      "value": 1609459200,
      "min": 631152000,
      "max": 1767225600
    },
    {
      "id": "appointment",
      "type": "datetime",
      "name": "Appointment",
      "value": 1736959200,
      "required": true
    },
    {
      "id": "bio",
      "type": "textarea",
      "name": "Biography",
      "rows": 5,
      "value": "User biography text..."
    },
    {
      "id": "dateRange",
      "type": "daterange",
      "name": "Date Range",
      "value": {
        "start": 1735689600,
        "end": 1767225600
      }
    },
    {
      "id": "datetimeRange",
      "type": "datetimerange",
      "name": "Event Time",
      "value": {
        "start": 1736931600,
        "end": 1736960400
      }
    },
    {
      "id": "files",
      "type": "file",
      "name": "Attachments",
      "multiple": true,
      "accept": ".pdf,.doc,.docx"
    }
  ]
}
```

---

## Query Component API

The query component is used for search/filter interfaces that dynamically load results.

### Endpoint

```
POST /api/query
Content-Type: application/json
```

### Request

```json
{
  "search": "search term",
  "category": 5,
  "dateFrom": "2025-01-01",
  "dateTo": "2025-12-31",
  ...filter field values
}
```

### Response

The response should be an array of `XiriDynData` objects that will be rendered dynamically:

```json
[
  {
    "type": "header",
    "data": {
      "text": "Search Results",
      "color": "primary",
      "size": "large"
    }
  },
  {
    "type": "table",
    "data": {
      "data": [...],
      "fields": [...]
    }
  }
]
```

### XiriQuerySettings (in component config)

```typescript
{
  "url": string,                   // Optional: API endpoint
  "fields": XiriFormField[],       // Optional: Filter form fields
  "dyn": XiriDynData[],            // Optional: Static components to display
  "buttonline": XiriDynData,       // Optional: Buttonline component
  "extra": object,                 // Optional: Extra data to send with requests
  "saveState": boolean,            // Optional: Save filter state
  "saveStateId": string            // Optional: State ID for saving
}
```

---

## Button Actions API

Buttons can trigger various actions including API calls.

### XiriButton Schema

```typescript
{
  "text": string,                  // Required: Button text
  "type": string,                  // Required: Button type (see below)
  "action": string,                // Required: Action type (see below)
  "default": boolean,              // Optional: Default button
  "url": string,                   // Optional: API endpoint
  "hide": boolean,                 // Optional: Hide button
  "color": "primary"|"accent"|"warn"|"tertiary", // Optional: Button color
  "icon": string,                  // Optional: Material icon name
  "iconColor": "primary"|"accent"|"warn", // Optional: Icon color
  "fontIcon": string,              // Optional: Font icon name
  "fontSet": string,               // Optional: Font icon set
  "class": string,                 // Optional: CSS classes
  "hint": string,                  // Optional: Tooltip text
  "tabIndex": number,              // Optional: Tab index
  "inline": boolean,               // Optional: Inline display
  "disabled": boolean,             // Optional: Disabled state
  "data": object,                  // Optional: Additional data to send
  "target": string,                // Optional: Link target
  "loading": boolean,              // Optional: Loading state
  "filename": string,              // Optional: Download filename
  "check": string[],               // Optional: Fields to check before action
  "send": string[]                 // Optional: Fields to send in action
}
```

### Button Types

- `"raised"` - Raised button (Material filled button)
- `"flat"` - Flat button (no elevation)
- `"basic"` - Basic button (text only)
- `"stroked"` - Stroked button (outlined)
- `"icon"` - Icon button (icon only, circular)
- `"icontext"` - Icon with text button
- `"fab"` - Floating action button (large circular)
- `"minifab"` - Mini floating action button (small circular)

### Button Colors

- `"primary"` - Primary theme color
- `"accent"` - Accent theme color
- `"warn"` - Warning/danger color
- `"tertiary"` - Tertiary theme color (if defined)

### Button Actions

- `"api"` - Make API POST call to button.url with data
- `"dialog"` - Open dialog with content loaded from button.url
- `"download"` - Download file from button.url (POST)
- `"link"` - Navigate to internal route using Angular router
- `"href"` - External link (opens in new window/tab with target)
- `"back"` - Navigate back in browser history
- `"close"` - Close current dialog/form
- `"return"` - Return to previous page
- `"debug"` - Debug output to console (development only)
- `"simulate"` - Simulate action (development only)

### Button Action Examples

**Link (Internal Navigation):**
```json
{
  "text": "Go to Form",
  "type": "raised",
  "action": "link",
  "url": "/Form",
  "color": "primary"
}
```

**Href (External Link):**
```json
{
  "text": "Open Google",
  "type": "raised",
  "action": "href",
  "url": "https://www.google.com",
  "target": "_blank",
  "color": "accent"
}
```

**API Call:**
```json
{
  "text": "Submit",
  "type": "raised",
  "action": "api",
  "url": "/api/submit",
  "color": "primary",
  "icon": "save"
}
```

**Dialog:**
```json
{
  "text": "Details",
  "type": "raised",
  "action": "dialog",
  "url": "/api/details/123",
  "hint": "View details"
}
```

**Download:**
```json
{
  "text": "Export",
  "type": "raised",
  "action": "download",
  "url": "/api/export",
  "filename": "export.csv",
  "color": "accent"
}
```

### API Action Endpoint

**Request:**
```
POST {button.url}
Content-Type: application/json

{
  ...filterData,
  ...button.data
}
```

**Response:**
```json
{
  "refresh": "table",              // Refresh table
  "message": "Action completed"
}
```

**Or:**
```json
{
  "refresh": "page"                // Refresh entire page
}
```

**Or:**
```json
{
  "goto": "/path/to/page"          // Navigate to URL
}
```

**Or for table row updates:**
```json
{
  "update": "table",
  "id": 123,
  "field": "status",
  "content": "active"
}
```

### Download Action Endpoint

**Request:**
```
POST {button.url}
Content-Type: application/json

{
  ...filterData,
  ...button.data
}
```

**Response:**
```
Content-Type: application/octet-stream (or text/csv, etc.)
Content-Disposition: attachment; filename="export.csv"

...file content...
```

### Dialog Action Endpoint

**Request:**
```
GET {button.url}
```

**Response:** Returns XiriDynData array for dialog content
```json
[
  {
    "type": "form",
    "data": {
      "url": "/api/submit",
      "fields": [...],
      "buttons": [...]
    }
  }
]
```

---

## Data Type Definitions

### Date/Time Format

All dates should use ISO 8601 format:
- Date: `"2025-01-15"`
- DateTime: `"2025-01-15T14:30:00Z"`
- DateTime with timezone: `"2025-01-15T14:30:00+01:00"`

### Number Format

For display purposes, numbers can be sent as arrays:
```json
{
  "value": ["1,234.56", 1234.56]
}
```
Where:
- Index 0: Formatted display string
- Index 1: Raw numeric value for sorting/calculations

### Boolean Values

Use JSON boolean: `true` or `false`

### Null Values

Use JSON `null` for empty/null values

---

## Complete API Examples

### Example 1: Dashboard Page

**Endpoint:** `GET /api/dashboard`

**Response:**
```json
[
  {
    "type": "header",
    "data": {
      "text": "Dashboard",
      "color": "primary",
      "size": "large"
    }
  },
  {
    "type": "card",
    "display": "xcol-md-4",
    "data": {
      "header": "Total Users",
      "headerIcon": "people",
      "headerIconColor": "primary",
      "data": {
        "count": 1247,
        "change": "+12%"
      },
      "fields": [
        {"id": "count", "name": "Total", "format": "number"},
        {"id": "change", "name": "Change", "format": "text"}
      ]
    }
  },
  {
    "type": "table",
    "data": {
      "url": "/api/users",
      "fields": [
        {"id": "id", "name": "ID", "format": "text", "width": "80px"},
        {"id": "name", "name": "Name", "format": "text", "sort": true},
        {"id": "email", "name": "Email", "format": "text", "sort": true},
        {"id": "created", "name": "Created", "format": "date", "sort": true}
      ]
    }
  }
]
```

### Example 2: User Edit Form

**Endpoint:** `GET /api/users/123/edit`

**Response:**
```json
{
  "fields": [
    {
      "id": "id",
      "type": "text",
      "name": "ID",
      "value": 123,
      "disabled": true
    },
    {
      "id": "name",
      "type": "text",
      "name": "Full Name",
      "required": true,
      "value": "John Doe"
    },
    {
      "id": "email",
      "type": "email",
      "name": "Email",
      "required": true,
      "value": "john@example.com"
    },
    {
      "id": "role",
      "type": "select",
      "name": "Role",
      "required": true,
      "value": 2,
      "list": [
        {"id": 1, "name": "User"},
        {"id": 2, "name": "Admin"},
        {"id": 3, "name": "Manager"}
      ]
    },
    {
      "id": "active",
      "type": "checkbox",
      "name": "Active",
      "value": true
    }
  ],
  "buttons": [
    {
      "text": "Save",
      "type": "raised",
      "action": "api",
      "url": "/api/users/123",
      "color": "primary",
      "icon": "save"
    },
    {
      "text": "Cancel",
      "type": "flat",
      "action": "back"
    }
  ]
}
```

**Form Submission:** `POST /api/users/123`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": 2,
  "active": true
}
```

**Response:**
```json
{
  "refresh": "page",
  "message": "User updated successfully"
}
```

### Example 3: Search Interface with Query Component

**Component Config (sent from backend):**
```json
{
  "type": "query",
  "data": {
    "url": "/api/search",
    "saveState": true,
    "saveStateId": "product-search",
    "fields": [
      {
        "id": "search",
        "type": "text",
        "name": "Search",
        "placeholder": "Search products..."
      },
      {
        "id": "category",
        "type": "select",
        "name": "Category",
        "list": [
          {"id": 0, "name": "All Categories"},
          {"id": 1, "name": "Electronics"},
          {"id": 2, "name": "Clothing"},
          {"id": 3, "name": "Books"}
        ]
      },
      {
        "id": "priceRange",
        "type": "daterange",
        "name": "Date Range"
      }
    ]
  }
}
```

**Search Request:** `POST /api/search`
```json
{
  "search": "laptop",
  "category": 1,
  "priceRange": {
    "from": "2025-01-01",
    "to": "2025-12-31"
  }
}
```

**Search Response:**
```json
[
  {
    "type": "header",
    "data": {
      "text": "Found 42 results",
      "color": "primary",
      "size": "medium"
    }
  },
  {
    "type": "table",
    "data": {
      "data": [
        {
          "id": 1,
          "name": "Dell Laptop XPS 15",
          "price": ["$1,299.00", 1299.00],
          "category": "Electronics",
          "inStock": true
        },
        {
          "id": 2,
          "name": "HP Laptop Pavilion",
          "price": ["$899.00", 899.00],
          "category": "Electronics",
          "inStock": true
        }
      ],
      "fields": [
        {"id": "id", "name": "ID", "format": "text", "width": "80px"},
        {"id": "name", "name": "Product", "format": "text", "sort": true},
        {"id": "price", "name": "Price", "format": "number", "sort": true, "align": "right"},
        {"id": "category", "name": "Category", "format": "text", "sort": true},
        {"id": "inStock", "name": "In Stock", "format": "text"}
      ]
    }
  }
]
```

---

## Error Handling

### Standard Error Response

All endpoints should return errors in this format:

**HTTP 400 Bad Request:**
```json
{
  "error": "Invalid email address format"
}
```

**HTTP 401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**HTTP 403 Forbidden:**
```json
{
  "error": "You don't have permission to access this resource"
}
```

**HTTP 404 Not Found:**
```json
{
  "error": "User not found"
}
```

**HTTP 500 Internal Server Error:**
```json
{
  "error": "An unexpected error occurred. Please try again later."
}
```

### Field-Level Validation Errors

For form validation errors, you can return:

```json
{
  "error": "Validation failed",
  "fields": {
    "email": "Email address already exists",
    "password": "Password must be at least 8 characters"
  }
}
```

---

## Summary

This specification provides all necessary JSON structures for implementing a backend REST API compatible with xiri-ng. Key points:

1. **Tables**: Return `{data: [...], fields: [...], footer: {...}}` format
2. **Forms**: Return `{fields: [...], buttons: [...]}` for loading, accept field values for submission
3. **Buttons**: Support various actions via `action` property, API calls via `"api"` action
4. **Queries**: Accept filter data, return `XiriDynData[]` arrays for dynamic rendering
5. **Errors**: Always use `{"error": "message"}` format with appropriate HTTP status codes

All components are designed to work with JSON configuration, making the frontend completely data-driven and backend-controlled.
