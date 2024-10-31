/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 데이터베이스 관리화면을 구성한다.
 *
 * @file /modules/admin/admin/scripts/contexts/database.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 30.
 */
Admin.ready(async () => {
    const me = Admin.getModule('admin') as modules.admin.admin.Admin;

    return new Aui.Panel({
        id: 'database-context',
        border: false,
        layout: 'column',
        iconClass: 'mi mi-database',
        title: await me.getText('admin.contexts.database'),
        scrollable: true,
        items: [
            new Aui.Tree.Panel({
                id: 'tables',
                border: [false, true, false, false],
                width: 300,
                columnResizable: false,
                selection: { selectable: true },
                class: 'database',
                topbar: [
                    new Aui.Form.Field.Search({
                        name: 'keyword',
                        flex: 1,
                        emptyText: await me.getText('keyword'),
                        liveSearch: true,
                        handler: async (keyword, field) => {
                            const tree = field.getParent().getParent() as Aui.Tree.Panel;
                            if (keyword.length == 0) {
                                tree.getStore().resetFilter('name');
                            } else {
                                tree.getStore().setFilter('name', keyword, 'like');
                            }
                        },
                    }),
                    new Aui.Button({
                        iconClass: 'mi mi-plus',
                        text: await me.getText('admin.database.tables.add'),
                        handler: () => {
                            //
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
                store: new Aui.TreeStore.Remote({
                    url: me.getProcessUrl('tables'),
                    params: { mode: 'tree' },
                    primaryKeys: ['name'],
                }),
                columns: [
                    {
                        text: await me.getText('admin.database.tables.name'),
                        dataIndex: 'name',
                        renderer: (value) => {
                            return value == '@' ? me.printText('admin.database.tables.all') : value;
                        },
                    },
                ],
                listeners: {
                    update: (tree) => {
                        if (Admin.getContextSubUrl(0) !== null) {
                            tree.select({ name: Admin.getContextSubUrl(0) });

                            if (tree.getSelections().length == 0 && tree.getStore().getCount() > 0) {
                                tree.selectRow([0]);
                            }
                        } else {
                            tree.selectRow([0]);
                        }
                    },
                    openItem: (record) => {
                        me.sitemap.domains.add(record.get('name'));
                    },
                    openMenu: (menu, record) => {
                        menu.setTitle(record.get('name'));
                    },
                    selectionChange: (selections) => {
                        const context = Aui.getComponent('database-context') as Aui.Panel;
                        const table = Aui.getComponent('table') as Aui.Panel;
                        table.removeAll();

                        if (selections.length == 1) {
                            const name = selections[0].get('name');
                            const comment = selections[0].get('comment');

                            if (name == '@') {
                                context.getTitle().setTitle(me.printText('admin.contexts.database'));

                                table.append(
                                    new Aui.Grid.Panel({
                                        layout: 'fit',
                                        border: false,
                                        topbar: [
                                            new Aui.Form.Field.Search({
                                                width: 200,
                                                emptyText: me.printText('keyword'),
                                                liveSearch: true,
                                                handler: async (keyword, field) => {
                                                    const grid = field.getParent().getParent() as Aui.Grid.Panel;
                                                    if (keyword.length == 0) {
                                                        grid.getStore().resetFilter('name');
                                                    } else {
                                                        grid.getStore().setFilter('name', keyword, 'like');
                                                    }
                                                },
                                            }),
                                            '->',
                                            new Aui.Button({
                                                iconClass: 'mi mi-placeholder',
                                                text: me.printText('admin.database.tables.truncate'),
                                                handler: (button) => {
                                                    const grid = button.getParent().getParent() as Aui.Grid.Panel;
                                                    me.database.tables.delete(grid, 'truncate');
                                                },
                                            }),
                                            new Aui.Button({
                                                iconClass: 'mi mi-trash',
                                                text: me.printText('admin.database.tables.drop'),
                                                handler: (button) => {
                                                    const grid = button.getParent().getParent() as Aui.Grid.Panel;
                                                    me.database.tables.delete(grid, 'drop');
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
                                            new Aui.SegmentedButton({
                                                value: 'ALL',
                                                items: [
                                                    new Aui.Button({
                                                        value: 'ALL',
                                                        text: me.printText('admin.database.status.ALL'),
                                                    }),
                                                    new Aui.Button({
                                                        value: 'USED',
                                                        text: me.printText('admin.database.status.USED'),
                                                    }),
                                                    new Aui.Button({
                                                        value: 'BACKUP',
                                                        text: me.printText('admin.database.status.BACKUP'),
                                                    }),
                                                    new Aui.Button({
                                                        value: 'UNKNOWN',
                                                        text: me.printText('admin.database.status.UNKNOWN'),
                                                    }),
                                                ],
                                                listeners: {
                                                    change: (button, value) => {
                                                        const grid = button.getParent().getParent() as Aui.Grid.Panel;
                                                        if (value == 'ALL') {
                                                            grid.getStore().resetFilter('status');
                                                        } else {
                                                            grid.getStore().setFilter('status', value);
                                                        }
                                                    },
                                                },
                                            }),
                                        ],
                                        store: new Aui.Store.Remote({
                                            url: me.getProcessUrl('tables'),
                                            primaryKeys: ['name'],
                                        }),
                                        freeze: 1,
                                        selection: { selectable: true, type: 'check' },
                                        columns: [
                                            {
                                                text: me.printText('admin.database.tables.name'),
                                                dataIndex: 'name',
                                                width: 300,
                                            },
                                            {
                                                text: me.printText('admin.database.tables.status'),
                                                dataIndex: 'status',
                                                width: 90,
                                                textAlign: 'center',
                                                renderer: (value, _record, $column) => {
                                                    if (value == 'USED') {
                                                        $column.setStyle('color', 'var(--aui-color-accent-500)');
                                                    } else if (value == 'UNKNOWN') {
                                                        $column.setStyle('color', 'var(--aui-color-background-100)');
                                                    } else if (value == 'BACKUP') {
                                                        $column.setStyle('color', 'var(--aui-color-danger-500)');
                                                    }

                                                    return me.printText('admin.database.status.' + value);
                                                },
                                            },
                                            {
                                                text: me.printText('admin.database.tables.engine'),
                                                dataIndex: 'engine',
                                                width: 80,
                                                textAlign: 'center',
                                            },
                                            {
                                                text: me.printText('admin.database.tables.row'),
                                                dataIndex: 'rows',
                                                width: 80,
                                                textAlign: 'right',
                                                renderer: (value) => {
                                                    return Format.number(value);
                                                },
                                            },
                                            {
                                                text: me.printText('admin.database.tables.data_size'),
                                                dataIndex: 'data_size',
                                                width: 100,
                                                textAlign: 'right',
                                                renderer: (value) => {
                                                    return Format.size(value);
                                                },
                                            },
                                            {
                                                text: me.printText('admin.database.tables.index_size'),
                                                dataIndex: 'index_size',
                                                width: 100,
                                                textAlign: 'right',
                                                renderer: (value) => {
                                                    return Format.size(value);
                                                },
                                            },
                                            {
                                                text: me.printText('admin.database.tables.table_size'),
                                                dataIndex: 'table_size',
                                                width: 100,
                                                textAlign: 'right',
                                                renderer: (value) => {
                                                    return Format.size(value);
                                                },
                                            },
                                            {
                                                text: me.printText('admin.database.tables.collation'),
                                                dataIndex: 'collation',
                                                width: 160,
                                                textAlign: 'center',
                                            },
                                            {
                                                text: me.printText('admin.database.tables.comment'),
                                                dataIndex: 'comment',
                                                minWidth: 200,
                                                flex: 1,
                                            },
                                        ],
                                        listeners: {
                                            openMenu: (menu, record, _rowIndex, grid) => {
                                                menu.setTitle(record.get('name'));

                                                menu.add({
                                                    iconClass: 'mi mi-form-edit',
                                                    text: me.printText('admin.database.tables.show'),
                                                    handler: async () => {
                                                        const tree = Aui.getComponent('tables') as Aui.Tree.Panel;
                                                        tree.select({ name: record.get('name') });
                                                        return true;
                                                    },
                                                });

                                                menu.add('-');

                                                menu.add({
                                                    iconClass: 'mi mi-placeholder',
                                                    text: me.printText('admin.database.tables.truncate'),
                                                    handler: async () => {
                                                        me.database.tables.delete(grid, 'truncate');
                                                        return true;
                                                    },
                                                });

                                                menu.add({
                                                    iconClass: 'mi mi-trash',
                                                    text: me.printText('admin.database.tables.drop'),
                                                    handler: async () => {
                                                        me.database.tables.delete(grid, 'drop');
                                                        return true;
                                                    },
                                                });
                                            },
                                            openMenus: (menu, selections, grid) => {
                                                menu.setTitle(
                                                    Aui.printText('texts.selected', {
                                                        count: selections.length.toString(),
                                                    })
                                                );

                                                menu.add({
                                                    iconClass: 'mi mi-placeholder',
                                                    text: me.printText('admin.database.tables.truncate'),
                                                    handler: async () => {
                                                        me.database.tables.delete(grid, 'truncate');
                                                        return true;
                                                    },
                                                });

                                                menu.add({
                                                    iconClass: 'mi mi-trash',
                                                    text: me.printText('admin.database.tables.drop'),
                                                    handler: async () => {
                                                        me.database.tables.delete(grid, 'drop');
                                                        return true;
                                                    },
                                                });
                                            },
                                        },
                                    })
                                );
                            } else {
                                context.getTitle().setTitle(name + (comment ? ' (' + comment + ')' : ''));

                                table.append(
                                    new Aui.Tab.Panel({
                                        id: name,
                                        border: false,
                                        layout: 'fit',
                                        tabPosition: 'bottom',
                                        tabSize: 'small',
                                        items: [
                                            new Aui.Grid.Panel({
                                                id: 'columns',
                                                title: me.printText('admin.database.table.columns'),
                                                iconClass: 'mi mi-table',
                                                layout: 'fit',
                                                border: false,
                                                topbar: [
                                                    new Aui.Button({
                                                        text: '테이블구조업데이트',
                                                        disabled: true,
                                                    }),
                                                ],
                                                bottombar: [
                                                    new Aui.Button({
                                                        iconClass: 'mi mi-refresh',
                                                        handler: (button) => {
                                                            const tab = button
                                                                .getParent()
                                                                .getParent()
                                                                .getParent() as Aui.Tab.Panel;
                                                            tab.properties.getTable(name);
                                                        },
                                                    }),
                                                ],
                                                store: new Aui.Store.Local({
                                                    fields: [
                                                        'name',
                                                        'typelength',
                                                        'collation',
                                                        { name: 'is_null', type: 'boolean' },
                                                        { name: 'is_primary', type: 'boolean' },
                                                        'default',
                                                        { name: 'auto_increment', type: 'boolean' },
                                                        'comment',
                                                    ],
                                                    records: [],
                                                    primaryKeys: ['name'],
                                                }),
                                                freeze: 1,
                                                selection: { selectable: true, type: 'check' },
                                                columns: [
                                                    {
                                                        text: me.printText('admin.database.columns.name'),
                                                        dataIndex: 'name',
                                                        width: 140,
                                                        renderer: (value, record) => {
                                                            if (record.get('is_primary') == true) {
                                                                return value + ' <i class="mi mi-key"></i>';
                                                            } else {
                                                                return value;
                                                            }
                                                        },
                                                    },
                                                    {
                                                        text: me.printText('admin.database.columns.type'),
                                                        dataIndex: 'typelength',
                                                        width: 150,
                                                    },
                                                    {
                                                        text: me.printText('admin.database.columns.collation'),
                                                        dataIndex: 'collation',
                                                        width: 160,
                                                        textAlign: 'center',
                                                    },
                                                    {
                                                        text: me.printText('admin.database.columns.is_null'),
                                                        dataIndex: 'is_null',
                                                        width: 80,
                                                        textAlign: 'center',
                                                        renderer: (value) => {
                                                            if (value == true) {
                                                                return 'NULL';
                                                            } else {
                                                                return '';
                                                            }
                                                        },
                                                    },
                                                    {
                                                        text: me.printText('admin.database.columns.auto_increment'),
                                                        dataIndex: 'auto_increment',
                                                        width: 150,
                                                        renderer: (value) => {
                                                            if (value == true) {
                                                                return 'AUTO_INCREMENT';
                                                            } else {
                                                                return '';
                                                            }
                                                        },
                                                    },
                                                    {
                                                        text: me.printText('admin.database.tables.comment'),
                                                        dataIndex: 'comment',
                                                        minWidth: 200,
                                                        flex: 1,
                                                    },
                                                ],
                                                listeners: {
                                                    /*
                                                    openMenu: (menu, record, _rowIndex, grid) => {
                                                        menu.setTitle(record.get('name'));

                                                        menu.add({
                                                            iconClass: 'mi mi-form-edit',
                                                            text: me.printText('admin.database.tables.show'),
                                                            handler: async () => {
                                                                const tree = Aui.getComponent(
                                                                    'tables'
                                                                ) as Aui.Tree.Panel;
                                                                tree.select({ name: record.get('name') });
                                                                return true;
                                                            },
                                                        });

                                                        menu.add('-');

                                                        menu.add({
                                                            iconClass: 'mi mi-placeholder',
                                                            text: me.printText('admin.database.tables.truncate'),
                                                            handler: async () => {
                                                                me.database.tables.delete(grid, 'truncate');
                                                                return true;
                                                            },
                                                        });

                                                        menu.add({
                                                            iconClass: 'mi mi-trash',
                                                            text: me.printText('admin.database.tables.drop'),
                                                            handler: async () => {
                                                                me.database.tables.delete(grid, 'drop');
                                                                return true;
                                                            },
                                                        });
                                                    },
                                                    openMenus: (menu, selections, grid) => {
                                                        menu.setTitle(
                                                            Aui.printText('texts.selected', {
                                                                count: selections.length.toString(),
                                                            })
                                                        );

                                                        menu.add({
                                                            iconClass: 'mi mi-placeholder',
                                                            text: me.printText('admin.database.tables.truncate'),
                                                            handler: async () => {
                                                                me.database.tables.delete(grid, 'truncate');
                                                                return true;
                                                            },
                                                        });

                                                        menu.add({
                                                            iconClass: 'mi mi-trash',
                                                            text: me.printText('admin.database.tables.drop'),
                                                            handler: async () => {
                                                                me.database.tables.delete(grid, 'drop');
                                                                return true;
                                                            },
                                                        });
                                                    },
                                                    */
                                                },
                                            }),
                                            new Aui.Grid.Panel({
                                                id: 'indexes',
                                                title: me.printText('admin.database.table.indexes'),
                                                iconClass: 'mi mi-zap',
                                                layout: 'fit',
                                                border: false,
                                                topbar: [
                                                    new Aui.Button({
                                                        text: '테이블구조업데이트',
                                                        disabled: true,
                                                    }),
                                                ],
                                                bottombar: [
                                                    new Aui.Button({
                                                        iconClass: 'mi mi-refresh',
                                                        handler: (button) => {
                                                            const tab = button
                                                                .getParent()
                                                                .getParent()
                                                                .getParent() as Aui.Tab.Panel;
                                                            tab.properties.getTable(name);
                                                        },
                                                    }),
                                                ],
                                                store: new Aui.Store.Local({
                                                    fields: [
                                                        'name',
                                                        'typelength',
                                                        'collation',
                                                        { name: 'is_null', type: 'boolean' },
                                                        { name: 'is_primary', type: 'boolean' },
                                                        'default',
                                                        { name: 'auto_increment', type: 'boolean' },
                                                        'comment',
                                                    ],
                                                    records: [],
                                                    primaryKeys: ['name'],
                                                }),
                                                freeze: 1,
                                                selection: { selectable: true, type: 'check' },
                                                columns: [
                                                    {
                                                        text: me.printText('admin.database.indexes.name'),
                                                        dataIndex: 'name',
                                                        width: 150,
                                                        renderer: (value, record) => {
                                                            if (record.get('is_primary') == true) {
                                                                return value + ' <i class="mi mi-key"></i>';
                                                            } else {
                                                                return value;
                                                            }
                                                        },
                                                    },
                                                    {
                                                        text: me.printText('admin.database.indexes.type'),
                                                        dataIndex: 'type',
                                                        width: 150,
                                                        textAlign: 'center',
                                                        renderer: (value) => {
                                                            return value.toUpperCase();
                                                        },
                                                    },
                                                    {
                                                        text: me.printText('admin.database.indexes.columns'),
                                                        dataIndex: 'columns',
                                                        minWidth: 200,
                                                        flex: 1,
                                                        renderer: (value) => {
                                                            return value.join(', ');
                                                        },
                                                    },
                                                ],
                                                listeners: {
                                                    /*
                                                    openMenu: (menu, record, _rowIndex, grid) => {
                                                        menu.setTitle(record.get('name'));
                                            
                                                        menu.add({
                                                            iconClass: 'mi mi-form-edit',
                                                            text: me.printText('admin.database.tables.show'),
                                                            handler: async () => {
                                                                const tree = Aui.getComponent(
                                                                    'tables'
                                                                ) as Aui.Tree.Panel;
                                                                tree.select({ name: record.get('name') });
                                                                return true;
                                                            },
                                                        });
                                            
                                                        menu.add('-');
                                            
                                                        menu.add({
                                                            iconClass: 'mi mi-placeholder',
                                                            text: me.printText('admin.database.tables.truncate'),
                                                            handler: async () => {
                                                                me.database.tables.delete(grid, 'truncate');
                                                                return true;
                                                            },
                                                        });
                                            
                                                        menu.add({
                                                            iconClass: 'mi mi-trash',
                                                            text: me.printText('admin.database.tables.drop'),
                                                            handler: async () => {
                                                                me.database.tables.delete(grid, 'drop');
                                                                return true;
                                                            },
                                                        });
                                                    },
                                                    openMenus: (menu, selections, grid) => {
                                                        menu.setTitle(
                                                            Aui.printText('texts.selected', {
                                                                count: selections.length.toString(),
                                                            })
                                                        );
                                            
                                                        menu.add({
                                                            iconClass: 'mi mi-placeholder',
                                                            text: me.printText('admin.database.tables.truncate'),
                                                            handler: async () => {
                                                                me.database.tables.delete(grid, 'truncate');
                                                                return true;
                                                            },
                                                        });
                                            
                                                        menu.add({
                                                            iconClass: 'mi mi-trash',
                                                            text: me.printText('admin.database.tables.drop'),
                                                            handler: async () => {
                                                                me.database.tables.delete(grid, 'drop');
                                                                return true;
                                                            },
                                                        });
                                                    },
                                                    */
                                                },
                                            }),
                                            new Aui.Grid.Panel({
                                                id: 'records',
                                                title: me.printText('admin.database.table.records'),
                                                iconClass: 'mi mi-zap',
                                                layout: 'fit',
                                                border: false,
                                                topbar: [
                                                    new Aui.Button({
                                                        text: '테이블구조업데이트',
                                                        disabled: true,
                                                    }),
                                                ],
                                                bottombar: [
                                                    new Aui.Button({
                                                        iconClass: 'mi mi-refresh',
                                                        handler: (button) => {
                                                            const tab = button
                                                                .getParent()
                                                                .getParent()
                                                                .getParent() as Aui.Tab.Panel;
                                                            tab.properties.getTable(name);
                                                        },
                                                    }),
                                                ],
                                                store: new Aui.Store.Remote({
                                                    url: me.getProcessUrl('records'),
                                                    params: { table: name },
                                                    limit: 50,
                                                    remoteFilter: true,
                                                    remoteSort: true,
                                                }),
                                                autoLoad: false,
                                                freeze: 1,
                                                selection: { selectable: true, type: 'check' },
                                                columns: [
                                                    {
                                                        text: 'Loading...',
                                                        flex: 1,
                                                    },
                                                ],
                                                listeners: {
                                                    /*
                                                    openMenu: (menu, record, _rowIndex, grid) => {
                                                        menu.setTitle(record.get('name'));
                                            
                                                        menu.add({
                                                            iconClass: 'mi mi-form-edit',
                                                            text: me.printText('admin.database.tables.show'),
                                                            handler: async () => {
                                                                const tree = Aui.getComponent(
                                                                    'tables'
                                                                ) as Aui.Tree.Panel;
                                                                tree.select({ name: record.get('name') });
                                                                return true;
                                                            },
                                                        });
                                            
                                                        menu.add('-');
                                            
                                                        menu.add({
                                                            iconClass: 'mi mi-placeholder',
                                                            text: me.printText('admin.database.tables.truncate'),
                                                            handler: async () => {
                                                                me.database.tables.delete(grid, 'truncate');
                                                                return true;
                                                            },
                                                        });
                                            
                                                        menu.add({
                                                            iconClass: 'mi mi-trash',
                                                            text: me.printText('admin.database.tables.drop'),
                                                            handler: async () => {
                                                                me.database.tables.delete(grid, 'drop');
                                                                return true;
                                                            },
                                                        });
                                                    },
                                                    openMenus: (menu, selections, grid) => {
                                                        menu.setTitle(
                                                            Aui.printText('texts.selected', {
                                                                count: selections.length.toString(),
                                                            })
                                                        );
                                            
                                                        menu.add({
                                                            iconClass: 'mi mi-placeholder',
                                                            text: me.printText('admin.database.tables.truncate'),
                                                            handler: async () => {
                                                                me.database.tables.delete(grid, 'truncate');
                                                                return true;
                                                            },
                                                        });
                                            
                                                        menu.add({
                                                            iconClass: 'mi mi-trash',
                                                            text: me.printText('admin.database.tables.drop'),
                                                            handler: async () => {
                                                                me.database.tables.delete(grid, 'drop');
                                                                return true;
                                                            },
                                                        });
                                                    },
                                                    */
                                                },
                                            }),
                                        ],
                                        getTable: async (name: string) => {
                                            const tab = Aui.getComponent(name) as Aui.Tab.Panel;
                                            const grid = (tab.getActiveTab() as Aui.Grid.Panel) ?? null;
                                            grid?.getLoading().show();

                                            const results = await Ajax.get(me.getProcessUrl('table'), {
                                                table: name,
                                            });

                                            if (results.success == true) {
                                                const columns = tab.getItemAt(0) as Aui.Grid.Panel;
                                                columns.getStore().empty();
                                                columns.getStore().add(results.columns);

                                                const indexes = tab.getItemAt(1) as Aui.Grid.Panel;
                                                indexes.getStore().empty();
                                                indexes.getStore().add(results.indexes);

                                                const records = tab.getItemAt(2) as Aui.Grid.Panel;
                                                records.removeColumns();
                                                for (const column of results.columns) {
                                                    const scheme = results.scheme?.columns[column.name] ?? null;
                                                    console.log(scheme);
                                                    //
                                                }

                                                if (results.need_update == true) {
                                                    columns.getToolbar('top').getItemAt(0).enable();
                                                }
                                            }

                                            grid?.getLoading().hide();
                                        },
                                        listeners: {
                                            render: async (tab) => {
                                                const panel = Admin.getContextSubUrl(1);
                                                if (panel !== null) {
                                                    tab.active(panel);
                                                }

                                                tab.properties.getTable(name);
                                            },
                                            active: (panel) => {
                                                Aui.getComponent('database-context').properties.setUrl();

                                                /*
                                                if (panel.getId() == 'lists') {
                                                    const groups = Aui.getComponent('groups') as Aui.Tree.Panel;
                                                    if (groups.getStore().isLoaded() == false) {
                                                        groups.getStore().load();
                                                    }
                                                }

                                                if (panel.getId() == 'logs') {
                                                    const logs = Aui.getComponent('logs') as Aui.Grid.Panel;
                                                    if (logs.getStore().isLoaded() == false) {
                                                        logs.getStore().load();
                                                    }
                                                }
                                                */
                                            },
                                        },
                                    })
                                );
                            }

                            /*
                            name.getStore().setParams({ name: name });
                            name.getStore().reload();
                            */
                            table.enable();

                            Aui.getComponent('database-context').properties.setUrl();
                        } else {
                            table.disable();
                        }
                    },
                },
            }),
            new Aui.Panel({
                id: 'table',
                border: [false, false, false, true],
                flex: 1,
            }),
        ],
        setUrl: () => {
            const tables = Aui.getComponent('tables') as Aui.Tree.Panel;
            const name = tables.getSelections().at(0)?.get('name') ?? null;

            if (Admin.getContextSubUrl(0) !== name) {
                if (name == '@') {
                    Admin.setContextSubUrl('');
                } else {
                    Admin.setContextSubUrl('/' + name);
                }
            }

            if (name !== '@') {
                const table = Aui.getComponent(name) as Aui.Tab.Panel;
                if (Admin.getContextSubUrl(1) !== table.getActiveTab().getId()) {
                    Admin.setContextSubUrl('/' + name + '/' + table.getActiveTab().getId());
                }
            }
        },
    });
});
