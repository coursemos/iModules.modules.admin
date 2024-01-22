/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 타이틀 클래스를 정의한다.
 *
 * @file /scripts/Aui.Title.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
var Aui;
(function (Aui) {
    class Title extends Aui.Component {
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
         * @param {Aui.Title.Properties|string} properties 객체설정
         */
        constructor(properties = null) {
            if (typeof properties == 'string') {
                const title = properties;
                properties = { title: title };
            }
            super(properties);
            this.title = this.properties.title ?? '';
            this.iconClass = this.properties.iconClass ?? '';
            this.tools = this.properties.tools ?? [];
        }
        /**
         * 부모객체를 지정한다.
         *
         * @param {Aui.Component} parent - 부모객체
         * @return {Aui.Component} this
         */
        setParent(parent) {
            super.setParent(parent);
            this.setMovable(this.properties.movable ?? false);
            return this;
        }
        /**
         * 제목 텍스트를 설정한다.
         *
         * @param {string} title
         */
        setTitle(title) {
            this.title = title;
            if (this.isRendered() == true) {
                const $text = Html.get('> span', this.$getContent());
                $text.html(this.title);
            }
        }
        /**
         * 제목 아이콘을 설정한다.
         *
         * @param {string} iconClass
         */
        setIconClass(iconClass) {
            this.iconClass = iconClass;
            if (this.isRendered() == true) {
                const $icon = Html.get('> i', this.$getContent());
                if (this.iconClass) {
                    if ($icon.getEl() !== null) {
                        $icon.removeClass().addClass(...this.iconClass.split(' '));
                    }
                    else {
                        const $icon = Html.create('i').addClass(...this.iconClass.split(' '));
                        this.$getContent().prepend($icon);
                    }
                }
                else {
                    if ($icon.getEl() !== null) {
                        $icon.remove();
                    }
                }
            }
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
                        new Aui.Drag(this.$getContent(), {
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
            const tool = new Aui.Title.Tool({ text: text, iconClass: iconClass, handler: handler });
            this.tools.push(tool);
            this.renderBottom();
        }
        /**
         * 제목 아이콘을 랜더링한다.
         */
        renderTop() { }
        /**
         * 제목을 랜더링한다.
         */
        renderContent() {
            const $content = this.$getContent();
            if (this.iconClass) {
                const $i = Html.create('i').addClass(...this.iconClass.split(' '));
                $content.append($i);
            }
            const $text = Html.create('span').html(this.title);
            $content.append($text);
        }
        /**
         * 툴버튼을 랜더링한다.
         */
        renderBottom() {
            if (this.tools.length == 0)
                return;
            this.$setBottom();
            this.$getBottom().empty();
            this.tools.forEach((tool) => {
                this.$getBottom().append(tool.$getComponent());
                tool.render();
            });
        }
    }
    Aui.Title = Title;
    (function (Title) {
        class Tool extends Aui.Component {
            type = 'title';
            role = 'tool';
            text;
            iconClass;
            handler;
            /**
             * 툴버튼 객체를 생성한다.
             *
             * @param {Aui.Title.Tool.Properties} properties 객체설정
             */
            constructor(properties = null) {
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
    })(Title = Aui.Title || (Aui.Title = {}));
})(Aui || (Aui = {}));
