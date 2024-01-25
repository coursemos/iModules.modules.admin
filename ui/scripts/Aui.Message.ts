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
namespace Aui {
    export namespace Message {
        export interface Properties extends Aui.Component.Properties {
            /**
             * @type {Aui.Title|string} title - 메시지창 제목
             */
            title?: Aui.Title | string;

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
             * @type {Object} buttons - 버튼
             */
            buttons?: Aui.Button.Properties[];

            /**
             * @type {Function} handler - 메시지창 버튼 핸들러
             */
            handler?: (button: Aui.Button) => void;
        }
    }
    export class Message {
        static message: Aui.Window = null;

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
        static show(properties: Aui.Message.Properties = null): void {
            Aui.Message.close();

            const buttons: Aui.Button[] = [];
            const handler =
                properties?.handler ??
                (() => {
                    Aui.Message.close();
                });
            properties?.buttons?.forEach((button: Aui.Button.Properties) => {
                buttons.push(
                    new Aui.Button({
                        ...button,
                        text: button.text.indexOf('@') === 0 ? Aui.printText(button.text.substring(1)) : button.text,
                        handler: handler,
                    })
                );
            });

            Aui.Message.message = new Aui.Window({
                title: properties?.title ?? '',
                modal: true,
                movable: false,
                resizable: false,
                closable: properties.closable ?? false,
                buttons: buttons,
                listeners: {
                    show: (window: Aui.Window) => {
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
        static loading(title: string = null, message: string = null, type: Aui.Loading.Type = null): void {
            Aui.Message.close();

            Aui.Message.message = new Aui.Window({
                title: title ?? Aui.printText('actions.loading_status'),
                modal: true,
                movable: false,
                resizable: false,
                closable: false,
                width: 300,
                listeners: {
                    show: (window: Aui.Window) => {
                        window.$getComponent().setAttr('data-role', 'message');
                        window.setData(
                            'loading',
                            new Aui.Loading(window, {
                                type: type ?? 'dot',
                                text: message ?? Aui.printText('actions.loading'),
                            })
                        );
                        window.getData('loading')?.show();
                    },
                    close: (window: Aui.Window) => {
                        window.getData('loading')?.close();
                    },
                },
            });

            Aui.Message.message.show();
        }

        /**
         * 메시지창을 닫는다.
         */
        static close(): void {
            if (Aui.Message.message !== null) {
                Aui.Message.message.close();
            }
        }
    }
}
