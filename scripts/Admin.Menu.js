/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모달 윈도우 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Menu.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 16.
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
        x;
        y;
        title;
        /**
         * 윈도우를 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.scrollable = this.properties.scrollable ?? 'Y';
            if (this.properties.title instanceof Admin.Title) {
                this.title = this.properties.title;
            }
            else {
                this.title = new Admin.Title(this.properties.title ?? '');
            }
            if (this.properties.iconClass) {
                this.title.setIconClass(this.properties.iconClass);
            }
            this.$setTop();
            this.$scrollable = this.$getContent();
            this.title.setParent(this);
        }
        /**
         * 윈도우의 하위 컴포넌트를 정의한다.
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
         * 메뉴의 제목 객체를 가져온다.
         *
         * @return {Admin.Title} title
         */
        getTitle() {
            return this.title;
        }
        /**
         * 기존에 존재하던 포인터 이벤트를 이용하여 메뉴를 출력한다.
         */
        show() {
            if (Admin.Menu.pointerEvent !== null) {
                this.showAt(Admin.Menu.pointerEvent);
            }
        }
        /**
         * 메뉴를 출력한다.
         */
        showAt(e) {
            this.$getMenu().show();
            this.$getMenu().append(this.$component);
            this.render();
            this.$getComponent().setStyle('left', e.clientX + 'px');
            this.$getComponent().setStyle('top', e.clientY + 'px');
            super.show();
            this.$getComponent().focus();
            Admin.Menu.menu = this;
            Admin.Menu.observe();
        }
        /**
         * 메뉴를 숨긴다.
         */
        hide() {
            this.close();
        }
        /**
         * 메뉴를 닫는다.
         */
        close() {
            Admin.Menu.menu = null;
            this.remove();
            Admin.Menu.$menu.hide();
            Admin.Menu.disconnect();
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
         * 윈도우 레이아웃을 랜더링한다.
         */
        render() {
            super.render();
            /*
            if (this.resizable == false || this.resizer !== undefined) return;

            this.resizer = new Admin.Resizer(this.$component, this.$getWindows(), {
                directions: [true, true, true, true],
                listeners: {
                    end: (_$target: Dom, rect: DOMRect) => {
                        this.setPosition(rect.x, rect.y);
                        this.setWidth(rect.width);
                        this.setHeight(rect.height);
                    },
                },
            });
            */
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
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.text = this.properties.text ?? '';
                this.iconClass = this.properties.iconClass ?? null;
                this.handler = this.properties.handler ?? null;
                this.$button = Html.create('button').setAttr('type', 'button');
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
             * 레이아웃을 렌더링한다.
             */
            renderContent() {
                const $icon = Html.create('i').addClass('icon');
                if (this.iconClass !== null) {
                    $icon.addClass(...this.iconClass.split(' '));
                }
                this.$button.append($icon);
                const $text = Html.create('span').html(this.text);
                this.$button.append($text);
                if (this.handler !== null) {
                    this.$button.on('click', () => {
                        this.onClick();
                    });
                }
                this.$getContent().append(this.$button);
            }
            /**
             * 아이콘 클래스를 변경한다.
             *
             * @param {string} iconClass - 변경할 아이콘 클래스
             */
            setIconClass(iconClass = null) {
                const $button = Html.get('> button', this.$getContent());
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
                this.getParent().close();
            }
        }
        Menu.Item = Item;
    })(Menu = Admin.Menu || (Admin.Menu = {}));
})(Admin || (Admin = {}));
