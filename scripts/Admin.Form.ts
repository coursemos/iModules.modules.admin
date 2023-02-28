/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 폼 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Form.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 26.
 */
namespace Admin {
    export namespace Form {
        export class Panel extends Admin.Panel {
            fieldDefaults: {
                labelWidth?: number;
                labelPosition?: string;
                labelAlign?: string;
                labelSeparator?: string;
                width?: number;
            };

            /**
             * 기본필드 클래스 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties: { [key: string]: any } = null) {
                super(properties);

                this.fieldDefaults = this.properties.fieldDefaults ?? null;
            }

            /**
             * 폼 패널의 하위 컴포넌트를 정의한다.
             */
            initItems(): void {
                if (this.items === null) {
                    this.items = [];

                    for (const item of this.properties.items ?? []) {
                        if (item instanceof Admin.Component) {
                            if (item instanceof Admin.Form.Field.Base) {
                                item.setDefaults(this.fieldDefaults);
                            }

                            this.items.push(item);
                        }
                    }

                    super.initItems();
                }
            }
        }

        export namespace Field {
            export class Base extends Admin.Component {
                type: string = 'form';
                role: string = 'field';
                field: string = 'base';

                name: string;
                label: string;
                labelPosition: string;
                labelAlign: string;
                labelWidth: number;
                labelSeparator: string;
                helpText: string;

                width: number;

                value: string | number | string[] | number[] = null;

                fieldDefaults: {
                    labelWidth?: number;
                    labelPosition?: string;
                    labelAlign?: string;
                    labelSeparator?: string;
                    width?: number;
                };

                /**
                 * 기본필드 클래스 생성한다.
                 *
                 * @param {Object} properties - 객체설정
                 */
                constructor(properties: { [key: string]: any } = null) {
                    super(properties);

                    this.name = this.properties.name = this.properties.name ?? this.id;
                    this.label = this.properties.fieldLabel ?? null;
                    this.labelPosition = this.properties.labelPosition ?? null;
                    this.labelAlign = this.properties.labelAlign ?? null;
                    this.labelWidth = this.properties.labelWidth ?? null;
                    this.labelSeparator = this.properties.labelSeparator ?? null;
                    this.helpText = this.properties.helpText ?? null;
                    this.padding = this.properties.padding ?? 0;
                    this.width = this.properties.width ?? null;
                    this.fieldDefaults = null;
                    this.scrollable = false;

                    this.value = this.properties.value ?? null;

                    if (this.label !== null) {
                        this.$setTop();
                    }

                    if (this.helpText !== null) {
                        this.$setBottom();
                    }
                }

                /**
                 * 필드의 하위 필드를 정의한다.
                 */
                initItems(): void {
                    if (this.items === null) {
                        this.items = [];

                        for (const item of this.properties.items ?? []) {
                            if (item instanceof Admin.Component) {
                                if (item instanceof Admin.Form.Field.Base) {
                                    item.setDefaults(this.fieldDefaults);
                                }

                                this.items.push(item);
                            }
                        }
                    }

                    super.initItems();
                }

                /**
                 * 필드 기본값을 적용한다.
                 *
                 * @param {Object} defaults - 필드 기본값
                 */
                setDefaults(
                    defaults: {
                        labelWidth?: number;
                        labelPosition?: string;
                        labelAlign?: string;
                        labelSeparator?: string;
                        width?: number;
                    } = null
                ): void {
                    this.initItems();

                    this.fieldDefaults = defaults;
                    this.labelWidth ??= defaults?.labelWidth ?? null;
                    this.labelPosition ??= defaults?.labelPosition ?? null;
                    this.labelAlign ??= defaults?.labelAlign ?? null;
                    this.labelSeparator ??= defaults?.labelSeparator ?? null;
                    this.width ??= defaults?.width ?? null;

                    for (const item of this.items) {
                        if (item instanceof Admin.Form.Field.Base) {
                            item.setDefaults(defaults);
                        }
                    }
                }

                /**
                 * 필드 라벨 위치를 가져온다.
                 *
                 * @return {string} labelPosition
                 */
                getLabelPosition(): string {
                    return this.labelPosition ?? 'left';
                }

                /**
                 * 필드 라벨 정렬방식을 가져온다.
                 *
                 * @return {string} labelAlign
                 */
                getLabelAlign(): string {
                    return this.labelAlign ?? 'left';
                }

                /**
                 * 필드 라벨의 너비를 가져온다.
                 *
                 * @return {number} labelWidth
                 */
                getLabelWidth(): number {
                    return this.labelWidth ?? 100;
                }

