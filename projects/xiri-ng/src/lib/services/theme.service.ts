import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({ providedIn: 'root' })
export class ThemeService {
	private readonly platformId = inject(PLATFORM_ID);
	private readonly isBrowser = isPlatformBrowser(this.platformId);

	/** Current theme mode setting */
	private readonly _mode = signal<ThemeMode>('auto');

	/** Observable theme mode */
	readonly mode = this._mode.asReadonly();

	/** Whether dark mode is currently active (considering auto mode) */
	readonly isDark = computed(() => {
		const mode = this._mode();
		if (mode === 'auto') {
			return this.isBrowser ? this.getSystemPreference() : false;
		}
		return mode === 'dark';
	});

	/** Whether light mode is currently active */
	readonly isLight = computed(() => !this.isDark());

	constructor() {
		if (this.isBrowser) {
			// Load saved preference
			const saved = localStorage.getItem('theme') as ThemeMode | null;
			if (saved && ['light', 'dark', 'auto'].includes(saved)) {
				this._mode.set(saved);
			}

			// Apply initial theme
			this.applyTheme();

			// React to mode changes
			effect(() => {
				this.applyTheme();
			});

			// Listen for system preference changes
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			mediaQuery.addEventListener('change', () => {
				if (this._mode() === 'auto') {
					this.applyTheme();
				}
			});
		}
	}

	/**
	 * Set the theme mode
	 * @param mode - 'light', 'dark', or 'auto' (follow system preference)
	 */
	setTheme(mode: ThemeMode): void {
		this._mode.set(mode);
		if (this.isBrowser) {
			localStorage.setItem('theme', mode);
		}
	}

	/**
	 * Toggle between light and dark mode
	 * If currently auto, switches to opposite of current system preference
	 */
	toggle(): void {
		const current = this._mode();
		if (current === 'auto') {
			// Switch to opposite of current system preference
			this.setTheme(this.getSystemPreference() ? 'light' : 'dark');
		} else {
			this.setTheme(current === 'light' ? 'dark' : 'light');
		}
	}

	/**
	 * Reset to auto (system preference)
	 */
	resetToAuto(): void {
		this.setTheme('auto');
	}

	private getSystemPreference(): boolean {
		if (!this.isBrowser) return false;
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	private applyTheme(): void {
		if (!this.isBrowser) return;

		const mode = this._mode();
		const root = document.documentElement;

		// Remove existing theme classes
		root.classList.remove('light-theme', 'dark-theme');

		// Apply theme class based on mode
		if (mode === 'light') {
			root.classList.add('light-theme');
		} else if (mode === 'dark') {
			root.classList.add('dark-theme');
		}
		// 'auto' mode: no class needed, CSS media query handles it
	}
}
