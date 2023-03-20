/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈에서 사용되는 컴포넌트의 공통 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Base.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 20.
 */
namespace Admin {
    export let items: Map<string, Admin.Base> = new Map();
    export let index: number = 0;
    export let currentComponent: Admin.Component = null;
    export let viewport: Admin.Viewport.Panel;
    export let viewportListener: () => Promise<Admin.Component>;
    export let language: string;

    /**
     * 객체를 등록한다.
     *
     * @param {Admin.Base} item - 객체
     */
    export function set(item: Admin.Base): void {
        if (Admin.items.has(item.id) == true) {
            console.error('[DUPLICATED ID]', item.id, item);
            return;
        }
        Admin.items.set(item.id, item);
    }

    /**
     * 객체를 가져온다.
     *
     * @param {string} id - 가져올 객체 고유값
     * @return {Admin.Base} item - 객체클래스
     */
    export function get(id: string): Admin.Base {
        return Admin.items.has(id) == true ? Admin.items.get(id) : null;
    }

    /**
     * 객체가 존재하는지 확인한다..
     *
     * @param {string} id - 확인할 객체 고유값
     * @return {boolean} has
     */
    export function has(id: string): boolean {
        return Admin.items.has(id);
    }

    /**
     * 컴포넌트를 가져온다.
     *
     * @param {string} id - 가져올 컴포넌트 고유값
     * @return {Admin.Component} item - 컴포넌트클래스
     */
    export function getComponent(id: string): Admin.Component {
        return Admin.items.has(id) == true && Admin.items.get(id) instanceof Admin.Component
            ? (Admin.items.get(id) as Admin.Component)
            : null;
    }

    /**
     * 객체를 제거한다.
     *
     * @param {string} id - 제거할 객체 고유값
     */
    export function remove(id: string): void {
        Admin.items.delete(id);
    }

    /**
     * 컴포넌트 일련번호를 가져온다.
     *
     * @return {number} index - 일련번호
     */
    export function getIndex(): number {
        return ++Admin.index;
    }

    /**
     * 언어팩을 불러온다.
     *
     * @param string $text 언어팩코드
     * @param ?array $placeHolder 치환자
     * @return array|string|null $message 치환된 메시지
     */
    export async function getText(
        text: string,
        placeHolder: { [key: string]: string } = null
    ): Promise<string | object> {
        return Language.getText(text, placeHolder, ['/modules/admin', '/']);
    }

    /**
     * 언어팩 문자열이 위치할 DOM 을 반환하고, 언어팩이 비동기적으로 로딩되면 언어팩 내용으로 변환한다.
     *
     * @param string $text 언어팩코드
     * @param ?array $placeHolder 치환자
     * @return array|string|null $message 치환된 메시지
     */
    export function printText(text: string, placeHolder: { [key: string]: string } = null): string {
        return Language.printText(text, placeHolder, ['/modules/admin', '/']);
    }

    /**
     * REWRITE 를 사용중인지 확인한다.
     *
     * @return {boolean} is_rewrite
     */
    export function isRewrite(): boolean {
        return Html.get('body').getAttr('data-rewrite') === 'true';
    }

    /**
     * 현재 언어코드를 가져온다.
     *
     * @return {string} language
     */
    export function getLanguage(): string {
        Admin.language ??= Html.get('html').getAttr('lang');
        return Admin.language;
    }

    /**
     * 기본 URL 경로를 가져온다.
     *
     * @return {string} baseUrl
     */
    export function getBase(): string {
        return Html.get('body').getAttr('data-base');
    }

    /**
     * 관리자 기본 URL 경로를 가져온다.
     *
     * @return {string} baseUrl
     */
    export function getUrl(): string {
        const route = '/admin';
        return Admin.getBase() + (Admin.isRewrite() === true ? route : '/?route=' + route);
    }

    /**
     * 관리자 컨텍스트 URL 을 가져온한다.
     *
     * @param {string} subUrl - 현재 컨텍스트 URL 에 추가할 경로
     * @return {string} contextUrl;
     */
    export function getContextUrl(subUrl: string = ''): string {
        const current = new URLSearchParams(location.search);

        let contextUrl = Admin.getUrl() + Html.get('body').getAttr('data-context-url') + subUrl;
        const params = new URLSearchParams();
        for (const [key, value] of current.entries()) {
            if (key == 'route') {
                continue;
            }
            params.append(key, value);
        }
        const search = params.toString();

        return contextUrl + (search.length > 0 ? (Admin.isRewrite() === true ? '?' : '&') + search : '');
    }

    /**
     * 관리자 컨텍스트의 추가 URL 을 가져온한다.
     *
     * @return {string} contextSubUrl;
     */
    export function getContextSubUrl(): string {
        let contextSubUrl = '';
        const reg = new RegExp('^\\/admin' + Html.get('body').getAttr('data-context-url').replace('/', '\\/'));
        if (Admin.isRewrite() === true) {
            contextSubUrl = location.pathname.replace(reg, '');
        } else {
            const params = new URLSearchParams(location.search);
            contextSubUrl = params.get('route').replace(reg, '');
        }

        return contextSubUrl;
    }

    /**
     * 관리자 컨텍스트의 추가 URL 을 배열형태로 가져온다.
     *
     * @return {string[]} path;
     */
    export function getContextSubTree(): string[] {
        const contextSubTree = Admin.getContextSubUrl().split('/');
        contextSubTree.shift();

        return contextSubTree;
    }

