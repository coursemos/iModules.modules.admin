/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * Aui가 동작할 기본 뷰포트 클래스를 정의한다.
 *
 * @file /scripts/Aui.Viewport.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 3. 27.
 */
namespace Aui {
    export namespace Viewport {
        export interface Properties extends Aui.Component.Properties {
            /**
             * @type {string} renderTo - Aui 라이브러리 경로
             */
            baseUrl: string;

            /**
             * @type {string} renderTo - 뷰포트를 랜더링할 DOM 객체의 querySelector
             */
            renderTo: string;
        }
    }

    export class Viewport extends Aui.Component {
        type: string = 'viewport';
        role: string = 'viewport';

        baseUrl: string;
        renderTo: string;

        /**
         * 패널을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties: Aui.Viewport.Properties = null) {
            super(properties);
            this.baseUrl = properties.baseUrl ?? './';
            this.renderTo = properties.renderTo;
            this.layout = 'fit';
            this.scrollable = properties.scrollable ?? false;
        }

        /**
         * 컴포넌트 컨텐츠를 랜더링한다.
         */
        renderContent(): void {
            for (let item of this.getItems()) {
                item.$getComponent().setAttr('data-region', item.properties.region ?? 'center');
                this.$getContent().append(item.$getComponent());
                if (item.isRenderable() == true) {
                    item.render();
                }
            }
        }

        /**
         * 뷰포트가 랜더링이 완료되었을 때 이벤트를 처리한다.
         */
        onRender(): void {
            super.onRender();

            /**
             * Aui 가 준비가 되었으므로, ready 이벤트를 실행한다.
             */
            Aui.readyListeners.forEach((listener) => {
                listener();
            });
        }

        /**
         * 뷰포트를 관리자영역에 출력한다.
         */
        async doLayout(): Promise<void> {
            await Aui.initLanguage(this.baseUrl);
            Html.get(this.renderTo).append(this.$component);
            this.render();
        }
    }
}