                /**
                 * 필드너비를 설정한다.
                 *
                 * @param {number} width - 너비(NULL 인 경우 최대너비)
                 */
                setWidth(width: number): void {
                    this.$getComponent().setStyle('width', width === null ? null : width + 'px');
                }

                /**
                 * 필드값을 지정한다.
                 *
                 * @param {(string|number)} value - 값
                 */
                setValue(value: string | number): void {
                    this.value = value;
                }

                /**
                 * 필드값을 가져온다.
                 *
                 * @return {(string|number)} value - 값
                 */
                getValue(): string | number | string[] | number[] {
                    return this.value;
                }

                /**
                 * 필드 라벨을 랜더링한다.
                 */
                renderTop(): void {
                    if (this.label === null) return;

                    const $top = this.$getTop();
                    const $label = Html.create('label');
                    $label.text(this.label + (this.labelSeparator ?? ':'));
                    $label.addClass(this.getLabelAlign());
                    $top.append($label);
                }

                /**
                 * 도움말 텍스트를 랜더링한다.
                 */
                renderBottom(): void {
                    if (this.helpText === null) return;

                    const $bottom = this.$getBottom();
                    const $text = Html.create('p');
                    $text.text(this.helpText);
                    $bottom.append($text);
                }

                /**
                 * 필드를 랜더링한다.
                 */
                render(): void {
                    this.$getContainer().addClass(this.getLabelPosition());
                    this.$getContent().setData('field', this.field);
                    super.render();

                    this.updateLayout();
                }

                /**
                 * 필드 레이아웃을 업데이트한다.
                 */
                updateLayout(): void {
                    this.setWidth(this.width);

                    if (this.label !== null) {
                        if (this.getLabelPosition() == 'left' || this.getLabelPosition() == 'right') {
                            this.$getTop().setStyle('width', this.getLabelWidth() + 'px');
                            this.$getContent().setStyle('width', 'calc(100% - ' + this.getLabelWidth() + 'px)');
                        } else {
                            this.$getTop().setStyle('width', '100%');
                            this.$getContent().setStyle('width', '100%');
                        }
                    } else {
                        this.$getContent().setStyle('width', '100%');
                    }

                    if (this.helpText !== null) {
                        if (this.getLabelPosition() == 'left') {
                            this.$getBottom().setStyle(
                                'padding-left',
                                this.label == null ? 0 : this.getLabelWidth() + 'px'
                            );
                        }
                        if (this.getLabelPosition() == 'right') {
                            this.$getBottom().setStyle(
                                'padding-right',
                                this.label == null ? 0 : this.getLabelWidth() + 'px'
                            );
                        }
                    }
                }
            }

            export class Container extends Admin.Form.Field.Base {
                field: string = 'container';
                direction: 'row' | 'column' = 'row';
                gap: number;

                /**
                 * 필드 컨테이너를 생성한다.
                 *
                 * @param {Object} properties - 객체설정
                 */
                constructor(properties: { [key: string]: any } = null) {
                    super(properties);

                    this.direction = this.properties.direction ?? 'row';
                    this.gap = this.properties.gap ?? 5;
                }

                /**
                 * 필드 컨테이너에 속한 필드를 랜더링한다.
                 */
                renderContent(): void {
                    const $fields = Html.create('div', { 'data-role': 'fields' });
                    $fields.setStyle('flex-direction', this.direction);
                    $fields.setStyle('gap', this.gap + 'px');
                    for (let item of this.getItems()) {
                        $fields.append(item.$getComponent());

                        if (item.properties.flex !== undefined) {
                            item.$getComponent().setStyle(
                                'flex-grow',
                                item.properties.flex === true ? 1 : item.properties.flex
                            );
                            item.$getComponent().addClass('flex');
                        }

                        if (item.isRenderable() == true) {
                            item.render();
                        }
                    }
                    this.$getContent().append($fields);
                }
            }

            export class Text extends Admin.Form.Field.Base {
                field: string = 'text';
                inputType: string = 'text';
                emptyText: string;

                $input: Dom;
                $emptyText: Dom;

                /**
                 * 기본필드 클래스 생성한다.
                 *
                 * @param {Object} properties - 객체설정
                 */
                constructor(properties: { [key: string]: any } = null) {
                    super(properties);

                    this.emptyText = this.properties.emptyText ?? '';
                    this.emptyText = this.emptyText.length == 0 ? null : this.emptyText;
                }

