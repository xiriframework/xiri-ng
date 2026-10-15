import {
	afterNextRender,
	ChangeDetectionStrategy,
	Component,
	computed,
	DestroyRef,
	ElementRef,
	forwardRef,
	inject,
	Injector,
	input,
	AfterViewInit,
	signal,
	untracked
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
	AbstractControl,
	ControlValueAccessor,
	FormArray,
	FormControl,
	FormGroup,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	NgControl,
	ReactiveFormsModule,
	TouchedChangeEvent,
	ValidationErrors,
	Validator,
	ValidatorFn
} from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatOption } from '@angular/material/core';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { XiriFormField } from '../field.interface';
import { buildValidations } from '../helper/validations';
import { XiriSuggestDirective } from '../suggest/suggest.directive';
import { XiriLocaleService } from '../../services/locale.service';
import { cellDefault, isEmptyRow } from './rows.util';

export type XiriRow = FormGroup<Record<string, FormControl<unknown>>>;

@Component( {
	            selector: 'xiri-rows',
	            templateUrl: './rows.component.html',
	            styleUrl: './rows.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            providers: [
		            { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef( () => XiriRowsComponent ), multi: true },
		            { provide: NG_VALIDATORS, useExisting: forwardRef( () => XiriRowsComponent ), multi: true },
	            ],
	            imports: [
		            ReactiveFormsModule,
		            MatFormField,
		            MatError,
		            MatInput,
		            MatSelect,
		            MatOption,
		            MatCheckbox,
		            MatIcon,
		            MatIconButton,
		            MatButton,
		            MatAutocomplete,
		            MatAutocompleteTrigger,
		            XiriSuggestDirective,
	            ]
            } )
export class XiriRowsComponent implements ControlValueAccessor, Validator, AfterViewInit {

	field = input.required<XiriFormField>();
	// Server-Fehler zu diesem Feld, Schlüssel "<zeile>.<unterfeld>" (Präfix "<feld>." entfernt form-fields).
	serverErrors = input<Record<string, string> | null>( null );

	private localeService = inject( XiriLocaleService );
	private host = inject<ElementRef<HTMLElement>>( ElementRef );
	private injector = inject( Injector );
	private destroyRef = inject( DestroyRef );

	readonly array = new FormArray<XiriRow>( [] );
	// Strukturänderungen am FormArray (add/remove/move/writeValue) als Signal, damit OnPush und computed sie sehen.
	private version = signal( 0 );
	readonly rows = computed( () => {
		this.version();
		return [ ...this.array.controls ];
	} );

	// Zwei Sperrquellen, wie bei xiri-chips: Backend-disabled am Feld und control.disable() von außen.
	private controlDisabled = signal( false );
	readonly disabled = computed( () => !!this.field().disabled || this.controlDisabled() );

	readonly subs = computed( () => this.field().fields ?? [] );
	readonly visible = computed( () => this.subs().filter( s => !s.hide ) );
	readonly addable = computed( () => this.field().addable !== false && !this.disabled() );
	readonly removable = computed( () => this.field().removable !== false && !this.disabled() );
	readonly canAdd = computed( () => {
		const max = this.field().max;
		return max === undefined || this.rows().length < max;
	} );
	readonly addLabel = 'Hinzufügen';

	private onChange: ( value: Record<string, unknown>[] ) => void = () => { /* intentionally empty */ };
	private onTouched: () => void = () => { /* intentionally empty */ };

	constructor() {
		this.array.valueChanges.pipe( takeUntilDestroyed() ).subscribe( () => this.sync() );
	}

	ngAfterViewInit(): void {
		// Absenden markiert in form-fields alles als berührt - das interne FormArray gehört nicht dazu. Erst hier
		// holen: NgControl im Konstruktor wäre ein Zyklus (es hängt an NG_VALUE_ACCESSOR = dieser Komponente), und in
		// ngOnInit ist `control` noch leer (FormControlName setzt es erst in seinem eigenen ngOnChanges).
		const control = this.injector.get( NgControl, null, { self: true, optional: true } )?.control;
		control?.events.pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe( e => {
			if ( e instanceof TouchedChangeEvent && e.touched ) {
				this.array.markAllAsTouched();
				this.bump();
			}
		} );
	}

