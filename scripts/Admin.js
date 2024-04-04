/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 4. 3.
 */
var modules;
(function (modules) {
    let admin;
    (function (admin) {
        class Admin extends Module {
            /**
             * 모듈의 DOM 이벤트를 초기화한다.
             *
             * @param {Dom} $dom - 모듈 DOM 객체
             */
            init($dom) {
                if (Html.get('section[data-role=admin]', $dom).getEl() !== null) {
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
                                        Aui.getComponent('AdminContext').append(component);
                                    });
                                }
                            },
                        },
                    }).doLayout();
                    const $header = Html.get('section[data-role=header]');
                    const $logout = Html.get('button[data-action=logout]', $header);
                    $logout.on('click', async () => {
                        $logout.disable(true);
                        const mMember = Modules.get('member');
                        const success = await mMember.logout();
                        if (success == true) {
                            location.replace(globalThis.Admin.getUrl());
                        }
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
                        }
                        else {
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
        admin.Admin = Admin;
    })(admin = modules.admin || (modules.admin = {}));
})(modules || (modules = {}));
