/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈에서 사용되는 컴포넌트의 공통 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Base.js
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 1.
 */
var Admin;
(function (Admin) {
    Admin.components = {};
    Admin.index = 0;
    Admin.currentComponent = null;
    /**
     * 컴포넌트를 등록한다.
     *
     * @param {Admin.Base} component - 컴포넌트 객체
     */
    function set(component) {
        this.components[component.id] = component;
    }
    Admin.set = set;
    /**
     * 컴포넌트를 가져온다.
     *
     * @param {string} id - 가져올 컴포넌트 고유값
     * @return {Admin.Base} component - 컴포넌트
     */
    function get(id) {
        return this.components[id];
    }
    Admin.get = get;
    /**
     * 컴포넌트 일련번호를 가져온다.
     *
     * @return {number} index - 일련번호
     */
    function getIndex() {
        return ++this.index;
    }
    Admin.getIndex = getIndex;
    /**
     * 관리자 UI 처리가 준비되었을 때 이벤트리스너를 등록한다.
     *
     * @param {EventListener} listener - 이벤트리스너
     */
    function ready(listener) {
        Html.ready(listener);
    }
    Admin.ready = ready;
    class Base {
        id;
        properties;
        listeners = {};
        /**
         * 객체를 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
            this.properties = properties ?? {};
            this.id = properties?.id ?? 'Admin-' + Admin.getIndex();
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
         * 이벤트리스너를 등록한다.
         *
         * @param {string} name - 이벤트명
         * @param {Function} listener - 이벤트리스너
         * @param {any[]} params - 이벤트리스너에 전달될 데이터
         */
        addEvent(name, listener, params = []) {
            if (this.listeners[name] == undefined) {
                this.listeners[name] = [];
            }
            this.listeners[name].push({ listener: listener, params: params });
        }
        /**
         * 이벤트를 발생시킨다.
         *
         * @param {string} name - 이벤트명
         */
        fireEvent(name) {
            if (this.listeners[name] !== undefined) {
                for (let listener of this.listeners[name]) {
                    listener.listener(...listener.params);
                }
            }
        }
    }
    Admin.Base = Base;
})(Admin || (Admin = {}));
Html.on('click', (e) => {
    if (e.target instanceof HTMLElement) {
        const $target = Html.el(e.target);
        const $component = $target.getParents('div[data-component]');
        if ($component == null) {
            Admin.currentComponent = null;
        }
        else {
            Admin.currentComponent = Admin.get($component.getData('component'));
        }
    }
});
Html.on('keydown', (e) => {
    if (Admin.currentComponent !== null && typeof Admin.currentComponent['onKeydown'] == 'function') {
        Admin.currentComponent['onKeydown'](e);
    }
});
Html.on('copy', (e) => {
    if (Admin.currentComponent !== null && typeof Admin.currentComponent['onCopy'] == 'function') {
        Admin.currentComponent['onCopy'](e);
    }
});
