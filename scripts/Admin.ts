/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.ts
 * @author youlapark <youlapark@naddle.net>
 * @license MIT License
 * @modified 2024. 9. 24.
 */
namespace modules {
    export namespace admin {
        export class Admin extends Module {
            /**
             * 모듈의 DOM 이벤트를 초기화한다.
             *
             * @param {Dom} $dom - 모듈 DOM 객체
             */
            init($dom: Dom): void {
                if (Html.get('section[data-role=admin]', $dom).getEl() !== null) {
                    (document.querySelector(':root') as HTMLElement).style.fontSize =
                        Html.get('body').getData('scale') + 'px';

                    /**
                     * Aui 뷰포트를 설정한다.
                     */
                    new Aui.Viewport({
                        id: 'AdminViewport',
                        baseUrl: this.getDir() + '/ui',
                        renderTo: 'section[data-role=admin]',
                        items: [
                            new Aui.Navigation.Panel({
                                region: 'west',
                                getUrl: globalThis.Admin.getProcessUrl('module', 'admin', 'navigation'),
                                saveUrl: globalThis.Admin.getProcessUrl('module', 'admin', 'navigation'),
                            }),
                            new Aui.Panel({
                                id: 'AdminContext',
                                border: false,
                                layout: 'fit',
                                scrollable: false,
                                region: 'center',
                            }),
                        ],
                        listeners: {
                            render: () => {
                                if (typeof globalThis.Admin.viewportListener == 'function') {
                                    globalThis.Admin.viewportListener().then((component) => {
                                        component.addEvent('render', () => {
                                            globalThis.Admin.render(component);
                                        });
                                        Aui.getComponent('AdminContext').append(component);
                                    });
                                }
                            },
                        },
                    }).doLayout();

                    const $header = Html.get('section[data-role=header]');
                    const $user = Html.get('button[data-action=user]', $header);
                    $user.on('click', async () => {
                        new Aui.Menu({
                            items: [
                                new Aui.Menu.Item({
                                    iconClass: 'mi mi-light',
                                    items: [
                                        new Aui.SegmentedButton({
                                            value: Html.get('body').getData('color-scheme') ?? 'auto',
                                            items: [
                                                new Aui.Button({
                                                    iconClass: 'mi mi-auto',
                                                    text: Aui.printText('colors.auto'),
                                                    value: 'auto',
                                                }),
                                                new Aui.Button({
                                                    iconClass: 'mi mi-light',
                                                    text: Aui.printText('colors.light'),
                                                    value: 'light',
                                                }),
                                                new Aui.Button({
                                                    iconClass: 'mi mi-dark',
                                                    text: Aui.printText('colors.dark'),
                                                    value: 'dark',
                                                }),
                                            ],
                                            listeners: {
                                                change: async (_button, value) => {
                                                    Html.get('body').setData('color-scheme', value);

                                                    await Ajax.post(
                                                        globalThis.Admin.getModule('admin').getProcessUrl('configs'),
                                                        { key: 'color', value: value }
                                                    );
                                                },
                                            },
                                        }),
                                    ],
                                }),
                                new Aui.Menu.Item({
                                    iconClass: 'mi mi-type',
                                    items: [
                                        new Aui.Form.Field.Number({
                                            value: Html.get('body').getData('scale') ?? 16,
                                            minValue: 12,
                                            maxValue: 20,
                                            editable: false,
                                            listeners: {
                                                change: async (_field, value) => {
                                                    Html.get('body').setData('scale', value);
                                                    (document.querySelector(':root') as HTMLElement).style.fontSize =
                                                        value + 'px';

                                                    await Ajax.post(
                                                        globalThis.Admin.getModule('admin').getProcessUrl('configs'),
                                                        { key: 'scale', value: value }
                                                    );
                                                },
                                            },
                                        }),
                                    ],
                                }),
                                '-',
                                new Aui.Menu.Item({
                                    iconClass: 'mi mi-user-profile',
                                    text: globalThis.Admin.getModule('member').printText('buttons.edit'),
                                    handler: async () => {
                                        // const mMember = Modules.get('member') as modules.member.Member;
                                        // await mMember.getPopup();
                                        // return true;
                                    },
                                }),
                                new Aui.Menu.Item({
                                    iconClass: 'mi mi-logout',
                                    text: globalThis.Admin.getModule('member').printText('buttons.logout'),
                                    handler: async () => {
                                        const mMember = Modules.get('member') as modules.member.Member;
                                        const success = await mMember.logout();
                                        if (success == true) {
                                            location.replace(globalThis.Admin.getUrl());
                                        }

                                        return false;
                                    },
                                }),
                            ],
                            listeners: {
                                show: () => {
                                    $user.addClass('opened');
                                },
                                hide: () => {
                                    $user.removeClass('opened');
                                },
                            },
                        }).showAt($user, 'y');
                    });
                }

                if (Html.get('section[data-role=login]', $dom).getEl() !== null) {
                    const $form = Html.get('form', $dom);
                    const form = Form.get($form);

                    Html.get('input', $form).on('input', () => {
                        const $message = Html.get('div[data-role=message]', $form);
                        $message.remove();
                    });

                    form.onSubmit(async () => {
                        const $message = Html.get('div[data-role=message]', $form);
                        $message.remove();

                        const results = await form.submit(iModules.getProcessUrl('module', 'admin', 'login'));
                        if (results.success == true) {
                            location.replace(location.href);
                        } else {
                            if (results.message) {
                                const $message = Html.create('div', { 'data-role': 'message' });
                                $message.html(results.message);
                                $form.append($message);
                            }

                            $form.shake();
                        }
                    });
                }

                super.init($dom);
            }
        }
    }
}