                /**
                 * INPUT 필드 DOM 을 가져온다.
                 *
                 * @return {Dom} $input
                 */
                $getInput(): Dom {
                    if (this.$input === undefined) {
                        this.$input = Html.create('input', {
                            type: this.inputType,
                            name: this.name,
                        });
                        this.$input.on('input', (e: InputEvent) => {
                            const input = e.currentTarget as HTMLInputElement;
                            this.setValue(input.value);
                        });
                    }

                    return this.$input;
                }

                /**
                 * placeHolder DOM 객체를 가져온다.
                 *
                 * @return {Dom} $emptyText
                 */
                $getEmptyText(): Dom {
                    if (this.$emptyText === undefined) {
                        this.$emptyText = Html.create('div', { 'data-role': 'empty' });
                    }

                    return this.$emptyText;
                }

                /**
                 * placeHolder 문자열을 설정한다.
                 *
                 * @param {string} emptyText - placeHolder (NULL 인 경우 표시하지 않음)
                 */
                setEmptyText(emptyText: string = null): void {
                    this.emptyText = emptyText === null || emptyText.length == 0 ? null : emptyText;

                    if (this.isRendered() == true) {
                        this.updateLayout();
                    }
                }

                /**
                 * 필드값을 지정한다.
                 *
                 * @param {(string|number)} value - 값
                 */
                setValue(value: string | number): void {
                    value = value.toString();
                    if (this.$getInput().getValue() != value) {
                        this.$getInput().setValue(value);
                    }

                    if (value.length > 0) {
                        this.$emptyText.hide();
                    } else {
                        this.$emptyText.show();
                    }

                    super.setValue(value);
                }

                /**
                 * INPUT 태그를 랜더링한다.
                 */
                renderContent(): void {
                    const $input = this.$getInput();
                    this.$getContent().append($input);
                }

                /**
                 * 필드 레이아웃을 업데이트한다.
                 */
                updateLayout(): void {
                    super.updateLayout();

                    if (this.properties.emptyText !== null) {
                        const $emptyText = this.$getEmptyText();
                        $emptyText.html(this.emptyText);
                        this.$getContent().append($emptyText);
                    } else {
                        this.$getEmptyText().remove();
                    }
                }
            }

            export class Password extends Admin.Form.Field.Text {
                inputType: string = 'password';
            }

            export class Search extends Admin.Form.Field.Text {
                inputType: string = 'search';
            }

            export class Number extends Admin.Form.Field.Text {
                inputType: string = 'number';
            }

            export class Select extends Admin.Form.Field.Base {
                field: string = 'select';

                store: Admin.Store;
                search: boolean;
                multiple: boolean;
                emptyText: string;
                $emptyText: Dom;

                displayField: string;
                valueField: string;
                listField: string;

                rawValue: any;

                renderer: Admin.Form.Field.Select.renderer;
                listRenderer: Admin.List.renderer;
                $display: Dom;

                absolute: Admin.Absolute;
                list: Admin.List.Panel;

                /**
                 * 기본필드 클래스 생성한다.
                 *
                 * @param {Object} properties - 객체설정
                 */
                constructor(properties: { [key: string]: any } = null) {
                    super(properties);

                    this.search = this.properties.search === true;
                    this.multiple = this.properties.multiple === true;
                    this.emptyText = this.properties.emptyText ?? '';
                    this.emptyText = this.emptyText.length == 0 ? null : this.emptyText;

                    this.displayField = this.properties.displayField ?? 'display';
                    this.valueField = this.properties.valueField ?? 'value';
                    this.listField = this.properties.listField ?? 'display';

                    this.rawValue = this.properties.value ?? null;
                    this.value = null;

                    this.renderer =
                        this.properties.displayRenderer ??
                        ((_field, display, _record): string => {
                            if (Array.isArray(display) == true) {
                            } else if (typeof display == 'string' && display.length > 0) {
                                return display;
                            }

                            return '';
                        });

                    this.listRenderer =
                        this.properties.listRenderer ??
                        ((_list, display, _record): string => {
                            return display;
                        });
                }

