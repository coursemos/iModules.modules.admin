/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 목록 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.List.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 2. 28.
 */
namespace Admin {
    export namespace List {
        export class Panel extends Admin.Panel {
            type: string = 'list';
            role: string = 'panel';

            store: Admin.Store;
            multiple: boolean;
            selection: Admin.Data.Record[] = [];
            value: string | number | string[] | number[] = null;

            displayField: string;
            valueField: string;
            renderer: Admin.List.renderer;

            /**
             * 패널을 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties: { [key: string]: any } = null) {
                super(properties);

                this.store = this.properties.store;
                this.store.addEvent('load', () => {
                    this.onLoad();
                });

                this.multiple = this.properties.multiple === true;

                this.displayField = this.properties.displayField ?? 'display';
                this.valueField = this.properties.valueField ?? 'value';
                this.renderer =
                    this.properties.renderer ??
                    ((_list, display, _record): string => {
                        return display;
                    });
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

                $items.get(origin)?.removeClass('focus');
                $items.get(index)?.addClass('focus');
            }

            /**
             * 포커스가 지정된 라인이 있다면 포커스를 해제한다.
             */
            blurRow(): void {
                Html.all('ul[data-role=list] > li', this.$getContent()).removeClass('focus');
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

                const $focus = Html.get('> li.focus', $list);
                return $focus.getIndex();
            }

            /**
             * 선택된 항목을 배열로 가져온다.
             *
             * @return {Admin.Data.Record[]} selection
             */
            getSelections(): Admin.Data.Record[] {
                const selection = [];
                Html.all('li.selected', this.$getContent()).forEach((dom: Dom) => {
                    selection.push(dom.getData('record'));
                });

                return selection;
            }

            /**
             * 다중선택이 허용되지 않은 경우 단일 선택항목만 가져온다.
             *
             * @return {Admin.Data.Record|Admin.Data.Record[]} selection
             */
            getSelection(): Admin.Data.Record | Admin.Data.Record[] {
                const selection = this.getSelections();
                return this.multiple == true ? selection : selection.length > 0 ? selection[0] : null;
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
                if (this.getStore().isLoaded() === false) return;

                const $content = this.$getContent();
                $content.empty();

                const $list = Html.create('ul', { 'data-role': 'list' });
                this.getStore()
                    .getRecords()
                    .forEach((record: Admin.Data.Record, index: number) => {
                        const $item = Html.create('li').setData('record', record);
                        $item.on('click', () => {
                            this.toggle(index);
                        });
                        $item.on('mouseover', () => {
                            this.focusRow(index);
                        });
                        $item.html(this.renderer(this, record.get(this.displayField), record));
                        $list.append($item);
                    });

                $content.append($list);
            }

            /**
             * 셀렉트폼이 랜더링이 완료되었을 때 이벤트를 처리한다.
             */
            onRender(): void {
                super.onRender();

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
             * 데이터스토어의 데이터를 불러왔을 때 이벤트를 처리한다.
             */
            onLoad(): void {
                if (this.getStore().isLoaded() === false) return;

                this.renderContent();

                this.fireEvent('load', [this, this.getStore()]);
            }

            /**
             * 선택항목이 변경되었을 때 이벤트를 처리한다.
             */
            onSelectionChange(): void {
                if (this.isEqual(this.getSelections()) === false) {
                    this.selection = this.getSelections();
                    this.fireEvent('selectionChange', [this, this.getSelection()]);
                }
            }

            /**
             * 선택항목이 종료되었을 때 이벤트를 처리한다.
             */
            onSelectionComplete(): void {
                this.blurRow();
                this.fireEvent('selectionComplete', [this, this.getSelection()]);
            }

            /**
             * 현재 선택항목과 일치하는지 확인한다.
             *
             * @param {Admin.Data.Record[]} selection - 확인할 선택항목
             * @return {boolean} isEqual
             */
            isEqual(selection: Admin.Data.Record[]): boolean {
                if (this.selection === selection) return true;
                if (this.selection == null || selection == null) return false;
                if (this.selection.length !== selection.length) return false;

                for (var i = 0; i < this.selection.length; ++i) {
                    if (this.selection[i] !== selection[i]) return false;
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

        export interface renderer {
            (list: Admin.List.Panel, display: string, record: Admin.Data.Record): string;
        }
    }
}
