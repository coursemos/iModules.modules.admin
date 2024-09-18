/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 특정 DOM 위치를 기준으로 절대위치를 가지는 되는 DOM 을 관리하는 클래스를 정의한다.
 *
 * @file /scripts/Aui.Absolute.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 8. 29.
 */
var Aui;
(function (Aui) {
    class Absolute extends Aui.Component {
        static $absolute = new Map();
        animationFrame;
        type = 'absolute';
        role = 'absolute';
        $target;
        direction;
        border;
        hideOnClick;
        latestTargetRect;
        latestAbsoluteRect;
        /**
         * 버튼을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.$target = this.properties.$target ?? null;
            this.direction = this.properties.direction ?? 'y';
            this.hideOnClick = this.properties.hideOnClick === true;
            this.border = this.properties.border ?? true;
        }
        /**
         * 절대위치의 대상 DOM 의 위치를 가져온다.
         *
         * @return {Object} rect
         */
        getTargetRect() {
            const targetRect = { top: 0, bottom: 0, left: 0, right: 0 };
            if (this.$target instanceof Dom) {
                const rect = this.$target.getEl()?.getBoundingClientRect() ?? null;
                if (rect !== null) {
                    targetRect.top = rect.top;
                    targetRect.bottom = rect.bottom;
                    targetRect.left = rect.left;
                    targetRect.right = rect.right;
                }
            }
            else if (this.$target instanceof Event) {
                targetRect.top = targetRect.bottom = this.$target.y;
                targetRect.left = targetRect.right = this.$target.x;
            }
            return targetRect;
        }
        /**
         * 절대위치 DOM 의 크기를 가져온다.
         *
         * @return {Object} rect
         */
        getAbsoluteRect() {
            const absoluteRect = { width: 0, height: 0 };
            const rect = this.$getComponent().getEl()?.getBoundingClientRect() ?? null;
            if (rect !== null) {
                absoluteRect.width = rect.width;
                absoluteRect.height = rect.height;
            }
            return absoluteRect;
        }
        /**
         * 절대위치 기준점을 대상의 위치에 따라 적절하게 가져온다.
         *
         * @return {Object} position
         */
        getPosition() {
            const position = {};
            const targetRect = this.getTargetRect();
            const absoluteRect = this.getAbsoluteRect();
            const windowRect = { width: window.innerWidth, height: window.innerHeight };
            /**
             * 대상의 DOM 을 기준으로 상/하 위치에 보여줄 경우
             */
            if (this.direction == 'y') {
                if (targetRect.bottom > windowRect.height / 2 &&
                    absoluteRect.height > windowRect.height - targetRect.bottom) {
                    position.bottom = windowRect.height - targetRect.top;
                    position.maxHeight = windowRect.height - position.bottom - 10;
                }
                else {
                    position.top = targetRect.bottom;
                    position.maxHeight = windowRect.height - position.top - 10;
                }
                if (targetRect.left + absoluteRect.width > windowRect.width) {
                    position.right = windowRect.width - targetRect.right;
                    position.maxWidth = windowRect.width - position.right;
                }
                else {
                    position.left = targetRect.left;
                    position.maxWidth = windowRect.width - position.left;
                }
            }
            return position;
        }
        /**
         * 절대위치 DOM 으로 부터 상대위치를 가질 콘텐츠의 위치를 업데이트한다.
         */
        updatePosition() {
            if (Format.isEqual(this.latestTargetRect, this.getTargetRect()) == false ||
                Format.isEqual(this.latestAbsoluteRect, this.getAbsoluteRect()) == false) {
                this.latestTargetRect = this.getTargetRect();
                this.latestAbsoluteRect = this.getAbsoluteRect();
                this.$getComponent().setStyle('top', null);
                this.$getComponent().setStyle('bottom', null);
                this.$getComponent().setStyle('left', null);
                this.$getComponent().setStyle('right', null);
                this.$getComponent().setStyle('max-width', null);
                this.$getComponent().setStyle('max-height', null);
                const minWidth = this.$target instanceof Dom ? this.$target.getOuterWidth() : 150;
                if (this.direction == 'y') {
                    this.$getComponent().setStyle('min-width', minWidth + 'px');
                }
                const position = this.getPosition();
                for (const key in position) {
                    this.$getComponent().setStyle(key, position[key] + 'px');
                }
                if (position.bottom !== undefined) {
                    this.$getContainer().addClass('bottom');
                }
                else {
                    this.$getContainer().addClass('top');
                }
            }
            this.animationFrame = requestAnimationFrame(this.updatePosition.bind(this));
        }
        /**
         * 절대위치 컴포넌트를 보인다.
         *
         * @param {boolean} is_hide_all - 이전 절대위치 컴포넌트를 숨길지 여부
         */
        show(is_hide_all = true) {
            if (is_hide_all == true) {
                Aui.Absolute.hideAll(this.id);
            }
            const isShow = this.fireEvent('beforeShow', [this]);
            if (isShow === false)
                return;
            this.$getComponent().on('pointerdown', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
            });
            this.$getComponent().setStyleProperty('--active-z-index', Aui.getAbsoluteIndex());
            Aui.$getAbsolute().append(this.$getComponent());
            this.render();
            super.show();
            this.updatePosition();
            if (this.hideOnClick === true) {
                Aui.Absolute.$absolute.set(this.getId(), this.$getComponent());
            }
        }
        /**
         * 절대위치 컴포넌트를 숨긴다.
         */
        hide() {
            const isHide = this.fireEvent('beforeHide', [this]);
            if (isHide === false)
                return;
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            super.hide();
            if (this.hideOnClick === true) {
                Aui.Absolute.$absolute.delete(this.getId());
            }
        }
        /**
         * visibility 를 설정한다.
         *
         * @param {boolean} hidden - 숨김여부
         */
        setVisibility(hidden) {
            if (hidden == true) {
                this.$getComponent().addClass('hidden');
            }
            else {
                this.$getComponent().removeClass('hidden');
            }
        }
        /**
         * 클릭시 숨김 설정을 변경한다.
         *
         * @param {boolean} hideOnClick - 클릭시 숨김
         */
        setHideOnClick(hideOnClick) {
            if (hideOnClick === true) {
                Aui.Absolute.$absolute.set(this.getId(), this.$getComponent());
            }
            else {
                Aui.Absolute.$absolute.delete(this.getId());
            }
            this.hideOnClick = hideOnClick;
        }
        /**
         * 모든 절대위치 컴포넌트를 숨긴다.
         */
        static hideAll(current = null) {
            Html.all('div[data-component][data-type=absolute]', Aui.$getAbsolute()).forEach(($dom) => {
                if (current !== $dom.getData('component') &&
                    Aui.getComponent($dom.getData('component')).isShow() == true) {
                    Aui.getComponent($dom.getData('component')).hide();
                }
            });
        }
        /**
         * 절대위치 컴포넌트를 닫는다.
         */
        close() {
            const isClose = this.fireEvent('beforeClose', [this]);
            if (isClose === false)
                return;
            this.remove();
            this.fireEvent('close', [this]);
            if (this.hideOnClick === true) {
                Aui.Absolute.$absolute.delete(this.getId());
            }
        }
        /**
         * 컴포넌트 콘텐츠를 랜더링한다.
         */
        render() {
            if (this.border === true) {
                this.$container.addClass('border');
            }
            else if (this.border !== false) {
                const border = ['borderTop', 'borderRight', 'borderBottom', 'borderLeft'];
                this.border.forEach((is, index) => {
                    if (is === true) {
                        this.$container.addClass(border[index]);
                    }
                });
            }
            super.render();
        }
        /**
         * 컴포넌트를 제거한다.
         */
        remove() {
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            super.remove();
        }
    }
    Aui.Absolute = Absolute;
})(Aui || (Aui = {}));
Html.ready(() => {
    Html.get('body').on('pointerdown', (e) => {
        const $target = Html.el(e.target);
        Aui.Absolute.$absolute.forEach(($dom, id) => {
            if ($target.isSame($dom) === false && $target.getParents('div[data-component=' + id + ']') === null) {
                const absolute = Aui.get(id);
                absolute?.hide();
            }
        });
    });
});
