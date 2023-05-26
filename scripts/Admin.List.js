/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 목록 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.List.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 5. 27.
 */
var Admin;
(function (Admin) {
    let List;
    (function (List) {
        class Panel extends Admin.Panel {
            type = 'list';
            role = 'panel';
            store;
            multiple;
            selections = [];
            wrap;
            value = null;
            displayField;
            valueField;
            renderer;
            maxHeight;
            hideOnEmpty;
            loading;
            $list;
            /**
             * 패널을 생성한다.
             *
             * @param {Admin.List.Panel.Properties} properties - 객체설정
             */
            constructor(properties = null) {
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
                        ((display) => {
                            return display;
                        });
                this.maxHeight = this.properties.maxHeight ?? null;
                this.scrollable = 'Y';
                this.hideOnEmpty = this.properties.hideOnEmpty === true;
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
            setMaxHeight(maxHeight) {
                this.maxHeight = maxHeight;
                this.$getContent().setStyle('max-height', this.maxHeight === null ? this.maxHeight : this.maxHeight + 'px');
            }
            /**
             * 데이터스토어를 가져온다.
             *
             * @return {Admin.Store} store
             */
            getStore() {
                return this.store;
            }
            /**
             * 목록을 표시할 DOM 객체를 가져온다.
             *
             * @return {Dom} $list
             */
            $getList() {
                if (this.$list === undefined) {
                    this.$list = Html.create('ul', { 'data-role': 'list' });
                    if (this.hideOnEmpty == true) {
                        this.$list.addClass('autohide');
                    }
                }
                return this.$list;
            }
            /**
             * 특정 라인에 포커스를 지정한다..
             *
             * @param {number} index - 포커스를 지정할 라인 인덱스
             */
            focusRow(index) {
                const $list = this.$getList();
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
            blurRow() {
                Html.all('> li', this.$getList()).removeClass('focused');
            }
            /**
             * 포커스를 이동한다.
             *
             * @param {('up'|'down')} direction - 방향
             */
            moveFocusedRow(direction) {
                const $items = Html.all('> li', this.$getList());
                if ($items.getList().length == 0) {
                    return;
                }
                let index = this.getFocusedRowIndex();
                if (direction == 'up' && index > 0)
                    index--;
                if (direction == 'down' && index < $items.getList().length - 1)
                    index++;
                if (!~index)
                    index = 0;
                this.focusRow(index);
            }
            /**
             * 현재 포커스가 존재하는 라인의 인덱스를 가져온다.
             *
             * @return {number} index
             */
            getFocusedRowIndex() {
                const $list = this.$getList();
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
            getSelections() {
                const selections = [];
                Html.all('li.selected', this.$getContent()).forEach(($dom) => {
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
            select(index, is_keep = false) {
                if (index < 0) {
                    return;
                }
                if (is_keep == false || this.multiple == false) {
                    this.deselectAll(false);
                }
                Html.all('> li', this.$getList()).get(index).addClass('selected');
                this.onSelectionChange();
            }
            /**
             * 특정 라인을 선택한다.
             *
             * @param {number} index - 선택할 라인 인덱스
             */
            deselect(index) {
                Html.all('> li', this.$getList()).get(index).removeClass('selected');
                this.onSelectionChange();
            }
            /**
             * 선택된 모든 라인을 선택해제한다.
             *
             * @param {boolean} is_event - 이벤트 발생여부
             */
            deselectAll(is_event = true) {
                Html.all('> li', this.$getList()).removeClass('selected');
                if (is_event == true) {
                    this.onSelectionChange();
                }
            }
            /**
             * 특정 라인의 선택여부를 토글한다.
             *
             * @param {number} index - 토글할 라인인덱스
             */
            toggle(index) {
                if (this.multiple == true) {
                    if (Html.all('> li', this.$getList()).get(index).hasClass('selected') == true) {
                        Html.all('> li', this.$getList()).get(index).addClass('selected');
                    }
                    else {
                        Html.all('> li', this.$getList()).get(index).removeClass('selected');
                    }
                    this.onSelectionChange();
                }
                else {
                    this.select(index);
                    this.onSelectionComplete();
                }
            }
            /**
             * 목록을 랜더링한다.
             */
            renderContent() {
                const $content = this.$getContent();
                const $list = this.$getList();
                $content.append($list);
            }
            /**
             * 목록 데이터를 업데이트한다.
             */
            updateContent() {
                const $list = this.$getList();
                $list.empty();
                this.getStore()
                    .getRecords()
                    .forEach((record, index) => {
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
            onRender() {
                super.onRender();
                this.setMaxHeight(this.maxHeight);
                this.getStore().load();
                this.$getComponent().on('keydown', (e) => {
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
            onBeforeLoad() {
                this.loading.show();
                this.fireEvent('beforeLoad', [this, this.getStore()]);
            }
            /**
             * 데이터스토어의 데이터를 불러왔을 때 이벤트를 처리한다.
             */
            onLoad() {
                if (this.getStore().isLoaded() === false)
                    return;
                this.loading.hide();
                this.fireEvent('load', [this, this.getStore()]);
            }
            /**
             * 데이터스토어의 데이터가 변경되었 때 이벤트를 처리한다.
             */
            onUpdate() {
                this.updateContent();
                this.fireEvent('update', [this, this.getStore()]);
            }
            /**
             * 선택항목이 변경되었을 때 이벤트를 처리한다.
             */
            onSelectionChange() {
                const selections = this.getSelections();
                if (this.isEqual(selections) === false) {
                    this.selections = selections;
                    this.fireEvent('selectionChange', [selections, this]);
                }
            }
            /**
             * 선택항목이 종료되었을 때 이벤트를 처리한다.
             */
            onSelectionComplete() {
                this.blurRow();
                this.fireEvent('selectionComplete', [this.getSelections(), this]);
            }
            /**
             * 현재 선택항목과 일치하는지 확인한다.
             *
             * @param {Admin.Data.Record[]} selections - 확인할 선택항목
             * @return {boolean} isEqual
             */
            isEqual(selections) {
                return Format.isEqual(this.selections, selections);
            }
            /**
             * 컴포넌트를 제거한다.
             */
            remove() {
                this.getStore().remove();
                super.remove();
            }
        }
        List.Panel = Panel;
    })(List = Admin.List || (Admin.List = {}));
})(Admin || (Admin = {}));
