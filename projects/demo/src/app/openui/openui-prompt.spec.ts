import { describe, it, expect } from 'vitest';
// Die spec-tsconfig setzt `types: []`, daher sind die node:*-Builtins nicht typisiert (siehe catalog-parity.spec.ts).
// @ts-expect-error - node:fs ist zur Laufzeit vorhanden, aber nicht typisiert
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
// @ts-expect-error - node:url ist zur Laufzeit vorhanden, aber nicht typisiert
import { fileURLToPath } from 'node:url';
// @ts-expect-error - node:path ist zur Laufzeit vorhanden, aber nicht typisiert
import { dirname, join } from 'node:path';
import { xiriOpenUiPrompt } from './openui-library';

// Die Brücke (openui-bridge.mjs) liest den Systemprompt aus dieser Datei, weil sie kein TypeScript lädt.
// ponytail: bei Abweichung schreibt die Spec die Datei neu und schlägt fehl; der nächste Lauf ist grün, git zeigt die Änderung.
describe( 'openui-prompt.txt', () => {
	it( 'entspricht dem Prompt der Bibliothek', () => {
		const file = join( dirname( fileURLToPath( import.meta.url ) ), 'openui-prompt.txt' );
		const expected = xiriOpenUiPrompt;
		const actual = existsSync( file ) ? readFileSync( file, 'utf8' ) : null;
		if ( actual !== expected )
			writeFileSync( file, expected );
		expect( actual, 'openui-prompt.txt war veraltet und wurde neu geschrieben, bitte committen' ).toBe( expected );
	} );
} );
