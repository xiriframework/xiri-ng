import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatMenuItemHarness } from '@angular/material/menu/testing';
import { MatTooltipHarness } from '@angular/material/tooltip/testing';
import { XiriDownloadService } from 'projects/xiri-ng/src/lib/services/download.service';
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

	it( 'exports the inline table as CSV in the browser (clientExport)', async () => {
		const fixture = await renderDemo( '/Tables' );
		const download = vi.spyOn( TestBed.inject( XiriDownloadService ), 'download' ).mockReturnValue( true );
		const table = [ ...fixture.nativeElement.querySelectorAll( 'xiri-table' ) as NodeListOf<HTMLElement> ]
				.find( t => t.textContent?.includes( '12: Export im Browser' ) )!;
		expect( table.querySelector( '.export-excel button' ) ).not.toBeNull();

		( table.querySelector( '.export-csv button' ) as HTMLElement ).click();
		expect( download ).toHaveBeenCalledTimes( 1 );
		const [ result, filename ] = download.mock.calls[ 0 ];
		expect( filename ).toBe( '12: Export im Browser.csv' );
		expect( await ( result.body as Blob ).text() ).toContain( '"Laptop Pro 15";"Bestseller";128450.5\n' );
	} );
} );
