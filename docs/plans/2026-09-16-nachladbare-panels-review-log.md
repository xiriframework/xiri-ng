# Plan-Review-Log: Nachladbare Panels
Plan: xiri-ng/docs/plans/2026-09-16-nachladbare-panels.md · MAX_ROUNDS=3 · Codex-Modell: gpt-6-astra

## Runde 1 (Session 01a0a9d5-d6f2-7721-ad98-951cc3670bbf) — VERDICT: REVISE
(Runde 0: Aufruf ohne -C/--skip-git-repo-check scheiterte mit rc=1, zählt als verbrauchte Runde.)

Der Plan braucht Änderungen vor der Umsetzung. Die kritischen Lücken liegen im Angular-Verhalten; der Go-Response-Typ folgt dem bestehenden Muster korrekt. Keine Dateien geändert; die Befunde beruhen auf Plan und Quellcode, nicht auf ausgeführten Tests.

1. **[P1] `type` ist kein abwärtskompatibler Diskriminator.**  
   Task 5 interpretiert bereits `{data: {type: 'Diesel', Hersteller: 'VW'}}` als komplette Card. `cardData()` wird dadurch `undefined`, die bisherigen Inhaltszeilen verschwinden. Der Kommentar im Plan erkennt die Kollision ausdrücklich an, löst sie aber nicht; das widerspricht der zugesagten Abwärtskompatibilität.  
   **Fix:** Den vollständigen Card-Modus explizit kennzeichnen, beispielsweise durch eine opt-in Einstellung an der URL-Card; bestehende Endpoints weiterhin als Zeilendaten behandeln.

2. **[P1] Ein Ladefehler kann das Rendering vor der Fehleranzeige abbrechen.**  
   Das geplante `card()` liest über `loadedCard → _loaded` ungeschützt `cardResource.value()`. Die installierte Angular-Version wirft dabei im Fehlerzustand einen `ResourceValueError` ([Angular-Implementierung](/workspace/xiri/xiri-ng/node_modules/@angular/core/fesm2022/_resource-chunk.mjs:223)). Weil das Template künftig schon am äußeren `mat-card` `card()` auswertet, erreicht es den vorhandenen `errorMsg()`-Zweig nicht zuverlässig. Bisher waren die Header-Reads davon unabhängig.  
   **Fix:** Den Resource-Wert nur bei vorhandenem Wert lesen und initialen Fehler sowie Reload-Fehler mit anschließender Wiederherstellung im DOM testen.

3. **[P1] Component-Panels werden bei jedem Reload abgeräumt.**  
   Go liefert bei `components` ausdrücklich kein `data` ([card.go](/workspace/xiri/xiri-go/component/card/card.go:290)). Damit ist `cardData()` auch nach erfolgreichem Laden leer. Beim Reload greift folglich `loading() && !cardData()` und ersetzt den gesamten Komponentenbaum durch das Skeleton ([Template](/workspace/xiri/xiri-ng/projects/xiri-ng/src/lib/card/card.component.html:32)). Das verliert Formularzustand, beendet Polling und kann offene Dialoge schließen, weil Button-Destruction den Dialog schließt.  
   **Fix:** Skeleton-Anzeige an „noch keine erfolgreiche Panel-Antwort“ koppeln und vorhandene Components während des Reloads erhalten.

4. **[P1] Frische Component-Antworten können automatische Aktionen endlos wiederholen.**  
   Auch ohne Skeleton vergibt `dyncomponent` für Komponenten ohne ID bei jeder neuen Antwort neue Zufalls-IDs ([Quelle](/workspace/xiri/xiri-ng/projects/xiri-ng/src/lib/dyncomponent/dyncomponent.component.ts:104)). Die Komponenten werden neu erzeugt; dabei wird `_autoTriggered` jedes Buttons zurückgesetzt. Ein verschachtelter `autoLoad`-Button mit Ergebnis `refresh: 'panel'` kann dadurch eine dauernde Aktion→Reload→Aktion-Schleife erzeugen.  
   **Fix:** Stabile Komponentenidentitäten über Reloads sicherstellen und einen Test mit `autoLoad` plus `refresh: 'panel'` aufnehmen.

