import {
	afterRenderEffect,
	booleanAttribute,
	ChangeDetectorRef,
	Component,
	ElementRef,
	inject,
	Input,
	numberAttribute,
	OnDestroy,
	OnInit,
	output,
	signal,
	untracked,
	input
} from "@angular/core";
import {
	AbstractControl,
	ControlValueAccessor,
	FormGroupDirective,
	NgControl,
	NgForm,
	Validators
} from "@angular/forms";
import { MatFormFieldControl } from "@angular/material/form-field";
import { Subject, Subscription } from "rxjs";
import { _ErrorStateTracker, ErrorStateMatcher } from "@angular/material/core";
import { FocusMonitor } from "@angular/cdk/a11y";


@Component( {
	            providers: [ {
		            provide: MatFormFieldControl,
		            useExisting: XiriFieldMain
	            } ],
	            imports: [],
	            template: ``
            } )
export abstract class XiriFieldMain<T = unknown>
	implements ControlValueAccessor,
	           MatFormFieldControl<T>,
	           OnInit,
	           OnDestroy {

	protected _elementRef = inject<ElementRef<HTMLElement>>( ElementRef );
	protected _changeDetectorRef = inject( ChangeDetectorRef );
	protected _focusMonitor = inject( FocusMonitor );
	public _defaultErrorStateMatcher = inject( ErrorStateMatcher );
	public ngControl = inject( NgControl, { self: true, optional: true } );
	private _parentForm = inject( NgForm, { optional: true } );
	private _parentFormGroup = inject( FormGroupDirective, { optional: true } );

	readonly stateChanges: Subject<void> = new Subject<void>();
	readonly autofilled: boolean = false;
	readonly valueChange = output<T>();

	_onChange: ( value: T ) => void = () => { /* intentionally empty */ };
	_onTouched = () => { /* intentionally empty */ };

	protected touched = false;
	protected _errorStateTracker: _ErrorStateTracker;
	protected _previousControl: AbstractControl | null | undefined;
	protected subs: Subscription = new Subscription();

	disableAutomaticLabeling?: boolean;
	controlType = 'xiri-form-field';

	protected constructor() {
		this._errorStateTracker = new _ErrorStateTracker(
			this._defaultErrorStateMatcher,
			this.ngControl,
			this._parentFormGroup,
			this._parentForm,
			this.stateChanges,
		);

		afterRenderEffect( () => {
			this.doCheckLogic();
		} );
	}

	ngOnInit() {
		this.subs.add( this._focusMonitor.monitor( this._elementRef, true ).subscribe( origin => {
			this.focused = !!origin;
			if ( !this.focused ) {
				if ( !this.touched ) {
					this.ngControl?.control?.markAsTouched();
					this.touched = true;
				}
				this.startChangeValue();
			}
		} ) );

		this.stateChanges.next();
	}

	ngOnDestroy() {
		this._focusMonitor.stopMonitoring( this._elementRef );
		this.subs.unsubscribe();
		this.stateChanges.complete();
	}

	private doCheckLogic(): void {
		const ngControl = this.ngControl;

		if ( ngControl ) {
			if ( this._previousControl !== ngControl.control ) {
				// Über setDisabledState gehen, nicht direkt auf `disabled` schreiben: sonst
				// überschreibt eine frisch angelegte, enabled Control-Instanz das fieldDisabled
				// eines Backend-gesperrten Felds. Das passiert real, weil `track field.id` die
				// Kindkomponente behält, während createControl() ein neues Control anlegt.
				if ( this._previousControl !== undefined && ngControl.disabled !== null )
					this.setDisabledState( ngControl.disabled );

				this._previousControl = ngControl.control;
			}

			this.updateErrorState();

			if ( ngControl.touched != this.touched ) {
				this.touched = true;
				this.startChangeValue();
			}
		}
	}


	@Input()
	get id(): string {
		return this._id;
	}

	set id( value: string ) {
		this._id = value;
	}

	protected _id!: string;


	readonly tabIndex = input(0, { transform: (value: unknown) => (value == null ? 0 : numberAttribute(value)) });


	@Input()
	get value(): T {
		return this._value;
	}

	set value( value: T ) {
		this._value = value;
	}

	protected abstract startChangeValue(): void;

	protected runChangeValue( val: T ) {
		// Ein gesperrtes Feld schreibt nichts nach aussen. Ohne den Guard laeuft nach jedem
		// control.disable() noch ein _onChange durch -- der Renderlauf, den das Sperren ausloest,
		// erreicht doCheckLogic() und von dort startChangeValue(). Das aeussere Control bekaeme
		// also eine zweite setValue-Emission, ausgeloest allein durch einen Zustandswechsel.
		if ( this.disabled )
			return;

		this._onTouched();
		this._onChange( val );
		this.valueChange.emit( val );
		this.stateChanges.next();
		this._changeDetectorRef.markForCheck();
	}

	protected _value: T = null as T;

	get empty() {
		return this._value === null;
	}

	@Input( { transform: booleanAttribute } )
	get disabled(): boolean {
		return this._disabled();
	}

	// Der oeffentliche Input ist dieselbe Quelle wie field.disabled: eine deklarative Sperre, die
	// ein setDisabledState(false) beim Control-Setup nicht aufheben darf. Er schreibt deshalb
	// fieldDisabled und nicht den effektiven Zustand.
	set disabled( value: boolean ) {
		this.inputDisabled = value;
		this.applyDisabled();
	}

	protected _disabled = signal<boolean>( false );

	// Zusammengesetzte Feldtypen halten ihre Eingaben in einer eigenen inneren FormGroup, die per
	// formControlName gebunden ist. Sie melden sie hier an, damit control.disable() von aussen
	// dieselbe Gruppe trifft wie field.disabled. Ohne inneres Control bleibt es undefined.
	protected inner?: AbstractControl;

	// Zwei Quellen, getrennt gehalten und verodert. Angular ruft beim Control-Setup
	// setDisabledState(false) -- callSetDisabledState ist per Default 'always' -- und zwar nach
	// dem field-Input. Schlüge das direkt auf `disabled` durch, höbe es ein Backend-disabled
	// wieder auf.
	//
	// controlDisabled ist dabei nicht "die programmatische Quelle": XiriFormFieldsComponent
	// schreibt Backend-Zustand über applyPatch() und den globalen disabled-Effect ebenfalls auf
	// das äussere Control. Auf der Control-Seite gilt last writer wins, wie bisher auch.
	// Getrennt, obwohl beide deklarativ sind: sind [field] und [disabled] gleichzeitig gebunden,
	// ruft Angular den unveraenderten zweiten Input nicht erneut auf. Mit einem gemeinsamen Flag
	// hoebe der zuletzt laufende Setter den anderen auf.
	protected fieldDisabled = false;
	private inputDisabled = false;
	private controlDisabled = false;

	protected applyDisabled(): void {
		const value = this.fieldDisabled || this.inputDisabled || this.controlDisabled;

		// untracked, weil Angular setDisabledState() aus setUpControlValueAccessor heraus ruft --
		// also waehrend der Template-Auswertung, wo ein Signal-Write sonst NG0600 wirft. Angulars
		// eigenes FormControl.setValue macht es an derselben Stelle genauso.
		untracked( () => this._disabled.set( value ) );

		if ( value )
			this.inner?.disable( { emitEvent: false } );
		else
			this.inner?.enable( { emitEvent: false } );

		this._changeDetectorRef.markForCheck();
		this.stateChanges.next();
	}

	setDisabledState( isDisabled: boolean ): void {
		this.controlDisabled = isDisabled;
		this.applyDisabled();
	}


	@Input( { transform: booleanAttribute } )
	get required(): boolean {
		return this._required ?? this.ngControl?.control?.hasValidator( Validators.required ) ?? false;
	}

	set required( value: boolean ) {
		this._required = value;
		this.stateChanges.next();
	}

	protected _required: boolean | undefined;


	@Input()
	get placeholder(): string {
		return this._placeholder;
	}

	set placeholder( value: string ) {
		this._placeholder = value;
		this.stateChanges.next();
	}

	protected _placeholder!: string;

	public focused = false;

	writeValue( value: T ): void {
		this._value = value;
	}

	registerOnChange( fn: ( value: T ) => void ): void {
		this._onChange = fn;
	}

	registerOnTouched( fn: () => void ): void {
		this._onTouched = fn;
	}


	setDescribedByIds( ids: string[] ) {
		if ( ids.length ) {
			this._elementRef.nativeElement.setAttribute( 'aria-describedby', ids.join( ' ' ) );
		} else {
			this._elementRef.nativeElement.removeAttribute( 'aria-describedby' );
		}
	}

	get shouldLabelFloat(): boolean {
		return !this.empty || this.focused;
	}

	onContainerClick() {
		if ( !this.focused ) {
			this.focus();
		}
	}

	focus( options?: FocusOptions ): void {
		this._elementRef.nativeElement.focus( options );
	}

	@Input()
	get errorStateMatcher() {
		return this._errorStateTracker.matcher;
	}

	set errorStateMatcher( value: ErrorStateMatcher ) {
		this._errorStateTracker.matcher = value;
	}

	get errorState() {
		return this._errorStateTracker.errorState;
	}

	set errorState( value: boolean ) {
		this._errorStateTracker.errorState = value;
	}

	updateErrorState() {
		this._errorStateTracker.updateErrorState();
	}

	protected _markAsTouched() {
		this._onTouched();
		this._changeDetectorRef.markForCheck();
		this.stateChanges.next();
	}

	readonly ariaDescribedby = input<string>(undefined, { alias: "aria-describedby" });

	get userAriaDescribedBy(): string {
		return this.ariaDescribedby() ?? '';
	}

}
