/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 패널 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Panel.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 15.
 */
var Admin;
(function (Admin) {
    class Panel extends Admin.Component {
        type = 'panel';
        role = 'panel';
        border;
        margin;
        title;
        topbar;
        bottombar;
        /**
         * 패널을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.layout = this.properties.layout ?? 'auto';
            this.border = this.properties.border ?? true;
            this.margin = this.properties.margin ?? null;
            this.scrollable = this.properties.scrollable ?? (this.layout == 'fit' ? true : false);
            if (this.properties.title || this.properties.iconClass) {
                if (this.properties.title instanceof Admin.Title) {
                    this.title = this.properties.title;
                }
                else {
                    this.title = new Admin.Title(this.properties.title ?? '');
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
                if (this.properties.topbar instanceof Admin.Toolbar) {
                    this.topbar = this.properties.topbar;
                }
                else {
                    this.topbar = new Admin.Toolbar(this.properties.topbar);
                }
            }
            else {
                this.topbar = null;
            }
            this.topbar?.setPosition('top');
            if (this.title != null || this.topbar != null) {
                this.$setTop();
            }
            if (this.properties.bottombar) {
                if (this.properties.topbar instanceof Admin.Toolbar) {
                    this.bottombar = new Admin.Toolbar(this.properties.bottombar);
                }
                else {
                    this.bottombar = new Admin.Toolbar(this.properties.bottombar);
                }
            }
            else {
                this.bottombar = null;
            }
            this.bottombar?.setPosition('bottom');
            if (this.title != null || this.bottombar != null) {
                this.$setBottom();
            }
            this.$scrollable = this.$getContent();
        }
        /**
         * 탭패널의 하위 컴포넌트를 정의한다.
         */
        initItems() {
            if (this.items === null) {
                this.items = [];
                if (this.properties.html) {
                    this.items.push(new Admin.Text({ layout: this.layout, text: this.properties.html, scrollable: this.scrollable }));
                }
                for (let item of this.properties.items ?? []) {
                    if (item instanceof Admin.Component) {
                        this.items.push(item);
                    }
                }
            }
        }
        /**
         * 패널의 제목 객체를 가져온다.
         *
         * @return {Admin.Title} title
         */
        getTitle() {
            return this.title;
        }
        /**
         * 패널의 툴바를 가져온다.
         *
         * @param {string} position - 가져올 툴바 위치 (top, bottom)
         * @return {Admin.Toolbar} toolbar
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
            if (this.border == true) {
                this.$container.addClass('border');
            }
            if (this.margin !== null) {
                if (typeof this.margin == 'number') {
                    this.margin = this.margin + 'px';
                }
                this.$component.setStyle('padding', this.margin);
            }
            super.render();
        }
    }
    Admin.Panel = Panel;
})(Admin || (Admin = {}));