5. **[P1] Tabellenaktionen laufen teilweise vollständig am Button vorbei.**  
   Die Tabelle ruft `callReturn()` auch direkt aus eigenen Dialog-, API- und Inline-Edit-Pfaden auf ([table.component.ts](/workspace/xiri/xiri-ng/projects/xiri-ng/src/lib/table/table.component.ts:884)). Task 4 erweitert nur `XiriButtonComponent`; die Tabelle übergibt weiterhin keinen Panel-Callback. Solche Antworten werden trotz umschließender URL-Card still ignoriert. Die Begründung „zweite Handler-Runde“ berücksichtigt nur einen Teil der Aufrufwege.  
   **Fix:** Panel-Verarbeitung auch für direkt von der Tabelle ausgeführte Aktionen ergänzen und die Zuständigkeit so trennen, dass weitergereichte Button-Ergebnisse keinen zweiten Reload auslösen.

6. **[P1] Eine statische innere Card blockiert die äußere URL-Card.**  
   Der Provider sitzt laut Task 5 auf **jeder** Card. Bei `URL-Card → statische Card → Button` injiziert der Button deshalb die statische Card und fordert einen Page-Refresh an. Er findet nicht die „nächstgelegene Card mit URL“, wie Kommentar und Changelog behaupten. `forwardRef` löst lediglich die Klassenreferenz, nicht dieses Scope-Problem.  
   **Fix:** Cards ohne URL an einen optional mit `skipSelf` injizierten übergeordneten Panel-Host delegieren; nur ohne solchen Host den dokumentierten Fallback anwenden.

7. **[P2] Refresh während des ersten Ladens geht verloren.**  
   `reloadPanel()` ignoriert den Rückgabewert von `rxResource.reload()`. Angular gibt bei Status `loading` schlicht `false` zurück ([Implementierung](/workspace/xiri/xiri-ng/node_modules/@angular/core/fesm2022/_resource-chunk.mjs:361)). Ein bereits vorhandener Shell-Header-Button kann speichern, während der erste Panel-Request noch läuft; dessen alte Antwort bleibt dann ohne weiteren Request stehen.  
   **Fix:** Während initialen Ladens eingehende Invalidierungen sammeln und danach genau einen zusätzlichen Reload ausführen; die Reihenfolge mit kontrollierten Observables testen.

8. **[P2] Der Spread-Merge definiert nicht, welche Einstellungen verschwinden dürfen.**  
   `{...settings(), ...loadedCard}` lässt ausgelassene Shell-Felder bestehen. Go lässt beispielsweise `components` im Tabellenmodus und `showHeader` bei `false` weg ([Serialisierung](/workspace/xiri/xiri-go/component/card/card.go:284)). Shell-Components können dadurch weiterhin Vorrang vor neu geladenen Tabellenzeilen haben; Shell-Spalten oder Header-Einstellungen können ungewollt erhalten bleiben.  
   **Fix:** Shell-Konfiguration und ersetzbare Inhaltsfelder ausdrücklich trennen und für vollständige Antworten die Defaults beziehungsweise Löschsemantik definieren.

9. **[P2] Der Page-Reload-Fallback ist nur ein getesteter Methodenaufruf.**  
   Der geplante Test beweist `router.navigate(['/current'])`, nicht das erneute Laden der Seite. Die Implementierung navigiert lediglich zur aktuellen URL; die Demo konfiguriert dafür ausdrücklich `onSameUrlNavigation: 'reload'`. Das garantiert noch keinen universellen Reload in konsumierenden Anwendungen. Zusätzlich bekommt nun auch eine rein statische Card durch die neue Service-Injektion eine verpflichtende Router-Abhängigkeit.  
   **Fix:** Fallback und Router-Voraussetzungen präzise festlegen, statische Cards ohne Router unterstützen und den tatsächlichen Datenreload mit echtem Router testen.

