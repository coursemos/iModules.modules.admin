/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 목록 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.List.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 4. 1.
 */
namespace Admin {
    export namespace List {
        export namespace Panel {
            export interface Properties extends Admin.Base.Properties {
                /**
                 * @type {Admin.Store} store - 목록 store
                 */
                store: Admin.Store;

                /**
                 * @type {boolean} multiple - 다중선택여부
                 */
                multiple?: boolean;

                /**
                 * @type {boolean} wrap - 목록 줄바꿈 여부
                 */
                wrap?: boolean;

                /**
                 * @type {string} class - 목록 스타일클래스
                 */
                class?: string;

                /**
                 * @type {string | number | string[] | number[]} value - 선택항목
                 */
                value?: string | number | string[] | number[];

                /**
                 * @type {string} displayField - 선택된 값을 표시할 store 의 field 명
                 */
                displayField?: string;

                /**
                 * @type {string} valueField - 폼 전송시 전송될 값을 지정할 store 의 field 명
                 */
                valueField?: string;

                /**
                 * @type {string} listField - 목록 항목에 표시할 store 의 field 명
                 */
                listField?: string;

                /**
                 * @type {number} maxHeight - 목록 최대높이
                 */
                maxHeight?: number;

                /**
                 * @type {Function} renderer - 선택된 항목을 보일 때 사용할 렌더링 함수
                 */
                renderer?: (display: string, record: Admin.Data.Record, $dom: Dom, list: Admin.List.Panel) => string;

                /**
                 * @type {string} loadingType - 로딩메시지 타입
                 */
                loadingType?: Admin.Loading.Type;

                /**
                 * @type {string} loadingText - 로딩메시지
                 */
                loadingText?: string;
            }
        }

        export class Panel extends Admin.Panel {
            type: string = 'list';
            role: string = 'panel';

            store: Admin.Store;
            multiple: boolean;
            selections: Admin.Data.Record[] = [];
            wrap: boolean;
            value: string | number | string[] | number[] = null;

            displayField: string;
            valueField: string;
            renderer: (display: string, record: Admin.Data.Record, $dom: Dom, list: Admin.List.Panel) => string;

            maxHeight: number;

            loading: Admin.Loading;

            /**
             * 패널을 생성한다.
             *
             * @param {Admin.List.Panel.Properties} properties - 객체설정
             */
            constructor(properties: Admin.List.Panel.Properties = null) {
                super(properties);

                this.store = this.properties.store;
                this.store.addEvent('beforeLoad', () => {
                    this.onBeforeLoad();
                });
                this.store.addEvent('load', () => {
                    this.onLoad();
                });
                this.store.addEvent('update', () => {
                    this.onUpdate();
                });

                this.multiple = this.properties.multiple === true;
                this.wrap = this.properties.wrap === true;

                this.displayField = this.properties.displayField ?? 'display';
                this.valueField = this.properties.valueField ?? 'value';
                this.renderer =
                    this.properties.renderer ??
                    ((display): string => {
                        return display;
                    });

                this.maxHeight = this.properties.maxHeight ?? null;
                this.scrollable = 'Y';

                this.loading = new Admin.Loading(this, {
                    type: this.properties.loadingType ?? 'column',
                    direction: 'column',
                    text: this.properties.loadingText ?? null,
                });
            }

            /**
             * 목록의 최대높이를 설정한다.
             *
             * @param {number} maxHeight - 최대높이
             */
            setMaxHeight(maxHeight: number): void {
                this.maxHeight = maxHeight;

                this.$getContent().setStyle(
                    'max-height',
                    this.maxHeight === null ? this.maxHeight : this.maxHeight + 'px'
                );
            }

            /**
             * 데이터스토어를 가져온다.
             *
             * @return {Admin.Store} store
             */
            getStore(): Admin.Store {
                return this.store;
            }

            /**
             * 특정 라인에 포커스를 지정한다..
             *
             * @param {number} index - 포커스를 지정할 라인 인덱스
             */
            focusRow(index: number): void {
                const $list = Html.get('> ul[data-role=list]', this.$getContent());
                const $items = Html.all('> li', $list);

                const origin = this.getFocusedRowIndex();
                if (origin == index) {
                    return;
                }

                $items.get(origin)?.removeClass('focused');
                $items.get(index)?.addClass('focused');
            }

            /**
             * 포커스가 지정된 라인이 있다면 포커스를 해제한다.
             */
            blurRow(): void {
                Html.all('ul[data-role=list] > li', this.$getContent()).removeClass('focused');
            }

            /**
             * 포커스를 이동한다.
             *
             * @param {('up'|'down')} direction - 방향
             */
            moveFocusedRow(direction: 'up' | 'down'): void {
                const $list = Html.get('> ul[data-role=list]', this.$getContent());
                const $items = Html.all('> li', $list);
                if ($items.getList().length == 0) {
                    return;
                }

                let index = this.getFocusedRowIndex();
                if (direction == 'up' && index > 0) index--;
                if (direction == 'down' && index < $items.getList().length - 1) index++;
                if (!~index) index = 0;

                this.focusRow(index);
            }

            /**
             * 현재 포커스가 존재하는 라인의 인덱스를 가져온다.
             *
             * @return {number} index
             */
            getFocusedRowIndex(): number {
                const $list = Html.get('> ul[data-role=list]', this.$getContent());
                const $items = Html.all('> li', $list);
                if ($items.getList().length == 0) {
                    return -1;
                }

                const $focus = Html.get('> li.focused', $list);
                return $focus.getIndex();
            }

            /**
             * 선택된 항목을 배열로 가져온다.
             *
             * @return {Admin.Data.Record[]} selections
             */
            getSelections(): Admin.Data.Record[] {
                const selections = [];
                Html.all('li.selected', this.$getContent()).forEach(($dom: Dom) => {
                    selections.push($dom.getData('record'));
                });

                return selections;
            }

