import { inject, Injectable } from '@angular/core';
import { DateAdapter } from "@angular/material/core";
import { format, fromUnixTime, Locale, transpose } from 'date-fns';
import { tz } from "@date-fns/tz";


@Injectable( {
	             providedIn: 'root'
             } )
export class XiriDateService {
	
	private currentTimezone = 'Europe/Vienna';
	private dateAdapter: DateAdapter<unknown> = inject( DateAdapter );
	
	public setTimezone( tz: string ) {
		
		this.currentTimezone = tz;
	}
	
	public setLocale( localeString: string, locale: Locale ) {
		
		this.dateAdapter.setLocale( locale );
	}
	
	public unixToLocal( stime: number ): Date | null {
		
		if ( stime === null || stime === undefined )
			return null;
		
		return fromUnixTime( stime, { in: tz( this.currentTimezone ) } );
	}
	
	public unixToStringDateTime( stime: number ): string {

		const date = this.unixToLocal( stime );
		return date === null ? '' : format( date, 'yyyy-MM-dd HH:mm' );
	}

	public unixToStringDate( stime: number ): string {

		const date = this.unixToLocal( stime );
		return date === null ? '' : format( date, 'd. LLL.' );
	}

	public unixToStringDateYear( stime: number ): string {

		const date = this.unixToLocal( stime );
		return date === null ? '' : format( date, 'd. LLL. yy' );
	}
	
	public dateToUnix( date: Date ): number {
		
		return Math.floor( transpose( date, tz( this.currentTimezone ) ).getTime() / 1000 );
	}
}
