/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그리드패널 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Grid.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 1.
 */
namespace Admin {
    export namespace Grid {
        export class Panel extends Admin.Panel {
            type: string = 'panel';
            role: string = 'grid';

            headers: Admin.Grid.Column[];
            columns: Admin.Grid.Column[];

            store: Admin.Store;

            $header: Dom;
            $body: Dom;
            $footer: Dom;

            focusedCell: { rowIndex: number; columnIndex: number } = { rowIndex: null, columnIndex: null };

            /**
             * 그리드패널을 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties: { [key: string]: any } = null) {
                super(properties);

                this.scrollable = this.properties.scrollable ?? true;

                this.store = this.properties.store ?? new Admin.Store();
                this.store.addEvent(
                    'load',
                    (grid: Admin.Grid.Panel) => {
                        grid.onLoad();
                    },
                    [this]
                );

                this.store.addEvent(
                    'beforeLoad',
                    (grid: Admin.Grid.Panel) => {
                        grid.onBeforeLoad();
                    },
                    [this]
                );

                this.initColumns();

                this.$header = Html.create('div').setData('role', 'header');
                this.$body = Html.create('div').setData('role', 'body');
                this.$footer = Html.create('div').setData('role', 'footer');
            }

            /**
             * 그리드패널 헤더의 하위 컴포넌트를 초기화한다.
             */
            initColumns(): void {
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
            }

            /**
             * 그리드패널의 데이터스토어를 가져온다.
             *
             * @return {Admin.Store} store
             */
            getStore(): Admin.Store {
                return this.store;
            }

            /**
             * 그리드패널의 헤더(제목행)를 랜더링한다.
             */
            renderHeader(): void {
                for (const header of this.headers) {
                    this.$header.append(header.$getHeader());
                }
            }

            /**
             * 그리드패널의 바디(데이터행)를 랜더링한다.
             */
            renderBody(): void {
                this.$body.empty();
                this.getStore()
                    .getRecords()
                    .forEach((record: Admin.Data.Record, rowIndex: number) => {
                        const $row = Html.create('div').setData('role', 'row').setData('row-index', rowIndex);
                        this.getColumns().forEach((column: Admin.Grid.Column, columnIndex: number) => {
                            const value = record.get(column.dataIndex);
                            $row.append(column.$getBody(value, record, rowIndex, columnIndex));
                        });
                        this.$body.append($row);
                    });
            }

            /**
             * 그리드패널의 푸터(합계행)를 핸더링한다.
             */
            renderFooter(): void {}

            /**
             * 패널의 본문 레이아웃을 랜더링한다.
             */
            renderContent(): void {
                if (this.$content.getData('rendered') == true) return;

                this.renderHeader();
                this.renderBody();
                this.renderFooter();

                this.$content.append(this.$header);
                this.$content.append(this.$body);
                this.$content.append(this.$footer);

                this.$content.setData('rendered', true);
            }

            /**
             * 그리드패널의 전체 컬럼을 가져온다.
             *
             * @return {Admin.Grid.Column[]} columns
             */
            getColumns(): Admin.Grid.Column[] {
                return this.columns;
            }

            /**
             * 특정 순서의 컬럼을 가져온다.
             *
             * @param {number} index - 가져올 컬럼의 인덱스
             * @return {Admin.Grid.Column} column - 컬럼
             */
            getColumnByIndex(index: number): Admin.Grid.Column {
                const column = this.columns[index];
                if (column instanceof Admin.Grid.Column) {
                    return column as Admin.Grid.Column;
                } else {
                    return null;
                }
            }

            /**
             * 특정 열에 포커스를 지정한다.
             *
             * @param {number} rowIndex - 행 인덱스
             */
            focusRow(rowIndex: number): void {
                const $row = Html.all('div[data-role=row]', this.$body).get(rowIndex);
                if ($row == null) return;

                const headerHeight = this.$header.getOuterHeight();
                const contentHeight = this.$content.getHeight();
                const rowHeight = $row.getOuterHeight();
                const offset = $row.getOffset();
                const scroll = this.$content.getScroll();
                const top = offset.top - scroll.top;
                const bottom = top + $row.getOuterHeight();

                if (top < headerHeight) {
                    this.$content.setScroll(offset.top - headerHeight - 1, null, false);
                } else if (bottom > contentHeight) {
                    this.$content.setScroll(offset.top + rowHeight - contentHeight + 1, null, false);
                }
            }

