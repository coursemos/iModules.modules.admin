/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 스크롤바 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Scrollbar.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 15.
 */
namespace Admin {
    export class Scrollbar extends Admin.Base {
        static scrollbars: Map<HTMLElement, Admin.Scrollbar> = new Map();

        $component: Dom;
        $target: Dom;
        scrollable: { x: boolean; y: boolean } = { x: false, y: false };

        $scrollbar: { x: Dom; y: Dom } = { x: null, y: null };
        rendered: boolean;
        momentum: { x: number; y: number } = { x: 0, y: 0 };
        autoScroll: { x: number; y: number } = { x: 0, y: 0 };

        drag: { x: Admin.Drag; y: Admin.Drag } = { x: null, y: null };

        /**
         * 스크롤바 클래스를 생성한다.
         *
         * @param {Dom} $target - 스크롤할 대상의 DOM 객체
         * @param {boolean|string} scrollable - 스크롤 여부
         */
        constructor($target: Dom, scrollable: boolean | string = false) {
            super();

            this.$target = $target;
            this.$component = $target.getParents('div[data-component]');

            if (scrollable === false) {
                this.scrollable.x = false;
                this.scrollable.y = false;
            } else {
                this.scrollable.x = scrollable == true || scrollable.toLowerCase() == 'x';
                this.scrollable.y = scrollable == true || scrollable.toLowerCase() == 'y';
            }

            Admin.Scrollbar.scrollbars.set(this.$target.getEl(), this);
        }

        /**
         * 스크롤바 이벤트 대상의 스크롤바 클래스 객체를 가져온다.
         *
         * @param {EventTarget|HTMLElement} target - 이벤트 대상
         * @return {Admin.Scrollbar} scrollbar
         */
        static get(target: EventTarget | HTMLElement): Admin.Scrollbar {
            if (target instanceof HTMLElement) {
                return Admin.Scrollbar.scrollbars.has(target) == true ? Admin.Scrollbar.scrollbars.get(target) : null;
            } else {
                return null;
            }
        }

        /**
         * 스크롤바 트랙이 위치할 기준 좌표를 설정한다.
         *
         * @param {('x'|'y')} direction - 설정할 스크롤축
         * @param {number} position - 좌표
         */
        setTrackPosition(direction: 'x' | 'y', position: number): void {
            const $scrollbar = this.$getScrollbar(direction);
            if (direction == 'x') {
                $scrollbar.setStyle('padding-left', position + 'px');
            } else {
                $scrollbar.setStyle('padding-top', position + 'px');
            }
        }

        /**
         * 스크롤 가능여부를 설정한다.
         *
         * @param {(boolean|string)} scrollable - 스크롤 가능여부
         */
        setScrollable(scrollable: boolean | string): void {
            if (scrollable === false) {
                this.scrollable.x = false;
                this.scrollable.y = false;
            } else {
                this.scrollable.x = scrollable == true || scrollable.toLowerCase() == 'x';
                this.scrollable.y = scrollable == true || scrollable.toLowerCase() == 'y';
            }
        }

        /**
         * 실제 스크롤과 함께 자동으로 계속 스크롤 될 가속도를 설정한다.
         *
         * @param {number} x - 자동으로 스크롤될 X축 가속도
         * @param {number} y - 자동으로 스크롤될 Y축 가속도
         */
        setAutoScroll(x: number, y: number): void {
            this.autoScroll.x = x;
            this.autoScroll.y = y;
            this.setMomentum(x, y);
        }

        /**
         * 스크롤바 DOM 을 가져온다.
         *
         * @param {('x'|'y')} direction - 가져올 스크롤축
         * @return {Dom} $scrollbar
         */
        $getScrollbar(direction: 'x' | 'y'): Dom {
            if (this.$scrollbar[direction] == null) {
                const componentRect = this.$component.getEl().getBoundingClientRect();
                const targetRect = this.$target.getEl().getBoundingClientRect();
                const width = componentRect.width - targetRect.width;
                const height = componentRect.height - targetRect.height;
                const left = targetRect.left - componentRect.left;
                const right = componentRect.right - targetRect.right;
                const top = targetRect.top - componentRect.top;
                const bottom = componentRect.bottom - targetRect.bottom;
                this.$scrollbar[direction] = Html.create('div', {
                    'data-role': 'scrollbar',
                    'data-direction': direction,
                });
                const $track = Html.create('div', { 'data-role': 'track' });
                const $bar = Html.create('div', { 'data-role': 'bar' });

                if (direction == 'x') {
                    this.$scrollbar[direction].setStyle('left', left + 'px');
                    this.$scrollbar[direction].setStyle('bottom', bottom + 'px');
                    this.$scrollbar[direction].setStyle('width', 'calc(100% - ' + width + 'px)');
                } else {
                    this.$scrollbar[direction].setStyle('right', right + 'px');
                    this.$scrollbar[direction].setStyle('top', top + 'px');
                    this.$scrollbar[direction].setStyle('height', 'calc(100% - ' + height + 'px)');
                }

                $track.append($bar);
                this.$scrollbar[direction].append($track);
            }

            return this.$scrollbar[direction];
        }

