import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { XiriSectionComponent } from './section.component';
import { XiriQueryComponent, XiriQuerySettings } from '../query/query.component';
import { XiriTableComponent, XiriTableSettings } from '../table/table.component';
import { XiriDataService } from '../services/data.service';
import { XiriFormService } from '../services/form.service';
import { XiriDownloadService } from '../services/download.service';
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriSessionStorageService } from '../services/sessionStorage.service';
import { XiriResponseHandlerService } from '../services/response-handler.service';
import { injectGridStyles, removeGridStyles } from '../testing/grid-styles';

const query: XiriQuerySettings = { fields: [ { id: 'search', type: 'text', value: '' } ] };
const table: XiriTableSettings = { fields: [ { id: 'a', name: 'A' } ], data: [ { id: 1, a: 'x' } ] };

// Handmade composition (Angular template): filter and table projected into a section, no .xrow around them.
// Outside a grid every spaced component brings its own bottom margin (the table keeps its 32px) — the query did not,
// so the table sat flush against the result count.
@Component( {
	selector: 'test-section-query',
	template: `<xiri-section [settings]="{ title: 'Liste' }"><xiri-query [settings]="q()" /><xiri-table [settings]="t()" /></xiri-section>`,
	imports: [ XiriSectionComponent, XiriQueryComponent, XiriTableComponent ],
} )
class SectionHost {
	q = signal( query );
	t = signal( table );
}

// In a grid the row-gap supplies the spacing, the query's own margin has to go (styles/grid.scss, $spaced).
@Component( {
	selector: 'test-grid-query',
	template: `<div class="xrow"><div class="xcol"><xiri-query [settings]="q()" /></div><div class="xcol">x</div></div>`,
	imports: [ XiriQueryComponent ],
} )
class GridHost {
	q = signal( query );
}

// Query and table in the same column of a multi-column grid (query-demo): the gap belongs between them too.
@Component( {
	selector: 'test-grid-shared-column',
	template: `<div class="xrow"><div class="xcol-8"><xiri-query [settings]="q()" /><xiri-table [settings]="t()" /></div><div class="xcol-4">x</div></div>`,
	imports: [ XiriQueryComponent, XiriTableComponent ],
} )
class SharedColumnHost {
	q = signal( query );
	t = signal( table );
}

// A query as last element (result embedded, sidepanel/dialog/tab content) must not leave an empty margin below.
@Component( {
	selector: 'test-section-query-only',
	template: `<xiri-section [settings]="{ title: 'Liste' }"><xiri-query [settings]="q()" /></xiri-section>`,
	imports: [ XiriSectionComponent, XiriQueryComponent ],
} )
class QueryOnlyHost {
	q = signal( query );
}

@Component( {
	selector: 'test-section-icon',
	template: `<xiri-section [settings]="{ title: '1: Select + Buttons + Header Rotation', icon: 'table_chart' }">x</xiri-section>`,
	imports: [ XiriSectionComponent ],
} )
class IconSectionHost {}

describe( 'Abstand Filter → Tabelle', () => {
	afterAll( removeGridStyles );

	beforeEach( async () => {
		injectGridStyles();
		await TestBed.configureTestingModule( {
			imports: [ SectionHost, GridHost, SharedColumnHost, QueryOnlyHost, IconSectionHost ],
			providers: [
				provideRouter( [] ),
				{ provide: XiriDataService, useValue: { post: vi.fn().mockReturnValue( of( {} ) ), get: vi.fn().mockReturnValue( of( {} ) ) } },
				{ provide: XiriFormService, useValue: { loadState: vi.fn( ( _id: string | null, f: unknown ) => f ), saveState: vi.fn() } },
				{ provide: XiriDownloadService, useValue: { download: vi.fn() } },
				{ provide: XiriSnackbarService, useValue: { error: vi.fn() } },
				{ provide: XiriSessionStorageService, useValue: { set: vi.fn(), getTimeout: vi.fn().mockReturnValue( null ) } },
				{ provide: XiriResponseHandlerService, useValue: { handle: vi.fn() } },
				{ provide: MatDialog, useValue: { open: vi.fn() } },
				{ provide: Location, useValue: { back: vi.fn() } },
			],
		} ).compileComponents();
	} );

	function queryMargin( host: typeof SectionHost | typeof GridHost | typeof SharedColumnHost | typeof QueryOnlyHost ): string {
		const fixture = TestBed.createComponent( host );
		fixture.detectChanges();
		return getComputedStyle( fixture.nativeElement.querySelector( 'xiri-query' ) ).marginBottom;
	}

	// On narrow screens the header actions move below the title instead of squeezing it.
	it( 'lets the section header wrap', () => {
		const fixture = TestBed.createComponent( SectionHost );
		fixture.detectChanges();
		expect( getComputedStyle( fixture.nativeElement.querySelector( '.section-header' ) ).flexWrap ).toBe( 'wrap' );
		expect( getComputedStyle( fixture.nativeElement.querySelector( '.section-header-left' ) ).minWidth ).toBe( '0px' );
	} );

	// Mobile: a long title squeezed the section icon to a sliver.
	it( 'keeps the section icon at full size next to a long title', () => {
		const fixture = TestBed.createComponent( IconSectionHost );
		fixture.detectChanges();
		expect( getComputedStyle( fixture.nativeElement.querySelector( '.section-header-left mat-icon' ) ).flexShrink ).toBe( '0' );
	} );

	it( 'puts the grid row gap between a projected query and the table below', () => {
		expect( queryMargin( SectionHost ) ).toBe( 'var(--xiri-grid-row-gap, 20px)' );
	} );

	it( 'has no margin as the only element of a grid column, the row gap is the spacing there', () => {
		expect( queryMargin( GridHost ) ).toMatch( /^0(px)?$/ );
	} );

	it( 'keeps the gap to a table in the same column of a multi-column grid', () => {
		expect( queryMargin( SharedColumnHost ) ).toBe( 'var(--xiri-grid-row-gap, 20px)' );
	} );

	it( 'leaves no margin below a query that is the last element', () => {
		expect( queryMargin( QueryOnlyHost ) ).toMatch( /^0(px)?$/ );
	} );
} );
