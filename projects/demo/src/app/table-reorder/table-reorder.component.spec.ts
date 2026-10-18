import { describe, it, expect, beforeEach } from 'vitest';
import { By } from '@angular/platform-browser';
import { ComponentFixture } from '@angular/core/testing';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { renderDemo, waitFor } from '../../testing/demo-harness';
import { resetReorderMock } from '../mock/mock-api.interceptor';
import { AppComponent } from '../app.component';

describe( 'Table Reorder demo page', () => {

	beforeEach( () => resetReorderMock() );

	const names = ( fixture: ComponentFixture<AppComponent> ) =>
		[ ...fixture.nativeElement.querySelectorAll( 'tr.mat-mdc-row td.mat-column-name' ) as NodeListOf<HTMLElement> ]
			.map( td => td.textContent?.trim() );

	function drop( fixture: ComponentFixture<AppComponent>, previousIndex: number, currentIndex: number ) {
		const list = fixture.debugElement.query( By.directive( CdkDropList ) ).injector.get( CdkDropList );
		list.dropped.emit( { previousIndex, currentIndex } as CdkDragDrop<unknown> );
	}

	it( 'speichert die neue Reihenfolge und zeigt sie nach dem Neuladen', async () => {
		const fixture = await renderDemo( '/TableReorder' );
		const before = names( fixture );
		expect( before.length ).toBeGreaterThan( 3 );

		drop( fixture, 2, 0 );
		await waitFor( fixture, () => !!document.querySelector( '.mat-mdc-snack-bar-label' ) );
		await fixture.whenStable();

		expect( names( fixture ) ).toEqual( [ before[ 2 ], before[ 0 ], before[ 1 ], ...before.slice( 3 ) ] );
		expect( document.querySelector( '.mat-mdc-snack-bar-label' )?.textContent ).toContain( 'Reihenfolge gespeichert' );
	} );

	it( 'gesperrte Standardregel: Fehlermeldung, Reload zeigt die alte Reihenfolge', async () => {
		const fixture = await renderDemo( '/TableReorder' );
		const before = names( fixture );

		drop( fixture, before.length - 1, 0 );
		await waitFor( fixture, () => !!document.querySelector( '.mat-mdc-snack-bar-label' ) );
		await fixture.whenStable();

		expect( document.querySelector( '.mat-mdc-snack-bar-label' )?.textContent ).toContain( 'Standardregel' );
		expect( names( fixture ) ).toEqual( before );
	} );
} );
