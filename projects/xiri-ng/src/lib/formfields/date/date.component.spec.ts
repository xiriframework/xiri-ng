import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { de } from 'date-fns/locale/de';
import { enUS } from 'date-fns/locale/en-US';
import { MatFormFieldModule } from '@angular/material/form-field';
import { XiriDateComponent } from './date.component';
import { XiriDateService } from '../../services/date.service';
import { XiriFormField } from '../field.interface';

@Component( {
	            selector: 'xiri-date-host',
	            template:
		            `<form [formGroup]="form">
			            <mat-form-field>
				            <xiri-date [field]="field()" formControlName="d"></xiri-date>
			            </mat-form-field>
		            </form>`,
	            imports: [ XiriDateComponent, MatFormFieldModule, ReactiveFormsModule ],
            } )
class HostComponent {
	form  = new FormGroup( { d: new FormControl<number | null>( null ) } );
	field = signal<XiriFormField>( { id: 'd', type: 'date', subtype: 'date', required: false } );
}

interface TimezoneCase { tz: string; locale: 'de' | 'enUS'; }

describe( 'XiriDateComponent', () => {

	function setupWithTimezone( tz: string, locale: 'de' | 'enUS' = 'de' ): {
		fixture: ComponentFixture<HostComponent>;
		host: HostComponent;
		dateService: XiriDateService;
		dateComponent: XiriDateComponent;
	} {
		TestBed.configureTestingModule( {
			imports:   [ HostComponent, NoopAnimationsModule, MatFormFieldModule ],
			providers: [
				{ provide: MAT_DATE_LOCALE, useValue: locale === 'de' ? de : enUS },
				...provideDateFnsAdapter(),
			],
		} );

		const fixture       = TestBed.createComponent( HostComponent );
		const dateService   = TestBed.inject( XiriDateService );
		dateService.setTimezone( tz );
		dateService.setLocale( locale, locale === 'de' ? de : enUS );

		fixture.detectChanges();
		const dateComponent = fixture.debugElement.query( By.directive( XiriDateComponent ) ).componentInstance as XiriDateComponent;
		return { fixture, host: fixture.componentInstance, dateService, dateComponent };
	}

	describe( 'creation and configuration', () => {
		it( 'should create with default subtype "date"', () => {
			const { dateComponent } = setupWithTimezone( 'Europe/Vienna' );
			expect( dateComponent ).toBeTruthy();
			expect( dateComponent.type ).toBe( 'date' );
		} );

		it( 'should accept subtype "datetime" via field input', () => {
			const { fixture, host, dateComponent } = setupWithTimezone( 'Europe/Vienna' );
			host.field.set( { id: 'd', type: 'date', subtype: 'datetime', required: false } );
			fixture.detectChanges();
			expect( dateComponent.type ).toBe( 'datetime' );
		} );

		it( 'should fall back to "date" when subtype is missing', () => {
			const { fixture, host, dateComponent } = setupWithTimezone( 'Europe/Vienna' );
			host.field.set( { id: 'd', type: 'date', required: false } );
			fixture.detectChanges();
			expect( dateComponent.type ).toBe( 'date' );
		} );

		it( 'should set required and disabled flags', () => {
			const { fixture, host, dateComponent } = setupWithTimezone( 'Europe/Vienna' );
			host.field.set( { id: 'd', type: 'date', subtype: 'date', required: true, disabled: true } );
			fixture.detectChanges();
			expect( dateComponent.required ).toBe( true );
			expect( dateComponent.disabled ).toBe( true );
			expect( dateComponent.parts.disabled ).toBe( true );
		} );

		it( 'should compute minDate and maxDate from unix input', () => {
			const { fixture, host, dateComponent, dateService } = setupWithTimezone( 'Europe/Vienna' );
			const minUnix = dateService.dateToUnix( new Date( 2025, 0, 1, 0, 0, 0 ) );
			const maxUnix = dateService.dateToUnix( new Date( 2027, 11, 31, 0, 0, 0 ) );
			host.field.set( { id: 'd', type: 'date', subtype: 'date', min: minUnix, max: maxUnix, required: false } );
			fixture.detectChanges();
			expect( dateComponent.minDate?.getFullYear() ).toBe( 2025 );
			expect( dateComponent.maxDate?.getFullYear() ).toBe( 2027 );
		} );
	} );

	describe( 'value binding (date subtype)', () => {
		it( 'should write a unix timestamp and round-trip back the same value', () => {
			const { dateComponent, dateService } = setupWithTimezone( 'Europe/Vienna' );
			const unix = dateService.dateToUnix( new Date( 2026, 5, 15, 0, 0, 0 ) );
			dateComponent.writeValue( unix );
			expect( dateComponent.value ).toBe( unix );
		} );

		it( 'should accept null when not required', () => {
			const { dateComponent } = setupWithTimezone( 'Europe/Vienna' );
			dateComponent.writeValue( null );
			expect( dateComponent.value ).toBeNull();
			expect( dateComponent.empty ).toBe( true );
		} );

		it( 'should preserve hour/minute for datetime subtype', () => {
			const { fixture, host, dateComponent, dateService } = setupWithTimezone( 'Europe/Vienna' );
			host.field.set( { id: 'd', type: 'date', subtype: 'datetime', required: false } );
			fixture.detectChanges();

			const unix = dateService.dateToUnix( new Date( 2026, 5, 15, 14, 37, 0 ) );
			dateComponent.writeValue( unix );

			expect( dateComponent.parts.value.hour ).toBe( 14 );
			expect( dateComponent.parts.value.minute ).toBe( 37 );
			expect( dateComponent.value ).toBe( unix );
		} );
	} );

	describe( 'timezone handling', () => {
		const cases: TimezoneCase[] = [
			{ tz: 'Europe/Vienna',     locale: 'de'   },
			{ tz: 'Europe/London',     locale: 'enUS' },
			{ tz: 'America/New_York',  locale: 'enUS' },
			{ tz: 'Asia/Tokyo',        locale: 'enUS' },
		];

		for ( const { tz, locale } of cases ) {
			it( `should round-trip the same calendar date in ${ tz } (${ locale })`, () => {
				const { dateComponent, dateService } = setupWithTimezone( tz, locale );
				const localDate = new Date( 2026, 8, 15, 0, 0, 0 );
				const unix      = dateService.dateToUnix( localDate );
				dateComponent.writeValue( unix );

				const stored = dateComponent.parts.value.date;
				expect( stored ).not.toBeNull();
				expect( stored!.getFullYear() ).toBe( 2026 );
				expect( stored!.getMonth() ).toBe( 8 );
				expect( stored!.getDate() ).toBe( 15 );
				expect( dateComponent.value ).toBe( unix );
			} );
		}
	} );

	describe( 'negative cases', () => {
		it( 'should treat undefined input as null when not required', () => {
			const { dateComponent } = setupWithTimezone( 'Europe/Vienna' );
			dateComponent.writeValue( undefined as unknown as number );
			expect( dateComponent.value ).toBeNull();
		} );

		it( 'should disable the parts FormGroup when disabled is set', () => {
			const { fixture, host, dateComponent } = setupWithTimezone( 'Europe/Vienna' );
			host.field.set( { id: 'd', type: 'date', subtype: 'date', disabled: true, required: false } );
			fixture.detectChanges();
			expect( dateComponent.parts.disabled ).toBe( true );
		} );

		it( 'should re-enable when disabled flag toggles back to false', () => {
			const { fixture, host, dateComponent } = setupWithTimezone( 'Europe/Vienna' );
			host.field.set( { id: 'd', type: 'date', subtype: 'date', disabled: true, required: false } );
			fixture.detectChanges();
			host.field.set( { id: 'd', type: 'date', subtype: 'date', disabled: false, required: false } );
			fixture.detectChanges();
			expect( dateComponent.parts.disabled ).toBe( false );
		} );
	} );
} );
