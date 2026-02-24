import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	forwardRef,
	input,
	signal,
	viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipGrid, MatChipInput, MatChipInputEvent, MatChipRemove, MatChipRow } from '@angular/material/chips';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { XiriFormField, XiriFormFieldSelectOption } from '../field.interface';
import { MatOption } from '@angular/material/core';

@Component( {
	            selector: 'xiri-chips',
	            templateUrl: './chips.component.html',
	            styleUrl: './chips.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            providers: [ {
		            provide: NG_VALUE_ACCESSOR,
		            useExisting: forwardRef( () => XiriChipsComponent ),
		            multi: true
	            } ],
	            imports: [
		            MatFormField,
		            MatLabel,
		            MatChipGrid,
		            MatChipRow,
		            MatChipRemove,
		            MatChipInput,
		            MatAutocompleteTrigger,
		            MatAutocomplete,
		            MatOption,
		            MatIcon
	            ]
            } )
export class XiriChipsComponent implements ControlValueAccessor {

	field = input.required<XiriFormField>();

	chips = signal<string[]>( [] );
	filteredOptions = signal<XiriFormFieldSelectOption[]>( [] );

	readonly separatorKeyCodes = [ ENTER, COMMA ] as const;

	chipInput = viewChild<ElementRef<HTMLInputElement>>( 'chipInput' );

	private onChange: ( value: string[] ) => void = () => {};
	private onTouched: () => void = () => {};

	writeValue( value: string[] ): void {
		this.chips.set( value || [] );
	}

	registerOnChange( fn: ( value: string[] ) => void ): void {
		this.onChange = fn;
	}

	registerOnTouched( fn: () => void ): void {
		this.onTouched = fn;
	}

	add( event: MatChipInputEvent ): void {
		const value = ( event.value || '' ).trim();
		if ( !value ) return;

		const current = [ ...this.chips() ];
		if ( !current.includes( value ) ) {
			current.push( value );
			this.chips.set( current );
			this.onChange( current );
		}
		event.chipInput.clear();
	}

	remove( chip: string ): void {
		const current = this.chips().filter( c => c !== chip );
		this.chips.set( current );
		this.onChange( current );
	}

	selected( event: MatAutocompleteSelectedEvent ): void {
		const value = event.option.viewValue;
		const current = [ ...this.chips() ];
		if ( !current.includes( value ) ) {
			current.push( value );
			this.chips.set( current );
			this.onChange( current );
		}
		if ( this.chipInput() ) {
			this.chipInput().nativeElement.value = '';
		}
	}

	filterOptions( value: string ): void {
		const list = this.field().list || [];
		if ( !value ) {
			this.filteredOptions.set( list );
			return;
		}
		const filterValue = value.toLowerCase();
		this.filteredOptions.set(
			list.filter( option => option.name.toLowerCase().includes( filterValue ) )
		);
	}

	onInputChange( event: Event ): void {
		const input = event.target as HTMLInputElement;
		this.filterOptions( input.value );
		this.onTouched();
	}

	onFocus(): void {
		this.filterOptions( '' );
	}

	chipColor( chip: string ): string {
		const option = this.field().list?.find( o => o.name === chip );
		return option?.color ? 'chip-' + option.color : '';
	}
}
