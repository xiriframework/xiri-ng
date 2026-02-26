import {
	booleanAttribute,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	DoCheck,
	ElementRef,
	Input,
	numberAttribute,
	OnDestroy,
	OnInit,
	Optional,
	output,
	Self,
	signal
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
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            providers: [ {
		            provide: MatFormFieldControl,
		            useExisting: XiriFieldMain
	            } ],
	            imports: [],
	            template: ``
            } )
export abstract class XiriFieldMain
	implements ControlValueAccessor,
	           MatFormFieldControl<any>,
	           OnInit,
	           DoCheck,
	           OnDestroy {
	
	/**
	 * Implemented as part of MatFormFieldControl.
	 */
	readonly stateChanges: Subject<void> = new Subject<void>();
	readonly autofilled: boolean = false;

	readonly valueChange = output<any>();
	
	_onChange: ( value: any ) => void = () => {
	};
	_onTouched = () => {
	};
	
	protected touched: boolean = false;
	protected _errorStateTracker: _ErrorStateTracker;
	protected _previousControl: AbstractControl | null | undefined;
	protected subs: Subscription = new Subscription();
	
	disableAutomaticLabeling?: boolean;
	controlType = 'xiri-form-field';
	
	protected constructor(
		protected _elementRef: ElementRef<HTMLElement>,
		@Optional() _parentForm: NgForm,
		@Optional() _parentFormGroup: FormGroupDirective,
		protected _changeDetectorRef: ChangeDetectorRef,
		public _defaultErrorStateMatcher: ErrorStateMatcher,
		@Optional() @Self() public ngControl: NgControl,
		protected _focusMonitor: FocusMonitor
	) {
		
		this._errorStateTracker = new _ErrorStateTracker(
			_defaultErrorStateMatcher,
			ngControl,
			_parentFormGroup,
			_parentForm,
			this.stateChanges,
		);
	}
	
	ngOnInit() {
		
		this.subs.add( this._focusMonitor.monitor( this._elementRef, true ).subscribe( origin => {
			
			this.focused = !!origin;
			if ( !this.focused ) {
				if ( !this.touched ) {
					this.ngControl.control.markAsTouched();
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
	
	
	/**
	 * Implemented as part of MatFormFieldControl.
	 * @docs-private
	 */
	@Input()
	get id(): string {
		return this._id;
	}
	
	set id( value: string ) {
		this._id = value;
	}
	
	protected _id: string;
	
	
	/** Tabindex of the chip set. */
	@Input( {
		        transform: ( value: unknown ) => ( value == null ? 0 : numberAttribute( value ) ),
	        } )
	tabIndex: number = 0;
	
	
	/**
	 * Implemented as part of MatFormFieldControl.
	 */
	@Input()
	get value(): any {
		return this._value;
	}
	
	set value( value: any ) {
		this._value = value;
	}
	
	protected abstract startChangeValue(): void;
	
	protected runChangeValue( val: any ) {
		
		this._onTouched();
		this._onChange( val );
		this.valueChange.emit( val );
		this.stateChanges.next();
		this._changeDetectorRef.markForCheck();
	}
	
	ngDoCheck(): void {
		const ngControl = this.ngControl;
		
		if ( ngControl ) {
			if ( this._previousControl !== ngControl.control ) {
				if (
					this._previousControl !== undefined &&
					ngControl.disabled !== null &&
					ngControl.disabled !== this.disabled
				) {
					this.disabled = ngControl.disabled;
				}
				
				this._previousControl = ngControl.control;
			}
			
			this.updateErrorState();
			
			if ( ngControl.touched != this.touched ) {
				this.touched = true;
				this.startChangeValue();
			}
		}
	}
	
	protected _value: any = null;
	
	/**
	 * Implemented as part of MatFormFieldControl.
	 */
	get empty() {
		return this._value === null;
	}
	
	/**
	 * Implemented as part of MatFormFieldControl.
	 */
	@Input( { transform: booleanAttribute } )
	get disabled(): boolean {
		return this._disabled();
	}
	
	set disabled( value: boolean ) {
		this._disabled.set( value );
		this._changeDetectorRef.markForCheck();
		this.stateChanges.next();
	}
	
	protected _disabled = signal<boolean>( false );
	
	/**
	 * Implemented as part of ControlValueAccessor.
	 */
	setDisabledState( isDisabled: boolean ): void {
		
		// this is the [disabled] field
		// we only use form.disabled
	}
	
	
	/**
	 * Implemented as part of MatFormFieldControl.
	 */
	@Input( { transform: booleanAttribute } )
	get required(): boolean {
		return this._required ?? this.ngControl?.control?.hasValidator( Validators.required ) ?? false;
	}
	
	set required( value: boolean ) {
		this._required = value;
		this.stateChanges.next();
	}
	
	protected _required: boolean | undefined;
	
	
	/**
	 * Implemented as part of MatFormFieldControl.
	 */
	@Input()
	get placeholder(): string {
		return this._placeholder;
	}
	
	set placeholder( value: string ) {
		this._placeholder = value;
		this.stateChanges.next();
	}
	
	protected _placeholder: string;
	
	
	/**
	 * Implemented as part of MatFormFieldControl.
	 */
	public focused: boolean = false;
	
	/*
	 get focused(): boolean {
	 // return this.elementRef.nativeElement.focus();
	 return false;
	 }
	 */
	
	/**
	 * Implemented as part of ControlValueAccessor.
	 */
	writeValue( value: any ): void {
		this._value = value;
	}
	
	/**
	 * Implemented as part of ControlValueAccessor.
	 */
	registerOnChange( fn: ( value: any ) => void ): void {
		this._onChange = fn;
	}
	
	/**
	 * Implemented as part of ControlValueAccessor.
	 */
	registerOnTouched( fn: () => void ): void {
		this._onTouched = fn;
	}
	
	
	/**
	 * Implemented as part of MatFormFieldControl.
	 */
	setDescribedByIds( ids: string[] ) {
		if ( ids.length ) {
			this._elementRef.nativeElement.setAttribute( 'aria-describedby', ids.join( ' ' ) );
		} else {
			this._elementRef.nativeElement.removeAttribute( 'aria-describedby' );
		}
	}
	
	/**
	 * Implemented as part of MatFormFieldControl.
	 */
	get shouldLabelFloat(): boolean {
		// console.log( 'shouldLabelFloat', !this.empty || this.focused );
		return !this.empty || this.focused;
	}
	
	/**
	 * Implemented as part of MatFormFieldControl.
	 */
	onContainerClick() {
		// Do not re-focus the input element if the element is already focused. Otherwise, it can happen
		// that someone clicks on a time input and the cursor resets to the "hours" field while the
		// "minutes" field was actually clicked. See: https://github.com/angular/components/issues/12849
		if ( !this.focused ) {
			this.focus();
		}
	}
	
	
	/** Focuses the input. */
	focus( options?: FocusOptions ): void {
		this._elementRef.nativeElement.focus( options );
	}
	
	/** An object used to control when error messages are shown. */
	@Input()
	get errorStateMatcher() {
		return this._errorStateTracker.matcher;
	}
	
	set errorStateMatcher( value: ErrorStateMatcher ) {
		this._errorStateTracker.matcher = value;
	}
	
	/** Whether the input is in an error state. */
	get errorState() {
		return this._errorStateTracker.errorState;
	}
	
	set errorState( value: boolean ) {
		this._errorStateTracker.errorState = value;
	}
	
	/** Refreshes the error state */
	updateErrorState() {
		this._errorStateTracker.updateErrorState();
	}
	
	/** Mark the field as touched */
	protected _markAsTouched() {
		this._onTouched();
		this._changeDetectorRef.markForCheck();
		this.stateChanges.next();
	}
	
	@Input( 'aria-describedby' ) userAriaDescribedBy: string;
	
}