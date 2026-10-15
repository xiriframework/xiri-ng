import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { buildValidations } from './validations';
import { XiriLocaleService } from '../../services/locale.service';
import { XiriFormField } from '../field.interface';

describe( 'buildValidations', () => {
	let locale: XiriLocaleService;

	beforeEach( () => {
		localStorage.clear();
		locale = TestBed.inject( XiriLocaleService );
	} );

	it( 'rows: min/max zählen Zeilen, Texte sprechen von Zeilen', () => {
		const field: XiriFormField = { id: 'items', type: 'rows', min: 2, max: 3 };
		const validator = buildValidations( field, locale )!;

		expect( field.validations!.map( v => v.id ) ).toEqual( [ 'minlength', 'maxlength', 'undefined' ] );
		expect( field.validations![ 0 ].message ).toBe( 'Mindestens 2 Zeilen erforderlich' );
		expect( field.validations![ 1 ].message ).toBe( 'Maximal 3 Zeilen erlaubt' );

		expect( validator( new FormControl( [ {} ] ) ) ).toHaveProperty( 'minlength' );
		expect( validator( new FormControl( [] ) ) ).toBeNull(); // min greift erst ab einer Zeile
		expect( validator( new FormControl( [ {}, {}, {}, {} ] ) ) ).toHaveProperty( 'maxlength' );
	} );

	it( 'text: unverändert minlength/required', () => {
		const field: XiriFormField = { id: 'name', type: 'text', min: 2, required: true };
		buildValidations( field, locale );
		expect( field.validations!.map( v => v.id ) ).toEqual( [ 'minlength', 'required' ] );
	} );
} );
