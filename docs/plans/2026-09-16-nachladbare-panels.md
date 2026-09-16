# Nachladbare Panels (`refresh: "panel"`) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine Card mit eigener URL lädt auf die neue Antwort `{"done": true, "refresh": "panel"}` Titel, Buttons und Inhalt genau dieser Card neu — ohne Page-Reload, nutzbar für alle Panels einer Detailseite (Versicherung, Leasing, Preise …).

**Architecture:** Der URL-Modus der Card (`Card.SetURL` in Go, `XiriCardSettings.url` in Angular) existiert bereits; das Frontend übernimmt aus der Antwort aber nur Inhaltszeilen (`{data: rows}`). Neu: (1) Go bekommt den Response-Typ `ReturnRefreshPanel` (Spiegel von `ReturnRefreshTable`), und `Card.DataResponse(ctx)` liefert die komplette Card im eigenen Envelope `{"card": {…}}` — explizit unterscheidbar von Zeilen-Antworten, keine Heuristik. (2) Die Angular-Card legt eine `card`-Antwort über ihre `settings`; damit ändern sich Titel, Buttons und Inhalt. (3) Die Card stellt sich per DI-Token `XIRI_PANEL_HOST` als Panel bereit; `xiri-button` und `xiri-table` injizieren den Token optional und rufen bei `refresh: "panel"` `reloadPanel()` der nächstgelegenen Card. Eine Card ohne URL reicht an die nächste äußere Card weiter (`skipSelf`) und fällt erst ohne solche auf den Page-Reload zurück.

**Tech Stack:** Go 1.x (`encoding/json`, Standard-`testing`), Angular 22 standalone + signals + `rxResource`, Vitest + TestBed, Angular Material.

**Spec:** Kein separates Spec-Dokument; die Anforderung steht im Goal-Satz oben. Review-Log mit den Codex-Findings (zwei Runden), die diese Fassung geprägt haben: `docs/plans/2026-09-16-nachladbare-panels-review-log.md`.

**Entscheidungen des Users (2026-09-16):** (1) `Card.DataResponse(ctx)` wechselt das Envelope auf `{"card": …}` — kein `PanelResponse()`. (2) Bei einem Reload-Fehler bleibt der zuletzt geladene Header (Titel, Buttons) stehen, nur der Inhalt wird durch die Fehlermeldung ersetzt. (3) Tests folgen der Konvention der bestehenden Card-Specs.

## Global Constraints

- Code-Konventionen (CLAUDE.md): Angular: Tabs, single quotes, Semikolons immer, max. 140 Zeichen, standalone, OnPush, signals / `input()`. Go: Builder-Pattern, Doku-Kommentare wie bei den Nachbarn.
- TDD: erst roter Test, dann minimale Implementierung. Vor dem Fix per Gegenprobe zeigen, dass der Test rot ist.
- Jede Änderung braucht einen Eintrag unter `## [Unreleased]` in `xiri-go/CHANGELOG.md` bzw. `xiri-ng/CHANGELOG.md` (Format wie die bestehenden Einträge).
- Kein Hinweis auf Claude in Commits, Code oder Kommentaren. Keine `Co-Authored-By`-Zeilen.
- Deutsche Texte mit korrekten Umlauten.
- Abwärtskompatibel: Card-URL-Endpoints, die rohe Inhaltszeilen (`{data: rows}`, auch Key/Value-Objekte mit beliebigen Schlüsseln wie `type`) liefern, funktionieren unverändert.
- Verifikation Go: `cd /workspace/xiri/xiri-go && go test ./...`
- Verifikation Angular: `cd /workspace/xiri/xiri-ng && npx ng test xiri-ng --watch=false --include="<spec>"` je Task, am Task-Ende zusätzlich `npx ng lint xiri-ng` und die volle Suite `npx ng test xiri-ng --watch=false`.
- Beide Repos sind eigenständige Git-Repos (`xiri-go`, `xiri-ng`); pro Task ein Commit im jeweiligen Repo.
- Versionen nach Release (auto-patch): xiri-go `0.3.10`, xiri-ng `0.4.10`. Diese Nummern in den CHANGELOG-Querverweisen verwenden.

## Verhaltensvertrag (gilt für alle Tasks)

1. **Antwort des Card-URL-Endpoints** (POST, Body `null`). Der Modus wird **an der rohen Antwort** entschieden, vor jedem Entpacken:
   - Top-Level-Schlüssel `card` mit Objektwert → komplette Card `{"card": {type, header, headerSub, headerIcon, headerIconColor, buttonsTop, buttonsBottom, fields?, data?, dense?, components?, collapsible?, …}}`. Das Frontend übernimmt alle Header-Felder per Spread über `settings`; die Inhaltsfelder `fields`, `data`, `dense`, `components`, `showHeader`, `forceMinWidth` kommen **ausschließlich** aus der Antwort.
   - Sonst Inhaltszeilen wie bisher: `{"data": rows}` → `rows`; alles andere → die Antwort selbst. Was **innerhalb** von `data` steht, wird nie als Card gedeutet (`{data: {card: 'Visa'}}` bleibt eine Zeile). Der Top-Level-Schlüssel `card` ist damit für Endpoints reserviert, die Zeilen **ohne** `data`-Envelope liefern; `response.NewDataResponse(rows)` wickelt immer in `data` und ist nicht betroffen.
2. **`refresh: "panel"`** wird vom auslösenden Element (Button: Api-Ergebnis, Dialog-`afterClosed`, letzter Poll-Tick; Tabelle: **eigene** Api-/Dialog-/Inline-Edit-Pfade) genau **einmal** an den per DI nächstgelegenen `XIRI_PANEL_HOST` gegeben. Ergebnisse, die die Tabelle von `xiri-button` weitergereicht bekommt (`buttonReturn`), hat der Button schon behandelt — die Tabelle reicht sie **nicht** noch einmal weiter. Ohne Host: `console.warn` (Button und Tabelle), sonst nichts.
3. **`reloadPanel()` einer Card**: mit URL → Neuladen; läuft gerade ein Load, wird genau ein Reload nachgeholt, sobald er fertig ist. Ohne URL → `reloadPanel()` der nächsten äußeren Card (`skipSelf`), sonst `XiriResponseHandlerService.handle({refresh: 'page'})`. Das ist **exakt** der heutige `refresh: "page"`-Mechanismus (`router.navigate([router.url])`) — nicht mehr: ob die Route dabei neu aufgebaut wird, hängt wie bisher von der App-Router-Konfiguration ab (`onSameUrlNavigation: 'reload'`, Demo: `main.ts:22`).
4. **Während eines erfolgreichen Reloads bleibt der bisherige Inhalt stehen** (kein Skeleton, keine zerstörten Komponenten). Skeleton nur, solange noch nie etwas geladen wurde und kein statischer Inhalt da ist. **Schlägt ein Reload fehl**, verliert `rxResource` seinen Wert; die Card puffert deshalb die zuletzt erfolgreich geladene komplette Card (`lastCard`, URL-bezogen, bei `url`-Wechsel geleert): Titel, Untertitel, Icon und Buttons bleiben stehen, der Inhalt wird durch die Fehlermeldung ersetzt.
5. **Bekannte Grenze, dokumentiert statt verhindert:** Ein Button mit `autoLoad`, dessen Aktion `refresh: "panel"` zurückgibt, erzeugt eine Endlosschleife — genauso wie heute `autoLoad` + `refresh: "page"`. Go-Doku weist darauf hin.

## File Structure

**xiri-go**
- Modify: `response/response.go` — `ReturnRefreshPanel` + `NewReturnRefreshPanel()`.
- Modify: `response/response_test.go` — JSON-Tests.
- Modify: `component/card/card.go` — `DataResponse` liefert `{"card": …}`; Doku an `SetURL`/`DataResponse`.
- Modify: `component/card/card_test.go` — Envelope-Test.
- Modify: `skills/xiri-go-expert/references/responses.md`, `skills/xiri-go-expert/SKILL.md:25`, `CHANGELOG.md`.

**xiri-ng** (Pfade relativ zu `projects/`)
- Modify: `xiri-ng/src/lib/services/response-handler.service.ts` (+ `.spec.ts`) — `XiriPanelHost`, `XIRI_PANEL_HOST`, Callback `onPanelRefresh`.
- Modify: `xiri-ng/src/lib/button/button.component.ts` (+ `.spec.ts`) — optionaler Host-Inject, Callback in `processResult`, Warnung ohne Host.
- Modify: `xiri-ng/src/lib/table/table.component.ts` (+ `.spec.ts`) — optionaler Host-Inject, Callback in `callReturn`.
- Modify: `xiri-ng/src/lib/card/card.component.ts|html` (+ `.spec.ts`) — Provider, `loadedCard`/`card`, Skeleton-Bedingung, `reloadPanel()` mit Weiterreichen und Nachhol-Reload.
- Modify: `demo/src/app/cards/cards.component.ts|html`, `demo/src/app/mock/mock-api.interceptor.ts`, `CHANGELOG.md`.

`public-api.ts` braucht keine Änderung (`response-handler.service` ist bereits komplett exportiert, Zeile 83).

---

### Task 1: Go — `ReturnRefreshPanel` und `{"card": …}`-Envelope

**Files:**
- Modify: `xiri-go/response/response.go` (hinter `ReturnRefreshTable.WithMessage` bzw. `NewReturnRefreshTable`)
- Modify: `xiri-go/component/card/card.go:246-249` (`DataResponse`), Kommentare `SetURL`
- Test: `xiri-go/response/response_test.go`, `xiri-go/component/card/card_test.go`