10. **[P2] Die Tests sichern den zentralen Erfolg nur unzureichend ab.**  
    Die Reload-Tests liefern zweimal dasselbe `panel`-Objekt und zählen Requests: Eine Implementierung, die die zweite Antwort nie darstellt, könnte bestehen. Ein zweites unabhängiges Panel fehlt vollständig. Der Test „ohne Callback nichts“ ist bereits vor der Änderung grün; als Regressionstest ist das sinnvoll, als Nachweis neuer Funktion nicht. Zusätzliche `detectChanges()`-Aufrufe und ein vorgeschlagener beliebiger Timeout belegen auch keine funktionierende zoneless Aktualisierung.  
    **Fix:** Unterschiedliche erste/zweite Antworten im DOM prüfen, ein unberührtes Geschwisterpanel mitprüfen und asynchrone Antworten ohne nachträglich erzwungene Change Detection testen; Bottom-Buttons, Dialogabschluss und finalen Poll-Tick ergänzen.

11. **[P2] Ein wirkungsloser Panel-Refresh bleibt unsichtbar.**  
    Ohne Host installiert der Button trotzdem einen Callback, der nichts tut. Zusammen mit einer erfolgreichen Snackbar sieht das nach erfolgreicher Aktualisierung aus; auch ein abgelehnter Reload bleibt unsichtbar. Das erschwert die Migration der Service-Endpoints erheblich.  
    **Fix:** Unbehandelte Panel-Antworten über einen zentralen Diagnosepfad melden und einen fehlgeschlagenen Nachladeversuch sichtbar mit Wiederholungsmöglichkeit darstellen.

Die bestehende Trennung über einen neutralen DI-Token ist grundsätzlich brauchbar; einen konkreten neuen Importzyklus erzeugt sie im vorgeschlagenen Zuschnitt nicht. Die einfachere robuste Variante wäre ein expliziter Card-Antwortmodus, eine klar definierte Host-Weiterleitung und ein zentraler, getesteter Pfad für Panel-Invalidierungen.

VERDICT: REVISE
### Bewertung Runde 1 und Überarbeitung

Übernommen:
- F1 (`type` als Diskriminator): eigenes Envelope `{"card": …}` aus `Card.DataResponse`; keine Heuristik mehr. Rechtfertigung für die Go-Änderung: die alte `{data: PrintData}`-Form war im Frontend nie darstellbar (Header-Felder wurden zu Key/Value-Zeilen).
- F2 (`ResourceValueError`): `_loaded` liest `value()` nur nach `hasValue()`; Test „Fehler beim ersten Laden wirft nicht“.
- F3 (Skeleton räumt Components ab): `showSkeleton` nur, solange noch nie geladen wurde und kein statischer Inhalt da ist; Test prüft `xiri-skeleton` fehlt und Komponenten bleiben.
- F5 (Tabellenpfade am Button vorbei): neuer Task 5, Tabelle injiziert den Host und übergibt `onPanelRefresh` in `callReturn`. Doppelaufruf ist unschädlich (Signal-Zähler, ein Effect-Lauf pro Tick).
- F6 (statische innere Card blockiert): `skipSelf`-Inject der äußeren Card, Weiterreichen vor Page-Fallback; Test.
- F7 (Reload während Load verloren): `pendingReload` + Effect; Test mit kontrolliertem `Subject`.
- F8 (Merge-Semantik): Inhaltsfelder (`fields`, `data`, `dense`, `components`, `showHeader`, `forceMinWidth`) kommen bei kompletter Card ausschließlich aus der Antwort; Test.
- F10 (Tests): Antworten mit Ladezähler, DOM-Prüfung „Stand 2“, Geschwister-Panel, Bottom-Button, Poll-Tick-Test im Button.
- F11 (unsichtbarer No-Op): `console.warn` im Button ohne Host; Test. Reload-Fehler zeigt die bestehende `.load-error`-Meldung.

