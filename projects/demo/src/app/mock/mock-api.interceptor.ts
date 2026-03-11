import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';

export const mockApiInterceptor: HttpInterceptorFn = ( req, next ) => {

	// Only intercept API calls
	if ( !req.url.includes( '/api/' ) ) {
		return next( req );
	}

	// Stepper API
	if ( req.url.includes( 'Test/Stepper/Step' ) ) {
		return of( new HttpResponse( { status: 200, body: getStepperResponse( req.body ) } ) );
	}

	// Search Select API
	if ( req.url.includes( 'Test/Search/Select' ) ) {
		return of( new HttpResponse( { status: 200, body: getSearchSelectResponse( req.body ) } ) );
	}

	// Wait API (simulates delay)
	if ( req.url.includes( 'Test/Wait/Wait' ) ) {
		return of( new HttpResponse( { status: 200, body: [] } ) ).pipe( delay( 2000 ) );
	}

	// Tabs2 Table APIs
	if ( req.url.includes( '/api/tabs2/' ) ) {
		const type = req.url.split( '/api/tabs2/' )[ 1 ];
		return of( new HttpResponse( { status: 200, body: getTableResponse( type, req.body ) } ) );
	}

	// DynPage routes
	if ( req.url.includes( 'Home/Login/Test' ) ) {
		return of( new HttpResponse( { status: 200, body: getLoginTestPage() } ) );
	}

	if ( req.url.includes( 'Test/Test/Dialogs' ) ) {
		return of( new HttpResponse( { status: 200, body: getDialogsPage() } ) );
	}

	if ( req.url.includes( 'Test/Test/Home' ) ) {
		return of( new HttpResponse( { status: 200, body: getTestHomePage() } ) );
	}

	if ( req.url.includes( 'Test/Query/Page' ) ) {
		return of( new HttpResponse( { status: 200, body: getQueryPage() } ) );
	}

	if ( req.url.includes( 'Test/Group/Table' ) ) {
		return of( new HttpResponse( { status: 200, body: getGroupTablePage() } ) );
	}

	if ( req.url.includes( 'Test/Group/GroupData' ) ) {
		return of( new HttpResponse( { status: 200, body: getGroupTableData( req.body ) } ) );
	}

	if ( req.url.includes( 'Test/Form/Page' ) ) {
		return of( new HttpResponse( { status: 200, body: getFormPage() } ) );
	}

	// Server-side table data
	if ( req.url.includes( 'Test/Table/ServerData' ) ) {
		return of( new HttpResponse( { status: 200, body: getServerTableData( req.body ) } ) ).pipe( delay( 300 ) );
	}

	// Table data endpoints for Test/Test/Home
	if ( req.url.includes( 'Test/Test/Table1Data' ) ) {
		return of( new HttpResponse( { status: 200, body: getTable1Data( req.body ) } ) );
	}

	if ( req.url.includes( 'Test/Test/Table2Data' ) ) {
		return of( new HttpResponse( { status: 200, body: getTable2Data( req.body ) } ) );
	}

	// Query result table
	if ( req.url.includes( 'Test/Query/Table' ) ) {
		return of( new HttpResponse( { status: 200, body: getQueryTableResult() } ) );
	}

	// Inline Edit Options (simulates backend delay for remote options loading)
	if ( req.url.includes( 'Test/InlineEdit/Options' ) ) {
		return of( new HttpResponse( {
			status: 200,
			body: [
				{ value: 'Active', label: 'Active' },
				{ value: 'Discontinued', label: 'Discontinued' },
				{ value: 'On Sale', label: 'On Sale' },
			]
		} ) ).pipe( delay( 1000 ) );
	}

	// Inline Edit Save (simulates backend delay)
	if ( req.url.includes( 'Test/InlineEdit/Save' ) ) {
		const body = req.body as any;

		// Simulate validation error for non-numeric price values
		if ( body?.field === 'price' && isNaN( Number( String( body?.value ).replace( /,/g, '' ) ) ) ) {
			return throwError( () => new HttpErrorResponse( {
				status: 400,
				statusText: 'Bad Request',
				error: { error: 'Price must be a valid number' }
			} ) ).pipe( delay( 500 ) );
		}

		const updates: any = {
			[body?.field]: body?.value,
			lastModified: new Date().toLocaleString( 'de-DE' ),
		};
		return of( new HttpResponse( {
			status: 200,
			body: {
				done: true,
				updates,
				message: 'Saved: ' + body?.field + ' = ' + body?.value,
				messageType: 'success',
			}
		} ) ).pipe( delay( 1000 ) );
	}

	// Pass through other requests
	return next( req );
};

