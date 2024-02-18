/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * Aui 공통 메소드 및 Aui 객체 공통 클래스를 정의한다.
 *
 * @file /scripts/Aui.Base.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
var Aui;
(function (Aui) {
    Aui.items = new Map();
    Aui.index = 0;
    Aui.currentComponent = null;
    Aui.language = null;
    Aui.texts = new Map();
    Aui.readyListener = [];
    /**
     * 객체를 등록한다.
     *
     * @param {Aui.Base} item - 객체
     */
    function set(item) {
        if (Aui.items.has(item.id) == true) {
            console.error('[DUPLICATED ID]', item.id, item);
            return;
        }
        Aui.items.set(item.id, item);
    }
    Aui.set = set;
    /**
     * 객체를 가져온다.
     *
     * @param {string} id - 가져올 객체 고유값
     * @return {Aui.Base} item - 객체클래스
     */
    function get(id) {
        return Aui.items.has(id) == true ? Aui.items.get(id) : null;
    }
    Aui.get = get;
    /**
     * 객체가 존재하는지 확인한다..
     *
     * @param {string} id - 확인할 객체 고유값
     * @return {boolean} has
     */
    function has(id) {
        return Aui.items.has(id);
    }
    Aui.has = has;
    /**
     * 컴포넌트를 가져온다.
     *
     * @param {string} id - 가져올 컴포넌트 고유값
     * @return {Aui.Component} item - 컴포넌트클래스
     */
    function getComponent(id) {
        return Aui.items.has(id) == true && Aui.items.get(id) instanceof Aui.Component
            ? Aui.items.get(id)
            : null;
    }
    Aui.getComponent = getComponent;
    /**
     * 객체를 제거한다.
     *
     * @param {string} id - 제거할 객체 고유값
     */
    function remove(id) {
        Aui.items.delete(id);
    }
    Aui.remove = remove;
    /**
     * 컴포넌트 일련번호를 가져온다.
     *
     * @return {number} index - 일련번호
     */
    function getIndex() {
        return ++Aui.index;
    }
    Aui.getIndex = getIndex;
    async function initLanguage(baseUrl, retry = 0) {
        const language = Aui.getLanguage();
        if (Aui.language !== language) {
            const response = (await fetch(baseUrl + '/languages/' + language + '.json', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }).catch(async (e) => {
                if (retry <= 3) {
                    return Aui.initLanguage(baseUrl, ++retry);
                }
                else {
                    console.error(e);
                    return;
                }
            }));
            const texts = await response.json();
            Aui.texts = texts;
            Aui.language = language;
        }
    }
    Aui.initLanguage = initLanguage;
    /**
     * 현재 언어코드를 가져온다.
     *
     * @return {string} language
     */
    function getLanguage() {
        return Html.get('html').getAttr('lang');
    }
    Aui.getLanguage = getLanguage;
    /**
     * 언어팩을 불러온다.
     *
     * @param {string} text - 언어팩코드
     * @param {Object} placeHolder - 치환자
     * @return {string|Object} message - 치환된 메시지
     */
    function getText(text, placeHolder = null) {
        const keys = text.split('.');
        let string = Aui.texts;
        keys.forEach((key) => {
            if (string === null || string[key] === undefined) {
                string = null;
                return false;
            }
            string = string[key];
        });
        if (string === null) {
            return text;
        }
        if (typeof string == 'string' && placeHolder !== null) {
            let text = string;
            const templets = [...text.matchAll(/\$\{(.*?)\}/g)];
            templets.forEach(([templet, key]) => {
                text = text.replace(templet, placeHolder[key] ?? '');
            });
            return text;
        }
        return string;
    }
    Aui.getText = getText;
    /**
     * 에러메시지를 불러온다.
     *
     * @param {string} error - 에러코드
     * @param {Object} placeHolder - 치환자
     * @return {string} message - 치환된 메시지
     */
    function getErrorText(error, placeHolder = null) {
        const string = Aui.getText('errors.' + error, placeHolder);
        if (typeof string !== 'string') {
            return error;
        }
        return string;
    }
    Aui.getErrorText = getErrorText;
    /**
     * 언어팩을 출력한다.
     * 언어팩이 문자열이 아닌 경우 JSON 형식으로 반환한다.
     *
     * @param {string} text - 언어팩코드
     * @param {Object} placeHolder - 치환자
     * @return {string|Object} message - 치환된 메시지
     */
    function printText(text, placeHolder = null) {
        const string = Aui.getText(text, placeHolder);
        if (typeof string === 'string') {
            return string;
        }
        else {
            return JSON.stringify(string);
        }
    }
    Aui.printText = printText;
    /**
     * Aui 처리가 준비되었을 때 이벤트리스너를 등록한다.
     *
     * @param {EventListener} listener - 이벤트리스너
     */
    function ready(listener) {
        this.readyListener.push(listener);
    }
    Aui.ready = ready;
    class Base {
        id;
        properties;
        dataValues = new Map();
        listeners = {};
        /**
         * 객체를 생성한다.
         *
         * @param {Aui.Base.Properties} properties - 객체설정
         */
        constructor(properties = null) {
            this.properties = properties ?? {};
            this.id = properties?.id ?? 'Aui-' + Aui.getIndex();
            if (this.properties.listeners !== undefined) {
                for (const name in this.properties.listeners) {
                    this.addEvent(name, this.properties.listeners[name]);
                }
            }
            Aui.set(this);
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
            Aui.remove(this.id);
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
    Aui.Base = Base;
})(Aui || (Aui = {}));
Html.ready(() => {
    Ajax.setErrorHandler(async (e) => {
        Aui.Message.show({
            icon: Aui.Message.ERROR,
            title: Aui.getErrorText('TITLE'),
            message: e?.message ?? Aui.getErrorText('CONNECT_ERROR'),
            buttons: Aui.Message.OK,
            closable: true,
        });
        console.log(e);
    });
    document.addEventListener('keydown', (e) => {
        const target = e.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
            return;
        }
        if (target instanceof HTMLElement && target.getAttribute('contenteditable') == 'true') {
            return;
        }
        if ((e.metaKey == true || e.ctrlKey == true) && e.key == 'a') {
            e.preventDefault();
        }
    });
});
