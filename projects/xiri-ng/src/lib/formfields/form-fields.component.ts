import {
	afterRenderEffect,
	Component,
	computed,
	DestroyRef,
	effect,
	ElementRef,
	inject,
	input,
	OnInit,
	output,
	signal,
	untracked
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
	AbstractControl,
	FormsModule,
	ReactiveFormsModule,
	UntypedFormBuilder,
	UntypedFormGroup,
	ValidationErrors,
	ValidatorFn,
	Validators
} from '@angular/forms';
import { XiriFormField, XiriFormFieldCondition, XiriFormFieldSelectOption } from './field.interface';
import { colsToClasses } from '../layout/cols.directive';
import { Observable } from "rxjs";
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { XiriFileComponent } from './file/file.component';
import { XiriTimelimitComponent } from './timelimit/timelimit.component';
import { XiriVolumeComponent } from './volume/volume.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { XiriDateTimeRangeComponent } from './datetimerange/datetimerange.component';
import { XiriDateRangeComponent } from './daterange/daterange.component';
import { XiriDateComponent } from './date/date.component';
import { XiriYearMonthComponent } from './yearmonth/yearmonth.component';
import { XiriTreeselectComponent } from './treeselect/treeselect.component';
import { XiriSelectDirective } from './select/select.directive';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MatError, MatFormField, MatHint, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { SafehtmlPipe } from "../pipes/safehtml.pipe";
import { XiriChipsComponent } from './chips/chips.component';
import { XiriLocaleService } from '../services/locale.service';

export type XiriFormFieldDisplay = 'full' | 'line' | 'small';

type XiriValidationLang = 'de' | 'en';

function formatValidationDate( lang: XiriValidationLang, unixSeconds: number ): string {
	return new Intl.DateTimeFormat( lang === 'en' ? 'en-US' : 'de-AT' ).format( new Date( unixSeconds * 1000 ) );
}

const validationMessages: Record<XiriValidationLang, {
	required: string;
	invalidFormat: string;
	invalidEmail: string;
	valueRequired: string;
	minLength: ( min: number ) => string;
	maxLength: ( max: number ) => string;
	minNumber: ( min: number ) => string;
	maxNumber: ( max: number ) => string;
	minDate: ( date: string ) => string;
	maxDate: ( date: string ) => string;
	minDateRange: ( date: string ) => string;
	maxDateRange: ( date: string ) => string;
	minSelection: ( min: number ) => string;
	maxSelection: ( max: number ) => string;
}> = {
	de: {
		required: 'Pflichtfeld – bitte ausfüllen',
		invalidFormat: 'Bitte ein gültiges Format eingeben',
		invalidEmail: 'Bitte eine gültige E-Mail-Adresse eingeben',
		valueRequired: 'Bitte einen Wert angeben',
		minLength: min => `Mindestens ${ min } Zeichen erforderlich`,
		maxLength: max => `Maximal ${ max } Zeichen erlaubt`,
		minNumber: min => `Mindestens ${ min } erforderlich`,
		maxNumber: max => `Maximal ${ max } erlaubt`,
		minDate: date => `Datum darf nicht vor ${ date } liegen`,
		maxDate: date => `Datum darf nicht nach ${ date } liegen`,
		minDateRange: date => `Startdatum muss nach ${ date } liegen`,
		maxDateRange: date => `Enddatum muss vor ${ date } liegen`,
		minSelection: min => `Mindestens ${ min } Einträge auswählen`,
		maxSelection: max => `Maximal ${ max } Einträge auswählen`,
	},
	en: {
		required: 'Required field',
		invalidFormat: 'Please enter a valid format',
		invalidEmail: 'Please enter a valid email address',
		valueRequired: 'Please provide a value',
		minLength: min => `At least ${ min } characters required`,
		maxLength: max => `Maximum ${ max } characters allowed`,
		minNumber: min => `Minimum value is ${ min }`,
		maxNumber: max => `Maximum value is ${ max }`,
		minDate: date => `Date must not be before ${ date }`,
		maxDate: date => `Date must not be after ${ date }`,
		minDateRange: date => `Start date must be after ${ date }`,
		maxDateRange: date => `End date must be before ${ date }`,
		minSelection: min => `Select at least ${ min } items`,
		maxSelection: max => `Select at most ${ max } items`,
	},
};


