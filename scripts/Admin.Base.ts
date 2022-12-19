/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈에서 사용되는 컴포넌트의 공통 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Base.js
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 16.
 */
namespace Admin {
    export let items: Map<string, Admin.Base> = new Map();
    export let index: number = 0;
    export let currentComponent: Admin.Component = null;

    /**
     * 객체를 등록한다.
     *
     * @param {Admin.Base} item - 객체
     */
    export function set(item: Admin.Base): void {
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
     * 관리자 UI 처리가 준비되었을 때 이벤트리스너를 등록한다.
     *
     * @param {EventListener} listener - 이벤트리스너
     */
    export function ready(listener: EventListener): void {
        Html.ready(listener);
    }

    export class Base {
        id: string;
        properties: { [key: string]: any };
        listeners: { [key: string]: { listener: Function; params: any[] }[] } = {};

        /**
         * 객체를 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties: { [key: string]: any } = null) {
            this.properties = properties ?? {};
            this.id = properties?.id ?? 'Admin-' + Admin.getIndex();
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
         * @param {any[]} params - 이벤트리스너에 전달될 데이터
         */
        addEvent(name: string, listener: Function, params: any[] = []): void {
            if (this.listeners[name] == undefined) {
                this.listeners[name] = [];
            }

            this.listeners[name].push({ listener: listener, params: params });
        }

        /**
         * 이벤트를 발생시킨다.
         *
         * @param {string} name - 이벤트명
         * @param {any[]} params - 이벤트리스너에 전달될 데이터
         */
        fireEvent(name: string, params: any[] = []): void {
            if (this.listeners[name] !== undefined) {
                for (let listener of this.listeners[name]) {
                    listener.listener(...params, ...listener.params);
                }
            }
        }
    }
}

Html.on('click', (e: MouseEvent) => {
    if (e.target instanceof HTMLElement) {
        const $target = Html.el(e.target);
        const $component = $target.getParents('div[data-component]');
        if ($component == null) {
            Admin.currentComponent = null;
        } else {
            Admin.currentComponent = Admin.get($component.getData('component')) as Admin.Component;
        }
    }
});

Html.on('keydown', (e: KeyboardEvent) => {
    if (Admin.currentComponent !== null && typeof Admin.currentComponent['onKeydown'] == 'function') {
        Admin.currentComponent['onKeydown'](e);
    }
});

Html.on('copy', (e: ClipboardEvent) => {
    if (Admin.currentComponent !== null && typeof Admin.currentComponent['onCopy'] == 'function') {
        Admin.currentComponent['onCopy'](e);
    }
});