Verworfen / abgeschwächt:
- F4 (autoLoad-Schleife): nicht verhindert. Derselbe Loop existiert heute mit `refresh: "page"`; ein autoLoad-Button, dessen Aktion den eigenen Container neu lädt, ist ein Definitionsfehler des Aufrufers. Dokumentiert in Go-Doku (`ReturnRefreshPanel`, responses.md) und Folgearbeiten. Stabile Komponenten-IDs sind ein separates Thema (`xiri-dyncomponent`), unter „Bewusst weggelassen“ notiert.
- F9 (Page-Fallback nur `router.navigate`): das ist derselbe Mechanismus wie heute für `refresh: "page"` und den Table-Fallback; konsumierende Apps setzen dafür bereits `onSameUrlNavigation: 'reload'`. Kein neues Risiko, in Vertrag 3 und Folgearbeiten benannt. Router-freie statische Cards: verworfen, jede Xiri-App hat den Router; Tests mocken ihn.

## Runde 2 (resume, Session 01a0a9d5-d6f2-7721-ad98-951cc3670bbf) — VERDICT: REVISE

Die aktuelle Fassung und „Bewertung Runde 1“ sind neu eingelesen. **Noch nicht umsetzungsreif:** Der Nachhol-Reload funktioniert so nicht, die Envelope-Erkennung bleibt mehrdeutig, und die behauptete Entschärfung doppelter Refresh-Aufrufe stimmt nicht.

Zu den bisherigen Findings:

- **F2, F6, F8:** Im normalen Erfolgsfall nachvollziehbar behoben. `hasValue()` schützt den Resource-Zugriff; `skipSelf` überspringt den eigenen Provider korrekt; die Inhaltsfelder werden ausdrücklich ersetzt.
- **F3:** Die Skeleton-Bedingung behebt das Abräumen während eines erfolgreichen Reloads. Der zugehörige Test beweist das allerdings nicht.
- **F1, F5, F7, F10, F11:** Nur teilweise beziehungsweise fehlerhaft behoben; Details unten.
- **F4:** Die bewusste Beschränkung auf Anzeigepanels und das dokumentierte Verbot der Kombination sind als Scope-Entscheidung vertretbar. „Existiert schon bei Page-Refresh“ allein wäre keine Begründung. Die Aussage, die Kombination erzeuge immer eine Schleife, ist zudem zu pauschal: Entscheidend ist die Neuerzeugung des Buttons.
- **F9:** Den bestehenden Page-Refresh-Mechanismus wiederzuverwenden ist vertretbar. Die zusätzliche Router-Abhängigkeit statischer Cards bleibt aber eine neue Voraussetzung; „Tests mocken ihn“ beweist keine Kompatibilität. `onSameUrlNavigation: 'reload'` allein garantiert außerdem noch keine Neuerzeugung einer Route oder einen erneuten Datenabruf. Den Vertrag entsprechend einschränken.

Die verbleibenden konkreten Schwachstellen:

1. **[P1] Der `pendingReload`-Effect läuft nach der Initialisierung nicht erneut.**  
   [Plan:965](/workspace/xiri/xiri-ng/docs/plans/2026-09-16-nachladbare-panels.md:965): Beim ersten Effect-Lauf ist das gewöhnliche Boolean `pendingReload` falsch. Durch Kurzschluss wird `isLoading()` überhaupt nicht gelesen; der Effect registriert keine Signal-Abhängigkeit. Das spätere `pendingReload = true` benachrichtigt niemanden. Der geplante Subject-Test sollte deshalb auch **mit** dieser Implementierung rot bleiben.  
   **Fix:** `pendingReload` als Signal führen, Ladestatus reaktiv berücksichtigen und ausstehende Anforderungen beim URL-Wechsel ausdrücklich zurücksetzen oder zuordnen.

