/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 타이틀 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Title.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 1.
 */
namespace Admin {
    export class Title extends Admin.Component {
        type: string = 'title';
        role: string = 'title';
        title: string;
        iconClass: string;
        tools: Admin.Title.Tool[] = [];

        /**
         * 텍스트 객체를 생성한다.
         *
         * @param {Object|string} properties 객체설정
         */
        constructor(properties: { [key: string]: any } | string) {
            if (typeof properties == 'string') {
                const title = properties;
                properties = { title: title };
            }
            super(properties);

            this.title = this.properties.title ?? '';
            this.iconClass = this.properties.iconClass ?? '';
        }

        /**
         * 제목 아이콘을 설정한다.
         *
         * @param {string} iconClass
         */
        setIconClass(iconClass: string): void {
            this.iconClass = iconClass;
        }

        /**
         * 툴버튼을 추가한다.
         *
         * @param {string} text - 툴버튼명
         * @param {string} iconClass - 툴아이콘 스타일
         * @param {Function} handler - 툴버튼 클릭 핸들러
         */
        addTool(text: string, iconClass: string, handler: Function): void {
            const tool = new Admin.Title.Tool({ text: text, iconClass: iconClass, handler: handler });
            this.tools.push(tool);

            this.renderBottom();
        }

        /**
         * 제목 아이콘을 랜더링한다.
         */
        renderTop(): void {
            if (this.iconClass == '') return;

            const $top = this.$getTop(true);
            const $i = Html.create('i').addClass(...this.iconClass.split(' '));
            $top.append($i);
        }

        /**
         * 제목을 랜더링한다.
         */
        renderContent(): void {
            this.$getContent().text(this.title);
        }

        /**
         * 툴버튼을 랜더링한다.
         */
        renderBottom(): void {
            if (this.tools.length == 0) return;

            this.$getBottom(true).empty();
            this.tools.forEach((tool: Admin.Title.Tool) => {
                this.$getBottom().append(tool.$getComponent());
                tool.render();
            });
        }
    }

    export namespace Title {
        export class Tool extends Admin.Component {
            type: string = 'title';
            role: string = 'tool';
            text: string;
            iconClass: string;
            handler: Function;

            /**
             * 툴버튼 객체를 생성한다.
             *
             * @param {Object} properties 객체설정
             */
            constructor(properties: { [key: string]: any }) {
                super(properties);

                this.text = this.properties.text ?? null;
                this.iconClass = this.properties.iconClass ?? null;
                this.handler = this.properties.handler ?? null;
            }

            /**
             * 버튼을 랜더링한다.
             */
            renderContent(): void {
                const $button = Html.create('button', { 'type': 'button' });
                if (this.iconClass != null) {
                    $button.addClass(...this.iconClass.split(' '));
                }
                this.$component.append($button);
                $button.on('click', () => {
                    this.handler(this);
                });
            }
        }
    }
}
