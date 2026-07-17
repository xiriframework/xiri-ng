import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriStatusComponent, XiriStatusSettings } from 'projects/xiri-ng/src/lib/status/status.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';

@Component( {
	            selector:    'app-status',
	            templateUrl: './status.component.html',
	            imports:     [
		            XiriPageHeaderComponent,
		            XiriSectionComponent,
		            XiriStatusComponent,
		            XiriBreadcrumbComponent,
		            GoCodePanelComponent
	            ]
            } )
export class StatusComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Data Display' },
		{ label: 'Status' }
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title:     'Status',
		subtitle:  'Status-Anzeige als Badge, Punkt oder Text. Das Label ist immer sichtbar, Farbe und Icon sind nur redundant.',
		icon:      'toggle_on',
		iconColor: 'primary'
	};

	sectionBadge: XiriSectionSettings = {
		title:     'Badge',
		subtitle:  'Getönte Pille über alle Tones (neutral, info, success, warning, error).',
		icon:      'label',
		iconColor: 'accent'
	};

	sectionDot: XiriSectionSettings = {
		title:     'Dot',
		subtitle:  'Farbiger Punkt neben dem Label. Der Punkt ist rein visuell, das Label bleibt lesbar.',
		icon:      'circle',
		iconColor: 'primary'
	};

	sectionText: XiriSectionSettings = {
		title:     'Text',
		subtitle:  'Reine Text-Variante, optional mit redundantem Icon und Tooltip-Hinweis.',
		icon:      'text_fields',
		iconColor: 'accent'
	};

	// --- Badge ---
	badges: XiriStatusSettings[] = [
		{ label: 'Neutral', tone: 'neutral' },
		{ label: 'Info', tone: 'info', icon: 'info' },
		{ label: 'Online', tone: 'success', icon: 'check_circle' },
		{ label: 'Delayed', tone: 'warning', icon: 'schedule', hint: 'Since 5 minutes' },
		{ label: 'Offline', tone: 'error', icon: 'error' }
	];

	// --- Dot ---
	dots: XiriStatusSettings[] = [
		{ label: 'Idle', tone: 'neutral', variant: 'dot' },
		{ label: 'Syncing', tone: 'info', variant: 'dot' },
		{ label: 'Running', tone: 'success', variant: 'dot' },
		{ label: 'Warning', tone: 'warning', variant: 'dot' },
		{ label: 'Failed', tone: 'error', variant: 'dot', hint: 'Last run failed' }
	];

	// --- Text ---
	texts: XiriStatusSettings[] = [
		{ label: 'Draft', tone: 'neutral', variant: 'text' },
		{ label: 'Reviewed', tone: 'info', variant: 'text', icon: 'visibility' },
		{ label: 'Approved', tone: 'success', variant: 'text', icon: 'done' },
		{ label: 'Blocked', tone: 'error', variant: 'text', icon: 'block', hint: 'Waiting for approval' }
	];

	goBadgeCode = `status.New("Online").
    Tone(status.ToneSuccess).
    Variant(status.VariantBadge).
    Icon("check_circle")

status.New("Delayed").
    Tone(status.ToneWarning).
    Icon("schedule").
    Hint("Since 5 minutes")`;

	goDotCode = `status.New("Running").
    Tone(status.ToneSuccess).
    Variant(status.VariantDot)

status.New("Failed").
    Tone(status.ToneError).
    Variant(status.VariantDot).
    Hint("Last run failed")`;

	goTextCode = `status.New("Approved").
    Tone(status.ToneSuccess).
    Variant(status.VariantText).
    Icon("done")

status.New("Blocked").
    Tone(status.ToneError).
    Variant(status.VariantText).
    Icon("block").
    AriaLabel("Blocked, waiting for approval")`;
}
