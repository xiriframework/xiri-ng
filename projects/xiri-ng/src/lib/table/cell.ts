import { XiriTagChip } from '../formfields/field.interface';
import { XiriTableField } from '../raw-table/tabefield.interface';
import type { XiriTableCellValue, XiriTableRow } from './tree.service';

/**
 * Cell object delivered by the Go builder for date, dateTime, timeLength, text2* and *N fields
 * (field JSON: cellObject: 'string'). d is what the format renders (string, [a, b] or [lines…]); v is the
 * raw value in a form that both sorts and edits: ISO date, local ISO datetime, seconds, number.
 * v === null means empty. Further keys are reserved; clients ignore what they do not know.
 */
export interface XiriCellObject {
	d: XiriTableCellValue;
	v: string | number | null;
	[key: string]: XiriTableCellValue;
}

export function isCellObject( cell: XiriTableCellValue ): cell is XiriCellObject {
	return typeof cell === 'object' && cell !== null && !Array.isArray( cell ) && 'd' in cell && 'v' in cell;
}

/** A cell object for sure: objects pass through, anything else (a server patched a bare value) shows as is and sorts empty. */
export function asCellObject( cell: XiriTableCellValue ): XiriCellObject {
	return isCellObject( cell ) ? cell : { d: cell ?? '', v: null };
}

/** What a cell shows: cell object → d; legacy number tuple → [0]; anything else as is. */
export function cellDisplay( cell: XiriTableCellValue, column: XiriTableField | undefined ): XiriTableCellValue {
	if ( isCellObject( cell ) )
		return cell.d;
	if ( column?.format === 'number' && Array.isArray( cell ) )
		return cell[ 0 ];
	return cell;
}

/** Display lines of a text2/textn cell: arrays as they are, nothing for null, a scalar as its single line. */
export function cellLines( cell: XiriTableCellValue, column: XiriTableField | undefined ): XiriTableCellValue[] {
	const d = cellDisplay( cell, column );
	if ( Array.isArray( d ) )
		return d;
	return d === null || d === undefined || d === '' ? [] : [ d ];
}

/**
 * The value a column sorts (and sums) by. Decided per column, never per row, so one column never
 * mixes numbers and strings — MatTableDataSource would coerce the numbers to strings otherwise.
 * A cellObject cell without a string/number v sorts like an empty cell ('').
 */
export function sortValue( row: XiriTableRow, columnId: string, column: XiriTableField | undefined ): string | number {
	const cell = row[ columnId ] as XiriTableCellValue;
	if ( column?.cellObject ) {
		const v = isCellObject( cell ) ? cell.v : undefined;
		return typeof v === 'number' || typeof v === 'string' ? v : '';
	}
	if ( column?.format === 'number' )
		return ( cell as XiriTableCellValue[] )?.[ 1 ] as number;
	// ponytail: sort by the first chip's label — without this MatTable compares the raw object
	// array, which coerces to "[object Object],..." and effectively sorts by chip count.
	if ( column?.format === 'chips' )
		return ( cell as XiriTagChip[] | null | undefined )?.[ 0 ]?.label ?? '';
	return cell as string | number;
}

/**
 * Replaces non-object cells of cellObject columns in place (rows built by hand, servers patching bare
 * values). Returns true when something was replaced, so the caller can warn once. A missing cell
 * (undefined — the row simply has no value for the column) is left alone: absent is not malformed.
 */
export function normalizeCellObjects( rows: XiriTableRow[], columns: XiriTableField[] ): boolean {
	let replaced = false;
	const objectColumns = columns.filter( c => c.cellObject );
	for ( const row of rows )
		for ( const col of objectColumns ) {
			const cell = row[ col.id ] as XiriTableCellValue;
			if ( cell !== undefined && !isCellObject( cell ) ) {
				row[ col.id ] = asCellObject( cell );
				replaced = true;
			}
		}
	return replaced;
}
