import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriCardComponent, XiriCardSettings } from './card.component';
import { XiriDataService } from '../services/data.service';
import { XiriDownloadService } from '../services/download.service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { XiriTableComponent, XiriTableSettings } from '../table/table.component';
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriSessionStorageService } from '../services/sessionStorage.service';
import { XiriResponseHandlerService } from '../services/response-handler.service';
import { XiriDynData } from '../dyncomponent/dyndata.interface';

@Component({
	selector: 'test-host',
	template: `<xiri-card [settings]="settings()" />`,
	imports: [XiriCardComponent],
})
class TestHostComponent {
	settings = signal<XiriCardSettings>({});
}

@Component({
	selector: 'test-host-two',
	template: `<xiri-card [settings]="a()" /><xiri-card [settings]="b()" />`,
	imports: [XiriCardComponent],
})
class TwoCardsHostComponent {
	a = signal<XiriCardSettings>({});
	b = signal<XiriCardSettings>({});
}

describe('XiriCardComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let mockDataService: { post: ReturnType<typeof vi.fn> };
	let router: { navigate: ReturnType<typeof vi.fn>; url: string };

	beforeEach(async () => {
		mockDataService = {
			post: vi.fn().mockReturnValue(of({})),
		};
		router = { navigate: vi.fn().mockResolvedValue(true), url: '/current' };

		await TestBed.configureTestingModule({
			imports: [TestHostComponent],
			providers: [
				{ provide: XiriDataService, useValue: mockDataService },
				{ provide: XiriDownloadService, useValue: { download: vi.fn() } },
				{ provide: MatDialog, useValue: { open: vi.fn() } },
				{ provide: Location, useValue: { back: vi.fn() } },
				{ provide: Router, useValue: router },
				{ provide: ActivatedRoute, useValue: {} },
			],
		}).compileComponents();
		fixture = TestBed.createComponent(TestHostComponent);
		host = fixture.componentInstance;
	});

	it('should create the component', () => {
		fixture.detectChanges();
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should show static data from settings', () => {
		host.settings.set({
			data: { name: 'Alice', age: '30' },
			header: 'Info',
		});
		fixture.detectChanges();

		const card = fixture.nativeElement.querySelector('mat-card');
		expect(card).toBeTruthy();
	});

	it('should load data from URL on init', () => {
		mockDataService.post.mockReturnValue(of({ data: { a: 'b' } }));
		host.settings.set({ url: 'test/data' });
		fixture.detectChanges();

		expect(mockDataService.post).toHaveBeenCalledWith('test/data', null);
	});

	it('should set loading to true while fetching data', async () => {
		const subject = new Subject();
		mockDataService.post.mockReturnValue(subject);

		host.settings.set({ url: 'test/data' });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.loading()).toBe(true);

		subject.next({ data: { key: 'val' } });
		subject.complete();
		await fixture.whenStable();
		fixture.detectChanges();

		expect(comp.loading()).toBe(false);
	});

	it('should set error message on fetch failure', () => {
		mockDataService.post.mockReturnValue(throwError(() => ({ error: { error: 'Not found' } })));
		host.settings.set({ url: 'test/fail' });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.errorMsg()).toBe('Not found');
		expect(comp.loading()).toBe(false);
	});

	it('should use fallback error message if none provided', () => {
		mockDataService.post.mockReturnValue(throwError(() => ({ error: {} })));
		host.settings.set({ url: 'test/fail' });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.errorMsg()).toBe('Fehler beim Laden');
	});

	it('should toggle collapsed state', () => {
		host.settings.set({ header: 'Test', collapsible: true });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.isCollapsed()).toBe(false);

		comp.toggleCollapse();
		expect(comp.isCollapsed()).toBe(true);

		comp.toggleCollapse();
		expect(comp.isCollapsed()).toBe(false);
	});

	it('should initialize collapsed from settings', () => {
		host.settings.set({ header: 'Test', collapsible: true, collapsed: true });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.isCollapsed()).toBe(true);
	});

	it('should compute cardData from loaded data', () => {
		mockDataService.post.mockReturnValue(of({ data: { name: 'Alice' } }));
		host.settings.set({ url: 'test/data' });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.cardData()).toEqual({ name: 'Alice' });
	});

	it('should fallback to settings.data when no URL data loaded', () => {
		host.settings.set({ data: { key: 'value' } });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.cardData()).toEqual({ key: 'value' });
	});

	it('should compute rawTable with auto-generated fields for object data', () => {
		host.settings.set({ data: { name: 'Alice', age: '30' } });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		const rt = comp.rawTable();
		expect(rt).toBeTruthy();
		expect(rt!.fields).toBeTruthy();
		expect(rt!.fields!.length).toBe(2);
		expect(rt!.data).toEqual([
			{ f0: 'name', f1: 'Alice' },
			{ f0: 'age', f1: '30' },
		]);
	});

	it('should compute rawTable with auto-generated fields for array data', () => {
		host.settings.set({ data: [['Name', 'Alice']] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		const rt = comp.rawTable();
		expect(rt).toBeTruthy();
		expect(rt!.fields!.length).toBe(2);
		expect(rt!.fields![0].id).toBe('0');
		expect(rt!.fields![1].id).toBe('1');
	});

	it('should return null rawTable when cardData is null', () => {
		host.settings.set({});
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.rawTable()).toBeNull();
	});

	it('should use provided fields when available', () => {
		const fields = [
			{ id: 'a', name: 'a', format: 'text', display: 'info', minWidth: '30px' },
		];
		host.settings.set({ data: [{ a: 'hello' }], fields });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		const rt = comp.rawTable();
		expect(rt!.fields).toBe(fields);
	});

	it('should not reload while already loading', () => {
		const subject = new Subject();
		mockDataService.post.mockReturnValue(subject);

		host.settings.set({ url: 'test/data' });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		expect(comp.loading()).toBe(true);

		comp.reload();
		expect(mockDataService.post).toHaveBeenCalledTimes(1);
	});

	it('should render header when provided', () => {
		host.settings.set({ header: 'Card Title', data: { a: 'b' } });
		fixture.detectChanges();

		const title = fixture.nativeElement.querySelector('mat-card-title');
		expect(title?.textContent).toContain('Card Title');
	});

	it('should render collapse button when collapsible', () => {
		host.settings.set({ header: 'Test', collapsible: true, data: { a: 'b' } });
		fixture.detectChanges();

		const collapseBtn = fixture.nativeElement.querySelector('.collapse-btn');
		expect(collapseBtn).toBeTruthy();
	});

	describe('header click', () => {
		const click = (el: Element) => {
			el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			fixture.detectChanges();
		};
		const comp = () => fixture.debugElement.children[0].componentInstance as XiriCardComponent;

		it('toggles collapsed when clicking anywhere in the header', () => {
			host.settings.set({ header: 'Test', collapsible: true, data: { a: 'b' } });
			fixture.detectChanges();

			click(fixture.nativeElement.querySelector('mat-card-title'));
			expect(comp().isCollapsed()).toBe(true);

			click(fixture.nativeElement.querySelector('mat-card-header'));
			expect(comp().isCollapsed()).toBe(false);
		});

		it('toggles exactly once when clicking the collapse button', () => {
			host.settings.set({ header: 'Test', collapsible: true, data: { a: 'b' } });
			fixture.detectChanges();

			click(fixture.nativeElement.querySelector('.collapse-btn mat-icon'));
			expect(comp().isCollapsed()).toBe(true);
		});

		it('does not toggle when clicking a buttonsTop button', () => {
			host.settings.set({
				header: 'Test', collapsible: true, data: { a: 'b' },
				buttonsTop: { buttons: [{ text: 'Edit', type: 'icon', action: 'none', icon: 'edit' }], class: '' },
			});
			fixture.detectChanges();

			const btn = fixture.nativeElement.querySelector('xiri-buttonline button');
			expect(btn).toBeTruthy();
			click(btn);
			expect(comp().isCollapsed()).toBe(false);
		});

		it('does not toggle when card is not collapsible', () => {
			host.settings.set({ header: 'Test', data: { a: 'b' } });
			fixture.detectChanges();

			click(fixture.nativeElement.querySelector('mat-card-title'));
			expect(comp().isCollapsed()).toBe(false);
			expect(fixture.nativeElement.querySelector('mat-card-header').classList).not.toContain('collapsible');
		});
	});

	describe('flat', () => {
		it('renders without elevation and with class flat', () => {
			host.settings.set({ flat: true, header: 'Test', data: { a: 'b' } });
			fixture.detectChanges();

			const card = fixture.nativeElement.querySelector('mat-card');
			expect(card.classList).toContain('flat');
			expect(card.classList).not.toContain('mat-elevation-z2');
		});

		it('omits the header when flat and no header content is set', () => {
			host.settings.set({ flat: true, data: { a: 'b' } });
			fixture.detectChanges();

			expect(fixture.nativeElement.querySelector('mat-card-header')).toBeNull();
		});

		it('keeps the header when flat and a header is set', () => {
			host.settings.set({ flat: true, header: 'Test', data: { a: 'b' } });
			fixture.detectChanges();

			expect(fixture.nativeElement.querySelector('mat-card-header')).toBeTruthy();
		});

		it('keeps elevation and header when not flat', () => {
			host.settings.set({ data: { a: 'b' } });
			fixture.detectChanges();

			const card = fixture.nativeElement.querySelector('mat-card');
			expect(card.classList).toContain('mat-elevation-z2');
			expect(fixture.nativeElement.querySelector('mat-card-header')).toBeTruthy();
		});
	});

	it('should show error message in DOM on load failure', () => {
		mockDataService.post.mockReturnValue(throwError(() => ({ error: { error: 'Server error' } })));
		host.settings.set({ url: 'fail' });
		fixture.detectChanges();

		const errorDiv = fixture.nativeElement.querySelector('.load-error');
		expect(errorDiv?.textContent).toContain('Server error');
	});

	describe('nachladbares Panel', () => {

		function panel(n: number) {
			return { card: { type: 'table', header: 'Versicherung', headerSub: `Stand ${n}`, headerIcon: null, headerIconColor: null,
				buttonsTop: { class: 'small', buttons: [{ text: 'Bearbeiten', type: 'icon', action: 'api', url: 'panel/1/save', icon: 'edit' }] },
				buttonsBottom: { class: 'small', buttons: [{ text: 'Unten', type: 'basic', action: 'api', url: 'panel/1/save' }] },
				data: { Versicherer: n === 1 ? 'Allianz' : 'Uniqa' } } };
		}

		/** post-Mock: Panel-URL zählt Ladungen hoch, alles andere antwortet mit refresh:panel. */
		function mockPanel(panelUrl: string) {
			let loads = 0;
			mockDataService.post.mockImplementation((url: string) =>
				url === panelUrl ? of(panel(++loads)) : of({ done: true, refresh: 'panel' }));
			return () => mockDataService.post.mock.calls.filter(c => c[0] === panelUrl).length;
		}

		async function settle(f: ComponentFixture<unknown> = fixture) {
			await f.whenStable();
			f.detectChanges();
		}

		function comp(): XiriCardComponent {
			return fixture.debugElement.children[0].componentInstance as XiriCardComponent;
		}

		it('übernimmt Titel, Buttons und Inhalt aus {card: …}', async () => {
			mockPanel('panel/1');
			host.settings.set({ url: 'panel/1', header: 'Lade …' });
			fixture.detectChanges();
			await settle();

			expect(fixture.nativeElement.querySelector('mat-card-title').textContent).toContain('Versicherung');
			expect(fixture.nativeElement.querySelector('mat-card-header xiri-buttonline')).toBeTruthy();
			expect(fixture.nativeElement.querySelector('mat-card-actions xiri-buttonline')).toBeTruthy();
			expect(comp().cardData()).toEqual({ Versicherer: 'Allianz' });
		});

		it('behandelt {data: rows} weiterhin als Inhalt — auch mit Schlüsseln type und card', async () => {
			mockDataService.post.mockReturnValue(of({ data: { type: 'Diesel', card: 'Visa', Hersteller: 'VW' } }));
			host.settings.set({ url: 'rows/1', header: 'Fahrzeug' });
			fixture.detectChanges();
			await settle();

			expect(fixture.nativeElement.querySelector('mat-card-title').textContent).toContain('Fahrzeug');
			expect(comp().cardData()).toEqual({ type: 'Diesel', card: 'Visa', Hersteller: 'VW' });
		});

		it('lässt Shell-Inhaltsfelder nicht in eine komplette Card durchsickern', async () => {
			mockPanel('panel/1');
			host.settings.set({ url: 'panel/1', components: [{ type: 'html', data: { html: 'shell' } }] });
			fixture.detectChanges();
			await settle();

			expect(comp().card().components).toBeUndefined();
			expect(comp().hasComponents()).toBe(false);
		});

		it('lädt sich neu und zeigt die zweite Antwort, wenn ein Header-Button refresh:panel zurückgibt', async () => {
			const loads = mockPanel('panel/1');
			host.settings.set({ url: 'panel/1' });
			fixture.detectChanges();
			await settle();
			expect(loads()).toBe(1);
			expect(fixture.nativeElement.querySelector('mat-card-subtitle').textContent).toContain('Stand 1');

			fixture.nativeElement.querySelector('mat-card-header xiri-buttonline xiri-buttonstyle').click();
			await settle();

			expect(mockDataService.post).toHaveBeenCalledWith('panel/1/save', {});
			expect(loads()).toBe(2);
			expect(fixture.nativeElement.querySelector('mat-card-subtitle').textContent).toContain('Stand 2');
			expect(fixture.nativeElement.querySelector('xiri-skeleton')).toBeNull();
			expect(router.navigate).not.toHaveBeenCalled();
		});

		it('funktioniert auch über einen Bottom-Button', async () => {
			const loads = mockPanel('panel/1');
			host.settings.set({ url: 'panel/1' });
			fixture.detectChanges();
			await settle();

			fixture.nativeElement.querySelector('mat-card-actions xiri-buttonline xiri-buttonstyle').click();
			await settle();

			expect(loads()).toBe(2);
		});

		it('findet die Card aus einem Button in verschachtelten Komponenten und behält sie während des Reloads', async () => {
			let loads = 0;
			const second = new Subject<unknown>();
			const nested = (n: number) => ({ card: { type: 'table', header: 'Panel', headerSub: `Stand ${n}`, buttonsTop: null, buttonsBottom: null,
				components: [{ type: 'buttonline', data: { class: '', buttons: [{ text: 'Save', type: 'basic', action: 'api', url: 'panel/2/save' }] } }] } });
			mockDataService.post.mockImplementation((url: string) => {
				if (url !== 'panel/2') return of({ done: true, refresh: 'panel' });
				return ++loads === 1 ? of(nested(1)) : second;
			});
			host.settings.set({ url: 'panel/2' });
			fixture.detectChanges();
			await settle();
			const buttonlineBefore = fixture.nativeElement.querySelector('mat-card-content xiri-buttonline');

			buttonlineBefore.querySelector('xiri-buttonstyle').click();
			// Kein whenStable(): das wartet auf den offenen Request. Ein Tick für den Resource-Effect genügt.
			await new Promise(r => setTimeout(r));
			fixture.detectChanges();

			// Reload läuft (second offen): kein Skeleton, dieselbe Komponenteninstanz steht noch im DOM.
			expect(loads).toBe(2);
			expect(fixture.nativeElement.querySelector('xiri-skeleton')).toBeNull();
			expect(fixture.nativeElement.querySelector('mat-card-content xiri-buttonline')).toBe(buttonlineBefore);
			expect(fixture.nativeElement.querySelector('mat-card-subtitle').textContent).toContain('Stand 1');

			second.next(nested(2));
			second.complete();
			await settle();
			expect(fixture.nativeElement.querySelector('mat-card-subtitle').textContent).toContain('Stand 2');
		});

		it('lässt ein Geschwister-Panel unberührt', async () => {
			let a = 0, b = 0;
			mockDataService.post.mockImplementation((url: string) => {
				if (url === 'panel/a') return of(panel(++a));
				if (url === 'panel/b') return of(panel(++b));
				return of({ done: true, refresh: 'panel' });
			});
			const two = TestBed.createComponent(TwoCardsHostComponent);
			two.componentInstance.a.set({ url: 'panel/a' });
			two.componentInstance.b.set({ url: 'panel/b' });
			two.detectChanges();
			await settle(two);

			two.nativeElement.querySelectorAll('xiri-card')[0].querySelector('mat-card-header xiri-buttonstyle').click();
			await settle(two);

			expect(a).toBe(2);
			expect(b).toBe(1);
		});

		it('reicht refresh:panel einer Card ohne url an die äußere URL-Card weiter', async () => {
			let loads = 0;
			mockDataService.post.mockImplementation((url: string) =>
				url === 'outer'
					? of({ card: { type: 'table', header: 'Außen', headerSub: `Stand ${++loads}`, buttonsTop: null, buttonsBottom: null,
						components: [{ type: 'card', data: { header: 'Innen', buttonsTop: { class: '',
							buttons: [{ text: 'Save', type: 'basic', action: 'api', url: 'inner/save' }] }, data: { a: '1' } } }] } })
					: of({ done: true, refresh: 'panel' }));
			host.settings.set({ url: 'outer' });
			fixture.detectChanges();
			await settle();

			fixture.nativeElement.querySelector('mat-card-content xiri-card mat-card-header xiri-buttonstyle').click();
			await settle();

			expect(loads).toBe(2);
			expect(router.navigate).not.toHaveBeenCalled();
		});

		it('lädt die Seite neu, wenn keine Card mit url über ihr liegt', () => {
			host.settings.set({ header: 'Statisch', data: { a: '1' } });
			fixture.detectChanges();

			comp().reloadPanel();

			expect(router.navigate).toHaveBeenCalledWith(['/current']);
			expect(mockDataService.post).not.toHaveBeenCalled();
		});

		it('holt einen Reload nach, der während des ersten Ladens angefordert wurde', async () => {
			const first = new Subject<unknown>();
			let calls = 0;
			mockDataService.post.mockImplementation(() => ++calls === 1 ? first : of(panel(2)));
			host.settings.set({ url: 'panel/1' });
			fixture.detectChanges();

			comp().reloadPanel();
			expect(calls).toBe(1);

			first.next(panel(1));
			first.complete();
			await settle();
			await settle();

			expect(calls).toBe(2);
			expect(fixture.nativeElement.querySelector('mat-card-subtitle').textContent).toContain('Stand 2');
		});

		it('zeigt bei Fehler beim ersten Laden Header aus settings und Fehlermeldung, ohne zu werfen', async () => {
			mockDataService.post.mockReturnValue(throwError(() => ({ error: { error: 'Nicht gefunden' } })));
			host.settings.set({ url: 'panel/x', header: 'Versicherung' });
			expect(() => fixture.detectChanges()).not.toThrow();
			await settle();

			expect(fixture.nativeElement.querySelector('mat-card-title').textContent).toContain('Versicherung');
			expect(fixture.nativeElement.querySelector('.load-error').textContent).toContain('Nicht gefunden');
		});

		it('behält bei Reload-Fehler den geladenen Header und ersetzt nur den Inhalt durch die Fehlermeldung', async () => {
			let calls = 0;
			mockDataService.post.mockImplementation(() => ++calls === 1 ? of(panel(1)) : throwError(() => ({ error: { error: 'Server weg' } })));
			host.settings.set({ url: 'panel/1', header: 'Shell' });
			fixture.detectChanges();
			await settle();
			expect(fixture.nativeElement.querySelector('mat-card-title').textContent).toContain('Versicherung');

			comp().reloadPanel();
			await settle();

			expect(fixture.nativeElement.querySelector('mat-card-title').textContent).toContain('Versicherung');
			expect(fixture.nativeElement.querySelector('mat-card-header xiri-buttonline')).toBeTruthy();
			expect(fixture.nativeElement.querySelector('.load-error').textContent).toContain('Server weg');
			expect(fixture.nativeElement.querySelector('xiri-raw-table')).toBeNull();
			expect(fixture.nativeElement.querySelector('xiri-skeleton')).toBeNull();
		});

		it('leert den Header-Puffer bei url-Wechsel', async () => {
			mockDataService.post.mockImplementation((url: string) =>
				url === 'panel/1' ? of(panel(1)) : throwError(() => ({ error: { error: 'Nicht gefunden' } })));
			host.settings.set({ url: 'panel/1', header: 'Shell' });
			fixture.detectChanges();
			await settle();
			expect(fixture.nativeElement.querySelector('mat-card-title').textContent).toContain('Versicherung');

			host.settings.set({ url: 'panel/other', header: 'Shell' });
			fixture.detectChanges();
			await settle();

			expect(fixture.nativeElement.querySelector('mat-card-title').textContent).toContain('Shell');
			expect(fixture.nativeElement.querySelector('.load-error').textContent).toContain('Nicht gefunden');
		});
	});
});

