/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그리드패널 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Grid.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 2. 26.
 */
var Admin;
(function (Admin) {
    let Grid;
    (function (Grid) {
        class Panel extends Admin.Panel {
            type = 'panel';
            role = 'grid';
            headers;
            columns;
            freeze;
            freezeColumn;
            freezeWidth;
            columnResizable;
            store;
            $header;
            $body;
            $footer;
            focusedCell = { rowIndex: null, columnIndex: null };
            /**
             * 그리드패널을 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.freeze = this.properties.freeze ?? 0;
                this.scrollable = this.properties.scrollable ?? true;
                this.columnResizable = this.properties.columnResizable !== false;
                this.store = this.properties.store ?? new Admin.Store();
                this.store.addEvent('beforeLoad', () => {
                    this.onBeforeLoad();
                });
                this.store.addEvent('load', () => {
                    this.onLoad();
                });
                this.store.addEvent('update', () => {
                    this.onUpdate();
                });
                this.initColumns();
                this.$header = Html.create('div').setData('role', 'header');
                this.$body = Html.create('div').setData('role', 'body');
                this.$footer = Html.create('div').setData('role', 'footer');
            }
            /**
             * 그리드패널 헤더의 하위 컴포넌트를 초기화한다.
             */
            initColumns() {
                this.headers = [];
                this.columns = [];
                for (let column of this.properties.columns ?? []) {
                    if (!(column instanceof Admin.Grid.Column)) {
                        column = new Admin.Grid.Column(column);
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
             * @return {Admin.Store} store
             */
            getStore() {
                return this.store;
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
                this.getScrollbar().setTrackPosition('x', leftPosition ? leftPosition + 1 : 0);
                this.getScrollbar().setTrackPosition('y', this.$header.getHeight() + 1);
                this.updateColumnIndex();
                this.updateColumnFill();
            }
            /**
             * 그리드패널의 바디(데이터행)를 랜더링한다.
             */
            renderBody() {
                this.$body.empty();
                this.getStore()
                    .getRecords()
                    .forEach((record, rowIndex) => {
                    let leftPosition = 0;
                    const $row = Html.create('div').setData('role', 'row').setData('row-index', rowIndex);
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
                    this.$body.append($row);
                });
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
             * 그리드패널의 전체 컬럼을 가져온다.
             *
             * @return {Admin.Grid.Column[]} columns
             */
            getColumns() {
                return this.columns;
            }
            /**
             * 특정 순서의 컬럼을 가져온다.
             *
             * @param {number} index - 가져올 컬럼의 인덱스
             * @return {Admin.Grid.Column} column - 컬럼
             */
            getColumnByIndex(index) {
                const column = this.columns[index];
                if (column instanceof Admin.Grid.Column) {
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
                const $row = Html.all('div[data-role=row]', this.$getBody()).get(rowIndex);
                if ($row == null)
                    return;
                const headerHeight = this.$getHeader().getOuterHeight();
                const contentHeight = this.$getContent().getHeight();
                const offset = $row.getPosition();
                const scroll = this.getScrollbar().getPosition();
                const top = offset.top;
                const bottom = top + $row.getOuterHeight();
                if (top - 1 < headerHeight) {
                    const minScroll = 0;
                    const y = Math.max(top + scroll.y - headerHeight - 1, minScroll);
                    this.getScrollbar().setPosition(null, y, true);
                }
                else if (bottom + 1 > contentHeight) {
                    const maxScroll = this.$getContent().getScrollHeight() - contentHeight;
                    const y = Math.min(bottom + scroll.y - contentHeight + 1, maxScroll);
                    this.getScrollbar().setPosition(null, y, true);
                }
            }
            /**
             * 포커스가 지정된 열의 포커스를 해제한다.
             */
            blurRow() {
                // @todo 행 선택 해제
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
                this.focusRow(rowIndex);
                Html.all('div[data-role=column].focus', this.$body).removeClass('focus');
                $column.addClass('focus');
                this.focusedCell.rowIndex = rowIndex;
                this.focusedCell.columnIndex = columnIndex;
                const contentWidth = this.$getContent().getWidth();
                const offset = $column.getPosition();
                const scroll = this.getScrollbar().getPosition();
                const left = offset.left;
                const right = left + $column.getOuterWidth();
                if (left < this.freezeWidth) {
                    const minScroll = 0;
                    const x = Math.max(left + scroll.x - this.freezeWidth - 2, minScroll);
                    this.getScrollbar().setPosition(x, null, true);
                }
                else if (right > contentWidth) {
                    const maxScroll = this.$getContent().getScrollWidth() - contentWidth;
                    const x = Math.min(right + scroll.x - contentWidth + 2, maxScroll);
                    this.getScrollbar().setPosition(x, null, true);
                }
            }
            /**
             * 포커스된 셀을 포커스를 해제한다.
             */
            blurCell() {
                this.blurRow();
                this.focusedCell.rowIndex = null;
                this.focusedCell.columnIndex = null;
                Html.all('div[data-role=column].focus', this.$body).removeClass('focus');
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
             * @param {Admin.Grid.Column} column - 업데이트할 컬럼
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
             * @param {Admin.Grid.Column} column - 업데이트할 컬럼
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
                    const header = Admin.get(id);
                    if (header instanceof Admin.Grid.Column) {
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
                            $header.setStyle('z-index', this.freeze - headerIndex + 1);
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
                    this.getScrollbar().setTrackPosition('x', leftPosition ? leftPosition + 1 : 0);
                }
                else {
                    this.getScrollbar().setTrackPosition('x', 0);
                }
            }
            /**
             * 그리드패널이 화면상에 출력되었을 때 이벤트를 처리한다.
             */
            onRender() {
                super.onRender();
                this.onLoad();
                this.$getComponent().on('keydown', (e) => {
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
                                rowIndex = Math.max(0, (this.focusedCell.rowIndex ?? 0) + 1);
                                columnIndex = this.focusedCell.columnIndex ?? 0;
                                break;
                        }
                        this.focusCell(rowIndex, columnIndex);
                        e.preventDefault();
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
                //console.log('onBeforeLoad - grid');
            }
            /**
             * 데이터가 로딩되었을 때 이벤트를 처리한다.
             */
            onLoad() {
                if (this.getStore().isLoaded() === false)
                    return;
                this.focusedCell = { rowIndex: null, columnIndex: null };
                this.renderBody();
            }
            /**
             * 데이터가 변경되었을 때 이벤트를 처리한다.
             */
            onUpdate() {
                this.focusedCell = { rowIndex: null, columnIndex: null };
                this.renderBody();
            }
            /**
             * keydown 이벤트를 처리한다.
             *
             * @param {KeyboardEvent} e - 키보드이벤트
             */
            onKeydown(e) {
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
                            rowIndex = Math.max(0, (this.focusedCell.rowIndex ?? 0) + 1);
                            columnIndex = this.focusedCell.columnIndex ?? 0;
                            break;
                    }
                    this.focusCell(rowIndex, columnIndex);
                    e.preventDefault();
                }
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
        }
        Grid.Panel = Panel;
        class Column extends Admin.Base {
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
            /**
             * 그리드패널 컬럼객체를 생성한다.
             *
             * @param {Object} properties - 객체설정
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
                for (let column of properties?.columns ?? []) {
                    if (!(column instanceof Admin.Grid.Column)) {
                        column = new Admin.Grid.Column(column);
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
             * @return {Admin.Grid.Column[]} columns
             */
            getChildren() {
                return this.columns;
            }
            /**
             * 그리드패널을 지정한다.
             *
             * @param {Admin.Grid.Panel} grid - 그리드패널
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
             * @param {Admin.Grid.Column} parent - 그리드헤더 그룹컬럼
             */
            setParent(parent) {
                this.parent = parent;
            }
            /**
             * 컬럼이 그룹화되어 있다면 그룹헤더를 가져온다.
             *
             * @return {Admin.Grid.Column} parent
             */
            getParent() {
                return this.parent;
            }
            /**
             * 그리드패널을 가져온다.
             *
             * @return {Admin.Grid.Panel} grid
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
             * @return {Admin.Grid.Column[]} columns
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
                    $text.text(this.text);
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
                    $label.text(this.text);
                    $header.append($label);
                    const $button = Html.create('button', { 'type': 'button', 'data-role': 'header-menu' });
                    $header.append($button);
                }
                if (this.isHidden() == true) {
                    $header.setStyle('display', 'none');
                }
                if (this.isResizable() == true) {
                    this.resizer = new Admin.Resizer($header, this.grid.$content, {
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
                                this.grid.getScrollbar().setScrollable(false);
                            },
                            resize: (_$target, rect, position) => {
                                this.grid.$getHeader().addClass('locked');
                                /**
                                 * 그리드 패널 우측으로 벗어났을 경우, 그리드패널을 우측으로 스크롤한다.
                                 */
                                const offset = this.grid.$content.getOffset();
                                const width = this.grid.$content.getOuterWidth();
                                const scroll = this.grid.getScrollbar().getPosition();
                                const x = Math.max(0, position.x);
                                if (x > offset.left + width - 15) {
                                    if (rect.right < width + scroll.x - 50) {
                                        this.grid.getScrollbar().setAutoScroll(0, 0);
                                    }
                                    else {
                                        const speed = Math.min(Math.ceil((x - (offset.left + width - 15)) / 30), 15);
                                        this.grid.getScrollbar().setAutoScroll(speed, 0);
                                    }
                                }
                                else if (this.isFreezeColumn() == false &&
                                    x < offset.left + this.grid.freezeWidth + 15) {
                                    if (rect.left > this.grid.freezeWidth + scroll.x + 50) {
                                        this.grid.getScrollbar().setAutoScroll(0, 0);
                                    }
                                    else {
                                        const speed = Math.max(Math.floor((x - (offset.left + this.grid.freezeWidth - 15)) / 30), -15);
                                        this.grid.getScrollbar().setAutoScroll(speed, 0);
                                    }
                                }
                                else {
                                    this.grid.getScrollbar().setAutoScroll(0, 0);
                                }
                            },
                            end: (_$target, rect) => {
                                this.setWidth(rect.width);
                                this.grid.getScrollbar().setAutoScroll(0, 0);
                                this.grid.getScrollbar().setScrollable(this.grid.scrollable);
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
             * @param {Object} record - 컬럼이 속한 행의 모든 데이터셋
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
                $column.on('click', (e) => {
                    const $column = Html.el(e.currentTarget);
                    this.grid.focusCell($column.getData('row'), $column.getData('column'));
                });
                const $display = Html.create('div').setData('display', 'view');
                $display.text(value);
                $column.append($display);
                if (this.isHidden() == true) {
                    $column.setStyle('display', 'none');
                }
                return $column;
            }
        }
        Grid.Column = Column;
    })(Grid = Admin.Grid || (Admin.Grid = {}));
})(Admin || (Admin = {}));