2. **[P1] Die neue Envelope-Erkennung interpretiert auch `{data: rows}` erneut als Card.**  
   [Plan:929–939](/workspace/xiri/xiri-ng/docs/plans/2026-09-16-nachladbare-panels.md:929): `_loaded()` entpackt zunächst `data`; anschließend sucht `loadedCard()` im entpackten Zeilenobjekt nach `card`. Beispiel: `{data: {card: 'Visa', Betrag: '100'}}` wird als komplette Card behandelt und verliert seine Zeilen. Auch direkte Zeilenobjekte mit `card` kollidieren mit dem neuen Vertrag. Der neue `type`-Regressionstest findet diese verschobene Kollision nicht.  
   **Fix:** Den Antwortmodus vor jedem Entpacken bestimmen, `{data: …}` verbindlich als Zeilen behandeln und für direkte Objekte die `card`-Reservierung oder einen expliziten Opt-in festlegen.

3. **[P1] „Doppelaufruf ist unschädlich“ ist falsch.**  
   [Plan:573](/workspace/xiri/xiri-ng/docs/plans/2026-09-16-nachladbare-panels.md:573): Der erste `rxResource.reload()` ändert den internen Resource-Zustand; beim unmittelbar folgenden Aufruf kann dieser bereits `loading` sein. Dann liefert der zweite Aufruf `false` und setzt `pendingReload`. Nach Reparatur des Effects entsteht damit ein unnötiger weiterer Request. Ohne URL führen beide Aufrufe sogar unmittelbar zum Router-Fallback; dort gibt es keinen zusammenfassenden Resource-Effect.  
   **Fix:** Weitergereichte Button-Ergebnisse nur einmal als Panel-Refresh behandeln; direkte Tabellenaktionen separat weiterleiten und beide Wege mit echtem Handler testen.

4. **[P1] Die Änderung von `Card.DataResponse()` bleibt ein bestehender API-Bruch.**  
   [Plan:299](/workspace/xiri/xiri-ng/docs/plans/2026-09-16-nachladbare-panels.md:299): Dass die aktuelle Angular-Card die alte Antwort schlecht darstellt, beweist nicht, dass niemand `Body["data"]` auswertet, Antworten transformiert oder einen anderen Client verwendet. Die Prüfung der Aufrufer erst unter „Folgearbeiten“ kommt für diese Entscheidung zu spät.  
   **Fix:** Die bisherige Methode erhalten und beispielsweise `PanelResponse()` ergänzen; alternativ den Bruch vorab durch eine Aufruferprüfung und konkrete Migration absichern.

5. **[P1] Die HTTP-Beispiele liefern bei normaler JSON-Serialisierung nicht das versprochene Envelope.**  
   Die Beispiele übergeben `p.DataResponse(...)` direkt an `c.JSON`. [`DataResult`](/workspace/xiri/xiri-go/response/response.go:421) hat jedoch öffentliche Felder `Type` und `Body`, keine JSON-Tags und keine eigene `MarshalJSON`-Methode. Ohne ausdrücklich vorhandenen Unwrapper entsteht `{"Type":0,"Body":{"card":…}}`. Der neue Go-Test prüft ausschließlich `res.Body` und übersieht diese Grenze.  
   **Fix:** Im Beispiel `.Body` serialisieren oder den tatsächlichen DataResult-Adapter benennen und dessen HTTP-Ausgabe testen.

6. **[P2] Bei einem Reload-Fehler bleibt der geladene Header nicht erhalten.**  
   Laut Vertrag 4 bleibt der Header stehen. Tatsächlich macht `hasValue() === false` nach einem Fehler `_loaded()` und `loadedCard()` leer; `card()` fällt auf die Shell zurück. Ein geladener Titel samt Aktionsbuttons verschwindet damit beziehungsweise wird durch „Lade …“ ersetzt. `showSkeleton` speichert ebenfalls nicht, ob bereits erfolgreich geladen wurde.  
   **Fix:** Die letzte erfolgreiche Antwort URL-bezogen erhalten und Erfolg → Reload-Fehler → Wiederholung einschließlich Header und Fehleranzeige testen.

