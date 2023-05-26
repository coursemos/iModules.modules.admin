/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 버튼 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Button.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 5. 26.
 */
namespace Admin {
    export namespace Button {
        export interface Properties extends Admin.Component.Properties {
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
             * @type {string|number} value - 버튼값
             */
            value?: string | number;

            /**
             * @type {Function} handler - 버튼 클릭 핸들러
             */
            handler?: (button: Admin.Button) => void;
        }
    }

    export class Button extends Admin.Component {
        type: string = 'button';
        role: string = 'button';
        text: string;
        textAlign: 'center' | 'left' | 'right';
        iconClass: string;
        buttonClass: string;
        tabIndex: number;
        toggle: boolean;
        pressed: boolean;
        value: string | number;
        handler: Function;

        $button: Dom;

        /**
         * 버튼을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties: Admin.Button.Properties = null) {
            super(properties);

            this.text = this.properties.text ?? '';
            this.textAlign = this.properties.textAlign ?? 'center';
            this.iconClass = this.properties.iconClass ?? null;
            this.buttonClass = this.properties.buttonClass ?? null;
            this.tabIndex = this.properties.tabIndex ?? null;
            this.toggle = this.properties.toggle ?? false;
            this.pressed = this.properties.pressed === true;
            this.value = this.properties.value ?? null;
            this.handler = this.properties.handler ?? null;
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
                if (this.tabIndex !== null) this.$button.setAttr('tabindex', this.tabIndex.toString());
                if (this.buttonClass !== null) {
                    this.$button.addClass(...this.buttonClass.split(' '));
                }
            }

            return this.$button;
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
         * @return {Admin.Component} this
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
         * 버튼값을 가져온다.
         *
         * @returns {string|number} value
         */
        getValue(): string | number {
            return this.value;
        }

        /**
         * 버튼이 눌린 상태인지 가져온다.
         *
         * @returns {boolean} pressed
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

            this.$getButton().on('click', () => {
                this.onClick();
            });

            this.$getContent().append(this.$getButton());
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
            }

            this.fireEvent('click', [this]);
        }
    }

    export namespace SegmentedButton {
        export interface Properties extends Admin.Component.Properties {
            /**
             * @type {'row'|'column'} direction - 선택버튼 방향
             */
            direction?: 'row' | 'column';

            /**
             * @type {Admin.Button|Admin.Button.Properties}[] items - 선택버튼
             */
            items: (Admin.Button | Admin.Button.Properties)[];

            /**
             * @type {boolean} toggle - 토글여부
             */
            toggle?: boolean;

            /**
             * @type {boolean} value - 선택된 값
             */
            value?: string | number;
        }
    }

    export class SegmentedButton extends Admin.Component {
        type: string = 'button';
        role: string = 'segmented';

        direction: 'row' | 'column';
        pressedButton: Admin.Button;
        toggle: boolean;
        value: string | number;

        /**
         * 분할버튼을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties: Admin.SegmentedButton.Properties = null) {
            super(properties);

            this.direction = this.properties.direction ?? 'row';
            this.toggle = this.properties.toggle === true;
            this.value = this.properties.value ?? null;
        }

        /**
         * 분할버튼의 각 버튼을 초기화한다.
         */
        initItems(): void {
            let pressed: Admin.Button = null;
            if (this.items === null) {
                this.items = [];
                for (let item of this.properties.items ?? []) {
                    if (item instanceof Admin.Button) {
                    } else if (typeof item == 'object') {
                        item = new Admin.Button(item);
                    }
                    item.toggle = false;

                    if (item.isPressed() === true) {
                        pressed = item;
                    }

                    item.addEvent('click', (button: Admin.Button) => {
                        if (button.isPressed() == true && this.toggle == false) {
                            console.log('취소불가');
                            button.setPressed(true);
                            return;
                        }

                        if (button.isPressed() == false) {
                            this.setValue(button.getValue());
                        } else {
                            this.setValue(null);
                        }
                    });

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
            if (this.value === value) {
                return;
            }

            this.value = value;

            for (const button of this.items as Admin.Button[]) {
                if (button.isPressed() == true && button.getValue() !== value) {
                    button.setPressed(false);
                }

                if (value !== null && button.getValue() === value) {
                    button.setPressed(true);
                }
            }

            this.fireEvent('change', [this, this.value]);
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

            if (this.value !== null) {
                this.setValue(this.value);
            }

            super.render();
        }
    }
}
