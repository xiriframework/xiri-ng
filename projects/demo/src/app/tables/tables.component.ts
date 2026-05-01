import { Component, inject } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriTableComponent, XiriTableSettings } from 'projects/xiri-ng/src/lib/table/table.component';
import { XiriTableField } from 'projects/xiri-ng/src/lib/raw-table/tabefield.interface';
import { XiriTagChip } from 'projects/xiri-ng/src/lib/formfields/field.interface';
import { XiriButton } from 'projects/xiri-ng/src/lib/button/button.component';
import { XiriRawTableComponent, XiriRawTableSettings } from 'projects/xiri-ng/src/lib/raw-table/xiri-raw-table.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';

@Component( {
	            selector: 'app-tables',
	            templateUrl: './tables.component.html',
	            styleUrl: './tables.component.scss',
	            imports: [ XiriPageHeaderComponent, XiriSectionComponent, XiriTableComponent, XiriRawTableComponent, GoCodePanelComponent, XiriBreadcrumbComponent ]
            } )
export class TablesComponent {

	private _snackBar = inject( MatSnackBar );

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Tables' },
	];

	pageHeaderIntro: XiriPageHeaderSettings = {
		title: 'Tables',
		subtitle: 'Feature-reiche Datentabelle mit Server-Side-Operationen',
		icon: 'table_chart',
		iconColor: 'primary',
	};

	sectionTable1: XiriSectionSettings = {
		title: '1: Select + Buttons + Header Rotation',
		subtitle: 'Row selection with select buttons. Header rotation: sideways, vertical, upright. Extra header with headerSpan.',
		icon: 'table',
	};

	sectionTable2: XiriSectionSettings = {
		title: '2: Input Fields + SaveInput',
		subtitle: "Editable columns (format: 'input') with paste support and save button.",
		icon: 'input',
	};

	sectionTable3: XiriSectionSettings = {
		title: '3: Row Buttons',
		subtitle: 'Columns with buttons per row. Actions: api (API call), icon (icon only), link (navigation).',
		icon: 'touch_app',
	};

	sectionTable4: XiriSectionSettings = {
		title: '4: Products (Dense + Footer + Menu)',
		subtitle: 'Dense mode, footer with sum/count calculation, menu button per row with submenu.',
		icon: 'grid_view',
	};

	sectionTable5: XiriSectionSettings = {
		title: '5: Projects (clickedRow + borders + chips)',
		subtitle: "Clickable rows, border lines, minimum table width, and format: 'chips' for colored tag display.",
		icon: 'rows',
	};

	sectionTable6: XiriSectionSettings = {
		title: '6: Employees (Server-Side)',
		subtitle: 'Server-side table: data is loaded via POST request from the server (pagination, sorting, search).',
		icon: 'dns',
		iconColor: 'success',
	};

	sectionTable7: XiriSectionSettings = {
		title: '7: Custom Scroll Height',
		subtitle: "scrollHeight: '300px' - Custom scroll container height with sticky headers. 100 rows, no pagination.",
		icon: 'height',
	};

	sectionTable8: XiriSectionSettings = {
		title: '8: Status Chips per Cell',
		subtitle: "Multiple columns with format: 'chips'. Each cell renders an array of colored pills. Single-value rows produce one chip; supports compact status dashboards.",
		icon: 'label',
	};

	sectionRawTable: XiriSectionSettings = {
		title: 'XiriRawTableComponent',
		subtitle: 'Simple table without server connection. Suitable for static data. Supports dense, number, icon formats.',
		icon: 'table_chart',
		iconColor: 'accent',
	};

	public data: XiriTableSettings = {
		data: [
			{ id: 1, name: 'line 1', content: 'content', content3: 0, content4: [ false, false ], content5: '<b>test</b>', nums: 123 },
			{ id: 2, name: 'line 2', content: 'content content content', content3: 1, content4: [ true, 'test' ], content5: '<b>test</b>', nums: 123 },
			{ id: 3, name: 'line 3', content: 'content', content3: 1, content4: [], content5: '<b>test</b>', nums: 123 },
		],
		fields: [
			{ id: 'id', name: 'id', sticky: true },
			{ id: 'id2', name: 'id' },
			{ id: 'name', name: 'content hier kann sehr viel stehen', header: 'sideways' },
			{ id: 'content', name: 'content hier kann sehr viel', header: 'vertical right', display: 'right' },
			{ id: 'content2', name: 'content2', hide: true },
			{ id: 'content3', name: 'hier', header: 'upright', format: 'icon', icons: [ { icon: 'done' }, { icon: 'close', color: 'warn' } ] },
			{ id: 'content5', name: 'content5', format: 'html' },
			{ id: 'top1', name: 'content5', format: 'header', headerSpan: 2 },
			{ id: 'top2', name: 'content5', format: 'header', headerSpan: 5 }
		],
		options: {
			reload: true, sort: true, search: true, select: true,
			title: '1: Select + Buttons + Header Rotation',
			borders: false, bordersHeader: true, textNoData: 'No data found',
			buttons: {
				buttons: [
					{ type: 'icon', text: 'Name', action: 'api', icon: 'home' },
					{ type: 'icon', text: 'Name', action: 'api', icon: 'home' },
					{ type: 'icon', text: 'Name', action: 'api', icon: 'home' }
				], class: ''
			},
			selectButtons: [ { type: 'icon', text: 'Name', action: 'api', icon: 'home' } ]
		},
		hasFilter: false
	};

	public data2: XiriTableSettings = {
		data: [
			{ id: 1, preis1: 2.5, nums: 123 }, { id: 2, preis1: 2.5, nums: 123 },
			{ id: 3, preis1: 0 }, { id: 4, preis1: 0 }, { id: 5, preis1: 0 },
			{ id: 6, preis1: 0 }, { id: 7, preis1: 0 }, { id: 8, preis1: 0 },
			{ id: 9, preis1: 0 }, { id: 10, preis1: 0 },
		],
		fields: [
			{ id: 'id', name: 'id', sticky: true },
			{ id: 'preis1', name: 'Price 1', format: 'input', inputType: 'number', width: '30px', inputLang: 'de', inputPaste: true },
			{ id: 'preis2', name: 'Price 2', format: 'input', inputType: 'number', width: '90px', inputLang: 'de', inputPaste: true }
		],
		options: {
			reload: true, sort: true, search: true, select: true,
			title: '2: Input Fields + SaveInput',
			textNoData: 'No data found', saveInput: 'Save', saveInputUrl: 'test',
		},
		hasFilter: false
	};

	public data3: XiriTableSettings = {
		data: [
			{ id: 1, name: 'line 1', content: 'content content content content content content content content content', content3: 0, content4: [ false, false ], content5: '<b>test</b>', nums: 123 },
			{ id: 2, name: 'line 2', content: 'content', content3: 1, content4: [ true, 'test' ], content5: '<b>test</b>', nums: 123 },
			{ id: 3, name: 'line 3', content: 'content', content3: 1, content4: [], content5: '<b>test</b>', nums: 123 },
		],
		fields: [
			{ id: 'id', name: 'id', sticky: true },
			{ id: 'name', name: 'name' },
			{ id: 'content', name: 'content' },
			{ id: 'content2', name: 'content2', hide: true },
			{ id: 'content3', name: 'content3', format: 'icon', icons: [ { icon: 'done' }, { icon: 'close', color: 'warn' } ] },
			{
				id: 'content4', name: 'content4', format: 'buttons',
				buttons: [
					<XiriButton> { action: 'api', hint: 'briefed', color: 'primary', icon: 'task_alt' },
					<XiriButton> { action: 'icon', hint: 'briefed', color: 'accent', icon: 'done' },
					<XiriButton> { action: 'icon', hint: 'briefed', color: 'accent', icon: 'done' },
					<XiriButton> { action: 'icon', hint: 'briefed', color: 'accent', icon: 'done' }
				],
			},
			{ id: 'content5', name: 'content5', format: 'html' },
			{
				id: 'nums', name: 'nums', format: 'buttons',
				buttons: [
					<XiriButton> { action: 'icon', hint: 'briefed', color: 'accent', icon: 'done' },
					<XiriButton> { action: 'link', hint: 'briefed', color: 'primary', icon: 'task_alt' }
				],
			}
		],
		options: {
			reload: true, sort: true, search: true, select: true,
			title: '3: Row Buttons (api, icon, link)',
			textNoData: 'No data found',
			buttons: {
				buttons: [
					{ type: 'icon', text: 'Name', action: 'api', icon: 'home' },
					{ type: 'icon', text: 'Name', action: 'api', icon: 'home' },
					{ type: 'icon', text: 'Name', action: 'api', icon: 'home' }
				], class: ''
			},
		},
		hasFilter: false
	};

	public data4: XiriTableSettings = {
		data: [
			{ id: 1, name: 'Laptop Pro 15', nameLink: '/Overview', price: [ '1,299.00', 1299.00 ], category: 'Electronics', info: [ 'High-end laptop', '15 inch display' ], actions: [ [ '/Overview', '/Forms', false ] ] },
			{ id: 2, name: 'Wireless Mouse', nameLink: '/Forms', price: [ '29.99', 29.99 ], category: 'Accessories', info: [ 'Bluetooth mouse', 'Ergonomic' ], actions: [ [ '/Tables', '/Cards', '/Feedback' ] ] },
			{ id: 3, name: 'USB-C Hub', nameLink: '/Tables', price: [ '59.90', 59.90 ], category: 'Accessories', info: [ '7-in-1 hub', 'USB-C port' ], actions: [ [ '/Overview', false, '/Workflow' ] ] },
			{ id: 4, name: 'Monitor 27"', nameLink: '/Cards', price: [ '449.00', 449.00 ], category: 'Electronics', info: [ '4K monitor', 'IPS panel' ], actions: [ [ '/Overview', '/Forms', '/Tables' ] ] },
			{ id: 5, name: 'Mechanical Keyboard', nameLink: '/Feedback', price: [ '89.95', 89.95 ], category: 'Accessories', info: [ 'Mechanical', 'Cherry MX Blue' ], actions: [ [ '/Overview', '/Forms', '/Tables' ] ] },
			{ id: 6, name: 'Webcam HD', nameLink: '/Overview', price: [ '79.00', 79.00 ], category: 'Electronics', info: [ '1080p webcam', 'Autofocus' ], actions: [ [ '/Overview', '/Forms', false ] ] },
			{ id: 7, name: 'Headset Pro', nameLink: '/Forms', price: [ '199.00', 199.00 ], category: 'Audio', info: [ 'Noise cancelling', 'Bluetooth 5.0' ], actions: [ [ '/Overview', '/Forms', '/Tables' ] ] },
			{ id: 8, name: 'Docking Station', nameLink: '/Tables', price: [ '159.90', 159.90 ], category: 'Accessories', info: [ 'Triple display', 'USB-C PD 100W' ], actions: [ [ '/Overview', '/Forms', '/Tables' ] ] },
			{ id: 9, name: 'SSD 1TB', nameLink: '/Overview', price: [ '89.99', 89.99 ], category: 'Storage', info: [ 'NVMe SSD', 'PCIe Gen4' ], actions: [ [ '/Overview', false, '/Tables' ] ] },
			{ id: 10, name: 'RAM 32GB', nameLink: '/Forms', price: [ '109.00', 109.00 ], category: 'Storage', info: [ 'DDR5 5600', 'CL36' ], actions: [ [ '/Overview', '/Forms', '/Tables' ] ] },
			{ id: 11, name: 'USB-C Cable', nameLink: '/Tables', price: [ '12.99', 12.99 ], category: 'Accessories', info: [ '2m length', 'USB 3.2' ], actions: [ [ '/Overview', '/Forms', '/Tables' ] ] },
			{ id: 12, name: 'Tablet 10"', nameLink: '/Overview', price: [ '329.00', 329.00 ], category: 'Electronics', info: [ 'Android tablet', '10 inch IPS' ], actions: [ [ '/Overview', '/Forms', '/Tables' ] ] },
			{ id: 13, name: 'BT Speaker', nameLink: '/Forms', price: [ '49.95', 49.95 ], category: 'Audio', info: [ 'Portable', '10h battery' ], actions: [ [ '/Overview', '/Forms', false ] ] },
			{ id: 14, name: 'Mouse Pad XL', nameLink: '/Tables', price: [ '19.99', 19.99 ], category: 'Accessories', info: [ 'Non-slip', '900x400mm' ], actions: [ [ '/Overview', '/Forms', '/Tables' ] ] },
			{ id: 15, name: 'Laptop Stand', nameLink: '/Overview', price: [ '39.90', 39.90 ], category: 'Accessories', info: [ 'Aluminum', 'Height adjustable' ], actions: [ [ '/Overview', '/Forms', '/Tables' ] ] },
			{ id: 16, name: 'Powerbank 20k', nameLink: '/Forms', price: [ '44.99', 44.99 ], category: 'Electronics', info: [ '20,000mAh', 'USB-C PD' ], actions: [ [ '/Overview', '/Forms', '/Tables' ] ] },
		],
		fields: <XiriTableField[]> [
			{ id: 'id', name: 'ID', sticky: true, footer: 'no' },
			{ id: 'name', name: 'Product', format: 'link', footer: 'no' },
			{ id: 'price', name: 'Price', format: 'number', align: 'right', textSuffix: ' EUR', footer: 'sum', webformat: '1.2-2' },
			{ id: 'category', name: 'Category', textPrefix: '[ ', textSuffix: ' ]', footer: 'count' },
			{ id: 'info', name: 'Details', format: 'text2', footer: 'no' },
			{
				id: 'actions', name: 'Actions', format: 'buttons', footer: 'no',
				buttons: [ <XiriButton> {
					action: 'menu', icon: 'more_vert', color: 'primary', hint: 'Actions',
					menuItems: [
						{ action: 'link', icon: 'home', text: 'Home' },
						{ action: 'link', icon: 'edit', text: 'Edit' },
						{ action: 'link', icon: 'table_chart', text: 'Table' },
					]
				} ],
			}
		],
		options: {
			reload: true, sort: true, search: true, dense: true, pagination: true,
			itemsPerPage: 5, pageSizes: [ 5, 10 ],
			title: '4: Products (Dense + Footer + Menu)',
			textNoData: 'No products found',
			footer: true, saveState: true, saveStateId: 'test-table-4',
		},
		hasFilter: false
	};

	public data5: XiriTableSettings = {
		data: [
			{
				id: 1, name: 'Project Alpha', status: 'Active', priority: 'High', assigned: 'Max',
				tags: <XiriTagChip[]> [ { label: 'Frontend', color: 'primary' }, { label: 'Angular', color: 'emerald' } ]
			},
			{
				id: 2, name: 'Project Beta', status: 'Paused', priority: 'Medium', assigned: 'Anna',
				tags: <XiriTagChip[]> [ { label: 'Backend', color: 'accent' }, { label: 'DevOps', color: 'warn' } ]
			},
			{
				id: 3, name: 'Project Gamma', status: 'Active', priority: 'Low', assigned: 'Tom',
				tags: <XiriTagChip[]> [ { label: 'DevOps', color: 'warn' }, { label: 'Docker', color: 'blue' } ]
			},
			{
				id: 4, name: 'Project Delta', status: 'Completed', priority: 'High', assigned: 'Lisa',
				tags: <XiriTagChip[]> [ { label: 'Testing', color: 'success' }, { label: 'QA', color: 'green' } ]
			},
			{
				id: 5, name: 'Project Epsilon', status: 'Active', priority: 'Medium', assigned: 'Max',
				tags: <XiriTagChip[]> [ { label: 'Design', color: 'purple' }, { label: 'UX', color: 'orange' } ]
			},
		],
		fields: [
			{ id: 'id', name: 'ID' },
			{ id: 'name', name: 'Project Name' },
			{ id: 'status', name: 'Status' },
			{ id: 'priority', name: 'Priority' },
			{ id: 'assigned', name: 'Assigned' },
			{ id: 'tags', name: 'Tags', format: 'chips' },
		],
		options: {
			class: 'canbreak', minWidth: '800px', borders: true, sort: true, search: true,
			title: '5: Projects (clickedRow + borders + chips)',
			textNoData: 'No projects found',
		},
		hasFilter: false
	};

	public data8: XiriTableSettings = {
		data: [
			{
				id: 1, item: 'A-422',
				state: <XiriTagChip[]>[ { label: 'Attention', color: 'warn' } ],
				issues: <XiriTagChip[]>[ { label: 'Channel 1', color: 'red' } ],
				metric1: <XiriTagChip[]>[ { label: '90%', color: 'lightgray' } ],
				metric2: <XiriTagChip[]>[ { label: '70%', color: 'lightgray' } ],
				metric3: <XiriTagChip[]>[ { label: '45%', color: 'red' } ],
			},
			{
				id: 2, item: 'B-689',
				state: <XiriTagChip[]>[ { label: 'Not available', color: 'gray' } ],
				issues: <XiriTagChip[]>[ { label: 'Channel 2', color: 'red' } ],
				metric1: <XiriTagChip[]>[ { label: '100%', color: 'success' } ],
				metric2: <XiriTagChip[]>[ { label: '85%', color: 'lightgray' } ],
				metric3: <XiriTagChip[]>[ { label: 'N/A', color: 'gray' } ],
			},
			{
				id: 3, item: 'C-310',
				state: <XiriTagChip[]>[ { label: 'Attention', color: 'warn' } ],
				issues: <XiriTagChip[]>[ { label: 'Channel 3', color: 'red' } ],
				metric1: <XiriTagChip[]>[ { label: '88%', color: 'lightgray' } ],
				metric2: <XiriTagChip[]>[ { label: '90%', color: 'success' } ],
				metric3: <XiriTagChip[]>[ { label: 'N/A', color: 'gray' } ],
			},
			{
				id: 4, item: 'D-431',
				state: <XiriTagChip[]>[ { label: 'Attention', color: 'warn' } ],
				issues: <XiriTagChip[]>[ { label: 'Channel 4', color: 'red' } ],
				metric1: <XiriTagChip[]>[ { label: '32%', color: 'red' } ],
				metric2: <XiriTagChip[]>[ { label: '7%', color: 'red' } ],
				metric3: <XiriTagChip[]>[ { label: 'N/A', color: 'gray' } ],
			},
			{
				id: 5, item: 'E-59',
				state: <XiriTagChip[]>[ { label: 'Attention', color: 'warn' } ],
				issues: <XiriTagChip[]>[ { label: 'Channel 5', color: 'warn' } ],
				metric1: <XiriTagChip[]>[ { label: '48%', color: 'red' } ],
				metric2: <XiriTagChip[]>[ { label: '90%', color: 'success' } ],
				metric3: <XiriTagChip[]>[ { label: 'N/A', color: 'gray' } ],
			},
		],
		fields: [
			{ id: 'item', name: 'Item', sticky: true },
			{ id: 'state', name: 'State', format: 'chips' },
			{ id: 'issues', name: 'Issues', format: 'chips' },
			{ id: 'metric1', name: 'Metric 1', format: 'chips' },
			{ id: 'metric2', name: 'Metric 2', format: 'chips' },
			{ id: 'metric3', name: 'Metric 3', format: 'chips' },
		],
		options: {
			sort: true, search: true, borders: true, bordersHeader: true,
			title: '8: Status Chips per Cell',
			textNoData: 'No items',
		},
		hasFilter: false
	};

	public data6: XiriTableSettings = {
		url: 'Test/Table/ServerData',
		options: {
			serverSide: true, pagination: true, sort: true, search: true, reload: true,
			title: '6: Employees (Server-Side)',
			textNoData: 'No employees found',
			itemsPerPage: 10, pageSizes: [ 5, 10, 25 ],
		},
		hasFilter: false
	};

	public data7: XiriTableSettings = {
		data: Array.from( { length: 100 }, ( _, i ) => ( {
			id: i + 1,
			name: 'Item ' + ( i + 1 ),
			value: Math.floor( Math.random() * 1000 ),
			status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Pending' : 'Done',
		} ) ),
		fields: [
			{ id: 'id', name: 'ID' },
			{ id: 'name', name: 'Name' },
			{ id: 'value', name: 'Value' },
			{ id: 'status', name: 'Status' },
		],
		options: {
			sort: true, search: true, pagination: false,
			title: '7: Scroll Height (300px, 100 rows)',
			scrollHeight: '300px',
		},
		hasFilter: false
	};

	// --- RawTable ---
	rawTableSettings: XiriRawTableSettings = {
		dense: 2,
		data: [
			{ id: 1, name: 'Widget Alpha', category: 'UI', price: [ '1,234.56', 1234.56 ], status: 0, tags: <XiriTagChip[]>[ { label: 'UI', color: 'primary' }, { label: 'Angular', color: 'emerald' } ] },
			{ id: 2, name: 'Widget Beta', category: 'API', price: [ '567.89', 567.89 ], status: 1, tags: <XiriTagChip[]>[ { label: 'API', color: 'accent' } ] },
			{ id: 3, name: 'Widget Gamma', category: 'UI', price: [ '99.00', 99.00 ], status: 0, tags: <XiriTagChip[]>[ { label: 'UI', color: 'primary' }, { label: 'Testing', color: 'success' } ] },
			{ id: 4, name: 'Widget Delta', category: 'Backend', price: [ '2,500.00', 2500.00 ], status: 1, tags: <XiriTagChip[]>[ { label: 'Backend', color: 'warn' }, { label: 'Docker', color: 'blue' } ] },
		],
		fields: [
			{ id: 'id', name: 'ID', align: 'center' },
			{ id: 'name', name: 'Name' },
			{ id: 'category', name: 'Category', textPrefix: '[ ', textSuffix: ' ]' },
			{ id: 'price', name: 'Price', format: 'number', align: 'right' },
			{
				id: 'status', name: 'Status', format: 'icon',
				icons: [
					{ icon: 'check_circle', color: 'success' },
					{ icon: 'cancel', color: 'warn' }
				]
			},
			{ id: 'tags', name: 'Tags', format: 'chips' }
		]
	};

	goTable1Code = `tb := table.NewBuilder[Row](ctx, t)

tb.TextField("id", "id", idAccessor).Sticky()
tb.TextField("name", "content hier...", nameAccessor).
    WithHeader("sideways")
tb.TextField("content", "content hier...", contentAccessor).
    WithHeader("vertical right").AlignRight()
tb.IconField("content3", "hier", iconAccessor).
    WithHeader("upright")
tb.HtmlField("content5", "content5", htmlAccessor)

tb.SetOptions(table.TableOptions{
    Reload: true, Sort: true, Search: true,
    Select: true, Borders: false, BordersHeader: true,
})`;

	goTable2Code = `tb := table.NewBuilder[Row](ctx, t)

tb.IntField("id", "id", idAccessor)
tb.FloatField("preis1", "Price 1", preis1Accessor).
    WithInputType("number").WithWidth("30px")
tb.FloatField("preis2", "Price 2", preis2Accessor).
    WithInputType("number").WithWidth("90px")

tb.SetOptions(table.TableOptions{
    Reload: true, Sort: true, Search: true,
    SaveInput: "Save", SaveInputUrl: "test",
})`;

	goTable3Code = `tb := table.NewBuilder[Row](ctx, t)

tb.TextField("id", "id", idAccessor)
tb.TextField("name", "name", nameAccessor)
tb.ButtonsField("content4", buttonsAccessor)
tb.ButtonsField("nums", numsButtonsAccessor)

// Buttons: api, icon, link actions`;

	goTable4Code = `tb := table.NewBuilder[Product](ctx, t)

tb.IntField("id", "ID", idAcc).WithFooter("no")
tb.TextField("name", "Product", nameAcc).WithFormat("link")
tb.FloatField("price", "Price", priceAcc).
    AlignRight().WithFooterSum().
    WithWebFormatter(func(v float64) string {
        return fmt.Sprintf("%.2f EUR", v)
    })
tb.TextField("category", "Category", catAcc).
    WithFooterCount()
tb.ButtonsField("actions", actionsAcc) // menu button

tb.SetOptions(table.TableOptions{
    Dense: true, Pagination: true, Footer: true,
    ItemsPerPage: 5, PageSizes: []int{5, 10},
})`;

	goTable5Code = `tb := table.NewBuilder[Project](ctx, t)

tb.TextField("name", "Project Name", nameAcc)
tb.TextField("status", "Status", statusAcc)
tb.TextField("priority", "Priority", prioAcc)
tb.ChipsField("tags", "Tags", tagsAcc)

tb.SetOptions(table.TableOptions{
    Borders: true, Sort: true, Search: true,
    MinWidth: "800px",
})`;

	goTable6Code = `tb := table.NewBuilder[Employee](ctx, t)

// Felder werden serverseitig definiert
tb.TextField("name", "Name", nameAcc)
tb.TextField("email", "Email", emailAcc)
tb.TextField("department", "Department", deptAcc)

tbl := tb.Build()
tbl.SetURL("Test/Table/ServerData")

tb.SetOptions(table.TableOptions{
    ServerSide: true, Pagination: true,
    Sort: true, Search: true, Reload: true,
    ItemsPerPage: 10,
    PageSizes: []int{5, 10, 25},
})`;

	goTable7Code = `tb := table.NewBuilder[Item](ctx, t)

tb.IntField("id", "ID", idAcc)
tb.TextField("name", "Name", nameAcc)
tb.IntField("value", "Value", valAcc)
tb.TextField("status", "Status", statusAcc)

tb.SetOptions(table.TableOptions{
    Sort: true, Search: true,
    Pagination: false,
    ScrollHeight: "300px",
})`;

	goTable8Code = `tb := table.NewBuilder[Row](ctx, t)

tb.TextField("item", "Item", itemAcc).Sticky()

tb.ChipsField("state", "State", func(r Row) []table.Chip {
    if r.OK { return []table.Chip{{Label: "OK", Color: core.ColorSuccess}} }
    return []table.Chip{{Label: "Attention", Color: core.ColorWarning}}
})

tb.ChipsField("issues", "Issues", func(r Row) []table.Chip {
    out := make([]table.Chip, 0, len(r.Issues))
    for _, i := range r.Issues {
        out = append(out, table.Chip{Label: i.Label, Color: i.Severity})
    }
    return out
})

tb.ChipsField("metric1", "Metric 1", func(r Row) []table.Chip {
    color := core.ColorLightGray
    if r.M1 < 50 { color = core.ColorRed }
    return []table.Chip{{Label: fmt.Sprintf("%d%%", r.M1), Color: color}}
})`;

	goRawTableCode = `// RawTable = clientseitige Tabelle ohne Server-Anbindung
// Im Go-Backend: Tabelle mit SetData() statt SetURL()

tb := table.NewBuilder[Widget](ctx, t)

tb.IntField("id", "ID", idAcc).AlignCenter()
tb.TextField("name", "Name", nameAcc)
tb.FloatField("price", "Price", priceAcc).
    AlignRight().WithFormat("number")
tb.IconField("status", "Status", statusAcc)
tb.ChipsField("tags", "Tags", tagsAcc)

tbl := tb.Build()
tbl.SetData(widgets) // statische Daten`;

	onRowClicked( row: any ): void {
		console.log( 'Row clicked:', row );
		this._snackBar.open( 'Row clicked: ' + ( row.name || row.id ), 'OK', { duration: 2000 } );
	}
}
