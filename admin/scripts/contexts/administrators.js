/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 관리화면을 구성한다.
 *
 * @file /modules/admin/admin/scripts/contexts/administrators.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 2. 25.
 */
Admin.ready(async () => {
    const me = Admin.getModule('admin');
    const mMember = Admin.getModule('member');
    return new Aui.Tab.Panel({
        id: 'administrators-context',
        iconClass: 'xi xi-user-lock',
        title: (await me.getText('admin.contexts.administrators')),
        border: false,
        layout: 'fit',
        tabPosition: 'bottom',
        topbar: [
            new Aui.Button({
                id: 'administrators_add_button',
                iconClass: 'mi mi-plus',
                text: (await me.getText('admin.administrators.lists.add')),
                handler: () => {
                    me.administrators.add();
                },
            }),
        ],
        items: [
            new Aui.Panel({
                id: 'lists',
                iconClass: 'xi xi-user-lock',
                title: (await me.getText('admin.administrators.lists.title')),
                border: false,
                layout: 'column',
                scrollable: true,
                items: [
                    new Aui.Tree.Panel({
                        id: 'groups',
                        border: [false, true, false, false],
                        width: 280,
                        selection: { selectable: true },
                        autoLoad: false,
                        topbar: [
                            new Aui.Form.Field.Search({
                                name: 'keyword',
                                flex: 1,
                                emptyText: (await me.getText('keyword')),
                                handler: async (keyword, field) => {
                                    const groups = field.getParent().getParent();
                                    groups.getStore().setFilter('title', keyword, 'likecode');
                                },
                            }),
                            new Aui.Button({
                                iconClass: 'mi mi-plus',
                                text: (await me.getText('admin.administrators.groups.add')),
                                handler: () => {
                                    me.administrators.groups.add();
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
                        columns: [
                            {
                                text: (await me.getText('admin.administrators.groups.title')),
                                dataIndex: 'title',
                                sortable: 'sort',
                                flex: 1,
                            },
                            {
                                text: (await me.getText('admin.administrators.groups.administrators')),
                                dataIndex: 'administrators',
                                sortable: true,
                                width: 80,
                                renderer: (value) => {
                                    return Format.number(value);
                                },
                            },
                        ],
                        store: new Aui.TreeStore.Remote({
                            url: me.getProcessUrl('groups'),
                            primaryKeys: ['group_id'],
                            fields: [
                                'group_id',
                                'title',
                                { name: 'administrators', type: 'int' },
                                { name: 'sort', type: 'int' },
                            ],
                            sorters: { index: 'ASC', sort: 'ASC' },
                        }),
                        listeners: {
                            update: (tree) => {
                                if (Admin.getContextSubUrl(0) == 'lists' &&
                                    Admin.getContextSubUrl(1) !== null &&
                                    tree.getSelections().length == 0) {
                                    tree.select({ group_id: Admin.getContextSubUrl(1).replace(/\./, '/') });
                                    if (tree.getSelections().length == 0) {
                                        tree.select({ group_id: 'user' });
                                    }
                                }
                                else if (tree.getSelections().length == 0) {
                                    tree.select({ group_id: 'user' });
                                }
                            },
                            openItem: (record) => {
                                const group_id = record.get('group_id');
                                if (group_id == 'user' || group_id == 'component') {
                                    Aui.Message.show({
                                        title: Aui.getErrorText('INFO'),
                                        icon: Aui.Message.INFO,
                                        buttons: Aui.Message.OK,
                                        closable: true,
                                        message: Admin.printText('admin.administrators.groups.descriptions.' + group_id),
                                    });
                                    return;
                                }
                                const [is_component, componentType, componentName, componentGroupId] = group_id.match(/^component-(module|plugin|widget)-([^-]+)-?(.*?)$/) ?? [false, null, null, null];
                                if (is_component !== false && componentGroupId.length == 0) {
                                    me[componentType + 's'].show(componentName);
                                    return;
                                }
                                me.administrators.groups.add(group_id);
                            },
                            openMenu: (menu, record) => {
                                menu.setTitle(record.data.title);
                                const group_id = record.get('group_id');
                                if (group_id == 'user' || group_id == 'component') {
                                    menu.add({
                                        text: me.printText('admin.administrators.groups.description'),
                                        iconClass: 'xi xi-information-square',
                                        handler: async () => {
                                            Aui.Message.show({
                                                title: Aui.getErrorText('INFO'),
                                                icon: Aui.Message.INFO,
                                                buttons: Aui.Message.OK,
                                                closable: true,
                                                message: Admin.printText('admin.administrators.groups.descriptions.' + group_id),
                                            });
                                            return true;
                                        },
                                    });
                                    return;
                                }
                                const [is_component, componentType, componentName, componentGroupId] = group_id.match(/^component-(module|plugin|widget)-([^-]+)-?(.*?)$/) ?? [false, null, null, null];
                                if (is_component !== false && componentGroupId.length == 0) {
                                    menu.add({
                                        text: me.printText('admin.' + componentType + 's.show.title'),
                                        iconClass: 'xi xi-information-square',
                                        handler: async () => {
                                            me[componentType + 's'].show(componentName);
                                            return true;
                                        },
                                    });
                                    return;
                                }
                                menu.add({
                                    text: me.printText('admin.administrators.groups.' + (is_component !== false ? 'show' : 'edit')),
                                    iconClass: 'xi xi-form-checkout',
                                    handler: async () => {
                                        me.administrators.groups.add(record.get('group_id'));
                                        return true;
                                    },
                                });
                                if (is_component === false) {
                                    menu.add({
                                        text: me.printText('admin.administrators.groups.delete'),
                                        iconClass: 'mi mi-trash',
                                        handler: async () => {
                                            me.administrators.groups.delete(record.get('group_id'));
                                            return true;
                                        },
                                    });
                                }
                            },
                            selectionChange: (selections) => {
                                const administrators = Aui.getComponent('administrators');
                                const assign = administrators.getToolbar('top').getItemAt(2);
                                if (selections.length == 1) {
                                    const group_id = selections[0].get('group_id');
                                    if (administrators.getStore().getParam('group_id') !== group_id) {
                                        administrators.getStore().setParam('group_id', group_id);
                                        administrators.getStore().loadPage(1);
                                    }
                                    administrators.enable();
                                    if (group_id == 'user' || group_id.startsWith('component') == true) {
                                        assign.hide();
                                    }
                                    else {
                                        assign.show();
                                    }
                                    Aui.getComponent('administrators-context').properties.setUrl();
                                }
                                else {
                                    assign.hide();
                                    administrators.disable();
                                }
                            },
                        },
                    }),
                    new Aui.Grid.Panel({
                        id: 'administrators',
                        border: [false, true, false, false],
                        minWidth: 300,
                        flex: 1,
                        selection: { selectable: true, display: 'check' },
                        autoLoad: false,
                        disabled: true,
                        topbar: [
                            new Aui.Form.Field.Search({
                                name: 'keyword',
                                width: 200,
                                emptyText: (await me.getText('keyword')),
                                handler: async (keyword, field) => {
                                    const administrators = field.getParent().getParent();
                                    administrators.getStore().setParam('keyword', keyword);
                                    administrators.getStore().loadPage(1);
                                },
                            }),
                            '->',
                            new Aui.Button({
                                iconClass: 'xi xi-user-folder',
                                text: (await me.getText('admin.administrators.lists.assign')),
                                handler: () => {
                                    const groups = Aui.getComponent('groups');
                                    const group_id = groups.getSelections().at(0)?.get('group_id') ?? 'user';
                                    if (group_id != 'user' && group_id.startsWith('component') == false) {
                                        me.administrators.add(null, group_id);
                                    }
                                },
                            }),
                        ],
                        bottombar: new Aui.Grid.Pagination([
                            new Aui.Button({
                                iconClass: 'mi mi-refresh',
                                handler: (button) => {
                                    const grid = button.getParent().getParent();
                                    grid.getStore().reload();
                                },
                            }),
                        ]),
                        columns: [
                            {
                                text: '',
                                dataIndex: 'member_id',
                                width: 50,
                                headerAlign: 'center',
                                textAlign: 'right',
                                sortable: true,
                            },
                            {
                                text: (await me.getText('admin.administrators.lists.name')),
                                dataIndex: 'name',
                                width: 150,
                                sortable: true,
                                renderer: (value, record) => {
                                    return ('<i class="photo" style="background-image:url(' +
                                        record.get('photo') +
                                        ')"></i>' +
                                        value);
                                },
                            },
                            {
                                text: (await mMember.getText('email')),
                                dataIndex: 'email',
                                sortable: true,
                                width: 200,
                            },
                            {
                                text: (await me.getText('admin.administrators.lists.member_groups')),
                                dataIndex: 'member_groups',
                                width: 160,
                                renderer: (value) => {
                                    return value.join(', ');
                                },
                            },
                            {
                                text: (await me.getText('admin.administrators.lists.administrator_groups')),
                                dataIndex: 'administrator_groups',
                                width: 160,
                                renderer: (value) => {
                                    return value.join(', ');
                                },
                            },
                            {
                                text: (await mMember.getText('logged_at')),
                                dataIndex: 'logged_at',
                                width: 160,
                                sortable: true,
                                renderer: (value) => {
                                    if (value > 0) {
                                        return Format.date('Y.m.d(D) H:i', value);
                                    }
                                    else {
                                        return '';
                                    }
                                },
                            },
                        ],
                        store: new Aui.Store.Remote({
                            url: me.getProcessUrl('administrators'),
                            primaryKeys: ['member_id'],
                            limit: 50,
                            remoteSort: true,
                            sorters: { name: 'ASC' },
                        }),
                        listeners: {
                            openItem: (record) => {
                                me.administrators.add(record.get('member_id'));
                            },
                            openMenu: (menu, record) => {
                                menu.setTitle(record.get('name'));
                                menu.add({
                                    text: me.printText('admin.administrators.lists.add_group'),
                                    iconClass: 'xi xi-folder-plus',
                                    handler: async () => {
                                        me.administrators.setGroups(false);
                                        return true;
                                    },
                                });
                                menu.add({
                                    text: me.printText('admin.administrators.lists.move_group'),
                                    iconClass: 'xi xi-folder-upload',
                                    handler: async () => {
                                        me.administrators.setGroups(true);
                                        return true;
                                    },
                                });
                                menu.add('-');
                                menu.add({
                                    text: me.printText('admin.administrators.lists.edit_permissions'),
                                    iconClass: 'xi xi-check-shieldout',
                                    handler: async () => {
                                        me.administrators.add(record.get('member_id'));
                                        return true;
                                    },
                                });
                                menu.add('-');
                                const groups = Aui.getComponent('groups');
                                const group_id = groups.getSelections().at(0)?.get('group_id') ?? 'user';
                                if (group_id != 'user' && group_id.startsWith('component') == false) {
                                    menu.add({
                                        text: me.printText('admin.administrators.lists.remove'),
                                        iconClass: 'xi xi-folder-remove',
                                        handler: async () => {
                                            me.administrators.delete(group_id);
                                            return true;
                                        },
                                    });
                                }
                                menu.add({
                                    text: me.printText('admin.administrators.lists.delete'),
                                    iconClass: 'mi mi-trash',
                                    handler: async () => {
                                        me.administrators.delete();
                                        return true;
                                    },
                                });
                            },
                            openMenus: (menu, selections) => {
                                menu.setTitle(Aui.printText('texts.selected_person', {
                                    count: selections.length.toString(),
                                }));
                                menu.add({
                                    text: me.printText('admin.administrators.lists.add_group'),
                                    iconClass: 'xi xi-folder-plus',
                                    handler: async () => {
                                        me.administrators.setGroups(false);
                                        return true;
                                    },
                                });
                                menu.add({
                                    text: me.printText('admin.administrators.lists.move_group'),
                                    iconClass: 'xi xi-folder-upload',
                                    handler: async () => {
                                        me.administrators.setGroups(true);
                                        return true;
                                    },
                                });
                                menu.add('-');
                                menu.add({
                                    text: me.printText('admin.administrators.lists.edit_permissions'),
                                    iconClass: 'xi xi-check-shieldout',
                                    handler: async () => {
                                        const member_ids = [];
                                        for (const record of selections) {
                                            member_ids.push(record.get('member_id'));
                                        }
                                        me.administrators.add(member_ids);
                                        return true;
                                    },
                                });
                                menu.add('-');
                                const groups = Aui.getComponent('groups');
                                const group_id = groups.getSelections().at(0)?.get('group_id') ?? 'user';
                                if (group_id != 'user' && group_id.startsWith('component') == false) {
                                    menu.add({
                                        text: me.printText('admin.administrators.lists.remove'),
                                        iconClass: 'xi xi-folder-remove',
                                        handler: async () => {
                                            me.administrators.delete(group_id);
                                            return true;
                                        },
                                    });
                                }
                                menu.add({
                                    text: me.printText('admin.administrators.lists.delete'),
                                    iconClass: 'mi mi-trash',
                                    handler: async () => {
                                        me.administrators.delete();
                                        return true;
                                    },
                                });
                            },
                        },
                    }),
                ],
            }),
            new Aui.Grid.Panel({
                id: 'logs',
                iconClass: 'xi xi-time-back',
                title: (await me.getText('admin.administrators.logs.title')),
                border: false,
                layout: 'fit',
                autoLoad: false,
                topbar: [
                    new Aui.Form.Field.Search({
                        width: 200,
                        emptyText: (await me.getText('keyword')),
                    }),
                    new Aui.Form.Field.Select({
                        width: 95,
                        store: new Aui.Store.Local({
                            fields: ['value'],
                            records: [['HTTP'], ['GET'], ['POST'], ['PUT'], ['DELETE']],
                        }),
                        displayField: 'value',
                        valueField: 'value',
                        value: 'HTTP',
                        listeners: {
                            change: (_field, value) => {
                                const logs = Aui.getComponent('logs');
                                logs.getStore().setParam('method', value);
                                logs.getStore().loadPage(1);
                            },
                        },
                    }),
                ],
                bottombar: new Aui.Grid.Pagination([
                    new Aui.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button) => {
                            const grid = button.getParent().getParent();
                            grid.getStore().reload();
                        },
                    }),
                ]),
                columns: [
                    {
                        text: (await me.getText('admin.administrators.logs.time')),
                        dataIndex: 'time',
                        width: 180,
                        textAlign: 'center',
                        sortable: true,
                        renderer: (value) => {
                            return Format.date('Y.m.d(D) H:i:s', value);
                        },
                    },
                    {
                        text: (await me.getText('admin.administrators.logs.name')),
                        dataIndex: 'name',
                        width: 150,
                        sortable: true,
                        renderer: (value, record) => {
                            return ('<i class="photo" style="background-image:url(' +
                                record.get('photo') +
                                ')"></i>' +
                                value);
                        },
                    },
                    {
                        text: (await mMember.getText('admin.members.email')),
                        dataIndex: 'email',
                        sortable: true,
                        width: 200,
                    },
                    {
                        text: (await me.getText('admin.administrators.logs.url')),
                        dataIndex: 'url',
                        minWidth: 250,
                        flex: 1,
                        renderer: (value, record) => {
                            return ('<b class="method ' +
                                record.get('method') +
                                '">' +
                                record.get('method') +
                                '</b>' +
                                value);
                        },
                    },
                    {
                        text: 'IP',
                        dataIndex: 'ip',
                        width: 110,
                    },
                ],
                store: new Aui.Store.Remote({
                    url: me.getProcessUrl('logs'),
                    params: { method: 'HTTP' },
                    primaryKeys: ['time', 'member_id'],
                    fields: [{ name: 'time', type: 'float' }],
                    limit: 50,
                    remoteSort: true,
                    sorters: { time: 'DESC' },
                }),
                listeners: {
                    openItem: (record) => { },
                    openMenu: (menu, record) => { },
                },
            }),
        ],
        listeners: {
            render: (tab) => {
                const panel = Admin.getContextSubUrl(0);
                if (panel !== null) {
                    tab.active(panel);
                }
            },
            active: (panel) => {
                Aui.getComponent('administrators-context').properties.setUrl();
                if (panel.getId() == 'lists') {
                    const groups = Aui.getComponent('groups');
                    if (groups.getStore().isLoaded() == false) {
                        groups.getStore().load();
                    }
                }
                if (panel.getId() == 'logs') {
                    const logs = Aui.getComponent('logs');
                    if (logs.getStore().isLoaded() == false) {
                        logs.getStore().load();
                    }
                }
            },
        },
        setUrl: () => {
            const context = Aui.getComponent('administrators-context');
            if (Admin.getContextSubUrl(0) !== context.getActiveTab().getId()) {
                Admin.setContextSubUrl('/' + context.getActiveTab().getId());
            }
            if (Admin.getContextSubUrl(0) == 'lists') {
                const groups = Aui.getComponent('groups');
                const group_id = groups.getSelections().at(0)?.get('group_id') ?? null;
                if (group_id !== null && Admin.getContextSubUrl(1) !== group_id) {
                    Admin.setContextSubUrl('/lists/' + group_id.replace(/\//, '.'));
                }
            }
        },
    });
});
