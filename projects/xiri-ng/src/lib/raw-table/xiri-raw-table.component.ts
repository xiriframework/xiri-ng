import { Component, computed, effect, input } from '@angular/core';
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


/** A single table row: a map of column id → cell value (value shapes vary by column format). */
export type XiriRawTableRow = Record<string, unknown>;

export interface XiriRawTableSettings {
	data: unknown
	fields?: XiriTableField[]
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
	tableClass = 'dense-6';

	constructor() {
		effect( () => {
			if ( this.settings().dense )
				this.tableClass = 'dense-' + this.settings().dense;
			if ( this.settings().forceMinWidth )
				this.tableClass += ' force-min-width';

			this.loadFields( this.settings().fields ?? [] );
			this.dataSource.data = this.settings().data as XiriRawTableRow[];
		} );
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
