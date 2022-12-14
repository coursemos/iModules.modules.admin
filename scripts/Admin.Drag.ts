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
    export class Drag {
        static current: Admin.Drag = null;

        start: { x: number; y: number } = { x: null, y: null };
        listener: Admin.Base;
        $target: Dom;

        /**
         * 드래그 클래스를 생성한다.
         *
         * @param {Admin.Base} listener - 드래그 이벤트를 수신할 객체
         * @param {Dom} $target - 감시할 객체
         */
        constructor(listener: Admin.Base, $target: Dom) {
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
            this.start.x = e.clientX;
            this.start.y = e.clientY;

            Admin.Drag.current = this;
            if (typeof this.listener['onDragStart'] == 'function') {
                this.listener['onDragStart'](this.$target, this.start);
            }
        }

        /**
         * 마우스 드래그시 이벤트를 처리한다.
         *
         * @param {MouseEvent} e - 마우스이벤트
         */
        onDrag(e: MouseEvent): void {
            const current = { x: e.clientX, y: e.clientY };
            if (typeof this.listener['onDrag'] == 'function') {
                this.listener['onDrag'](this.$target, this.start, current);
            }
        }

        /**
         * 마우스 드래그가 종료되었을 때 이벤트를 처리한다.
         *
         * @param {MouseEvent} e - 마우스이벤트
         */
        onDragEnd(e: MouseEvent): void {
            const current = { x: e.clientX, y: e.clientY };
            Admin.Drag.current = null;
            if (typeof this.listener['onDragEnd'] == 'function') {
                this.listener['onDragEnd'](this.$target, this.start, current);
            }
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