            /**
             * 특정 셀에 포커스를 지정한다.
             *
             * @param {number} rowIndex - 행 인덱스
             * @param {number} columnIndex - 컬럼 인덱스
             */
            focusCell(rowIndex: number, columnIndex: number): void {
                if (this.isRendered() == false) return;

                const $column = Html.get(
                    'div[data-role=column][data-row="' + rowIndex + '"][data-column="' + columnIndex + '"]',
                    this.$body
                );
                if ($column.getEl() == null) return;

                this.focusRow(rowIndex);
                Html.all('div[data-role=column].focus', this.$body).removeClass('focus');
                $column.addClass('focus');
                this.focusedCell.rowIndex = rowIndex;
                this.focusedCell.columnIndex = columnIndex;

                const lockedWidth = 0;
                const contentWidth = this.$content.getWidth();
                const columnWidth = $column.getOuterWidth();
                const offset = $column.getOffset();
                const scroll = this.$content.getScroll();
                const left = offset.left - scroll.left;
                const right = left + $column.getOuterWidth();

                if (left < lockedWidth) {
                    this.$content.setScroll(null, offset.left - lockedWidth - 1, false);
                } else if (right > contentWidth) {
                    this.$content.setScroll(null, offset.left + columnWidth - contentWidth + 1, false);
                }
            }

            /**
             * 그리드패널 레이아웃을 갱신한다.
             */
            updateLayout(): void {
                if (this.isRendered() == false) {
                    this.render();
                    return;
                }

                this.getColumns().forEach((column: Admin.Grid.Column, columnIndex: number) => {
                    const $column = Html.all('div[data-role=column]', this.$header).get(columnIndex);

                    let isUpdated = false;
                    if (
                        (column.hidden == true && $column.getStyle('display') != 'none') ||
                        (column.hidden == false && $column.getStyle('display') == 'none')
                    ) {
                        isUpdated = true;
                        if (column.hidden == true) {
                            $column.setStyle('display', 'none');
                            Html.all('div[data-role=row]', this.$body).forEach(($row: Dom) => {
                                const $column = Html.all('div[data-role=column]', $row).get(columnIndex);
                                $column.setStyle('display', 'none');
                            });
                        } else {
                            $column.setStyle('display', '');
                            Html.all('div[data-role=row]', this.$body).forEach(($row: Dom) => {
                                const $column = Html.all('div[data-role=column]', $row).get(columnIndex);
                                $column.setStyle('display', '');
                            });
                        }
                    }

                    if (column.width !== null && column.width != $column.getWidth()) {
                        isUpdated = true;
                        $column.setStyle('flexGrow', 0);
                        $column.setStyle('flexBasis', '');
                        $column.setStyle('width', column.width + 'px');

                        Html.all('div[data-role=row]', this.$body).forEach(($row: Dom) => {
                            const $column = Html.all('div[data-role=column]', $row).get(columnIndex);
                            $column.setStyle('flexGrow', 0);
                            $column.setStyle('flexBasis', '');
                            $column.setStyle('width', column.width + 'px');
                        });
                    }

                    if (isUpdated == true && column.getParent() != null) {
                        let parent = column;
                        let $parent = $column.getParent();
                        while ($parent.getData('role') == 'columns') {
                            parent = parent.getParent();
                            const $merge = $parent.getParent().getParent();

                            $merge.setStyle('width', parent.getChildrenFlexBasis() + 'px');
                            $merge.setStyle('flexGrow', parent.getChildrenFlexGrow());
                            $merge.setStyle('flexBasis', parent.getChildrenFlexBasis() + 'px');

                            if (parent.isHidden() == true) {
                                $merge.setStyle('display', 'none');
                            } else {
                                $merge.setStyle('display', '');
                            }

                            $parent = $merge.getParent();
                        }
                    }
                });
            }

            /**
             * 그리드패널이 화면상에 출력되었을 때 이벤트를 처리한다.
             */
            onRender(): void {
                if (this.getStore().autoLoad === true) {
                    this.getStore().load();
                }

                super.onRender();
            }

            /**
             * 데이터가 로드되기 전 이벤트를 처리한다.
             */
            onBeforeLoad(): void {
                //console.log('onBeforeLoad - grid');
            }

            /**
             * 데이터가 로드 이벤트를 처리한다.
             */
            onLoad(): void {
                if (this.getStore().isLoaded() === false) return;

                this.focusedCell = { rowIndex: null, columnIndex: null };
                this.renderBody();
            }