**Interfaces:**
- Produces: `response.ReturnRefreshPanel{Done, Refresh string, Message}`, `NewReturnRefreshPanel()`, `(ReturnRefreshPanel).WithMessage(text, msgType)`. JSON `{"done":true,"refresh":"panel"}`.
- Produces: `(*Card).DataResponse(ctx)` → `DataResult{Type: ResponseJSON, Body: {"card": c.PrintData(ctx)}}`.

- [ ] **Step 1: Failing Tests**

`response_test.go`, hinter `TestNewReturnRefreshTable`:

```go
func TestNewReturnRefreshPanel(t *testing.T) {
	r := NewReturnRefreshPanel()

	data, err := json.Marshal(r)
	if err != nil {
		t.Fatalf("marshal error: %v", err)
	}

	expected := `{"done":true,"refresh":"panel"}`
	if string(data) != expected {
		t.Errorf("expected %s, got %s", expected, string(data))
	}
}

func TestReturnRefreshPanelWithMessage(t *testing.T) {
	r := NewReturnRefreshPanel().WithMessage("Gespeichert", MessageSuccess)

	data, err := json.Marshal(r)
	if err != nil {
		t.Fatalf("marshal error: %v", err)
	}

	expected := `{"done":true,"refresh":"panel","message":"Gespeichert","messageType":"success"}`
	if string(data) != expected {
		t.Errorf("expected %s, got %s", expected, string(data))
	}
}
```

`card_test.go`, am Ende:

```go
// TestCard_DataResponseEnvelope: the URL endpoint answers with {"card": <PrintData>} so the
// frontend can tell a complete card from plain row data ({"data": rows}).
func TestCard_DataResponseEnvelope(t *testing.T) {
	c := NewCard(core.CardTypeTable, nil, "Versicherung", nil, nil, nil, false, false, nil)
	res := c.DataResponse(cardCtx())
	if res.Type != response.ResponseJSON {
		t.Fatalf("type=%v want JSON", res.Type)
	}
	body := res.Body.(map[string]any)
	if _, has := body["data"]; has {
		t.Errorf("expected no top-level 'data' key, got %v", body)
	}
	card, ok := body["card"].(map[string]any)
	if !ok {
		t.Fatalf("expected 'card' map, got %T", body["card"])
	}
	if card["header"] != "Versicherung" || card["type"] != "table" {
		t.Errorf("card=%v", card)
	}
}
```

(Import `github.com/xiriframework/xiri-go/response` in `card_test.go` ergänzen, falls nicht vorhanden.)

- [ ] **Step 2: Rot verifizieren**

Run: `cd /workspace/xiri/xiri-go && go test ./response/ ./component/card/`
Expected: `undefined: NewReturnRefreshPanel`; nach Auskommentieren der Panel-Tests: `TestCard_DataResponseEnvelope` rot mit „expected no top-level 'data' key“.

- [ ] **Step 3: Implementierung `response.go`**

Hinter `ReturnRefreshTable.WithMessage`:

```go
// ReturnRefreshPanel represents a refresh panel response.
//
// JSON output: {"done": true, "refresh": "panel"}
// With message: {"done": true, "refresh": "panel", "message": "Saved", "messageType": "success"}
//
// Use case: Operation completed inside a card that loads via Card.SetURL. The frontend
// re-fetches that card's URL and replaces title, buttons and content of exactly this card;
// the rest of the page stays untouched. The trigger may be a button (api result, dialog
// result, last poll tick) or a table action anywhere inside the card; the frontend resolves
// the nearest enclosing card with a URL. A card without URL falls back to a page reload.
//
// Do not combine with an autoLoad button whose action returns this response: the reload
// re-creates the button, which auto-loads again — an endless loop (same as refresh "page").
type ReturnRefreshPanel struct {
	Done    bool   `json:"done"`    // Always true
	Refresh string `json:"refresh"` // Always "panel"
	Message
}

func (r ReturnRefreshPanel) isSuccessResponse() {}

// WithMessage returns a copy with the given message and type.
func (r ReturnRefreshPanel) WithMessage(text string, msgType MessageType) ReturnRefreshPanel {
	r.MessageText = text
	r.MessageType = msgType
	return r
}
```

Hinter `NewReturnRefreshTable`:

```go
// NewReturnRefreshPanel creates a refresh panel response.
//
// Returns: {"done": true, "refresh": "panel"}
func NewReturnRefreshPanel() ReturnRefreshPanel {
	return ReturnRefreshPanel{Done: true, Refresh: "panel"}
}
```

Doku-Liste am `SuccessResponse`-Interface ergänzen: `// Accepts: ReturnRefreshTable, ReturnRefreshPanel, ReturnRefreshPage, ReturnGoto, ReturnDone, ReturnMessage`.

- [ ] **Step 4: Implementierung `card.go`**

`DataResponse` ersetzen:

```go
// DataResponse returns the complete card data (header, buttons, content) in the
// {"card": ...} envelope. Use it as the handler for the URL passed to SetURL: the frontend
// takes title, buttons, fields, content and sub-components from it. The envelope differs from
// NewJSONDataResult's {"data": ...} on purpose — {"data": rows} keeps meaning "plain rows".
func (c *Card) DataResponse(ctx *core.UiContext) response.DataResult {
	return response.DataResult{Type: response.ResponseJSON, Body: map[string]any{"card": c.PrintData(ctx)}}
}
```

Kommentar von `SetURL` ersetzen:

```go
// SetURL sets the AJAX data URL. When set, static content is cleared and the frontend loads the
// card from this URL (POST, body null). Return DataResponse(ctx) of a fully built card from that
// endpoint: the frontend then replaces title, buttons, fields, content and sub-components, so a
// response.NewReturnRefreshPanel() from any button inside the card re-renders the whole panel.
// Legacy endpoints may still return plain rows via response.NewDataResponse(rows).
```

- [ ] **Step 5: Grün verifizieren**

Run: `cd /workspace/xiri/xiri-go && go test ./...`
Expected: `ok` überall.

- [ ] **Step 6: Commit**

```bash
cd /workspace/xiri/xiri-go && git add response component/card
git commit -m "response: ReturnRefreshPanel; card: DataResponse im card-Envelope"
```

---

### Task 2: Go — Doku und CHANGELOG

**Files:**
- Modify: `xiri-go/skills/xiri-go-expert/references/responses.md` (hinter `### ReturnRefreshTable`; Tabelle unter `component.DataResponse(ctx)`; Card-Beispiel darunter)
- Modify: `xiri-go/skills/xiri-go-expert/SKILL.md:25`
- Modify: `xiri-go/CHANGELOG.md`

**Interfaces:**
- Consumes: `response.NewReturnRefreshPanel()`, `Card.DataResponse` aus Task 1.

- [ ] **Step 1: responses.md**

Hinter `### ReturnRefreshTable` einfügen:

````markdown
### ReturnRefreshPanel

Genau eine Card neu laden (Titel, Buttons, Inhalt), z. B. nach „Versicherung bearbeiten“ auf einer
Detailseite. Voraussetzung: die Card hat `SetURL(...)`, und der Endpoint dahinter liefert
`card.DataResponse(ctx)` einer fertig gebauten Card. Der Auslöser darf ein Button im Header, unten
oder in einer verschachtelten Komponente sein, ebenso eine Tabellenaktion in der Card — das Frontend
findet die nächstgelegene Card mit URL. Eine Card ohne URL reicht an die nächste äußere Card weiter
und lädt ohne solche die Seite neu.

Nicht mit einem `autoLoad`-Button kombinieren, dessen Aktion diese Antwort liefert — das ist eine
Endlosschleife (wie `refresh: "page"` + `autoLoad`).

```go
resp := response.NewReturnRefreshPanel()
// → {"done": true, "refresh": "panel"}

resp := response.NewReturnRefreshPanel().WithMessage("Gespeichert", response.MessageSuccess)
```

Beispiel — Panel „Versicherung“ einer Fahrzeug-Detailseite:

```go
// Page: Card als Shell mit eigener URL
panel := card.NewCard(core.CardTypeTable, nil, "Versicherung", nil, nil, nil, false, false, nil)
panel.SetURL(c.apiUrl("Vehicle", id, "Panel", "Insurance"))

// Panel-Endpoint: komplette Card bauen, DataResponse → {"card": {...}}
func (c *Controller) InsurancePanel(ctx echo.Context) error {
    wc := webcontext.GetWebContext(ctx)
    ins := c.svc.Insurance(id)
    p := card.NewCardList("Versicherung", card.NewCardListContent([]card.CardListContentLine{
        {Name: "Versicherer", Content: ins.Company},
        {Name: "Prämie", Content: ins.Premium},
    }))
    p.ButtonTop(button.NewSimpleDialogButton("Bearbeiten", c.apiUrl("Vehicle", id, "Insurance", "Edit"), core.ColorPrimary))
    return wc.Data(p)   // wc.Data serialisiert DataResult.Body; c.JSON(…, DataResult) gäbe {"Type":0,"Body":…}
}

// Dialog-Submit: nur das Panel neu laden
return wc.Component(response.NewReturnRefreshPanel().WithMessage("Gespeichert", response.MessageSuccess))
```
````