// Stepper mock responses
function getStepperResponse( body: any ): any {

	// Step 0 -> Step 1: Return contact fields
	if ( !body?.email ) {
		return {
			step: 1,
			fields: [
				{ id: 'email', type: 'text', subtype: 'email', name: 'Email', required: true },
				{ id: 'phone', type: 'text', name: 'Phone' }
			],
			buttons: [
				{ text: 'Back', type: 'basic', action: 'prev' },
				{ text: 'Next', type: 'raised', action: 'next', default: true, color: 'primary' }
			]
		};
	}

	// Step 1 -> Step 2: Return summary/confirm
	if ( !body?.confirmed ) {
		const name = ( body?.firstName ?? '' ) + ' ' + ( body?.lastName ?? '' );
		return {
			step: 2,
			fields: [
				{ id: 'summary', type: 'info', name: 'Review: ' + name.trim() + ', ' + body.email },
				{ id: 'confirmed', type: 'checkbox', name: 'I confirm this is correct', required: true }
			],
			buttons: [
				{ text: 'Back', type: 'basic', action: 'prev' },
				{ text: 'Submit', type: 'raised', action: 'next', default: true, color: 'primary' }
			]
		};
	}

	// Final step: Navigate away
	return { goto: '/Workflow' };
}

// Search Select mock responses
function getSearchSelectResponse( body: any ): any[] {

	const search = body?.search ?? '';
	if ( search === '' ) {
		return [];
	}

	// Generate test data
	const data = [];
	for ( let i = 10; i < 16; i++ ) {
		data.push( { id: i, name: 'test ' + i } );
	}
	for ( let i = 20; i < 26; i++ ) {
		data.push( { id: i, name: 'test ' + i } );
	}

	// Filter by search term
	return data.filter( item => item.name.includes( search ) );
}

// Table mock responses
function getTableResponse( type: string, body: any ): any {

	const page = body?.page ?? 0;
	const pageSize = body?.pageSize ?? 10;
	const search = body?.search ?? '';

	// Generate mock data based on type
	const typeLabel = type.charAt( 0 ).toUpperCase() + type.slice( 1 );
	const statuses = [ 'Active', 'Pending', 'Completed', 'Cancelled' ];

	let allData = [];
	for ( let i = 1; i <= 50; i++ ) {
		allData.push( {
			id: i,
			name: `${ typeLabel } Item ${ i }`,
			date: `2024-0${ ( i % 9 ) + 1 }-${ ( i % 28 ) + 1 < 10 ? '0' : '' }${ ( i % 28 ) + 1 }`,
			status: statuses[ i % 4 ]
		} );
	}

	// Apply search filter
	if ( search ) {
		allData = allData.filter( item =>
			item.name.toLowerCase().includes( search.toLowerCase() ) ||
			item.status.toLowerCase().includes( search.toLowerCase() )
		);
	}

	// Apply pagination
	const total = allData.length;
	const start = page * pageSize;
	const data = allData.slice( start, start + pageSize );

	return { data, total };
}

// DynPage mock responses
function getLoginTestPage(): any {
	return {
		bread: null,
		data: [
			{
				type: 'buttonline',
				data: {
					class: '',
					buttons: [
						{ text: 'Login', type: 'flat', action: 'link', url: '/Home/Login/Login', color: 'primary' },
						{ text: 'Logout', type: 'flat', action: 'link', url: '/Home/Login/Logout' },
						{ text: 'API', type: 'flat', action: 'api', url: 'Home/Login/Send', color: 'primary' }
					]
				}
			}
		]
	};
}

