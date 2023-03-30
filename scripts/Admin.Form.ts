/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 폼 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Form.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 20.
 */
namespace Admin {
    export namespace Form {
        export namespace Panel {
            export interface Properties extends Admin.Panel.Properties {
                /**
                 * @type {Admin.Form.FieldDefaults} fieldDefaults - 내부 필드의 기본설정값
                 */
                fieldDefaults?: Admin.Form.FieldDefaults;
            }
        }

        export class Panel extends Admin.Panel {
            loading: boolean = false;
            fieldDefaults: Admin.Form.FieldDefaults;

            /**
             * 기본필드 클래스 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties: Admin.Form.Panel.Properties = null) {
                super(properties);

                this.role = 'form';
                this.fieldDefaults = this.properties.fieldDefaults ?? { labelAlign: 'right', labelWidth: 100 };
                this.padding = this.properties.padding ?? 10;
            }

            /**
             * 폼 패널의 하위 컴포넌트를 정의한다.
             */
            initItems(): void {
                if (this.items === null) {
                    this.items = [];

                    for (const item of this.properties.items ?? []) {
                        if (item instanceof Admin.Component) {
                            if (
                                item instanceof Admin.Form.FieldSet ||
                                item instanceof Admin.Form.Field.Container ||
                                item instanceof Admin.Form.Field.Base
                            ) {
                                item.setDefaults(this.fieldDefaults);
                            }

                            this.items.push(item);
                        }
                    }
                }

                super.initItems();
            }

            /**
             * 폼 패널에 속한 필드를 가져온다.
             *
             * @param {string} name - 필드명
             * @return {Admin.Form.Field.Base} field
             */
            getField(name: string): Admin.Form.Field.Base {
                const $field = Html.get(
                    'div[data-component][data-type=form][data-role=field][data-name=' + name + ']',
                    this.$getContent()
                );
                if ($field.getEl() === null) {
                    return null;
                }

                return Admin.getComponent($field.getData('component')) as Admin.Form.Field.Base;
            }

            /**
             * 폼 패널에 속한 모든 필드를 가져온다.
             *
             * @return {Admin.Form.Field.Base[]} fields
             */
            getFields(): Admin.Form.Field.Base[] {
                const fields: Admin.Form.Field.Base[] = [];
                for (const item of this.items ?? []) {
                    if (item instanceof Admin.Form.FieldSet) {
                        fields.push(...item.getFields());
                    } else if (item instanceof Admin.Form.Field.Container) {
                        fields.push(...item.getFields());
                    } else if (item instanceof Admin.Form.Field.Base) {
                        fields.push(item);
                    }
                }

                return fields;
            }

            /**
             * 폼 패널에 속한 모든 필드가 유효한지 확인한다.
             *
             * @return {boolean} is_valid
             */
            async isValid(): Promise<boolean> {
                const validations: Promise<boolean>[] = [];

                this.getFields().forEach((field) => {
                    validations.push(field.isValid());
                });

                const validates = await Promise.all(validations);
                for (const isValid of validates) {
                    if (isValid == false) {
                        return false;
                    }
                }

                return true;
            }

            /**
             * 에러가 발생한 첫번째 필드로 스크롤위치를 이동한다.
             */
            scrollToErrorField(): void {
                for (const field of this.getFields()) {
                    if (field.hasError() == true) {
                        const contentHeight = this.$getContent().getOuterHeight();
                        const position = field.$getComponent().getOffset().top - this.$getContent().getOffset().top;
                        if (position <= 0) {
                            this.getScrollbar()?.movePosition(0, position - 10, true, true);
                        } else if (position >= contentHeight) {
                            const scroll = position - contentHeight + field.$getComponent().getOuterHeight() + 10;
                            this.getScrollbar()?.movePosition(0, scroll, true, true);
                        }
                        break;
                    }
                }
            }

            /**
             * 폼 패널에 속한 모든 필드의 값을 가져온다.
             *
             * @return {Object} values
             */
            getValues(): { [key: string]: any } {
                const values: { [key: string]: any } = {};

                this.getFields().forEach((field) => {
                    Object.assign(values, field.getValues());
                });

                return values;
            }

            /**
             * 폼 패널 데이터를 불러온다.
             *
             * @param {Admin.Form.Request} request - 요청정보
             * @return {Promise<Admin.Ajax.results>} results
             */
            async load({ url, params = null, message = null }: Admin.Form.Request): Promise<Admin.Ajax.Results> {
                if (this.loading === true) {
                    return;
                }

                Admin.Message.loading(Admin.printText('actions/loading'), Admin.printText('actions/wait'));

                this.loading = true;

                const response = await Admin.Ajax.get(url, params);
                if (response.success == true) {
                    for (const name in response.data) {
                        this.getField(name)?.setValue(response.data[name]);
                    }
                }

                this.loading = false;
                Admin.Message.close();

                return response;
            }

            /**
             * 폼 패널을 전송한다.
             *
             * @param {Admin.Form.Request} request - 요청정보
             * @return {Promise<Admin.Ajax.results>} results
             */
            async submit({ url, params = null, message = null }: Admin.Form.Request): Promise<Admin.Ajax.Results> {
                if (this.loading === true) {
                    return;
                }

                const isValid = await this.isValid();
                if (isValid === false) {
                    this.scrollToErrorField();
                    return;
                }

                Admin.Message.loading(Admin.printText('actions/saving'), Admin.printText('actions/wait'));

                this.loading = true;

                const data = this.getValues();
                if (params !== null) {
                    for (const key in params) {
                        data[key] = params[key];
                    }
                }

                const response = await Admin.Ajax.post(url, data);
                if (response.success == false && typeof response.errors == 'object') {
                    for (const name in response.errors) {
                        this.getField(name)?.setError(true, response.errors[name]);
                    }
                    this.scrollToErrorField();
                }

                this.loading = false;
                Admin.Message.close();

                return response;
            }
        }

        export interface FieldDefaults {
            /**
             * @type {number} labelWidth - 필드라벨 너비
             */
            labelWidth?: number;

            /**
             * @type {string} labelPosition - 필드라벨 위치
             */
            labelPosition?: 'top' | 'left';

            /**
             * @type {string} labelAlign - 필드라벨 텍스트정렬(기본값 : left)
             */
            labelAlign?: 'left' | 'right';

            /**
             * @type {string} labelSeparator - 필드라벨 구분자(기본값 : ":")
             */
            labelSeparator?: string;

            /**
             * @type {number} width - 필드 전체너비
             */
            width?: number;
        }

        export interface Request {
            url: string;
            params?: Ajax.Params;
            message?: string;
        }

        export namespace FieldSet {
            export interface Properties extends Admin.Component.Properties {
                /**
                 * @type {string} title - 필드셋 제목
                 */
                title?: string;

                /**
                 * @type {Admin.Form.FieldDefaults} fieldDefaults - 필드셋 내부 필드 기본 설정
                 */
                fieldDefaults?: Admin.Form.FieldDefaults;
            }
        }

        export class FieldSet extends Admin.Component {
            title: string;
            fieldDefaults: Admin.Form.FieldDefaults;