                /**
                 * 절대위치 목록 컴포넌트를 가져온다.
                 *
                 * @return {Admin.Absolute} absolute
                 */
                getAbsolute(): Admin.Absolute {
                    if (this.absolute === undefined) {
                        this.absolute = new Admin.Absolute({
                            $target: this.$getContent(),
                            items: [this.getList()],
                            width: '100%',
                            listeners: {
                                show: (absolute: Admin.Absolute) => {
                                    // @todo 위치에 따라 위로 보일지 아래로 보일지 설정한다.
                                    absolute.setPosition('100%', null, null, 0);
                                    this.$getContent().addClass('expand');
                                },
                                hide: () => {
                                    this.$getContent().removeClass('expand');
                                },
                            },
                        });
                    }

                    return this.absolute;
                }

                /**
                 * 목록 컴포넌트를 가져온다.
                 *
                 * @return {Admin.List.Panel} list
                 */
                getList(): Admin.List.Panel {
                    if (this.list === undefined) {
                        this.list = new Admin.List.Panel({
                            store: this.properties.store,
                            renderer: this.listRenderer,
                            displayField: this.displayField,
                            valueField: this.valueField,
                            multiple: this.multiple,
                            listeners: {
                                load: () => {
                                    this.onLoad();
                                },
                                selectionChange: (
                                    _list: Admin.List.Panel,
                                    selection: Admin.Data.Record | Admin.Data.Record[]
                                ) => {
                                    if (selection instanceof Admin.Data.Record) {
                                        this.setValue(selection.get(this.valueField));
                                    } else if (Array.isArray(selection) == true) {
                                    }
                                },
                                selectionComplete: () => {
                                    this.collapse();
                                },
                            },
                        });
                    }
                    return this.list;
                }

                /**
                 * 데이터스토어를 가져온다.
                 *
                 * @return {Admin.Store} store
                 */
                getStore(): Admin.Store {
                    return this.getList().getStore();
                }

                /**
                 * placeHolder DOM 객체를 가져온다.
                 *
                 * @return {Dom} $emptyText
                 */
                $getEmptyText(): Dom {
                    if (this.$emptyText === undefined) {
                        this.$emptyText = Html.create('div', { 'data-role': 'empty' });
                    }

                    return this.$emptyText;
                }

                /**
                 * 디스플레이 DOM 객체를 가져온다.
                 *
                 * @return {Dom} $display
                 */
                $getDisplay(): Dom {
                    if (this.$display === undefined) {
                        this.$display = Html.create('div', { 'data-role': 'display' });
                    }

                    return this.$display;
                }

                /**
                 * 디스플레이 내용을 설정한다.
                 *
                 * @return {string} display - 표시할 문자열
                 */
                $setDisplay(display: string): void {
                    this.$display.html(display);
                }

                /**
                 * placeHolder 문자열을 설정한다.
                 *
                 * @param {string} emptyText - placeHolder (NULL 인 경우 표시하지 않음)
                 */
                setEmptyText(emptyText: string = null): void {
                    this.emptyText = emptyText === null || emptyText.length == 0 ? null : emptyText;

                    if (this.isRendered() == true) {
                        this.updateLayout();
                    }
                }

                /**
                 * 필드값을 지정한다.
                 *
                 * @param {string|number} value - 값
                 */
                setValue(value: string | number | string[] | number[]): void {
                    this.rawValue = value;

                    if (this.getStore().isLoaded() == false) {
                        this.getStore().load();
                        return;
                    }

                    if (Array.isArray(value) == true) {
                    } else {
                        const record = this.getStore().find(this.valueField, value);

                        if (record == null) {
                            this.value = null;
                            this.$getEmptyText().show();
                        } else {
                            this.value = record.get(this.valueField);
                            this.$getEmptyText().hide();
                        }

                        this.$setDisplay(this.renderer(this, record.get(this.displayField), record));
                    }
                }

                /**
                 * 필드의 DOM 객체의 일부 키보드 이벤트를 목록 컴포넌트로 전달한다.
                 *
                 * @param {Dom} $target - DOM 객체
                 */
                setKeyboardEvent($target: Dom): void {
                    $target.on('keydown', (e: KeyboardEvent) => {
                        if (e.key == 'ArrowDown' || e.key == 'ArrowUp' || e.key == 'Enter') {
                            if (this.isExpand() == false) {
                                this.expand();
                            }
                            this.getList()
                                .$getComponent()
                                .getEl()
                                .dispatchEvent(new KeyboardEvent('keydown', { key: e.key }));
                        }

                        if (e.key == 'Escape') {
                            this.collapse();
                        }

                        if (e.key == 'Enter') {
                            e.preventDefault();
                        }
                    });
                }