`DataResult` hat keine JSON-Tags und kein `MarshalJSON` (`response.go:421`); ausgeliefert wird es über den Wrapper `wc.Data(comp)` (siehe `patterns.md:55`, `tables.md:536`). Das bestehende Card-Beispiel in `responses.md:188` (`return c.JSON(http.StatusOK, inner.DataResponse(wc.UiContext()))`) ist aus demselben Grund falsch — in `return wc.Data(inner)` ändern.

In der Tabelle unter `component.DataResponse(ctx)` die Card-Zeile ändern zu:
`| Card | card.DataResponse(ctx) | AJAX-Card lädt komplette Card neu — Envelope {"card": …}, nicht {"data": …} |`
und im Card-Beispiel darunter den Kommentar `// AJAX-Endpoint liefert nur die Daten (ohne type-Wrapper)` ersetzen durch `// AJAX-Endpoint liefert die komplette Card als {"card": {...}}`.

- [ ] **Step 2: SKILL.md Zeile 25**

`response.NewReturnRefreshTable(),` → `response.NewReturnRefreshTable(), response.NewReturnRefreshPanel(),`.

- [ ] **Step 3: CHANGELOG**

Unter `## [Unreleased]`:

```markdown
### Added

- **`response.NewReturnRefreshPanel()` lädt genau eine Card neu.** Liefert `{"done": true, "refresh": "panel"}`
  (mit `WithMessage` wie die anderen Return-Typen). Das Frontend lädt die URL der nächstgelegenen Card
  (`Card.SetURL`) erneut und übernimmt Titel, Buttons und Inhalt aus `card.DataResponse(ctx)` — die
  restliche Seite bleibt stehen. Gedacht für Panels auf Detailseiten (Versicherung, Leasing, Preise …),
  deren Aktionen bisher `NewReturnRefreshPage()` zurückgeben mussten. Frontend: `xiri-ng >= 0.4.10`.

### Changed

- **`Card.DataResponse(ctx)` antwortet mit `{"card": {…}}` statt `{"data": {…}}`.** Das Frontend konnte
  die bisherige Form nie sinnvoll darstellen (die Header-Felder landeten als Key/Value-Zeilen im Inhalt);
  das eigene Envelope macht eine komplette Card eindeutig von Zeilen-Antworten (`response.NewDataResponse(rows)`)
  unterscheidbar. Endpoints, die Zeilen liefern, sind nicht betroffen.
```

- [ ] **Step 4: Commit**

```bash
cd /workspace/xiri/xiri-go && git add skills CHANGELOG.md
git commit -m "docs: ReturnRefreshPanel und card-Envelope dokumentieren"
```

---

### Task 3: Angular — Response-Handler kennt `refresh: 'panel'`

**Files:**
- Modify: `xiri-ng/projects/xiri-ng/src/lib/services/response-handler.service.ts`
- Test: `xiri-ng/projects/xiri-ng/src/lib/services/response-handler.service.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface XiriPanelHost { reloadPanel(): void; }
  export const XIRI_PANEL_HOST: InjectionToken<XiriPanelHost>;
  handle( result, callbacks?: { onTableRefresh?; onTableUpdate?; onPanelRefresh?: () => void } ): void
  ```
  Bei `refresh == 'panel'` wird ausschließlich `onPanelRefresh` gerufen; ohne Callback passiert nichts. Kein Router-Fallback hier — der liegt in der Card (Task 6), weil die Tabelle jede Button-Antwort ein zweites Mal durch `handle` schickt und ein Fallback hier sonst Page-Reloads auslösen würde.

- [ ] **Step 1: Failing Tests**

Am Ende des `describe`:

```ts
	it( 'ruft onPanelRefresh bei refresh:panel und navigiert nicht', () => {
		const onPanelRefresh = vi.fn();
		service.handle( { done: true, refresh: 'panel' }, { onPanelRefresh } );
		expect( onPanelRefresh ).toHaveBeenCalledTimes( 1 );
		expect( router.navigate ).not.toHaveBeenCalled();
	} );

	it( 'navigiert bei refresh:panel ohne Callback nicht (Regressionsschutz)', () => {
		service.handle( { done: true, refresh: 'panel' } );
		expect( router.navigate ).not.toHaveBeenCalled();
	} );
```

- [ ] **Step 2: Rot verifizieren**

Run: `cd /workspace/xiri/xiri-ng && npx ng test xiri-ng --watch=false --include="**/response-handler.service.spec.ts"`
Expected: erster Test rot (`onPanelRefresh` 0-mal) plus TypeScript-Fehler wegen fehlendem Callback-Feld. Der zweite Test ist schon grün — er ist bewusst nur Regressionsschutz.

- [ ] **Step 3: Implementierung**

```ts
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Router } from '@angular/router';


interface XiriHandlerResponse {
	page?: string;
	refresh?: string;
	table?: string;
	goto?: string;
	update?: string;
	id?: unknown;
	field?: unknown;
	content?: unknown;
}

/**
 * Nächstgelegener Panel-Container eines Auslösers (eine xiri-card). Die Card stellt sich per Provider
 * bereit; Button und Tabelle injizieren den Token optional und rufen bei refresh:'panel' reloadPanel().
 */
export interface XiriPanelHost {
	reloadPanel(): void;
}

export const XIRI_PANEL_HOST = new InjectionToken<XiriPanelHost>( 'XIRI_PANEL_HOST' );

@Injectable( {
	             providedIn: 'root',
             } )
export class XiriResponseHandlerService {

	private router = inject( Router );

	handle( result: unknown, callbacks?: {
		onTableRefresh?: () => void;
		onTableUpdate?: ( id: unknown, field: string, content: unknown ) => void;
		onPanelRefresh?: () => void;
	} ): void {
		if ( !result )
			return;
		const res = result as XiriHandlerResponse;
		if ( res.page == 'refresh' || res.refresh == 'page' )
			this.router.navigate( [ this.router.url ] ).then();
		else if ( res.table == 'refresh' || res.refresh == 'table' ) {
			if ( callbacks?.onTableRefresh )
				callbacks.onTableRefresh();
			else
				this.router.navigate( [ this.router.url ] ).then();
		}
		else if ( res.refresh == 'panel' )
			callbacks?.onPanelRefresh?.();
		else if ( res.goto )
			this.router.navigate( [ res.goto ] ).then();
		else if ( res.table == 'update' || res.update == 'table' )
			callbacks?.onTableUpdate?.( res.id, res.field as string, res.content );
	}
}
```

- [ ] **Step 4: Grün verifizieren**

Run: `cd /workspace/xiri/xiri-ng && npx ng test xiri-ng --watch=false --include="**/response-handler.service.spec.ts"`

- [ ] **Step 5: Commit**

```bash
cd /workspace/xiri/xiri-ng && git add projects/xiri-ng/src/lib/services/response-handler.service.ts projects/xiri-ng/src/lib/services/response-handler.service.spec.ts
git commit -m "response-handler: refresh:panel und XIRI_PANEL_HOST"
```

---

### Task 4: Angular — Button meldet `refresh: 'panel'` an den Panel-Host

**Files:**
- Modify: `xiri-ng/projects/xiri-ng/src/lib/button/button.component.ts` (Import; Injections ca. Zeile 127–131; `processResult` ca. Zeile 285–299)
- Test: `xiri-ng/projects/xiri-ng/src/lib/button/button.component.spec.ts`

**Interfaces:**
- Consumes: `XIRI_PANEL_HOST` aus Task 3.
- Verhalten: Api-Ergebnis, Dialog-`afterClosed`-Ergebnis oder letzter Poll-Tick mit `refresh: 'panel'` → `panelHost.reloadPanel()`; ohne Host `console.warn( 'xiri-button: refresh:panel ohne umschließende Card', url )`.

- [ ] **Step 1: Failing Tests**

Import ergänzen: `import { XIRI_PANEL_HOST } from '../services/response-handler.service';`

Neues `describe` am Dateiende (eigenes Setup, weil der Host-Provider zusätzlich nötig ist):

