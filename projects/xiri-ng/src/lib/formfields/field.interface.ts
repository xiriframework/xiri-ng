import { FormControl, ValidatorFn } from "@angular/forms";
import { XiriColor } from '../types/color.type';

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
	url?: string // treeselect, multiselect
	search?: boolean // treeselect, multiselect
	serverSideSearch?: boolean // select
	params?: Record<string, unknown> // select

	rows?: number // textfield
	accept?: string // xiri-file
	pwdhide?: boolean

	icon?: string // question
	iconColor?: XiriColor // question
	question?: string // question
	done?: boolean // waiting

	showWhen?: XiriFormFieldCondition | XiriFormFieldCondition[]

	control?: FormControl

	// old
	placeholder?: string // bool name
	array?: ( string | number )[] // xiri-select, transform into list
	tree?: boolean

}
