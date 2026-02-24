import { Component, inject, signal } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { ThemeService } from 'projects/xiri-ng/src/lib/services/theme.service';
import { XiriDataService } from 'projects/xiri-ng/src/lib/services/data.service';
import { XiriDateService } from 'projects/xiri-ng/src/lib/services/date.service';
import { XiriNumberService } from 'projects/xiri-ng/src/lib/services/number.service';
import { XiriLocalStorageService } from 'projects/xiri-ng/src/lib/services/localStorage.service';
import { XiriSessionStorageService } from 'projects/xiri-ng/src/lib/services/sessionStorage.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';

@Component( {
	            selector: 'app-services',
	            templateUrl: './services.component.html',
	            styleUrl: './services.component.scss',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            MatButton,
		            MatIcon,
		            MatCard,
		            MatCardContent,
		            FormsModule,
		            MatFormField,
		            MatLabel,
		            MatInput,
		            XiriBreadcrumbComponent
	            ]
            } )
export class ServicesComponent {

	protected themeService = inject( ThemeService );
	private dataService = inject( XiriDataService );
	private dateService = inject( XiriDateService );
	private numberService = inject( XiriNumberService );
	private localStorage = inject( XiriLocalStorageService );
	private sessionStorage = inject( XiriSessionStorageService );

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Services' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Library Services',
		subtitle: 'Injectable Services der xiri-ng Library',
		icon: 'build',
		iconColor: 'primary',
	};

	sectionTheme: XiriSectionSettings = {
		title: 'ThemeService',
		subtitle: 'Manages the light/dark theme. Methods: toggle(), isDark(), isLight().',
		icon: 'palette',
		iconColor: 'primary',
	};

	sectionDataService: XiriSectionSettings = {
		title: 'XiriDataService',
		subtitle: 'Central HTTP service. Methods: get(), post(), postFile(), postDownload(), getConfigApi().',
		icon: 'cloud',
		iconColor: 'accent',
	};

	sectionDateService: XiriSectionSettings = {
		title: 'XiriDateService',
		subtitle: 'Date utilities based on date-fns with timezone support.',
		icon: 'calendar_today',
		iconColor: 'primary',
	};

	sectionNumberService: XiriSectionSettings = {
		title: 'XiriNumberService',
		subtitle: 'Number formatting with locale support. Method: formatNumber(value, webformat?). Formats: default, integer, float1-float4.',
		icon: 'calculate',
		iconColor: 'accent',
	};

	sectionStorage: XiriSectionSettings = {
		title: 'LocalStorage & SessionStorage',
		subtitle: 'Typed browser storage wrappers. Methods: set(key, value), get(key), remove(key).',
		icon: 'storage',
	};

	// Storage demo
	storageKey = 'demo-key';
	storageValue = 'demo-value';
	storedLocalValue = signal<string>( '' );
	storedSessionValue = signal<string>( '' );

	// Date examples
	dateNowFormatted: string;
	dateNowDate: string;
	dateNowDateYear: string;

	// Number examples
	numberFormatted: string;
	numberInteger: string;
	numberFloat2: string;

	// API config
	apiUrl: string;

	constructor() {
		const nowUnix = Math.floor( Date.now() / 1000 );
		this.dateNowFormatted = this.dateService.unixToStringDateTime( nowUnix );
		this.dateNowDate = this.dateService.unixToStringDate( nowUnix );
		this.dateNowDateYear = this.dateService.unixToStringDateYear( nowUnix );
		this.numberFormatted = this.numberService.formatNumber( 1234567.89 );
		this.numberInteger = this.numberService.formatNumber( 1234567.89, 'integer' );
		this.numberFloat2 = this.numberService.formatNumber( 1234567.89, 'float2' );
		this.apiUrl = this.dataService.getConfigApi();

		// Load stored values
		this.storedLocalValue.set( this.localStorage.get( this.storageKey ) ?? '' );
		this.storedSessionValue.set( this.sessionStorage.get( this.storageKey ) ?? '' );
	}

	setLocal(): void {
		this.localStorage.set( this.storageKey, this.storageValue );
		this.storedLocalValue.set( this.localStorage.get( this.storageKey ) ?? '' );
	}

	removeLocal(): void {
		this.localStorage.remove( this.storageKey );
		this.storedLocalValue.set( '' );
	}

	setSession(): void {
		this.sessionStorage.set( this.storageKey, this.storageValue );
		this.storedSessionValue.set( this.sessionStorage.get( this.storageKey ) ?? '' );
	}

	removeSession(): void {
		this.sessionStorage.remove( this.storageKey );
		this.storedSessionValue.set( '' );
	}
}