```ts
describe( 'XiriButtonComponent im Panel', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let mockDataService: { post: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn>; postFileResponse: ReturnType<typeof vi.fn> };
	let mockRouter: { navigate: ReturnType<typeof vi.fn>; url: string };
	let panelHost: { reloadPanel: ReturnType<typeof vi.fn> };

	beforeEach( async () => {
		mockDataService = { post: vi.fn(), get: vi.fn(), postFileResponse: vi.fn() };
		mockRouter = { navigate: vi.fn().mockReturnValue( Promise.resolve( true ) ), url: '/current' };
		panelHost = { reloadPanel: vi.fn() };
		await TestBed.configureTestingModule( {
			imports: [ TestHostComponent ],
			providers: [
				{ provide: XiriDataService, useValue: mockDataService },
				{ provide: XiriDownloadService, useValue: { download: vi.fn(), openTab: vi.fn() } },
				{ provide: MatDialog, useValue: { open: vi.fn() } },
				{ provide: Router, useValue: mockRouter },
				{ provide: Location, useValue: { back: vi.fn() } },
				{ provide: ActivatedRoute, useValue: {} },
				{ provide: XIRI_PANEL_HOST, useValue: panelHost },
			],
		} ).compileComponents();
		fixture = TestBed.createComponent( TestHostComponent );
		host = fixture.componentInstance;
	} );

	it( 'ruft reloadPanel des Hosts bei refresh:panel aus einer Api-Aktion', () => {
		mockDataService.post.mockReturnValue( of( { done: true, refresh: 'panel' } ) );
		host.btn.set( makeButton( { action: 'api', url: '/panel/save' } ) );
		fixture.detectChanges();

		fixture.nativeElement.querySelector( 'xiri-buttonstyle' )?.click();

		expect( panelHost.reloadPanel ).toHaveBeenCalledTimes( 1 );
		expect( mockRouter.navigate ).not.toHaveBeenCalled();
	} );

	it( 'ruft reloadPanel, wenn ein Dialog mit refresh:panel schließt', () => {
		const afterClosed = new Subject<unknown>();
		TestBed.inject( MatDialog ).open = vi.fn().mockReturnValue( { afterClosed: () => afterClosed.asObservable(), close: vi.fn() } );
		host.btn.set( makeButton( { action: 'dialog', url: '/panel/edit' } ) );
		fixture.detectChanges();

		fixture.nativeElement.querySelector( 'xiri-buttonstyle' )?.click();
		expect( panelHost.reloadPanel ).not.toHaveBeenCalled();

		afterClosed.next( { done: true, refresh: 'panel' } );
		afterClosed.complete();

		expect( panelHost.reloadPanel ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'ruft reloadPanel erst mit dem letzten Poll-Tick', () => {
		vi.useFakeTimers();
		mockDataService.post.mockReturnValue( of( { done: true, poll: 100, pollUrl: '/panel/status' } ) );
		mockDataService.get.mockReturnValue( of( { done: true, refresh: 'panel' } ) );
		host.btn.set( makeButton( { action: 'api', url: '/panel/start' } ) );
		fixture.detectChanges();

		fixture.nativeElement.querySelector( 'xiri-buttonstyle' )?.click();
		expect( panelHost.reloadPanel ).not.toHaveBeenCalled();

		vi.advanceTimersByTime( 150 );
		expect( mockDataService.get ).toHaveBeenCalledWith( '/panel/status' );
		expect( panelHost.reloadPanel ).toHaveBeenCalledTimes( 1 );
		vi.useRealTimers();
	} );
} );
```

Zusätzlich im bestehenden `describe( 'XiriButtonComponent'` (ohne Host):

```ts
	it( 'warnt bei refresh:panel ohne umschließende Card statt zu navigieren', () => {
		const warn = vi.spyOn( console, 'warn' ).mockImplementation( () => undefined );
		mockDataService.post.mockReturnValue( of( { done: true, refresh: 'panel' } ) );
		host.btn.set( makeButton( { action: 'api', url: '/lonely/save' } ) );
		fixture.detectChanges();

		fixture.nativeElement.querySelector( 'xiri-buttonstyle' )?.click();

		expect( warn ).toHaveBeenCalledWith( expect.stringContaining( 'refresh:panel' ), '/lonely/save' );
		expect( mockRouter.navigate ).not.toHaveBeenCalled();
		warn.mockRestore();
	} );
```

Hinweis zum Poll-Test: `startPolling`/`pollTick` in `button.component.ts:300-330` verwenden `setTimeout` und `dataService.get(url)`. Wenn `pollTick` die Antwort anders verarbeitet als hier angenommen (z. B. per `post`), den Mock an den tatsächlichen Aufruf aus `mock.calls` anpassen — der Test prüft, dass der finale Tick `reloadPanel` auslöst.

- [ ] **Step 2: Rot verifizieren**

Run: `cd /workspace/xiri/xiri-ng && npx ng test xiri-ng --watch=false --include="**/button.component.spec.ts"`
Expected: die vier neuen Tests rot (`reloadPanel` bzw. `warn` nicht gerufen). Falls das Überschreiben von `MatDialog.open` per `TestBed.inject` nicht greift, den `mockDialog`-Provider im `beforeEach` dieses `describe` als Variable halten und `mockDialog.open.mockReturnValue(...)` verwenden (Muster wie `should emit result after dialog closes`).

- [ ] **Step 3: Implementierung**

Import: `import { XiriResponseHandlerService, XIRI_PANEL_HOST } from '../services/response-handler.service';`

Hinter `private responseHandler = inject( XiriResponseHandlerService );`:

```ts
	// Nächstgelegene Card; null außerhalb einer Card. Ziel für refresh:'panel'.
	private panelHost = inject( XIRI_PANEL_HOST, { optional: true } );
```

In `processResult` die Zeile `this.responseHandler.handle( result );` ersetzen:

```ts
		this.responseHandler.handle( result, { onPanelRefresh: () => this.refreshPanel() } );
```

Neue Methode hinter `processResult`:

```ts
	private refreshPanel() {
		if ( this.panelHost )
			this.panelHost.reloadPanel();
		else
			console.warn( 'xiri-button: refresh:panel ohne umschließende Card', this.button().url );
	}
```

- [ ] **Step 4: Grün verifizieren**

Run: `cd /workspace/xiri/xiri-ng && npx ng test xiri-ng --watch=false --include="**/button.component.spec.ts"`

- [ ] **Step 5: Commit**

```bash
cd /workspace/xiri/xiri-ng && git add projects/xiri-ng/src/lib/button
git commit -m "button: refresh:panel an nächstgelegenen Panel-Host weiterreichen"
```

---

### Task 5: Angular — Tabelle meldet `refresh: 'panel'` aus eigenen Aktionspfaden

**Files:**
- Modify: `xiri-ng/projects/xiri-ng/src/lib/table/table.component.ts` (Injections ca. Zeile 218; `callReturn` ca. Zeile 1053)
- Test: `xiri-ng/projects/xiri-ng/src/lib/table/table.component.spec.ts` (`describe( 'callReturn behavior'`, ca. Zeile 1018)

**Interfaces:**
- Consumes: `XIRI_PANEL_HOST` aus Task 3.
- Hintergrund: Die Tabelle führt Bulk-/Zeilen-Aktionen, Dialoge und Inline-Edit-Saves selbst aus (`dataService.post` / `dialog.open` → `callReturn`, Zeilen 887, 907, 960, 993, 1037, 1172) — an `xiri-button` vorbei. Ohne diesen Task würde `refresh: 'panel'` aus einer Tabellenaktion in einer URL-Card still verschluckt.
- Kein Doppelaufruf: Ergebnisse, die von `xiri-button` über `buttonReturn` kommen, hat der Button (Task 4) bereits behandelt. `callReturn` bekommt deshalb ein Flag `fromButton` und übergibt `onPanelRefresh` nur für die tabelleneigenen Pfade. Ohne Host warnt die Tabelle wie der Button.

- [ ] **Step 1: Failing Test**

Import ergänzen: `import { XiriResponseHandlerService, XIRI_PANEL_HOST } from '../services/response-handler.service';`

Im `describe( 'callReturn behavior'`:

```ts
		it( 'reicht onPanelRefresh an den injizierten Panel-Host durch', () => {
			const panelHost = { reloadPanel: vi.fn() };
			fixture?.destroy();
			TestBed.resetTestingModule();
			TestBed.configureTestingModule( {
				imports: [ TestHostComponent ],
				providers: [
					provideRouter( [] ),
					{ provide: XiriDataService, useValue: mockDataService },
					{ provide: XiriDownloadService, useValue: mockDownloadService },
					{ provide: XiriSnackbarService, useValue: mockSnackbar },
					{ provide: MatDialog, useValue: mockDialog },
					{ provide: XiriSessionStorageService, useValue: mockSessionStorage },
					{ provide: XiriResponseHandlerService, useValue: mockResponseHandler },
					{ provide: XIRI_PANEL_HOST, useValue: panelHost },
				],
			} );
			fixture = TestBed.createComponent( TestHostComponent );
			host = fixture.componentInstance;
			fixture.detectChanges();
			component = host.table();

			internals( component ).callReturn( { done: true, refresh: 'panel' } );

			const callbacks = mockResponseHandler.handle.mock.calls[ 0 ][ 1 ] as { onPanelRefresh?: () => void };
			expect( callbacks.onPanelRefresh ).toEqual( expect.any( Function ) );
			callbacks.onPanelRefresh!();
			expect( panelHost.reloadPanel ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'reicht von xiri-button weitergereichte Ergebnisse nicht noch einmal als Panel-Refresh weiter', () => {
			const btn: XiriButton = { text: 'x', type: 'basic', action: 'api', url: '/x' };
			component.buttonReturn( { button: btn, result: { done: true, refresh: 'panel' }, done: true, loading: false } );

			const callbacks = mockResponseHandler.handle.mock.calls[ 0 ][ 1 ] as { onPanelRefresh?: () => void };
			expect( callbacks.onPanelRefresh ).toBeUndefined();
		} );

		it( 'warnt bei refresh:panel ohne umschließende Card', () => {
			const warn = vi.spyOn( console, 'warn' ).mockImplementation( () => undefined );
			internals( component ).callReturn( { done: true, refresh: 'panel' } );
			const callbacks = mockResponseHandler.handle.mock.calls[ 0 ][ 1 ] as { onPanelRefresh?: () => void };
			callbacks.onPanelRefresh!();
			expect( warn ).toHaveBeenCalledWith( expect.stringContaining( 'refresh:panel' ) );
			warn.mockRestore();
		} );
```

- [ ] **Step 2: Rot verifizieren**

Run: `cd /workspace/xiri/xiri-ng && npx ng test xiri-ng --watch=false --include="**/table.component.spec.ts"`
Expected: Test 1 und 3 rot (`onPanelRefresh` ist `undefined`); Test 2 ist schon grün und sichert das Nicht-Weiterreichen ab, sobald das Callback existiert.

