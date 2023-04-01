/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 로딩 메시지 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Loading.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 4. 1.
 */
namespace Admin {
    export namespace Loading {
        export type Type = 'column' | 'box' | 'circle';

        export interface Properties extends Admin.Base.Properties {
            /**
             * @type {Admin.Loading.Type} type - 로딩아이콘 타입
             */
            type: Admin.Loading.Type;

            /**
             * @type {direction} direction - 로딩아이콘 및 로딩메시지의 위치방향
             */
            direction?: 'column' | 'row';

            /**
             * @type {string} text - 로딩메시지
             */
            text?: string;
        }
    }

    export class Loading extends Admin.Base {
        component: Admin.Component;

        type: Admin.Loading.Type;
        direction: 'column' | 'row';
        text: string;

        /**
         * 로딩메시지를 생성한다.
         *
         * @param {Admin.Component} component - 로딩메시지를 보일 컴포넌트
         * @param {Admin.Loading.Properties} properties - 객체설정
         */
        constructor(component: Admin.Component, properties: Admin.Loading.Properties = null) {
            super(properties);

            this.component = component;
            this.type = this.properties.type;
            this.direction = this.properties.direction ?? 'column';
            this.text = this.properties.text ?? null;
        }

        /**
         * 로딩메시지 DOM 을 가져온다.
         *
         * @return {Dom} $loading
         */
        $getLoading(): Dom {
            if (Html.get('> div[data-type=loading][data-role=loading]', this.component.$getContent()).getEl() == null) {
                const $loading = Html.create('div', { 'data-type': 'loading', 'data-role': 'loading' });
                const $box = Html.create('div', { 'data-role': 'box' });
                $box.addClass(this.direction);

                const $indicator = Html.create('div', { 'data-role': 'indicator', 'data-type': this.type });
                $box.append($indicator);

                if (this.type == 'column') {
                    $indicator.html('<i></i><i></i><i></i>');
                }

                const $text = Html.create('div', { 'data-role': 'text' });
                $text.html(this.text ?? Admin.printText('actions/loading'));
                $box.append($text);

                $loading.append($box);
                this.component.$getContent().append($loading);
            }

            const $loading = Html.get('> div[data-type=loading][data-role=loading]', this.component.$getContent());

            return $loading;
        }

        /**
         * 로딩메시지를 설정한다.
         *
         * @param {string} text - 로딩메시지
         */
        setText(text: string): void {
            const $loading = this.$getLoading();
            const $text = Html.get('div[data-role=text]', $loading);
            $text.html(text ?? Admin.printText('actions/loading'));
        }

        /**
         * 로딩메시지를 보인다.
         */
        show(): void {
            this.$getLoading().addClass('show');
        }

        /**
         * 로딩메시지를 숨긴다.
         */
        hide(): void {
            this.$getLoading().removeClass('show');
        }

        /**
         * 로딩메시지를 닫는다.
         */
        close(): void {
            const $loading = Html.get('> div[data-type=loading][data-role=loading]', this.component.$getContent());
            if ($loading.getEl() !== null) {
                $loading.remove();
            }
        }
    }
}
