import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriExpansionComponent, XiriExpansionSettings, XiriExpansionPanelSettings } from './expansion.component';
import { XiriDataService } from '../services/data.service';
import { XiriDownloadService } from '../services/download.service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { XiriDynComponentComponent } from '../dyncomponent/dyncomponent.component';
import { XiriCardComponent, XiriCardSettings } from '../card/card.component';
import { XiriSnackbarService } from '../services/snackbar.service';
import { XiriSessionStorageService } from '../services/sessionStorage.service';
import { XIRI_PANEL_HOST } from '../services/response-handler.service';

let panelCounter = 0;
function makePanel(overrides: Partial<XiriExpansionPanelSettings> = {}): XiriExpansionPanelSettings {
	return {
		title: 'Panel ' + (panelCounter++),
		data: [],
		...overrides,
	};
}

@Component({
	selector: 'test-host',
	template: `<xiri-expansion [settings]="settings()" [filterData]="filterData()" />`,
	imports: [XiriExpansionComponent],
})
class TestHostComponent {
	settings = signal<XiriExpansionSettings>({ panels: [] });
	filterData = signal<Record<string, unknown> | null | undefined>(undefined);
}

describe('XiriExpansionComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach(async () => {
		panelCounter = 0;
		await TestBed.configureTestingModule({
			imports: [TestHostComponent],
			providers: [
				{ provide: XiriDataService, useValue: { post: vi.fn().mockReturnValue(of({})) } },
				{ provide: XiriDownloadService, useValue: { download: vi.fn() } },
				{ provide: MatDialog, useValue: { open: vi.fn() } },
				{ provide: Location, useValue: { back: vi.fn() } },
				{ provide: Router, useValue: { navigate: vi.fn(), url: '/' } },
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

	it('should start with no panels opened', () => {
		host.settings.set({ panels: [makePanel(), makePanel()] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriExpansionComponent;
		expect(comp.openedPanels().size).toBe(0);
		expect(comp.visitedPanels().size).toBe(0);
	});

	it('should track opened panels', () => {
		host.settings.set({ panels: [makePanel(), makePanel()] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriExpansionComponent;
		comp.onPanelOpened(0);

		expect(comp.openedPanels().has(0)).toBe(true);
		expect(comp.visitedPanels().has(0)).toBe(true);
	});

	it('should track closed panels', () => {
		host.settings.set({ panels: [makePanel(), makePanel()] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriExpansionComponent;
		comp.onPanelOpened(0);
		expect(comp.openedPanels().has(0)).toBe(true);

		comp.onPanelClosed(0);
		expect(comp.openedPanels().has(0)).toBe(false);
	});

	it('should keep visited panels after closing', () => {
		host.settings.set({ panels: [makePanel(), makePanel()] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriExpansionComponent;
		comp.onPanelOpened(0);
		comp.onPanelClosed(0);

		expect(comp.visitedPanels().has(0)).toBe(true);
	});

	it('should allow multiple panels open simultaneously', () => {
		host.settings.set({ panels: [makePanel(), makePanel(), makePanel()], multi: true });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriExpansionComponent;
		comp.onPanelOpened(0);
		comp.onPanelOpened(1);
		comp.onPanelOpened(2);

		expect(comp.openedPanels().size).toBe(3);
	});

	it('should render content for non-lazy panels always', () => {
		const panels = [makePanel(), makePanel()];
		host.settings.set({ panels });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriExpansionComponent;
		expect(comp.shouldRenderContent(0, panels[0])).toBe(true);
		expect(comp.shouldRenderContent(1, panels[1])).toBe(true);
	});

	it('should render lazy panel content only after visiting', () => {
		const panels = [makePanel({ lazy: true }), makePanel({ lazy: true })];
		host.settings.set({ panels });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriExpansionComponent;
		expect(comp.shouldRenderContent(0, panels[0])).toBe(false);
		expect(comp.shouldRenderContent(1, panels[1])).toBe(false);

		comp.onPanelOpened(0);
		expect(comp.shouldRenderContent(0, panels[0])).toBe(true);
		expect(comp.shouldRenderContent(1, panels[1])).toBe(false);
	});

	it('should support global lazy setting', () => {
		const panels = [makePanel(), makePanel()];
		host.settings.set({ panels, lazy: true });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriExpansionComponent;
		expect(comp.shouldRenderContent(0, panels[0])).toBe(false);

		comp.onPanelOpened(0);
		expect(comp.shouldRenderContent(0, panels[0])).toBe(true);
	});

	it('should unload panel content when panel is closed (unload mode)', () => {
		const panels = [makePanel({ unload: true }), makePanel({ unload: true })];
		host.settings.set({ panels });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriExpansionComponent;
		expect(comp.shouldRenderContent(0, panels[0])).toBe(false);

		comp.onPanelOpened(0);
		expect(comp.shouldRenderContent(0, panels[0])).toBe(true);

		comp.onPanelClosed(0);
		expect(comp.shouldRenderContent(0, panels[0])).toBe(false);
	});

	it('should support global unload setting', () => {
		const panels = [makePanel(), makePanel()];
		host.settings.set({ panels, unload: true });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriExpansionComponent;
		expect(comp.shouldRenderContent(0, panels[0])).toBe(false);

		comp.onPanelOpened(0);
		expect(comp.shouldRenderContent(0, panels[0])).toBe(true);

		comp.onPanelClosed(0);
		expect(comp.shouldRenderContent(0, panels[0])).toBe(false);
	});

	it('should prioritize panel-level unload over global lazy', () => {
		const panels = [makePanel(), makePanel({ unload: true })];
		host.settings.set({ panels, lazy: true });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriExpansionComponent;

		comp.onPanelOpened(0);
		comp.onPanelOpened(1);

		expect(comp.shouldRenderContent(0, panels[0])).toBe(true);
		expect(comp.shouldRenderContent(1, panels[1])).toBe(true);

		comp.onPanelClosed(0);
		comp.onPanelClosed(1);

		expect(comp.shouldRenderContent(0, panels[0])).toBe(true);
		expect(comp.shouldRenderContent(1, panels[1])).toBe(false);
	});

	it('should handle empty panels array', () => {
		host.settings.set({ panels: [] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriExpansionComponent;
		expect(comp.openedPanels().size).toBe(0);
	});

	it('should handle single panel', () => {
		host.settings.set({ panels: [makePanel({ title: 'Only Panel' })] });
		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('Only Panel');
	});

	it('should render panel titles', () => {
		host.settings.set({
			panels: [makePanel({ title: 'First' }), makePanel({ title: 'Second' })],
		});
		fixture.detectChanges();

		const text = fixture.nativeElement.textContent;
		expect(text).toContain('First');
		expect(text).toContain('Second');
	});

	it('should render panel descriptions when provided', () => {
		host.settings.set({
			panels: [makePanel({ title: 'P1', description: 'Description text' })],
		});
		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('Description text');
	});

	// Eine flache Card/Table bringt Rahmen und Innenabstand selbst mit; das Panel halbiert dann
	// seinen Seitenabstand (siehe .flat-content im SCSS).
	describe('flat content', () => {
		const panelEl = () => fixture.nativeElement.querySelector('mat-expansion-panel') as HTMLElement;

		it('marks the panel when it holds a flat card', () => {
			host.settings.set({ panels: [makePanel({ data: [{ type: 'card', data: { flat: true, data: {} } }] })] });
			fixture.detectChanges();

			expect(panelEl().classList).toContain('flat-content');
		});

		it('marks the panel when it holds a flat table', () => {
			host.settings.set({ panels: [makePanel({ data: [{ type: 'table', data: { options: { flat: true } } }] })] });
			fixture.detectChanges();

			expect(panelEl().classList).toContain('flat-content');
		});

		it('leaves a non-flat card or table alone', () => {
			host.settings.set({
				panels: [makePanel({ data: [{ type: 'card', data: { data: {} } }, { type: 'table', data: { options: {} } }] })],
			});
			fixture.detectChanges();

			expect(panelEl().classList).not.toContain('flat-content');
		});

		it('leaves an empty panel alone', () => {
			host.settings.set({ panels: [makePanel()] });
			fixture.detectChanges();

			expect(panelEl().classList).not.toContain('flat-content');
		});
	});

	describe('header buttons', () => {
		const buttons = { class: 'right', buttons: [{ text: 'Map', type: 'icon', action: 'none', icon: 'map' }] };
		const comp = () => fixture.debugElement.children[0].componentInstance as XiriExpansionComponent;
		const isExpanded = () => !!fixture.nativeElement.querySelector('mat-expansion-panel-header.mat-expanded');

		beforeEach(() => {
			host.settings.set({ panels: [makePanel({ title: 'GPS', buttons })] });
			fixture.detectChanges();
		});

		it('renders a buttonline inside the panel header', () => {
			expect(fixture.nativeElement.querySelector('mat-expansion-panel-header xiri-buttonline button')).toBeTruthy();
		});

		it.each([['Enter', 13], ['Space', 32]])('does not toggle the panel on %s pressed on a header button', (_name, keyCode) => {
			const btn = fixture.nativeElement.querySelector('xiri-buttonline button') as HTMLButtonElement;
			const ev = new KeyboardEvent('keydown', { keyCode, bubbles: true, cancelable: true } as KeyboardEventInit);
			btn.dispatchEvent(ev);
			fixture.detectChanges();

			expect(ev.defaultPrevented).toBe(false);
			expect(isExpanded()).toBe(false);
			expect(comp().openedPanels().size).toBe(0);
		});

		it('does not toggle the panel when clicking between the header buttons', () => {
			fixture.nativeElement.querySelector('xiri-buttonline').dispatchEvent(new MouseEvent('click', { bubbles: true }));
			fixture.detectChanges();

			expect(isExpanded()).toBe(false);
		});

		it('still toggles the panel when clicking the title', () => {
			fixture.nativeElement.querySelector('mat-panel-title').dispatchEvent(new MouseEvent('click', { bubbles: true }));
			fixture.detectChanges();

			expect(isExpanded()).toBe(true);
		});

		it('passes filterData through, so filterData null disables the buttons', () => {
			host.filterData.set(null);
			fixture.detectChanges();

			const btn = fixture.nativeElement.querySelector('xiri-buttonline button') as HTMLButtonElement;
			expect(btn.disabled).toBe(true);
		});
	});
});

// Host mit gebundenem Content-Template, damit Panel-Inhalte tatsächlich gerendert werden (wie im Dyncomponent).
@Component({
	selector: 'test-host-content',
	template: `<xiri-expansion [settings]="settings()" [dyncomponent]="tpl" />
		<ng-template #tpl let-obj><xiri-dyncomponent [data]="obj.data" [filterData]="obj.filterData" class="xrow" /></ng-template>`,
	imports: [XiriExpansionComponent, XiriDynComponentComponent],
})
class ContentHostComponent {
	settings = signal<XiriExpansionSettings>({ panels: [] });
}

// Akkordeon als Sub-Komponente einer Card mit eigener url (echter Dyncomponent-Pfad): beweist, dass Buttons im
// Panel-Inhalt das Panel und nicht die deklarierende Card treffen (DI über ngTemplateOutlet).
@Component({
	selector: 'test-host-in-card',
	template: `<xiri-card [settings]="card()" />`,
	imports: [XiriCardComponent],
})
class InCardHostComponent {
	card = signal<XiriCardSettings>({ url: 'outer' });
}

/** Card-Antwort, deren einzige Sub-Komponente ein Akkordeon mit den gegebenen Panels ist. */
function cardWithExpansion(panels: XiriExpansionPanelSettings[]) {
	return { card: { type: 'table', header: 'Außen', components: [{ type: 'expansion', data: { panels } }] } };
}

describe('XiriExpansionComponent nachladbares Panel', () => {
	let fixture: ComponentFixture<ContentHostComponent>;
	let host: ContentHostComponent;
	let post: ReturnType<typeof vi.fn>;
	let router: { navigate: ReturnType<typeof vi.fn>; url: string };

	function panel(n: number, over: Record<string, unknown> = {}) {
		return { panel: { title: 'Versicherung', description: `Stand ${n}`, icon: 'shield',
			buttons: { class: 'small', buttons: [{ text: 'Bearbeiten', type: 'icon', action: 'api', url: 'panel/save', icon: 'edit' }] },
			data: [{ type: 'html', data: { html: `<b>Inhalt ${n}</b>` } }], ...over } };
	}

	/** post-Mock: Panel-URL zählt Ladungen hoch, alles andere antwortet mit refresh:panel. */
	function mockPanel(panelUrl: string, over: Record<string, unknown> = {}) {
		let loads = 0;
		post.mockImplementation((url: string) => url === panelUrl ? of(panel(++loads, over)) : of({ done: true, refresh: 'panel' }));
		return () => post.mock.calls.filter(c => c[0] === panelUrl).length;
	}

	async function settle(f: ComponentFixture<unknown> = fixture) {
		await f.whenStable();
		f.detectChanges();
	}

	const q = (sel: string) => fixture.nativeElement.querySelector(sel);

	beforeEach(async () => {
		post = vi.fn().mockReturnValue(of({}));
		router = { navigate: vi.fn().mockResolvedValue(true), url: '/current' };
		await TestBed.configureTestingModule({
			imports: [ContentHostComponent, InCardHostComponent],
			providers: [
				{ provide: XiriDataService, useValue: { post } },
				{ provide: XiriDownloadService, useValue: { download: vi.fn() } },
				{ provide: XiriSnackbarService, useValue: { error: vi.fn(), success: vi.fn() } },
				{ provide: XiriSessionStorageService, useValue: { get: vi.fn(), set: vi.fn(), getTimeout: vi.fn() } },
				{ provide: MatDialog, useValue: { open: vi.fn() } },
				{ provide: Location, useValue: { back: vi.fn() } },
				{ provide: Router, useValue: router },
				{ provide: ActivatedRoute, useValue: {} },
			],
		}).compileComponents();
		fixture = TestBed.createComponent(ContentHostComponent);
		host = fixture.componentInstance;
	});

	it('lädt ein Panel mit url beim Init und übernimmt Titel, Beschreibung, Buttons und Inhalt aus {panel: …}', async () => {
		mockPanel('panel/1');
		host.settings.set({ panels: [{ title: 'Lade …', url: 'panel/1', expanded: true, data: [] }] });
		fixture.detectChanges();
		await settle();

		expect(post).toHaveBeenCalledWith('panel/1', null);
		expect(q('mat-panel-title').textContent).toContain('Versicherung');
		expect(q('mat-panel-description').textContent).toContain('Stand 1');
		expect(q('mat-expansion-panel-header xiri-buttonline')).toBeTruthy();
		expect(q('mat-expansion-panel b').textContent).toContain('Inhalt 1');
	});

	it('lädt nur dieses Panel neu, wenn ein Header-Button refresh:panel zurückgibt', async () => {
		let a = 0, b = 0;
		post.mockImplementation((url: string) => {
			if (url === 'panel/a') return of(panel(++a));
			if (url === 'panel/b') return of(panel(++b));
			return of({ done: true, refresh: 'panel' });
		});
		host.settings.set({ multi: true, panels: [
			{ title: 'A', url: 'panel/a', expanded: true, data: [] },
			{ title: 'B', url: 'panel/b', expanded: true, data: [] },
		] });
		fixture.detectChanges();
		await settle();
		expect(a).toBe(1);

		fixture.nativeElement.querySelectorAll('mat-expansion-panel')[0].querySelector('mat-expansion-panel-header xiri-buttonstyle').click();
		await settle();

		expect(post).toHaveBeenCalledWith('panel/save', {});
		expect(a).toBe(2);
		expect(b).toBe(1);
		expect(fixture.nativeElement.querySelectorAll('mat-panel-description')[0].textContent).toContain('Stand 2');
		expect(router.navigate).not.toHaveBeenCalled();
	});

	it('bleibt aufgeklappt, wenn die Reload-Antwort kein expanded enthält', async () => {
		mockPanel('panel/1');
		host.settings.set({ panels: [{ title: 'X', url: 'panel/1', expanded: true, data: [] }] });
		fixture.detectChanges();
		await settle();
		expect(q('mat-expansion-panel-header.mat-expanded')).toBeTruthy();

		q('mat-expansion-panel-header xiri-buttonstyle').click();
		await settle();

		expect(q('mat-panel-description').textContent).toContain('Stand 2');
		expect(q('mat-expansion-panel-header.mat-expanded')).toBeTruthy();
	});

	it('findet das Panel auch aus einem Button im Inhalt und nicht die umschließende Card (DI über ngTemplateOutlet)', async () => {
		let panelLoads = 0, cardLoads = 0;
		post.mockImplementation((url: string) => {
			if (url === 'outer') { cardLoads++; return of(cardWithExpansion([{ title: 'X', url: 'panel/1', expanded: true, data: [] }])); }
			if (url === 'panel/1') return of(panel(++panelLoads, { buttons: undefined,
				data: [{ type: 'buttonline', data: { class: '', buttons: [{ text: 'Save', type: 'basic', action: 'api', url: 'panel/save' }] } }] }));
			return of({ done: true, refresh: 'panel' });
		});
		const inCard = TestBed.createComponent(InCardHostComponent);
		inCard.detectChanges();
		await settle(inCard);
		expect(panelLoads).toBe(1);
		expect(cardLoads).toBe(1);

		inCard.nativeElement.querySelector('mat-expansion-panel .mat-expansion-panel-body xiri-buttonstyle').click();
		await settle(inCard);

		expect(panelLoads).toBe(2);
		expect(cardLoads).toBe(1);
	});

	it('reicht refresh:panel einer flachen Card ohne url im Inhalt an das Panel weiter (Muster 7b)', async () => {
		mockPanel('panel/1', { buttons: undefined, data: [{ type: 'card', cols: 12, data: { flat: true, header: 'Innen',
			buttonsTop: { class: '', buttons: [{ text: 'Save', type: 'basic', action: 'api', url: 'panel/save' }] }, data: { a: '1' } } }] });
		const loads = mockPanel('panel/1', { buttons: undefined, data: [{ type: 'card', cols: 12, data: { flat: true, header: 'Innen',
			buttonsTop: { class: '', buttons: [{ text: 'Save', type: 'basic', action: 'api', url: 'panel/save' }] }, data: { a: '1' } } }] });
		host.settings.set({ panels: [{ title: 'X', url: 'panel/1', expanded: true, data: [] }] });
		fixture.detectChanges();
		await settle();
		expect(loads()).toBe(1);

		q('mat-expansion-panel xiri-card mat-card-header xiri-buttonstyle').click();
		await settle();

		expect(loads()).toBe(2);
		expect(router.navigate).not.toHaveBeenCalled();
	});

	it('zeigt bei Fehler beim ersten Laden Shell-Titel und Fehlermeldung, ohne zu werfen', async () => {
		post.mockReturnValue(throwError(() => ({ error: { error: 'Nicht gefunden' } })));
		host.settings.set({ panels: [{ title: 'Shell', url: 'panel/x', expanded: true, data: [] }] });
		expect(() => fixture.detectChanges()).not.toThrow();
		await settle();

		expect(q('mat-panel-title').textContent).toContain('Shell');
		expect(q('.load-error').textContent).toContain('Nicht gefunden');
	});

	it('behält bei Reload-Fehler den geladenen Header und ersetzt nur den Inhalt durch die Fehlermeldung', async () => {
		let calls = 0;
		post.mockImplementation((url: string) => {
			if (url !== 'panel/1') return of({ done: true, refresh: 'panel' });
			return ++calls === 1 ? of(panel(1)) : throwError(() => ({ error: { error: 'Server weg' } }));
		});
		host.settings.set({ panels: [{ title: 'Shell', url: 'panel/1', expanded: true, data: [] }] });
		fixture.detectChanges();
		await settle();

		q('mat-expansion-panel-header xiri-buttonstyle').click();
		await settle();

		expect(q('mat-panel-title').textContent).toContain('Versicherung');
		expect(q('mat-expansion-panel-header xiri-buttonline')).toBeTruthy();
		expect(q('.load-error').textContent).toContain('Server weg');
		expect(q('mat-expansion-panel b')).toBeNull();
	});

	it('holt einen Reload nach, der während des ersten Ladens angefordert wurde, und zeigt kein Skeleton beim Reload', async () => {
		const first = new Subject<unknown>();
		let calls = 0;
		post.mockImplementation((url: string) =>
			url === 'panel/1' ? (++calls === 1 ? first : of(panel(calls))) : of({ done: true, refresh: 'panel' }));
		host.settings.set({ panels: [{ title: 'X', url: 'panel/1', expanded: true, data: [] }] });
		fixture.detectChanges();
		expect(q('xiri-skeleton')).toBeTruthy();

		const comp = fixture.debugElement.query(d => d.name === 'mat-expansion-panel');
		(comp.injector.get(XIRI_PANEL_HOST) as { reloadPanel(): void }).reloadPanel();
		expect(calls).toBe(1);

		first.next(panel(1));
		first.complete();
		await settle();
		await settle();

		expect(calls).toBe(2);
		expect(q('mat-panel-description').textContent).toContain('Stand 2');
		expect(q('xiri-skeleton')).toBeNull();
	});

	it('Panel ohne url: reloadPanel lädt die Seite neu; in einer url-Card lädt die Card neu', async () => {
		host.settings.set({ panels: [{ title: 'Statisch', expanded: true, data: [] }] });
		fixture.detectChanges();
		const panelHost = fixture.debugElement.query(d => d.name === 'mat-expansion-panel')
			.injector.get(XIRI_PANEL_HOST) as { reloadPanel(): void };
		panelHost.reloadPanel();
		expect(router.navigate).toHaveBeenCalledWith(['/current']);
		expect(post).not.toHaveBeenCalled();

		let cardLoads = 0;
		post.mockImplementation(() => { cardLoads++; return of(cardWithExpansion([{ title: 'Statisch', expanded: true, data: [] }])); });
		const inCard = TestBed.createComponent(InCardHostComponent);
		inCard.detectChanges();
		await settle(inCard);
		expect(cardLoads).toBe(1);

		(inCard.debugElement.query(d => d.name === 'mat-expansion-panel').injector.get(XIRI_PANEL_HOST) as { reloadPanel(): void }).reloadPanel();
		await settle(inCard);
		expect(cardLoads).toBe(2);
	});
});
