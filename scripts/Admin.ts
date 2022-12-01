/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈 UI 를 처리하기 위한 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 1.
 */
namespace Admin {
    export let components: { [key: string]: Admin.Base } = {};
    export let index: number = 0;

    /**
     * 컴포넌트를 등록한다.
     *
     * @param {Admin.Base} component - 컴포넌트 객체
     */
    export function set(component: Admin.Base): void {
        this.components[component.id] = component;
    }

    /**
     * 컴포넌트를 가져온다.
     *
     * @param {string} id - 가져올 컴포넌트 고유값
     * @return {Admin.Base} component - 컴포넌트
     */
    export function get(id: string): Admin.Base {
        return this.components[id];
    }

    /**
     * 컴포넌트 일련번호를 가져온다.
     *
     * @return {number} index - 일련번호
     */
    export function getIndex(): number {
        return ++this.index;
    }

    /**
     * 관리자 UI 처리가 준비되었을 때 이벤트리스너를 등록한다.
     *
     * @param {EventListener} listener - 이벤트리스너
     */
    export function ready(listener: EventListener): void {
        Html.ready(listener);
    }
}
