// Zustellstatus einer eigenen Nachricht; 'sending' und 'failed' vergibt nur der Client.
export type XiriChatStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface XiriChatMessage {
	id: string;
	text: string;
	// Unix-Sekunden, angezeigt in der Zeitzone des XiriLocaleService.
	time: number;
	own?: boolean;
	from?: string;
	avatar?: string;
	status?: XiriChatStatus;
	// clientId des Sende-Requests: ersetzt die optimistische Nachricht.
	clientId?: string;
}

// Die Gegenseite arbeitet gerade (z. B. "Agent arbeitet … (Bash)"); since = Unix-Sekunden, der Client zeigt die Dauer.
export interface XiriChatActivity {
	text: string;
	since?: number;
}

// Antwort der Chat-Endpunkte; cursor ist undurchsichtig und wird nur zurückgeschickt.
// activity: jede Startseite und jedes Update ersetzt den Stand, fehlend/null blendet aus; ältere Seiten ignorieren es.
export interface XiriChatPage {
	messages?: XiriChatMessage[];
	cursor?: string;
	hasOlder?: boolean;
	activity?: XiriChatActivity | null;
}

export interface XiriChatSettings extends XiriChatPage {
	url: string;
	stream?: string;
	poll?: number;
	placeholder?: string;
	maxLength?: number;
	readonly?: boolean;
	height?: string;
}
