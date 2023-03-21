/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 UI 이벤트를 관리하는 클래스를 정의한다.
 *
 * @file /modules/admin/admin/scripts/Admin.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 3.
 */
var modules;
(function (modules) {
    let admin;
    (function (admin) {
        class AdminAdmin extends Admin.Interface {
            /**
             * 도메인을 추가한다.
             *
             * @param {string} host - 도메인정보를 수정할 경우 수정할 host 명
             */
            addDomain(host = null) {
                new Admin.Window({
                    title: this.printText('admin/sites/domains/' + (host === null ? 'add' : 'edit')),
                    width: 500,
                    modal: true,
                    resizable: false,
                    items: [
                        new Admin.Form.Panel({
                            border: false,
                            layout: 'fit',
                            items: [
                                new Admin.Form.FieldSet({
                                    title: this.printText('admin/sites/domains/host'),
                                    items: [
                                        new Admin.Form.Field.Container({
                                            direction: 'row',
                                            items: [
                                                new Admin.Form.Field.Select({
                                                    name: 'is_https',
                                                    value: 'TRUE',
                                                    store: new Admin.Store.Array({
                                                        fields: ['display', 'value'],
                                                        datas: [
                                                            ['https://', 'TRUE'],
                                                            ['http://', 'FALSE'],
                                                        ],
                                                    }),
                                                    displayField: 'display',
                                                    valueField: 'value',
                                                    width: 100,
                                                }),
                                                new Admin.Form.Field.Text({
                                                    name: 'host',
                                                    flex: 1,
                                                    allowBlank: false,
                                                    emptyText: this.printText('admin/sites/domains/host'),
                                                }),
                                            ],
                                        }),
                                        new Admin.Form.Field.TextArea({
                                            name: 'alias',
                                            rows: 3,
                                            emptyText: this.printText('admin/sites/domains/alias'),
                                        }),
                                    ],
                                }),
                                new Admin.Form.FieldSet({
                                    title: this.printText('admin/sites/domains/options/title'),
                                    items: [
                                        new Admin.Form.Field.Check({
                                            name: 'is_rewrite',
                                            boxLabel: this.printText('admin/sites/domains/options/is_rewrite'),
                                            onValue: 'TRUE',
                                            checked: Admin.isRewrite(),
                                        }),
                                        new Admin.Form.Field.Check({
                                            name: 'is_internationalization',
                                            boxLabel: this.printText('admin/sites/domains/options/is_internationalization'),
                                            onValue: 'TRUE',
                                        }),
                                    ],
                                }),
                                new Admin.Form.FieldSet({
                                    title: this.printText('admin/sites/domains/membership/title'),
                                    items: [
                                        new Admin.Form.Field.RadioGroup({
                                            name: 'membership',
                                            options: {
                                                'DEPENDENCE': this.printText('admin/sites/domains/membership/DEPENDENCE'),
                                                'INDEPENDENCE': this.printText('admin/sites/domains/membership/INDEPENDENCE'),
                                            },
                                            value: 'DEPENDENCE',
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                    buttons: [
                        new Admin.Button({
                            text: this.printText('buttons/cancel'),
                            tabIndex: -1,
                            handler: (button) => {
                                const window = button.getParent();
                                window.close();
                            },
                        }),
                        new Admin.Button({
                            text: this.printText('buttons/ok'),
                            buttonClass: 'confirm',
                            handler: async (button) => {
                                const window = button.getParent();
                                const form = button.getParent().getItemAt(0);
                                const results = await form.submit({
                                    url: Admin.Modules.get('admin').getProcessUrl('domain'),
                                    params: { origin: host ?? null },
                                });
                                if (results.success == true) {
                                    Admin.Message.show({
                                        title: await Admin.getText('info'),
                                        message: await Admin.getText('actions/saved'),
                                        icon: Admin.Message.INFO,
                                        buttons: Admin.Message.OK,
                                        handler: () => {
                                            const domains = Admin.getComponent('domains');
                                            domains.selections = [
                                                new Admin.Data.Record({ host: form.getField('host').getValue() }),
                                            ];
                                            domains.getStore().reload();
                                            window.close();
                                            Admin.Message.close();
                                        },
                                    });
                                }
                            },
                        }),
                    ],
                    listeners: {
                        show: async (window) => {
                            if (host !== null) {
                                const form = window.getItemAt(0);
                                const results = await form.load({
                                    url: Admin.Modules.get('admin').getProcessUrl('domain'),
                                    params: { host: host },
                                });
                                if (results.success == false) {
                                    window.close();
                                }
                            }
                        },
                    },
                }).show();
            }
            /**
             * 사이트를 추가한다.
             *
             * @param {string} language - 사이트정보를 수정할 경우 수정할 host 명
             */
            addSite(language = null) {
                const host = null;
                new Admin.Window({
                    title: this.printText('admin/sites/sites/' + (language === null ? 'add' : 'edit')),
                    width: 600,
                    modal: true,
                    resizable: false,
                    items: [
                        new Admin.Form.Panel({
                            id: 'test',
                            border: false,
                            layout: 'fit',
                            fieldDefaults: { labelWidth: 100, labelAlign: 'right' },
                            items: [
                                new Admin.Form.Field.Hidden({
                                    name: 'host',
                                    value: host,
                                }),
                                new Admin.Form.FieldSet({
                                    title: this.printText('admin/sites/sites/default'),
                                    items: [
                                        new Admin.Form.Field.Text({
                                            name: 'title',
                                            fieldLabel: this.printText('admin/sites/sites/title'),
                                        }),
                                        new Admin.Form.Field.Container({
                                            fieldLabel: this.printText('admin/sites/sites/language'),
                                            items: [
                                                new Admin.Form.Field.Select({
                                                    name: 'language',
                                                    store: new Admin.Store.Ajax({
                                                        url: this.getProcessUrl('languages'),
                                                    }),
                                                    displayField: 'name',
                                                    valueField: 'language',
                                                    value: Admin.getLanguage(),
                                                    width: 110,
                                                }),
                                                new Admin.Form.Field.Check({
                                                    name: 'is_default',
                                                    boxLabel: this.printText('admin/sites/sites/default_language'),
                                                    flex: true,
                                                }),
                                            ],
                                        }),
                                        new Admin.Form.Field.TextArea({
                                            name: 'description',
                                            fieldLabel: this.printText('admin/sites/sites/description'),
                                            rows: 3,
                                        }),
                                        new Admin.Form.Field.Theme({
                                            name: 'theme',
                                            fieldLabel: '테마', //this.printText('admin/sites/sites/theme'),
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                    buttons: [
                        new Admin.Button({
                            text: this.printText('buttons/cancel'),
                            tabIndex: -1,
                            handler: (button) => {
                                const window = button.getParent();
                                window.close();
                            },
                        }),
                        new Admin.Button({
                            text: this.printText('buttons/ok'),
                            buttonClass: 'confirm',
                            handler: async (button) => {
                                const window = button.getParent();
                                const form = button.getParent().getItemAt(0);
                                const results = await form.submit({
                                    url: Admin.Modules.get('admin').getProcessUrl('domain'),
                                    params: { origin: host ?? null },
                                });
                                if (results.success == true) {
                                    Admin.Message.show({
                                        title: await Admin.getText('info'),
                                        message: await Admin.getText('actions/saved'),
                                        icon: Admin.Message.INFO,
                                        buttons: Admin.Message.OK,
                                        handler: () => {
                                            const domains = Admin.getComponent('domains');
                                            domains.selections = [
                                                new Admin.Data.Record({ host: form.getField('host').getValue() }),
                                            ];
                                            domains.getStore().reload();
                                            window.close();
                                            Admin.Message.close();
                                        },
                                    });
                                }
                            },
                        }),
                    ],
                    listeners: {
                        show: async (window) => {
                            if (host !== null) {
                                const form = window.getItemAt(0);
                                const results = await form.load({
                                    url: Admin.Modules.get('admin').getProcessUrl('domain'),
                                    params: { host: host },
                                });
                                if (results.success == false) {
                                    window.close();
                                }
                            }
                        },
                    },
                }).show();
            }
        }
        admin.AdminAdmin = AdminAdmin;
    })(admin = modules.admin || (modules.admin = {}));
})(modules || (modules = {}));
