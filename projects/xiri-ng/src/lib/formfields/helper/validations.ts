import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { XiriFormField } from '../field.interface';
import { XiriLocaleService } from '../../services/locale.service';

function formatValidationDate( localeString: string, unixSeconds: number ): string {
	return new Intl.DateTimeFormat( localeString ).format( new Date( unixSeconds * 1000 ) );
}

// Validatoren und Fehlertexte eines Felds. Legt field.validations beim ersten Aufruf an (Texte als Getter, damit
// ein Sprachwechsel ohne Neuaufbau greift) und liefert die zusammengesetzte Validator-Funktion. Auch für die
// Zellen von xiri-rows: gleiche Regeln wie als Einzelfeld.
export function buildValidations( field: XiriFormField, localeService: XiriLocaleService ): ValidatorFn | null {

	const validList: ValidatorFn[] = [];

	if ( field.validations === undefined ) {

		field.validations = [];
		// Sprache wird bei jedem Zugriff auf `message` frisch aus dem Service gelesen (Getter),
		// damit die Fehlertexte bei einem Sprachwechsel ohne Neuaufbau der Validatoren umschalten.
		const messagesFor = () => localeService.validationMessagesFor();
		const localeStringFor = () => localeService.localeString();

		if ( field.min !== undefined ) {
			const min = field.min;
			if ( field.type == 'number' )
				field.validations.push( {
					                        id: 'min',
					                        validator: Validators.min( min ),
					                        get message() { return messagesFor().minNumber( min ); }
				                        } );
			else if ( field.type == 'date' )
				field.validations.push( {
					                        id: 'min',
					                        validator: Validators.min( min ),
					                        get message() { return messagesFor().minDate( formatValidationDate( localeStringFor(), min ) ); }
				                        } );
			else if ( field.type == 'daterange' || field.type == 'datetimerange' )
				field.validations.push( {
					                        id: 'min',
					                        validator: validatorDateRangeStart( min ),
					                        get message() { return messagesFor().minDateRange( formatValidationDate( localeStringFor(), min ) ); }
				                        } );
			else if ( field.type == 'rows' )
				field.validations.push( {
					                        id: 'minlength',
					                        validator: Validators.minLength( min ),
					                        get message() { return localeService.rowsMessages().minRows( min ); }
				                        } );
			else if ( field.type == 'multiselect' || field.type == 'treeselect' )
				field.validations.push( {
					                        id: 'min',
					                        validator: validatorArrayMin( min ),
					                        get message() { return messagesFor().minSelection( min ); }
				                        } );
			else
				field.validations.push( {
					                        id: 'minlength',
					                        validator: Validators.minLength( min ),
					                        get message() { return messagesFor().minLength( min ); }
				                        } );
		}
		if ( field.max !== undefined ) {
			const max = field.max;
			if ( field.type == 'number' )
				field.validations.push( {
					                        id: 'max',
					                        validator: Validators.max( max ),
					                        get message() { return messagesFor().maxNumber( max ); }
				                        } );
			else if ( field.type == 'date' )
				field.validations.push( {
					                        id: 'max',
					                        validator: Validators.max( max ),
					                        get message() { return messagesFor().maxDate( formatValidationDate( localeStringFor(), max ) ); }
				                        } );
			else if ( field.type == 'daterange' || field.type == 'datetimerange' )
				field.validations.push( {
					                        id: 'max',
					                        validator: validatorDateRangeEnd( max ),
					                        get message() { return messagesFor().maxDateRange( formatValidationDate( localeStringFor(), max ) ); }
				                        } );
			else if ( field.type == 'rows' )
				field.validations.push( {
					                        id: 'maxlength',
					                        validator: Validators.maxLength( max ),
					                        get message() { return localeService.rowsMessages().maxRows( max ); }
				                        } );
			else if ( field.type == 'multiselect' || field.type == 'treeselect' )
				field.validations.push( {
					                        id: 'max',
					                        validator: validatorArrayMax( max ),
					                        get message() { return messagesFor().maxSelection( max ); }
				                        } );
			// Beim Datei-Feld ist max eine Byte-Grenze pro Datei, die xiri-file selbst prüft.
			else if ( field.type != 'file' )
				field.validations.push( {
					                        id: 'maxlength',
					                        validator: Validators.maxLength( max ),
					                        get message() { return messagesFor().maxLength( max ); }
				                        } );
		}

		if ( field.pattern !== undefined ) {
			field.validations.push( {
				                        id: 'pattern',
				                        validator: Validators.pattern( field.pattern ),
				                        get message() { return messagesFor().invalidFormat; }
			                        } );
		} else {
			if ( field.type == 'text' && field.subtype == 'email' ) {
				field.validations.push( {
					                        id: 'email',
					                        validator: Validators.email,
					                        get message() { return messagesFor().invalidEmail; }
				                        } );
			}
		}

		if ( field.required == true ) {
			field.validations.push( {
				                        id: 'required',
				                        validator: Validators.required,
				                        get message() { return messagesFor().required; },
			                        } );
		} else {
			field.validations.push( {
				                        id: 'undefined',
				                        validator: validatorUndefined(),
				                        get message() { return messagesFor().valueRequired; },
			                        } );
		}
	}

	field.validations.forEach( valid => {
		validList.push( valid.validator );
	} );

	return validList.length ? Validators.compose( validList ) : null;
}

function validatorDateRangeStart( min: number ): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		if ( control.value === undefined || control.value === null || control.value.start === null )
			return null;
		const ok = min < control.value.start;
		return ok ? null : { min: { value: control.value } };
	};
}

function validatorDateRangeEnd( max: number ): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		if ( control.value === undefined || control.value === null || control.value.end === null )
			return null;
		const ok = max > control.value.end;
		return ok ? null : { max: { value: control.value } };
	};
}

function validatorUndefined(): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		return control.value === undefined ? { undefined: { value: control.value } } : null;
	};
}

function validatorArrayMin( min: number ): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		if ( control.value === null || control.value === undefined )
			return null;
		const ok = control.value.length >= min;
		return ok ? null : { min: { value: control.value } };
	};
}

function validatorArrayMax( max: number ): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		if ( control.value === null || control.value === undefined )
			return null;
		const ok = control.value.length <= max;
		return ok ? null : { max: { value: control.value } };
	};
}
