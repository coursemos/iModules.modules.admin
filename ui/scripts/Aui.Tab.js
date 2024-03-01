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
var Aui;
(function (Aui) {
    let Tab;
    (function (Tab) {
        /**
         * 탭패널 클래스를 정의한다.
         */
        class Panel extends Aui.Panel {
            type = 'panel';
            role = 'tabpanel';
            activeTab;
            activeTabId;
            tabPosition;
            tabSize;
            bar;
            /**
             * 탭패널을 생성한다.
             *
             * @param {Aui.Tab.Panel.Properties} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.activeTab = this.properties.activeTab ?? 0;
                this.activeTabId = null;
                if (this.properties.tabPosition == 'hidden') {
                    this.tabPosition = 'top';
                }
                else {
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
            initItems() {
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
            getBar() {
                return this.bar;
            }
            /**
             * 자식 컴포넌트를 추가한다.
             *
             * @param {Aui.Panel} item - 추가할 컴포넌트
             * @param {number} position - 추가할 위치 (NULL 인 경우 제일 마지막 위치)
             */
            append(item, position = null) {
                item.hide();
                item.getTitle()?.setHidden(true);
                super.append(item, position);
                this.getBar().append(new Aui.Button({
                    tabId: item.getId(),
                    text: item.properties.title ?? null,
                    iconClass: item.properties.iconClass ?? null,
                    handler: (button) => {
                        button.getParent().active(button.properties.tabId);
                    },
                }), position);
            }
            /**
             * 특정탭을 가져온다.
             *
             * @param {string|number} id - 가져올 탭 고유값 또는 탭 인덱스
             * @return {Aui.Panel} panel - 탭의 패널객체
             */
            getTab(id) {
                let tabId = null;
                if (typeof id == 'number') {
                    tabId = this.items[id]?.getId();
                }
                else {
                    tabId = Aui.get(id)?.getId();
                }
                if (tabId == null)
                    return null;
                if (Aui.get(tabId) instanceof Aui.Panel) {
                    return Aui.get(tabId);
                }
                return null;
            }
            /**
             * 활성화된 탭패널을 가져온다.
             *
             * @return {Aui.Panel} panel - 활성화된 탭 패널객체
             */
            getActiveTab() {
                return this.getTab(this.activeTabId);
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
             * @param {Aui.Panel} panel - 활성화된 탭패널
             */
            onActive(panel) {
                this.fireEvent('active', [panel, this]);
            }
        }
        Tab.Panel = Panel;
        /**
         * 탭바 클래스를 정의한다.
         */
        class Bar extends Aui.Toolbar {
            type = 'toolbar';
            role = 'tab';
            size = 'default';
            /**
             * 탭바를 생성한다.
             *
             * @param {Aui.Tab.Bar.Properties} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.border = this.properties.border ?? true;
                this.position = this.properties.position ?? 'bottom';
                this.size = this.properties.size ?? 'default';
            }
            /**
             * 탭바의 하위 컴포넌트를 초기화한다.
             */
            initItems() {
                if (this.items === null) {
                    this.items = [];
                    for (let item of this.getTabPanel().items ?? []) {
                        this.items.push(new Aui.Button({
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
             * @return {Aui.Tab.Panel} tab - 탭 패널
             */
            getTabPanel() {
                return this.parent;
            }
            /**
             * 레이아웃을 렌더링한다.
             */
            render() {
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
            active(tabId) {
                for (let item of this.items ?? []) {
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
    })(Tab = Aui.Tab || (Aui.Tab = {}));
})(Aui || (Aui = {}));
