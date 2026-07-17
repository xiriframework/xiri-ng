# XIRI-NG UX-Grundlagen

Stand: 2026-07-17

Lebende Guidelines, kein Zwang. Dieses Dokument fasst die gemeinsamen UX-Grundlagen
(Roadmap UX-002) so zusammen, dass backend-generierte Seiten dieselbe
Informationshierarchie verwenden: Nutzer sollen in Sekunden erkennen, wo sie sind,
wie der aktuelle Zustand ist, was ungewöhnlich ist und was als Nächstes zu tun ist.
Die Regeln sind Konvention, nicht Enforcement — Abweichungen sind erlaubt, wenn sie
begründet sind. Wenn du eine neue Komponente baust, gilt zusätzlich die
die Vollständigkeitsregel für neue Komponenten aus der UX-Roadmap (Planungsdokument außerhalb dieses Repos).

## Seitenbreiten & responsive Dichte

- Kompakte Inhalte (Formulare, Fließtext, Empty States, Description Lists) bekommen eine
  maximale Lesebreite und werden auf Ultra-Wide nicht unbegrenzt gestreckt.
- Tabellen und große Charts dürfen explizit Full-Width bleiben.
- Layoutentscheidungen innerhalb von Cards und halben Spalten über **Container Queries**
  treffen — nutze das bestehende `.xrow-cq`-Modell im Grid. Reine
  **Viewport-Breakpoints** nur für die App-Shell (Sidenav, Topbar, globale Navigation).
- Phone zuerst stacken, dann Details reduzieren; wichtige Information nie per
  `overflow: hidden` verlieren.
- Touchziele mindestens 44 × 44 px, auch bei kompakter Tabellendichte.
- Sticky Toolbars belegen auf Phone höchstens einen sinnvollen Teil des Viewports.

## Gemeinsames Zustandsmodell

Jede datenladende Komponente behandelt dieselben Zustände in derselben Reihenfolge:

| Zustand | Darstellung |
|---|---|
| Initial Loading | Skeleton mit ungefährer Zielgeometrie |
| Refresh | Bestehende Daten sichtbar lassen, dezenten Fortschritt zeigen |
| Empty | Was fehlt und welche nächste Aktion möglich ist |
| No Filter Results | Aktive Filter nennen und Zurücksetzen anbieten (eigener Empty State, nicht identisch zu Empty) |
| Error | Ursache verständlich, Retry und sichere Alternative |
| Partial | Vorhandene Daten zeigen, fehlenden Bereich kennzeichnen |
| Stale | Zeitpunkt der letzten Aktualisierung nennen, erneutes Laden anbieten |
| Success | Ergebnis bestätigen, ohne laufende Arbeit zu unterbrechen |

**Full-Page-Spinner nur, wenn wirklich die gesamte Seite unbenutzbar ist.** Sonst lokal laden.

## Seitentemplates

Erster Viewport enthält immer: Titel/Einordnung, aktueller Status, primäre Aktion,
kritischer Callout, max. 3–5 zentrale Kennzahlen. Nicht dorthin: große Codebeispiele,
volle Audit-Logs, lange Hilfetexte, sekundäre Diagramme.

### Dashboard

```text
Page Header + primäre Aktion
Callout für kritische Abweichungen
Stat Grid (4–6 Kennzahlen)
1–2 entscheidungsrelevante Charts
Section mit Ausnahmen / Aufgaben
Detailtabellen
```

- Wichtigste KPI oben links; jede KPI braucht Trend, Ziel oder Vergleich.
- Charts erklären Abweichungen, duplizieren nicht nur die KPI-Zahl.
- Tabellen zeigen bevorzugt Ausnahmen statt ungefilterter Gesamtdaten.

### Liste / Suche

```text
Page Header
Query / Suchfeld
Aktive Filter + Saved View + Trefferzahl
Toolbar
Tabelle / Liste / Karten
Bulk-Action-Bar bei Auswahl
```

- Filterzustand bleibt nach Navigation zurück zur Liste erhalten.
- Leere Datenmenge und „keine Treffer für Filter“ sind unterschiedliche Empty States.
- Horizontales Scrollen sichtbar signalisieren; wichtigste Spalte möglichst sticky.

