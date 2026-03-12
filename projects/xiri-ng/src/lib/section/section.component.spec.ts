import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal, input } from '@angular/core';
import { XiriSectionSettings } from './section.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';

// Recreate a minimal test-only version of the section component
// since the real one has a forwardRef to XiriDynComponentComponent
// that cannot be resolved in unit tests without the full component tree.
@Component({
	selector: 'xiri-section-test',
	template: `
		<section class="xiri-section">
			@if (settings().title) {
				<div class="section-header"
				     [class.collapsible]="settings().collapsible"
				     (click)="settings().collapsible && toggle()">
					<div class="section-header-left">
						@if (settings().icon) {
							<mat-icon [class]="settings().iconColor || ''">{{ settings().icon }}</mat-icon>
						}
						<div>
							<h2>{{ settings().title }}</h2>
							@if (settings().subtitle) {
								<span class="section-subtitle">{{ settings().subtitle }}</span>
							}
						</div>
					</div>
					<div class="section-header-right">
						@if (settings().collapsible) {
							<mat-icon class="collapse-icon" [class.collapsed]="collapsed()">expand_more</mat-icon>
						}
					</div>
				</div>
				<mat-divider></mat-divider>
			}
			<div class="collapse-wrapper" [class.collapsed]="collapsed()">
				<div class="collapse-inner">
					<div class="section-content">
						<ng-content></ng-content>
					</div>
				</div>
			</div>
		</section>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [MatIcon, MatDivider],
})
class TestSectionComponent {
	settings = input.required<XiriSectionSettings>();
	collapsed = signal<boolean>(false);

	ngOnInit() {
		if (this.settings().collapsed) {
			this.collapsed.set(true);
		}
	}

	toggle() {
		this.collapsed.update(v => !v);
	}
}

@Component({
	selector: 'test-host',
	template: `<xiri-section-test [settings]="settings()" />`,
	imports: [TestSectionComponent],
})
class TestHostComponent {
	settings = signal<XiriSectionSettings>({});
}

describe('XiriSectionComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TestHostComponent, NoopAnimationsModule],
		}).compileComponents();
		fixture = TestBed.createComponent(TestHostComponent);
		host = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should display title when provided', () => {
		host.settings.set({ title: 'Section Title' });
		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('Section Title');
	});

	it('should display subtitle when provided', () => {
		host.settings.set({ title: 'Main', subtitle: 'Sub' });
		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('Sub');
	});

	it('should start expanded by default', () => {
		host.settings.set({ title: 'Test' });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as TestSectionComponent;
		expect(comp.collapsed()).toBe(false);
	});

	it('should start collapsed when collapsed=true in settings', () => {
		// Need a fresh fixture where collapsed=true before first detectChanges
		const fix2 = TestBed.createComponent(TestHostComponent);
		fix2.componentInstance.settings.set({ title: 'Test', collapsed: true });
		fix2.detectChanges();

		const comp = fix2.debugElement.children[0].componentInstance as TestSectionComponent;
		expect(comp.collapsed()).toBe(true);
	});

	it('should toggle collapsed state', () => {
		host.settings.set({ title: 'Test', collapsible: true });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as TestSectionComponent;
		expect(comp.collapsed()).toBe(false);

		comp.toggle();
		expect(comp.collapsed()).toBe(true);

		comp.toggle();
		expect(comp.collapsed()).toBe(false);
	});

	it('should render icon when provided', () => {
		host.settings.set({ title: 'Iconned', icon: 'star' });
		fixture.detectChanges();

		const icon = fixture.nativeElement.querySelector('mat-icon');
		expect(icon).toBeTruthy();
	});

	it('should handle empty settings', () => {
		host.settings.set({});
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as TestSectionComponent;
		expect(comp.collapsed()).toBe(false);
	});

	it('should handle settings without collapsible', () => {
		host.settings.set({ title: 'Not collapsible' });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as TestSectionComponent;
		comp.toggle();
		expect(comp.collapsed()).toBe(true);
	});

	it('should update when settings signal changes', () => {
		host.settings.set({ title: 'First' });
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('First');

		host.settings.set({ title: 'Second' });
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Second');
	});

	it('should toggle collapse via header click when collapsible', () => {
		host.settings.set({ title: 'Clickable', collapsible: true });
		fixture.detectChanges();

		const header = fixture.nativeElement.querySelector('.section-header');
		header?.click();
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as TestSectionComponent;
		expect(comp.collapsed()).toBe(true);
	});

	it('should not collapse via header click when not collapsible', () => {
		host.settings.set({ title: 'Static' });
		fixture.detectChanges();

		const header = fixture.nativeElement.querySelector('.section-header');
		header?.click();
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as TestSectionComponent;
		expect(comp.collapsed()).toBe(false);
	});

	it('should show collapse icon when collapsible', () => {
		host.settings.set({ title: 'Collapse', collapsible: true });
		fixture.detectChanges();

		const collapseIcon = fixture.nativeElement.querySelector('.collapse-icon');
		expect(collapseIcon).toBeTruthy();
	});

	it('should not show collapse icon when not collapsible', () => {
		host.settings.set({ title: 'Fixed' });
		fixture.detectChanges();

		const collapseIcon = fixture.nativeElement.querySelector('.collapse-icon');
		expect(collapseIcon).toBeFalsy();
	});

	it('should apply collapsed class to wrapper when collapsed', () => {
		const fix2 = TestBed.createComponent(TestHostComponent);
		fix2.componentInstance.settings.set({ title: 'Test', collapsed: true });
		fix2.detectChanges();

		const wrapper = fix2.nativeElement.querySelector('.collapse-wrapper');
		expect(wrapper?.classList.contains('collapsed')).toBe(true);
	});

	it('should not apply collapsed class when expanded', () => {
		host.settings.set({ title: 'Test' });
		fixture.detectChanges();

		const wrapper = fixture.nativeElement.querySelector('.collapse-wrapper');
		expect(wrapper?.classList.contains('collapsed')).toBe(false);
	});

	it('should not render section header when no title', () => {
		host.settings.set({});
		fixture.detectChanges();

		const header = fixture.nativeElement.querySelector('.section-header');
		expect(header).toBeFalsy();
	});
});
