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
var Admin;
(function (Admin) {
    let Tab;
    (function (Tab) {
        /**
         * 탭패널 클래스를 정의한다.
         */
        class Panel extends Admin.Panel {
            type = 'panel';
            role = 'tabpanel';
            activeTab;
            activeTabId;
            tabPosition;
            bar;
            /**
             * 탭패널을 생성한다.
             *
             * @param {Admin.Tab.Panel.Properties} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.activeTab = this.properties.activeTab ?? 0;
                this.activeTabId = null;
                this.tabPosition = this.properties.tabPosition ?? 'bottom';
                this.scrollable = false;
                this.bar = new Admin.Tab.Bar(this.properties);
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
            initItems() {
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
                super.initItems();
            }
            /**
             * 탭바를 가져온다.
             *
             * @return {Admin.Tab.Bar} tabBar
             */
            getBar() {
                return this.bar;
            }
            /**
             * 특정탭을 가져온다.
             *
             * @param {string|number} id - 가져올 탭 고유값 또는 탭 인덱스
             * @return {Admin.Panel} panel - 탭의 패널객체
             */
            getTab(id) {
                let tabId = null;
                if (typeof id == 'number') {
                    tabId = this.items[id]?.getId();
                }
                else {
                    tabId = Admin.get(id)?.getId();
                }
                if (tabId == null)
                    return null;
                if (Admin.get(tabId) instanceof Admin.Panel) {
                    return Admin.get(tabId);
                }
                return null;
            }
            /**
             * 특정탭을 활성화한다.
             *
             * @param {string|number} id - 활성화할 탭 고유값 또는 탭 인덱스
             */
            active(id) {
                const tab = this.getTab(id);
                if (tab === null)
                    return;
                if (tab.getId() !== this.activeTabId) {
                    this.activeTabId = tab.getId();
                    for (const item of this.getItems()) {
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
            renderTop() {
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
            renderBottom() {
                super.renderBottom();
                if (this.tabPosition == 'bottom') {
                    const $bottom = this.$getBottom();
                    $bottom.append(this.bar.$getComponent());
                    this.bar.render();
                }
            }
            /**
             * 레이아웃을 렌더링한다.
             *
            renderContainer(): void {
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

                super.renderContainer();
            }*/
            /**
             * 탭패널이 화면상에 출력되었을 때 이벤트를 처리한다.
             */
            onRender() {
                super.onRender();
                if (this.activeTabId === null) {
                    this.active(this.activeTab);
                }
            }
            /**
             * 활성화된 탭이 변경되었을 때
             *
             * @param {Admin.Panel} panel - 활성화된 탭패널
             */
            onActive(panel) {
                this.fireEvent('active', [panel, this]);
            }
        }
        Tab.Panel = Panel;
        /**
         * 탭바 클래스를 정의한다.
         */
        class Bar extends Admin.Toolbar {
            type = 'toolbar';
            role = 'tab';
            /**
             * 탭바를 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                properties.id = properties.id + '-Bar';
                super(properties);
                this.border = this.properties.border ?? true;
                this.position = this.properties.tabPosition ?? 'bottom';
            }
            /**
             * 탭바의 하위 컴포넌트를 초기화한다.
             */
            initItems() {
                if (this.items === null) {
                    this.items = [];
                    for (let item of this.properties.items ?? []) {
                        this.items.push(new Admin.Button({
                            tabId: item.getId(),
                            text: item.properties.title ?? null,
                            iconClass: item.properties.iconClass ?? null,
                            handler: (button) => {
                                button.getParent().active(button.properties.tabId);
                            },
                        }));
                    }
                }
                super.initItems();
            }
            /**
             * 탭바가 속한 탭 패널을 가져온다.
             *
             * @return {Admin.Tab.Panel} tab - 탭 패널
             */
            getTabPanel() {
                return this.parent;
            }
            /**
             * 레이아웃을 렌더링한다.
             */
            render() {
                this.$component.setData('position', this.position);
                super.render();
            }
            /**
             * 탭을 활성화 한다.
             *
             * @param {string} tabId - 활성화할 탭 고유값
             */
            active(tabId) {
                for (let item of this.items) {
                    if (item.properties.tabId == tabId) {
                        item.setPressed(true);
                    }
                    else {
                        item.setPressed(false);
                    }
                }
                this.getTabPanel().active(tabId);
            }
        }
        Tab.Bar = Bar;
    })(Tab = Admin.Tab || (Admin.Tab = {}));
})(Admin || (Admin = {}));
