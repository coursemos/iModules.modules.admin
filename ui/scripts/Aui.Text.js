/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 텍스트 클래스를 정의한다.
 *
 * @file /scripts/Aui.Text.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 */
var Aui;
(function (Aui) {
    class Text extends Aui.Component {
        type = 'text';
        role = 'text';
        border;
        text;
        html;
        $text;
        /**
         * 텍스트 객체를 생성한다.
         *
         * @param {Aui.Text.Properties|string} properties - 객체설정 또는 문자열
         */
        constructor(properties) {
            if (typeof properties == 'string') {
                const text = properties;
                properties = { text: text };
            }
            super(properties);
            this.text = this.properties.text ?? '';
            this.html = this.properties.html ?? '';
            this.scrollable = false;
            this.$text = Html.create('div');
        }
        /**
         * 텍스트객체의 문자열을 설정한다.
         *
         * @param {string} text
         */
        setText(text) {
            this.text = text;
            this.$text.text(text);
        }
        /**
         * 텍스트객체의 HTML태그를 설정한다.
         *
         * @param {string} html
         */
        setHtml(html) {
            this.html = html;
            this.$text.html(html);
        }
        /**
         * 텍스트 내용을 랜더링한다.
         */
        renderContent() {
            if (this.html) {
                this.$text.html(this.html);
            }
            else {
                this.$text.text(this.text);
            }
            this.$getContent().append(this.$text);
        }
    }
    Aui.Text = Text;
})(Aui || (Aui = {}));
