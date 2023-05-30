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
namespace Admin {
    export namespace Menu {
        export interface Listeners extends Admin.Component.Listeners {
            /**
             * @var {Function} show - 컴포넌트가 보여질 떄
             */
            show?: (menu: Admin.Menu) => void;

            /**
             * @var {Function} hide - 컴포넌트가 숨겨질 떄
             */
            hide?: (menu: Admin.Menu) => void;
        }

        export interface Properties extends Admin.Component.Properties {
            /**
             * @type {Admin.Title|string} title - 메뉴타이틀
             */
            title?: Admin.Title | string;

            /**
             * @type {(Admin.Menu.Item|Admin.Menu.Item.Properties)[]} items - 메뉴아이템
             */
            items?: (Admin.Menu.Item | Admin.Menu.Item.Properties)[];

            /**
             * @type {boolean} once - 단발성 메뉴인지 여부
             */
            once?: boolean;

            /**
             * @type {Admin.Menu.Listeners} listeners - 이벤트리스너
             */
            listeners?: Admin.Menu.Listeners;
        }
    }

    export class Menu extends Admin.Component {
        static $menu: Dom;
        static menu: Admin.Menu = null;
        static observer: ResizeObserver;
        static isObserve: boolean = false;
        static pointerEvent: PointerEvent;

        type: string = 'menu';
        role: string = 'menu';
        x: number;
        y: number;

        title: Admin.Title;
        once: boolean;

