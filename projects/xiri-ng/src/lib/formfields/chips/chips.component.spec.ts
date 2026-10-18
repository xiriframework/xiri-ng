import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { XiriChipsComponent } from './chips.component';
import { XiriFormField, XiriFormFieldSelectOption } from '../field.interface';
import { XiriDataService } from '../../services/data.service';

@Component( {
	            selector: 'xiri-chips-test-host',
	            template: `<xiri-chips [field]="field()" />`,
	            imports: [ XiriChipsComponent ],
            } )
class TestHostComponent {
	field = signal<XiriFormField>( { id: 'tags', type: 'chips', name: 'Tags' } as XiriFormField );
}

describe( 'XiriChipsComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let component: XiriChipsComponent;

	beforeEach( async () => {
		await TestBed.configureTestingModule( { imports: [ TestHostComponent ] } ).compileComponents();

		fixture = TestBed.createComponent( TestHostComponent );
		fixture.detectChanges();
		component = fixture.debugElement.children[ 0 ].componentInstance as XiriChipsComponent;
	} );

	it( 'should be created', () => {
		expect( component ).toBeTruthy();
	} );

	// matChipRemove sets no accessible name of its own, and mat-icon carries
	// aria-hidden="true" by default — without a label the button is nameless.
	it( 'names the remove button per chip', () => {
		component.writeValue( [ 'alpha', 'beta' ] );
		fixture.detectChanges();

		const labels = [ ...fixture.nativeElement.querySelectorAll( 'button[matChipRemove]' ) ]
				.map( ( b: Element ) => b.getAttribute( 'aria-label' ) );

		expect( labels.length ).toBe( 2 );
		expect( labels[ 0 ] ).toContain( 'alpha' );
		expect( labels[ 1 ] ).toContain( 'beta' );
	} );
} );

@Component( {
	            selector: 'xiri-chips-control-host',
	            template: `<xiri-chips [field]="field()" [formControl]="ctrl" />`,
	            imports: [ XiriChipsComponent, ReactiveFormsModule ],
            } )
class ControlHostComponent {
	ctrl = new FormControl<( string | number )[]>( [] );
	field = signal<XiriFormField>( { id: 'tags', type: 'chips', name: 'Tags' } as XiriFormField );
}

const FRONTEND = { id: 1, name: 'Frontend' };
const BACKEND = { id: 2, name: 'Backend' };
const ETH0: XiriFormFieldSelectOption = { id: 'eth0', name: 'Ethernet 0', color: 'primary' };
const ETH1 = { id: 'eth1', name: 'Ethernet 1' };

