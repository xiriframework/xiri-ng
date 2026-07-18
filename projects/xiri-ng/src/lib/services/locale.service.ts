import { Service, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DateAdapter } from '@angular/material/core';
import { Locale, format, fromUnixTime, transpose } from 'date-fns';
import { tz } from '@date-fns/tz';
import { de } from 'date-fns/locale/de';
import { enGB } from 'date-fns/locale/en-GB';

// `string & {}` lässt jeden String zu, behält aber die Autocomplete für die eingebauten Sprachen.
export type XiriLanguage = 'de' | 'en' | ( string & {} );

export interface XiriValidationMessages {
	required: string;
	invalidFormat: string;
	invalidEmail: string;
	valueRequired: string;
	minLength: ( min: number ) => string;
	maxLength: ( max: number ) => string;
	minNumber: ( min: number ) => string;
	maxNumber: ( max: number ) => string;
	minDate: ( date: string ) => string;
	maxDate: ( date: string ) => string;
	minDateRange: ( date: string ) => string;
	maxDateRange: ( date: string ) => string;
	minSelection: ( min: number ) => string;
	maxSelection: ( max: number ) => string;
}

export interface XiriLanguageDefinition {
	// BCP-47-Locale für Intl (Zahlen/Datumsformatierung), z. B. 'de-DE', 'fr-FR'.
	localeString: string;
	// date-fns-Locale für Material-Datepicker + Monatsnamen. Weglassen bei Text-only-Apps ohne Datepicker.
	dateFnsLocale?: Locale;
	validationMessages: XiriValidationMessages;
}

const deValidationMessages: XiriValidationMessages = {
	required: 'Pflichtfeld – bitte ausfüllen',
	invalidFormat: 'Bitte ein gültiges Format eingeben',
	invalidEmail: 'Bitte eine gültige E-Mail-Adresse eingeben',
	valueRequired: 'Bitte einen Wert angeben',
	minLength: min => `Mindestens ${ min } Zeichen erforderlich`,
	maxLength: max => `Maximal ${ max } Zeichen erlaubt`,
	minNumber: min => `Mindestens ${ min } erforderlich`,
	maxNumber: max => `Maximal ${ max } erlaubt`,
	minDate: date => `Datum darf nicht vor ${ date } liegen`,
	maxDate: date => `Datum darf nicht nach ${ date } liegen`,
	minDateRange: date => `Startdatum muss nach ${ date } liegen`,
	maxDateRange: date => `Enddatum muss vor ${ date } liegen`,
	minSelection: min => `Mindestens ${ min } Einträge auswählen`,
	maxSelection: max => `Maximal ${ max } Einträge auswählen`,
};

const enValidationMessages: XiriValidationMessages = {
	required: 'Required field',
	invalidFormat: 'Please enter a valid format',
	invalidEmail: 'Please enter a valid email address',
	valueRequired: 'Please provide a value',
	minLength: min => `At least ${ min } characters required`,
	maxLength: max => `Maximum ${ max } characters allowed`,
	minNumber: min => `Minimum value is ${ min }`,
	maxNumber: max => `Maximum value is ${ max }`,
	minDate: date => `Date must not be before ${ date }`,
	maxDate: date => `Date must not be after ${ date }`,
	minDateRange: date => `Start date must be after ${ date }`,
	maxDateRange: date => `End date must be before ${ date }`,
	minSelection: min => `Select at least ${ min } items`,
	maxSelection: max => `Select at most ${ max } items`,
};

@Service()
export class XiriLocaleService {
	private readonly platformId = inject( PLATFORM_ID );
	private readonly isBrowser = isPlatformBrowser( this.platformId );
	private readonly dateAdapter = inject<DateAdapter<unknown>>( DateAdapter, { optional: true } );

	// Registry aller bekannten Sprachen — de/en eingebaut, weitere per registerLanguage().
	private readonly registry = new Map<XiriLanguage, XiriLanguageDefinition>( [
		[ 'de', { localeString: 'de-DE', dateFnsLocale: de, validationMessages: deValidationMessages } ],
		[ 'en', { localeString: 'en-GB', dateFnsLocale: enGB, validationMessages: enValidationMessages } ],
	] );

	private readonly _language = signal<XiriLanguage>( 'de' );
	readonly language = this._language.asReadonly();
	readonly localeString = computed( () => this.registry.get( this._language() )?.localeString ?? 'de-DE' );
	// Aktives date-fns-Locale (für Datums-Formatierung + Datepicker). Undefined bei Text-only-Sprache.
	readonly dateFnsLocale = computed( () => this.registry.get( this._language() )?.dateFnsLocale );

