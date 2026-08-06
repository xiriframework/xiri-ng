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
import {
	catchError,
	distinctUntilChanged,
	EMPTY,
	filter,
	finalize,
	map,
	merge,
	Observable,
	Subject,
	switchMap,
	timer
} from "rxjs";
import { XiriDataService } from '../services/data.service';
import { XiriSnackbarService } from '../services/snackbar.service';
import { parseHttpError } from '../services/error.util';
import { emptyValueForField } from './helper/empty-value';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatProgressBar } from '@angular/material/progress-bar';
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

function formatValidationDate( localeString: string, unixSeconds: number ): string {
	return new Intl.DateTimeFormat( localeString ).format( new Date( unixSeconds * 1000 ) );
}


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
		            MatProgressBar,
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
	private dataService = inject( XiriDataService );
	private snackbar = inject( XiriSnackbarService );

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

	// Render-Kopien der gepatchten Felder, siehe displayFields(). Das Signal daneben stößt nur die
	// Neuberechnung an; die Identitäten selbst leben in der Map, damit sie stabil bleiben.
	private patchedClones = new Map<string, XiriFormField>();
	private patchVersion = signal( 0 );
	// Zuletzt angewendeter Patch pro Feld - Rohdaten vom Server, also frei von den Referenzen,
	// die z.B. der Treeselect nachträglich in die Optionsliste hängt.
	private lastPatch = new Map<string, Record<string, unknown>>();
	// Zählt jeden Aufbau einer neuen Feldliste, damit der Initial-Reload auch dann feuert, wenn
	// das neue Formular zufällig dieselben Trigger-Werte trägt wie das alte.
	private formGeneration = 0;
	// Startet den Reload einmalig nach dem Aufbau der Controls.
	private reloadKick = new Subject<void>();
	// Unterdrückt den formChange-Emit der valueChanges-Subscription, während ein Patch angewendet
	// wird - nach dem Patch wird genau einmal emittiert.
	private applyingPatch = false;
	// Läuft gerade ein Reload? Trägt den Fortschrittsbalken über dem Feldblock. Bewusst nur eine
	// Anzeige und kein control.disable(): ein deaktiviertes Control fällt aus formGroup.value, und
	// genau das lesen xiri-query und xiri-form aus dem formChange.
	protected reloading = signal( false );

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

		// Ein Reload direkt nach dem Aufbau der Controls, immer. Der Server liefert seine Listen
		// zum Startwert eines Triggers - der muss aber nicht der aktuelle sein: xiri-query stellt
		// gespeicherte Filterwerte über formService.loadState() wieder her, bevor die Controls
		// entstehen. Ein bedingtes "nur wenn abweichend" ist von hier aus nicht erkennbar.
		effect( () => {
			const formInput = this.form();
			this.fields();
			if ( formInput !== null && this._fieldsLoaded )
				this.reloadKick.next();
		} );
	}

	// Gepatchte Felder werden als Kopie gerendert, damit Kind-Komponenten mit eigenem State
	// (treeselect, chips, die Select-Directive) ihre Inputs neu auswerten. Die Originale bleiben
	// die Quelle der Wahrheit - sie tragen field.control und werden von xiri-query mitgelesen.
	//
	// Die Kopie wird gecacht: die Identität eines Felds darf sich nur ändern, wenn genau dieses
	// Feld erneut gepatcht wurde. Würde hier bei jedem Patch neu geklont, liefe der Input-Setter
	// aller je gepatchten Felder erneut - beim Treeselect wäre das ein kompletter Neuaufbau.
	displayFields = computed( () => {
		const fields = this.fields();
		this.patchVersion();
		if ( fields === null || this.patchedClones.size === 0 )
			return fields;
		return fields.map( f => this.patchedClones.get( f.id ) ?? f );
	} );
	
	ngOnInit(): void {
		
		this.check()?.pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe( () => {
			this.validateAllFormFields();
		} );
		
		this.formGroup.valueChanges.pipe( takeUntilDestroyed( this.destroyRef ) ).subscribe( () => {
			if ( this._fieldsLoaded && !this.applyingPatch ) {
				const currentValue = JSON.stringify( this.formGroup.value );
				if ( currentValue === this.lastValue )
					return;
				this.lastValue = currentValue;
				this.formChange.emit( this.formGroup );
			}
		} );

		// Ein Trigger-Wechsel lädt die abhängigen Felder nach.
		//
		// Der Snapshot wird ungefiltert gebildet und erst danach entprellt: das äußere switchMap
		// bricht damit einen noch laufenden Request sofort ab, sobald sich der Stand ändert. Läge
		// debounceTime davor, bliebe die Anfrage zum überholten Stand noch 200 ms aktiv und könnte
		// in diesem Fenster antworten - ihr Patch würde dann Werte verwerfen, die für den neuen
		// Stand gültig sind, und kein späterer Patch stellt sie wieder her.
		merge( this.reloadKick, this.formGroup.valueChanges ).pipe(
			// Während des Control-Aufbaus feuert valueChanges für jedes entfernte und neue Control;
			// diese Zwischenstände sind kein Trigger-Wechsel. Der Kick danach übernimmt.
			filter( () => this._fieldsLoaded ),
			map( () => JSON.stringify( { g: this.formGeneration, v: this.triggerValues() } ) ),
			distinctUntilChanged(),
			// Der Balken hängt am Trigger-Wechsel, nicht am Request: gesetzt wird vor dem Timer,
			// sonst bliebe die Entprellzeit ohne Rückmeldung. Bei einem zweiten Wechsel bleibt er
			// durchgehend an, weil switchMap den alten Inner-Stream abräumt (finalize -> false),
			// bevor diese Projektion für den neuen läuft (-> true).
			switchMap( () => {
				if ( this.dependentFields().length === 0 )
					return EMPTY;
				this.reloading.set( true );
				return timer( 200 ).pipe(
					switchMap( () => this.fetchPatches() ),
					finalize( () => this.reloading.set( false ) ),
				);
			} ),
			takeUntilDestroyed( this.destroyRef ),
		).subscribe( patch => this.applyPatch( patch.url, patch.fields ) );
	}

	// Felder, die inhaltlich von anderen abhängen (beide Angaben nötig, siehe field.interface).
	private dependentFields(): XiriFormField[] {
		return ( this._fields ?? [] ).filter( f => !!f.reloadUrl && !!f.reloadOn?.length );
	}

	// Nur die Trigger-Werte gehen an den Server, nicht das ganze Formular: ein Options-Endpoint
	// braucht keine Passwörter. Alles Weitere gehört in die reloadUrl.
	//
	// Ohne URL sind es alle Trigger (für den Änderungsvergleich), mit URL nur die, von denen die
	// Felder genau dieser URL abhängen - jeder Endpoint sieht also nur seine eigenen Werte.
	private triggerValues( url?: string ): Record<string, unknown> | null {
		const dependent = this.dependentFields().filter( f => url === undefined || f.reloadUrl === url );
		if ( dependent.length === 0 )
			return null;

		const raw = this.formGroup.getRawValue();
		const values: Record<string, unknown> = {};
		for ( const field of dependent )
			for ( const trigger of field.reloadOn ?? [] )
				if ( trigger in raw )
					values[ trigger ] = raw[ trigger ];

		return values;
	}

	private fetchPatches(): Observable<{ url: string, fields: Record<string, unknown> }> {

		const urls = new Set( this.dependentFields().map( f => f.reloadUrl as string ) );
		if ( urls.size === 0 )
			return EMPTY;

		// Ein Request pro URL, jeder für sich: schlägt einer fehl, werden die Patches der
		// anderen trotzdem angewendet.
		return merge( ...Array.from( urls ).map( url =>
			this.dataService.post( url, this.triggerValues( url ) ?? {} ).pipe(
				map( res => ( { url, fields: ( res as { fields?: Record<string, unknown> } )?.fields ?? {} } ) ),
				catchError( err => {
					this.snackbar.error( parseHttpError( err ) );
					return EMPTY;
				} ),
			) ) );
	}

	private applyPatch( url: string, patch: Record<string, unknown> ): void {

		const fields = this._fields;
		if ( fields === null || !patch )
			return;

		const patchedNow = new Set<string>();

		this.applyingPatch = true;
		try {
			for ( const field of fields ) {

				// Der Server ist eine Trust-Boundary: eine Antwort darf nur die abhängigen Felder
				// genau dieser URL anfassen.
				if ( !field.reloadOn?.length || field.reloadUrl !== url )
					continue;

				const entry = patch[ field.id ];
				if ( entry === null || typeof entry !== 'object' )
					continue;

				const applied = applyPatchProperties( field, entry as Record<string, unknown>,
				                                      this.lastPatch.get( field.id ) );
				this.lastPatch.set( field.id, entry as Record<string, unknown> );
				if ( applied.length === 0 )
					continue;
				patchedNow.add( field.id );
				this.patchedClones.set( field.id, { ...field } );

				const control = field.control;
				if ( !control )
					continue;

				if ( applied.includes( 'list' ) )
					this.pruneValue( field, control );

				if ( applied.includes( 'required' ) || applied.includes( 'min' ) || applied.includes( 'max' ) ) {
					field.validations = undefined;
					control.setValidators( this.bindValidations( field ) );
					control.updateValueAndValidity( { emitEvent: false } );
				}

				// Mit dem globalen disabled kombinieren, sonst reaktiviert ein disabled:false im
				// Patch ein Control, obwohl die ganze Form gerade deaktiviert ist.
				if ( applied.includes( 'disabled' ) ) {
					if ( field.disabled || this.disabled() )
						control.disable( { emitEvent: false } );
					else
						control.enable( { emitEvent: false } );
				}
			}
		} finally {
			this.applyingPatch = false;
		}

		if ( patchedNow.size === 0 )
			return;

		// Nur anstoßen: die Klon-Identitäten selbst liegen in patchedClones und bleiben für alle
		// Felder stabil, die dieser Patch nicht angefasst hat.
		this.patchVersion.update( v => v + 1 );
		this.lastValue = JSON.stringify( this.formGroup.value );
		this.formChange.emit( this.formGroup );
	}

	// Verwirft Werte, die die neue Liste nicht mehr anbietet. Das emittiert bewusst, damit ein
	// Feld, das seinerseits von diesem abhängt, nachzieht. Die Kette terminiert, weil Pruning
	// monoton ist: ein leeres Feld hat nichts mehr zu verwerfen.
	private pruneValue( field: XiriFormField, control: AbstractControl ): void {

		// Nur wenn die Liste autoritativ ist. Bei Server-Suche ist list nur der statische Sockel,
		// bei chips sind es Vorschläge - dort würde Pruning gültige Eingaben löschen.
		if ( field.url || field.type === 'chips' )
			return;

		const ids = collectOptionIds( field.list ?? [] );
		const value = control.value;

		if ( Array.isArray( value ) ) {
			const kept = value.filter( v => ids.has( v as string | number ) );
			if ( kept.length !== value.length )
				control.setValue( kept );
			return;
		}

		if ( value === null || value === undefined || value === '' )
			return;
		if ( !ids.has( value as string | number ) )
			control.setValue( emptyValueForField( field ) );
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

		// Neue Feldliste: alte Render-Kopien und Patch-Stände gehören zum vorherigen Formular.
		this.formGeneration++;
		this.patchedClones.clear();
		this.lastPatch.clear();

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
			const messagesFor = () => localeService.validationMessagesFor();
			const localeStringFor = () => localeService.localeString();

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
						                        get message() { return messagesFor().minDate( formatValidationDate( localeStringFor(), min ) ); }
					                        } );
				else if ( field.type == 'daterange' || field.type == 'datetimerange' )
					field.validations.push( {
						                        id: 'min',
						                        validator: validatorDateRangeStart( min ),
						                        get message() { return messagesFor().minDateRange( formatValidationDate( localeStringFor(), min ) ); }
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
						                        get message() { return messagesFor().maxDate( formatValidationDate( localeStringFor(), max ) ); }
					                        } );
				else if ( field.type == 'daterange' || field.type == 'datetimerange' )
					field.validations.push( {
						                        id: 'max',
						                        validator: validatorDateRangeEnd( max ),
						                        get message() { return messagesFor().maxDateRange( formatValidationDate( localeStringFor(), max ) ); }
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

		// Über die ID suchen, nicht über die Identität: gepatchte Felder werden als Kopie
		// gerendert, damit die Kind-Komponenten eine neue Input-Identität sehen.
		const idx = fields.findIndex( f => f.id === field.id );
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

// Was ein Reload-Patch am Feld ändern darf, jeweils mit Typprüfung. Der Server ist eine
// Trust-Boundary: eine kaputte `list` oder ein `min: "3"` dürfen weder das Pruning noch den
// Validator-Aufbau verfälschen.
//
// Bewusst nicht patchbar: `id`, `type`, `subtype` (createControl normalisiert die einmalig, ein
// Roh-Wert vom Server würde das zerlegen), `value` (den Wert behält der Client, siehe pruneValue),
// `control`, `showWhen` und `url` (`serverSideSearch` und der Suchfluss der Select-Directive
// werden nur beim Aufbau abgeleitet, eine Änderung käme nie an).
const PATCH_GUARDS: Record<string, ( value: unknown ) => boolean> = {
	list:     isOptionList,
	name:     isString,
	// Go exportiert einen leeren Hint als null - sonst liesse er sich nie wieder abräumen.
	hint:     isStringOrNull,
	class:    isString,
	required: isBoolean,
	disabled: isBoolean,
	hide:     isBoolean,
	search:   isBoolean,
	min:      isNumber,
	max:      isNumber,
	params:   isPlainObject,
};

function isString( value: unknown ): boolean {
	return typeof value === 'string';
}

function isStringOrNull( value: unknown ): boolean {
	return value === null || typeof value === 'string';
}

function isBoolean( value: unknown ): boolean {
	return typeof value === 'boolean';
}

function isNumber( value: unknown ): boolean {
	return typeof value === 'number' && Number.isFinite( value );
}

function isPlainObject( value: unknown ): boolean {
	return typeof value === 'object' && value !== null && !Array.isArray( value );
}

// Rekursiv, inklusive children: eine Option mit einem children-Feld, das kein Array ist, würde
// sonst erst später beim Sammeln der IDs oder beim Aufbau des Baums knallen.
function isOptionList( value: unknown ): boolean {
	return Array.isArray( value ) && value.every( isOption );
}

function isOption( value: unknown ): boolean {
	if ( !isPlainObject( value ) )
		return false;
	const option = value as { id?: unknown, children?: unknown };
	if ( typeof option.id !== 'string' && typeof option.id !== 'number' )
		return false;
	return option.children === undefined || option.children === null || isOptionList( option.children );
}

// Schreibt die erlaubten Properties ins Feld und meldet, welche davon wirklich etwas geändert
// haben. Ein Reload liefert oft dasselbe zurück - z.B. weil ein anderer Trigger sich geändert
// hat. Unveränderte Properties zu überspringen erspart den Klon (der einen Treeselect neu
// aufbauen und bei gesetzter url erneut laden würde), den Validator-Neubau und den formChange.
//
// Verglichen wird bevorzugt mit dem zuletzt angewendeten Patch, nicht mit dem Feld: der
// Treeselect hängt beim Aufbau parent-Referenzen und state an die Optionsknoten, wodurch die
// Liste am Feld verschachtelt zyklisch wird und ohnehin nie mehr gleich aussieht.
function applyPatchProperties( field: XiriFormField,
                               entry: Record<string, unknown>,
                               previous: Record<string, unknown> | undefined ): string[] {

	const applied: string[] = [];
	const target = field as unknown as Record<string, unknown>;

	for ( const key of Object.keys( PATCH_GUARDS ) ) {
		if ( !( key in entry ) )
			continue;
		const value = entry[ key ];
		if ( !PATCH_GUARDS[ key ]( value ) )
			continue;
		const before = previous && key in previous ? previous[ key ] : target[ key ];
		if ( sameValue( before, value ) )
			continue;
		target[ key ] = value === null ? undefined : value;
		applied.push( key );
	}

	return applied;
}

function sameValue( a: unknown, b: unknown ): boolean {
	if ( a === b )
		return true;
	if ( typeof a !== 'object' || typeof b !== 'object' || a === null || b === null )
		return false;
	try {
		return JSON.stringify( a ) === JSON.stringify( b );
	} catch {
		// Zyklisch (siehe oben) - dann lieber anwenden als fälschlich überspringen.
		return false;
	}
}

// Option-IDs inklusive verschachtelter children - eine flache Sammlung würde jede ausgewählte
// Leaf-ID eines Treeselects verwerfen.
function collectOptionIds( list: XiriFormFieldSelectOption[],
                           into = new Set<string | number>() ): Set<string | number> {
	for ( const option of list ) {
		into.add( option.id );
		if ( option.children?.length )
			collectOptionIds( option.children, into );
	}
	return into;
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
