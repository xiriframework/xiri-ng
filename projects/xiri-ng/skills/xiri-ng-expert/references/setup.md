# Setup & Services — xiri-ng Reference

## provideXiriServices

```typescript
import { provideXiriServices } from '@xiriframework/xiri-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideXiriServices({ api: '/api/' }),
  ],
};
```

Signatur:

```typescript
function provideXiriServices(config: Partial<XiriDataServiceConfig>): EnvironmentProviders

class XiriDataServiceConfig {
  api: string = '/api/';
}
```

Alle xiri-Services sind `providedIn: 'root'` — kein manuelles Registrieren nötig.

## XiriDataService

HTTP-Client mit automatischer Snackbar-Integration (parst `response.message` + `response.messageType`).

```typescript
get(url: string): Observable<Object>
post(url: string, data: any): Observable<any>

postFile(url: string, data: any): Observable<any>
  // responseType: 'blob' — gibt rohes Blob zurück

postFileResponse(url: string, data: any): Observable<HttpResponse<Blob>>
  // mit Headern (für Filename aus Content-Disposition) — nutze mit XiriDownloadService

getConfigApi(): string
  // aktuelle Base-URL (z.B. '/api/')

postDownload(url: string, data: any): void
  // DEPRECATED — nutze postFileResponse() + XiriDownloadService.download()
```

URLs werden mit `getConfigApi()` prefixed, wenn sie nicht absolut sind.

## XiriSnackbarService

```typescript
success(message: string, duration?: number, action?: string): MatSnackBarRef
error  (message: string, duration?: number, action?: string): MatSnackBarRef
info   (message: string, duration?: number, action?: string): MatSnackBarRef
warning(message: string, duration?: number, action?: string): MatSnackBarRef

handleResponse(response: any): boolean
  // Gibt true zurück wenn response.message existiert und gezeigt wurde.
  // messageType mapt auf success | error | warning | info.
```

Wird von `XiriDataService` intern aufgerufen — du musst `handleResponse` nur selber aufrufen, wenn du die Response manuell behandelst.

## XiriResponseHandlerService

Zentrale Logik für Backend-Responses aus `xiri-go` (`ReturnGoto`, `ReturnRefreshPage`, `ReturnRefreshTable`, `ReturnUpdateTableField`).

```typescript
handle(result: any, callbacks?: {
  onTableRefresh?: () => void;
  onTableUpdate?: (id: any, field: string, content: any) => void;
}): void
```

Verhalten je nach `result.refreshType` / `result.gotoUrl`:
- Navigation → `Router.navigateByUrl`
- Page-Refresh → `window.location.reload()`
- Table-Refresh → ruft `onTableRefresh()` wenn gesetzt
- Table-Update → ruft `onTableUpdate(id, field, content)` wenn gesetzt

## XiriFormService

Orchestriert Form-Fetch/Submit mit State-Persistierung.

```typescript
get(url: string, data?: any, extra?: any): Observable<XiriFormServiceData>
  // GET wenn data === null, sonst POST. Gibt geparste FormServiceData zurück.

parse(res: XiriFormServiceReturn): XiriFormServiceData
  // Parst rohe Backend-Response (type: 'form' | 'question' | 'waiting').

loadState(saveStateId: string | null | undefined,
          fields: XiriFormField[]): XiriFormField[]
  // Merged persistierte Values in die Fields (SessionStorage, 3600s Timeout).

saveState(saveStateId: string | null | undefined, values: any): void
  // Persistiert in SessionStorage.
```

## XiriThemeService (ThemeService)

Signal-basiert, System-Präferenz-aware.

```typescript
readonly mode: Signal<ThemeMode>     // 'light' | 'dark' | 'auto'
readonly isDark: Signal<boolean>     // computed
readonly isLight: Signal<boolean>    // computed

setTheme(mode: ThemeMode): void      // persistiert in localStorage
toggle(): void                       // wechselt zwischen light/dark
resetToAuto(): void                  // auto = folgt OS
```

Beispiel in einer Komponente:

```typescript
private theme = inject(ThemeService);

toggleTheme() { this.theme.toggle(); }
darkMode = computed(() => this.theme.isDark());
```

## XiriDownloadService

```typescript
download(result: HttpResponse<Blob>, filename: string, openInNewTab: boolean): boolean
  // Erstellt blob-URL, triggert Download oder öffnet Tab. True bei Erfolg.
```

Kombination mit `XiriDataService.postFileResponse`:

```typescript
this.data.postFileResponse('/api/export', payload).subscribe(res => {
  this.download.download(res, 'export.xlsx', false);
});
```

## XiriLocaleService

Zentraler i18n-/Kontext-Dienst: aktive Sprache, Locale, Timezone, Datums- und Zahlenformatierung sowie lokalisierte Validierungsmeldungen. Ab v0.3.0 sind die früheren `XiriDateService` und `XiriNumberService` hier aufgegangen.

```typescript
// Sprache / Locale
language: Signal<XiriLanguage>              // 'de' | 'en' | (string & {})
localeString: Signal<string>                // z.B. 'de-DE', 'en-GB'
dateFnsLocale: Signal<Locale | undefined>   // aktives date-fns-Locale
setLanguage(lang: XiriLanguage): void       // unbekannt → console.warn, kein Wechsel
validationMessagesFor(): XiriValidationMessages

// Beliebige weitere Sprachen registrieren (vor setLanguage / erstem Formular, im App-Init):
registerLanguage(code: XiriLanguage, def: XiriLanguageDefinition): void
// XiriLanguageDefinition = { localeString: string; dateFnsLocale?: Locale; validationMessages: XiriValidationMessages }

// Timezone + Datum (war XiriDateService)
setTimezone(tz: string): void
unixToLocal(stime: number): Date | null
unixToStringDateTime(stime: number): string   // 'yyyy-MM-dd HH:mm'
unixToStringDate(stime: number): string       // 'd. LLL.'  (Monatsnamen folgen der Sprache)
unixToStringDateYear(stime: number): string   // 'd. LLL. yy'
dateToUnix(date: Date): number

// Zahlen (war XiriNumberService) — folgt der aktiven Sprache
formatNumber(value: number, webformat?: string): string
  // webformat: 'integer' | 'float1' | 'float2' | 'float3' | 'float4'
```

Das Backend liefert sichtbare Texte + Zahlen/Datum bereits sprachrichtig; die App ruft beim Login `setLanguage()` / `setTimezone()`. Der Material-Datepicker-Locale wird per `effect` automatisch angeglichen. Für zusätzliche Sprachen liefert der Client date-fns-Locale + Validierungstexte via `registerLanguage()`.

## XiriLocalStorageService / XiriSessionStorageService

Wrapper mit Timestamp-Metadaten und In-Memory-Fallback (falls localStorage blockiert).

```typescript
set(name: string, value: any): void              // speichert mit Timestamp
get(name: string): any                            // value oder null
getTimeout(name: string, maxSeconds: number): any // null wenn älter als maxSeconds
remove(name: string): void
clear(): void
```

`XiriSessionStorageService` hat dieselbe API, wird v.a. für Form-State und Table-State genutzt (`saveState: true` in Table/Query).