	// Zeitzone für alle Unix<->Local-Umrechnungen (locale-nahe Präsentations-Info, analog Go-uicontext).
	private currentTimezone = 'Europe/Vienna';

	constructor() {
		const stored = this.readStoredLanguage();
		// Nur wiederherstellen, wenn die Sprache bekannt ist (de/en oder bereits registriert).
		if ( stored && this.registry.has( stored ) )
			this._language.set( stored );
		// Material-Datepicker-Locale (Picker-UI) an die Sprache angleichen — reine Frontend-Interaktion.
		// Ohne bereitgestellten DateAdapter (Text-only-Formular) oder ohne date-fns-Locale wird übersprungen.
		effect( () => {
			const locale = this.dateFnsLocale();
			if ( locale )
				this.dateAdapter?.setLocale( locale );
		} );
	}

	// Sprache registrieren/überschreiben. Vor setLanguage() bzw. dem ersten Formular-Render aufrufen (App-Init).
	registerLanguage( code: XiriLanguage, def: XiriLanguageDefinition ): void {
		this.registry.set( code, def );
		// Über Reload persistierte Custom-Sprache einklinken, sobald sie (nach)registriert wird —
		// der Konstruktor kennt beim Restore nur de/en.
		if ( this.readStoredLanguage() === code )
			this._language.set( code );
	}

	setLanguage( lang: XiriLanguage ): void {
		if ( !this.registry.has( lang ) ) {
			console.warn( `XiriLocaleService: unbekannte Sprache '${ lang }' – zuerst registerLanguage() aufrufen.` );
			return;
		}
		this._language.set( lang );
		this.storeLanguage( lang );
	}

	// Validierungs-Fehlertexte der aktiven Sprache; Fallback de, falls (unerwartet) nicht vorhanden.
	validationMessagesFor(): XiriValidationMessages {
		return this.registry.get( this._language() )?.validationMessages
			?? this.registry.get( 'de' )!.validationMessages;
	}

	// ── Zeitzone + Datums-/Zahlen-Formatierung (locale-abhängig) ─────────────────────────────

	setTimezone( timezone: string ): void {
		this.currentTimezone = timezone;
	}

	unixToLocal( stime: number ): Date | null {
		if ( stime === null || stime === undefined )
			return null;
		return fromUnixTime( stime, { in: tz( this.currentTimezone ) } );
	}

	unixToStringDateTime( stime: number ): string {
		const date = this.unixToLocal( stime );
		return date === null ? '' : format( date, 'yyyy-MM-dd HH:mm', { locale: this.dateFnsLocale() } );
	}

	unixToStringDate( stime: number ): string {
		const date = this.unixToLocal( stime );
		// Kein Punkt hinter LLL: die Interpunktion des Monatskürzels bringt das jeweilige Locale
		// selbst mit (de/fr: 'Mär.'/'juil.', en: 'Jul' ohne) — ein fixer Punkt gäbe sonst '18. Mär..'.
		return date === null ? '' : format( date, 'd. LLL', { locale: this.dateFnsLocale() } );
	}

	unixToStringDateYear( stime: number ): string {
		const date = this.unixToLocal( stime );
		return date === null ? '' : format( date, 'd. LLL yy', { locale: this.dateFnsLocale() } );
	}

	dateToUnix( date: Date ): number {
		return Math.floor( transpose( date, tz( this.currentTimezone ) ).getTime() / 1000 );
	}

	formatNumber( value: number, webformat?: string ): string {
		if ( value === null || value === undefined )
			return '';

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

		return new Intl.NumberFormat( this.localeString(), options ).format( value );
	}

	// localStorage-Zugriff abgesichert: im SSR nicht vorhanden, in jsdom-Tests ggf. undefined,
	// im Private-Mode wirft es SecurityError. In all diesen Fällen still ohne Persistenz weiterlaufen.
	private readStoredLanguage(): string | null {
		if ( !this.isBrowser )
			return null;
		try {
			return localStorage.getItem( 'xiri-language' );
		} catch {
			return null;
		}
	}

	private storeLanguage( lang: XiriLanguage ): void {
		if ( !this.isBrowser )
			return;
		try {
			localStorage.setItem( 'xiri-language', lang );
		} catch {
			// Persistenz nicht verfügbar (Private-Mode o. Ä.) — Sprachwechsel gilt trotzdem für die Session.
		}
	}
}
