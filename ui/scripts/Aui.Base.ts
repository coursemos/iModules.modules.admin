/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * Aui 공통 메소드 및 Aui 객체 공통 클래스를 정의한다.
 *
 * @file /scripts/Aui.Base.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 8. 29.
 */
namespace Aui {
    export const items: Map<string, Aui.Base> = new Map();
    export let index: number = 0;
    export let currentComponent: Aui.Component = null;
    export let language: string = null;
    export let texts: Map<string, { [key: string]: string | object }> = new Map();
    export let readyListeners: Function[] = [];

    /**
     * 객체를 등록한다.
     *
     * @param {Aui.Base} item - 객체
     */
    export function set(item: Aui.Base): void {
        if (Aui.items.has(item.id) == true) {
            console.error('[DUPLICATED ID]', item.id, item);
            return;
        }
        Aui.items.set(item.id, item);
    }

    /**
     * 객체를 가져온다.
     *
     * @param {string} id - 가져올 객체 고유값
     * @return {Aui.Base} item - 객체클래스
     */
    export function get(id: string): Aui.Base {
        return Aui.items.has(id) == true ? Aui.items.get(id) : null;
    }

    /**
     * 객체가 존재하는지 확인한다..
     *
     * @param {string} id - 확인할 객체 고유값
     * @return {boolean} has
     */
    export function has(id: string): boolean {
        return Aui.items.has(id);
    }

    /**
     * 컴포넌트를 가져온다.
     *
     * @param {string} id - 가져올 컴포넌트 고유값
     * @return {Aui.Component} item - 컴포넌트클래스
     */
    export function getComponent(id: string): Aui.Component {
        return Aui.items.has(id) == true && Aui.items.get(id) instanceof Aui.Component
            ? (Aui.items.get(id) as Aui.Component)
            : null;
    }

    /**
     * 객체를 제거한다.
     *
     * @param {string} id - 제거할 객체 고유값
     */
    export function remove(id: string): void {
        Aui.items.delete(id);
    }

    /**
     * 컴포넌트 일련번호를 가져온다.
     *
     * @return {number} index - 일련번호
     */
    export function getIndex(): number {
        return ++Aui.index;
    }

    /**
     * 절대위치를 가지는 객체의 기준 DOM 을 가져온다.
     *
     * @return {Dom} $absolute
     */
    export let $absolute: Dom;
    export function $getAbsolute(): Dom {
        if (Aui.$absolute !== undefined) {
            return Aui.$absolute;
        }

        if (Html.get('section[data-role=admin][data-type=absolute]', Html.get('body')).getEl() == null) {
            Aui.$absolute = Html.create('section', { 'data-role': 'admin', 'data-type': 'absolute' });
            Html.get('body').append(Aui.$absolute);
        } else {
            Aui.$absolute = Html.get('section[data-role=admin][data-type=absolute]', Html.get('body'));
        }

        return Aui.$absolute;
    }

    /**
     * 절대위치를 가지는 객체의 Z-INDEX 를 가져온다.
     *
     * @returns {number} zIndex
     */
    export function getAbsoluteIndex(): number {
        return new Date().getTime() - 1724900000000;
    }

    export async function initLanguage(baseUrl: string, retry: number = 0): Promise<void> {
        const language = Aui.getLanguage();

        if (Aui.language !== language) {
            const response: Response = (await fetch(baseUrl + '/languages/' + language + '.json', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }).catch(async (e) => {
                if (retry <= 3) {
                    return Aui.initLanguage(baseUrl, ++retry);
                } else {
                    console.error(e);
                    return;
                }
            })) as Response;

            const texts = await response.json();

            Aui.texts = texts;
            Aui.language = language;
        }
    }

    /**
     * 현재 언어코드를 가져온다.
     *
     * @return {string} language
     */
    export function getLanguage(): string {
        return Html.get('html').getAttr('lang');
    }

    /**
     * 언어팩을 불러온다.
     *
     * @param {string} text - 언어팩코드
     * @param {Object} placeHolder - 치환자
     * @return {string|Object} message - 치환된 메시지
     */
    export function getText(text: string, placeHolder: { [key: string]: string } = null): string | object {
        const keys: string[] = text.split('.');

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
            let text: string = string as string;
            const templets = [...text.matchAll(/\$\{(.*?)\}/g)];
            templets.forEach(([templet, key]) => {
                text = text.replace(templet, placeHolder[key] ?? '');
            });
            return text;
        }

        return string;
    }

    /**
     * 에러메시지를 불러온다.
     *
     * @param {string} error - 에러코드
     * @param {Object} placeHolder - 치환자
     * @return {string} message - 치환된 메시지
     */
    export function getErrorText(error: string, placeHolder: { [key: string]: string } = null): string {
        const string = Aui.getText('errors.' + error, placeHolder);
        if (typeof string !== 'string') {
            return error;
        }
        return string;
    }

    /**
     * 언어팩을 출력한다.
     * 언어팩이 문자열이 아닌 경우 JSON 형식으로 반환한다.
     *
     * @param {string} text - 언어팩코드
     * @param {Object} placeHolder - 치환자
     * @return {string|Object} message - 치환된 메시지
     */
    export function printText(text: string, placeHolder: { [key: string]: string } = null): string {
        const string = Aui.getText(text, placeHolder);
        if (typeof string === 'string') {
            return string;
        } else {
            return JSON.stringify(string);
        }
    }

    /**
     * Aui 처리가 준비되었을 때 이벤트리스너를 등록한다.
     *
     * @param {EventListener} listener - 이벤트리스너
     */
    export function ready(listener: Function): void {
        this.readyListeners.push(listener);
    }

    /**
     * Aui 객체의 공통 클래스를 정의한다.
     */
    export namespace Base {
        export interface Listeners {
            [event: string]: Function;
        }

        export interface Properties {
            /**
             * @type {string} id - 객체 고유값
             */
            id?: string;

            /**
             * @type {Aui.Base.Listeners} listeners - 이벤트리스너
             */
            listeners?: Aui.Base.Listeners;
            [key: string]: any;
        }
    }

    export class Base {
        id: string;
        properties: Aui.Base.Properties;
        dataValues: Map<string, any> = new Map();
        listeners: { [event: string]: Function[] } = {};

        /**
         * 객체를 생성한다.
         *
         * @param {Aui.Base.Properties} properties - 객체설정
         */
        constructor(properties: Aui.Base.Properties = null) {
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
        getId(): string {
            return this.id;
        }

        /**
         * 객체에 데이터값을 저장한다.
         *
         * @param {string} key - 저장할 데이터키
         * @param {any} value - 데이터
         */
        setData(key: string, value: any): void {
            this.dataValues.set(key, value);
        }

        /**
         * 데이터를 가져온다.
         *
         * @param {string} key - 가져올 데이터키
         * @return {any} value - 데이터
         */
        getData(key: string): any {
            return this.dataValues.get(key) ?? null;
        }

        /**
         * 객체를 제거한다.
         */
        remove(): void {
            Aui.remove(this.id);
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

Html.ready(() => {
    Ajax.setErrorHandler(async (e) => {
        Aui.Message.show({
            icon: Aui.Message.ERROR,
            title: Aui.getErrorText('TITLE'),
            message: e?.message ?? Aui.getErrorText('CONNECT_ERROR'),
            buttons: Aui.Message.OK,
            closable: true,
        });
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
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
