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
var Admin;
(function (Admin) {
    Admin.items = new Map();
    Admin.modules = new Map();
    Admin.index = 0;
    Admin.currentComponent = null;
    /**
     * 객체를 등록한다.
     *
     * @param {Admin.Base} item - 객체
     */
    function set(item) {
        if (Admin.items.has(item.id) == true) {
            console.error('[DUPLICATED ID]', item.id, item);
            return;
        }
        Admin.items.set(item.id, item);
    }
    Admin.set = set;
    /**
     * 객체를 가져온다.
     *
     * @param {string} id - 가져올 객체 고유값
     * @return {Admin.Base} item - 객체클래스
     */
    function get(id) {
        return Admin.items.has(id) == true ? Admin.items.get(id) : null;
    }
    Admin.get = get;
    /**
     * 객체가 존재하는지 확인한다..
     *
     * @param {string} id - 확인할 객체 고유값
     * @return {boolean} has
     */
    function has(id) {
        return Admin.items.has(id);
    }
    Admin.has = has;
    /**
     * 컴포넌트를 가져온다.
     *
     * @param {string} id - 가져올 컴포넌트 고유값
     * @return {Admin.Component} item - 컴포넌트클래스
     */
    function getComponent(id) {
        return Admin.items.has(id) == true && Admin.items.get(id) instanceof Admin.Component
            ? Admin.items.get(id)
            : null;
    }
    Admin.getComponent = getComponent;
    /**
     * 객체를 제거한다.
     *
     * @param {string} id - 제거할 객체 고유값
     */
    function remove(id) {
        Admin.items.delete(id);
    }
    Admin.remove = remove;
    /**
     * 컴포넌트 일련번호를 가져온다.
     *
     * @return {number} index - 일련번호
     */
    function getIndex() {
        return ++Admin.index;
    }
    Admin.getIndex = getIndex;
    /**
     * 언어팩을 불러온다.
     *
     * @param string $text 언어팩코드
     * @param ?array $placeHolder 치환자
     * @return array|string|null $message 치환된 메시지
     */
    async function getText(text, placeHolder = null) {
        return Language.getText(text, placeHolder, ['/modules/admin', '/']);
    }
    Admin.getText = getText;
    /**
     * 언어팩 문자열이 위치할 DOM 을 반환하고, 언어팩이 비동기적으로 로딩되면 언어팩 내용으로 변환한다.
     *
     * @param string $text 언어팩코드
     * @param ?array $placeHolder 치환자
     * @return array|string|null $message 치환된 메시지
     */
    function printText(text, placeHolder = null) {
        return Language.printText(text, placeHolder, ['/modules/admin', '/']);
    }
    Admin.printText = printText;
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
     * 기본 URL 경로를 가져온다.
     *
     * @return {string} baseUrl
     */
    function getBase() {
        return Html.get('body').getAttr('data-base');
    }
    Admin.getBase = getBase;
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
     * @param {string} subUrl - 현재 컨텍스트 URL 에 추가할 경로
     * @return {string} contextUrl;
     */
    function getContextUrl(subUrl = '') {
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
    Admin.getContextUrl = getContextUrl;
    /**
     * 관리자 컨텍스트의 추가 URL 을 가져온한다.
     *
     * @return {string} contextSubUrl;
     */
    function getContextSubUrl() {
        let contextSubUrl = '';
        const reg = new RegExp('^\\/admin' + Html.get('body').getAttr('data-context-url').replace('/', '\\/'));
        if (Admin.isRewrite() === true) {
            contextSubUrl = location.pathname.replace(reg, '');
        }
        else {
            const params = new URLSearchParams(location.search);
            contextSubUrl = params.get('route').replace(reg, '');
        }
        return contextSubUrl;
    }
    Admin.getContextSubUrl = getContextSubUrl;
    /**
     * 관리자 컨텍스트의 추가 URL 을 배열형태로 가져온다.
     *
     * @return {string[]} path;
     */
    function getContextSubTree() {
        const contextSubTree = Admin.getContextSubUrl().split('/');
        contextSubTree.shift();
        return contextSubTree;
    }
    Admin.getContextSubTree = getContextSubTree;
    /**
     * History API 를 활용하여 현재 컨텍스트 URL 을 변경한다.
     *
     * @param {string} url - 변경할 URL
     * @param {string} title - 변경할 문서 타이틀 (NULL 인 경우 현재 문서 타이틀)
     */
    function setContextUrl(url, title = null) {
        window.history.replaceState({}, title ?? document.title, url);
    }
    Admin.setContextUrl = setContextUrl;
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
    class Base {
        id;
        properties;
        dataValues = new Map();
        listeners = {};
        /**
         * 객체를 생성한다.
         *
         * @param {Admin.Base.Properties} properties - 객체설정
         */
        constructor(properties = null) {
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
        getId() {
            return this.id;
        }
        /**
         * 객체에 데이터값을 저장한다.
         *
         * @param {string} key - 저장할 데이터키
         * @param {any} value - 데이터
         */
        setData(key, value) {
            this.dataValues.set(key, value);
        }
        /**
         * 데이터를 가져온다.
         *
         * @param {string} key - 가져올 데이터키
         * @return {any} value - 데이터
         */
        getData(key) {
            return this.dataValues.get(key) ?? null;
        }
        /**
         * 객체를 제거한다.
         */
        remove() {
            Admin.remove(this.id);
        }
        /**
         * 이벤트리스너를 등록한다.
         *
         * @param {string} name - 이벤트명
         * @param {Function} listener - 이벤트리스너
         */
        addEvent(name, listener) {
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
        fireEvent(name, params = []) {
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
        triggerEvent(name) {
            const methodName = 'on' + name.replace(/^[a-z]/, (char) => char.toUpperCase());
            if (typeof this[methodName] == 'function') {
                this[methodName]();
            }
        }
    }
    Admin.Base = Base;
})(Admin || (Admin = {}));