- [ ] **Step 3: Implementierung**

Import wie im Test. Hinter `private responseHandler = inject( XiriResponseHandlerService );`:

```ts
	// Nächstgelegene Card; null außerhalb einer Card. Ziel für refresh:'panel' aus eigenen Aktionspfaden.
	private panelHost = inject( XIRI_PANEL_HOST, { optional: true } );
```

`buttonReturn` und `callReturn` ersetzen:

```ts
	public buttonReturn( event: XiriButtonResult ) {

		if ( !event.done )
			return;

		// xiri-button hat refresh:'panel' schon an den Panel-Host gegeben – hier nicht noch einmal.
		this.callReturn( event.result, true );
	}

	private callReturn( result: unknown, fromButton = false ) {
		this.responseHandler.handle( result, {
			onTableRefresh: () => this.reload(),
			onTableUpdate: ( id, field, content ) => {
				const i = this.dataSource.data.findIndex( ( x: XiriTableRow ) => x.id === id );
				if ( i == -1 )
					return;
				this.dataSource.data[ i ][ field ] = content as XiriTableCellValue;
				this.dataSource._updateChangeSubscription();
			},
			onPanelRefresh: fromButton ? undefined : () => this.refreshPanel(),
		} );
	}

	private refreshPanel() {
		if ( this.panelHost )
			this.panelHost.reloadPanel();
		else
			console.warn( 'xiri-table: refresh:panel ohne umschließende Card' );
	}
```

- [ ] **Step 4: Grün verifizieren**

Run: `cd /workspace/xiri/xiri-ng && npx ng test xiri-ng --watch=false --include="**/table.component.spec.ts"`

- [ ] **Step 5: Commit**

```bash
cd /workspace/xiri/xiri-ng && git add projects/xiri-ng/src/lib/table/table.component.ts projects/xiri-ng/src/lib/table/table.component.spec.ts
git commit -m "table: refresh:panel aus eigenen Aktionspfaden an Panel-Host"
```

---

### Task 6: Angular — Card übernimmt `{"card": …}` und ist Panel-Host

**Files:**
- Modify: `xiri-ng/projects/xiri-ng/src/lib/card/card.component.ts`
- Modify: `xiri-ng/projects/xiri-ng/src/lib/card/card.component.html`
- Test: `xiri-ng/projects/xiri-ng/src/lib/card/card.component.spec.ts`

**Interfaces:**
- Consumes: `XIRI_PANEL_HOST`, `XiriPanelHost`, `XiriResponseHandlerService` aus Task 3; Button-Verhalten aus Task 4.
- Produces auf `XiriCardComponent implements XiriPanelHost`:
  - `card: Signal<XiriCardSettings>` — `settings()` überlagert von der zuletzt erfolgreich geladenen `{"card": …}` (Puffer `lastCard`, Vertrag 4); Inhaltsfelder ausschließlich aus der Antwort (Vertrag 1).
  - `cardData: Signal<unknown>` — Inhaltszeilen (bei kompletter Card deren `data`).
  - `showSkeleton: Signal<boolean>` — nur beim allerersten Laden ohne statischen Inhalt (Vertrag 4).
  - `reloadPanel(): void` — Vertrag 3 (Nachhol-Reload, `skipSelf`-Weiterreichen, Page-Fallback).
- `rxResource.value()` wirft im Fehlerzustand (`ResourceValueError`, `@angular/core` `_resource-chunk.mjs:233`). Da `card()` künftig schon am äußeren `mat-card` gelesen wird, darf `_loaded` den Wert nur nach `hasValue()` lesen.
- `rxResource.reload()` gibt `false` zurück, solange `status` `idle` oder `loading` ist (`_resource-chunk.mjs:365`) — daher der Nachhol-Reload. `pendingReload` ist ein **Signal**, und der Effect liest es **vor** `isLoading()`: ein gewöhnliches Boolean würde beim ersten Lauf kurzschließen, `isLoading()` nie lesen und damit keine Abhängigkeit registrieren.

- [ ] **Step 1: Failing Tests**

Router-Mock als Variable im `describe`:

```ts
	let router: { navigate: ReturnType<typeof vi.fn>; url: string };
	// im beforeEach vor configureTestingModule:
	router = { navigate: vi.fn().mockResolvedValue( true ), url: '/current' };
	// Provider-Zeile ersetzen:
	{ provide: Router, useValue: router },
```

Zweiter Test-Host für Geschwister- und Verschachtelungsfälle (unter `TestHostComponent`):

```ts
@Component( {
	selector: 'test-host-two',
	template: `<xiri-card [settings]="a()" /><xiri-card [settings]="b()" />`,
	imports: [ XiriCardComponent ],
} )
class TwoCardsHostComponent {
	a = signal<XiriCardSettings>( {} );
	b = signal<XiriCardSettings>( {} );
}
```

Neues `describe( 'nachladbares Panel'` am Ende des Haupt-`describe`:

