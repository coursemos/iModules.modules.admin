/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트관리화면을 구성한다.
 *
 * @file /modules/admin/admin/scripts/sites.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 4. 3.
 */
Admin.ready(async () => {
    const me = Admin.getModule('admin');
    return new Admin.Panel({
        border: false,
        layout: 'column',
        iconClass: 'mi mi-home',
        title: (await me.getText('admin/sites/title')),
        scrollable: true,
        items: [
            new Admin.Grid.Panel({
                id: 'domains',
                border: [false, true, false, false],
                flex: 1,
                minWidth: 200,
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
                        text: (await me.getText('admin/sites/domains/add')),
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
                        text: (await me.getText('admin/sites/domains/host')),
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
                        me.addDomain(record.data.host);
                    },
                    openMenu: (record) => {
                        new Admin.Menu({
                            title: record.data.host,
                            items: [
                                {
                                    text: me.printText('admin/sites/domains/edit'),
                                    iconClass: 'xi xi-form-checkout',
                                    handler: () => {
                                        me.addDomain(record.data.host);
                                    },
                                },
                            ],
                        }).show();
                    },
                    selectionChange: (selections) => {
                        const sites = Admin.getComponent('sites');
                        if (selections.length == 1) {
                            const store = sites.getStore();
                            store.setParams({ host: selections[0].get('host') });
                            store.reload();
                            sites.enable();
                            Admin.setContextUrl(Admin.getContextUrl('/' + selections[0].get('host')));
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
                flex: 1,
                minWidth: 200,
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
                        text: (await me.getText('admin/sites/sites/add')),
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
                        text: (await me.getText('admin/sites/sites/title')),
                        dataIndex: 'title',
                    },
                ],
                store: new Admin.Store.Ajax({
                    url: me.getProcessUrl('sites'),
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
                        me.addSite(record.data.language);
                    },
                    openMenu: (record) => {
                        new Admin.Menu({
                            title: record.data.host,
                            items: [
                                {
                                    text: me.printText('admin/sites/domains/edit'),
                                    iconClass: 'xi xi-form-checkout',
                                    handler: () => {
                                        me.addDomain(record.data.host);
                                    },
                                },
                            ],
                        }).show();
                    },
                    selectionChange: (selections) => {
                        const sitemap = Admin.getComponent('sitemap');
                        if (selections.length == 1) {
                            const store = sitemap.getStore();
                            store.setParams({
                                host: selections[0].get('host'),
                                language: selections[0].get('language'),
                            });
                            store.reload();
                            sitemap.enable();
                            Admin.setContextUrl(Admin.getContextUrl('/' + selections[0].get('host') + '/' + selections[0].get('language')));
                        }
                        else {
                            sitemap.disable();
                        }
                    },
                },
            }),
            new Admin.Grid.Panel({
                id: 'sitemap',
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
                        text: (await me.getText('admin/sites/sitemap/add')),
                        handler: () => {
                            me.addSitemap();
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
                        text: (await me.getText('admin/sites/sitemap/path')),
                        dataIndex: 'path',
                    },
                ],
                store: new Admin.Store.Ajax({
                    url: me.getProcessUrl('sites'),
                }),
            }),
        ],
    });
});
