/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 텍스트 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Text.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 1.
 */
var Admin;
(function (Admin) {
    class Text extends Admin.Component {
        type = 'text';
        role = 'text';
        border;
        text;
        $text;
        /**
         * 텍스트 객체를 생성한다.
         *
         * @param {Object|string} properties 객체설정
         */
        constructor(properties) {
            if (typeof properties == 'string') {
                const text = properties;
                properties = { text: text };
            }
            super(properties);
            this.text = this.properties.text ?? '';
            this.$text = Html.create('div');
        }
        setText(text) {
            this.text = text;
            this.$text.text(text);
        }
        /**
         * 텍스트 내용을 랜더링한다.
         */
        renderContent() {
            this.$text.text(this.text);
            this.$getContent().append(this.$text);
        }
    }
    Admin.Text = Text;
})(Admin || (Admin = {}));
