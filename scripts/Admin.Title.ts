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

        $title: Dom;
        $tools: Dom;

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
            this.$title = Html.create('span');
            this.$tools = Html.create('div', { 'data-role': 'tools' });
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

            if (this.$tools.getData('rendered') == true) {
                this.$tools.append(tool.$getComponent());
                tool.render();
            }
        }

        renderTools(): void {
            if (this.$tools.getData('rendered') == true) return;

            this.tools.forEach((tool: Admin.Title.Tool) => {
                this.$tools.append(tool.$getComponent());
                tool.render();
            });

            this.$tools.setData('rendered', true, false);
        }

        /**
         * 레이아웃을 렌더링한다.
         */
        render() {
            if (this.isRenderable() == true) {
                this.$title.text(this.title);
                this.$component.append(this.$title);
                this.$component.append(this.$tools);
                this.renderTools();
                this.rendered();
            }
            super.render();
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
             * 레이아웃을 렌더링한다.
             */
            render() {
                if (this.isRenderable() == true) {
                    const $button = Html.create('button', { 'type': 'button' });
                    if (this.iconClass != null) {
                        $button.addClass(...this.iconClass.split(' '));
                    }
                    this.$component.append($button);
                    $button.on('click', () => {
                        this.handler(this);
                    });
                    this.rendered();
                }

                super.render();
            }
        }
    }
}
