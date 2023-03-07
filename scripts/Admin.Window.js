/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모달 윈도우 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Window.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 2. 26.
 */
var Admin;
(function (Admin) {
    class Window extends Admin.Component {
        static $windows;
        static windows = new Map();
        static zIndex = 0;
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
        width;
        height;
        minWidth;
        maxWidth;
        minHeight;
        maxHeight;
        left;
        right;
        top;
        bottom;
        title;
        buttons;
        /**
         * 윈도우를 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.layout = 'auto';
            this.modal = this.properties.modal ?? true;
            this.resizable = this.properties.resizable ?? true;
            this.closable = this.properties.closable ?? true;
            this.movable = this.properties.movable ?? true;
            this.width = this.properties.width ?? null;
            this.height = this.properties.height ?? null;
            this.minWidth = this.properties.minWidth ?? null;
            this.maxWidth = this.properties.maxWidth ?? null;
            this.minHeight = this.properties.minHeight ?? null;
            this.maxHeight = this.properties.maxHeight ?? null;
            if (this.properties.title instanceof Admin.Title) {
                this.title = this.properties.title;
            }
            else {
                this.title = new Admin.Title(this.properties.title ?? '');
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
                if (button instanceof Admin.Component) {
                    this.buttons.push(button);
                }
                else {
                    button = new Admin.Button(button);
                    this.buttons.push(button);
                }
                button.setParent(this);
            }
            this.$setTop();
            if (this.buttons.length > 0) {
                this.$setBottom();
            }
            this.title.setParent(this);
            this.title.setMovable(this.movable);
            Admin.Window.windows.set(this.id, this);
        }
        /**
         * 윈도우의 하위 컴포넌트를 정의한다.
         */
        initItems() {
            if (this.items === null) {
                this.items = [];
                if (this.properties.html) {
                    this.items.push(new Admin.Text(this.properties.html));
                }
                for (let item of this.properties.items ?? []) {
                    if (item instanceof Admin.Component) {
                        this.items.push(item);
                    }
                }
            }
            super.initItems();
        }
        /**
         * 전체 윈도우 랜더링 영역을 가져온다.
         *
         * @return {Dom} $windows
         */
        $getWindows() {
            if (Admin.Window.$windows !== undefined) {
                return Admin.Window.$windows;
            }
            if (Html.get('section[data-role=admin][data-type=windows]', Html.get('body')).getEl() == null) {
                Admin.Window.$windows = Html.create('section', { 'data-role': 'admin', 'data-type': 'windows' });
                Html.get('body').append(Admin.Window.$windows);
            }
            else {
                Admin.Window.$windows = Html.get('section[data-role=admin][data-type=windows]', Html.get('body'));
            }
            return Admin.Window.$windows;
        }
        /**
         * 윈도우의 제목 객체를 가져온다.
         *
         * @return {Admin.Title} title
         */
        getTitle() {
            return this.title;
        }
        /**
         * 윈도우 너비를 설정한다.
         *
         * @param {number} width - 너비
         */
        setWidth(width) {
            this.width = width;
            if (width == null) {
                this.$component.setStyle('width', 'auto');
            }
            else {
                this.$component.setStyle('width', width + 'px');
            }
        }
        /**
         * 윈도우 최대너비를 설정한다.
         *
         * @param {number} maxWidth - 최대너비
         */
        setMaxWidth(maxWidth) {
            this.maxWidth = maxWidth;
            if (maxWidth == null) {
                this.$component.setStyle('maxWidth', 'auto');
            }
            else {
                this.$component.setStyle('maxWidth', maxWidth + 'px');
            }
            this.resizer?.setMaxWidth(maxWidth);
        }
        /**
         * 윈도우 높이를 설정한다.
         *
         * @param {number} height - 높이
         */
        setHeight(height) {
            this.height = height;
            if (height == null) {
                this.$component.setStyle('height', 'auto');
            }
            else {
                this.$component.setStyle('height', height + 'px');
            }
        }
        /**
         * 윈도우 최대높이를 설정한다.
         *
         * @param {number} maxHeight - 최대높이
         */
        setMaxHeight(maxHeight) {
            if (maxHeight == null) {
                this.$component.setStyle('maxHeight', 'auto');
            }
            else {
                this.$component.setStyle('maxHeight', maxHeight + 'px');
            }
            this.resizer?.setMaxHeight(maxHeight);
        }
        /**
         * 윈도우의 Z-INDEX 를 가져온다.
         *
         * @return {number} z-index
         */
        getIndex() {
            const zIndex = this.$component.getStyle('z-index');
            return zIndex.length > 0 ? parseInt(zIndex, 10) : 0;
        }
        /**
         * 윈도우를 최상단에 배치한다.
         */
        setFront() {
            if (this.getIndex() != Admin.Window.zIndex) {
                this.$component.setStyle('z-index', Admin.Window.zIndex + 2);
                this.updateWindows();
            }
        }
        /**
         * 윈도우를 최하단에 배치한다.
         */
        setBack() {
            this.$component.setStyle('z-index', 0);
        }
        /**
         * 전체 윈도우를 대상으로 윈도우 상태값을 업데이트한다.
         */
        updateWindows() {
            let zIndex = 0;
            let isModal = false;
            for (const window of Admin.Window.windows.values()) {
                zIndex = Math.max(zIndex, window.getIndex());
                isModal = isModal || window.modal == true;
            }
            Admin.Window.zIndex = zIndex;
            this.$getWindows().setStyleProperty('--active-z-index', zIndex);
            if (isModal == true) {
                this.$getWindows().addClass('modal');
            }
            else {
                this.$getWindows().removeClass('modal');
            }
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
            this.render();
            this.$getWindows().append(this.$component);
            this.setWidth(this.width);
            this.setMaxWidth(this.maxWidth);
            this.setHeight(this.height);
            this.setMaxHeight(this.maxHeight);
            this.setPosition(this.top, this.left);
            this.setFront();
            super.show();
        }
        /**
         * 윈도우를 숨긴다.
         */
        hide() {
            const isHide = this.fireEvent('beforeHide', [this]);
            if (isHide === false)
                return;
            super.hide();
        }
        /**
         * 윈도우를 닫는다.
         */
        close() {
            const isClose = this.fireEvent('beforeClose', [this]);
            if (isClose === false)
                return;
            Admin.Window.windows.delete(this.id);
            this.remove();
            this.updateWindows();
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
         * 하단 버튼을 추가한다.
         *
         * @param {Admin.Component} button - 추가할 버튼
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
            this.resizer = new Admin.Resizer(this.$component, this.$getWindows(), {
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
    }
    Admin.Window = Window;
})(Admin || (Admin = {}));
