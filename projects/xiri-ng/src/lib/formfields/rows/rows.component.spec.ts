import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { XiriRowsComponent } from './rows.component';
import { XiriFormFieldsComponent } from '../form-fields.component';
import { XiriFormField } from '../field.interface';
import { XiriDataServiceConfig } from '../../services/data.service';
import { XiriSnackbarService } from '../../services/snackbar.service';

@Component( {
	selector: 'xiri-rows-test-host',
	template: `<xiri-form-fields [form]="fields()" [check]="checkSubject" [serverErrors]="serverErrors()" />`,
	imports: [ XiriFormFieldsComponent ],
} )
class HostComponent {
	fields = signal<XiriFormField[] | null>( null );
	serverErrors = signal<Record<string, string> | null>( null );
	checkSubject = new Subject<void>();
	formFields = viewChild.required( XiriFormFieldsComponent );
}

// Abnahme-Beispiel aus der Anforderung von tracking; frisch je Aufruf, weil form-fields die Felder mutiert.
export function checklist( extra: Partial<XiriFormField> = {} ): XiriFormField {
	return {
		id: 'items', type: 'rows', name: 'Positionen', required: true, addText: 'Position hinzufügen',
		fields: [
			{ id: 'key', type: 'text', hide: true },
			{ id: 'category', type: 'text', name: 'Kategorie', list: [ { id: 'Technik', name: 'Technik' }, { id: 'Ladung', name: 'Ladung' } ] },
			{ id: 'label', type: 'text', name: 'Bezeichnung', required: true },
			{ id: 'required', type: 'bool', name: 'Pflicht', value: true },
			{ id: 'photo', type: 'bool', name: 'Foto bei Mangel' },
		],
		...extra,
	};
}

export function positions( n: number ): Record<string, unknown>[] {
	return Array.from( { length: n }, ( _, i ) =>
		( { key: `k${ i + 1 }`, category: 'Technik', label: `Position ${ i + 1 }`, required: true, photo: false } ) );
}

