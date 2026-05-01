import { ChangeDetectionStrategy, Component, computed, input, TemplateRef } from '@angular/core';
import { XiriDynData } from "./dyndata.interface";
import { SafehtmlPipe } from '../pipes/safehtml.pipe';
import { XiriImagetextComponent } from '../imagetext/imagetext.component';
import { XiriMultiprogressComponent } from '../multiprogress/multiprogress.component';
import { XiriInfopointComponent } from '../infopoint/infopoint.component';
import { XiriListComponent } from '../list/list.component';
import { XiriHeaderComponent } from '../header/header.component';
import { XiriStepperComponent } from '../stepper/stepper.component';
import { XiriQueryComponent } from '../query/query.component';
import { XiriFormComponent } from '../form/form.component';
import { NgTemplateOutlet } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { XiriLinksComponent } from '../links/links.component';
import { XiriCardlinkComponent } from '../cardlink/cardlink.component';
import { XiriTableComponent } from '../table/table.component';
import { XiriButtonlineComponent } from '../buttonline/buttonline.component';
import { XiriCardComponent } from '../card/card.component';
import { XiriTabsComponent } from '../tabs/tabs.component';
import { XiriExpansionComponent } from '../expansion/expansion.component';
import { XiriStatComponent } from '../stat/stat.component';
import { XiriEmptyStateComponent } from '../empty-state/empty-state.component';
import { XiriTimelineComponent } from '../timeline/timeline.component';
import { XiriPageHeaderComponent } from '../page-header/page-header.component';
import { XiriSectionComponent } from '../section/section.component';
import { XiriDividerComponent } from '../divider/divider.component';
import { XiriStatGridComponent } from '../stat-grid/stat-grid.component';
import { XiriToolbarComponent } from '../toolbar/toolbar.component';
import { XiriDescriptionListComponent } from '../description-list/description-list.component';
import { XiriBarChartComponent } from '../barchart/barchart.component';


@Component( {
	            selector: 'xiri-dyncomponent',
	            templateUrl: './dyncomponent.component.html',
	            styleUrl: './dyncomponent.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [ XiriCardComponent,
	                       XiriButtonlineComponent,
	                       XiriTableComponent,
	                       XiriCardlinkComponent,
	                       XiriLinksComponent,
	                       MatCard,
	                       MatCardHeader,
	                       MatCardTitle,
	                       MatCardContent,
	                       XiriFormComponent,
	                       XiriQueryComponent,
	                       XiriStepperComponent,
	                       XiriHeaderComponent,
	                       XiriListComponent,
	                       XiriInfopointComponent,
	                       XiriMultiprogressComponent,
	                       XiriImagetextComponent,
	                       NgTemplateOutlet,
	                       SafehtmlPipe,
	                       XiriTabsComponent,
	                       XiriExpansionComponent,
	                       XiriStatComponent,
	                       XiriEmptyStateComponent,
	                       XiriTimelineComponent,
	                       XiriPageHeaderComponent,
	                       XiriSectionComponent,
	                       XiriDividerComponent,
	                       XiriStatGridComponent,
	                       XiriToolbarComponent,
	                       XiriDescriptionListComponent,
	                       XiriBarChartComponent ]
            } )
export class XiriDynComponentComponent {
	
	data = input.required<XiriDynData[]>();
	filterData = input<any>( undefined );
	dyncomponent = input<TemplateRef<any>>();
	
	dataInt = computed( () => {
		
		let data = this.data();
		
		if ( data === undefined || data === null )
			return [];
		if ( !Array.isArray( data ) )
			data = [ data ];
		
		return data.map( ( d: XiriDynData ) => {
			
			if ( d.id === undefined )
				d.id = Math.floor( Math.random() * 1000000 );
			
			return d;
		} );
	} );
}
