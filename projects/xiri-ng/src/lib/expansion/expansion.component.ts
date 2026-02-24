import { ChangeDetectionStrategy, Component, input, signal, TemplateRef } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { NgTemplateOutlet } from '@angular/common';
import { XiriDynData } from '../dyncomponent/dyndata.interface';

export interface XiriExpansionPanelSettings {
	title: string
	description?: string
	icon?: string
	disabled?: boolean
	expanded?: boolean
	data: XiriDynData[]
	lazy?: boolean
	unload?: boolean
}

export interface XiriExpansionSettings {
	panels: XiriExpansionPanelSettings[]
	multi?: boolean
	displayMode?: 'default' | 'flat'
	togglePosition?: 'before' | 'after'
	hideToggle?: boolean
	lazy?: boolean
	unload?: boolean
}

@Component( {
	            selector: 'xiri-expansion',
	            templateUrl: './expansion.component.html',
	            styleUrl: './expansion.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [
		            MatAccordion,
		            MatExpansionPanel,
		            MatExpansionPanelHeader,
		            MatExpansionPanelTitle,
		            MatExpansionPanelDescription,
		            MatIcon,
		            NgTemplateOutlet
	            ]
            } )
export class XiriExpansionComponent {

	settings = input.required<XiriExpansionSettings>();
	filterData = input<any>( undefined );
	dyncomponent = input<TemplateRef<any>>();

	openedPanels = signal<Set<number>>( new Set() );
	visitedPanels = signal<Set<number>>( new Set() );

	onPanelOpened( index: number ): void {
		this.openedPanels.update( set => {
			const newSet = new Set( set );
			newSet.add( index );
			return newSet;
		} );
		this.visitedPanels.update( set => {
			const newSet = new Set( set );
			newSet.add( index );
			return newSet;
		} );
	}

	onPanelClosed( index: number ): void {
		this.openedPanels.update( set => {
			const newSet = new Set( set );
			newSet.delete( index );
			return newSet;
		} );
	}

	shouldRenderContent( index: number, panel: XiriExpansionPanelSettings ): boolean {
		const globalUnload = this.settings().unload ?? false;
		const panelUnload = panel.unload ?? globalUnload;

		if ( panelUnload )
			return this.openedPanels().has( index );

		const globalLazy = this.settings().lazy ?? false;
		const panelLazy = panel.lazy ?? globalLazy;

		if ( !panelLazy ) return true;
		return this.visitedPanels().has( index );
	}
}
