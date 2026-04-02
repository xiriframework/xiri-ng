import {
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	effect,
	ElementRef,
	inject,
	input,
	OnInit,
	output,
	viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { FormsModule } from '@angular/forms';

@Component( {
	            selector: 'xiri-search',
	            templateUrl: './search.component.html',
	            styleUrls: [ './search.component.scss' ],
	            host: {
		            '(document:keydown.escape)': 'onKeydownHandler()'
	            },
	            imports: [
		            FormsModule,
		            CdkTrapFocus,
		            MatIconButton,
		            MatIcon,
	            ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class XiriSearchComponent implements OnInit {

	changed = output<string>();
	placeholder = input<string>( '' );

	open = input<boolean>( false );
	reset = input<number>( -1 );
	escape = input<boolean>( true );
	focus = input<number>( -1 );

	private _search = viewChild<ElementRef>( 'search' );
	private destroyRef = inject( DestroyRef );
	private filter: Subject<string> = new Subject<string>();
	
	public _text: string = '';
	public show: boolean = false;
	
	constructor() {
		
		effect( () => {
			let num = this.reset();
			if ( num != -1 ) {
				this.show = this.open();
				this._text = '';
				this.filter.next( this._text );
			}
		} );
		effect( () => {
			let num = this.focus();
			if ( num != -1 ) {
				this.show = true;
				this._search()?.nativeElement.focus();
			}
		} );
		effect( () => {
			const value = this.text();
			if ( value ) {
				this._text = value;
				this.show = true;
			}
		} );
	}
	
	ngOnInit(): void {
		this.filter.pipe( debounceTime( 200 ), distinctUntilChanged(), takeUntilDestroyed( this.destroyRef ) )
			.subscribe( value => {
				this.changed.emit( value );
			} );
		
		if ( this.open() )
			this.show = true;
	}
	
	onKeydownHandler() {
		
		if ( this.escape() && this.show ) {
			this.show = this.open() ? true : !this.show;
			this._text = '';
			this.filter.next( this._text );
		}
	}
	
	text = input<string>( '' );
	
	searchDo() {
		this.filter.next( this._text );
	}

	click(): void {
		this.show = this.open() ? true : !this.show;
		this._text = '';
		
		this.filter.next( this._text );
	}
	
}
