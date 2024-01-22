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
namespace Aui {
    export namespace Title {
        export interface Properties extends Aui.Component.Properties {
            /**
             * @type {string} title - 제목텍스트
             */
            title?: string;

            /**
             * @type {string} iconClass - 아이콘 스타일시트 클래스
             */
            iconClass?: string;

            /**
             * @type {boolean} movable - 제목 이동여부
             */
            movable?: boolean;

            /**
             * @type {(Aui.Title.Tool|Aui.Title.Tool.Properties[]} tools - 툴
             */
            tools?: (Aui.Title.Tool | Aui.Title.Tool.Properties)[];
        }
    }

    export class Title extends Aui.Component {
        type: string = 'title';
        role: string = 'title';
        title: string;
        iconClass: string;
        movable: boolean;
        drag: Aui.Drag;
        tools: Aui.Title.Tool[];

        /**
         * 텍스트 객체를 생성한다.
         *
         * @param {Aui.Title.Properties|string} properties 객체설정
         */
        constructor(properties: Aui.Title.Properties | string = null) {
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
        setParent(parent: Aui.Component): this {
            super.setParent(parent);
            this.setMovable(this.properties.movable ?? false);
            return this;
        }

        /**
         * 제목 텍스트를 설정한다.
         *
         * @param {string} title
         */
        setTitle(title: string): void {
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
        setIconClass(iconClass: string): void {
            this.iconClass = iconClass;

            if (this.isRendered() == true) {
                const $icon = Html.get('> i', this.$getContent());
                if (this.iconClass) {
                    if ($icon.getEl() !== null) {
                        $icon.removeClass().addClass(...this.iconClass.split(' '));
                    } else {
                        const $icon = Html.create('i').addClass(...this.iconClass.split(' '));
                        this.$getContent().prepend($icon);
                    }
                } else {
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
        setMovable(movable: boolean): void {
            if (this.movable == movable) return;

            this.movable = movable;
            if (this.getParent() != null && this.movable == true) {
                if (typeof (this.getParent() as any)['moveTo'] === 'function') {
                    this.$getContent().addClass('movable');
                    if (this.drag == undefined) {
                        new Aui.Drag(this.$getContent(), {
                            pointerType: ['mouse', 'touch', 'pen'],
                            listeners: {
                                start: () => {
                                    this.getParent().$getComponent().addClass('moving');
                                },
                                drag: (_$target: Dom, tracker: Aui.Drag.Tracker) => {
                                    if (typeof (this.getParent() as any)['moveTo'] === 'function') {
                                        const { x, y } = tracker.getDelta();
                                        (this.getParent() as any).moveTo(x, y);
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
        addTool(text: string, iconClass: string, handler: (tool: Aui.Title.Tool) => void): void {
            const tool = new Aui.Title.Tool({ text: text, iconClass: iconClass, handler: handler });
            this.tools.push(tool);

            this.renderBottom();
        }

        /**
         * 제목 아이콘을 랜더링한다.
         */
        renderTop(): void {}

        /**
         * 제목을 랜더링한다.
         */
        renderContent(): void {
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
        renderBottom(): void {
            if (this.tools.length == 0) return;

            this.$setBottom();
            this.$getBottom().empty();
            this.tools.forEach((tool: Aui.Title.Tool) => {
                this.$getBottom().append(tool.$getComponent());
                tool.render();
            });
        }
    }

    export namespace Title {
        export namespace Tool {
            export interface Properties extends Aui.Component.Properties {
                /**
                 * @type {string} title - 제목텍스트
                 */
                text?: string;

                /**
                 * @type {string} iconClass - 아이콘 스타일시트 클래스
                 */
                iconClass?: string;

                /**
                 * @type {string} handler - 클릭 핸들러
                 */
                handler?: (tool: Aui.Title.Tool) => void;
            }
        }

        export class Tool extends Aui.Component {
            type: string = 'title';
            role: string = 'tool';
            text: string;
            iconClass: string;
            handler: (tool: Aui.Title.Tool) => void;

            /**
             * 툴버튼 객체를 생성한다.
             *
             * @param {Aui.Title.Tool.Properties} properties 객체설정
             */
            constructor(properties: Aui.Title.Tool.Properties = null) {
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
                this.$content.append($button);
                $button.on('click', () => {
                    this.handler(this);
                });
            }
        }
    }
}
