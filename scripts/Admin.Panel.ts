/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 패널 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Panel.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 1.
 */
namespace Admin {
    export class Panel extends Admin.Component {
        type: string = 'panel';
        role: string = 'panel';
        border: boolean;
        margin: string | number;
        scrollable: string | boolean;
        iconClass: string;
        title: string;
        titleHidden: boolean;

        tbar: Admin.Toolbar;
        bbar: Admin.Toolbar;

        $container: Dom;
        $header: Dom;
        $body: Dom;
        $footer: Dom;

        /**
         * 패널을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties: { [key: string]: any } = null) {
            super(properties);

            this.layout = this.properties.layout ?? 'auto';
            this.border = this.properties.border ?? true;
            this.margin = this.properties.margin ?? null;
            this.scrollable = this.properties.scrollable ?? false;

            this.iconClass = this.properties.iconClass ?? null;
            this.title = this.properties.title ?? null;
            this.titleHidden = this.properties.titleHidden ?? false;

            if (this.properties.tbar) {
                if (this.properties.tbar.constructor.name == 'Array') {
                    this.tbar = new Admin.Toolbar(this.properties.tbar);
                } else if (this.properties.tbar.constructor.name == 'Toolbar') {
                    this.tbar = this.properties.tbar;
                } else {
                    this.tbar = null;
                }
            } else {
                this.tbar = null;
            }
            this.tbar?.setPosition('top');

            if (this.properties.bbar) {
                if (this.properties.bbar.constructor.name == 'Array') {
                    this.bbar = new Admin.Toolbar(this.properties.bbar);
                } else if (this.properties.tbar.constructor.name == 'Toolbar') {
                    this.tbar = this.properties.tbar;
                } else {
                    this.bbar = null;
                }
            } else {
                this.bbar = null;
            }
            this.bbar?.setPosition('bottom');

            this.$component = Html.create('div');
            this.$container = Html.create('div');
            this.$header = Html.create('div');
            this.$body = Html.create('div');
            this.$footer = Html.create('div');
        }

        /**
         * 탭패널의 하위 컴포넌트를 정의한다.
         */
        initItems(): void {
            if (this.items === null) {
                this.items = [];

                if (this.properties.html) {
                    this.items.push(new Admin.Text(this.properties.html));
                }

                for (let item of this.properties.items ?? []) {
                    if (item instanceof Admin.Component) {
                        this.items.push(item);
                    }
                }
            }
        }

        /**
         * 패널의 컨테이너 DOM 을 가져온다.
         *
         * @return {Dom} $container
         */
        $getContainer(): Dom {
            return this.$container;
        }

        /**
         * 패널의 헤더 DOM 을 가져온다.
         *
         * @return {Dom} $header
         */
        $getHeader(): Dom {
            return this.$header;
        }

        /**
         * 패널의 바디 DOM 을 가져온다.
         *
         * @return {Dom} $body
         */
        $getBody(): Dom {
            return this.$body;
        }

        /**
         * 패널의 푸터 DOM 을 가져온다.
         *
         * @return {Dom} $footer
         */
        $getFooter(): Dom {
            return this.$footer;
        }

        /**
         * 헤더 레이아웃을 랜더링한다.
         */
        renderHeader(): void {
            if (this.$header.getData('rendered') == true) return;

            const $title = Html.create('h4');
            if (this.title !== null) $title.append(Html.create('span').text(this.title));
            if (this.title !== null && this.titleHidden === false) {
                $title.show();
            } else {
                $title.hide();
            }
            this.$header.append($title);

            if (this.tbar !== null) {
                this.$header.append(this.tbar.$getComponent());
                this.tbar.render();
            }

            this.$header.setData('rendered', true);
        }

        /**
         * 바디 레이아웃을 랜더링한다.
         */
        renderBody(): void {
            if (this.$body.getData('rendered') == true) return;

            for (const item of this.getItems()) {
                this.$body.append(item.$getComponent());
                item.render();
            }

            this.$body.setData('rendered', true);
        }

        /**
         * 푸터 레이아웃을 랜더링한다.
         */
        renderFooter(): void {
            if (this.$footer.getData('rendered') == true) return;

            if (this.bbar !== null) {
                this.$footer.append(this.bbar.$getComponent());
                this.bbar.render();
            }

            this.$footer.setData('rendered', true);
        }

        /**
         * 레이아웃을 렌더링한다.
         */
        render(): void {
            if (this.isRenderable() == false) return;

            this.$container.setData('role', 'container');
            this.$header.setData('role', 'header');
            this.$body.setData('role', 'body');
            this.$footer.setData('role', 'footer');

            if (this.border == true) {
                this.$container.addClass('border');
            }

            if (this.margin !== null) {
                if (typeof this.margin == 'number') {
                    this.margin = this.margin + 'px';
                }
                this.$component.setStyle('padding', this.margin);
            }

            if (this.scrollable == true) {
                this.$body.addClass('scrollableX');
                this.$body.addClass('scrollableY');
            } else if (this.scrollable == 'X') {
                this.$body.addClass('scrollableX');
            } else if (this.scrollable == 'Y') {
                this.$body.addClass('scrollableY');
            }

            this.renderHeader();
            this.renderBody();
            this.renderFooter();

            if (this.$header.isEmpty() == false) {
                this.$container.append(this.$header);
            }

            this.$container.append(this.$body);

            if (this.$footer.isEmpty() == false) {
                this.$container.append(this.$footer);
            }

            this.append(this.$container);
            super.render();
        }

        /**
         * 타이틀바 숨김여부를 설정한다.
         *
         * @param {boolean} hidden 숨김여부
         * @return {Admin.Panel} this
         */
        setTitleHidden(hidden: boolean): this {
            this.titleHidden = hidden;
            if (this.titleHidden == true) {
                Html.get('h4', this.$header).hide();
            } else {
                Html.get('h4', this.$header).show();
            }

            return this;
        }

        /**
         * 타이틀바를 숨긴다.
         */
        hideTitle(): void {}
    }
}
