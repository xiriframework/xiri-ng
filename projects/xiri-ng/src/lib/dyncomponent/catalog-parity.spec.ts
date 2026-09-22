import { describe, it, expect } from 'vitest';
// Die spec-tsconfig setzt `types: []`, daher fehlen @types/node und die
// node:*-Builtins sind nicht typisierbar. Zur Laufzeit (node) loest der
// Test-Runner sie korrekt auf; die Typpruefung wird pro Zeile unterdrueckt.
// @ts-expect-error - node:fs ist zur Laufzeit vorhanden, aber nicht typisiert
import { readFileSync } from 'node:fs';
// @ts-expect-error - node:url ist zur Laufzeit vorhanden, aber nicht typisiert
import { fileURLToPath } from 'node:url';
// @ts-expect-error - node:path ist zur Laufzeit vorhanden, aber nicht typisiert
import { dirname, join } from 'node:path';
import { XIRI_COMPONENT_TYPES } from './dyndata.interface';
import { COMPONENT_CATALOG } from './component-catalog';

// Vertrag: XIRI_COMPONENT_TYPES ist die einzige Quelle. Renderer-@case und Katalog muessen dazu passen.
// ponytail: Regex-Scan auf dem Template statt @angular/compiler; reicht, solange es genau einen @switch gibt.
describe('Komponenten-Vertrag', () => {
	const here = dirname(fileURLToPath(import.meta.url));
	const templateSrc: string = readFileSync(join(here, 'dyncomponent.component.html'), 'utf8')
		.replace(/<!--[\s\S]*?-->/g, '');
	const rendererTypes = [...templateSrc.matchAll(/@case\s*\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]);
	const contract: readonly string[] = XIRI_COMPONENT_TYPES;
	const catalogTypes: string[] = COMPONENT_CATALOG.map((e) => e.type);

	it('extrahiert @case-Typen aus dem Renderer', () => {
		expect(rendererTypes.length).toBeGreaterThan(0);
	});

	it('jeder Renderer-@case-Typ steht in XIRI_COMPONENT_TYPES', () => {
		const missing = rendererTypes.filter((t) => !contract.includes(t));
		expect(missing, `Fehlt in XIRI_COMPONENT_TYPES: ${missing.join(', ')}`).toEqual([]);
	});

	it('jeder Vertragstyp hat einen Renderer-@case', () => {
		const missing = contract.filter((t) => !rendererTypes.includes(t));
		expect(missing, `Ohne @case im Renderer: ${missing.join(', ')}`).toEqual([]);
	});

	it('Katalog und Vertrag sind deckungsgleich', () => {
		expect([...catalogTypes].sort()).toEqual([...contract].sort());
	});

	it('Katalog hat keine doppelten Typen', () => {
		expect(new Set(catalogTypes).size).toBe(catalogTypes.length);
	});

	it('dyncomponent-Flag im Katalog entspricht dem Renderer', () => {
		const wrong = COMPONENT_CATALOG.filter((e) => e.dyncomponent !== rendererTypes.includes(e.type)).map((e) => e.type);
		expect(wrong, `dyncomponent-Flag falsch: ${wrong.join(', ')}`).toEqual([]);
	});
});
