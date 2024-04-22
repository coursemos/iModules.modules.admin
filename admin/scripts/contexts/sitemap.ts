/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트관리화면을 구성한다.
 *
 * @file /modules/admin/admin/scripts/contexts/sitemap.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 4. 22.
 */
Admin.ready(async () => {
    const me = Admin.getModule('admin') as modules.admin.admin.Admin;

    return new Aui.Panel({
        id: 'sitemap-context',
        border: false,
        layout: 'column',
        iconClass: 'xi xi xi-sitemap',
        title: (await me.getText('admin.contexts.sitemap')) as string,
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
                        emptyText: (await me.getText('keyword')) as string,
                    }),
                    new Aui.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.sitemap.domains.add')) as string,
                        handler: () => {
                            me.sitemap.domains.add();
                        },
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
                store: new Aui.Store.Remote({
                    url: me.getProcessUrl('domains'),
                    primaryKeys: ['host'],
                }),
                columns: [
                    {
                        text: (await me.getText('admin.sitemap.domains.host')) as string,
                        dataIndex: 'host',
                    },
                ],
                listeners: {
                    update: (grid) => {
                        if (Admin.getContextSubUrl(0) !== null && grid.getSelections().length == 0) {
                            grid.select({ host: Admin.getContextSubUrl(0) });

                            if (grid.getSelections().length == 0 && grid.getStore().getCount() > 0) {
                                grid.selectRow(0);
                            }
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
                            handler: async () => {
                                me.sitemap.domains.add(record.get('host'));
                                return true;
                            },
                        });

                        menu.add({
                            text: me.printText('admin.sitemap.domains.delete'),
                            iconClass: 'mi mi-trash',
                            handler: async () => {
                                me.sitemap.domains.delete(record.get('host'));
                                return true;
                            },
                        });
                    },
                    selectionChange: (selections) => {
                        const sites = Aui.getComponent('sites') as Aui.Grid.Panel;
                        if (selections.length == 1) {
                            const host = selections[0].get('host');
                            sites.getStore().setParams({ host: host });
                            sites.getStore().reload();
                            sites.enable();

                            Aui.getComponent('sitemap-context').properties.setUrl();
                        } else {
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
                        emptyText: (await me.getText('keyword')) as string,
                    }),
                    new Aui.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.sitemap.sites.add')) as string,
                        handler: () => {
                            me.sitemap.sites.add();
                        },
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
                store: new Aui.Store.Remote({
                    url: me.getProcessUrl('sites'),
                    primaryKeys: ['host', 'language'],
                }),
                columns: [
                    {
                        text: (await me.getText('admin.sitemap.sites.title')) as string,
                        dataIndex: 'title',
                        renderer: (value, record) => {
                            return '<b class="language">' + record.get('language') + '</b>' + value;
                        },
                    },
                ],
                listeners: {
                    update: (grid) => {
                        if (Admin.getContextSubUrl(1) !== null && grid.getSelections().length == 0) {
                            grid.select({
                                host: Admin.getContextSubUrl(0),
                                language: Admin.getContextSubUrl(1),
                            });

                            if (grid.getSelections().length == 0 && grid.getStore().getCount() > 0) {
                                grid.selectRow(0);
                            }
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
                            handler: async () => {
                                me.sitemap.sites.add(record.get('language'));
                                return true;
                            },
                        });

                        menu.add({
                            text: me.printText('admin.sitemap.sites.delete'),
                            iconClass: 'mi mi-trash',
                            handler: async () => {
                                me.sitemap.sites.delete(record.get('language'));
                                return true;
                            },
                        });
                    },
                    selectionChange: (selections) => {
                        const contexts = Aui.getComponent('contexts') as Aui.Grid.Panel;
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
                        } else {
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
                        emptyText: (await me.getText('keyword')) as string,
                    }),
                    new Aui.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.sitemap.contexts.add')) as string,
                        handler: () => {
                            me.sitemap.contexts.add();
                        },
                    }),
                ],
                bottombar: [
                    new Aui.Button({
                        iconClass: 'mi mi-caret-up',
                        handler: async (button) => {
                            const grid = button.getParent().getParent() as Aui.Grid.Panel;
                            const selections = grid.getSelections();
                            if (selections.length == 0) {
                                return;
                            }

                            button.setLoading(true);

                            const context = selections[0];
                            const children = context.getParents().pop().getChildren();
                            if (context.get('sort') > 0) {
                                const move = context.get('sort') - 1;
                                for (const child of children) {
                                    if (child.get('sort') == move) {
                                        child.set('sort', context.get('sort'));
                                        break;
                                    }
                                }
                                context.set('sort', move);
                                await grid.getStore().sort('sort', 'ASC');
                                await grid.getStore().commit();
                                grid.select(context);
                                button.setLoading(false);
                            }
                        },
                    }),
                    new Aui.Button({
                        iconClass: 'mi mi-caret-down',
                        handler: async (button) => {
                            const grid = button.getParent().getParent() as Aui.Grid.Panel;
                            const selections = grid.getSelections();
                            if (selections.length == 0) {
                                return;
                            }

                            button.setLoading(true);

                            const context = selections[0];
                            const children = context.getParents().pop().getChildren();
                            if (context.get('sort') + 1 < children.length) {
                                const move = context.get('sort') + 1;
                                for (const child of children) {
                                    if (child.get('sort') == move) {
                                        child.set('sort', context.get('sort'));
                                        break;
                                    }
                                }
                                context.set('sort', move);
                                await grid.getStore().sort('sort', 'ASC');
                                await grid.getStore().commit();
                                grid.select(context);
                                button.setLoading(false);
                            }
                        },
                    }),
                    '|',
                    new Aui.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button) => {
                            const grid = button.getParent().getParent() as Aui.Grid.Panel;
                            grid.getStore().reload();
                        },
                    }),
                ],
                store: new Aui.TreeStore.Remote({
                    url: me.getProcessUrl('contexts'),
                    primaryKeys: ['host', 'language', 'path'],
                    params: {
                        mode: 'tree',
                    },
                    sorters: { sort: 'ASC' },
                }),
                columns: [
                    {
                        text: (await me.getText('admin.sitemap.contexts.path')) as string,
                        dataIndex: 'path',
                        minWidth: 250,
                        renderer: (_value, record) => {
                            return record.get('display');
                        },
                    },
                    {
                        text: (await me.getText('admin.sitemap.contexts.title')) as string,
                        dataIndex: 'title',
                        minWidth: 150,
                        flex: 1,
                    },
                    {
                        text: (await me.getText('admin.sitemap.contexts.type')) as string,
                        dataIndex: 'type',
                        width: 250,
                        renderer: (value, record) => {
                            return me.sitemap.contexts.getTypeIcon(value) + record.get('context');
                        },
                    },
                    {
                        text: (await me.getText('admin.sitemap.contexts.layout')) as string,
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
                            handler: async () => {
                                me.sitemap.contexts.add(record.get('path'));
                                return true;
                            },
                        });

                        menu.add({
                            text: me.printText('admin.sitemap.contexts.delete'),
                            iconClass: 'mi mi-trash',
                            handler: async () => {
                                me.sitemap.contexts.delete(record.get('path'));
                                return true;
                            },
                        });
                    },
                },
            }),
        ],
        setUrl: () => {
            const domains = Aui.getComponent('domains') as Aui.Grid.Panel;
            const host = domains.getSelections().at(0)?.get('host') ?? null;

            const sites = Aui.getComponent('sites') as Aui.Grid.Panel;
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
