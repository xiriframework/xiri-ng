import { Component, computed, effect, input, signal } from '@angular/core';
import {
	MatTableDataSource,
	MatTable,
	MatColumnDef,
	MatHeaderCellDef,
	MatHeaderCell,
	MatCellDef,
	MatCell,
	MatHeaderRowDef,
	MatHeaderRow,
	MatRowDef,
	MatRow
} from "@angular/material/table";
import { XiriTableField } from "./tabefield.interface";
import { SafehtmlPipe } from '../pipes/safehtml.pipe';
import { XiriUrlPipe } from '../pipes/url.pipe';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { cellDisplay, cellLines as cellLinesOf, normalizeCellObjects } from '../table/cell';
import type { XiriTableCellValue, XiriTableRow } from '../table/tree.service';


/** A single table row: a map of column id → cell value (value shapes vary by column format). */
export type XiriRawTableRow = Record<string, unknown>;

export interface XiriRawTableSettings {
	data: unknown
	fields?: XiriTableField[]
	density?: 'compact' | 'regular' | 'relaxed'
	dense?: number
	forceMinWidth?: boolean
	showHeader?: boolean
}

@Component( {
	            selector: 'xiri-raw-table',
	            templateUrl: './xiri-raw-table.component.html',
	            styleUrl: './xiri-raw-table.component.scss',
	            imports: [ MatTable,
	                       MatColumnDef,
	                       MatHeaderCellDef,
	                       MatHeaderCell,
	                       MatCellDef,
	                       MatCell,
	                       MatIcon,
	                       MatTooltip,
	                       RouterLink,
	                       MatHeaderRowDef,
	                       MatHeaderRow,
	                       MatRowDef,
	                       MatRow,
	                       SafehtmlPipe,
	                       XiriUrlPipe ],
            } )
export class XiriRawTableComponent {
	
	settings = input.required<XiriRawTableSettings>();
	showHeader = computed( () => this.settings().showHeader === true );

	displayedColumns: XiriTableField[] = [];
	columnsToDisplay: string[] = [];
	dataSource = new MatTableDataSource<XiriRawTableRow>();
	tableClass = signal( 'dense-6' );

	constructor() {
		effect( () => {
			const DENSITY_TO_LEVEL = { compact: 6, regular: 2, relaxed: 1 } as const;
			const density = this.settings().density;
			const level = density ? DENSITY_TO_LEVEL[ density ] : ( this.settings().dense || 6 );
			this.tableClass.set( 'dense-' + level + ( this.settings().forceMinWidth ? ' force-min-width' : '' ) );

			this.loadFields( this.settings().fields ?? [] );

			const rows = this.settings().data as XiriRawTableRow[];
			if ( normalizeCellObjects( rows as XiriTableRow[], this.displayedColumns ) )
				console.warn( 'xiri-raw-table: cells of cellObject columns must be {d, v} objects; bare values were wrapped' );
			this.dataSource.data = rows ?? [];
		} );
	}

	cellText( row: XiriRawTableRow, column: XiriTableField ): unknown {
		return cellDisplay( row[ column.id ] as XiriTableCellValue, column );
	}

	cellLines( row: XiriRawTableRow, column: XiriTableField ): unknown[] {
		return cellLinesOf( row[ column.id ] as XiriTableCellValue, column );
	}

	private loadFields( fields: XiriTableField[] ) {

		this.displayedColumns = [];
		this.columnsToDisplay = [];

		for ( let fid = 0; fid != fields.length; fid++ ) {
			const column = fields[ fid ];

			if ( column.format == 'id' )
				continue;
			if ( !column.display )
				column.display = '';
			if ( column.format )
				column.display = column.format + ' ' + column.display;
			if ( column.align )
				column.display += ` align-${ column.align }`;

			this.displayedColumns.push( column );
			this.columnsToDisplay.push( column.name );
		}
	}
}
