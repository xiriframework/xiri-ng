import {
	afterRenderEffect,
	booleanAttribute,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	inject,
	Input,
	numberAttribute,
	OnDestroy,
	OnInit,
	output,
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

	private doCheckLogic(): void {
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


	@Input()
	get id(): string {
		return this._id;
	}

	set id( value: string ) {
		this._id = value;
	}

	protected _id: string;


	@Input( {
		        transform: ( value: unknown ) => ( value == null ? 0 : numberAttribute( value ) ),
	        } )
	tabIndex: number = 0;


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

	protected _value: any = null;

	get empty() {
		return this._value === null;
	}

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

	setDisabledState( isDisabled: boolean ): void {
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

	protected _placeholder: string;

	public focused: boolean = false;

	writeValue( value: any ): void {
		this._value = value;
	}

	registerOnChange( fn: ( value: any ) => void ): void {
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

	@Input( 'aria-describedby' ) userAriaDescribedBy: string;

}