```ts
	describe( 'nachladbares Panel', () => {

		function panel( n: number ) {
			return { card: { type: 'table', header: 'Versicherung', headerSub: `Stand ${ n }`, headerIcon: null, headerIconColor: null,
				buttonsTop: { class: 'small', buttons: [ { text: 'Bearbeiten', type: 'icon', action: 'api', url: 'panel/1/save', icon: 'edit' } ] },
				buttonsBottom: { class: 'small', buttons: [ { text: 'Unten', type: 'basic', action: 'api', url: 'panel/1/save' } ] },
				data: { Versicherer: n === 1 ? 'Allianz' : 'Uniqa' } } };
		}

		/** post-Mock: Panel-URL zählt Ladungen hoch, alles andere antwortet mit refresh:panel. */
		function mockPanel( panelUrl: string ) {
			let loads = 0;
			mockDataService.post.mockImplementation( ( url: string ) =>
				url === panelUrl ? of( panel( ++loads ) ) : of( { done: true, refresh: 'panel' } ) );
			return () => mockDataService.post.mock.calls.filter( c => c[ 0 ] === panelUrl ).length;
		}

		async function settle() {
			await fixture.whenStable();
			fixture.detectChanges();
		}

		it( 'übernimmt Titel, Buttons und Inhalt aus {card: …}', async () => {
			mockPanel( 'panel/1' );
			host.settings.set( { url: 'panel/1', header: 'Lade …' } );
			fixture.detectChanges();
			await settle();

			const comp = fixture.debugElement.children[ 0 ].componentInstance as XiriCardComponent;
			expect( fixture.nativeElement.querySelector( 'mat-card-title' ).textContent ).toContain( 'Versicherung' );
			expect( fixture.nativeElement.querySelector( 'mat-card-header xiri-buttonline' ) ).toBeTruthy();
			expect( fixture.nativeElement.querySelector( 'mat-card-actions xiri-buttonline' ) ).toBeTruthy();
			expect( comp.cardData() ).toEqual( { Versicherer: 'Allianz' } );
		} );

		it( 'behandelt {data: rows} weiterhin als Inhalt — auch mit Schlüsseln type und card', async () => {
			mockDataService.post.mockReturnValue( of( { data: { type: 'Diesel', card: 'Visa', Hersteller: 'VW' } } ) );
			host.settings.set( { url: 'rows/1', header: 'Fahrzeug' } );
			fixture.detectChanges();
			await settle();

			const comp = fixture.debugElement.children[ 0 ].componentInstance as XiriCardComponent;
			expect( fixture.nativeElement.querySelector( 'mat-card-title' ).textContent ).toContain( 'Fahrzeug' );
			expect( comp.cardData() ).toEqual( { type: 'Diesel', card: 'Visa', Hersteller: 'VW' } );
		} );

		it( 'lässt Shell-Inhaltsfelder nicht in eine komplette Card durchsickern', async () => {
			mockPanel( 'panel/1' );
			host.settings.set( { url: 'panel/1', components: [ { type: 'html', data: { html: 'shell' } } ] } );
			fixture.detectChanges();
			await settle();

			const comp = fixture.debugElement.children[ 0 ].componentInstance as XiriCardComponent;
			expect( comp.card().components ).toBeUndefined();
			expect( comp.hasComponents() ).toBe( false );
		} );

		it( 'lädt sich neu und zeigt die zweite Antwort, wenn ein Header-Button refresh:panel zurückgibt', async () => {
			const loads = mockPanel( 'panel/1' );
			host.settings.set( { url: 'panel/1' } );
			fixture.detectChanges();
			await settle();
			expect( loads() ).toBe( 1 );
			expect( fixture.nativeElement.querySelector( 'mat-card-subtitle' ).textContent ).toContain( 'Stand 1' );

			fixture.nativeElement.querySelector( 'mat-card-header xiri-buttonline xiri-buttonstyle' ).click();
			await settle();

			expect( mockDataService.post ).toHaveBeenCalledWith( 'panel/1/save', {} );
			expect( loads() ).toBe( 2 );
			expect( fixture.nativeElement.querySelector( 'mat-card-subtitle' ).textContent ).toContain( 'Stand 2' );
			expect( fixture.nativeElement.querySelector( 'xiri-skeleton' ) ).toBeNull();
			expect( router.navigate ).not.toHaveBeenCalled();
		} );

		it( 'funktioniert auch über einen Bottom-Button', async () => {
			const loads = mockPanel( 'panel/1' );
			host.settings.set( { url: 'panel/1' } );
			fixture.detectChanges();
			await settle();

			fixture.nativeElement.querySelector( 'mat-card-actions xiri-buttonline xiri-buttonstyle' ).click();
			await settle();

			expect( loads() ).toBe( 2 );
		} );

		it( 'findet die Card aus einem Button in verschachtelten Komponenten und behält sie während des Reloads', async () => {
			let loads = 0;
			const second = new Subject<unknown>();
			const nested = ( n: number ) => ( { card: { type: 'table', header: 'Panel', headerSub: `Stand ${ n }`, buttonsTop: null, buttonsBottom: null,
				components: [ { type: 'buttonline', data: { class: '', buttons: [ { text: 'Save', type: 'basic', action: 'api', url: 'panel/2/save' } ] } } ] } } );
			mockDataService.post.mockImplementation( ( url: string ) => {
				if ( url !== 'panel/2' ) return of( { done: true, refresh: 'panel' } );
				return ++loads === 1 ? of( nested( 1 ) ) : second;
			} );
			host.settings.set( { url: 'panel/2' } );
			fixture.detectChanges();
			await settle();
			const buttonlineBefore = fixture.nativeElement.querySelector( 'mat-card-content xiri-buttonline' );

			buttonlineBefore.querySelector( 'xiri-buttonstyle' ).click();
			await settle();

			// Reload läuft (second offen): kein Skeleton, dieselbe Komponenteninstanz steht noch im DOM.
			expect( loads ).toBe( 2 );
			expect( fixture.nativeElement.querySelector( 'xiri-skeleton' ) ).toBeNull();
			expect( fixture.nativeElement.querySelector( 'mat-card-content xiri-buttonline' ) ).toBe( buttonlineBefore );
			expect( fixture.nativeElement.querySelector( 'mat-card-subtitle' ).textContent ).toContain( 'Stand 1' );

			second.next( nested( 2 ) );
			second.complete();
			await settle();
			expect( fixture.nativeElement.querySelector( 'mat-card-subtitle' ).textContent ).toContain( 'Stand 2' );
		} );

		it( 'lässt ein Geschwister-Panel unberührt', async () => {
			let a = 0, b = 0;
			mockDataService.post.mockImplementation( ( url: string ) => {
				if ( url === 'panel/a' ) return of( panel( ++a ) );
				if ( url === 'panel/b' ) return of( panel( ++b ) );
				return of( { done: true, refresh: 'panel' } );
			} );
			const two = TestBed.createComponent( TwoCardsHostComponent );
			two.componentInstance.a.set( { url: 'panel/a' } );
			two.componentInstance.b.set( { url: 'panel/b' } );
			two.detectChanges();
			await two.whenStable();
			two.detectChanges();

			two.nativeElement.querySelectorAll( 'xiri-card' )[ 0 ].querySelector( 'mat-card-header xiri-buttonstyle' ).click();
			await two.whenStable();
			two.detectChanges();

			expect( a ).toBe( 2 );
			expect( b ).toBe( 1 );
		} );

		it( 'reicht refresh:panel einer Card ohne url an die äußere URL-Card weiter', async () => {
			let loads = 0;
			mockDataService.post.mockImplementation( ( url: string ) =>
				url === 'outer'
					? of( { card: { type: 'table', header: 'Außen', headerSub: `Stand ${ ++loads }`, buttonsTop: null, buttonsBottom: null,
						components: [ { type: 'card', data: { header: 'Innen', buttonsTop: { class: '',
							buttons: [ { text: 'Save', type: 'basic', action: 'api', url: 'inner/save' } ] }, data: { a: '1' } } } ] } } )
					: of( { done: true, refresh: 'panel' } ) );
			host.settings.set( { url: 'outer' } );
			fixture.detectChanges();
			await settle();

			fixture.nativeElement.querySelector( 'mat-card-content xiri-card mat-card-header xiri-buttonstyle' ).click();
			await settle();

			expect( loads ).toBe( 2 );
			expect( router.navigate ).not.toHaveBeenCalled();
		} );

		it( 'lädt die Seite neu, wenn keine Card mit url über ihr liegt', () => {
			host.settings.set( { header: 'Statisch', data: { a: '1' } } );
			fixture.detectChanges();

			const comp = fixture.debugElement.children[ 0 ].componentInstance as XiriCardComponent;
			comp.reloadPanel();

			expect( router.navigate ).toHaveBeenCalledWith( [ '/current' ] );
			expect( mockDataService.post ).not.toHaveBeenCalled();
		} );

		it( 'holt einen Reload nach, der während des ersten Ladens angefordert wurde', async () => {
			const first = new Subject<unknown>();
			let calls = 0;
			mockDataService.post.mockImplementation( () => ++calls === 1 ? first : of( panel( 2 ) ) );
			host.settings.set( { url: 'panel/1' } );
			fixture.detectChanges();

			const comp = fixture.debugElement.children[ 0 ].componentInstance as XiriCardComponent;
			comp.reloadPanel();
			expect( calls ).toBe( 1 );

			first.next( panel( 1 ) );
			first.complete();
			await settle();
			await settle();

			expect( calls ).toBe( 2 );
			expect( fixture.nativeElement.querySelector( 'mat-card-subtitle' ).textContent ).toContain( 'Stand 2' );
		} );

		it( 'zeigt bei Fehler beim ersten Laden Header aus settings und Fehlermeldung, ohne zu werfen', async () => {
			mockDataService.post.mockReturnValue( throwError( () => ( { error: { error: 'Nicht gefunden' } } ) ) );
			host.settings.set( { url: 'panel/x', header: 'Versicherung' } );
			expect( () => fixture.detectChanges() ).not.toThrow();
			await settle();

			expect( fixture.nativeElement.querySelector( 'mat-card-title' ).textContent ).toContain( 'Versicherung' );
			expect( fixture.nativeElement.querySelector( '.load-error' ).textContent ).toContain( 'Nicht gefunden' );
		} );

		it( 'behält bei Reload-Fehler den geladenen Header und ersetzt nur den Inhalt durch die Fehlermeldung (Vertrag 4)', async () => {
			let calls = 0;
			mockDataService.post.mockImplementation( () => ++calls === 1 ? of( panel( 1 ) ) : throwError( () => ( { error: { error: 'Server weg' } } ) ) );
			host.settings.set( { url: 'panel/1', header: 'Shell' } );
			fixture.detectChanges();
			await settle();
			expect( fixture.nativeElement.querySelector( 'mat-card-title' ).textContent ).toContain( 'Versicherung' );

			const comp = fixture.debugElement.children[ 0 ].componentInstance as XiriCardComponent;
			comp.reloadPanel();
			await settle();

			expect( fixture.nativeElement.querySelector( 'mat-card-title' ).textContent ).toContain( 'Versicherung' );
			expect( fixture.nativeElement.querySelector( 'mat-card-header xiri-buttonline' ) ).toBeTruthy();
			expect( fixture.nativeElement.querySelector( '.load-error' ).textContent ).toContain( 'Server weg' );
			expect( fixture.nativeElement.querySelector( 'xiri-raw-table' ) ).toBeNull();
			expect( fixture.nativeElement.querySelector( 'xiri-skeleton' ) ).toBeNull();
		} );

		it( 'leert den Header-Puffer bei url-Wechsel', async () => {
			mockDataService.post.mockImplementation( ( url: string ) =>
				url === 'panel/1' ? of( panel( 1 ) ) : throwError( () => ( { error: { error: 'Nicht gefunden' } } ) ) );
			host.settings.set( { url: 'panel/1', header: 'Shell' } );
			fixture.detectChanges();
			await settle();
			expect( fixture.nativeElement.querySelector( 'mat-card-title' ).textContent ).toContain( 'Versicherung' );

			host.settings.set( { url: 'panel/other', header: 'Shell' } );
			fixture.detectChanges();
			await settle();

			expect( fixture.nativeElement.querySelector( 'mat-card-title' ).textContent ).toContain( 'Shell' );
			expect( fixture.nativeElement.querySelector( '.load-error' ).textContent ).toContain( 'Nicht gefunden' );
		} );
	} );
```

Hinweise: `Subject` und `throwError` sind bereits importiert. `settle()` folgt der Konvention der bestehenden Card-Tests (`whenStable` + `detectChanges`, siehe `should set loading to true while fetching data`). Falls ein Zähler nach `settle()` hinterherhinkt, in `settle()` vor `detectChanges()` zusätzlich `await new Promise( r => setTimeout( r ) );` — `rxResource` startet Requests aus einem Effect, der erst im nächsten Tick läuft.

- [ ] **Step 2: Rot verifizieren**

Run: `cd /workspace/xiri/xiri-ng && npx ng test xiri-ng --watch=false --include="**/card.component.spec.ts"`
Expected: rot — Test 1 (Titel „Lade …“, `cardData` ist das Envelope-Objekt), Reload-Tests (Zähler bleibt 1, `Stand 2` fehlt), Weiterreich-/Fallback-/Nachhol-Tests (`reloadPanel` fehlt), Fehler-Test grün (heute noch, weil der Header `settings()` liest — er sichert Vertrag 4 gegen die neue `card()`-Nutzung). Test „{data: rows} mit type“ schon grün — Abwärtskompatibilität.

- [ ] **Step 3: Implementierung `card.component.ts`**

Imports:

```ts
import { Component, computed, effect, forwardRef, inject, input, linkedSignal, signal, Signal } from '@angular/core';
import { XiriResponseHandlerService, XiriPanelHost, XIRI_PANEL_HOST } from '../services/response-handler.service';
```

