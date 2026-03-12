import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriTabsComponent, XiriTabsSettings, XiriTabSettings } from './tabs.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

let tabCounter = 0;
function makeTab(overrides: Partial<XiriTabSettings> = {}): XiriTabSettings {
	return {
		label: 'Tab ' + (tabCounter++),
		data: [],
		...overrides,
	};
}

@Component({
	selector: 'test-host',
	template: `<xiri-tabs [settings]="settings()" />`,
	imports: [XiriTabsComponent],
})
class TestHostComponent {
	settings = signal<XiriTabsSettings>({ tabs: [] });
}

describe('XiriTabsComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach(async () => {
		tabCounter = 0;
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

	it('should default to selectedIndex 0', () => {
		host.settings.set({ tabs: [makeTab(), makeTab()] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriTabsComponent;
		expect(comp.selectedIndex()).toBe(0);
	});

	it('should set selectedIndex from settings', () => {
		host.settings.set({
			tabs: [makeTab(), makeTab()],
			selectedIndex: 1,
		});
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriTabsComponent;
		expect(comp.selectedIndex()).toBe(1);
	});

	it('should add initial index to visitedTabs', () => {
		host.settings.set({ tabs: [makeTab(), makeTab()], selectedIndex: 1 });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriTabsComponent;
		expect(comp.visitedTabs().has(1)).toBe(true);
	});

	it('should update selectedIndex on tab change', () => {
		host.settings.set({ tabs: [makeTab(), makeTab(), makeTab()] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriTabsComponent;
		comp.onTabChange(2);
		expect(comp.selectedIndex()).toBe(2);
	});

	it('should track visited tabs', () => {
		host.settings.set({ tabs: [makeTab(), makeTab(), makeTab()] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriTabsComponent;
		expect(comp.visitedTabs().has(0)).toBe(true);
		expect(comp.visitedTabs().has(1)).toBe(false);

		comp.onTabChange(1);
		expect(comp.visitedTabs().has(1)).toBe(true);

		comp.onTabChange(2);
		expect(comp.visitedTabs().has(0)).toBe(true);
		expect(comp.visitedTabs().has(1)).toBe(true);
		expect(comp.visitedTabs().has(2)).toBe(true);
	});

	it('should render content for non-lazy tabs always', () => {
		const tabs = [makeTab(), makeTab()];
		host.settings.set({ tabs });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriTabsComponent;
		expect(comp.shouldRenderContent(0, tabs[0])).toBe(true);
		expect(comp.shouldRenderContent(1, tabs[1])).toBe(true);
	});

	it('should render lazy tab content only after visiting', () => {
		const tabs = [makeTab({ lazy: true }), makeTab({ lazy: true }), makeTab({ lazy: true })];
		host.settings.set({ tabs });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriTabsComponent;
		expect(comp.shouldRenderContent(0, tabs[0])).toBe(true);
		expect(comp.shouldRenderContent(1, tabs[1])).toBe(false);

		comp.onTabChange(1);
		expect(comp.shouldRenderContent(1, tabs[1])).toBe(true);
	});

	it('should support global lazy setting', () => {
		const tabs = [makeTab(), makeTab()];
		host.settings.set({ tabs, lazy: true });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriTabsComponent;
		expect(comp.shouldRenderContent(0, tabs[0])).toBe(true);
		expect(comp.shouldRenderContent(1, tabs[1])).toBe(false);
	});

	it('should unload tab content when tab is not selected (unload mode)', () => {
		const tabs = [makeTab({ unload: true }), makeTab({ unload: true })];
		host.settings.set({ tabs });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriTabsComponent;
		expect(comp.shouldRenderContent(0, tabs[0])).toBe(true);
		expect(comp.shouldRenderContent(1, tabs[1])).toBe(false);

		comp.onTabChange(1);
		expect(comp.shouldRenderContent(0, tabs[0])).toBe(false);
		expect(comp.shouldRenderContent(1, tabs[1])).toBe(true);
	});

	it('should support global unload setting', () => {
		const tabs = [makeTab(), makeTab()];
		host.settings.set({ tabs, unload: true });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriTabsComponent;
		expect(comp.shouldRenderContent(0, tabs[0])).toBe(true);
		expect(comp.shouldRenderContent(1, tabs[1])).toBe(false);

		comp.onTabChange(1);
		expect(comp.shouldRenderContent(0, tabs[0])).toBe(false);
	});

	it('should prioritize tab-level unload over global lazy', () => {
		const tabs = [makeTab(), makeTab({ unload: true })];
		host.settings.set({ tabs, lazy: true });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriTabsComponent;
		expect(comp.shouldRenderContent(0, tabs[0])).toBe(true);
		expect(comp.shouldRenderContent(1, tabs[1])).toBe(false);

		comp.onTabChange(1);
		expect(comp.shouldRenderContent(1, tabs[1])).toBe(true);
		expect(comp.shouldRenderContent(0, tabs[0])).toBe(true);
	});

	it('should handle empty tabs array', () => {
		host.settings.set({ tabs: [] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriTabsComponent;
		expect(comp.selectedIndex()).toBe(0);
	});

	it('should handle single tab', () => {
		host.settings.set({ tabs: [makeTab()] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriTabsComponent;
		expect(comp.selectedIndex()).toBe(0);
		expect(comp.shouldRenderContent(0, host.settings().tabs[0])).toBe(true);
	});

	it('should render tab labels', () => {
		host.settings.set({
			tabs: [makeTab({ label: 'First Tab' }), makeTab({ label: 'Second Tab' })],
		});
		fixture.detectChanges();

		const text = fixture.nativeElement.textContent;
		expect(text).toContain('First Tab');
		expect(text).toContain('Second Tab');
	});
});
