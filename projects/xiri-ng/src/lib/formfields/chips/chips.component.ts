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
import { XiriSuggestDirective } from '../suggest/suggest.directive';

const ENTER_COMMA = [ ENTER, COMMA ];
const COMMA_ONLY = [ COMMA ];

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
		            MatIcon,
		            XiriSuggestDirective
	            ]
            } )
export class XiriChipsComponent implements ControlValueAccessor {

	field = input.required<XiriFormField>();

	chips = signal<( string | number )[]>( [] );

	chipInput = viewChild<ElementRef<HTMLInputElement>>( 'chipInput' );
	private trigger = viewChild( MatAutocompleteTrigger );

	// Zwei Sperrquellen, verodert. field ist hier ein input(), kein Setter -- die Ableitung
	// gehoert deshalb in ein computed. Angular ruft beim Control-Setup setDisabledState(false),
	// was ein Backend-disabled sonst wieder aufhoebe.
	private controlDisabled = signal( false );
	readonly disabled = computed( () => !!this.field().disabled || this.controlDisabled() );

	private onChange: ( value: ( string | number )[] ) => void = () => { /* intentionally empty */ };
	private onTouched: () => void = () => { /* intentionally empty */ };

	writeValue( value: ( string | number )[] ): void {
		// untracked wie bei setDisabledState: Angular ruft writeValue aus
		// setUpControlValueAccessor, also waehrend der Template-Auswertung. Ohne das wirft ein
		// Neuaufbau des Formulars mit gleicher Feld-ID NG0600.
		untracked( () => this.chips.set( value || [] ) );
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

	// Enter auf einer markierten Option wählt sie über selected(). Als Trenner würde Enter zusätzlich den
	// getippten Teiltext anlegen. panelOpen mitprüfen: Material setzt activeOption beim Schließen nicht zurück.
	separatorKeyCodes(): number[] {
		const trigger = this.trigger();
		return trigger?.panelOpen && trigger.activeOption ? COMMA_ONLY : ENTER_COMMA;
	}

	add( event: MatChipInputEvent ): void {
		if ( this.disabled() ) return;

		const value = ( event.value || '' ).trim();
		if ( !value ) return;

		// Abgelehnter Freitext bleibt im Input stehen, damit nichts unbemerkt verloren geht.
		if ( this.take( value ) )
			this.clearInput();
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
		// Listen-Option über die Referenz (die Suggest-Directive behält die Objekte), Server-Vorschlag über den Namen.
		if ( this.field().list?.includes( option ) )
			this.push( option.id );
		else
			this.take( option.name );
		// Immer leeren: Material hat das Options-Objekt schon ins Input geschrieben.
		this.clearInput();
	}

	onInput(): void {
		this.onTouched();
	}

	/** Panel-Optionen ohne die, deren Chip schon gewählt ist. */
	unchosen( options: XiriFormFieldSelectOption[] ): XiriFormFieldSelectOption[] {
		const chips = this.chips();
		return options.filter( o => !chips.includes( this.chipFor( o ) ) );
	}

	/** Der Chip, den eine Panel-Option ergäbe: Listen-Option per Referenz, Server-Vorschlag über den Namen. */
	private chipFor( option: XiriFormFieldSelectOption ): string | number {
		return this.field().list?.includes( option ) ? option.id : this.optionNamed( option.name )?.id ?? option.name;
	}

	private optionNamed( name: string ): XiriFormFieldSelectOption | undefined {
		return this.field().list?.find( o => o.name === name );
	}

	/** Text gleich einem Options-Namen wird zur ID, sonst Freitext, falls erlaubt. */
	private take( text: string ): boolean {
		const option = this.optionNamed( text );
		if ( !option && this.field().freeText === false )
			return false;
		this.push( option ? option.id : text );
		return true;
	}

	private push( chip: string | number ): void {
		const current = this.chips();
		if ( current.includes( chip ) )
			return;
		const next = [ ...current, chip ];
		this.chips.set( next );
		this.onChange( next );
	}

	/** Leeren über ein input-Event, damit die Suggest-Directive Suchtext und alte Servertreffer verwirft. */
	private clearInput(): void {
		const input = this.chipInput()?.nativeElement;
		if ( !input )
			return;
		input.value = '';
		input.dispatchEvent( new Event( 'input' ) );
	}

	chipColor( chip: string | number ): string {
		const option = this.field().list?.find( o => o.id === chip );
		return option?.color ? 'chip-' + option.color : '';
	}

	displayLabel( chip: string | number ): string {
		return this.field().list?.find( o => o.id === chip )?.name ?? String( chip );
	}
}
