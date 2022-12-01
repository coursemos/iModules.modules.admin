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
var Admin;
(function (Admin) {
    let Grid;
    (function (Grid) {
        class Panel extends Admin.Panel {
            type = 'panel';
            role = 'grid';
            store;
            gridHeader;
            $gridBody;
            /**
             * 그리드패널을 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.scrollable = this.properties.scrollable ?? true;
                this.store = this.properties.store ?? new Admin.Store();
                this.store.addEvent('load', (grid) => {
                    grid.update();
                }, [this]);
                this.gridHeader = new Admin.Grid.Header(this.properties.columns ?? []);
                this.$gridBody = Html.create('div').setData('role', 'body');
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
             * 그리드패널의 헤더(테이블 제목행)을 가져온다.
             *
             * @return {Admin.Grid.Header} header
             */
            getGridHeader() {
                return this.gridHeader;
            }
            /**
             * 그리드패널의 전체 컬럼을 가져온다.
             *
             * @return {Admin.Grid.Column[]} columns
             */
            getColumns() {
                return this.getGridHeader().getColumns();
            }
            /**
             * 그리드 데이터를 업데이트한다.
             */
            update() {
                if (this.getStore().isLoaded() === false)
                    return;
                if (typeof this.updateLayout === 'function')
                    this.updateLayout();
            }
            /**
             * 바디 레이아웃을 랜더링한다.
             */
            renderBody() {
                if (this.$body.getData('rendered') == true)
                    return;
                this.$body.append(this.gridHeader.$getComponent());
                this.gridHeader.render();
                this.$body.append(this.$gridBody);
                this.$body.setData('rendered', true);
            }
            /**
             * 그리드패널이 화면상에 출력되었을 때 이벤트를 처리한다.
             */
            onRender() {
                if (this.getStore().autoLoad === true) {
                    this.getStore().load();
                }
                super.onRender();
            }
            /**
             * 그리드패널 레이아웃을 갱신한다.
             */
            updateLayout() {
                this.getStore()
                    .getRecords()
                    .forEach((record, rowIndex) => {
                    const $row = Html.create('div').setData('role', 'row').setData('row-index', rowIndex);
                    this.getColumns().forEach((column, colIndex) => {
                        const value = record.get(column.dataIndex);
                        $row.append(column.$getBody(value, record, rowIndex, colIndex));
                    });
                    this.$gridBody.append($row);
                });
            }
        }
        Grid.Panel = Panel;
        class Header extends Admin.Component {
            type = 'grid';
            role = 'header';
            headers = [1, 2, 3];
            /**
             * 그리드패널 헤더를 생성한다.
             *
             * @param {object[]} columns - 컬럼
             */
            constructor(columns = []) {
                const properties = { items: columns };
                super(properties);
                this.initColumns();
            }
            /**
             * 그리드패널 헤더의 하위 컴포넌트를 초기화한다.
             */
            initColumns() {
                this.items = [];
                this.headers = [];
                for (let item of this.properties.items ?? []) {
                    if (!(item instanceof Admin.Grid.Column)) {
                        item = new Admin.Grid.Column(item);
                    }
                    this.headers.push(item);
                    this.items.push(...item.getColumns());
                }
            }
            /**
             * 레이아웃을 렌더링한다.
             */
            render() {
                for (const header of this.headers) {
                    this.$getComponent().append(header.$getHeader());
                }
                super.render();
            }
            /**
             * 전체 컬럼을 가져온다.
             *
             * @return {Admin.Grid.Column[]} columns
             */
            getColumns() {
                let columns = [];
                for (let item of this.items) {
                    if (item instanceof Admin.Grid.Column) {
                        columns.push(item);
                    }
                }
                return columns;
            }
            /**
             * 특정 순서의 컬럼을 가져온다.
             *
             * @param {number} index - 가져올 컬럼의 인덱스
             * @return {Admin.Grid.Column} column - 컬럼
             */
            getAt(index) {
                const item = this.items[index];
                if (item instanceof Admin.Grid.Column) {
                    return item;
                }
                else {
                    return null;
                }
            }
        }
        Grid.Header = Header;
        class Column extends Admin.Base {
            text;
            dataIndex;
            width;
            minWidth;
            headerWrap;
            headerAlign;
            headerVerticalAlign;
            textWrap;
            textAlign;
            textVerticalAlign;
            columns;
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
                this.headerWrap = this.properties.headerAlign ?? true;
                this.headerAlign = this.properties.headerAlign ?? 'left';
                this.headerVerticalAlign = this.properties.headerVerticalAlign ?? 'middle';
                this.textWrap = this.properties.textWrap ?? true;
                this.textAlign = this.properties.textAlign ?? 'left';
                this.textVerticalAlign = this.properties.textVerticalAlign ?? 'middle';
                this.columns = [];
                for (let column of properties?.columns ?? []) {
                    if (column instanceof Admin.Grid.Column) {
                        this.columns.push(column);
                    }
                    else {
                        this.columns.push(new Admin.Grid.Column(column));
                    }
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
                if (this.columns.length == 0) {
                    return this.width === null ? 1 : 0;
                }
                else {
                    let flexGrow = 0;
                    for (let column of this.columns) {
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
                if (this.columns.length == 0) {
                    return this.width ? this.width : this.minWidth ? this.minWidth : 0;
                }
                else {
                    let width = 0;
                    for (let column of this.columns) {
                        width += column.getChildrenFlexBasis();
                    }
                    width += this.columns.length - 1;
                    return width;
                }
            }
            /**
             * 컬럼의 헤더컬럼 레이아웃을 가져온다.
             *
             * @return {Dom} $layout
             */
            $getHeader() {
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
                    const $button = Html.create('button');
                    $button.text('d');
                    $header.append($button);
                }
                return $header;
            }
            /**
             * 컬럼의 데이터컬럼 레이아웃을 가져온다.
             *
             * @param {any} value - 컬럼의 dataIndex 데이터
             * @param {Object} record - 컬럼이 속한 행의 모든 데이터셋
             * @param {number} rowIndex - 행 인덱스
             * @param {number} colIndex - 열 인덱스
             * @return {Dom} $layout
             */
            $getBody(value, record, rowIndex, colIndex) {
                const $column = Html.create('div').setData('role', 'column');
                if (this.width) {
                    $column.setStyle('width', this.width + 'px');
                }
                else {
                    $column.setStyle('flexGrow', 1); //.css("flexBasis",0);
                }
                if (this.minWidth) {
                    $column.setStyle('flexBasis', this.minWidth + 'px');
                    $column.setStyle('width', this.minWidth + 'px');
                }
                $column.addClass(this.textAlign);
                $column.on('click', (e) => {
                    // @todo 컬럼을 선택한다.
                    // Html.el(e.currentTarget).addClass('focus');
                });
                const $display = Html.create('div').setData('display', 'view');
                $display.text(value);
                $column.append($display);
                return $column;
            }
        }
        Grid.Column = Column;
    })(Grid = Admin.Grid || (Admin.Grid = {}));
})(Admin || (Admin = {}));
