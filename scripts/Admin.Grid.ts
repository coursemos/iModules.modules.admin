/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그리드패널 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Grid.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 3.
 */
namespace Admin {
    export namespace Grid {
        export namespace Panel {
            export interface Listeners extends Admin.Panel.Listeners {
                /**
                 * @var {Function} render - 컴포넌트가 랜더링 되었을 때
                 */
                render?: (panel: Admin.Panel) => void;

                /**
                 * @var {Function} show - 컴포넌트가 보여질 떄
                 */
                show?: (panel: Admin.Panel) => void;

                /**
                 * @var {Function} hide - 컴포넌트가 숨겨질 떄
                 */
                hide?: (panel: Admin.Panel) => void;

                /**
                 * @type {Function} selectionChange - 선택항목이 변경되었을 때
                 */
                selectionChange?: (selections: Admin.Data.Record[], grid: Admin.Grid.Panel) => void;

                /**
                 * @type {Function} selectionComplete - 사용자입력에 의하여 선택항목이 변경되었을 때
                 */
                selectionComplete?: (selections: Admin.Data.Record[], grid: Admin.Grid.Panel) => void;

                /**
                 * @type {Function} openItem - 아이템을 오픈할 때
                 */
                openItem?: (record: Admin.Data.Record, rowIndex: number, grid: Admin.Grid.Panel) => void;

                /**
                 * @type {Function} openMenu - 아이템 메뉴가 오픈될 때
                 */
                openMenu?: (
                    menu: Admin.Menu,
                    record: Admin.Data.Record,
                    rowIndex: number,
                    grid: Admin.Grid.Panel
                ) => void;

                /**
                 * @type {Function} openMenus - 다중 아이템 메뉴가 오픈될 때
                 */
                openMenus?: (menu: Admin.Menu, selections: Admin.Data.Record[], grid: Admin.Grid.Panel) => void;

                /**
                 * @type {Function} load - 데이터가 로딩되었을 때
                 */
                load?: (grid: Admin.Grid.Panel, store: Admin.Store) => void;

                /**
                 * @type {Function} update - 데이터가 변경되었 때
                 */
                update?: (grid: Admin.Grid.Panel, store: Admin.Store) => void;
            }

            export interface Selection {
                /**
                 * @type {boolean} selectable - 선택가능여부
                 */
                selectable?: boolean;

                /**
                 * @type {'row'|'check'} display - 선택표시 (row : 별도의 표시없이 선택된 ROW 강조, check : 체크박스로 표시)
                 */
                display?: 'row' | 'check';

                /**
                 * @type {boolean} multiple - 다중선택 여부 (display 가 row 인 경우 Ctrl 또는 Shift 키와 함께 선택, check 인 경우 항상 true)
                 */
                multiple?: boolean;

                /**
                 * @type {boolean} deselectable - 선택된 항목을 선택해제 할 수 있는지 여부 (display 가 check 인 경우 항상 true)
                 */
                deselectable?: boolean;

                /**
                 * @type {boolean} keepable - 선택사항 보관여부 (페이지 이동 등으로 그리드 데이터가 변경되더라도 이전 선택사항을 보관할 지 여부)
                 */
                keepable?: boolean;
            }

            export interface Properties extends Admin.Panel.Properties {
                /**
                 * @type {(Admin.Grid.Column | Admin.Grid.Column.Properties)[]} columns - 컬럼정보
                 */
                columns: (Admin.Grid.Column | Admin.Grid.Column.Properties)[];

                /**
                 * @type {number} freeze - 고정할 컬럼 인덱스
                 */
                freeze?: number;

                /**
                 * @type {boolean} columnResizable - 컬럼 크기조절여부
                 */
                columnResizable?: boolean;

                /**
                 * @type {boolean} columnLines - 컬럼간 구분선 표시여부
                 */
                columnLines?: boolean;

                /**
                 * @type {boolean} rowLines - 컬럼 제목 표시여부
                 */
                columnHeaders?: boolean;

                /**
                 * @type {boolean} rowLines - 행간 구분선 표시여부
                 */
                rowLines?: boolean;

                /**
                 * @type {Admin.Grid.Panel.Selection} selection - 선택설정
                 */
                selection?: Admin.Grid.Panel.Selection;

                /**
                 * @type {Admin.Store} store - 데이터스토어
                 */
                store: Admin.Store;

                /**
                 * @type {boolean} autoLoad - 객체가 랜더링된 후 데이터를 자동으로 불러올지 여부
                 */
                autoLoad?: boolean;

