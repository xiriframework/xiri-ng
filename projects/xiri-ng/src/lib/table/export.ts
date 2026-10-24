import { XiriTagChip } from '../formfields/field.interface';
import { XiriTableField } from '../raw-table/tabefield.interface';
import { cellLines, sortValue } from './cell';
import type { XiriTableCellValue, XiriTableRow } from './tree.service';

/** One cell of an exported sheet: text, number or empty. */
export type XiriExportCell = string | number | null;

// Columns without a value to export.
const SKIP = [ 'buttons', 'icon', 'menu' ];

/**
 * Header row (field names) plus one row per table row, the way the Go export does it: numbers stay raw numbers,
 * everything else becomes text. ponytail: html cells go out raw; strip tags once an inline table exports html.
 */
export function exportSheet( fields: XiriTableField[], rows: XiriTableRow[] ): XiriExportCell[][] {
	const cols = fields.filter( f => !SKIP.includes( f.format ?? '' ) );
	return [
		cols.map( f => f.name ),
		...rows.map( row => cols.map( f => {
			const v = f.format === 'number' ? sortValue( row, f.id, f ) : row[ f.id ];
			if ( typeof v === 'number' )
				return v;
			if ( f.format === 'number' )
				return null;
			const lines = cellLines( row[ f.id ] as XiriTableCellValue, f )
				.map( x => typeof x === 'object' && x !== null && 'label' in x ? ( x as XiriTagChip ).label : String( x ) );
			return lines.length ? lines.join( ', ' ) : null;
		} ) ),
	];
}

// Formula injection guard, same characters as Go sanitizeExportValue.
function protect( s: string ): string {
	return /^[=+\-@\t\r\n]/.test( s ) ? '\'' + s : s;
}

/** CSV like the Go export: UTF-8 BOM, ";" separator, locale decimal sign, no thousands separator; text always quoted. */
export function toCsv( sheet: XiriExportCell[][], commaDecimal: boolean ): string {
	const cell = ( v: XiriExportCell ): string => {
		if ( v === null )
			return '';
		if ( typeof v === 'number' )
			return commaDecimal ? String( v ).replace( '.', ',' ) : String( v );
		// Text always quoted: a reader splitting on "," or tab must not get an unguarded formula cell.
		return '"' + protect( v ).replace( /"/g, '""' ) + '"';
	};
	return '\uFEFF' + sheet.map( row => row.map( cell ).join( ';' ) + '\n' ).join( '' );
}

/** .xlsx via write-excel-file (optional peerDependency, loaded on first use). */
export async function toXlsx( sheet: XiriExportCell[][] ): Promise<Blob> {
	// .catch is required: without it, a consumer app missing the optional package fails at build time (esbuild).
	const { default: writeXlsxFile } = await import( 'write-excel-file/universal' ).catch( () => {
		throw new Error( 'write-excel-file is not installed' );
	} );
	return writeXlsxFile( sheet.map( row => row.map( v => typeof v === 'string' ? protect( v ) : v ) ) ).toBlob();
}
