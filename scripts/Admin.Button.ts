/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 버튼 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Button.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 1.
 */
namespace Admin {
    export class Button extends Admin.Component {
        type: string = 'button';
        role: string = 'button';
        text: string;
        iconClass: string;
        toggle: boolean;
        pressed: boolean;
        handler: Function;

        $button: Dom;

        /**
         * 버튼을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties: { [key: string]: any } = null) {
            super(properties);

            this.text = this.properties.text ?? '';
            this.iconClass = this.properties.iconClass ?? null;
            this.toggle = this.properties.toggle ?? false;
            this.pressed = false;
            this.handler = this.properties.handler ?? null;

            this.$button ??= Html.create('button').setAttr('type', 'button');
        }

        /**
         * 레이아웃을 렌더링한다.
         */
        render(): void {
            if (this.iconClass !== null) {
                let $icon = Html.create('i').addClass('icon');
                $icon.addClass(...this.iconClass.split(' '));
                this.$button.append($icon);
            }

            if (this.text !== null) {
                let $text = Html.create('span').text(this.text);
                this.$button.append($text);
            }

            if (this.handler !== null || this.toggle === true) {
                this.$button.on('click', () => {
                    if (this.toggle == true) {
                        this.setPressed(!this.pressed);
                    }

                    if (this.handler !== null) {
                        this.handler(this);
                    }
                });
            }

            this.append(this.$button);
            super.render();
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
        }
    }
}
