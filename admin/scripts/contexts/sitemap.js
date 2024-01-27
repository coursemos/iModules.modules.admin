/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트관리화면을 구성한다.
 *
 * @file /modules/admin/admin/scripts/contexts/sitemap.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
Admin.ready(async () => {
    const me = Admin.getModule('admin');
    return new Aui.Panel({
        id: 'sitemap-context',
        border: false,
        layout: 'column',
        iconClass: 'xi xi xi-sitemap',
        title: (await me.getText('admin.contexts.sitemap')),
        scrollable: true,
        items: [
            new Aui.Grid.Panel({
                id: 'domains',
                border: [false, true, false, false],
                width: 240,
                columnResizable: false,
                selection: { selectable: true },
                topbar: [
                    new Aui.Form.Field.Text({
                        name: 'keyword',
                        flex: 1,
                        emptyText: (await me.getText('keyword')),
                    }),
                    new Aui.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.sitemap.domains.add')),
                        handler: () => {
                            me.sitemap.domains.add();
                        },
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
                store: new Aui.Store.Ajax({
                    url: me.getProcessUrl('domains'),
                    primaryKeys: ['host'],
                }),
                columns: [
                    {
                        text: (await me.getText('admin.sitemap.domains.host')),
                        dataIndex: 'host',
                    },
                ],
                listeners: {
                    update: (grid) => {
                        if (Admin.getContextSubUrl(0) !== null && grid.getSelections().length == 0) {
                            grid.select({ host: Admin.getContextSubUrl(0) });
                        }
                    },
                    openItem: (record) => {
                        me.sitemap.domains.add(record.get('host'));
                    },
                    openMenu: (menu, record) => {
                        menu.setTitle(record.get('host'));
                        menu.add({
                            text: me.printText('admin.sitemap.domains.edit'),
                            iconClass: 'xi xi-form-checkout',
                            handler: () => {
                                me.sitemap.domains.add(record.get('host'));
                            },
                        });
                    },
                    selectionChange: (selections) => {
                        const sites = Aui.getComponent('sites');
                        if (selections.length == 1) {
                            const host = selections[0].get('host');
                            sites.getStore().setParams({ host: host });
                            sites.getStore().reload();
                            sites.enable();
                            Aui.getComponent('sitemap-context').properties.setUrl();
                        }
                        else {
                            sites.disable();
                        }
                    },
                },
            }),
            new Aui.Grid.Panel({
                id: 'sites',
                border: [false, true, false, true],
                width: 260,
                columnResizable: false,
                selection: { selectable: true },
                disabled: true,
                autoLoad: false,
                topbar: [
                    new Aui.Form.Field.Text({
                        name: 'keyword',
                        flex: 1,
                        emptyText: (await me.getText('keyword')),
                    }),
                    new Aui.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.sitemap.sites.add')),
                        handler: () => {
                            me.sitemap.sites.add();
                        },
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
                store: new Aui.Store.Ajax({
                    url: me.getProcessUrl('sites'),
                    primaryKeys: ['host', 'language'],
                }),
                columns: [
                    {
                        text: (await me.getText('admin.sitemap.sites.title')),
                        dataIndex: 'title',
                    },
                ],
                listeners: {
                    update: (grid) => {
                        if (Admin.getContextSubUrl(1) !== null && grid.getSelections().length == 0) {
                            grid.select({
                                host: Admin.getContextSubUrl(0),
                                language: Admin.getContextSubUrl(1),
                            });
                        }
                    },
                    openItem: (record) => {
                        me.sitemap.sites.add(record.get('language'));
                    },
                    openMenu: (menu, record) => {
                        menu.setTitle(record.get('title'));
                        menu.add({
                            text: me.printText('admin.sitemap.sites.edit'),
                            iconClass: 'xi xi-form-checkout',
                            handler: () => {
                                me.sitemap.sites.add(record.get('language'));
                            },
                        });
                    },
                    selectionChange: (selections) => {
                        const contexts = Aui.getComponent('contexts');
                        if (selections.length == 1) {
                            const host = selections[0].get('host');
                            const language = selections[0].get('language');
                            contexts.getStore().setParams({
                                host: host,
                                language: language,
                            });
                            contexts.getStore().reload();
                            contexts.enable();
                            Aui.getComponent('sitemap-context').properties.setUrl();
                        }
                        else {
                            contexts.disable();
                        }
                    },
                },
            }),
            new Aui.Tree.Panel({
                id: 'contexts',
                border: [false, false, false, true],
                flex: 2,
                minWidth: 400,
                columnResizable: true,
                selection: { selectable: true },
                disabled: true,
                autoLoad: false,
                topbar: [
                    new Aui.Form.Field.Text({
                        name: 'keyword',
                        flex: 1,
                        emptyText: (await me.getText('keyword')),
                    }),
                    new Aui.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.sitemap.contexts.add')),
                        handler: () => {
                            me.sitemap.contexts.add();
                        },
                    }),
                ],
                bottombar: [
                    new Aui.Button({
                        iconClass: 'mi mi-up',
                        handler: (button) => {
                            const grid = button.getParent().getParent();
                            const selections = grid.getSelections();
                            if (selections.length == 0) {
                                return;
                            }
                        },
                    }),
                    new Aui.Button({
                        iconClass: 'mi mi-down',
                        handler: (button) => {
                            const grid = button.getParent().getParent();
                            const selections = grid.getSelections();
                            if (selections.length == 0) {
                                return;
                            }
                        },
                    }),
                    '|',
                    new Aui.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button) => {
                            const grid = button.getParent().getParent();
                            grid.getStore().reload();
                        },
                    }),
                ],
                store: new Aui.TreeStore.Ajax({
                    url: me.getProcessUrl('contexts'),
                    primaryKeys: ['host', 'language', 'path'],
                    params: {
                        mode: 'tree',
                    },
                    sorters: { sort: 'ASC' },
                }),
                columns: [
                    {
                        text: (await me.getText('admin.sitemap.contexts.path')),
                        dataIndex: 'display',
                        minWidth: 250,
                    },
                    {
                        text: (await me.getText('admin.sitemap.contexts.title')),
                        dataIndex: 'title',
                        minWidth: 150,
                        flex: 1,
                    },
                    {
                        text: (await me.getText('admin.sitemap.contexts.type')),
                        dataIndex: 'type',
                        width: 250,
                        renderer: (value, record) => {
                            return me.sitemap.contexts.getTypeIcon(value) + record.data.context;
                        },
                    },
                    {
                        text: (await me.getText('admin.sitemap.contexts.layout')),
                        dataIndex: 'layout',
                        width: 100,
                    },
                ],
                listeners: {
                    openItem: (record) => {
                        me.sitemap.contexts.add(record.get('path'));
                    },
                    openMenu: (menu, record) => {
                        menu.setTitle(record.get('title'));
                        menu.add({
                            text: me.printText('admin.sitemap.contexts.edit'),
                            iconClass: 'xi xi-form-checkout',
                            handler: () => {
                                me.sitemap.contexts.add(record.get('path'));
                            },
                        });
                        menu.add({
                            text: me.printText('admin.sitemap.contexts.delete'),
                            iconClass: 'mi mi-trash',
                            handler: () => {
                                me.sitemap.contexts.delete(record.get('path'));
                            },
                        });
                    },
                },
            }),
        ],
        setUrl: () => {
            const domains = Aui.getComponent('domains');
            const host = domains.getSelections().at(0)?.get('host') ?? null;
            const sites = Aui.getComponent('sites');
            const language = sites.getSelections().at(0)?.get('language') ?? null;
            if (Admin.getContextSubUrl(0) !== host) {
                Admin.setContextSubUrl('/' + host);
            }
            if (language !== null && Admin.getContextSubUrl(1) !== language) {
                Admin.setContextSubUrl('/' + host + '/' + language);
            }
        },
    });
});
