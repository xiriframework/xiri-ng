import {
	afterNextRender,
	ChangeDetectionStrategy,
	Component,
	computed,
	DestroyRef,
	Directive,
	effect,
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
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
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
import { ErrorStateMatcher, MatOption } from '@angular/material/core';
import { MatError, MatFormField, MatFormFieldControl, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { XiriFormField } from '../field.interface';
import { buildValidations } from '../helper/validations';
import { XiriSuggestDirective } from '../suggest/suggest.directive';
import { XiriLocaleService } from '../../services/locale.service';
import { cellDefault, isEmptyRow, uniqueKey } from './rows.util';

// Pflicht-Markierung ohne Validator: `[required]` würde Angulars RequiredValidator anhängen und die Ausnahme für leere
// Zeilen umgehen. Material liest aria-required und den Stern am Label aus `required` des Controls.
@Directive( { selector: '[xiriCellRequired]' } )
export class XiriCellRequiredDirective {
	xiriCellRequired = input( false );
	private control = inject( MatFormFieldControl, { self: true } ) as { required: boolean };

	constructor() {
		effect( () => this.control.required = this.xiriCellRequired() );
	}
}

export type XiriRow = FormGroup<Record<string, FormControl<unknown>>>;

// Zellfehler zeigen, sobald die Zelle oder ihre Zeile berührt ist: Verlassen einer Zelle markiert über
// markAsTouched auch die Zeilen-Gruppe, die übrigen Zellen der Zeile zeigen ihre Fehler dann mit.
const cellErrors: ErrorStateMatcher = {
	isErrorState: control => !!control?.invalid && ( control.touched || !!control.parent?.touched ),
};

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
		            MatLabel,
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
		            XiriCellRequiredDirective,
		            CdkDropList,
		            CdkDrag,
		            CdkDragHandle,
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

	// Server-Fehler je Zelle samt dem Wert, zu dem er kam: gilt, bis genau diese Zelle geändert wird. Als Teil
	// des Validators, damit revalidate() ihn nicht wegräumt, wenn eine andere Zelle sich ändert.
	private serverCells = new Map<AbstractControl, { message: string; value: unknown }>();

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
	readonly sortable = computed( () => this.field().sortable !== false && !this.disabled() );
	readonly copyable = computed( () => !!this.field().copy && !this.disabled() );
	readonly canAdd = computed( () => {
		const max = this.field().max;
		return max === undefined || this.rows().length < max;
	} );
	readonly duplicateMessage = computed( () => this.localeService.rowsMessages().duplicate );
	// Zelle, die den Duplikat-Fehler trägt: erstes sichtbares unique-Unterfeld (wie checkUnique in xiri-go), sonst das erste.
	private readonly duplicateSub = computed( () => {
		const ids = this.field().unique ?? [];
		const hidden = new Set( this.subs().filter( s => s.hide ).map( s => s.id ) );
		return ids.find( id => !hidden.has( id ) ) ?? ids[ 0 ];
	} );
	readonly width = signal( 0 );
	// ponytail: feste Schätzung von 140 px je Spalte plus Aktionen statt Messen der Inhalte; reicht für Handy und
	// schmalen Dialog. Genauer erst, wenn Felder mit sehr unterschiedlichen Breiten falsch umschalten.
	readonly cards = computed( () => this.width() > 0 && this.width() < this.visible().length * 140 + this.actionsWidth() + 32 );

	// Jede Zeile ist ein eigenes Grid: alle Spalten deshalb ohne inhaltsabhängige Breiten, sonst stehen Kopf und
	// Zeilen versetzt.
	private actionsWidth = computed( () =>
		( ( this.sortable() ? 2 : 0 ) + ( this.copyable() ? 1 : 0 ) + ( this.removable() ? 1 : 0 ) ) * 40 );

	readonly gridColumns = computed( () => [
		...( this.sortable() ? [ '32px' ] : [] ),
		...this.visible().map( s => typeof s.cols === 'number' ? `minmax(0, ${ s.cols }fr)`
		                            : s.type === 'bool' ? 'minmax(56px, .5fr)' : 'minmax(0, 1fr)' ),
		`${ this.actionsWidth() }px`,
	].join( ' ' ) );
	readonly addLabel = 'Hinzufügen';
	readonly cellErrors = cellErrors;
	// Letztes bedienbares Textfeld einer Zeile: Enter dort legt in der letzten Zeile die nächste an.
	readonly lastTextSub = computed( () =>
		this.visible().filter( s => ( s.type === 'text' || s.type === 'number' ) && !s.disabled ).at( -1 ) );

	private onChange: ( value: Record<string, unknown>[] ) => void = () => { /* intentionally empty */ };
	private onTouched: () => void = () => { /* intentionally empty */ };
	private onValidatorChange: () => void = () => { /* intentionally empty */ };

	constructor() {
		this.array.valueChanges.pipe( takeUntilDestroyed() ).subscribe( () => this.sync() );
		effect( () => {
			const errors = this.serverErrors();
			untracked( () => this.applyServerErrors( errors ) );
		} );
		// Breite der Komponente selbst, nicht des Fensters: greift auch im schmalen Dialog.
		if ( typeof ResizeObserver !== 'undefined' ) {
			const observer = new ResizeObserver( entries => this.width.set( entries[ 0 ].contentRect.width ) );
			observer.observe( this.host.nativeElement );
			this.destroyRef.onDestroy( () => observer.disconnect() );
		}
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
			this.serverCells.clear();
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

	registerOnValidatorChange( fn: () => void ): void {
		this.onValidatorChange = fn;
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
		// enable() prüft das Control, bevor Angular setDisabledState aufruft - da war das FormArray noch gesperrt
		// und validate() lieferte null. Deshalb jetzt erneut prüfen lassen.
		if ( !isDisabled )
			this.onValidatorChange();
	}

	// Feldebene (required/min/max) prüft form-fields über buildValidations am Wert; hier nur die Zellen.
	validate(): ValidationErrors | null {
		return this.filled().some( i => this.array.at( i ).invalid ) ? { rows: true } : null;
	}

	add(): void {
		if ( this.addable() )
			this.insertRow( this.array.length, {} );
	}

	// Schnelle Eingabe: Enter im letzten Textfeld der letzten Zeile legt eine Zeile an statt abzusenden. Ein
	// offenes Vorschlags-Panel hat Vorrang - je nach Listener-Reihenfolge ist es dann noch offen oder hat das
	// Event schon mit preventDefault übernommen.
	onEnter( event: Event, i: number, sub: XiriFormField, panelOpen: boolean ): void {
		if ( event.defaultPrevented || panelOpen || i !== this.array.length - 1 || sub !== this.lastTextSub() )
			return;
		if ( !this.addable() || !this.canAdd() )
			return;
		event.preventDefault();
		this.add();
	}

	move( from: number, to: number ): void {
		if ( from === to || to < 0 || to >= this.array.length )
			return;
		const row = this.array.at( from );
		this.array.removeAt( from, { emitEvent: false } );
		this.array.insert( to, row );
		this.touched();
	}

	// Pfeil-Buttons: @for hängt die Zeile neu ein, der Fokus fiele auf body. Er bleibt am selben Pfeil der
	// verschobenen Zeile, oder am anderen, wenn dieser am Rand gesperrt ist. Drag & Drop ruft move() direkt.
	moveByKey( from: number, to: number, arrow: 'up' | 'down' ): void {
		this.move( from, to );
		const row = `.row-item:nth-child(${ to + 1 })`;
		this.focusFirst( `${ row } button.${ arrow }:not([disabled])`, `${ row } button.${ arrow === 'up' ? 'down' : 'up' }` );
	}

	drop( e: CdkDragDrop<unknown> ): void {
		this.move( e.previousIndex, e.currentIndex );
	}

	// Kopie direkt unter das Original; versteckte Unterfelder (interne IDs wie key) starten leer.
	copy( i: number ): void {
		const values = { ...this.array.at( i ).getRawValue() };
		for ( const sub of this.subs() )
			if ( sub.hide )
				delete values[ sub.id ];
		this.insertRow( i + 1, values );
	}

	remove( i: number ): void {
		this.array.removeAt( i );
		this.touched();
		const n = this.array.length;
		this.focusFirst( n ? `.row-item:nth-child(${ Math.min( i, n - 1 ) + 1 }) button.remove` : 'button.add' );
	}

	insertRow( at: number, values: Record<string, unknown> ): void {
		if ( !this.canAdd() )
			return;
		// Vorher berühren: das TouchedChangeEvent markiert alle Zeilen (ngAfterViewInit) - die neue soll nicht
		// dazugehören, sonst zeigt sie Pflichtfehler, bevor der Nutzer ihre Zellen erreicht.
		this.onTouched();
		this.array.insert( at, this.createRow( values ) );
		this.bump();
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
			const errors: ValidationErrors = { ...( base?.( c ) ?? {} ) };
			if ( this.duplicateSub() === sub.id && this.isDuplicate( row ) )
				errors[ 'duplicate' ] = true;
			const server = this.serverCells.get( c );
			if ( server && server.value === c.value )
				errors[ 'server' ] = true;
			return Object.keys( errors ).length ? errors : null;
		};
	}

	private applyServerErrors( errors: Record<string, string> | null ): void {
		this.serverCells.clear();
		const filled = this.filled();
		for ( const [ key, message ] of Object.entries( errors ?? {} ) ) {
			const match = /^(\d+)\.(.+)$/.exec( key );
			const display = match ? filled[ Number( match[ 1 ] ) ] : undefined;
			const cell = display === undefined ? null : this.array.at( display ).get( match![ 2 ] );
			if ( !cell )
				continue; // unbekannte Zeile/Spalte: ignorieren wie form-fields bei unbekannten IDs
			this.serverCells.set( cell, { message, value: cell.value } );
			cell.markAsTouched();
		}
		// ponytail: kein registerOnValidatorChange-Rückruf - das Neuprüfen des Controls würde den Feldfehler
		// "<feld>" löschen, den form-fields per setErrors gesetzt hat. Das Feld wird erst bei der nächsten Eingabe
		// ungültig; ein erneutes Absenden ohne Änderung liefert denselben 400.
		this.revalidate();
		this.bump();
	}

	serverMessage( cell: AbstractControl ): string {
		return this.serverCells.get( cell )?.message ?? '';
	}

	// Doppelt = eine frühere, nicht-leere Zeile hat denselben unique-Schlüssel.
	private isDuplicate( row: XiriRow ): boolean {
		const ids = this.field().unique ?? [];
		const key = uniqueKey( ids, row.getRawValue() );
		if ( key === null )
			return false;
		const subs = this.subs();
		const before = this.array.controls.slice( 0, this.array.controls.indexOf( row ) );
		return before.some( r => !isEmptyRow( subs, r.getRawValue() ) && uniqueKey( ids, r.getRawValue() ) === key );
	}

	// Nach jeder Änderung alle Zellen neu prüfen - ob eine Zeile leer ist (und ob sie doppelt ist), hängt
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

	// Nach dem nächsten Render das erste vorhandene Ziel fokussieren, in der Reihenfolge der Selektoren.
	private focusFirst( ...selectors: string[] ): void {
		afterNextRender( () => {
			const root = this.host.nativeElement;
			selectors.map( s => root.querySelector<HTMLElement>( s ) ).find( e => !!e )?.focus();
		}, { injector: this.injector } );
	}
}
