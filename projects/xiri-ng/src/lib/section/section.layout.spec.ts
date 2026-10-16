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

describe( 'Abstand Filter → Tabelle', () => {
	afterAll( removeGridStyles );

	beforeEach( async () => {
		injectGridStyles();
		await TestBed.configureTestingModule( {
			imports: [ SectionHost, GridHost ],
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

	function queryMargin( host: typeof SectionHost | typeof GridHost ): string {
		const fixture = TestBed.createComponent( host );
		fixture.detectChanges();
		return getComputedStyle( fixture.nativeElement.querySelector( 'xiri-query' ) ).marginBottom;
	}

	it( 'puts the grid row gap between a projected query and the table below', () => {
		expect( queryMargin( SectionHost ) ).toBe( 'var(--xiri-grid-row-gap, 20px)' );
	} );

	it( 'drops the query margin in a grid, the row gap is the spacing there', () => {
		expect( queryMargin( GridHost ) ).toBe( '0px' );
	} );
} );
