/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * Aui 컴포넌트의 공통 클래스를 정의한다.
 *
 * @file /scripts/Aui.Component.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
var Aui;
(function (Aui) {
    class Component extends Aui.Base {
        parent;
        type = 'component';
        role = null;
        $component;
        $container;
        $top;
        $content;
        $bottom;
        items;
        layout;
        width;
        height;
        maxWidth;
        maxHeight;
        padding;
        margin;
        style;
        class;
        hidden;
        disabled;
        scrollable;
        $scrollable;
        scroll;
        /**
         * 컴포넌트를 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.parent = this.properties.parent ?? null;
            this.role = null;
            this.items = null;
            this.layout = this.properties.layout ?? 'auto';
            this.width = this.properties.width ?? null;
            this.height = this.properties.height ?? null;
            this.maxWidth = this.properties.maxWidth ?? null;
            this.maxHeight = this.properties.maxHeight ?? null;
            this.padding = this.properties.padding ?? null;
            this.margin = this.properties.margin ?? null;
            this.style = this.properties.style ?? null;
            this.class = this.properties.class ?? null;
            this.hidden = this.properties.hidden ?? false;
            this.disabled = this.properties.disabled ?? false;
            this.scrollable = this.properties.scrollable ?? false;
            this.$component = Html.create('div', { 'data-component': this.id, 'tabindex': '-1' });
            this.$container = Html.create('div', { 'data-role': 'container' });
            this.$scrollable = this.$container;
            if (this.style !== null) {
                this.$component.setAttr('style', this.style);
            }
        }
        /**
         * 컴포넌트의 하위 컴포넌트를 정의한다.
         */
        initItems() {
            if (this.items === null) {
                this.items = [];
                for (let item of this.properties.items ?? []) {
                    if (item instanceof Aui.Component == true) {
                        this.items.push(item);
                    }
                }
            }
            for (let item of this.items) {
                if (item instanceof Aui.Component) {
                    item.setParent(this);
                    if (this.getLayoutType() == 'column') {
                        item.setLayoutType('column-item');
                    }
                }
            }
        }
        /**
         * 자식 컴포넌트를 처음 위치에 추가한다.
         *
         * @param {Dom} item - 추가할 컴포넌트
         */
        prepend(item) {
            if (this.items === null) {
                this.items = [];
            }
            item.setParent(this);
            this.items.unshift(item);
            if (this.isRendered() == true) {
                this.$getContent().prepend(item.$getComponent());
                if (item.isRenderable() == true) {
                    item.render();
                }
            }
        }
        /**
         * 자식 컴포넌트를 추가한다.
         *
         * @param {Aui.Component} item - 추가할 컴포넌트
         * @param {number} position - 추가할 위치 (NULL 인 경우 제일 마지막 위치)
         */
        append(item, position = null) {
            if (this.items === null) {
                this.items = [];
            }
            item.setParent(this);
            if (position === null || position >= (this.items.length ?? 0)) {
                this.items.push(item);
            }
            else if (position < 0 && Math.abs(position) >= (this.items.length ?? 0)) {
                this.items.unshift(item);
            }
            else {
                this.items.splice(position, 0, item);
            }
            if (this.isRendered() == true) {
                this.$getContent().append(item.$getComponent(), position);
                if (item.isRenderable() == true) {
                    item.render();
                }
            }
        }
        /**
         * 레이아웃 형태를 가져온다.
         *
         * @return {string} layout
         */
        getLayoutType() {
            return this.layout;
        }
        /**
         * 레이아웃 형태를 지정한다.
         *
         * @param {string} layout
         */
        setLayoutType(layout) {
            this.layout = layout;
        }
        /**
         * 컴포넌트 너비를 설정한다.
         *
         * @param {string|number} width - 너비
         */
        setWidth(width) {
            if (width === null) {
                this.width = null;
                this.$component.setStyle('width', null);
                return;
            }
            this.width = typeof width == 'number' ? width + 'px' : width;
            this.$component.setStyle('width', this.width);
        }
        /**
         * 컴포넌트 높이를 설정한다.
         *
         * @param {string|number} height - 높이
         */
        setHeight(height) {
            if (height === null) {
                this.height = null;
                this.$component.setStyle('height', null);
                return;
            }
            this.height = typeof height == 'number' ? height + 'px' : height;
            this.$component.setStyle('height', this.height);
        }
        /**
         * 컴포넌트 최대너비를 설정한다.
         *
         * @param {string|number} maxWidth - 최대너비
         */
        setMaxWidth(maxWidth) {
            if (maxWidth === null) {
                this.maxWidth = null;
                this.$component.setStyle('max-width', 'auto');
                return;
            }
            this.maxWidth = typeof maxWidth == 'number' ? maxWidth + 'px' : maxWidth;
            this.$component.setStyle('max-width', this.maxWidth);
        }
        /**
         * 컴포넌트 최대높이를 설정한다.
         *
         * @param {string|number} maxHeight - 최대높이
         */
        setMaxHeight(maxHeight) {
            if (maxHeight === null) {
                this.maxHeight = null;
                this.$component.setStyle('max-height', null);
                return;
            }
            this.maxHeight = typeof maxHeight == 'number' ? maxHeight + 'px' : maxHeight;
            this.$component.setStyle('max-height', this.maxHeight);
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
         * 컴포넌트의 컨테이너 DOM 을 가져온다.
         *
         * @return {Dom} $container
         */
        $getContainer() {
            return this.$container;
        }
        /**
         * 컴포넌트의 상단 DOM 을 가져온다.
         *
         * @return {Dom} $top
         */
        $getTop() {
            return this.$top ?? null;
        }
        /**
         * 컴포넌트의 상단 DOM 을 활성화한다.
         *
         * @return {Dom} $top
         */
        $setTop() {
            if (this.$top == undefined || this.$top == null) {
                this.$top = Html.create('div', { 'data-role': 'top' });
                if (this.isRendered() == true) {
                    this.$getContainer().prepend(this.$top);
                }
            }
            return this.$top;
        }
        /**
         * 컴포넌트의 상단 DOM 을 비활성화한다.
         *
         * @return {Dom} $bottom
         */
        $removeTop() {
            if (this.isRendered() == true) {
                this.$top?.remove();
            }
            this.$top = null;
        }
        /**
         * 컴포넌트의 컨텐츠 DOM 을 가져온다.
         *
         * @return {Dom} $content
         */
        $getContent() {
            this.$content ??= Html.create('div', { 'data-role': 'content' });
            return this.$content;
        }
        /**
         * 컴포넌트의 컨텐츠 DOM 을 재정의한다.
         *
         * @param {Dom} $dom
         */
        $setContent($dom) {
            if (this.$content !== undefined && this.$content !== null) {
                this.$content.replaceWith($dom);
            }
            this.$content = $dom;
            this.$content.setData('role', 'content');
            return this.$content;
        }
        /**
         * 컴포넌트의 하단 DOM 을 가져온다.
         *
         * @return {Dom} $bottom
         */
        $getBottom() {
            return this.$bottom ?? null;
        }
        /**
         * 컴포넌트의 하단 DOM 을 활성화한다.
         *
         * @return {Dom} $bottom
         */
        $setBottom() {
            if (this.$bottom == undefined || this.$bottom == null) {
                this.$bottom = Html.create('div', { 'data-role': 'bottom' });
                if (this.isRendered() == true) {
                    this.$getContainer().append(this.$bottom);
                }
            }
            return this.$bottom;
        }
        /**
         * 컴포넌트의 하단 DOM 을 비활성화한다.
         *
         * @return {Dom} $bottom
         */
        $removeBottom() {
            if (this.isRendered() == true) {
                this.$bottom?.remove();
            }
            this.$bottom = null;
        }
        /**
         * 특정 영역에 컴포넌트 DOM을 추가한다.
         *
         * @param {Dom} $target - 추가할 DOM
         * @param {Aui.Component} component - 추가할 컴포넌트
         * @param {number} position - 추가할 위치 (NULL 인 경우 마지막에 위치)
         */
        $addComponent($target, component, position = null) {
            if (this.isRendered() == true) {
                $target.append(component.$getComponent(), position);
                component.render();
            }
        }
        /**
         * 스크롤바를 가져온다.
         *
         * @param {boolean} is_rendered - 스크롤바가 정의되지 않은 경우 랜더링할 지 여부
         * @return {Aui.Scroll} scroll - 스크롤바 (스크롤 되지 않는 컴포넌트인 경우 NULL)
         */
        getScroll(is_rendered = true) {
            if (this.scroll == undefined) {
                if (is_rendered == false) {
                    return null;
                }
                if (this.scrollable === false) {
                    this.scroll = null;
                }
                else {
                    this.scroll = Aui.Scroll.get(this.$scrollable, this.scrollable);
                }
            }
            return this.scroll;
        }
        /**
         * 부모객체를 지정한다.
         *
         * @param {Aui.Component} parent - 부모객체
         * @return {Aui.Component} this
         */
        setParent(parent) {
            this.parent = parent;
            return this;
        }
        /**
         * 부모객체를 가져온다.
         *
         * @return {Aui.Component} parent
         */
        getParent() {
            return this.parent;
        }
        /**
         * 컴포넌트에 해당하는 하위 요소만 가져온다.
         *
         * @return {Aui.Component[]} items - 하위요소
         */
        getItems() {
            if (this.items === null) {
                this.initItems();
            }
            const items = [];
            for (const item of this.items) {
                if (item instanceof Aui.Component) {
                    items.push(item);
                }
            }
            return items;
        }
        /**
         * 아이템 인덱스를 가지고 온다.
         *
         * @param {Aui.Component} item - 인덱스를 가지고 올 아이템
         * @return {number} index - 인덱스
         */
        getItemIndex(item) {
            for (const index in this.items ?? []) {
                if (this.items[index].id == item.id) {
                    return parseInt(index, 10);
                }
            }
            return -1;
        }
        /**
         * 특정 인덱스의 하위 컴포넌트를 가져온다.
         *
         * @return {Aui.Component} item - 하위요소
         */
        getItemAt(index) {
            return this.getItems().at(index) ?? null;
        }
        /**
         * 컴포넌트를 숨긴다.
         */
        hide() {
            this.setHidden(true);
            this.fireEvent('hide', [this]);
        }
        /**
         * 컴포넌트를 보인다.
         */
        show() {
            this.setHidden(false);
            this.getScroll()?.updatePosition();
            this.fireEvent('show', [this]);
        }
        /**
         * 컴포넌트에 포커스를 설정한다.
         * 키보드 이벤트를 수신하도록 한다.
         */
        focus() {
            this.$getComponent().getEl().focus();
        }
        /**
         * 컴포넌트의 숨김여부를 설정한다.
         *
         * @param {boolean} hidden - 숨김여부
         * @return {Aui.Component} this
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
         * 컴포넌트의 보임여부를 가져온다.
         *
         * @return {boolean} is_show
         */
        isShow() {
            return this.isRendered() == true && this.isHidden() == false;
        }
        /**
         * 컴포넌트를 비활성화한다.
         */
        disable() {
            this.setDisabled(true);
        }
        /**
         * 컴포넌트를 활성화한다.
         */
        enable() {
            this.setDisabled(false);
        }
        /**
         * 컴포넌트의 비활성화여부를 설정한다.
         * 하위 컴포넌트 클래스에서 처리한다.
         *
         * @param {boolean} disabled - 비활성여부
         * @return {Aui.Component} this
         */
        setDisabled(disabled) {
            this.disabled = disabled;
            return this;
        }
        /**
         * 컴포넌트의 비활성여부를 가져온다.
         * 하위 컴포넌트 클래스에서 처리한다.
         *
         * @return {boolean} is_hidden
         */
        isDisabled() {
            return this.disabled;
        }
        /**
         * 컴포넌트가 렌더링이 가능한지 여부를 가져온다.
         *
         * @return {boolean} is_renderable
         */
        isRenderable() {
            if (this.isRendered() == false && this.isHidden() == true) {
                this.$getComponent().hide();
            }
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
         * 컴포넌트 상단 컨텐츠를 랜더링한다.
         */
        renderTop() { }
        /**
         * 컴포넌트 컨텐츠를 랜더링한다.
         */
        renderContent() {
            this.renderItems();
        }
        /**
         * 컴포넌트 하단 컨텐츠를 랜더링한다.
         */
        renderBottom() { }
        /**
         * 컴포넌트에 속한 아이템을 랜더링한다.
         */
        renderItems() {
            for (let item of this.getItems()) {
                this.$getContent().append(item.$getComponent());
                if (item.isRenderable() == true) {
                    item.render();
                }
            }
        }
        /**
         * 레이아웃을 렌더링한다.
         */
        render() {
            this.initItems();
            this.$getComponent().setData('type', this.type).setData('role', this.role).addClass(this.layout);
            if (this.width !== null) {
                this.setWidth(this.width);
            }
            if (this.height !== null) {
                this.setHeight(this.height);
            }
            if (this.maxWidth !== null) {
                this.setMaxWidth(this.maxWidth);
            }
            if (this.maxHeight !== null) {
                this.setMaxHeight(this.maxHeight);
            }
            if (this.hidden == true) {
                this.$getComponent().hide();
            }
            if (this.class !== null) {
                this.$getComponent().addClass(...this.class.split(' '));
            }
            if (this.isRenderable() == true) {
                this.$getComponent().append(this.$container);
                if (this.$getTop() != null) {
                    this.$getContainer().append(this.$getTop());
                    this.renderTop();
                }
                this.$getContainer().append(this.$getContent());
                this.renderContent();
                if (this.$getBottom() != null) {
                    this.$getContainer().append(this.$getBottom());
                    this.renderBottom();
                }
                if (this.isRendered() == false) {
                    this.rendered();
                    this.onRender();
                }
            }
            if (this.isRendered() == true) {
                if (this.disabled == true) {
                    this.disable();
                }
                if (this.getLayoutType() == 'column') {
                    if (this.properties.gap !== undefined && this.properties.gap > 0) {
                        this.$getContent().setStyle('column-gap', this.properties.gap + 'px');
                    }
                }
                if (this.getLayoutType() == 'column-item') {
                    if (this.properties.flex !== undefined && this.properties.flex > 0) {
                        this.$getComponent().setStyle('flex-grow', this.properties.flex);
                        this.$getComponent().setStyle('flex-basis', 0);
                        this.$getComponent().setStyle('flex-shrink', 0);
                        if (this.properties.minWidth !== undefined && this.properties.minWidth > 0) {
                            this.$getComponent().setStyle('min-width', this.properties.minWidth + 'px');
                        }
                    }
                    else {
                        if (this.properties.width !== undefined) {
                            this.$getComponent().setStyle('width', this.properties.width + 'px');
                            this.$getComponent().setStyle('flex-grow', 0);
                            this.$getComponent().setStyle('flex-shrink', 0);
                        }
                    }
                }
                this.getScroll()?.render();
            }
            if (this.padding !== null) {
                if (typeof this.padding == 'number') {
                    if (this.padding > 0) {
                        this.$getContent().setStyle('padding', this.padding + 'px');
                    }
                }
                else {
                    if (this.padding.reduce((a, b) => a + b, 0) > 0) {
                        this.$getContent().setStyle('padding', this.padding.map((a) => a + 'px').join(' '));
                    }
                }
            }
            if (this.margin !== null) {
                if (typeof this.margin == 'number') {
                    if (this.margin > 0) {
                        this.$getComponent().setStyle('padding', this.margin + 'px');
                    }
                }
                else {
                    if (this.margin.reduce((a, b) => a + b, 0) > 0) {
                        this.$getComponent().setStyle('padding', this.margin.map((a) => a + 'px').join(' '));
                    }
                }
            }
        }
        /**
         * 컴포넌트를 제거한다.
         */
        remove() {
            if (this.getParent()?.getItemIndex(this) > -1) {
                this.getParent().removeItem(this.getParent().getItemIndex(this));
            }
            else {
                if (Array.isArray(this.items) == true) {
                    this.items.slice().forEach((item) => {
                        const index = this.getItemIndex(item);
                        this.removeItem(index);
                    });
                }
                this.scroll?.remove();
                this.$component.remove();
            }
            super.remove();
        }
        /**
         * 특정 아이템을 제거한다.
         */
        removeItem(index) {
            if (this.getItemAt(index) !== null) {
                const item = this.items.splice(index, 1);
                item[0].remove();
            }
        }
        /**
         * 하위 컴포넌트를 모두 제거한다.
         */
        empty() {
            if (Array.isArray(this.items) == true) {
                this.items.forEach((item) => {
                    item.remove();
                });
                this.items = [];
            }
            if (this.isRendered() == true) {
                this.$getContent().empty();
                this.renderContent();
            }
        }
        /**
         * 현재 컴포넌트가 화면상에 출력되었을 때 이벤트를 처리한다.
         */
        onRender() {
            this.fireEvent('render', [this]);
        }
    }
    Aui.Component = Component;
})(Aui || (Aui = {}));
