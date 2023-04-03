/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모든 관리자를 사용하는 컴포넌트 UI 클래스에서 공통적으로 사용하는 부분을 정의한다.
 *
 * @file /modules/admin/admin/scripts/Admin.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 2. 14.
 */
var Admin;
(function (Admin) {
    function getModule(name) {
        if (Admin.modules.has(name) == false) {
            const namespaces = name.split('/');
            if (window['modules'] === undefined) {
                return null;
            }
            let namespace = window['modules'];
            for (const name of namespaces) {
                if (namespace[name] === undefined) {
                    return null;
                }
                namespace = namespace[name];
            }
            const classname = namespaces.pop().replace(/^[a-z]/, (char) => char.toUpperCase()) + 'Admin';
            if (namespace[classname] === undefined) {
                return null;
            }
            if (typeof namespace[classname] == 'function' &&
                namespace[classname].prototype instanceof Admin.Interface) {
                Admin.modules.set(name, new namespace[classname]('module', name));
                return Admin.modules.get(name);
            }
            return null;
        }
        return Admin.modules.get(name);
    }
    Admin.getModule = getModule;
    /**
     * 관리자 인터페이스 클래스를 정의한다.
     */
    class Interface {
        type;
        name;
        /**
         * 관리자 인터페이스 클래스를 정의한다.
         *
         * @param {string} type - 컴포넌트타입 (module, plugin, widget)
         * @param {string} name - 컴포넌트명
         */
        constructor(type, name) {
            this.type = type;
            this.name = name;
        }
        /**
         * 컴포넌트타입을 가져온다.
         *
         * @return {string} type - 컴포넌트타입(module, plugin, widget)
         */
        getType() {
            return this.type;
        }
        /**
         * 컴포넌트명을 가져온다.
         *
         * @return {string} name - 컴포넌트명
         */
        getName() {
            return this.name;
        }
        /**
         * 언어팩을 불러온다.
         *
         * @param string $text 언어팩코드
         * @param ?array $placeHolder 치환자
         * @return array|string|null $message 치환된 메시지
         */
        async getText(text, placeHolder = null) {
            const paths = ['/' + this.type + 's/' + this.name];
            if (this.type != 'module' || this.name != 'admin') {
                paths.push('/modules/admin');
            }
            paths.push('/');
            return Language.getText(text, placeHolder, paths);
        }
        /**
         * 언어팩 문자열이 위치할 DOM 을 반환하고, 언어팩이 비동기적으로 로딩되면 언어팩 내용으로 변환한다.
         *
         * @param string $text 언어팩코드
         * @param ?array $placeHolder 치환자
         * @return array|string|null $message 치환된 메시지
         */
        printText(text, placeHolder = null) {
            const paths = ['/' + this.type + 's/' + this.name];
            if (this.type != 'module' || this.name != 'admin') {
                paths.push('/modules/admin');
            }
            paths.push('/');
            return Language.printText(text, placeHolder, paths);
        }
        /**
         * 관리자 인터페이스를 구성하는 요소의 기본 상대경로를 가져온다.
         *
         * @return {string} baseUrl
         */
        getBase() {
            return Html.get('body').getAttr('data-base') + '/' + this.type + 's/' + this.name;
        }
        /**
         * 관리자 인터페이스를 구성하는 요소의 관리자 상대경로를 가져온다.
         *
         * @return {string} adminUrl
         */
        getAdmin() {
            return this.getBase() + '/admin';
        }
        /**
         * 관리자 인터페이스를 구성하는 요소의 프로세스 URL 경로를 가져온다.
         *
         * @param {string} path - 요청주소
         * @return {string} processUrl
         */
        getProcessUrl(path) {
            return Admin.getProcessUrl(this.type, this.name, path);
        }
        /**
         * 사용자정의 환경설정 폼을 가져온다.
         *
         * @return {Admin.Form.Panel} configsForm - 설정폼
         */
        async getConfigsForm() {
            return null;
        }
    }
    Admin.Interface = Interface;
})(Admin || (Admin = {}));
window.onload = () => {
    new Admin.Viewport.Panel({
        id: 'Admin-Viewport',
        navigation: new Admin.Viewport.Navigation.Panel({
            id: 'Admin-Viewport-Navigation',
            getUrl: Admin.getProcessUrl('module', 'admin', 'contexts'),
            saveUrl: Admin.getProcessUrl('module', 'admin', 'contexts'),
        }),
    }).doLayout();
};
