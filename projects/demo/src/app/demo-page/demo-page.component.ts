import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';

// The one place that knows the outer page structure of a client app's dynpage.
@Component( {
	            selector: 'app-demo-page',
	            template: `
		            <div class="xcontainer-fluid">
			            <div class="xrow">
				            @if (bread()) {
					            <div class="xcol bread"><xiri-breadcrumb [settings]="bread()!"></xiri-breadcrumb></div>
				            }
				            <div class="xcol"><ng-content></ng-content></div>
			            </div>
		            </div>
	            `,
	            imports: [ XiriBreadcrumbComponent ],
	            changeDetection: ChangeDetectionStrategy.OnPush
            } )
export class DemoPageComponent {
	bread = input<XiriBreadcrumbItem[] | null>( null );
}
