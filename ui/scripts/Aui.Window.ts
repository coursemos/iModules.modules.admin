/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 모달 윈도우 클래스를 정의한다.
 *
 * @file /scripts/Aui.Window.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 1.
 */
namespace Aui {
    export namespace Window {
        export interface Listeners extends Aui.Component.Listeners {
            /**
             * @var {Function} show - 윈도우가 보여질 떄
             */
            show?: (window: Aui.Window) => void;

            /**
             * @var {Function} hide - 윈도우가 숨겨질 떄
             */
            hide?: (window: Aui.Window) => void;

            /**
             * @var {Function} hide - 윈도우가 닫힐 떄
             */
            close?: (window: Aui.Window) => void;
        }

        export interface Properties extends Aui.Component.Properties {
            /**
             * @type {boolean} modal - 모달창 여부
             */
            modal?: boolean;

            /**
             * @type {boolean} resizable - 크기조절허용 여부
             */
            resizable?: boolean;

            /**
             * @type {boolean} closable - 닫기허용 여부
             */
            closable?: boolean;

            /**
             * @type {boolean} movable - 이동허용 여부
             */
            movable?: boolean;

            /**
             * @type {boolean} maximizable - 최대화허용 여부
             */
            maximizable?: boolean;

            /**
             * @type {boolean} maximized - 최대화 여부
             */
            maximized?: boolean;

            /**
             * @type {boolean} collapsible - 최소화허용 여부
             */
            collapsible?: boolean;

            /**
             * @type {boolean} collapsed - 최소화 여부
             */
            collapsed?: boolean;

            /**
             * @type {string} collapseDirection - 최소화 방향
             */
            collapseDirection?: boolean;

            /**
             * @type {string|Aui.Title} title - 창 제목
             */
            title?: string | Aui.Title;

            /**
             * @type {(Aui.Button|'->')[]} buttons - 버튼목록
             */
            buttons?: (Aui.Button | '->')[];

            /**
             * @type {Aui.Window.Listeners} listeners - 이벤트리스너
             */
            listeners?: Aui.Window.Listeners;
        }
    }
    export class Window extends Aui.Component {
        static windows: Map<string, Aui.Window> = new Map();
        static zIndex: number = 0;
        static observer: ResizeObserver;
        static isObserve: boolean = false;

        type: string = 'window';
        role: string = 'window';
        modal: boolean;
        resizable: boolean;
        resizer: Aui.Resizer;
        closable: boolean;
        movable: boolean;
        maximizable: boolean;
        maximized: boolean;
        collapsible: boolean;
        collapsed: boolean;
        collapseDirection: string;
        left: number;
        right: number;
        top: number;
        bottom: number;

        title: Aui.Title;
        buttons: Aui.Component[];

