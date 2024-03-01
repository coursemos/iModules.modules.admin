/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 탭패널 클래스를 정의한다.
 *
 * @file /scripts/Aui.Tab.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 */
namespace Aui {
    export namespace Tab {
        export namespace Panel {
            export interface Listeners extends Aui.Panel.Listeners {
                /**
                 * @var {Function} render - 컴포넌트가 랜더링 되었을 때
                 */
                render?: (panel: Aui.Tab.Panel) => void;

                /**
                 * @var {Function} render - 활성화된 탭이 변경되거나, 탭이 활성화되었을 때
                 */
                active?: (panel: Aui.Panel, tab: Aui.Tab.Panel) => void;
            }

            export interface Properties extends Aui.Panel.Properties {
                /**
                 * @type {Aui.Panel[]} items - 내부 패널
                 */
                items?: Aui.Panel[];

                /**
                 * @type {number} activeTab - 기본적으로 활성할 탭 인덱스
                 */
                activeTab?: number;

                /**
                 * @type {'top'|'bottom'|'hidden'} tabPosition - 탭바 위치
                 */
                tabPosition?: 'top' | 'bottom' | 'hidden';

                /**
                 * @type {'default'|'small'} tabSize - 탭바 크기
                 */
                tabSize?: string;

                /**
                 * @type {Aui.Tab.Panel.Listeners} listeners - 이벤트리스너
                 */
                listeners?: Aui.Tab.Panel.Listeners;
            }
        }

        /**
         * 탭패널 클래스를 정의한다.
         */
        export class Panel extends Aui.Panel {
            type: string = 'panel';
            role: string = 'tabpanel';
            activeTab: number;
            activeTabId: string;
            tabPosition: 'top' | 'bottom';
            tabSize: string;

            bar: Aui.Tab.Bar;

            /**
             * 탭패널을 생성한다.
             *
             * @param {Aui.Tab.Panel.Properties} properties - 객체설정
             */
            constructor(properties: Aui.Tab.Panel.Properties = null) {
                super(properties);

                this.activeTab = this.properties.activeTab ?? 0;
                this.activeTabId = null;

                if (this.properties.tabPosition == 'hidden') {
                    this.tabPosition = 'top';
                } else {
                    this.tabPosition = this.properties.tabPosition ?? 'bottom';
                }
                this.tabSize = this.properties.tabSize ?? 'default';
                this.scrollable = false;

                this.bar = new Aui.Tab.Bar({
                    id: this.id + '-Bar',
                    position: this.tabPosition,
                    size: this.tabSize,
                    hidden: this.properties.tabPosition == 'hidden',
                });
                this.bar.setParent(this);

                if (this.tabPosition == 'top') {
                    this.$setTop();
                }

                if (this.tabPosition == 'bottom') {
                    this.$setBottom();
                }
            }

            /**
             * 탭패널의 하위 컴포넌트를 정의한다.
             */
            initItems(): void {
                if (this.items === null) {
                    this.items = [];

                    for (let item of this.properties.items ?? []) {
                        if (item instanceof Aui.Panel) {
                            item.hide();
                            item.getTitle()?.setHidden(true);
                            this.items.push(item);
                        }
                    }
                }

                super.initItems();
            }

            /**
             * 탭바를 가져온다.
             *
             * @return {Aui.Tab.Bar} tabBar
             */
            getBar(): Aui.Tab.Bar {
                return this.bar;
            }

            /**
             * 자식 컴포넌트를 추가한다.
             *
             * @param {Aui.Panel} item - 추가할 컴포넌트
             * @param {number} position - 추가할 위치 (NULL 인 경우 제일 마지막 위치)
             */
            append(item: Aui.Panel, position: number = null): void {
                item.hide();
                item.getTitle()?.setHidden(true);

                super.append(item, position);

                this.getBar().append(
                    new Aui.Button({
                        tabId: item.getId(),
                        text: item.properties.title ?? null,
                        iconClass: item.properties.iconClass ?? null,
                        handler: (button: Aui.Button) => {
                            (button.getParent() as Aui.Tab.Bar).active(button.properties.tabId);
                        },
                    }),
                    position
                );
            }

