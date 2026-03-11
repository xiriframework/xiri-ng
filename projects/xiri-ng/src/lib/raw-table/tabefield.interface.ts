import { XiriButton } from "../button/button.component";

export interface XiriTableField {
	id: string
	name: string
	format?: string
	search?: boolean
	sort?: boolean
	buttons?: XiriButton[],
	icons?: {
		icon: string
		color?: string
		hint?: string
	}[]
	display?: string
	header?: string
	sticky?: boolean
	
	inputType?: string // input field
	inputRequired?: boolean // input field
	inputLang?: string // input field
	inputPaste?: boolean // input field
	
	textPrefix?: string // text prefix
	textSuffix?: string // text suffix
	
	width?: string // define width
	minWidth?: string // define width
	
	hide?: boolean
	headerSpan?: number
	
	align?: 'left' | 'center' | 'right'
	footer?: 'no' | 'count' | 'sum' | 'static'
	webformat?: string;
	editable?: boolean;
	editableOptions?: { value: string; label: string; color?: string }[];
	editableOptionsUrl?: string;
}
