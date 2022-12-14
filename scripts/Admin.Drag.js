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
var Admin;
(function (Admin) {
    class Drag {
        static current = null;
        start = { x: null, y: null };
        position = { x: null, y: null };
        listener;
        $target;
        /**
         * 드래그 클래스를 생성한다.
         *
         * @param {Admin.Base} listener - 드래그 이벤트를 수신할 객체
         * @param {Dom} $target - 감시할 객체
         */
        constructor(listener, $target) {
            this.listener = listener;
            this.$target = $target;
            this.$target.on('mousedown', (e) => {
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
        onDragStart(e) {
            Admin.Drag.current = this;
            this.start = { x: e.clientX, y: e.clientY };
            this.position = this.start;
            if (typeof this.listener['onDragStart'] == 'function') {
                this.listener['onDragStart'](this.$target, this.start);
            }
        }
        /**
         * 마우스 드래그시 이벤트를 처리한다.
         *
         * @param {MouseEvent} e - 마우스이벤트
         */
        onDrag(e) {
            this.position = { x: e.clientX, y: e.clientY };
            if (typeof this.listener['onDrag'] == 'function') {
                this.listener['onDrag'](this.$target, this.start, this.position);
            }
        }
        /**
         * 마우스 드래그가 종료되었을 때 이벤트를 처리한다.
         *
         * @param {MouseEvent} e - 마우스이벤트
         */
        onDragEnd(e) {
            Admin.Drag.current = null;
            this.position = { x: e.clientX, y: e.clientY };
            if (typeof this.listener['onDragEnd'] == 'function') {
                this.listener['onDragEnd'](this.$target, this.start, this.position);
            }
        }
    }
    Admin.Drag = Drag;
})(Admin || (Admin = {}));
/**
 * HTML 문서 전역의 마우스 이벤트를 처리한다.
 */
Html.on('mousemove', (e) => {
    if (Admin.Drag.current != null) {
        Admin.Drag.current.onDrag(e);
    }
});
Html.on('mouseup', (e) => {
    if (Admin.Drag.current != null) {
        Admin.Drag.current.onDragEnd(e);
    }
});
