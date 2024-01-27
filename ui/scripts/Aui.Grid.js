/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 그리드패널 클래스를 정의한다.
 *
 * @file /scripts/Aui.Grid.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 27.
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
            loading;
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
                this.selection.multiple = this.selection.multiple ?? false;
                this.selection.deselectable = this.selection.deselectable ?? false;
                this.selection.keepable = this.selection.keepable ?? false;
                if (this.selection.display == 'check') {
                    this.selection.multiple = true;
                    this.selection.deselectable = true;
                    this.freeze = this.freeze + 1;
                }
                this.store = this.properties.store ?? new Aui.Store();
                this.store.addEvent('beforeLoad', () => {
                    this.onBeforeLoad();
                });
                this.store.addEvent('load', () => {
                    this.onLoad();
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
                    message: this.properties.loadingText ?? null,
                });
            }
            /**
             * 그리드패널 헤더의 하위 컴포넌트를 초기화한다.
             */
            initColumns() {
                this.headers = [];
                this.columns = [];
                if (this.selection.display == 'check') {
                    const check = new Aui.Grid.Check({
                        dataIndex: '@',
                    });
                    check.setGrid(this);
                    this.headers.push(check);
                    this.columns.push(check);
                }
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
                const $column = Html.get('div[data-role=column][data-row="' + rowIndex + '"][data-column="' + columnIndex + '"]', this.$body);
                if ($column.getEl() == null)
                    return;
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
                this.blurRow();
                this.focusedCell.rowIndex = null;
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
                    if (this.selections.size != 1) {
                        this.deselectAll(false);
                        this.selectRow(rowIndex);
                    }
                }
                else {
                    this.selectRow(rowIndex);
                }
            }
            /**
             * 아이템을 선택한다.
             *
             * @param {number} index - 아이탬(행) 인덱스
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
                    this.deselectAll(false);
                }
                const record = $row.getData('record');
                this.selections.set(record.getHash(), record);
                $row.addClass('selected');
                if (is_event == true) {
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
                    let leftPosition = 0;
                    const $row = Html.create('div')
                        .setData('role', 'row')
                        .setData('index', rowIndex)
                        .setData('record', record, false);
                    this.getColumns().forEach((column, columnIndex) => {
                        const value = record.get(column.dataIndex);
                        const $column = column.$getBody(value, record, rowIndex, columnIndex);
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
                                    this.deselectAll(false);
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
            }
            /**
             * 그리드패널의 헤더(제목행)를 랜더링한다.
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
                this.getScroll().setTrackPosition('y', this.$header.getHeight() + 1);
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
                    if (e.target instanceof HTMLInputElement) {
                        return;
                    }
                    if (e.key.indexOf('Arrow') === 0) {
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
                    }
                    if (e.key == ' ' || e.key == 'Enter') {
                        if (this.focusedRow !== null) {
                            this.selectRow(this.focusedRow);
                            this.onSelectionComplete();
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
                    if (this.focusedCell.rowIndex !== null && this.focusedCell.columnIndex !== null) {
                        const $column = Html.get(
                            'div[data-role=column][data-row="' +
                                this.focusedCell.rowIndex +
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
                this.loading.hide();
                this.fireEvent('load', [this, this.getStore()]);
            }
            /**
             * 데이터가 변경되었을 때 이벤트를 처리한다.
             */
            onUpdate() {
                this.focusedCell = { rowIndex: null, columnIndex: null };
                this.renderBody();
                this.restoreSelections();
                this.updateHeader();
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
                    header.remove();
                });
                this.columns.forEach((column) => {
                    column.remove();
                });
                super.remove();
            }
        }
        Grid.Panel = Panel;
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
            textWrap;
            textAlign;
            textVerticalAlign;
            columns;
            resizer;
            renderer;
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
                this.columns = [];
                this.renderer = this.properties.renderer ?? null;
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
                    $header.append($label);
                    const $button = Html.create('button', { 'type': 'button', 'data-role': 'header-menu' });
                    $header.append($button);
                }
                if (this.isHidden() == true) {
                    $header.setStyle('display', 'none');
                }
                if (this.isResizable() == true) {
                    this.resizer = new Aui.Resizer($header, this.grid.$content, {
                        directions: [false, true, false, false],
                        minWidth: 50,
                        maxWidth: 900,
                        listeners: {
                            mouseenter: () => {
                                this.grid.$getHeader().addClass('locked');
                            },
                            mouseleave: () => {
                                this.grid.$getHeader().removeClass('locked');
                            },
                            start: () => {
                                this.grid.$getHeader().addClass('resizing');
                                this.grid.getScroll().setScrollable(false);
                            },
                            resize: (_$target, rect, position) => {
                                this.grid.$getHeader().addClass('locked');
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
                return $header;
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
                $column.on('pointerdown', (e) => {
                    const $column = Html.el(e.currentTarget);
                    if (e.shiftKey == true && this.grid.selection.multiple == true && this.grid.focusedRow !== null) {
                        this.grid.selectRange(this.grid.focusedRow, $column.getData('row'));
                    }
                    this.grid.focusCell($column.getData('row'), $column.getData('column'));
                });
                $column.on('click', (e) => {
                    const $column = Html.el(e.currentTarget);
                    if (e.shiftKey == true &&
                        this.grid.selection.multiple == true &&
                        this.grid.focusedRow == $column.getData('row')) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                });
                const $view = Html.create('div').setData('role', 'view');
                if (this.renderer !== null) {
                    $view.html(this.renderer(value, record, $column, rowIndex, columnIndex, this, this.getGrid()));
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
        Grid.Column = Column;
        class Check extends Aui.Grid.Column {
            /**
             * 그리드패널 컬럼객체를 생성한다.
             *
             * @param {Aui.Grid.Column.Properties} properties - 객체설정
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
                    const $button = Html.create('button');
                    $header.append($button);
                    $header.on('click', (e) => {
                        if ($header.hasClass('checked') == true) {
                            this.getGrid().deselectAll();
                        }
                        else {
                            this.getGrid().selectAll();
                        }
                        e.stopImmediatePropagation();
                    });
                    this.getGrid().addEvent('update', (grid) => {
                        const rows = Html.all('> div[data-role=row]', grid.$getBody());
                        const selected = Html.all('> div[data-role=row].selected', grid.$getBody());
                        if (rows.getCount() > 0 && rows.getCount() == selected.getCount()) {
                            $header.addClass('checked');
                        }
                        else {
                            $header.removeClass('checked');
                        }
                    });
                    this.getGrid().addEvent('selectionChange', (_selections, grid) => {
                        const rows = Html.all('> div[data-role=row]', grid.$getBody());
                        const selected = Html.all('> div[data-role=row].selected', grid.$getBody());
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
                        if (this.getGrid().isRowSelected(rowIndex) == true) {
                            this.getGrid().deselectRow(rowIndex);
                        }
                        else {
                            this.getGrid().selectRow(rowIndex, true);
                        }
                    }
                    e.stopImmediatePropagation();
                });
                const $button = Html.create('button');
                $button.addClass(this.headerAlign);
                $column.append($button);
                return $column;
            }
        }
        Grid.Check = Check;
        class Renderer {
            static Date(format = 'YYYY.MM.DD(dd)') {
                return (value) => {
                    return value === null
                        ? ''
                        : '<time>' + moment.unix(value).locale(Aui.getLanguage()).format(format) + '</time>';
                };
            }
            static DateTime(format = 'YYYY.MM.DD(dd) HH:mm') {
                return Aui.Grid.Renderer.Date(format);
            }
            static Number() {
                return (value, _record, $dom) => {
                    $dom.setStyle('text-align', 'right');
                    return Format.number(value, Aui.getLanguage());
                };
            }
        }
        Grid.Renderer = Renderer;
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
