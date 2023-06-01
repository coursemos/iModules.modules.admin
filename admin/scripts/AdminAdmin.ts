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
            /**
             * 도메인을 추가한다.
             *
             * @param {string} host - 도메인정보를 수정할 경우 수정할 host 명
             */
            addDomain(host: string = null): void {
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
                            handler: (button: Admin.Button) => {
                                const window = button.getParent() as Admin.Window;
                                window.close();
                            },
                        }),
                        new Admin.Button({
                            text: this.printText('buttons.ok'),
                            buttonClass: 'confirm',
                            handler: async (button: Admin.Button) => {
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
                                        handler: () => {
                                            const domains = Admin.getComponent('domains') as Admin.Grid.Panel;
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
                        show: async (window: Admin.Window) => {
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
            }

            /**
             * 사이트를 추가한다.
             *
             * @param {string} language - 사이트정보를 수정할 경우 수정할 host 명
             */
            addSite(language: string = null): void {
                const domains: Admin.Grid.Panel = Admin.getComponent('domains') as Admin.Grid.Panel;
                const host = domains.getSelections().length == 1 ? domains.getSelections()[0].get('host') : null;
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
                                                    boxLabel: this.printText('admin.sites.sites.default_language'),
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
                                                        logo.setImageSize(configs.logo.width, configs.logo.height);
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
                            handler: (button: Admin.Button) => {
                                const window = button.getParent() as Admin.Window;
                                window.close();
                            },
                        }),
                        new Admin.Button({
                            text: this.printText('buttons.ok'),
                            buttonClass: 'confirm',
                            handler: async (button: Admin.Button) => {
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
                                        handler: () => {
                                            const sites = Admin.getComponent('sites') as Admin.Grid.Panel;
                                            sites.selections = [
                                                new Admin.Data.Record({
                                                    host: host,
                                                    language: form.getField('language').getValue(),
                                                }),
                                            ];
                                            sites.getStore().reload();
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
            }

            /**
             * 컨텍스트 종류를 가져온다.
             *
             * @return {string[]} types - 컨텍스트타입
             */
            getContextTypes(): string[] {
                return ['EMPTY', 'CHILD', 'PAGE', 'MODULE', 'HTML', 'LINK'];
            }

            /**
             * 컨텍스트 종류 아이콘을 가져온다.
             *
             * @param {string} type - 컨텍스트타입
             * @return {string} icon - 아이콘
             */
            getContextTypeIcon(type: string): string {
                const icons = {
                    'EMPTY': 'xi xi-marquee-add',
                    'CHILD': 'xi xi-sitemap',
                    'PAGE': 'xi xi-paper',
                    'MODULE': 'xi xi-box',
                    'HTML': 'xi xi-code',
                    'LINK': 'xi xi-external-link',
                };
                return '<i class="icon ' + (icons[type] ?? '') + '"></i>';
            }

            /**
             * 컨텍스트를 추가한다.
             *
             * @param {string} path - 수정할 경로 또는 추가될 포함될 상위 부모폴더
             */
            addContext(path: string = null): void {
                const domains: Admin.Grid.Panel = Admin.getComponent('domains') as Admin.Grid.Panel;
                const host = domains.getSelections().length == 1 ? domains.getSelections()[0].get('host') : null;
                if (host === null) {
                    return;
                }

                const sites: Admin.Grid.Panel = Admin.getComponent('sites') as Admin.Grid.Panel;
                const language = sites.getSelections().length == 1 ? sites.getSelections()[0].get('language') : null;
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
                                                for (const type of this.getContextTypes()) {
                                                    options[type] =
                                                        this.getContextTypeIcon(type) +
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

                                                    const design = Admin.getComponent('design') as Admin.Form.FieldSet;
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
                                            boxLabel: this.printText('admin.sites.contexts.is_footer_menu_help'),
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
                            handler: (button: Admin.Button) => {
                                const window = button.getParent() as Admin.Window;
                                window.close();
                            },
                        }),
                        new Admin.Button({
                            text: this.printText('buttons.ok'),
                            buttonClass: 'confirm',
                            handler: async (button: Admin.Button) => {
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
                                        handler: () => {
                                            const contexts = Admin.getComponent('contexts') as Admin.Grid.Panel;
                                            contexts.selections = [
                                                new Admin.Data.Record({
                                                    host: host,
                                                    language: language,
                                                    path:
                                                        form.getField('parent').getValue() +
                                                        (form.getField('path').getValue()
                                                            ? '/' + form.getField('path').getValue()
                                                            : ''),
                                                }),
                                            ];
                                            contexts.getStore().reload();
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
            }

            /**
             * 모듈정보를 확인한다.
             *
             * @param {string} name - 모듈명
             */
            showModule(name: string): void {
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
                                                GLOBAL: this.printText('admin.modules.modules.show.properties.GLOBAL'),
                                                ADMIN: this.printText('admin.modules.modules.show.properties.ADMIN'),
                                                CONTEXT: this.printText(
                                                    'admin.modules.modules.show.properties.CONTEXT'
                                                ),
                                                WIDGET: this.printText('admin.modules.modules.show.properties.WIDGET'),
                                                THEME: this.printText('admin.modules.modules.show.properties.THEME'),
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
                                this.setModuleConfigs(name, button.getParent().getData('configs'));
                            },
                        }),
                        new Admin.Button({
                            text: this.printText('buttons.close'),
                            buttonClass: 'confirm',
                            handler: (button: Admin.Button) => {
                                const window = button.getParent() as Admin.Window;
                                window.close();
                            },
                        }),
                    ],
                    listeners: {
                        show: async (window: Admin.Window) => {
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
            }

            /**
             * 모듈설정을 확인한다.
             *
             * @param {string} name - 모듈명
             * @param {Admin.Ajax.Results} configs - 모듈정보
             */
            async setModuleConfigs(name: string, configs: Admin.Ajax.Results = null): Promise<void> {
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
                        width: 600,
                        modal: true,
                        resizable: false,
                        items: [form],
                        buttons: [
                            new Admin.Button({
                                text: this.printText('buttons.cancel'),
                                tabIndex: -1,
                                handler: (button: Admin.Button) => {
                                    const window = button.getParent() as Admin.Window;
                                    window.close();
                                },
                            }),
                            new Admin.Button({
                                text: this.printText('buttons.ok'),
                                buttonClass: 'confirm',
                                handler: async (button: Admin.Button) => {
                                    const window = button.getParent() as Admin.Window;
                                    const form = window.getItemAt(0) as Admin.Form.Panel;

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
                            show: (window: Admin.Window) => {
                                const form = window.getItemAt(0) as Admin.Form.Panel;
                                for (const field in response.configs ?? {}) {
                                    form.getField(field)?.setValue(response.configs[field]);
                                }
                            },
                        },
                    }).show();
                } else {
                }
            }

            /**
             * 모듈을 설치한다.
             *
             * @param {string} name - 모듈명
             * @param {Ojbect} configs - 모듈설정 (NULL 인 경우 모듈설정여부를 확인 후 모듈 설정을 먼저 한다.)
             */
            async installModule(name: string, configs: { [key: string]: any } = null): Promise<boolean> {
                if (configs === null) {
                    Admin.Message.loading();
                    const response = await Admin.Ajax.get(this.getProcessUrl('module'), { name: name });

                    if (response.data.properties.includes('CONFIGS') == true) {
                        Admin.Message.close();
                        this.setModuleConfigs(name, response);
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
            }
        }
    }
}