Decorator: `providers: [ { provide: XIRI_PANEL_HOST, useExisting: forwardRef( () => XiriCardComponent ) } ],`

Klasse: `export class XiriCardComponent implements XiriPanelHost {`

Hinter `private dataService = inject( XiriDataService );`:

```ts
	private responseHandler = inject( XiriResponseHandlerService );
	// Nächste äußere Card (Provider dieser Card übersprungen). Ziel für refresh:'panel', wenn diese Card keine url hat.
	private parentPanel = inject( XIRI_PANEL_HOST, { optional: true, skipSelf: true } );
	// Ein während eines laufenden Loads angeforderter Reload wird nachgeholt, sobald der Load fertig ist.
	// Signal, kein Boolean: der Effect muss darauf reagieren, wenn es gesetzt wird.
	private pendingReload = signal( false );
```

`_loaded`/`cardData` ersetzen:

```ts
	// value() wirft im Fehlerzustand (ResourceValueError) – deshalb nur nach hasValue() lesen.
	private _raw = computed<unknown>( () => this.cardResource.hasValue() ? this.cardResource.value() : undefined );

	/** Komplette Card aus der aktuellen Antwort: Top-Level-Schlüssel `card` mit Objektwert (Vertrag 1). Sonst null. */
	private responseCard = computed<XiriCardSettings | null>( () => {
		const r = this._raw() as { card?: unknown } | null | undefined;
		const c = r && typeof r === 'object' && !Array.isArray( r ) ? r.card : undefined;
		return c && typeof c === 'object' && !Array.isArray( c ) ? c as XiriCardSettings : null;
	} );

	/** Zuletzt erfolgreich geladene komplette Card; bleibt bei Reload-Fehler stehen, wird bei url-Wechsel geleert (Vertrag 4). */
	private loadedCard = linkedSignal<{ url: string | undefined; card: XiriCardSettings | null }, XiriCardSettings | null>( {
		source: () => ( { url: this.settings().url, card: this.responseCard() } ),
		computation: ( s, prev ) => s.card ?? ( prev && prev.source.url === s.url ? prev.value : null ),
	} );

	/** Inhaltszeilen aus einer Nicht-Card-Antwort: {data: rows} → rows, sonst die Antwort selbst. */
	private _loaded = computed( () => {
		if ( this.loadedCard() ) return undefined;
		const res = this._raw();
		if ( res == null ) return res;
		return ( res as { data?: unknown } ).data ?? res;
	} );

	/** settings(), überlagert von einer nachgeladenen kompletten Card. Inhaltsfelder kommen dann nur aus der Antwort. */
	card = computed<XiriCardSettings>( () => {
		const s = this.settings();
		const c = this.loadedCard();
		if ( !c ) return s;
		return { ...s, ...c, fields: c.fields, data: c.data, dense: c.dense, components: c.components,
			showHeader: c.showHeader, forceMinWidth: c.forceMinWidth };
	} );

	cardData = computed( () => this.loadedCard() ? this.loadedCard()!.data : ( this._loaded() ?? this.settings().data ) );

	/** Skeleton nur, solange noch nie etwas geladen wurde und kein statischer Inhalt da ist. */
	showSkeleton = computed( () => this.loading() && this._raw() == null && this.settings().data == null
		&& !( this.settings().components?.length ) );
```

Alle weiteren `this.settings()`-Reads in `showHeader`, `isCollapsed`, `hasComponents`, `componentsPadding`, `rawTable`, `onHeaderClick` durch `this.card()` ersetzen. `cardResource.params` liest weiter `this.settings().url`.

Constructor und `reloadPanel` hinter `reload()`:

```ts
	constructor() {
		// pendingReload zuerst lesen, damit beide Signale als Abhängigkeit registriert sind.
		effect( () => {
			const pending = this.pendingReload();
			const loading = this.cardResource.isLoading();
			if ( pending && !loading ) {
				this.pendingReload.set( false );
				this.cardResource.reload();
			}
		} );
	}

	/** refresh:'panel' aus Button/Tabelle in dieser Card. Ohne url: äußere Card, sonst Page-Reload. */
	reloadPanel(): void {
		if ( !this.settings().url ) {
			if ( this.parentPanel )
				this.parentPanel.reloadPanel();
			else
				this.responseHandler.handle( { refresh: 'page' } );
			return;
		}
		// reload() gibt false zurück, solange der erste Load läuft – dann nachholen.
		// ponytail: bei url-Wechsel während pending läuft danach ein Reload zu viel; harmlos.
		if ( !this.cardResource.reload() )
			this.pendingReload.set( true );
	}
```

- [ ] **Step 4: Implementierung `card.component.html`**

Alle `settings()` durch `card()` ersetzen und die Skeleton-Bedingung tauschen. Ergebnis:

```html
<mat-card class="card mat-mdc-elevation-specific" [class.mat-elevation-z2]="!card().flat" [class.flat]="card().flat">
	@if (showHeader()) {
	<mat-card-header (click)="onHeaderClick($event)" [class.collapsible]="card().collapsible">
		@if (card().headerIcon) {
			<div mat-card-avatar class="header-image">
				<mat-icon [class]="card().headerIconColor || 'primary'">{{ card().headerIcon }}</mat-icon>
			</div>
		}
		@if (card().header) {
			<mat-card-title [class]="{hasHeaderSub: card().headerSub}">{{ card().header }}</mat-card-title>
		}
		@if (card().headerSub) {
			<mat-card-subtitle>{{ card().headerSub }}</mat-card-subtitle>
		}
		@if (card().buttonsTop) {
			<xiri-buttonline [settings]="card().buttonsTop!"></xiri-buttonline>
		}
		@if (card().collapsible) {
			<button mat-icon-button (click)="toggleCollapse()" class="collapse-btn" aria-label="Auf-/Zuklappen">
				<mat-icon>{{ isCollapsed() ? 'expand_more' : 'expand_less' }}</mat-icon>
			</button>
		}
		@if (card().reload && card().url) {
			<button mat-icon-button (click)="reload()" [disabled]="loading()" class="reload-btn" aria-label="Neu laden">
				<mat-icon [class.spinning]="loading()">autorenew</mat-icon>
			</button>
		}
	</mat-card-header>
	}
	<div class="collapse-wrapper" [class.collapsed]="isCollapsed()">
		<div class="collapse-inner">
			@if (showSkeleton()) {
				<mat-card-content>
					<xiri-skeleton type="table-row" [columns]="2" [lines]="3"></xiri-skeleton>
				</mat-card-content>
			} @else if (errorMsg()) {
				<mat-card-content>
					<div class="load-error">{{ errorMsg() }}</div>
				</mat-card-content>
			} @else if (hasComponents()) {
				<mat-card-content class="hasComponents" [style.--xiri-card-padding]="componentsPadding()">
					<xiri-dyncomponent [data]="card().components!" class="xrow"></xiri-dyncomponent>
				</mat-card-content>
			} @else {
				<mat-card-content class="hasTable" [style.max-height]="card().maxHeight || '50vh'">
					@if (rawTable()) {
						<xiri-raw-table [settings]="rawTable()!"></xiri-raw-table>
					}
				</mat-card-content>
			}
			@if (card().buttonsBottom) {
				<mat-card-actions align="end">
					<xiri-buttonline [settings]="card().buttonsBottom!"></xiri-buttonline>
				</mat-card-actions>
			}
		</div>
	</div>
</mat-card>
```

- [ ] **Step 5: Grün verifizieren**

Run: `cd /workspace/xiri/xiri-ng && npx ng test xiri-ng --watch=false --include="**/card.component.spec.ts" && npx ng lint xiri-ng`
Expected: alle Card-Tests grün, inklusive der bestehenden URL-Tests mit `{data: …}`. Lint ohne Fehler.

- [ ] **Step 6: Volle Suite**

Run: `cd /workspace/xiri/xiri-ng && npx ng test xiri-ng --watch=false`
Expected: grün. `dyncomponent/*parity.spec.ts` prüfen Settings-Interfaces gegen Go; `XiriCardSettings` ist unverändert.

- [ ] **Step 7: Commit**

```bash
cd /workspace/xiri/xiri-ng && git add projects/xiri-ng/src/lib/card
git commit -m "card: komplette Card aus {card:…} übernehmen, Panel-Host für refresh:panel"
```

---

### Task 7: Angular — Demo-Beispiel und CHANGELOG

**Files:**
- Modify: `xiri-ng/projects/demo/src/app/cards/cards.component.ts` (hinter `sectionFlatCard` ca. Zeile 58; hinter `cardFlatNoHeader` ca. Zeile 263; hinter `goCardFlatCode` ca. Zeile 397)
- Modify: `xiri-ng/projects/demo/src/app/cards/cards.component.html` (hinter dem Block `<!-- Flat Card -->`, ca. Zeile 74)
- Modify: `xiri-ng/projects/demo/src/app/mock/mock-api.interceptor.ts` (Modulebene; vor der Route `Test/Test/Table1Data`, ca. Zeile 171)
- Modify: `xiri-ng/CHANGELOG.md`

**Interfaces:**
- Consumes: Card-Verhalten aus Task 6; Antwortformate aus dem Verhaltensvertrag.

- [ ] **Step 1: Mock-Routen**

Modulebene (oberhalb `export const mockApiInterceptor`):

```ts
// Zähler, damit man beim Panel-Demo sieht, dass wirklich neu geladen wurde.
let panelLoads = 0;
```

