/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 버튼 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Button.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 27.
 */
namespace Admin {
    export namespace Button {
        export interface Properties extends Admin.Component.Properties {
            /**
             * @type {string} text - 버튼텍스트
             */
            text?: string;

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
             * @type {Function} handler - 버튼 클릭 핸들러
             */
            handler?: (button: Admin.Button) => void;
        }
    }

    export class Button extends Admin.Component {
        type: string = 'button';
        role: string = 'button';
        text: string;
        iconClass: string;
        buttonClass: string;
        tabIndex: number;
        toggle: boolean;
        pressed: boolean;
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
            this.iconClass = this.properties.iconClass ?? null;
            this.buttonClass = this.properties.buttonClass ?? null;
            this.tabIndex = this.properties.tabIndex ?? null;
            this.toggle = this.properties.toggle ?? false;
            this.pressed = this.properties.pressed === true;
            this.handler = this.properties.handler ?? null;

            this.$button = Html.create('button').setAttr('type', 'button');
            if (this.tabIndex !== null) this.$button.setAttr('tabindex', this.tabIndex.toString());
            if (this.buttonClass !== null) {
                this.$button.addClass(...this.buttonClass.split(' '));
            }
        }

        /**
         * 버튼의 비활성화여부를 설정한다.
         *
         * @param {boolean} disabled - 비활성여부
         * @return {Admin.Component} this
         */
        setDisabled(disabled: boolean): this {
            if (disabled == true) {
                this.$button.setAttr('disabled', 'disabled');
            } else {
                this.$button.removeAttr('disabled');
            }

            return super.setDisabled(disabled);
        }

        /**
         * 레이아웃을 렌더링한다.
         */
        renderContent(): void {
            if (this.iconClass !== null) {
                const $icon = Html.create('i').addClass('icon');
                $icon.addClass(...this.iconClass.split(' '));
                this.$button.append($icon);
            }

            if (this.text !== null) {
                const $text = Html.create('span').html(this.text);
                this.$button.append($text);
            }

            if (this.handler !== null || this.toggle === true) {
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
         * 토글 상태를 변경한다.
         *
         * @param {boolean} toggle - 토글여부
         */
        setPressed(toggle: boolean): void {
            this.pressed = toggle;
            if (this.pressed == true) {
                this.$button.addClass('pressed');
            } else {
                this.$button.removeClass('pressed');
            }

            this.fireEvent('toggle', [this, this.pressed]);
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
        }
    }
}
