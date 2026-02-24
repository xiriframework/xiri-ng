import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	DoCheck,
	ElementRef,
	inject,
	Input,
	OnDestroy
} from '@angular/core';
import {
	ControlValueAccessor,
	FormControl,
	FormGroup,
	FormsModule,
	NgControl,
	ReactiveFormsModule
} from '@angular/forms';
import { MatError, MatFormField, MatFormFieldControl, MatHint, MatLabel } from '@angular/material/form-field';
import { FocusMonitor } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { XiriFormField } from "../field.interface";
import { MatInput } from '@angular/material/input';

interface VolumeForm {
	voll: FormControl<number>
	volw: FormControl<number>
	volh: FormControl<number>
}

@Component( {
	            selector: 'xiri-volume',
	            templateUrl: './volume.component.html',
	            styleUrls: [ './volume.component.scss' ],
	            host: {
		            '[id]': 'id',
		            '[attr.aria-describedby]': 'describedBy'
	            },
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            providers: [ {
		            provide: MatFormFieldControl,
		            useExisting: XiriVolumeComponent
	            } ],
	            imports: [
		            MatFormField,
		            FormsModule,
		            ReactiveFormsModule,
		            MatLabel,
		            MatInput,
		            MatHint,
		            MatError,
	            ]
            } )
export class XiriVolumeComponent implements ControlValueAccessor, MatFormFieldControl<any>, DoCheck, OnDestroy {
	private focusMonitor = inject( FocusMonitor );
	ngControl = inject( NgControl, { optional: true, self: true } );
	private _elementRef = inject<ElementRef<HTMLElement>>( ElementRef );
	private cdr = inject( ChangeDetectorRef );
	
	
	static nextId = 0;
	id = `xiri-volume-${ XiriVolumeComponent.nextId++ }`;
	describedBy = '';
	
	public min = null;
	public max = null;
	
	readonly autofilled: boolean;
	
	parts: FormGroup<VolumeForm>;
	stateChanges = new Subject<void>();
	focused = false;
	controlType = 'xiri-volume';
	
	readonly placeholder: string;
	public required = false;
	public disabled = false;
	shouldLabelFloat = true;
	private _lastValue: [ number, number, number ] | null = null;
	private _field: XiriFormField;
	
	constructor() {
		
		if ( this.ngControl != null )
			this.ngControl.valueAccessor = this;
		
		this.parts = new FormGroup<VolumeForm>( {
			                                        voll: new FormControl<number>( 0, { nonNullable: true } ),
			                                        volw: new FormControl<number>( 0, { nonNullable: true } ),
			                                        volh: new FormControl<number>( 0, { nonNullable: true } ),
		                                        } );
		
		this.focusMonitor.monitor( this._elementRef, true ).subscribe( origin => {
			this.ngControl.control.markAsTouched();
			this.focused = !!origin;
			this.runCheck();
			this.cdr.markForCheck();
		} );
	}
	
	onChange = ( _: any ) => {
	};
	onTouched = () => {
	};
	
	ngDoCheck(): void {
		this.runCheck();
	}
	
	ngOnDestroy() {
		if ( this.changeTO )
			clearTimeout( this.changeTO );
		
		this.stateChanges.complete();
		this.focusMonitor.stopMonitoring( this._elementRef );
	}
	
	@Input()
	set field( value: XiriFormField ) {
		this._field = value;
		
		if ( value.min )
			this.min = value.min;
		if ( value.max )
			this.max = value.max;
		
		this.required = coerceBooleanProperty( value.required );
		this.disabled = coerceBooleanProperty( value.disabled );
		this.disabled ? this.parts.disable() : this.parts.enable();
		
		this.stateChanges.next();
	}
	
	get field(): XiriFormField {
		return this._field;
	}
	
	@Input()
	get value(): [ number, number, number ] {
		
		const { value: { voll, volw, volh } } = this.parts;
		
		if ( this.errorState )
			return undefined;
		if ( voll === null || volw === null || volh === null )
			return null;
		
		return [ voll, volw, volh ];
	}
	
	set value( input: [ number, number, number ] ) {
		
		if ( input === null || input === undefined )
			return;
		
		this.parts.setValue( {
			                     voll: input[ 0 ],
			                     volw: input[ 1 ],
			                     volh: input[ 2 ],
		                     } );
		
		this.changeValue( this.value );
	}
	
	private runCheck(): void {
		
		if ( !this.ngControl )
			return;
		
		const val = this.value;
		if ( val === undefined || val === null || this._lastValue === null || this._lastValue === undefined ) {
			if ( this._lastValue === val )
				this.stateChanges.next();
			else
				this.changeValue( val );
		} else if ( val[ 0 ] ==
		            this._lastValue[ 0 ] &&
		            val[ 1 ] ==
		            this._lastValue[ 1 ] &&
		            val[ 2 ] ==
		            this._lastValue[ 2 ] )
			this.stateChanges.next();
		else
			this.changeValue( val );
	}
	
	private changeTO = null;
	
	private changeValue( val ) {
		
		this._lastValue = val;
		if ( this.changeTO )
			clearTimeout( this.changeTO );
		
		this.changeTO = setTimeout( () => {
			this.onChange( val );
			this.stateChanges.next();
			this.cdr.markForCheck();
		}, 0 );
	}
	
	get errorState(): boolean {
		return this.parts.invalid && this.ngControl.touched;
	}
	
	public getErrorMessage(): string {
		
		let err1 = this.parts.get( 'voll' ).errors;
		let err2 = this.parts.get( 'volw' ).errors;
		let err3 = this.parts.get( 'volh' ).errors;
		
		return 'error';
	}
	
	get empty() {
		return this.value === null;
	}
	
	writeValue( value: [ number, number, number ] ): void {
		this.value = value;
	}
	
	registerOnChange( fn: any ): void {
		this.onChange = fn;
	}
	
	registerOnTouched( fn: any ): void {
		this.onTouched = fn;
	}
	
	setDisabledState( isDisabled: boolean ): void {
		this.disabled = isDisabled;
	}
	
	setDescribedByIds( ids: string[] ) {
		this.describedBy = ids.join( ' ' );
	}
	
	onContainerClick( event: MouseEvent ): void {
	}
}
