import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { XiriChatComponent } from 'projects/xiri-ng/src/lib/chat/chat.component';
import { XiriChatSettings } from 'projects/xiri-ng/src/lib/chat/chat.types';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';
import { DemoPageComponent } from '../demo-page/demo-page.component';

@Component( {
	            selector: 'app-chat',
	            templateUrl: './chat.component.html',
	            imports: [ DemoPageComponent, XiriPageHeaderComponent, XiriSectionComponent, XiriChatComponent, GoCodePanelComponent ]
            } )
export class ChatComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Data Display' },
		{ label: 'Chat' },
	];

	pageHeader: XiriPageHeaderSettings = {
		title: 'Chat',
		subtitle: 'Nachrichtenverlauf mit Eingabe, aktualisiert per Polling oder SSE',
		icon: 'chat',
		iconColor: 'primary',
	};

	section: XiriSectionSettings = {
		title: 'Unterhaltung',
		subtitle: 'Anna antwortet auf jede Nachricht, eigene Nachrichten wechseln auf zugestellt und gelesen. '
			+ 'Bis zur Antwort zeigt die Zeile über der Eingabe „Anna schreibt …“ mit mitlaufender Dauer. '
			+ 'Hochscrollen lädt ältere Nachrichten. Die Demo pollt alle 2 s; SSE läuft am Mock-Backend vorbei.',
		icon: 'forum',
	};

	chat: XiriChatSettings = { url: 'Demo/Chat', poll: 2, placeholder: 'Nachricht schreiben', maxLength: 2000, height: '60vh' };

	goCode = `c := chat.New("Ticket/42/Chat").
    WithPoll(2).               // oder WithStream("Ticket/42/Chat/Stream")
    WithPlaceholder("Nachricht schreiben").
    WithMaxLength(2000).
    WithHeight("60vh")

// GET: Startseite, ?cursor= (Änderungen), ?before=<id> (ältere)
p := chat.NewPage(cursor).HasOlder(more)
p.Add("m-1", "Hallo zusammen!", t).From("Anna Berger")
p.Add("m-2", "Hi!", t2).Own().Status(chat.Read)
if typing {                                // jede Seite neu; ohne Aufruf ausgeblendet
    p.Activity("Anna schreibt …", typingSince)
}
return ec.JSON(200, p.Print())

// POST
in, err := chat.ParseSend(ec.Request().Body, 2000)`;
}
