/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 타이틀 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Title.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 20.
 */
var Admin;
(function (Admin) {
    class Title extends Admin.Component {
        type = 'title';
        role = 'title';
        title;
        iconClass;
        movable;
        drag;
        tools;
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
            this.tools = this.properties.tools ?? [];
            this.$setTop();
            this.$setBottom();
        }
        /**
         * 부모객체를 지정한다.
         *
         * @param {Admin.Component} parent - 부모객체
         * @return {Admin.Component} this
         */
        setParent(parent) {
            super.setParent(parent);
            this.setMovable(this.properties.movable ?? false);
            return this;
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
         * 제목을 포함한 상위 컴포넌트의 이동가능여부를 설정한다.
         *
         * @param {boolean} movable
         */
        setMovable(movable) {
            if (this.movable == movable)
                return;
            this.movable = movable;
            if (this.getParent() != null && this.movable == true) {
                if (typeof this.getParent()['moveTo'] === 'function') {
                    this.$getContent().addClass('movable');
                    if (this.drag == undefined) {
                        new Admin.Drag(this.$getContent(), {
                            pointerType: ['mouse', 'touch', 'pen'],
                            listeners: {
                                start: () => {
                                    this.getParent().$getComponent().addClass('moving');
                                },
                                drag: (_$target, tracker) => {
                                    if (typeof this.getParent()['moveTo'] === 'function') {
                                        const { x, y } = tracker.getDelta();
                                        this.getParent().moveTo(x, y);
                                    }
                                },
                                end: () => {
                                    this.getParent().$getComponent().removeClass('moving');
                                },
                            },
                        });
                    }
                }
            }
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
            this.renderBottom();
        }
        /**
         * 제목 아이콘을 랜더링한다.
         */
        renderTop() {
            if (this.iconClass == '')
                return;
            const $top = this.$getTop();
            const $i = Html.create('i').addClass(...this.iconClass.split(' '));
            $top.append($i);
        }
        /**
         * 제목을 랜더링한다.
         */
        renderContent() {
            this.$getContent().text(this.title);
        }
        /**
         * 툴버튼을 랜더링한다.
         */
        renderBottom() {
            if (this.tools.length == 0)
                return;
            this.$getBottom().empty();
            this.tools.forEach((tool) => {
                this.$getBottom().append(tool.$getComponent());
                tool.render();
            });
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
             * 버튼을 랜더링한다.
             */
            renderContent() {
                const $button = Html.create('button', { 'type': 'button' });
                if (this.iconClass != null) {
                    $button.addClass(...this.iconClass.split(' '));
                }
                this.$content.append($button);
                $button.on('click', () => {
                    this.handler(this);
                });
            }
        }
        Title.Tool = Tool;
    })(Title = Admin.Title || (Admin.Title = {}));
})(Admin || (Admin = {}));