@Component( {
	            selector: 'xiri-form-fields',
	            templateUrl: './form-fields.component.html',
	            styleUrl: './form-fields.component.scss',
	            imports: [
		            FormsModule,
		            ReactiveFormsModule,
		            MatFormField,
		            MatLabel,
		            MatInput,
		            MatPrefix,
		            MatSuffix,
		            MatIcon,
		            MatHint,
		            MatError,
		            MatIconButton,
		            MatSelect,
		            MatOption,
		            NgxMatSelectSearchModule,
		            XiriSelectDirective,
		            XiriTreeselectComponent,
		            XiriDateComponent,
		            XiriYearMonthComponent,
		            XiriDateRangeComponent,
		            XiriDateTimeRangeComponent,
		            MatCheckbox,
		            MatRadioButton,
		            MatRadioGroup,
		            XiriVolumeComponent,
		            XiriTimelimitComponent,
		            XiriFileComponent,
		            MatProgressSpinner,
		            AsyncPipe,
		            SafehtmlPipe,
		            XiriChipsComponent,
	            ]
            } )
export class XiriFormFieldsComponent implements OnInit {
	
	private formBuilder = inject( UntypedFormBuilder );
	private destroyRef = inject( DestroyRef );
	private elementRef = inject<ElementRef<HTMLElement>>( ElementRef );
	private readonly localeService = inject( XiriLocaleService );
	
	form = input<XiriFormField[] | null>( null );
	display = input<XiriFormFieldDisplay>( 'full' );
	disabled = input<boolean>( false );
	formChange = output<UntypedFormGroup>();
	check = input<Observable<void> | null>( null );
	
	// fields: XiriFormField[] = [];
	formGroup: UntypedFormGroup;
	private lastValue: string | null = null;
	private _fields: XiriFormField[] | null = null;
	collapsedSections = signal<Set<string>>( new Set() );
	private _fieldsLoaded = false;
	private _initialEmitDone = false;
	private _autoFocusDone = false;

	constructor() {

		// Fokussiert nach dem ersten Render das erste sichtbare, interaktive Feld (spart den ersten Klick).
		// Nicht-interaktive Feldtypen (header, divider, info, html) rendern kein fokussierbares Element
		// und werden dadurch automatisch übersprungen, ebenso versteckte (showWhen/collapsed) Felder,
		// die per @if gar nicht ins DOM kommen. Felder mit field.hide bleiben aber via [hidden] im DOM und
		// müssen daher explizit über einen [hidden]-Vorfahren ausgefiltert werden. Der Selektor beschränkt
		// sich bewusst auf echte Eingabe-Elemente, damit der klappbare Header (tabindex="0") kein Ziel ist.
		afterRenderEffect( () => {
			this.fields();
			if ( this._autoFocusDone )
				return;
			const target = Array.from(
				this.elementRef.nativeElement.querySelectorAll<HTMLElement>( 'input, mat-select, textarea' )
			).find( el => !el.closest( '[hidden]' ) );
			if ( target ) {
				this._autoFocusDone = true;
				target.focus( { preventScroll: true } );
			}
		} );
		
		this.formGroup = this.formBuilder.group( {} );
		
		effect( () => {
			const isDisabled = this.disabled();
			if ( isDisabled ) {
				this.formGroup.disable( { emitEvent: false } );
			} else {
				this.formGroup.enable( { emitEvent: false } );
				// Felder die vom Backend als disabled kamen, wieder deaktivieren
				if ( this._fields ) {
					for ( const field of this._fields ) {
						if ( field.disabled ) {
							this.formGroup.get( field.id )?.disable( { emitEvent: false } );
						}
					}
				}
			}
		} );
		
		// Track form input changes and emit after controls are created
		effect( () => {
			const formInput = this.form();
			if ( formInput !== null ) {
				// Force evaluation of computed to create controls
				this.fields();
				// Schedule emission for next microtask to ensure view is ready
				if ( this._fieldsLoaded && !this._initialEmitDone ) {
					this._initialEmitDone = true;
					// Use queueMicrotask to emit after current change detection cycle
					queueMicrotask( () => {
						this.formChange.emit( this.formGroup );
					} );
				}
			}
		} );
	}
	
