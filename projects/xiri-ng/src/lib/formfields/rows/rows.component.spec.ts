import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { XiriRowsComponent } from './rows.component';
import { XiriFormFieldsComponent } from '../form-fields.component';
import { XiriFormField } from '../field.interface';
import { XiriDataServiceConfig } from '../../services/data.service';
import { XiriSnackbarService } from '../../services/snackbar.service';

@Component( {
	selector: 'xiri-rows-test-host',
	template: `<xiri-form-fields [form]="fields()" [check]="checkSubject" [serverErrors]="serverErrors()" [disabled]="disabled()" />`,
	imports: [ XiriFormFieldsComponent ],
} )
class HostComponent {
	fields = signal<XiriFormField[] | null>( null );
	serverErrors = signal<Record<string, string> | null>( null );
	disabled = signal( false );
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
	let resize: ( width: number ) => void = () => undefined;

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
		resize = () => undefined;
		vi.stubGlobal( 'ResizeObserver', class {
			constructor( cb: ResizeObserverCallback ) {
				resize = width => cb( [ { contentRect: { width } } as ResizeObserverEntry ], this as unknown as ResizeObserver );
			}
			observe(): void { return undefined; }
			unobserve(): void { return undefined; }
			disconnect(): void { return undefined; }
		} );
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
		expect( heads ).toEqual( [ 'Kategorie', 'Bezeichnung *', 'Pflicht', 'Foto bei Mangel' ] );
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

	const keys = () => value().map( r => r[ 'key' ] );
	const rowButton = ( row: number, label: string ) => rowEls()[ row ].querySelector<HTMLButtonElement>( `button[aria-label="${ label }"]` );

	it( 'Pfeile verschieben, am Rand gesperrt', () => {
		render( checklist( { value: positions( 5 ) } ) );
		click( rowButton( 4, 'Nach oben' )! );
		expect( keys() ).toEqual( [ 'k1', 'k2', 'k3', 'k5', 'k4' ] );
		click( rowButton( 0, 'Nach unten' )! );
		expect( keys() ).toEqual( [ 'k2', 'k1', 'k3', 'k5', 'k4' ] );
		expect( rowButton( 0, 'Nach oben' )!.disabled ).toBe( true );
		expect( rowButton( 4, 'Nach unten' )!.disabled ).toBe( true );
	} );

	it( 'Drag & Drop verschiebt über cdkDropListDropped', () => {
		render( checklist( { value: positions( 5 ) } ) );
		const list = fixture.debugElement.query( By.directive( CdkDropList ) ).injector.get( CdkDropList );
		list.dropped.emit( { previousIndex: 4, currentIndex: 1 } as CdkDragDrop<unknown> );
		fixture.detectChanges();
		expect( keys() ).toEqual( [ 'k1', 'k5', 'k2', 'k3', 'k4' ] );
	} );

	it( 'sortable: false blendet Ziehgriff und Pfeile aus', () => {
		render( checklist( { sortable: false, value: positions( 2 ) } ) );
		expect( el().querySelector( 'xiri-rows .handle' ) ).toBeNull();
		expect( rowButton( 1, 'Nach oben' ) ).toBeNull();
	} );

	it( 'copy: Kopie unter dem Original, versteckte Werte leer; ohne copy kein Button', () => {
		render( checklist( { copy: true, value: positions( 2 ) } ) );
		click( rowButton( 0, 'Zeile kopieren' )! );
		expect( value().map( r => [ r[ 'key' ], r[ 'label' ] ] ) ).toEqual( [ [ 'k1', 'Position 1' ], [ '', 'Position 1' ], [ 'k2', 'Position 2' ] ] );

		host.fields.set( [ checklist( { value: positions( 1 ) } ) ] );
		fixture.detectChanges();
		expect( rowButton( 0, 'Zeile kopieren' ) ).toBeNull();
	} );

	it( 'Abnahme: 12 Zeilen, Zeile 5 hoch, Zeile 2 löschen → 11 Objekte in neuer Reihenfolge, keys unverändert', () => {
		render( checklist( { value: positions( 12 ) } ) );
		click( rowButton( 4, 'Nach oben' )! );
		click( rowButton( 1, 'Zeile löschen' )! );
		expect( keys() ).toEqual( [ 'k1', 'k3', 'k5', 'k4', 'k6', 'k7', 'k8', 'k9', 'k10', 'k11', 'k12' ] );
	} );

