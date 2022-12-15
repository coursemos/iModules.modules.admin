/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 드래그 이벤트를 감시할 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Drag.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 15.
 */
namespace Admin {
    export class Drag extends Admin.Base {
        static current: Admin.Drag = null;

        start: { x: number; y: number } = { x: null, y: null };
        position: { x: number; y: number } = { x: null, y: null };
        listener: Admin.Base;
        $target: Dom;

        /**
         * 드래그 클래스를 생성한다.
         *
         * @param {Admin.Base} listener - 드래그 이벤트를 수신할 객체
         * @param {Dom} $target - 감시할 객체
         */
        constructor(listener: Admin.Base, $target: Dom) {
            super();

            this.listener = listener;
            this.$target = $target;

            this.$target.on('mousedown', (e: MouseEvent) => {
                if (e.button == 0) {
                    if (Admin.Drag.current != null) {
                        Admin.Drag.current.onDragEnd(e);
                    }

                    this.onDragStart(e);
                }
            });
        }

        /**
         * 마우스 드래그가 시작되었을 때 이벤트를 처리한다.
         *
         * @param {MouseEvent} e - 마우스이벤트
         */
        onDragStart(e: MouseEvent): void {
            Admin.Drag.current = this;

            this.start = { x: e.clientX, y: e.clientY };
            this.position = this.start;

            this.fireEvent('start', [this.$target, this.start]);
        }

        /**
         * 마우스 드래그시 이벤트를 처리한다.
         *
         * @param {MouseEvent} e - 마우스이벤트
         */
        onDrag(e: MouseEvent): void {
            this.position = { x: e.clientX, y: e.clientY };

            this.fireEvent('drag', [this.$target, this.start, this.position]);
        }

        /**
         * 마우스 드래그가 종료되었을 때 이벤트를 처리한다.
         *
         * @param {MouseEvent} e - 마우스이벤트
         */
        onDragEnd(e: MouseEvent): void {
            Admin.Drag.current = null;

            this.position = { x: e.clientX, y: e.clientY };

            this.fireEvent('end', [this.$target, this.start, this.position]);
        }

        /**
         * 드래그가 되는 HTML 엘리먼트에 이벤트를 추가한다.
         *
         * @param {string} name - 추가할 이벤트명
         * @param {EventListener} listener - 이벤트리스너
         * @return {Admin.Resizer} this
         */
        on(name: string, listener: EventListener): this {
            this.$target.on(name, listener);
            return this;
        }

        /**
         * 드래그가 되는 HTML 엘리먼트에 마우스 HOVER 이벤트를 추가한다.
         *
         * @param {EventListener} mouseenter - 마우스 OVER 시 이벤트리스너
         * @param {EventListener} mouseleave - 마우스 LEAVE 시 이벤트리스너
         * @return {Admin.Resizer} this
         */
        hover(mouseenter: EventListener, mouseleave: EventListener): this {
            this.$target.hover(mouseenter, mouseleave);
            return this;
        }
    }
}

/**
 * HTML 문서 전역의 마우스 이벤트를 처리한다.
 */
Html.on('mousemove', (e: MouseEvent) => {
    if (Admin.Drag.current != null) {
        Admin.Drag.current.onDrag(e);
    }
});

Html.on('mouseup', (e: MouseEvent) => {
    if (Admin.Drag.current != null) {
        Admin.Drag.current.onDragEnd(e);
    }
});
