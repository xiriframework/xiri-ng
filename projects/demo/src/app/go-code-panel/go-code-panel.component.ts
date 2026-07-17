import { Component, input } from '@angular/core';

@Component({
    selector: 'app-go-code',
    templateUrl: './go-code-panel.component.html',
    styleUrl: './go-code-panel.component.scss',
})
export class GoCodePanelComponent {
    code  = input.required<string>();
    title = input<string>('Go');
    // Ausnahme-Override: einzelne Panels können offen starten. Default eingeklappt.
    expanded = input<boolean>(false);
}
