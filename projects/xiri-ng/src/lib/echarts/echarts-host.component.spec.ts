import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { XiriEchartsHostComponent } from './echarts-host.component';

describe( 'XiriEchartsHostComponent', () => {

	it( 'does not start echarts when it is destroyed while echarts is still loading', async () => {
		TestBed.configureTestingModule( { imports: [ XiriEchartsHostComponent ] } );
		const fixture = TestBed.createComponent( XiriEchartsHostComponent );
		fixture.componentRef.setInput( 'option', {} );
		fixture.detectChanges();   // ngAfterViewInit starts import( 'echarts' )
		const host = fixture.componentInstance.chartHostRef().nativeElement;
		fixture.destroy();

		await import( 'echarts' );
		await new Promise( resolve => setTimeout( resolve ) );

		// echarts.init marks its element with this attribute
		expect( host.hasAttribute( '_echarts_instance_' ) ).toBe( false );
	} );
} );
