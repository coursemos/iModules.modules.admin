/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리화면을 구성한다.
 *
 * @file /modules/admin/admin/scripts/contexts/modules.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
Admin.ready(async () => {
    const me = Admin.getModule('admin') as modules.admin.admin.Admin;

    return new Aui.Grid.Panel({
        id: 'modules',
        iconClass: 'xi xi-box',
        border: false,
        layout: 'fit',
        title: (await me.getText('admin.contexts.modules')) as string,
        selection: { selectable: true },
        autoLoad: true,
        topbar: [
            new Aui.Form.Field.Text({
                name: 'keyword',
                width: 200,
                emptyText: (await me.getText('keyword')) as string,
            }),
            '->',
            new Aui.Button({
                iconClass: 'mi mi-refresh',
                text: (await me.getText('admin.modules.update_size')) as string,
            }),
        ],
        bottombar: [
            new Aui.Button({
                iconClass: 'mi mi-refresh',
                handler: (button) => {
                    const grid = button.getParent().getParent() as Aui.Grid.Panel;
                    grid.getStore().reload();
                },
            }),
        ],
        store: new Aui.Store.Ajax({
            url: me.getProcessUrl('modules'),
            primaryKeys: ['name'],
        }),
        columns: [
            {
                text: (await me.getText('admin.modules.title')) as string,
                dataIndex: 'title',
                width: 200,
                renderer: (value, record) => {
                    return record.data.icon + value;
                },
            },
            {
                text: (await me.getText('admin.modules.version')) as string,
                dataIndex: 'version',
                width: 80,
                textAlign: 'center',
            },
            {
                text: (await me.getText('admin.modules.description')) as string,
                dataIndex: 'description',
                minWidth: 200,
            },
            {
                text: (await me.getText('admin.modules.author')) as string,
                dataIndex: 'author',
                width: 160,
            },
            {
                text: (await me.getText('admin.modules.status.title')) as string,
                dataIndex: 'status',
                width: 100,
                textAlign: 'center',
                renderer: (value, _record, $dom) => {
                    if (value == 'INSTALLED') {
                        $dom.setStyle('color', 'var(--color-primary)');
                    } else if (value == 'NOT_INSTALLED') {
                        $dom.setStyle('color', 'var(--color-gray-800)');
                    } else {
                        $dom.setStyle('color', 'var(--color-danger-500)');
                    }
                    return me.printText('admin.modules.status.' + value);
                },
            },
            {
                text: (await me.getText('admin.modules.databases')) as string,
                dataIndex: 'databases',
                width: 100,
                textAlign: 'right',
                renderer: (value) => {
                    return Format.size(value);
                },
            },
            {
                text: (await me.getText('admin.modules.attachments')) as string,
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
                me.modules.show(record.data.name);
            },
            openMenu: (menu, record) => {
                menu.setTitle(record.get('title'));
                menu.add({
                    text: me.printText('admin.modules.show.title'),
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