// Integrationspunkt Card → Dyncomponent → Table: das globale Außen-Margin der Tabelle
// (mat-card.xiritablecard) darf als direkte Sub-Component einer Card nicht wirken.
@Component({
	selector: 'test-table-host',
	template: `<xiri-table [settings]="settings()" />`,
	imports: [XiriTableComponent],
})
class TableHostComponent {
	settings = signal<XiriTableSettings>({ fields: [{ id: 'a', name: 'A' }], data: [{ id: 1, a: 'x' }] });
}

describe('XiriCardComponent mit Table-Sub-Component', () => {
	const table: XiriDynData = {
		type: 'table',
		display: 'xcol',
		data: { fields: [{ id: 'a', name: 'A' }], data: [{ id: 1, a: 'x' }] },
	};
	const XL = 'var(--xiri-spacing-xl)';

	function marginBottom(root: HTMLElement, selector: string): string {
		const el = root.querySelector(selector);
		expect(el, selector).toBeTruthy();
		return getComputedStyle(el as Element).marginBottom;
	}

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TestHostComponent, TableHostComponent],
			providers: [
				provideRouter([]),
				{ provide: XiriDataService, useValue: { post: vi.fn().mockReturnValue(of({})), get: vi.fn().mockReturnValue(of({})) } },
				{ provide: XiriDownloadService, useValue: { download: vi.fn() } },
				{ provide: XiriSnackbarService, useValue: { error: vi.fn() } },
				{ provide: XiriSessionStorageService, useValue: { set: vi.fn(), getTimeout: vi.fn().mockReturnValue(null) } },
				{ provide: XiriResponseHandlerService, useValue: { handle: vi.fn() } },
				{ provide: MatDialog, useValue: { open: vi.fn() } },
				{ provide: Location, useValue: { back: vi.fn() } },
			],
		}).compileComponents();
	});

	function renderCard(settings: XiriCardSettings): HTMLElement {
		const fixture = TestBed.createComponent(TestHostComponent);
		fixture.componentInstance.settings.set(settings);
		fixture.detectChanges();
		return fixture.nativeElement;
	}

	it('Top-Level-Tabelle behält ihr Außen-Margin (Gegenprobe: Styles greifen im Test)', () => {
		const fixture = TestBed.createComponent(TableHostComponent);
		fixture.detectChanges();
		expect(marginBottom(fixture.nativeElement, 'mat-card.xiritablecard')).toBe(XL);
	});

	it('Tabelle direkt in der Card hat kein Außen-Margin', () => {
		const root = renderCard({ header: 'Outer', components: [table] });
		expect(marginBottom(root, 'mat-card-content.hasComponents mat-card.xiritablecard')).toBe('0px');
	});

	it('gilt auch ohne xcol-Klasse am Wrapper (display frei gesetzt)', () => {
		const root = renderCard({ header: 'Outer', components: [{ ...table, display: 'xcol-12' }] });
		expect(marginBottom(root, 'mat-card-content.hasComponents mat-card.xiritablecard')).toBe('0px');
	});

	it('Tabelle in einem Container in der Card behält ihr Außen-Margin (Scope-Grenze)', () => {
		const root = renderCard({ header: 'Outer', components: [{ type: 'container', data: { components: [table] } }] });
		expect(marginBottom(root, 'mat-card-content.hasComponents mat-card.xiritablecard')).toBe(XL);
	});
});
