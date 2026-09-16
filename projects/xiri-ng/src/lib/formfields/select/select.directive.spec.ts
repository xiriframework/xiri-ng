import { describe, it, expect, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { of } from 'rxjs';
import { XiriSelectDirective } from './select.directive';
import { XiriFormFieldSelectOption } from '../field.interface';
import { XiriDataService } from '../../services/data.service';

@Component( {
	selector: 'xiri-select-test-host',
	template: `<div xiriSelect [values]="values()" [serverSideSearch]="server()" serverUrl="/search"></div>`,
	imports: [ XiriSelectDirective ],
} )
class TestHostComponent {
	values = signal<XiriFormFieldSelectOption[]>( [] );
	server = signal( false );
	dir = viewChild.required( XiriSelectDirective );
}

// 3 ist disabled, 4 eine Gruppe, '2' ein String-Id neben der Zahl 2 — alle Kanten in einer Liste.
const OPTIONS: XiriFormFieldSelectOption[] = [
	{ id: 1, name: 'MTest' },
	{ id: 2, name: 'MOther' },
	{ id: 3, name: 'Beta', disabled: true },
	{ id: 4, name: 'Gruppe', isGroup: true },
	{ id: '2', name: 'MTwo' },
];

async function setup( values: XiriFormFieldSelectOption[], server = false ) {
	const post = vi.fn().mockReturnValue( of( [ { id: 9, name: 'Server' } ] ) );
	TestBed.configureTestingModule( {
		imports: [ TestHostComponent ],
		providers: [ { provide: XiriDataService, useValue: { post } } ],
	} );
	const fixture: ComponentFixture<TestHostComponent> = TestBed.createComponent( TestHostComponent );
	fixture.componentInstance.values.set( values );
	fixture.componentInstance.server.set( server );
	await fixture.whenStable();
	return { fixture, dir: fixture.componentInstance.dir(), post };
}

describe( 'XiriSelectDirective – toggleSelectAll', () => {
	it( 'wählt alle sichtbaren Optionen außer disabled und Gruppen', async () => {
		const { dir } = await setup( OPTIONS );
		const ctrl = new UntypedFormControl( [] );

		dir.toggleSelectAll( true, ctrl );

		expect( ctrl.value ).toEqual( [ 1, 2, '2' ] );
		expect( ctrl.dirty ).toBe( true );
	} );

	it( 'fügt bei aktivem Filter nur die gefilterten Optionen hinzu und behält die bestehende Auswahl', async () => {
		const { dir } = await setup( OPTIONS );
		const ctrl = new UntypedFormControl( [ 2 ] );

		dir.formControl.setValue( 'mt' );
		dir.toggleSelectAll( true, ctrl );

		expect( ctrl.value ).toEqual( [ 2, 1, '2' ] );
	} );

	it( 'entfernt bei aktivem Filter nur die gefilterten Optionen; disabled bleibt gewählt', async () => {
		const { dir } = await setup( OPTIONS );
		const ctrl = new UntypedFormControl( [ 1, 2, 3 ] );

		dir.formControl.setValue( 'mt' );
		dir.toggleSelectAll( false, ctrl );

		expect( ctrl.value ).toEqual( [ 2, 3 ] );
	} );

	it( 'kommt mit null nach reset() zurecht', async () => {
		const { dir } = await setup( OPTIONS );
		const ctrl = new UntypedFormControl( [ 1 ] );
		ctrl.reset();

		expect( ctrl.value ).toBeNull();
		expect( dir.allSelected( ctrl.value ) ).toBe( false );

		dir.toggleSelectAll( true, ctrl );
		expect( ctrl.value ).toEqual( [ 1, 2, '2' ] );
	} );

	it( 'unterscheidet 2 und "2" strikt', async () => {
		const { dir } = await setup( OPTIONS );

		expect( dir.allSelected( [ 1, 2, 2 ] ) ).toBe( false );
		expect( dir.allSelected( [ 1, 2, '2' ] ) ).toBe( true );
	} );

	it( 'ist ein No-op bei leerer oder komplett deaktivierter Liste', async () => {
		const { dir } = await setup( [ { id: 3, name: 'Beta', disabled: true } ] );
		const ctrl = new UntypedFormControl( [ 7 ] );

		dir.toggleSelectAll( true, ctrl );
		dir.toggleSelectAll( false, ctrl );

		expect( ctrl.value ).toEqual( [ 7 ] );
		expect( ctrl.dirty ).toBe( false );
		expect( dir.hasSelectable() ).toBe( false );
	} );

	it( 'ändert ein deaktiviertes Control nicht', async () => {
		const { dir } = await setup( OPTIONS );
		const ctrl = new UntypedFormControl( [] );
		ctrl.disable();

		dir.toggleSelectAll( true, ctrl );

		expect( ctrl.value ).toEqual( [] );
		expect( ctrl.dirty ).toBe( false );
	} );

	it( 'meldet keine / teilweise / vollständige Auswahl', async () => {
		const { dir } = await setup( OPTIONS );

		expect( dir.hasSelectable() ).toBe( true );
		expect( [ dir.allSelected( [] ), dir.someSelected( [] ) ] ).toEqual( [ false, false ] );
		expect( [ dir.allSelected( [ 1 ] ), dir.someSelected( [ 1 ] ) ] ).toEqual( [ false, true ] );
		expect( [ dir.allSelected( [ 1, 2, '2', 3 ] ), dir.someSelected( [ 1, 2, '2', 3 ] ) ] ).toEqual( [ true, false ] );
		// Single-Select liefert einen Skalar — darf nicht crashen.
		expect( dir.allSelected( 1 ) ).toBe( false );
	} );

	it( 'wählt bei Server-Suche Startliste und Serverantwort', async () => {
		const { dir, post } = await setup( [ { id: 1, name: 'Lokal' } ], true );
		const ctrl = new UntypedFormControl( [] );

		dir.formControl.setValue( 'ser' );
		await new Promise( resolve => setTimeout( resolve, 300 ) ); // debounceTime(200)

		expect( post ).toHaveBeenCalledWith( '/search', { search: 'ser' } );
		dir.toggleSelectAll( true, ctrl );
		expect( ctrl.value ).toEqual( [ 1, 9 ] );
	} );
} );
