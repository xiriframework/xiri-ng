import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { XiriListComponent, XiriListSettings, XiriListItem, XiriListSection } from './list.component';
import { XiriDataService } from '../services/data.service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

function makeItem(overrides: Partial<XiriListItem> = {}): XiriListItem {
	return {
		name: 'Item',
		info: 'Info',
		icon: 'star',
		iconColor: 'primary',
		url: '/item',
		...overrides,
	};
}

function makeSection(overrides: Partial<XiriListSection> = {}): XiriListSection {
	return {
		name: 'Section',
		data: [],
		...overrides,
	};
}

@Component({
	selector: 'test-host',
	template: `<xiri-list [settings]="settings()" />`,
	imports: [XiriListComponent],
})
class TestHostComponent {
	settings = signal<XiriListSettings>({ sections: [] });
}

describe('XiriListComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;
	let mockDataService: { get: ReturnType<typeof vi.fn> };

	beforeEach(async () => {
		mockDataService = { get: vi.fn().mockReturnValue(of({})) };

		await TestBed.configureTestingModule({
			imports: [TestHostComponent, NoopAnimationsModule],
			providers: [
				{ provide: XiriDataService, useValue: mockDataService },
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

	it('should render with empty sections', () => {
		host.settings.set({ sections: [] });
		fixture.detectChanges();

		expect(fixture.componentInstance).toBeTruthy();
	});

	it('should render sections with items', () => {
		host.settings.set({
			sections: [
				makeSection({
					name: 'Group A',
					data: [makeItem({ name: 'Alpha' }), makeItem({ name: 'Beta' })],
				}),
			],
		});
		fixture.detectChanges();

		const text = fixture.nativeElement.textContent;
		expect(text).toContain('Alpha');
		expect(text).toContain('Beta');
	});

	it('should render section headers', () => {
		host.settings.set({
			sections: [
				makeSection({ name: 'First Group', data: [makeItem()] }),
				makeSection({ name: 'Second Group', data: [makeItem()] }),
			],
		});
		fixture.detectChanges();

		const text = fixture.nativeElement.textContent;
		expect(text).toContain('First Group');
		expect(text).toContain('Second Group');
	});

	it('should render item info text', () => {
		host.settings.set({
			sections: [makeSection({ data: [makeItem({ name: 'Test', info: 'Details here' })] })],
		});
		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('Details here');
	});

	it('should toggle favorite and call data service', () => {
		const item = makeItem({
			hasFavorite: true,
			isFavorite: false,
			favoriteUrl: '/api/fav/',
		});
		host.settings.set({ sections: [makeSection({ data: [item] })] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriListComponent;
		const mockEvent = { stopPropagation: vi.fn(), preventDefault: vi.fn() } as unknown as Event;

		comp.changeFavorite(item, mockEvent);

		expect(mockDataService.get).toHaveBeenCalledWith('/api/fav/1');
		expect(item.isFavorite).toBe(true);
	});

	it('should untoggle favorite when already favorite', () => {
		const item = makeItem({
			hasFavorite: true,
			isFavorite: true,
			favoriteUrl: '/api/fav/',
		});
		host.settings.set({ sections: [makeSection({ data: [item] })] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriListComponent;
		const mockEvent = { stopPropagation: vi.fn(), preventDefault: vi.fn() } as unknown as Event;

		comp.changeFavorite(item, mockEvent);

		expect(mockDataService.get).toHaveBeenCalledWith('/api/fav/0');
		expect(item.isFavorite).toBe(false);
	});

	it('should stop event propagation on favorite change', () => {
		const item = makeItem({ hasFavorite: true, isFavorite: false, favoriteUrl: '/fav/' });
		host.settings.set({ sections: [makeSection({ data: [item] })] });
		fixture.detectChanges();

		const comp = fixture.debugElement.children[0].componentInstance as XiriListComponent;
		const mockEvent = { stopPropagation: vi.fn(), preventDefault: vi.fn() } as unknown as Event;

		comp.changeFavorite(item, mockEvent);

		expect(mockEvent.stopPropagation).toHaveBeenCalled();
		expect(mockEvent.preventDefault).toHaveBeenCalled();
	});

	it('should handle multiple sections', () => {
		host.settings.set({
			sections: [
				makeSection({ name: 'A', data: [makeItem({ name: 'A1' })] }),
				makeSection({ name: 'B', data: [makeItem({ name: 'B1' })] }),
				makeSection({ name: 'C', data: [makeItem({ name: 'C1' })] }),
			],
		});
		fixture.detectChanges();

		const text = fixture.nativeElement.textContent;
		expect(text).toContain('A1');
		expect(text).toContain('B1');
		expect(text).toContain('C1');
	});

	it('should render icons for items', () => {
		host.settings.set({
			sections: [makeSection({ data: [makeItem({ icon: 'person' })] })],
		});
		fixture.detectChanges();

		const icons = fixture.nativeElement.querySelectorAll('mat-icon');
		expect(icons.length).toBeGreaterThan(0);
	});

	it('should update when settings change', () => {
		host.settings.set({ sections: [makeSection({ data: [makeItem({ name: 'Original' })] })] });
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Original');

		host.settings.set({ sections: [makeSection({ data: [makeItem({ name: 'Updated' })] })] });
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Updated');
	});
});
