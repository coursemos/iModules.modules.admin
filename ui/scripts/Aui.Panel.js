/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 패널 클래스를 정의한다.
 *
 * @file /scripts/Aui.Panel.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 4. 27.
 */
var Aui;
(function (Aui) {
    class Panel extends Aui.Component {
        type = 'panel';
        role = 'panel';
        border;
        title;
        topbar;
        bottombar;
        resizer;
        resizable;
        /**
         * 패널을 생성한다.
         *
         * @param {Aui.Panel.Properties} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.layout = this.properties.layout ?? 'auto';
            this.border = this.properties.border ?? true;
            this.scrollable = this.properties.scrollable ?? (this.layout == 'fit' ? true : false);
            if (this.properties.title || this.properties.iconClass) {
                if (this.properties.title instanceof Aui.Title) {
                    this.title = this.properties.title;
                }
                else {
                    this.title = new Aui.Title(this.properties.title ?? '');
                }
                if (this.properties.iconClass) {
                    this.title.setIconClass(this.properties.iconClass);
                }
                this.title.setParent(this);
            }
            else {
                this.title = null;
            }
            if (this.properties.topbar) {
                if (this.properties.topbar instanceof Aui.Toolbar) {
                    this.topbar = this.properties.topbar;
                }
                else {
                    this.topbar = new Aui.Toolbar(this.properties.topbar);
                }
            }
            else {
                this.topbar = null;
            }
            this.topbar?.setParent(this);
            this.topbar?.setPosition('top');
            if (this.title != null || this.topbar != null) {
                this.$setTop();
            }
            if (this.properties.bottombar) {
                if (this.properties.bottombar instanceof Aui.Toolbar) {
                    this.bottombar = this.properties.bottombar;
                }
                else {
                    this.bottombar = new Aui.Toolbar(this.properties.bottombar);
                }
            }
            else {
                this.bottombar = null;
            }
            this.bottombar?.setParent(this);
            this.bottombar?.setPosition('bottom');
            if (this.title != null || this.bottombar != null) {
                this.$setBottom();
            }
            this.$scrollable = this.$getContent();
            this.resizable = this.properties.resizable ?? false;
        }
        /**
         * 탭패널의 하위 컴포넌트를 정의한다.
         */
        initItems() {
            if (this.items === null) {
                this.items = [];
                if (this.properties.html) {
                    this.items.push(new Aui.Text({ html: this.properties.html }));
                }
                for (let item of this.properties.items ?? []) {
                    if (item instanceof Aui.Component) {
                        this.items.push(item);
                    }
                }
            }
            super.initItems();
        }
        /**
         * 패널의 제목 객체를 가져온다.
         *
         * @return {Aui.Title} title
         */
        getTitle() {
            return this.title;
        }
        /**
         * 패널의 툴바를 가져온다.
         *
         * @param {string} position - 가져올 툴바 위치 (top, bottom)
         * @return {Aui.Toolbar} toolbar
         */
        getToolbar(position) {
            if (position == 'top') {
                return this.topbar;
            }
            else if (position == 'bottom') {
                return this.bottombar;
            }
        }
        /**
         * 패널의 비활성화여부를 설정한다.
         *
         * @param {boolean} disabled - 비활성여부
         * @return {Aui.Component} this
         */
        setDisabled(disabled) {
            if (disabled == true) {
                this.$getComponent().addClass('disabled');
            }
            else {
                this.$getComponent().removeClass('disabled');
            }
            return super.setDisabled(disabled);
        }
        /**
         * 패널의 상단을 랜더링한다.
         */
        renderTop() {
            if (this.title !== null || this.topbar !== null) {
                const $top = this.$getTop();
                if (this.title !== null) {
                    $top.append(this.title.$getComponent());
                    this.title.render();
                }
                if (this.topbar !== null) {
                    $top.append(this.topbar.$getComponent());
                    this.topbar.render();
                }
            }
        }
        /**
         * 패널의 하단 레이아웃을 랜더링한다.
         */
        renderBottom() {
            if (this.bottombar !== null) {
                const $bottom = this.$getBottom();
                $bottom.append(this.bottombar.$getComponent());
                this.bottombar.render();
            }
        }
        /**
         * 컴포넌트 콘텐츠를 랜더링한다.
         */
        render() {
            if (this.border === true) {
                this.$container.addClass('border');
            }
            else if (this.border !== false) {
                const border = ['borderTop', 'borderRight', 'borderBottom', 'borderLeft'];
                this.border.forEach((is, index) => {
                    if (is === true) {
                        this.$container.addClass(border[index]);
                    }
                });
            }
            if (this.resizable !== false && this.parent instanceof Aui.Component) {
                const directions = this.resizable === true ? [true, true, true, true] : this.resizable;
                this.resizer = new Aui.Resizer(this.$component, this.parent.$component, {
                    directions: directions,
                    guidelines: directions,
                    minWidth: this.minWidth,
                    maxWidth: this.maxWidth,
                    listeners: {
                        end: (_$target, rect) => {
                            this.setWidth(rect.width);
                        },
                    },
                });
            }
            super.render();
        }
        /**
         * 컴포넌트를 제거한다.
         */
        remove() {
            this.title?.remove();
            this.topbar?.remove();
            this.bottombar?.remove();
            super.remove();
        }
    }
    Aui.Panel = Panel;
})(Aui || (Aui = {}));