7. **[P2] Der Test zur Erhaltung der Components wäre ohne den Skeleton-Fix weiterhin grün.**  
   [Plan:791](/workspace/xiri/xiri-ng/docs/plans/2026-09-16-nachladbare-panels.md:791): Der zweite Request antwortet synchron mit `of(...)`; geprüft wird erst nach `settle()`. Zu diesem Zeitpunkt wären auch zuvor zerstörte Components wieder vorhanden und das Skeleton verschwunden. Der Testname behauptet mehr als die Assertions beweisen.  
   **Fix:** Den zweiten Request mit einem `Subject` offenhalten und während des Reloads dieselbe Komponenteninstanz sowie das fehlende Skeleton prüfen.

8. **[P2] Die neuen Tests beweisen weiterhin keine automatische zoneless Aktualisierung.**  
   `settle()` erzwingt nach `whenStable()` immer `detectChanges()`; der zusätzliche Timeout ändert daran nichts. Die DOM-Prüfung „Stand 2“ ist gegenüber Runde 1 verbessert, kann aber eine fehlende automatische Aktualisierung verdecken. Der Dialogabschluss bleibt ungetestet; der Tabellen-Test ruft einen aus einem Mock entnommenen Callback manuell auf und erfasst weder den echten Aktionspfad noch Doppelverarbeitung.  
   **Fix:** Mindestens einen asynchronen DOM-Test ohne nachträgliches `detectChanges()`, einen Dialogabschluss und einen integrierten Tabellenaktions-Test aufnehmen.

9. **[P2] Der neue Tabellenpfad verschluckt Refresh ohne Host weiterhin still.**  
   Vertrag 2 verlangt eine Warnung für Button **und Tabelle**; [Plan:640](/workspace/xiri/xiri-ng/docs/plans/2026-09-16-nachladbare-panels.md:640) verwendet jedoch lediglich `this.panelHost?.reloadPanel()`. F11 ist somit nur für Buttons gelöst.  
   **Fix:** Auch direkte Tabellenaktionen ohne Host diagnostizieren und diesen Fall testen.

Die `skipSelf`-Weiterreichung selbst sehe ich dagegen als korrekt an; zusammen mit `useExisting: forwardRef(...)` entsteht hier kein erkennbarer neuer DI-Zyklus. Keine Dateien geändert und keine Tests ausgeführt.

VERDICT: REVISE
### Bewertung Runde 2 und Überarbeitung

Übernommen:
- R2-1 (`pendingReload`-Effect ohne Abhängigkeit): `pendingReload` ist jetzt ein Signal, der Effect liest es vor `isLoading()`.
- R2-2 (Envelope nach dem Entpacken geprüft): Modus wird an der rohen Antwort entschieden (`_raw` → `loadedCard` → `_loaded`); `{data: {card: 'Visa'}}` bleibt Zeile, Test ergänzt. Top-Level-`card` bei Zeilen ohne `data`-Envelope als reserviert dokumentiert (Vertrag 1).
- R2-3 (Doppelaufruf): Tabelle unterscheidet `fromButton`; von `xiri-button` weitergereichte Ergebnisse bekommen kein `onPanelRefresh`. Test ergänzt.
- R2-5 (`c.JSON(…, DataResult)` serialisiert Struct): Beispiele auf `wc.Data(p)` / `wc.Component(...)` umgestellt; das bestehende falsche Beispiel in `responses.md:188` wird im selben Task korrigiert.
- R2-7 (Components-Test wäre ohne Fix grün): zweiter Request bleibt per `Subject` offen, geprüft wird während des Reloads dieselbe Komponenteninstanz und kein Skeleton.
- R2-8 teilweise: Dialog-Abschluss-Test im Button ergänzt.
- R2-9 (Tabelle warnt nicht): `refreshPanel()` mit `console.warn` in der Tabelle, Test ergänzt.
- F9-Nachtrag: Vertrag 3 präzisiert — Page-Fallback ist exakt `router.navigate([router.url])` wie heute bei `refresh: "page"`; Router-Voraussetzung statischer Cards unter „Bewusst weggelassen“ benannt.

