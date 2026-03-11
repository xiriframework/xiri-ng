import { Component } from '@angular/core';
import { XiriPageHeaderComponent, XiriPageHeaderSettings } from 'projects/xiri-ng/src/lib/page-header/page-header.component';
import { XiriSectionComponent, XiriSectionSettings } from 'projects/xiri-ng/src/lib/section/section.component';
import { XiriTableComponent, XiriTableSettings } from 'projects/xiri-ng/src/lib/table/table.component';
import { XiriTableField } from 'projects/xiri-ng/src/lib/raw-table/tabefield.interface';
import { GoCodePanelComponent } from '../go-code-panel/go-code-panel.component';
import { XiriBreadcrumbComponent, XiriBreadcrumbItem } from 'projects/xiri-ng/src/lib/breadcrumb/breadcrumb.component';

@Component( {
	            selector: 'app-inline-edit-table',
	            templateUrl: './inline-edit-table.component.html',
	            styleUrl: './inline-edit-table.component.scss',
	            imports: [ XiriPageHeaderComponent, XiriSectionComponent, XiriTableComponent, GoCodePanelComponent, XiriBreadcrumbComponent ]
            } )
export class InlineEditTableComponent {

	breadcrumbs: XiriBreadcrumbItem[] = [
		{ label: 'Home', link: '/Overview', icon: 'home' },
		{ label: 'Inline Edit Table' },
	];

	pageHeader: XiriPageHeaderSettings = {
		title: 'Inline Edit Table',
		subtitle: 'Click on editable cells to edit values directly. Changes are saved immediately via POST.',
		icon: 'edit_note',
		iconColor: 'primary',
	};

	sectionTable: XiriSectionSettings = {
		title: 'Inline Editing',
		subtitle: 'Click on Product/Price for text input, Status for select dropdown, Tags for multi-select chips. ID is read-only.',
		icon: 'edit',
	};

