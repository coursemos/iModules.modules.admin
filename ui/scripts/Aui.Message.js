/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 메시지창 클래스를 정의한다.
 *
 * @file /scripts/Aui.Message.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 9. 30.
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
                        let focus = null;
                        for (const button of buttons) {
                            focus ??= button;
                            if (button.action == 'ok') {
                                focus = button;
                                break;
                            }
                        }
                        focus?.focus();
                    },
                },
            });
            Aui.Message.message.addEvent('close', () => {
                Aui.Message.message = null;
            });
            const $content = Aui.Message.message.$getContent();
            const $messagebox = Html.create('div', { 'data-role': 'messagebox' });
            if (properties.width) {
                $messagebox.setStyle('max-width', properties.width + 'px');
            }
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
                            modal: false,
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
         * 로딩메시지를 연다.
         *
         * @param {Aui.Message.Progress.Properties} properties - 로딩설정
         */
        static progress(properties = null) {
            Aui.Message.close();
            const steps = properties?.steps ?? [];
            Aui.Message.message = new Aui.Window({
                title: properties?.title ?? Aui.printText('actions.progress_status'),
                modal: true,
                movable: false,
                resizable: false,
                closable: false,
                scrollable: false,
                width: 400,
                padding: 10,
                items: [
                    new Aui.Progress({
                        message: properties.message ?? null,
                        loading: true,
                    }),
                    (() => {
                        if (steps.length > 0) {
                            return new Aui.Progress({
                                loading: true,
                                margin: [10, 0, 0, 0],
                            });
                        }
                        return null;
                    })(),
                ],
                buttons: [
                    new Aui.Button({
                        text: Aui.printText('buttons.cancel'),
                        handler: (button) => {
                            button.value?.abort();
                            Aui.Message.close();
                        },
                    }),
                    new Aui.Button({
                        text: Aui.printText('buttons.ok'),
                        buttonClass: 'confirm',
                        handler: async (button) => {
                            if (typeof properties?.handler == 'function') {
                                await properties.handler(button, button.value);
                            }
                            Aui.Message.close();
                        },
                    }),
                ],
                progress: async (window, step) => {
                    const button = window.buttons.at(0);
                    const method = (step?.method ?? 'GET').toUpperCase();
                    const url = step?.url;
                    const params = (step?.params ?? null);
                    const data = step?.data ?? null;
                    const callback = (results) => {
                        if (Aui.getComponent(window.getId()) === null) {
                            return;
                        }
                        const progress = window.getItemAt(0);
                        progress.setMax(results.total);
                        progress.setValue(results.current);
                        if (typeof step?.progress == 'function') {
                            if (results.success == true) {
                                step.progress(progress, results);
                            }
                        }
                        if (results.end == true) {
                            return results.success;
                        }
                    };
                    const progress = Ajax.Progress.init();
                    window.getItemAt(0).setMax(100);
                    window.getItemAt(0).setValue(0);
                    await iModules.sleep(1000);
                    button.setValue(progress);
                    switch (method) {
                        case 'SYNC':
                            return progress.sync(url, params, callback);
                        case 'POST':
                            return progress.post(url, data, params, callback);
                        case 'DELETE':
                            return progress.delete(url, params, callback);
                        default:
                            return progress.get(url, params, callback);
                    }
                },
                listeners: {
                    show: async (window) => {
                        const button = window.buttons.at(1);
                        button.setLoading(true);
                        if (steps.length > 0) {
                            const stepProgress = window.getItemAt(1);
                            const progress = window.getItemAt(0);
                            stepProgress.setMax(steps.length);
                            const stepMessage = (properties?.message ?? null) == null
                                ? '${current}/' + steps.length
                                : properties?.message + ' (${current}/' + steps.length + ')';
                            stepProgress.setMessage(stepMessage.replace('${current}', '0'));
                            await iModules.sleep(2000);
                            const stepResults = { success: true, steps: [] };
                            for (const index in steps) {
                                progress.setLoading(true);
                                progress.setMessage(steps[index].message ?? null);
                                await iModules.sleep(1000);
                                stepProgress.setMessage(stepMessage.replace('${current}', index));
                                stepProgress.setValue(parseInt(index));
                                const results = await window.properties.progress(window, steps[index], index);
                                stepResults.success = stepResults.success && results.success;
                                stepResults.steps.push(results);
                                if (results.success == false) {
                                    if (results.aborted == false) {
                                        Aui.Message.show({
                                            title: Aui.getErrorText('TITLE'),
                                            message: results?.message ?? Aui.getErrorText('CONNECT_ERROR'),
                                            icon: Aui.Message.ERROR,
                                            buttons: Aui.Message.OK,
                                            handler: async (button) => {
                                                if (typeof properties?.handler == 'function') {
                                                    await properties.handler(button, results);
                                                }
                                                Aui.Message.close();
                                            },
                                        });
                                    }
                                    break;
                                }
                                stepProgress.setMessage(stepMessage.replace('${current}', (parseInt(index) + 1).toString()));
                                stepProgress.setValue(parseInt(index) + 1);
                                await iModules.sleep(2000);
                            }
                            if (stepResults.success == true) {
                                button.setValue(stepResults);
                                button.setLoading(false);
                                window.setTitle(Aui.printText('actions.complete_status'));
                            }
                        }
                        else {
                            await iModules.sleep(2000);
                            const results = await window.properties.progress(window, properties, null);
                            if (results.success == true) {
                                button.setValue(results);
                                button.setLoading(false);
                                window.setTitle(Aui.printText('actions.complete_status'));
                            }
                            else if (results.aborted == false) {
                                Aui.Message.show({
                                    title: Aui.getErrorText('TITLE'),
                                    message: results?.message ?? Aui.getErrorText('CONNECT_ERROR'),
                                    icon: Aui.Message.ERROR,
                                    buttons: Aui.Message.OK,
                                    handler: async (button) => {
                                        if (typeof properties?.handler == 'function') {
                                            await properties.handler(button, results);
                                        }
                                        Aui.Message.close();
                                    },
                                });
                            }
                        }
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
                        if (typeof properties.beforeHandler == 'function') {
                            if ((await properties.beforeHandler()) == false) {
                                return;
                            }
                        }
                        if (properties?.url !== null) {
                            const results = await Ajax.delete(properties.url, properties.params ?? null);
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
                            else if (Aui.getComponent(button.getParent().getId()) !== null) {
                                button.getParent().buttons.at(0).show();
                                button.setLoading(false);
                            }
                        }
                        else {
                            Aui.Message.show({
                                title: Aui.getErrorText('INFO'),
                                message: Aui.printText('actions.deleted'),
                                icon: Aui.Message.INFO,
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
