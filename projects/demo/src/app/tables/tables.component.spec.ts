import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatMenuItemHarness } from '@angular/material/menu/testing';
import { MatTooltipHarness } from '@angular/material/tooltip/testing';
import { renderDemo, waitFor } from '../../testing/demo-harness';

describe( 'Tables demo page', () => {

	it( 'shows a disabled menu entry with its reason and does not act on it', async () => {
		const fixture = await renderDemo( '/Tables' );
		const row = [ ...fixture.nativeElement.querySelectorAll( 'tr' ) as NodeListOf<HTMLElement> ]
				.find( tr => tr.textContent?.includes( 'Wireless Mouse' ) )!;
		( row.querySelector( 'button[mat-icon-button]' ) as HTMLElement ).click();
		await waitFor( fixture, () => !!document.querySelector( '.mat-mdc-menu-panel' ) );

		const loader = TestbedHarnessEnvironment.documentRootLoader( fixture );
		const item = await loader.getHarness( MatMenuItemHarness.with( { text: /Table$/ } ) );
		expect( await item.isDisabled() ).toBe( true );

		const tooltip = await loader.getHarness( MatTooltipHarness.with( { selector: '.mat-mdc-menu-item-disabled-interactive' } ) );
		await tooltip.show();
		expect( await tooltip.getTooltipText() ).toBe( 'Discontinued — no further changes' );

		const navigate = vi.spyOn( TestBed.inject( Router ), 'navigateByUrl' );
		await item.click();
		expect( navigate ).not.toHaveBeenCalled();
	} );
} );