            /**
             * 특정탭을 가져온다.
             *
             * @param {string|number} id - 가져올 탭 고유값 또는 탭 인덱스
             * @return {Aui.Panel} panel - 탭의 패널객체
             */
            getTab(id: string | number): Aui.Panel {
                let tabId = null;
                if (typeof id == 'number') {
                    tabId = this.items[id]?.getId();
                } else {
                    tabId = Aui.get(id)?.getId();
                }

                if (tabId == null) return null;
                if (Aui.get(tabId) instanceof Aui.Panel) {
                    return Aui.get(tabId) as Aui.Panel;
                }
                return null;
            }

            /**
             * 활성화된 탭패널을 가져온다.
             *
             * @return {Aui.Panel} panel - 활성화된 탭 패널객체
             */
            getActiveTab(): Aui.Panel {
                return this.getTab(this.activeTabId);
            }

            /**
             * 특정탭을 활성화한다.
             *
             * @param {string|number} id - 활성화할 탭 고유값 또는 탭 인덱스
             */
            active(id: string | number): void {
                const tab = this.getTab(id);
                if (tab === null) return;
                if (tab.getId() !== this.activeTabId) {
                    this.activeTabId = tab.getId();
                    for (const item of this.getItems() ?? []) {
                        item.hide();
                    }
                    tab.show();
                    this.bar.active(tab.getId());
                    this.onActive(tab);
                }
            }

            /**
             * 탭바를 랜더링한다.
             */
            renderTop(): void {
                super.renderTop();

                if (this.tabPosition == 'top') {
                    const $top = this.$getTop();
                    $top.append(this.bar.$getComponent());
                    this.bar.render();
                }
            }

            /**
             * 탭바를 랜더링한다.
             */
            renderBottom(): void {
                super.renderBottom();

                if (this.tabPosition == 'bottom') {
                    const $bottom = this.$getBottom();
                    $bottom.append(this.bar.$getComponent());
                    this.bar.render();
                }
            }

            /**
             * 탭패널이 화면상에 출력되었을 때 이벤트를 처리한다.
             */
            onRender(): void {
                super.onRender();
                if (this.activeTabId === null) {
                    this.active(this.activeTab);
                }
            }

            /**
             * 활성화된 탭이 변경되었을 때
             *
             * @param {Aui.Panel} panel - 활성화된 탭패널
             */
            onActive(panel: Aui.Panel): void {
                this.fireEvent('active', [panel, this]);
            }
        }

        export namespace Bar {
            export interface Properties extends Aui.Toolbar.Properties {}
        }

        /**
         * 탭바 클래스를 정의한다.
         */
        export class Bar extends Aui.Toolbar {
            type: string = 'toolbar';
            role: string = 'tab';

            size: string = 'default';

            /**
             * 탭바를 생성한다.
             *
             * @param {Aui.Tab.Bar.Properties} properties - 객체설정
             */
            constructor(properties: Aui.Tab.Bar.Properties = null) {
                super(properties);

                this.border = this.properties.border ?? true;
                this.position = this.properties.position ?? 'bottom';
                this.size = this.properties.size ?? 'default';
            }

            /**
             * 탭바의 하위 컴포넌트를 초기화한다.
             */
            initItems(): void {
                if (this.items === null) {
                    this.items = [];
                    for (let item of this.getTabPanel().items ?? []) {
                        this.items.push(
                            new Aui.Button({
                                tabId: item.getId(),
                                text: item.properties.title ?? null,
                                iconClass: item.properties.iconClass ?? null,
                                handler: (button: Aui.Button) => {
                                    (button.getParent() as Aui.Tab.Bar).active(button.properties.tabId);
                                },
                            })
                        );
                    }
                }

                super.initItems();
            }

            /**
             * 탭바가 속한 탭 패널을 가져온다.
             *
             * @return {Aui.Tab.Panel} tab - 탭 패널
             */
            getTabPanel(): Aui.Tab.Panel {
                return this.parent as Aui.Tab.Panel;
            }

            /**
             * 레이아웃을 렌더링한다.
             */
            render(): void {
                this.$component.setData('position', this.position);
                if (this.size !== 'default') {
                    this.$getContainer().addClass(this.size);
                }
                super.render();
            }

            /**
             * 탭을 활성화 한다.
             *
             * @param {string} tabId - 활성화할 탭 고유값
             */
            active(tabId: string): void {
                for (let item of this.items ?? []) {
                    if (item.properties.tabId == tabId) {
                        (item as Aui.Button).setPressed(true);
                    } else {
                        (item as Aui.Button).setPressed(false);
                    }
                }

                this.getTabPanel().active(tabId);
            }
        }
    }
}