describe( 'XiriChipsComponent: Optionen, Freitext und Vorschläge', () => {
	let fixture: ComponentFixture<ControlHostComponent>;
	let host: ControlHostComponent;
	let post: ReturnType<typeof vi.fn>;

	const ENTER = { key: 'Enter', keyCode: 13, cancelable: true }; // Material wertet keyCode aus
	const ARROW_DOWN = { key: 'ArrowDown', keyCode: 40, cancelable: true };

	const input = () => fixture.nativeElement.querySelector( 'input' ) as HTMLInputElement;
	const chipTexts = () => [ ...fixture.nativeElement.querySelectorAll( 'mat-chip-row' ) ]
		.map( ( c: Element ) => c.textContent?.replace( 'cancel', '' ).trim() );
	const panelOptions = () => [ ...document.querySelectorAll( '.mat-mdc-autocomplete-panel mat-option' ) ] as HTMLElement[];
	const panelTexts = () => panelOptions().map( o => o.textContent?.trim() );

	const render = async ( field: Partial<XiriFormField>, value: ( string | number )[] = [] ) => {
		host.field.set( { id: 'tags', type: 'chips', name: 'Tags', ...field } as XiriFormField );
		host.ctrl.setValue( value );
		fixture.detectChanges();
		await fixture.whenStable();
	};
	const type = async ( text: string ) => {
		input().focus();
		input().value = text;
		input().dispatchEvent( new Event( 'input' ) );
		fixture.detectChanges();
		await fixture.whenStable();
	};
	const key = ( init: KeyboardEventInit ) => {
		input().dispatchEvent( new KeyboardEvent( 'keydown', init ) );
		fixture.detectChanges();
	};

	beforeEach( async () => {
		vi.useFakeTimers();
		post = vi.fn().mockReturnValue( of( [] ) );
		TestBed.configureTestingModule( {
			imports: [ ControlHostComponent ],
			providers: [ { provide: XiriDataService, useValue: { post } } ],
		} );
		fixture = TestBed.createComponent( ControlHostComponent );
		host = fixture.componentInstance;
		fixture.detectChanges();
		await fixture.whenStable();
	} );

	afterEach( () => {
		vi.useRealTimers();
		document.querySelectorAll( '.cdk-overlay-container' ).forEach( e => e.remove() );
	} );

	it( 'zeigt das Label einer String-Option', async () => {
		await render( { list: [ ETH0, ETH1 ] }, [ 'eth1', 'frei' ] );
		expect( chipTexts() ).toEqual( [ 'Ethernet 1', 'frei' ] );
	} );

	it( 'färbt eine String-Option nach ihrer Farbe', async () => {
		await render( { list: [ ETH0 ] }, [ 'eth0' ] );
		expect( fixture.nativeElement.querySelector( 'mat-chip-row' ).classList ).toContain( 'chip-primary' );
	} );

	it( 'löst Freitext "5" nicht auf die numerische Option 5 auf', async () => {
		await render( { list: [ { id: 5, name: 'Fünf' } ] }, [ '5' ] );
		expect( chipTexts() ).toEqual( [ '5' ] );
	} );

	it( 'übernimmt bei Enter mit exaktem Options-Namen die ID (String und Zahl)', async () => {
		await render( { list: [ ETH0, FRONTEND ] } );
		await type( 'Ethernet 0' );
		key( ENTER );
		await type( 'Frontend' );
		key( ENTER );
		expect( host.ctrl.value ).toEqual( [ 'eth0', 1 ] );
	} );

	it( 'übernimmt bei freeText: false keinen Freitext per Enter und lässt den Text stehen', async () => {
		await render( { list: [ ETH0 ], freeText: false } as Partial<XiriFormField> );
		await type( 'bogus' );
		key( ENTER );
		expect( host.ctrl.value ).toEqual( [] );
		expect( input().value ).toBe( 'bogus' );
	} );

	it( 'legt bei freeText: false beim Blur mit Teiltext keinen Chip an', async () => {
		await render( { list: [ ETH0 ], freeText: false } as Partial<XiriFormField> );
		await type( 'Ether' );
		input().blur();
		fixture.detectChanges();
		expect( host.ctrl.value ).toEqual( [] );
	} );

	it( 'übernimmt bei freeText: false eine Option per exaktem Namen', async () => {
		await render( { list: [ ETH0 ], freeText: false } as Partial<XiriFormField> );
		await type( 'Ethernet 0' );
		key( ENTER );
		expect( host.ctrl.value ).toEqual( [ 'eth0' ] );
	} );

	it( 'ergibt bei Pfeil runter + Enter auf eine Option genau einen Chip', async () => {
		await render( { list: [ FRONTEND, BACKEND ] } );
		await type( 'Fro' );
		key( ARROW_DOWN );
		key( ENTER );
		expect( host.ctrl.value ).toEqual( [ 1 ] );
	} );

	it( 'übernimmt bei markierter Option und Komma den getippten Text, nicht die Markierung', async () => {
		await render( { list: [ FRONTEND, BACKEND ] } );
		await type( 'Fro' );
		key( ARROW_DOWN );
		key( { key: ',', keyCode: 188, cancelable: true } );
		expect( host.ctrl.value ).toEqual( [ 'Fro' ] );
	} );

	it( 'legt bei freeText: false für einen Server-Vorschlag ohne Option keinen Chip an und leert das Input', async () => {
		post.mockReturnValue( of( [ { id: 99, name: 'eth9' } ] ) );
		await render( { list: [ ETH0 ], url: 'Iface/Search', freeText: false } as Partial<XiriFormField> );
		await type( 'eth' );
		vi.advanceTimersByTime( 200 );
		fixture.detectChanges();
		await fixture.whenStable();

		panelOptions().find( o => o.textContent?.includes( 'eth9' ) )!.click();
		fixture.detectChanges();
		expect( host.ctrl.value ).toEqual( [] );
		expect( input().value ).toBe( '' );
	} );

	it( 'schlägt bereits gewählte Optionen nicht noch einmal vor', async () => {
		await render( { list: [ FRONTEND, BACKEND ] }, [ 1 ] );
		await type( 'e' );
		expect( panelTexts() ).toEqual( [ 'Backend' ] );
	} );

	it( 'schlägt Server-Treffer nicht vor, die schon als Chip da sind (Freitext oder Option per Name)', async () => {
		post.mockReturnValue( of( [ { id: 9, name: 'eth9' }, { id: 8, name: 'eth8' }, { id: 7, name: 'Ethernet 0' } ] ) );
		await render( { list: [ ETH0 ], url: 'Iface/Search' }, [ 'eth9', 'eth0' ] );
		await type( 'eth' );
		vi.advanceTimersByTime( 200 );
		fixture.detectChanges();
		await fixture.whenStable();
		expect( panelTexts() ).toEqual( [ 'eth8' ] );
	} );

	it( 'behält die Markierung, wenn Server-Treffer nach dem Pfeil eintreffen (langsame Leitung)', async () => {
		const response = new Subject<unknown>();
		post.mockReturnValue( response );
		await render( { list: [ ETH0, ETH1 ], url: 'Iface/Search' } );
		await type( 'Ethernet' );
		vi.advanceTimersByTime( 200 ); // Request ist raus, Antwort steht noch aus
		key( ARROW_DOWN );
		expect( panelOptions()[ 0 ].classList ).toContain( 'mat-mdc-option-active' );

		response.next( [ { id: 9, name: 'Ethernet 9' } ] );
		fixture.detectChanges();
		await fixture.whenStable();
		vi.advanceTimersByTime( 1 ); // Material reagiert auf options.changes mit delay(0)
		fixture.detectChanges();
		expect( panelTexts() ).toEqual( [ 'Ethernet 0', 'Ethernet 1', 'Ethernet 9' ] );

		key( ENTER );
		expect( host.ctrl.value ).toEqual( [ 'eth0' ] );
	} );

	// Ein Klick auf eine Option blurt sonst das Input, und matChipInputAddOnBlur legt den Teiltext als
	// zweiten Chip an. jsdom verschiebt beim Klick keinen Fokus, daher wird der Schutz direkt geprüft.
	it( 'verhindert beim Mousedown auf eine Option, dass das Input den Fokus verliert', async () => {
		await render( { list: [ FRONTEND, BACKEND ] } );
		await type( 'Fro' );
		const down = new MouseEvent( 'mousedown', { bubbles: true, cancelable: true } );
		panelOptions()[ 0 ].dispatchEvent( down );
		expect( down.defaultPrevented ).toBe( true );
	} );

	it( 'zeigt nach Enter keine Treffer des alten Suchtexts', async () => {
		await render( { list: [ FRONTEND, BACKEND ] } );
		await type( 'Fro' );
		key( ENTER );
		key( ARROW_DOWN );
		await fixture.whenStable();
		expect( panelTexts() ).toEqual( [ 'Frontend', 'Backend' ] );
	} );

	it( 'lädt Vorschläge per url und fügt den Namen als Freitext ein', async () => {
		post.mockReturnValue( of( [ { id: 99, name: 'eth9' } ] ) );
		await render( { url: 'Iface/Search' } );
		await type( 'eth' );
		vi.advanceTimersByTime( 200 );
		fixture.detectChanges();
		await fixture.whenStable();
		expect( post ).toHaveBeenCalledWith( 'Iface/Search', { search: 'eth' } );
		expect( panelTexts() ).toEqual( [ 'eth9' ] );

		panelOptions()[ 0 ].click();
		fixture.detectChanges();
		expect( host.ctrl.value ).toEqual( [ 'eth9' ] );
	} );

	it( 'macht aus einem Server-Vorschlag mit Options-Namen die Options-ID', async () => {
		// Der Server trifft über etwas anderes als den Namen, der lokale Filter blendet die Option aus.
		post.mockReturnValue( of( [ { id: 7, name: 'Ethernet 0' } ] ) );
		await render( { list: [ ETH0 ], url: 'Iface/Search' } );
		await type( 'lan' );
		vi.advanceTimersByTime( 200 );
		fixture.detectChanges();
		await fixture.whenStable();
		expect( panelTexts() ).toEqual( [ 'Ethernet 0' ] );

		panelOptions()[ 0 ].click();
		fixture.detectChanges();
		expect( host.ctrl.value ).toEqual( [ 'eth0' ] );
	} );
} );
