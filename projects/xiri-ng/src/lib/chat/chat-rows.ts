import { format } from 'date-fns';
import { XiriChatLabels, XiriLocaleService } from '../services/locale.service';
import { XiriChatMessage } from './chat.types';

export interface XiriChatDayRow { kind: 'day'; key: string; label: string }
export interface XiriChatMsgRow { kind: 'msg'; key: string; msg: XiriChatMessage; time: string; showFrom: boolean; initials: string }
export type XiriChatRow = XiriChatDayRow | XiriChatMsgRow;

// Sortiert stabil nach Zeit (Gleichstand = Eingangsreihenfolge) und streut Datums-Trenner ein.
// ponytail: "gestern" = now - 24 h; am Tag der Zeitumstellung kann das in der ersten Stunde danebenliegen.
export function buildChatRows(
	messages: XiriChatMessage[], now: number, locale: XiriLocaleService, labels: XiriChatLabels,
): XiriChatRow[] {
	const dayKey = ( t: number ) => format( locale.unixToLocal( t )!, 'yyyy-MM-dd' );
	const today = dayKey( now );
	const yesterday = dayKey( now - 86400 );
	const rows: XiriChatRow[] = [];
	let prevDay = '';
	let prev: XiriChatMessage | undefined;
	for ( const msg of [ ...messages ].sort( ( a, b ) => a.time - b.time ) ) {
		const date = locale.unixToLocal( msg.time )!;
		const day = dayKey( msg.time );
		if ( day !== prevDay ) {
			const label = day === today ? labels.today
				: day === yesterday ? labels.yesterday
					: format( date, 'PPP', { locale: locale.dateFnsLocale() } );
			rows.push( { kind: 'day', key: 'd:' + day, label } );
			prevDay = day;
			prev = undefined;
		}
		const showFrom = !msg.own && ( !prev || !!prev.own || prev.from !== msg.from );
		rows.push( { kind: 'msg', key: 'm:' + msg.id, msg, time: format( date, 'HH:mm' ), showFrom, initials: chatInitials( msg.from ) } );
		prev = msg;
	}
	return rows;
}

export function chatInitials( name?: string ): string {
	return ( name ?? '' ).trim().split( /\s+/ ).filter( Boolean ).slice( 0, 2 )
		.map( w => Array.from( w )[ 0 ].toUpperCase() ).join( '' );
}
