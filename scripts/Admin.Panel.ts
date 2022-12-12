/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 패널 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Panel.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 12.
 */
namespace Admin {
    export class Panel extends Admin.Component {
        type: string = 'panel';
        role: string = 'panel';
        border: boolean;
        margin: string | number;

        title: Admin.Title;
        topbar: Admin.Toolbar;
        bottombar: Admin.Toolbar;

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
            this.scrollable = this.properties.scrollable ?? (this.layout == 'fit' ? true : false);

            if (this.properties.title || this.properties.iconClass) {
                if (this.properties.title instanceof Admin.Title) {
                    this.title = this.properties.title;
                } else {
                    this.title = new Admin.Title(this.properties.title ?? '');
                }

                if (this.properties.iconClass) {
                    this.title.setIconClass(this.properties.iconClass);
                }

                this.title.setParent(this);
            } else {
                this.title = null;
            }

            if (this.properties.topbar) {
                if (this.properties.topbar instanceof Admin.Toolbar) {
                    this.topbar = this.properties.topbar;
                } else {
                    this.topbar = new Admin.Toolbar(this.properties.topbar);
                }
            } else {
                this.topbar = null;
            }
            this.topbar?.setPosition('top');

            if (this.properties.bottombar) {
                if (this.properties.topbar instanceof Admin.Toolbar) {
                    this.bottombar = new Admin.Toolbar(this.properties.bottombar);
                } else {
                    this.bottombar = new Admin.Toolbar(this.properties.bottombar);
                }
            } else {
                this.bottombar = null;
            }
            this.bottombar?.setPosition('bottom');

            this.$scrollable = this.$content;
        }

        /**
         * 탭패널의 하위 컴포넌트를 정의한다.
         */
        initItems(): void {
            if (this.items === null) {
                this.items = [];

                if (this.properties.html) {
                    this.items.push(
                        new Admin.Text({ layout: this.layout, text: this.properties.html, scrollable: this.scrollable })
                    );
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
        getTitle(): Admin.Title {
            return this.title;
        }

        /**
         * 패널의 툴바를 가져온다.
         *
         * @param {string} position - 가져올 툴바 위치 (top, bottom)
         * @return {Admin.Toolbar} toolbar
         */
        getToolbar(position: string): Admin.Toolbar {
            if (position == 'top') {
                return this.topbar;
            } else if (position == 'bottom') {
                return this.bottombar;
            }
        }

        /**
         * 패널을 자동으로 스크롤한다.
         *
         * @param {string} direction - 스크롤방향 (left, top)
         * @param {number} speed - 스크롤 속도
         */
        startAutoScroll(direction: string, speed: number): void {
            if (this.isAutoScrolling() == true) {
                if (this.getAutoScrolling().direction != direction) {
                    this.stopAutoScroll();
                } else {
                    this.$content.setData('autoscroll.speed', speed, false);
                    return;
                }
            }

            if (direction == 'left') {
                this.$content.setData('autoscroll.direction', direction, false);
                this.$content.setData('autoscroll.speed', speed, false);
                this.$content.setData(
                    'autoscroll.interval',
                    setInterval(() => {
                        const speed = this.$content.getData('autoscroll.speed');
                        this.$content.setScroll(null, this.$content.getScroll().left + speed, false);
                        if (
                            this.$content.getScroll().left >=
                            this.$content.getScrollWidth() - this.$content.getOuterWidth()
                        ) {
                            this.stopAutoScroll();
                        }
                    }, 10),
                    false
                );
            }
        }

        /**
         * 패널의 자동스크롤을 중지한다.
         */
        stopAutoScroll(): void {
            if (this.isAutoScrolling() == true) {
                clearInterval(this.$content.getData('autoscroll.interval'));
            }
            this.$content.setData('autoscroll.interval', false, false);
        }

        /**
         * 패널 자동스크롤 정보를 가져온다.
         *
         * @return {Object} scroll
         */
        getAutoScrolling(): { direction: string; speed: number } {
            if (this.isAutoScrolling() == false) {
                return { direction: null, speed: null };
            } else {
                return {
                    direction: this.$content.getData('autoscroll.direction'),
                    speed: this.$content.getData('autoscroll.speed'),
                };
            }
        }

        /**
         * 패널이 자동스크롤중인지 가져온다.
         *
         * @return {boolean} scrolling
         */
        isAutoScrolling(): boolean {
            return (
                this.$content.getData('autoscroll.interval') !== null &&
                this.$content.getData('autoscroll.interval') !== false
            );
        }

        /**
         * 패널의 상단을 랜더링한다.
         */
        renderTop(): void {
            console.log('Admin.Panel.renderTop()');
            if (this.title !== null || this.topbar !== null) {
                const $top = this.$getTop(true);

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
        renderBottom(): void {
            if (this.bottombar !== null) {
                const $bottom = this.$getBottom(true);
                $bottom.append(this.bottombar.$getComponent());
                this.bottombar.render();
            }
        }

        /**
         * 컴포넌트 콘텐츠를 랜더링한다.
         *
        renderContainer(): void {
            if (this.isRenderable() == true) {
                if (this.border == true) {
                    this.$container.addClass('border');
                }

                if (this.margin !== null) {
                    if (typeof this.margin == 'number') {
                        this.margin = this.margin + 'px';
                    }
                    this.$component.setStyle('padding', this.margin);
                }

                this.$container.append(this.$top);
                this.$container.append(this.$content);
                this.$container.append(this.$bottom);

                this.renderTop();
                this.renderBottom();
                this.renderContent();
            }
        }*/
    }
}
