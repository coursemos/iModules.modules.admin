/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 버튼 클래스를 정의한다.
 *
 * @file /scripts/Aui.Button.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 9. 7.
 */
namespace Aui {
    export namespace Button {
        export interface Listeners extends Aui.Component.Listeners {
            /**
             * @type {Function} toggle - 버튼의 토글상태가 변경되었을 때
             */
            toggle?: (button: Aui.Button, pressed: boolean) => void;

            /**
             * @type {Function} click - 버튼이 클릭되었을 때
             */
            click?: (button: Aui.Button) => void;

            /**
             * @type {Function} change - 버튼값이 변경되었을 때
             */
            change?: (button: Aui.Button, value: any) => void;

            /**
             * @type {Function} render - 버튼이 랜더링되었을 때
             */
            render?: (button: Aui.Button) => void;
        }

        export interface Properties extends Aui.Component.Properties {
            /**
             * @type {string} action - 버튼액션명
             */
            action?: string;

            /**
             * @type {string} text - 버튼텍스트
             */
            text?: string;

            /**
             * @type {'center'|'left'|'right'} textAlign - 텍스트정렬
             */
            textAlign?: 'center' | 'left' | 'right';

            /**
             * @type {string} iconClass - 아이콘 스타일시트 클래스
             */
            iconClass?: string;

            /**
             * @type {string} buttonClass - 버튼 스타일시트 클래스
             */
            buttonClass?: string;

            /**
             * @type {number} tabIndex - 탭 인덱스
             */
            tabIndex?: number;

            /**
             * @type {boolean} toggle - 토글여부
             */
            toggle?: boolean;

            /**
             * @type {boolean} pressed - 토글이 활성화된 상태에서 토글활성화여부
             */
            pressed?: boolean;

            /**
             * @type {any} value - 버튼값
             */
            value?: any;

            /**
             * @type {Function} handler - 버튼 클릭 핸들러
             */
            handler?: (button: Aui.Button) => void;

            /**
             * @type {Aui.Menu} menu - 버튼메뉴
             */
            menu?: Aui.Menu;

            /**
             * @type {(Aui.Menu.Item|Aui.Menu.Item.Properties)[]} menus - 버튼메뉴
             */
            menus?: (Aui.Menu.Item | Aui.Menu.Item.Properties)[];

            /**
             * @type {boolean} hideArrow - 메뉴가 존재할 경우 dropdown 화살표를 숨길지 여부
             */
            hideArrow?: boolean;

            /**
             * @type {Aui.Button.Listeners} listeners - 이벤트리스너
             */
            listeners?: Aui.Button.Listeners;
        }
    }

    export class Button extends Aui.Component {
        type: string = 'button';
        role: string = 'button';
        action: string;
        text: string;
        textAlign: 'center' | 'left' | 'right';
        iconClass: string;
        buttonClass: string;
        tabIndex: number;
        toggle: boolean;
        pressed: boolean;
        value: any;
        handler: Function;

        menu: Aui.Menu;
        hideArrow: boolean;

        $button: Dom;

        /**
         * 버튼을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties: Aui.Button.Properties = null) {
            super(properties);

            this.action = this.properties.action ?? null;
            this.text = this.properties.text ?? '';
            this.textAlign = this.properties.textAlign ?? 'center';
            this.iconClass = this.properties.iconClass ?? null;
            this.buttonClass = this.properties.buttonClass ?? null;
            this.tabIndex = this.properties.tabIndex ?? null;
            this.toggle = this.properties.toggle ?? false;
            this.pressed = this.properties.pressed === true;
            this.value = this.properties.value ?? null;
            this.handler = this.properties.handler ?? null;
            this.hideArrow = this.properties.hideArrow === true;

            if (this.properties.menu instanceof Aui.Menu) {
                this.menu = this.properties.menu;
            } else if (Array.isArray(this.properties.menus ?? null) == true && this.properties.menus.length > 0) {
                this.menu = new Aui.Menu(this.properties.menus);
            } else {
                this.menu = null;
            }

            if (this.menu !== null) {
                this.menu.setParent(this);
                this.menu.addEvent('show', (menu: Aui.Menu) => {
                    (menu.$target as Dom).addClass('opened');
                });
                this.menu.addEvent('hide', (menu: Aui.Menu) => {
                    (menu.$target as Dom).removeClass('opened');
                });

                if (this.handler !== null) {
                    this.$setBottom();
                }
            }
        }

        /**
         * 버튼 DOM 을 가져온다.
         *
         * @return {Dom} $button
         */
        $getButton(): Dom {
            if (this.$button === undefined) {
                this.$button = Html.create('button').setAttr('type', 'button');
                this.$button.setStyle('text-align', this.textAlign);
                if (this.tabIndex !== null) {
                    this.$button.setAttr('tabindex', this.tabIndex.toString());
                }
                if (this.buttonClass !== null) {
                    this.$button.addClass(...this.buttonClass.split(' '));
                }
                if (this.menu !== null && this.handler === null && this.hideArrow == false) {
                    this.$button.addClass('menu');
                }
                this.$button.on('click', () => {
                    this.onClick();
                });
            }

            return this.$button;
        }

