import { XiriFormField } from '../field.interface';

// The "empty" value used to clear a control, matching the shape the control currently holds.
export function emptyValueForField( field: XiriFormField ): unknown {
	const value = field.control?.value;
	if ( Array.isArray( value ) )
		return [];
	if ( typeof value === 'string' )
		return '';
	return null;
}