function getDialogsPage(): any {
	return {
		bread: null,
		data: [
			{
				type: 'buttonline',
				data: {
					class: '',
					buttons: [
						{ text: 'DialogTable', type: 'raised', action: 'dialog', url: 'Test/Test/DialogTable' },
						{ text: 'DialogForm', type: 'raised', action: 'dialog', url: 'Test/Test/DialogForm' },
						{ text: 'DialogWaiting', type: 'raised', action: 'dialog', url: 'Test/Test/DialogWaiting/0' },
						{ text: 'DialogDelete', type: 'raised', action: 'dialog', url: 'Test/Test/DialogDelete' }
					]
				}
			}
		]
	};
}

function getTestHomePage(): any {
	return {
		bread: null,
		data: [
			{
				type: 'table',
				data: {
					url: 'Test/Test/Table1Data',
					fields: [
						{ id: 'id', name: 'ID', type: 'number' },
						{ id: 'name', name: 'Name', type: 'text' },
						{ id: 'status', name: 'Status', type: 'text' }
					],
					options: {
						title: 'Table 1',
						pagination: true,
						search: true,
						sort: true
					}
				}
			},
			{
				type: 'table',
				data: {
					url: 'Test/Test/Table2Data',
					fields: [
						{ id: 'id', name: 'ID', type: 'number' },
						{ id: 'name', name: 'Name', type: 'text' },
						{ id: 'date', name: 'Date', type: 'text' }
					],
					options: {
						title: 'Table 2',
						pagination: true,
						search: true
					}
				}
			}
		]
	};
}

function getQueryPage(): any {
	return {
		bread: 'Query',
		data: [
			{
				type: 'query',
				data: {
					fields: [],
					buttonline: {
						type: 'buttonline',
						data: {
							class: 'center',
							buttons: [
								{ text: 'Test', type: 'raised', action: 'api', url: 'Test/Query/Table', color: 'primary' }
							]
						}
					}
				}
			}
		]
	};
}

function getGroupTablePage(): any {
	return {
		bread: null,
		data: [
			{
				type: 'table',
				data: {
					url: 'Test/Group/GroupData',
					fields: [
						{ id: 'id', name: 'ID', type: 'number' },
						{ id: 'name', name: 'Name', type: 'text' },
						{ id: 'info', name: 'Info', type: 'text' },
						{ id: 'grp', name: 'Group', type: 'text' }
					],
					options: {
						title: 'Groups',
						pagination: true,
						search: true,
						sort: true,
						select: true,
						selectButtons: [
							{ text: 'Edit', type: 'flat', action: 'dialog', url: 'Test/Group/MultiEdit' },
							{ text: 'Delete', type: 'flat', action: 'dialog', url: 'Test/Group/MultiDel', color: 'warn' }
						]
					}
				}
			}
		]
	};
}

function getGroupTableData( body: any ): any {
	const page = body?.page ?? 0;
	const pageSize = body?.pageSize ?? 10;
	const search = body?.search ?? '';

	let allData = [];
	for ( let i = 1; i <= 30; i++ ) {
		allData.push( {
			id: i,
			name: `Group ${ i }`,
			info: `Description for group ${ i }`,
			grp: `Parent ${ ( i % 5 ) + 1 }`
		} );
	}

	if ( search ) {
		allData = allData.filter( item =>
			item.name.toLowerCase().includes( search.toLowerCase() ) ||
			item.info.toLowerCase().includes( search.toLowerCase() )
		);
	}

	const total = allData.length;
	const start = page * pageSize;
	const data = allData.slice( start, start + pageSize );

	return { data, total };
}

function getFormPage(): any {
	return {
		bread: null,
		data: [
			{
				type: 'form',
				data: {
					url: 'Test/Form/Page',
					header: 'Test Form',
					fields: [
						{ id: 'name', type: 'text', name: 'Name', required: true },
						{ id: 'file', type: 'file', name: 'File', hint: 'Maximum 10MB', required: false, multiple: true, pattern: '.pdf,.jpg' }
					],
					buttons: [
						{ text: 'Submit', type: 'raised', action: 'next', default: true, color: 'primary' },
						{ text: 'Cancel', type: 'basic', action: 'back' }
					]
				}
			}
		]
	};
}

