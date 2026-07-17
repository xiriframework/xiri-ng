import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriCalloutComponent, XiriCalloutSettings } from 'projects/xiri-ng/src/lib/callout/callout.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';

@Component( {
	            selector: 'app-callout',
	            templateUrl: './callout.component.html',
	            imports: [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriCalloutComponent,
		            XiriBreadcrumbComponent,
		            GoCodePanelComponent
	            ]
	            } )
export class CalloutComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Feedback & Status' },
		{ label: 'Callout' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Callout',
		subtitle: 'Dauerhafter, nicht-modaler Hinweis im Seitenfluss',
		icon: 'campaign',
		iconColor: 'primary',
	};

	sectionTones: XiriSectionSettings = {
		title: 'Tones',
		subtitle: 'Vier Tonalitäten: info, success, warning, error.',
		icon: 'palette',
		iconColor: 'accent',
	};

	sectionVariants: XiriSectionSettings = {
		title: 'Titel, Icon, Actions & Dismiss',
		subtitle: 'Mit/ohne Titel und Icon, mit Action-Buttons, schließbar und kompakt.',
		icon: 'tune',
		iconColor: 'primary',
	};

	info: XiriCalloutSettings = {
		tone: 'info',
		icon: 'info',
		text: 'Diese Funktion befindet sich in der Beta-Phase.',
	};

	success: XiriCalloutSettings = {
		tone: 'success',
		icon: 'check_circle',
		title: 'Gespeichert',
		text: 'Deine Änderungen wurden übernommen.',
	};

	warning: XiriCalloutSettings = {
		tone: 'warning',
		icon: 'warning',
		title: 'Achtung',
		text: 'Dein Abonnement läuft in 3 Tagen aus.',
	};

	error: XiriCalloutSettings = {
		tone: 'error',
		icon: 'error',
		title: 'Verbindung fehlgeschlagen',
		text: 'Die Daten konnten nicht geladen werden. Bitte versuche es erneut.',
	};

	plain: XiriCalloutSettings = {
		tone: 'info',
		text: 'Ein schlichter Hinweis ganz ohne Titel und Icon.',
	};

	withActions: XiriCalloutSettings = {
		tone: 'warning',
		icon: 'system_update',
		title: 'Update verfügbar',
		text: 'Eine neue Version steht bereit. Lade die Seite neu, um sie zu verwenden.',
		actions: [
			{ text: 'Neu laden', type: 'stroked', action: 'link', url: '/Overview', color: 'primary' },
			{ text: 'Details', type: 'basic', action: 'dialog', url: '', icon: 'info' }
		]
	};

	dismissible: XiriCalloutSettings = {
		tone: 'info',
		icon: 'lightbulb',
		title: 'Tipp',
		text: 'Diesen Hinweis kannst du über das X rechts schließen.',
		dismissible: true,
	};

	compact: XiriCalloutSettings = {
		tone: 'success',
		icon: 'done',
		text: 'Kompakte Variante mit weniger Innenabstand.',
		compact: true,
	};

	goCode = `c := callout.New("warning", "Eine neue Version steht bereit. Lade die Seite neu.").
    Title("Update verfügbar").
    Icon("system_update").
    Dismissible().
    AddAction(
        button.NewSimpleLinkButton("Neu laden", url.NewUrl("/Overview"), core.ColorPrimary),
    )`;
}
