import { inject, Injectable } from '@angular/core';
import { DateAdapter } from "@angular/material/core";
import { format, fromUnixTime, Locale, transpose } from 'date-fns';
import { tz } from "@date-fns/tz";


@Injectable( {
	             providedIn: 'root'
             } )
export class XiriDateService {
	
	private currentTimezone: string = 'Europe/Vienna';
	private dateAdapter: DateAdapter<any> = inject( DateAdapter );
	
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
		
		return format( this.unixToLocal( stime ), 'yyyy-MM-dd HH:mm' );
	}
	
	public unixToStringDate( stime: number ): string {
		
		return format( this.unixToLocal( stime ), 'd. LLL.' );
	}
	
	public unixToStringDateYear( stime: number ): string {
		
		return format( this.unixToLocal( stime ), 'd. LLL. yy' );
	}
	
	public dateToUnix( date: Date ): number {
		
		return Math.floor( transpose( date, tz( this.currentTimezone ) ).getTime() / 1000 );
	}
}
