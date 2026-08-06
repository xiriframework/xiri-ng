import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
	Component,
	computed,
	ElementRef,
	forwardRef,
	input,
	signal,
	untracked,
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

	chips = signal<( string | number )[]>( [] );
	filteredOptions = signal<XiriFormFieldSelectOption[]>( [] );

	readonly separatorKeyCodes = [ ENTER, COMMA ] as const;

	chipInput = viewChild<ElementRef<HTMLInputElement>>( 'chipInput' );

	// Zwei Sperrquellen, verodert. field ist hier ein input(), kein Setter -- die Ableitung
	// gehoert deshalb in ein computed. Angular ruft beim Control-Setup setDisabledState(false),
	// was ein Backend-disabled sonst wieder aufhoebe.
	private controlDisabled = signal( false );
	readonly disabled = computed( () => !!this.field().disabled || this.controlDisabled() );

	private onChange: ( value: ( string | number )[] ) => void = () => { /* intentionally empty */ };
	private onTouched: () => void = () => { /* intentionally empty */ };

	writeValue( value: ( string | number )[] ): void {
		this.chips.set( value || [] );
	}

	registerOnChange( fn: ( value: ( string | number )[] ) => void ): void {
		this.onChange = fn;
	}

	registerOnTouched( fn: () => void ): void {
		this.onTouched = fn;
	}

	setDisabledState( isDisabled: boolean ): void {
		// untracked: Angular ruft das aus setUpControlValueAccessor, also waehrend der
		// Template-Auswertung -- ein Signal-Write wuerde dort NG0600 werfen.
		untracked( () => this.controlDisabled.set( isDisabled ) );
	}

	add( event: MatChipInputEvent ): void {
		if ( this.disabled() ) return;

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

	remove( chip: string | number ): void {
		// Auch bei deaktiviertem Grid: hatte ein Chip beim Sperren den Fokus, leitet Material
		// Delete/Backspace weiter und prueft dabei nur `removable`.
		if ( this.disabled() ) return;

		const current = this.chips().filter( c => c !== chip );
		this.chips.set( current );
		this.onChange( current );
	}

	selected( event: MatAutocompleteSelectedEvent ): void {
		// Ein bereits offenes Autocomplete-Overlay kann nach dem Sperren noch liefern.
		if ( this.disabled() ) return;

		const option = event.option.value as XiriFormFieldSelectOption;
		const current = [ ...this.chips() ];
		if ( !current.includes( option.id ) ) {
			current.push( option.id );
			this.chips.set( current );
			this.onChange( current );
		}
		const chipInput = this.chipInput();
		if ( chipInput ) {
			chipInput.nativeElement.value = '';
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

	chipColor( chip: string | number ): string {
		const option = this.field().list?.find( o => o.id === chip );
		return option?.color ? 'chip-' + option.color : '';
	}

	displayLabel( chip: string | number ): string {
		if ( typeof chip === 'number' ) {
			const option = this.field().list?.find( o => o.id === chip );
			return option?.name ?? String( chip );
		}
		return chip;
	}
}
