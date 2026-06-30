import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, Input, OnDestroy } from '@angular/core';
import {
	MatError,
	MatFormField,
	MatFormFieldControl,
	MatHint,
	MatLabel,
	MatSuffix
} from "@angular/material/form-field";
import {
	ControlValueAccessor,
	FormControl,
	FormGroup,
	FormsModule,
	NgControl,
	ReactiveFormsModule
} from "@angular/forms";
import { Subject } from "rxjs";
import { FocusMonitor } from "@angular/cdk/a11y";
import { XiriFormField } from "../field.interface";
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';

interface FileForm {
	files: FormControl<File[] | null>
	text: FormControl<string | null>
}

interface FileData {
	file: File
	name: string;
	data: string;
}

interface FileValue {
	name: string;
	data: string;
}

@Component( {
	            selector: 'xiri-file',
	            templateUrl: './file.component.html',
	            styleUrls: [ './file.component.scss' ],
	            host: {
		            '[id]': 'id',
		            '[attr.aria-describedby]': 'describedBy'
	            },
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            providers: [ {
		            provide: MatFormFieldControl,
		            useExisting: XiriFileComponent
	            } ],
	            imports: [
		            MatFormField,
		            FormsModule,
		            ReactiveFormsModule,
		            MatLabel,
		            MatInput,
		            MatIconButton,
		            MatSuffix,
		            MatIcon,
		            MatHint,
		            MatError,
	            ]
            } )
export class XiriFileComponent implements ControlValueAccessor, MatFormFieldControl<FileValue[] | null | undefined>, OnDestroy {
	private focusMonitor = inject( FocusMonitor );
	ngControl = inject( NgControl, { optional: true, self: true } );
	private _elementRef = inject<ElementRef<HTMLElement>>( ElementRef );
	private cdr = inject( ChangeDetectorRef );
	
	
	static nextId = 0;
	id = `xiri-file-${ XiriFileComponent.nextId++ }`;
	describedBy = '';
	
	parts: FormGroup<FileForm>;
	stateChanges = new Subject<void>();
	focused = false;
	controlType = 'xiri-file';
	
	readonly placeholder: string;
	public required = false;
	public disabled = false;
	shouldLabelFloat = true;
	
	private _field: XiriFormField;
	currentFiles: FileData[] = [];
	
	constructor() {
		if ( this.ngControl != null )
			this.ngControl.valueAccessor = this;
		
		this.parts = new FormGroup<FileForm>( {
			                                      files: new FormControl<File[] | null>( null ),
			                                      text: new FormControl<string | null>( null )
		                                      } );
		
		this.focusMonitor.monitor( this._elementRef, true ).subscribe( origin => {
			this.ngControl.control.markAsTouched();
			this.focused = !!origin;
			this.cdr.markForCheck();
		} );
	}
	
	onChange: ( value: FileValue[] | null | undefined ) => void = () => { /* intentionally empty */ };
	onTouched = () => { /* intentionally empty */ };
	
	ngOnDestroy() {
		this.stateChanges.complete();
		this.focusMonitor.stopMonitoring( this._elementRef );
	}
	
	@Input()
	get value(): FileValue[] | null | undefined {

		if ( this.errorState )
			return undefined;
		if ( this.currentFiles.length == 0 )
			return null;

		return this.currentFiles.map( ( file ) => {
			return {
				name: file.name,
				data: file.data
			};
		} );
	}

	set value( input: FileValue[] | null | undefined ) {

		if ( input === null || input === undefined )
			return;

		// console.log( 'xiriFile input', input );
		// this.onChange( this.value );
		// this.stateChanges.next();
	}
	
	
	@Input()
	get field(): XiriFormField {
		return this._field;
	}
	
	set field( value: XiriFormField ) {
		
		this._field = value;
		
		this.required = value.required;
		this.disabled = value.disabled;
		if ( this.disabled )
			this.parts.disable();
		else
			this.parts.enable();

		this.stateChanges.next();
	}
	
	get errorState(): boolean {
		return this.parts.invalid && this.ngControl.touched;
	}
	
	get empty() {
		return this.value === null;
	}
	
	writeValue( value: FileValue[] | null | undefined ): void {
		this.value = value;
	}

	registerOnChange( fn: ( value: FileValue[] | null | undefined ) => void ): void {
		this.onChange = fn;
	}

	registerOnTouched( fn: () => void ): void {
		this.onTouched = fn;
	}

	setDisabledState( isDisabled: boolean ): void {
		this.disabled = isDisabled;
	}

	setDescribedByIds( ids: string[] ) {
		this.describedBy = ids.join( ' ' );
	}

	onContainerClick(): void { /* intentionally empty */ }
	
	fileChange( event: Event ) {
		
		const element = event.currentTarget as HTMLInputElement;
		const fileList: FileList | null = element.files;
		
		if ( fileList === null || fileList.length === 0 || fileList.length > 100 )
			return;
		
		const fieldFiles = this.parts.get( 'files' );
		const fieldText = this.parts.get( 'text' );
		const files = [];
		
		for ( let i = 0; i < fileList.length; i++ ) {
			const file = fileList.item( i );
			if ( file === null || file.size > this._field.max ) {
				console.log( 'file too large or null', file, this._field );
				this.currentFiles = [];
				fieldFiles.setValue( null );
				fieldText.setValue( null );
				
				this.onChange( this.value );
				this.stateChanges.next();
				return;
			}
			
			const reader = new FileReader();
			
			reader.addEventListener( "load", () => {
				this.currentFiles.push( {
					                        file: file,
					                        name: file.name,
					                        data: reader.result as string
				                        } );

				this.onChange( this.value );
				this.stateChanges.next();
				this.cdr.markForCheck();
			}, false );
			
			reader.readAsDataURL( file );
			files.push( file );
		}
		
		fieldFiles.setValue( files );
		fieldText.setValue( files.map( ( file ) => file.name ).join( ', ' ) );
	}
	
	public getErrorMessage(): string {
		
		const errors = this.parts.get( 'text' ).errors;
		
		if ( errors.required )
			return 'required';
		
		console.log( 'unknown error file', errors );
		
		return 'error';
	}
	
}
