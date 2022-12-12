/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 탭패널 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Tab.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 12.
 */
namespace Admin {
    export namespace Tab {
        /**
         * 탭패널 클래스를 정의한다.
         */
        export class Panel extends Admin.Panel {
            type: string = 'panel';
            role: string = 'tabpanel';
            activeTab: number;
            activeTabId: string;
            tabPosition: string;

            bar: Admin.Tab.Bar;

            /**
             * 탭패널을 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties: { [key: string]: any } = null) {
                super(properties);

                this.activeTab = this.properties.activeTab ?? 0;
                this.activeTabId = null;
                this.tabPosition = this.properties.tabPosition ?? 'bottom';
                this.scrollable = false;

                this.bar = new Admin.Tab.Bar(this.properties);
                this.bar.setParent(this);
            }

            /**
             * 탭패널의 하위 컴포넌트를 정의한다.
             */
            initItems(): void {
                if (this.items === null) {
                    this.items = [];

                    for (let item of this.properties.items ?? []) {
                        if (item instanceof Admin.Panel) {
                            item.hide();
                            item.getTitle()?.setHidden(true);
                            this.items.push(item);
                        }
                    }
                }
            }

            /**
             * 탭바를 가져온다.
             *
             * @return {Admin.Tab.Bar} tabBar
             */
            getBar(): Admin.Tab.Bar {
                return this.bar;
            }

            /**
             * 레이아웃을 렌더링한다.
             */
            render(): void {
                if (this.isRenderable() == true) {
                    if (this.tabPosition == 'top') {
                        this.renderTop();
                        this.$top.append(this.bar.$getComponent());
                    } else {
                        this.renderBottom();
                        this.$bottom.append(this.bar.$getComponent());
                    }
                    this.bar.render();
                }

                super.render();
            }

            /**
             * 특정탭을 가져온다.
             *
             * @param {string|number} id - 가져올 탭 고유값 또는 탭 인덱스
             * @return {Admin.Panel} panel - 탭의 패널객체
             */
            getTab(id: string | number): Admin.Panel {
                let tabId = null;
                if (typeof id == 'number') {
                    tabId = this.items[id]?.getId();
                } else {
                    tabId = Admin.get(id)?.getId();
                }

                if (tabId == null) return null;
                if (Admin.get(tabId) instanceof Admin.Panel) {
                    return Admin.get(tabId) as Admin.Panel;
                }
                return null;
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
                    for (const item of this.getItems()) {
                        item.hide();
                    }
                    tab.show();
                    this.bar.active(tab.getId());
                }
            }

            /**
             * 탭패널이 화면상에 출력되었을 때 이벤트를 처리한다.
             */
            onRender() {
                this.active(this.activeTab);
                super.onRender();
            }
        }

        /**
         * 탭바 클래스를 정의한다.
         */
        export class Bar extends Admin.Toolbar {
            type: string = 'toolbar';
            role: string = 'tab';

            /**
             * 탭바를 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties: { [key: string]: any } = null) {
                super(properties);

                this.border = this.properties.border ?? true;
                this.position = this.properties.tabPosition ?? 'bottom';
                this.scrollable = this.properties.scrollable ?? 'X';
            }

            /**
             * 탭바의 하위 컴포넌트를 초기화한다.
             */
            initItems(): void {
                if (this.items === null) {
                    this.items = [];
                    for (let item of this.properties.items ?? []) {
                        this.items.push(
                            new Admin.Button({
                                tabId: item.getId(),
                                text: item.properties.title ?? null,
                                iconClass: item.properties.iconClass ?? null,
                                handler: (button: Admin.Button) => {
                                    (button.getParent() as Admin.Tab.Bar).active(button.properties.tabId);
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
             * @return {Admin.Tab.Panel} tab - 탭 패널
             */
            getTabPanel(): Admin.Tab.Panel {
                return this.parent as Admin.Tab.Panel;
            }

            /**
             * 레이아웃을 렌더링한다.
             */
            render(): void {
                this.$component.setData('position', this.position);
                super.render();
            }

            /**
             * 탭을 활성화 한다.
             *
             * @param {string} tabId - 활성화할 탭 고유값
             */
            active(tabId: string): void {
                for (let item of this.items) {
                    if (item.properties.tabId == tabId) {
                        (item as Admin.Button).setPressed(true);
                    } else {
                        (item as Admin.Button).setPressed(false);
                    }
                }

                this.getTabPanel().active(tabId);
            }
        }
    }
}
