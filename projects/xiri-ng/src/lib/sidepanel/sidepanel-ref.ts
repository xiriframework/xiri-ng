import { Subject, Observable } from 'rxjs';
import { OverlayRef } from '@angular/cdk/overlay';

export class XiriSidepanelRef {
	private readonly closed$ = new Subject<unknown>();

	constructor( private readonly overlayRef?: OverlayRef, private readonly previouslyFocused?: HTMLElement | null ) {
	}

	afterClosed(): Observable<unknown> {
		return this.closed$.asObservable();
	}

	close( result?: unknown ): void {
		this.overlayRef?.dispose();
		this.previouslyFocused?.focus?.();
		this.closed$.next( result );
		this.closed$.complete();
	}
}
