import { describe, it, expect } from 'vitest';
import { ComponentFixture } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { renderDemo, waitFor } from '../../testing/demo-harness';
import { AppComponent } from '../app.component';

async function field( loader: HarnessLoader, label: string ): Promise<MatFormFieldHarness | null> {
	return loader.getHarnessOrNull( MatFormFieldHarness.with( { floatingLabelText: label } ) );
}

async function choose( loader: HarnessLoader, label: string, option: string ): Promise<void> {
	const select = ( await ( await field( loader, label ) )!.getControl( MatSelectHarness ) )!;
	await select.open();
	await select.clickOptions( { text: option } );
}

describe( 'Forms demo page', () => {
	let fixture: ComponentFixture<AppComponent>;
	let loader: HarnessLoader;

	async function open(): Promise<void> {
		fixture = await renderDemo( '/Forms' );
		loader = TestbedHarnessEnvironment.loader( fixture );
	}

	it( 'shows fields only while their showWhen condition holds', async () => {
		await open();
		expect( await field( loader, 'Advanced Field' ) ).toBeNull();
		expect( await field( loader, 'Expert Setting' ) ).toBeNull();

		await choose( loader, 'Type', 'Expert' );
		expect( await field( loader, 'Advanced Field' ) ).not.toBeNull();
		expect( await field( loader, 'Expert Setting' ) ).not.toBeNull();

		await choose( loader, 'Type', 'Advanced' );
		expect( await field( loader, 'Advanced Field' ) ).not.toBeNull();
		expect( await field( loader, 'Expert Setting' ) ).toBeNull();
	} );

	it( 'reloads dependent fields from the server when the trigger changes', async () => {
		await open();

		await choose( loader, 'Abteilung', 'Extern' );

		// "Teams" is a treeselect without mat-form-field: its server hint is checked as text.
		await waitFor( fixture, () => fixture.nativeElement.textContent.includes( '1 Team(s) für diese Abteilung' ) );
		const note = ( await ( await field( loader, 'Begründung' ) )!.getControl( MatInputHarness ) )!;
		expect( await note.isRequired() ).toBe( true );
	} );

	it( 'rows: zeigt die Checkliste, Server-Fehler landet an der Zelle', async () => {
		await open();
		const rows = () => Array.from( ( fixture.nativeElement as HTMLElement ).querySelectorAll<HTMLElement>( 'xiri-rows .row-item' ) );
		expect( rows().length ).toBe( 12 );

		const label = rows()[ 2 ].querySelectorAll<HTMLInputElement>( 'input:not([type=checkbox])' )[ 1 ];
		label.value = 'fehler';
		label.dispatchEvent( new Event( 'input' ) );
		const save = Array.from( ( fixture.nativeElement as HTMLElement ).querySelectorAll<HTMLButtonElement>( 'button' ) )
			.find( b => b.textContent?.trim() === 'Checkliste speichern' )!;
		save.click();

		await waitFor( fixture, () => rows()[ 2 ].querySelector( 'mat-error' )?.textContent?.includes( 'reserviert' ) ?? false );
	} );
} );
