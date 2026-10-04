import { describe, it, expect } from 'vitest';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { renderDemo, waitFor, mainText } from '../../testing/demo-harness';

describe( 'Dynpage', () => {

	it( 'shows a server validation error at the field it belongs to', async () => {
		const fixture = await renderDemo( '/Test/Form/Page' );
		const loader = TestbedHarnessEnvironment.loader( fixture );
		const name = await loader.getHarness( MatFormFieldHarness.with( { floatingLabelText: 'Name' } ) );

		await ( await name.getControl( MatInputHarness ) )!.setValue( 'fehler' );
		await ( await loader.getHarness( MatButtonHarness.with( { text: 'Upload' } ) ) ).click();

		await waitFor( fixture, () => mainText( fixture ).includes( 'Dieser Name ist reserviert' ) );
		expect( await name.getTextErrors() ).toContain( 'Dieser Name ist reserviert' );
	} );

	it( 'shows the error page for a URL the server does not know', async () => {
		const fixture = await renderDemo( '/Does/Not/Exist' );

		await waitFor( fixture, () => mainText( fixture ).includes( 'Page not found' ) );
	} );
} );