describe( 'XiriRowsComponent', () => {
	let fixture: ComponentFixture<HostComponent>;
	let host: HostComponent;

	const el = () => fixture.nativeElement as HTMLElement;
	const rowEls = () => Array.from( el().querySelectorAll<HTMLElement>( 'xiri-rows .row-item' ) );
	const textInputs = ( row: number ) => Array.from( rowEls()[ row ].querySelectorAll<HTMLInputElement>( 'input:not([type=checkbox])' ) );
	const checkboxes = ( row: number ) => Array.from( rowEls()[ row ].querySelectorAll<HTMLInputElement>( 'input[type=checkbox]' ) );
	const control = () => host.formFields().formGroup.get( 'items' )!;
	const value = () => control().value as Record<string, unknown>[];
	const addButton = () => el().querySelector<HTMLButtonElement>( 'xiri-rows button.add' );
	// Nur Fehler, die Material wirklich anzeigt: mat-error steht auch bei verstecktem Fehlerzustand im DOM.
	const errors = ( row: number ) => Array.from( rowEls()[ row ].querySelectorAll( '.mat-form-field-invalid mat-error' ) ).map( e => e.textContent!.trim() );

	function render( field: XiriFormField ): void {
		host.fields.set( [ field ] );
		fixture.detectChanges();
	}

	function type( input: HTMLInputElement, text: string ): void {
		input.value = text;
		input.dispatchEvent( new Event( 'input' ) );
		fixture.detectChanges();
	}

	function click( button: HTMLElement ): void {
		button.click();
		fixture.detectChanges();
	}

	beforeEach( () => {
		localStorage.clear();
		TestBed.configureTestingModule( {
			imports: [ HostComponent ],
			providers: [
				{ provide: XiriDataServiceConfig, useValue: { api: '/api/' } },
				{ provide: HttpClient, useValue: { get: vi.fn().mockReturnValue( of( {} ) ), post: vi.fn().mockReturnValue( of( {} ) ) } },
				{ provide: XiriSnackbarService, useValue: { error: vi.fn(), handleResponse: vi.fn() } },
				{ provide: MatDialog, useValue: { open: vi.fn() } },
			],
		} );
		fixture = TestBed.createComponent( HostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
	} );

	afterEach( () => vi.unstubAllGlobals() );

	it( 'zeigt 12 Zeilen als Tabelle, Spaltenköpfe einmal, versteckte Spalte nicht', async () => {
		render( checklist( { value: positions( 12 ) } ) );
		await fixture.whenStable(); // MatAutocompleteTrigger schreibt den Text erst in einer Microtask

		expect( rowEls().length ).toBe( 12 );
		const heads = Array.from( el().querySelectorAll( 'xiri-rows .head .head-cell' ) ).map( h => h.textContent!.trim() );
		expect( heads ).toEqual( [ 'Kategorie', 'Bezeichnung', 'Pflicht', 'Foto bei Mangel' ] );
		expect( el().querySelectorAll( 'xiri-rows mat-label' ).length ).toBe( 0 );
		expect( Array.from( el().querySelectorAll( 'input' ) ).some( i => i.value === 'k1' ) ).toBe( false );
		expect( textInputs( 0 ).map( i => i.value ) ).toEqual( [ 'Technik', 'Position 1' ] );
		expect( control().valid ).toBe( true );
	} );

	it( 'Hinzufügen: neue Zeile unten mit Defaults, Fokus ins erste sichtbare Feld, leer nicht im Wert', async () => {
		render( checklist( { value: positions( 2 ) } ) );

		click( addButton()! );
		await fixture.whenStable();

		expect( addButton()!.textContent ).toContain( 'Position hinzufügen' );
		expect( rowEls().length ).toBe( 3 );
		expect( checkboxes( 2 ).map( c => c.checked ) ).toEqual( [ true, false ] );
		expect( document.activeElement ).toBe( textInputs( 2 )[ 0 ] );
		expect( value().length ).toBe( 2 );
		expect( control().valid ).toBe( true );
	} );

	it( 'ausgefüllte Zeile: Zellen werden geprüft, Wert enthält sie samt leerem key', () => {
		render( checklist( { value: positions( 2 ) } ) );
		click( addButton()! );

		type( textInputs( 2 )[ 0 ], 'Technik' );
		expect( value().length ).toBe( 3 );
		expect( control().valid ).toBe( false );

		host.checkSubject.next(); // „Absenden“: form-fields markiert alles als berührt
		fixture.detectChanges();
		expect( errors( 2 ) ).toEqual( [ 'Pflichtfeld – bitte ausfüllen' ] );
		expect( errors( 0 ) ).toEqual( [] );

		type( textInputs( 2 )[ 1 ], 'Licht' );
		expect( control().valid ).toBe( true );
		expect( value()[ 2 ] ).toEqual( { key: '', category: 'Technik', label: 'Licht', required: true, photo: false } );
	} );

	it( 'leere neue Zeile zeigt auch nach dem Absenden keine Zellfehler', () => {
		render( checklist( { value: positions( 1 ) } ) );
		click( addButton()! );

		host.checkSubject.next();
		fixture.detectChanges();
		expect( errors( 1 ) ).toEqual( [] );
	} );

	it( 'Löschen entfernt die Zeile aus Anzeige und Wert', () => {
		render( checklist( { value: positions( 3 ) } ) );

		click( rowEls()[ 1 ].querySelector<HTMLButtonElement>( 'button[aria-label="Zeile löschen"]' )! );

		expect( rowEls().length ).toBe( 2 );
		expect( value().map( r => r[ 'key' ] ) ).toEqual( [ 'k1', 'k3' ] );
	} );

	it( 'max erreicht: Hinzufügen gesperrt', () => {
		render( checklist( { max: 2, value: positions( 2 ) } ) );
		expect( addButton()!.disabled ).toBe( true );
	} );

	it( 'required ohne Zeilen: Feld ungültig, Fehler unter der Tabelle nach dem Absenden', () => {
		render( checklist( { value: [] } ) );
		expect( control().valid ).toBe( false );

		host.checkSubject.next();
		fixture.detectChanges();
		const fieldError = el().querySelector( '.rows-field > mat-error' );
		expect( fieldError?.textContent?.trim() ).toBe( 'Pflichtfeld – bitte ausfüllen' );
	} );

	it( 'disabled: nur Anzeige, keine Buttons', () => {
		render( checklist( { disabled: true, value: positions( 2 ) } ) );
		expect( el().querySelectorAll( 'xiri-rows button' ).length ).toBe( 0 );
		expect( textInputs( 0 ).every( i => i.disabled ) ).toBe( true );
	} );

	it( 'disabled Unterfeld: Spalte schreibgeschützt, neue Zeile mit dessen Default', async () => {
		const field = checklist( { value: positions( 1 ) } );
		field.fields![ 1 ] = { ...field.fields![ 1 ], disabled: true, value: 'Technik' };
		render( field );
		click( addButton()! );
		await fixture.whenStable();
		expect( textInputs( 1 )[ 0 ].disabled ).toBe( true );
		expect( textInputs( 1 )[ 0 ].value ).toBe( 'Technik' );
		expect( textInputs( 1 )[ 1 ].disabled ).toBe( false );
	} );

	it( 'Zellregeln wie als Einzelfeld (number min)', () => {
		render( { id: 'prices', type: 'rows', fields: [ { id: 'qty', type: 'number', name: 'Menge', min: 1 } ], value: [ { qty: 5 } ] } );
		type( textInputs( 0 )[ 0 ], '0' );
		host.checkSubject.next();
		fixture.detectChanges();
		expect( errors( 0 ) ).toEqual( [ 'Mindestens 1 erforderlich' ] );
	} );

	it( 'neuer Wert von außen ersetzt alle Zeilen', () => {
		render( checklist( { value: positions( 3 ) } ) );
		host.fields.set( [ checklist( { value: positions( 1 ) } ) ] );
		fixture.detectChanges();
		expect( rowEls().length ).toBe( 1 );
	} );

	it( 'showWhen am Feld blendet die ganze Tabelle aus', () => {
		host.fields.set( [
			{ id: 'mode', type: 'bool', name: 'Positionen', value: false },
			checklist( { required: false, showWhen: { field: 'mode', operator: 'equals', value: true } } ),
		] );
		fixture.detectChanges();
		expect( el().querySelector( 'xiri-rows' ) ).toBeNull();
	} );

	function enter( input: HTMLInputElement ): KeyboardEvent {
		const event = new KeyboardEvent( 'keydown', { key: 'Enter', bubbles: true, cancelable: true } );
		input.dispatchEvent( event );
		fixture.detectChanges();
		return event;
	}

	it( 'Enter in „Bezeichnung“ der letzten Zeile legt eine Zeile an und springt hinein', async () => {
		render( checklist( { value: positions( 2 ) } ) );
		const event = enter( textInputs( 1 )[ 1 ] );
		await fixture.whenStable();

		expect( event.defaultPrevented ).toBe( true );
		expect( rowEls().length ).toBe( 3 );
		expect( document.activeElement ).toBe( textInputs( 2 )[ 0 ] );
	} );

	it( 'Enter woanders legt keine Zeile an', () => {
		render( checklist( { value: positions( 2 ) } ) );
		expect( enter( textInputs( 0 )[ 1 ] ).defaultPrevented ).toBe( false ); // nicht letzte Zeile
		expect( enter( textInputs( 1 )[ 0 ] ).defaultPrevented ).toBe( false ); // nicht letztes Textfeld
		expect( rowEls().length ).toBe( 2 );
	} );

	it( 'Enter bei offenem Vorschlags-Panel übernimmt nur den Vorschlag', () => {
		render( checklist( { value: positions( 1 ) } ) );
		const rows = fixture.debugElement.query( By.directive( XiriRowsComponent ) ).componentInstance as XiriRowsComponent;
		const label = rows.visible().find( s => s.id === 'label' )!;
		const event = new KeyboardEvent( 'keydown', { key: 'Enter', cancelable: true } );

		rows.onEnter( event, 0, label, true );
		event.preventDefault(); // so wie MatAutocompleteTrigger beim Übernehmen einer Option
		rows.onEnter( event, 0, label, false );
		fixture.detectChanges();

		expect( rowEls().length ).toBe( 1 );
	} );
} );