### Detail

```text
Breadcrumb
Entity Summary mit Status und Aktionen
Callout für Warnungen / Handlungsbedarf
gruppierte Description Lists
fachliche Sections oder Tabs
Timeline / Audit als sekundärer Bereich
```

- Tabs nur für gleichwertige Bereiche, nie zum Verstecken der wichtigsten Daten.
- Destruktive Aktionen nicht gleichwertig neben der Primäraktion hervorheben.
- Wenige Felder im Sidepanel editieren; komplexe Bearbeitung auf eigener Seite.

### Formular

```text
Page Header
optionaler Callout / Validierungszusammenfassung
Form in fachlichen Sections
sticky oder klar wiederholte Abschlussaktionen
```

- Einspaltiges Layout als Default; nur kurze, eng zusammengehörige Felder nebeneinander.
- Labels bleiben sichtbar; Placeholder ersetzt kein Label.
- Validierung on blur am Feld; nach Submit Fokus auf den ersten Fehler.
- Ungespeicherte Änderungen vor Navigation verständlich bestätigen.

### Workflow

```text
Page Header
kurze Zielbeschreibung
Stepper
aktueller Schritt
Zurück / Weiter
Zusammenfassung vor finaler Bestätigung
```

- Drei bis sieben Schritte; auf Phone vertikal oder vollständig beschriftet.
- Eingegebene Werte bleiben beim Zurückgehen erhalten.
- Letzter Schritt fasst Auswirkungen und relevante Werte zusammen.

## Progressive Disclosure

| Muster | Verwenden für | Nicht verwenden für |
|---|---|---|
| Section | fachliche Gruppierung einer Seite | jedes einzelne Feld |
| Expansion | optionale Details, seltene Einstellungen | Status, Fehler, Primäraktion |
| Tabs | gleichwertige parallele Perspektiven | lineare Schritte |
| Stepper | feste Reihenfolge, Validierung je Schritt | frei navigierbare Details |
| Sidepanel | Kontextdetails, kurze Bearbeitung | sehr lange / verschachtelte Prozesse |
| Dialog | Bestätigung, kurze fokussierte Aufgabe | datenreiche Detailseite |

Sekundäre Sections dürfen eingeklappt starten. Geschäftskritische Information, Fehler
und die nächste notwendige Aktion bleiben immer sichtbar.

## Aktionen & Microcopy

- Pro Bereich genau **eine** visuell primäre Aktion.
- Buttontexte beschreiben das Ergebnis: „Änderungen speichern“, „3 Aufträge freigeben“,
  „Filter anwenden“ — nicht „OK“, „Submit“, „Test“.
- Destruktive Bestätigungen nennen Objekt und Auswirkung (bei Bulk-Aktionen exakte Anzahl).
- Icon-only Buttons brauchen Tooltip und zugänglichen Namen.
- Länger dauernde Aktionen zeigen Fortschritt und blockieren keine unbeteiligten Bereiche.

## Accessibility (Kernpunkte)

- Überschriftenhierarchie ohne Sprünge; Landmarken für Navigation, Hauptinhalt, Ergänzung.
- Fokusreihenfolge folgt der visuellen Reihenfolge; nach dynamischen Aktionen Fokus
  sinnvoll setzen und Änderungen ankündigen.
- Status, Trend und Pflichtinformation nicht nur farblich codieren.
- Texte bei 200 % Zoom vollständig erreichbar.
- Reduced Motion für Skeleton-, Done-, Chart- und Panel-Animationen respektieren.

## Verhältnis zu ux-recommendations.md

Die bestehende [`ux-recommendations.md`](./ux-recommendations.md) ist in Teilen veraltet
(mehrere dort noch als Kandidaten geführte Funktionen existieren bereits, u. a. Sidepanel,
Radio-Feld, Bullet-Chart, `cols`-Modell, opt-in Container Queries, Tabellen-Density). Sie
soll später aus dieser Datei bzw. der Roadmap / Component-Registry aktualisiert werden.
