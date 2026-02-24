# @xiriframework/xiri-ng

Angular UI component library for the Xiri Framework.

## Installation

```bash
npm install @xiriframework/xiri-ng
```

## Configuration

```typescript
import { provideXiriServices } from '@xiriframework/xiri-ng';

bootstrapApplication(AppComponent, {
  providers: [
    provideXiriServices({ api: '/api/' }),
  ]
});
```

The `api` configuration sets the base URL for the `XiriDataService`, which prepends this path to all HTTP requests.

## Components

Import components individually for optimal tree-shaking:

```typescript
import { XiriTableComponent, XiriFormComponent } from '@xiriframework/xiri-ng';
```

### Available Components

- **XiriFormComponent** - Dynamic form generation from configuration
- **XiriTableComponent** - Feature-rich data table with server-side operations
- **XiriRawTableComponent** - Basic table for simple use cases
- **XiriCardComponent** - Card-based layouts
- **XiriDialogComponent** - Modal dialogs
- **XiriStepperComponent** - Multi-step workflows
- **XiriTabsComponent** - Tabbed layouts
- **XiriHeaderComponent** - Page headers
- **XiriSidenavComponent** - Navigation sidebar
- **XiriButtonlineComponent** - Button groups
- **XiriSearchComponent** - Search input
- **XiriQueryComponent** - Query/filter component
- **XiriAlertComponent** - Status messages
- **XiriListComponent** - List display

### Available Services

- **XiriDataService** - Central HTTP service
- **XiriDateService** - Date manipulation (wraps date-fns)
- **XiriFormService** - Form state management
- **XiriNumberService** - Number formatting
- **XiriLocalStorageService** - Type-safe localStorage wrapper
- **XiriSessionStorageService** - Type-safe sessionStorage wrapper
- **ThemeService** - Theme management

## Peer Dependencies

- Angular 21+
- Angular Material 21+
- date-fns 4+
- RxJS 7+

## License

Apache-2.0
