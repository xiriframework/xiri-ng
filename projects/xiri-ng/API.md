# Xiri NG API Reference

This document provides detailed API and JSON structure documentation for the xiri-ng library.

## Table of Contents

- [Getting Started](#getting-started)
- [XiriDynData Interface](#xiridyndata-interface)
- [Component Types](#component-types)
  - [Card](#card)
  - [Table](#table)
  - [Form](#form)
  - [Button Line](#button-line)
  - [Query](#query)
  - [Header](#header)
  - [Stepper](#stepper)
  - [Links](#links)
  - [Card Link](#card-link)
  - [List](#list)
  - [Info Point](#info-point)
  - [Multi Progress](#multi-progress)
  - [Image Text](#image-text)
  - [Container](#container)
  - [Spacer](#spacer)
  - [Info Text](#info-text)
  - [HTML](#html)
- [Form Field Types](#form-field-types)
- [Shared Interfaces](#shared-interfaces)

---

## Getting Started

The xiri-ng library is designed to be driven by JSON configuration. The main entry point is the `xiri-dyncomponent`:

```html
<xiri-dyncomponent [data]="componentConfig"></xiri-dyncomponent>
```

Where `componentConfig` is an array of `XiriDynData` objects.

---

## XiriDynData Interface

The base interface for all component configurations:

```typescript
interface XiriDynData {
  type: string      // Component type identifier
  data?: any        // Component-specific settings/data
  display?: string  // CSS classes for layout (e.g., "xcol-md-6")
  id?: number       // Optional unique identifier (auto-generated if omitted)
}
```

---

## Component Types

### Card

**Type:** `"card"`

Displays structured data in a card format with optional actions.

**Data Interface:** `XiriCardSettings`

```typescript
{
  data: any                           // Object containing data to display
  fields?: XiriTableField[]           // Field definitions for data display
  header?: string                     // Card header text
  headerSub?: string                  // Card subtitle text
  headerIcon?: string                 // Material icon name
  headerIconColor?: ThemePalette      // Icon color: 'primary' | 'accent' | 'warn'
  buttonsTop?: XiriButtonlineSettings // Top action buttons
  buttonsBottom?: XiriButtonlineSettings // Bottom action buttons
  dense?: number                      // Compact display level (0-2)
  forceMinWidth?: boolean             // Force minimum width constraint
}
```

**Example:**

```json
{
  "type": "card",
  "display": "xcol-md-6",
  "data": {
    "header": "User Profile",
    "headerIcon": "person",
    "headerIconColor": "primary",
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Admin"
    },
    "fields": [
      { "key": "name", "label": "Name" },
      { "key": "email", "label": "Email" },
      { "key": "role", "label": "Role" }
    ],
    "buttonsBottom": {
      "buttons": [
        { "label": "Edit", "icon": "edit", "action": "edit" }
      ]
    }
  }
}
```

---

### Table

**Type:** `"table"`

Full-featured data table with sorting, filtering, pagination, and actions.

**Data Interface:** `XiriTableSettings`

```typescript
{
  url: string                         // API endpoint for data
  fields: XiriTableField[]            // Column definitions
  actions?: XiriButton[]              // Row-level actions
  buttons?: XiriButtonlineSettings    // Table-level actions
  header?: string                     // Table header
  selection?: 'single' | 'multi'      // Row selection mode
  pageSize?: number                   // Items per page (default: 25)
  pageSizeOptions?: number[]          // Available page size options
  sortActive?: string                 // Default sort column
  sortDirection?: 'asc' | 'desc'      // Default sort direction
  filter?: boolean                    // Enable column filtering
  footer?: boolean                    // Enable footer with aggregations
  footerData?: any                    // Footer data (returned from API)
  reload$?: Observable<void>          // Observable to trigger table reload
  extraData?: any                     // Additional data sent with requests
}
```

**Expected API Response:**

```typescript
{
  data: any[]           // Array of table rows
  total: number         // Total count for pagination
  footer?: any          // Optional footer data for aggregations
}
```

**Example:**

```json
{
  "type": "table",
  "data": {
    "url": "/api/users",
    "header": "User List",
    "pageSize": 25,
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "text"
      },
      {
        "key": "name",
        "label": "Name",
        "type": "text",
        "sortable": true
      },
      {
        "key": "email",
        "label": "Email",
        "type": "text",
        "sortable": true
      },
      {
        "key": "created",
        "label": "Created",
        "type": "date",
        "sortable": true
      }
    ],
    "actions": [
      {
        "label": "Edit",
        "icon": "edit",
        "action": "edit"
      },
      {
        "label": "Delete",
        "icon": "delete",
        "action": "delete",
        "color": "warn"
      }
    ],
    "buttons": {
      "buttons": [
        {
          "label": "Add User",
          "icon": "add",
          "action": "create",
          "color": "primary"
        }
      ]
    }
  }
}
```

---

### Form

**Type:** `"form"`

Dynamic form component with automatic field rendering and validation.

**Data Interface:** `XiriFormSettings`

```typescript
{
  url: string                // API endpoint for form submission
  load?: boolean             // Load existing data from URL (for edit forms)
  fields?: XiriFormField[]   // Form field definitions
  buttons?: XiriButton[]     // Action buttons
  header?: string            // Form header (displayed in card)
}
```

**Form Submission:**
- GET request to `url` if `load: true` to fetch existing data
- POST request to `url` with form data on submit

**Example:**

```json
{
  "type": "form",
  "data": {
    "url": "/api/users/create",
    "header": "Create User",
    "fields": [
      {
        "key": "name",
        "label": "Full Name",
        "type": "text",
        "required": true
      },
      {
        "key": "email",
        "label": "Email Address",
        "type": "email",
        "required": true
      },
      {
        "key": "role",
        "label": "Role",
        "type": "select",
        "options": [
          { "value": "admin", "label": "Administrator" },
          { "value": "user", "label": "User" }
        ]
      },
      {
        "key": "active",
        "label": "Active",
        "type": "checkbox"
      }
    ],
    "buttons": [
      {
        "label": "Create",
        "action": "submit",
        "color": "primary"
      },
      {
        "label": "Cancel",
        "action": "cancel"
      }
    ]
  }
}
```

---

### Button Line

**Type:** `"buttonline"`

Row of action buttons with consistent spacing.

**Data Interface:** `XiriButtonlineSettings`

```typescript
{
  buttons: XiriButton[]    // Array of button configurations
  align?: 'start' | 'center' | 'end'  // Button alignment
}
```

**Example:**

```json
{
  "type": "buttonline",
  "data": {
    "buttons": [
      {
        "label": "Save",
        "icon": "save",
        "action": "save",
        "color": "primary"
      },
      {
        "label": "Cancel",
        "icon": "cancel",
        "action": "cancel"
      }
    ],
    "align": "end"
  }
}
```

---

### Query

**Type:** `"query"`

Search and filter component that dynamically renders results.

**Data Interface:** `XiriQuerySettings`

```typescript
{
  url: string                // API endpoint for search
  searchFields?: string[]    // Fields to search in
  filters?: any[]            // Filter definitions
  resultComponent?: any      // Component to render results
}
```

**Expected API Response:**

Results are passed to a nested dyncomponent for rendering.

**Example:**

```json
{
  "type": "query",
  "data": {
    "url": "/api/search",
    "searchFields": ["name", "email", "description"]
  }
}
```

---

### Header

**Type:** `"header"`

Page header component.

**Data Interface:** `XiriHeaderSettings`

```typescript
{
  title?: string         // Main title
  subtitle?: string      // Subtitle
  icon?: string          // Material icon name
  buttons?: XiriButton[] // Header action buttons
}
```

**Example:**

```json
{
  "type": "header",
  "data": {
    "title": "Dashboard",
    "subtitle": "Welcome back, John",
    "icon": "dashboard",
    "buttons": [
      {
        "label": "Settings",
        "icon": "settings",
        "action": "settings"
      }
    ]
  }
}
```

---

### Stepper

**Type:** `"stepper"`

Multi-step workflow component.

**Data Interface:** `XiriStepperSettings`

```typescript
{
  steps: Array<{
    label: string          // Step label
    content: any           // Step content (can be dyncomponent data)
    completed?: boolean    // Step completion status
  }>
  linear?: boolean         // Require sequential completion
}
```

**Example:**

```json
{
  "type": "stepper",
  "data": {
    "linear": true,
    "steps": [
      {
        "label": "Personal Information",
        "content": { ... }
      },
      {
        "label": "Contact Details",
        "content": { ... }
      },
      {
        "label": "Review",
        "content": { ... }
      }
    ]
  }
}
```

---

### Links

**Type:** `"links"`

Display a list of links.

**Data Interface:** `XiriLinksSettings`

```typescript
{
  title?: string         // Links section title
  links: Array<{
    label: string        // Link text
    url?: string         // External URL
    routerLink?: string  // Internal route
    icon?: string        // Material icon
  }>
}
```

**Example:**

```json
{
  "type": "links",
  "display": "xcol-md-4",
  "data": {
    "title": "Quick Links",
    "links": [
      {
        "label": "Documentation",
        "url": "https://docs.example.com",
        "icon": "book"
      },
      {
        "label": "Settings",
        "routerLink": "/settings",
        "icon": "settings"
      }
    ]
  }
}
```

---

### Card Link

**Type:** `"cardlink"`

Clickable card component for navigation.

**Data Interface:** `XiriCardlinkSettings`

```typescript
{
  title: string           // Card title
  subtitle?: string       // Card subtitle
  icon?: string           // Material icon
  iconColor?: ThemePalette // Icon color
  routerLink?: string     // Internal route
  url?: string            // External URL
}
```

**Example:**

```json
{
  "type": "cardlink",
  "display": "xcol-md-4",
  "data": {
    "title": "Users",
    "subtitle": "Manage users",
    "icon": "people",
    "iconColor": "primary",
    "routerLink": "/users"
  }
}
```

---

### List

**Type:** `"list"`

Display items in a list format.

**Data Interface:** `XiriListSettings`

```typescript
{
  items: Array<{
    label: string        // Item label
    value?: any          // Item value
    icon?: string        // Material icon
  }>
  title?: string         // List title
}
```

**Example:**

```json
{
  "type": "list",
  "data": {
    "title": "Recent Activities",
    "items": [
      { "label": "User created", "icon": "person_add" },
      { "label": "Settings updated", "icon": "settings" },
      { "label": "Report generated", "icon": "assessment" }
    ]
  }
}
```

---

### Info Point

**Type:** `"infopoint"`

Information tooltip or popover.

**Data Interface:** `XiriInfopointSettings`

```typescript
{
  text: string           // Tooltip text
  icon?: string          // Material icon
  position?: string      // Tooltip position
}
```

**Example:**

```json
{
  "type": "infopoint",
  "data": {
    "text": "This feature requires admin privileges",
    "icon": "info"
  }
}
```

---

### Multi Progress

**Type:** `"multiprogress"`

Display multiple progress indicators.

**Data Interface:** `XiriMultiprogressSettings`

```typescript
{
  items: Array<{
    label: string        // Progress item label
    value: number        // Progress value (0-100)
    color?: string       // Progress bar color
  }>
}
```

**Example:**

```json
{
  "type": "multiprogress",
  "display": "xcol-md-4",
  "data": {
    "items": [
      { "label": "CPU Usage", "value": 65, "color": "primary" },
      { "label": "Memory", "value": 80, "color": "warn" },
      { "label": "Disk", "value": 45, "color": "accent" }
    ]
  }
}
```

---

### Image Text

**Type:** `"imagetext"`

Component combining image with text content.

**Data Interface:** `XiriImagetextSettings`

```typescript
{
  image: string          // Image URL
  title?: string         // Title text
  text?: string          // Body text
  alt?: string           // Image alt text
}
```

**Example:**

```json
{
  "type": "imagetext",
  "display": "xcol-md-4",
  "data": {
    "image": "/assets/banner.jpg",
    "title": "Welcome",
    "text": "Get started with our platform",
    "alt": "Welcome banner"
  }
}
```

---

### Container

**Type:** `"container"`

Nested container for grouping components.

**Data:** Array of `XiriDynData` objects

**Example:**

```json
{
  "type": "container",
  "display": "xcol-md-6",
  "data": [
    {
      "type": "header",
      "data": { "title": "Section 1" }
    },
    {
      "type": "card",
      "data": { ... }
    }
  ]
}
```

---

### Spacer

**Type:** `"spacer"`

Empty spacing element for layout.

**Data:** None required

**Example:**

```json
{
  "type": "spacer",
  "display": "xcol-md-12"
}
```

---

### Info Text

**Type:** `"infotext"`

Simple text display.

**Data:**

```typescript
{
  text: string           // Text to display
}
```

**Example:**

```json
{
  "type": "infotext",
  "data": {
    "text": "Please complete all required fields before submitting."
  }
}
```

---

### HTML

**Type:** `"html"`

Raw HTML content (sanitized for safety).

**Data:**

```typescript
{
  html: string           // HTML content
}
```

**Example:**

```json
{
  "type": "html",
  "data": {
    "html": "<h2>Custom Content</h2><p>This is <strong>HTML</strong> content.</p>"
  }
}
```

---

## Form Field Types

The xiri-ng library supports 18 different form field types for dynamic form generation. Each field type has specific properties and behaviors.

### Common Field Properties

All form fields share these base properties:

```typescript
{
  id: string,                    // Required: Form control name
  type: string,                  // Required: Field type (see types below)
  name?: string,                 // Field label
  hint?: string,                 // Help text displayed below field
  class?: string,                // CSS classes for field wrapper
  value?: any,                   // Initial/current field value
  hide?: boolean,                // Hide field from display
  required?: boolean,            // Field is required for form submission
  disabled?: boolean,            // Field is disabled (read-only)
  validations?: Array<{          // Custom validation rules
    id: string,                  // Validator identifier
    name?: string,               // Validator name
    message: string,             // Error message to display
    validator: any               // Validator function
  }>
}
```

---

### Text Input

**Type:** `"text"`

Standard text input field.

**Note:** For email input, use the standalone `"email"` type (not a subtype).

**Additional Properties:**
```typescript
{
  subtype?: string,              // Input subtype: 'url' | 'tel' (email has its own type)
  placeholder?: string,          // Placeholder text
  textPrefix?: string,           // Text displayed before input
  textSuffix?: string,           // Text displayed after input
  iconPrefix?: string,           // Material icon before input
  iconSuffix?: string,           // Material icon after input
  min?: number,                  // Minimum length
  max?: number,                  // Maximum length
  pattern?: string               // Regex validation pattern
}
```

**Example:**
```json
{
  "id": "username",
  "type": "text",
  "name": "Username",
  "placeholder": "Enter username",
  "required": true,
  "min": 3,
  "max": 20,
  "hint": "3-20 characters",
  "textPrefix": "@"
}
```

**Value Format:** `string`

---

### Email Input

**Type:** `"email"`

Email input field with built-in email validation (standalone type).

**Additional Properties:**
```typescript
{
  placeholder?: string,          // Placeholder text
  textPrefix?: string,           // Text displayed before input
  textSuffix?: string,           // Text displayed after input
  iconPrefix?: string,           // Material icon before input
  iconSuffix?: string,           // Material icon after input
  min?: number,                  // Minimum length
  max?: number,                  // Maximum length
  pattern?: string               // Additional regex validation
}
```

**Example:**
```json
{
  "id": "email",
  "type": "email",
  "name": "Email Address",
  "placeholder": "Enter your email",
  "required": true,
  "hint": "We'll never share your email"
}
```

**Value Format:** `string`

---

### Number Input

**Type:** `"number"`

Numeric input field with min/max validation.

**Additional Properties:**
```typescript
{
  locale?: string,               // Number format locale (e.g., 'en-US', 'de-DE')
  textPrefix?: string,           // Text before input (e.g., '$')
  textSuffix?: string,           // Text after input (e.g., 'kg')
  iconPrefix?: string,           // Material icon before input
  iconSuffix?: string,           // Material icon after input
  min?: number,                  // Minimum value
  max?: number                   // Maximum value
}
```

**Example:**
```json
{
  "id": "price",
  "type": "number",
  "name": "Price",
  "required": true,
  "min": 0,
  "max": 999999,
  "textPrefix": "$",
  "locale": "en-US",
  "hint": "Enter product price"
}
```

**Value Format:** `number`

---

### Password Input

**Type:** `"password"`

Password input with show/hide toggle.

**Additional Properties:**
```typescript
{
  pwdhide?: boolean,             // Initially hide password (default: true)
  min?: number,                  // Minimum length
  max?: number                   // Maximum length
}
```

**Example:**
```json
{
  "id": "password",
  "type": "password",
  "name": "Password",
  "required": true,
  "min": 8,
  "max": 128,
  "pwdhide": true,
  "hint": "At least 8 characters"
}
```

**Value Format:** `string`

---

### Textarea

**Type:** `"textarea"`

Multi-line text input.

**Additional Properties:**
```typescript
{
  rows?: number,                 // Number of visible rows (default: 5)
  max?: number                   // Maximum character length
}
```

**Example:**
```json
{
  "id": "description",
  "type": "textarea",
  "name": "Description",
  "rows": 10,
  "max": 1000,
  "hint": "Enter detailed description"
}
```

**Value Format:** `string`

---

### Select / Dropdown

**Type:** `"select"`

Dropdown selection with optional search (for single selection).

**Note:** For multiple selection, use the `"multiselect"` type.

**Additional Properties:**
```typescript
{
  list: Array<{                  // Required: Options list
    id: number | string,         // Option value
    name: string,                // Option display text
    disabled?: boolean           // Option is disabled
  }>,
  multiple?: boolean,            // Allow multiple selections
  search?: boolean,              // Enable search filter (default: true)
  serverSideSearch?: boolean,    // Use server-side search
  url?: string,                  // URL for server-side search/loading
  params?: object                // Additional params for server requests
}
```

**Example (Simple Select):**
```json
{
  "id": "role",
  "type": "select",
  "name": "User Role",
  "required": true,
  "search": false,
  "list": [
    {"id": 1, "name": "User"},
    {"id": 2, "name": "Admin"},
    {"id": 3, "name": "Manager"}
  ]
}
```

**Example (Server-Side Search):**
```json
{
  "id": "user",
  "type": "select",
  "name": "Assign to User",
  "search": true,
  "serverSideSearch": true,
  "url": "/api/users/search",
  "params": {"department": "IT"}
}
```

**Value Format:** `number | string` (the selected id)

**Server-Side Search Request:**
```
GET /api/users/search?search={query}&department=IT
```

**Server-Side Search Response:**
```json
[
  {"id": 1, "name": "John Doe"},
  {"id": 2, "name": "Jane Smith"}
]
```

---

### Multi-Select

**Type:** `"multiselect"`

Multiple selection dropdown with search functionality (standalone type).

**Additional Properties:**
```typescript
{
  list: Array<{                  // Required: Options list
    id: number | string,         // Option value
    name: string,                // Option display text
    disabled?: boolean           // Option is disabled
  }>,
  search?: boolean,              // Enable search filter (default: true)
  url?: string,                  // URL for server-side loading
  params?: object                // Additional params for server requests
}
```

**Example:**
```json
{
  "id": "tags",
  "type": "multiselect",
  "name": "Tags",
  "required": true,
  "list": [
    {"id": 1, "name": "Important"},
    {"id": 2, "name": "Urgent"},
    {"id": 3, "name": "Follow-up"},
    {"id": 4, "name": "Archive"}
  ],
  "hint": "Select one or more tags"
}
```

**Value Format:** `Array<number | string>` (array of selected ids)

---

### Tree Select

**Type:** `"treeselect"`

Hierarchical tree selection for nested data.

**Additional Properties:**
```typescript
{
  multiple?: boolean,            // Allow multiple selections
  url?: string,                  // URL to load tree data
  list?: Array<any>,             // Static tree data
  search?: boolean               // Enable search in tree
}
```

**Example:**
```json
{
  "id": "category",
  "type": "treeselect",
  "name": "Category",
  "required": true,
  "url": "/api/categories/tree"
}
```

**Tree Data Format:**
```json
[
  {
    "id": 1,
    "name": "Electronics",
    "children": [
      {"id": 11, "name": "Laptops"},
      {"id": 12, "name": "Phones"},
      {
        "id": 13,
        "name": "Accessories",
        "children": [
          {"id": 131, "name": "Cables"},
          {"id": 132, "name": "Cases"}
        ]
      }
    ]
  },
  {
    "id": 2,
    "name": "Books",
    "children": [
      {"id": 21, "name": "Fiction"},
      {"id": 22, "name": "Non-Fiction"}
    ]
  }
]
```

**Value Format:**
- Single: `number | string`
- Multiple: `Array<number | string>`

---

### Boolean / Checkbox

**Type:** `"bool"`

Simple checkbox for true/false values.

**Example:**
```json
{
  "id": "active",
  "type": "bool",
  "name": "Active",
  "value": true,
  "hint": "Enable user account"
}
```

**Value Format:** `boolean`

---

### Date Picker

**Type:** `"date"`

Date picker for date only (no time).

**Additional Properties:**
```typescript
{
  min?: number,                  // Minimum date (Unix timestamp in seconds)
  max?: number                   // Maximum date (Unix timestamp in seconds)
}
```

**Example:**
```json
{
  "id": "birthdate",
  "type": "date",
  "name": "Birth Date",
  "required": true,
  "value": 1609459200,
  "min": 631152000,
  "max": 1767225600
}
```

**Value Format:** Unix timestamp in seconds (e.g., `1609459200` for 2021-01-01)

---

### DateTime Picker

**Type:** `"datetime"`

Date and time picker (standalone type, not a subtype of date).

**Additional Properties:**
```typescript
{
  min?: number,                  // Minimum datetime (Unix timestamp in seconds)
  max?: number                   // Maximum datetime (Unix timestamp in seconds)
}
```

**Example:**
```json
{
  "id": "appointment",
  "type": "datetime",
  "name": "Appointment Date & Time",
  "required": true,
  "value": 1736959200,
  "min": 1735689600,
  "max": 1767225600
}
```

**Value Format:** Unix timestamp in seconds (e.g., `1736959200` for 2025-01-15 14:00:00 UTC)

---

### Date Range

**Type:** `"daterange"`

Date range picker with start and end dates.

**Additional Properties:**
```typescript
{
  min?: number,                  // Minimum date (Unix timestamp in seconds)
  max?: number                   // Maximum date (Unix timestamp in seconds)
}
```

**Example:**
```json
{
  "id": "reportPeriod",
  "type": "daterange",
  "name": "Report Period",
  "required": true,
  "value": {
    "start": 1735689600,
    "end": 1767225600
  },
  "hint": "Select start and end dates"
}
```

**Value Format:**
```json
{
  "start": 1735689600,
  "end": 1767225600
}
```

**Note:** Uses `start` and `end` properties (not `from`/`to`), with Unix timestamps in seconds.

---

### DateTime Range

**Type:** `"datetimerange"`

Date and time range picker with start and end datetimes.

**Additional Properties:**
```typescript
{
  min?: number,                  // Minimum datetime (Unix timestamp in seconds)
  max?: number                   // Maximum datetime (Unix timestamp in seconds)
}
```

**Example:**
```json
{
  "id": "eventTime",
  "type": "datetimerange",
  "name": "Event Time Range",
  "required": true,
  "value": {
    "start": 1736931600,
    "end": 1736960400
  },
  "hint": "Select start and end date/time"
}
```

**Value Format:**
```json
{
  "start": 1736931600,
  "end": 1736960400
}
```

**Note:** Uses `start` and `end` properties (not `from`/`to`), with Unix timestamps in seconds.

---

### File Upload

**Type:** `"file"`

File upload with drag-and-drop support.

**Additional Properties:**
```typescript
{
  accept?: string,               // File types: '.pdf,.doc' or 'image/*'
  multiple?: boolean             // Allow multiple file uploads
}
```

**Example (Single File):**
```json
{
  "id": "resume",
  "type": "file",
  "name": "Resume",
  "required": true,
  "accept": ".pdf,.doc,.docx",
  "hint": "Upload your resume (PDF or Word)"
}
```

**Example (Multiple Files):**
```json
{
  "id": "attachments",
  "type": "file",
  "name": "Attachments",
  "multiple": true,
  "accept": "image/*,.pdf",
  "hint": "Upload images or PDF files"
}
```

**Value Format:**
```json
[
  {
    "file": "...",
    "name": "document.pdf",
    "data": "base64_encoded_data..."
  }
]
```

**Supported Accept Values:**
- `".pdf"` - PDF files only
- `".doc,.docx"` - Word documents
- `"image/*"` - All image types
- `"image/png,image/jpeg"` - Specific image types
- `".pdf,.doc,.docx,.txt"` - Multiple specific types

---

### Time Limit

**Type:** `"timelimit"`

Specialized input for time duration/limits.

**Additional Properties:**
```typescript
{
  texts?: {                      // Custom labels
    unlimited?: string,
    days?: string,
    hours?: string,
    minutes?: string
  }
}
```

**Example:**
```json
{
  "id": "sessionTimeout",
  "type": "timelimit",
  "name": "Session Timeout",
  "texts": {
    "unlimited": "No limit",
    "days": "Days",
    "hours": "Hours",
    "minutes": "Minutes"
  }
}
```

**Value Format:**
```json
{
  "unlimited": false,
  "days": 1,
  "hours": 2,
  "minutes": 30
}
```

---

### Volume

**Type:** `"volume"`

Specialized input for volume/capacity values.

**Example:**
```json
{
  "id": "storage",
  "type": "volume",
  "name": "Storage Capacity",
  "required": true
}
```

**Value Format:**
```json
{
  "value": 500,
  "unit": "GB"
}
```

---

### Info Text

**Type:** `"info"`

Display-only informational text (not an input field).

**Example:**
```json
{
  "id": "info1",
  "type": "info",
  "name": "Please review the information below before submitting."
}
```

**Value Format:** None (display only)

---

### Header

**Type:** `"header"`

Section header within the form (not an input field).

**Example:**
```json
{
  "id": "section1",
  "type": "header",
  "name": "Personal Information"
}
```

**Value Format:** None (display only)

---

### HTML Content

**Type:** `"html"`

Display raw HTML content (sanitized for security).

**Example:**
```json
{
  "id": "terms",
  "type": "html",
  "name": "<h3>Terms and Conditions</h3><p>By submitting this form, you agree to our <a href='/terms'>terms of service</a>.</p>"
}
```

**Value Format:** None (display only)

---

### Question

**Type:** `"question"`

Display a question/warning with icon (not an input field).

**Additional Properties:**
```typescript
{
  icon?: string,                 // Material icon name
  iconColor?: 'primary' | 'accent' | 'warn', // Icon color
  value: string                  // Question text
}
```

**Example:**
```json
{
  "id": "warning1",
  "type": "question",
  "icon": "warning",
  "iconColor": "warn",
  "value": "Are you sure you want to delete this item? This action cannot be undone."
}
```

**Value Format:** None (display only)

---

### Waiting Indicator

**Type:** `"waiting"`

Display a loading spinner or done indicator.

**Additional Properties:**
```typescript
{
  done?: boolean,                // Show done icon instead of spinner
  value: string                  // Status text
}
```

**Example:**
```json
{
  "id": "processing",
  "type": "waiting",
  "done": false,
  "value": "Processing your request..."
}
```

**Value Format:** None (display only)

---

### Field Validation

All input fields support custom validation rules:

```json
{
  "id": "email",
  "type": "text",
  "subtype": "email",
  "name": "Email",
  "required": true,
  "validations": [
    {
      "id": "email",
      "message": "Please enter a valid email address"
    },
    {
      "id": "pattern",
      "message": "Email must be from company domain",
      "validator": "^[a-zA-Z0-9._%+-]+@company\\.com$"
    }
  ]
}
```

**Built-in Validation IDs:**
- `required` - Field is required
- `email` - Valid email format
- `min` - Minimum value/length
- `max` - Maximum value/length
- `minlength` - Minimum string length
- `maxlength` - Maximum string length
- `pattern` - Regex pattern match

---

### Complete Form Example

Here's a complete form with various field types:

```json
{
  "type": "form",
  "data": {
    "url": "/api/users/create",
    "header": "Create New User",
    "fields": [
      {
        "id": "section1",
        "type": "header",
        "name": "Personal Information"
      },
      {
        "id": "firstName",
        "type": "text",
        "name": "First Name",
        "required": true,
        "max": 50
      },
      {
        "id": "lastName",
        "type": "text",
        "name": "Last Name",
        "required": true,
        "max": 50
      },
      {
        "id": "email",
        "type": "text",
        "subtype": "email",
        "name": "Email Address",
        "required": true
      },
      {
        "id": "birthdate",
        "type": "date",
        "name": "Birth Date",
        "required": true
      },
      {
        "id": "section2",
        "type": "header",
        "name": "Account Settings"
      },
      {
        "id": "role",
        "type": "select",
        "name": "Role",
        "required": true,
        "search": false,
        "list": [
          {"id": 1, "name": "User"},
          {"id": 2, "name": "Admin"}
        ]
      },
      {
        "id": "departments",
        "type": "select",
        "name": "Departments",
        "multiple": true,
        "search": true,
        "url": "/api/departments"
      },
      {
        "id": "password",
        "type": "password",
        "name": "Password",
        "required": true,
        "min": 8
      },
      {
        "id": "active",
        "type": "bool",
        "name": "Active Account",
        "value": true
      },
      {
        "id": "bio",
        "type": "textarea",
        "name": "Biography",
        "rows": 5,
        "max": 500
      },
      {
        "id": "avatar",
        "type": "file",
        "name": "Profile Picture",
        "accept": "image/*"
      }
    ],
    "buttons": [
      {
        "text": "Create User",
        "type": "raised",
        "action": "api",
        "url": "/api/users",
        "color": "primary"
      },
      {
        "text": "Cancel",
        "type": "flat",
        "action": "back"
      }
    ]
  }
}
```

---

## Shared Interfaces

### XiriButton

Used for action buttons across components:

```typescript
{
  label: string              // Button text
  icon?: string              // Material icon name
  action: string             // Action identifier
  color?: ThemePalette       // Button color: 'primary' | 'accent' | 'warn'
  disabled?: boolean         // Disabled state
  url?: string               // Optional API endpoint for action
  confirm?: string           // Confirmation message before action
  routerLink?: string        // Router navigation path
}
```

**Action Result:**

When a button is clicked, it emits a `XiriButtonResult`:

```typescript
{
  action: string             // The action identifier
  data?: any                 // Associated data (row data for table actions)
  filterData?: any           // Current filter data
}
```

---

### XiriTableField

Field definition for tables and cards:

```typescript
{
  key: string                // Data property key
  label: string              // Display label
  type?: string              // Field type: 'text' | 'date' | 'number' | 'boolean' | 'link' | ...
  sortable?: boolean         // Enable sorting (tables only)
  filterable?: boolean       // Enable filtering (tables only)
  width?: string             // Column width
  align?: string             // Text alignment
  format?: string            // Date/number format string
  link?: boolean             // Render as link
  routerLink?: string        // Router link template (use {{key}} for data binding)
  url?: string               // External URL template
  class?: string             // CSS classes
  hidden?: boolean           // Hide column
  footer?: string            // Footer display value
  footerFunction?: string    // Footer aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max'
}
```

---

### XiriFormField

Field definition for dynamic forms:

```typescript
{
  key: string                // Form control name
  label: string              // Field label
  type: string               // Field type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'date' | 'daterange' | 'file' | ...
  required?: boolean         // Required validation
  disabled?: boolean         // Disabled state
  placeholder?: string       // Placeholder text
  hint?: string              // Help text
  options?: Array<{          // Options for select/radio (type: 'select')
    value: any,
    label: string
  }>
  multiple?: boolean         // Multiple selection (type: 'select', 'file')
  min?: number               // Min value (type: 'number', 'date')
  max?: number               // Max value (type: 'number', 'date')
  pattern?: string           // Regex validation pattern
  validators?: any[]         // Custom validators
  visible?: boolean          // Field visibility
  width?: string             // Field width class
}
```

**Supported Field Types:**
- `text` - Text input
- `email` - Email input with validation
- `number` - Number input
- `password` - Password input
- `checkbox` - Checkbox
- `radio` - Radio buttons
- `select` - Dropdown select (with search via ngx-mat-select-search)
- `treeselect` - Hierarchical tree selection
- `date` - Date picker (using date-fns)
- `daterange` - Date range picker
- `datetimerange` - Date and time range picker
- `timelimit` - Time limit input
- `file` - File upload with drag-and-drop
- `volume` - Volume/capacity input
- `textarea` - Multi-line text input

---

## API Request/Response Patterns

### Table Data Loading

**Request:** `GET {url}?offset={offset}&limit={limit}&sort={field}&direction={asc|desc}&filter={filterJson}`

**Response:**
```json
{
  "data": [...],        // Array of row objects
  "total": 150,         // Total count for pagination
  "footer": {...}       // Optional footer data
}
```

### Form Data Loading

**Request:** `GET {url}`

**Response:** Object with field values matching form field keys

### Form Submission

**Request:** `POST {url}` with form data as JSON body

**Response:** Success/error message

### Button Actions

When a button with a `url` is clicked:

**Request:** `POST {url}` with action data as JSON body

**Response:** Success/error message

---

## Grid Layout System

The `display` property on `XiriDynData` accepts responsive CSS classes:

- `xcol` - Full width
- `xcol-sm-{1-12}` - Width on small screens
- `xcol-md-{1-12}` - Width on medium screens (≥768px)
- `xcol-lg-{1-12}` - Width on large screens (≥1024px)
- `xcol-xl-{1-12}` - Width on extra large screens (≥1280px)

**Example:**
```json
{
  "display": "xcol-md-6 xcol-lg-4"
}
```
This renders full width on mobile, half width on medium screens, and one-third width on large screens.

---

## Complete Example

Here's a complete example showing a dashboard with header, stats cards, and a data table:

```json
[
  {
    "type": "header",
    "data": {
      "title": "User Management",
      "subtitle": "Manage system users and permissions"
    }
  },
  {
    "type": "card",
    "display": "xcol-md-4",
    "data": {
      "header": "Total Users",
      "headerIcon": "people",
      "headerIconColor": "primary",
      "data": { "count": 1247 },
      "fields": [
        { "key": "count", "label": "Active Users", "type": "number" }
      ]
    }
  },
  {
    "type": "card",
    "display": "xcol-md-4",
    "data": {
      "header": "New Today",
      "headerIcon": "person_add",
      "headerIconColor": "accent",
      "data": { "count": 12 },
      "fields": [
        { "key": "count", "label": "New Registrations", "type": "number" }
      ]
    }
  },
  {
    "type": "card",
    "display": "xcol-md-4",
    "data": {
      "header": "Active Sessions",
      "headerIcon": "computer",
      "headerIconColor": "warn",
      "data": { "count": 342 },
      "fields": [
        { "key": "count", "label": "Online Now", "type": "number" }
      ]
    }
  },
  {
    "type": "table",
    "data": {
      "url": "/api/users",
      "header": "All Users",
      "pageSize": 25,
      "sortActive": "created",
      "sortDirection": "desc",
      "fields": [
        { "key": "id", "label": "ID", "type": "text", "width": "80px" },
        { "key": "name", "label": "Name", "type": "text", "sortable": true },
        { "key": "email", "label": "Email", "type": "text", "sortable": true },
        { "key": "role", "label": "Role", "type": "text", "sortable": true },
        { "key": "created", "label": "Created", "type": "date", "sortable": true }
      ],
      "actions": [
        { "label": "Edit", "icon": "edit", "action": "edit" },
        { "label": "Delete", "icon": "delete", "action": "delete", "color": "warn", "confirm": "Delete this user?" }
      ],
      "buttons": {
        "buttons": [
          { "label": "Add User", "icon": "add", "action": "create", "color": "primary" }
        ]
      }
    }
  }
]
```

---

This API reference provides the foundation for building SPAs with xiri-ng. Each component accepts JSON configuration that can be provided by backend APIs, enabling fully dynamic, data-driven user interfaces.
