/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 탐색기 클래스를 정의한다.
 *
 * @file /scripts/Aui.Explorer.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
namespace Aui {
    export namespace Explorer {
        export interface Properties extends Aui.Panel.Properties {
            /**
             * @type {boolean|[boolean, boolean, boolean, boolean]} border - 패널 테두리 표시여부 (상단, 우측, 하단, 좌측)
             */
            border?: boolean | [boolean, boolean, boolean, boolean];

            /**
             * @type {Aui.Title|string} title - 패널 제목
             */
            title?: Aui.Title | string;

            /**
             * @type {Aui.Toolbar|(Aui.Component | string)[]} topbar - 패널 상단바
             */
            topbar?: Aui.Toolbar | (Aui.Component | string)[];

            /**
             * @type {Aui.Toolbar|(Aui.Component | string)[]} topbar - 패널 하단바
             */
            bottombar?: Aui.Toolbar | (Aui.Component | string)[];

            /**
             * @type {string} explorerUrl - 탐색기 URL
             */
            explorerUrl: string;

            /**
             * @type {string} path - 탐색을 시작할 경로
             */
            path?: string;
        }
    }

    export class Explorer extends Aui.Panel {
        type: string = 'panel';
        role: string = 'explorer';

        explorerUrl: string;
        path: string;

        /**
         * 탐색기 패널을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties: Aui.Explorer.Properties = null) {
            super(properties);

            this.explorerUrl = this.properties.explorerUrl;
            this.path = this.properties.path ?? '/';
            this.scrollable = 'x';
        }

        /**
         * 탐색기 트리패널을 정의한다.
         */
        initItems(): void {
            if (this.items === null) {
                this.items = [];
            }

            if (this.items.length == 0) {
                this.items.push(this.getTreeAt(0, '/'));
            }

            super.initItems();
        }

        /**
         * 특정위치의 탐색기 트리를 가져온다.
         *
         * @param {number} index - 가져올 인덱스
         * @param {string} path - 해당 인덱스의 경로
         * @return {Aui.Grid.Panel} tree - 트리 패널
         */
        getTreeAt(index: number, path: string = null): Aui.Grid.Panel {
            if (this.getItemAt(index) === null) {
                if (path !== null && (index == 0 || this.getItemAt(index - 1) !== null)) {
                    const grid = new Aui.Grid.Panel({
                        width: 200,
                        border: [false, true, false, false],
                        columns: [
                            {
                                dataIndex: 'basename',
                                text: '경로',
                                renderer: (value: string, record: Aui.Data.Record) => {
                                    let sHTML = record.get('type') == 'DIR' ? '<i class="icon xi xi-folder"></i>' : '';
                                    return (sHTML += value);
                                },
                            },
                        ],
                        store: new Aui.Store.Ajax({
                            url: this.explorerUrl,
                            params: { index: index, path: path },
                        }),
                        selectionMode: 'SINGLE',
                        listeners: {
                            selectionChange: (selections: Aui.Data.Record[], grid: Aui.Grid.Panel) => {
                                if (selections.length == 1) {
                                    const store = grid.getStore() as Aui.Store.Ajax;
                                    const index = parseInt(store.getParam('index'), 10);

                                    this.removeTreeAt(index);
                                    const record = selections.at(0);
                                    if (record.get('type') == 'DIR') {
                                        this.append(this.getTreeAt(index + 1, record.get('name')));
                                        console.log(this.items);
                                        this.getScroll().movePosition(
                                            this.$getContent().getOuterWidth(),
                                            0,
                                            true,
                                            true
                                        );
                                    }
                                }
                            },
                        },
                    });

                    return grid;
                }
            }

            return this.getItemAt(index) as Aui.Grid.Panel;
        }

        /**
         * 특정 인덱스 이후의 탐색기 트리를 제거한다.
         */
        removeTreeAt(index: number): void {
            for (let i = this.items.length - 1; i > index; i--) {
                this.removeItem(i);
            }
        }
    }
}