Vor der `Test/Test/Table1Data`-Route:

```ts
	// Nachladbares Panel: Save antwortet mit refresh:'panel', die Card lädt sich danach selbst neu.
	if ( req.url.includes( 'Test/Panel/Insurance/Save' ) ) {
		return of( new HttpResponse( { status: 200, body: { done: true, refresh: 'panel', message: 'Gespeichert', messageType: 'success' } } ) )
			.pipe( delay( 300 ) );
	}
	if ( req.url.includes( 'Test/Panel/Insurance' ) ) {
		panelLoads++;
		return of( new HttpResponse( { status: 200, body: { card: {
			type: 'table',
			header: 'Versicherung',
			headerSub: `Stand: ${ panelLoads }. Ladung`,
			headerIcon: 'shield',
			buttonsTop: { class: 'small', buttons: [
				{ text: 'Bearbeiten', type: 'icon', action: 'api', icon: 'edit', hint: 'Speichert und lädt nur dieses Panel neu', url: 'Test/Panel/Insurance/Save' },
			] },
			data: { 'Versicherer': 'Allianz', 'Prämie': `${ 480 + panelLoads * 10 },00 € / Jahr`, 'Laufzeit bis': '31.12.2026' },
		} } } ) ).pipe( delay( 300 ) );
	}
```

- [ ] **Step 2: Demo-Cards**

`cards.component.ts`, hinter `sectionFlatCard`:

```ts
	sectionPanel: XiriSectionSettings = {
		title: 'Nachladbares Panel',
		subtitle: 'url + refresh: "panel" — der Button speichert, danach lädt nur diese Card Titel, Buttons und Inhalt neu. Die Nachbar-Card bleibt stehen.',
		icon: 'sync',
	};
```

Hinter `cardFlatNoHeader`:

```ts
	public cardPanel: XiriCardSettings = {
		url: 'Test/Panel/Insurance',
		header: 'Versicherung',
		headerSub: 'lädt …',
	};

	public cardPanelNeighbour: XiriCardSettings = {
		header: 'Leasing (statisch)',
		headerSub: 'darf beim Panel-Reload nicht flackern',
		data: { 'Leasinggeber': 'Porsche Bank', 'Rate': '389,00 € / Monat' },
	};
```

Hinter `goCardFlatCode`:

```ts
	goCardPanelCode = `// Page: Card als Shell mit eigener URL
panel := card.NewCard(core.CardTypeTable, nil, "Versicherung", nil, nil, nil, false, false, nil)
panel.SetURL(c.apiUrl("Vehicle", id, "Panel", "Insurance"))

// Panel-Endpoint: komplette Card bauen, DataResponse → {"card": {...}}
p := card.NewCardList("Versicherung", content)
p.ButtonTop(button.NewSimpleDialogButton("Bearbeiten", editUrl, core.ColorPrimary))
return wc.Data(p)

// Dialog-Submit: nur das Panel neu laden
return wc.Component(response.NewReturnRefreshPanel().WithMessage("Gespeichert", response.MessageSuccess))`;
```

`cards.component.html`, hinter `<!-- Flat Card -->`-Block:

```html
	<!-- Nachladbares Panel -->
	<div class="xrow">
		<div class="xcol">
			<xiri-section [settings]="sectionPanel">
				<div class="xrow">
					<div class="xcol-md-4">
						<xiri-card [settings]="cardPanel"></xiri-card>
					</div>
					<div class="xcol-md-4">
						<xiri-card [settings]="cardPanelNeighbour"></xiri-card>
					</div>
					<div class="xcol-md-4">
						<app-go-code [code]="goCardPanelCode" title="Go: card.SetURL + response.NewReturnRefreshPanel"></app-go-code>
					</div>
				</div>
			</xiri-section>
		</div>
	</div>
```

- [ ] **Step 3: Im Browser prüfen**

Run: `cd /workspace/xiri/xiri-ng && npm start` (Port 4301; alternativ `hivectl bg start demo`), `/web/cards` öffnen.
Expected: „Versicherung“ zeigt „Stand: 1. Ladung“. Klick auf den Stift → Snackbar „Gespeichert“, danach „Stand: 2. Ladung“ und Prämie +10 €. Während des Reloads bleibt der alte Inhalt stehen (kein Skeleton). Browser-URL unverändert, „Leasing (statisch)“ flackert nicht. Konsole ohne Warnungen.

- [ ] **Step 4: CHANGELOG**

Unter `## [Unreleased]` in `xiri-ng/CHANGELOG.md`:

```markdown
### Added

- **Nachladbare Panels: `refresh: "panel"` lädt genau eine Card neu.** Gibt ein Button (Api-Aktion,
  Dialog-Ergebnis, letzter Poll-Tick) oder eine Tabellenaktion `{"done": true, "refresh": "panel"}` zurück,
  lädt die nächstgelegene `xiri-card` mit `url` ihre URL erneut — auch aus verschachtelten Komponenten,
  gefunden per DI-Token `XIRI_PANEL_HOST`. Eine Card ohne `url` reicht an die nächste äußere Card weiter
  und fällt ohne solche auf den Page-Reload zurück (wie `refresh: "page"`). Läuft der erste Load noch,
  wird der Reload nachgeholt. Ohne umschließende Card warnt der Button in der Konsole.
  Go-Seite: `response.NewReturnRefreshPanel()` ab `xiri-go >= 0.3.10`.
- **`xiri-card` übernimmt aus ihrer `url`-Antwort die komplette Card.** Antwortet der Endpoint mit
  `{"card": {…}}` (so liefert es `Card.DataResponse(ctx)` ab `xiri-go >= 0.3.10`), werden Titel, Untertitel,
  Icon, Buttons, `fields`, `data` und `components` daraus übernommen; während eines Reloads bleibt der
  bisherige Inhalt stehen. Antworten mit Inhaltszeilen (`{data: rows}`) verhalten sich wie bisher.
```

- [ ] **Step 5: Lint und volle Suite**

Run: `cd /workspace/xiri/xiri-ng && npx ng lint && npx ng test xiri-ng --watch=false`

- [ ] **Step 6: Commit**

```bash
cd /workspace/xiri/xiri-ng && git add projects/demo/src/app/cards projects/demo/src/app/mock/mock-api.interceptor.ts CHANGELOG.md
git commit -m "demo: nachladbares Panel, CHANGELOG"
```

---

### Task 8: Release und Folgearbeiten außerhalb dieses Workspaces

**Files:** keine Codeänderung.

- [ ] **Step 1: Release beider Bibliotheken**

Skill `release` verwenden (nicht die Skripte direkt). Reihenfolge: xiri-go (`0.3.10`), dann xiri-ng (`0.4.10`).

- [ ] **Step 2: Folgearbeiten (andere Repos)**

1. **core**: xiri-go auf `0.3.10`; im WebContext-Wrapper neben `RefreshTable()` ein `RefreshPanel()` ergänzen, das `response.NewReturnRefreshPanel()` liefert. Prüfen, ob core irgendwo `Card.DataResponse` verwendet — falls ja, war die Ausgabe bisher im Frontend unbrauchbar (siehe Go-CHANGELOG „Changed“) und wird durch das Update korrekt.
2. **Services**: Detailseiten-Panels (Versicherung, Leasing, Preise …) auf `card.SetURL(...)` umstellen, je Panel einen Endpoint mit `panel.DataResponse(ctx)` anlegen, in Dialog-/Button-Handlern `RefreshPage()` durch `RefreshPanel()` ersetzen. Keine `autoLoad`-Buttons mit `RefreshPanel()` kombinieren.
3. **WebUI**: `@xiriframework/xiri-ng` auf `0.4.10`; `onSameUrlNavigation: 'reload'` muss (wie schon für `refresh: "page"`) gesetzt sein.

---

## Bewusst weggelassen

- **Kein Panel-Refresh aus `xiri-form` auf einer Seite** (nicht im Dialog): `form.service.ts` kennt nur `done`/`goto`. Ergänzen, wenn ein Seitenformular in einer URL-Card ein Panel neu laden soll.
- **Kein `refresh: "panel:<id>"`** zum Neuladen einer *anderen* Card. Nächstgelegene Card reicht für Detailseiten-Panels; erst bauen, wenn ein Fall existiert.
- **Keine stabilen Komponenten-IDs über Reloads**: `xiri-dyncomponent` vergibt Zufalls-IDs, ein Reload erzeugt die Unterkomponenten neu (Formularzustand in Sub-Komponenten geht verloren). Für Detailseiten-Panels mit Anzeigedaten irrelevant; wer Formulare im Panel hält, gibt den Komponenten in Go eine feste `id`.
- **Kein Schutz gegen `autoLoad` + `refresh: "panel"`**: derselbe Loop existiert heute mit `refresh: "page"`; dokumentiert in Go-Doku und Folgearbeiten.
- **Kein Router-freier Page-Fallback**: `XiriResponseHandlerService` braucht den `Router`, den jede Xiri-App hat; Tests stellen ihn als Mock bereit. Bisher konnte eine rein statische Card ohne Router leben — mit dem Provider braucht sie ihn jetzt; in Xiri-Apps ist er immer da.
- **Kein integrierter Tabellenaktions-Test über `dataService.post` bis zum Host**: `callReturn` ist die einzige Sammelstelle aller tabelleneigenen Pfade (Zeilen 887, 907, 960, 993, 1037, 1172); getestet wird dort plus die `fromButton`-Unterscheidung.
