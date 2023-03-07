/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 드래그 이벤트를 감시할 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Drag.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 20.
 */
namespace Admin {
    export class Drag extends Admin.Base {
        static activeId: number = null;
        static pointers: Map<number, Admin.Drag.Tracker> = new Map();

        $target: Dom;
        pointerType: string[];

        /**
         * 드래그 클래스를 생성한다.
         *
         * @param {Dom} $target - 대상객체
         * @param {Object} properties - 객체설정
         */
        constructor($target: Dom, properties: { [key: string]: any } = null) {
            super(properties);

            this.$target = $target;
            this.pointerType = this.properties.pointerType ?? ['mouse'];

            this.$target.on('pointerdown', (e: PointerEvent) => {
                if (e.button != 0) return;
                if (this.pointerType.indexOf(e.pointerType) >= 0) {
                    const tracker = new Admin.Drag.Tracker(this, e);
                    Admin.Drag.pointers.set(e.pointerId, tracker);
                    this.onStart(tracker);
                }
                e.stopImmediatePropagation();
            });
        }

        /**
         * 현재 활성화되어 드래그중인 포인터가 있다면 가져온다.
         *
         * @return {Admin.Drag.Tracker} tracker - 포인터 트래커
         */
        static getActivePointer(): Admin.Drag.Tracker {
            if (Admin.Drag.activeId != null && Admin.Drag.pointers.has(Admin.Drag.activeId) == true) {
                return Admin.Drag.pointers.get(Admin.Drag.activeId);
            }
            return null;
        }

        /**
         * 드래그 시작시 이벤트를 처리한다.
         *
         * @param {Admin.Drag.Tracker} tracker - 포인터 트래커
         */
        onStart(tracker: Admin.Drag.Tracker): void {
            this.fireEvent('start', [tracker.parent.$target, tracker]);
        }

        /**
         * 드래그 중 이벤트를 처리한다.
         *
         * @param {Admin.Drag.Tracker} tracker - 포인터 트래커
         */
        onDrag(tracker: Admin.Drag.Tracker): void {
            this.fireEvent('drag', [tracker.parent.$target, tracker]);
        }

        /**
         * 드래그 종료시 이벤트를 처리한다.
         *
         * @param {Admin.Drag.Tracker} tracker - 포인터 트래커
         */
        onEnd(tracker: Admin.Drag.Tracker): void {
            Admin.Drag.pointers.delete(tracker.id);
            this.fireEvent('end', [tracker.parent.$target, tracker]);
        }
    }

    export namespace Drag {
        export class Tracker {
            readonly velocityMultiplier = window.devicePixelRatio * 5;

            id: number;
            parent: Admin.Drag;
            updateTime: number = Date.now();
            delta: { x: number; y: number } = { x: 0, y: 0 };
            velocity: { x: number; y: number } = { x: 0, y: 0 };
            firstPosition: { x: number; y: number } = { x: 0, y: 0 };
            lastPosition: { x: number; y: number } = { x: 0, y: 0 };

            /**
             * 포인터의 이동내역을 기록할 트래커 객체를 생성한다.
             *
             * @param {Admin.Drag} parent - 부모 드래그 객체
             * @param {PointerEvent} e - 포인터 이벤트
             */
            constructor(parent: Admin.Drag, e: PointerEvent) {
                this.parent = parent;
                this.id = e.pointerId;
                this.firstPosition = { x: e.clientX, y: e.clientY };
                this.lastPosition = this.firstPosition;
            }

            /**
             * 포인터 상태를 업데이트한다.
             *
             * @param {PointerEvent} e - 포인터 이벤트
             */
            update(e: PointerEvent) {
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

                this.parent.onDrag(this);
            }

            /**
             * 포인터 트래커를 종료한다.
             */
            release() {
                this.parent.onEnd(this);
            }

            /**
             * 부모 드래그 객체를 가져온다.
             *
             * @return {Admin.Drag} drag
             */
            getParent(): Admin.Drag {
                return this.parent;
            }

            /**
             * 포인터가 드래그 하고 있는 DOM 객체를 가져온다.
             *
             * @return {Dom} $target
             */
            getTarget(): Dom {
                return this.parent.$target;
            }

            /**
             * 드래그가 처음 시작된 좌표를 가져온다.
             *
             * @return {Object} firstPosition
             */
            getFirstPosition(): { x: number; y: number } {
                return this.firstPosition;
            }

            /**
             * 포인터의 현재(마지막) 좌표를 가져온다.
             *
             * @return {Object} lastPosition
             */
            getLastPosition(): { x: number; y: number } {
                return this.lastPosition;
            }

            /**
             * 드래그가 처음 시작된 위치로 부터 현재(마지막)까지의 거리를 가져온다.
             *
             * @return {Object} length
             */
            getLength(): { x: number; y: number } {
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
            getDelta(): { x: number; y: number } {
                return this.delta;
            }

            /**
             * 드래그가 종료되기 직전 포인터의 이동속도와 이동거리를 고려한 가속도를 가져온다.
             *
             * @return {Object} velocity
             */
            getVelocity(): { x: number; y: number } {
                return this.velocity;
            }
        }
    }
}

/**
 * HTML 문서 전역의 포인트 이벤트를 처리한다.
 */
Html.on('pointermove', (e: PointerEvent) => {
    Admin.Drag.activeId = e.pointerId;
    Admin.Drag.pointers.get(e.pointerId)?.update(e);
});

Html.on('pointerup', (e: PointerEvent) => {
    if (Admin.Drag.activeId == e.pointerId) {
        Admin.Drag.activeId = null;
    }
    Admin.Drag.pointers.get(e.pointerId)?.release();
});
