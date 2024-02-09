/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 프로그래스바 클래스를 정의한다.
 *
 * @file /scripts/Aui.Progress.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 2. 3.
 */
namespace Aui {
    export namespace Progress {
        export interface Properties extends Aui.Component.Properties {
            /**
             * @type {string} message - 프로그래스바 메시지
             */
            message?: string;

            /**
             * @type {number} min - 프로그래스바 시작점
             */
            min?: number;

            /**
             * @type {number} max - 프로그래스바 종료점
             */
            max?: number;

            /**
             * @type {number} value - 프로그래스바 값
             */
            value?: number;

            /**
             * @type {boolean} loading - 로딩상태여부
             */
            loading?: boolean;
        }
    }

    export class Progress extends Aui.Component {
        type: string = 'progress';
        role: string = 'progress';

        message: string;
        min: number;
        max: number;
        value: number;
        loading: boolean;

        $message: Dom;
        $progress: Dom;

        /**
         * 프로그래스바를 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties: Aui.Progress.Properties = null) {
            super(properties);

            this.message = this.properties.message ?? null;
            this.min = this.properties.min ?? 0;
            this.max = this.properties.max ?? 100;
            this.value = this.properties.value ?? 0;
            this.loading = this.properties.loading === true;
        }

        /**
         * 메시지 DOM 을 가져온다.
         *
         * @return {Dom} $message
         */
        $getMessage(): Dom {
            if (this.$message === undefined) {
                this.$message = Html.create('div').setAttr('data-role', 'message');
            }

            return this.$message;
        }

        /**
         * 프로그래스바 DOM 을 가져온다.
         *
         * @return {Dom} $progress
         */
        $getProgress(): Dom {
            if (this.$progress === undefined) {
                this.$progress = Html.create('progress', { min: this.min.toString(), max: this.max.toString() });
            }

            return this.$progress;
        }

        /**
         * 프로그래스바 메시지를 변경한다.
         *
         * @param {string} message - 변경할 메시지
         */
        setMessage(message: string = null): void {
            this.message = message;
            this.$getMessage().html(this.message ?? '');
        }

        /**
         * 프로그래스바 값을 변경한다.
         *
         * @param {number} value - 프로그래스바 값
         */
        setValue(value: number): void {
            if (this.loading == true) {
                this.setLoading(false);
            }
            this.value = value;
            this.$getProgress().setAttr('value', (this.max === 0 ? 1 : this.value).toString());
        }

        /**
         * 프로그래스바 시작점을 변경한다.
         *
         * @param {number} min - 프로그래스바 값
         */
        setMin(min: number): void {
            this.min = min;
            this.$getProgress().setAttr('min', this.min.toString());
        }

        /**
         * 프로그래스바 종료점을 변경한다.
         *
         * @param {number} max - 프로그래스바 값
         */
        setMax(max: number): void {
            this.max = max;
            this.$getProgress().setAttr('max', Math.max(this.max, 1).toString());
        }

        /**
         * 프로그래스바 값을 가져온다.
         *
         * @return {number} value
         */
        getValue(): number {
            return this.value;
        }

        /**
         * 프로그래스바 로딩상태를 변경한다.
         *
         * @param {boolean} loading - 로딩상태여부
         */
        setLoading(loading: boolean): void {
            this.loading = loading;
            if (this.loading == true) {
                this.$getProgress().addClass('loading');
            } else {
                this.$getProgress().removeClass('loading');
            }
        }

        /**
         * 레이아웃을 렌더링한다.
         */
        renderContent(): void {
            const $message = this.$getMessage();
            $message.html(this.message ?? '');
            this.$getContent().append($message);

            const $progress = this.$getProgress();
            $progress.setAttr('value', this.value.toString());

            if (this.loading == true) {
                $progress.addClass('loading');
            }

            this.$getContent().append(this.$progress);
        }
    }
}