            /**
             * 기본필드 클래스 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties: Admin.Form.FieldSet.Properties = null) {
                super(properties);

                this.type = 'form';
                this.role = 'fieldset';
                this.title = this.properties.title ?? null;
                this.fieldDefaults = this.properties.fieldDefaults ?? null;
                this.padding = this.properties.padding ?? '10px';

                this.$setTop();
            }

            /**
             * 폼 패널의 하위 컴포넌트를 정의한다.
             */
            initItems(): void {
                if (this.items === null) {
                    this.items = [];

                    for (const item of this.properties.items ?? []) {
                        if (item instanceof Admin.Component) {
                            if (
                                item instanceof Admin.Form.FieldSet ||
                                item instanceof Admin.Form.Field.Container ||
                                item instanceof Admin.Form.Field.Base
                            ) {
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
             * @param {Admin.Form.FieldDefaults} defaults - 필드 기본값
             */
            setDefaults(defaults: Admin.Form.FieldDefaults = null): void {
                this.initItems();

                this.fieldDefaults = this.fieldDefaults ?? defaults;

                for (const item of this.items) {
                    if (
                        item instanceof Admin.Form.FieldSet ||
                        item instanceof Admin.Form.Field.Container ||
                        item instanceof Admin.Form.Field.Base
                    ) {
                        item.setDefaults(this.fieldDefaults);
                    }
                }
            }

            /**
             * 상위 폼 패널을 가져온다.
             *
             * @return {Admin.Form.Panel} form
             */
            getForm(): Admin.Form.Panel {
                const $form = this.$getComponent().getParents('div[data-component][data-type=panel][data-role=form]');
                if ($form?.getData('component')) {
                    return Admin.getComponent($form.getData('component')) as Admin.Form.Panel;
                } else {
                    return null;
                }
            }

            /**
             * 필드셋에 속한 모든 필드를 가져온다.
             *
             * @return {Admin.Form.Field.Base[]} fields
             */
            getFields(): Admin.Form.Field.Base[] {
                const fields: Admin.Form.Field.Base[] = [];
                for (const item of this.items ?? []) {
                    if (item instanceof Admin.Form.FieldSet) {
                        fields.push(...item.getFields());
                    } else if (item instanceof Admin.Form.Field.Container) {
                        fields.push(...item.getFields());
                    } else if (item instanceof Admin.Form.Field.Base) {
                        fields.push(item);
                    }
                }

                return fields;
            }

            /**
             * 필드셋 제목을 랜더링한다.
             */
            renderTop(): void {
                const $top = this.$getTop();

                if (this.title !== null) {
                    const $legend = Html.create('legend');
                    $legend.html(this.title);
                    $top.append($legend);
                }
            }

            /**
             * 필드셋을 랜더링한다.
             */
            render(): void {
                super.render();

                const paddingTop = parseInt(this.$getContent().getStyle('padding-top').replace('/px$/', ''), 10);
                this.$getContent().setStyle('padding-top', Math.max(paddingTop, 16) + 'px');
            }
        }

        export namespace Field {
            /**
             * 필드 컴포넌트를 생성한다.
             *
             * @param {Object} field - 필드정보
             * @return {Admin.Form.Field.Base|Admin.Form.FieldSet} field
             */
            export namespace Create {
                export interface Properties {
                    name?: string;
                    label?: string;
                    type?: string;
                    value?: any;
                    default?: any;
                    options?: { [value: string]: string }[];
                    items?: Admin.Form.Field.Create.Properties[];
                    [key: string]: any;
                }
            }
            export function Create(
                field: Admin.Form.Field.Create.Properties
            ): Admin.Form.Field.Base | Admin.Form.FieldSet {
                switch (field.type) {
                    case 'fieldset':
                        return new Admin.Form.FieldSet({
                            title: field.label ?? null,
                            items: ((fields: Admin.Form.Field.Create.Properties[]) => {
                                const items = [];
                                for (const field of fields) {
                                    items.push(Admin.Form.Field.Create(field));
                                }
                                return items;
                            })(field.items ?? []),
                        });

                    case 'number':
                        return new Admin.Form.Field.Number({
                            name: field.name ?? null,
                            fieldLabel: field.label ?? null,
                            value: field.value ?? null,
                            width: 200,
                        });

                    case 'template':
                        return new Admin.Form.Field.Template({
                            name: field.name ?? null,
                            fieldLabel: field.label ?? null,
                            value: field.value?.name ?? null,
                            targetType: field.target.type,
                            targetName: field.target.name,
                        });

                    default:
                        return new Admin.Form.Field.Text({
                            name: field.name ?? null,
                            fieldLabel: field.label ?? null,
                            value: field.value ?? null,
                        });
                }
            }

            export namespace Base {
                export interface Properties extends Admin.Component.Properties {
                    /**
                     * @type {string} name - 필드명
                     */
                    name?: string;

                    /**
                     * @type {string} inputName - 폼 전송시 값이 전달될 필드명(NULL 인 경우 name 사용)
                     */
                    inputName?: string;

                    /**
                     * @type {boolean} allowBlank - 공백허용여부
                     */
                    allowBlank?: boolean;

                    /**
                     * @type {string} label - 라벨텍스트
                     */
                    label?: string;

                    /**
                     * @type {'top'|'left'} labelPosition - 라벨위치
                     */
                    labelPosition?: 'top' | 'left';

                    /**
                     * @type {'left'|'right'} labelAlign - 라벨정렬
                     */
                    labelAlign?: 'left' | 'right';

                    /**
                     * @type {number} labelWidth - 라벨너비
                     */
                    labelWidth?: number;

                    /**
                     * @type {string} labelSeparator - 라벨구분자
                     */
                    labelSeparator?: string;

                    /**
                     * @type {string} helpText - 도움말
                     */
                    helpText?: string;

                    /**
                     * @type {number} width - 필드너비
                     */
                    width?: number;

                    /**
                     * @type {any} value - 필드값
                     */
                    value?: any;

                    /**
                     * @type {Function} validator - 필드값 유효성 체크 함수
                     */
                    validator?: (value: string, field: Admin.Form.Field.Base) => Promise<boolean | string>;

                    /**
                     * @type {boolean} readonly - 읽기전용여부
                     */
                    readonly?: boolean;
                }
            }

            export class Base extends Admin.Component {
                type: string = 'form';
                role: string = 'field';
                field: string = 'base';

                name: string;
                inputName: string;
                allowBlank: boolean;
                label: string;
                labelPosition: string;
                labelAlign: string;
                labelWidth: number;
                labelSeparator: string;
                helpText: string;
                width: number;

                value: any = null;
                oValue: any = null;
                validator: (value: string, field: Admin.Form.Field.Base) => Promise<boolean | string>;
                validation: boolean | string = true;
                readonly: boolean;

                fieldDefaults: Admin.Form.FieldDefaults;

                /**
                 * 기본필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Base.Properties} properties - 객체설정
                 */
                constructor(properties: Admin.Form.Field.Base.Properties = null) {
                    super(properties);

                    this.name = this.properties.name ?? this.id;
                    this.inputName = this.properties.inputName === undefined ? this.name : this.properties.inputName;
                    this.allowBlank = this.properties.allowBlank !== false;
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
                    this.validator = this.properties.validator ?? null;

                    this.value = this.properties.value ?? null;
                    this.oValue = this.value;
                    this.readonly = this.properties.readonly === true;

                    if (this.label !== null) {
                        this.$setTop();
                    }

                    if (this.helpText !== null) {
                        this.$setBottom();
                    }
                }

                /**
                 * 필드 기본값을 적용한다.
                 *
                 * @param {Admin.Form.FieldDefaults} defaults - 필드 기본값
                 */
                setDefaults(defaults: Admin.Form.FieldDefaults = null): void {
                    this.initItems();

                    this.fieldDefaults = defaults;
                    this.labelWidth ??= defaults?.labelWidth ?? null;
                    this.labelPosition ??= defaults?.labelPosition ?? null;
                    this.labelAlign ??= defaults?.labelAlign ?? null;
                    this.labelSeparator ??= defaults?.labelSeparator ?? null;
                    this.width ??= defaults?.width ?? null;
                }

                /**
                 * 상위 폼 패널을 가져온다.
                 *
                 * @return {Admin.Form.Panel} form
                 */
                getForm(): Admin.Form.Panel {
                    const $form = this.$getComponent().getParents(
                        'div[data-component][data-type=panel][data-role=form]'
                    );
                    if ($form?.getData('component')) {
                        return Admin.getComponent($form.getData('component')) as Admin.Form.Panel;
                    } else {
                        return null;
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
                 * @param {any} value - 값
                 */
                setValue(value: any): void {
                    this.value = value;

                    if (this.isChanged() === true) {
                        this.onChange();
                        this.oValue = this.value;
                    }
                }

                /**
                 * 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValue(): any {
                    return this.value;
                }

                /**
                 * 필드값을 가져온다.
                 *
                 * @return {any} raw_value - 값
                 */
                getRawValue(): any {
                    return this.value;
                }

                /**
                 * 모든 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValues(): { [key: string]: any } {
                    const values: { [key: string]: any } = {};
                    if (this.inputName === null) {
                        return values;
                    }

                    if (this.value !== null) {
                        values[this.inputName] = this.value;
                    }

                    return values;
                }

                /**
                 * 필드값 변경여부를 가져온다.
                 *
                 * @return {boolean} is_changed
                 */
                isChanged(): boolean {
                    if (this.value === null || this.oValue === null) {
                        return this.value !== this.oValue;
                    }

                    if (typeof this.value != typeof this.oValue) {
                        return true;
                    }

                    if (Array.isArray(this.value) == true || Array.isArray(this.oValue) == true) {
                        if (Array.isArray(this.value) != Array.isArray(this.oValue)) {
                            return true;
                        }

                        if (this.value.length != this.oValue.length) {
                            return true;
                        }

                        for (const v of this.value) {
                            if (this.oValue.includes(v) == false) {
                                return true;
                            }
                        }

                        return false;
                    } else {
                        return this.value !== this.oValue;
                    }
                }

                /**
                 * 필드값이 비어있는지 확인한다.
                 *
                 * @return {boolean} is_blank
                 */
                isBlank(): boolean {
                    const value = this.getValue();
                    if (value === null) {
                        return true;
                    } else if (typeof value == 'object') {
                        if (value.length == 0) {
                            return true;
                        }
                    } else if (value.toString().length == 0) {
                        return true;
                    }

                    return false;
                }

                /**
                 * 필드값이 유효한지 확인하고 에러여부를 저장한다.
                 *
                 * @return {boolean} is_valid
                 */
                async isValid(): Promise<boolean> {
                    const validation = await this.validate();
                    this.validation = validation;

                    if (validation !== true) {
                        this.setError(true, validation as string);
                    } else {
                        this.setError(false);
                    }

                    return validation === true;
                }

                /**
                 * 필드값이 유효한지 확인한다.
                 *
                 * @return {boolean|string} validation
                 */
                async validate(): Promise<boolean | string> {
                    if (this.allowBlank === false && this.isBlank() == true) {
                        return (await Admin.getText('errors/REQUIRED')) as string;
                    }

                    if (typeof this.validator == 'function') {
                        return await this.validator(this.getValue(), this);
                    }

                    return true;
                }

                /**
                 * 추가적인 에러검증없이 현재 에러가 존재하는지 확인한다.
                 *
                 * @return {boolean} hasError
                 */
                hasError(): boolean {
                    return this.validation !== true;
                }

                /**
                 * 도움말을 변경한다.
                 *
                 * @param {string} text - 도움말
                 */
                setHelpText(text: string): void {
                    this.helpText = text;

                    if (text === null) {
                        this.$removeBottom();
                        return;
                    }

                    const $bottom = this.$getBottom() ?? this.$setBottom();
                    $bottom.empty();
                    const $text = Html.create('p');
                    $text.html(text);
                    $bottom.append($text);
                }

                /**
                 * 에러메시지를 변경한다.
                 *
                 * @param {boolean} is_error - 에러여부
                 * @param {string} message - 에러메시지 (NULL 인 경우 에러메시지를 출력하지 않는다.)
                 */
                setError(is_error: boolean, message: string = null): void {
                    if (is_error === true) {
                        this.$getContent().addClass('error');
                        this.validation = message ?? false;
                    } else {
                        this.$getContent().removeClass('error');
                        message = null;
                        this.validation = true;
                    }

                    if (this.getParent() instanceof Admin.Form.Field.Container) {
                        (this.getParent() as Admin.Form.Field.Container).setError(this.getId(), is_error, message);
                        return;
                    }

                    if (message === null) {
                        this.setHelpText(this.helpText);
                        this.$getBottom()?.removeClass('error');
                    } else {
                        const $bottom = this.$getBottom() ?? this.$setBottom();
                        $bottom.empty();
                        const $text = Html.create('p');
                        $text.html(message);
                        $bottom.append($text);
                        this.$getBottom().addClass('error');
                    }
                }

                /**
                 * 필드 비활성화여부를 설정한다.
                 *
                 * @param {boolean} disabled - 비활성화여부
                 * @return {this} this
                 */
                setDisabled(disabled: boolean): this {
                    if (disabled == true) {
                        this.$getContent().addClass('disabled');
                    } else {
                        this.$getContent().removeClass('disabled');
                    }

                    super.setDisabled(disabled);

                    return this;
                }

                /**
                 * 필드 라벨을 랜더링한다.
                 */
                renderTop(): void {
                    if (this.label === null) return;

                    const $top = this.$getTop();
                    const $label = Html.create('label');
                    $label.html((this.labelSeparator ?? '<i>:</i>') + this.label);
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
                    $text.html(this.helpText);
                    $bottom.append($text);
                }

                /**
                 * 필드를 랜더링한다.
                 */
                render(): void {
                    if (this.name !== null) {
                        this.$getComponent().setData('name', this.name);
                    }
                    this.$getContainer().addClass(this.getLabelPosition());
                    if (this.allowBlank === false) {
                        this.$getContainer().addClass('required');
                    }
                    this.$getContent().setData('field', this.field);
                    this.updateLayout();
                    super.render();
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

                /**
                 * 입력값이 변경되었을 때 이벤트를 처리한다.
                 */
                onChange(): void {
                    this.fireEvent('change', [this, this.getValue(), this.getRawValue(), this.oValue]);
                }
            }

            export namespace Container {
                export interface Properties extends Admin.Form.Field.Base.Properties {
                    /**
                     * @type {'row' | 'column'} direction - 정렬방향
                     */
                    direction?: 'row' | 'column';

                    /**
                     * @type {number} gap - 내부 필드간 간격
                     */
                    gap?: number;
                }
            }

            export class Container extends Admin.Component {
                type: string = 'form';
                role: string = 'field';
                field: string = 'container';

                label: string;
                labelPosition: string;
                labelAlign: string;
                labelWidth: number;
                labelSeparator: string;
                helpText: string;
                width: number;
                fieldDefaults: Admin.Form.FieldDefaults;
                allowBlank: boolean = true;
                errors: Map<string, { is_error: boolean; message: string }> = new Map();
                direction: 'row' | 'column' = 'row';
                gap: number;

                /**
                 * 필드 컨테이너를 생성한다.
                 *
                 * @param {Admin.Form.Field.Container.Properties} properties - 객체설정
                 */
                constructor(properties: Admin.Form.Field.Container.Properties = null) {
                    super(properties);

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
                    this.allowBlank = true;

                    this.direction = this.properties.direction ?? 'row';
                    this.gap = this.properties.gap ?? 5;

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
                                if (
                                    item instanceof Admin.Form.FieldSet ||
                                    item instanceof Admin.Form.Field.Container ||
                                    item instanceof Admin.Form.Field.Base
                                ) {
                                    item.setDefaults(this.fieldDefaults);

                                    if (item instanceof Admin.Form.Field.Base) {
                                        this.allowBlank = this.allowBlank == true && item.allowBlank;
                                    }
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
                 * @param {Admin.Form.FieldDefaults} defaults - 필드 기본값
                 */
                setDefaults(defaults: Admin.Form.FieldDefaults = null): void {
                    this.initItems();

                    this.fieldDefaults = defaults;
                    this.labelWidth ??= defaults?.labelWidth ?? null;
                    this.labelPosition ??= defaults?.labelPosition ?? null;
                    this.labelAlign ??= defaults?.labelAlign ?? null;
                    this.labelSeparator ??= defaults?.labelSeparator ?? null;
                    this.width ??= defaults?.width ?? null;

                    for (const item of this.items) {
                        if (
                            item instanceof Admin.Form.FieldSet ||
                            item instanceof Admin.Form.Field.Container ||
                            item instanceof Admin.Form.Field.Base
                        ) {
                            item.setDefaults(defaults);
                        }
                    }
                }

                /**
                 * 상위 폼 패널을 가져온다.
                 *
                 * @return {Admin.Form.Panel} form
                 */
                getForm(): Admin.Form.Panel {
                    const $form = this.$getComponent().getParents(
                        'div[data-component][data-type=panel][data-role=form]'
                    );
                    if ($form?.getData('component')) {
                        return Admin.getComponent($form.getData('component')) as Admin.Form.Panel;
                    } else {
                        return null;
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
                 * 도움말을 변경한다.
                 *
                 * @param {string} text - 도움말
                 */
                setHelpText(text: string): void {
                    this.helpText = text;

                    if (text === null) {
                        this.$removeBottom();
                        return;
                    }

                    const $bottom = this.$getBottom() ?? this.$setBottom();
                    $bottom.empty();
                    const $text = Html.create('p');
                    $text.html(text);
                    $bottom.append($text);
                }

                /**
                 * 에러메시지를 변경한다.
                 *
                 * @param {string} id - 필드고유값
                 * @param {boolean} is_error - 에러여부
                 * @param {string} message - 에러메시지 (NULL 인 경우 에러메시지를 출력하지 않는다.)
                 */
                setError(id: string, is_error: boolean, message: string = null): void {
                    if (this.getParent() instanceof Admin.Form.Field.Container) {
                        (this.getParent() as Admin.Form.Field.Container).setError(this.getId(), is_error, message);
                        return;
                    }

                    this.errors.set(id, { is_error: is_error, message: message });
                    this.updateError();
                }

                /**
                 * 에러메시지를 업데이트한다.
                 */
                updateError(): void {
                    this.setHelpText(this.helpText);
                    this.$getBottom()?.removeClass('error');

                    const messages: string[] = [];
                    this.errors.forEach(({ is_error, message }) => {
                        if (is_error == true && message !== null) {
                            messages.push(message);
                        }
                    });

                    if (messages.length > 0) {
                        const $bottom = this.$getBottom() ?? this.$setBottom();
                        $bottom.empty();
                        const $text = Html.create('p');
                        $text.html(messages.join('<br>'));
                        $bottom.append($text);
                        this.$getBottom().addClass('error');
                    }
                }

                /**
                 * 필드 컨테이너에 속한 모든 필드를 가져온다.
                 *
                 * @return {Admin.Form.Field.Base[]} fields
                 */
                getFields(): Admin.Form.Field.Base[] {
                    const fields: Admin.Form.Field.Base[] = [];
                    for (const item of this.items ?? []) {
                        if (item instanceof Admin.Form.FieldSet) {
                            fields.push(...item.getFields());
                        } else if (item instanceof Admin.Form.Field.Container) {
                            fields.push(...item.getFields());
                        } else if (item instanceof Admin.Form.Field.Base) {
                            fields.push(item);
                        }
                    }

                    return fields;
                }

                /**
                 * 필드 라벨을 랜더링한다.
                 */
                renderTop(): void {
                    if (this.label === null) return;

                    const $top = this.$getTop();
                    const $label = Html.create('label');
                    $label.html((this.labelSeparator ?? '<i>:</i>') + this.label);
                    $label.addClass(this.getLabelAlign());
                    $top.append($label);
                }

                /**
                 * 필드 컨테이너에 속한 필드를 랜더링한다.
                 */
                renderContent(): void {
                    const $fields = Html.create('div', { 'data-role': 'fields' });
                    $fields.addClass(this.direction);
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

                /**
                 * 도움말 텍스트를 랜더링한다.
                 */
                renderBottom(): void {
                    if (this.helpText === null) return;

                    const $bottom = this.$getBottom();
                    const $text = Html.create('p');
                    $text.html(this.helpText);
                    $bottom.append($text);
                }

                /**
                 * 필드를 랜더링한다.
                 */
                render(): void {
                    this.$getContainer().addClass(this.getLabelPosition());
                    if (this.allowBlank === false) {
                        this.$getContainer().addClass('required');
                    }

                    this.$getContent().setData('field', this.field);
                    this.updateLayout();
                    super.render();
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

            export class Hidden extends Admin.Form.Field.Base {
                field: string = 'hidden';

                $input: Dom;

                /**
                 * 기본필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Base.Properties} properties - 객체설정
                 */
                constructor(properties: Admin.Form.Field.Base.Properties = null) {
                    super(properties);
                }

                /**
                 * INPUT 필드 DOM 을 가져온다.
                 *
                 * @return {Dom} $input
                 */
                $getInput(): Dom {
                    if (this.$input === undefined) {
                        this.$input = Html.create('input', {
                            type: 'hidden',
                            name: this.inputName,
                        });
                    }

                    return this.$input;
                }

                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 */
                setValue(value: any): void {
                    value = value?.toString() ?? '';
                    if (this.$getInput().getValue() != value) {
                        this.$getInput().setValue(value);
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
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender(): void {
                    super.onRender();

                    if (this.value !== undefined || this.value !== null) {
                        this.setValue(this.value);
                    }

                    this.hide();
                }
            }

            export namespace Text {
                export interface Properties extends Admin.Form.Field.Base.Properties {
                    /**
                     * @type {string} emptyText - 필드값이 없을 경우 보일 placeHolder
                     */
                    emptyText?: string;
                }
            }

            export class Text extends Admin.Form.Field.Base {
                field: string = 'text';
                inputType: string = 'text';
                emptyText: string;

                $input: Dom;
                $emptyText: Dom;

                /**
                 * 텍스트필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Text.Properties} properties - 객체설정
                 */
                constructor(properties: Admin.Form.Field.Text.Properties = null) {
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
                            name: this.inputName,
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
                 * @param {any} value - 값
                 */
                setValue(value: any): void {
                    value = value?.toString() ?? '';
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
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender(): void {
                    super.onRender();

                    if (this.value !== undefined || this.value !== null) {
                        this.setValue(this.value);
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

            export namespace Display {
                export interface Properties extends Admin.Form.Field.Base.Properties {
                    /**
                     * @type {Function} renderer - 필드 랜더러
                     */
                    renderer?: (value: string, field: Admin.Form.Field.Display) => string;
                }
            }

            export class Display extends Admin.Form.Field.Base {
                field: string = 'display';

                renderer: (value: string, field: Admin.Form.Field.Display) => string;
                $display: Dom;

                /**
                 * 디스플레이필드 클래스 생성한다.
                 *
                 * @param {Object} properties - 객체설정
                 */
                constructor(properties: Admin.Form.Field.Display.Properties = null) {
                    super(properties);

                    this.renderer = this.properties.renderer ?? null;
                }

                /**
                 * DISPLAY 필드 DOM 을 가져온다.
                 *
                 * @return {Dom} $display
                 */
                $getDisplay(): Dom {
                    if (this.$display === undefined) {
                        this.$display = Html.create('div');
                    }

                    return this.$display;
                }

                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 */
                setValue(value: any): void {
                    value = value?.toString() ?? '';
                    if (this.renderer === null) {
                        this.$getDisplay().html(value);
                    } else {
                        this.$getDisplay().html(this.renderer(value, this));
                    }

                    super.setValue(value);
                }

                /**
                 * DISPLAY 태그를 랜더링한다.
                 */
                renderContent(): void {
                    const $display = this.$getDisplay();
                    this.$getContent().append($display);
                }

                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender(): void {
                    super.onRender();

                    if (this.value !== undefined || this.value !== null) {
                        this.setValue(this.value);
                    }
                }
            }

            export namespace Select {
                export interface Properties extends Admin.Form.Field.Base.Properties {
                    /**
                     * @type {Admin.Store} store - 목록 store
                     */
                    store: Admin.Store;

                    /**
                     * @type {boolean} multiple - 다중선택여부
                     */
                    multiple?: boolean;

                    /**
                     * @type {boolean} search - 목록 검색여부
                     */
                    search?: boolean;

                    /**
                     * @type {string} emptyText - 필드값이 없을 경우 보일 placeHolder
                     */
                    emptyText?: string;

                    /**
                     * @type {string} displayField - 선택된 값을 표시할 store 의 field 명
                     */
                    displayField?: string;

                    /**
                     * @type {string} valueField - 폼 전송시 전송될 값을 지정할 store 의 field 명
                     */
                    valueField?: string;

                    /**
                     * @type {string} listField - 목록 항목에 표시할 store 의 field 명
                     */
                    listField?: string;

                    /**
                     * @type {Function} renderer - 선택된 항목을 보일 때 사용할 렌더링 함수
                     */
                    renderer?: (
                        display: string | string[],
                        record: Admin.Data.Record | Admin.Data.Record[],
                        $display: Dom,
                        field: Admin.Form.Field.Select
                    ) => string;

                    /**
                     * @type {Function} renderer - 목록 항목을 보일 때 사용할 렌더링 함수
                     */
                    listRenderer?: (
                        display: string,
                        record: Admin.Data.Record,
                        $dom: Dom,
                        list: Admin.List.Panel
                    ) => string;

                    /**
                     * @type {boolean} listWrap - 목록 줄바꿈여부
                     */
                    listWrap?: boolean;

                    /**
                     * @type {string} listClass - 목록 스타일 클래스명
                     */
                    listClass?: string;
                }
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

                renderer: (
                    display: string | string[],
                    record: Admin.Data.Record | Admin.Data.Record[],
                    $display: Dom,
                    field: Admin.Form.Field.Select
                ) => string;
                $display: Dom;

                absolute: Admin.Absolute;
                list: Admin.List.Panel;

                /**
                 * 선택항목필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Select.Properties} properties - 객체설정
                 */
                constructor(properties: Admin.Form.Field.Select.Properties = null) {
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
                        ((display): string => {
                            if (Array.isArray(display) == true) {
                            } else if (typeof display == 'string' && display.length > 0) {
                                return display;
                            }

                            return '';
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
                            hideOnClick: true,
                            listeners: {
                                show: (absolute: Admin.Absolute) => {
                                    const rect = absolute.getRect();
                                    const height = Html.get('body').getHeight();

                                    if (rect.top - 100 > height - rect.bottom) {
                                        absolute.setPosition(null, null, 'calc(100% - 1px)', 0);
                                        this.getList().setMaxHeight(rect.top - 10);
                                    } else {
                                        absolute.setPosition('calc(100% - 1px)', null, null, 0);
                                        this.getList().setMaxHeight(height - rect.bottom - 10);
                                    }

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
                            renderer: this.properties.listRenderer,
                            displayField: this.displayField,
                            valueField: this.valueField,
                            multiple: this.multiple,
                            wrap: this.properties.listWrap === true,
                            class: this.properties.listClass ?? null,
                            listeners: {
                                load: () => {
                                    this.onLoad();
                                },
                                update: () => {
                                    this.onUpdate();
                                },
                                selectionChange: (selections: Admin.Data.Record[]) => {
                                    if (selections.length == 0) {
                                        this.setValue(null);
                                    } else if (selections.length == 1) {
                                        this.setValue(selections[0].get(this.valueField));
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
                 * @param {any} value - 값
                 */
                setValue(value: any): void {
                    this.rawValue = value;

                    if (this.getStore().isLoaded() == false) {
                        this.getStore().load();
                        return;
                    }

                    if (Array.isArray(value) == true) {
                    } else {
                        const record = this.getStore().find(this.valueField, value);

                        if (record == null) {
                            value = null;
                            this.$getEmptyText().show();
                        } else {
                            value = record.get(this.valueField);
                            this.$getEmptyText().hide();
                        }

                        this.$setDisplay(
                            this.renderer(record?.get(this.displayField) ?? '', record, this.$getDisplay(), this)
                        );
                    }

                    super.setValue(value);
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
                            this.getList().$getComponent().getEl().dispatchEvent(new KeyboardEvent('keydown', e));
                            e.stopPropagation();
                        }

                        if (e.key == 'Escape') {
                            this.collapse();
                            e.stopPropagation();
                        }

                        if (e.key == 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
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
                    return this.getAbsolute().isShow();
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
                    $button.on('mousedown', (e: MouseEvent) => {
                        const $button = Html.el(e.currentTarget);
                        if (this.isExpand() == true) {
                            this.collapse();
                        } else {
                            this.expand();
                        }

                        e.preventDefault();
                        e.stopImmediatePropagation();
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
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
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
                 * 셀렉트폼의 목록 데이터가 변경되었을 때 이벤트를 처리한다.
                 */
                onUpdate(): void {
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

            export namespace TextArea {
                export interface Properties extends Admin.Form.Field.Base.Properties {
                    /**
                     * @type {string} emptyText - 필드값이 없을 경우 보일 placeHolder
                     */
                    emptyText?: string;

                    /**
                     * @type {number} rows - textarea 의 라인수
                     */
                    rows?: number;
                }
            }

            export class TextArea extends Admin.Form.Field.Base {
                field: string = 'textarea';
                rows: number;
                emptyText: string;

                $input: Dom;
                $emptyText: Dom;

                /**
                 * 텍스트에리어필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.TextArea.Properties} properties - 객체설정
                 */
                constructor(properties: Admin.Form.Field.TextArea.Properties = null) {
                    super(properties);

                    this.rows = this.properties.rows ?? 5;
                    this.emptyText = this.properties.emptyText ?? '';
                    this.emptyText = this.emptyText.length == 0 ? null : this.emptyText;

                    this.scrollable = 'Y';
                    this.$scrollable = this.$getInput();
                }

                /**
                 * INPUT 필드 DOM 을 가져온다.
                 *
                 * @return {Dom} $input
                 */
                $getInput(): Dom {
                    if (this.$input === undefined) {
                        this.$input = Html.create('textarea', {
                            name: this.inputName,
                            rows: this.rows.toString(),
                        });
                        this.$input.on('input', (e: InputEvent) => {
                            const input = e.currentTarget as HTMLTextAreaElement;
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
                 * @param {any} value - 값
                 */
                setValue(value: any): void {
                    value = value?.toString() ?? '';
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
                 * 필드태그를 랜더링한다.
                 */
                renderContent(): void {
                    const $input = this.$getInput();
                    this.$getContent().append($input);
                }

                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender(): void {
                    super.onRender();

                    if (this.value !== undefined || this.value !== null) {
                        this.setValue(this.value);
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
            }

            export namespace Check {
                export interface Properties extends Admin.Form.Field.Base.Properties {
                    /**
                     * @type {string} boxLabel - 선택항목명
                     */
                    boxLabel?: string;

                    /**
                     * @type {string} onValue - 선택시 전송될 값
                     */
                    onValue?: string;

                    /**
                     * @type {string} offValue - 미선택시 전송될 값
                     */
                    offValue?: string;

                    /**
                     * @type {boolean} checked - 선택여부
                     */
                    checked?: boolean;
                }
            }

            export class Check extends Admin.Form.Field.Base {
                field: string = 'check';
                boxLabel: string;
                onValue: string;
                offValue: string;
                checked: boolean;

                $input: Dom;
                $label: Dom;
                $boxLabel: Dom;

                /**
                 * 체크박스필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Check.Properties} properties - 객체설정
                 */
                constructor(properties: Admin.Form.Field.Check.Properties = null) {
                    super(properties);

                    this.boxLabel = this.properties.boxLabel ?? '';
                    this.onValue = this.properties.onValue ?? 'ON';
                    this.offValue = this.properties.offValue ?? null;
                    this.checked = this.properties.checked ?? false;
                    this.value = this.checked;
                    this.oValue = this.value;
                }

                /**
                 * INPUT 필드 DOM 을 가져온다.
                 *
                 * @return {Dom} $input
                 */
                $getInput(): Dom {
                    if (this.$input === undefined) {
                        this.$input = Html.create('input', {
                            name: this.inputName,
                            type: 'checkbox',
                            value: this.onValue,
                        });

                        if (this.readonly === true) {
                            this.$input.setAttr('disabled', 'disabled');
                        }

                        this.$input.on('input', (e: InputEvent) => {
                            const input = e.currentTarget as HTMLInputElement;
                            this.setValue(input.checked);
                        });
                    }

                    return this.$input;
                }

                /**
                 * LABEL DOM 을 가져온다.
                 *
                 * @return {Dom} $label
                 */
                $getLabel(): Dom {
                    if (this.$label === undefined) {
                        this.$label = Html.create('label');
                    }

                    return this.$label;
                }

                /**
                 * 필드 비활성화여부를 설정한다.
                 *
                 * @param {boolean} disabled - 비활성화여부
                 * @return {this} this
                 */
                setDisabled(disabled: boolean): this {
                    if (disabled == true) {
                        this.$getInput().setAttr('disabled', 'disabled');
                    } else if (this.readonly === false) {
                        this.$getInput().removeAttr('disabled');
                    }

                    super.setDisabled(disabled);

                    return this;
                }

                /**
                 * INPUT 박스라벨 DOM 을 가져온다.
                 *
                 * @return {Dom} $boxLabel
                 */
                $getBoxLabel(): Dom {
                    if (this.$boxLabel === undefined) {
                        this.$boxLabel = Html.create('span');
                    }

                    return this.$boxLabel;
                }

                /**
                 * 박스라벨 텍스트를 설정한다.
                 *
                 * @param {string} boxLabel - 박스라벨 텍스트
                 */
                setBoxLabel(boxLabel: string): void {
                    this.boxLabel = boxLabel ?? '';
                    this.updateLayout();
                }

                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 */
                setValue(value: any): void {
                    this.$getInput().setValue(value);
                    this.checked = this.getValue();

                    super.setValue(this.checked);
                }

                /**
                 * 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValue(): boolean {
                    const input = this.$getInput().getEl() as HTMLInputElement;
                    return input.checked;
                }

                /**
                 * 모든 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValues(): { [key: string]: any } {
                    const values: { [key: string]: any } = {};
                    if (this.inputName === null) {
                        return values;
                    }

                    if (this.getRawValue() !== null) {
                        values[this.inputName] = this.getRawValue();
                    }

                    return values;
                }

                /**
                 * 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getRawValue(): string {
                    return this.getValue() === true ? this.onValue : this.offValue;
                }

                /**
                 * 필드태그를 랜더링한다.
                 */
                renderContent(): void {
                    const $label = this.$getLabel();
                    const $input = this.$getInput();
                    $label.append($input);

                    const $boxLabel = this.$getBoxLabel();
                    $boxLabel.html(this.boxLabel);
                    $label.append($boxLabel);

                    this.$getContent().append($label);
                }

                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender(): void {
                    super.onRender();
                    this.setValue(this.checked);
                }

                /**
                 * 필드 레이아웃을 업데이트한다.
                 */
                updateLayout(): void {
                    super.updateLayout();

                    this.$getBoxLabel().html(this.boxLabel);
                }
            }

            export namespace CheckGroup {
                export interface Properties extends Admin.Form.Field.Base.Properties {
                    /**
                     * @type {number} gap - 내부 선택항목간 간격
                     */
                    gap?: number;

                    /**
                     * @type {number} columns - 한줄당 표시될 선택항목 갯수
                     */
                    columns?: number;

                    /**
                     * @type {string} options - 선택항목
                     */
                    options: { [onValue: string]: string };
                }
            }

            export class CheckGroup extends Admin.Form.Field.Base {
                field: string = 'checkgroup';
                gap: number;
                columns: number;
                options: { [key: string]: string };

                /**
                 * 체크박스그룹필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.CheckGroup.Properties} properties - 객체설정
                 */
                constructor(properties: Admin.Form.Field.CheckGroup.Properties = null) {
                    super(properties);

                    this.columns = this.properties.columns ?? 1;
                    this.gap = this.properties.gap ?? 5;
                    this.options = this.properties.options ?? {};
                    this.value = this.properties.value ?? [];
                    if (Array.isArray(this.value) === false) {
                        this.value = [this.value];
                    }
                }

                /**
                 * 폼 패널의 하위 컴포넌트를 정의한다.
                 */
                initItems(): void {
                    if (this.items === null) {
                        this.items = [];

                        for (const value in this.options) {
                            this.items.push(
                                new Admin.Form.Field.Check({
                                    inputName: (this.name ?? this.inputName) + '[]',
                                    onValue: value,
                                    checked: this.value.includes(value),
                                    readonly: this.readonly,
                                    boxLabel: this.options[value],
                                    listeners: {
                                        change: () => {
                                            this.onChange();
                                        },
                                    },
                                })
                            );
                        }
                    }

                    super.initItems();
                }

                /**
                 * 필드값을 지정한다.
                 *
                 * @param {string|string[]} value - 값
                 */
                setValue(value: string | string[]): void {
                    if (typeof value == 'string') {
                        value = [value];
                    }

                    this.items.forEach((item: Admin.Form.Field.Check) => {
                        if (value.includes(item.onValue) === true) {
                            item.setValue(true);
                        } else {
                            item.setValue(false);
                        }
                    });

                    super.setValue(this.getValue());
                }

                /**
                 * 필드값을 가져온다.
                 *
                 * @return {string[]} value - 값
                 */
                getValue(): string[] {
                    const value = [];
                    this.items.forEach((item: Admin.Form.Field.Check) => {
                        if (item.getRawValue() !== null) {
                            value.push(item.getRawValue());
                        }
                    });

                    return value;
                }

                /**
                 * 모든 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValues(): { [key: string]: any } {
                    const values: { [key: string]: any } = {};
                    if (this.inputName === null) {
                        return values;
                    }

                    if (this.getValue().length > 0) {
                        values[this.inputName] = this.getValue();
                    }

                    return values;
                }

                /**
                 * 필드를 랜더링한다.
                 */
                renderContent(): void {
                    const $content = this.$getContent();
                    const $inputs = Html.create('div', { 'data-role': 'inputs' });
                    for (const item of this.items) {
                        $inputs.append(item.$getComponent());
                        item.render();
                    }
                    $inputs.setStyle(
                        'grid-template-columns',
                        'repeat(' + Math.min(this.items.length, this.columns) + ', 1fr)'
                    );
                    $inputs.setStyle('grid-gap', this.gap + 'px');
                    $content.append($inputs);
                }

                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender(): void {
                    super.onRender();
                    this.setValue(this.value);
                }
            }

            export namespace Radio {
                export interface Properties extends Admin.Form.Field.Base.Properties {
                    /**
                     * @type {string} boxLabel - 선택항목명
                     */
                    boxLabel?: string;

                    /**
                     * @type {string} onValue - 선택시 전송될 값
                     */
                    onValue?: string;

                    /**
                     * @type {boolean} checked - 선택여부
                     */
                    checked?: boolean;
                }
            }

            export class Radio extends Admin.Form.Field.Base {
                field: string = 'radio';
                boxLabel: string;
                onValue: string;
                checked: boolean;

                $input: Dom;
                $boxLabel: Dom;

                /**
                 * 라디오필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Radio.Properties} properties - 객체설정
                 */
                constructor(properties: Admin.Form.Field.Radio.Properties = null) {
                    super(properties);

                    this.boxLabel = this.properties.boxLabel ?? '';
                    this.onValue = this.properties.onValue ?? 'ON';
                    this.checked = this.properties.checked ?? false;
                    this.value = this.checked;
                    this.oValue = this.value;
                }

                /**
                 * INPUT 필드 DOM 을 가져온다.
                 *
                 * @return {Dom} $input
                 */
                $getInput(): Dom {
                    if (this.$input === undefined) {
                        this.$input = Html.create('input', {
                            name: this.inputName,
                            type: 'radio',
                            value: this.onValue,
                        });
                        this.$input.on('input', (e: InputEvent) => {
                            const input = e.currentTarget as HTMLInputElement;
                            this.setValue(input.checked);
                        });
                    }

                    return this.$input;
                }

                /**
                 * INPUT 박스라벨 DOM 을 가져온다.
                 *
                 * @return {Dom} $boxLabel
                 */
                $getBoxLabel(): Dom {
                    if (this.$boxLabel === undefined) {
                        this.$boxLabel = Html.create('span');
                    }

                    return this.$boxLabel;
                }

                /**
                 * 박스라벨 텍스트를 설정한다.
                 *
                 * @param {string} boxLabel - 박스라벨 텍스트
                 */
                setBoxLabel(boxLabel: string): void {
                    this.boxLabel = boxLabel ?? '';
                    this.updateLayout();
                }

                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 */
                setValue(value: any): void {
                    this.$getInput().setValue(value);
                    this.checked = this.getValue();

                    super.setValue(this.checked);
                    this.updateChecked();
                }

                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 */
                updateValue(value: any): void {
                    this.oValue = value;
                    this.value = value;
                    this.checked = value;
                }

                /**
                 * 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValue(): boolean {
                    const input = this.$getInput().getEl() as HTMLInputElement;
                    return input.checked;
                }

                /**
                 * 모든 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValues(): { [key: string]: any } {
                    const values: { [key: string]: any } = {};
                    if (this.inputName === null) {
                        return values;
                    }

                    if (this.getRawValue() !== null) {
                        values[this.inputName] = this.getRawValue();
                    }

                    return values;
                }

                /**
                 * 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getRawValue(): string {
                    return this.getValue() === true ? this.onValue : null;
                }

                /**
                 * 다른 라디오버튼을 클릭함으로써 값이 변경된 경우를 처리한다.
                 */
                updateChecked(): void {
                    if (this.getForm() === null) {
                        return;
                    }

                    Html.all('input[type=radio][name=' + this.inputName + ']', this.getForm().$getContent()).forEach(
                        ($input: Dom) => {
                            const $content = $input.getParents('div[data-role=content][data-field=radio]');
                            const $component = $content?.getParents(
                                'div[data-component][data-type=form][data-role=field]'
                            );
                            if ($component?.getData('component')) {
                                const input = Admin.getComponent($component.getData('component'));
                                if (input instanceof Admin.Form.Field.Radio) {
                                    if (input.value != input.getValue()) {
                                        input.updateValue(input.getValue());
                                    }
                                }
                            }
                        }
                    );
                }

                /**
                 * 필드태그를 랜더링한다.
                 */
                renderContent(): void {
                    const $label = Html.create('label');
                    const $input = this.$getInput();
                    $label.append($input);

                    const $boxLabel = this.$getBoxLabel();
                    $boxLabel.html(this.boxLabel);
                    $label.append($boxLabel);

                    this.$getContent().append($label);
                }

                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender(): void {
                    super.onRender();
                    this.setValue(this.checked);
                }

                /**
                 * 필드 레이아웃을 업데이트한다.
                 */
                updateLayout(): void {
                    super.updateLayout();

                    this.$getBoxLabel().html(this.boxLabel);
                }
            }

            export namespace RadioGroup {
                export interface Properties extends Admin.Form.Field.Base.Properties {
                    /**
                     * @type {number} gap - 내부 선택항목간 간격
                     */
                    gap?: number;

                    /**
                     * @type {number} columns - 한줄당 표시될 선택항목 갯수
                     */
                    columns?: number;

                    /**
                     * @type {string} options - 선택항목
                     */
                    options: { [onValue: string]: string };
                }
            }

            export class RadioGroup extends Admin.Form.Field.Base {
                field: string = 'radiogroup';
                gap: number;
                columns: number;
                options: { [key: string]: string };

                /**
                 * 라디오그룹필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.RadioGroup.Properties} properties - 객체설정
                 */
                constructor(properties: Admin.Form.Field.RadioGroup.Properties = null) {
                    super(properties);

                    this.columns = this.properties.columns ?? 1;
                    this.gap = this.properties.gap ?? 5;
                    this.options = this.properties.options ?? {};
                }

                /**
                 * 폼 패널의 하위 컴포넌트를 정의한다.
                 */
                initItems(): void {
                    if (this.items === null) {
                        this.items = [];

                        for (const value in this.options) {
                            this.items.push(
                                new Admin.Form.Field.Radio({
                                    inputName: this.name ?? this.inputName,
                                    onValue: value,
                                    checked: this.value == value,
                                    boxLabel: this.options[value],
                                    listeners: {
                                        change: () => {
                                            this.onChange();
                                        },
                                    },
                                })
                            );
                        }
                    }

                    super.initItems();
                }

                /**
                 * 필드값을 지정한다.
                 *
                 * @param {string} value - 값
                 */
                setValue(value: string): void {
                    for (const item of this.items as Admin.Form.Field.Radio[]) {
                        if (item.onValue == value) {
                            item.setValue(true);
                        }
                    }

                    super.setValue(this.getValue());
                }

                /**
                 * 필드값을 가져온다.
                 *
                 * @return {string} value - 값
                 */
                getValue(): string {
                    for (const item of this.items as Admin.Form.Field.Radio[]) {
                        if (item.getRawValue() !== null) {
                            return item.getRawValue();
                        }
                    }

                    return null;
                }

                /**
                 * 모든 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValues(): { [key: string]: any } {
                    const values: { [key: string]: any } = {};
                    if (this.inputName === null) {
                        return values;
                    }

                    if (this.getValue() !== null) {
                        values[this.inputName] = this.getValue();
                    }

                    return values;
                }

                /**
                 * 필드를 랜더링한다.
                 */
                renderContent(): void {
                    const $content = this.$getContent();
                    const $inputs = Html.create('div', { 'data-role': 'inputs' });
                    for (const item of this.items) {
                        $inputs.append(item.$getComponent());
                        item.render();
                    }
                    $inputs.setStyle(
                        'grid-template-columns',
                        'repeat(' + Math.min(this.items.length, this.columns) + ', 1fr)'
                    );
                    $inputs.setStyle('grid-gap', this.gap + 'px');
                    $content.append($inputs);
                }

                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender(): void {
                    super.onRender();
                    this.setValue(this.value);
                }
            }

            export namespace Theme {
                export interface Properties extends Admin.Form.Field.Base.Properties {
                    gap?: number;
                    configsParams?: { [key: string]: string };
                }
            }

            export class Theme extends Admin.Form.Field.Base {
                type: string = 'form';
                role: string = 'field';
                field: string = 'theme';

                listUrl: string;
                listParams: { [key: string]: string };
                configsUrl: string;
                configsParams: { [key: string]: string };
                select: Admin.Form.Field.Select;
                fieldset: Admin.Form.FieldSet;

                gap: number;

                /**
                 * 템플릿필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Theme.Properties} properties - 객체설정
                 */
                constructor(properties: Admin.Form.Field.Theme.Properties = null) {
                    super(properties);

                    this.value = this.properties.value ?? null;
                    if (this.value !== null && typeof this.value == 'string') {
                        this.value = { name: this.value, configs: {} };
                    }
                    this.oValue = this.value;

                    this.gap = this.properties.gap ?? 5;

                    this.listUrl = Admin.getProcessUrl('module', 'admin', 'themes');
                    this.listParams = null;
                    this.configsUrl = Admin.getProcessUrl('module', 'admin', 'theme');
                    this.configsParams = this.properties.configsParams ?? {};
                }

                /**
                 * 폼 패널의 하위 컴포넌트를 정의한다.
                 */
                initItems(): void {
                    if (this.items === null) {
                        this.items = [];

                        this.items.push(this.getSelect());
                        this.items.push(this.getFieldSet());
                    }

                    super.initItems();
                }

                /**
                 * 테마설정을 불러오기 위한 설정 매개변수를 가져온다.
                 *
                 * @param {string} name - 테마명
                 * @return {Object} params
                 */
                getConfigsParams(name: string): { [key: string]: any } {
                    const params = this.configsParams;
                    params.name = name;

                    return params;
                }

                /**
                 * 테마설정을 위한 셀렉트필드를 가져온다.
                 *
                 * @return {Admin.Form.Field.Select} select
                 */
                getSelect(): Admin.Form.Field.Select {
                    if (this.select === undefined) {
                        this.select = new Admin.Form.Field.Select({
                            name: this.name,
                            flex: true,
                            store: new Admin.Store.Ajax({
                                url: this.listUrl,
                                params: this.listParams,
                            }),
                            displayField: 'title',
                            valueField: 'name',
                            listField: 'name',
                            listClass: 'template',
                            listRenderer: (display: string, record: Admin.Data.Record) => {
                                const html = [
                                    '<div>',
                                    '    <i style="background-image:url(' + record.data.screenshot + ');"></i>',
                                    '    <div class="text">',
                                    '        <b>' + display + '</b>',
                                    '        <small>(' + record.data.dir + ')</small>',
                                    '    </div>',
                                    '</div>',
                                ];
                                return html.join('');
                            },
                            listeners: {
                                change: async (field: Admin.Form.Field.Select, value: string) => {
                                    field.disable();

                                    const configs = await Admin.Ajax.get(this.configsUrl, this.getConfigsParams(value));
                                    this.fieldset.empty();

                                    if ((configs?.fields?.length ?? 0) == 0) {
                                        this.fieldset.hide();
                                    } else {
                                        for (const field of configs.fields) {
                                            const item = Admin.Form.Field.Create(field);
                                            item.addEvent('change', () => {
                                                this.updateValue();
                                            });
                                            this.fieldset.append(item);
                                        }
                                        this.fieldset.show();
                                    }

                                    this.updateValue();
                                },
                            },
                        });
                    }
                    return this.select;
                }

                /**
                 * 테마설정을 위한 필드셋을 가져온다.
                 *
                 * @return {Admin.Form.FieldSet} fieldset
                 */
                getFieldSet(): Admin.Form.FieldSet {
                    if (this.fieldset === undefined) {
                        this.fieldset = new Admin.Form.FieldSet({
                            title: Admin.printText('admin/theme_configs'),
                            hidden: true,
                            flex: true,
                            items: [],
                        });
                    }

                    return this.fieldset;
                }

                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 */
                setValue(value: any): void {
                    if (typeof value == 'string') {
                        this.value = { name: value, configs: {} };
                    } else {
                        this.value = value;
                    }

                    if (this.isChanged() === true) {
                        this.onChange();
                        this.oValue = this.value;
                    }
                }

                /**
                 * 현재 입력된 값으로 값을 업데이트한다.
                 */
                updateValue(): void {
                    const name = this.select.getValue();
                    const configs = {};

                    for (const item of this.fieldset.getFields()) {
                        configs[item.name] = item.getValue();
                    }

                    if (this.value?.name != name || JSON.stringify(this.value?.configs) != JSON.stringify(configs)) {
                        this.setValue({ name: name, configs: configs });
                        return;
                    }
                }

                /**
                 * 필드 컨테이너에 속한 필드를 랜더링한다.
                 */
                renderContent(): void {
                    const $fields = Html.create('div', { 'data-role': 'fields' });
                    $fields.setStyle('row-gap', this.gap + 'px');
                    for (let item of this.getItems()) {
                        $fields.append(item.$getComponent());
                        if (item.isRenderable() == true) {
                            item.render();
                        }
                    }
                    this.$getContent().append($fields);
                }

                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender(): void {
                    super.onRender();

                    if ((this.value?.name ?? null) !== null) {
                        this.getSelect().setValue(this.value.name);
                    }
                }
            }

            export namespace Template {
                export interface Properties extends Admin.Form.Field.Theme.Properties {
                    /**
                     * @type {'module'|'plugin'|'widget'} targetType - 템플릿을 불러올 컴포넌트타입
                     */
                    targetType: 'module' | 'plugin' | 'widget';

                    /**
                     * @type {string} target - 컴포넌트 대상명
                     */
                    targetName: string;
                }
            }

            export class Template extends Admin.Form.Field.Theme {
                type: string = 'form';
                role: string = 'field';
                field: string = 'template';

                targetType: 'module' | 'plugin' | 'widget';
                targetName: string;

                context?: { host: string; language: string; path: string } = null;

                /**
                 * 템플릿필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Template.Properties} properties - 객체설정
                 */
                constructor(properties: Admin.Form.Field.Template.Properties = null) {
                    super(properties);

                    this.targetType = this.properties.targetType;
                    this.targetName = this.properties.targetName;
                    this.value = this.properties.value ?? null;
                    if (this.value !== null && typeof this.value == 'string') {
                        this.value = { name: this.value, configs: {} };
                    }
                    this.oValue = this.value;

                    this.gap = this.properties.gap ?? 5;

                    this.listUrl = Admin.getProcessUrl('module', 'admin', 'templates');
                    this.listParams = { targetType: this.targetType, targetName: this.targetName };
                    this.configsUrl = Admin.getProcessUrl('module', 'admin', 'template');
                    this.configsParams = this.properties.configsParams ?? {};
                    this.configsParams.targetType = this.targetType;
                    this.configsParams.targetName = this.targetName;
                }

                /**
                 * 컨텍스트 템플릿설정을 불러오기 위해 context 정보를 설정한다.
                 *
                 * @param {string} host - 호스트명
                 * @param {string} language - 언어코드
                 * @param {string} path - 컨텍스트경로
                 */
                setContext(host: string, language: string, path: string): void {
                    this.context = {
                        host: host,
                        language: language,
                        path: path,
                    };
                }

                /**
                 * 테마설정을 불러오기 위한 설정 매개변수를 가져온다.
                 *
                 * @param {string} name - 테마명
                 * @return {Object} params
                 */
                getConfigsParams(name: string): { [key: string]: any } {
                    const params = this.configsParams;
                    params.name = name;
                    params.targetType = this.targetType;
                    params.targetName = this.targetName;

                    if (this.context !== null) {
                        params.host = this.context.host;
                        params.language = this.context.language;
                        params.path = this.context.path;
                    }

                    return params;
                }
            }
        }
    }
}