                /**
                 * @type {string} loadingType - 로딩메시지 타입
                 */
                loadingType?: Admin.Loading.Type;

                /**
                 * @type {string} loadingText - 로딩메시지
                 */
                loadingText?: string;

                /**
                 * @type {Admin.Grid.Panel.Listeners} listeners - 이벤트리스너
                 */
                listeners?: Admin.Grid.Panel.Listeners;
            }
        }

        export class Panel extends Admin.Panel {
            type: string = 'panel';
            role: string = 'grid';

            headers: Admin.Grid.Column[];
            columns: Admin.Grid.Column[];
            freeze: number;
            freezeColumn: number;
            freezeWidth: number;
            columnResizable: boolean;
            columnLines: boolean;
            columnHeaders: boolean;
            rowLines: boolean;
            selection: Admin.Grid.Panel.Selection;
            selections: Map<string, Admin.Data.Record> = new Map();

            store: Admin.Store;
            autoLoad: boolean;

            $header: Dom;
            $body: Dom;
            $footer: Dom;

            focusedRow: number = null;
            focusedCell: { rowIndex: number; columnIndex: number } = { rowIndex: null, columnIndex: null };

            loading: Admin.Loading;

            /**
             * 그리드패널을 생성한다.
             *
             * @param {Admin.Grid.Panel.Properties} properties - 객체설정
             */
            constructor(properties: Admin.Grid.Panel.Properties = null) {
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
                this.autoLoad = this.properties.autoLoad !== false;

                this.initColumns();

                this.$header = Html.create('div').setData('role', 'header');
                this.$body = Html.create('div').setData('role', 'body');
                this.$footer = Html.create('div').setData('role', 'footer');

                this.loading = new Admin.Loading(this, {
                    type: this.properties.loadingType ?? 'column',
                    direction: 'column',
                    message: this.properties.loadingText ?? null,
                });
            }

            /**
             * 그리드패널 헤더의 하위 컴포넌트를 초기화한다.
             */
            initColumns(): void {
                this.headers = [];
                this.columns = [];

                if (this.selection.display == 'check') {
                    const check = new Admin.Grid.Check({
                        dataIndex: '@',
                    });
                    check.setGrid(this);
                    this.headers.push(check);
                    this.columns.push(check);
                }

                for (let column of this.properties.columns ?? []) {
                    if (!(column instanceof Admin.Grid.Column)) {
                        column = new Admin.Grid.Column(column);
                    }
                    column.setGrid(this);
                    this.headers.push(column);
                    this.columns.push(...column.getColumns());
                }

                this.columns.forEach((column: Admin.Grid.Column, columnIndex: number) => {
                    column.setColumnIndex(columnIndex);
                });

                this.freeze = Math.min(this.headers.length - 1, this.freeze);
            }

            /**
             * 그리드패널의 데이터스토어를 가져온다.
             *
             * @return {Admin.Store} store
             */
            getStore(): Admin.Store {
                return this.store ?? this.properties.store ?? new Admin.Store();
            }

            /**
             * 그리드패널의 헤더 Dom 을 가져온다.
             *
             * @return {Dom} $header
             */
            $getHeader(): Dom {
                return this.$header;
            }

            /**
             * 그리드패널의 바디 Dom 을 가져온다.
             *
             * @return {Dom} $body
             */
            $getBody(): Dom {
                return this.$body;
            }

            /**
             * 그리드패널의 푸터 Dom 을 가져온다.
             *
             * @return {Dom} $footer
             */
            $getFooter(): Dom {
                return this.$footer;
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
             * @param {number} columnIndex - 가져올 컬럼의 인덱스
             * @return {Admin.Grid.Column} column - 컬럼
             */
            getColumnByIndex(columnIndex: number): Admin.Grid.Column {
                const column = this.columns[columnIndex];
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
                const $row = this.$getRow(rowIndex);
                if ($row == null) {
                    return;
                }

                this.blurRow();

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
                } else if (bottom + 1 > contentHeight) {
                    const maxScroll = this.$getContent().getScrollHeight() - contentHeight;
                    const y = Math.min(bottom + scroll.y - contentHeight + 1, maxScroll);
                    this.getScrollbar().setPosition(null, y, true);
                }

                this.focusedRow = rowIndex;
                $row.addClass('focused');
            }

