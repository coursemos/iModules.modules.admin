/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 드래그 이벤트를 감시할 클래스를 정의한다.
 *
 * @file /scripts/Aui.Drag.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
var Aui;
(function (Aui) {
    class Drag extends Aui.Base {
        static activeId = null;
        static pointers = new Map();
        $target;
        pointerType;
        /**
         * 드래그 클래스를 생성한다.
         *
         * @param {Dom} $target - 대상객체
         * @param {Object} properties - 객체설정
         */
        constructor($target, properties = null) {
            super(properties);
            this.$target = $target;
            this.pointerType = this.properties.pointerType ?? ['mouse'];
            this.$target.on('pointerdown', (e) => {
                if (e.button != 0)
                    return;
                if (this.pointerType.indexOf(e.pointerType) >= 0) {
                    const tracker = new Aui.Drag.Tracker(this, e);
                    Aui.Drag.pointers.set(e.pointerId, tracker);
                    this.onStart(tracker, e);
                }
            });
        }
        /**
         * 현재 활성화되어 드래그중인 포인터가 있다면 가져온다.
         *
         * @return {Aui.Drag.Tracker} tracker - 포인터 트래커
         */
        static getActivePointer() {
            if (Aui.Drag.activeId != null && Aui.Drag.pointers.has(Aui.Drag.activeId) == true) {
                return Aui.Drag.pointers.get(Aui.Drag.activeId);
            }
            return null;
        }
        /**
         * 드래그 시작시 이벤트를 처리한다.
         *
         * @param {Aui.Drag.Tracker} tracker - 포인터 트래커
         * @param {PointerEvent} e - 포인터 이벤트
         */
        onStart(tracker, e) {
            this.fireEvent('start', [tracker.parent.$target, tracker, e]);
        }
        /**
         * 드래그 중 이벤트를 처리한다.
         *
         * @param {Aui.Drag.Tracker} tracker - 포인터 트래커
         * @param {PointerEvent} e - 포인터 이벤트
         */
        onDrag(tracker, e) {
            this.fireEvent('drag', [tracker.parent.$target, tracker, e]);
        }
        /**
         * 드래그 종료시 이벤트를 처리한다.
         *
         * @param {Aui.Drag.Tracker} tracker - 포인터 트래커
         * @param {PointerEvent} e - 포인터 이벤트
         */
        onEnd(tracker, e) {
            Aui.Drag.pointers.delete(tracker.id);
            this.fireEvent('end', [tracker.parent.$target, tracker, e]);
        }
    }
    Aui.Drag = Drag;
    (function (Drag) {
        class Tracker {
            velocityMultiplier = window.devicePixelRatio * 5;
            id;
            parent;
            updateTime = Date.now();
            delta = { x: 0, y: 0 };
            velocity = { x: 0, y: 0 };
            firstPosition = { x: 0, y: 0 };
            lastPosition = { x: 0, y: 0 };
            e;
            /**
             * 포인터의 이동내역을 기록할 트래커 객체를 생성한다.
             *
             * @param {Aui.Drag} parent - 부모 드래그 객체
             * @param {PointerEvent} e - 포인터 이벤트
             */
            constructor(parent, e) {
                this.parent = parent;
                this.id = e.pointerId;
                this.firstPosition = { x: e.clientX, y: e.clientY };
                this.lastPosition = this.firstPosition;
                this.e = e;
            }
            /**
             * 포인터 상태를 업데이트한다.
             *
             * @param {PointerEvent} e - 포인터 이벤트
             */
            update(e) {
                const now = Date.now();
                const position = { x: e.clientX, y: e.clientY };
                const delta = {
                    x: position.x - this.lastPosition.x,
                    y: position.y - this.lastPosition.y,
                };
                const duration = now - this.updateTime || 16.7;
                const vx = (delta.x / duration) * 16.7;
                const vy = (delta.y / duration) * 16.7;
                this.velocity.x = vx * this.velocityMultiplier;
                this.velocity.y = vy * this.velocityMultiplier;
                this.delta = delta;
                this.updateTime = now;
                this.lastPosition = position;
                this.parent.onDrag(this, e);
            }
            /**
             * 포인터 트래커를 종료한다.
             */
            release(e) {
                this.parent.onEnd(this, e);
            }
            /**
             * 부모 드래그 객체를 가져온다.
             *
             * @return {Aui.Drag} drag
             */
            getParent() {
                return this.parent;
            }
            /**
             * 포인터가 드래그 하고 있는 DOM 객체를 가져온다.
             *
             * @return {Dom} $target
             */
            getTarget() {
                return this.parent.$target;
            }
            /**
             * 드래그가 처음 시작된 좌표를 가져온다.
             *
             * @return {Object} firstPosition
             */
            getFirstPosition() {
                return this.firstPosition;
            }
            /**
             * 포인터의 현재(마지막) 좌표를 가져온다.
             *
             * @return {Object} lastPosition
             */
            getLastPosition() {
                return this.lastPosition;
            }
            /**
             * 드래그가 처음 시작된 위치로 부터 현재(마지막)까지의 거리를 가져온다.
             *
             * @return {Object} length
             */
            getLength() {
                return {
                    x: this.lastPosition.x - this.firstPosition.x,
                    y: this.lastPosition.y - this.firstPosition.y,
                };
            }
            /**
             * 직전 포인터 위치로 부터 현재(마지막)까지의 거리를 가져온다.
             *
             * @return {Object} delta
             */
            getDelta() {
                return this.delta;
            }
            /**
             * 드래그가 종료되기 직전 포인터의 이동속도와 이동거리를 고려한 가속도를 가져온다.
             *
             * @return {Object} velocity
             */
            getVelocity() {
                return this.velocity;
            }
        }
        Drag.Tracker = Tracker;
    })(Drag = Aui.Drag || (Aui.Drag = {}));
})(Aui || (Aui = {}));
/**
 * HTML 문서 전역의 포인트 이벤트를 처리한다.
 */
Html.on('pointermove', (e) => {
    Aui.Drag.activeId = e.pointerId;
    Aui.Drag.pointers.get(e.pointerId)?.update(e);
}, { passive: true });
Html.on('pointerup', (e) => {
    if (Aui.Drag.activeId == e.pointerId) {
        Aui.Drag.activeId = null;
    }
    Aui.Drag.pointers.get(e.pointerId)?.release(e);
}, { passive: true });
Html.on('pointercancel', (e) => {
    if (Aui.Drag.activeId == e.pointerId) {
        Aui.Drag.activeId = null;
    }
    Aui.Drag.pointers.get(e.pointerId)?.release(e);
}, { passive: true });
