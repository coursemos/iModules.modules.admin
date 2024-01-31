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
var Admin;
(function (Admin) {
    Admin.language = null;
    Admin.modules = new Map();
    /**
     * 모듈의 관리자 클래스를 가져온다.
     *
     * @param {string} name - 모듈명
     * @returns {modules.admin.admin.Component} - 모듈 관리자 클래스
     */
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
            if (namespace['admin'] === undefined) {
                return null;
            }
            namespace = namespace['admin'];
            const classname = namespaces.pop().replace(/^[a-z]/, (char) => char.toUpperCase());
            if (namespace[classname] === undefined) {
                return null;
            }
            if (typeof namespace[classname] == 'function' &&
                namespace[classname].prototype instanceof globalThis.modules.admin.admin.Component) {
                Admin.modules.set(name, new namespace[classname]('module', name));
                return Admin.modules.get(name);
            }
            return null;
        }
        return Admin.modules.get(name);
    }
    Admin.getModule = getModule;
    /**
     * 세션 스토리지의 데이터를 처리한다.
     *
     * @param {string} key - 데이터키
     * @param {any} value - 저장할 데이터 (undefined 인 경우 저장된 데이터를 가져온다.)
     * @return {any} data - 데이터를 가져올 경우 해당 데이터값
     */
    function session(key, value = undefined) {
        const session = window.sessionStorage?.getItem('iModules-Admin-Session') ?? null;
        const datas = session !== null ? JSON.parse(session) : {};
        if (value === undefined) {
            return datas[key] ?? null;
        }
        else {
            datas[key] = value;
            window.sessionStorage?.setItem('iModules-Admin-Session', JSON.stringify(datas));
        }
    }
    Admin.session = session;
    /**
     * 현재 언어코드를 가져온다.
     *
     * @return {string} language
     */
    function getLanguage() {
        Admin.language ??= Html.get('html').getAttr('lang');
        return Admin.language;
    }
    Admin.getLanguage = getLanguage;
    /**
     * 언어팩을 불러온다.
     *
     * @param {string} text - 언어팩코드
     * @param {Object} placeHolder - 치환자
     * @return {string|Object} message - 치환된 메시지
     */
    async function getText(text, placeHolder = null) {
        return Language.getText(text, placeHolder, ['/module/admin/language', '/languages']);
    }
    Admin.getText = getText;
    /**
     * 에러메시지를 불러온다.
     *
     * @param {string} error - 에러코드
     * @param {Object} placeHolder - 치환자
     * @return {string} message - 치환된 메시지
     */
    async function getErrorText(error, placeHolder = null) {
        return Language.getErrorText(error, placeHolder, ['/module/admin/language', '/languages']);
    }
    Admin.getErrorText = getErrorText;
    /**
     * 언어팩을 출력한다.
     * 언어팩을 비동기방식으로 가져오기때문에 치환자를 먼저 반환하고, 언어팩이 로딩완료되면 언어팩으로 대치한다.
     *
     * @param {string} text - 언어팩코드
     * @param {Object} placeHolder - 치환자
     * @return {string|Object} message - 치환된 메시지
     */
    function printText(text, placeHolder = null) {
        return Language.printText(text, placeHolder, ['/module/admin/language', '/languages']);
    }
    Admin.printText = printText;
    /**
     * 에러메시지를 출력한다.
     * 언어팩을 비동기방식으로 가져오기때문에 치환자를 먼저 반환하고, 언어팩이 로딩완료되면 언어팩으로 대치한다.
     *
     * @param {string} error - 에러코드
     * @param {Object} placeHolder - 치환자
     * @return {string|Object} message - 치환된 메시지
     */
    function printErrorText(error, placeHolder = null) {
        return Language.printErrorText(error, placeHolder, ['/module/admin/language', '/languages']);
    }
    Admin.printErrorText = printErrorText;
    /**
     * 기본 URL 경로를 가져온다.
     *
     * @return {string} baseUrl
     */
    function getBase() {
        return Html.get('body').getAttr('data-base');
    }
    Admin.getBase = getBase;
    /**
     * REWRITE 를 사용중인지 확인한다.
     *
     * @return {boolean} is_rewrite
     */
    function isRewrite() {
        return Html.get('body').getAttr('data-rewrite') === 'true';
    }
    Admin.isRewrite = isRewrite;
    /**
     * 관리자 기본 URL 경로를 가져온다.
     *
     * @return {string} baseUrl
     */
    function getUrl() {
        const route = '/admin';
        return Admin.getBase() + (Admin.isRewrite() === true ? route : '/?route=' + route);
    }
    Admin.getUrl = getUrl;
    /**
     * 관리자 컨텍스트 URL 을 가져온한다.
     *
     * @return {string} contextUrl;
     */
    function getContextUrl() {
        return Admin.getUrl() + Html.get('body').getAttr('data-context-url');
    }
    Admin.getContextUrl = getContextUrl;
    /**
     * 관리자 컨텍스트의 추가 URL 을 가져온한다.
     *
     * @param {number} index - / 로 구분하여 가져올 index 위치값 (NULL 인 경우 전체경로)
     * @return {string} contextSubUrl;
     */
    function getContextSubUrl(index = null) {
        const current = location.href.split(Admin.getContextUrl());
        const contextSubUrl = (current.length == 1 ? '/' : current[1]).replace(/(\?|&)+.*?$/, '');
        if (index === null) {
            return contextSubUrl;
        }
        else {
            return contextSubUrl.replace(/^\//, '').split('/').at(index) ?? null;
        }
    }
    Admin.getContextSubUrl = getContextSubUrl;
    /**
     * History API 를 활용하여 현재 컨텍스트 추가 URL 을 변경한다.
     *
     * @param {string} subUrl - 변경할 URL
     * @param {string} title - 변경할 문서 타이틀 (NULL 인 경우 현재 문서 타이틀)
     */
    function setContextSubUrl(subUrl, title = null) {
        window.history.replaceState({}, title ?? document.title, Admin.getContextUrl() + subUrl);
    }
    Admin.setContextSubUrl = setContextSubUrl;
    /**
     * 프로세스 URL 경로를 가져온다.
     *
     * @param {'module'|'plugin'|'widget'} type - 컴포넌트 타입
     * @param {string} name - 컴포넌트명
     * @param {string} path - 실행경로
     * @return {string} processUrl
     */
    function getProcessUrl(type, name, path) {
        const is_rewrite = Html.get('body').getAttr('data-rewrite') === 'true';
        const route = '/' + type + '/' + name + '/process/' + path;
        return Admin.getBase() + (is_rewrite === true ? route + '?debug=true' : '/?route=' + route + '&debug=true');
    }
    Admin.getProcessUrl = getProcessUrl;
    /**
     * 관리자 UI 처리가 준비되었을 때 이벤트리스너를 등록한다.
     *
     * @param {EventListener} listener - 이벤트리스너
     */
    function ready(listener) {
        this.viewportListener = listener;
    }
    Admin.ready = ready;
})(Admin || (Admin = {}));
