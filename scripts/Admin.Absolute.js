/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 특정 DOM 위치를 기준으로 절대위치를 가지는 되는 DOM 을 관리하는 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Absolute.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 5. 26.
 */
var Admin;
(function (Admin) {
    class Absolute extends Admin.Component {
        static $absolutes;
        static $absolute = new Map();
        animationFrame;
        type = 'absolute';
        role = 'absolute';
        $target;
        top;
        bottom;
        left;
        right;
        hideOnClick;
        /**
         * 버튼을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.$target = this.properties.$target ?? Html.get('body');
            this.top = this.properties.top ?? null;
            this.bottom = this.properties.bottom ?? null;
            this.left = this.properties.left ?? null;
            this.right = this.properties.right ?? null;
            this.hideOnClick = this.properties.hideOnClick === true;
        }
        /**
         * 절대위치를 가지는 DOM 을 랜더링할 기준 DOM 객체를 가져온다.
         *
         * @return {Dom} $absolutes
         */
        $getAbsolutes() {
            if (Admin.Absolute.$absolutes !== undefined) {
                return Admin.Absolute.$absolutes;
            }
            if (Html.get('section[data-role=admin][data-type=absolutes]', Html.get('body')).getEl() == null) {
                Admin.Absolute.$absolutes = Html.create('section', { 'data-role': 'admin', 'data-type': 'absolutes' });
                Html.get('body').append(Admin.Absolute.$absolutes);
            }
            else {
                Admin.Absolute.$absolutes = Html.get('section[data-role=admin][data-type=absolutes]', Html.get('body'));
            }
            return Admin.Absolute.$absolutes;
        }
        /**
         * 절대위치의 대상 DOM 의 위치를 가져온다.
         *
         * @return {Object} position
         */
        getRect() {
            return this.$target.getEl().getBoundingClientRect();
        }
        /**
         * 절대위치의 대상 DOM 위치를 추적하여 컴포넌트의 위치를 조절한다.
         */
        setRect() {
            if (Admin.has(this.getId()) == false) {
                cancelAnimationFrame(this.animationFrame);
                return;
            }
            const rect = this.getRect();
            this.$getComponent().setStyle('top', rect.top + 'px');
            this.$getComponent().setStyle('left', rect.left + 'px');
            this.$getComponent().setStyle('width', rect.width + 'px');
            this.$getComponent().setStyle('height', rect.height + 'px');
            this.animationFrame = requestAnimationFrame(this.setRect.bind(this));
        }
        /**
         * 절대위치 DOM 으로 부터 상대위치를 가질 콘텐츠의 위치를 지정한다.
         *
         * @param {number|string} top
         * @param {number|string} right
         * @param {number|string} bottom
         * @param {number|string} left
         */
        setPosition(top, right, bottom, left) {
            this.top = typeof top == 'number' ? top + 'px' : top;
            this.right = typeof right == 'number' ? right + 'px' : right;
            this.bottom = typeof bottom == 'number' ? bottom + 'px' : bottom;
            this.left = typeof left == 'number' ? left + 'px' : left;
            this.updatePosition();
        }
        /**
         * 절대위치 DOM 으로 부터 상대위치를 가질 콘텐츠의 위치를 업데이트한다.
         */
        updatePosition() {
            const $content = this.$getContent();
            $content.setStyle('top', this.top);
            $content.setStyle('bottom', this.bottom);
            $content.setStyle('left', this.left);
            $content.setStyle('right', this.right);
            $content.setStyle('width', this.width);
            $content.setStyle('height', this.height);
        }
        /**
         * 절대위치 컴포넌트를 보인다.
         *
         * @param {boolean} is_hide_all - 이전 절대위치 컴포넌트를 숨길지 여부
         */
        show(is_hide_all = true) {
            if (is_hide_all == true) {
                Admin.Absolute.hideAll();
            }
            const isShow = this.fireEvent('beforeShow', [this]);
            if (isShow === false)
                return;
            this.$getAbsolutes().append(this.$getComponent());
            this.render();
            this.setRect();
            this.updatePosition();
            super.show();
            if (this.hideOnClick === true) {
                Admin.Absolute.$absolute.set(this.getId(), this.$getComponent());
            }
        }
        /**
         * 절대위치 컴포넌트를 숨긴다.
         */
        hide() {
            const isHide = this.fireEvent('beforeHide', [this]);
            if (isHide === false)
                return;
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            super.hide();
            if (this.hideOnClick === true) {
                Admin.Absolute.$absolute.delete(this.getId());
            }
        }
        /**
         * 모든 절대위치 컴포넌트를 숨긴다.
         */
        static hideAll() {
            if (Admin.Absolute.$absolutes !== undefined) {
                Html.all('div[data-component][data-type=absolute]', Admin.Absolute.$absolutes).forEach(($dom) => {
                    Admin.getComponent($dom.getData('component')).hide();
                });
            }
        }
        /**
         * 절대위치 컴포넌트를 닫는다.
         */
        close() {
            const isClose = this.fireEvent('beforeClose', [this]);
            if (isClose === false)
                return;
            this.remove();
            this.fireEvent('close', [this]);
            if (this.hideOnClick === true) {
                Admin.Absolute.$absolute.delete(this.getId());
            }
        }
        /**
         * 컴포넌트를 제거한다.
         */
        remove() {
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            super.remove();
        }
    }
    Admin.Absolute = Absolute;
})(Admin || (Admin = {}));
Html.ready(() => {
    Html.get('body').on('mousedown', (e) => {
        const $target = Html.el(e.target);
        Admin.Absolute.$absolute.forEach(($dom, id) => {
            if ($target.is($dom) === false && $target.getParents('div[data-component=' + id + ']') === null) {
                const absolute = Admin.get(id);
                absolute.hide();
            }
        });
    });
});
