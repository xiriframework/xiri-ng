import { Service, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { MatPaginatorIntl } from '@angular/material/paginator';
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
	// Optional, damit per registerLanguage registrierte Sprachen ohne ihn weiter kompilieren; fehlt er, gilt der
	// eingebaute deutsche Text. `size` ist schon lesbar formatiert (z. B. „10 MB“).
	maxFileSize?: ( size: string ) => string;
	// Zeilen-Feld (rows). Optional wie maxFileSize: fehlt einer, gilt der eingebaute deutsche Text.
	minRows?: ( min: number ) => string;
	maxRows?: ( max: number ) => string;
	duplicate?: string;
}

// Texte der Material-Intl-Singletons (aria-labels, Tooltips, Paginator-Beschriftung). Fehlende Keys = Material-Default.
// formatYearRange* bleiben draußen: als Own-Property überschrieben, würden sie beim Rückfall nicht zurückgesetzt.
export interface XiriMaterialLabels {
	datepicker?: Partial<Omit<MatDatepickerIntl, 'changes' | 'formatYearRange' | 'formatYearRangeLabel'>>;
	paginator?: Partial<Omit<MatPaginatorIntl, 'changes'>>;
}

// Feste Texte der Chat-Komponente (aria-Labels, Trenner, Knöpfe). Fehlende Keys = Deutsch.
export interface XiriChatLabels {
	input: string;
	send: string;
	newMessages: string;
	retry: string;
	loadingOlder: string;
	today: string;
	yesterday: string;
	sending: string;
	sent: string;
	delivered: string;
	read: string;
	failed: string;
}

export interface XiriLanguageDefinition {
	// BCP-47-Locale für Intl (Zahlen/Datumsformatierung), z. B. 'de-DE', 'fr-FR'.
	localeString: string;
	// date-fns-Locale für Material-Datepicker + Monatsnamen. Weglassen bei Text-only-Apps ohne Datepicker.
	dateFnsLocale?: Locale;
	validationMessages: XiriValidationMessages;
	// Material-Datepicker-/Paginator-Texte. Weglassen = englische Material-Defaults.
	materialLabels?: XiriMaterialLabels;
	// Chat-Texte. Weglassen oder einzelne Keys weglassen = Deutsch.
	chatLabels?: Partial<XiriChatLabels>;
}

const deValidationMessages: Required<XiriValidationMessages> = {
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
	maxFileSize: size => `Datei zu groß, maximal ${ size }`,
	minRows: min => `Mindestens ${ min } Zeilen erforderlich`,
	maxRows: max => `Maximal ${ max } Zeilen erlaubt`,
	duplicate: 'Eintrag ist doppelt',
};

const deMaterialLabels: XiriMaterialLabels = {
	datepicker: {
		calendarLabel: 'Kalender',
		openCalendarLabel: 'Kalender öffnen',
		closeCalendarLabel: 'Kalender schließen',
		prevMonthLabel: 'Vorheriger Monat',
		nextMonthLabel: 'Nächster Monat',
		prevYearLabel: 'Vorheriges Jahr',
		nextYearLabel: 'Nächstes Jahr',
		prevMultiYearLabel: 'Vorherige 24 Jahre',
		nextMultiYearLabel: 'Nächste 24 Jahre',
		switchToMonthViewLabel: 'Datum auswählen',
		switchToMultiYearViewLabel: 'Monat und Jahr auswählen',
		startDateLabel: 'Startdatum',
		endDateLabel: 'Enddatum',
		comparisonDateLabel: 'Vergleichszeitraum',
	},
	paginator: {
		itemsPerPageLabel: 'Pro Seite:',
		nextPageLabel: 'Nächste Seite',
		previousPageLabel: 'Vorherige Seite',
		firstPageLabel: 'Erste Seite',
		lastPageLabel: 'Letzte Seite',
		// Logik wie Material-Default, nur „von“ statt „of“.
		getRangeLabel: ( page, pageSize, length ) => {
			if ( length === 0 || pageSize === 0 )
				return `0 von ${ length }`;
			const start = page * pageSize;
			const end = start < length ? Math.min( start + pageSize, length ) : start + pageSize;
			return `${ start + 1 } – ${ end } von ${ length }`;
		},
	},
};

