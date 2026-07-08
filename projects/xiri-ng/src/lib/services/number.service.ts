import { Injectable } from '@angular/core';

@Injectable( {
	             providedIn: 'root'
             } )
export class XiriNumberService {
	
	private currentLocale = 'de-DE';
	
	public setLocale( locale: string ) {
		this.currentLocale = locale;
	}
	
	public formatNumber( value: number, webformat?: string ): string {
		if ( value === null || value === undefined ) {
			return '';
		}

		const digits = webformat === 'integer'
			? 0
			: /^float\d+$/.test( webformat ?? '' )
				? Number( webformat!.slice( 5 ) )
				: undefined;

		const options: Intl.NumberFormatOptions = { style: 'decimal' };
		if ( digits !== undefined ) {
			options.minimumFractionDigits = digits;
			options.maximumFractionDigits = digits;
		}

		return new Intl.NumberFormat( this.currentLocale, options ).format( value );
	}
}