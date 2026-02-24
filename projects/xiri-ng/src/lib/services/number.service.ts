import { Injectable } from '@angular/core';

@Injectable( {
	             providedIn: 'root'
             } )
export class XiriNumberService {
	
	private currentLocale: string = 'de-DE';
	
	public setLocale( locale: string ) {
		this.currentLocale = locale;
	}
	
	public formatNumber( value: number, webformat?: string ): string {
		if ( value === null || value === undefined ) {
			return '';
		}
		
		let options: Intl.NumberFormatOptions;
		
		switch ( webformat ) {
			case 'integer':
				options = {
					style: 'decimal',
					minimumFractionDigits: 0,
					maximumFractionDigits: 0
				};
				break;
			case 'float1':
				options = {
					style: 'decimal',
					minimumFractionDigits: 1,
					maximumFractionDigits: 1
				};
				break;
			case 'float2':
				options = {
					style: 'decimal',
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				};
				break;
			case 'float3':
				options = {
					style: 'decimal',
					minimumFractionDigits: 3,
					maximumFractionDigits: 3
				};
				break;
			case 'float4':
				options = {
					style: 'decimal',
					minimumFractionDigits: 4,
					maximumFractionDigits: 4
				};
				break;
			default:
				options = { style: 'decimal' };
		}
		
		return new Intl.NumberFormat( this.currentLocale, options ).format( value );
	}
}