import { computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { XiriDataService } from './data.service';

/**
 * Lädt ein Panel (Card, Expansion-Panel) von einer URL und puffert die letzte erfolgreiche Antwort.
 * Gemeinsame Logik der XIRI_PANEL_HOST-Implementierungen; muss im Injection-Context aufgerufen werden.
 *
 * - `raw`: rohe Antwort, nur gelesen, wenn die Resource einen Wert hat (value() wirft im Fehlerzustand).
 * - `loaded`: das Objekt unter `opts.key` der letzten erfolgreichen Antwort. Bleibt bei Reload-Fehler
 *   stehen, wird bei url-Wechsel und bei einer erfolgreichen Antwort ohne `opts.key` geleert.
 * - `reloadOrQueue`: lädt neu; läuft der erste Load noch, wird der Reload nachgeholt, sobald er fertig ist.
 */
export function createPanelLoader<T extends object>( opts: { url: () => string | undefined; key: string } ) {
	const dataService = inject( XiriDataService );
	// Signal, kein Boolean: der Effect muss darauf reagieren, wenn es gesetzt wird.
	const pendingReload = signal( false );

	const resource = rxResource( {
		params: opts.url,
		stream: ( { params } ) => dataService.post( params, null ),
	} );

	const errorMsg = computed( () => {
		const e = resource.error() as { cause?: unknown } | undefined;
		if ( !e ) return '';
		const http = ( e.cause ?? e ) as { error?: { error?: string } };
		return http.error?.error || 'Fehler beim Laden';
	} );

	const raw = computed<unknown>( () => resource.hasValue() ? resource.value() : undefined );

	/** Objekt unter `key` in der aktuellen Antwort (Top-Level), sonst null. */
	const response = computed<T | null>( () => {
		const r = raw() as Record<string, unknown> | null | undefined;
		const c = r && typeof r === 'object' && !Array.isArray( r ) ? r[ opts.key ] : undefined;
		return c && typeof c === 'object' && !Array.isArray( c ) ? c as T : null;
	} );

	const loaded = linkedSignal<{ url: string | undefined; item: T | null; hasValue: boolean }, T | null>( {
		source: () => ( { url: opts.url(), item: response(), hasValue: raw() != null } ),
		computation: ( s, prev ) => {
			if ( s.item ) return s.item;
			if ( s.hasValue ) return null;
			return prev && prev.source.url === s.url ? prev.value : null;
		},
	} );

	// pendingReload zuerst lesen, damit beide Signale als Abhängigkeit registriert sind.
	effect( () => {
		const pending = pendingReload();
		const loading = resource.isLoading();
		if ( pending && !loading ) {
			pendingReload.set( false );
			resource.reload();
		}
	} );

	return {
		loading: resource.isLoading,
		errorMsg,
		raw,
		loaded,
		/** Manueller Reload (Reload-Button): kein Doppelstart, solange geladen wird. */
		reload: () => {
			if ( !resource.isLoading() ) resource.reload();
		},
		/** refresh:'panel': reload() gibt false zurück, solange der erste Load läuft – dann nachholen. */
		// ponytail: bei url-Wechsel während pending läuft danach ein Reload zu viel; harmlos.
		reloadOrQueue: () => {
			if ( !resource.reload() ) pendingReload.set( true );
		},
	};
}
