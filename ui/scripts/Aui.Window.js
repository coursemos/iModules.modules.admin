/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 모달 윈도우 클래스를 정의한다.
 *
 * @file /scripts/Aui.Window.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 8. 29.
 */
var Aui;
(function (Aui) {
    class Window extends Aui.Component {
        static windows = new Map();
        static zIndex = 0;
        static observer;
        static isObserve = false;
        type = 'window';
        role = 'window';
        modal;
        resizable;
        resizer;
        closable;
        movable;
        maximizable;
        maximized;
        collapsible;
        collapsed;
        collapseDirection;
        left;
        right;
        top;
        bottom;
        title;
        buttons;
        /**
         * 윈도우를 생성한다.
         *
         * @param {Aui.Window.Properties} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.layout = 'auto';
            this.modal = this.properties.modal ?? true;
            this.resizable = this.properties.resizable ?? true;
            this.closable = this.properties.closable ?? true;
            this.movable = this.properties.movable ?? true;
            this.maxWidth = this.properties.maxWidth ?? Html.get('body').getWidth();
            this.maxHeight = this.properties.maxHeight ?? Html.get('body').getHeight();
            this.scrollable = this.properties.scrollable ?? 'Y';
            if (this.properties.title instanceof Aui.Title) {
                this.title = this.properties.title;
            }
            else {
                this.title = new Aui.Title(this.properties.title ?? '');
            }
            if (this.properties.iconClass) {
                this.title.setIconClass(this.properties.iconClass);
            }
            if (this.closable == true) {
                this.title.addTool('CLOSE', 'mi mi-close', () => {
                    this.close();
                });
            }
            this.buttons = [];
            for (let button of this.properties.buttons ?? []) {
                if (button instanceof Aui.Component) {
                    this.buttons.push(button);
                }
                else if (button == '->') {
                    button = new Aui.Toolbar.Item('->');
                    this.buttons.push(button);
                }
                else {
                    button = new Aui.Button(button);
                    this.buttons.push(button);
                }
                button.setParent(this);
            }
            this.$setTop();
            if (this.buttons.length > 0) {
                this.$setBottom();
            }
            this.$scrollable = this.$getContent();
            this.title.setParent(this);
            this.title.setMovable(this.movable);
            Aui.Window.windows.set(this.id, this);
        }
        /**
         * 윈도우의 하위 컴포넌트를 정의한다.
         */
        initItems() {
            if (this.items === null) {
                this.items = [];
                if (this.properties.html) {
                    this.items.push(new Aui.Text(this.properties.html));
                }
                for (let item of this.properties.items ?? []) {
                    if (item instanceof Aui.Component) {
                        this.items.push(item);
                    }
                }
            }
            super.initItems();
        }
        /**
         * 윈도우의 제목 객체를 가져온다.
         *
         * @return {Aui.Title} title
         */
        getTitle() {
            return this.title;
        }
        /**
         * 윈도우의 제목을 변경한다.
         *
         * @param {string} title
         */
        setTitle(title) {
            this.title.setTitle(title);
        }
        /**
         * 윈도우 최대너비를 설정한다.
         *
         * @param {string|number} maxWidth - 최대너비
         */
        setMaxWidth(maxWidth) {
            const bodyWidth = Html.get('body').getWidth();
            maxWidth = maxWidth ?? bodyWidth;
            if (typeof maxWidth == 'string') {
                const rate = parseInt(maxWidth.replace('%', ''), 10);
                maxWidth = Math.round((bodyWidth * rate) / 100);
            }
            maxWidth = Math.min(bodyWidth, maxWidth);
            super.setMaxWidth(maxWidth);
            this.resizer?.setMaxWidth(maxWidth);
        }
        /**
         * 윈도우 최대높이를 설정한다.
         *
         * @param {string|number} maxHeight - 최대높이
         */
        setMaxHeight(maxHeight) {
            const bodyHeight = Html.get('body').getHeight();
            maxHeight = maxHeight ?? bodyHeight;
            if (typeof maxHeight == 'string') {
                const rate = parseInt(maxHeight.replace('%', ''), 10);
                maxHeight = Math.round((bodyHeight * rate) / 100);
            }
            maxHeight = Math.min(bodyHeight, maxHeight);
            super.setMaxHeight(maxHeight);
            this.resizer?.setMaxHeight(maxHeight);
        }
        /**
         * 윈도우를 최상단에 배치한다.
         */
        setFront() {
            this.$component.setStyleProperty('--active-z-index', Aui.getAbsoluteIndex());
        }
        /**
         * 윈도우를 최하단에 배치한다.
         */
        setBack() {
            this.$component.setStyle('--active-z-index', 0);
        }
        /**
         * 윈도우 위치를 가져온다.
         *
         * @return {Object} position - 위치
         */
        getPosition() {
            const { left, top } = this.$component.getOffset();
            return {
                x: left,
                y: top,
            };
        }
        /**
         * 윈도우 위치를 설정한다.
         *
         * @param {number} x - 상단위치
         * @param {number} y - 좌측위치
         */
        setPosition(x, y) {
            if (x == null) {
                this.$component.addClass('center');
                this.$component.setStyle('left', '');
            }
            else {
                this.$component.removeClass('center');
                this.$component.setStyle('left', x + 'px');
            }
            if (y == null) {
                this.$component.addClass('middle');
                this.$component.setStyle('top', '');
            }
            else {
                this.$component.removeClass('middle');
                this.$component.setStyle('top', y + 'px');
            }
        }
        /**
         * 윈도우를 특정좌표만큼 이동한다.
         *
         * @param {number} moveX - 이동할 X축 좌표
         * @param {number} moveY - 이동할 Y축 좌표
         */
        moveTo(moveX, moveY) {
            const { x, y } = this.getPosition();
            this.setPosition(x + moveX, y + moveY);
        }
        /**
         * 윈도우를 출력한다.
         */
        show() {
            const isShow = this.fireEvent('beforeShow', [this]);
            if (isShow === false)
                return;
            Aui.$getAbsolute().append(this.$component);
            this.render();
            this.setPosition(this.top, this.left);
            this.setFront();
            super.show();
            this.$getComponent().focus();
            Aui.Window.observe();
        }
        /**
         * 윈도우를 숨긴다.
         */
        hide() {
            const isHide = this.fireEvent('beforeHide', [this]);
            if (isHide === false)
                return;
            if (this.hasWindow(true) == false) {
                Aui.Window.disconnect();
            }
            super.hide();
        }
        /**
         * 윈도우를 닫는다.
         */
        close() {
            const isClose = this.fireEvent('beforeClose', [this]);
            if (isClose === false)
                return;
            Aui.Window.windows.delete(this.id);
            this.remove();
            if (this.hasWindow(true) == false) {
                Aui.Window.disconnect();
            }
            this.fireEvent('close', [this]);
        }
        /**
         * 컴포넌트를 제거한다.
         */
        remove() {
            this.title?.remove();
            this.buttons.forEach((component) => {
                component.remove();
            });
            super.remove();
        }
        /**
         * 윈도우가 존재하는지 확인한다.
         *
         * @param {boolean} is_visible_only - 현재 보이고 있는 윈도우만 확인할지 여부
         * @return {boolean} hasWindow
         */
        hasWindow(is_visible_only = false) {
            if (is_visible_only == true) {
                return Aui.Window.windows.size > 0;
            }
            else {
                for (const window of Aui.Window.windows.values()) {
                    if (window.isShow() === true) {
                        return true;
                    }
                }
                return false;
            }
        }
        /**
         * 하단 버튼을 추가한다.
         *
         * @param {Aui.Component} button - 추가할 버튼
         * @param {number} position - 추가할 위치 (NULL 인 경우 마지막에 위치)
         */
        addButton(button, position = null) {
            if (position === null) {
                this.buttons.push(button);
            }
            else {
                this.buttons.splice(position, 0, button);
            }
            this.$addComponent(this.$setBottom(), button, position);
        }
        /**
         * 브라우저 크기가 변경되었을 경우, 열린 윈도우의 최대너비, 최대높이를 재조절한다.
         */
        static windowResize() {
            Aui.Window.windows.forEach((window) => {
                if (window.isShow() == true) {
                    window.setMaxWidth(window.maxWidth);
                    window.setMaxHeight(window.maxHeight);
                }
            });
        }
        /**
         * 브라우저의 크기가 변경되는지 관찰을 시작한다.
         */
        static observe() {
            if (Aui.Window.observer === undefined) {
                Aui.Window.observer = new ResizeObserver(() => {
                    if (Aui.Window.isObserve == true) {
                        Aui.Window.windowResize();
                    }
                    Aui.Window.isObserve = true;
                });
            }
            if (Aui.Window.isObserve === false) {
                Aui.Window.observer.observe(document.body);
            }
        }
        /**
         * 브라우저의 크기 변경 관찰자를 중단한다.
         */
        static disconnect() {
            if (Aui.Window.isObserve == true) {
                Aui.Window.observer?.disconnect();
                Aui.Window.isObserve = false;
            }
        }
        /**
         * 윈도우 제목 레이아웃을 랜더링한다.
         */
        renderTop() {
            const $top = this.$getTop();
            if (this.title !== null) {
                $top.append(this.title.$getComponent());
                this.title.render();
            }
        }
        /**
         * 윈도우 하단 레이아웃을 랜더링한다.
         */
        renderBottom() {
            const $bottom = this.$getBottom();
            for (const button of this.buttons) {
                $bottom.append(button.$getComponent());
                button.render();
            }
        }
        /**
         * 윈도우 레이아웃을 랜더링한다.
         */
        render() {
            super.render();
            if (this.resizable == false || this.resizer !== undefined)
                return;
            this.resizer = new Aui.Resizer(this.$component, Aui.$getAbsolute(), {
                directions: [true, true, true, true],
                listeners: {
                    end: (_$target, rect) => {
                        this.setPosition(rect.x, rect.y);
                        this.setWidth(rect.width);
                        this.setHeight(rect.height);
                    },
                },
            });
        }
        /**
         * 그리드패널이 화면상에 출력되었을 때 이벤트를 처리한다.
         */
        onRender() {
            super.onRender();
            if (this.modal == true) {
                this.$getComponent().addClass('modal');
            }
            this.$getComponent().on('keydown', (e) => {
                if (e.key == 'Escape' && this.closable === true) {
                    this.close();
                }
                e.stopPropagation();
            });
        }
    }
    Aui.Window = Window;
})(Aui || (Aui = {}));
