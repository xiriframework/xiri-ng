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

// Drift-Test: Jeder im DynComponent-Renderer verwendete @case-Typ muss auch
// in der TypeScript-Union XiriDynDataType vorhanden sein. So faellt kuenftiger
// Drift zwischen Renderer-Template und Typdefinition automatisch auf.
describe('XiriDynDataType parity', () => {
	const here = dirname(fileURLToPath(import.meta.url));
	const templateSrc: string = readFileSync(join(here, 'dyncomponent.component.html'), 'utf8');
	const interfaceSrc: string = readFileSync(join(here, 'dyndata.interface.ts'), 'utf8');

	// Alle @case ('X') Typen aus dem Template.
	const rendererTypes = [...templateSrc.matchAll(/@case\s*\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]);

	// Alle Union-Member aus der XiriDynDataType-Deklaration.
	const unionBody = interfaceSrc.match(/export type XiriDynDataType\s*=([\s\S]*?);/)?.[1] ?? '';
	const unionTypes = [...unionBody.matchAll(/'([^']+)'/g)].map((m) => m[1]);

	it('extrahiert Typen aus beiden Quellen', () => {
		expect(rendererTypes.length).toBeGreaterThan(0);
		expect(unionTypes.length).toBeGreaterThan(0);
	});

	it('jeder Renderer-@case-Typ ist in der Union XiriDynDataType enthalten', () => {
		const missing = rendererTypes.filter((t) => !unionTypes.includes(t));
		expect(missing, `In XiriDynDataType fehlende Renderer-Typen: ${missing.join(', ')}`).toEqual([]);
	});
});
