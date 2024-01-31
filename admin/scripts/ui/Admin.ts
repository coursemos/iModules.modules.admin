/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 페이지를 위한 공통 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/ui/Admin.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
namespace Admin {
    export let language: string = null;
    export let viewportListener: () => Promise<Aui.Component>;
    export const modules: Map<string, modules.admin.admin.Component> = new Map();

    /**
     * 컴포넌트 관리자 클래스의 인터페이스를 가져온다.
     */
    export interface ComponentConstructor {
        new (type: string, name: string): modules.admin.admin.Component;
    }

    /**
     * 모듈의 관리자 클래스를 가져온다.
     *
     * @param {string} name - 모듈명
     * @returns {modules.admin.admin.Component} - 모듈 관리자 클래스
     */
    export function getModule(name: string): modules.admin.admin.Component {
        if (Admin.modules.has(name) == false) {
            const namespaces = name.split('/');
            if (window['modules'] === undefined) {
                return null;
            }

            let namespace: Object | Admin.ComponentConstructor = window['modules'];
            for (const name of namespaces) {
                if (namespace[name] === undefined) {
                    return null;
                }
                namespace = namespace[name];
            }
            if (namespace['admin'] === undefined) {
                return null;
            }
            namespace = namespace['admin'];

            const classname = namespaces.pop().replace(/^[a-z]/, (char: string) => char.toUpperCase());
            if (namespace[classname] === undefined) {
                return null;
            }

            if (
                typeof namespace[classname] == 'function' &&
                namespace[classname].prototype instanceof globalThis.modules.admin.admin.Component
            ) {
                Admin.modules.set(name, new (namespace[classname] as Admin.ComponentConstructor)('module', name));
                return Admin.modules.get(name);
            }

            return null;
        }

        return Admin.modules.get(name);
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
     * 언어팩을 불러온다.
     *
     * @param {string} text - 언어팩코드
     * @param {Object} placeHolder - 치환자
     * @return {string|Object} message - 치환된 메시지
     */
    export async function getText(
        text: string,
        placeHolder: { [key: string]: string } = null
    ): Promise<string | Object> {
        return Language.getText(text, placeHolder, ['/module/admin/language', '/languages']);
    }

    /**
     * 에러메시지를 불러온다.
     *
     * @param {string} error - 에러코드
     * @param {Object} placeHolder - 치환자
     * @return {string} message - 치환된 메시지
     */
    export async function getErrorText(error: string, placeHolder: { [key: string]: string } = null): Promise<string> {
        return Language.getErrorText(error, placeHolder, ['/module/admin/language', '/languages']);
    }

    /**
     * 언어팩을 출력한다.
     * 언어팩을 비동기방식으로 가져오기때문에 치환자를 먼저 반환하고, 언어팩이 로딩완료되면 언어팩으로 대치한다.
     *
     * @param {string} text - 언어팩코드
     * @param {Object} placeHolder - 치환자
     * @return {string|Object} message - 치환된 메시지
     */
    export function printText(text: string, placeHolder: { [key: string]: string } = null): string {
        return Language.printText(text, placeHolder, ['/module/admin/language', '/languages']);
    }

    /**
     * 에러메시지를 출력한다.
     * 언어팩을 비동기방식으로 가져오기때문에 치환자를 먼저 반환하고, 언어팩이 로딩완료되면 언어팩으로 대치한다.
     *
     * @param {string} error - 에러코드
     * @param {Object} placeHolder - 치환자
     * @return {string|Object} message - 치환된 메시지
     */
    export function printErrorText(error: string, placeHolder: { [key: string]: string } = null): string {
        return Language.printErrorText(error, placeHolder, ['/module/admin/language', '/languages']);
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
     * REWRITE 를 사용중인지 확인한다.
     *
     * @return {boolean} is_rewrite
     */
    export function isRewrite(): boolean {
        return Html.get('body').getAttr('data-rewrite') === 'true';
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
     * @return {string} contextUrl;
     */
    export function getContextUrl(): string {
        return Admin.getUrl() + Html.get('body').getAttr('data-context-url');
    }

    /**
     * 관리자 컨텍스트의 추가 URL 을 가져온한다.
     *
     * @param {number} index - / 로 구분하여 가져올 index 위치값 (NULL 인 경우 전체경로)
     * @return {string} contextSubUrl;
     */
    export function getContextSubUrl(index: number = null): string {
        const current = location.href.split(Admin.getContextUrl());
        const contextSubUrl = (current.length == 1 ? '/' : current[1]).replace(/(\?|&)+.*?$/, '');
        if (index === null) {
            return contextSubUrl;
        } else {
            return contextSubUrl.replace(/^\//, '').split('/').at(index) ?? null;
        }
    }

    /**
     * History API 를 활용하여 현재 컨텍스트 추가 URL 을 변경한다.
     *
     * @param {string} subUrl - 변경할 URL
     * @param {string} title - 변경할 문서 타이틀 (NULL 인 경우 현재 문서 타이틀)
     */
    export function setContextSubUrl(subUrl: string, title: string = null): void {
        window.history.replaceState({}, title ?? document.title, Admin.getContextUrl() + subUrl);
    }

    /**
     * 프로세스 URL 경로를 가져온다.
     *
     * @param {'module'|'plugin'|'widget'} type - 컴포넌트 타입
     * @param {string} name - 컴포넌트명
     * @param {string} path - 실행경로
     * @return {string} processUrl
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
    export function ready(listener: () => Promise<Aui.Component>): void {
        this.viewportListener = listener;
    }
}
