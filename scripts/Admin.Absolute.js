/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 특정 DOM 위치를 기준으로 절대위치를 가지는 되는 DOM 을 관리하는 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Absolute.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 2. 28.
 */
var Admin;
(function (Admin) {
    class Absolute extends Admin.Component {
        static $absolutes;
        animationFrame;
        type = 'absolute';
        role = 'absolute';
        $target;
        top;
        bottom;
        left;
        right;
        width;
        height;
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
            this.width = this.properties.width ?? null;
            this.height = this.properties.height ?? null;
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
         * 너비를 설정한다.
         *
         * @param {number|string} width
         */
        setWidth(width) {
            this.width = typeof width == 'number' ? width + 'px' : width;
            this.$getContent().setStyle('width', this.width);
        }
        /**
         * 높이를 위치를 설정한다.
         *
         * @param {number|string} height
         */
        setHeight(height) {
            this.height = typeof height == 'number' ? height + 'px' : height;
            this.$getContent().setStyle('height', this.height);
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
         * 절대위치 컴포넌트가 보이고 있는지 확인한다.
         *
         * @return {boolean} isShow
         */
        isShow() {
            return this.isRendered() == true && this.isHidden() == false;
        }
        /**
         * 절대위치 컴포넌트를 보인다.
         */
        show() {
            const isShow = this.fireEvent('beforeShow', [this]);
            if (isShow === false)
                return;
            this.$getAbsolutes().append(this.$getComponent());
            this.render();
            this.setRect();
            this.updatePosition();
            super.show();
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
