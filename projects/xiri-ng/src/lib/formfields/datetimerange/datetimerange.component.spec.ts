import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { de } from 'date-fns/locale/de';
import { MatFormFieldModule } from '@angular/material/form-field';
import { XiriDateTimeRangeComponent } from './datetimerange.component';
import { XiriFormField } from '../field.interface';

@Component( {
	            selector: 'xiri-datetimerange-host',
	            template:
		            `<form [formGroup]="form">
			            <mat-form-field>
				            <xiri-date-time-range [field]="field()" formControlName="r"></xiri-date-time-range>
			            </mat-form-field>
		            </form>`,
	            imports: [ XiriDateTimeRangeComponent, MatFormFieldModule, ReactiveFormsModule ],
            } )
class HostComponent {
	form  = new FormGroup( { r: new FormControl( null ) } );
	field = signal<XiriFormField>( { id: 'r', type: 'datetimerange', required: false } );
}

describe( 'XiriDateTimeRangeComponent', () => {
	let fixture: ComponentFixture<HostComponent>;

	beforeEach( () => {
		TestBed.configureTestingModule( {
			imports:   [ HostComponent ],
			providers: [ { provide: MAT_DATE_LOCALE, useValue: de }, ...provideDateFnsAdapter() ],
		} );
		fixture = TestBed.createComponent( HostComponent );
		fixture.detectChanges();
	} );

	// jsdom has no layout; the rules are what keeps the date readable in a ~260px column:
	// the input keeps 10ch and the time selects wrap to a second line instead of overlapping it.
	it( 'keeps the date input readable in narrow columns', () => {
		const host: HTMLElement = fixture.nativeElement.querySelector( 'xiri-date-time-range' );
		const input: HTMLElement = host.querySelector( 'input' )!;

		expect( getComputedStyle( host ).flexWrap ).toBe( 'wrap' );
		// jsdom resolves 10ch to px; without the rule it is 'auto'/empty.
		expect( getComputedStyle( input ).minWidth ).not.toMatch( /^(auto|0(px)?|)$/ );
	} );

	// Wrapping breaks between "from" and "to", never between an hour and its minute.
	it( 'wraps the from and the to time only as a whole', () => {
		const parts: HTMLElement[] = Array.from( fixture.nativeElement.querySelectorAll( 'xiri-date-time-range .time-part' ) );

		expect( parts.length ).toBe( 2 );
		for ( const part of parts ) {
			expect( part.querySelectorAll( 'mat-select' ).length ).toBe( 2 );
			expect( getComputedStyle( part ).whiteSpace ).toBe( 'nowrap' );
		}
	} );
} );
