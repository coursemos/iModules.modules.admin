/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈의 관리자 컨텍스트를 위한 클래스를 정의한다.
 *
 * @file /modules/admin/admin/scripts/Admin.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
namespace modules {
    export namespace admin {
        export namespace admin {
            export class Admin extends Component {
                modules = {
                    /**
                     * 모듈정보를 확인한다.
                     *
                     * @param {string} name - 모듈명
                     */
                    show: (name: string): void => {
                        new Aui.Window({
                            title: 'Loading...',
                            width: 680,
                            modal: true,
                            resizable: false,
                            items: [
                                new Aui.Form.Panel({
                                    border: false,
                                    layout: 'fit',
                                    fieldDefaults: { labelWidth: 100, labelAlign: 'right' },
                                    items: [
                                        new Aui.Form.FieldSet({
                                            title: this.printText('admin.modules.modules.show.defaults'),
                                            items: [
                                                new Aui.Form.Field.Container({
                                                    direction: 'row',
                                                    items: [
                                                        new Aui.Form.Field.Container({
                                                            width: 100,
                                                            direction: 'column',
                                                            items: [
                                                                new Aui.Form.Field.Display({
                                                                    name: 'icon',
                                                                    renderer: (value: string) => {
                                                                        const $box = Html.create('div');
                                                                        $box.setStyle(
                                                                            'margin',
                                                                            'calc(var(--padding-default) * -1)'
                                                                        );
                                                                        $box.setStyle('width', '100px');
                                                                        $box.setStyle('height', '100px');
                                                                        $box.setStyle(
                                                                            'border',
                                                                            '1px solid transparent'
                                                                        );
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
                                                                new Aui.Form.Field.Display({
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
                                                                        $box.setStyle(
                                                                            'color',
                                                                            'var(--input-color-select)'
                                                                        );

                                                                        return $box.toHtml();
                                                                    },
                                                                }),
                                                            ],
                                                        }),
                                                        new Aui.Form.Field.Container({
                                                            flex: 1,
                                                            direction: 'column',
                                                            items: [
                                                                new Aui.Form.Field.Display({
                                                                    label: this.printText(
                                                                        'admin.modules.modules.author'
                                                                    ),
                                                                    name: 'author',
                                                                }),
                                                                new Aui.Form.Field.Display({
                                                                    label: this.printText(
                                                                        'admin.modules.modules.homepage'
                                                                    ),
                                                                    name: 'homepage',
                                                                }),
                                                                new Aui.Form.Field.Display({
                                                                    label: this.printText(
                                                                        'admin.modules.modules.language'
                                                                    ),
                                                                    name: 'language',
                                                                }),
                                                                new Aui.Form.Field.Display({
                                                                    label: this.printText('admin.modules.modules.hash'),
                                                                    name: 'hash',
                                                                }),
                                                            ],
                                                        }),
                                                    ],
                                                }),
                                            ],
                                        }),
                                        new Aui.Form.FieldSet({
                                            title: this.printText('admin.modules.modules.show.details'),
                                            items: [
                                                new Aui.Form.Field.Display({
                                                    name: 'description',
                                                }),
                                            ],
                                        }),
                                        new Aui.Form.FieldSet({
                                            title: this.printText('admin.modules.modules.show.properties.title'),
                                            items: [
                                                new Aui.Form.Field.CheckGroup({
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
                                                        CRON: this.printText(
                                                            'admin.modules.modules.show.properties.CRON'
                                                        ),
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
                                new Aui.Button({
                                    text: this.printText('buttons.configs'),
                                    tabIndex: -1,
                                    hidden: true,
                                    handler: (button) => {
                                        this.modules.setConfigs(name, button.getParent().getData('configs'));
                                    },
                                }),
                                new Aui.Button({
                                    text: this.printText('buttons.close'),
                                    buttonClass: 'confirm',
                                    handler: (button) => {
                                        const window = button.getParent() as Aui.Window;
                                        window.close();
                                    },
                                }),
                            ],
                            listeners: {
                                show: async (window) => {
                                    const form = window.getItemAt(0) as Aui.Form.Panel;
                                    const results = await form.load({
                                        url: this.getProcessUrl('module'),
                                        params: { name: name },
                                    });

                                    window.setData('configs', results);

                                    if (results.success == true) {
                                        window.getTitle().setTitle(results.data.title);

                                        const button = window.buttons.at(0) as Aui.Button;
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
                     * @param {Aui.Ajax.Results} configs - 모듈정보
                     */
                    setConfigs: async (name: string, configs: Aui.Ajax.Results = null): Promise<void> => {
                        let response = configs;

                        if (response === null) {
                            Aui.Message.loading();
                            response = await Aui.Ajax.get(this.getProcessUrl('module'), { name: name });
                            Aui.Message.close();
                        }

                        if (response.data.properties.includes('CONFIGS') == true) {
                            let form = (await globalThis.Admin.getModule(name)?.getConfigsForm()) ?? null;
                            if (form !== null && form instanceof Aui.Form.Panel) {
                                form.border = false;
                                form.layout = 'fit';
                            } else {
                                form = new Aui.Form.Panel({
                                    border: false,
                                    layout: 'fit',
                                    items: ((fields: AdminUi.Form.Field.Create.Properties[]) => {
                                        const items = [];
                                        for (const field of fields) {
                                            items.push(AdminUi.Form.Field.Create(field));
                                        }
                                        return items;
                                    })(response.fields),
                                });
                            }

                            new Aui.Window({
                                title: response.data.title,
                                width: 680,
                                modal: true,
                                resizable: false,
                                items: [form],
                                buttons: [
                                    new Aui.Button({
                                        text: this.printText('buttons.cancel'),
                                        tabIndex: -1,
                                        handler: (button) => {
                                            const window = button.getParent() as Aui.Window;
                                            window.close();
                                        },
                                    }),
                                    new Aui.Button({
                                        text: this.printText('buttons.ok'),
                                        buttonClass: 'confirm',
                                        handler: async (button) => {
                                            const window = button.getParent() as Aui.Window;
                                            const form = window.getItemAt(0) as Aui.Form.Panel;

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
                                        const form = window.getItemAt(0) as Aui.Form.Panel;
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
                            Aui.Message.loading();
                            const response = await Aui.Ajax.get(this.getProcessUrl('module'), { name: name });

                            if (response.data.properties.includes('CONFIGS') == true) {
                                Aui.Message.close();
                                this.modules.setConfigs(name, response);
                                return false;
                            }
                        }

                        Aui.Message.loading({
                            title: (await this.getText('actions.installing_status')) as string,
                            message: (await this.getText('actions.installing')) as string,
                            type: 'atom',
                        });

                        const results = await Aui.Ajax.post(
                            this.getProcessUrl('module'),
                            { name: name, configs: configs },
                            {},
                            false
                        );
                        if (results.success == true) {
                            Aui.Message.close();
                            (Aui.getComponent('modules') as Aui.Grid.Panel)?.getStore().reload();
                            return true;
                        } else {
                            if ((results.message ?? null) === null) {
                                Aui.Message.close();
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
                            new Aui.Window({
                                title: this.printText('admin.sitemap.domains.' + (host === null ? 'add' : 'edit')),
                                width: 500,
                                modal: true,
                                resizable: false,
                                items: [
                                    new Aui.Form.Panel({
                                        border: false,
                                        layout: 'fit',
                                        items: [
                                            new Aui.Form.FieldSet({
                                                title: this.printText('admin.sitemap.domains.host'),
                                                items: [
                                                    new Aui.Form.Field.Container({
                                                        direction: 'row',
                                                        items: [
                                                            new Aui.Form.Field.Select({
                                                                name: 'is_https',
                                                                value: 'TRUE',
                                                                store: new Aui.Store.Array({
                                                                    fields: ['display', 'value'],
                                                                    records: [
                                                                        ['https://', 'TRUE'],
                                                                        ['http://', 'FALSE'],
                                                                    ],
                                                                }),
                                                                width: 100,
                                                            }),
                                                            new Aui.Form.Field.Text({
                                                                name: 'host',
                                                                flex: 1,
                                                                allowBlank: false,
                                                                emptyText: this.printText('admin.sitemap.domains.host'),
                                                            }),
                                                        ],
                                                    }),
                                                    new Aui.Form.Field.TextArea({
                                                        name: 'alias',
                                                        rows: 3,
                                                        emptyText: this.printText('admin.sitemap.domains.alias'),
                                                    }),
                                                ],
                                            }),
                                            new Aui.Form.FieldSet({
                                                title: this.printText('admin.sitemap.domains.options.title'),
                                                items: [
                                                    new Aui.Form.Field.Check({
                                                        name: 'is_rewrite',
                                                        boxLabel: this.printText(
                                                            'admin.sitemap.domains.options.is_rewrite'
                                                        ),
                                                        onValue: 'TRUE',
                                                        checked: globalThis.Admin.isRewrite(),
                                                    }),
                                                    new Aui.Form.Field.Check({
                                                        name: 'is_internationalization',
                                                        boxLabel: this.printText(
                                                            'admin.sitemap.domains.options.is_internationalization'
                                                        ),
                                                        onValue: 'TRUE',
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                                buttons: [
                                    new Aui.Button({
                                        text: this.printText('buttons.cancel'),
                                        tabIndex: -1,
                                        handler: (button) => {
                                            const window = button.getParent() as Aui.Window;
                                            window.close();
                                        },
                                    }),
                                    new Aui.Button({
                                        text: this.printText('buttons.ok'),
                                        buttonClass: 'confirm',
                                        handler: async (button) => {
                                            const window = button.getParent() as Aui.Window;
                                            const form = button.getParent().getItemAt(0) as Aui.Form.Panel;
                                            const results = await form.submit({
                                                url: this.getProcessUrl('domain'),
                                                params: { host: host },
                                            });

                                            if (results.success == true) {
                                                Aui.Message.show({
                                                    title: (await this.getText('info')) as string,
                                                    message: (await this.getText('actions.saved')) as string,
                                                    icon: Aui.Message.INFO,
                                                    buttons: Aui.Message.OK,
                                                    handler: async () => {
                                                        const domains = Aui.getComponent('domains') as Aui.Grid.Panel;
                                                        await domains.getStore().reload();
                                                        domains.select({ host: form.getField('host').getValue() });
                                                        window.close();
                                                        Aui.Message.close();
                                                    },
                                                });
                                            }
                                        },
                                    }),
                                ],
                                listeners: {
                                    show: async (window) => {
                                        if (host !== null) {
                                            const form = window.getItemAt(0) as Aui.Form.Panel;
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
                        /**
                         * 도메인을 삭제한다.
                         *
                         * @param {string} host - 삭제할 호스트명
                         */
                        delete: (host: string): void => {
                            Aui.Message.delete({
                                message: this.printText('admin.sitemap.domains.actions.delete'),
                                url: this.getProcessUrl('domain'),
                                params: {
                                    host: host,
                                },
                                handler: async () => {
                                    const domains: Aui.Grid.Panel = Aui.getComponent('domains') as Aui.Grid.Panel;
                                    domains.getStore().reload();
                                },
                            });
                        },
                    },
                    sites: {
                        /**
                         * 사이트를 추가한다.
                         *
                         * @param {string} language - 사이트정보를 수정할 경우 수정할 host 명
                         */
                        add: (language: string = null): void => {
                            const domains: Aui.Grid.Panel = Aui.getComponent('domains') as Aui.Grid.Panel;
                            const host =
                                domains.getSelections().length == 1 ? domains.getSelections()[0].get('host') : null;
                            if (host === null) {
                                return;
                            }

                            new Aui.Window({
                                title: this.printText('admin.sitemap.sites.' + (language === null ? 'add' : 'edit')),
                                width: 700,
                                modal: true,
                                resizable: false,
                                items: [
                                    new Aui.Form.Panel({
                                        border: false,
                                        layout: 'fit',
                                        fieldDefaults: { labelWidth: 100, labelAlign: 'right' },
                                        items: [
                                            new Aui.Form.FieldSet({
                                                title: this.printText('admin.sitemap.sites.default'),
                                                items: [
                                                    new Aui.Form.Field.Text({
                                                        name: 'title',
                                                        allowBlank: false,
                                                        label: this.printText('admin.sitemap.sites.title'),
                                                    }),
                                                    new Aui.Form.Field.Container({
                                                        label: this.printText('admin.sitemap.sites.language'),
                                                        allowBlank: false,
                                                        items: [
                                                            new Aui.Form.Field.Select({
                                                                name: 'language',
                                                                store: new Aui.Store.Ajax({
                                                                    url: this.getProcessUrl('languages'),
                                                                }),
                                                                displayField: 'name',
                                                                valueField: 'language',
                                                                value: globalThis.Admin.getLanguage(),
                                                                width: 110,
                                                            }),
                                                            new Aui.Form.Field.Check({
                                                                name: 'is_default',
                                                                boxLabel: this.printText(
                                                                    'admin.sitemap.sites.default_language'
                                                                ),
                                                                flex: true,
                                                            }),
                                                        ],
                                                    }),
                                                    new Aui.Form.Field.TextArea({
                                                        name: 'description',
                                                        label: this.printText('admin.sitemap.sites.description'),
                                                        rows: 3,
                                                    }),
                                                ],
                                            }),
                                            new Aui.Form.FieldSet({
                                                title: this.printText('admin.sitemap.sites.design'),
                                                items: [
                                                    new AdminUi.Form.Field.Theme({
                                                        name: 'theme',
                                                        label: this.printText('admin.sitemap.sites.theme'),
                                                        listeners: {
                                                            configs: (
                                                                field: AdminUi.Form.Field.Theme,
                                                                configs: { [key: string]: any }
                                                            ) => {
                                                                if (configs.logo !== null) {
                                                                    const logo = field
                                                                        .getForm()
                                                                        .getField('logo') as Aui.Form.Field.Image;
                                                                    logo.setImageSize(
                                                                        configs.logo.width,
                                                                        configs.logo.height
                                                                    );
                                                                    logo.setHelpText(configs.logo.message ?? null);
                                                                }
                                                            },
                                                        },
                                                    }),
                                                    new Aui.Form.Field.Color({
                                                        name: 'color',
                                                        label: this.printText('admin.sitemap.sites.color'),
                                                    }),
                                                    new AdminUi.Form.Field.Include({
                                                        name: 'header',
                                                        label: this.printText('admin.sitemap.sites.header'),
                                                    }),
                                                    new AdminUi.Form.Field.Include({
                                                        name: 'footer',
                                                        label: this.printText('admin.sitemap.sites.footer'),
                                                    }),
                                                ],
                                            }),
                                            new Aui.Form.FieldSet({
                                                title: this.printText('admin.sitemap.sites.images'),
                                                items: [
                                                    new Aui.Form.Field.Image({
                                                        name: 'logo',
                                                        label: this.printText('admin.sitemap.sites.logo'),
                                                        showSize: true,
                                                        imageWidth: 200,
                                                        imageHeight: 50,
                                                    }),
                                                    new Aui.Form.Field.Image({
                                                        name: 'emblem',
                                                        label: this.printText('admin.sitemap.sites.emblem'),
                                                        helpText: this.printText('admin.sitemap.sites.emblem_help'),
                                                        imageWidth: 144,
                                                        imageHeight: 144,
                                                    }),
                                                    new Aui.Form.Field.Image({
                                                        name: 'favicon',
                                                        label: this.printText('admin.sitemap.sites.favicon'),
                                                        helpText: this.printText('admin.sitemap.sites.favicon_help'),
                                                        accept: 'image/x-icon',
                                                        imageWidth: 32,
                                                        imageHeight: 32,
                                                    }),
                                                    new Aui.Form.Field.Image({
                                                        name: 'image',
                                                        label: this.printText('admin.sitemap.sites.image'),
                                                        helpText: this.printText('admin.sitemap.sites.image_help'),
                                                        imageWidth: 1200,
                                                        imageHeight: 630,
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                                buttons: [
                                    new Aui.Button({
                                        text: this.printText('buttons.cancel'),
                                        tabIndex: -1,
                                        handler: (button) => {
                                            const window = button.getParent() as Aui.Window;
                                            window.close();
                                        },
                                    }),
                                    new Aui.Button({
                                        text: this.printText('buttons.ok'),
                                        buttonClass: 'confirm',
                                        handler: async (button) => {
                                            const window = button.getParent() as Aui.Window;
                                            const form = button.getParent().getItemAt(0) as Aui.Form.Panel;
                                            const results = await form.submit({
                                                url: this.getProcessUrl('site'),
                                                params: { host: host, language: language },
                                            });

                                            if (results.success == true) {
                                                Aui.Message.show({
                                                    title: (await this.getText('info')) as string,
                                                    message: (await this.getText('actions.saved')) as string,
                                                    icon: Aui.Message.INFO,
                                                    buttons: Aui.Message.OK,
                                                    handler: async () => {
                                                        const sites = Aui.getComponent('sites') as Aui.Grid.Panel;
                                                        await sites.getStore().reload();
                                                        sites.select({
                                                            host: host,
                                                            language: form.getField('language').getValue(),
                                                        });
                                                        window.close();
                                                        Aui.Message.close();
                                                    },
                                                });
                                            }
                                        },
                                    }),
                                ],
                                listeners: {
                                    show: async (window) => {
                                        if (language !== null) {
                                            const form = window.getItemAt(0) as Aui.Form.Panel;
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
                        /**
                         * 사이트를 삭제한다.
                         *
                         * @param {string} language - 삭제할 언어
                         */
                        delete: (language: string): void => {
                            const domains: Aui.Grid.Panel = Aui.getComponent('domains') as Aui.Grid.Panel;
                            const host =
                                domains.getSelections().length == 1 ? domains.getSelections()[0].get('host') : null;
                            if (host === null) {
                                return;
                            }

                            Aui.Message.delete({
                                message: this.printText('admin.sitemap.sites.actions.delete'),
                                url: this.getProcessUrl('site'),
                                params: {
                                    host: host,
                                    language: language,
                                },
                                handler: async () => {
                                    const sites: Aui.Grid.Panel = Aui.getComponent('sites') as Aui.Grid.Panel;
                                    sites.getStore().reload();
                                },
                            });
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
                            const domains: Aui.Grid.Panel = Aui.getComponent('domains') as Aui.Grid.Panel;
                            const host =
                                domains.getSelections().length == 1 ? domains.getSelections()[0].get('host') : null;
                            if (host === null) {
                                return;
                            }

                            const sites: Aui.Grid.Panel = Aui.getComponent('sites') as Aui.Grid.Panel;
                            const language =
                                sites.getSelections().length == 1 ? sites.getSelections()[0].get('language') : null;
                            if (language === null) {
                                return;
                            }

                            new Aui.Window({
                                title: this.printText('admin.sitemap.contexts.' + (path === null ? 'add' : 'edit')),
                                width: 700,
                                modal: true,
                                resizable: false,
                                items: [
                                    new Aui.Form.Panel({
                                        border: false,
                                        layout: 'fit',
                                        items: [
                                            new Aui.Form.FieldSet({
                                                title: this.printText('admin.sitemap.contexts.default'),
                                                items: [
                                                    new Aui.Form.Field.Container({
                                                        label: this.printText('admin.sitemap.contexts.path'),
                                                        direction: 'row',
                                                        gap: 5,
                                                        items: [
                                                            ((path) => {
                                                                if (path == '/') {
                                                                    return new Aui.Form.Field.Display({
                                                                        name: 'basename',
                                                                        value: path,
                                                                    });
                                                                } else {
                                                                    return new Aui.Form.Field.Select({
                                                                        name: 'parent',
                                                                        width: 200,
                                                                        store: new Aui.TreeStore.Ajax({
                                                                            url: this.getProcessUrl('contexts'),
                                                                            params: {
                                                                                host: host,
                                                                                language: language,
                                                                                mode: 'tree',
                                                                            },
                                                                            primaryKeys: ['host', 'language', 'path'],
                                                                            sorters: { sort: 'ASC' },
                                                                        }),
                                                                        listRenderer: (display) => {
                                                                            if (display == '/') return display;
                                                                            return display + '/';
                                                                        },
                                                                        renderer: (display) => {
                                                                            if (display == '/') return display;
                                                                            return display + '/';
                                                                        },
                                                                        displayField: 'path',
                                                                        listField: 'display',
                                                                        valueField: 'path',
                                                                        search: true,
                                                                        value: '/',
                                                                    });
                                                                }
                                                            })(path),
                                                            new Aui.Form.Field.Text({
                                                                name: 'basename',
                                                                flex: 1,
                                                                allowBlank: false,
                                                                hidden: path == '/',
                                                                disabled: path == '/',
                                                            }),
                                                        ],
                                                    }),
                                                    new AdminUi.Form.Field.Icon({
                                                        name: 'icon',
                                                        label: this.printText('admin.sitemap.contexts.icon'),
                                                        value: 'NONE',
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        name: 'title',
                                                        label: this.printText('admin.sitemap.contexts.title'),
                                                        allowBlank: false,
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        name: 'description',
                                                        label: this.printText('admin.sitemap.contexts.description'),
                                                    }),
                                                    new Aui.Form.Field.Image({
                                                        name: 'image',
                                                        label: this.printText('admin.sitemap.contexts.image'),
                                                        helpText: this.printText('admin.sitemap.contexts.image_help'),
                                                        imageWidth: 1200,
                                                        imageHeight: 630,
                                                    }),
                                                    new Aui.Form.Field.RadioGroup({
                                                        name: 'type',
                                                        label: this.printText('admin.sitemap.contexts.type'),
                                                        displayType: 'box',
                                                        inputClass: 'context_type',
                                                        columns: 6,
                                                        value: 'EMPTY',
                                                        options: (() => {
                                                            const options = {};
                                                            for (const type of this.sitemap.contexts.getTypes()) {
                                                                options[type] =
                                                                    this.sitemap.contexts.getTypeIcon(type) +
                                                                    '<span>' +
                                                                    this.printText(
                                                                        'admin.sitemap.contexts.types.' + type
                                                                    ) +
                                                                    '</span>';
                                                            }
                                                            return options;
                                                        })(),
                                                        listeners: {
                                                            change: (
                                                                field: Aui.Form.Field.RadioGroup,
                                                                value: string
                                                            ) => {
                                                                const form = field.getForm();
                                                                const details = Aui.getComponent(
                                                                    'details'
                                                                ) as Aui.Form.FieldSet;

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

                                                                const design = Aui.getComponent(
                                                                    'design'
                                                                ) as Aui.Form.FieldSet;
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
                                            new Aui.Form.FieldSet({
                                                id: 'details',
                                                title: this.printText('admin.sitemap.contexts.details'),
                                                items: [
                                                    new Aui.Form.Field.Display({
                                                        name: 'child',
                                                        label: this.printText('admin.sitemap.contexts.child'),
                                                        value: null,
                                                        renderer: () => {
                                                            return this.printText('admin.sitemap.contexts.child_help');
                                                        },
                                                    }),
                                                    new AdminUi.Form.Field.Page({
                                                        name: 'page',
                                                        label: this.printText('admin.sitemap.contexts.page'),
                                                        helpText: this.printText('admin.sitemap.contexts.page_help'),
                                                        allowBlank: false,
                                                        host: host,
                                                        language: language,
                                                    }),
                                                    new Aui.Form.Field.Check({
                                                        name: 'is_routing',
                                                        label: this.printText('admin.sitemap.contexts.is_routing'),
                                                        boxLabel: this.printText(
                                                            'admin.sitemap.contexts.is_routing_help'
                                                        ),
                                                    }),
                                                    new AdminUi.Form.Field.Context({
                                                        name: 'module',
                                                        label: this.printText('admin.sitemap.contexts.module'),
                                                        allowBlank: false,
                                                        path: path !== null ? parent + '/' + path : null,
                                                    }),
                                                ],
                                            }),
                                            new Aui.Form.FieldSet({
                                                id: 'design',
                                                title: this.printText('admin.sitemap.contexts.design'),
                                                items: [
                                                    new Aui.Form.Field.Select({
                                                        name: 'layout',
                                                        label: this.printText('admin.sitemap.contexts.layout'),
                                                        valueField: 'name',
                                                        displayField: 'title',
                                                        allowBlank: false,
                                                        store: new Aui.Store.Ajax({
                                                            url: this.getProcessUrl('layouts'),
                                                            autoLoad: false,
                                                            params: { host: host, language: language },
                                                        }),
                                                    }),
                                                    new AdminUi.Form.Field.Include({
                                                        label: this.printText('admin.sitemap.contexts.header'),
                                                        name: 'header',
                                                    }),
                                                    new AdminUi.Form.Field.Include({
                                                        label: this.printText('admin.sitemap.contexts.footer'),
                                                        name: 'footer',
                                                    }),
                                                ],
                                            }),
                                            new Aui.Form.FieldSet({
                                                title: this.printText('admin.sitemap.contexts.visibility'),
                                                items: [
                                                    new Aui.Form.Field.Check({
                                                        name: 'is_sitemap',
                                                        label: this.printText('admin.sitemap.contexts.is_sitemap'),
                                                        boxLabel: this.printText(
                                                            'admin.sitemap.contexts.is_sitemap_help'
                                                        ),
                                                        checked: true,
                                                    }),
                                                    new Aui.Form.Field.Check({
                                                        name: 'is_footer_menu',
                                                        label: this.printText('admin.sitemap.contexts.is_footer_menu'),
                                                        boxLabel: this.printText(
                                                            'admin.sitemap.contexts.is_footer_menu_help'
                                                        ),
                                                    }),
                                                    new AdminUi.Form.Field.Permission({
                                                        name: 'permission',
                                                        label: this.printText('admin.sitemap.contexts.permission'),
                                                        boxLabel: this.printText(
                                                            'admin.sitemap.contexts.permission_help'
                                                        ),
                                                        value: 'true',
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                                buttons: [
                                    new Aui.Button({
                                        text: this.printText('buttons.cancel'),
                                        tabIndex: -1,
                                        handler: (button) => {
                                            const window = button.getParent() as Aui.Window;
                                            window.close();
                                        },
                                    }),
                                    new Aui.Button({
                                        text: this.printText('buttons.ok'),
                                        buttonClass: 'confirm',
                                        handler: async (button) => {
                                            const window = button.getParent() as Aui.Window;
                                            const form = button.getParent().getItemAt(0) as Aui.Form.Panel;
                                            const results = await form.submit({
                                                url: this.getProcessUrl('context'),
                                                params: {
                                                    host: host,
                                                    language: language,
                                                    path: path,
                                                },
                                            });

                                            if (results.success == true) {
                                                Aui.Message.show({
                                                    title: (await this.getText('info')) as string,
                                                    message: (await this.getText('actions.saved')) as string,
                                                    icon: Aui.Message.INFO,
                                                    buttons: Aui.Message.OK,
                                                    handler: async () => {
                                                        const contexts = Aui.getComponent('contexts') as Aui.Grid.Panel;
                                                        await contexts.getStore().reload();
                                                        contexts.select({
                                                            host: host,
                                                            language: language,
                                                            path: results.path,
                                                        });
                                                        window.close();
                                                        Aui.Message.close();
                                                    },
                                                });
                                            }
                                        },
                                    }),
                                ],
                                listeners: {
                                    show: async (window: Aui.Window) => {
                                        if (path !== null) {
                                            const form = window.getItemAt(0) as Aui.Form.Panel;
                                            const results = await form.load({
                                                url: this.getProcessUrl('context'),
                                                params: { host: host, language: language, path: path },
                                            });

                                            if (results.success == false) {
                                                window.close();
                                            }
                                        }
                                    },
                                },
                            }).show();
                        },
                        /**
                         * 컨텍스트를 삭제한다.
                         *
                         * @param {string} path - 삭제할 경로
                         */
                        delete: (path: string): void => {
                            const domains: Aui.Grid.Panel = Aui.getComponent('domains') as Aui.Grid.Panel;
                            const host =
                                domains.getSelections().length == 1 ? domains.getSelections()[0].get('host') : null;
                            if (host === null) {
                                return;
                            }

                            const sites: Aui.Grid.Panel = Aui.getComponent('sites') as Aui.Grid.Panel;
                            const language =
                                sites.getSelections().length == 1 ? sites.getSelections()[0].get('language') : null;
                            if (language === null) {
                                return;
                            }

                            Aui.Message.delete({
                                message: this.printText('admin.sitemap.contexts.actions.delete'),
                                url: this.getProcessUrl('context'),
                                params: {
                                    host: host,
                                    language: language,
                                    path: path,
                                },
                                handler: async () => {
                                    const contexts: Aui.Grid.Panel = Aui.getComponent('contexts') as Aui.Grid.Panel;
                                    contexts.getStore().reload();
                                },
                            });
                        },
                    },
                };

                administrators = {
                    /**
                     * 권한필드셋을 출력한다.
                     *
                     * @param {(Aui.Form.FieldSet)} fieldset - 권한범위필드를 출력할 필드셋 객체
                     * @param {boolean} readonly - 읽기전용여부
                     * @return {Promise<boolean>} success
                     */
                    printScopesFieldSet: async (
                        fieldset: Aui.Form.FieldSet,
                        readonly: boolean = false
                    ): Promise<boolean> => {
                        const results = await Aui.Ajax.get(this.getProcessUrl('scopes'));
                        if (results?.success !== true) {
                            return false;
                        }

                        fieldset.append(
                            new Aui.Form.Field.Check({
                                boxLabel: this.printText('admin.administrators.lists.master'),
                                name: 'master',
                                readonly: readonly,
                                listeners: {
                                    change: (field, checked) => {
                                        const components = field.getParent().getItems();
                                        components.shift();
                                        components.forEach((component: Aui.Form.FieldSet) => {
                                            component.properties.checkDisabled(component, checked);
                                        });
                                    },
                                },
                            })
                        );

                        for (const component of results.components) {
                            fieldset.append(
                                new Aui.Form.FieldSet({
                                    title: component.title,
                                    items: (() => {
                                        const items = [];

                                        items.push(
                                            new Aui.Form.Field.Check({
                                                boxLabel: this.printText('admin.administrators.lists.component_master'),
                                                name: component.code,
                                                readonly: readonly,
                                                listeners: {
                                                    change: (field, checked) => {
                                                        const containers = field.getParent().getItems();
                                                        containers.shift();
                                                        containers.forEach((container: Aui.Form.Field.Container) => {
                                                            container.properties.checkDisabled(container, checked);
                                                        });
                                                    },
                                                },
                                            })
                                        );

                                        for (const scope of component.scopes) {
                                            items.push(
                                                new Aui.Form.Field.Container({
                                                    label: scope.title,
                                                    direction: 'column',
                                                    items: (() => {
                                                        const items = [];
                                                        items.push(
                                                            new Aui.Form.Field.Check({
                                                                boxLabel: this.printText(
                                                                    'admin.administrators.lists.scope_all'
                                                                ),
                                                                name: scope.code,
                                                                readonly: readonly,
                                                                listeners: {
                                                                    change: (field, checked) => {
                                                                        const children = field
                                                                            .getParent()
                                                                            .getItems() as Aui.Form.Field.Check[];
                                                                        children.shift();
                                                                        for (const child of children) {
                                                                            child.setDisabled(checked);
                                                                        }
                                                                    },
                                                                },
                                                            })
                                                        );

                                                        for (const child of scope.children) {
                                                            items.push(
                                                                new Aui.Form.Field.Check({
                                                                    boxLabel: child.title,
                                                                    name: child.code,
                                                                    readonly: readonly,
                                                                })
                                                            );
                                                        }

                                                        return items;
                                                    })(),
                                                    checkDisabled: (
                                                        scope: Aui.Form.Field.Container,
                                                        disabled: boolean
                                                    ) => {
                                                        const children = scope.getItems();
                                                        const scope_all = children.shift() as Aui.Form.Field.Check;

                                                        if (disabled == true) {
                                                            scope_all.setDisabled(true);
                                                            scope_all.fireEvent('change', [scope_all, true]);
                                                        } else {
                                                            if (scope_all.properties.locked !== true) {
                                                                scope_all.setDisabled(false);
                                                                scope_all.fireEvent('change', [
                                                                    scope_all,
                                                                    scope_all.getValue(),
                                                                ]);
                                                            }
                                                        }
                                                    },
                                                })
                                            );
                                        }

                                        return items;
                                    })(),
                                    checkDisabled: (component: Aui.Form.FieldSet, disabled: boolean) => {
                                        const scopes = component.getItems();
                                        const master = scopes.shift() as Aui.Form.Field.Check;
                                        if (disabled == true) {
                                            master.setDisabled(true);
                                            master.fireEvent('change', [master, true]);
                                        } else {
                                            if (master.properties.locked !== true) {
                                                master.setDisabled(false);
                                                master.fireEvent('change', [master, master.getValue()]);
                                            }
                                        }
                                    },
                                })
                            );
                        }

                        return true;
                    },
                    /**
                     * 권한필드셋을 체크상태를 변경한다.
                     *
                     * @param {(Aui.Form.FieldSet)} fieldset - 권한필드셋
                     * @param {Object|boolean} permissions - 권한설정
                     * @param {boolean} checked - 권한설정에 존재하는 체크박스를 체크할지 여부
                     * @param {boolean} locked - 권한설정에 존재하는 체크박스를 입력된 상태로 고정할지 여부
                     * @return {Promise<boolean>} success
                     */
                    checkScopesFieldSet: (
                        fieldset: Aui.Form.FieldSet,
                        permissions: Object | boolean,
                        checked: boolean = true,
                        locked: boolean = false
                    ): void => {
                        if (permissions === true) {
                            if (fieldset.getField('master') !== null) {
                                fieldset.getField('master').setValue(checked);
                                fieldset.getField('master').properties.locked = locked;
                                fieldset.getField('master').setDisabled(locked);
                            }
                        } else if (typeof permissions == 'object') {
                            for (const componentType in permissions) {
                                const componentNames = permissions[componentType];
                                for (const componentName in componentNames) {
                                    const componentField = componentType + '/' + componentName;
                                    const scopes = componentNames[componentName];
                                    if (scopes === true) {
                                        if (fieldset.getField(componentField) !== null) {
                                            fieldset.getField(componentField).setValue(checked);
                                            fieldset.getField(componentField).properties.locked = locked;
                                            fieldset.getField(componentField).setDisabled(locked);
                                        }
                                        continue;
                                    }

                                    for (const scope in scopes) {
                                        const scopeField = componentField + ':' + scope;
                                        const children = scopes[scope];
                                        if (children === true) {
                                            if (fieldset.getField(scopeField) !== null) {
                                                fieldset.getField(scopeField).setValue(checked);
                                                fieldset.getField(scopeField).properties.locked = locked;
                                                fieldset.getField(scopeField).setDisabled(locked);
                                            }
                                            continue;
                                        }

                                        for (const child of children) {
                                            const childField = scopeField + '@' + child;
                                            if (fieldset.getField(childField) !== null) {
                                                fieldset.getField(childField).setValue(checked);
                                                fieldset.getField(childField).properties.locked = locked;
                                                fieldset.getField(childField).setDisabled(locked);
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
                     * @param {(Aui.Form.FieldSet)} fieldset
                     * @param {boolean} is_ungrouped - 그룹없음 체크박스필드를 보일지 여부
                     * @return {Promise<boolean>} success
                     */
                    printGroupFieldSet: async (
                        fieldset: Aui.Form.FieldSet,
                        is_ungrouped: boolean
                    ): Promise<boolean> => {
                        const groups = await Aui.Ajax.get(this.getProcessUrl('groups'), { type: 'user' });

                        if (groups?.success !== true) {
                            return false;
                        }

                        if (is_ungrouped === true) {
                            fieldset.append(
                                new Aui.Form.Field.Check({
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
                                new Aui.Form.Field.CheckGroup({
                                    name: 'group_ids',
                                    columns: 1,
                                    options: ((groups) => {
                                        let options = {};

                                        for (const group of groups) {
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
                            const is_component = group_id?.startsWith('component-') ?? false;

                            new Aui.Window({
                                title:
                                    is_component == true
                                        ? 'Loading...'
                                        : this.printText(
                                              'admin.administrators.groups.' + (group_id === null ? 'add' : 'edit')
                                          ),
                                width: 500,
                                modal: true,
                                resizable: false,
                                items: [
                                    new Aui.Form.Panel({
                                        border: false,
                                        layout: 'fit',
                                        items: [
                                            new Aui.Form.Field.Text({
                                                name: 'title',
                                                emptyText: this.printText('admin.administrators.groups.title'),
                                                hidden: is_component,
                                            }),
                                            new Aui.Form.FieldSet({
                                                title: this.printText('admin.administrators.groups.description'),
                                                items: [new Aui.Text({ text: null })],
                                                hidden: true,
                                            }),
                                            new Aui.Form.FieldSet({
                                                title: this.printText('admin.administrators.groups.permissions'),
                                                disabled: true,
                                                items: [],
                                            }),
                                        ],
                                    }),
                                ],
                                buttons: [
                                    new Aui.Button({
                                        text: this.printText('buttons.cancel'),
                                        tabIndex: -1,
                                        handler: (button) => {
                                            const window = button.getParent() as Aui.Window;
                                            window.close();
                                        },
                                    }),
                                    new Aui.Button({
                                        text: this.printText('buttons.ok'),
                                        buttonClass: 'confirm',
                                        handler: async (button) => {
                                            const window = button.getParent() as Aui.Window;

                                            if (is_component == true) {
                                                window.close();
                                                return;
                                            }

                                            const form = button.getParent().getItemAt(0) as Aui.Form.Panel;
                                            const results = await form.submit({
                                                url: this.getProcessUrl('group'),
                                                params: { group_id: group_id },
                                            });

                                            if (results.success == true) {
                                                Aui.Message.show({
                                                    title: (await this.getText('info')) as string,
                                                    message: (await this.getText('actions.saved')) as string,
                                                    icon: Aui.Message.INFO,
                                                    buttons: Aui.Message.OK,
                                                    handler: async () => {
                                                        const groups = Aui.getComponent('groups') as Aui.Grid.Panel;
                                                        await groups.getStore().reload();
                                                        groups.select({ group_id: results.group_id });
                                                        window.close();
                                                        Aui.Message.close();
                                                    },
                                                });
                                            }
                                        },
                                    }),
                                ],
                                listeners: {
                                    show: async (window) => {
                                        const form = window.getItemAt(0) as Aui.Form.Panel;
                                        const description = form.getItemAt(1) as Aui.Form.FieldSet;
                                        const fieldset = form.getItemAt(2) as Aui.Form.FieldSet;
                                        const scopes = await this.administrators.printScopesFieldSet(
                                            fieldset,
                                            is_component
                                        );
                                        if (scopes == true) {
                                            fieldset.enable();
                                        }

                                        if (group_id !== null) {
                                            const results = await form.load({
                                                url: this.getProcessUrl('group'),
                                                params: { group_id: group_id },
                                            });

                                            if (results.success == true) {
                                                if (is_component == true) {
                                                    window.setTitle(results.data.title);

                                                    (description.getItemAt(0) as Aui.Text).setHtml(
                                                        (results.data.description
                                                            ? results.data.description + '<br>'
                                                            : '') +
                                                            this.printText(
                                                                'admin.administrators.groups.descriptions.readonly'
                                                            )
                                                    );
                                                    description.show();
                                                }
                                                this.administrators.checkScopesFieldSet(fieldset, results.permissions);
                                            } else {
                                                window.close();
                                            }
                                        }
                                    },
                                },
                            }).show();
                        },
                        /**
                         * 그룹을 삭제한다.
                         *
                         * @param {sring} group_id - 그룹고유값
                         */
                        delete: (group_id: string): void => {
                            Aui.Message.delete({
                                message: this.printText('admin.administrators.groups.actions.delete'),
                                url: this.getProcessUrl('group'),
                                params: { group_id: group_id },
                                handler: async () => {
                                    const groups = Aui.getComponent('groups') as Aui.Tree.Panel;
                                    await groups.getStore().reload();
                                },
                            });
                        },
                    },

                    /**
                     * 관리자를 추가한다.
                     *
                     * @param {number|number[]} member_id - 권한을 수정할 회원고유값
                     * @param {string} group_id - 사용자를 추가할 그룹고유값
                     */
                    add: (member_id: number | number[] = null, group_id: string = null): void => {
                        const mMember = globalThis.Admin.getModule('member') as modules.member.admin.Member;

                        let mode: string = 'add';
                        let width: number = 900;
                        if (group_id !== null) {
                            mode = 'assign';
                            width = 500;
                        } else if (member_id !== null) {
                            mode = 'edit';
                            width = 400;
                        }

                        new Aui.Window({
                            title: this.printText('admin.administrators.lists.' + mode),
                            width: width,
                            height: 600,
                            modal: true,
                            resizable: false,
                            items: [
                                new Aui.Panel({
                                    layout: 'column',
                                    items: [
                                        new Aui.Grid.Panel({
                                            border: mode == 'add' ? [false, true, false, false] : false,
                                            layout: 'fit',
                                            width: mode == 'add' ? 500 : null,
                                            flex: mode == 'add' ? null : 1,
                                            selection: { selectable: true, display: 'check', keepable: true },
                                            autoLoad: mode != 'edit',
                                            freeze: 1,
                                            hidden: mode == 'edit',
                                            topbar: [
                                                new Aui.Form.Field.Search({
                                                    name: 'keyword',
                                                    width: 200,
                                                    emptyText: mMember.printText('keyword'),
                                                    handler: async (keyword, field) => {
                                                        const grid = field.getParent().getParent() as Aui.Grid.Panel;
                                                        if (keyword?.length > 0) {
                                                            grid.getStore().setParam('keyword', keyword);
                                                        } else {
                                                            grid.getStore().setParam('keyword', null);
                                                        }
                                                        await grid.getStore().loadPage(1);
                                                    },
                                                }),
                                            ],
                                            bottombar: new Aui.Grid.Pagination([
                                                new Aui.Button({
                                                    iconClass: 'mi mi-refresh',
                                                    handler: (button: Aui.Button) => {
                                                        const grid = button.getParent().getParent() as Aui.Grid.Panel;
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
                                            store: new Aui.Store.Ajax({
                                                url: mMember.getProcessUrl('members'),
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
                                                    const form = grid.getParent().getItemAt(1) as Aui.Form.Panel;
                                                    const text =
                                                        selections.length == 0
                                                            ? this.printText(
                                                                  'admin.administrators.lists.unselected_members'
                                                              )
                                                            : this.printText(
                                                                  'admin.administrators.lists.selected_members',
                                                                  {
                                                                      count: selections.length.toString(),
                                                                  }
                                                              );
                                                    if (mode == 'assign') {
                                                        const window = grid.getParent().getParent() as Aui.Window;
                                                        window.setTitle(
                                                            this.printText('admin.administrators.lists.' + mode) +
                                                                ' (' +
                                                                text +
                                                                ')'
                                                        );
                                                    } else {
                                                        const display = form
                                                            .getToolbar('top')
                                                            .getItemAt(0) as Aui.Form.Field.Display;
                                                        display.setValue(text);
                                                    }
                                                },
                                            },
                                        }),
                                        new Aui.Form.Panel({
                                            flex: 1,
                                            layout: 'fit',
                                            border: false,
                                            hidden: mode == 'assign',
                                            fieldDefaults: { labelPosition: 'top' },
                                            topbar: new Aui.Toolbar({
                                                hidden: member_id !== null,
                                                items: [
                                                    new Aui.Form.Field.Display({
                                                        value: this.printText(
                                                            'admin.administrators.lists.unselected_members'
                                                        ),
                                                    }),
                                                    '->',
                                                    new Aui.Button({
                                                        text: this.printText('admin.administrators.lists.deselect_all'),
                                                        handler: (button) => {
                                                            const members = button
                                                                .getParent()
                                                                .getParent()
                                                                .getParent()
                                                                .getItemAt(0) as Aui.Grid.Panel;
                                                            members.resetSelections();
                                                        },
                                                    }),
                                                ],
                                            }),
                                            items: [
                                                new Aui.Form.Field.Hidden({
                                                    name: 'member_ids',
                                                }),
                                                new Aui.Form.FieldSet({
                                                    title: this.printText('admin.administrators.groups.groups'),
                                                    helpText: this.printText(
                                                        'admin.administrators.lists.' +
                                                            (member_id === null ? 'add_group_help' : 'edit_group_help')
                                                    ),
                                                    disabled: true,
                                                    items: [],
                                                }),
                                                new Aui.Form.FieldSet({
                                                    title: this.printText('admin.administrators.lists.permissions'),
                                                    helpText: this.printText(
                                                        'admin.administrators.lists.edit_permission_help'
                                                    ),
                                                    disabled: true,
                                                    items: [],
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                            buttons: [
                                new Aui.Button({
                                    text: this.printText('buttons.cancel'),
                                    tabIndex: -1,
                                    handler: (button) => {
                                        const window = button.getParent() as Aui.Window;
                                        window.close();
                                    },
                                }),
                                new Aui.Button({
                                    text: this.printText('buttons.ok'),
                                    buttonClass: 'confirm',
                                    handler: async (button) => {
                                        const window = button.getParent() as Aui.Window;
                                        const panel = window.getItemAt(0) as Aui.Panel;
                                        const grid = panel.getItemAt(0) as Aui.Grid.Panel;
                                        const form = panel.getItemAt(1) as Aui.Form.Panel;

                                        let member_ids: number[] = [];
                                        if (member_id === null) {
                                            member_ids = grid.getSelections().map((selected) => {
                                                return selected.get('member_id');
                                            });
                                        } else {
                                            if (typeof member_id == 'number') {
                                                member_ids.push(member_id);
                                            } else {
                                                member_ids = member_id;
                                            }
                                        }

                                        if (member_ids.length == 0) {
                                            Aui.Message.show({
                                                title: (await this.getText('info')) as string,
                                                message: (await this.getText(
                                                    'admin.administrators.lists.actions.unselected_members'
                                                )) as string,
                                                icon: Aui.Message.INFO,
                                                buttons: Aui.Message.OK,
                                            });
                                            return;
                                        }

                                        let results: Aui.Ajax.Results;
                                        if (mode == 'assign') {
                                            new Aui.Loading(window, {
                                                type: 'column',
                                                direction: 'column',
                                                text: Aui.printText('actions.saving'),
                                            }).show();

                                            results = await Aui.Ajax.post(this.getProcessUrl('administrator'), {
                                                member_ids: member_ids,
                                                group_ids: [group_id],
                                            });
                                        } else {
                                            form.getField('member_ids').setValue(member_ids);

                                            results = await form.submit({
                                                url: this.getProcessUrl('administrator'),
                                            });
                                        }

                                        if (results.success == true) {
                                            Aui.Message.show({
                                                title: (await this.getText('info')) as string,
                                                message: (await this.getText('actions.saved')) as string,
                                                icon: Aui.Message.INFO,
                                                buttons: Aui.Message.OK,
                                                handler: async () => {
                                                    const groups = Aui.getComponent('groups') as Aui.Grid.Panel;
                                                    const administrators = Aui.getComponent(
                                                        'administrators'
                                                    ) as Aui.Grid.Panel;
                                                    await groups.getStore().reload();
                                                    await administrators.getStore().reload();
                                                    window.close();
                                                    Aui.Message.close();
                                                },
                                            });
                                        }
                                    },
                                }),
                            ],
                            listeners: {
                                show: async (window) => {
                                    const form = window.getItemAt(0).getItemAt(1) as Aui.Form.Panel;
                                    const groups = form.getItemAt(1) as Aui.Form.FieldSet;
                                    const permissions = form.getItemAt(2) as Aui.Form.FieldSet;

                                    form.setLoading(window, true, true);

                                    if ((await this.administrators.printGroupFieldSet(groups, false)) == true) {
                                        groups.enable();
                                        const field = groups.getItemAt(0) as Aui.Form.Field.CheckGroup;

                                        if (member_id === null) {
                                            field.addEvent(
                                                'change',
                                                async (_field: Aui.Form.Field.CheckGroup, value: string[]) => {
                                                    const groupPermissions = permissions.getData('groups');
                                                    if (groupPermissions !== null) {
                                                        this.administrators.checkScopesFieldSet(
                                                            permissions,
                                                            groupPermissions,
                                                            false,
                                                            false
                                                        );
                                                    }

                                                    if (value !== null) {
                                                        const results = await Aui.Ajax.get(
                                                            this.getProcessUrl('group.permissions'),
                                                            { group_ids: value.join(',') }
                                                        );

                                                        this.administrators.checkScopesFieldSet(
                                                            permissions,
                                                            results.permissions,
                                                            true,
                                                            true
                                                        );

                                                        permissions.setData('groups', results.permissions);
                                                    }
                                                }
                                            );
                                        }
                                    } else {
                                        groups.enable();
                                        groups.hide();
                                    }

                                    if ((await this.administrators.printScopesFieldSet(permissions)) == true) {
                                        permissions.enable();
                                    }

                                    if (member_id !== null) {
                                        if (typeof member_id == 'number') {
                                            const results = await Aui.Ajax.get(this.getProcessUrl('administrator'), {
                                                member_id: member_id,
                                            });

                                            if (results.success == true) {
                                                this.administrators.checkScopesFieldSet(
                                                    permissions,
                                                    results.permissions,
                                                    true,
                                                    false
                                                );

                                                const user_group_ids = [];
                                                const component_groups = [];
                                                for (const group of results.groups) {
                                                    if (group.type == 'user') {
                                                        user_group_ids.push(group.group_id);
                                                    } else {
                                                        component_groups.push(group);
                                                    }
                                                }

                                                if (component_groups.length > 0) {
                                                    groups.append(
                                                        new Aui.Form.Field.CheckGroup({
                                                            options: (() => {
                                                                let options = {};
                                                                for (const group of component_groups) {
                                                                    options[group.group_id] = group.title;
                                                                }
                                                                return options;
                                                            })(),
                                                            disabled: true,
                                                            value: (() => {
                                                                let values = [];
                                                                for (const group of component_groups) {
                                                                    values.push(group.group_id);
                                                                }
                                                                return values;
                                                            })(),
                                                        })
                                                    );
                                                }

                                                this.administrators.checkScopesFieldSet(
                                                    permissions,
                                                    results.group_permissions,
                                                    true,
                                                    true
                                                );

                                                form.getField('group_ids').setValue(user_group_ids);
                                            } else {
                                                window.close();
                                                return;
                                            }

                                            groups.disable();
                                        } else {
                                            groups.disable();
                                            groups.hide();
                                        }
                                    }

                                    form.setLoading(window, false);
                                },
                            },
                        }).show();
                    },
                    /**
                     * 그룹을 지정한다.
                     *
                     * @param {boolean} replacement - 기존 그룹 대치여부
                     */
                    setGroups: (replacement: boolean): void => {
                        const administrators = Aui.getComponent('administrators') as Aui.Grid.Panel;
                        const selections = administrators.getSelections();
                        if (selections.length == 0) {
                            return;
                        }

                        const member_ids: number[] = selections.map((selected) => {
                            return selected.get('member_id');
                        });

                        let title =
                            replacement == true
                                ? this.printText('admin.administrators.lists.move_group')
                                : this.printText('admin.administrators.lists.add_group');
                        title += ' (';
                        if (selections.length == 1) {
                            title += selections[0].get('name');
                        } else {
                            title += this.printText('admin.administrators.lists.selectedCount', {
                                count: selections.length.toString(),
                            });
                        }
                        title += ')';

                        new Aui.Window({
                            title: title,
                            width: 400,
                            modal: true,
                            resizable: false,
                            items: [
                                new Aui.Form.Panel({
                                    layout: 'fit',
                                    border: false,
                                    disabled: true,
                                    items: [
                                        new Aui.Form.Field.Hidden({
                                            name: 'member_ids',
                                            value: member_ids,
                                        }),
                                        new Aui.Form.Field.Hidden({
                                            name: 'mode',
                                            value: replacement == true ? 'move_group' : 'add_group',
                                        }),
                                        new Aui.Form.FieldSet({
                                            title: this.printText('admin.administrators.groups.groups'),
                                            helpText:
                                                replacement == true
                                                    ? this.printText('admin.administrators.lists.move_group_help')
                                                    : this.printText('admin.administrators.lists.add_group_help'),
                                            disabled: true,
                                            items: [],
                                        }),
                                    ],
                                }),
                            ],
                            buttons: [
                                new Aui.Button({
                                    text: this.printText('buttons.cancel'),
                                    tabIndex: -1,
                                    handler: (button) => {
                                        const window = button.getParent() as Aui.Window;
                                        window.close();
                                    },
                                }),
                                new Aui.Button({
                                    text: this.printText('buttons.ok'),
                                    buttonClass: 'confirm',
                                    handler: async (button) => {
                                        const window = button.getParent() as Aui.Window;
                                        const form = window.getItemAt(0) as Aui.Form.Panel;

                                        const results = await form.submit({
                                            url: this.getProcessUrl('administrator'),
                                        });

                                        if (results.success == true) {
                                            Aui.Message.show({
                                                title: (await this.getText('info')) as string,
                                                message: (await this.getText('actions.saved')) as string,
                                                icon: Aui.Message.INFO,
                                                buttons: Aui.Message.OK,
                                                handler: async () => {
                                                    const groups = Aui.getComponent('groups') as Aui.Grid.Panel;
                                                    const administrators = Aui.getComponent(
                                                        'administrators'
                                                    ) as Aui.Grid.Panel;
                                                    await groups.getStore().reload();
                                                    await administrators.getStore().reload();
                                                    window.close();
                                                    Aui.Message.close();
                                                },
                                            });
                                        }
                                    },
                                }),
                            ],
                            listeners: {
                                show: async (window) => {
                                    const form = window.getItemAt(0) as Aui.Form.Panel;
                                    const groups = form.getItemAt(2) as Aui.Form.FieldSet;
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
                    /**
                     * 관리자를 그룹에서 제외하거나, 삭제한다.
                     *
                     * @param {sring} group_id - 관리자그룹에서 제외할 그룹고유값 (NULL 인 경우 관리자를 삭제한다.)
                     */
                    delete: (group_id: string = null): void => {
                        const administrators = Aui.getComponent('administrators') as Aui.Grid.Panel;
                        const selections = administrators.getSelections();
                        if (selections.length == 0) {
                            return;
                        }

                        const member_ids: number[] = selections.map((selected) => {
                            return selected.get('member_id');
                        });

                        Aui.Message.delete({
                            message: this.printText(
                                'admin.administrators.lists.actions.' + (group_id === null ? 'delete' : 'remove')
                            ),
                            url: this.getProcessUrl('administrator'),
                            params: { member_ids: member_ids.join(','), group_id: group_id },
                            handler: async () => {
                                const groups = Aui.getComponent('groups') as Aui.Tree.Panel;
                                await groups.getStore().reload();

                                const administrators = Aui.getComponent('administrators') as Aui.Grid.Panel;
                                await administrators.getStore().reload();
                            },
                        });
                    },
                };
            }
        }
    }
}
