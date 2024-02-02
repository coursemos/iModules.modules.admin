/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 로딩 메시지 클래스를 정의한다.
 *
 * @file /scripts/Aui.Loading.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
namespace Aui {
    export namespace Loading {
        export type Type = 'column' | 'box' | 'circle' | 'dot' | 'atom';

        export interface Properties extends Aui.Base.Properties {
            /**
             * @type {Aui.Loading.Type} type - 로딩아이콘 타입
             */
            type: Aui.Loading.Type;

            /**
             * @type {boolean} modal - 로딩메세지가 객체를 덮을지 여부
             */
            modal?: boolean;

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

    export class Loading extends Aui.Base {
        component: Aui.Component;

        type: Aui.Loading.Type;
        modal: boolean;
        direction: 'column' | 'row';
        text: string;

        /**
         * 로딩메시지를 생성한다.
         *
         * @param {Aui.Component} component - 로딩메시지를 보일 컴포넌트
         * @param {Aui.Loading.Properties} properties - 객체설정
         */
        constructor(component: Aui.Component, properties: Aui.Loading.Properties = null) {
            super(properties);

            this.component = component;
            this.type = this.properties.type;
            this.modal = this.modal === false;
            this.direction = this.properties.direction ?? 'column';
            this.text = this.properties.text ?? null;
        }

        /**
         * 로딩메시지 DOM 이 추가되는 DOM 을 가져온다.
         *
         * @return {Dom} $appended
         */
        $getAppended(): Dom {
            if (this.modal == true) {
                return this.component.$getContainer();
            } else {
                return this.component.$getContent();
            }
        }

        /**
         * 로딩메시지 DOM 을 가져온다.
         *
         * @return {Dom} $loading
         */
        $getLoading(): Dom {
            if (Html.get('> div[data-type=loading][data-role=loading]', this.$getAppended()).getEl() == null) {
                const $loading = Html.create('div', { 'data-type': 'loading', 'data-role': 'loading' });
                const $box = Html.create('div', { 'data-role': 'box' });
                $box.addClass(this.direction);

                const $indicator = Html.create('div', { 'data-role': 'indicator', 'data-type': this.type });
                $box.append($indicator);

                switch (this.type) {
                    case 'column':
                    case 'atom':
                        $indicator.html('<i></i><i></i><i></i>');
                        break;

                    case 'dot':
                        $indicator.html('<i></i><i></i><i></i><i></i>');
                        break;
                }

                const $text = Html.create('div', { 'data-role': 'text' });
                $text.html(this.text ?? Aui.printText('actions.loading_status'));
                $box.append($text);

                $loading.append($box);
                this.$getAppended().append($loading);
            }

            const $loading = Html.get('> div[data-type=loading][data-role=loading]', this.$getAppended());

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
            $text.html(text ?? Aui.printText('actions.loading_status'));
        }

        /**
         * 로딩메시지를 보인다.
         */
        show(): Aui.Loading {
            this.$getLoading().addClass('show');
            return this;
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
            const $loading = Html.get('> div[data-type=loading][data-role=loading]', this.$getAppended());
            if ($loading.getEl() !== null) {
                $loading.remove();
            }
            this.remove();
        }
    }
}