	it( 'unique: Duplikat markiert die spätere Zeile, Korrektur einer anderen Zeile räumt auf', () => {
		render( checklist( { unique: [ 'label' ], value: positions( 3 ) } ) );
		type( textInputs( 2 )[ 1 ], ' position 1 ' );
		host.checkSubject.next();
		fixture.detectChanges();

		expect( errors( 2 ) ).toEqual( [ 'Eintrag ist doppelt' ] );
		expect( errors( 0 ) ).toEqual( [] );
		expect( control().valid ).toBe( false );

		type( textInputs( 0 )[ 1 ], 'Bremsen' ); // die frühere Zeile ändert sich
		expect( errors( 2 ) ).toEqual( [] );
		expect( control().valid ).toBe( true );
	} );

	it( 'unique: leere Werte kollidieren nicht', () => {
		render( checklist( { unique: [ 'key' ], value: [] } ) );
		click( addButton()! );
		type( textInputs( 0 )[ 1 ], 'A' );
		click( addButton()! );
		type( textInputs( 1 )[ 1 ], 'B' );
		expect( control().valid ).toBe( true );
	} );

	it( 'unique: Fehler landet auf dem ersten sichtbaren Unterfeld (wie xiri-go), nicht auf dem versteckten', () => {
		render( checklist( {
			unique: [ 'key', 'label' ],
			value: [ { key: '', label: 'A', required: true }, { key: '', label: 'a', required: true } ],
		} ) );
		host.checkSubject.next();
		fixture.detectChanges();

		expect( errors( 1 ) ).toEqual( [ 'Eintrag ist doppelt' ] );
		expect( errors( 0 ) ).toEqual( [] );
		expect( control().valid ).toBe( false );
	} );

	it( 'Pflicht-Unterfeld: Stern im Kopf, aria-required nur an der Pflichtzelle', () => {
		render( checklist( { value: positions( 1 ) } ) );

		const heads = Array.from( el().querySelectorAll( 'xiri-rows .head .head-cell' ) ).map( h => h.textContent!.trim() );
		expect( heads[ 1 ] ).toContain( '*' );
		expect( heads[ 0 ] ).not.toContain( '*' );
		expect( textInputs( 0 )[ 1 ].getAttribute( 'aria-required' ) ).toBe( 'true' );
		expect( textInputs( 0 )[ 0 ].getAttribute( 'aria-required' ) ).not.toBe( 'true' ); // Material schreibt hier 'false'
	} );

	it( 'Spalten: cols als fr, bool schmal, Aktionen fest', () => {
		const field = checklist( { value: positions( 1 ) } );
		field.fields![ 2 ] = { ...field.fields![ 2 ], cols: 3 };
		render( field );
		const grid = el().querySelector<HTMLElement>( 'xiri-rows .rows' )!.style.getPropertyValue( '--xiri-rows-grid' );
		expect( grid ).toBe( '32px minmax(0, 1fr) minmax(0, 3fr) minmax(56px, .5fr) minmax(56px, .5fr) 120px' );
	} );

	it( 'schmal (375 px): Karten mit Labels, ohne Kopfzeile, Aktionen erreichbar', () => {
		render( checklist( { value: positions( 2 ) } ) );
		resize( 375 );
		fixture.detectChanges();

		expect( el().querySelector( 'xiri-rows .rows.cards' ) ).not.toBeNull();
		expect( el().querySelector( 'xiri-rows .head' ) ).toBeNull();
		const labels = Array.from( rowEls()[ 0 ].querySelectorAll( 'mat-label, mat-checkbox label' ) ).map( l => l.textContent!.trim() );
		expect( labels ).toEqual( [ 'Kategorie', 'Bezeichnung', 'Pflicht', 'Foto bei Mangel' ] );
		// Material setzt den Stern am Label per CSS-Klasse, nicht als Text.
		expect( rowEls()[ 0 ].querySelectorAll( 'mat-label.mat-form-field-required-marker, .mat-mdc-form-field-required-marker' ).length ).toBe( 1 );
		expect( rowEls()[ 0 ].querySelector( 'button[aria-label="Zeile löschen"]' ) ).not.toBeNull();

		resize( 1200 );
		fixture.detectChanges();
		expect( el().querySelector( 'xiri-rows .rows.cards' ) ).toBeNull();
	} );

