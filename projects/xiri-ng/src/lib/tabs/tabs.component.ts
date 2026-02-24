import { ChangeDetectionStrategy, Component, effect, input, signal, TemplateRef } from '@angular/core';
import { MatTabGroup, MatTab, MatTabLabel } from '@angular/material/tabs';
import { MatIcon } from '@angular/material/icon';
import { NgTemplateOutlet } from '@angular/common';
import { XiriDynData } from '../dyncomponent/dyndata.interface';

export interface XiriTabSettings {
	label: string
	icon?: string
	disabled?: boolean
	data: XiriDynData[]
	lazy?: boolean
	unload?: boolean
}

export interface XiriTabsSettings {
	tabs: XiriTabSettings[]
	selectedIndex?: number
	dynamicHeight?: boolean
	animationDuration?: string
	lazy?: boolean
	unload?: boolean
	headerPosition?: 'above' | 'below'
	alignTabs?: 'start' | 'center' | 'end'
	stretchTabs?: boolean
}

@Component( {
	            selector: 'xiri-tabs',
	            templateUrl: './tabs.component.html',
	            styleUrl: './tabs.component.scss',
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            imports: [
		            MatTabGroup,
		            MatTab,
		            MatTabLabel,
		            MatIcon,
		            NgTemplateOutlet
	            ]
            } )
export class XiriTabsComponent {
	
	settings = input.required<XiriTabsSettings>();
	filterData = input<any>( undefined );
	dyncomponent = input<TemplateRef<any>>();
	
	selectedIndex = signal( 0 );
	visitedTabs = signal<Set<number>>( new Set( [ 0 ] ) );
	
	constructor() {
		effect( () => {
			const idx = this.settings().selectedIndex ?? 0;
			this.selectedIndex.set( idx );
			this.visitedTabs.update( set => {
				const newSet = new Set( set );
				newSet.add( idx );
				return newSet;
			} );
		} );
	}
	
	onTabChange( index: number ): void {
		this.selectedIndex.set( index );
		this.visitedTabs.update( set => {
			const newSet = new Set( set );
			newSet.add( index );
			return newSet;
		} );
	}
	
	shouldRenderContent( index: number, tab: XiriTabSettings ): boolean {
		const globalUnload = this.settings().unload ?? false;
		const tabUnload = tab.unload ?? globalUnload;

		if ( tabUnload )
			return this.selectedIndex() === index;

		const globalLazy = this.settings().lazy ?? false;
		const tabLazy = tab.lazy ?? globalLazy;

		if ( !tabLazy ) return true;
		return this.visitedTabs().has( index );
	}
}
