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
import { ja } from 'date-fns/locale/ja';
import { MatFormFieldModule } from '@angular/material/form-field';
import { XiriYearMonthComponent } from './yearmonth.component';
import { XiriDateService } from '../../services/date.service';
import { XiriFormField } from '../field.interface';

@Component( {
	            selector: 'xiri-yearmonth-host',
	            template:
		            `<form [formGroup]="form">
			            <mat-form-field>
				            <xiri-yearmonth [field]="field()" formControlName="d"></xiri-yearmonth>
			            </mat-form-field>
		            </form>`,
	            imports: [ XiriYearMonthComponent, MatFormFieldModule, ReactiveFormsModule ],
            } )
class HostComponent {
	form  = new FormGroup( { d: new FormControl<number | null>( null ) } );
	field = signal<XiriFormField>( { id: 'd', type: 'yearmonth', subtype: 'yearmonth', required: false } );
}

interface LocaleTzCase { tz: string; locale: 'de' | 'enUS' | 'ja'; }

describe( 'XiriYearMonthComponent', () => {

	function setup( tz: string, localeName: 'de' | 'enUS' | 'ja' = 'de' ): {
		fixture: ComponentFixture<HostComponent>;
		host: HostComponent;
		dateService: XiriDateService;
		ymComponent: XiriYearMonthComponent;
	} {
		const localeMap = { de, enUS, ja };

		TestBed.configureTestingModule( {
			imports:   [ HostComponent, NoopAnimationsModule, MatFormFieldModule ],
			providers: [
				{ provide: MAT_DATE_LOCALE, useValue: localeMap[ localeName ] },
				...provideDateFnsAdapter(),
			],
		} );

		const fixture     = TestBed.createComponent( HostComponent );
		const dateService = TestBed.inject( XiriDateService );
		dateService.setTimezone( tz );
		dateService.setLocale( localeName, localeMap[ localeName ] );

		fixture.detectChanges();
		const ymComponent = fixture.debugElement.query( By.directive( XiriYearMonthComponent ) ).componentInstance as XiriYearMonthComponent;
		return { fixture, host: fixture.componentInstance, dateService, ymComponent };
	}

	describe( 'creation and configuration', () => {
		it( 'should create successfully', () => {
			const { ymComponent } = setup( 'Europe/Vienna' );
			expect( ymComponent ).toBeTruthy();
			expect( ymComponent.type ).toBe( 'yearmonth' );
		} );

		it( 'should accept required and disabled flags', () => {
			const { fixture, host, ymComponent } = setup( 'Europe/Vienna' );
			host.field.set( { id: 'd', type: 'yearmonth', subtype: 'yearmonth', required: true, disabled: true } );
			fixture.detectChanges();
			expect( ymComponent.required ).toBe( true );
			expect( ymComponent.disabled ).toBe( true );
			expect( ymComponent.dateControl.disabled ).toBe( true );
		} );

		it( 'should compute minDate and maxDate from unix input', () => {
			const { fixture, host, ymComponent, dateService } = setup( 'Europe/Vienna' );
			const minUnix = dateService.dateToUnix( new Date( 2024, 0, 1, 0, 0, 0 ) );
			const maxUnix = dateService.dateToUnix( new Date( 2027, 11, 1, 0, 0, 0 ) );
			host.field.set( {
				id:       'd',
				type:     'yearmonth',
				subtype:  'yearmonth',
				min:      minUnix,
				max:      maxUnix,
				required: false,
			} );
			fixture.detectChanges();
			expect( ymComponent.minDate?.getFullYear() ).toBe( 2024 );
			expect( ymComponent.maxDate?.getFullYear() ).toBe( 2027 );
		} );
	} );

	describe( 'day-1 normalization on writeValue', () => {
		it( 'should normalize day to 1 when input is mid-month', () => {
			const { ymComponent, dateService } = setup( 'Europe/Vienna' );
			const midMonth = dateService.dateToUnix( new Date( 2026, 6, 17, 14, 30, 0 ) );
			ymComponent.writeValue( midMonth );

			const stored = ymComponent.dateControl.value;
			expect( stored ).not.toBeNull();
			expect( stored!.getDate() ).toBe( 1 );
			expect( stored!.getHours() ).toBe( 0 );
			expect( stored!.getMinutes() ).toBe( 0 );
			expect( stored!.getMonth() ).toBe( 6 );
			expect( stored!.getFullYear() ).toBe( 2026 );
		} );

		it( 'should normalize day=31 input to day=1', () => {
			const { ymComponent, dateService } = setup( 'Europe/Vienna' );
			const endOfMonth = dateService.dateToUnix( new Date( 2026, 0, 31, 23, 59, 59 ) );
			ymComponent.writeValue( endOfMonth );
			expect( ymComponent.dateControl.value!.getDate() ).toBe( 1 );
			expect( ymComponent.dateControl.value!.getMonth() ).toBe( 0 );
		} );

		it( 'should leave day=1 input unchanged', () => {
			const { ymComponent, dateService } = setup( 'Europe/Vienna' );
			const firstOfMonth = dateService.dateToUnix( new Date( 2026, 3, 1, 0, 0, 0 ) );
			ymComponent.writeValue( firstOfMonth );
			expect( ymComponent.value ).toBe( firstOfMonth );
		} );
	} );

	describe( 'onYearMonthSelected', () => {
		it( 'should set day=1 and 00:00 when a month is selected', () => {
			const { ymComponent } = setup( 'Europe/Vienna' );
			ymComponent.onYearMonthSelected( new Date( 2027, 7, 22, 11, 30, 0 ) );

			const stored = ymComponent.dateControl.value;
			expect( stored!.getFullYear() ).toBe( 2027 );
			expect( stored!.getMonth() ).toBe( 7 );
			expect( stored!.getDate() ).toBe( 1 );
			expect( stored!.getHours() ).toBe( 0 );
			expect( stored!.getMinutes() ).toBe( 0 );
		} );

		it( 'should normalize regardless of input day or time', () => {
			const { ymComponent } = setup( 'Europe/Vienna' );
			ymComponent.onYearMonthSelected( new Date( 2025, 11, 31, 23, 59, 59 ) );
			expect( ymComponent.dateControl.value!.getDate() ).toBe( 1 );
			expect( ymComponent.dateControl.value!.getMonth() ).toBe( 11 );
			expect( ymComponent.dateControl.value!.getFullYear() ).toBe( 2025 );
		} );
	} );

	describe( 'null and empty handling', () => {
		it( 'should accept null when not required', () => {
			const { ymComponent } = setup( 'Europe/Vienna' );
			ymComponent.writeValue( 12345 );
			ymComponent.writeValue( null );
			expect( ymComponent.dateControl.value ).toBeNull();
			expect( ymComponent.empty ).toBe( true );
		} );

		it( 'should treat undefined as null when not required', () => {
			const { ymComponent } = setup( 'Europe/Vienna' );
			ymComponent.writeValue( undefined as unknown as number );
			expect( ymComponent.dateControl.value ).toBeNull();
		} );

		it( 'should report empty when no date is set', () => {
			const { ymComponent } = setup( 'Europe/Vienna' );
			ymComponent.writeValue( null );
			expect( ymComponent.empty ).toBe( true );
			expect( ymComponent.value ).toBeNull();
		} );

		it( 'should report not empty after a value is written', () => {
			const { ymComponent, dateService } = setup( 'Europe/Vienna' );
			const unix = dateService.dateToUnix( new Date( 2026, 4, 1, 0, 0, 0 ) );
			ymComponent.writeValue( unix );
			expect( ymComponent.empty ).toBe( false );
		} );
	} );

	describe( 'locale and timezone matrix', () => {
		const cases: LocaleTzCase[] = [
			{ tz: 'Europe/Vienna',    locale: 'de'   },
			{ tz: 'Europe/Berlin',    locale: 'de'   },
			{ tz: 'Europe/London',    locale: 'enUS' },
			{ tz: 'America/New_York', locale: 'enUS' },
			{ tz: 'Asia/Tokyo',       locale: 'ja'   },
		];

		for ( const { tz, locale } of cases ) {
			it( `should round-trip year+month consistently in ${ tz } (${ locale })`, () => {
				const { ymComponent, dateService } = setup( tz, locale );
				const localFirst = new Date( 2026, 4, 1, 0, 0, 0 );
				const unix       = dateService.dateToUnix( localFirst );

				ymComponent.writeValue( unix );

				const stored = ymComponent.dateControl.value;
				expect( stored!.getFullYear() ).toBe( 2026 );
				expect( stored!.getMonth() ).toBe( 4 );
				expect( stored!.getDate() ).toBe( 1 );

				expect( ymComponent.value ).toBe( unix );
			} );

			it( `should normalize a mid-month value in ${ tz } (${ locale })`, () => {
				const { ymComponent, dateService } = setup( tz, locale );
				const midMonth = dateService.dateToUnix( new Date( 2026, 4, 17, 22, 0, 0 ) );

				ymComponent.writeValue( midMonth );

				const stored = ymComponent.dateControl.value;
				expect( stored!.getMonth() ).toBe( 4 );
				expect( stored!.getDate() ).toBe( 1 );
				expect( stored!.getHours() ).toBe( 0 );
			} );
		}
	} );

	describe( 'DST edge cases', () => {
		it( 'should keep month consistent across spring-forward transition (Europe/Vienna March 2026)', () => {
			const { ymComponent, dateService } = setup( 'Europe/Vienna' );
			// 28 March 2026 is the day before spring-forward in Europe/Vienna
			const beforeDst = dateService.dateToUnix( new Date( 2026, 2, 28, 12, 0, 0 ) );
			ymComponent.writeValue( beforeDst );
			expect( ymComponent.dateControl.value!.getMonth() ).toBe( 2 );
			expect( ymComponent.dateControl.value!.getDate() ).toBe( 1 );
		} );

		it( 'should keep month consistent across fall-back transition (Europe/Vienna October 2026)', () => {
			const { ymComponent, dateService } = setup( 'Europe/Vienna' );
			const afterDst = dateService.dateToUnix( new Date( 2026, 9, 25, 12, 0, 0 ) );
			ymComponent.writeValue( afterDst );
			expect( ymComponent.dateControl.value!.getMonth() ).toBe( 9 );
			expect( ymComponent.dateControl.value!.getDate() ).toBe( 1 );
		} );
	} );
} );
