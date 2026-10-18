import { FormControl, ValidatorFn } from "@angular/forms";
import { XiriColor } from '../types/color.type';
import { XiriCols } from '../layout/cols.directive';

export interface XiriFormValidator {
	id: string
	name?: string
	validator: ValidatorFn
	message: string
}

export interface XiriFormFieldSelectOption {
	id: number | string
	name: string
	disabled?: boolean
	color?: XiriColor
	isGroup?: boolean
	children?: XiriFormFieldSelectOption[]
}

export interface XiriTagChip {
	label: string
	color?: XiriColor
}

export type XiriFormFieldConditionOperator = 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'in' | 'notEmpty';

export interface XiriFormFieldCondition {
	field: string
	operator: XiriFormFieldConditionOperator
	value?: unknown
}

export interface XiriFormField {

	id: string
	type: string
	subtype?: string
	formtype?: string // write into type

	name?: string
	hint?: string
	class?: string
	cols?: XiriCols
	textPrefix?: string
	textSuffix?: string
	iconPrefix?: string
	iconSuffix?: string
	locale?: string

	value?: unknown
	validations?: XiriFormValidator[]
	list?: XiriFormFieldSelectOption[]
	texts?: Record<string, string> // xiri-timelimit

	hide?: boolean
	required?: boolean
	disabled?: boolean
	collapsible?: boolean // header type: collapsible section
	collapsed?: boolean // header type: current collapsed state

	min?: number
	max?: number
	pattern?: string

	multiple?: boolean // treeselect, multiselect
	selectAll?: boolean // select (multiple): "Alle/Keine"-Toggle über der Optionsliste
	url?: string // treeselect, multiselect; text, chips: Vorschläge beim Tippen
	search?: boolean // treeselect, multiselect
	serverSideSearch?: boolean // select
	searchWith?: string[] // text, chips: IDs anderer Felder, deren aktueller (enabled) Wert im Vorschlags-Request mitgeht
	params?: Record<string, unknown> // select
	freeText?: boolean // chips: false = nur Optionen, Default true

	rows?: number // textfield
	accept?: string // xiri-file
	pwdhide?: boolean

	icon?: string // question
	iconColor?: XiriColor // question
	question?: string // question
	done?: boolean // waiting

	showWhen?: XiriFormFieldCondition | XiriFormFieldCondition[]

	// Server-driven content: when one of the `reloadOn` field values changes, the form posts
	// those trigger values to `reloadUrl` and merges the returned `{fields: {id: {...}}}` patch.
	// Both are required — a dependency without a url cannot be resolved.
	reloadOn?: string[]
	reloadUrl?: string
	// "+"-Button neben dem Feld: GET addUrl liefert einen Formular-Dialog, dessen POST mit
	// {done, created: {id, name}} antwortet; die Option wird angehängt und selektiert.
	addUrl?: string
	// Zeilen-Feld (type 'rows'): fields beschreibt eine Zeile, der Wert ist ein Array von Objekten
	// (Schlüssel = id der Unterfelder). min/max zählen Zeilen, required = mindestens eine Zeile.
	fields?: XiriFormField[]
	addText?: string
	sortable?: boolean // Default true: Ziehgriff und Pfeile
	addable?: boolean // Default true
	removable?: boolean // Default true
	copy?: boolean // Default false: Kopieren-Icon je Zeile
	unique?: string[] // Unterfeld-IDs, deren Kombination eindeutig sein muss

	control?: FormControl

	// old
	placeholder?: string // bool name
	array?: ( string | number )[] // xiri-select, transform into list
	tree?: boolean

}