        /**
         * 스크롤 가능영역을 가져온다.
         *
         * @param {'x'|'y'} direction - 스크롤 영역을 가져올 스크롤롤축
         * @return {number} offset
         */
        getScrollOffset(direction: 'x' | 'y'): number {
            if (direction == 'x') {
                return this.$target.getScrollWidth() - this.$target.getOuterWidth();
            } else {
                return this.$target.getScrollHeight() - this.$target.getOuterHeight();
            }
        }

        /**
         * 현재 스크롤 위치를 가져온다.
         *
         * @return {Object} position - 스크롤위치 (x,y)
         */
        getPosition(): { x: number; y: number } {
            const scroll = this.$target.getScroll();
            return { x: scroll.left, y: scroll.top };
        }

        /**
         * 현재 스크롤 위치를 설정한다.
         *
         * @param {number} x - X축 위치
         * @param {number} y - Y축 위치
         * @param {boolean} is_active - 스크롤바를 활성화할지 여부
         */
        setPosition(x: number, y: number, is_active: boolean = false): void {
            const position = this.getPosition();

            x ??= position.x;
            y ??= position.y;

            if (x == position.x && y == position.y) {
                return null;
            }

            if (is_active == true) {
                if (x != position.x) {
                    this.active('x', 1);
                }

                if (y != position.y) {
                    this.active('y', 1);
                }
            }

            this.$target.getEl().scroll({ left: x, top: y });
        }

        /**
         * 스크롤위치에 따른 트랙의 위치를 가져온다.
         *
         * @param {'x'|'y'} direction - 위치를 가져올 스크롤축
         * @return {number} position - 트랙위치
         */
        getScrollToTrackPosition(direction: 'x' | 'y'): number {
            const $track = Html.get('div[data-role=track]', this.$getScrollbar(direction));
            const $bar = Html.get('div[data-role=bar]', $track);

            if (this.getScrollOffset(direction) == 0) {
                return 0;
            }

            let trackLength = 0;
            if (direction == 'x') {
                trackLength = $track.getWidth() - $bar.getOuterWidth();
            } else {
                trackLength = $track.getHeight() - $bar.getOuterHeight();
            }

            if (trackLength == 0) {
                return 0;
            }

            return Math.round((this.getPosition()[direction] / this.getScrollOffset(direction)) * trackLength);
        }

        /**
         * 트랙위치에 따른 스크롤 위치를 가져온다.
         *
         * @param {'x'|'y'} direction - 위치를 가져올 스크롤축
         * @return {number} position - 스크롤위치
         */
        getTrackToScrollPosition(direction: 'x' | 'y', position: number): number {
            const $track = Html.get('div[data-role=track]', this.$getScrollbar(direction));
            const $bar = Html.get('div[data-role=bar]', $track);

            let trackLength = 0;
            if (direction == 'x') {
                trackLength = $track.getWidth() - $bar.getOuterWidth();
            } else {
                trackLength = $track.getHeight() - $bar.getOuterHeight();
            }

            return Math.round((position / trackLength) * this.getScrollOffset(direction));
        }

        /**
         * 스크롤바 트랙을 업데이트한다.
         *
         * @param {'x'|'y'} direction - 업데이트할 스크롤축
         */
        updateTrack(direction: 'x' | 'y'): void {
            if (this.isScrollable(direction) == true) {
                this.$getScrollbar(direction).setData('disabled', 'false');

                const $track = Html.get('div[data-role=track]', this.$getScrollbar(direction));
                const $bar = Html.get('div[data-role=bar]', $track);

                switch (direction) {
                    case 'x':
                        $bar.setStyle(
                            'width',
                            Math.ceil(($track.getWidth() / this.$target.getScrollWidth()) * 100) + '%'
                        );
                        $bar.setStyle('left', this.getScrollToTrackPosition(direction) + 'px');
                        break;

                    case 'y':
                        $bar.setStyle(
                            'height',
                            Math.ceil(($track.getHeight() / this.$target.getScrollHeight()) * 100) + '%'
                        );
                        $bar.setStyle('top', this.getScrollToTrackPosition(direction) + 'px');
                        break;
                }
            } else if (this.$getScrollbar(direction).getData('disabled') != 'true') {
                this.$getScrollbar(direction).setData('disabled', 'true');
            }
        }