const deChatLabels: XiriChatLabels = {
	input: 'Nachricht', send: 'Senden', newMessages: 'Neue Nachrichten', retry: 'Erneut senden',
	loadingOlder: 'Ältere Nachrichten werden geladen', today: 'Heute', yesterday: 'Gestern',
	sending: 'Wird gesendet', sent: 'Gesendet', delivered: 'Zugestellt', read: 'Gelesen', failed: 'Nicht gesendet',
};

const enChatLabels: XiriChatLabels = {
	input: 'Message', send: 'Send', newMessages: 'New messages', retry: 'Send again',
	loadingOlder: 'Loading older messages', today: 'Today', yesterday: 'Yesterday',
	sending: 'Sending', sent: 'Sent', delivered: 'Delivered', read: 'Read', failed: 'Not sent',
};

const enValidationMessages: Required<XiriValidationMessages> = {
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
	maxFileSize: size => `File too large, maximum ${ size }`,
	minRows: min => `At least ${ min } rows required`,
	maxRows: max => `At most ${ max } rows allowed`,
	duplicate: 'Duplicate entry',
};

@Service()
export class XiriLocaleService {
	private readonly platformId = inject( PLATFORM_ID );
	private readonly isBrowser = isPlatformBrowser( this.platformId );
	private readonly dateAdapter = inject<DateAdapter<unknown>>( DateAdapter, { optional: true } );
	private readonly datepickerIntl = inject( MatDatepickerIntl );
	private readonly paginatorIntl = inject( MatPaginatorIntl );
	// Startwerte (Material-Default oder App-eigene Intl-Subklasse) als Rückfall für Sprachen ohne materialLabels.
	private readonly datepickerDefaults = { ...this.datepickerIntl };
	private readonly paginatorDefaults = { ...this.paginatorIntl };

	// Registry aller bekannten Sprachen — de/en eingebaut, weitere per registerLanguage().
	private readonly registry = new Map<XiriLanguage, XiriLanguageDefinition>( [
		[ 'de', {
			localeString: 'de-DE', dateFnsLocale: de, validationMessages: deValidationMessages, materialLabels: deMaterialLabels,
			chatLabels: deChatLabels,
		} ],
		[ 'en', { localeString: 'en-GB', dateFnsLocale: enGB, validationMessages: enValidationMessages, chatLabels: enChatLabels } ],
	] );

	private readonly _language = signal<XiriLanguage>( 'de' );
	readonly language = this._language.asReadonly();
	// Format-Locale (Zahlen, Datum, Datepicker); null = wie die Sprache. Texte hängen immer an der Sprache.
	private readonly _locale = signal<XiriLanguage | null>( null );
	readonly locale = this._locale.asReadonly();
	private readonly formatDef = computed( () => this.registry.get( this._locale() ?? this._language() ) );
	readonly localeString = computed( () => this.formatDef()?.localeString ?? 'de-DE' );
	// Aktives date-fns-Locale (für Datums-Formatierung + Datepicker). Undefined bei Text-only-Sprache.
	readonly dateFnsLocale = computed( () => this.formatDef()?.dateFnsLocale );

	// Zeitzone für alle Unix<->Local-Umrechnungen (locale-nahe Präsentations-Info, analog Go-uicontext).
	private currentTimezone = 'Europe/Vienna';

	constructor() {
		const stored = this.readStored( 'xiri-language' );
		// Nur wiederherstellen, wenn die Sprache bekannt ist (de/en oder bereits registriert).
		if ( stored && this.registry.has( stored ) )
			this._language.set( stored );
		const storedLocale = this.readStored( 'xiri-locale' );
		if ( storedLocale && this.registry.has( storedLocale ) )
			this._locale.set( storedLocale );
		// Material-Datepicker-Locale (Picker-UI) an die Sprache angleichen — reine Frontend-Interaktion.
		// Ohne bereitgestellten DateAdapter (Text-only-Formular) oder ohne date-fns-Locale wird übersprungen.
		effect( () => {
			const locale = this.dateFnsLocale();
			if ( locale )
				this.dateAdapter?.setLocale( locale );
		} );
		// Material-Intl-Texte (Datepicker-aria-labels, Paginator) an die Sprache angleichen; changes triggert das Re-Render.
		effect( () => {
			const labels = this.registry.get( this._language() )?.materialLabels;
			Object.assign( this.datepickerIntl, this.datepickerDefaults, labels?.datepicker );
			this.datepickerIntl.changes.next();
			Object.assign( this.paginatorIntl, this.paginatorDefaults, labels?.paginator );
			this.paginatorIntl.changes.next();
		} );
	}

