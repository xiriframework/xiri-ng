import { XiriFormField } from '../field.interface';

// Startwert einer Zelle in einer neuen Zeile: value des Unterfelds, sonst wie form-fields (text '', bool false).
export function cellDefault( sub: XiriFormField ): unknown {
	if ( sub.value !== undefined )
		return sub.value;
	if ( sub.type === 'text' )
		return '';
	if ( sub.type === 'bool' )
		return false;
	if ( sub.type === 'select' && sub.multiple )
		return [];
	return null;
}

// Text wird getrimmt verglichen, weil xiri-go Text beim Parsen trimmt.
export function isBlank( value: unknown ): boolean {
	return value === null || value === undefined || ( typeof value === 'string' && value.trim() === '' )
		|| ( Array.isArray( value ) && value.length === 0 );
}

// Leere Zeile: jede sichtbare Zelle leer oder auf ihrem Default, jede versteckte leer. Gegenstück:
// RowsField.rowIsEmpty in xiri-go - weichen beide ab, verrutschen die Zeilenindizes der Server-Fehler.
export function isEmptyRow( subs: XiriFormField[], row: Record<string, unknown> ): boolean {
	const norm = ( v: unknown ) => typeof v === 'string' ? v.trim() : v;
	return subs.every( sub => {
		// Gesperrte Zellen zählen nicht: xiri-go ignoriert den Client-Wert und nimmt den Default.
		if ( sub.disabled )
			return true;
		const value = row[ sub.id ];
		if ( isBlank( value ) )
			return true;
		return !sub.hide && String( norm( value ) ) === String( norm( cellDefault( sub ) ) );
	} );
}

// Vergleichsschlüssel für unique; null, wenn alle Werte leer sind (zählt nicht als Duplikat).
export function uniqueKey( ids: string[], row: Record<string, unknown> ): string | null {
	const parts = ids.map( id => isBlank( row[ id ] ) ? '' : String( row[ id ] ).trim().toLowerCase() );
	return parts.every( p => p === '' ) ? null : parts.join( '\u0000' );
}
