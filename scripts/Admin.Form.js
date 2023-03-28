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
var Admin;
(function (Admin) {
    let Form;
    (function (Form) {
        class Panel extends Admin.Panel {
            loading = false;
            fieldDefaults;
            /**
             * 기본필드 클래스 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.role = 'form';
                this.fieldDefaults = this.properties.fieldDefaults ?? null;
                this.padding = this.properties.padding ?? 10;
            }
            /**
             * 폼 패널의 하위 컴포넌트를 정의한다.
             */
            initItems() {
                if (this.items === null) {
                    this.items = [];
                    for (const item of this.properties.items ?? []) {
                        if (item instanceof Admin.Component) {
                            if (item instanceof Admin.Form.FieldSet ||
                                item instanceof Admin.Form.Field.Container ||
                                item instanceof Admin.Form.Field.Base) {
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
            getField(name) {
                const $field = Html.get('div[data-component][data-type=form][data-role=field][data-name=' + name + ']', this.$getContent());
                if ($field.getEl() === null) {
                    return null;
                }
                return Admin.getComponent($field.getData('component'));
            }
            /**
             * 폼 패널에 속한 모든 필드를 가져온다.
             *
             * @return {Admin.Form.Field.Base[]} fields
             */
            getFields() {
                const fields = [];
                for (const item of this.items) {
                    if (item instanceof Admin.Form.FieldSet) {
                        fields.push(...item.getFields());
                    }
                    else if (item instanceof Admin.Form.Field.Container) {
                        fields.push(...item.getFields());
                    }
                    else if (item instanceof Admin.Form.Field.Base) {
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
            async isValid() {
                const validations = [];
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
            scrollToErrorField() {
                for (const field of this.getFields()) {
                    if (field.hasError() == true) {
                        const contentHeight = this.$getContent().getOuterHeight();
                        const position = field.$getComponent().getOffset().top - this.$getContent().getOffset().top;
                        if (position <= 0) {
                            this.getScrollbar()?.movePosition(0, position - 10, true, true);
                        }
                        else if (position >= contentHeight) {
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
            getValues() {
                const values = {};
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
            async load({ url, params = null, message = null }) {
                if (this.loading === true) {
                    return;
                }
                this.loading = true;
                const response = await Admin.Ajax.get(url, params);
                if (response.success == true) {
                    for (const name in response.datas) {
                        this.getField(name)?.setValue(response.datas[name]);
                    }
                }
                this.loading = false;
                return response;
            }
            /**
             * 폼 패널을 전송한다.
             *
             * @param {Admin.Form.Request} request - 요청정보
             * @return {Promise<Admin.Ajax.results>} results
             */
            async submit({ url, params = null, message = null }) {
                if (this.loading === true) {
                    return;
                }
                const isValid = await this.isValid();
                if (isValid === false) {
                    this.scrollToErrorField();
                    return;
                }
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
                return response;
            }
        }
        Form.Panel = Panel;
        class FieldSet extends Admin.Component {
            title;
            fieldDefaults;
            /**
             * 기본필드 클래스 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
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
            initItems() {
                if (this.items === null) {
                    this.items = [];
                    for (const item of this.properties.items ?? []) {
                        if (item instanceof Admin.Component) {
                            if (item instanceof Admin.Form.FieldSet ||
                                item instanceof Admin.Form.Field.Container ||
                                item instanceof Admin.Form.Field.Base) {
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
            setDefaults(defaults = null) {
                this.initItems();
                this.fieldDefaults = this.fieldDefaults ?? defaults;
                for (const item of this.items) {
                    if (item instanceof Admin.Form.FieldSet ||
                        item instanceof Admin.Form.Field.Container ||
                        item instanceof Admin.Form.Field.Base) {
                        item.setDefaults(this.fieldDefaults);
                    }
                }
            }
            /**
             * 상위 폼 패널을 가져온다.
             *
             * @return {Admin.Form.Panel} form
             */
            getForm() {
                const $form = this.$getComponent().getParents('div[data-component][data-type=panel][data-role=form]');
                if ($form?.getData('component')) {
                    return Admin.getComponent($form.getData('component'));
                }
                else {
                    return null;
                }
            }
            /**
             * 필드셋에 속한 모든 필드를 가져온다.
             *
             * @return {Admin.Form.Field.Base[]} fields
             */
            getFields() {
                const fields = [];
                for (const item of this.items) {
                    if (item instanceof Admin.Form.FieldSet) {
                        fields.push(...item.getFields());
                    }
                    else if (item instanceof Admin.Form.Field.Container) {
                        fields.push(...item.getFields());
                    }
                    else if (item instanceof Admin.Form.Field.Base) {
                        fields.push(item);
                    }
                }
                return fields;
            }
            /**
             * 필드셋 제목을 랜더링한다.
             */
            renderTop() {
                const $top = this.$getTop();
                if (this.title !== null) {
                    const $legend = Html.create('legend');
                    $legend.html(this.title);
                    $top.append($legend);
                }
            }
        }
        Form.FieldSet = FieldSet;
        let Field;
        (function (Field) {
            /**
             * 필드 컴포넌트를 생성한다.
             *
             * @param {Object} field - 필드정보
             * @return {Admin.Form.Field.Base} field
             */
            function Create(field) {
                switch (field.type) {
                    default:
                        return new Admin.Form.Field.Text({
                            name: field.name ?? null,
                            fieldLabel: field.label ?? null,
                            value: field.value ?? field.default ?? null,
                        });
                }
            }
            Field.Create = Create;
            class Base extends Admin.Component {
                type = 'form';
                role = 'field';
                field = 'base';
                name;
                inputName;
                allowBlank;
                label;
                labelPosition;
                labelAlign;
                labelWidth;
                labelSeparator;
                helpText;
                width;
                value = null;
                oValue = null;
                validator;
                validation = true;
                readonly;
                fieldDefaults;
                /**
                 * 기본필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Base.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
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
                setDefaults(defaults = null) {
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
                getForm() {
                    const $form = this.$getComponent().getParents('div[data-component][data-type=panel][data-role=form]');
                    if ($form?.getData('component')) {
                        return Admin.getComponent($form.getData('component'));
                    }
                    else {
                        return null;
                    }
                }
                /**
                 * 필드 라벨 위치를 가져온다.
                 *
                 * @return {string} labelPosition
                 */
                getLabelPosition() {
                    return this.labelPosition ?? 'left';
                }
                /**
                 * 필드 라벨 정렬방식을 가져온다.
                 *
                 * @return {string} labelAlign
                 */
                getLabelAlign() {
                    return this.labelAlign ?? 'left';
                }
                /**
                 * 필드 라벨의 너비를 가져온다.
                 *
                 * @return {number} labelWidth
                 */
                getLabelWidth() {
                    return this.labelWidth ?? 100;
                }
                /**
                 * 필드너비를 설정한다.
                 *
                 * @param {number} width - 너비(NULL 인 경우 최대너비)
                 */
                setWidth(width) {
                    this.$getComponent().setStyle('width', width === null ? null : width + 'px');
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 */
                setValue(value) {
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
                getValue() {
                    return this.value;
                }
                /**
                 * 필드값을 가져온다.
                 *
                 * @return {any} raw_value - 값
                 */
                getRawValue() {
                    return this.value;
                }
                /**
                 * 모든 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValues() {
                    const values = {};
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
                isChanged() {
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
                    }
                    else {
                        return this.value !== this.oValue;
                    }
                }
                /**
                 * 필드값이 비어있는지 확인한다.
                 *
                 * @return {boolean} is_blank
                 */
                isBlank() {
                    const value = this.getValue();
                    if (value === null) {
                        return true;
                    }
                    else if (typeof value == 'object') {
                        if (value.length == 0) {
                            return true;
                        }
                    }
                    else if (value.toString().length == 0) {
                        return true;
                    }
                    return false;
                }
                /**
                 * 필드값이 유효한지 확인하고 에러여부를 저장한다.
                 *
                 * @return {boolean} is_valid
                 */
                async isValid() {
                    const validation = await this.validate();
                    this.validation = validation;
                    if (validation !== true) {
                        this.setError(true, validation);
                    }
                    else {
                        this.setError(false);
                    }
                    return validation === true;
                }
                /**
                 * 필드값이 유효한지 확인한다.
                 *
                 * @return {boolean|string} validation
                 */
                async validate() {
                    if (this.allowBlank === false && this.isBlank() == true) {
                        return (await Admin.getText('errors/REQUIRED'));
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
                hasError() {
                    return this.validation !== true;
                }
                /**
                 * 도움말을 변경한다.
                 *
                 * @param {string} text - 도움말
                 */
                setHelpText(text) {
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
                setError(is_error, message = null) {
                    if (is_error === true) {
                        this.$getContent().addClass('error');
                        this.validation = message ?? false;
                    }
                    else {
                        this.$getContent().removeClass('error');
                        message = null;
                        this.validation = true;
                    }
                    if (this.getParent() instanceof Admin.Form.Field.Container) {
                        this.getParent().setError(this.getId(), is_error, message);
                        return;
                    }
                    if (message === null) {
                        this.setHelpText(this.helpText);
                        this.$getBottom()?.removeClass('error');
                    }
                    else {
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
                setDisabled(disabled) {
                    if (disabled == true) {
                        this.$getContent().addClass('disabled');
                    }
                    else {
                        this.$getContent().removeClass('disabled');
                    }
                    super.setDisabled(disabled);
                    return this;
                }
                /**
                 * 필드 라벨을 랜더링한다.
                 */
                renderTop() {
                    if (this.label === null)
                        return;
                    const $top = this.$getTop();
                    const $label = Html.create('label');
                    $label.html((this.labelSeparator ?? '<i>:</i>') + this.label);
                    $label.addClass(this.getLabelAlign());
                    $top.append($label);
                }
                /**
                 * 도움말 텍스트를 랜더링한다.
                 */
                renderBottom() {
                    if (this.helpText === null)
                        return;
                    const $bottom = this.$getBottom();
                    const $text = Html.create('p');
                    $text.html(this.helpText);
                    $bottom.append($text);
                }
                /**
                 * 필드를 랜더링한다.
                 */
                render() {
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
                updateLayout() {
                    this.setWidth(this.width);
                    if (this.label !== null) {
                        if (this.getLabelPosition() == 'left' || this.getLabelPosition() == 'right') {
                            this.$getTop().setStyle('width', this.getLabelWidth() + 'px');
                            this.$getContent().setStyle('width', 'calc(100% - ' + this.getLabelWidth() + 'px)');
                        }
                        else {
                            this.$getTop().setStyle('width', '100%');
                            this.$getContent().setStyle('width', '100%');
                        }
                    }
                    else {
                        this.$getContent().setStyle('width', '100%');
                    }
                    if (this.helpText !== null) {
                        if (this.getLabelPosition() == 'left') {
                            this.$getBottom().setStyle('padding-left', this.label == null ? 0 : this.getLabelWidth() + 'px');
                        }
                        if (this.getLabelPosition() == 'right') {
                            this.$getBottom().setStyle('padding-right', this.label == null ? 0 : this.getLabelWidth() + 'px');
                        }
                    }
                }
                /**
                 * 입력값이 변경되었을 때 이벤트를 처리한다.
                 */
                onChange() {
                    this.fireEvent('change', [this, this.getValue(), this.getRawValue(), this.oValue]);
                }
            }
            Field.Base = Base;
            class Container extends Admin.Component {
                type = 'form';
                role = 'field';
                field = 'container';
                label;
                labelPosition;
                labelAlign;
                labelWidth;
                labelSeparator;
                helpText;
                width;
                fieldDefaults;
                allowBlank = true;
                errors = new Map();
                direction = 'row';
                gap;
                /**
                 * 필드 컨테이너를 생성한다.
                 *
                 * @param {Admin.Form.Field.Container.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
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
                initItems() {
                    if (this.items === null) {
                        this.items = [];
                        for (const item of this.properties.items ?? []) {
                            if (item instanceof Admin.Component) {
                                if (item instanceof Admin.Form.FieldSet ||
                                    item instanceof Admin.Form.Field.Container ||
                                    item instanceof Admin.Form.Field.Base) {
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
                setDefaults(defaults = null) {
                    this.initItems();
                    this.fieldDefaults = defaults;
                    this.labelWidth ??= defaults?.labelWidth ?? null;
                    this.labelPosition ??= defaults?.labelPosition ?? null;
                    this.labelAlign ??= defaults?.labelAlign ?? null;
                    this.labelSeparator ??= defaults?.labelSeparator ?? null;
                    this.width ??= defaults?.width ?? null;
                    for (const item of this.items) {
                        if (item instanceof Admin.Form.FieldSet ||
                            item instanceof Admin.Form.Field.Container ||
                            item instanceof Admin.Form.Field.Base) {
                            item.setDefaults(defaults);
                        }
                    }
                }
                /**
                 * 상위 폼 패널을 가져온다.
                 *
                 * @return {Admin.Form.Panel} form
                 */
                getForm() {
                    const $form = this.$getComponent().getParents('div[data-component][data-type=panel][data-role=form]');
                    if ($form?.getData('component')) {
                        return Admin.getComponent($form.getData('component'));
                    }
                    else {
                        return null;
                    }
                }
                /**
                 * 필드 라벨 위치를 가져온다.
                 *
                 * @return {string} labelPosition
                 */
                getLabelPosition() {
                    return this.labelPosition ?? 'left';
                }
                /**
                 * 필드 라벨 정렬방식을 가져온다.
                 *
                 * @return {string} labelAlign
                 */
                getLabelAlign() {
                    return this.labelAlign ?? 'left';
                }
                /**
                 * 필드 라벨의 너비를 가져온다.
                 *
                 * @return {number} labelWidth
                 */
                getLabelWidth() {
                    return this.labelWidth ?? 100;
                }
                /**
                 * 필드너비를 설정한다.
                 *
                 * @param {number} width - 너비(NULL 인 경우 최대너비)
                 */
                setWidth(width) {
                    this.$getComponent().setStyle('width', width === null ? null : width + 'px');
                }
                /**
                 * 도움말을 변경한다.
                 *
                 * @param {string} text - 도움말
                 */
                setHelpText(text) {
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
                setError(id, is_error, message = null) {
                    if (this.getParent() instanceof Admin.Form.Field.Container) {
                        this.getParent().setError(this.getId(), is_error, message);
                        return;
                    }
                    this.errors.set(id, { is_error: is_error, message: message });
                    this.updateError();
                }
                /**
                 * 에러메시지를 업데이트한다.
                 */
                updateError() {
                    this.setHelpText(this.helpText);
                    this.$getBottom()?.removeClass('error');
                    const messages = [];
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
                getFields() {
                    const fields = [];
                    for (const item of this.items) {
                        if (item instanceof Admin.Form.FieldSet) {
                            fields.push(...item.getFields());
                        }
                        else if (item instanceof Admin.Form.Field.Container) {
                            fields.push(...item.getFields());
                        }
                        else if (item instanceof Admin.Form.Field.Base) {
                            fields.push(item);
                        }
                    }
                    return fields;
                }
                /**
                 * 필드 라벨을 랜더링한다.
                 */
                renderTop() {
                    if (this.label === null)
                        return;
                    const $top = this.$getTop();
                    const $label = Html.create('label');
                    $label.html((this.labelSeparator ?? '<i>:</i>') + this.label);
                    $label.addClass(this.getLabelAlign());
                    $top.append($label);
                }
                /**
                 * 필드 컨테이너에 속한 필드를 랜더링한다.
                 */
                renderContent() {
                    const $fields = Html.create('div', { 'data-role': 'fields' });
                    $fields.addClass(this.direction);
                    $fields.setStyle('gap', this.gap + 'px');
                    for (let item of this.getItems()) {
                        $fields.append(item.$getComponent());
                        if (item.properties.flex !== undefined) {
                            item.$getComponent().setStyle('flex-grow', item.properties.flex === true ? 1 : item.properties.flex);
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
                renderBottom() {
                    if (this.helpText === null)
                        return;
                    const $bottom = this.$getBottom();
                    const $text = Html.create('p');
                    $text.html(this.helpText);
                    $bottom.append($text);
                }
                /**
                 * 필드를 랜더링한다.
                 */
                render() {
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
                updateLayout() {
                    this.setWidth(this.width);
                    if (this.label !== null) {
                        if (this.getLabelPosition() == 'left' || this.getLabelPosition() == 'right') {
                            this.$getTop().setStyle('width', this.getLabelWidth() + 'px');
                            this.$getContent().setStyle('width', 'calc(100% - ' + this.getLabelWidth() + 'px)');
                        }
                        else {
                            this.$getTop().setStyle('width', '100%');
                            this.$getContent().setStyle('width', '100%');
                        }
                    }
                    else {
                        this.$getContent().setStyle('width', '100%');
                    }
                    if (this.helpText !== null) {
                        if (this.getLabelPosition() == 'left') {
                            this.$getBottom().setStyle('padding-left', this.label == null ? 0 : this.getLabelWidth() + 'px');
                        }
                        if (this.getLabelPosition() == 'right') {
                            this.$getBottom().setStyle('padding-right', this.label == null ? 0 : this.getLabelWidth() + 'px');
                        }
                    }
                }
            }
            Field.Container = Container;
            class Hidden extends Admin.Form.Field.Base {
                field = 'hidden';
                $input;
                /**
                 * 기본필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Base.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                }
                /**
                 * INPUT 필드 DOM 을 가져온다.
                 *
                 * @return {Dom} $input
                 */
                $getInput() {
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
                setValue(value) {
                    value = value?.toString() ?? '';
                    if (this.$getInput().getValue() != value) {
                        this.$getInput().setValue(value);
                    }
                    super.setValue(value);
                }
                /**
                 * INPUT 태그를 랜더링한다.
                 */
                renderContent() {
                    const $input = this.$getInput();
                    this.$getContent().append($input);
                }
                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender() {
                    super.onRender();
                    if (this.value !== undefined || this.value !== null) {
                        this.setValue(this.value);
                    }
                    this.hide();
                }
            }
            Field.Hidden = Hidden;
            class Text extends Admin.Form.Field.Base {
                field = 'text';
                inputType = 'text';
                emptyText;
                $input;
                $emptyText;
                /**
                 * 텍스트필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Text.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.emptyText = this.properties.emptyText ?? '';
                    this.emptyText = this.emptyText.length == 0 ? null : this.emptyText;
                }
                /**
                 * INPUT 필드 DOM 을 가져온다.
                 *
                 * @return {Dom} $input
                 */
                $getInput() {
                    if (this.$input === undefined) {
                        this.$input = Html.create('input', {
                            type: this.inputType,
                            name: this.inputName,
                        });
                        this.$input.on('input', (e) => {
                            const input = e.currentTarget;
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
                $getEmptyText() {
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
                setEmptyText(emptyText = null) {
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
                setValue(value) {
                    value = value?.toString() ?? '';
                    if (this.$getInput().getValue() != value) {
                        this.$getInput().setValue(value);
                    }
                    if (value.length > 0) {
                        this.$emptyText.hide();
                    }
                    else {
                        this.$emptyText.show();
                    }
                    super.setValue(value);
                }
                /**
                 * INPUT 태그를 랜더링한다.
                 */
                renderContent() {
                    const $input = this.$getInput();
                    this.$getContent().append($input);
                }
                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender() {
                    super.onRender();
                    if (this.value !== undefined || this.value !== null) {
                        this.setValue(this.value);
                    }
                }
                /**
                 * 필드 레이아웃을 업데이트한다.
                 */
                updateLayout() {
                    super.updateLayout();
                    if (this.properties.emptyText !== null) {
                        const $emptyText = this.$getEmptyText();
                        $emptyText.html(this.emptyText);
                        this.$getContent().append($emptyText);
                    }
                    else {
                        this.$getEmptyText().remove();
                    }
                }
            }
            Field.Text = Text;
            class Password extends Admin.Form.Field.Text {
                inputType = 'password';
            }
            Field.Password = Password;
            class Search extends Admin.Form.Field.Text {
                inputType = 'search';
            }
            Field.Search = Search;
            class Number extends Admin.Form.Field.Text {
                inputType = 'number';
            }
            Field.Number = Number;
            class Display extends Admin.Form.Field.Base {
                field = 'display';
                renderer;
                $display;
                /**
                 * 디스플레이필드 클래스 생성한다.
                 *
                 * @param {Object} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.renderer = this.properties.renderer ?? null;
                }
                /**
                 * DISPLAY 필드 DOM 을 가져온다.
                 *
                 * @return {Dom} $display
                 */
                $getDisplay() {
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
                setValue(value) {
                    value = value?.toString() ?? '';
                    if (this.renderer === null) {
                        this.$getDisplay().html(value);
                    }
                    else {
                        this.$getDisplay().html(this.renderer(value, this));
                    }
                    super.setValue(value);
                }
                /**
                 * DISPLAY 태그를 랜더링한다.
                 */
                renderContent() {
                    const $display = this.$getDisplay();
                    this.$getContent().append($display);
                }
                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender() {
                    super.onRender();
                    if (this.value !== undefined || this.value !== null) {
                        this.setValue(this.value);
                    }
                }
            }
            Field.Display = Display;
            class Select extends Admin.Form.Field.Base {
                field = 'select';
                store;
                search;
                multiple;
                emptyText;
                $emptyText;
                displayField;
                valueField;
                listField;
                rawValue;
                renderer;
                $display;
                absolute;
                list;
                /**
                 * 선택항목필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Select.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
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
                            ((display) => {
                                if (Array.isArray(display) == true) {
                                }
                                else if (typeof display == 'string' && display.length > 0) {
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
                getAbsolute() {
                    if (this.absolute === undefined) {
                        this.absolute = new Admin.Absolute({
                            $target: this.$getContent(),
                            items: [this.getList()],
                            width: '100%',
                            hideOnClick: true,
                            listeners: {
                                show: (absolute) => {
                                    const rect = absolute.getRect();
                                    const height = Html.get('body').getHeight();
                                    if (rect.top - 100 > height - rect.bottom) {
                                        absolute.setPosition(null, null, 'calc(100% - 1px)', 0);
                                        this.getList().setMaxHeight(rect.top - 10);
                                    }
                                    else {
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
                getList() {
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
                                selectionChange: (selections) => {
                                    if (selections.length == 0) {
                                        this.setValue(null);
                                    }
                                    else if (selections.length == 1) {
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
                getStore() {
                    return this.getList().getStore();
                }
                /**
                 * placeHolder DOM 객체를 가져온다.
                 *
                 * @return {Dom} $emptyText
                 */
                $getEmptyText() {
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
                $getDisplay() {
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
                $setDisplay(display) {
                    this.$display.html(display);
                }
                /**
                 * placeHolder 문자열을 설정한다.
                 *
                 * @param {string} emptyText - placeHolder (NULL 인 경우 표시하지 않음)
                 */
                setEmptyText(emptyText = null) {
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
                setValue(value) {
                    this.rawValue = value;
                    if (this.getStore().isLoaded() == false) {
                        this.getStore().load();
                        return;
                    }
                    if (Array.isArray(value) == true) {
                    }
                    else {
                        const record = this.getStore().find(this.valueField, value);
                        if (record == null) {
                            value = null;
                            this.$getEmptyText().show();
                        }
                        else {
                            value = record.get(this.valueField);
                            this.$getEmptyText().hide();
                        }
                        this.$setDisplay(this.renderer(record?.get(this.displayField) ?? '', record, this.$getDisplay(), this));
                    }
                    super.setValue(value);
                }
                /**
                 * 필드의 DOM 객체의 일부 키보드 이벤트를 목록 컴포넌트로 전달한다.
                 *
                 * @param {Dom} $target - DOM 객체
                 */
                setKeyboardEvent($target) {
                    $target.on('keydown', (e) => {
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
                expand() {
                    this.getAbsolute().show();
                    if (this.value !== null) {
                        this.getStore()
                            .getRecords()
                            .forEach((record, index) => {
                            if (record.get(this.valueField) == this.value) {
                                this.getList().select(index);
                            }
                        });
                    }
                }
                /**
                 * 선택목록을 최소화한다.
                 */
                collapse() {
                    this.getAbsolute().hide();
                }
                /**
                 * 선택목록이 확장되어 있는지 확인한다.
                 *
                 * @return {boolean} isExpand
                 */
                isExpand() {
                    return this.getAbsolute().isShow();
                }
                /**
                 * 상황에 따라 필드에 포커스를 적용한다.
                 */
                focus() {
                    if (this.search == true) {
                        Html.get('> input[type=search]', this.$getContent()).getEl().focus();
                    }
                    else {
                        Html.get('> button', this.$getContent()).getEl().focus();
                    }
                }
                /**
                 * 선택항목을 검색한다.
                 *
                 * @param {string} keyword - 검색어
                 */
                match(keyword) {
                    if (keyword.length > 0) {
                        this.expand();
                        if (this.value === null) {
                            this.$getEmptyText().hide();
                        }
                        else {
                            this.$getDisplay().hide();
                        }
                    }
                    else {
                        this.collapse();
                        if (this.value === null) {
                            this.$getEmptyText().show();
                        }
                        else {
                            this.$getDisplay().show();
                        }
                    }
                    // @todo 실제 목록 검색 및 필터링
                }
                /**
                 * 필드를 랜더링한다.
                 */
                renderContent() {
                    const $button = Html.create('button', { type: 'button' });
                    if (this.search == true) {
                        $button.setAttr('tabindex', '-1');
                    }
                    else {
                        $button.setAttr('tabindex', '0');
                    }
                    $button.on('mousedown', (e) => {
                        const $button = Html.el(e.currentTarget);
                        if (this.isExpand() == true) {
                            this.collapse();
                        }
                        else {
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
                        $search.on('input', (e) => {
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
                updateLayout() {
                    super.updateLayout();
                    if (this.properties.emptyText !== null) {
                        const $emptyText = this.$getEmptyText();
                        $emptyText.html(this.emptyText);
                        this.$getContent().append($emptyText);
                    }
                    else {
                        this.$getEmptyText().remove();
                    }
                }
                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender() {
                    super.onRender();
                    if (this.rawValue !== null) {
                        if (this.getStore().isLoaded() === true) {
                            this.setValue(this.rawValue);
                        }
                        else {
                            this.getStore().load();
                        }
                    }
                }
                /**
                 * 셀렉트폼의 목록 데이터가 로딩되었을 때 이벤트를 처리한다.
                 */
                onLoad() {
                    if (this.rawValue !== null) {
                        this.setValue(this.rawValue);
                    }
                }
                /**
                 * 셀렉트폼의 목록 데이터가 변경되었을 때 이벤트를 처리한다.
                 */
                onUpdate() {
                    if (this.rawValue !== null) {
                        this.setValue(this.rawValue);
                    }
                }
                /**
                 * 컴포넌트를 제거한다.
                 */
                remove() {
                    this.getAbsolute().remove();
                    super.remove();
                }
            }
            Field.Select = Select;
            class TextArea extends Admin.Form.Field.Base {
                field = 'textarea';
                rows;
                emptyText;
                $input;
                $emptyText;
                /**
                 * 텍스트에리어필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.TextArea.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
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
                $getInput() {
                    if (this.$input === undefined) {
                        this.$input = Html.create('textarea', {
                            name: this.inputName,
                            rows: this.rows.toString(),
                        });
                        this.$input.on('input', (e) => {
                            const input = e.currentTarget;
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
                $getEmptyText() {
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
                setEmptyText(emptyText = null) {
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
                setValue(value) {
                    value = value?.toString() ?? '';
                    if (this.$getInput().getValue() != value) {
                        this.$getInput().setValue(value);
                    }
                    if (value.length > 0) {
                        this.$emptyText.hide();
                    }
                    else {
                        this.$emptyText.show();
                    }
                    super.setValue(value);
                }
                /**
                 * 필드태그를 랜더링한다.
                 */
                renderContent() {
                    const $input = this.$getInput();
                    this.$getContent().append($input);
                }
                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender() {
                    super.onRender();
                    if (this.value !== undefined || this.value !== null) {
                        this.setValue(this.value);
                    }
                }
                /**
                 * 필드 레이아웃을 업데이트한다.
                 */
                updateLayout() {
                    super.updateLayout();
                    if (this.properties.emptyText !== null) {
                        const $emptyText = this.$getEmptyText();
                        $emptyText.html(this.emptyText);
                        this.$getContent().append($emptyText);
                    }
                    else {
                        this.$getEmptyText().remove();
                    }
                }
            }
            Field.TextArea = TextArea;
            class Check extends Admin.Form.Field.Base {
                field = 'check';
                boxLabel;
                onValue;
                offValue;
                checked;
                $input;
                $label;
                $boxLabel;
                /**
                 * 체크박스필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Check.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
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
                $getInput() {
                    if (this.$input === undefined) {
                        this.$input = Html.create('input', {
                            name: this.inputName,
                            type: 'checkbox',
                            value: this.onValue,
                        });
                        if (this.readonly === true) {
                            this.$input.setAttr('disabled', 'disabled');
                        }
                        this.$input.on('input', (e) => {
                            const input = e.currentTarget;
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
                $getLabel() {
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
                setDisabled(disabled) {
                    if (disabled == true) {
                        this.$getInput().setAttr('disabled', 'disabled');
                    }
                    else if (this.readonly === false) {
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
                $getBoxLabel() {
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
                setBoxLabel(boxLabel) {
                    this.boxLabel = boxLabel ?? '';
                    this.updateLayout();
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 */
                setValue(value) {
                    this.$getInput().setValue(value);
                    this.checked = this.getValue();
                    super.setValue(this.checked);
                }
                /**
                 * 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValue() {
                    const input = this.$getInput().getEl();
                    return input.checked;
                }
                /**
                 * 모든 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValues() {
                    const values = {};
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
                getRawValue() {
                    return this.getValue() === true ? this.onValue : this.offValue;
                }
                /**
                 * 필드태그를 랜더링한다.
                 */
                renderContent() {
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
                onRender() {
                    super.onRender();
                    this.setValue(this.checked);
                }
                /**
                 * 필드 레이아웃을 업데이트한다.
                 */
                updateLayout() {
                    super.updateLayout();
                    this.$getBoxLabel().html(this.boxLabel);
                }
            }
            Field.Check = Check;
            class CheckGroup extends Admin.Form.Field.Base {
                field = 'checkgroup';
                gap;
                columns;
                options;
                /**
                 * 체크박스그룹필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.CheckGroup.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
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
                initItems() {
                    if (this.items === null) {
                        this.items = [];
                        for (const value in this.options) {
                            this.items.push(new Admin.Form.Field.Check({
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
                            }));
                        }
                    }
                    super.initItems();
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {string|string[]} value - 값
                 */
                setValue(value) {
                    if (typeof value == 'string') {
                        value = [value];
                    }
                    this.items.forEach((item) => {
                        if (value.includes(item.onValue) === true) {
                            item.setValue(true);
                        }
                        else {
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
                getValue() {
                    const value = [];
                    this.items.forEach((item) => {
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
                getValues() {
                    const values = {};
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
                renderContent() {
                    const $content = this.$getContent();
                    const $inputs = Html.create('div', { 'data-role': 'inputs' });
                    for (const item of this.items) {
                        $inputs.append(item.$getComponent());
                        item.render();
                    }
                    $inputs.setStyle('grid-template-columns', 'repeat(' + Math.min(this.items.length, this.columns) + ', 1fr)');
                    $inputs.setStyle('grid-gap', this.gap + 'px');
                    $content.append($inputs);
                }
                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender() {
                    super.onRender();
                    this.setValue(this.value);
                }
            }
            Field.CheckGroup = CheckGroup;
            class Radio extends Admin.Form.Field.Base {
                field = 'radio';
                boxLabel;
                onValue;
                checked;
                $input;
                $boxLabel;
                /**
                 * 라디오필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Radio.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
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
                $getInput() {
                    if (this.$input === undefined) {
                        this.$input = Html.create('input', {
                            name: this.inputName,
                            type: 'radio',
                            value: this.onValue,
                        });
                        this.$input.on('input', (e) => {
                            const input = e.currentTarget;
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
                $getBoxLabel() {
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
                setBoxLabel(boxLabel) {
                    this.boxLabel = boxLabel ?? '';
                    this.updateLayout();
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 */
                setValue(value) {
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
                updateValue(value) {
                    this.oValue = value;
                    this.value = value;
                    this.checked = value;
                }
                /**
                 * 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValue() {
                    const input = this.$getInput().getEl();
                    return input.checked;
                }
                /**
                 * 모든 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValues() {
                    const values = {};
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
                getRawValue() {
                    return this.getValue() === true ? this.onValue : null;
                }
                /**
                 * 다른 라디오버튼을 클릭함으로써 값이 변경된 경우를 처리한다.
                 */
                updateChecked() {
                    if (this.getForm() === null) {
                        return;
                    }
                    Html.all('input[type=radio][name=' + this.inputName + ']', this.getForm().$getContent()).forEach(($input) => {
                        const $content = $input.getParents('div[data-role=content][data-field=radio]');
                        const $component = $content?.getParents('div[data-component][data-type=form][data-role=field]');
                        if ($component?.getData('component')) {
                            const input = Admin.getComponent($component.getData('component'));
                            if (input instanceof Admin.Form.Field.Radio) {
                                if (input.value != input.getValue()) {
                                    input.updateValue(input.getValue());
                                }
                            }
                        }
                    });
                }
                /**
                 * 필드태그를 랜더링한다.
                 */
                renderContent() {
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
                onRender() {
                    super.onRender();
                    this.setValue(this.checked);
                }
                /**
                 * 필드 레이아웃을 업데이트한다.
                 */
                updateLayout() {
                    super.updateLayout();
                    this.$getBoxLabel().html(this.boxLabel);
                }
            }
            Field.Radio = Radio;
            class RadioGroup extends Admin.Form.Field.Base {
                field = 'radiogroup';
                gap;
                columns;
                options;
                /**
                 * 라디오그룹필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.RadioGroup.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.columns = this.properties.columns ?? 1;
                    this.gap = this.properties.gap ?? 5;
                    this.options = this.properties.options ?? {};
                }
                /**
                 * 폼 패널의 하위 컴포넌트를 정의한다.
                 */
                initItems() {
                    if (this.items === null) {
                        this.items = [];
                        for (const value in this.options) {
                            this.items.push(new Admin.Form.Field.Radio({
                                inputName: this.name ?? this.inputName,
                                onValue: value,
                                checked: this.value == value,
                                boxLabel: this.options[value],
                                listeners: {
                                    change: () => {
                                        this.onChange();
                                    },
                                },
                            }));
                        }
                    }
                    super.initItems();
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {string} value - 값
                 */
                setValue(value) {
                    for (const item of this.items) {
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
                getValue() {
                    for (const item of this.items) {
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
                getValues() {
                    const values = {};
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
                renderContent() {
                    const $content = this.$getContent();
                    const $inputs = Html.create('div', { 'data-role': 'inputs' });
                    for (const item of this.items) {
                        $inputs.append(item.$getComponent());
                        item.render();
                    }
                    $inputs.setStyle('grid-template-columns', 'repeat(' + Math.min(this.items.length, this.columns) + ', 1fr)');
                    $inputs.setStyle('grid-gap', this.gap + 'px');
                    $content.append($inputs);
                }
                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender() {
                    super.onRender();
                    this.setValue(this.value);
                }
            }
            Field.RadioGroup = RadioGroup;
            class Theme extends Admin.Form.Field.Base {
                type = 'form';
                role = 'field';
                field = 'theme';
                listUrl;
                configsUrl;
                configsParams;
                select;
                fieldset;
                gap;
                /**
                 * 템플릿필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Template.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.value = this.properties.value ?? null;
                    if (this.value !== null && typeof this.value == 'string') {
                        this.value = { name: this.value, configs: {} };
                    }
                    this.oValue = this.value;
                    this.gap = this.properties.gap ?? 5;
                    this.listUrl = Admin.getProcessUrl('module', 'admin', 'themes');
                    this.configsUrl = Admin.getProcessUrl('module', 'admin', 'theme');
                    this.configsParams = this.properties.configsParams ?? {};
                }
                /**
                 * 폼 패널의 하위 컴포넌트를 정의한다.
                 */
                initItems() {
                    if (this.items === null) {
                        this.items = [];
                        this.select = new Admin.Form.Field.Select({
                            name: this.name,
                            flex: true,
                            store: new Admin.Store.Ajax({
                                url: this.listUrl,
                            }),
                            displayField: 'title',
                            valueField: 'name',
                            listField: 'name',
                            listClass: 'template',
                            listRenderer: (display, record) => {
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
                                change: async (field, value) => {
                                    field.disable();
                                    const params = this.configsParams;
                                    params.name = value;
                                    const configs = await Admin.Ajax.get(this.configsUrl, params);
                                    this.fieldset.empty();
                                    if (configs.fields.length == 0) {
                                        this.fieldset.hide();
                                    }
                                    else {
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
                        this.items.push(this.select);
                        this.items.push(this.getFieldSet());
                    }
                    super.initItems();
                }
                /**
                 * 테마설정을 위한 필드셋을 가져온다.
                 *
                 * @return {Admin.Form.FieldSet} fieldset
                 */
                getFieldSet() {
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
                setValue(value) {
                    if (typeof value == 'string') {
                        this.value = { name: value, configs: {} };
                    }
                    else {
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
                updateValue() {
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
                renderContent() {
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
            }
            Field.Theme = Theme;
            class Template extends Admin.Form.Field.Theme {
            }
            Field.Template = Template;
        })(Field = Form.Field || (Form.Field = {}));
    })(Form = Admin.Form || (Admin.Form = {}));
})(Admin || (Admin = {}));