            /**
             * keydown 이벤트를 처리한다.
             *
             * @param {KeyboardEvent} e - 키보드이벤트
             */
            onKeydown(e: KeyboardEvent): void {
                if (e.key.indexOf('Arrow') === 0) {
                    let rowIndex: number = 0;
                    let columnIndex: number = 0;
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
                            columnIndex = Math.min(
                                this.getColumns().length - 1,
                                (this.focusedCell.columnIndex ?? 0) + 1
                            );
                            while (
                                columnIndex < this.getColumns().length - 1 &&
                                this.getColumnByIndex(columnIndex).isHidden() == true
                            ) {
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
            onCopy(e: ClipboardEvent): void {
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

                    e.clipboardData.setData('text/plain', $column.getData('value'));
                    e.preventDefault();
                }
            }
        }

        export class Column extends Admin.Base {
            grid: Admin.Grid.Panel;
            parent: Admin.Grid.Column = null;
            text: string;
            dataIndex: string;
            width: number;
            minWidth: number;
            resizable: boolean;
            sortable: boolean;
            hidden: boolean;
            headerWrap: boolean;
            headerAlign: string;
            headerVerticalAlign: string;
            textWrap: boolean;
            textAlign: string;
            textVerticalAlign: string;
            columns: Admin.Grid.Column[];

            /**
             * 그리드패널 컬럼객체를 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties: { [key: string]: any } = null) {
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
            hasChild(): boolean {
                return this.columns.length > 0;
            }

            /**
             * 하위 컬럼을 가져온다.
             *
             * @return {Admin.Grid.Column[]} columns
             */
            getChildren(): Admin.Grid.Column[] {
                return this.columns;
            }

            /**
             * 그리드패널을 지정한다.
             *
             * @param {Admin.Grid.Panel} grid - 그리드패널
             */
            setGrid(grid: Admin.Grid.Panel): void {
                this.grid = grid;
                this.columns.forEach((column) => {
                    column.setGrid(grid);
                });
            }

            /**
             * 컬럼의 그룹헤더 지정한다.
             *
             * @param {Admin.Grid.Column} parent - 그리드헤더 그룹컬럼
             */
            setParent(parent: Admin.Grid.Column): void {
                this.parent = parent;
            }

            /**
             * 컬럼이 그룹화되어 있다면 그룹헤더를 가져온다.
             *
             * @return {Admin.Grid.Column} parent
             */
            getParent(): Admin.Grid.Column {
                return this.parent;
            }

            /**
             * 그리드패널을 가져온다.
             *
             * @returns {Admin.Grid.Panel} grid
             */
            getGrid(): Admin.Grid.Panel {
                return this.grid;
            }

            /**
             * 현재 컬럼을 포함한 하위 전체 컬럼을 가져온다.
             *
             * @return {Admin.Grid.Column[]} columns
             */
            getColumns(): Admin.Grid.Column[] {
                if (this.columns.length == 0) return [this];

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
            getChildrenFlexGrow(): number {
                if (this.hidden == true) {
                    return 0;
                }

                if (this.columns.length == 0) {
                    return this.width === null ? 1 : 0;
                } else {
                    let flexGrow = 0;
                    for (const column of this.columns) {
                        if (column.hidden == true) continue;
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
            getChildrenFlexBasis(): number {
                if (this.hidden == true) {
                    return 0;
                }

                if (this.columns.length == 0) {
                    return this.width ? this.width : this.minWidth ? this.minWidth : 0;
                } else {
                    let width = 0;
                    let count = 0;
                    for (const column of this.columns) {
                        if (column.isHidden() == true) continue;
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
            setWidth(width: number): void {
                this.width = width;
                this.minWidth = null;
                this.getGrid().updateLayout();
            }

            /**
             * 컬럼의 숨김여부를 변경한다.
             *
             * @param {boolean} hidden - 숨김여부
             */
            setHidden(hidden: boolean): void {
                this.hidden = hidden;
                this.getGrid().updateLayout();
            }

            /**
             * 컬럼의 숨김여부를 가져온다.
             *
             * @return {boolean} hidden
             */
            isHidden(): boolean {
                if (this.hasChild() == true) {
                    let count = 0;
                    this.getChildren().forEach((column: Admin.Grid.Column) => {
                        if (column.isHidden() == false) {
                            count++;
                        }
                    });

                    return count == 0;
                } else {
                    return this.hidden;
                }
            }

            /**
             * 컬럼의 헤더컬럼 레이아웃을 가져온다.
             *
             * @return {Dom} $layout
             */
            $getHeader(): Dom {
                const $header = Html.create('div');
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

                    if (this.isHidden() == true) {
                        $header.setStyle('display', 'none');
                    }

                    $header.append($group);
                } else {
                    $header.setData('role', 'column');
                    if (this.width) {
                        $header.setStyle('width', this.width + 'px');
                    } else {
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

                    const $button = Html.create('button');
                    $button.text('d');
                    $header.append($button);

                    if (this.hidden == true) {
                        $header.setStyle('display', 'none');
                    }
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
            $getBody(value: any, record: { [key: string]: any }, rowIndex: number, columnIndex: number): Dom {
                const $column = Html.create('div')
                    .setData('role', 'column')
                    .setData('row', rowIndex)
                    .setData('column', columnIndex)
                    .setData('record', record, false)
                    .setData('value', value, false);
                if (this.width) {
                    $column.setStyle('width', this.width + 'px');
                } else {
                    $column.setStyle('flexGrow', 1);
                }

                if (this.minWidth) {
                    $column.setStyle('flexBasis', this.minWidth + 'px');
                    $column.setStyle('width', this.minWidth + 'px');
                }

                $column.addClass(this.textAlign);

                $column.on('click', (e: Event) => {
                    const $column = Html.el(e.currentTarget);
                    this.getGrid().focusCell($column.getData('row'), $column.getData('column'));
                });

                const $display = Html.create('div').setData('display', 'view');
                $display.text(value);

                $column.append($display);

                if (this.hidden == true) {
                    $column.setStyle('display', 'none');
                }

                return $column;
            }
        }
    }
}
