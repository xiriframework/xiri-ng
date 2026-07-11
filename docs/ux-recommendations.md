# xiri-ng — UX-Empfehlungen aus NotebookLM-Research

Konsolidierte, umsetzbare Empfehlungen für die Weiterentwicklung von xiri-ng.
Basis: 5 thematische NotebookLM-Recherchen (je eigenes Notebook, siehe unten),
gemappt auf die konkreten xiri-ng-Bausteine.

**Quell-Notebooks:** UX 1 Component-Auswahl (deep, 50 Q.) · UX 1b kompakt ·
UX 2 Responsive · UX 3 Datendarstellung · UX 4 Typografie · UX 5 Formulare.

---

## 1. Wann welche Component? — Entscheidungsmatrix

**Leitfrage: Was ist der Job des Nutzers — Vergleichen, Scannen oder Erkennen?**

| xiri-ng Component | Einsetzen wenn … | Anti-Pattern |
|---|---|---|
| `xiri-table` / `raw-table` | Attribute über **mehrere Objekte vergleichen**; Sortieren/Filtern strukturierter Daten | Als Excel-Ersatz; bei Platzmangel ohne Horizontal-Scroll |
| `xiri-description-list` | **Eigenschaften EINES Objekts** (Metadaten-Panel, Key-Value) | >10–15 Paare ohne Gruppierung; für vergleichbare Daten |
| `xiri-stat` / `stat-grid` | **Einzelne kritische Kennzahlen**, 5-Sekunden-Überblick | >5–9 Kacheln; Zahl ohne Kontext (Trend/Ziel) |
| `xiri-list` | Linearer **Stream mit wenigen Attributen** (Inbox, Aktivitäten) | Für Daten, die spaltenweise verglichen werden müssen |
| `xiri-card` | **Visuelles Browsen**, in sich geschlossene Elemente, Thumbnails | Für tabellarische Vergleiche; zu viele Karten = Rauschen |

**Progressive Disclosure:**
- `xiri-tabs` → **gleichwertige, parallele** Sektionen; schneller Wechsel ohne Kontextverlust. Nicht für Schrittfolgen, nicht zu viele Tabs auf Mobile.
- `xiri-stepper` → **sequenzielle** Prozesse mit fester Reihenfolge, ideal **3–7 Schritte** (Onboarding, Checkout). Nicht für Random-Access.
- `xiri-expansion` → **optionale/sekundäre** Inhalte (FAQ, Details), platzsparend auf Mobile. Nie geschäftskritische Infos verstecken; keine tiefe Verschachtelung.

**Overlays:**
- `xiri-dialog` (Modal) → kurze, fokussierte Aufgaben, Bestätigungen. **Nicht** für tiefe Datenhierarchien — dort eigene URL/Seite statt Modal.
- **Side Panel** → ergänzende Infos/Konfiguration bei sichtbarem Hauptkontext; mehr Platz als Modal für datenreiche Formulare. *(In xiri-ng heute nicht als eigene Component — Kandidat für Neubau; `xiri-sidenav` deckt Navigation, nicht kontextuelle Detail-Panels ab.)*
- **Inline-Form** → schnelle Einzelfeld-Updates direkt in Tabelle/Liste. Nicht für komplexe Validierung/lange Formulare.

---

## 2. Responsive Breiten — die größte konzeptionelle Lücke

**Status quo:** statisches Bootstrap-artiges 12-Spalten-Grid (`grid.scss`), Feldbreite = manueller Klassen-String (`xcol xcol-md-6`), **keine Container Queries**.

