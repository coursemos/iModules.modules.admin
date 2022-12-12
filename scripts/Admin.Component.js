/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈에서 사용되는 컴포넌트의 공통 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Component.js
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 12.
 */
var Admin;
(function (Admin) {
    class Component extends Admin.Base {
        parent;
        type = 'component';
        role = null;
        $component;
        items;
        layout;
        padding;
        style;
        hidden;
        scrollable;
        scrollbar;
        /**
         * 컴포넌트를 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.parent = null;
            this.role = null;
            this.items = null;
            this.layout = this.properties.layout ?? 'auto';
            this.padding = this.properties.padding ?? null;
            this.style = this.properties.style ?? null;
            this.hidden = this.properties.hidden ?? false;
            this.scrollable = this.properties.scrollable ?? false;
            /**
             * 이벤트리스너를 등록한다.
             */
            for (let name in this.properties.listeners ?? {}) {
                this.addEvent(name, this.properties.listeners[name]);
            }
            this.$component = Html.create('div');
            this.initItems();
        }
        /**
         * 컴포넌트의 하위 컴포넌트를 정의한다.
         */
        initItems() {
            if (this.items === null) {
                this.items = [];
                for (let item of this.properties.items ?? []) {
                    if (item instanceof Admin.Component == true) {
                        this.items.push(item);
                    }
                }
            }
            for (let item of this.items) {
                if (item instanceof Admin.Component) {
                    item.setParent(this);
                }
            }
        }
        /**
         * 컴포넌트 객체의 최상위 DOM 을 가져온다.
         *
         * @return {Dom} $component
         */
        $getComponent() {
            return this.$component;
        }
        /**
         * 부모객체를 지정한다.
         *
         * @param {Admin.Component} parent - 부모객체
         * @return {Admin.Component} this
         */
        setParent(parent) {
            this.parent = parent;
            return this;
        }
        /**
         * 부모객체를 가져온다.
         *
         * @return {Admin.Component} parent
         */
        getParent() {
            return this.parent;
        }
        /**
         * 컴포넌트를 숨긴다.
         */
        hide() {
            this.setHidden(true);
        }
        /**
         * 컴포넌트를 보인다.
         */
        show() {
            this.setHidden(false);
        }
        /**
         * 컴포넌트의 숨김여부를 설정한다.
         *
         * @param {boolean} hidden - 숨김여부
         * @return {Admin.Component} this
         */
        setHidden(hidden) {
            this.hidden = hidden;
            if (hidden == true) {
                this.$component.hide();
            }
            else {
                this.$component.show();
                this.render();
            }
            return this;
        }
        /**
         * 컴포넌트의 숨김여부를 가져온다.
         *
         * @return {boolean} is_hidden
         */
        isHidden() {
            return this.hidden;
        }
        /**
         * 컴포넌트가 렌더링이 가능한지 여부를 가져온다.
         *
         * @return {boolean} is_renderable
         */
        isRenderable() {
            return this.isHidden() == false && this.isRendered() == false;
        }
        /**
         * 컴포넌트의 랜더링여부를 가져온다.
         *
         * @return {boolean} is_rendered
         */
        isRendered() {
            return this.$component.getData('rendered') === true;
        }
        /**
         * 컴포넌트가 랜더링되었는지 기록한다.
         * 상위 클래스에 의해 더이상 컴포넌트가 랜더링되지 않도록 한다.
         */
        rendered() {
            this.$component.setData('rendered', true, false);
        }
        /**
         * 레이아웃을 렌더링한다.
         */
        render() {
            this.$component
                .setData('component', this.getId())
                .setData('type', this.type)
                .setData('role', this.role)
                .addClass(this.layout);
            if (this.scrollbar === undefined) {
                this.scrollbar = new Admin.Scrollbar(this.$component, this.scrollable);
            }
            if (this.isRenderable() == true) {
                for (let item of this.getItems()) {
                    this.$component.append(item.$getComponent());
                    if (item.isRenderable() == true) {
                        item.render();
                    }
                }
                this.scrollbar.render();
                this.rendered();
            }
            if (this.isRendered() == true) {
                this.onRender();
            }
        }
        /**
         * 현재 컴포넌트의 레이아웃을 관리자영역에 출력한다.
         */
        doLayout() {
            let $section = Html.get('section[data-role=admin]');
            $section.append(this.$component);
            this.render();
        }
        /**
         * 컴포넌트에 해당하는 하위 요소만 가져온다.
         *
         * @return {Admin.Component[]} items - 하위요소
         */
        getItems() {
            const items = [];
            for (const item of this.items) {
                if (item instanceof Admin.Component) {
                    items.push(item);
                }
            }
            return items;
        }
        /**
         * 현재 컴포넌트가 화면상에 출력되었을 때 이벤트를 처리한다.
         */
        onRender() {
            this.fireEvent('render');
        }
    }
    Admin.Component = Component;
})(Admin || (Admin = {}));
