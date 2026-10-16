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

// Antwort der Chat-Endpunkte; cursor ist undurchsichtig und wird nur zurückgeschickt.
export interface XiriChatPage {
	messages?: XiriChatMessage[];
	cursor?: string;
	hasOlder?: boolean;
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