**Empfehlungen:**
- **Container Queries statt reiner Media Queries** für eine Component-Library. Media Queries reagieren nur auf den Viewport → eine Component verhält sich in schmaler Sidebar wie im breiten Hauptbereich falsch. Container Queries reagieren auf den **Elterncontainer** → portabel, ideal für Design-Systeme, Stand 2026 produktiv einsetzbar. **Das ist der wichtigste Architektur-Hebel für xiri-ng.**
- **Breakpoints** (mobile-first, „design for content, not devices"): Basis 320px, dann 768 (Tablet), 1024 (Desktop), 1200+ (XL). Deckt sich mit dem bestehenden xs/sm/md/lg/xl/xxl-Set.
- **Formularfeld-Breiten:** default **einspaltig** (volle Breite) — auf allen Größen, mit **Max-Breite** des Containers gegen zu lange Zeilen. Nur eng verwandte Paare (Vor-/Nachname, PLZ/Ort) auf ≥768px nebeneinander.
- **Kollaps-Regel:** unter 768px mehrspaltige Grids/Dashboards **zwingend** auf 1 Spalte stacken (vermeidet übersehene Felder / Z-Muster).
- **Relative Einheiten:** `rem`/`em` für Abstände & Typo, `%` für Containerbreiten.
- **Deklaratives Breiten-Modell erwägen:** statt String `xcol xcol-md-6` ein typisiertes `cols`-Property pro Feld/Component (wie es `description-list.columns` und `stat-grid.columns` schon vormachen) — reduziert Fehler und macht Breite Teil der JSON-API.

**Responsive Tabellen:** Sticky Header + fixierte erste Spalte (Ankerspalte); Horizontal-Scroll mit klarem Signal; alternativ Spalten-Auswahl-Modus oder Accordion-Gruppierung auf Mobile.

---

## 3. Datendarstellung (Tabellen, Zahlen, KPIs, Charts)

**Tabellen (`xiri-table` / `raw-table`):**
- Density als **3 benannte Stufen**: Condensed 40px / Regular 48px / Relaxed 56px; idealerweise vom Nutzer umschaltbar. (xiri hat `dense`/`dense-{n}` — auf diese 3 Stufen normieren.)
- **Zahlen rechtsbündig** (Dezimalstellen untereinander), Text linksbündig, Header folgt der Zell-Ausrichtung.
- **Tabellenziffern**: `font-variant-numeric: tabular-nums` (statt echter Monospace-Font) für gleiche Ziffernbreite.
- **Sticky Header** (und Sticky Footer für Summen).
- **Pagination** default (klare Orientierung „Seite 2/10"), Infinite Scroll nur für exploratives Browsen.

**Formatierung:** `XiriNumberService` (Intl, de-DE) ist richtig aufgesetzt. Für Datum konsequent `Intl.DateTimeFormat` mit Locale nutzen (TT.MM.JJJJ vs. MM/TT/JJJJ).

**KPI (`xiri-stat` / `stat-grid`):** max. 5–9 Kacheln; jede mit **Kontext** (Zielwert, Trend/Vorperiode, Status-Farbe R/G/G). Wichtigstes oben links. Rohzahl ohne Vergleich vermeiden.

**Charts (ECharts-Host):**
- `barchart` → Kategorien vergleichen. `linechart` → **Trends über Zeit**.
- `piechart` **kritisch** — nur mit ≤4 Segmenten, nie Dashboard-Fokus.
- `gaugechart` frisst Platz für wenig Info → **Bullet-Chart** als kompaktere Alternative erwägen.
- `heatmap` → Farbe lenkt auf Extremwerte bei erhaltenen Zahlenwerten.

---

## 4. Typografie, Text & Lesbarkeit

- **Basis 16px** Fließtext, mathematische Type-Scale (z.B. 12/14/16/18/20/24/28). xiri hat bereits `--xiri-font-size-*` — auf eine konsistente Skala festziehen.
- **Zeilenlänge 45–80 Zeichen** (CPL), **Zeilenhöhe 1,5×** (in dichten Tabellen leicht reduziert).
- **Visuelle Hierarchie** über Größe + Gewicht (Regular/SemiBold) + Position (oben-links zuerst wahrgenommen).
- **Labels permanent sichtbar**; kritischer Hilfetext dauerhaft (nicht in Tooltips verstecken); **Placeholder ≠ Label**.
- **Microcopy:** klare Sprache, handlungsorientierte Buttons („Konto erstellen" statt „Senden"), empathische Fehlermeldungen (was ist passiert + wie beheben).
- **Whitespace** als aktives Gestaltungsmittel (Makro zwischen Sektionen, Mikro als Padding/Leading).
- **A11y:** `rem` für proportionale Skalierung; WCAG-Basis ≥16px, 1,5× Zeilenhöhe, ≤80 CPL; ausreichender Kontrast; interaktive Elemente per Tastatur erreichbar/Esc-schließbar.

---

## 5. Formular-UX (`xiri-form-fields`)

- **Einspaltiges Layout** default (siehe §2). Verwandte Felder mit `<fieldset>`/`<legend>` gruppieren (auch für Screenreader).
- **Labels oben** (top-aligned) — schnellstes Erfassen. Pflichtfelder mit `*`.
- **Richtiger Eingabetyp:**
  - <6 Optionen → Radio (single) / Checkbox (multi) statt `select`. *(xiri hat kein Radio als eigenen Typ — Kandidat.)*
  - Große Listen → filterbare Combobox (`select`/`multiselect` mit Suche).
  - Häufige Optionen als sichtbare **Chips/Buttons** (`chips` vorhanden).
  - Datum: Picker für zeitnahe, **manuelle Eingabe** für ferne Daten (Geburtsdatum); Trennzeichen tolerant parsen.
  - HTML5-`type` (tel/email/number) für passende Mobile-Tastatur.
- **Inline-Validierung on-blur** (nicht per Tastendruck, nicht erst beim Submit); Meldung direkt am Feld, konstruktiv, nicht nur Farbe (auch Icon).
- **Bedingte Felder:** `showWhen` (bereits vorhanden!) für Conditional/Progressive Disclosure nutzen — Clutter reduzieren.
- **Stepper** für lange Formulare (Chunking, Fortschrittsanzeige; einfache Fragen zuerst, sensible zuletzt).
- **Smart Defaults** (95%-Regel, immer editierbar); **Autofocus** aufs erste Feld; Browser-`autocomplete`; nur nötige Felder abfragen.

---

## Priorisierte Roadmap-Kandidaten für xiri-ng

1. **Container Queries** einführen (größter Hebel; ergänzt/ersetzt teils das media-query-`xcol`-Grid).
2. **Deklaratives `cols`-Breitenmodell** statt Klassen-String (analog `description-list.columns`).
3. **Table-Density auf 3 Stufen** normieren + **`tabular-nums`** + rechtsbündige Zahlen als Default für numerische Spalten.
4. **Side-Panel-Component** für kontextuelle Detail-/Edit-Ansichten (Alternative zum Dialog).
5. **Radio-Field-Typ** für <6-Optionen-Auswahl.
6. **Chart-Defaults**: Pie/Gauge-Nutzung einschränken, Bullet-Chart-Option.
7. **Type-Scale & Spacing-Tokens** konsolidieren, WCAG-Defaults verankern.

---

## Quellen

Vollständige Quellenlisten (mit Zitat-Nummern) in den NotebookLM-Notebooks. Zentrale Referenzen:
- **Component-Auswahl:** Carbon Design System, NN/G (Data Tables), UX Planet, Salsa Digital (Accordion), Prisma Design System (Stepper)
- **Responsive:** Baymard Institute (Form Layouts), Handoff.design (Container Queries), NN/G (Mobile Tables), Kaarwan (12-Column Grid)
- **Datendarstellung:** NN/G, Pencil & Paper, Domo (KPI Dashboards), Tableau (Chart-Auswahl)
- **Typografie:** Carbon Design System, Material Design 3, Tubik Studio (Whitespace), WCAG 2.1
- **Formulare:** NN/G, Smashing Magazine, Reform.app (Smart Defaults), LogRocket (Progressive Disclosure)
