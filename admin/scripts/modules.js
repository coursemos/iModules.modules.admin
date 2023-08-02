/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리화면을 구성한다.
 *
 * @file /modules/admin/admin/scripts/modules.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 1.
 */
Admin.ready(async () => {
    const me = Admin.getModule('admin');
    return new Admin.Grid.Panel({
        id: 'modules',
        iconClass: 'xi xi-box',
        border: false,
        layout: 'fit',
        title: (await me.getText('admin.modules.title')),
        selection: { selectable: true },
        autoLoad: true,
        topbar: [
            new Admin.Form.Field.Text({
                name: 'keyword',
                width: 200,
                emptyText: (await me.getText('keyword')),
            }),
            '->',
            new Admin.Button({
                iconClass: 'mi mi-refresh',
                text: (await me.getText('admin.modules.modules.update_size')),
            }),
        ],
        bottombar: [
            new Admin.Button({
                iconClass: 'mi mi-refresh',
                handler: (button) => {
                    const grid = button.getParent().getParent();
                    grid.getStore().reload();
                },
            }),
        ],
        columns: [
            {
                text: (await me.getText('admin.modules.modules.title')),
                dataIndex: 'title',
                width: 200,
                renderer: (value, record) => {
                    return record.data.icon + value;
                },
            },
            {
                text: (await me.getText('admin.modules.modules.version')),
                dataIndex: 'version',
                width: 80,
                textAlign: 'center',
            },
            {
                text: (await me.getText('admin.modules.modules.description')),
                dataIndex: 'description',
                minWidth: 200,
            },
            {
                text: (await me.getText('admin.modules.modules.author')),
                dataIndex: 'author',
                width: 160,
            },
            {
                text: (await me.getText('admin.modules.modules.status.title')),
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
                    return me.printText('admin.modules.modules.status.' + value);
                },
            },
            {
                text: (await me.getText('admin.modules.modules.databases')),
                dataIndex: 'databases',
                width: 100,
                textAlign: 'right',
                renderer: (value) => {
                    return Format.size(value);
                },
            },
            {
                text: (await me.getText('admin.modules.modules.attachments')),
                dataIndex: 'attachments',
                width: 100,
                textAlign: 'right',
                renderer: (value) => {
                    return Format.size(value);
                },
            },
        ],
        store: new Admin.Store.Ajax({
            url: me.getProcessUrl('modules'),
            primaryKeys: ['name'],
        }),
        listeners: {
            openItem: (record) => {
                me.modules.show(record.data.name);
            },
            openMenu: (menu, record) => {
                menu.setTitle(record.get('title'));
                menu.add({
                    text: me.printText('admin.modules.modules.show.title'),
                    iconClass: 'xi xi-form-checkout',
                    handler: () => {
                        me.modules.show(record.data.name);
                    },
                });
                menu.add({
                    text: me.printText('buttons.configs'),
                    iconClass: 'xi xi-cog',
                    hidden: record.data.properties.includes('CONFIGS') === false,
                    handler: () => {
                        me.modules.setConfigs(record.data.name);
                    },
                });
                menu.add({
                    text: me.printText('buttons.install'),
                    iconClass: 'xi xi-new',
                    hidden: record.data.status !== 'NOT_INSTALLED',
                    handler: () => {
                        me.modules.install(record.data.name);
                    },
                });
                menu.add({
                    text: me.printText('buttons.update'),
                    iconClass: 'xi xi-update',
                    hidden: record.data.status !== 'NEED_UPDATE',
                    handler: () => {
                        me.modules.install(record.data.name);
                    },
                });
            },
        },
    });
});