	tableSettings: XiriTableSettings = {
		data: [
			{ id: 1, name: 'Laptop Pro 15', price: '1,299.00', status: 'Active', tags: [ { label: 'Electronics', color: 'primary' }, { label: 'Premium', color: 'emerald' } ], lastModified: '' },
			{ id: 2, name: 'Wireless Mouse', price: '29.99', status: 'Active', tags: [ { label: 'Electronics', color: 'primary' }, { label: 'Accessories', color: 'accent' } ], lastModified: '' },
			{ id: 3, name: 'USB-C Hub', price: '59.90', status: 'Discontinued', tags: [ { label: 'Accessories', color: 'accent' } ], lastModified: '' },
			{ id: 4, name: 'Monitor 27"', price: '449.00', status: 'Active', tags: [ { label: 'Electronics', color: 'primary' }, { label: 'Premium', color: 'emerald' } ], lastModified: '' },
			{ id: 5, name: 'Mechanical Keyboard', price: '89.95', status: 'Active', tags: [ { label: 'Electronics', color: 'primary' } ], lastModified: '' },
			{ id: 6, name: 'Webcam HD', price: '79.00', status: 'On Sale', tags: [ { label: 'Electronics', color: 'primary' }, { label: 'Sale', color: 'warn' } ], lastModified: '' },
			{ id: 7, name: 'Headset Pro', price: '199.00', status: 'Active', tags: [ { label: 'Electronics', color: 'primary' }, { label: 'Premium', color: 'emerald' } ], lastModified: '' },
			{ id: 8, name: 'Docking Station', price: '159.90', status: 'Active', tags: [ { label: 'Electronics', color: 'primary' }, { label: 'Accessories', color: 'accent' } ], lastModified: '' },
			{ id: 9, name: 'SSD 1TB', price: '89.99', status: 'Active', tags: [ { label: 'Electronics', color: 'primary' } ], lastModified: '' },
			{ id: 10, name: 'RAM 32GB', price: '109.00', status: 'Discontinued', tags: [ { label: 'Electronics', color: 'primary' } ], lastModified: '' },
			{ id: 11, name: 'USB-C Cable', price: '12.99', status: 'Active', tags: [ { label: 'Accessories', color: 'accent' }, { label: 'Sale', color: 'warn' } ], lastModified: '' },
			{ id: 12, name: 'Tablet 10"', price: '329.00', status: 'Active', tags: [ { label: 'Electronics', color: 'primary' }, { label: 'Premium', color: 'emerald' } ], lastModified: '' },
			{ id: 13, name: 'BT Speaker', price: '49.95', status: 'On Sale', tags: [ { label: 'Electronics', color: 'primary' }, { label: 'Sale', color: 'warn' } ], lastModified: '' },
			{ id: 14, name: 'Mouse Pad XL', price: '19.99', status: 'Active', tags: [ { label: 'Accessories', color: 'accent' } ], lastModified: '' },
			{ id: 15, name: 'Laptop Stand', price: '39.90', status: 'Active', tags: [ { label: 'Accessories', color: 'accent' } ], lastModified: '' },
			{ id: 16, name: 'Powerbank 20k', price: '44.99', status: 'Active', tags: [ { label: 'Electronics', color: 'primary' }, { label: 'Accessories', color: 'accent' } ], lastModified: '' },
			{ id: 17, name: 'Desk Lamp LED', price: '34.50', status: 'Active', tags: [ { label: 'Accessories', color: 'accent' } ], lastModified: '' },
			{ id: 18, name: 'Cable Organizer', price: '14.99', status: 'Discontinued', tags: [ { label: 'Accessories', color: 'accent' }, { label: 'Sale', color: 'warn' } ], lastModified: '' },
			{ id: 19, name: 'Webcam Light', price: '24.90', status: 'Active', tags: [ { label: 'Electronics', color: 'primary' } ], lastModified: '' },
			{ id: 20, name: 'Desk Mat XXL', price: '29.90', status: 'On Sale', tags: [ { label: 'Accessories', color: 'accent' }, { label: 'Sale', color: 'warn' } ], lastModified: '' },
		],
		fields: <XiriTableField[]> [
			{ id: 'id', name: 'ID' },
			{ id: 'name', name: 'Product', editable: true },
			{ id: 'price', name: 'Price', editable: true },
			{
				id: 'status', name: 'Status', editable: true,
				editableOptionsUrl: 'Test/InlineEdit/Options',
			},
			{
				id: 'tags', name: 'Tags', format: 'chips', editable: true,
				editableOptions: [
					{ value: 'Electronics', label: 'Electronics', color: 'primary' },
					{ value: 'Accessories', label: 'Accessories', color: 'accent' },
					{ value: 'Premium', label: 'Premium', color: 'emerald' },
					{ value: 'Sale', label: 'Sale', color: 'warn' },
				]
			},
			{ id: 'lastModified', name: 'Last Modified', sort: false },
		],
		options: {
			sort: true, search: true, pagination: true,
			title: 'Products (Inline Edit)',
			textNoData: 'No products found',
			editUrl: 'Test/InlineEdit/Save',
			itemsPerPage: 10,
		},
		hasFilter: false,
	};

	goCode = `type ProductRow struct {
    ID     int64
    Name   string
    Price  string
    Status string
    Tags   []string
}

func buildProductTable() *table.Table[ProductRow] {
    tb := table.NewBuilder[ProductRow]()

    tb.IdField("id", "ID", func(r ProductRow) int64 { return r.ID })
    tb.TextField("name", "Product", func(r ProductRow) string { return r.Name }).
        WithEditable(true)
    tb.TextField("price", "Price", func(r ProductRow) string { return r.Price }).
        WithEditable(true)
    tb.TextField("status", "Status", func(r ProductRow) string { return r.Status }).
        WithEditableOptions(map[string]string{
            "Active":       "Active",
            "Discontinued": "Discontinued",
            "On Sale":      "On Sale",
        })
    tb.ChipsField("tags", "Tags", func(r ProductRow) []string { return r.Tags }).
        WithEditableChipOptions([]table.EditableChipOption{
            {Value: "Electronics", Label: "Electronics", Color: core.ColorPrimary},
            {Value: "Accessories", Label: "Accessories", Color: core.ColorAccent},
            {Value: "Premium", Label: "Premium", Color: core.ColorEmerald},
            {Value: "Sale", Label: "Sale", Color: core.ColorWarn},
        })

    tb.SetEditUrl("Portal/Product/InlineEdit")

    return tb.Build()
}`;
}
