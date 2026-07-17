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

// UX-009-Kern-Invariante: Jeder im DynComponent-Renderer verwendete @case-Typ
// muss im Demo-Explorer-Katalog auffindbar sein. Der Katalog liegt im
// demo-Projekt (dort laeuft kein test-Target), daher sichert dieser Lib-Spec
// die Paritaet ab, wo `npm test` sie tatsaechlich ausfuehrt.
describe('Overview-Katalog-Paritaet', () => {
	const here = dirname(fileURLToPath(import.meta.url));
	const templateSrc: string = readFileSync(join(here, 'dyncomponent.component.html'), 'utf8');
	const catalogSrc: string = readFileSync(join(here, '../../../../demo/src/app/overview/component-catalog.ts'), 'utf8');

	// Alle @case ('X') Typen aus dem Renderer-Template.
	const rendererTypes = [...templateSrc.matchAll(/@case\s*\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]);

	// Alle `type: 'X'` Eintraege aus dem Katalog.
	const catalogTypes = [...catalogSrc.matchAll(/type:\s*'([^']+)'/g)].map((m) => m[1]);

	it('extrahiert Typen aus beiden Quellen', () => {
		expect(rendererTypes.length).toBeGreaterThan(0);
		expect(catalogTypes.length).toBeGreaterThan(0);
	});

	it('jeder Renderer-@case-Typ kommt im Katalog vor', () => {
		const missing = rendererTypes.filter((t) => !catalogTypes.includes(t));
		expect(missing, `Im Overview-Katalog fehlende Renderer-Typen: ${missing.join(', ')}`).toEqual([]);
	});
});
