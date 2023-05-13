/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 메시지창 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Message.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 4. 1.
 */
namespace Admin {
    export namespace Message {
        export interface Properties extends Admin.Component.Properties {
            /**
             * @type {Admin.Title|string} title - 메시지창 제목
             */
            title?: Admin.Title | string;

            /**
             * @type {Dom} icon - 메시지창 아이콘 DOM 요소
             */
            icon?: Dom;

            /**
             * @type {string} message - 메시지
             */
            message?: string;

            /**
             * @type {string} messageClass - 메시지박스 스타일시트 클래스
             */
            messageClass?: string;

            /**
             * @type {Function} handler - 메시지창 버튼 핸들러
             */
            handler?: (button: Admin.Button) => void;
        }
    }
    export class Message {
        static message: Admin.Window = null;

        static INFO = Html.create('i').addClass('info');
        static ERROR = Html.create('i').addClass('error');
        static LOADING = Html.create('i').addClass('loading').html('<i></i><i></i><i></i><i></i>');
        static OK = [{ button: 'ok', text: '@buttons.ok', buttonClass: 'confirm' }];

        /**
         * 메시지창을 연다.
         *
         * @param {Object} properties - 설정
         */
        static show(properties: Admin.Message.Properties = null): void {
            Admin.Message.close();

            const buttons = [];
            const handler =
                properties?.handler ??
                (() => {
                    Admin.Message.close();
                });
            properties?.buttons?.forEach((button: { button: string; text: string; buttonClass: string }) => {
                buttons.push(
                    new Admin.Button({
                        text: button.text.indexOf('@') === 0 ? Admin.printText(button.text.substring(1)) : button.text,
                        buttonClass: button.buttonClass,
                        handler: handler,
                    })
                );
            });

            Admin.Message.message = new Admin.Window({
                title: properties?.title ?? '',
                modal: true,
                movable: false,
                resizable: false,
                closable: false,
                buttons: buttons,
                listeners: {
                    show: (window: Admin.Window) => {
                        window.$getComponent().setAttr('data-role', 'message');
                    },
                },
            });
            Admin.Message.message.addEvent('close', () => {
                Admin.Message.message = null;
            });

            const $content = Admin.Message.message.$getContent();
            const $messagebox = Html.create('div', { 'data-role': 'messagebox' });
            if (properties?.messageClass) {
                $messagebox.addClass(...properties.messageClass.split(' '));
            }

            if (properties?.icon instanceof Dom) {
                const $icon = Html.create('div', { 'data-role': 'icon' });
                $icon.append(properties?.icon);
                $messagebox.append($icon);
            }

            const $message = Html.create('div', { 'data-role': 'message' });
            $message.html('<div>' + (properties.message ?? '') + '</div>');
            $messagebox.append($message);
            $content.append($messagebox);

            Admin.Message.message.show();
        }

        /**
         * 로딩메시지를 연다.
         *
         * @param {string} title - 로딩제목
         * @param {string} message - 로딩메시지
         * @param {Admin.Loading.Type} type - 로딩형태
         */
        static loading(title: string = null, message: string = null, type: Admin.Loading.Type = null): void {
            Admin.Message.close();

            Admin.Message.message = new Admin.Window({
                title: title ?? Admin.printText('actions.loading_status'),
                modal: true,
                movable: false,
                resizable: false,
                closable: false,
                width: 300,
                listeners: {
                    show: (window: Admin.Window) => {
                        window.$getComponent().setAttr('data-role', 'message');
                        window.setData(
                            'loading',
                            new Admin.Loading(window, {
                                type: type ?? 'dot',
                                text: message ?? Admin.printText('actions.loading'),
                            })
                        );
                        window.getData('loading')?.show();
                    },
                    close: (window: Admin.Window) => {
                        window.getData('loading')?.close();
                    },
                },
            });

            Admin.Message.message.show();
        }

        /**
         * 메시지창을 닫는다.
         */
        static close(): void {
            if (Admin.Message.message !== null) {
                Admin.Message.message.close();
            }
        }
    }
}
