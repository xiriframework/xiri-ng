import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

export type XiriSnackbarType = 'success' | 'error' | 'info' | 'warning';

@Injectable( {
	             providedIn: 'root',
             } )
export class XiriSnackbarService {

	private snackbar = inject( MatSnackBar );

	success( message: string, duration = 3000, action?: string ): MatSnackBarRef<TextOnlySnackBar> {
		return this.show( message, 'success', duration, action );
	}

	error( message: string, duration = 5000, action?: string ): MatSnackBarRef<TextOnlySnackBar> {
		return this.show( message, 'error', duration, action );
	}

	info( message: string, duration = 3000, action?: string ): MatSnackBarRef<TextOnlySnackBar> {
		return this.show( message, 'info', duration, action );
	}

	warning( message: string, duration = 4000, action?: string ): MatSnackBarRef<TextOnlySnackBar> {
		return this.show( message, 'warning', duration, action );
	}

	handleResponse( response: any ): boolean {
		if ( !response?.message || !response?.messageType ) return false;
		switch ( response.messageType as XiriSnackbarType ) {
			case 'success': this.success( response.message ); break;
			case 'error':   this.error( response.message );   break;
			case 'info':    this.info( response.message );     break;
			case 'warning': this.warning( response.message );  break;
			default:        this.info( response.message );
		}
		return true;
	}

	private show( message: string, type: XiriSnackbarType, duration: number, action?: string ): MatSnackBarRef<TextOnlySnackBar> {
		const config: MatSnackBarConfig = {
			duration: duration,
			horizontalPosition: 'center',
			verticalPosition: 'bottom',
			panelClass: [ `xiri-snackbar-${ type }` ],
			politeness: type === 'error' ? 'assertive' : 'polite',
		};

		return this.snackbar.open( message, action || undefined, config );
	}
}