        /**
         * 버튼의 메뉴를 가져온다.
         *
         * @return {Aui.Menu} menu
         */
        getMenu(): Aui.Menu {
            return this.menu;
        }

        /**
         * 아이콘 클래스를 변경한다.
         *
         * @param {string} iconClass - 변경할 아이콘 클래스
         */
        setIconClass(iconClass: string = null): void {
            this.iconClass = iconClass;

            if (this.isRendered() == true) {
                const $button = this.$getButton();
                const $icon = Html.get('> i.icon', $button);

                if (this.iconClass === null) {
                    if ($icon.getEl() !== null) {
                        $icon.remove();
                    }
                } else {
                    if ($icon.getEl() !== null) {
                        $icon.removeClass().addClass('icon', ...this.iconClass.split(' '));
                    } else {
                        const $icon = Html.create('i').addClass('icon');
                        $icon.addClass(...this.iconClass.split(' '));
                        this.$button.prepend($icon);
                    }
                }
            }
        }

        /**
         * 버튼 텍스트를 변경한다.
         *
         * @param {string} text - 변경할 텍스트
         */
        setText(text: string = null): void {
            this.text = text;

            if (this.isRendered() == true) {
                const $button = this.$getButton();
                const $text = Html.get('> span', $button);

                if (this.text === null) {
                    if ($text.getEl() !== null) {
                        $text.remove();
                    }
                } else {
                    if ($text.getEl() !== null) {
                        $text.html(text);
                    } else {
                        const $text = Html.create('span').html(this.text);
                        $button.append($text);
                    }
                }
            }
        }

        /**
         * 토글 상태를 변경한다.
         *
         * @param {boolean} pressed - 토글여부
         */
        setPressed(pressed: boolean): void {
            this.pressed = pressed;
            if (this.pressed == true) {
                this.$getButton().addClass('pressed');
            } else {
                this.$getButton().removeClass('pressed');
            }

            this.fireEvent('toggle', [this, this.pressed]);
        }

        /**
         * 버튼의 비활성화여부를 설정한다.
         *
         * @param {boolean} disabled - 비활성여부
         * @return {Aui.Button} this
         */
        setDisabled(disabled: boolean): this {
            if (disabled == true) {
                this.$getButton().setAttr('disabled', 'disabled');
            } else {
                this.$getButton().removeAttr('disabled');
            }

            return super.setDisabled(disabled);
        }

        /**
         * 버튼의 로딩상태여부를 설정한다.
         *
         * @param {boolean} loading - 로딩상태여부
         * @return {Aui.Button} this
         */
        setLoading(loading: boolean): this {
            if (loading == true) {
                this.$getButton().addClass('loading');
            } else {
                this.$getButton().removeClass('loading');
            }

            this.setDisabled(loading);
            return this;
        }

        /**
         * 버튼값을 가져온다.
         *
         * @return {any} value
         */
        getValue(): any {
            return this.value;
        }

        /**
         * 버튼값을 지정한다.
         *
         * @return {any} value
         */
        setValue(value: any): any {
            if (this.value !== value) {
                this.value = value;
                this.fireEvent('change', [this, value]);
            }
        }

        /**
         * 버튼이 눌린 상태인지 가져온다.
         *
         * @return {boolean} pressed
         */
        isPressed(): boolean {
            return this.pressed;
        }

        /**
         * 레이아웃을 렌더링한다.
         */
        renderContent(): void {
            if (this.iconClass !== null) {
                const $icon = Html.create('i').addClass('icon');
                $icon.addClass(...this.iconClass.split(' '));
                this.$getButton().append($icon);
            }

            if (this.text !== null) {
                const $text = Html.create('span').html(this.text);
                this.$getButton().append($text);
            }

            if (this.pressed === true) {
                this.setPressed(true);
            }

            this.$getContent().append(this.$getButton());
        }

