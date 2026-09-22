import { HttpErrorResponse } from '@angular/common/http';

export function parseHttpError( err: HttpErrorResponse ): string {
	if ( err.status === 400 || err.status === 424 )
		return err.error?.error || 'Format Error';
	if ( err.status === 403 )
		return err.error?.error || 'Access denied';
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