function getTable1Data( body: any ): any {
	const page = body?.page ?? 0;
	const pageSize = body?.pageSize ?? 10;
	const search = body?.search ?? '';
	const statuses = [ 'Active', 'Pending', 'Completed', 'Cancelled' ];

	let allData = [];
	for ( let i = 1; i <= 25; i++ ) {
		allData.push( {
			id: i,
			name: `Item ${ i }`,
			status: statuses[ i % 4 ]
		} );
	}

	if ( search ) {
		allData = allData.filter( item =>
			item.name.toLowerCase().includes( search.toLowerCase() ) ||
			item.status.toLowerCase().includes( search.toLowerCase() )
		);
	}

	const total = allData.length;
	const start = page * pageSize;
	const data = allData.slice( start, start + pageSize );

	return { data, total };
}

function getTable2Data( body: any ): any {
	const page = body?.page ?? 0;
	const pageSize = body?.pageSize ?? 10;
	const search = body?.search ?? '';

	let allData = [];
	for ( let i = 1; i <= 20; i++ ) {
		allData.push( {
			id: i,
			name: `Record ${ i }`,
			date: `2024-0${ ( i % 9 ) + 1 }-${ ( i % 28 ) + 1 < 10 ? '0' : '' }${ ( i % 28 ) + 1 }`
		} );
	}

	if ( search ) {
		allData = allData.filter( item =>
			item.name.toLowerCase().includes( search.toLowerCase() )
		);
	}

	const total = allData.length;
	const start = page * pageSize;
	const data = allData.slice( start, start + pageSize );

	return { data, total };
}

function getServerTableData( body: any ): any {

	const page = body?._page ?? 0;
	const pageSize = body?._pageSize ?? 10;
	const sortField = body?._sort ?? '';
	const sortDir = body?._sortDir ?? 'asc';
	const search = body?._search ?? '';

	const departments = [ 'Engineering', 'Sales', 'Marketing', 'Support', 'HR', 'Finance' ];
	const statuses = [ 'Active', 'Inactive', 'On Leave', 'Sick' ];
	const cities = [ 'Vienna', 'Berlin', 'Munich', 'Zurich', 'Hamburg', 'Frankfurt' ];

	let allData = [];
	for ( let i = 1; i <= 87; i++ ) {
		allData.push( {
			id: i,
			name: `Employee ${ i }`,
			department: departments[ i % departments.length ],
			city: cities[ i % cities.length ],
			status: statuses[ i % statuses.length ],
			salary: [ `${ ( 2500 + i * 150 ).toLocaleString( 'de-DE' ) }`, 2500 + i * 150 ],
		} );
	}

	if ( search ) {
		allData = allData.filter( item =>
			item.name.toLowerCase().includes( search.toLowerCase() ) ||
			item.department.toLowerCase().includes( search.toLowerCase() ) ||
			item.city.toLowerCase().includes( search.toLowerCase() ) ||
			item.status.toLowerCase().includes( search.toLowerCase() )
		);
	}

	if ( sortField && sortField !== '' ) {
		allData.sort( ( a, b ) => {
			let valA = a[ sortField ];
			let valB = b[ sortField ];
			if ( Array.isArray( valA ) ) valA = valA[ 1 ];
			if ( Array.isArray( valB ) ) valB = valB[ 1 ];
			if ( typeof valA === 'string' ) valA = valA.toLowerCase();
			if ( typeof valB === 'string' ) valB = valB.toLowerCase();
			const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
			return sortDir === 'desc' ? -cmp : cmp;
		} );
	}

	const totalCount = allData.length;
	const start = page * pageSize;
	const data = allData.slice( start, start + pageSize );

	return {
		data,
		fields: [
			{ id: 'id', name: 'ID' },
			{ id: 'name', name: 'Name' },
			{ id: 'department', name: 'Department' },
			{ id: 'city', name: 'City' },
			{ id: 'status', name: 'Status' },
			{ id: 'salary', name: 'Salary', format: 'number', align: 'right', textSuffix: ' EUR' },
		],
		totalCount
	};
}

function getQueryTableResult(): any {
	return {
		bread: null,
		data: [
			{
				type: 'table',
				data: {
					url: 'Test/Test/Table1Data',
					fields: [
						{ id: 'id', name: 'ID', type: 'number' },
						{ id: 'name', name: 'Name', type: 'text' },
						{ id: 'status', name: 'Status', type: 'text' }
					],
					options: {
						title: 'Query Results',
						pagination: true,
						search: true
					}
				}
			}
		]
	};
}
