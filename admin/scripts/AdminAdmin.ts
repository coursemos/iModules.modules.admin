/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 UI 이벤트를 관리하는 클래스를 정의한다.
 *
 * @file /modules/admin/admin/scripts/AdminAdmin.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 1.
 */
namespace modules {
    export namespace admin {
        export class AdminAdmin extends Admin.Interface {
            modules = {
                /**
                 * 모듈정보를 확인한다.
                 *
                 * @param {string} name - 모듈명
                 */
                show: (name: string): void => {
                    new Admin.Window({
                        title: 'Loading...',
                        width: 680,
                        modal: true,
                        resizable: false,
                        items: [
                            new Admin.Form.Panel({
                                border: false,
                                layout: 'fit',
                                fieldDefaults: { labelWidth: 100, labelAlign: 'right' },
                                items: [
                                    new Admin.Form.FieldSet({
                                        title: this.printText('admin.modules.modules.show.defaults'),
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
                                                                renderer: (value: string) => {
                                                                    const $box = Html.create('div');
                                                                    $box.setStyle(
                                                                        'margin',
                                                                        'calc(var(--padding-default) * -1)'
                                                                    );
                                                                    $box.setStyle('width', '100px');
                                                                    $box.setStyle('height', '100px');
                                                                    $box.setStyle('border', '1px solid transparent');
                                                                    $box.setStyle(
                                                                        'border-color',
                                                                        'var(--input-border-color-default)'
                                                                    );
                                                                    $box.setStyle('border-radius', '5px');
                                                                    $box.setStyle('padding', '20px');
                                                                    $box.setStyle('box-sizing', 'border-box');

                                                                    const $icon = Html.html(value);
                                                                    $icon.setStyle('width', '58px');
                                                                    $icon.setStyle('height', '58px');
                                                                    $icon.setStyle('line-height', '58px');
                                                                    $icon.setStyle('text-align', 'center');
                                                                    $icon.setStyle('font-size', '32px');

                                                                    $box.append($icon);

                                                                    return $box.toHtml();
                                                                },
                                                            }),
                                                            new Admin.Form.Field.Display({
                                                                name: 'version',
                                                                renderer: (value: string) => {
                                                                    const $box = Html.create('div', null, value);
                                                                    $box.setStyle(
                                                                        'margin',
                                                                        'calc(var(--padding-default) * -1)'
                                                                    );
                                                                    $box.setStyle('width', '100px');
                                                                    $box.setStyle('height', '30px');
                                                                    $box.setStyle(
                                                                        'background',
                                                                        'var(--input-background-select)'
                                                                    );
                                                                    $box.setStyle('border-radius', '5px');
                                                                    $box.setStyle('line-height', '30px');
                                                                    $box.setStyle('text-align', 'center');
                                                                    $box.setStyle('color', 'var(--input-color-select)');

                                                                    return $box.toHtml();
                                                                },
                                                            }),
                                                        ],
                                                    }),
                                                    new Admin.Form.Field.Container({
                                                        flex: 1,
                                                        direction: 'column',
                                                        items: [
                                                            new Admin.Form.Field.Display({
                                                                label: this.printText('admin.modules.modules.author'),
                                                                name: 'author',
                                                            }),
                                                            new Admin.Form.Field.Display({
                                                                label: this.printText('admin.modules.modules.homepage'),
                                                                name: 'homepage',
                                                            }),
                                                            new Admin.Form.Field.Display({
                                                                label: this.printText('admin.modules.modules.language'),
                                                                name: 'language',
                                                            }),
                                                            new Admin.Form.Field.Display({
                                                                label: this.printText('admin.modules.modules.hash'),
                                                                name: 'hash',
                                                            }),
                                                        ],
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    new Admin.Form.FieldSet({
                                        title: this.printText('admin.modules.modules.show.details'),
                                        items: [
                                            new Admin.Form.Field.Display({
                                                name: 'description',
                                            }),
                                        ],
                                    }),
                                    new Admin.Form.FieldSet({
                                        title: this.printText('admin.modules.modules.show.properties.title'),
                                        items: [
                                            new Admin.Form.Field.CheckGroup({
                                                name: 'properties',
                                                readonly: true,
                                                columns: 4,
                                                options: {
                                                    GLOBAL: this.printText(
                                                        'admin.modules.modules.show.properties.GLOBAL'
                                                    ),
                                                    ADMIN: this.printText(
                                                        'admin.modules.modules.show.properties.ADMIN'
                                                    ),
                                                    CONTEXT: this.printText(
                                                        'admin.modules.modules.show.properties.CONTEXT'
                                                    ),
                                                    WIDGET: this.printText(
                                                        'admin.modules.modules.show.properties.WIDGET'
                                                    ),
                                                    THEME: this.printText(
                                                        'admin.modules.modules.show.properties.THEME'
                                                    ),
                                                    CRON: this.printText('admin.modules.modules.show.properties.CRON'),
                                                    CONFIGS: this.printText(
                                                        'admin.modules.modules.show.properties.CONFIGS'
                                                    ),
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                        buttons: [
                            new Admin.Button({
                                text: this.printText('buttons.configs'),
                                tabIndex: -1,
                                hidden: true,
                                handler: (button) => {
                                    this.modules.setConfigs(name, button.getParent().getData('configs'));
                                },
                            }),
                            new Admin.Button({
                                text: this.printText('buttons.close'),
                                buttonClass: 'confirm',
                                handler: (button) => {
                                    const window = button.getParent() as Admin.Window;
                                    window.close();
                                },
                            }),
                        ],
                        listeners: {
                            show: async (window) => {
                                const form = window.getItemAt(0) as Admin.Form.Panel;
                                const results = await form.load({
                                    url: this.getProcessUrl('module'),
                                    params: { name: name },
                                });

                                window.setData('configs', results);

                                if (results.success == true) {
                                    window.getTitle().setTitle(results.data.title);

                                    const button = window.buttons.at(0) as Admin.Button;
                                    if (results.data.status == 'INSTALLED') {
                                        if (results.data.properties.includes('CONFIGS') == true) {
                                            button.show();
                                        }
                                    } else if (results.data.status == 'NEED_UPDATE') {
                                        button.setText((await this.getText('buttons.update')) as string);
                                        button.show();
                                    } else {
                                        button.setText((await this.getText('buttons.install')) as string);
                                        button.show();
                                    }
                                } else {
                                    window.close();
                                }
                            },
                        },
                    }).show();
                },

                /**
                 * 모듈설정을 확인한다.
                 *
                 * @param {string} name - 모듈명
                 * @param {Admin.Ajax.Results} configs - 모듈정보
                 */
                setConfigs: async (name: string, configs: Admin.Ajax.Results = null): Promise<void> => {
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
                        } else {
                            form = new Admin.Form.Panel({
                                border: false,
                                layout: 'fit',
                                items: ((fields: Admin.Form.Field.Create.Properties[]) => {
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
                            width: 680,
                            modal: true,
                            resizable: false,
                            items: [form],
                            buttons: [
                                new Admin.Button({
                                    text: this.printText('buttons.cancel'),
                                    tabIndex: -1,
                                    handler: (button) => {
                                        const window = button.getParent() as Admin.Window;
                                        window.close();
                                    },
                                }),
                                new Admin.Button({
                                    text: this.printText('buttons.ok'),
                                    buttonClass: 'confirm',
                                    handler: async (button) => {
                                        const window = button.getParent() as Admin.Window;
                                        const form = window.getItemAt(0) as Admin.Form.Panel;

                                        const isValid = await form.isValid();
                                        if (isValid == true) {
                                            const configs = form.getValues();

                                            const success = await this.modules.install(name, configs);
                                            if (success == true) {
                                                window.close();
                                            }
                                        }
                                    },
                                }),
                            ],
                            listeners: {
                                show: (window) => {
                                    const form = window.getItemAt(0) as Admin.Form.Panel;
                                    for (const field in response.configs ?? {}) {
                                        form.getField(field)?.setValue(response.configs[field]);
                                    }
                                    form.fireEvent('load', [form, { data: response.configs }]);
                                },
                            },
                        }).show();
                    } else {
                    }
                },

                /**
                 * 모듈을 설치한다.
                 *
                 * @param {string} name - 모듈명
                 * @param {Ojbect} configs - 모듈설정 (NULL 인 경우 모듈설정여부를 확인 후 모듈 설정을 먼저 한다.)
                 */
                install: async (name: string, configs: { [key: string]: any } = null): Promise<boolean> => {
                    if (configs === null) {
                        Admin.Message.loading();
                        const response = await Admin.Ajax.get(this.getProcessUrl('module'), { name: name });

                        if (response.data.properties.includes('CONFIGS') == true) {
                            Admin.Message.close();
                            this.modules.setConfigs(name, response);
                            return false;
                        }
                    }

                    Admin.Message.loading(
                        (await Admin.getText('actions.installing_status')) as string,
                        (await Admin.getText('actions.installing')) as string,
                        'atom'
                    );

                    const results = await Admin.Ajax.post(
                        this.getProcessUrl('module'),
                        { name: name, configs: configs },
                        {},
                        false
                    );
                    if (results.success == true) {
                        Admin.Message.close();
                        (Admin.getComponent('modules') as Admin.Grid.Panel)?.getStore().reload();
                        return true;
                    } else {
                        if ((results.message ?? null) === null) {
                            Admin.Message.close();
                        }
                    }

                    return false;
                },
            };

            sitemap = {
                domains: {
                    /**
                     * 도메인을 추가한다.
                     *
                     * @param {string} host - 도메인정보를 수정할 경우 수정할 host 명
                     */
                    add: (host: string = null): void => {
                        new Admin.Window({
                            title: this.printText('admin.sites.domains.' + (host === null ? 'add' : 'edit')),
                            width: 500,
                            modal: true,
                            resizable: false,
                            items: [
                                new Admin.Form.Panel({
                                    border: false,
                                    layout: 'fit',
                                    items: [
                                        new Admin.Form.FieldSet({
                                            title: this.printText('admin.sites.domains.host'),
                                            items: [
                                                new Admin.Form.Field.Container({
                                                    direction: 'row',
                                                    items: [
                                                        new Admin.Form.Field.Select({
                                                            name: 'is_https',
                                                            value: 'TRUE',
                                                            store: new Admin.Store.Array({
                                                                fields: ['display', 'value'],
                                                                records: [
                                                                    ['https://', 'TRUE'],
                                                                    ['http://', 'FALSE'],
                                                                ],
                                                            }),
                                                            width: 100,
                                                        }),
                                                        new Admin.Form.Field.Text({
                                                            name: 'host',
                                                            flex: 1,
                                                            allowBlank: false,
                                                            emptyText: this.printText('admin.sites.domains.host'),
                                                        }),
                                                    ],
                                                }),
                                                new Admin.Form.Field.TextArea({
                                                    name: 'alias',
                                                    rows: 3,
                                                    emptyText: this.printText('admin.sites.domains.alias'),
                                                }),
                                            ],
                                        }),
                                        new Admin.Form.FieldSet({
                                            title: this.printText('admin.sites.domains.options.title'),
                                            items: [
                                                new Admin.Form.Field.Check({
                                                    name: 'is_rewrite',
                                                    boxLabel: this.printText('admin.sites.domains.options.is_rewrite'),
                                                    onValue: 'TRUE',
                                                    checked: Admin.isRewrite(),
                                                }),
                                                new Admin.Form.Field.Check({
                                                    name: 'is_internationalization',
                                                    boxLabel: this.printText(
                                                        'admin.sites.domains.options.is_internationalization'
                                                    ),
                                                    onValue: 'TRUE',
                                                }),
                                            ],
                                        }),
                                        new Admin.Form.FieldSet({
                                            title: this.printText('admin.sites.domains.membership.title'),
                                            items: [
                                                new Admin.Form.Field.RadioGroup({
                                                    name: 'membership',
                                                    options: {
                                                        'DEPENDENCE': this.printText(
                                                            'admin.sites.domains.membership.DEPENDENCE'
                                                        ),
                                                        'INDEPENDENCE': this.printText(
                                                            'admin.sites.domains.membership.INDEPENDENCE'
                                                        ),
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
                                    text: this.printText('buttons.cancel'),
                                    tabIndex: -1,
                                    handler: (button) => {
                                        const window = button.getParent() as Admin.Window;
                                        window.close();
                                    },
                                }),
                                new Admin.Button({
                                    text: this.printText('buttons.ok'),
                                    buttonClass: 'confirm',
                                    handler: async (button) => {
                                        const window = button.getParent() as Admin.Window;
                                        const form = button.getParent().getItemAt(0) as Admin.Form.Panel;
                                        const results = await form.submit({
                                            url: this.getProcessUrl('domain'),
                                            params: { host: host },
                                        });

                                        if (results.success == true) {
                                            Admin.Message.show({
                                                title: (await Admin.getText('info')) as string,
                                                message: (await Admin.getText('actions.saved')) as string,
                                                icon: Admin.Message.INFO,
                                                buttons: Admin.Message.OK,
                                                handler: async () => {
                                                    const domains = Admin.getComponent('domains') as Admin.Grid.Panel;
                                                    await domains.getStore().reload();
                                                    domains.select({ host: form.getField('host').getValue() });
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
                                        const form = window.getItemAt(0) as Admin.Form.Panel;
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
                    },
                },
                sites: {
                    /**
                     * 사이트를 추가한다.
                     *
                     * @param {string} language - 사이트정보를 수정할 경우 수정할 host 명
                     */
                    add: (language: string = null): void => {
                        const domains: Admin.Grid.Panel = Admin.getComponent('domains') as Admin.Grid.Panel;
                        const host =
                            domains.getSelections().length == 1 ? domains.getSelections()[0].get('host') : null;
                        if (host === null) {
                            return;
                        }

                        new Admin.Window({
                            title: this.printText('admin.sites.sites.' + (language === null ? 'add' : 'edit')),
                            width: 700,
                            modal: true,
                            resizable: false,
                            items: [
                                new Admin.Form.Panel({
                                    border: false,
                                    layout: 'fit',
                                    fieldDefaults: { labelWidth: 100, labelAlign: 'right' },
                                    items: [
                                        new Admin.Form.FieldSet({
                                            title: this.printText('admin.sites.sites.default'),
                                            items: [
                                                new Admin.Form.Field.Text({
                                                    name: 'title',
                                                    allowBlank: false,
                                                    label: this.printText('admin.sites.sites.title'),
                                                }),
                                                new Admin.Form.Field.Container({
                                                    label: this.printText('admin.sites.sites.language'),
                                                    allowBlank: false,
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
                                                            boxLabel: this.printText(
                                                                'admin.sites.sites.default_language'
                                                            ),
                                                            flex: true,
                                                        }),
                                                    ],
                                                }),
                                                new Admin.Form.Field.TextArea({
                                                    name: 'description',
                                                    label: this.printText('admin.sites.sites.description'),
                                                    rows: 3,
                                                }),
                                            ],
                                        }),
                                        new Admin.Form.FieldSet({
                                            title: this.printText('admin.sites.sites.design'),
                                            items: [
                                                new Admin.Form.Field.Theme({
                                                    name: 'theme',
                                                    label: this.printText('admin.sites.sites.theme'),
                                                    listeners: {
                                                        configs: (
                                                            field: Admin.Form.Field.Theme,
                                                            configs: { [key: string]: any }
                                                        ) => {
                                                            if (configs.logo !== null) {
                                                                const logo = field
                                                                    .getForm()
                                                                    .getField('logo') as Admin.Form.Field.Image;
                                                                logo.setImageSize(
                                                                    configs.logo.width,
                                                                    configs.logo.height
                                                                );
                                                                logo.setHelpText(configs.logo.message ?? null);
                                                            }
                                                        },
                                                    },
                                                }),
                                                new Admin.Form.Field.Include({
                                                    name: 'header',
                                                    label: this.printText('admin.sites.sites.header'),
                                                }),
                                                new Admin.Form.Field.Include({
                                                    name: 'footer',
                                                    label: this.printText('admin.sites.sites.footer'),
                                                }),
                                            ],
                                        }),
                                        new Admin.Form.FieldSet({
                                            title: this.printText('admin.sites.sites.images'),
                                            items: [
                                                new Admin.Form.Field.Image({
                                                    name: 'logo',
                                                    label: this.printText('admin.sites.sites.logo'),
                                                    showSize: true,
                                                    imageWidth: 200,
                                                    imageHeight: 50,
                                                }),
                                                new Admin.Form.Field.Image({
                                                    name: 'emblem',
                                                    label: this.printText('admin.sites.sites.emblem'),
                                                    helpText: this.printText('admin.sites.sites.emblem_help'),
                                                    imageWidth: 144,
                                                    imageHeight: 144,
                                                }),
                                                new Admin.Form.Field.Image({
                                                    name: 'favicon',
                                                    label: this.printText('admin.sites.sites.favicon'),
                                                    helpText: this.printText('admin.sites.sites.favicon_help'),
                                                    accept: 'image/x-icon',
                                                    imageWidth: 32,
                                                    imageHeight: 32,
                                                }),
                                                new Admin.Form.Field.Image({
                                                    name: 'image',
                                                    label: this.printText('admin.sites.sites.image'),
                                                    helpText: this.printText('admin.sites.sites.image_help'),
                                                    imageWidth: 1200,
                                                    imageHeight: 630,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                            buttons: [
                                new Admin.Button({
                                    text: this.printText('buttons.cancel'),
                                    tabIndex: -1,
                                    handler: (button) => {
                                        const window = button.getParent() as Admin.Window;
                                        window.close();
                                    },
                                }),
                                new Admin.Button({
                                    text: this.printText('buttons.ok'),
                                    buttonClass: 'confirm',
                                    handler: async (button) => {
                                        const window = button.getParent() as Admin.Window;
                                        const form = button.getParent().getItemAt(0) as Admin.Form.Panel;
                                        const results = await form.submit({
                                            url: this.getProcessUrl('site'),
                                            params: { host: host, language: language },
                                        });

                                        if (results.success == true) {
                                            Admin.Message.show({
                                                title: (await Admin.getText('info')) as string,
                                                message: (await Admin.getText('actions.saved')) as string,
                                                icon: Admin.Message.INFO,
                                                buttons: Admin.Message.OK,
                                                handler: async () => {
                                                    const sites = Admin.getComponent('sites') as Admin.Grid.Panel;
                                                    await sites.getStore().reload();
                                                    sites.select({
                                                        host: host,
                                                        language: form.getField('language').getValue(),
                                                    });
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
                                    if (language !== null) {
                                        const form = window.getItemAt(0) as Admin.Form.Panel;
                                        const results = await form.load({
                                            url: this.getProcessUrl('site'),
                                            params: { host: host, language: language },
                                        });

                                        if (results.success == false) {
                                            window.close();
                                        }
                                    }
                                },
                            },
                        }).show();
                    },
                },
                contexts: {
                    /**
                     * 컨텍스트 종류를 가져온다.
                     *
                     * @return {string[]} types - 컨텍스트타입
                     */
                    getTypes: (): string[] => {
                        return ['EMPTY', 'CHILD', 'PAGE', 'MODULE', 'HTML', 'LINK'];
                    },

                    /**
                     * 컨텍스트 종류 아이콘을 가져온다.
                     *
                     * @param {string} type - 컨텍스트타입
                     * @return {string} icon - 아이콘
                     */
                    getTypeIcon: (type: string): string => {
                        const icons = {
                            'EMPTY': 'xi xi-marquee-add',
                            'CHILD': 'xi xi-sitemap',
                            'PAGE': 'xi xi-paper',
                            'MODULE': 'xi xi-box',
                            'HTML': 'xi xi-code',
                            'LINK': 'xi xi-external-link',
                        };
                        return '<i class="icon ' + (icons[type] ?? '') + '"></i>';
                    },

                    /**
                     * 컨텍스트를 추가한다.
                     *
                     * @param {string} path - 수정할 경로 또는 추가될 포함될 상위 부모폴더
                     */
                    add: (path: string = null): void => {
                        const domains: Admin.Grid.Panel = Admin.getComponent('domains') as Admin.Grid.Panel;
                        const host =
                            domains.getSelections().length == 1 ? domains.getSelections()[0].get('host') : null;
                        if (host === null) {
                            return;
                        }

                        const sites: Admin.Grid.Panel = Admin.getComponent('sites') as Admin.Grid.Panel;
                        const language =
                            sites.getSelections().length == 1 ? sites.getSelections()[0].get('language') : null;
                        if (language === null) {
                            return;
                        }

                        if (path === null) {
                            // @todo 하위메뉴 선택창
                            return;
                        }

                        const paths = path.split('/');
                        path = paths.pop();
                        const parent = paths.join('/');
                        path = path == '@' ? null : path;

                        new Admin.Window({
                            title: this.printText('admin.sites.contexts.' + (path === null ? 'add' : 'edit')),
                            width: 700,
                            modal: true,
                            resizable: false,
                            items: [
                                new Admin.Form.Panel({
                                    border: false,
                                    layout: 'fit',
                                    items: [
                                        new Admin.Form.FieldSet({
                                            title: this.printText('admin.sites.contexts.default'),
                                            items: [
                                                new Admin.Form.Field.Container({
                                                    label: this.printText('admin.sites.contexts.path'),
                                                    direction: 'row',
                                                    gap: 0,
                                                    items: [
                                                        new Admin.Form.Field.Display({
                                                            name: 'parent',
                                                            value: parent,
                                                            renderer: (value) => {
                                                                return value == '/' ? value : value + '/';
                                                            },
                                                        }),
                                                        new Admin.Form.Field.Text({
                                                            name: 'path',
                                                            flex: 1,
                                                            allowBlank: false,
                                                            hidden: path === '',
                                                            disabled: path === '',
                                                        }),
                                                    ],
                                                    helpText: this.printText('admin.sites.contexts.path_help'),
                                                }),
                                                new Admin.Form.Field.Icon({
                                                    name: 'icon',
                                                    label: this.printText('admin.sites.contexts.icon'),
                                                }),
                                                new Admin.Form.Field.Text({
                                                    name: 'title',
                                                    label: this.printText('admin.sites.contexts.title'),
                                                    allowBlank: false,
                                                }),
                                                new Admin.Form.Field.Text({
                                                    name: 'description',
                                                    label: this.printText('admin.sites.contexts.description'),
                                                }),
                                                new Admin.Form.Field.Image({
                                                    name: 'image',
                                                    label: this.printText('admin.sites.contexts.image'),
                                                    helpText: this.printText('admin.sites.contexts.image_help'),
                                                    imageWidth: 1200,
                                                    imageHeight: 630,
                                                }),
                                                new Admin.Form.Field.RadioGroup({
                                                    name: 'type',
                                                    label: this.printText('admin.sites.contexts.type'),
                                                    displayType: 'box',
                                                    inputClass: 'context_type',
                                                    columns: 6,
                                                    options: (() => {
                                                        const options = {};
                                                        for (const type of this.sitemap.contexts.getTypes()) {
                                                            options[type] =
                                                                this.sitemap.contexts.getTypeIcon(type) +
                                                                '<span>' +
                                                                this.printText('admin.sites.contexts.types.' + type) +
                                                                '</span>';
                                                        }
                                                        return options;
                                                    })(),
                                                    listeners: {
                                                        change: (field: Admin.Form.Field.RadioGroup, value: string) => {
                                                            const form = field.getForm();
                                                            const details = Admin.getComponent(
                                                                'details'
                                                            ) as Admin.Form.FieldSet;

                                                            for (const item of details.getItems()) {
                                                                item.hide();
                                                                item.disable();
                                                            }

                                                            switch (value) {
                                                                case 'CHILD':
                                                                    form.getField('child').show();
                                                                    form.getField('child').enable();
                                                                    break;

                                                                case 'PAGE':
                                                                    form.getField('page').show();
                                                                    form.getField('page').enable();
                                                                    form.getField('is_routing').show();
                                                                    form.getField('is_routing').enable();
                                                                    break;

                                                                case 'MODULE':
                                                                    form.getField('module').show();
                                                                    form.getField('module').enable();
                                                                    break;
                                                            }

                                                            if (value === 'EMPTY') {
                                                                details.hide();
                                                            } else {
                                                                details.show();
                                                            }

                                                            const design = Admin.getComponent(
                                                                'design'
                                                            ) as Admin.Form.FieldSet;
                                                            if (value == 'CHILD' || value == 'LINK') {
                                                                design.hide();
                                                                design.disable();
                                                            } else {
                                                                design.show();
                                                                design.enable();
                                                            }
                                                        },
                                                    },
                                                }),
                                            ],
                                        }),
                                        new Admin.Form.FieldSet({
                                            id: 'details',
                                            title: this.printText('admin.sites.contexts.details'),
                                            items: [
                                                new Admin.Form.Field.Display({
                                                    name: 'child',
                                                    label: this.printText('admin.sites.contexts.child'),
                                                    value: null,
                                                    renderer: () => {
                                                        return this.printText('admin.sites.contexts.child_help');
                                                    },
                                                }),
                                                new Admin.Form.Field.Page({
                                                    name: 'page',
                                                    label: this.printText('admin.sites.contexts.page'),
                                                    helpText: this.printText('admin.sites.contexts.page_help'),
                                                    allowBlank: false,
                                                    host: host,
                                                    language: language,
                                                }),
                                                new Admin.Form.Field.Check({
                                                    name: 'is_routing',
                                                    label: this.printText('admin.sites.contexts.is_routing'),
                                                    boxLabel: this.printText('admin.sites.contexts.is_routing_help'),
                                                }),

                                                new Admin.Form.Field.Context({
                                                    name: 'module',
                                                    label: this.printText('admin.sites.contexts.module'),
                                                    allowBlank: false,
                                                    path: path !== null ? parent + '/' + path : null,
                                                }),
                                            ],
                                        }),
                                        new Admin.Form.FieldSet({
                                            id: 'design',
                                            title: this.printText('admin.sites.contexts.design'),
                                            items: [
                                                new Admin.Form.Field.Select({
                                                    name: 'layout',
                                                    label: this.printText('admin.sites.contexts.layout'),
                                                    valueField: 'name',
                                                    displayField: 'title',
                                                    allowBlank: false,
                                                    store: new Admin.Store.Ajax({
                                                        url: this.getProcessUrl('layouts'),
                                                        autoLoad: false,
                                                        params: { host: host, language: language },
                                                    }),
                                                }),
                                                new Admin.Form.Field.Include({
                                                    label: this.printText('admin.sites.contexts.header'),
                                                    name: 'header',
                                                }),
                                                new Admin.Form.Field.Include({
                                                    label: this.printText('admin.sites.contexts.footer'),
                                                    name: 'footer',
                                                }),
                                            ],
                                        }),
                                        new Admin.Form.FieldSet({
                                            title: this.printText('admin.sites.contexts.visibility'),
                                            items: [
                                                new Admin.Form.Field.Check({
                                                    name: 'is_sitemap',
                                                    label: this.printText('admin.sites.contexts.is_sitemap'),
                                                    boxLabel: this.printText('admin.sites.contexts.is_sitemap_help'),
                                                    checked: true,
                                                }),
                                                new Admin.Form.Field.Check({
                                                    name: 'is_footer_menu',
                                                    label: this.printText('admin.sites.contexts.is_footer_menu'),
                                                    boxLabel: this.printText(
                                                        'admin.sites.contexts.is_footer_menu_help'
                                                    ),
                                                }),

                                                new Admin.Form.Field.Permission({
                                                    name: 'permission',
                                                    label: this.printText('admin.sites.contexts.permission'),
                                                    boxLabel: this.printText('admin.sites.contexts.permission_help'),
                                                    value: 'true',
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                            buttons: [
                                new Admin.Button({
                                    text: this.printText('buttons.cancel'),
                                    tabIndex: -1,
                                    handler: (button) => {
                                        const window = button.getParent() as Admin.Window;
                                        window.close();
                                    },
                                }),
                                new Admin.Button({
                                    text: this.printText('buttons.ok'),
                                    buttonClass: 'confirm',
                                    handler: async (button) => {
                                        const window = button.getParent() as Admin.Window;
                                        const form = button.getParent().getItemAt(0) as Admin.Form.Panel;
                                        const results = await form.submit({
                                            url: this.getProcessUrl('context'),
                                            params: {
                                                host: host,
                                                language: language,
                                                path: path !== null ? parent + '/' + path : null,
                                            },
                                        });

                                        if (results.success == true) {
                                            Admin.Message.show({
                                                title: (await Admin.getText('info')) as string,
                                                message: (await Admin.getText('actions.saved')) as string,
                                                icon: Admin.Message.INFO,
                                                buttons: Admin.Message.OK,
                                                handler: async () => {
                                                    const contexts = Admin.getComponent('contexts') as Admin.Grid.Panel;
                                                    await contexts.getStore().reload();
                                                    const path =
                                                        form.getField('parent').getValue() +
                                                        (form.getField('path').getValue()
                                                            ? '/' + form.getField('path').getValue()
                                                            : '');
                                                    contexts.select({ host: host, language: language, path: path });
                                                    window.close();
                                                    Admin.Message.close();
                                                },
                                            });
                                        }
                                    },
                                }),
                            ],
                            listeners: {
                                show: async (window: Admin.Window) => {
                                    if (path !== null) {
                                        const form = window.getItemAt(0) as Admin.Form.Panel;
                                        const results = await form.load({
                                            url: this.getProcessUrl('context'),
                                            params: { host: host, language: language, path: parent + '/' + path },
                                        });

                                        if (results.success == false) {
                                            window.close();
                                        }
                                    }
                                },
                            },
                        }).show();
                    },
                },
            };

            administrators = {
                /**
                 * 권한필드셋을 출력한다.
                 *
                 * @param {(Admin.Form.FieldSet)} fieldset
                 * @return {Promise<boolean>} success
                 */
                printPermissionFieldSet: async (fieldset: Admin.Form.FieldSet): Promise<boolean> => {
                    const permissions = await Admin.Ajax.get(this.getProcessUrl('permissions'));
                    if (permissions?.success !== true) {
                        return false;
                    }

                    fieldset.append(
                        new Admin.Form.Field.Check({
                            boxLabel: this.printText('admin.administrators.master'),
                            name: 'master',
                            listeners: {
                                change: (field, checked) => {
                                    const fieldsets = field.getParent().getItems();
                                    fieldsets.shift();
                                    fieldsets.forEach((fieldset: Admin.Form.FieldSet) => {
                                        fieldset.setDisabled(checked);
                                    });

                                    if (fieldset.getData('groups') !== null) {
                                        this.administrators.checkPermissionFieldSet(
                                            fieldset,
                                            fieldset.getData('groups'),
                                            true,
                                            true
                                        );
                                    }
                                },
                            },
                        })
                    );

                    for (const component of permissions.components) {
                        fieldset.append(
                            new Admin.Form.FieldSet({
                                title: component.title,
                                items: ((types) => {
                                    const items = [];

                                    items.push(
                                        new Admin.Form.Field.Check({
                                            boxLabel: this.printText('admin.administrators.component_master'),
                                            name: component.name,
                                            listeners: {
                                                change: (field, checked) => {
                                                    const containers = field.getParent().getItems();
                                                    containers.shift();
                                                    containers.forEach((container: Admin.Form.Field.Container) => {
                                                        container.setDisabled(checked);
                                                    });

                                                    if (fieldset.getData('groups') !== null) {
                                                        this.administrators.checkPermissionFieldSet(
                                                            fieldset,
                                                            fieldset.getData('groups'),
                                                            true,
                                                            true
                                                        );
                                                    }
                                                },
                                            },
                                        })
                                    );

                                    for (const type of types) {
                                        items.push(
                                            new Admin.Form.Field.Container({
                                                label: type.label,
                                                direction: 'column',
                                                items: ((permissions) => {
                                                    const items = [];
                                                    items.push(
                                                        new Admin.Form.Field.Check({
                                                            boxLabel: this.printText('admin.administrators.type_all'),
                                                            name: type.name,
                                                            listeners: {
                                                                change: (field, checked) => {
                                                                    const permissions = field
                                                                        .getParent()
                                                                        .getItems() as Admin.Form.Field.Check[];
                                                                    permissions.shift();
                                                                    for (const permission of permissions) {
                                                                        permission.setDisabled(checked);
                                                                    }

                                                                    if (fieldset.getData('groups') !== null) {
                                                                        this.administrators.checkPermissionFieldSet(
                                                                            fieldset,
                                                                            fieldset.getData('groups'),
                                                                            true,
                                                                            true
                                                                        );
                                                                    }
                                                                },
                                                            },
                                                        })
                                                    );

                                                    for (const permission of permissions) {
                                                        items.push(
                                                            new Admin.Form.Field.Check({
                                                                boxLabel: permission.label,
                                                                name: permission.name,
                                                            })
                                                        );
                                                    }

                                                    return items;
                                                })(type.permissions),
                                            })
                                        );
                                    }

                                    return items;
                                })(component.types),
                            })
                        );
                    }

                    return true;
                },
                /**
                 * 권한필드셋을 출력한다.
                 *
                 * @param {(Admin.Form.FieldSet)} fieldset
                 * @param {Object|boolean} permissions
                 * @param {boolean} checked
                 * @param {boolean} disabled
                 * @return {Promise<boolean>} success
                 */
                checkPermissionFieldSet: (
                    fieldset: Admin.Form.FieldSet,
                    permissions: Object | boolean,
                    checked: boolean = true,
                    disabled: boolean = false
                ): void => {
                    if (permissions === true) {
                        fieldset.getField('master')?.setValue(checked);
                        fieldset.getField('master')?.setDisabled(disabled);
                    } else if (typeof permissions == 'object') {
                        for (const component in permissions) {
                            if (permissions[component] === true) {
                                fieldset.getField(component)?.setValue(checked);
                                fieldset.getField(component)?.setDisabled(disabled);
                            } else {
                                for (const type in permissions[component]) {
                                    if (permissions[component][type] === true) {
                                        fieldset.getField(component + '-' + type)?.setValue(checked);
                                        fieldset.getField(component + '-' + type)?.setDisabled(disabled);
                                    } else {
                                        for (const permission of permissions[component][type]) {
                                            fieldset
                                                .getField(component + '-' + type + '@' + permission)
                                                ?.setValue(checked);
                                            fieldset
                                                .getField(component + '-' + type + '@' + permission)
                                                ?.setDisabled(disabled);
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                /**
                 * 그룹필드셋을 출력한다.
                 *
                 * @param {(Admin.Form.FieldSet)} fieldset
                 * @param {boolean} is_ungrouped - 그룹없음 체크박스필드를 보일지 여부
                 * @return {Promise<boolean>} success
                 */
                printGroupFieldSet: async (fieldset: Admin.Form.FieldSet, is_ungrouped: boolean): Promise<boolean> => {
                    const groups = await Admin.Ajax.get(this.getProcessUrl('groups'));

                    if (groups?.success !== true) {
                        return false;
                    }

                    if (is_ungrouped === true) {
                        fieldset.append(
                            new Admin.Form.Field.Check({
                                boxLabel: this.printText('admin.administrators.groups.ungrouped'),
                                listeners: {
                                    change: (field, checked: boolean) => {
                                        field.getParent().getItemAt(1).setDisabled(checked);
                                    },
                                },
                            })
                        );
                    }

                    if (groups.records.length > 0) {
                        fieldset.append(
                            new Admin.Form.Field.CheckGroup({
                                name: 'group_ids',
                                columns: 1,
                                options: ((groups) => {
                                    let options = {};

                                    for (const group of groups) {
                                        if (['ALL', 'EMPTY'].includes(group.group_id) === true) {
                                            continue;
                                        }

                                        options[group.group_id] = group.title;
                                    }

                                    return options;
                                })(groups.records),
                            })
                        );
                    } else {
                        if (is_ungrouped === false) {
                            return false;
                        }
                    }

                    return true;
                },
                groups: {
                    /**
                     * 그룹을 추가한다.
                     *
                     * @param {string} group_id - 그룹정보를 수정할 경우 수정할 group_id
                     */
                    add: (group_id: string = null): void => {
                        new Admin.Window({
                            title: this.printText(
                                'admin.administrators.groups.' + (group_id === null ? 'add' : 'edit')
                            ),
                            width: 500,
                            modal: true,
                            resizable: false,
                            items: [
                                new Admin.Form.Panel({
                                    border: false,
                                    layout: 'fit',
                                    items: [
                                        new Admin.Form.Field.Text({
                                            name: 'title',
                                            emptyText: this.printText('admin.administrators.groups.title'),
                                        }),
                                        new Admin.Form.FieldSet({
                                            title: this.printText('admin.administrators.groups.permissions'),
                                            disabled: true,
                                            items: [],
                                        }),
                                    ],
                                }),
                            ],
                            buttons: [
                                new Admin.Button({
                                    text: this.printText('buttons.cancel'),
                                    tabIndex: -1,
                                    handler: (button) => {
                                        const window = button.getParent() as Admin.Window;
                                        window.close();
                                    },
                                }),
                                new Admin.Button({
                                    text: this.printText('buttons.ok'),
                                    buttonClass: 'confirm',
                                    handler: async (button) => {
                                        const window = button.getParent() as Admin.Window;
                                        const form = button.getParent().getItemAt(0) as Admin.Form.Panel;
                                        const results = await form.submit({
                                            url: this.getProcessUrl('group'),
                                            params: { group_id: group_id },
                                        });

                                        if (results.success == true) {
                                            Admin.Message.show({
                                                title: (await Admin.getText('info')) as string,
                                                message: (await Admin.getText('actions.saved')) as string,
                                                icon: Admin.Message.INFO,
                                                buttons: Admin.Message.OK,
                                                handler: async () => {
                                                    const groups = Admin.getComponent('groups') as Admin.Grid.Panel;
                                                    await groups.getStore().reload();
                                                    groups.select({ group_id: results.group_id });
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
                                    const form = window.getItemAt(0) as Admin.Form.Panel;
                                    const fieldset = form.getItemAt(1) as Admin.Form.FieldSet;
                                    const permissions = await this.administrators.printPermissionFieldSet(fieldset);
                                    if (permissions == true) {
                                        fieldset.enable();
                                    }

                                    if (group_id !== null) {
                                        const results = await form.load({
                                            url: this.getProcessUrl('group'),
                                            params: { group_id: group_id },
                                        });

                                        if (results.success == true) {
                                        } else {
                                            window.close();
                                        }
                                    }
                                },
                            },
                        }).show();
                    },
                },

                /**
                 * 관리자를 추가한다.
                 */
                add: (): void => {
                    const mMember = Admin.getModule('member') as modules.member.MemberAdmin;

                    new Admin.Window({
                        title: this.printText('admin.administrators.add'),
                        width: 800,
                        height: 600,
                        modal: true,
                        resizable: false,
                        items: [
                            new Admin.Panel({
                                layout: 'column',
                                items: [
                                    new Admin.Grid.Panel({
                                        border: [false, true, false, false],
                                        layout: 'fit',
                                        width: 400,
                                        selection: { selectable: true, display: 'check', keepable: true },
                                        autoLoad: true,
                                        freeze: 1,
                                        topbar: [
                                            new Admin.Form.Field.Search({
                                                name: 'keyword',
                                                width: 200,
                                                emptyText: mMember.printText('keyword'),
                                                handler: (keyword, field) => {
                                                    const grid = field.getParent().getParent() as Admin.Grid.Panel;
                                                    if (keyword?.length > 0) {
                                                        grid.getStore().setParam('keyword', keyword);
                                                    } else {
                                                        grid.getStore().setParam('keyword', null);
                                                    }
                                                    grid.getStore().loadPage(1);
                                                },
                                            }),
                                        ],
                                        bottombar: new Admin.Grid.Pagination([
                                            new Admin.Button({
                                                iconClass: 'mi mi-refresh',
                                                handler: (button: Admin.Button) => {
                                                    const grid = button.getParent().getParent() as Admin.Grid.Panel;
                                                    grid.getStore().reload();
                                                },
                                            }),
                                        ]),
                                        columns: [
                                            {
                                                text: mMember.printText('admin.members.name'),
                                                dataIndex: 'name',
                                                width: 150,
                                                renderer: (value, record) => {
                                                    return (
                                                        '<i class="photo" style="background-image:url(' +
                                                        record.data.photo +
                                                        ')"></i>' +
                                                        value
                                                    );
                                                },
                                            },
                                            {
                                                text: mMember.printText('admin.members.email'),
                                                dataIndex: 'email',
                                                width: 200,
                                            },
                                            {
                                                text: mMember.printText('admin.members.nickname'),
                                                dataIndex: 'nickname',
                                                width: 150,
                                            },
                                        ],
                                        store: new Admin.Store.Ajax({
                                            url: Admin.getProcessUrl('module', 'member', 'members'),
                                            fields: [
                                                { name: 'member_id', type: 'int' },
                                                'email',
                                                'name',
                                                'nickname',
                                                'photo',
                                                'joined_at',
                                                'logged_at',
                                            ],
                                            primaryKeys: ['member_id'],
                                            limit: 50,
                                            remoteSort: true,
                                            sorters: { joined_at: 'DESC' },
                                            remoteFilter: true,
                                            filters: { status: 'ACTIVATED' },
                                        }),
                                        listeners: {
                                            selectionChange: (selections, grid) => {
                                                const form = grid.getParent().getItemAt(1) as Admin.Form.Panel;
                                                const display = form
                                                    .getToolbar('top')
                                                    .getItemAt(0) as Admin.Form.Field.Display;
                                                display.setValue(selections.length.toString());
                                            },
                                        },
                                    }),
                                    new Admin.Form.Panel({
                                        flex: 1,
                                        layout: 'fit',
                                        border: false,
                                        fieldDefaults: { labelPosition: 'top' },
                                        disabled: true,
                                        topbar: [
                                            new Admin.Form.Field.Display({
                                                value: '0',
                                                renderer: (value) => {
                                                    return value == '0'
                                                        ? this.printText('admin.administrators.unselected_members')
                                                        : this.printText('admin.administrators.selected_members', {
                                                              count: value,
                                                          });
                                                },
                                            }),
                                            '->',
                                            new Admin.Button({
                                                text: this.printText('admin.administrators.deselect_all'),
                                                handler: (button) => {
                                                    const members = button
                                                        .getParent()
                                                        .getParent()
                                                        .getParent()
                                                        .getItemAt(0) as Admin.Grid.Panel;
                                                    members.resetSelections();
                                                },
                                            }),
                                        ],
                                        items: [
                                            new Admin.Form.Field.Hidden({
                                                name: 'member_ids',
                                            }),
                                            new Admin.Form.FieldSet({
                                                title: this.printText('admin.administrators.groups.groups'),
                                                helpText: this.printText('admin.administrators.add_group_help'),
                                                disabled: true,
                                                items: [],
                                            }),
                                            new Admin.Form.FieldSet({
                                                title: this.printText('admin.administrators.permissions'),
                                                helpText: this.printText('admin.administrators.add_group_help'),
                                                disabled: true,
                                                items: [],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                        buttons: [
                            new Admin.Button({
                                text: this.printText('buttons.cancel'),
                                tabIndex: -1,
                                handler: (button) => {
                                    const window = button.getParent() as Admin.Window;
                                    window.close();
                                },
                            }),
                            new Admin.Button({
                                text: this.printText('buttons.ok'),
                                buttonClass: 'confirm',
                                handler: async (button) => {
                                    const window = button.getParent() as Admin.Window;
                                    const panel = window.getItemAt(0) as Admin.Panel;
                                    const grid = panel.getItemAt(0) as Admin.Grid.Panel;
                                    const form = panel.getItemAt(1) as Admin.Form.Panel;

                                    const member_ids: number[] = grid.getSelections().map((selected) => {
                                        return selected.get('member_id');
                                    });

                                    if (member_ids.length == 0) {
                                        Admin.Message.show({
                                            title: (await Admin.getText('info')) as string,
                                            message: (await Admin.getText(
                                                'admin.administrators.actions.unselected_members'
                                            )) as string,
                                            icon: Admin.Message.INFO,
                                            buttons: Admin.Message.OK,
                                        });
                                        return;
                                    }

                                    form.getField('member_ids').setValue(member_ids);

                                    const results = await form.submit({
                                        url: this.getProcessUrl('administrator'),
                                    });

                                    if (results.success == true) {
                                        Admin.Message.show({
                                            title: (await Admin.getText('info')) as string,
                                            message: (await Admin.getText('actions.saved')) as string,
                                            icon: Admin.Message.INFO,
                                            buttons: Admin.Message.OK,
                                            handler: async () => {
                                                const groups = Admin.getComponent('groups') as Admin.Grid.Panel;
                                                const administrators = Admin.getComponent(
                                                    'administrators'
                                                ) as Admin.Grid.Panel;
                                                await groups.getStore().reload();
                                                await administrators.getStore().reload();
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
                                const form = window.getItemAt(0).getItemAt(1) as Admin.Form.Panel;
                                const groups = form.getItemAt(1) as Admin.Form.FieldSet;
                                const permissions = form.getItemAt(2) as Admin.Form.FieldSet;

                                if ((await this.administrators.printGroupFieldSet(groups, false)) == true) {
                                    groups.enable();
                                    groups
                                        .getItemAt(0)
                                        .addEvent(
                                            'change',
                                            async (_field: Admin.Form.Field.CheckGroup, value: string[]) => {
                                                const groupPermissions = permissions.getData('groups');
                                                if (groupPermissions !== null) {
                                                    permissions.setData('groups', null);
                                                    this.administrators.checkPermissionFieldSet(
                                                        permissions,
                                                        groupPermissions,
                                                        false,
                                                        false
                                                    );
                                                }

                                                if (value !== null) {
                                                    const results = await Admin.Ajax.get(
                                                        this.getProcessUrl('group.permissions'),
                                                        { group_ids: value.join(',') }
                                                    );

                                                    this.administrators.checkPermissionFieldSet(
                                                        permissions,
                                                        results.permissions,
                                                        true,
                                                        true
                                                    );

                                                    permissions.setData('groups', results.permissions);
                                                }
                                            }
                                        );
                                } else {
                                    groups.enable();
                                    groups.hide();
                                }

                                if ((await this.administrators.printPermissionFieldSet(permissions)) == true) {
                                    permissions.enable();
                                }

                                if (groups.isDisabled() == false && permissions.isDisabled() == false) {
                                    form.enable();
                                }
                            },
                        },
                    }).show();
                },
                /**
                 * 그룹을 지정한다.
                 *
                 * @param {boolean} replacement - 기존 그룹 대치여부
                 */
                setGroups: (replacement: boolean) => {
                    const administrators = Admin.getComponent('administrators') as Admin.Grid.Panel;
                    const selections = administrators.getSelections();
                    if (selections.length == 0) {
                        return;
                    }

                    const member_ids: number[] = selections.map((selected) => {
                        return selected.get('member_id');
                    });

                    let title =
                        replacement == true
                            ? this.printText('admin.administrators.move_group')
                            : this.printText('admin.administrators.add_group');
                    title += ' (';
                    if (selections.length == 1) {
                        title += selections[0].get('name');
                    } else {
                        title += this.printText('admin.administrators.selectedCount', {
                            count: selections.length.toString(),
                        });
                    }
                    title += ')';

                    new Admin.Window({
                        title: title,
                        width: 400,
                        modal: true,
                        resizable: false,
                        items: [
                            new Admin.Form.Panel({
                                layout: 'fit',
                                border: false,
                                disabled: true,
                                items: [
                                    new Admin.Form.Field.Hidden({
                                        name: 'member_ids',
                                        value: member_ids,
                                    }),
                                    new Admin.Form.Field.Hidden({
                                        name: 'mode',
                                        value: replacement == true ? 'move_group' : 'add_group',
                                    }),
                                    new Admin.Form.FieldSet({
                                        title: this.printText('admin.administrators.groups.groups'),
                                        helpText:
                                            replacement == true
                                                ? this.printText('admin.administrators.move_group_help')
                                                : this.printText('admin.administrators.add_group_help'),
                                        disabled: true,
                                        items: [],
                                    }),
                                ],
                            }),
                        ],
                        buttons: [
                            new Admin.Button({
                                text: this.printText('buttons.cancel'),
                                tabIndex: -1,
                                handler: (button) => {
                                    const window = button.getParent() as Admin.Window;
                                    window.close();
                                },
                            }),
                            new Admin.Button({
                                text: this.printText('buttons.ok'),
                                buttonClass: 'confirm',
                                handler: async (button) => {
                                    const window = button.getParent() as Admin.Window;
                                    const form = window.getItemAt(0) as Admin.Form.Panel;

                                    const results = await form.submit({
                                        url: this.getProcessUrl('administrator'),
                                    });

                                    if (results.success == true) {
                                        Admin.Message.show({
                                            title: (await Admin.getText('info')) as string,
                                            message: (await Admin.getText('actions.saved')) as string,
                                            icon: Admin.Message.INFO,
                                            buttons: Admin.Message.OK,
                                            handler: async () => {
                                                const groups = Admin.getComponent('groups') as Admin.Grid.Panel;
                                                const administrators = Admin.getComponent(
                                                    'administrators'
                                                ) as Admin.Grid.Panel;
                                                await groups.getStore().reload();
                                                await administrators.getStore().reload();
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
                                const form = window.getItemAt(0) as Admin.Form.Panel;
                                const groups = form.getItemAt(2) as Admin.Form.FieldSet;
                                if ((await this.administrators.printGroupFieldSet(groups, replacement)) == true) {
                                    groups.enable();
                                } else {
                                    // @todo 그룹이 없거나 그룹을 불러오지 못함
                                }

                                if (groups.isDisabled() == false) {
                                    form.enable();
                                }
                            },
                        },
                    }).show();
                },
            };
        }
    }
}
