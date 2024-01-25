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
namespace Aui {
    export namespace Text {
        export interface Properties extends Aui.Component.Properties {
            /**
             * @type {string} text - 텍스트
             */
            text?: string;

            /**
             * @type {string} html - HTML태그
             */
            html?: string;
        }
    }

    export class Text extends Aui.Component {
        type: string = 'text';
        role: string = 'text';
        border: boolean;
        text: string;
        html: string;

        $text: Dom;

        /**
         * 텍스트 객체를 생성한다.
         *
         * @param {Aui.Text.Properties|string} properties - 객체설정 또는 문자열
         */
        constructor(properties: Aui.Text.Properties | string) {
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
        setText(text: string): void {
            this.text = text;
            this.$text.text(text);
        }

        /**
         * 텍스트객체의 HTML태그를 설정한다.
         *
         * @param {string} html
         */
        setHtml(html: string): void {
            this.html = html;
            this.$text.html(html);
        }

        /**
         * 텍스트 내용을 랜더링한다.
         */
        renderContent(): void {
            if (this.html) {
                this.$text.html(this.html);
            } else {
                this.$text.text(this.text);
            }
            this.$getContent().append(this.$text);
        }
    }
}
