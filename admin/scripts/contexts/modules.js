/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리화면을 구성한다.
 *
 * @file /modules/admin/admin/scripts/contexts/modules.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 4. 18.
 */
Admin.ready(async () => {
    const me = Admin.getModule('admin');
    return new Aui.Grid.Panel({
        id: 'modules',
        iconClass: 'xi xi-box',
        border: false,
        layout: 'fit',
        title: (await me.getText('admin.contexts.modules')),
        selection: { selectable: true },
        autoLoad: true,
        topbar: [
            new Aui.Form.Field.Text({
                name: 'keyword',
                width: 200,
                emptyText: (await me.getText('keyword')),
            }),
            '->',
            new Aui.Button({
                iconClass: 'mi mi-refresh',
                text: (await me.getText('admin.modules.update_size')),
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
        }),
        columns: [
            {
                text: (await me.getText('admin.modules.title')),
                dataIndex: 'title',
                width: 200,
                renderer: (value, record) => {
                    return record.get('icon') + value;
                },
            },
            {
                text: (await me.getText('admin.modules.version')),
                dataIndex: 'version',
                width: 80,
                textAlign: 'center',
            },
            {
                text: (await me.getText('admin.modules.description')),
                dataIndex: 'description',
                minWidth: 200,
            },
            {
                text: (await me.getText('admin.modules.author')),
                dataIndex: 'author',
                width: 160,
            },
            {
                text: (await me.getText('admin.modules.status.title')),
                dataIndex: 'status',
                width: 100,
                textAlign: 'center',
                renderer: (value, _record, $dom) => {
                    if (value == 'INSTALLED') {
                        $dom.setStyle('color', 'var(--color-primary)');
                    }
                    else if (value == 'NOT_INSTALLED') {
                        $dom.setStyle('color', 'var(--color-gray-800)');
                    }
                    else {
                        $dom.setStyle('color', 'var(--color-danger-500)');
                    }
                    return me.printText('admin.modules.status.' + value);
                },
            },
            {
                text: (await me.getText('admin.modules.databases')),
                dataIndex: 'databases',
                width: 100,
                textAlign: 'right',
                renderer: (value) => {
                    return Format.size(value);
                },
            },
            {
                text: (await me.getText('admin.modules.attachments')),
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
                    iconClass: 'xi xi-form-checkout',
                    handler: async () => {
                        me.modules.show(record.get('name'));
                        return true;
                    },
                });
                menu.add({
                    text: me.printText('buttons.configs'),
                    iconClass: 'xi xi-cog',
                    hidden: record.get('properties').includes('CONFIGS') === false,
                    handler: async () => {
                        me.modules.setConfigs(record.get('name'));
                        return true;
                    },
                });
                menu.add({
                    text: me.printText('buttons.install'),
                    iconClass: 'xi xi-new',
                    hidden: record.get('status') !== 'NOT_INSTALLED',
                    handler: async () => {
                        me.modules.install(record.get('name'));
                        return true;
                    },
                });
                menu.add({
                    text: me.printText('buttons.update'),
                    iconClass: 'xi xi-update',
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
