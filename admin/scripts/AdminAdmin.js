/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 UI 이벤트를 관리하는 클래스를 정의한다.
 *
 * @file /modules/admin/admin/scripts/AdminAdmin.ts
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
                                    url: this.getProcessUrl('domain'),
                                    params: { origin: host ?? null },
                                });
                                if (results.success == true) {
                                    Admin.Message.show({
                                        title: (await Admin.getText('info')),
                                        message: (await Admin.getText('actions/saved')),
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
                                    url: this.getProcessUrl('domain'),
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
                                            label: this.printText('admin/sites/sites/title'),
                                        }),
                                        new Admin.Form.Field.Container({
                                            label: this.printText('admin/sites/sites/language'),
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
                                            label: this.printText('admin/sites/sites/description'),
                                            rows: 3,
                                        }),
                                        new Admin.Form.Field.Theme({
                                            name: 'theme',
                                            label: '테마', //this.printText('admin/sites/sites/theme'),
                                        }),
                                    ],
                                }),
                                new Admin.Form.FieldSet({
                                    title: '사이트이미지',
                                    items: [
                                        new Admin.Form.Field.File({
                                            id: 'file',
                                            fieldLabel: '로고이미지',
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
                                    url: this.getProcessUrl('domain'),
                                    params: { origin: host ?? null },
                                });
                                if (results.success == true) {
                                    Admin.Message.show({
                                        title: (await Admin.getText('info')),
                                        message: (await Admin.getText('actions/saved')),
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
                                    url: this.getProcessUrl('domain'),
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
             * 사이트맵을 추가한다.
             */
            addSitemap() { }
            /**
             * 모듈정보를 확인한다.
             *
             * @param {string} name - 모듈명
             */
            showModule(name) {
                new Admin.Window({
                    title: 'Loading...',
                    width: 600,
                    modal: true,
                    resizable: false,
                    items: [
                        new Admin.Form.Panel({
                            border: false,
                            layout: 'fit',
                            fieldDefaults: { labelWidth: 100, labelAlign: 'right' },
                            items: [
                                new Admin.Form.FieldSet({
                                    title: this.printText('admin/modules/modules/show/defaults'),
                                    items: [
                                        new Admin.Form.Field.Container({
                                            direction: 'row',
                                            items: [
                                                new Admin.Form.Field.Container({
                                                    width: 100,
                                                    direction: 'column',
                                                    items: [
                                                        new Admin.Form.Field.Display({
                                                            name: 'icon',
                                                            renderer: (value) => {
                                                                const box = document.createElement('div');
                                                                box.style.setProperty('margin', 'calc(var(--padding-default) * -1)');
                                                                box.style.setProperty('width', '100px');
                                                                box.style.setProperty('height', '100px');
                                                                box.style.setProperty('border', '1px solid transparent');
                                                                box.style.setProperty('border-color', 'var(--input-border-color-default)');
                                                                box.style.setProperty('border-radius', '5px');
                                                                box.style.setProperty('padding', '20px');
                                                                box.style.setProperty('box-sizing', 'border-box');
                                                                box.innerHTML = value ? value : '<i class="icon"></i>';
                                                                const icon = box.firstChild;
                                                                icon.style.setProperty('width', '58px');
                                                                icon.style.setProperty('height', '58px');
                                                                icon.style.setProperty('line-height', '58px');
                                                                icon.style.setProperty('text-align', 'center');
                                                                icon.style.setProperty('font-size', '32px');
                                                                return box.outerHTML;
                                                            },
                                                        }),
                                                        new Admin.Form.Field.Display({
                                                            name: 'version',
                                                            renderer: (value) => {
                                                                const box = document.createElement('div');
                                                                box.style.setProperty('margin', 'calc(var(--padding-default) * -1)');
                                                                box.style.setProperty('width', '100px');
                                                                box.style.setProperty('height', '30px');
                                                                box.style.setProperty('background', 'var(--input-background-select)');
                                                                box.style.setProperty('border-radius', '5px');
                                                                box.style.setProperty('line-height', '30px');
                                                                box.style.setProperty('text-align', 'center');
                                                                box.style.setProperty('color', 'var(--input-color-select)');
                                                                box.innerHTML = value;
                                                                return box.outerHTML;
                                                            },
                                                        }),
                                                    ],
                                                }),
                                                new Admin.Form.Field.Container({
                                                    flex: 1,
                                                    direction: 'column',
                                                    items: [
                                                        new Admin.Form.Field.Display({
                                                            label: this.printText('admin/modules/modules/author'),
                                                            name: 'author',
                                                        }),
                                                        new Admin.Form.Field.Display({
                                                            label: this.printText('admin/modules/modules/homepage'),
                                                            name: 'homepage',
                                                        }),
                                                        new Admin.Form.Field.Display({
                                                            label: this.printText('admin/modules/modules/language'),
                                                            name: 'language',
                                                        }),
                                                        new Admin.Form.Field.Display({
                                                            label: this.printText('admin/modules/modules/hash'),
                                                            name: 'hash',
                                                        }),
                                                    ],
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                                new Admin.Form.FieldSet({
                                    title: this.printText('admin/modules/modules/show/details'),
                                    items: [
                                        new Admin.Form.Field.Display({
                                            name: 'description',
                                        }),
                                    ],
                                }),
                                new Admin.Form.FieldSet({
                                    title: this.printText('admin/modules/modules/show/properties/title'),
                                    items: [
                                        new Admin.Form.Field.CheckGroup({
                                            name: 'properties',
                                            readonly: true,
                                            columns: 4,
                                            options: {
                                                GLOBAL: this.printText('admin/modules/modules/show/properties/GLOBAL'),
                                                ADMIN: this.printText('admin/modules/modules/show/properties/ADMIN'),
                                                CONTEXT: this.printText('admin/modules/modules/show/properties/CONTEXT'),
                                                WIDGET: this.printText('admin/modules/modules/show/properties/WIDGET'),
                                                THEME: this.printText('admin/modules/modules/show/properties/THEME'),
                                                CRON: this.printText('admin/modules/modules/show/properties/CRON'),
                                                CONFIGS: this.printText('admin/modules/modules/show/properties/CONFIGS'),
                                            },
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                    buttons: [
                        new Admin.Button({
                            text: this.printText('buttons/configs'),
                            tabIndex: -1,
                            hidden: true,
                            handler: (button) => {
                                this.setModuleConfigs(name, button.getParent().getData('configs'));
                            },
                        }),
                        new Admin.Button({
                            text: this.printText('buttons/close'),
                            buttonClass: 'confirm',
                            handler: (button) => {
                                const window = button.getParent();
                                window.close();
                            },
                        }),
                    ],
                    listeners: {
                        show: async (window) => {
                            const form = window.getItemAt(0);
                            const results = await form.load({
                                url: this.getProcessUrl('module'),
                                params: { name: name },
                            });
                            window.setData('configs', results);
                            if (results.success == true) {
                                window.getTitle().setTitle(results.data.title);
                                const button = window.buttons.at(0);
                                if (results.data.status == 'INSTALLED') {
                                    if (results.data.properties.includes('CONFIGS') == true) {
                                        button.show();
                                    }
                                }
                                else if (results.data.status == 'NEED_UPDATE') {
                                    button.setText((await this.getText('buttons/update')));
                                    button.show();
                                }
                                else {
                                    button.setText((await this.getText('buttons/install')));
                                    button.show();
                                }
                            }
                            else {
                                window.close();
                            }
                        },
                    },
                }).show();
            }
            /**
             * 모듈설정을 확인한다.
             *
             * @param {string} name - 모듈명
             * @param {Admin.Ajax.Results} configs - 모듈정보
             */
            async setModuleConfigs(name, configs = null) {
                let response = configs;
                if (response === null) {
                    Admin.Message.loading();
                    response = await Admin.Ajax.get(this.getProcessUrl('module'), { name: name });
                    Admin.Message.close();
                }
                if (response.data.properties.includes('CONFIGS') == true) {
                    let form = (await Admin.getModule(name)?.getConfigsForm()) ?? null;
                    if (form !== null && form instanceof Admin.Form.Panel) {
                        form.border = false;
                        form.layout = 'fit';
                    }
                    else {
                        form = new Admin.Form.Panel({
                            border: false,
                            layout: 'fit',
                            items: ((fields) => {
                                const items = [];
                                for (const field of fields) {
                                    items.push(Admin.Form.Field.Create(field));
                                }
                                return items;
                            })(response.fields),
                        });
                    }
                    new Admin.Window({
                        title: response.data.title,
                        width: 600,
                        modal: true,
                        resizable: false,
                        items: [form],
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
                                    const form = window.getItemAt(0);
                                    const isValid = await form.isValid();
                                    if (isValid == true) {
                                        const configs = form.getValues();
                                        const success = await this.installModule(name, configs);
                                        if (success == true) {
                                            window.close();
                                        }
                                    }
                                },
                            }),
                        ],
                        listeners: {
                            show: (window) => {
                                const form = window.getItemAt(0);
                                for (const field in response.configs ?? {}) {
                                    console.log(field, form.getField(field));
                                    form.getField(field)?.setValue(response.configs[field]);
                                }
                            },
                        },
                    }).show();
                }
                else {
                }
            }
            /**
             * 모듈을 설치한다.
             *
             * @param {string} name - 모듈명
             * @param {Ojbect} configs - 모듈설정 (NULL 인 경우 모듈설정여부를 확인 후 모듈 설정을 먼저 한다.)
             */
            async installModule(name, configs = null) {
                if (configs === null) {
                    Admin.Message.loading();
                    const response = await Admin.Ajax.get(this.getProcessUrl('module'), { name: name });
                    if (response.data.properties.includes('CONFIGS') == true) {
                        Admin.Message.close();
                        this.setModuleConfigs(name, response);
                        return false;
                    }
                }
                Admin.Message.loading((await Admin.getText('actions/installing_status')), (await Admin.getText('actions/installing')), 'atom');
                const results = await Admin.Ajax.post(this.getProcessUrl('module'), { name: name, configs: configs });
                if (results.success == true) {
                    Admin.Message.close();
                    Admin.getComponent('modules')?.getStore().reload();
                    return true;
                }
                else {
                    if ((results.message ?? null) === null) {
                        Admin.Message.close();
                    }
                }
                return false;
            }
        }
        admin.AdminAdmin = AdminAdmin;
    })(admin = modules.admin || (modules.admin = {}));
})(modules || (modules = {}));