        /**
         * 메뉴를 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties: Admin.Menu.Properties | (Admin.Menu.Item | Admin.Menu.Item.Properties)[] = null) {
            if (Array.isArray(properties) == true) {
                properties = { items: properties as (Admin.Menu.Item | Admin.Menu.Item.Properties)[] };
            }

            super(properties);

            this.once = this.properties.once === true;
            this.scrollable = 'Y';

            if (this.properties.title instanceof Admin.Title) {
                this.title = this.properties.title;
            } else {
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
        initItems(): void {
            if (this.items === null) {
                this.items = [];

                for (let item of this.properties.items ?? []) {
                    if (item instanceof Admin.Component) {
                        this.items.push(item);
                    } else {
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
        $getMenu(): Dom {
            if (Admin.Menu.$menu !== undefined) {
                return Admin.Menu.$menu;
            }

            if (Html.get('section[data-role=admin][data-type=menu]', Html.get('body')).getEl() == null) {
                Admin.Menu.$menu = Html.create('section', { 'data-role': 'admin', 'data-type': 'menu' });
                Html.get('body').append(Admin.Menu.$menu);
                Admin.Menu.$menu.on('pointerdown', (e: PointerEvent) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    Admin.Menu.menu?.close();
                });
                Admin.Menu.$menu.on('contextmenu', (e: PointerEvent) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    Admin.Menu.menu?.close();
                });
            } else {
                Admin.Menu.$menu = Html.get('section[data-role=admin][data-type=menu]', Html.get('body'));
            }

            return Admin.Menu.$menu;
        }

        /**
         * 메뉴의 제목을 설정한다.
         *
         * @param {string} title - 제목
         */
        setTitle(title: string): void {
            if (title === null) {
                if (this.title !== null) {
                    this.title.remove();
                    if (this.isRendered() == true) {
                        this.$getTop().remove();
                    }
                }
            } else {
                if (this.title === null) {
                    this.title = new Admin.Title(title);
                    this.$setTop();
                    if (this.isRendered() == true) {
                        this.$getTop().append(this.title.$getComponent());
                        this.title.render();
                    }
                } else {
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
        getTitle(): Admin.Title {
            return this.title;
        }

        /**
         * 메뉴에 아이템을 추가한다.
         *
         * @param {Admin.Menu.Item|Admin.Menu.Item.Properties} item
         */
        add(item: Admin.Menu.Item | Admin.Menu.Item.Properties): void {
            if (item instanceof Admin.Menu.Item) {
                this.append(item);
            } else {
                this.append(new Admin.Menu.Item(item));
            }
        }

        /**
         * 특정 DOM 위치에 의해 메뉴를 출력한다.
         *
         * @param {Dom|PointerEvent} dom - 메뉴를 출력할 기준이 되는 DOM 객체 또는 기준이 되는 포인터위치
         * @param {'x'|'y'} direction - 메뉴를 출력할 축
         */
        showAt(dom: Dom | PointerEvent, direction: 'x' | 'y'): void {
            this.$getComponent().removeAttr('style');
            this.setHidden(false);

            this.$getMenu().show();
            this.$getMenu().append(this.$getComponent());
            this.render();

            const minWidth = dom instanceof Dom ? dom.getOuterWidth() : 150;

            if (direction == 'y') {
                this.$getComponent().setStyle('min-width', minWidth + 'px');
            }

            const position = Admin.Absolute.getPosition(dom, this.$getComponent(), 'y');
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
        hide(): void {
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
        close(): void {
            this.hide();
        }

        /**
         * 컴포넌트를 제거한다.
         */
        remove(): void {
            this.title?.remove();
            super.remove();
        }

        /**
         * 출력중인 메뉴가 존재하는지 확인한다.
         *
         * @return {boolean} hasMenu
         */
        hasMenu(): boolean {
            return Admin.Menu.menu !== null;
        }

        /**
         * 브라우저 크기가 변경되었을 경우, 활성화된 메뉴를 닫는다.
         */
        static windowResize(): void {
            Admin.Menu.menu?.close();
        }

        /**
         * 브라우저의 크기가 변경되는지 관찰을 시작한다.
         */
        static observe(): void {
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
        static disconnect(): void {
            if (Admin.Menu.isObserve == true) {
                Admin.Menu.isObserve = false;
                Admin.Menu.observer?.disconnect();
            }
        }

        /**
         * 윈도우 제목 레이아웃을 랜더링한다.
         */
        renderTop(): void {
            const $top = this.$getTop();

            if (this.title !== null) {
                $top.append(this.title.$getComponent());
                this.title.render();
            }
        }

        /**
         * 그리드패널이 화면상에 출력되었을 때 이벤트를 처리한다.
         */
        onRender(): void {
            super.onRender();

            this.$getComponent().on('pointerdown', (e: PointerEvent) => {
                e.stopPropagation();
            });

            this.$getComponent().on('keydown', (e: KeyboardEvent) => {
                if (e.key == 'Escape') {
                    this.close();
                }

                e.stopPropagation();
            });
        }
    }

    export namespace Menu {
        export namespace Item {
            export interface Properties extends Admin.Component.Properties {
                /**
                 * @type {string} text - 메뉴명
                 */
                text?: string;

                /**
                 * @type {string} iconClass - 메뉴 아이콘 스타일시트 클래스
                 */
                iconClass?: string;

                /**
                 * @type {Function} handler - 메뉴 클릭 핸들러
                 */
                handler?: (item: Admin.Menu.Item) => void;
            }
        }

        export class Item extends Admin.Component {
            type: string = 'menu';
            role: string = 'item';
            text: string;
            iconClass: string;
            handler: Function;

            $button: Dom;

            /**
             * 메뉴아이템을 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties: Admin.Menu.Item.Properties = null) {
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
            getParent(): Admin.Menu {
                return this.parent as Admin.Menu;
            }

            /**
             * 레이아웃을 렌더링한다.
             */
            renderContent(): void {
                const $icon = Html.create('i').addClass('icon');
                if (this.iconClass !== null) {
                    $icon.addClass(...this.iconClass.split(' '));
                }
                this.$button.append($icon);

                const $text = Html.create('span').html(this.text);
                this.$button.append($text);
                this.$button.on('click', () => {
                    this.onClick();
                });

                this.$getContent().append(this.$button);
            }

            /**
             * 아이콘 클래스를 변경한다.
             *
             * @param {string} iconClass - 변경할 아이콘 클래스
             */
            setIconClass(iconClass: string = null): void {
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
            onClick(): void {
                if (this.handler !== null) {
                    this.handler(this);
                }

                this.getParent().hide();
            }
        }
    }
}