	it( 'Server-Fehler items.2.label landet an der richtigen Zelle, auch mit leerer Zeile davor', () => {
		render( checklist( { value: positions( 3 ) } ) );
		click( addButton()! );                              // leere Zeile unten …
		click( rowButton( 3, 'Nach oben' )! );              // … nach oben: angezeigt k1, k2, leer, k3
		click( rowButton( 2, 'Nach oben' )! );              // angezeigt k1, leer, k2, k3

		host.serverErrors.set( { 'items.2.label': 'gibt es schon', items: 'Bitte prüfen' } );
		fixture.detectChanges();

		expect( errors( 3 ) ).toEqual( [ 'gibt es schon' ] ); // gesendeter Index 2 = k3 = angezeigt 3
		expect( errors( 2 ) ).toEqual( [] );
		expect( el().querySelector( '.rows-field > mat-error' )?.textContent?.trim() ).toBe( 'Bitte prüfen' );
	} );

	it( 'Server-Fehler bleibt, bis genau diese Zelle geändert wird', () => {
		render( checklist( { value: positions( 3 ) } ) );
		host.serverErrors.set( { 'items.2.label': 'gibt es schon' } );
		fixture.detectChanges();

		type( textInputs( 0 )[ 1 ], 'Bremsen' ); // andere Zeile
		expect( errors( 2 ) ).toEqual( [ 'gibt es schon' ] );

		type( textInputs( 2 )[ 1 ], 'Licht' );
		expect( errors( 2 ) ).toEqual( [] );
		expect( control().valid ).toBe( true );
	} );

	it( 'erste neue Zeile: Eingabe in Kategorie zeigt noch keinen Fehler an Bezeichnung', () => {
		render( checklist( { value: [] } ) );
		click( addButton()! );
		type( textInputs( 0 )[ 0 ], 'Technik' );
		expect( control().valid ).toBe( false );
		expect( errors( 0 ) ).toEqual( [] );
	} );

	it( 'Verlassen einer Zelle zeigt die Fehler ihrer Zeile', () => {
		render( checklist( { value: [] } ) );
		click( addButton()! );
		type( textInputs( 0 )[ 0 ], 'Technik' );
		textInputs( 0 )[ 0 ].dispatchEvent( new Event( 'blur' ) );
		fixture.detectChanges();
		expect( errors( 0 ) ).toEqual( [ 'Pflichtfeld – bitte ausfüllen' ] );
	} );

	it( 'zweite neue Zeile: Absenden zeigt ihre Zellfehler', () => {
		render( checklist( { value: [] } ) );
		click( addButton()! );
		type( textInputs( 0 )[ 1 ], 'Licht' );
		click( addButton()! );
		type( textInputs( 1 )[ 0 ], 'Technik' );

		host.checkSubject.next();
		fixture.detectChanges();
		expect( control().valid ).toBe( false );
		expect( errors( 1 ) ).toEqual( [ 'Pflichtfeld – bitte ausfüllen' ] );
	} );

	it( 'wieder freigegeben: ungültige Zeile macht das Feld wieder ungültig', () => {
		host.disabled.set( true );
		render( checklist( { value: [ { key: 'k1', category: 'Technik', label: '', required: true, photo: false } ] } ) );
		host.disabled.set( false );
		fixture.detectChanges();
		expect( control().enabled ).toBe( true );
		expect( control().valid ).toBe( false );
	} );

	it( 'Server-Fehler mit kaputtem Schlüssel wird ignoriert', () => {
		render( checklist( { value: positions( 2 ) } ) );
		host.serverErrors.set( { 'items..label': 'kaputt', 'items.x.label': 'kaputt', 'items.1.label': 'gibt es schon' } );
		fixture.detectChanges();
		expect( errors( 0 ) ).toEqual( [] );
		expect( errors( 1 ) ).toEqual( [ 'gibt es schon' ] );
	} );
} );
