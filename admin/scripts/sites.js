/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트관리화면을 구성한다.
 *
 * @file /modules/admin/admin/scripts/sites.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 2.
 */
Admin.ready(async () => {
    const me = Admin.getModule('admin');
    return new Admin.Panel({
        border: false,
        layout: 'column',
        iconClass: 'mi mi-home',
        title: (await me.getText('admin.sites.title')),
        scrollable: true,
        items: [
            new Admin.Grid.Panel({
                id: 'domains',
                border: [false, true, false, false],
                width: 240,
                columnResizable: false,
                selectionMode: 'SINGLE',
                topbar: [
                    new Admin.Form.Field.Text({
                        name: 'keyword',
                        flex: 1,
                        emptyText: (await me.getText('keyword')),
                    }),
                    new Admin.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.sites.domains.add')),
                        handler: () => {
                            me.addDomain();
                        },
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
                        text: (await me.getText('admin.sites.domains.host')),
                        dataIndex: 'host',
                    },
                ],
                store: new Admin.Store.Ajax({
                    url: me.getProcessUrl('domains'),
                    primaryKeys: ['host'],
                }),
                listeners: {
                    update: (grid, store) => {
                        if (Admin.getContextSubTree().at(0) !== undefined && grid.getSelections().length == 0) {
                            const index = store.findIndex('host', Admin.getContextSubTree().at(0));
                            if (index !== null) {
                                grid.select(index);
                            }
                        }
                    },
                    openItem: (record) => {
                        me.addDomain(record.get('host'));
                    },
                    openMenu: (menu, record) => {
                        menu.setTitle(record.get('host'));
                        menu.add({
                            text: me.printText('admin.sites.domains.edit'),
                            iconClass: 'xi xi-form-checkout',
                            handler: () => {
                                me.addSite(record.get('host'));
                            },
                        });
                    },
                    selectionChange: (selections) => {
                        const sites = Admin.getComponent('sites');
                        if (selections.length == 1) {
                            const store = sites.getStore();
                            store.setParams({ host: selections[0].get('host') });
                            store.reload();
                            sites.enable();
                            if (Admin.getContextSubTree().at(0) !== selections[0].get('host')) {
                                Admin.setContextUrl(Admin.getContextUrl('/' + selections[0].get('host')));
                            }
                        }
                        else {
                            sites.disable();
                        }
                    },
                },
            }),
            new Admin.Grid.Panel({
                id: 'sites',
                border: [false, true, false, true],
                width: 260,
                columnResizable: false,
                selectionMode: 'SINGLE',
                disabled: true,
                autoLoad: false,
                topbar: [
                    new Admin.Form.Field.Text({
                        name: 'keyword',
                        flex: 1,
                        emptyText: (await me.getText('keyword')),
                    }),
                    new Admin.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.sites.sites.add')),
                        handler: () => {
                            me.addSite();
                        },
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
                        text: (await me.getText('admin.sites.sites.title')),
                        dataIndex: 'title',
                    },
                ],
                store: new Admin.Store.Ajax({
                    url: me.getProcessUrl('sites'),
                    primaryKeys: ['host', 'language'],
                }),
                listeners: {
                    update: (grid, store) => {
                        if (Admin.getContextSubTree().at(1) !== undefined && grid.getSelections().length == 0) {
                            const index = store.findIndex('language', Admin.getContextSubTree().at(1));
                            if (index !== null) {
                                grid.select(index);
                            }
                        }
                    },
                    openItem: (record) => {
                        me.addSite(record.get('language'));
                    },
                    openMenu: (menu, record) => {
                        menu.setTitle(record.get('title'));
                        menu.add({
                            text: me.printText('admin.sites.sites.edit'),
                            iconClass: 'xi xi-form-checkout',
                            handler: () => {
                                me.addSite(record.get('language'));
                            },
                        });
                    },
                    selectionChange: (selections) => {
                        const contexts = Admin.getComponent('contexts');
                        if (selections.length == 1) {
                            const store = contexts.getStore();
                            store.setParams({
                                host: selections[0].get('host'),
                                language: selections[0].get('language'),
                            });
                            store.reload();
                            contexts.enable();
                            if (Admin.getContextSubTree().at(0) !== selections[0].get('host') ||
                                Admin.getContextSubTree().at(1) !== selections[0].get('language')) {
                                Admin.setContextUrl(Admin.getContextUrl('/' + selections[0].get('host') + '/' + selections[0].get('language')));
                            }
                        }
                        else {
                            contexts.disable();
                        }
                    },
                },
            }),
            new Admin.Grid.Panel({
                id: 'contexts',
                border: [false, false, false, true],
                flex: 2,
                minWidth: 400,
                columnResizable: false,
                selectionMode: 'SINGLE',
                disabled: true,
                autoLoad: false,
                topbar: [
                    new Admin.Form.Field.Text({
                        name: 'keyword',
                        flex: 1,
                        emptyText: (await me.getText('keyword')),
                    }),
                    new Admin.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.sites.contexts.add')),
                        handler: () => {
                            me.addContext();
                        },
                    }),
                ],
                bottombar: [
                    new Admin.Button({
                        iconClass: 'mi mi-up',
                        handler: (button) => {
                            const grid = button.getParent().getParent();
                            const selections = grid.getSelections();
                            if (selections.length == 0) {
                                return;
                            }
                            //
                        },
                    }),
                    new Admin.Button({
                        iconClass: 'mi mi-down',
                        handler: (button) => {
                            const grid = button.getParent().getParent();
                            const selections = grid.getSelections();
                            if (selections.length == 0) {
                                return;
                            }
                            //
                        },
                    }),
                    '|',
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
                        text: (await me.getText('admin.sites.contexts.path')),
                        dataIndex: 'path',
                    },
                    {
                        dataIndex: 'sort',
                        width: 80,
                    },
                ],
                store: new Admin.Store.Ajax({
                    url: me.getProcessUrl('contexts'),
                    primaryKeys: ['host', 'language', 'path'],
                    sorters: { sort: 'ASC' },
                }),
                listeners: {
                    openItem: (record) => {
                        me.addContext(record.get('path'));
                    },
                    openMenu: (menu, record) => {
                        menu.setTitle(record.get('title'));
                        menu.add({
                            text: me.printText('admin.sites.contexts.edit'),
                            iconClass: 'xi xi-form-checkout',
                            handler: () => {
                                me.addContext(record.get('path'));
                            },
                        });
                    },
                },
            }),
        ],
        listeners: {
            render: () => {
                me.addSite();
            },
        },
    });
});
