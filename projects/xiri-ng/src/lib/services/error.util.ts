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