        /**
         * 스크롤바를 위한 이벤트를 등록한다.
         */
        setEvent(): void {
            this.$target.on('wheel', this.setWheelEvent.bind(this));
            // @todo 터치 이벤트 추가

            this.$getScrollbar('x').on('mouseover', this.active.bind(this, 'x', 0));
            this.$getScrollbar('x').on('mouseout', this.deactive.bind(this, 'x', 1));

            this.$getScrollbar('y').on('mouseover', this.active.bind(this, 'y', 0));
            this.$getScrollbar('y').on('mouseout', this.deactive.bind(this, 'y', 1));

            this.drag.x = new Admin.Drag(this, Html.get('div[data-role=bar]', this.$getScrollbar('x')));
            this.drag.y = new Admin.Drag(this, Html.get('div[data-role=bar]', this.$getScrollbar('y')));
        }

        /**
         * 스크롤바 드래그가 시작되었을 때 이벤트를 처리한다.
         *
         * @param {Dom} $bar - 이벤트 대상 스크롤바 DOM 객체
         */
        onDragStart($bar: Dom): void {
            const $scrollbar = $bar.getParents('div[data-role=scrollbar]');
            const direction = $scrollbar.getData('direction');
            if (direction == 'x') {
                $bar.setData('start', parseInt($bar.getStyle('left').replace('/px$/', ''), 10), false);
            } else {
                $bar.setData('start', parseInt($bar.getStyle('top').replace('/px$/', ''), 10), false);
            }

            $scrollbar.addClass('drag');
        }

        /**
         * 스크롤바 드래그시 이벤트를 처리한다.
         *
         * @param {Dom} $bar - 이벤트 대상 스크롤바 DOM 객체
         */
        onDrag($bar: Dom, start: { x: number; y: number }, current: { x: number; y: number }): void {
            const $scrollbar = $bar.getParents('div[data-role=scrollbar]');
            const $track = Html.get('div[data-role=track]', $scrollbar);
            const direction = $scrollbar.getData('direction');

            if (direction == 'x') {
                const left = Math.min(
                    $track.getWidth() - $bar.getWidth(),
                    Math.max(0, $bar.getData('start') + current.x - start.x)
                );

                this.setPosition(this.getTrackToScrollPosition(direction, left), null);
            } else {
                const top = Math.min(
                    $track.getHeight() - $bar.getHeight(),
                    Math.max(0, $bar.getData('start') + current.y - start.y)
                );

                this.setPosition(null, this.getTrackToScrollPosition(direction, top));
            }
        }

        /**
         * 스크롤바 드래그가 종료되었을 때 이벤트를 처리한다.
         *
         * @param {Dom} $bar - 이벤트 대상 스크롤바 DOM 객체
         */
        onDragEnd($bar: Dom): void {
            const $scrollbar = $bar.getParents('div[data-role=scrollbar]');
            const direction = $scrollbar.getData('direction');
            $scrollbar.removeClass('drag');
            this.deactive(direction, 1);
        }

        /**
         * 휠 이벤트를 처리한다.
         *
         * @param {WheelEvent} e - 휠이벤트
         */
        setWheelEvent(e: WheelEvent): void {
            const DELTA_MODE = [1.0, 28.0, 500.0];
            const mode = DELTA_MODE[e.deltaMode] ?? DELTA_MODE[0];

            const x = Math.round(e.deltaX * mode);
            const y = Math.round(e.deltaY * mode);

            if (this.isMovable(x, y) == true) {
                this.addMomentum(this.scrollable.x == true ? x : 0, this.scrollable.y == true ? y : 0);
            }

            e.stopImmediatePropagation();
        }

        /**
         * 스크롤이 가능한지 확인한다.
         *
         * @param {('x'|'y')} direction - 스크롤 가능여부를 확인할 스크롤축
         * @return {boolean} scrollable
         */
        isScrollable(direction: 'x' | 'y'): boolean {
            return this.scrollable[direction] && this.getScrollOffset(direction) > 0;
        }

