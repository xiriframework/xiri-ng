import { ChangeDetectorRef, Component, ElementRef, inject, Input, OnDestroy } from '@angular/core';
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
import { XiriLocaleService } from '../../services/locale.service';
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
	private localeService = inject( XiriLocaleService );
	
	
	static nextId = 0;
	id = `xiri-file-${ XiriFileComponent.nextId++ }`;
	describedBy = '';
	
	parts: FormGroup<FileForm>;
	stateChanges = new Subject<void>();
	focused = false;
	controlType = 'xiri-file';
	
	readonly placeholder!: string;
	public required = false;
	// Zwei Sperrquellen, getrennt gehalten und verodert: Angular ruft beim Control-Setup
	// setDisabledState(false) -- callSetDisabledState ist per Default 'always' -- und zwar nach
	// dem field-Input. Schlüge das direkt durch, höbe es ein Backend-disabled wieder auf.
	// Getrennt, obwohl beide deklarativ sind: sind [field] und [disabled] gleichzeitig gebunden,
	// ruft Angular den unveraenderten zweiten Input nicht erneut auf.
	private fieldDisabled = false;
	private inputDisabled = false;
	private controlDisabled = false;

	get disabled(): boolean {
		return this._disabled;
	}

	// Der oeffentliche Input ist dieselbe Quelle wie field.disabled: eine deklarative Sperre, die
	// ein setDisabledState(false) beim Control-Setup nicht aufheben darf.
	set disabled( value: boolean ) {
		this.inputDisabled = value;
		this.applyDisabled();
	}

	// Wird bei jedem Sperren UND bei jeder neuen Auswahl hochgezaehlt. Nur beim Sperren zu zaehlen
	// wuerde zwei schnell aufeinander folgende Auswahlen nicht trennen: der langsamere Reader der
	// ersten Auswahl traegt dann dieselbe Generation und darf trotzdem schreiben.
	private readGeneration = 0;

	private applyDisabled(): void {
		const value = this.fieldDisabled || this.inputDisabled || this.controlDisabled;
		this._disabled = value;
		if ( value )
			this.readGeneration++;
		if ( value )
			this.parts.disable( { emitEvent: false } );
		else
			this.parts.enable( { emitEvent: false } );
		this.stateChanges.next();
	}

	private _disabled = false;
	shouldLabelFloat = true;

	private _field!: XiriFormField;
	currentFiles: FileData[] = [];
	// Byte-Grenze, an der die letzte Auswahl gescheitert ist; null = keine Abweisung.
	private rejectedMax: number | null = null;
	
	constructor() {
		if ( this.ngControl != null )
			this.ngControl.valueAccessor = this;
		
		this.parts = new FormGroup<FileForm>( {
			                                      files: new FormControl<File[] | null>( null ),
			                                      text: new FormControl<string | null>(
				                                      null,
				                                      () => this.rejectedMax === null ? null : { maxSize: { max: this.rejectedMax } },
			                                      ),
		                                      } );
		
		this.focusMonitor.monitor( this._elementRef, true ).subscribe( origin => {
			this.ngControl?.control?.markAsTouched();
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

		this.required = value.required ?? false;
		this.fieldDisabled = !!value.disabled;
		this.applyDisabled();

		this.stateChanges.next();
	}
	
	get errorState(): boolean {
		return this.parts.invalid && !!this.ngControl?.touched;
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
		this.controlDisabled = isDisabled;
		this.applyDisabled();
	}

	setDescribedByIds( ids: string[] ) {
		this.describedBy = ids.join( ' ' );
	}

	onContainerClick(): void { /* intentionally empty */ }
	
	// Ein deaktiviertes `parts` sperrt nur die Anzeige -- der Dateidialog haengt am
	// mat-form-field, nicht am Input, und kann beim Sperren schon offen sein. Deshalb hier ein
	// eigener Guard und nicht nur einer im Template.
	protected openFileDialog( input: HTMLInputElement ): void {
		if ( this.disabled )
			return;
		input.click();
	}

	fileChange( event: Event ) {

		if ( this.disabled )
			return;

		// Der FileReader antwortet asynchron. Wird das Feld waehrend des Lesens gesperrt oder eine
		// neue Auswahl getroffen, darf der Callback nichts mehr schreiben -- und ein disable/enable
		// dazwischen darf ihn auch nicht wieder gueltig machen. Deshalb eine Generation statt
		// eines blossen Guards.
		//
		// Direkt hier hochzaehlen, vor jedem Abbruch: auch eine verworfene Auswahl (zu viele
		// Dateien) muss eine noch laufende vorherige entwerten, sonst schreibt deren Reader in
		// einen Stand, den der Nutzer gerade ersetzen wollte.
		const generation = ++this.readGeneration;

		const element = event.currentTarget as HTMLInputElement;
		const fileList: FileList | null = element.files;

		if ( fileList === null || fileList.length === 0 || fileList.length > 100 )
			return;

		const fieldFiles = this.parts.get( 'files' );
		const fieldText = this.parts.get( 'text' );
		const files = Array.from( { length: fileList.length }, ( _, i ) => fileList.item( i ) )
		                   .filter( ( file ): file is File => file !== null );
		// Eine neue Auswahl ersetzt die vorige ganz, auch wenn sie abgewiesen wird.
		this.currentFiles = [];

		// Alle Größen prüfen, bevor ein Reader startet: Sonst übernimmt der Reader einer gültigen Datei sie trotz der
		// Abweisung. Den Fehler setzt der Validator am text-Control, damit er auch ein disable/enable übersteht.
		const max = this._field.max ?? Infinity;
		this.rejectedMax = files.some( file => file.size > max ) ? max : null;
		if ( this.rejectedMax !== null ) {
			fieldFiles?.setValue( null );
			fieldText?.setValue( null );
			// touched innen, damit mat-form-field die mat-error zeigt, und außen, damit errorState greift
			// (value ist dann undefined, das Formular gesperrt).
			fieldText?.markAsTouched();
			this.ngControl?.control?.markAsTouched();
			this.onChange( this.value );
			this.stateChanges.next();
			this.cdr.markForCheck();
			return;
		}

		// Bis alle Reader fertig sind, gilt das Feld als offen (undefined sperrt das Formular): Weder die vorige noch
		// eine halb gelesene Auswahl darf abgeschickt werden.
		this.onChange( undefined );
		for ( const file of files ) {
			const reader = new FileReader();
			
			reader.addEventListener( "load", () => {
				if ( generation !== this.readGeneration )
					return;

				this.currentFiles.push( {
					                        file: file,
					                        name: file.name,
					                        data: reader.result as string
				                        } );

				if ( this.currentFiles.length === files.length )
					this.onChange( this.value );
				this.stateChanges.next();
				this.cdr.markForCheck();
			}, false );
			
			reader.readAsDataURL( file );
		}
		
		fieldFiles?.setValue( files );
		fieldText?.setValue( files.map( ( file ) => file.name ).join( ', ' ) );
	}
	
	public getErrorMessage(): string {
		
		const errors = this.parts.get( 'text' )?.errors;

		if ( errors?.maxSize )
			return this.localeService.maxFileSizeMessage( errors.maxSize.max );
		if ( errors?.required )
			return this.localeService.validationMessagesFor().required;
		
		console.log( 'unknown error file', errors );
		
		return 'error';
	}
	
}
