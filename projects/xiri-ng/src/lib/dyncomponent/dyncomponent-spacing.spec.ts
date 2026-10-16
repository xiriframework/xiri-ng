import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component, signal, Type } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { XiriDynComponentComponent } from './dyncomponent.component';
import { XiriDynData } from './dyndata.interface';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from '../page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from '../section/section.component';
import { XiriTableComponent, XiriTableSettings } from '../table/table.component';
import { XiriLinksComponent, XiriLinksSettings } from '../links/links.component';
import { XiriImagetextComponent, XiriImagetextSettings } from '../imagetext/imagetext.component';
import { XiriCardlinkComponent, XiriCardlinkSettings } from '../cardlink/cardlink.component';
import { XiriDataService } from '../services/data.service';
import { XiriDownloadService } from '../services/download.service';
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriSessionStorageService } from '../services/sessionStorage.service';
import { XiriResponseHandlerService } from '../services/response-handler.service';
import { injectGridStyles, removeGridStyles } from '../testing/grid-styles';

const pageHeader: XiriPageHeaderSettings = { title: 'Abstände', subtitle: 'Mess-Seite', icon: 'straighten', iconColor: 'primary' };
const section: XiriSectionSettings = { title: 'Erste Section', icon: 'info', iconColor: 'primary' };
const tableData: XiriTableSettings = {
	fields: [ { id: 'id', name: 'ID', format: 'number' }, { id: 'name', name: 'Name' } ],
	data: [ { id: 1, name: 'Alice' } ],
	options: { title: 'Benutzer', search: false, pagination: false },
};
const links: XiriLinksSettings = {
	header: 'Links',
	data: [ { text: 'Home', type: 'flat', action: 'link', icon: 'home', url: '/Overview' } ],
};
const imagetext: XiriImagetextSettings = { url: 'assets/sample-preview.svg', info: 'Bild', header: 'Vorschau' };
const cardlink: XiriCardlinkSettings = {
	link: '/Overview', icon: 'home', iconSet: 'material-symbols-outlined', text: 'Home', sub: 'Start',
};

@Component( {
	selector: 'xiri-spacing-manual-host',
	template: `
		<div class="xrow">
			<div class="xcol"><xiri-page-header [settings]="pageHeader" /></div>
			<div class="xcol"><xiri-section [settings]="section" /></div>
			<div class="xcol"><xiri-table [settings]="tableData" /></div>
			<div class="xcol"><xiri-links [settings]="links" /></div>
			<div class="xcol"><xiri-imagetext [settings]="imagetext" /></div>
			<div class="xcol"><xiri-cardlink [settings]="cardlink" /></div>
		</div>`,
	imports: [
		XiriPageHeaderComponent, XiriSectionComponent, XiriTableComponent,
		XiriLinksComponent, XiriImagetextComponent, XiriCardlinkComponent,
	],
} )
class ManualGridHostComponent {
	pageHeader = pageHeader;
	section = section;
	tableData = tableData;
	links = links;
	imagetext = imagetext;
	cardlink = cardlink;
}

@Component( {
	selector: 'xiri-spacing-single-host',
	template: `<div class="xrow"><div class="xcol"><xiri-section [settings]="section" /></div></div>`,
	imports: [ XiriSectionComponent ],
} )
class SingleChildHostComponent {
	section = section;
}

@Component( {
	selector: 'xiri-spacing-dyn-host',
	template: `<xiri-dyncomponent class="xrow" [data]="data()" />`,
	imports: [ XiriDynComponentComponent ],
} )
class DynGridHostComponent {
	data = signal<XiriDynData[]>( [] );
}

// Im Grid liefert der row-gap den vertikalen Abstand (Regel in styles/grid.scss). Die Komponenten-Margins
// stapeln sich nicht darauf, und xiri-dyncomponent selbst hat kein Außen-Margin.
describe( 'Abstände im Grid', () => {
	const table: XiriDynData = { type: 'table', display: 'xcol-12', data: tableData };

	function marginBottom( root: HTMLElement, selector: string ): string {
		const el = root.querySelector( selector );
		expect( el, selector ).toBeTruthy();
		return getComputedStyle( el as Element ).marginBottom;
	}

	function render<T>( host: Type<T> ): HTMLElement {
		const fixture = TestBed.createComponent( host );
		fixture.detectChanges();
		return fixture.nativeElement;
	}

	function renderDyn( data: XiriDynData[] ): HTMLElement {
		const fixture = TestBed.createComponent( DynGridHostComponent );
		fixture.componentInstance.data.set( data );
		fixture.detectChanges();
		return fixture.nativeElement;
	}

	afterAll( removeGridStyles );

	beforeEach( () => {
		injectGridStyles();
		TestBed.configureTestingModule( {
			providers: [
				provideRouter( [] ),
				{ provide: XiriDataService, useValue: {
					get: vi.fn().mockReturnValue( of( {} ) ), post: vi.fn().mockReturnValue( of( {} ) ), postDownload: vi.fn(),
				} },
				{ provide: XiriDownloadService, useValue: { download: vi.fn() } },
				{ provide: XiriSnackbarService, useValue: { error: vi.fn(), success: vi.fn(), handleResponse: vi.fn() } },
				{ provide: XiriSessionStorageService, useValue: { set: vi.fn(), getTimeout: vi.fn().mockReturnValue( null ) } },
				{ provide: XiriResponseHandlerService, useValue: { handle: vi.fn() } },
				{ provide: MatDialog, useValue: { open: vi.fn() } },
			],
		} );
	} );

	it( 'händisches .xrow mit mehreren Kindern', () => {
		const root = render( ManualGridHostComponent );
		for ( const selector of [
			'xiri-page-header > .page-header',
			'xiri-section > .xiri-section',
			'xiri-table > mat-card.xiritablecard',
			'xiri-links > mat-card',
			'xiri-imagetext > .card',
			'xiri-cardlink',
		] )
			expect( marginBottom( root, selector ), selector ).toBe( '0px' );
	} );

	it( 'händisches .xrow mit Einzelkind behält das Margin', () => {
		const root = render( SingleChildHostComponent );
		expect( marginBottom( root, 'xiri-section > .xiri-section' ) ).toBe( 'var(--xiri-spacing-xl, 2rem)' );
	} );

	it( 'im dyncomponent-Grid liefert der Gap den Abstand', () => {
		const root = renderDyn( [ { type: 'section', display: 'xcol-12', data: section }, table ] );
		expect( marginBottom( root, 'xiri-section > .xiri-section' ) ).toBe( '0px' );
		expect( marginBottom( root, 'xiri-table > mat-card.xiritablecard' ) ).toBe( '0px' );
	} );

	it( 'Einzelkind im dyncomponent-Grid hat kein Außen-Margin', () => {
		const root = renderDyn( [ { type: 'section', data: { ...section, components: [ table ] } } ] );
		expect( marginBottom( root, 'xiri-section > .xiri-section' ) ).toBe( '0px' );
		expect( marginBottom( root, '.xiri-section xiri-table > mat-card.xiritablecard' ) ).toBe( '0px' );
	} );

	it( 'xiri-dyncomponent hat kein Außen-Margin, auch wenn eine Tabelle lebt', () => {
		const root = renderDyn( [ table ] );
		// jsdom liefert '0', wenn keine Regel ein margin-bottom setzt
		expect( marginBottom( root, 'xiri-dyncomponent' ) ).toBe( '0' );
	} );
} );