        /**
         * 현재 스크롤 위치에서 특정 스크롤 위치로 이동이 가능한지 확인한다.
         *
         * @param {number} x - 이동이 가능한지 확인할 X축 위치
         * @param {number} y - 이동이 가능한지 확인할 Y축 위치
         * @return {boolean} movable
         */
        isMovable(x: number, y: number): boolean {
            if (x == 0 && y == 0) {
                return false;
            }

            const offset = { x: this.getScrollOffset('x'), y: this.getScrollOffset('y') };
            const position = this.getPosition();

            let movableX = false;
            let movableY = false;

            if (x > 0) {
                movableX = offset.x > position.x;
            } else if (x < 0) {
                movableX = position.x > 0;
            }

            if (y > 0) {
                movableY = offset.y > position.y;
            } else if (y < 0) {
                movableY = position.y > 0;
            }

            return movableX || movableY;
        }

        /**
         * 현재 스크롤 가속도를 증가시킨다.
         *
         * @param {number} x - 증가할 X축 가속도
         * @param {number} y - 증가할 Y축 가속도
         */
        addMomentum(x: number, y: number): void {
            this.setMomentum(this.momentum.x + x, this.momentum.y + y);
        }

        /**
         * 스크롤 가속도를 설정한다.
         *
         * @param {number} x - 설정할 X축 가속도
         * @param {number} y - 설정할 Y축 가속도
         */
        setMomentum(x: number, y: number): void {
            this.momentum.x = x;
            this.momentum.y = y;
        }

        /**
         * 다음 스크롤 위치 및 변경될 가속도를 가져온다.
         *
         * @param {('x'|'y')} direction - 가져올 스크롤축
         * @return {Object} tick
         */
        getNextTick(direction: 'x' | 'y'): { momentum: number; position: number } {
            const current = this.getPosition()[direction];
            const remain = this.momentum[direction] + this.autoScroll[direction];

            if (Math.abs(remain) <= 1) {
                return { momentum: 0, position: current };
            }

            const nextMomentum = (remain * 0.8) | 0;
            return { momentum: nextMomentum, position: current + remain - nextMomentum };
        }

        /**
         * 스크롤바를 활성화한다.
         *
         * @param {('x'|'y')} direction - 활성화할 스크롤바 축
         * @param {number} delay - 자동으로 비활성화할 딜레이시간(0 인 경우 자동으로 비활성화하지 않음)
         */
        active(direction: 'x' | 'y', delay: number = 0): void {
            const $scrollbar = this.$getScrollbar(direction);
            if ($scrollbar.getData('timer')) {
                clearTimeout($scrollbar.getData('timer'));
            }

            $scrollbar.addClass('active');

            if (delay > 0) {
                this.deactive(direction, delay);
            }
        }

        /**
         * 스크롤바를 비활성화한다.
         *
         * @param {('x'|'y')} direction - 비활성화할 스크롤바 축
         * @param {number} delay - 비활성화할 딜레이시간(0 인 경우 즉시 비활성화)
         */
        deactive(direction: 'x' | 'y', delay: number = 0): void {
            const $scrollbar = this.$getScrollbar(direction);
            if ($scrollbar.getData('timer')) {
                clearTimeout($scrollbar.getData('timer'));
            }

            if ($scrollbar.hasClass('drag') == true) {
                return;
            }

            if (delay > 0) {
                $scrollbar.setData(
                    'timer',
                    setTimeout(
                        ($scrollbar: Dom) => {
                            $scrollbar.removeClass('active');
                        },
                        delay * 1000,
                        $scrollbar
                    ),
                    false
                );
            } else {
                $scrollbar.removeClass('active');
            }
        }

        /**
         * 스크롤바를 랜더링하여 실제로 객체를 스크롤 한다.
         */
        scrollbarRender() {
            if (this.momentum.x != 0 || this.momentum.y != 0) {
                const nextX = this.getNextTick('x');
                const nextY = this.getNextTick('y');

                this.setMomentum(nextX.momentum, nextY.momentum);
                this.setPosition(nextX.position, nextY.position);
                if (this.momentum.x != 0) {
                    this.active('x', 1);
                }

                if (this.momentum.y != 0) {
                    this.active('y', 1);
                }
            }

            this.updateTrack('x');
            this.updateTrack('y');

            requestAnimationFrame(this.scrollbarRender.bind(this));
        }

        /**
         * 스크롤바를 랜더링한다.
         */
        render() {
            if (this.rendered !== true) {
                this.$component.append(this.$getScrollbar('x'));
                this.$component.append(this.$getScrollbar('y'));

                this.updateTrack('x');
                this.updateTrack('y');

                this.setEvent();
                this.scrollbarRender();
            }
        }
    }
}
