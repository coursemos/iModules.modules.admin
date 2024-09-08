/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 컴포넌트에 스크롤영역을 지정하는 클래스를 정의한다.
 *
 * @file /scripts/Aui.Scroll.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 9. 9.
 */
var Aui;
(function (Aui) {
    class Scroll extends Aui.Base {
        static scrolls = new Map();
        static started = false;
        $component;
        $target;
        scrollable = { x: false, y: false };
        $scrollbar = { x: null, y: null };
        rendered;
        momentum = { x: 0, y: 0 };
        autoScroll = { x: 0, y: 0 };
        latestPosition = { x: 0, y: 0 };
        latestTargetSize = { width: 0, height: 0 };
        storePositionData = null;
        storePositionCoordinate = { x: 0, y: 0 };
        /**
         * 스크롤바 클래스를 생성한다.
         *
         * @param {Dom} $target - 스크롤할 대상의 DOM 객체
         * @param {Dom} $component - 스크롤할 대상의 컴포넌트 DOM 객체
         * @param {boolean|string} scrollable - 스크롤 여부
         */
        constructor($target, $component, scrollable = false) {
            super();
            this.$target = $target;
            this.$component = $component;
            if (scrollable === false) {
                this.scrollable.x = false;
                this.scrollable.y = false;
            }
            else {
                this.scrollable.x = scrollable === true || scrollable.toLowerCase() == 'x';
                this.scrollable.y = scrollable === true || scrollable.toLowerCase() == 'y';
            }
            Aui.Scroll.scrolls.set(this.$target.getEl(), this);
        }
        /**
         * 스크롤바 이벤트 대상의 스크롤바 클래스 객체를 가져온다.
         *
         * @param {Dom} $target - 스크롤할 대상의 DOM 객체
         * @param {Dom} $component - 스크롤할 대상의 컴포넌트 DOM 객체
         * @param {boolean|string} scrollable - 스크롤 여부
         * @return {Aui.Scroll} scrollbar
         */
        static get($target, $component, scrollable = false) {
            if (Aui.Scroll.scrolls.has($target.getEl()) == true) {
                return Aui.Scroll.scrolls.get($target.getEl());
            }
            else {
                return new Aui.Scroll($target, $component, scrollable);
            }
        }
        /**
         * 스크롤바 트랙이 위치할 기준 좌표를 설정한다.
         *
         * @param {('x'|'y')} direction - 설정할 스크롤축
         * @param {number} position - 좌표
         */
        setTrackPosition(direction, position) {
            const $scrollbar = this.$getScrollbar(direction);
            if (direction == 'x') {
                $scrollbar.setStyle('padding-left', position + 'px');
            }
            else {
                $scrollbar.setStyle('padding-top', position + 'px');
            }
        }
        /**
         * 스크롤 가능여부를 설정한다.
         *
         * @param {(boolean|string)} scrollable - 스크롤 가능여부
         */
        setScrollable(scrollable) {
            if (scrollable === false) {
                this.scrollable.x = false;
                this.scrollable.y = false;
            }
            else {
                this.scrollable.x = scrollable == true || scrollable.toLowerCase() == 'x';
                this.scrollable.y = scrollable == true || scrollable.toLowerCase() == 'y';
            }
            if (this.rendered !== true) {
                this.render();
            }
            else {
                if (this.scrollable.x == true) {
                    if (this.$target.getAttr('data-scroll-x') === 'false') {
                        this.$target.setAttr('data-scroll-x', 'true');
                    }
                    else if (this.$target.getAttr('data-scroll-x') !== 'true') {
                        this.$target.setAttr('data-scroll-x', 'true');
                        this.$component.append(this.$getScrollbar('x'));
                        this.updateTrack('x');
                    }
                }
                else {
                    if (this.$target.getAttr('data-scroll-x') === 'true') {
                        this.$target.setAttr('data-scroll-x', 'false');
                    }
                }
                if (this.scrollable.y == true) {
                    if (this.$target.getAttr('data-scroll-y') === 'false') {
                        this.$target.setAttr('data-scroll-y', 'true');
                    }
                    else if (this.$target.getAttr('data-scroll-y') !== 'true') {
                        this.$target.setAttr('data-scroll-y', 'true');
                        this.$component.append(this.$getScrollbar('y'));
                        this.updateTrack('y');
                    }
                }
                else {
                    if (this.$target.getAttr('data-scroll-y') === 'true') {
                        this.$target.setAttr('data-scroll-y', 'false');
                    }
                }
            }
            this.update();
        }
        /**
         * 실제 스크롤과 함께 자동으로 계속 스크롤 될 가속도를 설정한다.
         *
         * @param {number} x - 자동으로 스크롤될 X축 가속도
         * @param {number} y - 자동으로 스크롤될 Y축 가속도
         */
        setAutoScroll(x, y) {
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
        $getScrollbar(direction) {
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
                }
                else {
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
         * 스크롤되는 영역의 크기를 가져온다.
         *
         * @param {'x'|'y'} direction - 스크롤 영역을 가져올 스크롤롤축
         * @return {number} offset
         */
        getTargetSize(direction) {
            if (direction == 'x') {
                return this.$target.getOuterWidth();
            }
            else {
                return this.$target.getOuterHeight();
            }
        }
        /**
         * 스크롤 가능영역을 가져온다.
         *
         * @param {'x'|'y'} direction - 스크롤 영역을 가져올 스크롤롤축
         * @return {number} offset
         */
        getScrollOffset(direction) {
            if (direction == 'x') {
                return this.$target.getScrollWidth() - this.getTargetSize(direction);
            }
            else {
                return this.$target.getScrollHeight() - this.getTargetSize(direction);
            }
        }
        /**
         * 현재 스크롤 위치를 가져온다.
         *
         * @return {Object} position - 스크롤위치 (x,y)
         */
        getPosition() {
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
        setPosition(x, y, is_active = false, is_animate = false) {
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
            this.$target.getEl().scroll({ left: x, top: y, behavior: is_animate === true ? 'smooth' : 'auto' });
        }
        /**
         * 현재 스크롤 위치에서 이동한다.
         *
         * @param {number} x - 이동할 X축 거리
         * @param {number} y - 이동할 Y축 거리
         * @param {boolean} is_active - 스크롤바를 활성화할지 여부
         */
        movePosition(x, y, is_active = false, is_animate = false) {
            const position = this.getPosition();
            x = position.x + x;
            y = position.y + y;
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
            this.$target.getEl().scroll({ left: x, top: y, behavior: is_animate === true ? 'smooth' : 'auto' });
        }
        /**
         * 스크롤위치에 따른 트랙의 위치를 가져온다.
         *
         * @param {'x'|'y'} direction - 위치를 가져올 스크롤축
         * @return {number} position - 트랙위치
         */
        getScrollToTrackPosition(direction) {
            const $track = Html.get('div[data-role=track]', this.$getScrollbar(direction));
            const $bar = Html.get('div[data-role=bar]', $track);
            if (this.getScrollOffset(direction) == 0) {
                return 0;
            }
            let trackLength = 0;
            if (direction == 'x') {
                trackLength = $track.getWidth() - $bar.getOuterWidth();
            }
            else {
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
        getTrackToScrollPosition(direction, position) {
            const $track = Html.get('div[data-role=track]', this.$getScrollbar(direction));
            const $bar = Html.get('div[data-role=bar]', $track);
            let trackLength = 0;
            if (direction == 'x') {
                trackLength = $track.getWidth() - $bar.getOuterWidth();
            }
            else {
                trackLength = $track.getHeight() - $bar.getOuterHeight();
            }
            return Math.round((position / trackLength) * this.getScrollOffset(direction));
        }
        /**
         * 스크롤바 트랙을 업데이트한다.
         *
         * @param {'x'|'y'} direction - 업데이트할 스크롤축
         */
        updateTrack(direction) {
            if (this.isScrollable(direction) == true) {
                this.$getScrollbar(direction).setData('disabled', 'false');
                const $track = Html.get('div[data-role=track]', this.$getScrollbar(direction));
                const $bar = Html.get('div[data-role=bar]', $track);
                switch (direction) {
                    case 'x':
                        $bar.setStyle('width', Math.ceil(($track.getWidth() / this.$target.getScrollWidth()) * 100) + '%');
                        $bar.setStyle('left', this.getScrollToTrackPosition(direction) + 'px');
                        break;
                    case 'y':
                        $bar.setStyle('height', Math.ceil(($track.getHeight() / this.$target.getScrollHeight()) * 100) + '%');
                        $bar.setStyle('top', this.getScrollToTrackPosition(direction) + 'px');
                        break;
                }
            }
            else if (this.$getScrollbar(direction).getData('disabled') != 'true') {
                this.$getScrollbar(direction).setData('disabled', 'true');
            }
        }
        /**
         * 스크롤바를 위한 이벤트를 등록한다.
         */
        setEvent() {
            this.$target.on('scroll', () => {
                const current = this.getPosition();
                if (this.latestPosition.x !== current.x) {
                    this.active('x', 1);
                }
                if (this.latestPosition.y !== current.y) {
                    this.active('y', 1);
                }
                this.latestPosition = current;
                this.fireEvent('scroll', [current.x, current.y]);
            });
            this.setTrackEvent('x');
            this.setTrackEvent('y');
        }
        /**
         * 스크롤바 이벤트를 처리한다.
         *
         * @param {('x'|'y')} direction - 이벤트를 처리할 스크롤축
         */
        setTrackEvent(direction) {
            this.$getScrollbar(direction).on('mouseover', this.active.bind(this, direction, 0));
            this.$getScrollbar(direction).on('mouseout', this.deactive.bind(this, direction, 1));
            const $bar = Html.get('div[data-role=bar]', this.$getScrollbar(direction));
            new Aui.Drag($bar, {
                pointerType: ['mouse', 'touch', 'pen'],
                listeners: {
                    start: ($bar) => {
                        const $scrollbar = $bar.getParents('div[data-role=scrollbar]');
                        const direction = $scrollbar.getData('direction');
                        if (direction == 'x') {
                            $bar.setData('start', parseInt($bar.getStyle('left').replace('/px$/', ''), 10), false);
                        }
                        else {
                            $bar.setData('start', parseInt($bar.getStyle('top').replace('/px$/', ''), 10), false);
                        }
                        $scrollbar.addClass('drag');
                    },
                    drag: ($bar, tracker) => {
                        const $scrollbar = $bar.getParents('div[data-role=scrollbar]');
                        const $track = Html.get('div[data-role=track]', $scrollbar);
                        const direction = $scrollbar.getData('direction');
                        if (direction == 'x') {
                            const left = Math.min($track.getWidth() - $bar.getWidth(), Math.max(0, $bar.getData('start') + tracker.getLength().x));
                            this.setPosition(this.getTrackToScrollPosition(direction, left), null);
                        }
                        else {
                            const top = Math.min($track.getHeight() - $bar.getHeight(), Math.max(0, $bar.getData('start') + tracker.getLength().y));
                            this.setPosition(null, this.getTrackToScrollPosition(direction, top));
                        }
                    },
                    end: ($bar) => {
                        const $scrollbar = $bar.getParents('div[data-role=scrollbar]');
                        const direction = $scrollbar.getData('direction');
                        $scrollbar.removeClass('drag');
                        this.deactive(direction, 1);
                    },
                },
            });
        }
        /**
         * 스크롤이 가능한지 확인한다.
         *
         * @param {('x'|'y')} direction - 스크롤 가능여부를 확인할 스크롤축
         * @return {boolean} scrollable
         */
        isScrollable(direction) {
            return this.scrollable[direction] && this.getScrollOffset(direction) > 0;
        }
        /**
         * 현재 스크롤 위치에서 특정 스크롤 위치로 이동이 가능한지 확인한다.
         *
         * @param {number} x - 이동이 가능한지 확인할 X축 위치
         * @param {number} y - 이동이 가능한지 확인할 Y축 위치
         * @return {boolean} movable
         */
        isMovable(x, y) {
            if (x == 0 && y == 0) {
                return false;
            }
            const offset = { x: this.getScrollOffset('x'), y: this.getScrollOffset('y') };
            const position = this.getPosition();
            let movableX = false;
            let movableY = false;
            if (x > 0) {
                movableX = offset.x > position.x;
            }
            else if (x < 0) {
                movableX = position.x > 0;
            }
            if (y > 0) {
                movableY = offset.y > position.y;
            }
            else if (y < 0) {
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
        addMomentum(x, y) {
            this.setMomentum(this.momentum.x + x, this.momentum.y + y);
        }
        /**
         * 스크롤 가속도를 설정한다.
         *
         * @param {number} x - 설정할 X축 가속도
         * @param {number} y - 설정할 Y축 가속도
         */
        setMomentum(x, y) {
            this.momentum.x = x;
            this.momentum.y = y;
        }
        /**
         * 다음 스크롤 위치 및 변경될 가속도를 가져온다.
         *
         * @param {('x'|'y')} direction - 가져올 스크롤축
         * @return {Object} tick
         */
        getNextTick(direction) {
            const current = this.getPosition()[direction];
            const remain = this.momentum[direction] + this.autoScroll[direction];
            if (Math.abs(remain) <= 1) {
                this.autoScroll[direction] = 0;
                return { momentum: 0, position: current };
            }
            const nextMomentum = (remain * 0.9) | 0;
            return { momentum: nextMomentum, position: current + remain - nextMomentum };
        }
        /**
         * 스크롤바를 활성화한다.
         *
         * @param {('x'|'y')} direction - 활성화할 스크롤바 축
         * @param {number} delay - 자동으로 비활성화할 딜레이시간(0 인 경우 자동으로 비활성화하지 않음)
         */
        active(direction, delay = 0) {
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
        deactive(direction, delay = 0) {
            const $scrollbar = this.$getScrollbar(direction);
            if ($scrollbar.getData('timer')) {
                clearTimeout($scrollbar.getData('timer'));
            }
            if ($scrollbar.hasClass('drag') == true) {
                return;
            }
            if (delay > 0) {
                $scrollbar.setData('timer', setTimeout(($scrollbar) => {
                    $scrollbar.removeClass('active');
                }, delay * 1000, $scrollbar), false);
            }
            else {
                $scrollbar.removeClass('active');
            }
        }
        /**
         * 스크롤 위치를 복원하기 위한 복원시점을 지정한다.
         *
         * @param {any} data - 스크롤 위치를 저장할 시점의 고유데이터
         */
        storePosition(data) {
            this.storePositionData = JSON.parse(JSON.stringify(data));
            this.storePositionCoordinate = this.getPosition();
        }
        /**
         * 스크롤 위치를 복원한다.
         *
         * @param {any} data - 스크롤 위치를 복원할 시점의 고유데이터
         * @param {string[]} forced - 복원시점과 무관하게 항상 복원할 축
         */
        restorePosition(data, forced = []) {
            if (Format.isEqual(data, this.storePositionData) == true) {
                this.setPosition(this.storePositionCoordinate.x, this.storePositionCoordinate.y, false, false);
            }
            else {
                let position = { x: 0, y: 0 };
                for (const direction of forced) {
                    position[direction] = this.storePositionCoordinate[direction] ?? 0;
                }
                this.setPosition(position.x, position.y, false, false);
                this.storePositionData = null;
                this.storePositionCoordinate = { x: 0, y: 0 };
            }
        }
        /**
         * 스크롤바 위치를 다시 조절한다.
         */
        updatePosition() {
            if (this.latestTargetSize.width === this.$target.getWidth() &&
                this.latestTargetSize.height === this.$target.getHeight()) {
                return;
            }
            this.latestTargetSize.width = this.$target.getWidth();
            this.latestTargetSize.height = this.$target.getHeight();
            const componentRect = this.$component.getEl().getBoundingClientRect();
            const targetRect = this.$target.getEl().getBoundingClientRect();
            const width = componentRect.width - targetRect.width;
            const height = componentRect.height - targetRect.height;
            const left = targetRect.left - componentRect.left;
            const right = componentRect.right - targetRect.right;
            const top = targetRect.top - componentRect.top;
            const bottom = componentRect.bottom - targetRect.bottom;
            if (this.scrollable.x == true) {
                this.$getScrollbar('x').setStyle('left', left + 'px');
                this.$getScrollbar('x').setStyle('bottom', bottom + 'px');
                this.$getScrollbar('x').setStyle('width', 'calc(100% - ' + width + 'px)');
            }
            if (this.scrollable.y == true) {
                this.$getScrollbar('y').setStyle('right', right + 'px');
                this.$getScrollbar('y').setStyle('top', top + 'px');
                this.$getScrollbar('y').setStyle('height', 'calc(100% - ' + height + 'px)');
            }
        }
        /**
         * 스크롤영역을 업데이트한다.
         */
        update() {
            if (Aui.has(this.getId()) == false) {
                return;
            }
            if (this.$target.isHidden() === false) {
                let updateX = this.scrollable.x == true;
                let updateY = this.scrollable.y == true;
                if (this.momentum.x != 0 || this.momentum.y != 0) {
                    const nextX = this.getNextTick('x');
                    const nextY = this.getNextTick('y');
                    updateX = true;
                    updateY = true;
                    this.setMomentum(nextX.momentum, nextY.momentum);
                    this.setPosition(nextX.position, nextY.position, true);
                }
                this.updatePosition();
                if (updateX == true) {
                    this.updateTrack('x');
                }
                if (updateY == true) {
                    this.updateTrack('y');
                }
            }
        }
        /**
         * 스크롤바를 랜더링한다.
         */
        render() {
            if (this.scrollable.x == false && this.scrollable.y == false) {
                return;
            }
            if (this.rendered !== true) {
                this.rendered = true;
                this.$target.setAttr('data-scroll', 'true');
                if (this.scrollable.x == true) {
                    this.$target.setAttr('data-scroll-x', 'true');
                    this.$component.append(this.$getScrollbar('x'));
                    this.updateTrack('x');
                }
                if (this.scrollable.y == true) {
                    this.$target.setAttr('data-scroll-y', 'true');
                    this.$component.append(this.$getScrollbar('y'));
                    this.updateTrack('y');
                }
                this.setEvent();
                Aui.Scroll.startRendering();
            }
        }
        /**
         * 스크롤영역을 제거한다.
         */
        remove() {
            Aui.Scroll.scrolls.delete(this.$target.getEl());
        }
        /**
         * 스크롤영역 랜더링을 시작한다.
         */
        static startRendering() {
            if (Aui.Scroll.started === true) {
                return;
            }
            Aui.Scroll.started = true;
            requestAnimationFrame(Aui.Scroll.rendering);
        }
        /**
         * 스크롤영역을 지속적으로 랜더링한다.
         */
        static rendering() {
            Aui.Scroll.scrolls.forEach((scroll) => {
                scroll.update();
            });
            requestAnimationFrame(Aui.Scroll.rendering);
        }
    }
    Aui.Scroll = Scroll;
})(Aui || (Aui = {}));