	// Sprache registrieren/überschreiben. Vor setLanguage() bzw. dem ersten Formular-Render aufrufen (App-Init).
	registerLanguage( code: XiriLanguage, def: XiriLanguageDefinition ): void {
		this.registry.set( code, def );
		// Über Reload persistierte Custom-Sprache/-Locale einklinken, sobald sie (nach)registriert wird —
		// der Konstruktor kennt beim Restore nur de/en.
		if ( this.readStored( 'xiri-language' ) === code )
			this._language.set( code );
		if ( this.readStored( 'xiri-locale' ) === code )
			this._locale.set( code );
	}

	setLanguage( lang: XiriLanguage ): void {
		if ( !this.registry.has( lang ) ) {
			console.warn( `XiriLocaleService: unbekannte Sprache '${ lang }' – zuerst registerLanguage() aufrufen.` );
			return;
		}
		this._language.set( lang );
		this.store( 'xiri-language', lang );
	}

	// Format-Locale (localeString, dateFnsLocale samt Monatsnamen und DateAdapter) unabhängig von der Textsprache
	// setzen. Code aus derselben Registry wie setLanguage; null = wieder der Sprache folgen.
	setLocale( code: XiriLanguage | null ): void {
		if ( code !== null && !this.registry.has( code ) ) {
			console.warn( `XiriLocaleService: unbekanntes Locale '${ code }' – zuerst registerLanguage() aufrufen.` );
			return;
		}
		this._locale.set( code );
		this.store( 'xiri-locale', code );
	}

	// Validierungs-Fehlertexte der aktiven Sprache; Fallback de, falls (unerwartet) nicht vorhanden.
	validationMessagesFor(): XiriValidationMessages {
		return this.registry.get( this._language() )?.validationMessages
			?? this.registry.get( 'de' )!.validationMessages;
	}

	// Fehlertext für eine Datei über der Größengrenze, die Grenze lesbar (Byte/kB/MB/GB) in der aktiven Sprache.
	maxFileSizeMessage( bytes: number ): string {
		const units = [ 'byte', 'kilobyte', 'megabyte', 'gigabyte' ];
		let value = bytes;
		let unit = 0;
		while ( value >= 1024 && unit < units.length - 1 ) {
			value /= 1024;
			unit++;
		}
		const size = new Intl.NumberFormat( this.localeString(), {
			style: 'unit', unit: units[ unit ], unitDisplay: 'short', maximumFractionDigits: 1,
		} ).format( value );
		return ( this.validationMessagesFor().maxFileSize ?? deValidationMessages.maxFileSize )( size );
	}

	// Texte des Zeilen-Felds in der aktiven Sprache; fehlende Keys (registerLanguage ohne sie) aus Deutsch.
	rowsMessages(): { minRows( min: number ): string; maxRows( max: number ): string; duplicate: string } {
		const m = this.validationMessagesFor();
		return {
			minRows: m.minRows ?? deValidationMessages.minRows,
			maxRows: m.maxRows ?? deValidationMessages.maxRows,
			duplicate: m.duplicate ?? deValidationMessages.duplicate,
		};
	}

	// Chat-Texte in der aktiven Sprache; fehlende Keys aus Deutsch. Liest die Sprache als Signal (reaktiv in computed).
	chatLabels(): XiriChatLabels {
		return { ...deChatLabels, ...this.registry.get( this._language() )?.chatLabels };
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
	private readStored( key: string ): string | null {
		if ( !this.isBrowser )
			return null;
		try {
			return localStorage.getItem( key );
		} catch {
			return null;
		}
	}

	// null entfernt den Schlüssel.
	private store( key: string, value: string | null ): void {
		if ( !this.isBrowser )
			return;
		try {
			if ( value === null )
				localStorage.removeItem( key );
			else
				localStorage.setItem( key, value );
		} catch {
			// Persistenz nicht verfügbar (Private-Mode o. Ä.) — Sprachwechsel gilt trotzdem für die Session.
		}
	}
}
