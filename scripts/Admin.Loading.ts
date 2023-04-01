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
            type: Admin.Loading.Type;
            direction?: 'column' | 'row';
            message?: string;
        }
    }

    export class Loading extends Admin.Base {
        component: Admin.Component;

        type: Admin.Loading.Type;
        direction: 'column' | 'row';
        message: string;

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
            this.message = this.properties.message ?? null;
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

                const $message = Html.create('div', { 'data-role': 'message' });
                $message.html(this.message ?? Admin.printText('actions/loading'));
                $box.append($message);

                $loading.append($box);
                this.component.$getContent().append($loading);
            }

            const $loading = Html.get('> div[data-type=loading][data-role=loading]', this.component.$getContent());

            return $loading;
        }

        /**
         * 로딩메시지를 보인다.
         */
        show(): void {
            this.$getLoading().setStyle('visibility', 'visible');
        }

        hide(): void {
            this.$getLoading().setStyle('visibility', 'hidden');
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
