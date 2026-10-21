import { HttpErrorResponse } from '@angular/common/http';

/** Server-Meldung (xiri-go `{"error": "…"}`) als nicht-leerer String, sonst undefined. */
export function serverMessage( err: HttpErrorResponse ): string | undefined {
	const message = err?.error?.error;
	return typeof message === 'string' && message ? message : undefined;
}

/** Server-Meldung bei jedem Status, sonst ein fester Rückfalltext. */
export function parseHttpError( err: HttpErrorResponse ): string {
	const message = serverMessage( err );
	if ( message )
		return message;
	if ( err.status === 400 || err.status === 424 )
		return 'Format Error';
	if ( err.status === 403 )
		return 'Access denied';
	if ( err.status === 404 )
		return 'Not found';
	if ( err.status === 0 )
		return 'Connection error';
	return 'Unknown error';
}

/** Liest `fields: {id: message}` aus einer 400-Antwort (xiri-go FieldErrors); nur String-Werte, sonst undefined. */
export function parseFieldErrors( err: HttpErrorResponse ): Record<string, string> | undefined {
	const fields = ( err.error as { fields?: unknown } | null )?.fields;
	if ( err.status !== 400 || !fields || typeof fields !== 'object' || Array.isArray( fields ) )
		return undefined;
	const out: Record<string, string> = {};
	for ( const [ id, message ] of Object.entries( fields as Record<string, unknown> ) )
		if ( typeof message === 'string' )
			out[ id ] = message;
	return Object.keys( out ).length ? out : undefined;
}
