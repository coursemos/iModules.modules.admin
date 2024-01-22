/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 메시지창 클래스를 정의한다.
 *
 * @file /scripts/Aui.Message.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
var Aui;
(function (Aui) {
    class Message {
        static message = null;
        static INFO = Html.create('i').addClass('info');
        static ERROR = Html.create('i').addClass('error');
        static CONFIRM = Html.create('i').addClass('confirm');
        static LOADING = Html.create('i').addClass('loading').html('<i></i><i></i><i></i><i></i>');
        static OK = [{ action: 'ok', text: '@buttons.ok', buttonClass: 'confirm' }];
        static DANGER = [{ action: 'ok', text: '@buttons.ok', buttonClass: 'danger' }];
        static OKCANCEL = [
            { action: 'cancel', text: '@buttons.cancel' },
            { action: 'ok', text: '@buttons.ok', buttonClass: 'confirm' },
        ];
        static DANGERCANCEL = [
            { action: 'cancel', text: '@buttons.cancel' },
            { action: 'ok', text: '@buttons.ok', buttonClass: 'danger' },
        ];
        /**
         * 메시지창을 연다.
         *
         * @param {Object} properties - 설정
         */
        static show(properties = null) {
            Aui.Message.close();
            const buttons = [];
            const handler = properties?.handler ??
                (() => {
                    Aui.Message.close();
                });
            properties?.buttons?.forEach((button) => {
                buttons.push(new Aui.Button({
                    ...button,
                    text: button.text.indexOf('@') === 0 ? Aui.printText(button.text.substring(1)) : button.text,
                    handler: handler,
                }));
            });
            Aui.Message.message = new Aui.Window({
                title: properties?.title ?? '',
                modal: true,
                movable: false,
                resizable: false,
                closable: false,
                buttons: buttons,
                listeners: {
                    show: (window) => {
                        window.$getComponent().setAttr('data-role', 'message');
                    },
                },
            });
            Aui.Message.message.addEvent('close', () => {
                Aui.Message.message = null;
            });
            const $content = Aui.Message.message.$getContent();
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
            Aui.Message.message.show();
        }
        /**
         * 로딩메시지를 연다.
         *
         * @param {string} title - 로딩제목
         * @param {string} message - 로딩메시지
         * @param {Aui.Loading.Type} type - 로딩형태
         */
        static loading(title = null, message = null, type = null) {
            Aui.Message.close();
            Aui.Message.message = new Aui.Window({
                title: title ?? Aui.printText('actions.loading_status'),
                modal: true,
                movable: false,
                resizable: false,
                closable: false,
                width: 300,
                listeners: {
                    show: (window) => {
                        window.$getComponent().setAttr('data-role', 'message');
                        window.setData('loading', new Aui.Loading(window, {
                            type: type ?? 'dot',
                            text: message ?? Aui.printText('actions.loading'),
                        }));
                        window.getData('loading')?.show();
                    },
                    close: (window) => {
                        window.getData('loading')?.close();
                    },
                },
            });
            Aui.Message.message.show();
        }
        /**
         * 메시지창을 닫는다.
         */
        static close() {
            if (Aui.Message.message !== null) {
                Aui.Message.message.close();
            }
        }
    }
    Aui.Message = Message;
})(Aui || (Aui = {}));