            /**
             * 특정 라인을 선택한다.
             *
             * @param {number} index - 선택할 라인 인덱스
             * @param {boolean} is_keep - 이전 선택항목을 유지할지 여부
             */
            select(index: number, is_keep: boolean = false) {
                if (index < 0) {
                    return;
                }

                if (is_keep == false || this.multiple == false) {
                    this.deselectAll(false);
                }

                Html.all('li', this.$getContent()).get(index).addClass('selected');

                this.onSelectionChange();
            }

            /**
             * 특정 라인을 선택한다.
             *
             * @param {number} index - 선택할 라인 인덱스
             */
            deselect(index: number) {
                Html.all('li', this.$getContent()).get(index).removeClass('selected');

                this.onSelectionChange();
            }

            /**
             * 선택된 모든 라인을 선택해제한다.
             *
             * @param {boolean} is_event - 이벤트 발생여부
             */
            deselectAll(is_event: boolean = true) {
                Html.all('li', this.$getContent()).removeClass('selected');
                if (is_event == true) {
                    this.onSelectionChange();
                }
            }

            /**
             * 특정 라인의 선택여부를 토글한다.
             *
             * @param {number} index - 토글할 라인인덱스
             */
            toggle(index: number): void {
                if (this.multiple == true) {
                    if (Html.all('li', this.$getContent()).get(index).hasClass('selected') == true) {
                        Html.all('li', this.$getContent()).get(index).addClass('selected');
                    } else {
                        Html.all('li', this.$getContent()).get(index).removeClass('selected');
                    }
                    this.onSelectionChange();
                } else {
                    this.select(index);
                    this.onSelectionComplete();
                }
            }

            /**
             * 목록을 랜더링한다.
             */
            renderContent(): void {
                const $content = this.$getContent();
                const $list = Html.create('ul', { 'data-role': 'list' });
                $content.append($list);
            }

            /**
             * 목록 데이터를 업데이트한다.
             */
            updateContent(): void {
                const $list = Html.get(' > ul[data-role=list]', this.$getContent());

                this.getStore()
                    .getRecords()
                    .forEach((record: Admin.Data.Record, index: number) => {
                        const $item = Html.create('li').setData('record', record);
                        if (this.wrap === true) {
                            $item.addClass('wrap');
                        }

                        $item.on('click', () => {
                            this.toggle(index);
                        });
                        $item.on('mouseover', () => {
                            this.focusRow(index);
                        });
                        $item.html(this.renderer(record.get(this.displayField), record, $item, this));
                        $list.append($item);
                    });
            }

            /**
             * 셀렉트폼이 랜더링이 완료되었을 때 이벤트를 처리한다.
             */
            onRender(): void {
                super.onRender();
                this.setMaxHeight(this.maxHeight);

                if (this.getStore().isLoaded() === false) {
                    this.getStore().load();
                }

                this.$getComponent().on('keydown', (e: KeyboardEvent) => {
                    if (e.key == 'ArrowDown' || e.key == 'ArrowUp') {
                        this.moveFocusedRow(e.key == 'ArrowDown' ? 'down' : 'up');
                    }

                    if (e.key == 'Enter') {
                        if (this.getFocusedRowIndex() >= 0) {
                            this.select(this.getFocusedRowIndex());
                            this.onSelectionComplete();
                        }
                    }

                    if (e.key == ' ') {
                        this.select(this.getFocusedRowIndex(), true);
                        if (this.multiple == false) {
                            this.onSelectionComplete();
                        }
                    }

                    if (e.key == 'Escape') {
                        this.onSelectionComplete();
                    }
                });
            }

            /**
             * 데이터스토어의 데이터를 불러오기전 이벤트를 처리한다.
             */
            onBeforeLoad(): void {
                this.loading.show();
                this.fireEvent('beforeLoad', [this, this.getStore()]);
            }

            /**
             * 데이터스토어의 데이터를 불러왔을 때 이벤트를 처리한다.
             */
            onLoad(): void {
                if (this.getStore().isLoaded() === false) return;
                this.loading.hide();
                this.fireEvent('load', [this, this.getStore()]);
            }

            /**
             * 데이터스토어의 데이터가 변경되었 때 이벤트를 처리한다.
             */
            onUpdate(): void {
                this.updateContent();
                this.fireEvent('update', [this, this.getStore()]);
            }

            /**
             * 선택항목이 변경되었을 때 이벤트를 처리한다.
             */
            onSelectionChange(): void {
                const selections = this.getSelections();
                if (this.isEqual(selections) === false) {
                    this.selections = selections;
                    this.fireEvent('selectionChange', [selections, this]);
                }
            }

            /**
             * 선택항목이 종료되었을 때 이벤트를 처리한다.
             */
            onSelectionComplete(): void {
                this.blurRow();
                this.fireEvent('selectionComplete', [this.getSelections(), this]);
            }

            /**
             * 현재 선택항목과 일치하는지 확인한다.
             *
             * @param {Admin.Data.Record[]} selections - 확인할 선택항목
             * @return {boolean} isEqual
             */
            isEqual(selections: Admin.Data.Record[]): boolean {
                if (this.selections === selections) return true;
                if (this.selections == null || selections == null) return false;
                if (this.selections.length !== selections.length) return false;

                for (var i = 0; i < this.selections.length; ++i) {
                    if (this.selections[i] !== selections[i]) return false;
                }

                return true;
            }

            /**
             * 컴포넌트를 제거한다.
             */
            remove(): void {
                this.getStore().remove();
                super.remove();
            }
        }
    }
}
