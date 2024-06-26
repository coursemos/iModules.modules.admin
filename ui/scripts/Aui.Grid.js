/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 그리드패널 클래스를 정의한다.
 *
 * @file /scripts/Aui.Grid.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 5. 7.
 */
var Aui;
(function (Aui) {
    let Grid;
    (function (Grid) {
        class Panel extends Aui.Panel {
            type = 'panel';
            role = 'grid';
            headers;
            columns;
            freeze;
            freezeColumn;
            freezeWidth;
            columnResizable;
            columnLines;
            columnHeaders;
            rowLines;
            selection;
            selections = new Map();
            store;
            autoLoad;
            $header;
            $body;
            $footer;
            focusedRow = null;
            focusedCell = { rowIndex: null, columnIndex: null };
            editingField = null;
            editingCell = { rowIndex: null, columnIndex: null };
            setRowClass;
            loading;
            emptyText;
            /**
             * 그리드패널을 생성한다.
             *
             * @param {Aui.Grid.Panel.Properties} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.freeze = this.properties.freeze ?? 0;
                this.scrollable = this.properties.scrollable ?? true;
                this.columnResizable = this.properties.columnResizable !== false;
                this.columnLines = this.properties.columnLines !== false;
                this.columnHeaders = this.properties.columnHeaders !== false;
                this.rowLines = this.properties.rowLines !== false;
                this.selection = this.properties.selection ?? { selectable: false };
                this.selection.selectable = this.selection.selectable ?? true;
                this.selection.display = this.selection.display ?? 'row';
                this.selection.multiple = this.selection.multiple ?? (this.selection.display == 'check' ? true : false);
                this.selection.deselectable =
                    this.selection.deselectable ?? (this.selection.display == 'check' ? true : false);
                this.selection.keepable = this.selection.keepable ?? false;
                this.store = this.properties.store ?? new Aui.Store();
                this.store.addEvent('beforeLoad', () => {
                    this.onBeforeLoad();
                });
                this.store.addEvent('load', () => {
                    this.onLoad();
                });
                this.store.addEvent('beforeUpdate', () => {
                    this.onBeforeUpdate();
                });
                this.store.addEvent('update', () => {
                    this.onUpdate();
                });
                this.autoLoad = this.properties.autoLoad !== false;
                this.initColumns();
                this.$header = Html.create('div').setData('role', 'header');
                this.$body = Html.create('div').setData('role', 'body');
                this.$footer = Html.create('div').setData('role', 'footer');
                this.loading = new Aui.Loading(this, {
                    type: this.properties.loadingType ?? 'column',
                    direction: 'column',
                    text: this.properties.loadingText ?? null,
                });
                this.emptyText = this.properties.emptyText ?? null;
                if (this.emptyText !== null) {
                    this.$body.setAttr('data-empty-text', this.emptyText);
                }
                this.setRowClass = this.properties.setRowClass ?? null;
            }
            /**
             * 그리드패널 헤더의 하위 컴포넌트를 초기화한다.
             */
            initColumns() {
                this.headers = [];
                this.columns = [];
                for (let column of this.properties.columns ?? []) {
                    if (!(column instanceof Aui.Grid.Column)) {
                        column = new Aui.Grid.Column(column);
                    }
                    column.setGrid(this);
                    this.headers.push(column);
                    this.columns.push(...column.getColumns());
                }
                this.columns.forEach((column, columnIndex) => {
                    column.setColumnIndex(columnIndex);
                });
                this.freeze = Math.min(this.headers.length - 1, this.freeze);
            }
            /**
             * 그리드패널의 데이터스토어를 가져온다.
             *
             * @return {Aui.Store} store
             */
            getStore() {
                return this.store ?? this.properties.store ?? new Aui.Store();
            }
            /**
             * 그리드패널의 헤더 Dom 을 가져온다.
             *
             * @return {Dom} $header
             */
            $getHeader() {
                return this.$header;
            }
            /**
             * 그리드패널의 바디 Dom 을 가져온다.
             *
             * @return {Dom} $body
             */
            $getBody() {
                return this.$body;
            }
            /**
             * 그리드패널의 푸터 Dom 을 가져온다.
             *
             * @return {Dom} $footer
             */
            $getFooter() {
                return this.$footer;
            }
            /**
             * 그리드패널의 전체 제목컬럼을 가져온다.
             *
             * @return {Aui.Grid.Column[]} headers
             */
            getHeaders() {
                return this.headers;
            }
            /**
             * 그리드패널의 특정 순서의 제목컬럼을 가져온다.
             *
             * @return {Aui.Grid.Column} headerIndex
             */
            getHeaderByIndex(headerIndex) {
                if (typeof headerIndex === 'number') {
                    return this.headers[headerIndex];
                }
                else {
                    let header = this.headers[headerIndex.shift()];
                    for (const index of headerIndex) {
                        let children = header.getChildren();
                        header = children[index] ?? null;
                        if (header === null) {
                            return null;
                        }
                    }
                    return header;
                }
            }
            /**
             * 그리드패널의 전체 컬럼을 가져온다.
             *
             * @return {Aui.Grid.Column[]} columns
             */
            getColumns() {
                return this.columns;
            }
            /**
             * 특정 순서의 컬럼을 가져온다.
             *
             * @param {number} columnIndex - 가져올 컬럼의 인덱스
             * @return {Aui.Grid.Column} column - 컬럼
             */
            getColumnByIndex(columnIndex) {
                const column = this.columns[columnIndex];
                if (column instanceof Aui.Grid.Column) {
                    return column;
                }
                else {
                    return null;
                }
            }
            /**
             * 컬럼을 추가한다.
             *
             * @param {(Aui.Grid.Column|Aui.Grid.Column.Properties)} column - 추가할 컬럼
             * @param {number} position - 추가할 헤더 위치
             */
            addColumn(column, position = null) {
                if (position === null || position >= (this.properties.columns.length ?? 0)) {
                    this.properties.columns.push(column);
                }
                else if (position < 0 && Math.abs(position) >= (this.properties.columns.length ?? 0)) {
                    this.properties.columns.unshift(column);
                }
                else {
                    this.properties.columns.splice(position, 0, column);
                }
                this.updateColumns();
            }
            /**
             * 모든 컬럼을 제거한다.
             */
            removeColumns() {
                this.properties.columns = [];
                this.updateColumns();
            }
            /**
             * 순차정렬이 적용되어 있는 선택된 열의 위치를 이동한다.
             *
             * @param {'up'|'down'} direction - 이동할 방향
             */
            moveSelections(direction) {
                if (this.getSelections().length == 0) {
                    return;
                }
                const sorters = this.store.getSorters();
                if (sorters === null || Object.keys(sorters).length !== 1) {
                    return;
                }
                const sortField = Object.keys(sorters).pop();
                const rowIndexes = [];
                for (const selected of this.getSelections()) {
                    rowIndexes.push(this.store.matchIndex(selected));
                }
                rowIndexes.sort();
                let focusRow = null;
                if (direction == 'up') {
                    if (rowIndexes[0] == 0) {
                        return;
                    }
                    for (const rowIndex of rowIndexes) {
                        const targetIndex = rowIndex - 1;
                        const target = this.store.getAt(targetIndex);
                        const record = this.store.getAt(rowIndex);
                        const move = target.get(sortField);
                        target.set(sortField, record.get(sortField));
                        record.set(sortField, move);
                        this.store.setAt(rowIndex, target);
                        this.store.setAt(targetIndex, record);
                        focusRow ??= targetIndex;
                    }
                }
                else {
                    rowIndexes.reverse();
                    if (rowIndexes[0] == this.getStore().getCount() - 1) {
                        return;
                    }
                    for (const rowIndex of rowIndexes) {
                        const targetIndex = rowIndex + 1;
                        const target = this.store.getAt(targetIndex);
                        const record = this.store.getAt(rowIndex);
                        const move = target.get(sortField);
                        target.set(sortField, record.get(sortField));
                        record.set(sortField, move);
                        this.store.setAt(rowIndex, target);
                        this.store.setAt(targetIndex, record);
                        focusRow ??= targetIndex;
                    }
                }
                if (focusRow !== null) {
                    this.focusRow(focusRow);
                    this.onUpdate();
                }
            }
            /**
             * 특정 열에 포커스를 지정한다.
             *
             * @param {number} rowIndex - 행 인덱스
             */
            focusRow(rowIndex) {
                const $row = this.$getRow(rowIndex);
                if ($row == null) {
                    return;
                }
                this.blurRow();
                const headerHeight = this.$getHeader().getOuterHeight();
                const contentHeight = this.$getContent().getHeight();
                const offset = $row.getPosition();
                const scroll = this.getScroll().getPosition();
                const top = offset.top;
                const bottom = top + $row.getOuterHeight();
                if (top - 1 < headerHeight) {
                    const minScroll = 0;
                    const y = Math.max(top + scroll.y - headerHeight - 1, minScroll);
                    this.getScroll().setPosition(null, y, true);
                }
                else if (bottom + 1 > contentHeight) {
                    const maxScroll = this.$getContent().getScrollHeight() - contentHeight;
                    const y = Math.min(bottom + scroll.y - contentHeight + 1, maxScroll);
                    this.getScroll().setPosition(null, y, true);
                }
                this.focusedRow = rowIndex;
                $row.addClass('focused');
            }
            /**
             * 포커스가 지정된 열의 포커스를 해제한다.
             */
            blurRow() {
                this.focusedRow = null;
                Html.all('div[data-role=row].focused', this.$body).removeClass('focused');
            }
            /**
             * 특정 셀에 포커스를 지정한다.
             *
             * @param {number} rowIndex - 행 인덱스
             * @param {number} columnIndex - 컬럼 인덱스
             */
            focusCell(rowIndex, columnIndex) {
                if (this.isRendered() == false)
                    return;
                const $row = this.$getRow(rowIndex);
                if ($row === null)
                    return;
                const $column = Html.get('div[data-role=column][data-column="' + columnIndex + '"]', $row);
                if ($column.getEl() == null)
                    return;
                if (this.editingField !== null) {
                    if (this.editingCell.rowIndex !== rowIndex || this.editingCell.columnIndex !== columnIndex) {
                        this.completeEdit();
                        return;
                    }
                }
                this.blurCell();
                this.focusRow(rowIndex);
                $column.addClass('focused');
                this.focusedCell.rowIndex = rowIndex;
                this.focusedCell.columnIndex = columnIndex;
                const contentWidth = this.$getContent().getWidth();
                const offset = $column.getPosition();
                const scroll = this.getScroll().getPosition();
                const left = offset.left - scroll.x;
                const right = left + $column.getOuterWidth();
                if ($column.hasClass('sticky') == false) {
                    if (left < this.freezeWidth) {
                        const minScroll = 0;
                        const x = Math.max(left + scroll.x - this.freezeWidth - 2, minScroll);
                        this.getScroll().setPosition(x, null, true);
                    }
                    else if (right > contentWidth) {
                        const maxScroll = this.$getContent().getScrollWidth() - contentWidth;
                        const x = Math.min(right + scroll.x - contentWidth + 2, maxScroll);
                        this.getScroll().setPosition(x, null, true);
                    }
                }
                this.onFocusMove(rowIndex, columnIndex);
            }
            /**
             * 포커스된 셀을 포커스를 해제한다.
             */
            blurCell() {
                if (this.editingCell.rowIndex !== null || this.editingCell.columnIndex !== null) {
                    return;
                }
                this.blurRow();
                this.focusedCell.rowIndex = null;
                this.focusedCell.columnIndex = null;
                Html.all('div[data-role=column].focused', this.$body).removeClass('focused');
            }
            /**
             * 특정 셀을 데이터 수정모드로 변경한다.
             *
             * @param {number} rowIndex
             * @param {number} columnIndex
             */
            editCell(rowIndex, columnIndex) {
                if (this.isRendered() == false)
                    return;
                if (this.editingCell.rowIndex === rowIndex && this.editingCell.columnIndex === columnIndex) {
                    return;
                }
                if (this.editingField !== null) {
                    this.completeEdit();
                    return;
                }
                const $row = this.$getRow(rowIndex);
                if ($row === null)
                    return;
                const $column = Html.get('div[data-role=column][data-column="' + columnIndex + '"]', $row);
                if ($column.getEl() == null)
                    return;
                const column = this.columns[columnIndex];
                if (column.editor === null) {
                    return;
                }
                const record = $column.getData('record');
                this.editingField = this.columns[columnIndex].editor(record.get(column.dataIndex ?? '') ?? '', record, rowIndex, columnIndex, this);
                if (this.editingField === null) {
                    return;
                }
                this.editingCell.rowIndex = rowIndex;
                this.editingCell.columnIndex = columnIndex;
                this.editingField.addEvent('blur', () => {
                    this.completeEdit();
                });
                this.editingField.$getComponent().on('keydown', (e) => {
                    if (e.key == 'Enter') {
                        this.completeEdit();
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                    if (e.key == 'Escape') {
                        this.completeEdit(true);
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                });
                Html.get('div[data-role=view]', $column).hide();
                $column.append(this.editingField.$getComponent());
                this.editingField.render();
                this.focusCell(rowIndex, columnIndex);
                this.editingField.focus();
            }
            /**
             * 셀 에디트 모드를 종료한다.
             *
             * @param {boolean} is_rollback - 롤백여부
             */
            completeEdit(is_rollback = false) {
                if (this.editingField === null) {
                    return;
                }
                const rowIndex = this.editingCell.rowIndex;
                const columnIndex = this.editingCell.columnIndex;
                const $row = this.$getRow(rowIndex ?? -1);
                if ($row === null)
                    return;
                const $column = Html.get('div[data-role=column][data-column="' + columnIndex ?? 0 + '"]', $row);
                if ($column.getEl() == null)
                    return;
                const column = this.columns[columnIndex ?? 0];
                const value = this.editingField.getValue();
                this.editingCell.rowIndex = null;
                this.editingCell.columnIndex = null;
                this.editingField.remove();
                this.editingField = null;
                if (is_rollback === true) {
                    Html.get('div[data-role=view]', $column).show();
                }
                else {
                    this.getStore().getAt(rowIndex).set(column.dataIndex, value);
                }
                setTimeout(() => {
                    this.focusCell(rowIndex, columnIndex);
                    this.$getComponent().focus();
                }, 100);
            }
            /**
             * 선택된 항목을 배열로 가져온다.
             *
             * @return {Aui.Data.Record[]} selections
             */
            getSelections() {
                if (this.selection.selectable == false) {
                    return [];
                }
                return Array.from(this.selections.values());
            }
            /**
             * 그리드 아이템(행)이 선택여부를 확인한다.
             *
             * @param {number} rowIndex - 선택여부를 확인할 아이탬(행) 인덱스
             * @return {boolean} selected
             */
            isRowSelected(rowIndex) {
                if (Aui.index === null) {
                    return false;
                }
                const $row = this.$getRow(rowIndex);
                if ($row.getEl() === null) {
                    return false;
                }
                const record = $row.getData('record');
                return $row.hasClass('selected') == true && this.selections.has(record.getHash());
            }
            /**
             * 아이템을 오픈한다.
             *
             * @param {number} rowIndex - 아이탬(행) 인덱스
             */
            openItem(rowIndex) {
                const $row = this.$getRow(rowIndex);
                if ($row === null)
                    return;
                const record = $row.getData('record');
                this.select(record);
                this.fireEvent('openItem', [record, rowIndex, this]);
            }
            /**
             * 아이템 메뉴를 오픈한다.
             *
             * @param {number} rowIndex - 아이탬(행) 인덱스
             * @param {PointerEvent} pointerEvent - 포인트이벤트
             */
            openMenu(rowIndex, pointerEvent) {
                const $row = this.$getRow(rowIndex);
                if ($row === null)
                    return;
                const record = $row.getData('record');
                this.select(record);
                const menu = new Aui.Menu();
                this.fireEvent('openMenu', [menu, record, rowIndex, this]);
                if (menu.getItems()?.length == 0) {
                    menu.remove();
                }
                else {
                    menu.showAt(pointerEvent, 'y');
                }
            }
            /**
             * 다중 아이템 메뉴를 오픈한다.
             *
             * @param {PointerEvent} pointerEvent - 포인트이벤트
             */
            openMenus(pointerEvent) {
                const menu = new Aui.Menu();
                this.fireEvent('openMenus', [menu, this.getSelections(), this]);
                if (menu.getItems()?.length == 0) {
                    menu.remove();
                }
                else {
                    menu.showAt(pointerEvent, 'y');
                }
            }
            /**
             * 단일 아이템을 항상 선택한다.
             *
             * @param {Aui.Data.Record|Object} record - 선택할 레코드
             */
            select(record) {
                const rowIndex = this.getStore().matchIndex(record);
                if (rowIndex === null)
                    return;
                if (this.isRowSelected(rowIndex) == true) {
                    if (this.selections.size !== 1) {
                        this.resetSelections(false);
                        this.selectRow(rowIndex);
                    }
                    else {
                        this.focusRow(rowIndex);
                    }
                }
                else {
                    this.selectRow(rowIndex);
                }
            }
            /**
             * 아이템을 선택한다.
             *
             * @param {number} rowIndex - 아이탬(행) 인덱스
             * @param {boolean} is_multiple - 다중선택여부
             * @param {boolean} is_event - 이벤트 발생여부
             */
            selectRow(rowIndex, is_multiple = false, is_event = true) {
                if (rowIndex === null || this.selection.selectable == false)
                    return;
                const $row = this.$getRow(rowIndex);
                if ($row === null)
                    return;
                if (this.isRowSelected(rowIndex) == true)
                    return;
                if (this.selection.multiple == false || is_multiple == false) {
                    this.resetSelections(false);
                }
                const record = $row.getData('record');
                this.selections.set(record.getHash(), record);
                $row.addClass('selected');
                if (is_event == true) {
                    this.focusRow(rowIndex);
                    this.onSelectionChange();
                }
            }
            /**
             * 특정 범위의 행을 선택한다.
             *
             * @param {number} startIndex - 시작 아이템(행) 인덱스
             * @param {number} endIndex - 종료 아이템(행) 인덱스
             */
            selectRange(startIndex, endIndex, is_event = true) {
                if (this.selection.multiple == false) {
                    this.selectRow(endIndex, false, false);
                }
                else {
                    this.deselectAll(false);
                    for (let i = Math.min(startIndex, endIndex), loop = Math.max(startIndex, endIndex); i <= loop; i++) {
                        this.selectRow(i, true, false);
                    }
                }
                if (is_event == true) {
                    this.onSelectionChange();
                }
            }
            /**
             * 현재 페이지의 모든 아이템을 선택한다.
             *
             * @param {boolean} is_event - 이벤트 발생여부
             */
            selectAll(is_event = true) {
                if (this.selection.multiple == false) {
                    return;
                }
                for (let i = 0, loop = this.getStore().getCount(); i < loop; i++) {
                    this.selectRow(i, true, false);
                }
                if (is_event == true) {
                    this.onSelectionChange();
                }
            }
            /**
             * 아이템을 선택해제한다.
             *
             * @param {number} rowIndex - 아이탬(행) 인덱스
             * @param {boolean} is_event - 이벤트 발생여부
             */
            deselectRow(rowIndex, is_event = true) {
                if (rowIndex === null)
                    return;
                const $row = this.$getRow(rowIndex);
                if ($row === null)
                    return;
                if (this.isRowSelected(rowIndex) == true) {
                    const record = $row.getData('record');
                    this.selections.delete(record.getHash());
                    $row.removeClass('selected');
                    if (is_event == true) {
                        this.onSelectionChange();
                    }
                }
            }
            /**
             * 현재 페이지의 선택된 모든 아이템을 선택해제한다.
             *
             * @param {boolean} is_event - 이벤트 발생여부
             */
            deselectAll(is_event = true) {
                if (this.selections.size > 0) {
                    if (this.selection.keepable == true) {
                        for (let i = 0, loop = this.getStore().getCount(); i < loop; i++) {
                            this.deselectRow(i, false);
                        }
                    }
                    else {
                        this.resetSelections(false);
                    }
                    if (is_event == true) {
                        this.onSelectionChange();
                    }
                }
            }
            /**
             * 모든 선택사항을 선택해제한다.
             *
             * @param {boolean} is_event - 이벤트 발생여부
             */
            resetSelections(is_event = true) {
                if (this.selections.size > 0) {
                    Html.all('> div[data-role=row]', this.$getBody()).removeClass('selected');
                    this.selections.clear();
                    if (is_event == true) {
                        this.onSelectionChange();
                    }
                }
            }
            /**
             * 데이터가 변경되거나 다시 로딩되었을 때 이전 선택값이 있다면 복구한다.
             */
            restoreSelections() {
                if (this.selections.size > 0) {
                    for (const selection of this.selections.values()) {
                        const rowIndex = this.getStore().matchIndex(selection);
                        if (rowIndex !== null) {
                            Html.all('> div[data-role=row]', this.$getBody()).get(rowIndex).addClass('selected');
                        }
                    }
                }
            }
            /**
             * 선택항목이 변경되었을 때 이벤트를 처리한다.
             */
            onSelectionChange() {
                if (this.selection.display == 'check') {
                    const rows = Html.all('> div[data-role=row]', this.$getBody());
                    const selected = Html.all('> div[data-role=row].selected', this.$getBody());
                    if (rows.getCount() > 0 && rows.getCount() == selected.getCount()) {
                        Html.get('div[data-role=check]', this.$header).addClass('checked');
                    }
                    else {
                        Html.get('div[data-role=check]', this.$header).removeClass('checked');
                    }
                }
                this.fireEvent('selectionChange', [this.getSelections(), this]);
            }
            /**
             * 사용자입력에 의하여 선택항목이 변경되었을 때 이벤트를 처리한다.
             */
            onSelectionComplete() {
                this.fireEvent('selectionComplete', [this.getSelections(), this]);
            }
            /**
             * 컬럼 순서를 업데이트한다.
             */
            updateColumnIndex() {
                this.headers.forEach((header, headerIndex) => {
                    const $header = Html.get('div[data-component=' + header.id + ']', this.$header);
                    $header.setStyle('z-index', this.headers.length - headerIndex + 1);
                });
            }
            /**
             * 컬럼의 숨김여부를 업데이트한다.
             *
             * @param {Aui.Grid.Column} column - 업데이트할 컬럼
             * @param {number} columnIndex - 컬럼인덱스
             * @return {boolean} isUpdated - 변경여부
             */
            updateColumnVisible(column, columnIndex) {
                let isUpdated = false;
                const $column = Html.all('div[data-role=column]', this.$header).get(columnIndex);
                if ((column.hidden == true && $column.getStyle('display') != 'none') ||
                    (column.hidden == false && $column.getStyle('display') == 'none')) {
                    isUpdated = true;
                    if (column.hidden == true) {
                        $column.setStyle('display', 'none');
                        Html.all('div[data-role=row]', this.$body).forEach(($row) => {
                            const $column = Html.all('div[data-role=column]', $row).get(columnIndex);
                            $column.setStyle('display', 'none');
                        });
                    }
                    else {
                        $column.setStyle('display', '');
                        Html.all('div[data-role=row]', this.$body).forEach(($row) => {
                            const $column = Html.all('div[data-role=column]', $row).get(columnIndex);
                            $column.setStyle('display', '');
                        });
                    }
                }
                return isUpdated;
            }
            /**
             * 컬럼의 너비를 업데이트한다.
             *
             * @param {Aui.Grid.Column} column - 업데이트할 컬럼
             * @param {number} columnIndex - 컬럼인덱스
             * @return {boolean} isUpdated - 변경여부
             */
            updateColumnWidth(column, columnIndex) {
                let isUpdated = false;
                const $column = Html.all('div[data-role=column]', this.$header).get(columnIndex);
                if (column.width !== null && column.width != $column.getWidth()) {
                    isUpdated = true;
                    $column.setStyle('flexGrow', 0);
                    $column.setStyle('flexBasis', '');
                    $column.setStyle('width', column.width + 'px');
                    Html.all('div[data-role=row]', this.$body).forEach(($row) => {
                        const $column = Html.all('div[data-role=column]', $row).get(columnIndex);
                        $column.setStyle('flexGrow', 0);
                        $column.setStyle('flexBasis', '');
                        $column.setStyle('width', column.width + 'px');
                    });
                }
                return isUpdated;
            }
            /**
             * 그리드 우측의 빈컬럼 스타일을 갱신한다.
             */
            updateColumnFill() {
                const $fill = Html.all('div[data-column-type=fill]', this.$content);
                for (const header of this.headers) {
                    if (header.getChildrenFlexGrow() > 0) {
                        $fill.removeClass('grow');
                        return;
                    }
                }
                $fill.addClass('grow');
            }
            /**
             * 그리드패널 레이아웃을 갱신한다.
             */
            updateLayout() {
                if (this.isRendered() == false) {
                    this.render();
                    return;
                }
                let isFreezeUpdated;
                const headerUpdated = [];
                this.getColumns().forEach((column, columnIndex) => {
                    const isUpdated = this.updateColumnVisible(column, columnIndex) || this.updateColumnWidth(column, columnIndex);
                    if (isUpdated == true) {
                        if (columnIndex < this.freezeColumn) {
                            isFreezeUpdated = true;
                        }
                        let parent = column.getParent();
                        while (parent != null) {
                            if (headerUpdated.indexOf(parent.getId()) == -1) {
                                headerUpdated.push(parent.getId());
                            }
                            parent = parent.getParent();
                        }
                    }
                });
                if (isFreezeUpdated == true) {
                    this.setFreezeColumn(this.freeze);
                }
                headerUpdated.forEach((id) => {
                    const header = Aui.get(id);
                    if (header instanceof Aui.Grid.Column) {
                        const $header = Html.get('div[data-component=' + id + ']', this.$header);
                        $header.setStyle('width', header.getChildrenFlexBasis() + 'px');
                        $header.setStyle('flexGrow', header.getChildrenFlexGrow());
                        $header.setStyle('flexBasis', header.getChildrenFlexBasis() + 'px');
                    }
                });
                this.updateColumnFill();
            }
            /**
             * 그리드 고정컬럼 영역을 설정한다.
             *
             * @param {number} index - 고정될 컬럼 인덱스
             */
            setFreezeColumn(index) {
                Html.all('div[data-role].sticky', this.$header).forEach(($header) => {
                    $header.removeClass('sticky', 'end');
                    $header.setStyle('left', '');
                });
                Html.all('div[data-role=column].sticky', this.$body).forEach(($header) => {
                    $header.removeClass('sticky', 'end');
                    $header.setStyle('left', '');
                });
                this.freeze = Math.min(this.headers.length - 1, index);
                this.freezeColumn = 0;
                this.freezeWidth = 0;
                if (index > 0) {
                    let leftPosition = 0;
                    Html.all('> div[data-role]', this.$header).forEach(($header, headerIndex) => {
                        const header = this.headers[headerIndex];
                        if (headerIndex < this.freeze) {
                            $header.addClass('sticky');
                            $header.setStyle('left', leftPosition + 'px');
                            leftPosition += header.getMinWidth() + 1;
                            if (headerIndex == this.freeze - 1) {
                                $header.addClass('end');
                            }
                            this.freezeColumn += header.getColumns().length;
                        }
                    });
                    this.freezeWidth = leftPosition;
                    Html.all('> div[data-role=row]', this.$body).forEach(($row) => {
                        let leftPosition = 0;
                        Html.all('> div[data-role=column]', $row).forEach(($column, columnIndex) => {
                            const column = this.columns[columnIndex];
                            if (columnIndex < this.freezeColumn) {
                                $column.addClass('sticky');
                                $column.setStyle('left', leftPosition + 'px');
                                leftPosition += column.getMinWidth() + 1;
                                if (columnIndex == this.freezeColumn - 1) {
                                    $column.addClass('end');
                                }
                            }
                        });
                    });
                    this.getScroll().setTrackPosition('x', leftPosition ? leftPosition + 1 : 0);
                }
                else {
                    this.getScroll().setTrackPosition('x', 0);
                }
            }
            /**
             * 그리드패널의 아이탬(행) DOM 을 생성하거나 가져온다.
             *
             * @param {number} rowIndex - 생성하거나 가져올 행 인덱스
             * @param {Aui.Data.Record} record - 행 데이터 (데이터가 NULL 이 아닌 경우 DOM 을 생성한다.)
             */
            $getRow(rowIndex, record = null) {
                if (record === null) {
                    return Html.all('> div[data-role=row]', this.$getBody()).get(rowIndex);
                }
                else {
                    record.setObserver(() => {
                        this.updateRow(rowIndex);
                    });
                    let leftPosition = 0;
                    const $row = Html.create('div')
                        .setData('role', 'row')
                        .setData('index', rowIndex)
                        .setData('record', record, false);
                    if (this.setRowClass !== null) {
                        const rowClass = this.setRowClass(record, rowIndex) ?? '';
                        if (rowClass.length > 0) {
                            $row.addClass(...rowClass.split(' '));
                        }
                    }
                    if (this.selection.display == 'check') {
                        const $check = Html.create('div', { 'data-role': 'check' });
                        const $button = Html.create('button', { 'type': 'button' });
                        $check.on('click', (e) => {
                            if (this.isRowSelected(rowIndex) == true) {
                                this.deselectRow(rowIndex);
                            }
                            else {
                                this.selectRow(rowIndex, true);
                            }
                            e.stopImmediatePropagation();
                        });
                        $check.addClass('sticky');
                        if (this.freeze == 0) {
                            $check.addClass('end');
                        }
                        $check.append($button);
                        $row.append($check);
                        leftPosition = Html.get('div[data-role=check]', this.$header).getWidth() + 1;
                    }
                    this.getColumns().forEach((column, columnIndex) => {
                        const value = record.get(column.dataIndex);
                        const $column = column.$getBody(value, record, rowIndex, columnIndex);
                        if (record.isUpdated(column.dataIndex) == true) {
                            $column.addClass('updated');
                        }
                        $row.append($column);
                        if (columnIndex < this.freezeColumn) {
                            $column.addClass('sticky');
                            $column.setStyle('left', leftPosition + 'px');
                            leftPosition += column.getMinWidth() + 1;
                            if (columnIndex == this.freezeColumn - 1) {
                                $column.addClass('end');
                            }
                        }
                    });
                    $row.prepend(Html.create('div', { 'data-column-type': 'fill' }));
                    $row.on('click', (e) => {
                        if (this.selection.selectable == true) {
                            if (this.selection.display == 'check') {
                                if (e.metaKey == true || e.ctrlKey == true) {
                                    this.selectRow(rowIndex, true);
                                }
                                else {
                                    this.selectRow(rowIndex, false);
                                }
                            }
                            else if (this.selection.deselectable == true && this.isRowSelected(rowIndex) == true) {
                                this.deselectRow(rowIndex);
                            }
                            else {
                                this.selectRow(rowIndex, e.metaKey == true || e.ctrlKey == true);
                            }
                            this.onSelectionComplete();
                        }
                    });
                    $row.on('dblclick', (e) => {
                        if (e.button === 0) {
                            this.openItem(rowIndex);
                        }
                    });
                    $row.on('contextmenu', (e) => {
                        if (this.isRowSelected(rowIndex) == true) {
                            if (this.getSelections().length == 1 || this.selection.multiple == false) {
                                this.openMenu(rowIndex, e);
                            }
                            else {
                                this.openMenus(e);
                            }
                        }
                        else {
                            this.openMenu(rowIndex, e);
                        }
                        e.preventDefault();
                    });
                    $row.on('longpress', (e) => {
                        Aui.Menu.pointerEvent = e;
                        this.openMenu(rowIndex, e);
                        e.preventDefault();
                    });
                    return $row;
                }
            }
            /**
             * 그리드패널의 헤더(제목행)을 데이터에 따라 업데이트한다.
             */
            updateHeader() {
                const $labels = Html.all('label', this.$header);
                Html.all('label > i[data-role=sorter]', this.$header).removeClass('ASC', 'DESC');
                const sorters = this.getStore().getSorters();
                $labels.forEach(($label) => {
                    for (const sorter in sorters) {
                        if ($label.getData('dataindex') === sorter || $label.getData('sortable') === sorter) {
                            Html.get('i[data-role=sorter]', $label).addClass(sorters[sorter]);
                        }
                    }
                });
                const filters = this.getStore().getFilters();
                $labels.forEach(($label) => {
                    if (filters?.[$label.getData('dataindex')] !== undefined) {
                        $label.addClass('filtered');
                    }
                    else {
                        $label.removeClass('filtered');
                    }
                });
            }
            /**
             * 특정행의 데이터가 변경되었을 때 해당 행을 갱신한다.
             *
             * @param {number} rowIndex - 업데이트할 행 인덱스
             */
            updateRow(rowIndex) {
                const $row = this.$getRow(rowIndex);
                if ($row === null)
                    return;
                const record = this.getStore().getAt(rowIndex);
                $row.replaceWith(this.$getRow(rowIndex, record));
            }
            /**
             * 컬럼이 추가되거나 제거되었을 경우 컬럼을 업데이트하고 레이아웃을 조절한다.
             */
            updateColumns() {
                /**
                 * 기존에 정의된 컬럼을 제거한다.
                 */
                this.headers.forEach((header) => {
                    header.remove(false);
                });
                this.initColumns();
                if (this.isRendered() == true) {
                    this.renderHeader();
                    this.renderBody();
                }
            }
            /**
             * 로딩영역을 가져온다.
             *
             * @return {Aui.Loading} loading
             */
            getLoading() {
                return this.loading;
            }
            /**
             * 그리드패널의 헤더(제목행)를 랜더링한다.
             */
            renderHeader() {
                let leftPosition = 0;
                this.freezeColumn = 0;
                this.$header.empty();
                if (this.selection.display == 'check') {
                    const $check = Html.create('div', { 'data-role': 'check' });
                    const $button = Html.create('button', { 'type': 'button' });
                    $check.on('click', (e) => {
                        if ($check.hasClass('checked') == true) {
                            this.deselectAll();
                        }
                        else {
                            this.selectAll();
                        }
                        e.stopImmediatePropagation();
                    });
                    $check.addClass('sticky');
                    if (this.freeze == 0) {
                        $check.addClass('end');
                    }
                    $check.append($button);
                    this.$header.append($check);
                    leftPosition = $check.getWidth() + 1;
                }
                this.headers.forEach((header, headerIndex) => {
                    const $header = header.$getHeader(headerIndex);
                    this.$header.append($header);
                    if (headerIndex < this.freeze) {
                        $header.addClass('sticky');
                        $header.setStyle('left', leftPosition + 'px');
                        leftPosition += header.getMinWidth() + 1;
                        if (headerIndex == this.freeze - 1) {
                            $header.addClass('end');
                        }
                        this.freezeColumn += header.getColumns().length;
                    }
                });
                this.freezeWidth = leftPosition;
                this.$header.prepend(Html.create('div', { 'data-column-type': 'fill' }));
                this.getScroll().setTrackPosition('x', leftPosition ? leftPosition + 1 : 0);
                this.getScroll().setTrackPosition('y', this.columnHeaders == true ? this.$header.getHeight() + 1 : 0);
                this.updateColumnIndex();
                this.updateColumnFill();
                if (this.columnHeaders === false) {
                    this.$header.addClass('hidden');
                    return;
                }
            }
            /**
             * 그리드패널의 바디(데이터행)를 랜더링한다.
             */
            renderBody() {
                this.$body.empty();
                this.getStore()
                    .getRecords()
                    .forEach((record, rowIndex) => {
                    const $row = this.$getRow(rowIndex, record);
                    this.$body.append($row);
                });
                if (this.columnLines == true) {
                    this.$body.addClass('column-lines');
                }
                if (this.rowLines == true) {
                    this.$body.addClass('row-lines');
                }
            }
            /**
             * 그리드패널의 푸터(합계행)를 핸더링한다.
             */
            renderFooter() { }
            /**
             * 패널의 본문 레이아웃을 랜더링한다.
             */
            renderContent() {
                this.$getContent().append(this.$header);
                this.$getContent().append(this.$body);
                this.$getContent().append(this.$footer);
                this.renderHeader();
                this.renderBody();
                this.renderFooter();
            }
            /**
             * 그리드패널이 화면상에 출력되었을 때 이벤트를 처리한다.
             */
            onRender() {
                super.onRender();
                this.updateHeader();
                if (this.autoLoad === true) {
                    this.getStore().load();
                }
                this.$getComponent().on('keydown', (e) => {
                    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                        return;
                    }
                    if (e.key.indexOf('Arrow') === 0) {
                        if (this.editingCell.rowIndex !== null || this.editingCell.columnIndex !== null) {
                            return;
                        }
                        let rowIndex = 0;
                        let columnIndex = 0;
                        switch (e.key) {
                            case 'ArrowLeft':
                                rowIndex = this.focusedCell.rowIndex ?? 0;
                                columnIndex = Math.max(0, (this.focusedCell.columnIndex ?? 0) - 1);
                                while (columnIndex > 0 && this.getColumnByIndex(columnIndex).isHidden() == true) {
                                    columnIndex--;
                                }
                                break;
                            case 'ArrowRight':
                                rowIndex = this.focusedCell.rowIndex ?? 0;
                                columnIndex = Math.min(this.getColumns().length - 1, (this.focusedCell.columnIndex ?? 0) + 1);
                                while (columnIndex < this.getColumns().length - 1 &&
                                    this.getColumnByIndex(columnIndex).isHidden() == true) {
                                    columnIndex++;
                                }
                                break;
                            case 'ArrowUp':
                                rowIndex = Math.max(0, (this.focusedCell.rowIndex ?? 0) - 1);
                                columnIndex = this.focusedCell.columnIndex ?? 0;
                                break;
                            case 'ArrowDown':
                                rowIndex = Math.max(0, (this.focusedCell.rowIndex ?? -1) + 1);
                                columnIndex = this.focusedCell.columnIndex ?? 0;
                                break;
                        }
                        this.focusCell(rowIndex, columnIndex);
                        e.preventDefault();
                        return;
                    }
                    if (e.key == 'Enter') {
                        if (this.focusedCell.columnIndex !== null) {
                            const column = this.columns[this.focusedCell.columnIndex];
                            if (column.editor !== null) {
                                if (this.editingCell.rowIndex === this.focusedCell.rowIndex &&
                                    this.editingCell.columnIndex == this.focusedCell.columnIndex) {
                                    this.completeEdit();
                                }
                                else {
                                    this.editCell(this.focusedCell.rowIndex, this.focusedCell.columnIndex);
                                }
                                e.preventDefault();
                                e.stopImmediatePropagation();
                                return;
                            }
                        }
                    }
                    if (e.key == ' ' || e.key == 'Enter') {
                        if (this.focusedRow !== null) {
                            this.selectRow(this.focusedRow);
                            this.onSelectionComplete();
                        }
                    }
                    if ((e.metaKey == true || e.ctrlKey == true) && e.key == 'a') {
                        this.selectAll();
                        e.preventDefault();
                    }
                });
                this.$getComponent().on('blur', () => {
                    this.blurCell();
                });
            }
            /**
             * 데이터가 로드되기 전 이벤트를 처리한다.
             */
            onBeforeLoad() {
                this.loading.show();
                if (this.getStore().getCurrentParams() !== null) {
                    this.getScroll(false)?.storePosition(this.getStore().getCurrentParams());
                }
                if (this.selection.keepable === false) {
                    this.selections.clear();
                    this.fireEvent('selectionChange', [[], this]);
                }
                this.fireEvent('beforeLoad', [this]);
            }
            /**
             * 데이터가 로딩되었을 때 이벤트를 처리한다.
             */
            onLoad() {
                if (this.getStore().isLoaded() === false)
                    return;
                this.getScroll(false)?.restorePosition(this.getStore().getCurrentParams());
                this.fireEvent('load', [this, this.getStore()]);
            }
            /**
             * 데이터가 변경되기 전 이벤트를 처리한다.
             */
            onBeforeUpdate() {
                this.loading.show();
                if (this.getStore().getCurrentParams() !== null) {
                    this.getScroll(false)?.storePosition(this.getStore().getCurrentParams());
                }
                this.fireEvent('beforeUpdate', [this]);
            }
            /**
             * 데이터가 변경되었을 때 이벤트를 처리한다.
             */
            onUpdate() {
                this.focusedCell = { rowIndex: null, columnIndex: null };
                this.renderBody();
                this.restoreSelections();
                this.onSelectionChange();
                this.updateHeader();
                this.loading.hide();
                this.fireEvent('update', [this, this.getStore()]);
            }
            /**
             * 셀 포커스가 이동되었을 때 이벤트를 처리한다.
             *
             * @param {number} rowIndex - 행 인덱스
             * @param {number} columnIndex - 열 인덱스
             */
            onFocusMove(rowIndex, columnIndex) {
                const record = this.$getRow(rowIndex).getData('record');
                this.fireEvent('focusMove', [
                    rowIndex,
                    columnIndex,
                    record?.get(this.columns[columnIndex].dataIndex ?? ''),
                    record,
                    this,
                ]);
            }
            /**
             * 클립보드 이벤트를 처리한다.
             *
             * @param {ClipboardEvent} e - 클립보드 이벤트
             */
            onCopy(e) {
                if (this.focusedCell.rowIndex !== null && this.focusedCell.columnIndex !== null) {
                    const $column = Html.get('div[data-role=column][data-row="' +
                        this.focusedCell.rowIndex +
                        '"][data-column="' +
                        this.focusedCell.columnIndex +
                        '"]', this.$body);
                    if ($column == null)
                        return;
                    e.clipboardData.setData('text/plain', $column.getData('value'));
                    e.preventDefault();
                }
            }
            /**
             * 그리드 패널을 제거한다.
             */
            remove() {
                this.store.remove();
                this.loading.close();
                this.headers.forEach((header) => {
                    header.remove(false);
                });
                super.remove();
            }
        }
        Grid.Panel = Panel;
        let Filter;
        (function (Filter) {
            class Base {
                column;
                dataIndex;
                is_alternative;
                menu;
                /**
                 * 컬럼 필터객체를 생성한다.
                 *
                 * @param {Aui.Grid.Filter.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    this.dataIndex = properties?.dataIndex ?? null;
                }
                /**
                 * 컬럼을 설정한다.
                 *
                 * @param {Aui.Grid.Column} column - 필터를 적용할 컬럼
                 * @param {boolean} is_alternative - 대체행 여부
                 * @return {Aui.Grid.Filter.Base} this
                 */
                setColumn(column, is_alternative = false) {
                    this.column = column;
                    this.is_alternative = is_alternative;
                    return this;
                }
                /**
                 * 필터를 적용할 dataIndex 를 가져온다.
                 *
                 * @return {string} dataIndex
                 */
                getDataIndex() {
                    if (this.dataIndex !== null) {
                        return this.dataIndex;
                    }
                    return this.is_alternative == true && this.column.alternative !== null
                        ? this.column.alternative.dataIndex
                        : this.column.dataIndex;
                }
                /**
                 * 필터를 적용한다.
                 *
                 * @return {Object} filter
                 */
                getFilter() {
                    return this.column.getGrid().getStore().getFilter(this.getDataIndex());
                }
                /**
                 * 필터를 적용한다.
                 *
                 * @param {any} value - 필터링에 사용할 기준값
                 * @param {string} operator - 필터 명령어 (=, !=, >=, <= 또는 remoteFilter 가 true 인 경우 사용자 정의 명령어)
                 */
                setFilter(value, operator = '=') {
                    this.column.getGrid().getStore().setFilter(this.getDataIndex(), value, operator);
                }
                /**
                 * 필터를 초기화한다.
                 */
                resetFilter() {
                    this.column.getGrid().getStore().resetFilter(this.getDataIndex());
                }
                /**
                 * 메뉴를 닫는다.
                 */
                close() {
                    this.menu.getParent().close();
                }
                /**
                 * 필터메뉴를 가져온다.
                 *
                 * @return {Aui.Menu.Item} menu
                 */
                getLayout() {
                    return this.menu ?? null;
                }
            }
            Filter.Base = Base;
            class Text extends Aui.Grid.Filter.Base {
                is_equal;
                /**
                 * 컬럼 필터객체를 생성한다.
                 *
                 * @param {Aui.Grid.Filter.Text.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.is_equal = properties?.is_equal === true;
                }
                /**
                 * 필터메뉴를 가져온다.
                 *
                 * @return {Aui.Menu.Item} menu
                 */
                getLayout() {
                    if (this.menu === undefined) {
                        this.menu = new Aui.Menu.Item({
                            iconClass: 'xi xi-funnel',
                            items: [
                                new Aui.Form.Panel({
                                    width: 200,
                                    border: false,
                                    padding: 0,
                                    items: [
                                        new Aui.Form.Field.Select({
                                            name: 'operator',
                                            hidden: this.is_equal,
                                            store: new Aui.Store.Local({
                                                fields: ['value', 'display'],
                                                records: (() => {
                                                    const records = [];
                                                    const filters = Aui.getText('filters.text');
                                                    for (const code in filters) {
                                                        records.push([code, filters[code]]);
                                                    }
                                                    return records;
                                                })(),
                                            }),
                                            value: this.is_equal == true ? '=' : 'like',
                                            listeners: {
                                                change: (field, value) => {
                                                    const valueField = field
                                                        .getForm()
                                                        .getField('value');
                                                    if (value == 'likesall' || value == 'likes') {
                                                        valueField.setHelpText(Aui.printText('filters.likes_help'));
                                                    }
                                                    else {
                                                        valueField.setHelpText(null);
                                                    }
                                                },
                                            },
                                        }),
                                        new Aui.Form.Field.Text({
                                            name: 'value',
                                            listeners: {
                                                enter: (field, value) => {
                                                    const form = field.getForm();
                                                    if (value?.length > 0) {
                                                        this.setFilter(form.getField('value').getValue(), form.getField('operator').getValue());
                                                    }
                                                    else {
                                                        this.resetFilter();
                                                    }
                                                    this.close();
                                                },
                                            },
                                        }),
                                        new Aui.Form.Field.Container({
                                            items: [
                                                new Aui.Form.Field.Display({
                                                    flex: 1,
                                                }),
                                                new Aui.Button({
                                                    text: Aui.printText('filters.reset'),
                                                    handler: () => {
                                                        this.resetFilter();
                                                        this.close();
                                                    },
                                                }),
                                                new Aui.Button({
                                                    text: Aui.printText('filters.set'),
                                                    buttonClass: 'confirm',
                                                    handler: (button) => {
                                                        const form = button.getParent().getForm();
                                                        if (form.getField('value').getValue()?.length > 0) {
                                                            this.setFilter(form.getField('value').getValue(), form.getField('operator').getValue());
                                                        }
                                                        else {
                                                            this.resetFilter();
                                                        }
                                                        this.close();
                                                    },
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                            listeners: {
                                show: (item) => {
                                    const form = item.getItemAt(0);
                                    if (this.is_equal == true) {
                                        form.getField('operator').setValue('=');
                                    }
                                    else {
                                        form.getField('operator').setValue(this.getFilter()?.operator ?? 'like');
                                    }
                                    form.getField('value').setValue(this.getFilter()?.value ?? '');
                                },
                            },
                        });
                    }
                    return this.menu;
                }
            }
            Filter.Text = Text;
            class Number extends Aui.Grid.Filter.Base {
                is_equal;
                spinner;
                step;
                format;
                /**
                 * 컬럼 필터객체를 생성한다.
                 *
                 * @param {Aui.Grid.Filter.Number.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.is_equal = properties?.is_equal === true;
                    this.spinner = properties?.spinner === true;
                    this.step = properties?.step ?? 1;
                    this.format = properties?.format === true;
                }
                /**
                 * 필터메뉴를 가져온다.
                 *
                 * @return {Aui.Menu.Item} menu
                 */
                getLayout() {
                    if (this.menu === undefined) {
                        this.menu = new Aui.Menu.Item({
                            iconClass: 'xi xi-funnel',
                            items: [
                                new Aui.Form.Panel({
                                    width: 200,
                                    border: false,
                                    padding: 0,
                                    items: [
                                        new Aui.Form.Field.Select({
                                            name: 'operator',
                                            hidden: this.is_equal,
                                            store: new Aui.Store.Local({
                                                fields: ['value', 'display'],
                                                records: (() => {
                                                    const records = [];
                                                    const filters = Aui.getText('filters.number');
                                                    for (const code in filters) {
                                                        records.push([code, filters[code]]);
                                                    }
                                                    return records;
                                                })(),
                                            }),
                                            value: '=',
                                            listeners: {
                                                change: (field, value) => {
                                                    const form = field.getForm();
                                                    if (value == 'range') {
                                                        form.getField('value').hide();
                                                        form.getField('start_operator').show();
                                                        form.getField('start_value').show();
                                                        form.getField('end_operator').show();
                                                        form.getField('end_value').show();
                                                    }
                                                    else {
                                                        form.getField('value').show();
                                                        form.getField('start_operator').hide();
                                                        form.getField('start_value').hide();
                                                        form.getField('end_operator').hide();
                                                        form.getField('end_value').hide();
                                                    }
                                                },
                                            },
                                        }),
                                        new Aui.Form.Field.Number({
                                            name: 'value',
                                            spinner: this.spinner,
                                            step: this.step,
                                            format: this.format,
                                        }),
                                        new Aui.Form.Field.Select({
                                            name: 'start_operator',
                                            hidden: true,
                                            store: new Aui.Store.Local({
                                                fields: ['value', 'display'],
                                                records: (() => {
                                                    const records = [];
                                                    const filters = Aui.getText('filters.number_start');
                                                    for (const code in filters) {
                                                        records.push([code, filters[code]]);
                                                    }
                                                    return records;
                                                })(),
                                            }),
                                            value: '>',
                                        }),
                                        new Aui.Form.Field.Number({
                                            name: 'start_value',
                                            hidden: true,
                                            spinner: this.spinner,
                                            step: this.step,
                                            format: this.format,
                                        }),
                                        new Aui.Form.Field.Select({
                                            name: 'end_operator',
                                            hidden: true,
                                            store: new Aui.Store.Local({
                                                fields: ['value', 'display'],
                                                records: (() => {
                                                    const records = [];
                                                    const filters = Aui.getText('filters.number_end');
                                                    for (const code in filters) {
                                                        records.push([code, filters[code]]);
                                                    }
                                                    return records;
                                                })(),
                                            }),
                                            value: '<',
                                        }),
                                        new Aui.Form.Field.Number({
                                            name: 'end_value',
                                            hidden: true,
                                            spinner: this.spinner,
                                            step: this.step,
                                            format: this.format,
                                        }),
                                        new Aui.Form.Field.Container({
                                            items: [
                                                new Aui.Form.Field.Display({
                                                    flex: 1,
                                                }),
                                                new Aui.Button({
                                                    text: Aui.printText('filters.reset'),
                                                    handler: () => {
                                                        this.resetFilter();
                                                        this.close();
                                                    },
                                                }),
                                                new Aui.Button({
                                                    text: Aui.printText('filters.set'),
                                                    buttonClass: 'confirm',
                                                    handler: (button) => {
                                                        const form = button.getParent().getForm();
                                                        const operator = form.getField('operator').getValue();
                                                        if (operator == 'range') {
                                                            const start_value = form.getField('start_value').getValue();
                                                            const end_value = form.getField('end_value').getValue();
                                                            if (start_value === null) {
                                                                form.getField('start_value').setError(true);
                                                            }
                                                            if (end_value === null) {
                                                                form.getField('end_value').setError(true);
                                                            }
                                                            const value = {
                                                                start: {
                                                                    value: start_value,
                                                                    operator: form
                                                                        .getField('start_operator')
                                                                        .getValue(),
                                                                },
                                                                end: {
                                                                    value: end_value,
                                                                    operator: form.getField('end_operator').getValue(),
                                                                },
                                                            };
                                                            if (start_value !== null && end_value !== null) {
                                                                this.setFilter(value, operator);
                                                            }
                                                        }
                                                        else {
                                                            if (form.getField('value').getValue() !== null) {
                                                                this.setFilter(form.getField('value').getValue(), operator);
                                                            }
                                                            else {
                                                                this.resetFilter();
                                                            }
                                                        }
                                                        this.close();
                                                    },
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                            listeners: {
                                show: (item) => {
                                    const form = item.getItemAt(0);
                                    if (this.is_equal == true) {
                                        form.getField('operator').setValue('=');
                                    }
                                    else {
                                        form.getField('operator').setValue(this.getFilter()?.operator ?? '=');
                                    }
                                    if (this.getFilter()?.operator == 'range') {
                                        form.getField('start_value').setValue(this.getFilter()?.value?.start?.value ?? '');
                                        form.getField('end_value').setValue(this.getFilter()?.value?.end?.value ?? '');
                                    }
                                    else {
                                        form.getField('value').setValue(this.getFilter()?.value ?? '');
                                    }
                                },
                            },
                        });
                    }
                    return this.menu;
                }
            }
            Filter.Number = Number;
            class Date extends Aui.Grid.Filter.Base {
                displayFormat;
                format;
                /**
                 * 컬럼 필터객체를 생성한다.
                 *
                 * @param {Aui.Grid.Filter.Date.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.displayFormat = properties?.displayFormat ?? 'Y-m-d';
                    this.format = properties?.format ?? 'date';
                }
                /**
                 * 필터메뉴를 가져온다.
                 *
                 * @return {Aui.Menu.Item} menu
                 */
                getLayout() {
                    if (this.menu === undefined) {
                        this.menu = new Aui.Menu.Item({
                            iconClass: 'xi xi-funnel',
                            items: [
                                new Aui.Form.Panel({
                                    width: 200,
                                    border: false,
                                    padding: 0,
                                    items: [
                                        new Aui.Form.Field.Select({
                                            name: 'operator',
                                            store: new Aui.Store.Local({
                                                fields: ['value', 'display'],
                                                records: (() => {
                                                    const records = [];
                                                    const filters = Aui.getText('filters.date');
                                                    for (const code in filters) {
                                                        records.push([code, filters[code]]);
                                                    }
                                                    return records;
                                                })(),
                                            }),
                                            value: 'today',
                                            listeners: {
                                                change: (field, value) => {
                                                    const form = field.getForm();
                                                    if (value == '=' || value == '>=' || value == '<=') {
                                                        form.getField('value').show();
                                                        form.getField('start_value').hide();
                                                        form.getField('end_value').hide();
                                                    }
                                                    else if (value == 'range') {
                                                        form.getField('value').hide();
                                                        form.getField('start_value').show();
                                                        form.getField('end_value').show();
                                                    }
                                                    else {
                                                        form.getField('value').hide();
                                                        form.getField('start_value').hide();
                                                        form.getField('end_value').hide();
                                                    }
                                                },
                                            },
                                        }),
                                        new Aui.Form.Field.Date({
                                            name: 'value',
                                            hidden: true,
                                            displayFormat: this.displayFormat,
                                            format: 'Y-m-d',
                                        }),
                                        new Aui.Form.Field.Date({
                                            name: 'start_value',
                                            hidden: true,
                                            label: Aui.printText('filters.date_start'),
                                            labelPosition: 'top',
                                            displayFormat: this.displayFormat,
                                            format: 'Y-m-d',
                                        }),
                                        new Aui.Form.Field.Date({
                                            name: 'end_value',
                                            hidden: true,
                                            label: Aui.printText('filters.date_end'),
                                            labelPosition: 'top',
                                            displayFormat: this.displayFormat,
                                            format: 'Y-m-d',
                                        }),
                                        new Aui.Form.Field.Container({
                                            items: [
                                                new Aui.Form.Field.Display({
                                                    flex: 1,
                                                }),
                                                new Aui.Button({
                                                    text: Aui.printText('filters.reset'),
                                                    handler: () => {
                                                        this.resetFilter();
                                                        this.close();
                                                    },
                                                }),
                                                new Aui.Button({
                                                    text: Aui.printText('filters.set'),
                                                    buttonClass: 'confirm',
                                                    handler: (button) => {
                                                        const form = button.getParent().getForm();
                                                        let operator = form.getField('operator').getValue();
                                                        let value = form.getField('value').getValue();
                                                        let start_value = form.getField('start_value').getValue();
                                                        let end_value = form.getField('end_value').getValue();
                                                        let filterValue = { operator: operator, format: this.format };
                                                        if (operator == '=' || operator == '>=' || operator == '<=') {
                                                            if (value === null) {
                                                                form.getField('value').setError(true);
                                                                return;
                                                            }
                                                            filterValue.value = value;
                                                        }
                                                        else if (operator == 'range') {
                                                            if (start_value === null) {
                                                                form.getField('start_value').setError(true);
                                                                return;
                                                            }
                                                            if (end_value === null) {
                                                                form.getField('end_value').setError(true);
                                                                return;
                                                            }
                                                            filterValue.range = [start_value, end_value];
                                                        }
                                                        else {
                                                            filterValue.operator = operator;
                                                        }
                                                        this.setFilter(filterValue, 'date');
                                                        this.close();
                                                    },
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                            listeners: {
                                show: (item) => {
                                    const form = item.getItemAt(0);
                                    const filter = this.getFilter()?.value ?? null;
                                    form.getField('operator').setValue(filter?.operator ?? 'today');
                                    const operator = filter?.operator ?? null;
                                    if (operator == '=' || operator == '>=' || operator == '<=') {
                                        form.getField('value').setValue(filter?.value);
                                    }
                                    else if (operator == 'range') {
                                        form.getField('start_value').setValue(filter?.range[0]);
                                        form.getField('end_value').setValue(filter?.range[1]);
                                    }
                                },
                            },
                        });
                    }
                    return this.menu;
                }
            }
            Filter.Date = Date;
            class List extends Aui.Grid.Filter.Base {
                store;
                displayField;
                valueField;
                multiple;
                search;
                list;
                renderer;
                /**
                 * 컬럼 필터객체를 생성한다.
                 *
                 * @param {Aui.Grid.Filter.List.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.store = properties?.store ?? null;
                    this.displayField = properties?.displayField ?? 'display';
                    this.valueField = properties?.valueField ?? 'value';
                    this.multiple = properties?.multiple === true;
                    this.search = properties?.search === true;
                    this.renderer = properties?.renderer ?? null;
                }
                /**
                 * 목록을 가져온다.
                 *
                 * @return {Aui.Grid.Panel|Aui.Tree.Panel} list
                 */
                getList() {
                    if (this.list === undefined) {
                        if (this.store == null) {
                            this.list = null;
                        }
                        if (this.store instanceof Aui.Store) {
                            this.list = new Aui.Grid.Panel({
                                maxHeight: 300,
                                columnHeaders: false,
                                rowLines: false,
                                store: this.store,
                                selection: { selectable: true, display: 'check', multiple: this.multiple },
                                topbar: (() => {
                                    if (this.search === true) {
                                        return [
                                            new Aui.Form.Field.Search({
                                                liveSearch: true,
                                                flex: 1,
                                                emptyText: Aui.printText('filters.search'),
                                                handler: async (keyword) => {
                                                    this.getList()
                                                        .getStore()
                                                        .setFilter(this.displayField, keyword, 'likecode');
                                                },
                                            }),
                                        ];
                                    }
                                    return null;
                                })(),
                                columns: [
                                    {
                                        dataIndex: this.displayField,
                                        flex: 1,
                                        renderer: this.renderer,
                                    },
                                ],
                            });
                        }
                    }
                    return this.list;
                }
                /**
                 * 필터메뉴를 가져온다.
                 *
                 * @return {Aui.Menu.Item} menu
                 */
                getLayout() {
                    if (this.menu === undefined) {
                        this.menu = new Aui.Menu.Item({
                            iconClass: 'xi xi-funnel',
                            items: [
                                new Aui.Form.Panel({
                                    width: 200,
                                    padding: 0,
                                    border: false,
                                    items: [
                                        this.getList(),
                                        new Aui.Form.Field.Container({
                                            items: [
                                                new Aui.Form.Field.Display({
                                                    flex: 1,
                                                }),
                                                new Aui.Button({
                                                    text: Aui.printText('filters.reset'),
                                                    handler: () => {
                                                        this.resetFilter();
                                                        this.close();
                                                    },
                                                }),
                                                new Aui.Button({
                                                    text: Aui.printText('filters.set'),
                                                    buttonClass: 'confirm',
                                                    handler: () => {
                                                        const selections = this.getList().getSelections();
                                                        if (selections.length == 0) {
                                                            this.resetFilter();
                                                        }
                                                        else {
                                                            if (this.multiple == true) {
                                                                const values = [];
                                                                for (const record of selections) {
                                                                    values.push(record.get(this.valueField));
                                                                }
                                                                this.setFilter(values, 'in');
                                                            }
                                                            else {
                                                                this.setFilter(selections[0].get(this.valueField), '=');
                                                            }
                                                        }
                                                        this.close();
                                                    },
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                            listeners: {
                                show: async (item) => {
                                    this.getList().setParent(item);
                                    if (this.getList().getStore().isLoaded() == false) {
                                        await this.getList().getStore().load();
                                    }
                                    const value = this.getFilter()?.value ?? null;
                                    if (value !== null) {
                                        const values = [];
                                        if (Array.isArray(value) == false) {
                                            values.push(value);
                                        }
                                        else {
                                            values.push(...value);
                                        }
                                        for (const value of values) {
                                            const record = {};
                                            record[this.valueField] = value;
                                            const index = this.getList().getStore().findIndex(record);
                                            if (index !== null) {
                                                if (this.store instanceof Aui.Store) {
                                                    this.getList().selectRow(index, true);
                                                }
                                                else {
                                                    this.getList().selectRow(index, true);
                                                }
                                            }
                                        }
                                    }
                                },
                            },
                        });
                    }
                    return this.menu;
                }
            }
            Filter.List = List;
        })(Filter = Grid.Filter || (Grid.Filter = {}));
        class Column extends Aui.Base {
            grid;
            parent = null;
            columnIndex;
            text;
            dataIndex;
            width;
            minWidth;
            resizable;
            sortable;
            hidden;
            headerWrap;
            headerAlign;
            headerVerticalAlign;
            headerIndex = [];
            textWrap;
            textAlign;
            textVerticalAlign;
            textClass;
            columns;
            resizer;
            menu;
            renderer;
            editor;
            clicksToEdit;
            filter;
            alternative;
            $header;
            /**
             * 그리드패널 컬럼객체를 생성한다.
             *
             * @param {Aui.Grid.Column.Properties} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.text = this.properties.text ?? '';
                this.dataIndex = this.properties.dataIndex ?? '';
                this.width = this.properties.width ?? null;
                this.minWidth = this.properties.minWidth ?? null;
                this.minWidth ??= this.width == null ? 50 : null;
                this.resizable = this.properties.resizable ?? true;
                this.sortable = this.properties.sortable ?? false;
                this.hidden = this.properties.hidden ?? false;
                this.headerWrap = this.properties.headerAlign ?? true;
                this.headerAlign = this.properties.headerAlign ?? 'left';
                this.headerVerticalAlign = this.properties.headerVerticalAlign ?? 'middle';
                this.textWrap = this.properties.textWrap ?? true;
                this.textAlign = this.properties.textAlign ?? 'left';
                this.textVerticalAlign = this.properties.textVerticalAlign ?? 'middle';
                this.textClass = this.properties.textClass ?? null;
                this.columns = [];
                this.renderer = this.properties.renderer ?? null;
                this.editor = this.properties.editor ?? null;
                this.clicksToEdit = Math.max(1, Math.min(2, this.properties.clicksToEdit ?? 2));
                this.filter = this.properties.filter ?? null;
                this.alternative = this.properties.alternative ?? null;
                this.menu = this.properties.menu ?? null;
                if (this.filter !== null) {
                    this.filter.setColumn(this);
                    this.menu ??= new Aui.Menu();
                    this.menu.add(this.filter.getLayout());
                }
                if (this.menu !== null) {
                    this.menu.addEvent('show', (menu) => {
                        menu.$target.getParent().addClass('menu');
                    });
                    this.menu.addEvent('hide', (menu) => {
                        menu.$target.getParent().removeClass('menu');
                    });
                }
                if (this.alternative !== null) {
                    this.alternative.header = this.alternative.header !== false;
                    this.alternative.filter ??= null;
                    this.alternative.sortable ??= false;
                    this.alternative.renderer ??= null;
                    this.alternative.menu ??= null;
                    if (this.alternative.filter !== null) {
                        this.alternative.filter.setColumn(this, true);
                        this.alternative.menu ??= new Aui.Menu();
                        this.alternative.menu.add(this.alternative.filter.getLayout());
                    }
                    if (this.alternative.menu !== null) {
                        this.alternative.menu.addEvent('show', (menu) => {
                            menu.$target.getParent().addClass('menu');
                        });
                        this.alternative.menu.addEvent('hide', (menu) => {
                            menu.$target.getParent().removeClass('menu');
                        });
                    }
                }
                for (let column of properties?.columns ?? []) {
                    if (!(column instanceof Aui.Grid.Column)) {
                        column = new Aui.Grid.Column(column);
                    }
                    column.setParent(this);
                    this.columns.push(column);
                }
            }
            /**
             * 하위 컬럼이 존재하는지 확인한다.
             *
             * @return {boolean} has_child
             */
            hasChild() {
                return this.columns.length > 0;
            }
            /**
             * 하위 컬럼을 가져온다.
             *
             * @return {Aui.Grid.Column[]} columns
             */
            getChildren() {
                return this.columns;
            }
            /**
             * 그리드패널을 지정한다.
             *
             * @param {Aui.Grid.Panel} grid - 그리드패널
             */
            setGrid(grid) {
                this.grid = grid;
                this.columns.forEach((column) => {
                    column.setGrid(grid);
                });
                this.menu?.setParent(this.grid);
            }
            /**
             * 컬럼 위치를 설정한다.
             *
             * @param {number} columnIndex - 컬럼인덱스
             */
            setColumnIndex(columnIndex) {
                this.columnIndex = columnIndex;
            }
            /**
             * 컬럼의 그룹헤더 지정한다.
             *
             * @param {Aui.Grid.Column} parent - 그리드헤더 그룹컬럼
             */
            setParent(parent) {
                this.parent = parent;
            }
            /**
             * 컬럼이 그룹화되어 있다면 그룹헤더를 가져온다.
             *
             * @return {Aui.Grid.Column} parent
             */
            getParent() {
                return this.parent;
            }
            /**
             * 그리드패널을 가져온다.
             *
             * @return {Aui.Grid.Panel} grid
             */
            getGrid() {
                return this.grid;
            }
            /**
             * 컬럼의 최소 너비를 가져온다.
             *
             * @return {number} minWidth - 최소너비
             */
            getMinWidth() {
                if (this.columns.length == 0) {
                    return this.minWidth ?? this.width;
                }
                else {
                    let minWidth = 0;
                    for (let column of this.columns) {
                        minWidth += column.getMinWidth();
                    }
                    return minWidth;
                }
            }
            /**
             * 현재 컬럼을 포함한 하위 전체 컬럼을 가져온다.
             *
             * @return {Aui.Grid.Column[]} columns
             */
            getColumns() {
                if (this.columns.length == 0)
                    return [this];
                let columns = [];
                for (let column of this.columns) {
                    columns.push(...column.getColumns());
                }
                return columns;
            }
            /**
             * 자식 컬럼을 추가한다.
             *
             * @param {(Aui.Grid.Column|Aui.Grid.Column.Properties)} column - 추가할 컬럼
             * @param {number} position - 추가할 위치
             */
            addColumn(column, position = null) {
                if (this.columns.length == 0) {
                    return;
                }
                let indexes = [...this.headerIndex];
                let parent = this.getGrid().properties.columns;
                while (indexes.length) {
                    const index = indexes.shift();
                    parent = parent[index]?.columns ?? null;
                    if (parent == null) {
                        return;
                    }
                }
                const columns = parent ?? this.getGrid().properties.columns;
                if (position === null || position >= (columns.length ?? 0)) {
                    columns.push(column);
                }
                else if (position < 0 && Math.abs(position) >= (columns.length ?? 0)) {
                    columns.unshift(column);
                }
                else {
                    columns.splice(position, 0, column);
                }
                this.getGrid().updateColumns();
            }
            /**
             * 묶음 컬럼의 Flex-Grow 값을 계산하여 가져온다.
             *
             * @return {number} flexGrow
             */
            getChildrenFlexGrow() {
                if (this.hidden == true) {
                    return 0;
                }
                if (this.columns.length == 0) {
                    return this.width === null ? 1 : 0;
                }
                else {
                    let flexGrow = 0;
                    for (const column of this.columns) {
                        if (column.hidden == true)
                            continue;
                        flexGrow += column.getChildrenFlexGrow();
                    }
                    return flexGrow;
                }
            }
            /**
             * 묶음 컬럼의 Flex-Grow 값을 계산하여 가져온다.
             *
             * @return {number} flexBasis
             */
            getChildrenFlexBasis() {
                if (this.hidden == true) {
                    return 0;
                }
                if (this.columns.length == 0) {
                    return this.width ? this.width : this.minWidth ? this.minWidth : 0;
                }
                else {
                    let width = 0;
                    let count = 0;
                    for (const column of this.columns) {
                        if (column.isHidden() == true)
                            continue;
                        width += column.getChildrenFlexBasis();
                        count++;
                    }
                    width += Math.max(0, count - 1);
                    return width;
                }
            }
            /**
             * 컬럼너비를 변경한다.
             *
             * @param {number} width - 변경할 너비
             */
            setWidth(width) {
                this.width = width;
                this.minWidth = null;
                this.grid.updateLayout();
            }
            /**
             * 컬럼의 숨김여부를 변경한다.
             *
             * @param {boolean} hidden - 숨김여부
             */
            setHidden(hidden) {
                this.hidden = hidden;
                this.grid.updateLayout();
            }
            /**
             * 컬럼의 숨김여부를 가져온다.
             *
             * @return {boolean} hidden
             */
            isHidden() {
                if (this.hasChild() == true) {
                    let count = 0;
                    this.getChildren().forEach((column) => {
                        if (column.isHidden() == false) {
                            count++;
                        }
                    });
                    return count == 0;
                }
                else {
                    return this.hidden;
                }
            }
            /**
             * 컬럼 크기조절가능여부를 가져온다.
             *
             * @return {boolean} resizable
             */
            isResizable() {
                if (this.getGrid().columnResizable === false) {
                    return false;
                }
                if (this.hasChild() == true) {
                    return false;
                }
                else {
                    return this.resizable;
                }
            }
            /**
             * 컬럼이 고정된 상태인지 가져온다.
             *
             * @return {boolean} freeze
             */
            isFreezeColumn() {
                return this.grid.freezeColumn > this.columnIndex;
            }
            /**
             * 컬럼의 헤더컬럼 레이아웃을 가져온다.
             *
             * @param {number} headerIndex - 헤더인덱스
             * @param {number} parentHeaderIndex - 부모헤더 인덱스
             * @return {Dom} $layout
             */
            $getHeader(headerIndex = null, parentHeaderIndex = []) {
                if (headerIndex !== null) {
                    this.headerIndex.push(...parentHeaderIndex);
                    this.headerIndex.push(headerIndex);
                    const $header = Html.create('div').setData('component', this.id);
                    if (this.hasChild() == true) {
                        $header.setData('role', 'merge');
                        if (this.getChildrenFlexGrow() > 0) {
                            $header.setStyle('width', this.getChildrenFlexBasis() + 'px');
                            $header.setStyle('flexGrow', this.getChildrenFlexGrow());
                            $header.setStyle('flexBasis', this.getChildrenFlexBasis() + 'px');
                        }
                        const $group = Html.create('div');
                        $group.setData('role', 'group');
                        const $text = Html.create('div').setData('role', 'text');
                        $text.addClass(this.headerAlign);
                        $text.html(this.text);
                        $group.append($text);
                        let $children = Html.create('div').setData('role', 'columns');
                        let childIndex = 0;
                        for (let child of this.getChildren()) {
                            $children.append(child.$getHeader(childIndex++, this.headerIndex));
                        }
                        $group.append($children);
                        $header.append($group);
                    }
                    else {
                        $header.setData('role', 'column');
                        if (this.width) {
                            $header.setStyle('width', this.width + 'px');
                        }
                        else {
                            $header.setStyle('flexGrow', 1);
                        }
                        if (this.minWidth) {
                            $header.setStyle('width', this.minWidth + 'px');
                            $header.setStyle('flexBasis', this.minWidth + 'px');
                        }
                        const $inner = Html.create('div', { 'data-role': 'inner' });
                        const $title = Html.create('div', { 'data-role': 'title' });
                        const $label = Html.create('label');
                        $label.addClass(this.headerAlign);
                        $label.addClass(this.headerVerticalAlign);
                        $label.html(this.text);
                        if (this.grid.getStore().getPrimaryKeys().includes(this.dataIndex) == true) {
                            $label.append(Html.create('i', { 'data-role': 'keys', 'class': this.text?.length > 0 ? 'text' : '' }));
                        }
                        if (this.sortable !== false) {
                            const $sorter = Html.create('i', { 'data-role': 'sorter' });
                            $label.prepend($sorter);
                            $label.on('click', () => {
                                const field = typeof this.sortable === 'string' ? this.sortable : this.dataIndex;
                                const sorters = this.getGrid().getStore().getSorters() ?? {};
                                const direction = (sorters[field] ?? 'DESC') == 'DESC' ? 'ASC' : 'DESC';
                                if (Object.keys(sorters).length > 1) {
                                    // @todo multisort 여부 확인
                                    sorters[field] = direction;
                                    this.getGrid().getStore().multiSort(sorters);
                                }
                                else {
                                    this.getGrid().getStore().sort(field, direction);
                                }
                            });
                        }
                        $label.setData('sortable', this.sortable);
                        $label.setData('dataindex', this.dataIndex);
                        $title.append($label);
                        if (this.menu !== null) {
                            const $button = Html.create('button', { 'type': 'button', 'data-role': 'header-menu' });
                            $title.append($button);
                            $button.on('click', () => {
                                this.menu.showAt($button, 'y');
                            });
                        }
                        $inner.append($title);
                        if (this.alternative !== null && this.alternative.header === true) {
                            const $alternative = Html.create('div', { 'data-role': 'title' });
                            const $label = Html.create('label');
                            $label.addClass(this.headerAlign);
                            $label.addClass(this.headerVerticalAlign);
                            $label.html(this.alternative.text);
                            if (this.grid.getStore().getPrimaryKeys().includes(this.alternative.dataIndex) == true) {
                                $label.append(Html.create('i', {
                                    'data-role': 'keys',
                                    'class': this.alternative.text?.length > 0 ? 'text' : '',
                                }));
                            }
                            if (this.alternative.sortable !== false) {
                                const $sorter = Html.create('i', { 'data-role': 'sorter' });
                                $label.prepend($sorter);
                                $label.on('click', () => {
                                    const field = typeof this.alternative.sortable === 'string'
                                        ? this.alternative.sortable
                                        : this.alternative.dataIndex;
                                    const sorters = this.getGrid().getStore().getSorters() ?? {};
                                    const direction = (sorters[field] ?? 'DESC') == 'DESC' ? 'ASC' : 'DESC';
                                    if (Object.keys(sorters).length > 1) {
                                        // @todo multisort 여부 확인
                                        sorters[field] = direction;
                                        this.getGrid().getStore().multiSort(sorters);
                                    }
                                    else {
                                        this.getGrid().getStore().sort(field, direction);
                                    }
                                });
                            }
                            $label.setData('sortable', this.alternative.sortable);
                            $label.setData('dataindex', this.alternative.dataIndex);
                            $alternative.append($label);
                            if (this.alternative.menu !== null) {
                                const $button = Html.create('button', { 'type': 'button', 'data-role': 'header-menu' });
                                $alternative.append($button);
                                $button.on('click', () => {
                                    this.alternative.menu.showAt($button, 'y');
                                });
                            }
                            $inner.append($alternative);
                        }
                        $header.append($inner);
                    }
                    if (this.isHidden() == true) {
                        $header.setStyle('display', 'none');
                    }
                    if (this.isResizable() == true) {
                        this.resizer = new Aui.Resizer($header, this.grid.$content, {
                            directions: [false, true, false, false],
                            guidelines: [false, true, false, true],
                            minWidth: 50,
                            maxWidth: 900,
                            listeners: {
                                mouseenter: () => {
                                    this.grid.$getHeader().addClass('locked');
                                },
                                mouseleave: () => {
                                    this.grid.$getHeader().removeClass('locked');
                                },
                                start: (_$target, _rect, _position, $guide) => {
                                    this.grid.$getHeader().addClass('resizing');
                                    this.grid.getScroll().setScrollable(false);
                                    $guide.setStyle('height', null);
                                },
                                resize: (_$target, rect, position, $guide) => {
                                    this.grid.$getHeader().addClass('locked');
                                    $guide.setStyle('height', null);
                                    /**
                                     * 그리드 패널 우측으로 벗어났을 경우, 그리드패널을 우측으로 스크롤한다.
                                     */
                                    const offset = this.grid.$content.getOffset();
                                    const width = this.grid.$content.getOuterWidth();
                                    const scroll = this.grid.getScroll().getPosition();
                                    const x = Math.max(0, position.x);
                                    if (x > offset.left + width - 15) {
                                        if (rect.right < width + scroll.x - 50) {
                                            this.grid.getScroll().setAutoScroll(0, 0);
                                        }
                                        else {
                                            const speed = Math.min(Math.ceil((x - (offset.left + width - 15)) / 30), 15);
                                            this.grid.getScroll().setAutoScroll(speed, 0);
                                        }
                                        this.grid.getScroll().active('x');
                                    }
                                    else if (this.isFreezeColumn() == false &&
                                        x < offset.left + this.grid.freezeWidth + 15) {
                                        if (rect.left > this.grid.freezeWidth + scroll.x + 50) {
                                            this.grid.getScroll().setAutoScroll(0, 0);
                                        }
                                        else {
                                            const speed = Math.max(Math.floor((x - (offset.left + this.grid.freezeWidth - 15)) / 30), -15);
                                            this.grid.getScroll().setAutoScroll(speed, 0);
                                        }
                                        this.grid.getScroll().active('x');
                                    }
                                    else {
                                        this.grid.getScroll().setAutoScroll(0, 0);
                                    }
                                },
                                end: (_$target, rect) => {
                                    this.setWidth(rect.width);
                                    this.grid.getScroll().setAutoScroll(0, 0);
                                    this.grid.getScroll().setScrollable(this.grid.scrollable);
                                    this.grid.$getHeader().removeClass('locked');
                                    this.grid.$getHeader().removeClass('resizing');
                                },
                            },
                        });
                    }
                    this.$header = $header;
                }
                return this.$header;
            }
            /**
             * 컬럼이 자식컬럼인 경우 현재 컬럼을 그룹핑하고 있는 부모 그룹헤더를 가져온다.
             *
             * @return {Dom} - $parent
             */
            $getParentHeader() {
                if (this.headerIndex.length > 1) {
                    const parent = [...this.headerIndex];
                    parent.pop();
                    return this.getGrid().getHeaderByIndex(parent).$getHeader();
                }
                return null;
            }
            /**
             * 컬럼의 데이터컬럼 레이아웃을 가져온다.
             *
             * @param {any} value - 컬럼의 dataIndex 데이터
             * @param {Aui.Data.Record} record - 컬럼이 속한 행의 모든 데이터셋
             * @param {number} rowIndex - 행 인덱스
             * @param {number} columnIndex - 열 인덱스
             * @return {Dom} $layout
             */
            $getBody(value, record, rowIndex, columnIndex) {
                const $column = Html.create('div')
                    .setData('role', 'column')
                    .setData('row', rowIndex)
                    .setData('column', columnIndex)
                    .setData('record', record, false)
                    .setData('value', value, false);
                if (this.width) {
                    $column.setStyle('width', this.width + 'px');
                }
                else {
                    $column.setStyle('flexGrow', 1);
                }
                if (this.minWidth) {
                    $column.setStyle('flexBasis', this.minWidth + 'px');
                    $column.setStyle('width', this.minWidth + 'px');
                }
                $column.addClass(this.textAlign);
                $column.addClass(this.textVerticalAlign);
                if (this.textClass !== null) {
                    $column.addClass(...this.textClass.split(' '));
                }
                $column.on('pointerdown', (e) => {
                    if (e.shiftKey == true && this.grid.selection.multiple == true && this.grid.focusedRow !== null) {
                        this.grid.selectRange(this.grid.focusedRow, rowIndex);
                    }
                    this.grid.focusCell(rowIndex, columnIndex);
                });
                if (this.editor === null || this.clicksToEdit == 2) {
                    $column.on('click', (e) => {
                        if (e.shiftKey == true &&
                            this.grid.selection.multiple == true &&
                            this.grid.focusedRow == rowIndex) {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                        }
                    });
                }
                if (this.editor !== null) {
                    if (this.clicksToEdit == 1) {
                        $column.on('click', (e) => {
                            this.grid.editCell(rowIndex, columnIndex);
                            e.preventDefault();
                            e.stopImmediatePropagation();
                        });
                    }
                    else {
                        $column.on('dblclick', (e) => {
                            this.grid.editCell(rowIndex, columnIndex);
                            e.preventDefault();
                            e.stopImmediatePropagation();
                        });
                    }
                }
                const $view = Html.create('div').setData('role', 'view');
                if (this.renderer !== null) {
                    $view.html(this.renderer(value, record, $column, rowIndex, columnIndex, this, this.getGrid()));
                }
                else {
                    $view.html(value);
                }
                $column.append($view);
                if (this.alternative !== null) {
                    const alternative = record.get(this.alternative.dataIndex);
                    const $alternative = Html.create('div').setData('role', 'view').addClass('alternative');
                    if (this.alternative.renderer !== null) {
                        $alternative.html(this.alternative.renderer(alternative, record, $column, rowIndex, columnIndex, this, this.getGrid()));
                    }
                    else {
                        $alternative.html(alternative);
                    }
                    $column.append($alternative);
                }
                if (this.isHidden() == true) {
                    $column.setStyle('display', 'none');
                }
                return $column;
            }
            /**
             * 컬럼을 제거한다.
             *
             * @param {boolean} is_update_layout - 그리드 레이아웃을 업데이트할지 여부
             */
            remove(is_update_layout = true) {
                if (this.columns.length == 0) {
                    this.columns.forEach((column) => {
                        column.remove(false);
                    });
                }
                if (is_update_layout == true) {
                    let indexes = [...this.headerIndex];
                    let lastIndex = indexes.pop();
                    let parent = this.getGrid().properties.columns;
                    while (indexes.length) {
                        const index = indexes.shift();
                        parent = parent[index]?.columns ?? null;
                        if (parent == null) {
                            return;
                        }
                    }
                    const columns = parent ?? this.getGrid().properties.columns;
                    columns.splice(lastIndex, 1);
                    this.getGrid().updateColumns();
                }
                super.remove();
            }
        }
        Grid.Column = Column;
        class Check extends Aui.Grid.Column {
            /**
             * 그리드패널 컬럼객체를 생성한다.
             *
             * @param {Aui.Grid.Column.Properties} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
            }
            /**
             * 컬럼의 최소 너비를 가져온다.
             *
             * @return {number} minWidth - 최소너비
             */
            getMinWidth() {
                return this.width;
            }
            /**
             * 컬럼너비를 변경한다.
             *
             * @param {number} _width - 변경할 너비
             */
            setWidth(_width) {
                return;
            }
            /**
             * 컬럼의 숨김여부를 변경한다.
             *
             * @param {boolean} _hidden - 숨김여부
             */
            setHidden(_hidden) {
                return;
            }
            /**
             * 컬럼의 숨김여부를 가져온다.
             *
             * @return {boolean} hidden
             */
            isHidden() {
                return false;
            }
            /**
             * 컬럼 크기조절가능여부를 가져온다.
             *
             * @return {boolean} resizable
             */
            isResizable() {
                return false;
            }
            /**
             * 컬럼의 헤더컬럼 레이아웃을 가져온다.
             *
             * @return {Dom} $layout
             */
            $getHeader() {
                // @todo 컬럼헤더의 체크박스 추가
                return super.$getHeader();
            }
            /**
             * 컬럼의 데이터컬럼 레이아웃을 가져온다.
             *
             * @param {any} value - 컬럼의 dataIndex 데이터
             * @param {Aui.Data.Record} record - 컬럼이 속한 행의 모든 데이터셋
             * @param {number} rowIndex - 행 인덱스
             * @param {number} columnIndex - 열 인덱스
             * @return {Dom} $layout
             */
            $getBody(value, record, rowIndex, columnIndex) {
                const $column = Html.create('div')
                    .setData('role', 'column')
                    .setData('row', rowIndex)
                    .setData('column', columnIndex)
                    .setData('record', record, false)
                    .setData('value', value, false);
                $column.addClass('check');
                if (value == true) {
                    $column.addClass('checked');
                }
                $column.setStyle('width', this.width + 'px');
                $column.on('click', (e) => {
                    this.getGrid().selectRow(rowIndex, true);
                    e.stopImmediatePropagation();
                });
                const $button = Html.create('button');
                $button.addClass(this.headerAlign);
                $column.append($button);
                return $column;
            }
        }
        Grid.Check = Check;
        class Pagination extends Aui.Toolbar {
            grid = null;
            store = null;
            firstButton;
            prevButton;
            nextButton;
            lastButton;
            pageInput;
            pageDisplay;
            /**
             * 페이징 툴바를 생성한다.
             *
             * @param {(Aui.Component|string)[]} items - 추가 툴바 아이템
             */
            constructor(items = null) {
                super(items);
            }
            /**
             * 부모객체를 지정한다.
             *
             * @param {Aui.Grid.Panel} grid - 그리드패널
             * @return {Aui.Grid.Pagination} this
             */
            setParent(grid) {
                if (grid instanceof Aui.Grid.Panel) {
                    super.setParent(grid);
                    this.grid = grid;
                    this.store = this.grid.getStore();
                    this.store.addEvent('beforeLoad', () => {
                        this.setDisabled(true);
                    });
                    this.store.addEvent('update', () => {
                        this.onUpdate();
                    });
                }
                return this;
            }
            /**
             * 처음으로 이동하는 버튼을 가져온다.
             *
             * @return {Aui.Button} firstButton
             */
            getFirstButton() {
                if (this.firstButton === undefined) {
                    this.firstButton = new Aui.Button({
                        iconClass: 'mi mi-step-backward',
                        disabled: true,
                        handler: () => {
                            this.movePage('FIRST');
                        },
                    });
                }
                return this.firstButton;
            }
            /**
             * 이전으로 이동하는 버튼을 가져온다.
             *
             * @return {Aui.Button} prevButton
             */
            getPrevButton() {
                if (this.prevButton === undefined) {
                    this.prevButton = new Aui.Button({
                        iconClass: 'mi mi-angle-left',
                        disabled: true,
                        handler: () => {
                            this.movePage('PREV');
                        },
                    });
                }
                return this.prevButton;
            }
            /**
             * 다음으로 이동하는 버튼을 가져온다.
             *
             * @return {Aui.Button} nextButton
             */
            getNextButton() {
                if (this.nextButton === undefined) {
                    this.nextButton = new Aui.Button({
                        iconClass: 'mi mi-angle-right',
                        disabled: true,
                        handler: () => {
                            this.movePage('NEXT');
                        },
                    });
                }
                return this.nextButton;
            }
            /**
             * 마지막으로 이동하는 버튼을 가져온다.
             *
             * @return {Aui.Button} lastButton
             */
            getLastButton() {
                if (this.lastButton === undefined) {
                    this.lastButton = new Aui.Button({
                        iconClass: 'mi mi-step-forward',
                        disabled: true,
                        handler: () => {
                            this.movePage('LAST');
                        },
                    });
                }
                return this.lastButton;
            }
            /**
             * 페이지 입력폼을 가져온다.
             *
             * @return {Aui.Form.Field.Number} pageInput
             */
            getPageInput() {
                if (this.pageInput === undefined) {
                    this.pageInput = new Aui.Form.Field.Number({
                        value: 1,
                        minValue: 1,
                        width: 50,
                        spinner: false,
                        format: false,
                    });
                    this.pageInput.$getInput().on('keydown', (e) => {
                        if (e.key == 'Enter') {
                            if (this.store?.getPage() != this.pageInput.getValue()) {
                                this.store?.loadPage(this.pageInput.getValue());
                            }
                            e.preventDefault();
                        }
                    });
                    this.pageInput.$getInput().on('blur', () => {
                        this.pageInput.setValue(this.store?.getPage() ?? 1);
                    });
                }
                return this.pageInput;
            }
            /**
             * 페이지 입력폼을 가져온다.
             *
             * @return {Aui.Form.Field.Display} pageDisplay
             */
            getPageDisplay() {
                if (this.pageDisplay === undefined) {
                    this.pageDisplay = new Aui.Form.Field.Display({
                        value: '1',
                        renderer: (value) => {
                            return '/ ' + Format.number(value) + ' ' + Aui.printText('texts.page');
                        },
                    });
                }
                return this.pageDisplay;
            }
            /**
             * 툴바의 하위 컴포넌트를 초기화한다.
             */
            initItems() {
                if (this.items === null) {
                    this.items = [];
                    if (this.grid !== null) {
                        this.items.push(this.getFirstButton());
                        this.items.push(this.getPrevButton());
                        this.items.push(new Aui.Toolbar.Item('-'));
                        this.items.push(this.getPageInput());
                        this.items.push(this.getPageDisplay());
                        this.items.push(new Aui.Toolbar.Item('-'));
                        this.items.push(this.getNextButton());
                        this.items.push(this.getLastButton());
                        if (this.properties.items.length > 0) {
                            this.items.push(new Aui.Toolbar.Item('-'));
                        }
                    }
                    for (const item of this.properties.items ?? []) {
                        if (item instanceof Aui.Component) {
                            item.setLayoutType('column-item');
                            this.items.push(item);
                        }
                        else if (typeof item == 'string') {
                            this.items.push(new Aui.Toolbar.Item(item));
                        }
                    }
                }
                super.initItems();
            }
            /**
             * 페이지를 이동한다.
             *
             * @param {'FIRST'|'PREV'|'NEXT'|'END'} position - 이동할위치
             */
            movePage(position) {
                const page = this.store?.getPage() ?? 1;
                const totalPage = this.store?.getTotalPage() ?? 1;
                let move = null;
                switch (position) {
                    case 'FIRST':
                        if (page > 1) {
                            move = 1;
                        }
                        break;
                    case 'PREV':
                        if (page > 1) {
                            move = page - 1;
                        }
                        break;
                    case 'NEXT':
                        if (page < totalPage) {
                            move = page + 1;
                        }
                        break;
                    case 'LAST':
                        if (page < totalPage) {
                            move = totalPage;
                        }
                        break;
                }
                if (move !== null) {
                    this.store.loadPage(move);
                }
                //
            }
            /**
             * 툴바를 랜더링한다.
             */
            render() {
                super.render();
                if (this.store.isLoaded() == true) {
                    this.onUpdate();
                }
            }
            /**
             * 페이징 처리 UI 의 비활성화 여부를 설정한다.
             *
             * @param {boolean} disabled - 비활성화여부
             * @return {this}
             */
            setDisabled(disabled) {
                this.getFirstButton().setDisabled(disabled);
                this.getPrevButton().setDisabled(disabled);
                this.getNextButton().setDisabled(disabled);
                this.getLastButton().setDisabled(disabled);
                this.getPageInput().setDisabled(disabled);
                this.getPageDisplay().setDisabled(disabled);
                return this;
            }
            /**
             * 데이터스토어가 업데이트되었을 때 UI 를 업데이트한다.
             */
            onUpdate() {
                if (this.store.isLoaded() === true) {
                    this.enable();
                    if (this.store.getPage() == 1) {
                        this.getFirstButton().setDisabled(true);
                        this.getPrevButton().setDisabled(true);
                    }
                    if (this.store.getPage() == this.store.getTotalPage()) {
                        this.getNextButton().setDisabled(true);
                        this.getLastButton().setDisabled(true);
                    }
                    this.getPageInput().setValue(this.store.getPage());
                    this.getPageInput().setMaxValue(this.store.getTotalPage());
                    this.getPageDisplay().setValue(this.store.getTotalPage());
                }
                else {
                    this.disable();
                }
            }
        }
        Grid.Pagination = Pagination;
    })(Grid = Aui.Grid || (Aui.Grid = {}));
})(Aui || (Aui = {}));