	writeValue( value: unknown ): void {
		// untracked: Angular ruft writeValue aus setUpControl, also während der Template-Auswertung (NG0600).
		untracked( () => {
			this.array.clear( { emitEvent: false } );
			for ( const row of Array.isArray( value ) ? value : [] )
				this.array.push( this.createRow( row !== null && typeof row === 'object' ? row as Record<string, unknown> : {} ),
				                 { emitEvent: false } );
			if ( this.disabled() )
				this.array.disable( { emitEvent: false } );
			this.revalidate();
			this.bump();
		} );
	}

	registerOnChange( fn: ( value: Record<string, unknown>[] ) => void ): void {
		this.onChange = fn;
	}

	registerOnTouched( fn: () => void ): void {
		this.onTouched = fn;
	}

	setDisabledState( isDisabled: boolean ): void {
		untracked( () => {
			this.controlDisabled.set( isDisabled );
			if ( isDisabled ) {
				this.array.disable( { emitEvent: false } );
			} else {
				this.array.enable( { emitEvent: false } );
				this.disableLockedCells();
			}
			this.bump();
		} );
	}

	// Feldebene (required/min/max) prüft form-fields über buildValidations am Wert; hier nur die Zellen.
	validate(): ValidationErrors | null {
		return this.filled().some( i => this.array.at( i ).invalid ) ? { rows: true } : null;
	}

	add(): void {
		if ( this.addable() )
			this.insertRow( this.array.length, {} );
	}

	remove( i: number ): void {
		this.array.removeAt( i );
		this.touched();
	}

	insertRow( at: number, values: Record<string, unknown> ): void {
		if ( !this.canAdd() )
			return;
		this.array.insert( at, this.createRow( values ) );
		this.touched();
		this.focusRow( at );
	}

	protected touched(): void {
		this.bump();
		this.onTouched();
	}

	protected bump(): void {
		this.version.update( v => v + 1 );
	}

	private createRow( values: Record<string, unknown> ): XiriRow {
		const controls: Record<string, FormControl<unknown>> = {};
		for ( const sub of this.subs() ) {
			const value = sub.id in values ? values[ sub.id ] : cellDefault( sub );
			// Boxed-Form wie in form-fields: der Zustand kommt mit, ein Objektwert würde sonst als Box gelesen.
			controls[ sub.id ] = new FormControl<unknown>( { value, disabled: !!sub.disabled || this.disabled() },
			                                               this.cellValidator( sub, buildValidations( sub, this.localeService ) ) );
		}
		return new FormGroup( controls );
	}

	private disableLockedCells(): void {
		for ( const row of this.array.controls )
			for ( const sub of this.subs() )
				if ( sub.disabled )
					row.controls[ sub.id ].disable( { emitEvent: false } );
	}

	// Leere Zeilen sind keine Eingabe: ihre Zellen bekommen keine Fehler, solange die Zeile leer bleibt.
	protected cellValidator( sub: XiriFormField, base: ValidatorFn | null ): ValidatorFn {
		return ( c: AbstractControl ) => {
			const row = c.parent as XiriRow | null;
			if ( !row || isEmptyRow( this.subs(), row.getRawValue() ) )
				return null;
			return base?.( c ) ?? null;
		};
	}

	// Nach jeder Änderung alle Zellen neu prüfen - ob eine Zeile leer ist (und später: ob sie doppelt ist), hängt
	// von anderen Zellen ab -, dann den Wert ohne leere Zeilen melden.
	private sync(): void {
		this.revalidate();
		this.onChange( this.filled().map( i => this.array.at( i ).getRawValue() ) );
	}

	protected revalidate(): void {
		for ( const row of this.array.controls ) {
			for ( const cell of Object.values( row.controls ) )
				cell.updateValueAndValidity( { onlySelf: true, emitEvent: false } );
			row.updateValueAndValidity( { onlySelf: true, emitEvent: false } );
		}
		this.array.updateValueAndValidity( { onlySelf: true, emitEvent: false } );
	}

	// Indizes der nicht-leeren Zeilen = Positionen im gesendeten Wert.
	protected filled(): number[] {
		const subs = this.subs();
		return this.array.controls.flatMap( ( row, i ) => isEmptyRow( subs, row.getRawValue() ) ? [] : [ i ] );
	}

	protected focusRow( i: number ): void {
		afterNextRender( () => {
			const row = this.host.nativeElement.querySelectorAll<HTMLElement>( '.row-item' )[ i ];
			row?.querySelector<HTMLElement>( 'input:not([disabled]), mat-select:not(.mat-mdc-select-disabled)' )?.focus();
		}, { injector: this.injector } );
	}
}