	ngOnInit(): void {
		
		this.check()?.pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe( () => {
			this.validateAllFormFields();
		} );
		
		this.formGroup.valueChanges.pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe( () => {
			if ( this._fieldsLoaded ) {
				const currentValue = JSON.stringify( this.formGroup.value );
				if ( currentValue === this.lastValue )
					return;
				this.lastValue = currentValue;
				this.formChange.emit( this.formGroup );
			}
		} );
	}
	
	fields = computed( () => {
		
		this._fieldsLoaded = false;
		if ( this._fields !== null ) {
			for ( let i = 0; i != this._fields.length; i++ ) {
				this.formGroup.removeControl( this._fields[ i ].id );
			}
			this._fields = null;
		}
		
		const fields = this.form();
		if ( fields == null ) {
			return null;
		}
		
		this._fields = fields;

		const initialCollapsed = new Set<string>();
		for ( const f of fields ) {
			if ( f.type === 'header' && f.collapsible && f.collapsed )
				initialCollapsed.add( f.id );
		}
		untracked( () => this.collapsedSections.set( initialCollapsed ) );

		this.createControl();
		
		this.lastValue = JSON.stringify( this.formGroup.value );
		this._fieldsLoaded = true;
		return this._fields;
	} );
	
	private createControl(): void {

		const fields = this._fields;
		if ( fields === null )
			return;

		for ( let i = 0; i != fields.length; i++ ) {
			const field = fields[ i ];
			
			if ( field.formtype )
				field.type = field.formtype;
			if ( !field.subtype )
				field.subtype = field.type;
			if ( !field.class )
				field.class = field.cols !== undefined ? colsToClasses( field.cols ) : 'xcol';
			
			switch ( field.type ) {
				case 'email':
					field.type = 'text';
					field.subtype = 'email';
					break;
				
				case 'password':
					field.subtype = 'password';
					field.pwdhide = true;
					break;
				
				case 'objectlist':
					field.multiple = true;
					if ( field.subtype != 'objectlist' )
						field.type = field.subtype;
					else {
						if ( field.tree === undefined )
							field.tree = true;
						if ( field.required === undefined )
							field.required = true;
						field.type = 'treeselect';
					}
					break;
				
				case 'volume':
					field.required = true;
					break;
				
				case 'treeselect':
					field.tree = true;
					if ( field.required === undefined )
						field.required = true;
					break;
				
				case 'multiselect':
					field.tree = false;
					field.type = 'treeselect';
					
					if ( field.required === undefined )
						field.required = true;
					break;
				
				case 'radio':
					fillListFromArray( field );
					if ( field.value === undefined && field.list?.length )
						field.value = field.list[ 0 ].id;
					field.multiple = false;
					if ( field.required === undefined )
						field.required = true;
					break;

				case 'select':
				case 'object':
				case 'model':
					if ( field.type == 'object' || field.type == 'model' ) {
						field.type = 'select';
						field.subtype = 'model';
						field.multiple = false;
					}
					if ( field.subtype == 'object' )
						field.subtype = 'model';

					fillListFromArray( field );

					if ( field.subtype === 'model' ) {
						if ( field.value === undefined && field.list !== undefined && field.list.length != 0 )
							field.value = field.list[ 0 ].id;
					} else {
						if ( field.value === undefined || field.value === null )
							field.value = [];
					}
					
					if ( field.required === undefined )
						field.required = true;
					
					field.serverSideSearch = !!field.url;
					
					break;
				
				case 'date':
				case 'datetime':
					field.type = 'date';
					if ( field.required === undefined )
						field.required = true;
					if ( field.subtype == 'datetime' )
						field.class += ' datetime';
					break;

				case 'yearmonth':
					if ( field.required === undefined )
						field.required = true;
					field.class += ' yearmonth';
					break;
				
				case 'daterange':
				case 'datetimerange':
					if ( field.required === undefined )
						field.required = true;
					break;
				
				case 'bool':
					if ( field.name === undefined && field.placeholder )
						field.name = field.placeholder;
					break;
				
				case 'question':
					if ( field.question )
						field.value = field.question;

					break;
			}
			
			// if ( field.hint || (field.type == 'textarea' && field.max) )
			//	field.class += ' hashint';
			
			if ( field.value === undefined ) {
				if ( field.type == 'text' || field.type == 'textarea' )
					field.value = '';
				else if ( field.type == 'bool' )
					field.value = false;
			}
			
			field.required = !!field.required;
			field.disabled = !!field.disabled;
			
			const control = this.formBuilder.control(
				field.value,
				this.bindValidations( field )
			);
			
			field.control = control;
			this.formGroup.addControl( field.id, control );
		}
	}
	
