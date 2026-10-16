import {
	afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, Injector, input, OnInit, signal, viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { XiriDataService } from '../services/data.service';
import { XiriLocaleService } from '../services/locale.service';
import { buildChatRows } from './chat-rows';
import { XiriChatMessage, XiriChatPage, XiriChatSettings, XiriChatStatus } from './chat.types';

const STATUS_ICON: Record<XiriChatStatus, string> = {
	sending: 'schedule', sent: 'done', delivered: 'done_all', read: 'done_all', failed: 'error',
};

// Abstand zum unteren Rand, bis zu dem der Nutzer noch als "unten" gilt.
const BOTTOM_THRESHOLD = 40;

// 'initial' übernimmt cursor und hasOlder, 'update' (Poll/SSE) nur cursor, 'older' nur hasOlder.
type PageKind = 'initial' | 'update' | 'older';

export function chatQuery( url: string, key: string, value: string ): string {
	return url + ( url.includes( '?' ) ? '&' : '?' ) + key + '=' + encodeURIComponent( value );
}

@Component( {
	            selector: 'xiri-chat',
	            templateUrl: './chat.component.html',
	            styleUrl: './chat.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ CdkTextareaAutosize, MatButton, MatIconButton, MatIcon ]
            } )
export class XiriChatComponent implements OnInit {

	settings = input.required<XiriChatSettings>();

	protected readonly data = inject( XiriDataService );
	protected readonly locale = inject( XiriLocaleService );
	protected readonly destroyRef = inject( DestroyRef );
	protected readonly injector = inject( Injector );
	protected readonly scroller = viewChild.required<ElementRef<HTMLElement>>( 'scroller' );

	protected readonly statusIcon = STATUS_ICON;
	protected readonly labels = computed( () => this.locale.chatLabels() );
	protected readonly byId = signal( new Map<string, XiriChatMessage>() );
	// ponytail: "heute" wird nur bei neuen Nachrichten neu berechnet, nicht um Mitternacht.
	protected readonly rows = computed( () =>
		buildChatRows( [ ...this.byId().values() ], Math.floor( Date.now() / 1000 ), this.locale, this.labels() ) );
	protected readonly hasOlder = signal( false );
	protected readonly unseen = signal( false );
	protected readonly draft = signal( '' );
	// true nach dem ersten Scroll nach unten; erst dann darf der Wächter oben nachladen.
	protected readonly ready = signal( false );
	protected cursor = '';

	ngOnInit(): void {
		const s = this.settings();
		if ( s.messages )
			this.applyPage( s, 'initial' );
		else
			this.data.get( s.url ).pipe( takeUntilDestroyed( this.destroyRef ) )
				.subscribe( res => this.applyPage( res as XiriChatPage, 'initial' ) );
	}

	protected submit(): void {
		const text = this.draft().trim();
		if ( !text )
			return;
		this.draft.set( '' );
		this.post( text, 'c-' + Date.now().toString( 36 ) + Math.random().toString( 36 ).slice( 2, 8 ) );
	}

	protected retry( msg: XiriChatMessage ): void {
		this.post( msg.text, msg.clientId ?? msg.id );
	}

	protected onKeydown( event: KeyboardEvent ): void {
		if ( event.key === 'Enter' && !event.shiftKey && !event.isComposing ) {
			event.preventDefault();
			this.submit();
		}
	}

	protected onInput( event: Event ): void {
		this.draft.set( ( event.target as HTMLTextAreaElement ).value );
	}

	protected onScroll(): void {
		if ( this.isAtBottom() )
			this.unseen.set( false );
	}

	protected scrollToBottom(): void {
		this.unseen.set( false );
		afterNextRender( {
			write: () => {
				const el = this.scroller().nativeElement;
				el.scrollTop = el.scrollHeight;
				this.ready.set( true );
			}
		}, { injector: this.injector } );
	}

	protected applyPage( page: XiriChatPage, kind: PageKind ): void {
		const atBottom = kind === 'initial' || this.isAtBottom();
		const before = this.byId().size;
		this.upsert( page.messages ?? [] );
		if ( kind !== 'older' && page.cursor !== undefined )
			this.cursor = page.cursor;
		if ( kind !== 'update' && page.hasOlder !== undefined )
			this.hasOlder.set( page.hasOlder );
		if ( kind === 'older' )
			return;
		if ( atBottom )
			this.scrollToBottom();
		else if ( this.byId().size > before )
			this.unseen.set( true );
	}

	protected upsert( messages: XiriChatMessage[] ): void {
		if ( !messages.length )
			return;
		this.byId.update( old => {
			const next = new Map( old );
			for ( const msg of messages ) {
				// Die Server-Nachricht ersetzt die optimistische, die unter ihrer clientId steht.
				if ( msg.clientId && msg.clientId !== msg.id )
					next.delete( msg.clientId );
				next.set( msg.id, msg );
			}
			return next;
		} );
	}

	protected isAtBottom(): boolean {
		const el = this.scroller().nativeElement;
		return el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
	}

	private post( text: string, clientId: string ): void {
		this.upsert( [ { id: clientId, clientId, text, time: Math.floor( Date.now() / 1000 ), own: true, status: 'sending' } ] );
		this.scrollToBottom();
		this.data.post( this.settings().url, { text, clientId } ).subscribe( {
			next: res => {
				const msg = ( res as { message?: XiriChatMessage } | null )?.message;
				if ( msg )
					this.upsert( [ { ...msg, clientId } ] );
				else
					this.setStatus( clientId, 'sent' );
			},
			error: () => this.setStatus( clientId, 'failed' ),
		} );
	}

	private setStatus( id: string, status: XiriChatStatus ): void {
		const msg = this.byId().get( id );
		if ( msg )
			this.upsert( [ { ...msg, status } ] );
	}
}
