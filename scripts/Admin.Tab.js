/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 탭패널 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Tab.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 1.
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
            tabbar;
            $tabbar;
            /**
             * 탭패널을 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.activeTab = this.properties.activeTab ?? 0;
                this.activeTabId = null;
                this.tabPosition = this.properties.tabPosition ?? 'bottom';
                this.tabbar = new Admin.Tab.Bar(this.properties);
                this.tabbar.setParent(this);
                this.$component = Html.create('div');
                this.$container = Html.create('div');
                this.$header = Html.create('div');
                this.$body = Html.create('div');
                this.$footer = Html.create('div');
                this.$tabbar = Html.create('div');
            }
            /**
             * 탭패널의 하위 컴포넌트를 정의한다.
             */
            initItems() {
                if (this.items === null) {
                    this.items = [];
                    for (let item of this.properties.items ?? []) {
                        if (item instanceof Admin.Panel) {
                            //                            item.hide();
                            item.setTitleHidden(true);
                            this.items.push(item);
                        }
                    }
                }
            }
            /**
             * 탭패널의 탭바 DOM 을 가져온다.
             *
             * @return {Dom} $tabbar
             */
            $getTabbar() {
                return this.$tabbar;
            }
            /**
             * 헤더 레이아웃을 랜더링한다.
             */
            renderHeader() {
                if (this.$header.getData('rendered') == true)
                    return;
                if (true || this.tabPosition == 'top') {
                    if (this.title !== null && this.titleHidden === false) {
                        let $title = Html.create('h4');
                        $title.append(Html.create('span').text(this.title));
                        this.$header.append($title);
                    }
                    this.$header.append(this.tabbar.$getComponent());
                    this.tabbar.render();
                    if (this.tbar !== null) {
                        this.$header.append(this.tbar.$getComponent());
                        this.tbar.render();
                    }
                    this.$header.setData('rendered', true);
                }
                super.renderHeader();
            }
            /**
             * 푸터 레이아웃을 랜더링한다.
             */
            renderFooter() {
                if (this.$footer.getData('rendered') == true)
                    return;
                if (this.tabPosition == 'bottom') {
                    if (this.bbar !== null) {
                        this.$footer.append(this.bbar.$getComponent());
                        this.bbar.render();
                    }
                    this.$footer.append(this.tabbar.$getComponent());
                    this.tabbar.render();
                    this.$footer.setData('rendered', true);
                }
                super.renderFooter();
            }
            /**
             * 레이아웃을 렌더링한다.
             */
            render() {
                this.$container.append(this.tabbar.$getComponent());
                this.tabbar.render();
                super.render();
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
                    this.tabbar.active(tab.getId());
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
        Tab.Panel = Panel;
        /**
         * 탭바 클래스를 정의한다.
         */
        class Bar extends Admin.Toolbar {
            type = 'toolbar';
            role = 'tabbar';
            /**
             * 탭바를 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.border = this.properties.border ?? true;
                this.position = this.properties.tabPosition ?? 'bottom';
                this.scrollable = this.properties.scrollable ?? 'X';
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
