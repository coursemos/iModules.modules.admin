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
    const me = Admin.getModule('admin') as modules.admin.AdminAdmin;

    return new Admin.Panel({
        border: false,
        layout: 'column',
        iconClass: 'mi mi-home',
        title: (await me.getText('admin/sites/title')) as string,
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
                        emptyText: (await me.getText('keyword')) as string,
                    }),
                    new Admin.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin/sites/domains/add')) as string,
                        handler: () => {
                            me.addDomain();
                        },
                    }),
                ],
                bottombar: [
                    new Admin.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button: Admin.Button) => {
                            const grid = button.getParent().getParent() as Admin.Grid.Panel;
                            grid.getStore().reload();
                        },
                    }),
                ],
                columns: [
                    {
                        text: (await me.getText('admin/sites/domains/host')) as string,
                        dataIndex: 'host',
                    },
                ],
                store: new Admin.Store.Ajax({
                    url: me.getProcessUrl('domains'),
                    primaryKeys: ['host'],
                }),
                listeners: {
                    update: (grid: Admin.Grid.Panel, store: Admin.Store) => {
                        if (Admin.getContextSubTree().at(0) !== undefined && grid.getSelections().length == 0) {
                            const index = store.findIndex('host', Admin.getContextSubTree().at(0));
                            if (index !== null) {
                                grid.select(index);
                            }
                        }
                    },
                    openItem: (record: Admin.Data.Record) => {
                        me.addDomain(record.data.host);
                    },
                    openMenu: (record: Admin.Data.Record) => {
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
                    selectionChange: (selections: Admin.Data.Record[]) => {
                        const sites = Admin.getComponent('sites') as Admin.Grid.Panel;
                        if (selections.length == 1) {
                            const store = sites.getStore() as Admin.Store.Ajax;
                            store.setParams({ host: selections[0].get('host') });
                            store.reload();
                            sites.enable();

                            Admin.setContextUrl(Admin.getContextUrl('/' + selections[0].get('host')));
                        } else {
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
                        emptyText: (await me.getText('keyword')) as string,
                    }),
                    new Admin.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin/sites/sites/add')) as string,
                        handler: () => {
                            me.addSite();
                        },
                    }),
                ],
                bottombar: [
                    new Admin.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button: Admin.Button) => {
                            const grid = button.getParent().getParent() as Admin.Grid.Panel;
                            grid.getStore().reload();
                        },
                    }),
                ],
                columns: [
                    {
                        text: (await me.getText('admin/sites/sites/title')) as string,
                        dataIndex: 'title',
                    },
                ],
                store: new Admin.Store.Ajax({
                    url: me.getProcessUrl('sites'),
                }),
                listeners: {
                    update: (grid: Admin.Grid.Panel, store: Admin.Store) => {
                        if (Admin.getContextSubTree().at(1) !== undefined && grid.getSelections().length == 0) {
                            const index = store.findIndex('language', Admin.getContextSubTree().at(1));
                            if (index !== null) {
                                grid.select(index);
                            }
                        }
                    },
                    openItem: (record: Admin.Data.Record) => {
                        me.addSite(record.data.language);
                    },
                    openMenu: (record: Admin.Data.Record) => {
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
                    selectionChange: (selections: Admin.Data.Record[]) => {
                        const sitemap = Admin.getComponent('sitemap') as Admin.Grid.Panel;
                        if (selections.length == 1) {
                            const store = sitemap.getStore() as Admin.Store.Ajax;
                            store.setParams({
                                host: selections[0].get('host'),
                                language: selections[0].get('language'),
                            });
                            store.reload();
                            sitemap.enable();
                            Admin.setContextUrl(
                                Admin.getContextUrl(
                                    '/' + selections[0].get('host') + '/' + selections[0].get('language')
                                )
                            );
                        } else {
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
                        emptyText: (await me.getText('keyword')) as string,
                    }),
                    new Admin.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin/sites/sitemap/add')) as string,
                        handler: () => {
                            me.addSitemap();
                        },
                    }),
                ],
                bottombar: [
                    new Admin.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button: Admin.Button) => {
                            const grid = button.getParent().getParent() as Admin.Grid.Panel;
                            grid.getStore().reload();
                        },
                    }),
                ],
                columns: [
                    {
                        text: (await me.getText('admin/sites/sitemap/path')) as string,
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
