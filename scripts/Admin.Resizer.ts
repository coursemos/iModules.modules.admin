/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 마우스 드래그를 통해 객체 크기조절 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Drag.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 7.
 */
namespace Admin {
    export class Resizer extends Admin.Base {
        $target: Dom;
        $parent: Dom;
        $resizers: Dom[];
        parentOffset: { top: number; left: number };

        directions: {
            top: boolean;
            right: boolean;
            bottom: boolean;
            left: boolean;
            topLeft: boolean;
            topRight: boolean;
            bottomLeft: boolean;
            bottomRight: boolean;
        };

        minWidth: number = 0;
        maxWidth: number = 0;
        minHeight: number = 0;
        maxHeight: number = 0;

        /**
         * 크기조절 클래스를 생성한다.
         *
         * @param {Dom} $target - 크기를 조절할 DOM 객체
         * @param {Dom} $parent - 크기조절 대상의 부모
         * @param {Array} directions - 크기조절 방향 [top, right, bottom, left]
         */
        constructor($target: Dom, $parent: Dom, directions: [boolean, boolean, boolean, boolean]) {
            super();

            this.$target = $target;
            this.$parent = $parent;
            this.parentOffset = $parent.getOffset();
            this.$resizers = [];
            Html.get('div[data-role=resizer]', $target).remove();

            this.directions = {
                top: directions[0],
                right: directions[1],
                bottom: directions[2],
                left: directions[3],
                topRight: directions[0] == true && directions[1],
                topLeft: directions[0] == true && directions[3],
                bottomRight: directions[2] == true && directions[1],
                bottomLeft: directions[2] == true && directions[3],
            };

            for (const direction in this.directions) {
                if (this.directions[direction] == true) {
                    this.$resizers.push(
                        Html.create('div', {
                            'data-role': 'resizer',
                            'data-direction': direction,
                        })
                    );
                }
            }

            this.$resizers.forEach(($resizer: Dom) => {
                new Admin.Drag(this, $resizer);
            });

            $target.append(this.$resizers);
        }

        /**
         * 최소너비를 지정한다.
         *
         * @param {number} width - 최소너비
         * @return {Admin.Resizer} this
         */
        setMinWidth(width: number): this {
            this.minWidth = width;
            return this;
        }

        /**
         * 최대너비를 지정한다.
         *
         * @param {number} width - 최대너비
         * @return {Admin.Resizer} this
         */
        setMaxWidth(width: number): this {
            this.maxWidth = width;
            return this;
        }

        /**
         * 최소높이를 지정한다.
         *
         * @param {number} height - 최소높이
         * @return {Admin.Resizer} this
         */
        setMinHeight(height: number): this {
            this.minHeight = height;
            return this;
        }

        /**
         * 최대높이를 지정한다.
         *
         * @param {number} height - 최대높이
         * @return {Admin.Resizer} this
         */
        setMaxHeight(height: number): this {
            this.maxHeight = height;
            return this;
        }

        /**
         * 리사이즈되는 DOM 의 Rect 를 가져온다.
         *
         * @param {string} direction - 리사이즈 방향
         * @param {Object} position - 마우스 포인트 위치
         * @return {Object} rect - 리사이즈되는 Rect
         */
        getResizeRect(direction: string, position: { x: number; y: number }): DOMRect {
            const rect = this.$target.getEl().getBoundingClientRect();

            switch (direction) {
                case 'right':
                case 'topRight':
                case 'bottomRight':
                    rect.y = rect.y + this.$parent.getScroll().top;
                    if (position.x != null) {
                        rect.width = Math.max(this.minWidth, position.x - rect.x + this.$parent.getScroll().left);
                    }
                    break;
            }

            return rect;
        }

        /**
         * 리사이즈가 시작될 때 이벤트를 처리한다.
         *
         * @param {Dom} $resizer - 리사이저객체
         * @param {Object} start - 시작위치
         */
        onDragStart($resizer: Dom, start: { x: number; y: number }): void {
            const direction = $resizer.getData('direction');
            const rect = this.getResizeRect(direction, { x: null, y: null });

            Html.get('> div[data-role="resize-guide"]', this.$parent).remove();
            const $guide = Html.create('div', { 'data-role': 'resize-guide' });

            if (this.directions.left == true || this.directions.right == true) {
                $guide.setStyle('width', rect.width + 'px');
                $guide.setStyle('left', rect.x - this.parentOffset.left + 'px');
            }

            if (this.directions.top == true || this.directions.bottom == true) {
                $guide.setStyle('height', rect.width + 'px');
            }

            this.$parent.append($guide);

            if (this.directions) this.fireEvent('start', [this.$target, rect, start]);
        }

        /**
         * 리사이즈중일 때 이벤트를 처리한다.
         *
         * @param {Dom} $resizer - 리사이저객체
         * @param {Object} start - 드래그 시작위치
         * @param {Object} current - 드래그 현재위치
         */
        onDrag($resizer: Dom, start: { x: number; y: number }, current: { x: number; y: number }): void {
            const direction = $resizer.getData('direction');
            const rect = this.getResizeRect(direction, current);

            const $guide = Html.get('> div[data-role="resize-guide"]', this.$parent);
            if (this.directions.left == true || this.directions.right == true) {
                $guide.setStyle('width', rect.width + 'px');
                $guide.setStyle('left', rect.x - this.parentOffset.left + 'px');
            }

            if (this.directions.top == true || this.directions.bottom == true) {
                $guide.setStyle('height', rect.width + 'px');
            }

            this.fireEvent('resize', [this.$target, rect, current]);
        }

        /**
         * 리사이즈가 완료되었을 때 이벤트를 처리한다.
         *
         * @param {Dom} $resizer - 리사이저객체
         * @param {Object} start - 드래그 시작위치
         * @param {Object} current - 드래그 현재위치
         */
        onDragEnd($resizer: Dom, start: { x: number; y: number }, current: { x: number; y: number }): void {
            const direction = $resizer.getData('direction');
            const rect = this.getResizeRect(direction, current);

            Html.get('> div[data-role="resize-guide"]', this.$parent).remove();

            this.fireEvent('end', [this.$target, rect, current]);
        }

        /**
         * 리사이저 HTML 엘리먼트에 이벤트를 추가한다.
         *
         * @param {string} name - 추가할 이벤트명
         * @param {EventListener} listener - 이벤트리스너
         * @return {Admin.Resizer} this
         */
        on(name: string, listener: EventListener): this {
            this.$resizers.forEach(($resizer: Dom) => {
                $resizer.on(name, listener);
            });
            return this;
        }

        /**
         * 리사이저 HTML 엘리먼트에 마우스 HOVER 이벤트를 추가한다.
         *
         * @param {EventListener} mouseenter - 마우스 OVER 시 이벤트리스너
         * @param {EventListener} mouseleave - 마우스 LEAVE 시 이벤트리스너
         * @return {Admin.Resizer} this
         */
        hover(mouseenter: EventListener, mouseleave: EventListener): this {
            this.$resizers.forEach(($resizer: Dom) => {
                $resizer.hover(mouseenter, mouseleave);
            });
            return this;
        }
    }
}
