/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 관리화면을 구성한다.
 *
 * @file /modules/admin/admin/scripts/contexts/administrators.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 27.
 */
Admin.ready(async () => {
    const me = Admin.getModule('admin') as modules.admin.admin.Admin;
    const mMember = Admin.getModule('member') as modules.member.admin.Member;

    return new Aui.Tab.Panel({
        id: 'administrators-context',
        iconClass: 'xi xi-user-lock',
        title: (await me.getText('admin.contexts.administrators')) as string,
        border: false,
        layout: 'fit',
        tabPosition: 'bottom',
        topbar: [
            new Aui.Button({
                id: 'administrators_add_button',
                iconClass: 'mi mi-plus',
                text: (await me.getText('admin.administrators.lists.add')) as string,
                handler: () => {
                    me.administrators.add();
                },
            }),
        ],
        items: [
            new Aui.Panel({
                id: 'lists',
                iconClass: 'xi xi-user-lock',
                title: (await me.getText('admin.administrators.lists.title')) as string,
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
                                emptyText: (await me.getText('keyword')) as string,
                                handler: async (keyword, field) => {
                                    const groups = field.getParent().getParent() as Aui.Tree.Panel;
                                    groups.getStore().setFilter('title', keyword, 'likecode');
                                },
                            }),
                            new Aui.Button({
                                iconClass: 'mi mi-plus',
                                text: (await me.getText('admin.administrators.groups.add')) as string,
                                handler: () => {
                                    me.administrators.groups.add();
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
                        columns: [
                            {
                                text: (await me.getText('admin.administrators.groups.title')) as string,
                                dataIndex: 'title',
                                sortable: 'sort',
                                flex: 1,
                            },
                            {
                                text: (await me.getText('admin.administrators.groups.administrators')) as string,
                                dataIndex: 'administrators',
                                sortable: true,
                                width: 80,
                                renderer: Aui.Tree.Renderer.Number(),
                            },
                        ],
                        store: new Aui.TreeStore.Ajax({
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
                                if (
                                    Admin.getContextSubUrl(0) == 'lists' &&
                                    Admin.getContextSubUrl(1) !== null &&
                                    tree.getSelections().length == 0
                                ) {
                                    tree.select({ group_id: Admin.getContextSubUrl(1).replace(/\./, '/') });
                                    if (tree.getSelections().length == 0) {
                                        tree.select({ group_id: 'user' });
                                    }
                                } else if (tree.getSelections().length == 0) {
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
                                        message: Admin.printText(
                                            'admin.administrators.groups.descriptions.' + group_id
                                        ),
                                    });
                                    return;
                                }

                                const [is_component, componentType, componentName, componentGroupId] = group_id.match(
                                    /^component-(module|plugin|widget)-([^-]+)-?(.*?)$/
                                ) ?? [false, null, null, null];

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
                                        handler: () => {
                                            Aui.Message.show({
                                                title: Aui.getErrorText('INFO'),
                                                icon: Aui.Message.INFO,
                                                buttons: Aui.Message.OK,
                                                closable: true,
                                                message: Admin.printText(
                                                    'admin.administrators.groups.descriptions.' + group_id
                                                ),
                                            });
                                        },
                                    });
                                    return;
                                }

                                const [is_component, componentType, componentName, componentGroupId] = group_id.match(
                                    /^component-(module|plugin|widget)-([^-]+)-?(.*?)$/
                                ) ?? [false, null, null, null];

                                if (is_component !== false && componentGroupId.length == 0) {
                                    menu.add({
                                        text: me.printText('admin.' + componentType + 's.show.title'),
                                        iconClass: 'xi xi-information-square',
                                        handler: () => {
                                            me[componentType + 's'].show(componentName);
                                        },
                                    });
                                    return;
                                }

                                menu.add({
                                    text: me.printText(
                                        'admin.administrators.groups.' + (is_component !== false ? 'show' : 'edit')
                                    ),
                                    iconClass: 'xi xi-form-checkout',
                                    handler: () => {
                                        me.administrators.groups.add(record.get('group_id'));
                                    },
                                });

                                if (is_component === false) {
                                    menu.add({
                                        text: me.printText('admin.administrators.groups.delete'),
                                        iconClass: 'mi mi-trash',
                                        handler: () => {
                                            me.administrators.groups.delete(record.get('group_id'));
                                        },
                                    });
                                }
                            },
                            selectionChange: (selections) => {
                                const administrators = Aui.getComponent('administrators') as Aui.Grid.Panel;
                                const assign = administrators.getToolbar('top').getItemAt(2) as Aui.Button;

                                if (selections.length == 1) {
                                    const group_id = selections[0].get('group_id');
                                    if (administrators.getStore().getParam('group_id') !== group_id) {
                                        administrators.getStore().setParam('group_id', group_id);
                                        administrators.getStore().loadPage(1);
                                    }
                                    administrators.enable();

                                    if (group_id == 'user' || group_id.startsWith('component') == true) {
                                        assign.hide();
                                    } else {
                                        assign.show();
                                    }

                                    Aui.getComponent('administrators-context').properties.setUrl();
                                } else {
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
                                emptyText: (await me.getText('keyword')) as string,
                                handler: async (keyword, field) => {
                                    const administrators = field.getParent().getParent() as Aui.Tree.Panel;
                                    administrators.getStore().setParam('keyword', keyword);
                                    administrators.getStore().loadPage(1);
                                },
                            }),
                            '->',
                            new Aui.Button({
                                iconClass: 'xi xi-user-folder',
                                text: (await me.getText('admin.administrators.lists.assign')) as string,
                                handler: () => {
                                    const groups = Aui.getComponent('groups') as Aui.Tree.Panel;
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
                                    const grid = button.getParent().getParent() as Aui.Grid.Panel;
                                    grid.getStore().reload();
                                },
                            }),
                        ]),
                        columns: [
                            {
                                text: '#',
                                dataIndex: 'member_id',
                                width: 50,
                                headerAlign: 'center',
                                textAlign: 'right',
                                sortable: true,
                            },
                            {
                                text: (await me.getText('admin.administrators.lists.name')) as string,
                                dataIndex: 'name',
                                width: 150,
                                sortable: true,
                                renderer: (value, record) => {
                                    return (
                                        '<i class="photo" style="background-image:url(' +
                                        record.get('photo') +
                                        ')"></i>' +
                                        value
                                    );
                                },
                            },
                            {
                                text: (await mMember.getText('admin.members.email')) as string,
                                dataIndex: 'email',
                                sortable: true,
                                width: 200,
                            },
                            {
                                text: (await me.getText('admin.administrators.lists.member_groups')) as string,
                                dataIndex: 'member_groups',
                                width: 160,
                                renderer: (value) => {
                                    return value.join(', ');
                                },
                            },
                            {
                                text: (await me.getText('admin.administrators.lists.administrator_groups')) as string,
                                dataIndex: 'administrator_groups',
                                width: 160,
                                renderer: (value) => {
                                    return value.join(', ');
                                },
                            },
                            {
                                text: (await mMember.getText('admin.members.logged_at')) as string,
                                dataIndex: 'logged_at',
                                width: 160,
                                sortable: true,
                                renderer: (value, ...args) => {
                                    if (value > 0) {
                                        return Aui.Grid.Renderer.DateTime()(value, ...args);
                                    } else {
                                        return '';
                                    }
                                },
                            },
                        ],
                        store: new Aui.Store.Ajax({
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
                                    handler: () => {
                                        me.administrators.setGroups(false);
                                    },
                                });

                                menu.add({
                                    text: me.printText('admin.administrators.lists.move_group'),
                                    iconClass: 'xi xi-folder-upload',
                                    handler: () => {
                                        me.administrators.setGroups(true);
                                    },
                                });

                                menu.add('-');

                                menu.add({
                                    text: me.printText('admin.administrators.lists.edit_permissions'),
                                    iconClass: 'xi xi-check-shieldout',
                                    handler: () => {
                                        me.administrators.add(record.get('member_id'));
                                    },
                                });

                                menu.add('-');

                                const groups = Aui.getComponent('groups') as Aui.Tree.Panel;
                                const group_id = groups.getSelections().at(0)?.get('group_id') ?? 'user';
                                if (group_id != 'user' && group_id.startsWith('component') == false) {
                                    menu.add({
                                        text: me.printText('admin.administrators.lists.remove'),
                                        iconClass: 'xi xi-folder-remove',
                                        handler: () => {
                                            me.administrators.delete(group_id);
                                        },
                                    });
                                }

                                menu.add({
                                    text: me.printText('admin.administrators.lists.delete'),
                                    iconClass: 'mi mi-trash',
                                    handler: () => {
                                        me.administrators.delete();
                                    },
                                });
                            },
                            openMenus: (menu, selections) => {
                                menu.setTitle(
                                    Aui.printText('texts.selected_person', {
                                        count: selections.length.toString(),
                                    })
                                );

                                menu.add({
                                    text: me.printText('admin.administrators.lists.add_group'),
                                    iconClass: 'xi xi-folder-plus',
                                    handler: () => {
                                        me.administrators.setGroups(false);
                                    },
                                });

                                menu.add({
                                    text: me.printText('admin.administrators.lists.move_group'),
                                    iconClass: 'xi xi-folder-upload',
                                    handler: () => {
                                        me.administrators.setGroups(true);
                                    },
                                });

                                menu.add('-');

                                menu.add({
                                    text: me.printText('admin.administrators.lists.edit_permissions'),
                                    iconClass: 'xi xi-check-shieldout',
                                    handler: () => {
                                        const member_ids = [];
                                        for (const record of selections) {
                                            member_ids.push(record.get('member_id'));
                                        }
                                        me.administrators.add(member_ids);
                                    },
                                });

                                menu.add('-');

                                const groups = Aui.getComponent('groups') as Aui.Tree.Panel;
                                const group_id = groups.getSelections().at(0)?.get('group_id') ?? 'user';
                                if (group_id != 'user' && group_id.startsWith('component') == false) {
                                    menu.add({
                                        text: me.printText('admin.administrators.lists.remove'),
                                        iconClass: 'xi xi-folder-remove',
                                        handler: () => {
                                            me.administrators.delete(group_id);
                                        },
                                    });
                                }

                                menu.add({
                                    text: me.printText('admin.administrators.lists.delete'),
                                    iconClass: 'mi mi-trash',
                                    handler: () => {
                                        me.administrators.delete();
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
                title: (await me.getText('admin.administrators.logs.title')) as string,
                border: false,
                layout: 'fit',
                autoLoad: false,
                topbar: [
                    new Aui.Form.Field.Search({
                        width: 200,
                        emptyText: (await me.getText('keyword')) as string,
                    }),
                    new Aui.Form.Field.Select({
                        width: 95,
                        store: new Aui.Store.Array({
                            fields: ['value'],
                            records: [['HTTP'], ['GET'], ['POST'], ['PUT'], ['DELETE']],
                        }),
                        displayField: 'value',
                        valueField: 'value',
                        value: 'HTTP',
                        listeners: {
                            change: (_field, value) => {
                                const logs = Aui.getComponent('logs') as Aui.Grid.Panel;
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
                            const grid = button.getParent().getParent() as Aui.Grid.Panel;
                            grid.getStore().reload();
                        },
                    }),
                ]),
                columns: [
                    {
                        text: (await me.getText('admin.administrators.logs.time')) as string,
                        dataIndex: 'time',
                        width: 180,
                        textAlign: 'center',
                        sortable: true,
                        renderer: Aui.Grid.Renderer.DateTime('YYYY.MM.DD(dd) HH:mm:ss'),
                    },
                    {
                        text: (await me.getText('admin.administrators.logs.name')) as string,
                        dataIndex: 'name',
                        width: 150,
                        sortable: true,
                        renderer: (value, record) => {
                            return (
                                '<i class="photo" style="background-image:url(' +
                                record.get('photo') +
                                ')"></i>' +
                                value
                            );
                        },
                    },
                    {
                        text: (await mMember.getText('admin.members.email')) as string,
                        dataIndex: 'email',
                        sortable: true,
                        width: 200,
                    },
                    {
                        text: (await me.getText('admin.administrators.logs.url')) as string,
                        dataIndex: 'url',
                        minWidth: 250,
                        flex: 1,
                        renderer: (value, record) => {
                            return (
                                '<b class="method ' +
                                record.get('method') +
                                '">' +
                                record.get('method') +
                                '</b>' +
                                value
                            );
                        },
                    },
                    {
                        text: 'IP',
                        dataIndex: 'ip',
                        width: 110,
                    },
                ],
                store: new Aui.Store.Ajax({
                    url: me.getProcessUrl('logs'),
                    params: { method: 'HTTP' },
                    primaryKeys: ['time', 'member_id'],
                    fields: [{ name: 'time', type: 'float' }],
                    limit: 50,
                    remoteSort: true,
                    sorters: { time: 'DESC' },
                }),
                listeners: {
                    openItem: (record) => {},
                    openMenu: (menu, record) => {},
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
            },
        },
        setUrl: () => {
            const context = Aui.getComponent('administrators-context') as Aui.Tab.Panel;
            if (Admin.getContextSubUrl(0) !== context.getActiveTab().getId()) {
                Admin.setContextSubUrl('/' + context.getActiveTab().getId());
            }

            if (Admin.getContextSubUrl(0) == 'lists') {
                const groups = Aui.getComponent('groups') as Aui.Tree.Panel;
                const group_id = groups.getSelections().at(0)?.get('group_id') ?? null;
                if (group_id !== null && Admin.getContextSubUrl(1) !== group_id) {
                    Admin.setContextSubUrl('/lists/' + group_id.replace(/\//, '.'));
                }
            }
        },
    });
});
