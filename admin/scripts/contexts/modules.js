/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리화면을 구성한다.
 *
 * @file /modules/admin/admin/scripts/contexts/modules.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 22.
 */
Admin.ready(async () => {
    const me = Admin.getModule('admin');
    return new Aui.Grid.Panel({
        id: 'modules',
        iconClass: 'mi mi-module',
        border: false,
        layout: 'fit',
        title: await me.getText('admin.contexts.modules'),
        selection: { selectable: true },
        autoLoad: true,
        topbar: [
            new Aui.Form.Field.Search({
                name: 'keyword',
                width: 200,
                emptyText: await me.getText('keyword'),
                liveSearch: true,
                handler: async (keyword, field) => {
                    const grid = field.getParent().getParent();
                    if (keyword.length > 0) {
                        grid.getStore().setFilters({
                            name: { value: keyword, operator: 'like' },
                            title: { value: keyword, operator: 'likecode' },
                        }, 'OR');
                    }
                    else {
                        grid.getStore().resetFilters();
                    }
                },
            }),
            '->',
            new Aui.Button({
                iconClass: 'mi mi-refresh',
                text: await me.getText('admin.modules.update_size'),
            }),
        ],
        bottombar: [
            new Aui.Button({
                iconClass: 'mi mi-refresh',
                handler: (button) => {
                    const grid = button.getParent().getParent();
                    grid.getStore().reload();
                },
            }),
        ],
        store: new Aui.Store.Remote({
            url: me.getProcessUrl('modules'),
            primaryKeys: ['name'],
            sorters: { title: 'ASC' },
        }),
        columns: [
            {
                text: await me.getText('admin.modules.title'),
                dataIndex: 'title',
                width: 200,
                sortable: true,
                renderer: (value, record) => {
                    return record.get('icon') + value;
                },
            },
            {
                text: await me.getText('admin.modules.version'),
                dataIndex: 'version',
                width: 80,
                textAlign: 'center',
            },
            {
                text: await me.getText('admin.modules.description'),
                dataIndex: 'description',
                minWidth: 200,
            },
            {
                text: await me.getText('admin.modules.author'),
                dataIndex: 'author',
                width: 160,
            },
            {
                text: await me.getText('admin.modules.status.title'),
                dataIndex: 'status',
                width: 100,
                textAlign: 'center',
                renderer: (value, _record, $column) => {
                    if (value == 'INSTALLED') {
                        $column.setStyle('color', 'var(--aui-color-accent-500)');
                    }
                    else if (value == 'NOT_INSTALLED') {
                        $column.setStyle('color', 'var(--aui-color-background-100)');
                    }
                    else {
                        $column.setStyle('color', 'var(--aui-color-danger-500)');
                    }
                    return me.printText('admin.modules.status.' + value);
                },
            },
            {
                text: await me.getText('admin.modules.databases'),
                dataIndex: 'databases',
                width: 100,
                textAlign: 'right',
                renderer: (value) => {
                    return Format.size(value);
                },
            },
            {
                text: await me.getText('admin.modules.attachments'),
                dataIndex: 'attachments',
                width: 100,
                textAlign: 'right',
                renderer: (value) => {
                    return Format.size(value);
                },
            },
        ],
        listeners: {
            openItem: (record) => {
                me.modules.show(record.get('name'));
            },
            openMenu: (menu, record) => {
                menu.setTitle(record.get('title'));
                menu.add({
                    text: me.printText('admin.modules.show.title'),
                    iconClass: 'mi mi-edit',
                    handler: async () => {
                        me.modules.show(record.get('name'));
                        return true;
                    },
                });
                menu.add({
                    text: me.printText('buttons.configs'),
                    iconClass: 'mi mi-config',
                    hidden: record.get('properties').includes('CONFIGS') === false,
                    handler: async () => {
                        me.modules.setConfigs(record.get('name'));
                        return true;
                    },
                });
                menu.add({
                    text: me.printText('buttons.install'),
                    iconClass: 'mi mi-archive-download',
                    hidden: record.get('status') !== 'NOT_INSTALLED',
                    handler: async () => {
                        me.modules.install(record.get('name'));
                        return true;
                    },
                });
                menu.add({
                    text: me.printText('buttons.update'),
                    iconClass: 'mi mi-archive-download',
                    hidden: record.get('status') !== 'NEED_UPDATE',
                    handler: async () => {
                        me.modules.install(record.get('name'));
                        return true;
                    },
                });
            },
        },
    });
});