	private bindValidations( field: XiriFormField ) {

		const validList: ValidatorFn[] = [];

		if ( field.validations === undefined ) {

			field.validations = [];
			// Sprache wird bei jedem Zugriff auf `message` frisch aus dem Service gelesen (Getter),
			// damit die Fehlertexte bei einem Sprachwechsel ohne Neuaufbau der Validatoren umschalten.
			const localeService = this.localeService;
			const langFor = (): XiriValidationLang => localeService.language();
			const messagesFor = () => validationMessages[ langFor() ];

			if ( field.min !== undefined ) {
				const min = field.min;
				if ( field.type == 'number' )
					field.validations.push( {
						                        id: 'min',
						                        validator: Validators.min( min ),
						                        get message() { return messagesFor().minNumber( min ); }
					                        } );
				else if ( field.type == 'date' )
					field.validations.push( {
						                        id: 'min',
						                        validator: Validators.min( min ),
						                        get message() { return messagesFor().minDate( formatValidationDate( langFor(), min ) ); }
					                        } );
				else if ( field.type == 'daterange' || field.type == 'datetimerange' )
					field.validations.push( {
						                        id: 'min',
						                        validator: validatorDateRangeStart( min ),
						                        get message() { return messagesFor().minDateRange( formatValidationDate( langFor(), min ) ); }
					                        } );
				else if ( field.type == 'multiselect' || field.type == 'treeselect' )
					field.validations.push( {
						                        id: 'min',
						                        validator: validatorArrayMin( min ),
						                        get message() { return messagesFor().minSelection( min ); }
					                        } );
				else
					field.validations.push( {
						                        id: 'minlength',
						                        validator: Validators.minLength( min ),
						                        get message() { return messagesFor().minLength( min ); }
					                        } );
			}
			if ( field.max !== undefined ) {
				const max = field.max;
				if ( field.type == 'number' )
					field.validations.push( {
						                        id: 'max',
						                        validator: Validators.max( max ),
						                        get message() { return messagesFor().maxNumber( max ); }
					                        } );
				else if ( field.type == 'date' )
					field.validations.push( {
						                        id: 'max',
						                        validator: Validators.max( max ),
						                        get message() { return messagesFor().maxDate( formatValidationDate( langFor(), max ) ); }
					                        } );
				else if ( field.type == 'daterange' || field.type == 'datetimerange' )
					field.validations.push( {
						                        id: 'max',
						                        validator: validatorDateRangeEnd( max ),
						                        get message() { return messagesFor().maxDateRange( formatValidationDate( langFor(), max ) ); }
					                        } );
				else if ( field.type == 'multiselect' || field.type == 'treeselect' )
					field.validations.push( {
						                        id: 'max',
						                        validator: validatorArrayMax( max ),
						                        get message() { return messagesFor().maxSelection( max ); }
					                        } );
				else
					field.validations.push( {
						                        id: 'maxlength',
						                        validator: Validators.maxLength( max ),
						                        get message() { return messagesFor().maxLength( max ); }
					                        } );
			}

			if ( field.pattern !== undefined ) {
				field.validations.push( {
					                        id: 'pattern',
					                        validator: Validators.pattern( field.pattern ),
					                        get message() { return messagesFor().invalidFormat; }
				                        } );
			} else {
				if ( field.type == 'text' && field.subtype == 'email' ) {
					field.validations.push( {
						                        id: 'email',
						                        validator: Validators.email,
						                        get message() { return messagesFor().invalidEmail; }
					                        } );
				}
			}

			if ( field.required == true ) {
				field.validations.push( {
					                        id: 'required',
					                        validator: Validators.required,
					                        get message() { return messagesFor().required; },
				                        } );
			} else {
				field.validations.push( {
					                        id: 'undefined',
					                        validator: validatorUndefined(),
					                        get message() { return messagesFor().valueRequired; },
				                        } );
			}
		}

		field.validations.forEach( valid => {
			validList.push( valid.validator );
		} );

		return validList.length ? Validators.compose( validList ) : null;
	}
	
