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
var Admin;
(function (Admin) {
    class Title extends Admin.Component {
        type = 'title';
        role = 'title';
        title;
        iconClass;
        tools = [];
        $title;
        $tools;
        /**
         * 텍스트 객체를 생성한다.
         *
         * @param {Object|string} properties 객체설정
         */
        constructor(properties) {
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
        setIconClass(iconClass) {
            this.iconClass = iconClass;
        }
        /**
         * 툴버튼을 추가한다.
         *
         * @param {string} text - 툴버튼명
         * @param {string} iconClass - 툴아이콘 스타일
         * @param {Function} handler - 툴버튼 클릭 핸들러
         */
        addTool(text, iconClass, handler) {
            const tool = new Admin.Title.Tool({ text: text, iconClass: iconClass, handler: handler });
            this.tools.push(tool);
            if (this.$tools.getData('rendered') == true) {
                this.$tools.append(tool.$getComponent());
                tool.render();
            }
        }
        renderTools() {
            if (this.$tools.getData('rendered') == true)
                return;
            this.tools.forEach((tool) => {
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
    Admin.Title = Title;
    (function (Title) {
        class Tool extends Admin.Component {
            type = 'title';
            role = 'tool';
            text;
            iconClass;
            handler;
            /**
             * 툴버튼 객체를 생성한다.
             *
             * @param {Object} properties 객체설정
             */
            constructor(properties) {
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
        Title.Tool = Tool;
    })(Title = Admin.Title || (Admin.Title = {}));
})(Admin || (Admin = {}));