Verworfen / abgeschwächt:
- R2-4 (`Card.DataResponse` als API-Bruch): nicht im Plan entschieden, sondern als „Offene Entscheidung vor Task 1“ an den User gegeben, samt Alternative `PanelResponse()` und Grep-Anweisung für core/services. Claudes Position: Envelope wechseln, weil die alte Ausgabe im Xiri-Frontend nie funktioniert hat und ein zweites Methodenpaar zwei Wege für dieselbe Sache schafft.
- R2-6 (Header bleibt bei Reload-Fehler nicht): Vertrag 4 abgeschwächt statt Puffer gebaut — bei Reload-Fehler zeigt die Card Shell-Header + Fehlermeldung; Test dafür ergänzt. Ein URL-bezogener Puffer der letzten Antwort ist zusätzlicher Zustand für einen seltenen Netzfehler.
- R2-8 (zoneless ohne `detectChanges` beweisen, integrierter Tabellenaktions-Test): `settle()` folgt der Konvention der bestehenden Card-Tests; `callReturn` ist die einzige Sammelstelle der tabelleneigenen Pfade und wird dort getestet.

MAX_ROUNDS=3 erreicht (Runde 0 technisch gescheitert, Runden 1 und 2 REVISE). Kein APPROVED — offene Punkte an den User.

### Entscheidungen des Users (2026-09-16)

1. `Card.DataResponse` wechselt das Envelope auf `{"card": …}` (Claudes Empfehlung).
2. Bei Reload-Fehler bleibt der geladene Header stehen, nur der Inhalt wird durch die Fehlermeldung ersetzt — Codex' Finding R2-6 damit doch übernommen: `lastCard`-Puffer als `linkedSignal`, URL-bezogen.
3. Tests bleiben bei der Konvention der bestehenden Card-Specs (Claudes Position).

## Code-Review (Modus A) nach Umsetzung

### Runde 1 (Session 01a0aa0a-5243-72f3-a0cd-62811627e9ff) — VERDICT: REVISE

Es bleiben zwei Fehler im Card-Zustandswechsel. Zeilenangaben beziehen sich auf die geprüften Commits; Arbeitsbaumänderungen und `22ee55a` wurden ausgeschlossen.

1. **[P2] Erfolgreiche Zeilen-Antworten können dauerhaft ignoriert werden.**  
   [card.component.ts:118](/workspace/xiri/xiri-ng/projects/xiri-ng/src/lib/card/card.component.ts:118): Liefert dieselbe URL zuerst `{card: …}` und später `{data: rows}`, behält `loadedCard` die alte Card. `_loaded` verwirft dadurch die neuen Zeilen; alte Inhalte und Buttons bleiben sichtbar. Der Puffer unterscheidet fehlende Antworten beziehungsweise Fehler nicht von erfolgreichen Nicht-Card-Antworten. Mit Angular-Signals im Speicher reproduziert.  
   **Behebung:** Bei erfolgreicher Zeilen-Antwort den Card-Puffer löschen; den Übergang `{card: …}` → `{data: rows}` testen.

2. **[P2] Wiederholung nach einem Reload-Fehler zeigt erneut das Initial-Skeleton.**  
   [card.component.ts:141](/workspace/xiri/xiri-ng/projects/xiri/xiri-ng/src/lib/card/card.component.ts:141): Nach Erfolg → Reload-Fehler → erneutem Laden ist `_raw()` leer, obwohl `loadedCard()` noch vorhanden ist. `showSkeleton()` wird deshalb wahr. Das widerspricht dem Vertrag „Skeleton nur, solange noch nie etwas geladen wurde“. Der Fehlertest endet vor diesem Wiederholungsfall.  
   **Behebung:** Den URL-bezogenen Erfolgspuffer bei der Skeleton-Bedingung berücksichtigen und einen offenen Retry nach einem Fehler testen.

