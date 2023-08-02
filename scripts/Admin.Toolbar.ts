/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 툴바 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Toolbar.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 1.
 */
namespace Admin {
    export namespace Toolbar {
        export interface Properties extends Admin.Component.Properties {
            /**
             * @type {'top'|'bottom'} position - 툴바표시 위치
             */
            position?: 'top' | 'bottom';

            /**
             * @type {boolean} border - 테두리표시여부
             */
            border?: boolean;
        }
    }

    export class Toolbar extends Admin.Component {
        type: string = 'toolbar';
        role: string = 'bar';
        position: string;
        border: boolean;

        /**
         * 툴바를 생성한다.
         *
         * @param {Admin.Toolbar.Properties|(Admin.Component|string)[]} properties - 객체설정
         */
        constructor(properties: Admin.Toolbar.Properties | (Admin.Component | string)[] = null) {
            if (properties?.constructor.name == 'Array') {
                const items = properties as (Admin.Component | string)[];
                properties = { items: items };
            }
            super(properties);

            this.position = this.properties.position ?? 'top';
            this.border = this.properties.border ?? true;
            this.scrollable = 'x';

            this.$setTop();
            this.$setBottom();
        }

        /**
         * 툴바의 하위 컴포넌트를 초기화한다.
         */
        initItems(): void {
            if (this.items === null) {
                this.items = [];
                for (const item of this.properties.items ?? []) {
                    if (item instanceof Admin.Component) {
                        item.setLayoutType('column-item');
                        this.items.push(item);
                    } else if (typeof item == 'string') {
                        this.items.push(new Admin.Toolbar.Item(item));
                    }
                }
            }

            super.initItems();
        }

        /**
         * @todo 툴바 좌측 스크롤 버튼을 랜더링한다.
         */
        renderTop(): void {}

        /**
         * @todo 툴바 우축 스크롤 버튼을 랜더링한다.
         */
        renderBottom(): void {}

        /**
         * 레이아웃을 렌더링한다.
         */
        render(): void {
            this.$getContainer().setData('position', this.position);

            if (this.border == true) {
                this.$getContainer().addClass('border');
            }

            super.render();
        }

        /**
         * 툴바위치를 지정한다.
         *
         * @param {'top'|'bottom'} position - 툴바위치
         */
        setPosition(position: 'top' | 'bottom'): void {
            this.position = position;
        }
    }

    export namespace Toolbar {
        export namespace Item {
            export interface Properties extends Admin.Component.Properties {
                /**
                 * @type {string} text - 텍스트
                 */
                text?: string;
            }
        }

        /**
         * 툴바아이템 클래스를 정의한다.툴바아이템 객체를 생성한다.
         */
        export class Item extends Admin.Component {
            type: string = 'toolbar';
            role: string = 'item';
            tool: string;
            text: string;
            $text: Dom;

            /**
             * 툴바아이템을 생성한다.
             *
             * @param {Admin.Toolbar.Item.Properties|string} properties - 객체설정
             */
            constructor(properties: Admin.Toolbar.Item.Properties | string = null) {
                if (typeof properties == 'string') {
                    const text = properties;
                    properties = { text: text };
                }
                super(properties);

                this.tool = 'text';
                this.text = this.properties.text ?? '';
                if (this.text == '->') {
                    this.tool = 'fill';
                } else if (this.text == '-' || this.text == '|') {
                    this.tool = 'separator';
                }
            }

            /**
             * 툴바아이템을 랜더링한다.
             */
            renderContent(): void {
                if (this.tool == 'text') {
                    this.$getContent().text(this.text);
                }
            }

            /**
             * 툴바아이템은 랜더링한다.
             */
            render(): void {
                super.render();
                this.$getComponent().setAttr('data-tool', this.tool);
            }
        }
    }
}
