/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 메시지창 클래스를 정의한다.
 *
 * @file /scripts/Aui.Message.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
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
         * @param {Aui.Message.Show.Properties} properties - 설정
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
                closable: properties.closable ?? false,
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
         * @param {Aui.Message.Loading.Properties} properties - 로딩설정
         */
        static loading(properties = null) {
            Aui.Message.close();
            Aui.Message.message = new Aui.Window({
                title: properties?.title ?? Aui.printText('actions.loading_status'),
                modal: true,
                movable: false,
                resizable: false,
                closable: false,
                width: 300,
                listeners: {
                    show: (window) => {
                        window.$getComponent().setAttr('data-role', 'message');
                        window.setData('loading', new Aui.Loading(window, {
                            type: properties?.type ?? 'dot',
                            text: properties?.message ?? Aui.printText('actions.loading'),
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
         * 삭제를 위한 메시지창을 연다.
         *
         * @param {Aui.Message.Delete.Properties} properties - 로딩설정
         */
        static delete(properties = null) {
            Aui.Message.show({
                title: properties?.title ?? Aui.getErrorText('CONFIRM'),
                icon: Aui.Message.CONFIRM,
                message: properties?.message ?? Aui.printText('actions.delete'),
                buttons: Aui.Message.DANGERCANCEL,
                handler: async (button) => {
                    if (button.action == 'ok') {
                        button.getParent().buttons.at(0).hide();
                        button.setLoading(true);
                        if (properties?.url !== null) {
                            const results = await Aui.Ajax.delete(properties.url, properties.params ?? null);
                            if (results.success == true) {
                                Aui.Message.show({
                                    title: Aui.getErrorText('INFO'),
                                    icon: Aui.Message.INFO,
                                    message: Aui.printText('actions.deleted'),
                                    buttons: Aui.Message.OK,
                                    handler: async () => {
                                        if (typeof properties?.handler == 'function') {
                                            await properties.handler(results);
                                        }
                                        Aui.Message.close();
                                    },
                                });
                            }
                            else {
                                button.getParent().buttons.at(0).show();
                                button.setLoading(false);
                            }
                        }
                        else {
                            Aui.Message.show({
                                title: Aui.getErrorText('INFO'),
                                message: Aui.printText('actions.deleted'),
                                buttons: Aui.Message.OK,
                                handler: async () => {
                                    if (typeof properties?.handler == 'function') {
                                        await properties.handler(null);
                                    }
                                    Aui.Message.close();
                                },
                            });
                        }
                    }
                    else {
                        Aui.Message.close();
                    }
                },
            });
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
