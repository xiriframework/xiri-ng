import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { XiriSnackbarService } from './snackbar.service';

describe('XiriSnackbarService', () => {
	let service: XiriSnackbarService;
	let snackBar: { open: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		snackBar = { open: vi.fn() };
		TestBed.configureTestingModule({
			providers: [
				XiriSnackbarService,
				{ provide: MatSnackBar, useValue: snackBar },
			],
		});
		service = TestBed.inject(XiriSnackbarService);
	});

	it('handleResponse returns false without message', () => {
		expect(service.handleResponse({})).toBe(false);
		expect(service.handleResponse(null)).toBe(false);
	});

	it('handleResponse calls success for success type', () => {
		const spy = vi.spyOn(service, 'success');
		service.handleResponse({ message: 'Done', messageType: 'success' });
		expect(spy).toHaveBeenCalledWith('Done');
	});
});