            /**
             * 포커스가 지정된 열의 포커스를 해제한다.
             */
            blurRow(): void {
                this.focusedRow = null;
                Html.all('div[data-role=row].focused', this.$body).removeClass('focused');
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

                this.blurCell();
                this.focusRow(rowIndex);
                $column.addClass('focused');
                this.focusedCell.rowIndex = rowIndex;
                this.focusedCell.columnIndex = columnIndex;

                const contentWidth = this.$getContent().getWidth();
                const offset = $column.getPosition();
                const scroll = this.getScrollbar().getPosition();
                const left = offset.left - scroll.x;
                const right = left + $column.getOuterWidth();

                if ($column.hasClass('sticky') == false) {
                    if (left < this.freezeWidth) {
                        const minScroll = 0;
                        const x = Math.max(left + scroll.x - this.freezeWidth - 2, minScroll);
                        this.getScrollbar().setPosition(x, null, true);
                    } else if (right > contentWidth) {
                        const maxScroll = this.$getContent().getScrollWidth() - contentWidth;
                        const x = Math.min(right + scroll.x - contentWidth + 2, maxScroll);
                        this.getScrollbar().setPosition(x, null, true);
                    }
                }
            }

            /**
             * 포커스된 셀을 포커스를 해제한다.
             */
            blurCell(): void {
                this.blurRow();
                this.focusedCell.rowIndex = null;
                this.focusedCell.columnIndex = null;

                Html.all('div[data-role=column].focused', this.$body).removeClass('focused');
            }

