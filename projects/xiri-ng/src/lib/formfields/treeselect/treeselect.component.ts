import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	inject,
	Input,
	signal,
	viewChild
} from '@angular/core';
import { MatFormFieldControl } from "@angular/material/form-field";
import { ControlValueAccessor } from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import {
	MatTree,
	MatTreeNestedDataSource,
	MatTreeNode, MatTreeNodeDef,
	MatTreeNodePadding,
	MatTreeNodeToggle
} from "@angular/material/tree";
import { SelectionModel } from "@angular/cdk/collections";
import { XiriDataService } from "../../services/data.service";
import { XiriSnackbarService } from '../../services/snackbar.service';
import { XiriFormField } from "../field.interface";
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { XiriSearchComponent } from '../../search/search.component';
import { XiriFieldMain } from "../helper/fieldmain";


class XiriTreeselectTreeNode {
	children: XiriTreeselectTreeNode[];
	id: number;
	name: string;
	hidden: boolean;
	state: number;
	parent: XiriTreeselectTreeNode;
}

let nextUniqueIdXiriTreeselect = 0;

@Component( {
	            selector: 'xiri-treeselect',
	            templateUrl: './treeselect.component.html',
	            styleUrl: './treeselect.component.scss',
	            host: {
		            '[id]': 'id',
		            '(focus)': 'focus()',
	            },
	            changeDetection: ChangeDetectionStrategy.OnPush,
	            providers: [ {
		            provide: MatFormFieldControl,
		            useExisting: XiriTreeselectComponent
	            } ],
	            imports: [
		            XiriSearchComponent,
		            MatProgressSpinner,
		            MatTree,
		            MatTreeNode,
		            MatTreeNodeToggle,
		            MatTreeNodePadding,
		            MatIconButton,
		            MatCheckbox,
		            MatIcon,
		            MatTreeNodeDef,
	            ]
            } )
