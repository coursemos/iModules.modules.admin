/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 관리화면을 구성한다.
 *
 * @file /modules/admin/admin/scripts/administrators.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 7. 13.
 */
Admin.ready(async () => {
    const me = Admin.getModule('admin');
    const mMember = Admin.getModule('member');
    return new Admin.Panel({
        border: false,
        layout: 'column',
        iconClass: 'xi xi-user-lock',
        title: (await me.getText('admin.administrators.title')),
        scrollable: true,
        items: [
            new Admin.Grid.Panel({
                id: 'groups',
                border: [false, true, false, false],
                width: 280,
                selection: { selectable: true },
                topbar: [
                    new Admin.Form.Field.Search({
                        name: 'keyword',
                        flex: 1,
                        emptyText: (await me.getText('keyword')),
                    }),
                    new Admin.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.administrators.groups.add')),
                        handler: () => {
                            me.administrators.groups.add();
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
                        text: (await mMember.getText('admin.administrators.groups.title')),
                        dataIndex: 'title',
                        sortable: 'sort',
                        flex: 1,
                    },
                    {
                        text: (await mMember.getText('admin.administrators.groups.administrators')),
                        dataIndex: 'administrators',
                        sortable: true,
                        width: 80,
                        renderer: Admin.Grid.Renderer.Number(),
                    },
                ],
                store: new Admin.Store.Ajax({
                    url: me.getProcessUrl('groups'),
                    primaryKeys: ['group_id'],
                    fields: [
                        'group_id',
                        'title',
                        { name: 'administrators', type: 'int' },
                        { name: 'sort', type: 'int' },
                    ],
                    sorters: { sort: 'ASC' },
                }),
                listeners: {
                    update: (grid) => {
                        if (Admin.getContextSubTree().at(0) !== undefined && grid.getSelections().length == 0) {
                            grid.select({ group_id: Admin.getContextSubTree().at(0) });
                        }
                        else if (grid.getSelections().length == 0) {
                            grid.select({ group_id: 'ALL' });
                        }
                    },
                    openItem: (record) => {
                        if (['ALL', 'EMPTY'].includes(record.get('group_id')) === false) {
                            me.administrators.groups.add(record.get('group_id'));
                        }
                    },
                    openMenu: (menu, record) => {
                        menu.setTitle(record.data.title);
                        if (['ALL', 'EMPTY'].includes(record.get('group_id')) === false) {
                            menu.add({
                                text: me.printText('admin.administrators.groups.edit'),
                                iconClass: 'xi xi-form-checkout',
                                handler: () => {
                                    me.administrators.groups.add(record.get('group_id'));
                                },
                            });
                            menu.add({
                                text: me.printText('admin.administrators.groups.delete'),
                                iconClass: 'mi mi-trash',
                                handler: () => {
                                    //
                                },
                            });
                        }
                    },
                    selectionChange: (selections) => {
                        const administrators = Admin.getComponent('administrators');
                        if (selections.length == 1) {
                            const group_id = selections[0].get('group_id');
                            administrators.getStore().setParam('group_id', group_id);
                            administrators.getStore().loadPage(1);
                            administrators.enable();
                            if (Admin.getContextSubTree().at(0) !== group_id) {
                                Admin.setContextUrl(Admin.getContextUrl('/' + group_id));
                            }
                        }
                        else {
                            administrators.disable();
                        }
                    },
                },
            }),
            new Admin.Grid.Panel({
                id: 'administrators',
                border: [false, true, false, false],
                minWidth: 300,
                flex: 1,
                selection: { selectable: true, display: 'check' },
                autoLoad: false,
                disabled: true,
                topbar: [
                    new Admin.Form.Field.Search({
                        name: 'keyword',
                        flex: 1,
                        emptyText: (await me.getText('keyword')),
                    }),
                    new Admin.Button({
                        iconClass: 'mi mi-plus',
                        text: (await me.getText('admin.administrators.add')),
                        handler: () => {
                            me.administrators.add();
                        },
                    }),
                ],
                bottombar: new Admin.Grid.Pagination([
                    new Admin.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button) => {
                            const grid = button.getParent().getParent();
                            grid.getStore().reload();
                        },
                    }),
                ]),
                columns: [
                    {
                        dataIndex: 'member_id',
                        width: 50,
                        headerAlign: 'center',
                        textAlign: 'right',
                        sortable: true,
                    },
                    {
                        text: (await mMember.getText('admin.members.name')),
                        dataIndex: 'name',
                        width: 150,
                        sortable: true,
                        renderer: (value, record) => {
                            return ('<i class="photo" style="background-image:url(' + record.data.photo + ')"></i>' + value);
                        },
                    },
                    {
                        text: (await mMember.getText('admin.administrators.groups.groups')),
                        dataIndex: 'groups',
                        width: 200,
                        renderer: (value) => {
                            const titles = Object.values(value);
                            if (titles.length == 0) {
                                return me.printText('admin.administrators.groups.ungrouped');
                            }
                            else {
                                return titles.join(', ');
                            }
                        },
                    },
                    {
                        text: (await me.getText('admin.administrators.permissions')),
                        dataIndex: 'permissions',
                        minWidth: 160,
                        flex: 1,
                        renderer: (value) => {
                            if (value === true) {
                                return me.printText('admin.administrators.master');
                            }
                            const components = Object.keys(value);
                            const names = components.splice(0, 3).join(', ');
                            const count = components.length;
                            if (count == 0) {
                                return names;
                            }
                            else {
                                return me.printText('admin.administrators.permission_sumamry', {
                                    names: names,
                                    count: count.toString(),
                                });
                            }
                        },
                    },
                    {
                        text: (await mMember.getText('admin.members.email')),
                        dataIndex: 'email',
                        sortable: true,
                        width: 200,
                    },
                    {
                        text: (await mMember.getText('admin.members.logged_at')),
                        dataIndex: 'logged_at',
                        width: 160,
                        sortable: true,
                        renderer: Admin.Grid.Renderer.DateTime(),
                    },
                ],
                store: new Admin.Store.Ajax({
                    url: me.getProcessUrl('administrators'),
                    primaryKeys: ['member_id'],
                    limit: 50,
                    remoteSort: true,
                    sorters: { name: 'ASC' },
                }),
                listeners: {
                    openMenu: (menu, record) => {
                        menu.setTitle(record.get('name'));
                        menu.add({
                            text: me.printText('admin.administrators.add_group'),
                            iconClass: 'xi xi-user-folder',
                            handler: () => {
                                me.administrators.setGroups(false);
                            },
                        });
                        menu.add({
                            text: me.printText('admin.administrators.move_group'),
                            iconClass: 'xi xi-user-add',
                            handler: () => {
                                me.administrators.setGroups(true);
                            },
                        });
                        menu.add('-');
                        menu.add({
                            text: me.printText('admin.administrators.edit_permissions'),
                            iconClass: 'xi xi-check-shieldout',
                            handler: () => {
                                //
                            },
                        });
                        menu.add('-');
                        menu.add({
                            text: me.printText('admin.administrators.remove'),
                            iconClass: 'mi mi-trash',
                            handler: () => {
                                //
                            },
                        });
                    },
                    openMenus: (menu, selections) => {
                        menu.setTitle(me.printText('admin.administrators.selectedCount', { count: selections.length.toString() }));
                        menu.add({
                            text: me.printText('admin.administrators.add_group'),
                            iconClass: 'xi xi-user-folder',
                            handler: () => {
                                me.administrators.setGroups(false);
                            },
                        });
                        menu.add({
                            text: me.printText('admin.administrators.move_group'),
                            iconClass: 'xi xi-user-add',
                            handler: () => {
                                me.administrators.setGroups(true);
                            },
                        });
                        menu.add('-');
                        menu.add({
                            text: me.printText('admin.administrators.edit_permissions'),
                            iconClass: 'xi xi-check-shieldout',
                            handler: () => {
                                //
                            },
                        });
                        menu.add('-');
                        menu.add({
                            text: me.printText('admin.administrators.remove'),
                            iconClass: 'mi mi-trash',
                            handler: () => {
                                //
                            },
                        });
                    },
                },
            }),
            new Admin.Form.Panel({
                id: 'permissions',
                border: [false, true, false, true],
                width: 400,
                disabled: true,
                hidden: true,
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
                            //
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
                items: [],
            }),
        ],
    });
});