        /**
         * 윈도우를 생성한다.
         *
         * @param {Aui.Window.Properties} properties - 객체설정
         */
        constructor(properties: Aui.Window.Properties = null) {
            super(properties);

            this.layout = 'auto';
            this.modal = this.properties.modal ?? true;
            this.resizable = this.properties.resizable ?? true;
            this.closable = this.properties.closable ?? true;
            this.movable = this.properties.movable ?? true;

            this.maxWidth = this.properties.maxWidth ?? window.innerWidth;
            this.maxHeight = this.properties.maxHeight ?? window.innerHeight;

            this.scrollable = this.properties.scrollable ?? 'Y';

            if (this.properties.title instanceof Aui.Title) {
                this.title = this.properties.title;
            } else {
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
                } else if (button == '->') {
                    button = new Aui.Toolbar.Item('->');
                    this.buttons.push(button);
                } else {
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
        initItems(): void {
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
        getTitle(): Aui.Title {
            return this.title;
        }

        /**
         * 윈도우의 제목을 변경한다.
         *
         * @param {string} title
         */
        setTitle(title: string): void {
            this.title.setTitle(title);
        }

        /**
         * 윈도우 최대너비를 설정한다.
         *
         * @param {string|number} maxWidth - 최대너비
         */
        setMaxWidth(maxWidth: string | number): void {
            const bodyWidth = window.innerWidth;
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
        setMaxHeight(maxHeight: string | number): void {
            const bodyHeight = window.innerHeight;
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
        setFront(): void {
            this.$component.setStyleProperty('--active-z-index', Aui.getAbsoluteIndex());
        }

        /**
         * 윈도우를 최하단에 배치한다.
         */
        setBack(): void {
            this.$component.setStyle('--active-z-index', 0);
        }

        /**
         * 윈도우 위치를 가져온다.
         *
         * @return {Object} position - 위치
         */
        getPosition(): { x: number; y: number } {
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
        setPosition(x: number, y: number): void {
            if (x == null) {
                this.$component.addClass('center');
                this.$component.setStyle('left', '');
            } else {
                this.$component.removeClass('center');
                this.$component.setStyle('left', x + 'px');
            }

            if (y == null) {
                this.$component.addClass('middle');
                this.$component.setStyle('top', '');
            } else {
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
        moveTo(moveX: number, moveY: number): void {
            const { x, y } = this.getPosition();
            this.setPosition(x + moveX, y + moveY);
        }

        /**
         * 윈도우를 출력한다.
         */
        show(): void {
            const isShow = this.fireEvent('beforeShow', [this]);
            if (isShow === false) return;

            Aui.$getAbsolute().append(this.$component);
            this.render();

            this.setPosition(this.top, this.left);
            this.setFront();
            this.$getComponent().focus();

            super.show();

            Aui.Window.observe();
        }

        /**
         * 윈도우를 숨긴다.
         */
        hide(): void {
            const isHide = this.fireEvent('beforeHide', [this]);
            if (isHide === false) return;

            if (this.hasWindow(true) == false) {
                Aui.Window.disconnect();
            }

            super.hide();
        }

        /**
         * 윈도우를 닫는다.
         */
        close(): void {
            const isClose = this.fireEvent('beforeClose', [this]);
            if (isClose === false) return;

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
        remove(): void {
            this.title?.remove();
            this.buttons.forEach((component: Aui.Component) => {
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
        hasWindow(is_visible_only: boolean = false): boolean {
            if (is_visible_only == true) {
                return Aui.Window.windows.size > 0;
            } else {
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
        addButton(button: Aui.Component, position: number = null): void {
            if (position === null) {
                this.buttons.push(button);
            } else {
                this.buttons.splice(position, 0, button);
            }

            this.$addComponent(this.$setBottom(), button, position);
        }

        /**
         * 브라우저 크기가 변경되었을 경우, 열린 윈도우의 최대너비, 최대높이를 재조절한다.
         */
        static windowResize(): void {
            Aui.Window.windows.forEach((window) => {
                if (window.isShow() == true) {
                    window.setMaxWidth(null);
                    window.setMaxHeight(null);
                }
            });
        }

        /**
         * 브라우저의 크기가 변경되는지 관찰을 시작한다.
         */
        static observe(): void {
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
        static disconnect(): void {
            if (Aui.Window.isObserve == true) {
                Aui.Window.observer?.disconnect();
                Aui.Window.isObserve = false;
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
         * 윈도우 하단 레이아웃을 랜더링한다.
         */
        renderBottom(): void {
            const $bottom = this.$getBottom();

            for (const button of this.buttons) {
                $bottom.append(button.$getComponent());
                button.render();
            }
        }

        /**
         * 윈도우 레이아웃을 랜더링한다.
         */
        render(): void {
            super.render();

            if (this.resizable == false || this.resizer !== undefined) return;

            this.resizer = new Aui.Resizer(this.$component, Aui.$getAbsolute(), {
                directions: [true, true, true, true],
                listeners: {
                    end: (_$target: Dom, rect: DOMRect) => {
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
        onRender(): void {
            super.onRender();

            if (this.modal == true) {
                this.$getComponent().addClass('modal');
            }

            this.$getComponent().on('keydown', (e: KeyboardEvent) => {
                if (e.key == 'Escape' && this.closable === true) {
                    this.close();
                }

                e.stopPropagation();
            });
        }
    }
}