                /**
                 * 선택목록을 확장한다.
                 */
                expand(): void {
                    this.getAbsolute().show();

                    if (this.value !== null) {
                        this.getStore()
                            .getRecords()
                            .forEach((record: Admin.Data.Record, index: number) => {
                                if (record.get(this.valueField) == this.value) {
                                    this.getList().select(index);
                                }
                            });
                    }
                }

                /**
                 * 선택목록을 최소화한다.
                 */
                collapse(): void {
                    this.getAbsolute().hide();
                }

                /**
                 * 선택목록이 확장되어 있는지 확인한다.
                 *
                 * @return {boolean} isExpand
                 */
                isExpand(): boolean {
                    return this.getAbsolute().isShow() == true;
                }

                /**
                 * 상황에 따라 필드에 포커스를 적용한다.
                 */
                focus(): void {
                    if (this.search == true) {
                        Html.get('> input[type=search]', this.$getContent()).getEl().focus();
                    } else {
                        Html.get('> button', this.$getContent()).getEl().focus();
                    }
                }

                /**
                 * 선택항목을 검색한다.
                 *
                 * @param {string} keyword - 검색어
                 */
                match(keyword: string): void {
                    if (keyword.length > 0) {
                        this.expand();
                        if (this.value === null) {
                            this.$getEmptyText().hide();
                        } else {
                            this.$getDisplay().hide();
                        }
                    } else {
                        this.collapse();
                        if (this.value === null) {
                            this.$getEmptyText().show();
                        } else {
                            this.$getDisplay().show();
                        }
                    }

                    // @todo 실제 목록 검색 및 필터링
                }

                /**
                 * 필드를 랜더링한다.
                 */
                renderContent(): void {
                    const $button = Html.create('button', { type: 'button' });
                    if (this.search == true) {
                        $button.setAttr('tabindex', '-1');
                    } else {
                        $button.setAttr('tabindex', '0');
                    }
                    $button.on('click', (e: MouseEvent) => {
                        const $button = Html.el(e.currentTarget);
                        if (this.isExpand() == true) {
                            this.collapse();
                        } else {
                            this.expand();
                        }

                        $button.getEl().focus();
                    });
                    this.setKeyboardEvent($button);

                    const $display = this.$getDisplay();
                    $button.append($display);

                    this.$getContent().append($button);

                    if (this.search === true) {
                        const $search = Html.create('input', { 'type': 'search', 'tabindex': '0' });
                        $search.on('input', (e: InputEvent) => {
                            const $search = Html.el(e.currentTarget);
                            this.match($search.getValue());
                        });
                        this.setKeyboardEvent($search);
                        this.$getContent().append($search);
                    }
                }

                /**
                 * 필드 레이아웃을 업데이트한다.
                 */
                updateLayout(): void {
                    super.updateLayout();

                    if (this.properties.emptyText !== null) {
                        const $emptyText = this.$getEmptyText();
                        $emptyText.html(this.emptyText);
                        this.$getContent().append($emptyText);
                    } else {
                        this.$getEmptyText().remove();
                    }
                }

                /**
                 * 셀렉트폼이 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender(): void {
                    super.onRender();

                    if (this.rawValue !== null) {
                        if (this.getStore().isLoaded() === true) {
                            this.setValue(this.rawValue);
                        } else {
                            this.getStore().load();
                        }
                    }
                }

                /**
                 * 셀렉트폼의 목록 데이터가 로딩되었을 때 이벤트를 처리한다.
                 */
                onLoad(): void {
                    if (this.rawValue !== null) {
                        this.setValue(this.rawValue);
                    }
                }

                /**
                 * 컴포넌트를 제거한다.
                 */
                remove(): void {
                    this.getAbsolute().remove();
                    super.remove();
                }
            }

            export namespace Select {
                export interface renderer {
                    (
                        field: Admin.Form.Field.Select,
                        display: string | string[],
                        record: Admin.Data.Record | Admin.Data.Record[]
                    ): string;
                }
            }

            export class TextArea extends Admin.Form.Field.Base {
                rows: number;

                /**
                 * 기본필드 클래스 생성한다.
                 *
                 * @param {Object} properties - 객체설정
                 */
                constructor(properties: { [key: string]: any } = null) {
                    super(properties);

                    this.rows = this.properties.rows ?? 5;
                }

                /**
                 * 필드태그를 랜더링한다.
                 */
                renderContent(): void {
                    const $input = Html.create('textarea', { name: this.name, rows: this.rows.toString() });
                    this.$getContent().append($input);

                    this.$getContent().setData('type', 'textarea');
                }
            }
        }
    }
}
