import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriSidenavComponent, XiriSidebarSettings, XiriNavigationField } from './sidenav.component';
import { Router, NavigationEnd, Event, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
	selector: 'test-host',
	template: `<xiri-sidenav [settings]="settings()" />`,
	imports: [XiriSidenavComponent],
})
class TestHostComponent {
	settings = signal<XiriSidebarSettings | undefined>(undefined);
}

describe('XiriSidenavComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let routerEvents$: Subject<Event>;
	let mockRouter: { events: Subject<Event>; url: string; navigate: ReturnType<typeof vi.fn> };

	beforeEach(async () => {
		routerEvents$ = new Subject<Event>();
		mockRouter = {
			events: routerEvents$,
			url: '/app/dashboard',
			navigate: vi.fn().mockReturnValue(Promise.resolve(true)),
		};

		await TestBed.configureTestingModule({
			imports: [TestHostComponent, NoopAnimationsModule],
			providers: [
				{ provide: Router, useValue: mockRouter },
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

	it('should show loading when settings is undefined', () => {
		host.settings.set(undefined);
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriSidenavComponent;
		expect(comp.loading).toBe(true);
		expect(comp.fields).toEqual([]);
	});

	it('should show loading when settings has null fields', () => {
		host.settings.set({ prefix: '/app', fields: null as any });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriSidenavComponent;
		expect(comp.loading).toBe(true);
	});

	it('should stop loading when valid settings are provided', () => {
		host.settings.set({
			prefix: '/app',
			fields: [{ name: 'Dashboard', icon: 'dashboard', link: '/dashboard' }],
		});
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriSidenavComponent;
		expect(comp.loading).toBe(false);
		expect(comp.fields.length).toBe(1);
	});

	it('should set fields from settings', () => {
		const fields: XiriNavigationField[] = [
			{ name: 'Home', icon: 'home', link: '/home' },
			{ name: 'Settings', icon: 'settings', link: '/settings' },
		];
		host.settings.set({ prefix: '/app', fields });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriSidenavComponent;
		expect(comp.fields.length).toBe(2);
	});

	it('should set active field based on current URL', () => {
		mockRouter.url = '/app/dashboard';
		const fields: XiriNavigationField[] = [
			{ name: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
			{ name: 'Settings', icon: 'settings', link: '/settings' },
		];
		host.settings.set({ prefix: '/app', fields });
		fixture.detectChanges();

		expect(fields[0].active).toBe(true);
		expect(fields[1].active).toBe(false);
	});

	it('should update active field on navigation', () => {
		const fields: XiriNavigationField[] = [
			{ name: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
			{ name: 'Settings', icon: 'settings', link: '/settings' },
		];
		host.settings.set({ prefix: '/app', fields });
		fixture.detectChanges();

		routerEvents$.next(new NavigationEnd(1, '/app/settings', '/app/settings'));
		fixture.detectChanges();

		expect(fields[0].active).toBe(false);
		expect(fields[1].active).toBe(true);
	});

	it('should handle fields with regex path matching', () => {
		const fields: XiriNavigationField[] = [
			{ name: 'Users', icon: 'people', link: '/users', path: '/users.*' },
		];
		host.settings.set({ prefix: '/app', fields });
		fixture.detectChanges();

		routerEvents$.next(new NavigationEnd(1, '/app/users/123', '/app/users/123'));
		fixture.detectChanges();

		expect(fields[0].active).toBe(true);
	});

	it('should compile regex from path on settings change', () => {
		const fields: XiriNavigationField[] = [
			{ name: 'Users', icon: 'people', link: '/users', path: '/users/\\d+' },
		];
		host.settings.set({ prefix: '/app', fields });
		fixture.detectChanges();

		expect(fields[0].regex).toBeTruthy();
		expect(fields[0].regex!.test('/users/42')).toBe(true);
	});

	it('should handle menu items with submenus', () => {
		const fields: XiriNavigationField[] = [
			{
				name: 'Admin',
				icon: 'admin_panel_settings',
				menu: true,
				sub: [
					{ name: 'Users', icon: 'people', link: '/admin/users' },
					{ name: 'Roles', icon: 'security', link: '/admin/roles' },
				],
			},
		];
		host.settings.set({ prefix: '/app', fields });
		fixture.detectChanges();

		routerEvents$.next(new NavigationEnd(1, '/app/admin/users', '/app/admin/users'));
		fixture.detectChanges();

		expect(fields[0].active).toBe(true);
		expect(fields[0].showSubmenu).toBe(true);
		expect(fields[0].sub![0].active).toBe(true);
		expect(fields[0].sub![1].active).toBe(false);
	});

	it('should deactivate menu when no sub matches', () => {
		const fields: XiriNavigationField[] = [
			{
				name: 'Admin',
				icon: 'admin',
				menu: true,
				sub: [
					{ name: 'Users', icon: 'people', link: '/admin/users' },
				],
			},
		];
		host.settings.set({ prefix: '/app', fields });
		fixture.detectChanges();

		routerEvents$.next(new NavigationEnd(1, '/app/other', '/app/other'));
		fixture.detectChanges();

		expect(fields[0].active).toBe(false);
		expect(fields[0].showSubmenu).toBe(false);
	});

	it('should handle empty prefix', () => {
		mockRouter.url = '/dashboard';
		const fields: XiriNavigationField[] = [
			{ name: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
		];
		host.settings.set({ prefix: '', fields });
		fixture.detectChanges();

		expect(fields[0].active).toBe(true);
	});

	it('should handle missing fields gracefully on navigation', () => {
		host.settings.set(undefined);
		fixture.detectChanges();

		routerEvents$.next(new NavigationEnd(1, '/somewhere', '/somewhere'));
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriSidenavComponent;
		expect(comp.loading).toBe(true);
	});

	it('should update when settings change from undefined to valid', () => {
		host.settings.set(undefined);
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriSidenavComponent;
		expect(comp.loading).toBe(true);

		const fields: XiriNavigationField[] = [
			{ name: 'Home', icon: 'home', link: '/home' },
		];
		host.settings.set({ prefix: '/app', fields });
		fixture.detectChanges();

		expect(comp.loading).toBe(false);
		expect(comp.fields.length).toBe(1);
	});
});
