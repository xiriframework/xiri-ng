import { Component, input, signal, TemplateRef } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { NgTemplateOutlet } from '@angular/common';
import { XiriDynData } from '../dyncomponent/dyndata.interface';
import { XiriButtonlineComponent, XiriButtonlineSettings } from '../buttonline/buttonline.component';

export interface XiriExpansionPanelSettings {
	title: string
	description?: string
	icon?: string
	disabled?: boolean
	expanded?: boolean
	data: XiriDynData[]
	buttons?: XiriButtonlineSettings
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
	            imports: [
		            MatAccordion,
		            MatExpansionPanel,
		            MatExpansionPanelHeader,
		            MatExpansionPanelTitle,
		            MatExpansionPanelDescription,
		            MatIcon,
		            NgTemplateOutlet, XiriButtonlineComponent ]
            } )
export class XiriExpansionComponent {

	settings = input.required<XiriExpansionSettings>();
	filterData = input<Record<string, unknown> | null | undefined>( undefined );
	dyncomponent = input<TemplateRef<unknown>>();

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

	// Eine flache Card/Table bringt Rahmen und Innenabstand selbst mit; das Panel halbiert dann
	// seinen Seitenabstand links/rechts (siehe .flat-content im SCSS).
	hasFlatContent( panel: XiriExpansionPanelSettings ): boolean {
		return panel.data?.some( d => d.type === 'card'
			? !!( d.data as { flat?: boolean } | undefined )?.flat
			: d.type === 'table' && !!( d.data as { options?: { flat?: boolean } } | undefined )?.options?.flat ) ?? false;
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