	private validateAllFormFields() {

		this.formGroup.markAsDirty();
		this.formGroup.markAllAsTouched();
		this.formGroup.updateValueAndValidity();
	}
	
	isFieldVisible( field: XiriFormField ): boolean {
		
		// Check if field is inside a collapsed section
		if ( this.isInCollapsedSection( field ) )
			return false;
		
		if ( !field.showWhen )
			return true;
		
		const conditions: XiriFormFieldCondition[] = Array.isArray( field.showWhen )
		                                             ? field.showWhen
		                                             : [ field.showWhen ];
		
		return conditions.every( condition => this.evaluateCondition( condition ) );
	}
	
	toggleSection( header: XiriFormField ): void {
		this.collapsedSections.update( set => {
			const next = new Set( set );
			if ( next.has( header.id ) )
				next.delete( header.id );
			else
				next.add( header.id );
			return next;
		} );
	}
	
	isSectionCollapsed( headerId: string ): boolean {
		return this.collapsedSections().has( headerId );
	}

	private isInCollapsedSection( field: XiriFormField ): boolean {
		const fields = this._fields;
		if ( !fields ) return false;

		// Ein header startet seine eigene Section und ist nie Teil einer vorherigen
		if ( field.type === 'header' ) return false;

		const idx = fields.indexOf( field );
		if ( idx <= 0 ) return false;

		// Walk backwards to find the nearest header or divider
		for ( let i = idx - 1; i >= 0; i-- ) {
			const f = fields[ i ];
			if ( f.type === 'header' ) {
				return !!f.collapsible && this.collapsedSections().has( f.id );
			}
			if ( f.type === 'divider' ) {
				return false; // Divider breaks the section
			}
		}

		return false;
	}
	
	private evaluateCondition( condition: XiriFormFieldCondition ): boolean {
		
		const control = this.formGroup.get( condition.field );
		if ( !control )
			return false;
		
		const fieldValue = control.value;
		
		switch ( condition.operator ) {
			case 'equals':
				return fieldValue === condition.value;
			case 'notEquals':
				return fieldValue !== condition.value;
			case 'contains':
				return typeof fieldValue === 'string' && fieldValue.includes( condition.value as string );
			case 'greaterThan':
				return fieldValue > ( condition.value as number );
			case 'lessThan':
				return fieldValue < ( condition.value as number );
			case 'in':
				return Array.isArray( condition.value ) && condition.value.includes( fieldValue );
			case 'notEmpty':
				return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
			default:
				return true;
		}
	}
}

function fillListFromArray( field: XiriFormField ): void {
	if ( field.list === undefined && field.array !== undefined ) {
		const list: XiriFormFieldSelectOption[] = [];
		field.array.forEach( val => {
			list.push( {
				           id: val as unknown as number,
				           name: val as unknown as string,
			           } )
		} );
		field.list = list;
	}
}

function validatorDateRangeStart( min: number ): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		if ( control.value === undefined || control.value === null || control.value.start === null )
			return null;
		const ok = min < control.value.start;
		return ok ? null : { min: { value: control.value } };
	};
}

function validatorDateRangeEnd( max: number ): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		if ( control.value === undefined || control.value === null || control.value.end === null )
			return null;
		const ok = max > control.value.end;
		return ok ? null : { max: { value: control.value } };
	};
}

function validatorUndefined(): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		return control.value === undefined ? { undefined: { value: control.value } } : null;
	};
}

function validatorArrayMin( min: number ): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		if ( control.value === null || control.value === undefined )
			return null;
		const ok = control.value.length >= min;
		return ok ? null : { min: { value: control.value } };
	};
}

function validatorArrayMax( max: number ): ValidatorFn {
	return ( control: AbstractControl ): ValidationErrors | null => {
		if ( control.value === null || control.value === undefined )
			return null;
		const ok = control.value.length <= max;
		return ok ? null : { max: { value: control.value } };
	};
}