Weitere Hinweise:

- **Tests:** [table.component.spec.ts:1062](/workspace/xiri/xiri-ng/projects/xiri-ng/src/lib/table/table.component.spec.ts:1062) wäre auch vor der Änderung grün: Damals gab es ebenfalls keinen `onPanelRefresh`-Callback. Er erkennt zwar das versehentliche Entfernen der neuen `fromButton`-Unterscheidung, beweist aber keinen tatsächlich genau einmal ausgeführten Reload. **Behebung:** Einen Button-Klick mit echtem Response-Handler bis zum Host testen und exakt einen Aufruf erwarten. Die positiven Card-, Button- und Go-Tests sichern dagegen neue Funktion ab; der offene Subject-Test prüft sinnvoll den Erhalt der Komponenten während eines Reloads.
- **Konventionen:** Neue Zeilen überschreiten 140 Zeichen in [cards.component.ts:62](/workspace/xiri/xiri-ng/projects/demo/src/app/cards/cards.component.ts:62), [mock-api.interceptor.ts:187](/workspace/xiri/xiri-ng/projects/demo/src/app/mock/mock-api.interceptor.ts:187) und [card.component.spec.ts:424](/workspace/xiri/xiri-ng/projects/xiri-ng/src/lib/card/card.component.spec.ts:424). Der geänderte Import in [button.component.ts:11](/workspace/xiri/xiri-ng/projects/xiri-ng/src/lib/button/button.component.ts:11) verwendet weiterhin doppelte Quotes. **Behebung:** Zeilen umbrechen und den Import auf Single Quotes umstellen.

`hasValue()`-Fehlerschutz, URL-Wechsel des Puffers, `pendingReload`-Effect und `skipSelf`-Weiterleitung sind ansonsten nachvollziehbar korrekt. Bestehende reine `{data: rows}`-Endpoints bleiben erhalten; `refresh:table/page` bleibt unverändert. Keine zusätzlich eingeführte Sicherheitslücke gefunden. Der Go-Envelope-Wechsel entspricht der dokumentierten Nutzerentscheidung.

Keine Dateien geändert. Keine vollständigen Test-/Lint-Läufe; durchgeführt wurden Commit-Review und isolierte Signal-Proben im Speicher.

VERDICT: REVISE
### Umsetzung: Commit acee109 — Puffer bei Zeilen-Antwort leeren, kein Skeleton beim Retry, Zeilenlängen, Single-Quote-Import. Verworfen: integrierter Tabellenaktions-Test (fromButton macht Doppelaufruf strukturell unmöglich).

### Runde 2 (resume) — VERDICT: APPROVED

`acee109` frisch aus Git geprüft: **Beide materiellen Findings sind behoben.**

- Erfolgreiche `{data: rows}`-Antworten leeren den Card-Puffer; Fehler behalten ihn weiterhin.
- Beim Retry nach einem Reload-Fehler erscheint kein Skeleton. Beim URL-Wechsel wird der Puffer weiterhin zurückgesetzt.
- Die neuen Tests prüfen die problematischen Übergänge gezielt und würden mit der vorherigen Implementierung scheitern.
- Die beanstandeten Zeilenlängen und der Import sind korrigiert.

Der fehlende Tabellenintegrationstest bleibt eine optionale Absicherung, kein Blocker. `fromButton` verhindert die zweite Panel-Behandlung korrekt. Der Card-Button-Test allein deckt allerdings den zusätzlichen Tabellenpfad nicht ab.

Keine neuen materiellen Probleme gefunden. Isolierte Signal-Proben und `git diff --check` erfolgreich; vollständige Tests nicht erneut ausgeführt. Keine Dateien geändert.

VERDICT: APPROVED