export class XiriTreeselectComponent extends XiriFieldMain implements ControlValueAccessor,
                                                                      MatFormFieldControl<number[] | undefined>,
                                                                      AfterViewInit {
	
	private dataService = inject( XiriDataService );
	private snackbar = inject( XiriSnackbarService );
	
	protected _uid = `xiri-treeselect-${ nextUniqueIdXiriTreeselect++ }`;
	
	public loading = signal<boolean>( true );
	private _field: XiriFormField;
	
	constructor() {
		super();

		this._id = this._uid;

		if ( this.ngControl != null )
			this.ngControl.valueAccessor = this;

		this.dataSource = new MatTreeNestedDataSource();
		this.dataSource.data = [];
	}
	
	public ngAfterViewInit(): void {
		
		this.subs.add( this.dataChange.subscribe( data => {
			
			if ( data === null )
				return;
			
			this.dataSource.data = data;
			// this.tree().expandAll();
			
			this._input.forEach( x => {
				this.dataSource.data.forEach( d => {
					const node = this.findNodeById( x, d );
					if ( node )
						this.treeItemSelectionToggle( node );
				} );
			} );
			
			this.loading.set( false );
		} ) );
	}
	
	@Input()
	set field( value: XiriFormField ) {
		
		this._field = value;
		
		this.required = !!value.required;
		this.disabled = !!value.disabled;
		
		if ( value.url ) {
			this.dataService.get( value.url ).subscribe(
				{
					next: ( data: any ) => {
						let groups: any[];
						if ( data.data === undefined || data.data === null || data.data.length === 0 )
							groups = [];
						else
							groups = [ data.data ];
						this.buildTree( groups, null );
						this.dataChange.next( groups );
						this._changeDetectorRef.markForCheck();
					},
					error: ( err ) => {
						console.log( 'error database-tree', err );
						this.snackbar.error( 'Unknown Error! Please try again later' );
						this._changeDetectorRef.markForCheck();
					}
				} )
		} else {
			let groups = value.list;
			if ( !groups || groups.length === 0 )
				groups = [];
			
			this.buildTree( groups, null );
			this.dataChange.next( <any> groups );
		}
		
		this.stateChanges.next();
	}
	
	get field(): XiriFormField {
		return this._field;
	}
	
	private buildTree( input: any, parent: XiriTreeselectTreeNode ) {
		for ( let i = 0; i != input.length; i++ ) {
			input[ i ].parent = parent;
			input[ i ].state = 0;
			if ( input[ i ].children ) {
				this.buildTree( input[ i ].children, input[ i ] );
			}
		}
	}
	
	@Input()
	get value(): number[] | undefined {
		
		const result = this.checklistSelection.selected.filter( x => x.state === 1 && !x.children ).map( x => x.id );
		if ( this.required && result.length == 0 )
			return this._disabled() ? null : undefined;
		
		return result;
	}
	
	private _input: number[] = [];
	
	set value( input: number[] | undefined ) {
		
		if ( input === null || input === undefined )
			input = [];
		
		this._input = input;
		this.startChangeValue();
	}
	
	private runCheck(): void {
		
		if ( !this.ngControl )
			return;
		
		const val = this.value;
		this.runChangeValue( val );
	}
	
	protected startChangeValue(): void {
		this.runChangeValue( this.value );
	}
	
	get empty() {
		return this.value === undefined || this.value.length === 0;
	}
	
	writeValue( value: number[] ): void {
		this.value = value;
	}
	
	/**
	 * Tree
	 */
	public tree = viewChild.required<MatTree<XiriTreeselectTreeNode>>( MatTree );
	private dataChange = new BehaviorSubject<XiriTreeselectTreeNode[]>( null );
	public dataSource: MatTreeNestedDataSource<XiriTreeselectTreeNode>;
	private checklistSelection = new SelectionModel<XiriTreeselectTreeNode>( true /* multiple */ );
	
	getChildren = ( node: XiriTreeselectTreeNode ): XiriTreeselectTreeNode[] => node.children;
	
	hasChild = ( _: number, node: XiriTreeselectTreeNode ) => !!node.children && node.children.length != 0;
	
	treeItemSelectionToggle( node: XiriTreeselectTreeNode ): void {
		
		this.checklistSelection.toggle( node );
		const state = this.checklistSelection.isSelected( node );
		
		node.state = state ? 1 : 0;
		if ( node.children ) {
			for ( let i = 0; i != node.children.length; i++ ) {
				this.treeItemSelectionChildren( node.children[ i ], state );
			}
		}
		
		if ( node.parent )
			this.treeItemSelectionParent( node.parent );
		
		this.runCheck();
	}
	
	private treeItemSelectionParent( node: XiriTreeselectTreeNode ): void {
		
		const result0 = node.children.filter( child => child.state === 0 );
		const result1 = node.children.filter( child => child.state === 1 );
		
		if ( result1.length === node.children.length ) {
			this.checklistSelection.select( node );
			node.state = 1;
		} else if ( result0.length === node.children.length ) {
			this.checklistSelection.deselect( node );
			node.state = 0;
		} else {
			this.checklistSelection.deselect( node );
			node.state = 2;
		}
		
		if ( node.parent )
			this.treeItemSelectionParent( node.parent );
	}
	
	private treeItemSelectionChildren( node: XiriTreeselectTreeNode, state: boolean ): void {
		
		if ( state )
			this.checklistSelection.select( node );
		else
			this.checklistSelection.deselect( node );
		
		node.state = state ? 1 : 0;
		
		if ( node.children ) {
			for ( let i = 0; i != node.children.length; i++ ) {
				this.treeItemSelectionChildren( node.children[ i ], state );
			}
		}
	}
	
	public searchDo( value: string ) {
		
		if ( value && value.length )
			this.dataSource.data.forEach( x => this.filterByName( x, value.toLowerCase(), false ) );
		else
			this.dataSource.data.forEach( x => this.filterClear( x ) );
	}
	
	private filterByName( node: XiriTreeselectTreeNode, search: string, value: boolean ): boolean {
		
		if ( value ) {
			node.hidden = false;
			if ( node.children ) {
				node.children.forEach( x => this.filterByName( x, search, true ) );
				
				if ( search.length > 3 )
					this.tree().expand( node );
			}
			return true;
		}
		
		if ( node.name.toLowerCase().indexOf( search ) === -1 ) {
			node.hidden = true;
			if ( node.children ) {
				const ret = node.children.filter( x => this.filterByName( x, search, false ) );
				if ( ret.length ) {
					this.tree().expand( node );
					node.hidden = false
				}
			}
			return !node.hidden;
		} else {
			node.hidden = false;
			if ( node.children ) {
				node.children.forEach( x => this.filterByName( x, search, true ) );
				
				if ( search.length > 3 )
					this.tree().expand( node );
			}
			return true;
		}
	}
	
	private filterClear( node: XiriTreeselectTreeNode ): void {
		
		node.hidden = false;
		if ( node.children ) {
			node.children.forEach( x => this.filterClear( x ) );
		}
	}
	
	private findNodeById( id: any, node: XiriTreeselectTreeNode ): XiriTreeselectTreeNode {
		
		if ( node.id == id )
			return node;
		
		if ( node.children ) {
			for ( let i = 0; i != node.children.length; i++ ) {
				const result = this.findNodeById( id, node.children[ i ] );
				if ( result )
					return result;
			}
		}
		
		return null;
	}
}
