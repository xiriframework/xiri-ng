import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { fr } from 'date-fns/locale/fr';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { XiriFormFieldsComponent } from 'projects/xiri-ng/src/lib/formfields/form-fields.component';
import { XiriFormField } from 'projects/xiri-ng/src/lib/formfields/field.interface';
import { XiriLocaleService } from 'projects/xiri-ng/src/lib/services/locale.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';

@Component( {
	            selector: 'app-locale',
	            templateUrl: './locale.component.html',
	            styleUrl: './locale.component.scss',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriBreadcrumbComponent,
		            XiriFormFieldsComponent,
		            MatButton,
		            MatIcon,
		            MatCard,
		            MatCardContent,
	            ]
            } )
export class LocaleComponent {

	protected localeService = inject( XiriLocaleService );

	private nowUnix = Math.floor( Date.now() / 1000 );

	// computed liest localeService.language()/dateFnsLocale()/localeString() intern → aktualisiert bei Sprachwechsel.
	dateTime = computed( () => this.localeService.unixToStringDateTime( this.nowUnix ) );
	dateShort = computed( () => this.localeService.unixToStringDate( this.nowUnix ) );
	dateYear = computed( () => this.localeService.unixToStringDateYear( this.nowUnix ) );
	numDefault = computed( () => this.localeService.formatNumber( 1234567.89 ) );
	numInteger = computed( () => this.localeService.formatNumber( 1234567.89, 'integer' ) );
	numFloat2 = computed( () => this.localeService.formatNumber( 1234567.89, 'float2' ) );

	frRegistered = signal( false );

	check$ = new Subject<void>();
	demoForm = signal<XiriFormField[]>( [
		{ id: 'name', type: 'text', name: 'Name', required: true, class: 'xcol-md-4' },
		{ id: 'code', type: 'text', name: 'Code (min 3)', required: true, min: 3, class: 'xcol-md-4' },
		{ id: 'amount', type: 'number', name: 'Betrag (min 10)', required: true, min: 10, class: 'xcol-md-4' },
	] );

	constructor() {
		// Validierung nach dem ersten Render auslösen, damit die Fehlertexte ohne Klick sichtbar sind.
		afterNextRender( () => this.check$.next() );
	}

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Locale & Sprachen' },
	];

	pageHeader: XiriPageHeaderSettings = {
		title: 'Locale & Sprachen',
		subtitle: 'XiriLocaleService — Sprachumschaltung, Datums-/Zahlenformate und client-erweiterbare Sprachen live',
		icon: 'translate',
		iconColor: 'primary',
	};

	sectionSwitch: XiriSectionSettings = {
		title: 'Sprache umschalten',
		subtitle: 'setLanguage() — Datepicker-Locale, Formate und Validierungstexte folgen sofort (ohne Reload).',
		icon: 'language',
		iconColor: 'primary',
	};

	sectionFormats: XiriSectionSettings = {
		title: 'Datum & Zahlen',
		subtitle: 'unixToString* + formatNumber folgen der aktiven Sprache.',
		icon: 'calendar_today',
		iconColor: 'accent',
	};

	sectionValidation: XiriSectionSettings = {
		title: 'Validierungs-Fehlertexte',
		subtitle: 'Formular mit Pflicht-/Min-Regeln — Texte wechseln bei Sprachwechsel ohne Reload.',
		icon: 'rule',
		iconColor: 'primary',
	};

	sectionCustom: XiriSectionSettings = {
		title: 'Custom-Sprache registrieren',
		subtitle: 'registerLanguage() — hier Französisch mit date-fns-Locale + Validierungstexten.',
		icon: 'add_circle',
		iconColor: 'accent',
	};

	setLang( lang: string ): void {
		this.localeService.setLanguage( lang );
	}

	triggerValidation(): void {
		this.check$.next();
	}

	registerFrench(): void {
		this.localeService.registerLanguage( 'fr', {
			localeString: 'fr-FR',
			dateFnsLocale: fr,
			validationMessages: {
				required: 'Champ requis',
				invalidFormat: 'Format invalide',
				invalidEmail: 'E-mail invalide',
				valueRequired: 'Veuillez saisir une valeur',
				minLength: n => `Au moins ${ n } caractères`,
				maxLength: n => `Au plus ${ n } caractères`,
				minNumber: n => `Minimum ${ n }`,
				maxNumber: n => `Maximum ${ n }`,
				minDate: d => `Pas avant ${ d }`,
				maxDate: d => `Pas après ${ d }`,
				minDateRange: d => `Début après ${ d }`,
				maxDateRange: d => `Fin avant ${ d }`,
				minSelection: n => `Sélectionnez au moins ${ n }`,
				maxSelection: n => `Sélectionnez au plus ${ n }`,
			},
		} );
		this.frRegistered.set( true );
		this.localeService.setLanguage( 'fr' );
	}
}
