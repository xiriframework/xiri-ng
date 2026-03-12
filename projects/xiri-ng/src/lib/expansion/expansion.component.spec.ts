import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriExpansionComponent, XiriExpansionSettings, XiriExpansionPanelSettings } from './expansion.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
	template: `<xiri-expansion [settings]="settings()" />`,
	imports: [XiriExpansionComponent],
})
class TestHostComponent {
	settings = signal<XiriExpansionSettings>({ panels: [] });
}

describe('XiriExpansionComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach(async () => {
		panelCounter = 0;
		await TestBed.configureTestingModule({
			imports: [TestHostComponent, NoopAnimationsModule],
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
});
