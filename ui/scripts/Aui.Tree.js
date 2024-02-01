/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 트리패널 클래스를 정의한다.
 *
 * @file /scripts/Aui.Tree.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 27.
 */
var Aui;
(function (Aui) {
    let Tree;
    (function (Tree) {
        class Panel extends Aui.Panel {
            type = 'panel';
            role = 'tree';
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
            expandedRows = new Map();
            store;
            autoLoad;
            autoExpand;
            expandedDepth;
            $header;
            $body;
            $footer;
            focusedRow = null;
            focusedCell = { treeIndex: null, columnIndex: null };
            loading;
            /**
             * 트리패널을 생성한다.
             *
             * @param {Aui.Tree.Panel.Properties} properties - 객체설정
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
                this.selection.multiple = this.selection.multiple ?? false;
                this.selection.deselectable = this.selection.deselectable ?? false;
                this.selection.keepable = this.selection.keepable ?? false;
                if (this.selection.display == 'check') {
                    this.selection.multiple = true;
                    this.selection.deselectable = true;
                    this.freeze = this.freeze + 1;
                }
                this.store = this.properties.store ?? new Aui.TreeStore();
                this.store.addEvent('beforeLoad', () => {
                    this.onBeforeLoad();
                });
                this.store.addEvent('load', () => {
                    this.onLoad();
                });
                this.store.addEvent('update', () => {
                    this.onUpdate();
                    if (this.store.getFilters() !== null) {
                        this.expandAll(true);
                    }
                });
                this.store.addEvent('updateChildren', (_store, record) => {
                    this.onUpdateChildren(record);
                });
                this.autoLoad = this.properties.autoLoad !== false;
                this.autoExpand = this.properties.autoExpand !== false;
                this.expandedDepth = this.properties.expandedDepth ?? false;
                this.expandedDepth = this.expandedDepth === 0 ? false : this.expandedDepth;
                this.initColumns();
                this.$header = Html.create('div').setData('role', 'header');
                this.$body = Html.create('div').setData('role', 'body');
                this.$footer = Html.create('div').setData('role', 'footer');
                this.loading = new Aui.Loading(this, {
                    type: this.properties.loadingType ?? 'column',
                    direction: 'column',
                    message: this.properties.loadingText ?? null,
                });
            }
            /**
             * 트리패널 헤더의 하위 컴포넌트를 초기화한다.
             */
            initColumns() {
                this.headers = [];
                this.columns = [];
                for (let column of this.properties.columns ?? []) {
                    if (!(column instanceof Aui.Tree.Column)) {
                        column = new Aui.Tree.Column(column);
                    }
                    column.setTree(this);
                    this.headers.push(column);
                    this.columns.push(...column.getColumns());
                }
                this.columns.forEach((column, columnIndex) => {
                    column.setColumnIndex(columnIndex);
                });
                this.freeze = Math.max(1, Math.min(this.headers.length - 1, this.freeze));
            }
            /**
             * 트리패널의 데이터스토어를 가져온다.
             *
             * @return {Aui.TreeStore} store
             */
            getStore() {
                return this.store ?? this.properties.store ?? new Aui.TreeStore();
            }
            /**
             * 트리패널의 헤더 Dom 을 가져온다.
             *
             * @return {Dom} $header
             */
            $getHeader() {
                return this.$header;
            }
            /**
             * 트리패널의 바디 Dom 을 가져온다.
             *
             * @return {Dom} $body
             */
            $getBody() {
                return this.$body;
            }
            /**
             * 트리패널의 푸터 Dom 을 가져온다.
             *
             * @return {Dom} $footer
             */
            $getFooter() {
                return this.$footer;
            }
            /**
             * 트리패널의 전체 컬럼을 가져온다.
             *
             * @return {Aui.Tree.Column[]} columns
             */
            getColumns() {
                return this.columns;
            }
            /**
             * 특정 순서의 컬럼을 가져온다.
             *
             * @param {number} columnIndex - 가져올 컬럼의 인덱스
             * @return {Aui.Tree.Column} column - 컬럼
             */
            getColumnByIndex(columnIndex) {
                const column = this.columns[columnIndex];
                if (column instanceof Aui.Tree.Column) {
                    return column;
                }
                else {
                    return null;
                }
            }
            /**
             * 특정 열에 포커스를 지정한다.
             *
             * @param {number} treeIndex - 행 인덱스
             */
            focusRow(treeIndex) {
                const $row = this.$getRow(treeIndex);
                if ($row == null) {
                    return;
                }
                this.blurRow();
                const $leaf = Html.get('> div[data-role=leaf]', $row);
                const headerHeight = this.$getHeader().getOuterHeight();
                const contentHeight = this.$getContent().getHeight();
                const offset = $leaf.getPosition();
                const scroll = this.getScroll().getPosition();
                const top = offset.top;
                const bottom = top + $leaf.getOuterHeight();
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
                this.focusedRow = treeIndex;
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
             * @param {number} treeIndex - 행 인덱스
             * @param {number} columnIndex - 컬럼 인덱스
             */
            focusCell(treeIndex, columnIndex) {
                if (this.isRendered() == false)
                    return;
                const $row = this.$getRow(treeIndex);
                if ($row === null)
                    return;
                const $column = Html.get('div[data-role=column][data-column="' + columnIndex + '"]', $row);
                if ($column.getEl() == null)
                    return;
                this.blurCell();
                this.focusRow(treeIndex);
                $column.addClass('focused');
                this.focusedCell.treeIndex = treeIndex;
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
                this.onFocusMove(treeIndex, columnIndex);
            }
            /**
             * 포커스된 셀을 포커스를 해제한다.
             */
            blurCell() {
                this.blurRow();
                this.focusedCell.treeIndex = null;
                this.focusedCell.columnIndex = null;
                Html.all('div[data-role=column].focused', this.$body).removeClass('focused');
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
             * 트리 아이템(행)이 선택여부를 확인한다.
             *
             * @param {number[]} treeIndex - 선택여부를 확인할 아이탬(행) 인덱스
             * @return {boolean} selected
             */
            isRowSelected(treeIndex) {
                if (treeIndex === null) {
                    return false;
                }
                const $row = this.$getRow(treeIndex);
                if ($row === null) {
                    return false;
                }
                const record = $row.getData('record');
                return (Html.get('> div[data-role=leaf]', $row).hasClass('selected') == true &&
                    this.selections.has(record.getHash()));
            }
            /**
             * 트리 아이템(행)이 확장된 상태인지 확인한다.
             *
             * @param {number[]} treeIndex - 확장여부를 확인할 아이탬(행) 인덱스
             * @return {boolean} expanded
             */
            isRowExpanded(treeIndex) {
                if (treeIndex === null) {
                    return false;
                }
                const $row = this.$getRow(treeIndex);
                if ($row === null) {
                    return false;
                }
                const record = $row.getData('record');
                return record.hasChild() == true && $row.hasClass('expanded');
            }
            /**
             * 트리 아이템(행)이 보여지고 있는 상태인지 확인한다.
             *
             * @param {number[]} treeIndex - 상태를 확인할 아이탬(행) 인덱스
             * @return {boolean} visible
             */
            isRowVisible(treeIndex) {
                if (treeIndex === null) {
                    return false;
                }
                if (treeIndex.length == 1) {
                    return true;
                }
                if (this.isRowExpanded(treeIndex.slice(0, -1)) == false) {
                    return false;
                }
                else {
                    return this.isRowExpanded(treeIndex.slice(0, -1));
                }
            }
            /**
             * 아이템을 오픈한다.
             *
             * @param {number[]} treeIndex - 아이탬(행) 인덱스
             */
            openItem(treeIndex) {
                const $row = this.$getRow(treeIndex);
                if ($row === null)
                    return;
                const record = $row.getData('record');
                this.select(record);
                this.fireEvent('openItem', [record, treeIndex, this]);
            }
            /**
             * 아이템 메뉴를 오픈한다.
             *
             * @param {number[]} treeIndex - 아이탬(행) 인덱스
             * @param {PointerEvent} pointerEvent - 포인트이벤트
             */
            openMenu(treeIndex, pointerEvent) {
                const $row = this.$getRow(treeIndex);
                if ($row === null)
                    return;
                const record = $row.getData('record');
                this.select(record);
                const menu = new Aui.Menu();
                this.fireEvent('openMenu', [menu, record, treeIndex, this]);
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
             * 트리를 확장한다.
             *
             * @param {number[]} treeIndex - 확장할 아이탬(행) 인덱스
             */
            async expandRow(treeIndex) {
                if (treeIndex.length == 0) {
                    return;
                }
                const currentIndex = [];
                treeIndex = treeIndex.slice();
                while (treeIndex.length > 0) {
                    currentIndex.push(treeIndex.shift());
                    const $row = this.$getRow(currentIndex);
                    if ($row === null || $row.hasClass('edge') == true) {
                        return;
                    }
                    const record = $row.getData('record');
                    if (record.isExpanded() === true) {
                        $row.addClass('expanded');
                    }
                    else {
                        const $leaf = Html.get('> div[data-role=leaf]', $row);
                        const $toggle = Html.get('> div[data-role=column] > div[data-role=toggle] > button', $leaf);
                        $toggle.disable();
                        await this.getStore().expand(currentIndex);
                        $toggle.enable();
                        $row.addClass('expanded');
                    }
                    const depth = record.getParents().length;
                    if (this.expandedRows.has(depth) == false) {
                        this.expandedRows.set(depth, new Map());
                    }
                    this.expandedRows.get(depth).set(record.getHash(), record);
                }
            }
            /**
             * 트리를 축소한다.
             *
             * @param {number[]} treeIndex - 축호할 아이탬(행) 인덱스
             */
            collapseRow(treeIndex) {
                const $row = this.$getRow(treeIndex);
                if ($row === null || $row.hasClass('edge') == true)
                    return;
                $row.removeClass('expanded');
                const record = $row.getData('record');
                const depth = record.getParents().length;
                if (this.expandedRows.has(depth) == false) {
                    return;
                }
                this.expandedRows.get(depth).delete(record.getHash());
            }
            /**
             * 트리를 토글한다.
             *
             * @param {number[]} treeIndex - 토글할 아이탬(행) 인덱스
             */
            toggleRow(treeIndex) {
                const $row = this.$getRow(treeIndex);
                if ($row === null || $row.hasClass('edge') == true)
                    return;
                if ($row.hasClass('expanded') == true) {
                    this.collapseRow(treeIndex);
                }
                else {
                    this.expandRow(treeIndex);
                }
            }
            /**
             * 전체 아이탬(행)을 확장한다.
             *
             * @param {number|boolean} depth - 확장할 깊이 (true인 경우 전체를 확장한다.)
             */
            async expandAll(depth, parents = []) {
                if (depth === false || (depth !== true && parents.length > depth)) {
                    return;
                }
                if (parents.length == 0) {
                    for (let i = 0; i < this.getStore().getCount(); i++) {
                        await this.expandAll(depth, [i]);
                    }
                }
                else {
                    const record = this.getStore().get(parents);
                    if (record.hasChild() == true) {
                        await this.expandRow(parents);
                        for (let i = 0, loop = record.getChildren().length; i < loop; i++) {
                            await this.expandAll(depth, [...parents, i]);
                        }
                    }
                }
            }
            /**
             * 단일 아이템을 항상 선택한다.
             *
             * @param {Aui.Data.Record|Object} record - 선택할 레코드
             */
            select(record) {
                const treeIndex = this.getStore().matchIndex(record);
                if (treeIndex === null)
                    return;
                if (this.isRowSelected(treeIndex) == true) {
                    if (this.selections.size !== 1) {
                        this.deselectAll(false);
                        this.selectRow(treeIndex);
                    }
                    else {
                        this.focusRow(treeIndex);
                    }
                }
                else {
                    this.selectRow(treeIndex);
                }
            }
            /**
             * 아이템을 선택한다.
             *
             * @param {number[]} treeIndex - 아이탬(행) 인덱스
             * @param {boolean} is_multiple - 다중선택여부
             * @param {boolean} is_event - 이벤트 발생여부
             */
            selectRow(treeIndex, is_multiple = false, is_event = true) {
                if (treeIndex === null || this.selection.selectable == false)
                    return;
                const $row = this.$getRow(treeIndex);
                if ($row === null)
                    return;
                if (this.isRowSelected(treeIndex) == true)
                    return;
                if (this.selection.multiple == false || is_multiple == false) {
                    this.deselectAll(false);
                }
                const record = $row.getData('record');
                this.selections.set(record.getHash(), record);
                this.expandRow(treeIndex.slice(0, -1)).then(() => {
                    Html.get('> div[data-role=leaf]', $row).addClass('selected');
                    this.focusRow(treeIndex);
                    if (is_event == true) {
                        this.onSelectionChange();
                    }
                });
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
                /*
                for (let i = 0, loop = this.getStore().getCount(); i < loop; i++) {
                    this.selectRow(i, true, false);
                }
                */
                if (is_event == true) {
                    this.onSelectionChange();
                }
            }
            /**
             * 아이템을 선택해제한다.
             *
             * @param {number[]} treeIndex - 아이탬(행) 인덱스
             * @param {boolean} is_event - 이벤트 발생여부
             */
            deselectRow(treeIndex, is_event = true) {
                if (treeIndex === null)
                    return;
                const $row = this.$getRow(treeIndex);
                if ($row === null)
                    return;
                if (this.isRowSelected(treeIndex) == true) {
                    const record = $row.getData('record');
                    this.selections.delete(record.getHash());
                    Html.get('> div[data-role=leaf]', $row).removeClass('selected');
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
                        this.selections.forEach((record) => {
                            const treeIndex = this.getStore().matchIndex(record);
                            if (treeIndex !== null) {
                                this.deselectRow(treeIndex, false);
                            }
                        });
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
                    Html.all('div[data-role=leaf]', this.$getBody()).removeClass('selected');
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
                        const treeIndex = this.getStore().matchIndex(selection);
                        if (treeIndex !== null) {
                            const $row = this.$getRow(treeIndex);
                            if ($row !== null) {
                                Html.get('> div[data-role=leaf]', $row).addClass('selected');
                            }
                        }
                    }
                }
            }
            /**
             * 데이터가 변경되거나 다시 로딩되었을 때 이전 확장아이템이 있다면 복구한다.
             */
            async restoreExpandedRows() {
                if (this.expandedRows.size > 0) {
                    let depth = 0;
                    while (true) {
                        if (this.expandedRows.has(depth) == false) {
                            return;
                        }
                        for (const expandedRow of this.expandedRows.get(depth).values()) {
                            const treeIndex = this.getStore().matchIndex(expandedRow);
                            if (treeIndex !== null) {
                                await this.expandRow(treeIndex);
                            }
                        }
                        depth++;
                    }
                }
                else {
                    if (this.expandedDepth !== false) {
                        await this.expandAll(this.expandedDepth);
                    }
                }
            }
            /**
             * 선택항목이 변경되었을 때 이벤트를 처리한다.
             */
            onSelectionChange() {
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
             * @param {Aui.Tree.Column} column - 업데이트할 컬럼
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
             * @param {Aui.Tree.Column} column - 업데이트할 컬럼
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
             * 트리 우측의 빈컬럼 스타일을 갱신한다.
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
             * 트리패널 레이아웃을 갱신한다.
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
                    if (header instanceof Aui.Tree.Column) {
                        const $header = Html.get('div[data-component=' + id + ']', this.$header);
                        $header.setStyle('width', header.getChildrenFlexBasis() + 'px');
                        $header.setStyle('flexGrow', header.getChildrenFlexGrow());
                        $header.setStyle('flexBasis', header.getChildrenFlexBasis() + 'px');
                    }
                });
                this.updateColumnFill();
            }
            /**
             * 트리 고정컬럼 영역을 설정한다.
             *
             * @param {number} columnIndex - 고정될 컬럼 인덱스
             */
            setFreezeColumn(columnIndex) {
                Html.all('div[data-role].sticky', this.$header).forEach(($header) => {
                    $header.removeClass('sticky', 'end');
                    $header.setStyle('left', '');
                });
                Html.all('div[data-role=column].sticky', this.$body).forEach(($header) => {
                    $header.removeClass('sticky', 'end');
                    $header.setStyle('left', '');
                });
                this.freeze = Math.min(this.headers.length - 1, columnIndex);
                this.freezeColumn = 0;
                this.freezeWidth = 0;
                if (columnIndex > 0) {
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
             * 트리패널의 아이탬(행) DOM 을 생성하거나 가져온다.
             *
             * @param {number[]} treeIndex - 생성하거나 가져올 트리 인덱스
             * @param {Aui.Data.Record} record - 행 데이터 (데이터가 NULL 이 아닌 경우 DOM 을 생성한다.)
             */
            $getRow(treeIndex, record = null) {
                if (record === null) {
                    let $parent = this.$getBody();
                    for (const rowIndex of treeIndex) {
                        const $tree = Html.get('> div[data-role=tree]', $parent);
                        if ($tree.getEl() === null) {
                            return null;
                        }
                        $parent = Html.all('> div[data-role=row]', $tree).get(rowIndex);
                        if ($parent === null) {
                            return null;
                        }
                    }
                    return $parent;
                }
                else {
                    const rowIndex = treeIndex.at(-1);
                    let leftPosition = 0;
                    const $row = Html.create('div')
                        .setData('role', 'row')
                        .setData('tree', treeIndex)
                        .setData('index', rowIndex)
                        .setData('record', record, false);
                    const $leaf = Html.create('div', { 'data-role': 'leaf' });
                    this.getColumns().forEach((column, columnIndex) => {
                        const value = record.get(column.dataIndex);
                        const $column = column.$getBody(value, record, treeIndex, columnIndex);
                        $leaf.append($column);
                        if (columnIndex < this.freezeColumn) {
                            $column.addClass('sticky');
                            $column.setStyle('left', leftPosition + 'px');
                            leftPosition += column.getMinWidth() + 1;
                            if (columnIndex == this.freezeColumn - 1) {
                                $column.addClass('end');
                            }
                        }
                    });
                    $leaf.prepend(Html.create('div', { 'data-column-type': 'fill' }));
                    $leaf.on('click', (e) => {
                        if (this.selection.selectable == true) {
                            if (this.selection.display == 'check') {
                                this.deselectAll(false);
                                this.selectRow(treeIndex, false);
                            }
                            else if (this.selection.deselectable == true && this.isRowSelected(treeIndex) == true) {
                                this.deselectRow(treeIndex);
                            }
                            else {
                                this.selectRow(treeIndex, e.metaKey == true || e.ctrlKey == true);
                            }
                            this.onSelectionComplete();
                        }
                    });
                    $leaf.on('dblclick', (e) => {
                        if (e.button === 0) {
                            this.openItem(treeIndex);
                        }
                    });
                    $leaf.on('contextmenu', (e) => {
                        if (this.isRowSelected(treeIndex) == true) {
                            if (this.getSelections().length == 1 || this.selection.multiple == false) {
                                this.openMenu(treeIndex, e);
                            }
                            else {
                                this.openMenus(e);
                            }
                        }
                        else {
                            this.openMenu(treeIndex, e);
                        }
                        e.preventDefault();
                    });
                    $leaf.on('longpress', (e) => {
                        Aui.Menu.pointerEvent = e;
                        this.openMenu(treeIndex, e);
                        e.preventDefault();
                    });
                    $row.append($leaf);
                    if (record.hasChild() == true) {
                        const $tree = Html.create('div', { 'data-role': 'tree' });
                        $row.append($tree);
                        record.getChildren().forEach((child, childIndex) => {
                            $tree.append(this.$getRow([...treeIndex, childIndex], child));
                        });
                        $row.addClass('expandable');
                        if (this.autoExpand == true && record.getChildren().length > 0) {
                            $row.addClass('expanded');
                        }
                    }
                    else {
                        $row.addClass('edge');
                    }
                    return $row;
                }
            }
            /**
             * 트리패널의 헤더(제목행)을 데이터에 따라 업데이트한다.
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
            }
            /**
             * 트리패널의 헤더(제목행)를 랜더링한다.
             */
            renderHeader() {
                let leftPosition = 0;
                this.freezeColumn = 0;
                this.headers.forEach((header, headerIndex) => {
                    const $header = header.$getHeader();
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
             * 트리패널의 바디(데이터행)를 랜더링한다.
             */
            renderBody() {
                this.$body.empty();
                const $tree = Html.create('div', { 'data-role': 'tree' });
                this.getStore()
                    .getRecords()
                    .forEach((record, rowIndex) => {
                    const $row = this.$getRow([rowIndex], record);
                    $tree.append($row);
                });
                this.$body.append($tree);
                if (this.columnLines == true) {
                    this.$body.addClass('column-lines');
                }
                if (this.rowLines == true) {
                    this.$body.addClass('row-lines');
                }
            }
            /**
             * 트리패널의 푸터(합계행)를 핸더링한다.
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
             * 트리패널이 화면상에 출력되었을 때 이벤트를 처리한다.
             */
            onRender() {
                super.onRender();
                this.updateHeader();
                if (this.autoLoad === true) {
                    this.getStore().load();
                }
                this.$getComponent().on('keydown', (e) => {
                    if (e.target instanceof HTMLInputElement) {
                        return;
                    }
                    if (e.key.indexOf('Arrow') === 0) {
                        let treeIndex = null;
                        let columnIndex = null;
                        switch (e.key) {
                            case 'ArrowLeft':
                                treeIndex = this.focusedCell.treeIndex ?? [0];
                                columnIndex = Math.max(0, (this.focusedCell.columnIndex ?? 0) - 1);
                                while (columnIndex > 0 && this.getColumnByIndex(columnIndex).isHidden() == true) {
                                    columnIndex--;
                                }
                                break;
                            case 'ArrowRight':
                                treeIndex = this.focusedCell.treeIndex ?? [0];
                                columnIndex = Math.min(this.getColumns().length - 1, (this.focusedCell.columnIndex ?? 0) + 1);
                                while (columnIndex < this.getColumns().length - 1 &&
                                    this.getColumnByIndex(columnIndex).isHidden() == true) {
                                    columnIndex++;
                                }
                                break;
                            case 'ArrowUp': {
                                columnIndex = this.focusedCell.columnIndex ?? 0;
                                if (this.focusedCell.treeIndex === null) {
                                    treeIndex = [0];
                                    break;
                                }
                                const $row = this.$getRow(this.focusedCell.treeIndex);
                                if ($row == null) {
                                    treeIndex = [0];
                                    break;
                                }
                                const $leaf = Html.get('> div[data-role=leaf]', $row);
                                const $leafs = Html.all('div[data-role=leaf]', this.$getBody());
                                let matched = false;
                                $leafs.some(($e) => {
                                    if ($e.isSame($leaf) == true) {
                                        return true;
                                    }
                                    if (this.isRowVisible($e.getParent().getData('tree')) == true) {
                                        matched = true;
                                        treeIndex = $e.getParent().getData('tree');
                                    }
                                });
                                if (matched === false) {
                                    treeIndex = [0];
                                }
                                break;
                            }
                            case 'ArrowDown': {
                                columnIndex = this.focusedCell.columnIndex ?? 0;
                                if (this.focusedCell.treeIndex === null) {
                                    treeIndex = [0];
                                    break;
                                }
                                const $row = this.$getRow(this.focusedCell.treeIndex);
                                if ($row == null) {
                                    treeIndex = [0];
                                    break;
                                }
                                const $leaf = Html.get('> div[data-role=leaf]', $row);
                                const $leafs = Html.all('div[data-role=leaf]', this.$getBody());
                                let matched = false;
                                $leafs.some(($e) => {
                                    if (matched == true) {
                                        if (this.isRowVisible($e.getParent().getData('tree')) == true) {
                                            treeIndex = $e.getParent().getData('tree');
                                            return true;
                                        }
                                    }
                                    else if ($e.isSame($leaf) == true) {
                                        matched = true;
                                    }
                                });
                                break;
                            }
                        }
                        if (treeIndex !== null && columnIndex !== null) {
                            this.focusCell(treeIndex, columnIndex);
                        }
                        e.preventDefault();
                    }
                    if (e.key == ' ' || e.key == 'Enter') {
                        if (this.focusedRow !== null) {
                            this.selectRow(this.focusedRow);
                            this.onSelectionComplete();
                        }
                        if (e.key == ' ' && this.focusedCell.columnIndex === 0) {
                            this.toggleRow(this.focusedCell.treeIndex);
                        }
                    }
                });
                this.$getComponent().on('blur', () => {
                    this.blurCell();
                });
                /**
                 * @todo 고민필요
                 *
                this.$getComponent().on('copy', (e: ClipboardEvent) => {
                    if (this.focusedCell.treeIndex !== null && this.focusedCell.columnIndex !== null) {
                        const $column = Html.get(
                            'div[data-role=column][data-row="' +
                                this.focusedCell.treeIndex +
                                '"][data-column="' +
                                this.focusedCell.columnIndex +
                                '"]',
                            this.$body
                        );
                        if ($column == null) return;

                        navigator.clipboard.writeText($column.getData('value'));
                    }

                    e.preventDefault();
                    e.stopImmediatePropagation();
                });
                */
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
                this.loading.hide();
                this.fireEvent('load', [this, this.getStore()]);
            }
            /**
             * 데이터가 변경되었을 때 이벤트를 처리한다.
             */
            onUpdate() {
                this.focusedCell = { treeIndex: null, columnIndex: null };
                this.renderBody();
                this.updateHeader();
                this.restoreExpandedRows().then(() => {
                    this.restoreSelections();
                });
                this.fireEvent('update', [this, this.getStore()]);
            }
            /**
             * 자식데이터가 변경되었을 때 이벤트를 처리한다.
             *
             * @param {Aui.Data.Record} record
             */
            onUpdateChildren(record) {
                const treeIndex = this.getStore().matchIndex(record);
                if (treeIndex == null) {
                    return;
                }
                const $row = this.$getRow(treeIndex);
                if (record.hasChild() == true) {
                    const $tree = Html.get('div[data-role=tree]', $row);
                    $tree.empty();
                    record.getChildren().forEach((child, childIndex) => {
                        $tree.append(this.$getRow([...treeIndex, childIndex], child));
                    });
                    $row.addClass('expandable');
                }
                else {
                    if (Html.get('div[data-role=tree]', $row).getEl() !== null) {
                        Html.get('div[data-role=tree]', $row).remove();
                    }
                    $row.addClass('edge');
                }
            }
            /**
             * 셀 포커스가 이동되었을 때 이벤트를 처리한다.
             *
             * @param {number[]} treeIndex - 트리 인덱스
             * @param {number} columnIndex - 열 인덱스
             */
            onFocusMove(treeIndex, columnIndex) {
                const record = this.$getRow(treeIndex).getData('record');
                this.fireEvent('focusMove', [
                    treeIndex,
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
                if (this.focusedCell.treeIndex !== null && this.focusedCell.columnIndex !== null) {
                    const $column = Html.get('div[data-role=column][data-row="' +
                        this.focusedCell.treeIndex +
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
             * 트리 패널을 제거한다.
             */
            remove() {
                this.store.remove();
                this.loading.close();
                this.headers.forEach((header) => {
                    header.remove();
                });
                this.columns.forEach((column) => {
                    column.remove();
                });
                super.remove();
            }
        }
        Tree.Panel = Panel;
        class Column extends Aui.Base {
            tree;
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
            textWrap;
            textAlign;
            textVerticalAlign;
            columns;
            resizer;
            renderer;
            /**
             * 트리패널 컬럼객체를 생성한다.
             *
             * @param {Aui.Tree.Column.Properties} properties - 객체설정
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
                this.columns = [];
                this.renderer = this.properties.renderer ?? null;
                for (let column of properties?.columns ?? []) {
                    if (!(column instanceof Aui.Tree.Column)) {
                        column = new Aui.Tree.Column(column);
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
             * @return {Aui.Tree.Column[]} columns
             */
            getChildren() {
                return this.columns;
            }
            /**
             * 트리패널을 지정한다.
             *
             * @param {Aui.Tree.Panel} tree - 트리패널
             */
            setTree(tree) {
                this.tree = tree;
                this.columns.forEach((column) => {
                    column.setTree(tree);
                });
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
             * @param {Aui.Tree.Column} parent - 트리헤더 그룹컬럼
             */
            setParent(parent) {
                this.parent = parent;
            }
            /**
             * 컬럼이 그룹화되어 있다면 그룹헤더를 가져온다.
             *
             * @return {Aui.Tree.Column} parent
             */
            getParent() {
                return this.parent;
            }
            /**
             * 트리패널을 가져온다.
             *
             * @return {Aui.Tree.Panel} tree
             */
            getTree() {
                return this.tree;
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
             * @return {Aui.Tree.Column[]} columns
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
                this.tree.updateLayout();
            }
            /**
             * 컬럼의 숨김여부를 변경한다.
             *
             * @param {boolean} hidden - 숨김여부
             */
            setHidden(hidden) {
                this.hidden = hidden;
                this.tree.updateLayout();
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
                if (this.getTree().columnResizable === false) {
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
                return this.tree.freezeColumn > this.columnIndex;
            }
            /**
             * 컬럼의 헤더컬럼 레이아웃을 가져온다.
             *
             * @return {Dom} $layout
             */
            $getHeader() {
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
                    for (let child of this.getChildren()) {
                        $children.append(child.$getHeader());
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
                    $header.addClass(this.headerVerticalAlign);
                    const $label = Html.create('label');
                    $label.addClass(this.headerAlign);
                    $label.html(this.text);
                    if (this.sortable !== false) {
                        const $sorter = Html.create('i', { 'data-role': 'sorter' });
                        $label.prepend($sorter);
                        $label.on('click', () => {
                            const field = typeof this.sortable === 'string' ? this.sortable : this.dataIndex;
                            const sorters = this.getTree().getStore().getSorters() ?? {};
                            const direction = (sorters[field] ?? 'DESC') == 'DESC' ? 'ASC' : 'DESC';
                            if (Object.keys(sorters).length > 1) {
                                // @todo multisort 여부 확인
                                sorters[field] = direction;
                                this.getTree().getStore().multiSort(sorters);
                            }
                            else {
                                this.getTree().getStore().sort(field, direction);
                            }
                        });
                    }
                    $label.setData('sortable', this.sortable);
                    $label.setData('dataindex', this.dataIndex);
                    $header.append($label);
                    const $button = Html.create('button', { 'type': 'button', 'data-role': 'header-menu' });
                    $header.append($button);
                }
                if (this.isHidden() == true) {
                    $header.setStyle('display', 'none');
                }
                if (this.isResizable() == true) {
                    this.resizer = new Aui.Resizer($header, this.tree.$content, {
                        directions: [false, true, false, false],
                        minWidth: 50,
                        maxWidth: 900,
                        listeners: {
                            mouseenter: () => {
                                this.tree.$getHeader().addClass('locked');
                            },
                            mouseleave: () => {
                                this.tree.$getHeader().removeClass('locked');
                            },
                            start: () => {
                                this.tree.$getHeader().addClass('resizing');
                                this.tree.getScroll().setScrollable(false);
                            },
                            resize: (_$target, rect, position) => {
                                this.tree.$getHeader().addClass('locked');
                                /**
                                 * 트리 패널 우측으로 벗어났을 경우, 트리패널을 우측으로 스크롤한다.
                                 */
                                const offset = this.tree.$content.getOffset();
                                const width = this.tree.$content.getOuterWidth();
                                const scroll = this.tree.getScroll().getPosition();
                                const x = Math.max(0, position.x);
                                if (x > offset.left + width - 15) {
                                    if (rect.right < width + scroll.x - 50) {
                                        this.tree.getScroll().setAutoScroll(0, 0);
                                    }
                                    else {
                                        const speed = Math.min(Math.ceil((x - (offset.left + width - 15)) / 30), 15);
                                        this.tree.getScroll().setAutoScroll(speed, 0);
                                    }
                                }
                                else if (this.isFreezeColumn() == false &&
                                    x < offset.left + this.tree.freezeWidth + 15) {
                                    if (rect.left > this.tree.freezeWidth + scroll.x + 50) {
                                        this.tree.getScroll().setAutoScroll(0, 0);
                                    }
                                    else {
                                        const speed = Math.max(Math.floor((x - (offset.left + this.tree.freezeWidth - 15)) / 30), -15);
                                        this.tree.getScroll().setAutoScroll(speed, 0);
                                    }
                                }
                                else {
                                    this.tree.getScroll().setAutoScroll(0, 0);
                                }
                            },
                            end: (_$target, rect) => {
                                this.setWidth(rect.width);
                                this.tree.getScroll().setAutoScroll(0, 0);
                                this.tree.getScroll().setScrollable(this.tree.scrollable);
                                this.tree.$getHeader().removeClass('locked');
                                this.tree.$getHeader().removeClass('resizing');
                            },
                        },
                    });
                }
                return $header;
            }
            /**
             * 컬럼의 데이터컬럼 레이아웃을 가져온다.
             *
             * @param {any} value - 컬럼의 dataIndex 데이터
             * @param {Aui.Data.Record} record - 컬럼이 속한 행의 모든 데이터셋
             * @param {number[]} treeIndex - 행 인덱스
             * @param {number} columnIndex - 열 인덱스
             * @return {Dom} $layout
             */
            $getBody(value, record, treeIndex, columnIndex) {
                const rowIndex = treeIndex.at(-1);
                const $column = Html.create('div')
                    .setData('role', 'column')
                    .setData('tree', treeIndex, false)
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
                $column.on('pointerdown', (e) => {
                    const $column = Html.el(e.currentTarget);
                    this.tree.focusCell($column.getData('tree'), $column.getData('column'));
                });
                if (columnIndex == 0) {
                    $column.addClass('header');
                    for (let i = 0, loop = treeIndex.length - 1; i < loop; i++) {
                        $column.append(Html.create('div', { 'data-role': 'depth' }));
                    }
                    const $toggle = Html.create('div', { 'data-role': 'toggle' });
                    const $button = Html.create('button', { type: 'button' });
                    $button.on('click', (e) => {
                        this.getTree().toggleRow(treeIndex);
                        this.getTree().focusCell(treeIndex, 0);
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    });
                    $button.on('dblclick', (e) => {
                        e.stopImmediatePropagation();
                    });
                    $toggle.append($button);
                    $column.append($toggle);
                    if (this.tree.selection.display == 'check') {
                        const $check = Html.create('div', { 'data-role': 'check' });
                        const $button = Html.create('button', { type: 'button' });
                        $button.on('click', (e) => {
                            if (this.getTree().isRowSelected(treeIndex) == true) {
                                this.getTree().deselectRow(treeIndex);
                            }
                            else {
                                this.getTree().selectRow(treeIndex, true);
                            }
                            e.stopImmediatePropagation();
                        });
                        $check.append($button);
                        $column.append($check);
                    }
                }
                const $view = Html.create('div').setData('role', 'view');
                if (this.renderer !== null) {
                    $view.html(this.renderer(value, record, $column, rowIndex, columnIndex, this, this.getTree()));
                }
                else {
                    $view.html(value);
                }
                $column.append($view);
                if (this.isHidden() == true) {
                    $column.setStyle('display', 'none');
                }
                return $column;
            }
        }
        Tree.Column = Column;
        class Check extends Aui.Tree.Column {
            /**
             * 트리패널 컬럼객체를 생성한다.
             *
             * @param {Aui.Tree.Column.Properties} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                if (this.dataIndex == '@') {
                    this.width = 34;
                    this.minWidth = null;
                }
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
                if (this.dataIndex == '@') {
                    const $header = Html.create('div').setData('component', this.id);
                    $header.setData('role', 'column');
                    $header.addClass('check');
                    $header.setStyle('width', this.width + 'px');
                    const $label = Html.create('label');
                    $header.append($label);
                    $header.on('click', (e) => {
                        if ($header.hasClass('checked') == true) {
                            this.getTree().deselectAll();
                        }
                        else {
                            this.getTree().selectAll();
                        }
                        e.stopImmediatePropagation();
                    });
                    this.getTree().addEvent('update', (tree) => {
                        const rows = Html.all('> div[data-role=row]', tree.$getBody());
                        const selected = Html.all('> div[data-role=row].selected', tree.$getBody());
                        if (rows.getCount() > 0 && rows.getCount() == selected.getCount()) {
                            $header.addClass('checked');
                        }
                        else {
                            $header.removeClass('checked');
                        }
                    });
                    this.getTree().addEvent('selectionChange', (_selections, tree) => {
                        const rows = Html.all('> div[data-role=row]', tree.$getBody());
                        const selected = Html.all('> div[data-role=row].selected', tree.$getBody());
                        if (rows.getCount() > 0 && rows.getCount() == selected.getCount()) {
                            $header.addClass('checked');
                        }
                        else {
                            $header.removeClass('checked');
                        }
                    });
                    return $header;
                }
                else {
                    return super.$getHeader();
                }
            }
            /**
             * 컬럼의 데이터컬럼 레이아웃을 가져온다.
             *
             * @param {any} value - 컬럼의 dataIndex 데이터
             * @param {Aui.Data.Record} record - 컬럼이 속한 행의 모든 데이터셋
             * @param {number[]} treeIndex - 행 인덱스
             * @param {number} columnIndex - 열 인덱스
             * @return {Dom} $layout
             */
            $getBody(value, record, treeIndex, columnIndex) {
                const rowIndex = treeIndex.at(-1);
                const $column = Html.create('div')
                    .setData('role', 'column')
                    .setData('tree', treeIndex, false)
                    .setData('row', rowIndex)
                    .setData('column', columnIndex)
                    .setData('record', record, false)
                    .setData('value', value, false);
                $column.addClass('check');
                if (this.dataIndex == '@') {
                    $column.addClass('selection');
                }
                else {
                    if (value == true) {
                        $column.addClass('checked');
                    }
                }
                $column.setStyle('width', this.width + 'px');
                $column.on('click', (e) => {
                    if (this.dataIndex == '@') {
                        if (this.getTree().isRowSelected(treeIndex) == true) {
                            this.getTree().deselectRow(treeIndex);
                        }
                        else {
                            this.getTree().selectRow(treeIndex, true);
                        }
                    }
                    e.stopImmediatePropagation();
                });
                const $label = Html.create('label');
                $label.addClass(this.headerAlign);
                $column.append($label);
                return $column;
            }
        }
        Tree.Check = Check;
        class Renderer {
            static Date(format = 'YYYY.MM.DD(dd)') {
                return (value) => {
                    return value === null
                        ? ''
                        : '<time>' + moment.unix(value).locale(Aui.getLanguage()).format(format) + '</time>';
                };
            }
            static DateTime(format = 'YYYY.MM.DD(dd) HH:mm') {
                return Aui.Tree.Renderer.Date(format);
            }
            static Number() {
                return (value, _record, $dom) => {
                    $dom.setStyle('text-align', 'right');
                    return Format.number(value, Aui.getLanguage());
                };
            }
        }
        Tree.Renderer = Renderer;
        class Pagination extends Aui.Toolbar {
            tree = null;
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
             * @param {Aui.Component[]} items - 추가 툴바 아이템
             */
            constructor(items = []) {
                super(items);
            }
            /**
             * 부모객체를 지정한다.
             *
             * @param {Aui.Tree.Panel} tree - 트리패널
             * @return {Aui.Tree.Pagination} this
             */
            setParent(tree) {
                if (tree instanceof Aui.Tree.Panel) {
                    super.setParent(tree);
                    this.tree = tree;
                    this.store = this.tree.getStore();
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
                        iconClass: 'mi mi-angle-start',
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
                        iconClass: 'mi mi-angle-end',
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
                        minValue: 1,
                        width: 50,
                        spinner: false,
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
                    if (this.tree !== null) {
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
        Tree.Pagination = Pagination;
    })(Tree = Aui.Tree || (Aui.Tree = {}));
})(Aui || (Aui = {}));
