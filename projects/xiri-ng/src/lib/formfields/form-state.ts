// Was xiri-form, xiri-dialog, xiri-query und xiri-stepper aus einem formChange lesen.
//
// Eine FormGroup, deren Controls alle disabled sind, ist bei Angular DISABLED statt VALID
// (valid false, invalid false) und liefert in `value` den Rohwert aller Controls. Beides ist
// für die Konsumenten falsch: ein Anzeige-Formular mit OK-Button muss absendbar bleiben, und
// disabled Controls gehören nie in den Submit — auch nicht die per showWhen versteckten, deren
// veralteten Wert der Server sonst bindet (er kennt showWhen nicht). INVALID und PENDING
// bleiben gesperrt.
export interface XiriFormChangeLike {
	valid: boolean
	disabled?: boolean
	value: Record<string, unknown> | null
}

export function formState( event: XiriFormChangeLike ): { valid: boolean; value: Record<string, unknown> | null } {
	if ( event.disabled === true )
		return { valid: true, value: {} };
	return { valid: event.valid, value: event.value };
}
