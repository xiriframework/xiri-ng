import { Service, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DateAdapter } from '@angular/material/core';
import { de } from 'date-fns/locale/de';
import { enGB } from 'date-fns/locale/en-GB';

export type XiriLanguage = 'de' | 'en';

@Service()
export class XiriLocaleService {
	private readonly platformId = inject( PLATFORM_ID );
	private readonly isBrowser = isPlatformBrowser( this.platformId );
	private readonly dateAdapter = inject<DateAdapter<unknown>>( DateAdapter, { optional: true } );

	private readonly _language = signal<XiriLanguage>( 'de' );
	readonly language = this._language.asReadonly();
	readonly localeString = computed( () => this._language() === 'en' ? 'en-GB' : 'de-DE' );

	constructor() {
		if ( this.isBrowser ) {
			const stored = localStorage.getItem( 'xiri-language' );
			if ( stored === 'de' || stored === 'en' )
				this._language.set( stored );
		}
		// Material-Datepicker-Locale (Picker-UI) an die Sprache angleichen — reine Frontend-Interaktion.
		// Ohne bereitgestellten DateAdapter (z. B. Text-only-Formular ohne provideDateFnsAdapter()) gibt es
		// ohnehin keinen Datepicker, daher wird der effect dann übersprungen.
		effect( () => {
			this.dateAdapter?.setLocale( this._language() === 'en' ? enGB : de );
		} );
	}

	setLanguage( lang: XiriLanguage ): void {
		this._language.set( lang );
		if ( this.isBrowser )
			localStorage.setItem( 'xiri-language', lang );
	}
}
