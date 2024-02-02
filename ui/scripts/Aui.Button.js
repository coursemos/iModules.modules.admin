/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 버튼 클래스를 정의한다.
 *
 * @file /scripts/Aui.Button.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
var Aui;
(function (Aui) {
    class Button extends Aui.Component {
        type = 'button';
        role = 'button';
        action;
        text;
        textAlign;
        iconClass;
        buttonClass;
        tabIndex;
        toggle;
        pressed;
        value;
        handler;
        menu;
        $button;
        /**
         * 버튼을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
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
            if (this.properties.menu instanceof Aui.Menu) {
                this.menu = this.properties.menu;
            }
            else if (Array.isArray(this.properties.menus ?? null) == true && this.properties.menus.length > 0) {
                this.menu = new Aui.Menu(this.properties.menus);
            }
            else {
                this.menu = null;
            }
            if (this.menu !== null) {
                this.menu.addEvent('show', () => {
                    this.$getButton().addClass('opened');
                });
                this.menu.addEvent('hide', () => {
                    this.$getButton().removeClass('opened');
                });
            }
        }
        /**
         * 버튼 DOM 을 가져온다.
         *
         * @return {Dom} $button
         */
        $getButton() {
            if (this.$button === undefined) {
                this.$button = Html.create('button').setAttr('type', 'button');
                this.$button.setStyle('text-align', this.textAlign);
                if (this.tabIndex !== null)
                    this.$button.setAttr('tabindex', this.tabIndex.toString());
                if (this.buttonClass !== null) {
                    this.$button.addClass(...this.buttonClass.split(' '));
                }
                if (this.menu !== null) {
                    this.$button.addClass('menu');
                }
            }
            return this.$button;
        }
        /**
         * 아이콘 클래스를 변경한다.
         *
         * @param {string} iconClass - 변경할 아이콘 클래스
         */
        setIconClass(iconClass = null) {
            this.iconClass = iconClass;
            if (this.isRendered() == true) {
                const $button = this.$getButton();
                const $icon = Html.get('> i.icon', $button);
                if (this.iconClass === null) {
                    if ($icon.getEl() !== null) {
                        $icon.remove();
                    }
                }
                else {
                    if ($icon.getEl() !== null) {
                        $icon.removeClass().addClass('icon', ...this.iconClass.split(' '));
                    }
                    else {
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
        setText(text = null) {
            this.text = text;
            if (this.isRendered() == true) {
                const $button = this.$getButton();
                const $text = Html.get('> span', $button);
                if (this.text === null) {
                    if ($text.getEl() !== null) {
                        $text.remove();
                    }
                }
                else {
                    if ($text.getEl() !== null) {
                        $text.html(text);
                    }
                    else {
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
        setPressed(pressed) {
            this.pressed = pressed;
            if (this.pressed == true) {
                this.$getButton().addClass('pressed');
            }
            else {
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
        setDisabled(disabled) {
            if (disabled == true) {
                this.$getButton().setAttr('disabled', 'disabled');
            }
            else {
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
        setLoading(loading) {
            if (loading == true) {
                this.$getButton().addClass('loading');
            }
            else {
                this.$getButton().removeClass('loading');
            }
            this.setDisabled(loading);
            return this;
        }
        /**
         * 버튼값을 가져온다.
         *
         * @return {string|number} value
         */
        getValue() {
            return this.value;
        }
        /**
         * 버튼이 눌린 상태인지 가져온다.
         *
         * @return {boolean} pressed
         */
        isPressed() {
            return this.pressed;
        }
        /**
         * 레이아웃을 렌더링한다.
         */
        renderContent() {
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
        onClick() {
            if (this.menu === null) {
                if (this.toggle == true) {
                    this.setPressed(!this.pressed);
                }
                if (this.handler !== null) {
                    this.handler(this);
                }
            }
            else {
                this.menu.showAt(this.$getButton(), 'y');
            }
            this.fireEvent('click', [this]);
        }
    }
    Aui.Button = Button;
    class SegmentedButton extends Aui.Component {
        type = 'button';
        role = 'segmented';
        direction;
        pressedButton;
        toggle;
        value;
        rawValue;
        /**
         * 분할버튼을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.direction = this.properties.direction ?? 'row';
            this.toggle = this.properties.toggle === true;
            this.value = null;
            this.rawValue = this.properties.value ?? null;
        }
        /**
         * 분할버튼의 각 버튼을 초기화한다.
         */
        initItems() {
            let pressed = null;
            if (this.items === null) {
                this.items = [];
                for (let item of this.properties.items ?? []) {
                    if (item instanceof Aui.Button) {
                    }
                    else if (typeof item == 'object') {
                        item = new Aui.Button(item);
                    }
                    item.toggle = false;
                    if (item.isPressed() === true) {
                        pressed = item;
                    }
                    item.addEvent('click', (button) => {
                        if (button.isPressed() == true && this.toggle == false) {
                            button.setPressed(true);
                            return;
                        }
                        if (button.isPressed() == false) {
                            this.setValue(button.getValue());
                        }
                        else {
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
        setValue(value) {
            if (this.value === value) {
                return;
            }
            this.value = value;
            for (const button of this.items) {
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
        getValue() {
            return this.value;
        }
        /**
         * 선택버튼을 랜더링한다.
         */
        render() {
            this.$getContent().addClass(this.direction);
            super.render();
            if (this.rawValue !== null) {
                this.setValue(this.rawValue);
            }
        }
    }
    Aui.SegmentedButton = SegmentedButton;
})(Aui || (Aui = {}));
