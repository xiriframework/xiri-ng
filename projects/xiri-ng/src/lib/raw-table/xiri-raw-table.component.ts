import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
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
import { XiriNumberService } from "../services/number.service";
import { SafehtmlPipe } from '../pipes/safehtml.pipe';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';


export interface XiriRawTableSettings {
	data: any
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
	                       SafehtmlPipe ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriRawTableComponent {
	
	settings = input.required<XiriRawTableSettings>();
	showHeader = computed( () => this.settings().showHeader === true );

	displayedColumns: any[] = [];
	columnsToDisplay: string[] = [];
	dataSource: MatTableDataSource<any> = new MatTableDataSource();
	tableClass: string = 'dense-6';
	
	constructor() {
		effect( () => {
			if ( this.settings().dense )
				this.tableClass = 'dense-' + this.settings().dense;
			if ( this.settings().forceMinWidth )
				this.tableClass += ' force-min-width';
			
			this.loadFields( this.settings().fields );
			this.dataSource.data = this.settings().data;
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
			if ( column.align )
				column.display += ` align-${ column.align }`;
			
			this.displayedColumns.push( column );
			this.columnsToDisplay.push( column.name );
		}
	}
}
