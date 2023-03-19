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
var Admin;
(function (Admin) {
    class Resizer extends Admin.Base {
        $target;
        $parent;
        $resizers;
        directions;
        minWidth = 0;
        maxWidth = 0;
        minHeight = 0;
        maxHeight = 0;
        /**
         * 크기조절 클래스를 생성한다.
         *
         * @param {Dom} $target - 크기를 조절할 DOM 객체
         * @param {Dom} $parent - 크기조절 대상의 부모
         * @param {Object} properties - 객체설정
         */
        constructor($target, $parent, properties = null) {
            super(properties);
            this.$target = $target;
            this.$parent = $parent;
            if (!(this.properties.directions instanceof Array) || this.properties.directions.length != 4) {
                this.properties.directions = [true, true, true, true];
            }
            this.minWidth = this.properties.minWidth ?? 0;
            this.maxWidth = this.properties.maxWidth ?? 0;
            this.minHeight = this.properties.minHeight ?? 0;
            this.maxHeight = this.properties.maxHeight ?? 0;
            this.$resizers = [];
            Html.get('div[data-role=resizer]', $target).remove();
            this.directions = {
                top: this.properties.directions[0],
                right: this.properties.directions[1],
                bottom: this.properties.directions[2],
                left: this.properties.directions[3],
                topRight: this.properties.directions[0] && this.properties.directions[1],
                topLeft: this.properties.directions[0] && this.properties.directions[3],
                bottomRight: this.properties.directions[2] && this.properties.directions[1],
                bottomLeft: this.properties.directions[2] && this.properties.directions[3],
            };
            for (const direction in this.directions) {
                if (this.directions[direction] == true) {
                    const $resizer = Html.create('div', {
                        'data-role': 'resizer',
                        'data-direction': direction,
                    });
                    $resizer.on('mouseenter', (e) => {
                        this.fireEvent('mouseenter', [Html.el(e.currentTarget)]);
                    });
                    $resizer.on('mouseleave', (e) => {
                        if (this.isActive() == false) {
                            this.fireEvent('mouseleave', [Html.el(e.currentTarget)]);
                        }
                    });
                    this.$resizers.push($resizer);
                }
            }
            this.$resizers.forEach(($resizer) => {
                new Admin.Drag($resizer, {
                    pointerType: ['mouse'],
                    listeners: {
                        start: ($resizer, tracker) => {
                            const direction = $resizer.getData('direction');
                            const rect = this.getResizeRect(direction, { x: null, y: null });
                            this.resetGuideline();
                            const $guide = this.setGuideline(rect);
                            this.$parent.append($guide);
                            this.$parent.on('scroll', this.onScroll.bind(this));
                            this.fireEvent('mouseenter', [$resizer]);
                            this.fireEvent('start', [this.$target, rect, tracker.getFirstPosition()]);
                        },
                        drag: ($resizer, tracker) => {
                            const direction = $resizer.getData('direction');
                            const rect = this.getResizeRect(direction, tracker.getLastPosition());
                            this.setGuideline(rect);
                            this.fireEvent('resize', [this.$target, rect, tracker.getLastPosition()]);
                        },
                        end: ($resizer, tracker) => {
                            const direction = $resizer.getData('direction');
                            const rect = this.getResizeRect(direction, tracker.getLastPosition());
                            Html.get('> div[data-role="resize-guide"]', this.$parent).remove();
                            this.$parent.off('scroll', this.onScroll.bind(this));
                            this.fireEvent('mouseleave', [$resizer]);
                            this.fireEvent('end', [this.$target, rect, tracker.getLastPosition()]);
                        },
                    },
                });
            });
            $target.append(this.$resizers);
        }
        /**
         * 최대너비를 설정한다.
         *
         * @param {number} maxWidth - 최대너비
         */
        setMaxWidth(maxWidth) {
            this.maxWidth = maxWidth ?? 0;
        }
        /**
         * 최대높이를 설정한다.
         *
         * @param {number} maxHeight - 최대높이
         */
        setMaxHeight(maxHeight) {
            this.maxHeight = maxHeight ?? 0;
        }
        /**
         * 리사이즈되는 DOM 의 Rect 를 가져온다.
         *
         * @param {string} direction - 리사이즈 방향
         * @param {Object} position - 마우스 포인트 위치
         * @return {Object} rect - 리사이즈되는 Rect
         */
        getResizeRect(direction, position) {
            const rect = this.$target.getEl().getBoundingClientRect();
            const guide = new DOMRect(rect.x, rect.y, rect.width, rect.height);
            let parentOffset = { left: 0, top: 0 };
            let parentScroll = { left: 0, top: 0 };
            if (this.$target.getStyle('position') !== 'fixed' && this.$target.getStyle('position') !== 'absolute') {
                parentOffset = this.$parent.getOffset();
                parentScroll = this.$parent.getScroll();
                guide.x = rect.x - parentOffset.left + parentScroll.left;
                guide.y = rect.y - parentOffset.top + parentScroll.top;
            }
            if (direction.indexOf('top') === 0) {
                if (position.y !== null) {
                    guide.height = Math.max(this.minHeight, rect.height + (rect.y - position.y));
                    if (this.maxHeight > 0 && guide.height > this.maxHeight) {
                        guide.height = this.maxHeight;
                    }
                    guide.y = rect.y + (rect.height - guide.height);
                }
            }
            else if (direction.indexOf('bottom') === 0) {
                if (position.y !== null) {
                    guide.height = Math.max(this.minHeight, position.y - rect.y);
                    if (this.maxHeight > 0 && guide.height > this.maxHeight) {
                        guide.height = this.maxHeight;
                    }
                }
            }
            switch (direction) {
                case 'left':
                case 'topLeft':
                case 'bottomLeft':
                    if (position.x !== null) {
                        guide.width = Math.max(this.minWidth, rect.width + (rect.x - position.x));
                        if (this.maxWidth > 0 && guide.width > this.maxWidth) {
                            guide.width = this.maxWidth;
                        }
                        guide.x = rect.x + (rect.width - guide.width);
                    }
                    break;
                case 'right':
                case 'topRight':
                case 'bottomRight':
                    if (position.x !== null) {
                        guide.width = Math.max(this.minWidth, position.x - rect.x);
                        if (this.maxWidth > 0 && guide.width > this.maxWidth) {
                            guide.width = this.maxWidth;
                        }
                    }
                    break;
            }
            return guide;
        }
        /**
         * 모든 가이드라인을 그린다.
         *
         * @param {DOMRect} rect - 가이드라인 기준 Rect
         */
        setGuideline(rect) {
            const $guide = Html.get('> div[data-role="resize-guide"]', this.$parent).getEl() != null
                ? Html.get('> div[data-role="resize-guide"]', this.$parent)
                : Html.create('div', { 'data-role': 'resize-guide' });
            $guide.setStyle('top', rect.y + 'px');
            $guide.setStyle('left', rect.x + 'px');
            if (this.directions.left == true || this.directions.right == true) {
                $guide.setStyle('width', rect.width + 'px');
            }
            if (this.directions.top == true || this.directions.bottom == true) {
                $guide.setStyle('height', rect.height + 'px');
            }
            return $guide;
        }
        /**
         * 모든 가이드라인을 초기화한다.
         */
        resetGuideline() {
            Html.get('div[data-role="resize-guide"]').remove();
        }
        /**
         * 리사이즈 도중 부모객체에 스크롤이 발생될 때 이벤트를 처리한다.
         */
        onScroll() {
            if (this.isActive() == true) {
                const tracker = Admin.Drag.getActivePointer();
                tracker.getParent().onDrag(tracker, tracker.e);
            }
        }
        /**
         * 리사이즈가 활성화된 상태인지 가져온다.
         *
         * @return {boolean} is_active
         */
        isActive() {
            return Admin.Drag.getActivePointer()?.getTarget()?.is('div[data-role=resizer]') == true;
        }
    }
    Admin.Resizer = Resizer;
})(Admin || (Admin = {}));
