/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모달 윈도우 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Menu.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 5. 30.
 */
var Admin;
(function (Admin) {
    class Menu extends Admin.Component {
        static $menu;
        static menu = null;
        static observer;
        static isObserve = false;
        static pointerEvent;
        type = 'menu';
        role = 'menu';
        $target = null;
        direction = null;
        x;
        y;
        title;
        once;
        /**
         * 메뉴를 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
            if (Array.isArray(properties) == true) {
                properties = { items: properties };
            }
            super(properties);
            this.once = this.properties.once === true;
            this.scrollable = 'y';
            if (this.properties.title instanceof Admin.Title) {
                this.title = this.properties.title;
            }
            else {
                this.title = this.properties.title ? new Admin.Title(this.properties.title) : null;
            }
            if (this.title !== null) {
                this.$setTop();
                this.title.setParent(this);
            }
            if (this.properties.iconClass) {
                this.title.setIconClass(this.properties.iconClass);
            }
            this.$scrollable = this.$getContent();
        }
        /**
         * 메뉴아이템을 정의한다.
         */
        initItems() {
            if (this.items === null) {
                this.items = [];
                for (let item of this.properties.items ?? []) {
                    if (item instanceof Admin.Component) {
                        this.items.push(item);
                    }
                    else {
                        this.items.push(new Admin.Menu.Item(item));
                    }
                }
            }
            super.initItems();
        }
        /**
         * 메뉴 랜더링 영역을 가져온다.
         *
         * @return {Dom} $menu
         */
        $getMenu() {
            if (Admin.Menu.$menu !== undefined) {
                return Admin.Menu.$menu;
            }
            if (Html.get('section[data-role=admin][data-type=menu]', Html.get('body')).getEl() == null) {
                Admin.Menu.$menu = Html.create('section', { 'data-role': 'admin', 'data-type': 'menu' });
                Html.get('body').append(Admin.Menu.$menu);
                Admin.Menu.$menu.on('pointerdown', (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    Admin.Menu.menu?.close();
                });
                Admin.Menu.$menu.on('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    Admin.Menu.menu?.close();
                });
            }
            else {
                Admin.Menu.$menu = Html.get('section[data-role=admin][data-type=menu]', Html.get('body'));
            }
            return Admin.Menu.$menu;
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
         * 메뉴 DOM 의 크기를 가져온다.
         *
         * @return {Object} rect
         */
        getMenuRect() {
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
            const absoluteRect = this.getMenuRect();
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
                    position.maxWidth = windowRect.width - position.right - 10;
                }
                else {
                    position.left = targetRect.left;
                    position.maxWidth = windowRect.width - position.left - 10;
                }
            }
            return position;
        }
        /**
         * 메뉴의 제목을 설정한다.
         *
         * @param {string} title - 제목
         */
        setTitle(title) {
            if (title === null) {
                if (this.title !== null) {
                    this.title.remove();
                    if (this.isRendered() == true) {
                        this.$getTop().remove();
                    }
                }
            }
            else {
                if (this.title === null) {
                    this.title = new Admin.Title(title);
                    this.$setTop();
                    if (this.isRendered() == true) {
                        this.$getTop().append(this.title.$getComponent());
                        this.title.render();
                    }
                }
                else {
                    this.title.setTitle(title);
                }
                this.title.setParent(this);
            }
        }
        /**
         * 메뉴의 제목 객체를 가져온다.
         *
         * @return {Admin.Title} title
         */
        getTitle() {
            return this.title;
        }
        /**
         * 메뉴에 아이템을 추가한다.
         *
         * @param {Admin.Menu.Item|Admin.Menu.Item.Properties|'-'} item
         */
        add(item) {
            if (item instanceof Admin.Menu.Item) {
                this.append(item);
            }
            else {
                this.append(new Admin.Menu.Item(item));
            }
        }
        /**
         * 특정 DOM 위치에 의해 메뉴를 출력한다.
         *
         * @param {Dom|PointerEvent} $target - 메뉴를 출력할 기준이 되는 DOM 객체 또는 기준이 되는 포인터위치
         * @param {'x'|'y'} direction - 메뉴를 출력할 축
         */
        showAt($target, direction) {
            this.$getComponent().removeAttr('style');
            this.setHidden(false);
            this.$getMenu().show();
            this.$getMenu().append(this.$getComponent());
            this.render();
            const minWidth = $target instanceof Dom ? $target.getOuterWidth() : 150;
            if (direction == 'y') {
                this.$getComponent().setStyle('min-width', minWidth + 'px');
            }
            this.$target = $target;
            this.direction = direction;
            const position = this.getPosition();
            for (const key in position) {
                this.$getComponent().setStyle(key, position[key] + 'px');
            }
            super.show();
            this.$getComponent().focus();
            Admin.Menu.menu = this;
            Admin.Menu.observe();
        }
        /**
         * 메뉴를 숨긴다.
         */
        hide() {
            Admin.Menu.menu = null;
            Admin.Menu.$menu.empty();
            Admin.Menu.$menu.hide();
            super.hide();
            if (this.once == true) {
                this.remove();
            }
        }
        /**
         * 메뉴를 닫는다.
         */
        close() {
            this.hide();
        }
        /**
         * 컴포넌트를 제거한다.
         */
        remove() {
            this.title?.remove();
            super.remove();
        }
        /**
         * 출력중인 메뉴가 존재하는지 확인한다.
         *
         * @return {boolean} hasMenu
         */
        hasMenu() {
            return Admin.Menu.menu !== null;
        }
        /**
         * 브라우저 크기가 변경되었을 경우, 활성화된 메뉴를 닫는다.
         */
        static windowResize() {
            Admin.Menu.menu?.close();
        }
        /**
         * 브라우저의 크기가 변경되는지 관찰을 시작한다.
         */
        static observe() {
            if (Admin.Menu.observer === undefined) {
                Admin.Menu.observer = new ResizeObserver(() => {
                    if (Admin.Menu.isObserve == true) {
                        Admin.Menu.windowResize();
                    }
                    Admin.Menu.isObserve = true;
                });
            }
            if (Admin.Menu.isObserve === false) {
                Admin.Menu.observer.observe(document.body);
            }
        }
        /**
         * 브라우저의 크기 변경 관찰자를 중단한다.
         */
        static disconnect() {
            if (Admin.Menu.isObserve == true) {
                Admin.Menu.isObserve = false;
                Admin.Menu.observer?.disconnect();
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
         * 그리드패널이 화면상에 출력되었을 때 이벤트를 처리한다.
         */
        onRender() {
            super.onRender();
            this.$getComponent().on('pointerdown', (e) => {
                e.stopPropagation();
            });
            this.$getComponent().on('keydown', (e) => {
                if (e.key == 'Escape') {
                    this.close();
                }
                e.stopPropagation();
            });
        }
    }
    Admin.Menu = Menu;
    (function (Menu) {
        class Item extends Admin.Component {
            type = 'menu';
            role = 'item';
            text;
            iconClass;
            handler;
            $button;
            /**
             * 메뉴아이템을 생성한다.
             *
             * @param {Object|'-'} properties - 객체설정
             */
            constructor(properties = null) {
                if (properties === '-') {
                    properties = { text: '-' };
                }
                super(properties);
                this.text = this.properties.text ?? '';
                this.iconClass = this.properties.iconClass ?? null;
                this.handler = this.properties.handler ?? null;
            }
            /**
             * 메뉴를 가져온다.
             *
             * @return {Admin.Menu} parent
             */
            getParent() {
                return this.parent;
            }
            /**
             * 메뉴 버튼 DOM 을 가져온다.
             *
             * @return {Dom} $button
             */
            $getButton() {
                if (this.$button === undefined) {
                    this.$button = Html.create('button').setAttr('type', 'button');
                    this.$button.on('click', () => {
                        this.onClick();
                    });
                }
                return this.$button;
            }
            /**
             * 레이아웃을 렌더링한다.
             */
            renderContent() {
                if (this.text == '-') {
                    this.$getContent().addClass('separator');
                }
                else {
                    const $icon = Html.create('i').addClass('icon');
                    if (this.iconClass !== null) {
                        $icon.addClass(...this.iconClass.split(' '));
                    }
                    this.$getButton().append($icon);
                    const $text = Html.create('span').html(this.text);
                    this.$getButton().append($text);
                    this.$getContent().append(this.$button);
                }
            }
            /**
             * 아이콘 클래스를 변경한다.
             *
             * @param {string} iconClass - 변경할 아이콘 클래스
             */
            setIconClass(iconClass = null) {
                const $button = this.$getButton();
                const $icon = Html.get('> i.icon', $button);
                if (this.iconClass !== null) {
                    $icon.removeClass(...this.iconClass.split(' '));
                }
                this.iconClass = iconClass;
                if (this.iconClass !== null) {
                    $icon.addClass(...this.iconClass.split(' '));
                }
            }
            /**
             * 버튼 클릭이벤트를 처리한다.
             */
            onClick() {
                if (this.handler !== null) {
                    this.handler(this);
                }
                this.getParent().hide();
            }
        }
        Menu.Item = Item;
    })(Menu = Admin.Menu || (Admin.Menu = {}));
})(Admin || (Admin = {}));