    /**
     * History API 를 활용하여 현재 컨텍스트 URL 을 변경한다.
     *
     * @param {string} url - 변경할 URL
     * @param {string} title - 변경할 문서 타이틀 (NULL 인 경우 현재 문서 타이틀)
     */
    export function setContextUrl(url: string, title: string = null): void {
        window.history.replaceState({}, title ?? document.title, url);
    }

    /**
     * 프로세스 URL 경로를 가져온다.
     *
     * @return {string} baseUrl
     */
    export function getProcessUrl(type: string, name: string, path: string): string {
        const is_rewrite = Html.get('body').getAttr('data-rewrite') === 'true';
        const route = '/' + type + '/' + name + '/process/' + path;
        return Admin.getBase() + (is_rewrite === true ? route + '?debug=true' : '/?route=' + route + '&debug=true');
    }

    /**
     * 관리자 UI 처리가 준비되었을 때 이벤트리스너를 등록한다.
     *
     * @param {EventListener} listener - 이벤트리스너
     */
    export function ready(listener: () => Promise<Admin.Component>): void {
        this.viewportListener = listener;
    }

    /**
     * 세션 스토리지의 데이터를 처리한다.
     *
     * @param {string} key - 데이터키
     * @param {any} value - 저장할 데이터 (undefined 인 경우 저장된 데이터를 가져온다.)
     * @return {any} data - 데이터를 가져올 경우 해당 데이터값
     */
    export function session(key: string, value: any = undefined): any {
        const session = window.sessionStorage?.getItem('iModules-Admin-Session') ?? null;
        const datas = session !== null ? JSON.parse(session) : {};

        if (value === undefined) {
            return datas[key] ?? null;
        } else {
            datas[key] = value;
            window.sessionStorage?.setItem('iModules-Admin-Session', JSON.stringify(datas));
        }
    }

    export interface Constructor {
        new (type: string, name: string): Admin.Interface;
    }

    /**
     * 모듈을 관리하는 클래스를 정의한다.
     */
    export namespace Modules {
        export const classes: { [key: string]: Admin.Interface } = {};

        /**
         * 모듈 관리자 클래스를 가져온다.
         *
         * @param {string} name - 모듈명
         * @return {?Admin.Module} module - 모듈 관리자 클래스
         */
        export function get(name: string): Admin.Interface | null {
            if (Admin.Modules.classes[name] === undefined) {
                const namespaces = name.split('/');
                if (window['modules'] === undefined) {
                    return null;
                }

                let namespace: Object | Admin.Constructor = window['modules'];
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
                    Admin.Modules.classes[name] = new (namespace[classname] as Admin.Constructor)('module', name);
                    return Admin.Modules.classes[name];
                }

                return null;
            }

            return Admin.Modules.classes[name];
        }
    }

    /**
     * 관리자 인터페이스 클래스를 정의한다.
     */
    export class Interface {
        type: string;
        name: string;

        /**
         * 관리자 인터페이스 클래스를 정의한다.
         *
         * @param {string} type - 컴포넌트타입 (module, plugin, widget)
         * @param {string} name - 컴포넌트명
         */
        constructor(type: string, name: string) {
            this.type = type;
            this.name = name;
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
    }

    export namespace Base {
        export interface Listeners {
            [name: string]: Function;
        }

        export interface Properties {
            /**
             * @type {string} id - Admin 객체 고유값
             */
            id?: string;

            /**
             * @type {Admin.Base.Listeners} listeners - 이벤트리스너
             */
            listeners?: Admin.Base.Listeners;
            [key: string]: any;
        }
    }

    export class Base {
        id: string;
        properties: Admin.Base.Properties;
        listeners: { [name: string]: Function[] } = {};

        /**
         * 객체를 생성한다.
         *
         * @param {Admin.Base.Properties} properties - 객체설정
         */
        constructor(properties: Admin.Base.Properties = null) {
            this.properties = properties ?? {};
            this.id = properties?.id ?? 'Admin-' + Admin.getIndex();

            if (this.properties.listeners !== undefined) {
                for (const name in this.properties.listeners) {
                    this.addEvent(name, this.properties.listeners[name]);
                }
            }
            Admin.set(this);
        }

        /**
         * 객체 고유값을 가져온다.
         *
         * @return {string} - 고유값
         */
        getId(): string {
            return this.id;
        }

        /**
         * 객체를 제거한다.
         */
        remove(): void {
            Admin.remove(this.id);
        }

        /**
         * 이벤트리스너를 등록한다.
         *
         * @param {string} name - 이벤트명
         * @param {Function} listener - 이벤트리스너
         */
        addEvent(name: string, listener: Function): void {
            if (this.listeners[name] == undefined) {
                this.listeners[name] = [];
            }

            this.listeners[name].push(listener);
        }

        /**
         * 이벤트를 발생시킨다.
         *
         * @param {string} name - 이벤트명
         * @param {any[]} params - 이벤트리스너에 전달될 데이터
         * @return {boolean} result
         */
        fireEvent(name: string, params: any[] = []): boolean {
            if (this.listeners[name] !== undefined) {
                for (const listener of this.listeners[name]) {
                    if (listener(...params) === false) {
                        return false;
                    }
                }
            }

            return true;
        }

        /**
         * 이벤트를 실행한다.
         *
         * @param {string} name - 이벤트명
         */
        triggerEvent(name: string) {
            const methodName = 'on' + name.replace(/^[a-z]/, (char) => char.toUpperCase());
            if (typeof this[methodName] == 'function') {
                this[methodName]();
            }
        }
    }
}
