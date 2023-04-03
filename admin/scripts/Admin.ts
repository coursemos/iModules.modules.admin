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
namespace Admin {
    /**
     * 모듈 관리자 인터페이스를 가져온다.
     *
     * @param {string} name - 모듈명
     * @return {?Admin.Module} module - 모듈 관리자 클래스
     */
    export interface InterfaceConstructor {
        new (type: string, name: string): Admin.Interface;
    }
    export function getModule(name: string): Admin.Interface {
        if (Admin.modules.has(name) == false) {
            const namespaces = name.split('/');
            if (window['modules'] === undefined) {
                return null;
            }

            let namespace: Object | Admin.InterfaceConstructor = window['modules'];
            for (const name of namespaces) {
                if (namespace[name] === undefined) {
                    return null;
                }
                namespace = namespace[name];
            }
            const classname = namespaces.pop().replace(/^[a-z]/, (char: string) => char.toUpperCase()) + 'Admin';
            if (namespace[classname] === undefined) {
                return null;
            }

            if (
                typeof namespace[classname] == 'function' &&
                namespace[classname].prototype instanceof Admin.Interface
            ) {
                Admin.modules.set(name, new (namespace[classname] as Admin.InterfaceConstructor)('module', name));
                return Admin.modules.get(name);
            }

            return null;
        }

        return Admin.modules.get(name);
    }

    /**
     * 관리자 인터페이스 클래스를 정의한다.
     */
    export class Interface {
        type: 'module' | 'plugin' | 'widget';
        name: string;

        /**
         * 관리자 인터페이스 클래스를 정의한다.
         *
         * @param {string} type - 컴포넌트타입 (module, plugin, widget)
         * @param {string} name - 컴포넌트명
         */
        constructor(type: 'module' | 'plugin' | 'widget', name: string) {
            this.type = type;
            this.name = name;
        }

        /**
         * 컴포넌트타입을 가져온다.
         *
         * @return {string} type - 컴포넌트타입(module, plugin, widget)
         */
        getType(): 'module' | 'plugin' | 'widget' {
            return this.type;
        }

        /**
         * 컴포넌트명을 가져온다.
         *
         * @return {string} name - 컴포넌트명
         */
        getName(): string {
            return this.name;
        }

        /**
         * 언어팩을 불러온다.
         *
         * @param string $text 언어팩코드
         * @param ?array $placeHolder 치환자
         * @return array|string|null $message 치환된 메시지
         */
        async getText(text: string, placeHolder: { [key: string]: string } = null): Promise<string | object> {
            const paths: string[] = ['/' + this.type + 's/' + this.name];
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
        printText(text: string, placeHolder: { [key: string]: string } = null): string {
            const paths: string[] = ['/' + this.type + 's/' + this.name];
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
        getBase(): string {
            return Html.get('body').getAttr('data-base') + '/' + this.type + 's/' + this.name;
        }

        /**
         * 관리자 인터페이스를 구성하는 요소의 관리자 상대경로를 가져온다.
         *
         * @return {string} adminUrl
         */
        getAdmin(): string {
            return this.getBase() + '/admin';
        }

        /**
         * 관리자 인터페이스를 구성하는 요소의 프로세스 URL 경로를 가져온다.
         *
         * @param {string} path - 요청주소
         * @return {string} processUrl
         */
        getProcessUrl(path: string): string {
            return Admin.getProcessUrl(this.type, this.name, path);
        }

        /**
         * 사용자정의 환경설정 폼을 가져온다.
         *
         * @return {Admin.Form.Panel} configsForm - 설정폼
         */
        async getConfigsForm(): Promise<Admin.Form.Panel> {
            return null;
        }
    }
}

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