            /**
             * 선택된 항목을 배열로 가져온다.
             *
             * @return {Admin.Data.Record[]} selections
             */
            getSelections(): Admin.Data.Record[] {
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
            isRowSelected(rowIndex: number): boolean {
                if (index === null) {
                    return false;
                }
                const $row = this.$getRow(rowIndex);
                if ($row.getEl() === null) {
                    return false;
                }

                const record = $row.getData('record') as Admin.Data.Record;
                return $row.hasClass('selected') == true && this.selections.has(record.getHash());
            }

            /**
             * 아이템을 오픈한다.
             *
             * @param {number} rowIndex - 아이탬(행) 인덱스
             */
            openItem(rowIndex: number): void {
                const $row = this.$getRow(rowIndex);
                if ($row === null) return;

                const record = $row.getData('record') as Admin.Data.Record;
                this.select(record);
                this.fireEvent('openItem', [record, rowIndex, this]);
            }

            /**
             * 아이템 메뉴를 오픈한다.
             *
             * @param {number} rowIndex - 아이탬(행) 인덱스
             * @param {PointerEvent} pointerEvent - 포인트이벤트
             */
            openMenu(rowIndex: number, pointerEvent: PointerEvent): void {
                const $row = this.$getRow(rowIndex);
                if ($row === null) return;

                const record = $row.getData('record') as Admin.Data.Record;
                this.select(record);

                const menu = new Admin.Menu();

                this.fireEvent('openMenu', [menu, record, rowIndex, this]);

                if (menu.getItems()?.length == 0) {
                    menu.remove();
                } else {
                    menu.showAt(pointerEvent, 'y');
                }
            }

            /**
             * 다중 아이템 메뉴를 오픈한다.
             *
             * @param {PointerEvent} pointerEvent - 포인트이벤트
             */
            openMenus(pointerEvent: PointerEvent): void {
                const menu = new Admin.Menu();

                this.fireEvent('openMenus', [menu, this.getSelections(), this]);

                if (menu.getItems()?.length == 0) {
                    menu.remove();
                } else {
                    menu.showAt(pointerEvent, 'y');
                }
            }

            /**
             * 단일 아이템을 항상 선택한다.
             *
             * @param {Admin.Data.Record|Object} record - 선택할 레코드
             */
            select(record: Admin.Data.Record | { [key: string]: any }): void {
                const rowIndex = this.getStore().matchIndex(record);
                if (rowIndex === null) return;

                if (this.isRowSelected(rowIndex) == true) {
                    if (this.selections.size != 1) {
                        this.deselectAll(false);
                        this.selectRow(rowIndex);
                    }
                } else {
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
            selectRow(rowIndex: number, is_multiple: boolean = false, is_event: boolean = true): void {
                if (rowIndex === null || this.selection.selectable == false) return;

                const $row = this.$getRow(rowIndex);
                if ($row === null) return;

                if (this.isRowSelected(rowIndex) == true) return;

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
             * 현재 페이지의 모든 아이템을 선택한다.
             *
             * @param {boolean} is_event - 이벤트 발생여부
             */
            selectAll(is_event: boolean = true): void {
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
            deselectRow(rowIndex: number, is_event: boolean = true): void {
                if (rowIndex === null) return;

                const $row = this.$getRow(rowIndex);
                if ($row === null) return;

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
            deselectAll(is_event: boolean = true): void {
                if (this.selections.size > 0) {
                    if (this.selection.keepable == true) {
                        for (let i = 0, loop = this.getStore().getCount(); i < loop; i++) {
                            this.deselectRow(i, false);
                        }
                    } else {
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
            resetSelections(is_event: boolean = true): void {
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
            restoreSelections(): void {
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
            onSelectionChange(): void {
                this.fireEvent('selectionChange', [this.getSelections(), this]);
            }

            /**
             * 사용자입력에 의하여 선택항목이 변경되었을 때 이벤트를 처리한다.
             */
            onSelectionComplete(): void {
                this.fireEvent('selectionComplete', [this.getSelections(), this]);
            }

            /**
             * 컬럼 순서를 업데이트한다.
             */
            updateColumnIndex(): void {
                this.headers.forEach((header: Admin.Grid.Column, headerIndex: number) => {
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
            updateColumnVisible(column: Admin.Grid.Column, columnIndex: number): boolean {
                let isUpdated = false;
                const $column = Html.all('div[data-role=column]', this.$header).get(columnIndex);

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

                return isUpdated;
            }

            /**
             * 컬럼의 너비를 업데이트한다.
             *
             * @param {Admin.Grid.Column} column - 업데이트할 컬럼
             * @param {number} columnIndex - 컬럼인덱스
             * @return {boolean} isUpdated - 변경여부
             */
            updateColumnWidth(column: Admin.Grid.Column, columnIndex: number): boolean {
                let isUpdated = false;
                const $column = Html.all('div[data-role=column]', this.$header).get(columnIndex);

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

                return isUpdated;
            }

            /**
             * 그리드 우측의 빈컬럼 스타일을 갱신한다.
             */
            updateColumnFill(): void {
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
            updateLayout(): void {
                if (this.isRendered() == false) {
                    this.render();
                    return;
                }

                let isFreezeUpdated: boolean;
                const headerUpdated: string[] = [];
                this.getColumns().forEach((column: Admin.Grid.Column, columnIndex: number) => {
                    const isUpdated =
                        this.updateColumnVisible(column, columnIndex) || this.updateColumnWidth(column, columnIndex);

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

                headerUpdated.forEach((id: string) => {
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
            setFreezeColumn(index: number): void {
                Html.all('div[data-role].sticky', this.$header).forEach(($header: Dom) => {
                    $header.removeClass('sticky', 'end');
                    $header.setStyle('left', '');
                });

                Html.all('div[data-role=column].sticky', this.$body).forEach(($header: Dom) => {
                    $header.removeClass('sticky', 'end');
                    $header.setStyle('left', '');
                });

                this.freeze = Math.min(this.headers.length - 1, index);
                this.freezeColumn = 0;
                this.freezeWidth = 0;

                if (index > 0) {
                    let leftPosition = 0;
                    Html.all('> div[data-role]', this.$header).forEach(($header: Dom, headerIndex: number) => {
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

                    Html.all('> div[data-role=row]', this.$body).forEach(($row: Dom) => {
                        let leftPosition = 0;
                        Html.all('> div[data-role=column]', $row).forEach(($column: Dom, columnIndex: number) => {
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
                } else {
                    this.getScrollbar().setTrackPosition('x', 0);
                }
            }

            /**
             * 그리드패널의 아이탬(행) DOM 을 생성하거나 가져온다.
             *
             * @param {number} rowIndex - 생성하거나 가져올 행 인덱스
             * @param {Admin.Data.Record} record - 행 데이터 (데이터가 NULL 이 아닌 경우 DOM 을 생성한다.)
             */
            $getRow(rowIndex: number, record: Admin.Data.Record = null): Dom {
                if (record === null) {
                    return Html.all('> div[data-role=row]', this.$getBody()).get(rowIndex);
                } else {
                    let leftPosition = 0;
                    const $row = Html.create('div')
                        .setData('role', 'row')
                        .setData('index', rowIndex)
                        .setData('record', record, false);
                    this.getColumns().forEach((column: Admin.Grid.Column, columnIndex: number) => {
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

                    $row.on('click', (e: PointerEvent) => {
                        if (this.selection.selectable == true) {
                            if (this.selection.display == 'check') {
                                this.deselectAll(false);
                                this.selectRow(rowIndex, false);
                            } else if (this.selection.deselectable == true && this.isRowSelected(rowIndex) == true) {
                                this.deselectRow(rowIndex);
                            } else {
                                this.selectRow(rowIndex, e.metaKey == true || e.ctrlKey == true);
                            }
                            this.onSelectionComplete();
                        }
                    });

                    $row.on('dblclick', (e: MouseEvent) => {
                        if (e.button === 0) {
                            this.openItem(rowIndex);
                        }
                    });

                    $row.on('contextmenu', (e: PointerEvent) => {
                        if (this.isRowSelected(rowIndex) == true) {
                            if (this.getSelections().length == 1 || this.selection.multiple == false) {
                                this.openMenu(rowIndex, e);
                            } else {
                                this.openMenus(e);
                            }
                        } else {
                            this.openMenu(rowIndex, e);
                        }
                        e.preventDefault();
                    });

                    $row.on('longpress', (e: PointerEvent) => {
                        Admin.Menu.pointerEvent = e;
                        this.openMenu(rowIndex, e);
                        e.preventDefault();
                    });

                    return $row;
                }
            }

            /**
             * 그리드패널의 헤더(제목행)을 데이터에 따라 업데이트한다.
             */
            updateHeader(): void {
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
            renderHeader(): void {
                let leftPosition = 0;
                this.freezeColumn = 0;

                this.headers.forEach((header: Admin.Grid.Column, headerIndex: number) => {
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

                if (this.columnHeaders === false) {
                    this.$header.addClass('hidden');
                    return;
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
            renderFooter(): void {}

            /**
             * 패널의 본문 레이아웃을 랜더링한다.
             */
            renderContent(): void {
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
            onRender(): void {
                super.onRender();
                this.updateHeader();

                if (this.autoLoad === true) {
                    this.getStore().load();
                }

                this.$getComponent().on('keydown', (e: KeyboardEvent) => {
                    if (e.target instanceof HTMLInputElement) {
                        return;
                    }

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
            onBeforeLoad(): void {
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
            onLoad(): void {
                if (this.getStore().isLoaded() === false) return;

                this.loading.hide();
                this.fireEvent('load', [this, this.getStore()]);
            }

            /**
             * 데이터가 변경되었을 때 이벤트를 처리한다.
             */
            onUpdate(): void {
                this.focusedCell = { rowIndex: null, columnIndex: null };
                this.renderBody();
                this.restoreSelections();
                this.updateHeader();
                this.fireEvent('update', [this, this.getStore()]);
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

            /**
             * 그리드 패널을 제거한다.
             */
            remove(): void {
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

        export namespace Column {
            export interface Properties extends Admin.Base.Properties {
                /**
                 * @type {string} text - 컬럼제목
                 */
                text?: string;

                /**
                 * @type {string} dataIndex - 데이터를 가져올 인덱스명
                 */
                dataIndex?: string;

                /**
                 * @type {string} width - 컬럼너비
                 */
                width?: number;

                /**
                 * @type {string} minWidth - 컬럼최소너비 (최소너비가 설정될 경우 그리드패널의 가로너비를 채우기 위해 최소너비 이상으로 확대된다.)
                 */
                minWidth?: number;

                /**
                 * @type {boolean} resizable - 너비조절가능여부
                 */
                resizable?: boolean;

                /**
                 * @type {boolean|string} sortable - 정렬가능여부
                 */
                sortable?: boolean | string;

                /**
                 * @type {boolean} hidden - 숨김여부
                 */
                hidden?: boolean;

                /**
                 * @type {boolean} headerWrap - 컬럼제목 줄바꿈여부
                 */
                headerWrap?: boolean;

                /**
                 * @type {'left'|'center'|'right'} headerAlign - 컬럼제목 가로정렬
                 */
                headerAlign?: 'left' | 'center' | 'right';

                /**
                 * @type {'top'|'middle'|'bottom'} headerAlign - 컬럼제목 세로정렬
                 */
                headerVerticalAlign?: 'top' | 'middle' | 'bottom';

                /**
                 * @type {boolean} textWrap - 데이터 줄바꿈여부
                 */
                textWrap?: boolean;

                /**
                 * @type {'left' | 'center' | 'right'} textAlign - 데이터 가로정렬
                 */
                textAlign?: 'left' | 'center' | 'right';

                /**
                 * @type {'top'|'middle'|'bottom'} textVerticalAlign - 데이터 세로정렬
                 */
                textVerticalAlign?: 'top' | 'middle' | 'bottom';

                /**
                 * @type {(Admin.Grid.Column | Admin.Grid.Column.Properties)[]} columns - 하위컬럼
                 */
                columns?: (Admin.Grid.Column | Admin.Grid.Column.Properties)[];

                renderer?: (
                    value: any,
                    record: Admin.Data.Record,
                    $dom: Dom,
                    rowIndex: number,
                    columnIndex: number,
                    column: Admin.Grid.Column,
                    grid: Admin.Grid.Panel
                ) => string;
            }
        }

        export class Column extends Admin.Base {
            grid: Admin.Grid.Panel;
            parent: Admin.Grid.Column = null;
            columnIndex: number;
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
            resizer: Admin.Resizer;
            renderer: (
                value: any,
                record: Admin.Data.Record,
                $dom: Dom,
                rowIndex: number,
                columnIndex: number,
                column: Admin.Grid.Column,
                grid: Admin.Grid.Panel
            ) => string;

            /**
             * 그리드패널 컬럼객체를 생성한다.
             *
             * @param {Admin.Grid.Column.Properties} properties - 객체설정
             */
            constructor(properties: Admin.Grid.Column.Properties = null) {
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
             * 컬럼 위치를 설정한다.
             *
             * @param {number} columnIndex - 컬럼인덱스
             */
            setColumnIndex(columnIndex: number): void {
                this.columnIndex = columnIndex;
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
             * @return {Admin.Grid.Panel} grid
             */
            getGrid(): Admin.Grid.Panel {
                return this.grid;
            }

            /**
             * 컬럼의 최소 너비를 가져온다.
             *
             * @return {number} minWidth - 최소너비
             */
            getMinWidth(): number {
                if (this.columns.length == 0) {
                    return this.minWidth ?? this.width;
                } else {
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
                this.grid.updateLayout();
            }

            /**
             * 컬럼의 숨김여부를 변경한다.
             *
             * @param {boolean} hidden - 숨김여부
             */
            setHidden(hidden: boolean): void {
                this.hidden = hidden;
                this.grid.updateLayout();
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
             * 컬럼 크기조절가능여부를 가져온다.
             *
             * @return {boolean} resizable
             */
            isResizable(): boolean {
                if (this.getGrid().columnResizable === false) {
                    return false;
                }

                if (this.hasChild() == true) {
                    return false;
                } else {
                    return this.resizable;
                }
            }

            /**
             * 컬럼이 고정된 상태인지 가져온다.
             *
             * @return {boolean} freeze
             */
            isFreezeColumn(): boolean {
                return this.grid.freezeColumn > this.columnIndex;
            }

            /**
             * 컬럼의 헤더컬럼 레이아웃을 가져온다.
             *
             * @return {Dom} $layout
             */
            $getHeader(): Dom {
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
                            } else {
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
                            resize: (_$target: Dom, rect: DOMRect, position: { x: number; y: number }) => {
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
                                    } else {
                                        const speed = Math.min(Math.ceil((x - (offset.left + width - 15)) / 30), 15);
                                        this.grid.getScrollbar().setAutoScroll(speed, 0);
                                    }
                                } else if (
                                    this.isFreezeColumn() == false &&
                                    x < offset.left + this.grid.freezeWidth + 15
                                ) {
                                    if (rect.left > this.grid.freezeWidth + scroll.x + 50) {
                                        this.grid.getScrollbar().setAutoScroll(0, 0);
                                    } else {
                                        const speed = Math.max(
                                            Math.floor((x - (offset.left + this.grid.freezeWidth - 15)) / 30),
                                            -15
                                        );
                                        this.grid.getScrollbar().setAutoScroll(speed, 0);
                                    }
                                } else {
                                    this.grid.getScrollbar().setAutoScroll(0, 0);
                                }
                            },
                            end: (_$target: Dom, rect: DOMRect) => {
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
             * @param {Admin.Data.Record} record - 컬럼이 속한 행의 모든 데이터셋
             * @param {number} rowIndex - 행 인덱스
             * @param {number} columnIndex - 열 인덱스
             * @return {Dom} $layout
             */
            $getBody(value: any, record: Admin.Data.Record, rowIndex: number, columnIndex: number): Dom {
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

                $column.on('mousedown', (e: MouseEvent) => {
                    const $column = Html.el(e.currentTarget);
                    this.grid.focusCell($column.getData('row'), $column.getData('column'));
                });

                const $view = Html.create('div').setData('role', 'view');
                if (this.renderer !== null) {
                    $view.html(this.renderer(value, record, $column, rowIndex, columnIndex, this, this.getGrid()));
                } else {
                    $view.html(value);
                }

                $column.append($view);

                if (this.isHidden() == true) {
                    $column.setStyle('display', 'none');
                }

                return $column;
            }
        }

        export class Check extends Admin.Grid.Column {
            /**
             * 그리드패널 컬럼객체를 생성한다.
             *
             * @param {Admin.Grid.Column.Properties} properties - 객체설정
             */
            constructor(properties: Admin.Grid.Column.Properties = null) {
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
            getMinWidth(): number {
                return this.width;
            }

            /**
             * 컬럼너비를 변경한다.
             *
             * @param {number} _width - 변경할 너비
             */
            setWidth(_width: number): void {
                return;
            }

            /**
             * 컬럼의 숨김여부를 변경한다.
             *
             * @param {boolean} _hidden - 숨김여부
             */
            setHidden(_hidden: boolean): void {
                return;
            }

            /**
             * 컬럼의 숨김여부를 가져온다.
             *
             * @return {boolean} hidden
             */
            isHidden(): boolean {
                return false;
            }

            /**
             * 컬럼 크기조절가능여부를 가져온다.
             *
             * @return {boolean} resizable
             */
            isResizable(): boolean {
                return false;
            }

            /**
             * 컬럼의 헤더컬럼 레이아웃을 가져온다.
             *
             * @return {Dom} $layout
             */
            $getHeader(): Dom {
                if (this.dataIndex == '@') {
                    const $header = Html.create('div').setData('component', this.id);
                    $header.setData('role', 'column');
                    $header.addClass('check');
                    $header.setStyle('width', this.width + 'px');

                    const $label = Html.create('label');
                    $header.append($label);

                    $header.on('click', (e: MouseEvent) => {
                        if ($header.hasClass('checked') == true) {
                            this.getGrid().deselectAll();
                        } else {
                            this.getGrid().selectAll();
                        }

                        e.stopImmediatePropagation();
                    });

                    this.getGrid().addEvent('update', (grid: Admin.Grid.Panel) => {
                        const rows = Html.all('> div[data-role=row]', grid.$getBody());
                        const selected = Html.all('> div[data-role=row].selected', grid.$getBody());

                        if (rows.getCount() > 0 && rows.getCount() == selected.getCount()) {
                            $header.addClass('checked');
                        } else {
                            $header.removeClass('checked');
                        }
                    });

                    this.getGrid().addEvent(
                        'selectionChange',
                        (_selections: Admin.Data.Record[], grid: Admin.Grid.Panel) => {
                            const rows = Html.all('> div[data-role=row]', grid.$getBody());
                            const selected = Html.all('> div[data-role=row].selected', grid.$getBody());

                            if (rows.getCount() > 0 && rows.getCount() == selected.getCount()) {
                                $header.addClass('checked');
                            } else {
                                $header.removeClass('checked');
                            }
                        }
                    );

                    return $header;
                } else {
                    return super.$getHeader();
                }
            }

            /**
             * 컬럼의 데이터컬럼 레이아웃을 가져온다.
             *
             * @param {any} value - 컬럼의 dataIndex 데이터
             * @param {Admin.Data.Record} record - 컬럼이 속한 행의 모든 데이터셋
             * @param {number} rowIndex - 행 인덱스
             * @param {number} columnIndex - 열 인덱스
             * @return {Dom} $layout
             */
            $getBody(value: any, record: Admin.Data.Record, rowIndex: number, columnIndex: number): Dom {
                const $column = Html.create('div')
                    .setData('role', 'column')
                    .setData('row', rowIndex)
                    .setData('column', columnIndex)
                    .setData('record', record, false)
                    .setData('value', value, false);
                $column.addClass('check');
                if (this.dataIndex == '@') {
                    $column.addClass('selection');
                } else {
                    if (value == true) {
                        $column.addClass('checked');
                    }
                }

                $column.setStyle('width', this.width + 'px');
                $column.on('click', (e: MouseEvent) => {
                    if (this.dataIndex == '@') {
                        if (this.getGrid().isRowSelected(rowIndex) == true) {
                            this.getGrid().deselectRow(rowIndex);
                        } else {
                            this.getGrid().selectRow(rowIndex, true);
                        }
                    }
                    this.getGrid().onSelectionComplete();
                    e.stopImmediatePropagation();
                });

                const $label = Html.create('label');
                $label.addClass(this.headerAlign);
                $column.append($label);

                return $column;
            }
        }

        export class Renderer {
            static Date(
                format: string = 'YYYY.MM.DD(dd)'
            ): (
                value: any,
                record: Admin.Data.Record,
                $dom: Dom,
                rowIndex: number,
                columnIndex: number,
                column: Admin.Grid.Column,
                grid: Admin.Grid.Panel
            ) => string {
                return (value) => {
                    return value === null
                        ? ''
                        : '<time>' + moment.unix(value).locale(Admin.getLanguage()).format(format) + '</time>';
                };
            }

            static DateTime(
                format: string = 'YYYY.MM.DD(dd) HH:mm'
            ): (
                value: any,
                record: Admin.Data.Record,
                $dom: Dom,
                rowIndex: number,
                columnIndex: number,
                column: Admin.Grid.Column,
                grid: Admin.Grid.Panel
            ) => string {
                return Admin.Grid.Renderer.Date(format);
            }

            static Number(): (
                value: any,
                record: Admin.Data.Record,
                $dom: Dom,
                rowIndex: number,
                columnIndex: number,
                column: Admin.Grid.Column,
                grid: Admin.Grid.Panel
            ) => string {
                return (value, _record, $dom) => {
                    $dom.setStyle('text-align', 'right');
                    return Format.number(value, Admin.getLanguage());
                };
            }
        }

        export class Pagination extends Admin.Toolbar {
            grid: Admin.Grid.Panel = null;
            store: Admin.Store = null;

            firstButton: Admin.Button;
            prevButton: Admin.Button;
            nextButton: Admin.Button;
            lastButton: Admin.Button;
            pageInput: Admin.Form.Field.Number;
            pageDisplay: Admin.Form.Field.Display;

            /**
             * 페이징 툴바를 생성한다.
             *
             * @param {Admin.Component[]} items - 추가 툴바 아이템
             */
            constructor(items: Admin.Component[] = []) {
                super(items);
            }

            /**
             * 부모객체를 지정한다.
             *
             * @param {Admin.Grid.Panel} grid - 그리드패널
             * @return {Admin.Grid.Pagination} this
             */
            setParent(grid: Admin.Grid.Panel): this {
                if (grid instanceof Admin.Grid.Panel) {
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
             * @return {Admin.Button} firstButton
             */
            getFirstButton(): Admin.Button {
                if (this.firstButton === undefined) {
                    this.firstButton = new Admin.Button({
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
             * @return {Admin.Button} prevButton
             */
            getPrevButton(): Admin.Button {
                if (this.prevButton === undefined) {
                    this.prevButton = new Admin.Button({
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
             * @return {Admin.Button} nextButton
             */
            getNextButton(): Admin.Button {
                if (this.nextButton === undefined) {
                    this.nextButton = new Admin.Button({
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
             * @return {Admin.Button} lastButton
             */
            getLastButton(): Admin.Button {
                if (this.lastButton === undefined) {
                    this.lastButton = new Admin.Button({
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
             * @return {Admin.Form.Field.Number} pageInput
             */
            getPageInput(): Admin.Form.Field.Number {
                if (this.pageInput === undefined) {
                    this.pageInput = new Admin.Form.Field.Number({
                        minValue: 1,
                        width: 50,
                        spinner: false,
                    });

                    this.pageInput.$getInput().on('keydown', (e: KeyboardEvent) => {
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
             * @return {Admin.Form.Field.Display} pageDisplay
             */
            getPageDisplay(): Admin.Form.Field.Display {
                if (this.pageDisplay === undefined) {
                    this.pageDisplay = new Admin.Form.Field.Display({
                        value: '1',
                        renderer: (value) => {
                            return '/ ' + Format.number(value) + ' ' + Admin.printText('texts.page');
                        },
                    });
                }

                return this.pageDisplay;
            }

            /**
             * 툴바의 하위 컴포넌트를 초기화한다.
             */
            initItems(): void {
                if (this.items === null) {
                    this.items = [];

                    if (this.grid !== null) {
                        this.items.push(this.getFirstButton());
                        this.items.push(this.getPrevButton());
                        this.items.push(new Admin.Toolbar.Item('-'));
                        this.items.push(this.getPageInput());
                        this.items.push(this.getPageDisplay());
                        this.items.push(new Admin.Toolbar.Item('-'));
                        this.items.push(this.getNextButton());
                        this.items.push(this.getLastButton());

                        if (this.properties.items.length > 0) {
                            this.items.push(new Admin.Toolbar.Item('-'));
                        }
                    }

                    for (const item of this.properties.items ?? []) {
                        if (item instanceof Admin.Component) {
                            item.setLayoutType('column-item');
                            this.items.push(item);
                        } else if (typeof item == 'string') {
                            this.items.push(new Admin.Toolbar.Item(item));
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
            movePage(position: 'FIRST' | 'PREV' | 'NEXT' | 'LAST'): void {
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
            render(): void {
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
            setDisabled(disabled: boolean): this {
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
            onUpdate(): void {
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
                } else {
                    this.disable();
                }
            }
        }
    }
}
