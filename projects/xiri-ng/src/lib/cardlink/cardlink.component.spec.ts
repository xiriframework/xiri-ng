import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriCardlinkComponent, XiriCardlinkSettings } from './cardlink.component';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
	selector: 'test-host',
	template: `<xiri-cardlink [settings]="settings()" />`,
	imports: [XiriCardlinkComponent],
})
class TestHostComponent {
	settings = signal<XiriCardlinkSettings>({ link: '/home', iconSet: 'material' });
}

describe('XiriCardlinkComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TestHostComponent, NoopAnimationsModule],
			providers: [
				{ provide: ActivatedRoute, useValue: {} },
			],
		}).compileComponents();
		fixture = TestBed.createComponent(TestHostComponent);
		host = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should render a card', () => {
		host.settings.set({ link: '/dashboard', iconSet: 'material', text: 'Dashboard' });
		fixture.detectChanges();

		const card = fixture.nativeElement.querySelector('mat-card');
		expect(card).toBeTruthy();
	});

	it('should display text when provided', () => {
		host.settings.set({ link: '/test', iconSet: 'material', text: 'My Card' });
		fixture.detectChanges();

		const title = fixture.nativeElement.querySelector('mat-card-title');
		expect(title?.textContent).toContain('My Card');
	});

	it('should display subtitle when provided', () => {
		host.settings.set({ link: '/test', iconSet: 'material', text: 'Card', sub: 'Subtitle' });
		fixture.detectChanges();

		const subtitle = fixture.nativeElement.querySelector('mat-card-subtitle');
		expect(subtitle?.textContent).toContain('Subtitle');
	});

	it('should render icon when provided', () => {
		host.settings.set({ link: '/test', iconSet: 'material', icon: 'home', text: 'Home' });
		fixture.detectChanges();

		const icon = fixture.nativeElement.querySelector('mat-icon');
		expect(icon).toBeTruthy();
	});

	it('should handle settings without optional properties', () => {
		host.settings.set({ link: '/minimal', iconSet: '' });
		fixture.detectChanges();

		const card = fixture.nativeElement.querySelector('mat-card');
		expect(card).toBeTruthy();
	});

	it('should update when settings change', () => {
		host.settings.set({ link: '/first', iconSet: 'material', text: 'First' });
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('First');

		host.settings.set({ link: '/second', iconSet: 'material', text: 'Second' });
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Second');
	});
});
