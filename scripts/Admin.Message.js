/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 메시지창 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Message.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 2. 26.
 */
var Admin;
(function (Admin) {
    class Message {
        static message = null;
        static INFO = Html.create('i').addClass('info');
        static ERROR = Html.create('i').addClass('error');
        static LOADING = Html.create('i').addClass('loading').html('<i></i><i></i><i></i><i></i>');
        static OK = [{ button: 'ok', text: '@buttons/ok', buttonClass: 'confirm' }];
        /**
         * 메시지창을 연다.
         *
         * @param {Object} properties - 설정
         */
        static show(properties = null) {
            Admin.Message.close();
            const buttons = [];
            const handler = properties?.handler ??
                (() => {
                    Admin.Message.close();
                });
            properties?.buttons?.forEach((button) => {
                buttons.push(new Admin.Button({
                    text: button.text.indexOf('@') === 0 ? Admin.printText(button.text.substring(1)) : button.text,
                    buttonClass: button.buttonClass,
                    handler: handler,
                }));
            });
            Admin.Message.message = new Admin.Window({
                title: properties?.title ?? '',
                modal: true,
                movable: false,
                resizable: false,
                closable: false,
                buttons: buttons,
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
         */
        static loading(title = null, message = null) {
            Admin.Message.show({
                title: title ?? Admin.printText('actions/loading'),
                icon: Admin.Message.LOADING,
                message: message ?? Admin.printText('actions/wait'),
                messageClass: 'loading',
            });
        }
        /**
         * 메시지창을 닫는다.
         */
        static close() {
            if (Admin.Message.message !== null) {
                Admin.Message.message.close();
            }
        }
    }
    Admin.Message = Message;
})(Admin || (Admin = {}));