        /**
         * 메뉴 버튼을 렌더링한다.
         */
        renderBottom(): void {
            if (this.menu !== null && this.handler !== null) {
                const $button = Html.create('button').setAttr('type', 'button');
                if (this.buttonClass !== null) {
                    $button.addClass(...this.buttonClass.split(' '));
                }
                $button.on('click', () => {
                    this.menu.showAt($button, 'y');
                });
                this.$getBottom().append($button);
            }
        }

        /**
         * 버튼 클릭이벤트를 처리한다.
         */
        onClick(): void {
            if (this.toggle == true) {
                this.setPressed(!this.pressed);
            }

            if (this.handler !== null) {
                this.handler(this);
            } else if (this.menu !== null) {
                this.menu.showAt(this.$getButton(), 'y');
            }

            this.fireEvent('click', [this]);
        }
    }

    export namespace SegmentedButton {
        export interface Listeners extends Aui.Component.Listeners {
            /**
             * @type {Function} change - 분할버튼의 선택값이 변경되었을 때
             */
            change?: (button: Aui.SegmentedButton, value: any) => void;
        }

        export interface Properties extends Aui.Component.Properties {
            /**
             * @type {'row'|'column'} direction - 선택버튼 방향
             */
            direction?: 'row' | 'column';

            /**
             * @type {Aui.Button|Aui.Button.Properties}[] items - 선택버튼
             */
            items: (Aui.Button | Aui.Button.Properties)[];

            /**
             * @type {boolean} toggle - 토글여부
             */
            toggle?: boolean;

            /**
             * @type {boolean} value - 선택된 값
             */
            value?: string | number;

            /**
             * @type {Aui.SegmentedButton.Listeners} listeners - 이벤트리스너
             */
            listeners?: Aui.SegmentedButton.Listeners;
        }
    }

    export class SegmentedButton extends Aui.Component {
        type: string = 'button';
        role: string = 'segmented';

        direction: 'row' | 'column';
        pressedButton: Aui.Button;
        toggle: boolean;
        value: string | number;

        /**
         * 분할버튼을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties: Aui.SegmentedButton.Properties = null) {
            super(properties);

            this.direction = this.properties.direction ?? 'row';
            this.toggle = this.properties.toggle === true;
            this.value = this.properties.value ?? null;
        }

        /**
         * 분할버튼의 각 버튼을 초기화한다.
         */
        initItems(): void {
            let pressed: Aui.Button = null;
            if (this.items === null) {
                this.items = [];
                for (let item of this.properties.items ?? []) {
                    if (item instanceof Aui.Button) {
                    } else if (typeof item == 'object') {
                        item = new Aui.Button(item);
                    }
                    item.toggle = false;

                    if (item.isPressed() === true) {
                        pressed = item;
                    }

                    if (item.handler === null) {
                        item.addEvent('click', (button: Aui.Button) => {
                            if (button.isPressed() == true && this.toggle == false) {
                                button.setPressed(true);
                                return;
                            }

                            if (button.isPressed() == false) {
                                this.setValue(button.getValue());
                            } else {
                                this.setValue(null);
                            }
                        });
                    }

                    this.items.push(item);
                }
            }

            if (pressed !== null) {
                this.setValue(pressed.getValue());
            }

            super.initItems();
        }

        /**
         * 선택값을 변경한다.
         *
         * @param {string|number} value - 변경할 값
         */
        setValue(value: string | number): void {
            for (const button of this.items as Aui.Button[]) {
                if (button.isPressed() == true && button.getValue() !== value) {
                    button.setPressed(false);
                }

                if (value !== null && button.getValue() === value) {
                    button.setPressed(true);
                }
            }

            if (this.value !== value) {
                this.value = value;
                this.fireEvent('change', [this, value]);
            }
        }

        /**
         * 선택된 값을 가져온다.
         *
         * @return {string|number} value
         */
        getValue(): string | number {
            return this.value;
        }

        /**
         * 선택버튼을 랜더링한다.
         */
        render(): void {
            this.$getContent().addClass(this.direction);

            super.render();

            if (this.value !== null) {
                this.setValue(this.value);
            }
        }
    }
}
