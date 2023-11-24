var Admin;
(function (Admin) {
    let Form;
    (function (Form) {
        class Panel extends Admin.Panel {
            loading;
            loadings = new Map();
            fieldDefaults;
            /**
             * 기본필드 클래스 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.role = 'form';
                this.fieldDefaults = this.properties.fieldDefaults ?? { labelAlign: 'right', labelWidth: 110 };
                this.padding = this.properties.padding ?? 10;
                this.loading = new Admin.Loading(this, {
                    type: this.properties.loadingType ?? 'column',
                    message: this.properties.loadingText ?? null,
                });
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
                for (const field of this.getFields()) {
                    if (field.name === name) {
                        return field;
                    }
                }
                return null;
            }
            /**
             * 폼 패널에 속한 모든 필드를 가져온다.
             *
             * @return {Admin.Form.Field.Base[]} fields
             */
            getFields() {
                const fields = [];
                for (const item of this.items ?? []) {
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
             * 폼 패널을 로딩상태로 설정한다.
             *
             * @param {Admin.Component} component - 로딩상태를 요청한 컴포넌트
             * @param {boolean} loading - 로딩여부
             * @param {string|boolean} message - 로딩메시지 표시여부
             */
            setLoading(component, loading, message = false) {
                this.loadings.set(component, loading);
                const isLoading = this.isLoading();
                if (isLoading == true && message !== false) {
                    if (typeof message == 'string') {
                        this.loading.setText(message);
                    }
                    this.loading.show();
                }
                else {
                    this.loading.hide();
                }
            }
            /**
             * 폼 패널이 로딩중인지 확인한다.
             *
             * @return {boolean} is_loading
             */
            isLoading() {
                for (const loading of this.loadings.values()) {
                    if (loading === true) {
                        return true;
                    }
                }
                return false;
            }
            /**
             * 폼 패널에 속한 모든 필드가 유효한지 확인한다.
             *
             * @return {boolean} is_valid
             */
            async isValid() {
                if (this.isLoading() === true) {
                    Admin.Message.show({
                        title: Admin.printText('info'),
                        message: Admin.printText('actions.waiting_retry'),
                        icon: Admin.Message.INFO,
                        buttons: Admin.Message.OK,
                    });
                    return false;
                }
                const validations = [];
                this.getFields().forEach((field) => {
                    if (this.isDisabled() === false) {
                        validations.push(field.isValid());
                    }
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
                this.setLoading(this, true, message ?? true);
                const response = await Admin.Ajax.get(url, params);
                if (response.success == true) {
                    for (const name in response.data) {
                        this.getField(name)?.setValue(response.data[name], true);
                    }
                }
                this.setLoading(this, false);
                this.fireEvent('load', [this, response]);
                return response;
            }
            /**
             * 폼 패널을 전송한다.
             *
             * @param {Admin.Form.Request} request - 요청정보
             * @return {Promise<Admin.Ajax.results>} results
             */
            async submit({ url, params = null, message = null }) {
                if (this.isLoading() === true) {
                    Admin.Message.show({
                        title: Admin.printText('info'),
                        message: Admin.printText('actions.waiting_retry'),
                        icon: Admin.Message.INFO,
                        buttons: Admin.Message.OK,
                    });
                    return { success: false };
                }
                const isValid = await this.isValid();
                if (isValid === false) {
                    this.scrollToErrorField();
                    return { success: false };
                }
                this.setLoading(this, true, message ?? Admin.printText('actions.saving_status'));
                const data = this.getValues();
                const response = await Admin.Ajax.post(url, data, params, false);
                if (response.success == false && typeof response.errors == 'object') {
                    for (const name in response.errors) {
                        this.getField(name)?.setError(true, response.errors[name]);
                    }
                    this.scrollToErrorField();
                }
                this.setLoading(this, false);
                this.fireEvent('submit', [this, response]);
                return response;
            }
            /**
             * 자식 컴포넌트를 추가한다.
             *
             * @param {Admin.Component} item - 추가할 컴포넌트
             * @param {number} position - 추가할 위치 (NULL 인 경우 제일 마지막 위치)
             */
            append(item, position = null) {
                if (item instanceof Admin.Form.Field.Base || item instanceof Admin.Form.FieldSet) {
                    item.setDefaults(this.fieldDefaults);
                }
                super.append(item, position);
            }
        }
        Form.Panel = Panel;
        class FieldSet extends Admin.Component {
            title;
            fieldDefaults;
            helpText;
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
                this.helpText = this.properties.helpText ?? null;
                this.padding = this.properties.padding ?? '10px';
                this.$setTop();
                if (this.helpText !== null) {
                    this.$setBottom();
                }
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
                let parent = this.getParent();
                while (parent !== null) {
                    if (parent instanceof Admin.Form.Panel) {
                        return parent;
                    }
                    parent = parent.getParent();
                }
                return null;
            }
            /**
             * 필드셋에 속한 필드를 가져온다.
             *
             * @param {string} name - 필드명
             * @return {Admin.Form.Field.Base} field
             */
            getField(name) {
                for (const field of this.getFields()) {
                    if (field.name === name) {
                        return field;
                    }
                }
                return null;
            }
            /**
             * 필드셋에 속한 모든 필드를 가져온다.
             *
             * @return {Admin.Form.Field.Base[]} fields
             */
            getFields() {
                const fields = [];
                for (const item of this.items ?? []) {
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
             * 필드셋 비활성화여부를 설정한다.
             *
             * @param {boolean} disabled - 비활성화여부
             * @return {this} this
             */
            setDisabled(disabled) {
                for (const item of this.items) {
                    item.setDisabled(disabled);
                }
                super.setDisabled(disabled);
                return this;
            }
            /**
             * 자식 컴포넌트를 추가한다.
             *
             * @param {Admin.Component} item - 추가할 컴포넌트
             * @param {number} position - 추가할 위치 (NULL 인 경우 제일 마지막 위치)
             */
            append(item, position = null) {
                if (item instanceof Admin.Form.Field.Base || item instanceof Admin.Form.FieldSet) {
                    item.setDefaults(this.fieldDefaults);
                }
                super.append(item, position);
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
             * 필드셋을 랜더링한다.
             */
            render() {
                super.render();
                const paddingTop = parseInt(this.$getContent().getStyle('padding-top').replace('/px$/', ''), 10);
                this.$getContent().setStyle('padding-top', Math.max(paddingTop, 16) + 'px');
            }
        }
        Form.FieldSet = FieldSet;
        let Field;
        (function (Field) {
            function Create(field) {
                switch (field.type) {
                    case 'select':
                        return new Admin.Form.Field.Select({
                            name: field.name ?? null,
                            label: field.label ?? null,
                            value: field.value ?? null,
                            allowBlank: field.allowBlank ?? true,
                            store: new Admin.Store.Array({
                                fields: ['display', 'value'],
                                records: ((options) => {
                                    const records = [];
                                    for (const value in options) {
                                        records.push([options[value], value]);
                                    }
                                    return records;
                                })(field.options),
                            }),
                        });
                    case 'fieldset':
                        return new Admin.Form.FieldSet({
                            title: field.label ?? null,
                            items: ((fields) => {
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
                            label: field.label ?? null,
                            value: field.value ?? null,
                            allowBlank: field.allowBlank ?? true,
                            width: 200,
                        });
                    case 'theme':
                        return new Admin.Form.Field.Theme({
                            name: field.name ?? null,
                            label: field.label ?? null,
                            value: field.value?.name ?? null,
                            allowBlank: field.allowBlank ?? true,
                        });
                    case 'template':
                        return new Admin.Form.Field.Template({
                            name: field.name ?? null,
                            label: field.label ?? null,
                            value: field.value?.name ?? null,
                            componentType: field.component.type,
                            componentName: field.component.name,
                            use_default: field.component.use_default ?? false,
                            allowBlank: field.allowBlank ?? true,
                        });
                    case 'color':
                        return new Admin.Form.Field.Color({
                            name: field.name ?? null,
                            label: field.label ?? null,
                            value: field.value ?? null,
                            allowBlank: field.allowBlank ?? true,
                        });
                    default:
                        return new Admin.Form.Field.Text({
                            name: field.name ?? null,
                            label: field.label ?? null,
                            value: field.value ?? null,
                            allowBlank: field.allowBlank ?? true,
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
                value = null;
                pValue = null;
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
                    this.label = this.properties.label ?? null;
                    this.labelPosition = this.properties.labelPosition ?? null;
                    this.labelAlign = this.properties.labelAlign ?? null;
                    this.labelWidth = this.properties.labelWidth ?? null;
                    this.labelSeparator = this.properties.labelSeparator ?? null;
                    this.helpText = this.properties.helpText ?? null;
                    this.padding = this.properties.padding ?? 0;
                    this.fieldDefaults = null;
                    this.scrollable = false;
                    this.validator = this.properties.validator ?? null;
                    this.value = undefined;
                    this.pValue = undefined;
                    this.oValue = this.properties.value;
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
                    let parent = this.getParent();
                    while (parent !== null) {
                        if (parent instanceof Admin.Form.Panel) {
                            return parent;
                        }
                        parent = parent.getParent();
                    }
                    return null;
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
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    this.value = value;
                    if (Format.isEqual(value, this.pValue) == false) {
                        this.onChange();
                        this.pValue = value;
                    }
                    if (is_origin == true) {
                        this.oValue = value;
                    }
                }
                /**
                 * 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValue() {
                    return this.value ?? null;
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
                    if (this.inputName === null || this.isDisabled() == true) {
                        return values;
                    }
                    if (this.getValue() !== null) {
                        values[this.inputName] = this.getValue();
                    }
                    return values;
                }
                /**
                 * 필드값을 원상태로 복원한다.
                 */
                rollback() {
                    if (this.isDirty() == true) {
                        this.setValue(this.oValue);
                    }
                }
                /**
                 * 필드값 변경여부를 가져온다.
                 *
                 * @return {boolean} is_dirty
                 */
                isDirty() {
                    return Format.isEqual(this.value, this.oValue) !== true;
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
                    if (this.isDisabled() === true) {
                        return true;
                    }
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
                        return await Admin.getErrorText('REQUIRED');
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
                    this.updateLayout();
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
                        const container = this.getParent();
                        if (container.label !== null) {
                            container.setError(this.getId(), is_error, message);
                            return;
                        }
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
                    this.updateLayout();
                }
                /**
                 * 필드 비활성화여부를 설정한다.
                 *
                 * @param {boolean} disabled - 비활성화여부
                 * @return {this} this
                 */
                setDisabled(disabled) {
                    if (disabled == true) {
                        this.$getContainer().addClass('disabled');
                        this.$getContent().addClass('disabled');
                    }
                    else {
                        this.$getContainer().removeClass('disabled');
                        this.$getContent().removeClass('disabled');
                    }
                    if (this.getParent() instanceof Admin.Form.Field.Base) {
                    }
                    else {
                        this.onChange();
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
                    if (this.$getBottom() !== null) {
                        if (this.getLabelPosition() == 'left') {
                            this.$getBottom().setStyle('padding-left', this.label == null ? 0 : this.getLabelWidth() + 'px');
                        }
                        if (this.getLabelPosition() == 'right') {
                            this.$getBottom().setStyle('padding-right', this.label == null ? 0 : this.getLabelWidth() + 'px');
                        }
                    }
                }
                /**
                 * 필드가 랜더링되었을 때 이벤트를 처리한다.
                 */
                onRender() {
                    if (this.oValue !== undefined && this.value === undefined) {
                        this.setValue(this.oValue, true);
                    }
                }
                /**
                 * 입력값이 변경되었을 때 이벤트를 처리한다.
                 */
                onChange() {
                    this.fireEvent('change', [this, this.getValue(), this.getRawValue(), this.pValue, this.oValue]);
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
                fieldDefaults;
                allowBlank = true;
                errors = new Map();
                direction = 'row';
                gap;
                $fields;
                /**
                 * 필드 컨테이너를 생성한다.
                 *
                 * @param {Admin.Form.Field.Container.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.label = this.properties.label ?? null;
                    this.labelPosition = this.properties.labelPosition ?? null;
                    this.labelAlign = this.properties.labelAlign ?? null;
                    this.labelWidth = this.properties.labelWidth ?? null;
                    this.labelSeparator = this.properties.labelSeparator ?? null;
                    this.helpText = this.properties.helpText ?? null;
                    this.padding = this.properties.padding ?? 0;
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
                 * 하위필드가 위치하는 DOM 객체를 가져온다.
                 *
                 * @return {Dom} $fields
                 */
                $getFields() {
                    if (this.$fields === undefined) {
                        this.$fields = Html.create('div', { 'data-role': 'fields' });
                        this.$fields.addClass(this.direction);
                        this.$fields.setStyle('gap', this.gap + 'px');
                    }
                    return this.$fields;
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
                    let parent = this.getParent();
                    while (parent !== null) {
                        if (parent instanceof Admin.Form.Panel) {
                            return parent;
                        }
                        parent = parent.getParent();
                    }
                    return null;
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
                    for (const item of this.items ?? []) {
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
                 * 필드 컨테이너에 속한 모든 필드의 값을 가져온다.
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
                 * 필드 컨테이너에 속한 모든 필드의 값을 가져온다.
                 *
                 * @param {Object} values
                 */
                setValues(values) {
                    this.getFields().forEach((field) => {
                        if (field.inputName !== undefined && values[field.inputName] !== undefined) {
                            field.setValue(values[field.inputName]);
                        }
                    });
                }
                /**
                 * 자식 컴포넌트를 추가한다.
                 *
                 * @param {Admin.Component} item - 추가할 컴포넌트
                 * @param {number} position - 추가할 위치 (NULL 인 경우 제일 마지막 위치)
                 */
                append(item, position = null) {
                    if (this.items === null) {
                        this.items = [];
                    }
                    item.setParent(this);
                    if (item instanceof Admin.Form.Field.Base || item instanceof Admin.Form.FieldSet) {
                        item.setDefaults(this.fieldDefaults);
                    }
                    if (position === null || position >= (this.items.length ?? 0)) {
                        this.items.push(item);
                    }
                    else if (position < 0 && Math.abs(position) >= (this.items.length ?? 0)) {
                        this.items.unshift(item);
                    }
                    else {
                        this.items.splice(position, 0, item);
                    }
                    if (this.isRendered() == true) {
                        this.$getFields().append(item.$getComponent(), position);
                        if (item.isRenderable() == true) {
                            item.render();
                        }
                    }
                }
                /**
                 * 필드 비활성화여부를 설정한다.
                 *
                 * @param {boolean} disabled - 비활성여부
                 * @return {Admin.Form.Field.TextArea} this
                 */
                setDisabled(disabled) {
                    const items = this.items ?? [];
                    for (let i = 0, loop = items.length; i < loop; i++) {
                        items[i].setDisabled(disabled);
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
                 * 필드 컨테이너에 속한 필드를 랜더링한다.
                 */
                renderContent() {
                    const $fields = this.$getFields();
                    this.$getContent().append($fields);
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
                /**
                 * 기본필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Base.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                }
                /**
                 * 숨김필드이므로 콘텐츠를 랜더링하지 않는다.
                 */
                renderContent() { }
                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender() {
                    super.onRender();
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
                 * 필드 비활성화여부를 설정한다.
                 *
                 * @param {boolean} disabled - 비활성여부
                 * @return {Admin.Form.Field.TextArea} this
                 */
                setDisabled(disabled) {
                    if (disabled == true) {
                        this.$getInput().setAttr('disabled', 'disabled');
                    }
                    else {
                        this.$getInput().removeAttr('disabled');
                    }
                    super.setDisabled(disabled);
                    return this;
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    value = value?.toString() ?? '';
                    if (this.$getInput().getValue() != value) {
                        this.$getInput().setValue(value);
                    }
                    if (value.length > 0) {
                        this.$getEmptyText().hide();
                    }
                    else {
                        this.$getEmptyText().show();
                    }
                    super.setValue(value, is_origin);
                }
                /**
                 * INPUT 태그를 랜더링한다.
                 */
                renderContent() {
                    const $input = this.$getInput();
                    this.$getContent().append($input);
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
            class Date extends Admin.Form.Field.Base {
                field = 'date';
                emptyText;
                format;
                displayFormat;
                absolute;
                calendar;
                $input;
                $button;
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
                    this.format = this.properties.format ?? 'YYYY-MM-DD';
                    this.displayFormat = this.properties.displayFormat ?? 'YYYY-MM-DD';
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
                            items: [this.getCalendar()],
                            hideOnClick: true,
                            parent: this,
                            listeners: {
                                show: () => {
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
                 * 달력 컴포넌트를 가져온다.
                 *
                 * @return {Admin.Form.Field.Date.Calendar} calendar
                 */
                getCalendar() {
                    if (this.calendar === undefined) {
                        this.calendar = new Admin.Form.Field.Date.Calendar({
                            parent: this,
                            listeners: {
                                change: (value) => {
                                    this.setValue(value);
                                    this.collapse();
                                },
                            },
                        });
                    }
                    return this.calendar;
                }
                /**
                 * INPUT 필드 DOM 을 가져온다.
                 *
                 * @return {Dom} $input
                 */
                $getInput() {
                    if (this.$input === undefined) {
                        this.$input = Html.create('input', {
                            type: 'text',
                            name: this.inputName,
                        });
                        this.$input.on('input', () => {
                            const value = this.$input.getValue();
                            if (value.length == 0) {
                                this.$getEmptyText().show();
                            }
                            else {
                                this.$getEmptyText().hide();
                                if (value.search(/^[0-9]{4}(\.|\-)?[0-9]{2}(\.|\-)?[0-9]{2}$/) === 0 &&
                                    moment(value).isValid() == true) {
                                    this.setValue(moment(value));
                                    this.setError(false);
                                }
                                else {
                                    this.setError(true, null);
                                }
                            }
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
                 * 버튼 DOM 을 가져온다.
                 *
                 * @return {Dom} $button
                 */
                $getButton() {
                    if (this.$button === undefined) {
                        this.$button = Html.create('button', {
                            type: 'button',
                            class: 'mi mi-calendar',
                        });
                        this.$button.on('mousedown', (e) => {
                            if (this.isExpand() == true) {
                                this.collapse();
                            }
                            else {
                                this.expand();
                            }
                            e.stopImmediatePropagation();
                        });
                    }
                    return this.$button;
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
                 * 필드 비활성화여부를 설정한다.
                 *
                 * @param {boolean} disabled - 비활성여부
                 * @return {Admin.Form.Field.TextArea} this
                 */
                setDisabled(disabled) {
                    if (disabled == true) {
                        this.$getInput().setAttr('disabled', 'disabled');
                        this.$getButton().setAttr('disabled', 'disabled');
                    }
                    else {
                        this.$getInput().removeAttr('disabled');
                        this.$getButton().removeAttr('disabled');
                    }
                    super.setDisabled(disabled);
                    return this;
                }
                /**
                 * 캘린더를 표시한다.
                 */
                expand() {
                    this.getCalendar().setValue(this.value);
                    this.getAbsolute().show();
                }
                /**
                 * 캘린더를 숨긴다.
                 */
                collapse() {
                    this.getAbsolute().hide();
                }
                /**
                 * 캘린더가 보이는 상태인지 확인한다.
                 *
                 * @return {boolean} isExpand
                 */
                isExpand() {
                    return this.getAbsolute().isShow();
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    if (typeof value == 'string') {
                        if (moment(value).isValid() == true) {
                            this.value = moment(value);
                        }
                        else {
                            this.value = null;
                        }
                    }
                    else if (value instanceof moment) {
                        this.value = value;
                    }
                    if (this.value === null) {
                        this.$getInput().setValue('');
                        this.$getEmptyText().show();
                    }
                    else {
                        this.$getInput().setValue(this.value.format(this.displayFormat));
                        this.$getEmptyText().hide();
                    }
                    this.setError(false);
                    super.setValue(this.value, is_origin);
                }
                /**
                 * 필드값을 가져온다.
                 *
                 * @return {string} value
                 */
                getValue() {
                    if (this.value instanceof moment) {
                        return this.value.format(this.format);
                    }
                    return null;
                }
                /**
                 * INPUT 태그를 랜더링한다.
                 */
                renderContent() {
                    const $input = this.$getInput();
                    this.$getContent().append($input);
                    const $button = this.$getButton();
                    this.$getContent().append($button);
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
            Field.Date = Date;
            (function (Date) {
                class Calendar extends Admin.Component {
                    type = 'form';
                    role = 'calendar';
                    $month;
                    current;
                    spinTimeout;
                    /**
                     * 캘린더를 생성한다.
                     *
                     * @param {Admin.Form.Field.Date.Calendar.Properties} properties - 객체설정
                     */
                    constructor(properties = null) {
                        super(properties);
                        this.current = this.properties.current ?? moment().format('YYYY-MM-DD');
                        this.$setTop();
                        this.$setBottom();
                    }
                    /**
                     * 설정된 현재 날짜를 moment 객체로 변경한다.
                     *
                     * @return {any} date
                     */
                    getCurrent() {
                        return moment(this.current);
                    }
                    /**
                     * 현재 월 버튼 DOM 을 가져온다.
                     *
                     * @return {Dom} $month
                     */
                    $getMonth() {
                        if (this.$month === undefined) {
                            this.$month = Html.create('button', { type: 'button', 'data-action': 'month' }, this.getCurrent().format('YYYY.MM'));
                        }
                        return this.$month;
                    }
                    /**
                     * 이전달로 이동한다.
                     */
                    prevMonth() {
                        const month = moment(this.$getContent().getData('month'));
                        const prev = month.add(-1, 'month');
                        this.$getMonth().html(prev.format('YYYY.MM'));
                        this.renderCalendar(prev);
                    }
                    /**
                     * 다음달로 이동한다.
                     */
                    nextMonth() {
                        const month = moment(this.$getContent().getData('month'));
                        const next = month.add(1, 'month');
                        this.$getMonth().html(next.format('YYYY.MM'));
                        this.renderCalendar(next);
                    }
                    /**
                     * 달을 이동한다.
                     *
                     * @param {string} direction - 이동할 방향
                     * @param {boolean} is_interval - 지속이동여부
                     */
                    startSpin(direction, is_interval = false) {
                        this.stopSpin();
                        if (direction == 'prev') {
                            this.prevMonth();
                        }
                        else {
                            this.nextMonth();
                        }
                        this.spinTimeout = setTimeout(this.startSpin.bind(this), is_interval == true ? 100 : 500, direction, true);
                    }
                    /**
                     * 달 이동을 중단한다.
                     */
                    stopSpin() {
                        if (this.spinTimeout) {
                            clearTimeout(this.spinTimeout);
                            this.spinTimeout = null;
                        }
                    }
                    /**
                     * 날짜를 선택한다.
                     *
                     * @param {any} date
                     */
                    setValue(date) {
                        if (typeof date == 'string' && moment(date).isValid() == true) {
                            date = moment(date);
                        }
                        else if (date instanceof moment) {
                        }
                        else {
                            date = moment();
                        }
                        if (this.current !== date.format('YYYY-MM-DD')) {
                            this.fireEvent('change', [date]);
                        }
                        this.current = date.format('YYYY-MM-DD');
                        this.renderContent();
                    }
                    /**
                     * 년월 선택영역을 랜더링한다.
                     */
                    renderTop() {
                        const $prev = Html.create('button', { type: 'button', 'data-action': 'prev' });
                        this.$getTop().append($prev);
                        $prev.on('mousedown', () => {
                            this.startSpin('prev');
                        });
                        $prev.on('mouseup', () => {
                            this.stopSpin();
                        });
                        $prev.on('mouseout', () => {
                            this.stopSpin();
                        });
                        const $month = this.$getMonth();
                        this.$getTop().append($month);
                        const $next = Html.create('button', { type: 'button', 'data-action': 'next' });
                        $next.on('mousedown', () => {
                            this.startSpin('next');
                        });
                        $next.on('mouseup', () => {
                            this.stopSpin();
                        });
                        $next.on('mouseout', () => {
                            this.stopSpin();
                        });
                        this.$getTop().append($next);
                    }
                    /**
                     * 캘린더를 랜더링한다.
                     */
                    renderContent() {
                        this.renderCalendar();
                    }
                    /**
                     * 오늘 선택버튼을 랜더링한다.
                     */
                    renderBottom() {
                        const $button = Html.create('button', { type: 'button' });
                        this.$getBottom().append($button);
                        $button.html(Admin.printText('components.form.calendar.today'));
                        $button.on('click', () => {
                            const today = moment();
                            this.$getMonth().html(today.format('YYYY.MM'));
                            this.renderCalendar(today);
                        });
                    }
                    /**
                     * 캘린더를 랜더링한다.
                     */
                    renderCalendar(month = null) {
                        month ??= this.getCurrent();
                        this.$getContent().setData('month', month.format('YYYY-MM-DD'), false);
                        this.$getContent().empty();
                        const $days = Html.create('ul', { 'data-role': 'days' });
                        const firstDate = month.set('date', 1);
                        const startDay = firstDate.format('e');
                        const startDate = firstDate.clone().add(startDay * -1, 'd');
                        for (let i = 0; i < 7; i++) {
                            const date = startDate.clone().add(i, 'd');
                            const $day = Html.create('li', { 'data-day': date.format('dd') });
                            $day.html(date.locale(Admin.getLanguage()).format('dd'));
                            $days.append($day);
                        }
                        this.$getContent().append($days);
                        const $dates = Html.create('ul', { 'data-role': 'dates' });
                        for (let i = 0; i < 42; i++) {
                            const date = startDate.clone().add(i, 'd');
                            const $date = Html.create('li', { 'data-day': date.format('dd') });
                            if (date.month() != firstDate.month()) {
                                $date.addClass('disabled');
                            }
                            if (date.format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                                $date.addClass('today');
                            }
                            if (this.getCurrent().format('YYYY-MM-DD') == date.format('YYYY-MM-DD')) {
                                $date.addClass('selected');
                            }
                            $date.html(date.format('D'));
                            $date.on('click', () => {
                                this.setValue(date);
                            });
                            $dates.append($date);
                        }
                        this.$getContent().append($dates);
                    }
                }
                Date.Calendar = Calendar;
            })(Date = Field.Date || (Field.Date = {}));
            class Password extends Admin.Form.Field.Text {
                inputType = 'password';
            }
            Field.Password = Password;
            class Search extends Admin.Form.Field.Text {
                inputType = 'search';
                handler;
                $button;
                /**
                 * 검색필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Search.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.handler = this.properties.handler ?? null;
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
                        this.$input.on('keydown', (e) => {
                            if (e.key == 'Enter') {
                                this.search();
                                e.preventDefault();
                                e.stopImmediatePropagation();
                            }
                        });
                    }
                    return this.$input;
                }
                /**
                 * 검색버튼 DOM 을 가져온다.
                 *
                 * @return {Dom} $searchButton
                 */
                $getButton() {
                    if (this.$button === undefined) {
                        this.$button = Html.create('button', {
                            type: 'button',
                            'data-action': 'search',
                        });
                        this.$button.html('<i></i>');
                        this.$button.on('click', (e) => {
                            this.search();
                            e.preventDefault();
                            e.stopImmediatePropagation();
                        });
                    }
                    return this.$button;
                }
                /**
                 * 검색을 시작한다.
                 */
                search() {
                    if (this.handler !== null) {
                        this.handler(this.getValue(), this);
                    }
                }
                /**
                 * INPUT 태그를 랜더링한다.
                 */
                renderContent() {
                    const $input = this.$getInput();
                    this.$getContent().append($input);
                    const $button = this.$getButton();
                    this.$getContent().append($button);
                }
            }
            Field.Search = Search;
            class Color extends Admin.Form.Field.Text {
                inputType = 'color';
                $button;
                $preview;
                /**
                 * 색상필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Color.Properties} properties - 객체설정
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
                            type: 'text',
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
                 * 컬러픽커버튼 DOM 을 가져온다.
                 *
                 * @return {Dom} $searchButton
                 */
                $getButton() {
                    if (this.$button === undefined) {
                        this.$button = Html.create('input', {
                            type: 'color',
                        });
                        this.$button.on('input', (e) => {
                            this.setValue(e.currentTarget.value);
                        });
                    }
                    return this.$button;
                }
                /**
                 * 색상미리보기 필드 DOM 을 가져온다.
                 *
                 * @return {Dom} $input
                 */
                $getPreview() {
                    if (this.$preview === undefined) {
                        this.$preview = Html.create('i', { 'data-role': 'preview' });
                    }
                    return this.$preview;
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin) {
                    if (value !== null && value.length > 0 && value.search(/^#[a-zA-Z0-9]{6}$/) === -1) {
                        this.setError(true);
                    }
                    else {
                        this.setError(false);
                        if (value !== null) {
                            value = value.toLowerCase();
                        }
                        this.$getPreview().setStyle('background', value);
                        this.$getButton().setValue(value);
                    }
                    super.setValue(value, is_origin);
                }
                /**
                 * 필드값이 유효한지 확인한다.
                 *
                 * @return {boolean|string} validation
                 */
                async validate() {
                    if (this.allowBlank === false && this.isBlank() == true) {
                        return await Admin.getErrorText('REQUIRED');
                    }
                    if (typeof this.validator == 'function') {
                        return await this.validator(this.getValue(), this);
                    }
                    if (this.getValue() !== null && this.getValue().length > 0) {
                        if (this.getValue().search(/^#[a-zA-Z0-9]{6}$/) === -1) {
                            return await Admin.getErrorText('INVALID_COLOR_CODE');
                        }
                    }
                    return true;
                }
                /**
                 * INPUT 태그를 랜더링한다.
                 */
                renderContent() {
                    const $input = this.$getInput();
                    this.$getContent().append($input);
                    const $button = this.$getButton();
                    this.$getContent().append($button);
                    const $preview = this.$getPreview();
                    this.$getContent().append($preview);
                }
            }
            Field.Color = Color;
            class Number extends Admin.Form.Field.Text {
                inputType = 'number';
                step;
                minValue;
                maxValue;
                spinner;
                $spinner;
                spinTimeout;
                /**
                 * 숫자필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Number.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.spinner = this.properties.spinner !== false;
                    this.step = this.properties.step ?? 1;
                    this.minValue = this.properties.minValue ?? null;
                    this.maxValue = this.properties.maxnValue ?? null;
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
                            step: this.step.toString(),
                        });
                        this.$input.on('input', (e) => {
                            const input = e.currentTarget;
                            this.setValue(input.value);
                        });
                    }
                    return this.$input;
                }
                /**
                 * 마우스가 활성화된 동안 지속해서 값을 변경한다.
                 *
                 * @param {number} step - 변경할 단계
                 */
                startSpin(step, is_interval = false) {
                    this.stopSpin();
                    this.doStep(step);
                    this.spinTimeout = setTimeout(this.startSpin.bind(this), is_interval == true ? 100 : 500, step, true);
                }
                /**
                 * 값 변경을 중단한다.
                 */
                stopSpin() {
                    if (this.spinTimeout) {
                        clearTimeout(this.spinTimeout);
                        this.spinTimeout = null;
                    }
                }
                /**
                 * 값을 변경한다.
                 *
                 * @param {number} step - 변경할 단계
                 */
                doStep(step) {
                    const value = parseInt(this.$getInput().getValue(), 10);
                    let change = value + step;
                    if (this.minValue !== null) {
                        change = Math.max(this.minValue, change);
                    }
                    if (this.maxValue !== null) {
                        change = Math.min(this.maxValue, change);
                    }
                    this.setValue(change);
                }
                /**
                 * 스피너를 가져온다.
                 *
                 * @return {Dom} $spinner
                 */
                $getSpinner() {
                    if (this.$spinner === undefined) {
                        this.$spinner = Html.create('div', { 'data-role': 'spinner' });
                        const $increase = Html.create('button', {
                            type: 'button',
                            'data-direction': 'increase',
                            'tabindex': '-1',
                        });
                        $increase.html('<i></i>');
                        this.$spinner.append($increase);
                        $increase.on('mousedown', () => {
                            this.startSpin(this.step);
                        });
                        $increase.on('mouseup', () => {
                            this.stopSpin();
                        });
                        $increase.on('mouseout', () => {
                            this.stopSpin();
                        });
                        const $decrease = Html.create('button', {
                            type: 'button',
                            'data-direction': 'decrease',
                            'tabindex': '-1',
                        });
                        $decrease.html('<i></i>');
                        $decrease.on('mousedown', () => {
                            this.startSpin(this.step * -1);
                        });
                        $decrease.on('mouseup', () => {
                            this.stopSpin();
                        });
                        $decrease.on('mouseout', () => {
                            this.stopSpin();
                        });
                        this.$spinner.append($decrease);
                    }
                    return this.$spinner;
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {number|string} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    if (typeof value == 'string') {
                        value = parseFloat(value);
                    }
                    if (typeof value != 'number' || isNaN(value) == true) {
                        return;
                    }
                    if (this.minValue !== null) {
                        value = Math.max(this.minValue, value);
                    }
                    if (this.maxValue !== null) {
                        value = Math.min(this.maxValue, value);
                    }
                    super.setValue(value, is_origin);
                }
                /**
                 * 최소값을 설정한다.
                 *
                 * @param {number} minValue
                 */
                setMinValue(minValue) {
                    this.minValue = minValue;
                    if (this.minValue === null) {
                        this.$getInput().removeAttr('min');
                    }
                    else {
                        this.$getInput().setAttr('min', this.minValue.toString());
                    }
                }
                /**
                 * 최대값을 설정한다.
                 *
                 * @param {number} maxValue
                 */
                setMaxValue(maxValue) {
                    this.maxValue = maxValue;
                    if (this.maxValue === null) {
                        this.$getInput().removeAttr('max');
                    }
                    else {
                        this.$getInput().setAttr('max', this.maxValue.toString());
                    }
                }
                /**
                 * INPUT 태그를 랜더링한다.
                 */
                renderContent() {
                    const $input = this.$getInput();
                    this.$getContent().append($input);
                    if (this.spinner == true) {
                        this.$getContent().append(this.$getSpinner());
                    }
                }
                /**
                 * 필드를 랜더링한다.
                 */
                render() {
                    super.render();
                    if (this.minValue !== null) {
                        this.setMinValue(this.minValue);
                    }
                    if (this.maxValue !== null) {
                        this.setMaxValue(this.maxValue);
                    }
                }
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
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    value = value?.toString() ?? null;
                    if (this.renderer === null) {
                        this.$getDisplay().html(value ?? '');
                    }
                    else {
                        this.$getDisplay().html(this.renderer(value, this));
                    }
                    super.setValue(value, is_origin);
                }
                /**
                 * DISPLAY 태그를 랜더링한다.
                 */
                renderContent() {
                    const $display = this.$getDisplay();
                    this.$getContent().append($display);
                }
            }
            Field.Display = Display;
            class Tags extends Admin.Form.Field.Base {
                field = 'tags';
                absolute;
                list;
                store;
                tagField;
                url;
                $tags;
                $input;
                /**
                 * 태그 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Tags.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.store = this.properties.store ?? null;
                    this.tagField = this.properties.tagField ?? 'tag';
                }
                /**
                 * 절대위치 목록 컴포넌트를 가져온다.
                 *
                 * @return {Admin.Absolute} absolute
                 */
                getAbsolute() {
                    if (this.store === null) {
                        return null;
                    }
                    if (this.absolute === undefined) {
                        this.absolute = new Admin.Absolute({
                            $target: this.$getInput(),
                            items: [this.getList()],
                            direction: 'y',
                            hideOnClick: true,
                            parent: this,
                            listeners: {
                                show: (absolute) => {
                                    this.getList().setMaxHeight(absolute.getPosition().maxHeight);
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
                    if (this.store === null) {
                        return null;
                    }
                    if (this.list === undefined) {
                        this.list = new Admin.List.Panel({
                            store: this.properties.store,
                            renderer: this.properties.listRenderer,
                            displayField: this.tagField,
                            valueField: this.tagField,
                            class: 'tags',
                            hideOnEmpty: true,
                            parent: this,
                            listeners: {
                                update: () => {
                                    this.getList().setMaxHeight(null);
                                    this.getAbsolute().updatePosition();
                                    this.getList().setMaxHeight(this.getAbsolute().getPosition().maxHeight);
                                },
                                move: (record) => {
                                    this.$getInput().setValue(record.get(this.tagField));
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
                    return this.getList()?.getStore() ?? null;
                }
                /**
                 * 태그 입력 DOM 을 가져온다.
                 *
                 * @return {Dom} $tags
                 */
                $getTags() {
                    if (this.$tags === undefined) {
                        this.$tags = Html.create('div', { 'data-role': 'tags' });
                    }
                    return this.$tags;
                }
                /**
                 * 태그 DOM 을 가져온다.
                 *
                 * @param {string} tag - 태그
                 * @return {Dom} $tag
                 */
                $getTag(tag) {
                    const $tag = Html.create('div', { 'data-role': 'tag' });
                    $tag.setData('tag', tag, false);
                    const $span = Html.create('span').html(tag);
                    $span.on('click', () => {
                        $tag.append(this.$getInput());
                        this.$getInput().setValue($tag.getData('tag'));
                        this.$getInput().focus();
                    });
                    $tag.append($span);
                    const $button = Html.create('button', { type: 'button' });
                    $tag.append($button);
                    return $tag;
                }
                /**
                 * 태그 INPUT DOM 을 가져온다.
                 *
                 * @return {Dom} $input
                 */
                $getInput() {
                    if (this.$input === undefined) {
                        this.$input = Html.create('input', { type: 'text' });
                        this.$input.on('keydown', (e) => {
                            if (e.key == ' ' || e.key == '#') {
                                e.preventDefault();
                            }
                            if (e.key == 'Tab' || e.key == ',' || e.key == 'Enter') {
                                this.collapse();
                                const value = this.$input.getValue();
                                if (value.length > 0) {
                                    const $parent = this.$input.getParent();
                                    if ($parent.getAttr('data-role') == 'tags') {
                                        this.addTag(value);
                                    }
                                    else {
                                        this.setTag($parent, value, 'next');
                                    }
                                    this.$input.focus();
                                    e.preventDefault();
                                }
                                if (e.key == ',') {
                                    e.preventDefault();
                                }
                            }
                            if (e.key == 'ArrowDown' || e.key == 'ArrowUp') {
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
                        });
                        this.$input.on('input', () => {
                            if (this.getAbsolute()?.isShow() === false) {
                                this.expand();
                            }
                            this.getStore().setFilter(this.tagField, this.$getInput().getValue(), 'likecode');
                        });
                        this.$input.on('blur', () => {
                            this.collapse();
                            const value = this.$input.getValue();
                            if (value.length > 0) {
                                const $parent = this.$input.getParent();
                                if ($parent.getAttr('data-role') == 'tags') {
                                    this.addTag(value);
                                }
                                else {
                                    this.setTag($parent, value, 'last');
                                }
                            }
                            if (this.$getTags().getChildren().length - 1 != this.$input.getIndex()) {
                                this.$getTags().append(this.$input);
                                this.$input.focus();
                            }
                        });
                    }
                    return this.$input;
                }
                /**
                 * 태그를 추가한다.
                 *
                 * @param {string} tag - 추가할 태그
                 */
                addTag(tag) {
                    const index = this.$getInput().getIndex();
                    const $tag = this.$getTag(tag);
                    this.$getInput().setValue('');
                    this.$getTags().append($tag, index);
                    this.updateValue();
                }
                /**
                 * 기존 태그를 수정한다.
                 *
                 * @param {Dom} $dom - 수정할 태그 DOM 객체
                 * @param {string} tag - 태그명
                 * @param {'last'|'next'} position - 수정 후 INPUT 위치
                 */
                setTag($dom, tag, position = 'last') {
                    const index = $dom.getIndex();
                    this.$getInput().setValue('');
                    if (position == 'last') {
                        this.$getTags().append(this.$getInput());
                    }
                    else {
                        this.$getTags().append(this.$getInput(), index + 1);
                    }
                    $dom.replaceWith(this.$getTag(tag));
                    this.updateValue();
                }
                /**
                 * 선택목록을 확장한다.
                 */
                expand() {
                    this.getAbsolute()?.show();
                }
                /**
                 * 선택목록을 최소화한다.
                 */
                collapse() {
                    this.getList()?.deselectAll();
                    this.getStore().resetFilter();
                    this.getAbsolute()?.hide();
                }
                /**
                 * 선택목록이 확장되어 있는지 확인한다.
                 *
                 * @return {boolean} isExpand
                 */
                isExpand() {
                    return this.getAbsolute()?.isShow() ?? false;
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {string[]} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    if (Array.isArray(value) == false) {
                        value = null;
                    }
                    for (const tag of value) {
                        this.addTag(tag);
                    }
                    super.setValue(value, is_origin);
                }
                /**
                 * 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValue() {
                    const value = [];
                    Html.all('div[data-role=tag]', this.$getTags()).forEach(($tag) => {
                        value.push($tag.getData('tag'));
                    });
                    return value.length > 0 ? value : null;
                }
                /**
                 * 필드값을 갱신한다.
                 */
                updateValue() {
                    super.setValue(this.getValue());
                }
                /**
                 * 필드를 랜더링한다.
                 */
                renderContent() {
                    const $tags = this.$getTags();
                    const $input = this.$getInput();
                    $tags.append($input);
                    this.$getContent().append($tags);
                }
            }
            Field.Tags = Tags;
            class Blocks extends Admin.Form.Field.Base {
                field = 'blocks';
                button;
                blocks;
                fieldContainer;
                /**
                 * 블럭 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Blocks.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.blocks = this.properties.blocks ?? {
                        text: {
                            text: Admin.printText('components.form.blocks.text'),
                            iconClass: 'xi xi-caps',
                            field: () => {
                                return new Admin.Form.Field.Text({
                                    name: 'text',
                                });
                            },
                        },
                    };
                }
                /**
                 * 블럭 추가 버튼을 가져온다.
                 *
                 * @return {Admin.Button} button
                 */
                getButton() {
                    if (this.button === undefined) {
                        this.button = new Admin.Button({
                            iconClass: 'mi mi-plus',
                            text: Admin.printText('components.form.blocks.add'),
                            buttonClass: 'confirm',
                            parent: this,
                            menu: new Admin.Menu({
                                items: ((blocks) => {
                                    const items = [];
                                    for (const type in blocks) {
                                        const block = blocks[type];
                                        items.push(new Admin.Menu.Item({
                                            text: block.text,
                                            iconClass: block.iconClass ?? null,
                                            handler: () => {
                                                this.addBlock(type, block.field());
                                            },
                                        }));
                                    }
                                    return items;
                                })(this.blocks),
                            }),
                        });
                    }
                    return this.button;
                }
                /**
                 * 블럭에 추가된 필드를 구현할 컨테이너를 가져온다.
                 *
                 * @return {Admin.Button} button
                 */
                getFieldContainer() {
                    if (this.fieldContainer === undefined) {
                        this.fieldContainer = new Admin.Form.Field.Container({
                            direction: 'column',
                            items: [],
                            gap: 5,
                            hidden: true,
                            parent: this,
                        });
                    }
                    return this.fieldContainer;
                }
                /**
                 * 블럭 데이터를 지정한다.
                 *
                 * @param {Object[]} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    if (Array.isArray(value) == true) {
                        this.getFieldContainer().empty();
                        for (const block of value) {
                            if (this.blocks[block.type] !== undefined) {
                                this.addBlock(block.type, this.blocks[block.type].field(), block.value);
                            }
                        }
                    }
                    else {
                        value = null;
                    }
                    super.setValue(value, is_origin);
                }
                /**
                 * 필드값을 가져온다..
                 *
                 * @return {Object[]} value - 값
                 */
                getValue() {
                    const blocks = [];
                    for (const block of this.getFieldContainer().getItems()) {
                        const field = block.getItemAt(0);
                        const value = field instanceof Admin.Form.Field.Container ? field.getValues() : field.getValue();
                        const data = {
                            type: block.properties.blockType,
                            value: value,
                        };
                        blocks.push(data);
                    }
                    if (blocks.length == 0) {
                        return null;
                    }
                    else {
                        return blocks;
                    }
                }
                /**
                 * 블럭 콘텐츠 데이터를 업데이트한다.
                 */
                updateValue() {
                    const blocks = [];
                    for (const block of this.getFieldContainer().getItems()) {
                        const field = block.getItemAt(0);
                        const value = field instanceof Admin.Form.Field.Container ? field.getValues() : field.getValue();
                        const data = {
                            type: block.properties.blockType,
                            value: value,
                        };
                        blocks.push(data);
                    }
                    if (blocks.length == 0) {
                        super.setValue(null);
                    }
                    else {
                        super.setValue(blocks);
                    }
                }
                /**
                 * 블럭을 추가한다.
                 *
                 * @param {string} type - 블럭타입
                 * @param {Admin.Form.Field.Base|Admin.Form.Field.Container} field - 추가할 필드
                 * @param {any} value - 필드값
                 */
                addBlock(type, field, value = null) {
                    field.addEvent('change', () => {
                        this.updateValue();
                    });
                    const block = new Admin.Form.Field.Container({
                        blockType: type,
                        items: [],
                        parent: this,
                    });
                    block.append(field);
                    field.setParent(block);
                    block.append(new Admin.Button({
                        iconClass: 'mi mi-up',
                        handler: (button) => {
                            const item = button.getParent();
                            const container = item.getParent();
                            const index = container.getItemIndex(item);
                            if (index > 0) {
                                const swap = container.getItemAt(index - 1);
                                container.items[index - 1] = item;
                                container.items[index] = swap;
                                const $parent = item.$getComponent().getParent();
                                $parent.append(item.$getComponent(), index - 1);
                            }
                        },
                    }));
                    block.append(new Admin.Button({
                        iconClass: 'mi mi-down',
                        handler: (button) => {
                            const item = button.getParent();
                            const container = item.getParent();
                            const index = container.getItemIndex(item);
                            if (index < container.getItems().length - 1) {
                                const swap = container.getItemAt(index + 1);
                                container.items[index + 1] = item;
                                container.items[index] = swap;
                                const $parent = item.$getComponent().getParent();
                                $parent.append(swap.$getComponent(), index);
                            }
                        },
                    }));
                    block.append(new Admin.Button({
                        iconClass: 'mi mi-trash',
                        buttonClass: 'danger',
                        handler: (button) => {
                            const item = button.getParent();
                            item.remove();
                        },
                    }));
                    this.getFieldContainer().append(block);
                    if (this.getFieldContainer().getItems().length > 0) {
                        this.getFieldContainer().show();
                    }
                    if (value !== null) {
                        if (field instanceof Admin.Form.Field.Base) {
                            field.setValue(value);
                        }
                        else {
                            field.setValues(value);
                        }
                    }
                }
                /**
                 * 필드를 랜더링한다.
                 */
                renderContent() {
                    const $blocks = Html.create('div', { 'data-role': 'blocks' });
                    $blocks.append(this.getFieldContainer().$getComponent());
                    this.getFieldContainer().render();
                    $blocks.append(this.getButton().$getComponent());
                    this.getButton().render();
                    this.$getContent().append($blocks);
                }
            }
            Field.Blocks = Blocks;
            class File extends Admin.Form.Field.Base {
                type = 'form';
                role = 'field';
                field = 'file';
                accept;
                multiple;
                attachment;
                uploader;
                $files;
                button;
                /**
                 * 템플릿필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Theme.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.accept = this.properties.accept ?? '*';
                    this.multiple = this.properties.multiple !== false;
                }
                /**
                 * 파일선택 버튼을 가져온다.
                 *
                 * @return {Admin.Button} button
                 */
                getButton() {
                    if (this.button === undefined) {
                        this.button = new Admin.Button({
                            iconClass: this.properties.buttonIconClass ?? 'mi mi-upload',
                            text: this.properties.buttonText ?? Admin.printText('buttons.file_select'),
                            parent: this,
                            handler: () => {
                                this.select();
                            },
                        });
                    }
                    return this.button;
                }
                /**
                 * 첨부파일 모듈 클래스를 가져온다.
                 *
                 * @return {modules.attachment.Attachment} attachment
                 */
                getAttachment() {
                    if (this.attachment === undefined) {
                        this.attachment = Modules.get('attachment');
                    }
                    return this.attachment;
                }
                /**
                 * 업로더를 가져온다.
                 *
                 * @return {modules.attachment.Uploader} uploader
                 */
                getUploader() {
                    if (this.uploader === undefined) {
                        this.uploader = this.getAttachment().set(this.$getContent(), {
                            accept: this.accept,
                            multiple: this.multiple,
                            listeners: {
                                start: () => {
                                    this.onUploadstart();
                                },
                                complete: (uploader) => {
                                    this.onUploadComplete(uploader);
                                },
                            },
                        });
                    }
                    return this.uploader;
                }
                /**
                 * 파일목록 DOM 을 가져온다.
                 *
                 * @return {Dom} $files
                 */
                $getFiles() {
                    if (this.$files === undefined) {
                        this.$files = Html.create('ul', { 'data-role': 'files' });
                    }
                    return this.$files;
                }
                /**
                 * 파일을 선택한다.
                 */
                select() {
                    this.getUploader().select();
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    if (value !== null && Array.isArray(value) == true) {
                        this.getUploader().setValue(value);
                    }
                    else {
                        this.getUploader().setValue([]);
                    }
                    super.setValue(this.getUploader().getValue(), is_origin);
                }
                /**
                 * 파일 필드를 랜더링한다.
                 */
                renderContent() {
                    this.$getContent().append(this.getButton().$getComponent());
                    this.getButton().render();
                    this.$getContent().append(this.$getFiles());
                }
                /**
                 * 업로드 시작이벤트를 처리한다.
                 */
                onUploadstart() {
                    this.getForm().setLoading(this, true);
                }
                /**
                 * 업로드 종료이벤트를 처리한다.
                 */
                onUploadComplete(uploader) {
                    this.getForm().setLoading(this, false);
                    this.setValue(uploader.getValue());
                }
            }
            Field.File = File;
            class Image extends Admin.Form.Field.File {
                type = 'form';
                role = 'field';
                field = 'image';
                reset;
                $preview;
                imageWidth;
                imageHeight;
                showSize;
                emptyText;
                $emptyText;
                $display;
                /**
                 * 템플릿필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Image.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.accept = this.properties.accept ?? 'image/*';
                    this.multiple = false;
                    this.properties.buttonText = this.properties.buttonText ?? Admin.printText('buttons.image_select');
                    this.properties.buttonIconClass = this.properties.buttonIconClass ?? 'mi mi-image';
                    this.showSize = this.properties.showSize === true;
                    this.setImageSize(this.properties.imageWidth ?? 54, this.properties.imageHeight ?? 54);
                    this.emptyText = this.properties.emptyText ?? '';
                    this.emptyText = this.emptyText.length == 0 ? null : this.emptyText;
                }
                /**
                 * 초기화 버튼을 가져온다.
                 *
                 * @return {Admin.Button} button
                 */
                getReset() {
                    if (this.reset === undefined) {
                        this.reset = new Admin.Button({
                            iconClass: 'mi mi-trash',
                            buttonClass: 'danger',
                            parent: this,
                            text: Admin.printText('buttons.delete'),
                            handler: () => {
                                this.uploader.setValue([]);
                                //this.select();
                            },
                        });
                    }
                    return this.reset;
                }
                /**
                 * 이미지 미리보기 DOM 을 가져온다.
                 *
                 * @return {Dom} $files
                 */
                $getPreview() {
                    if (this.$preview === undefined) {
                        this.$preview = Html.create('div', { 'data-role': 'image' });
                        const $size = Html.create('label', { 'data-role': 'size' });
                        this.$preview.append($size);
                        const $files = Html.create('ul', { 'data-role': 'files' });
                        this.$preview.append($files);
                    }
                    return this.$preview;
                }
                /**
                 * 파일정보 DOM 객체를 가져온다.
                 *
                 * @return {Dom} $display
                 */
                $getDisplay() {
                    if (this.$display === undefined) {
                        this.$display = Html.create('div', { 'data-role': 'display' });
                        this.$display.hide();
                    }
                    return this.$display;
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
                 * 이미지 미리보기 크기를 조절한다.
                 *
                 * @param {number} imageWidth - 가로크기
                 * @param {number} imageHeight - 세로크기
                 */
                setImageSize(imageWidth, imageHeight) {
                    this.imageWidth = imageWidth ?? null;
                    this.imageHeight = imageHeight ?? null;
                    imageWidth ??= 54;
                    imageHeight ??= 54;
                    const maxWidth = 200;
                    const maxHeight = 54;
                    imageWidth = Math.round((imageWidth * maxHeight) / imageHeight);
                    imageHeight = maxHeight;
                    if (imageWidth > maxWidth) {
                        imageHeight = Math.round((imageHeight * maxWidth) / imageWidth);
                        imageWidth = maxWidth;
                    }
                    this.$getPreview().setStyle('width', imageWidth + 'px');
                    this.$getPreview().setStyle('height', Math.max(maxHeight, imageHeight) + 'px');
                    const $size = Html.get('label[data-role=size]', this.$getPreview());
                    if (this.showSize == true && this.imageWidth !== null && this.imageHeight !== null) {
                        $size.html(this.imageWidth + '&times;' + this.imageHeight);
                    }
                    else {
                        $size.empty();
                    }
                    const $files = Html.get('ul[data-role=files]', this.$getPreview());
                    $files.setStyle('width', imageWidth + 'px');
                    $files.setStyle('height', imageHeight + 'px');
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
                 * 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValue() {
                    if (this.value === null || this.value?.length !== 1) {
                        return null;
                    }
                    return this.value[0];
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    if (Array.isArray(value) === true) {
                        if (value.length !== 1) {
                            value = null;
                        }
                    }
                    else if (typeof value == 'string') {
                        value = [value];
                    }
                    else {
                        value = null;
                    }
                    super.setValue(value, is_origin);
                    if (value == null) {
                        this.$getEmptyText().show();
                        this.$getDisplay().hide();
                    }
                    else {
                        this.$getEmptyText().hide();
                        this.$getDisplay().show();
                    }
                }
                /**
                 * 파일 필드를 랜더링한다.
                 */
                renderContent() {
                    this.$getContent().append(this.$getPreview());
                    const $components = Html.create('div', { 'data-role': 'components' });
                    this.$getContent().append($components);
                    const $buttons = Html.create('div', { 'data-role': 'buttons' });
                    $buttons.append(this.getButton().$getComponent());
                    this.getButton().render();
                    $buttons.append(this.getReset().$getComponent());
                    this.getReset().render();
                    $components.append($buttons);
                    $components.append(this.$getEmptyText());
                    $components.append(this.$getDisplay());
                }
                /**
                 * 필드 레이아웃을 업데이트한다.
                 */
                updateLayout() {
                    super.updateLayout();
                    const $emptyText = this.$getEmptyText();
                    $emptyText.html(this.emptyText);
                }
                /**
                 * 업로드 종료이벤트를 처리한다.
                 */
                onUploadComplete(uploader) {
                    const file = uploader.getFileById(uploader.getValue()[0]);
                    if (file === null) {
                        this.$getDisplay().hide();
                        this.$getEmptyText().show();
                    }
                    else {
                        this.$getDisplay().html('<span><small>(' +
                            Format.size(file.attachment.size) +
                            ')</small><b>' +
                            file.attachment.name +
                            '</b></span>');
                    }
                    super.onUploadComplete(uploader);
                }
            }
            Field.Image = Image;
            class Select extends Admin.Form.Field.Base {
                field = 'select';
                search;
                searchField;
                searchOperator;
                searching = false;
                liveSearch;
                remoteSearch;
                multiple;
                emptyText;
                displayField;
                valueField;
                listField;
                rawValue;
                renderer;
                listRenderer;
                $button;
                $display;
                $emptyText;
                $search;
                absolute;
                list;
                loading;
                /**
                 * 선택항목필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Select.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.search = this.properties.search === true;
                    this.liveSearch = this.properties.liveSearch === true;
                    this.remoteSearch = this.properties.remoteSearch === true;
                    this.multiple = this.properties.multiple === true;
                    this.emptyText = this.properties.emptyText ?? '';
                    this.emptyText = this.emptyText.length == 0 ? null : this.emptyText;
                    this.displayField = this.properties.displayField ?? 'display';
                    this.valueField = this.properties.valueField ?? 'value';
                    this.listField = this.properties.listField ?? this.displayField;
                    this.listRenderer = this.properties.listRenderer ?? null;
                    this.searchField = this.properties.searchField ?? this.displayField;
                    this.searchOperator = this.properties.searchOperator ?? 'likecode';
                    this.rawValue = this.properties.value ?? null;
                    this.value = null;
                    this.renderer =
                        this.properties.renderer ??
                            ((display) => {
                                if (Array.isArray(display) == true) {
                                }
                                else if (typeof display == 'string' && display.length > 0) {
                                    return display;
                                }
                                return '';
                            });
                    this.loading = new Admin.Loading(this, {
                        type: this.properties.loadingType ?? 'column',
                        direction: 'row',
                        message: this.properties.loadingText ?? null,
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
                            direction: 'y',
                            hideOnClick: true,
                            parent: this,
                            listeners: {
                                render: () => {
                                    this.getAbsolute()
                                        .$getContainer()
                                        .setStyle('border-color', 'var(--input-border-color-focus)');
                                },
                                show: () => {
                                    this.getList().setMaxWidth(null);
                                    this.getList().setMaxHeight(null);
                                    this.getAbsolute().updatePosition();
                                    this.getList().setMaxWidth(this.getAbsolute().getPosition().maxWidth - 2);
                                    this.getList().setMaxHeight(this.getAbsolute().getPosition().maxHeight - 2);
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
                 * @return {Admin.Grid.Panel|Admin.Tree.Panel} list
                 */
                getList() {
                    if (this.list === undefined) {
                        const properties = {
                            store: this.properties.store,
                            parent: this,
                            selection: {
                                selectable: true,
                                display: 'row',
                                multiple: false,
                                deselectable: false,
                                keepable: true,
                            },
                            columnHeaders: false,
                            rowLines: false,
                            border: false,
                            columns: [
                                {
                                    text: 'display',
                                    dataIndex: this.listField,
                                    flex: 1,
                                    renderer: (value, record, $dom) => {
                                        if (this.listRenderer !== null) {
                                            return this.listRenderer(value, record, $dom, this);
                                        }
                                        else {
                                            return value;
                                        }
                                    },
                                },
                            ],
                            listeners: {
                                beforeLoad: () => {
                                    this.onBeforeLoad();
                                },
                                load: () => {
                                    this.onLoad();
                                },
                                update: () => {
                                    this.getList().setMaxWidth(null);
                                    this.getList().setMaxHeight(null);
                                    this.getAbsolute().updatePosition();
                                    this.getList().setMaxWidth(this.getAbsolute().getPosition().maxWidth - 2);
                                    this.getList().setMaxHeight(this.getAbsolute().getPosition().maxHeight - 2);
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
                        };
                        if (this.properties.store instanceof Admin.Store) {
                            this.list = new Admin.Grid.Panel(properties);
                        }
                        else {
                            this.list = new Admin.Tree.Panel(properties);
                        }
                    }
                    return this.list;
                }
                /**
                 * 데이터스토어를 가져온다.
                 *
                 * @return {Admin.Store | Admin.TreeStore} store
                 */
                getStore() {
                    return this.getList().getStore();
                }
                /**
                 * 선택항목 버튼 DOM 객체를 가져온다.
                 *
                 * @return {Dom} $button
                 */
                $getButton() {
                    if (this.$button === undefined) {
                        this.$button = Html.create('button', { type: 'button' });
                        if (this.search == true) {
                            this.$button.setAttr('tabindex', '-1');
                        }
                        else {
                            this.$button.setAttr('tabindex', '0');
                        }
                        this.$button.on('mousedown', (e) => {
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
                        this.$button.on('blur', () => {
                            this.collapse();
                        });
                        this.setKeyboardEvent(this.$button);
                        const $display = this.$getDisplay();
                        this.$button.append($display);
                    }
                    return this.$button;
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
                 * 검색폼 DOM 객체를 가져온다.
                 *
                 * @return {Dom} $button
                 */
                $getSearch() {
                    if (this.$search === undefined) {
                        this.$search = Html.create('input', { 'type': 'search', 'tabindex': '0' });
                        this.$search.on('input', () => {
                            this.searching = true;
                            if (this.$search.getData('timeout') !== null) {
                                clearTimeout(this.$search.getData('timeout'));
                                this.$search.setData('timeout', null);
                            }
                            this.match(this.$search.getValue());
                            if (this.$search.getValue()?.length == 0) {
                                this.$getEmptyText().show();
                            }
                            else {
                                this.$getEmptyText().hide();
                            }
                        });
                        this.$search.on('focus', () => {
                            this.searching = true;
                            if (this.$search.getData('timeout') !== null) {
                                clearTimeout(this.$search.getData('timeout'));
                                this.$search.setData('timeout', null);
                            }
                            this.expand();
                            this.$getDisplay().hide();
                            if (this.$search.getValue()?.length == 0) {
                                this.$getEmptyText().show();
                            }
                            else {
                                this.$getEmptyText().hide();
                            }
                        });
                        this.$search.on('mousedown', (e) => {
                            e.stopImmediatePropagation();
                        });
                        this.$search.on('blur', () => {
                            this.searching = false;
                            this.$search.setValue('');
                            this.match('');
                            this.$search.setData('timeout', setTimeout(() => {
                                this.collapse();
                                this.$getDisplay().show();
                                if (this.value === null) {
                                    this.$getEmptyText().show();
                                }
                                else {
                                    this.$getEmptyText().hide();
                                }
                                this.$search.setData('timeout', null);
                            }, 200));
                        });
                        this.setKeyboardEvent(this.$search);
                    }
                    return this.$search;
                }
                /**
                 * placeHolder 문자열을 설정한다.
                 *
                 * @param {string} emptyText - placeHolder (NULL 인 경우 표시하지 않음)
                 */
                setEmptyText(emptyText = null) {
                    this.emptyText = emptyText === null || emptyText.length == 0 ? null : emptyText;
                    if (this.isRendered() == true) {
                        this.$getEmptyText().html(this.emptyText ?? '');
                    }
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    this.rawValue = value;
                    if (value === null) {
                        this.$getEmptyText().show();
                        this.$getDisplay().html(this.renderer('', null, this.$getDisplay(), this));
                    }
                    else {
                        if (this.getStore().isLoaded() == false) {
                            this.getStore().load();
                            return;
                        }
                        if (Array.isArray(value) == true) {
                        }
                        else {
                            const target = {};
                            target[this.valueField] = value;
                            const record = this.getStore().find(target);
                            if (record == null) {
                                value = null;
                                this.$getEmptyText().show();
                            }
                            else {
                                value = record.get(this.valueField);
                                this.$getEmptyText().hide();
                            }
                            this.$getDisplay().html(this.renderer(record?.get(this.displayField) ?? '', record, this.$getDisplay(), this));
                        }
                    }
                    this.$getDisplay().show();
                    super.setValue(value, is_origin);
                    if (this.rawValue !== null && value === null) {
                        if (this.getStore() instanceof Admin.TreeStore) {
                            const store = this.getStore();
                            const target = {};
                            target[this.valueField] = this.rawValue;
                            store.getParents(target).then((parents) => {
                                if (parents !== null) {
                                    this.setValue(this.rawValue, is_origin);
                                }
                            });
                        }
                    }
                }
                /**
                 * 항목 인덱스로 항목을 선택한다.
                 *
                 * @param {(number|number[])} index - 항목인덱스
                 */
                select(index) {
                    const list = this.getList();
                    if (list instanceof Admin.Grid.Panel) {
                        list.selectRow(index);
                    }
                    else {
                        list.selectRow(index);
                    }
                }
                /**
                 * 필드의 DOM 객체의 일부 키보드 이벤트를 목록 컴포넌트로 전달한다.
                 *
                 * @param {Dom} $target - DOM 객체
                 */
                setKeyboardEvent($target) {
                    $target.on('keydown', (e) => {
                        if (e.key == 'ArrowDown' || e.key == 'ArrowUp' || e.key == 'Enter' || e.key == ' ') {
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
                            this.$getButton().focus();
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
                    this.loading.hide();
                    if (this.value !== null) {
                        const target = {};
                        target[this.valueField] = this.value;
                        // @todo 다중선택 처리
                        const index = this.getStore().findIndex(target);
                        this.select(index);
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
                        this.$getSearch().focus();
                    }
                    else {
                        this.$getButton().focus();
                    }
                }
                /**
                 * 선택항목을 검색한다.
                 *
                 * @param {string} keyword - 검색어
                 */
                match(keyword) {
                    if (keyword.length > 0) {
                        if (this.value === null) {
                            this.$getEmptyText().hide();
                        }
                    }
                    else {
                        if (this.value === null) {
                            this.$getEmptyText().show();
                        }
                    }
                    this.getStore().setFilter(this.searchField, keyword, this.searchOperator);
                }
                /**
                 * 필드 비활성화여부를 설정한다.
                 *
                 * @param {boolean} disabled - 비활성화여부
                 * @return {this} this
                 */
                setDisabled(disabled) {
                    if (disabled == true) {
                        this.collapse();
                        this.$getButton().setAttr('disabled', 'disabled');
                        if (this.search === true) {
                            this.$getSearch().setAttr('disabled', 'disabled');
                        }
                    }
                    else if (this.readonly === false) {
                        this.$getButton().removeAttr('disabled');
                        if (this.search === true) {
                            this.$getSearch().removeAttr('disabled');
                        }
                    }
                    super.setDisabled(disabled);
                    return this;
                }
                /**
                 * 필드를 랜더링한다.
                 */
                renderContent() {
                    if (this.search === true) {
                        const $search = this.$getSearch();
                        this.$getContent().append($search);
                    }
                    const $button = this.$getButton();
                    this.$getContent().append($button);
                    const $emptyText = this.$getEmptyText();
                    $emptyText.html(this.emptyText ?? '');
                    this.$getContent().append($emptyText);
                }
                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender() {
                    if (this.rawValue !== null) {
                        if (this.getStore().isLoaded() === true) {
                            this.setValue(this.rawValue, true);
                        }
                        else {
                            this.getStore().load();
                        }
                    }
                }
                /**
                 * 셀렉트폼의 목록 데이터를 로딩하기전 이벤트를 처리한다.
                 */
                onBeforeLoad() {
                    if (this.isExpand() == false) {
                        this.loading.show();
                    }
                    this.getForm()?.setLoading(this, true, false);
                    this.fireEvent('beforeLoad', [this.getStore(), this]);
                }
                /**
                 * 셀렉트폼의 목록 데이터가 로딩되었을 때 이벤트를 처리한다.
                 */
                onLoad() {
                    if (this.rawValue !== null && this.value === undefined) {
                        this.setValue(this.rawValue, true);
                    }
                    this.loading.hide();
                    this.getForm()?.setLoading(this, false);
                    this.fireEvent('load', [this.getStore(), this]);
                }
                /**
                 * 셀렉트폼의 목록 데이터가 변경되었을 때 이벤트를 처리한다.
                 */
                onUpdate() {
                    if (this.rawValue !== null) {
                        if (this.search === false || this.searching === false) {
                            this.setValue(this.rawValue);
                        }
                    }
                    this.fireEvent('update', [this.getStore(), this]);
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
                 * 필드 비활성화여부를 설정한다.
                 *
                 * @param {boolean} disabled - 비활성여부
                 * @return {Admin.Form.Field.TextArea} this
                 */
                setDisabled(disabled) {
                    if (disabled == true) {
                        this.$getInput().setAttr('disabled', 'disabled');
                    }
                    else {
                        this.$getInput().removeAttr('disabled');
                    }
                    super.setDisabled(disabled);
                    return this;
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    value = value?.toString() ?? '';
                    if (this.$getInput().getValue() != value) {
                        this.$getInput().setValue(value);
                    }
                    if (value.length > 0) {
                        this.$getEmptyText().hide();
                    }
                    else {
                        this.$getEmptyText().show();
                    }
                    super.setValue(value, is_origin);
                }
                /**
                 * 필드태그를 랜더링한다.
                 */
                renderContent() {
                    const $input = this.$getInput();
                    this.$getContent().append($input);
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
            class Icon extends Admin.Form.Field.Base {
                field = 'icon';
                segmentedButton;
                textField;
                fileField;
                /**
                 * 텍스트필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Text.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                }
                /**
                 * 아이콘종류 선택 버튼을 가져온다.
                 *
                 * @return {Admin.SegmentedButton} segmentedButton
                 */
                getSegmentedButton() {
                    if (this.segmentedButton === undefined) {
                        this.segmentedButton = new Admin.SegmentedButton({
                            items: [
                                {
                                    iconClass: 'xi xi-marquee-remove',
                                    text: Admin.printText('components.form.icons.NONE'),
                                    value: 'NONE',
                                },
                                {
                                    iconClass: 'xi xi-contents-grid',
                                    text: Admin.printText('components.form.icons.ICON'),
                                    value: 'ICON',
                                },
                                {
                                    iconClass: 'xi xi-code',
                                    text: Admin.printText('components.form.icons.CLASS'),
                                    value: 'CLASS',
                                },
                                {
                                    iconClass: 'xi xi-image',
                                    text: Admin.printText('components.form.icons.URL'),
                                    value: 'URL',
                                },
                                {
                                    iconClass: 'xi xi-upload-square',
                                    text: Admin.printText('components.form.icons.FILE'),
                                    value: 'FILE',
                                },
                            ],
                            listeners: {
                                change: (_button, value) => {
                                    this.setIconType(value);
                                },
                            },
                        });
                    }
                    return this.segmentedButton;
                }
                getIcons() {
                    return null;
                }
                getTextField() {
                    if (this.textField === undefined) {
                        this.textField = new Admin.Form.Field.Text({
                            emptyText: '',
                            hidden: true,
                        });
                    }
                    return this.textField;
                }
                getFileField() {
                    if (this.fileField === undefined) {
                        this.fileField = new Admin.Form.Field.Image({
                            emptyText: '',
                            imageWidth: 32,
                            imageHeight: 32,
                            hidden: true,
                        });
                    }
                    return this.fileField;
                }
                /**
                 * 아이콘 타입에 따른 필드구성을 수정한다.
                 *
                 * @param {string} type - 아이콘타입
                 */
                setIconType(type) {
                    this.getTextField().hide();
                    this.getFileField().hide();
                    switch (type) {
                        case 'ICON':
                            break;
                        case 'CLASS':
                            this.getTextField().show();
                            this.getTextField().setHelpText(Admin.printText('components.form.icons_help.CLASS'));
                            break;
                        case 'URL':
                            this.getTextField().show();
                            this.getTextField().setHelpText(Admin.printText('components.form.icons_help.URL'));
                            break;
                        case 'FILE':
                            this.getFileField().show();
                            this.getFileField().setHelpText(Admin.printText('components.form.icons_help.FILE'));
                            break;
                    }
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    if (value === null || typeof value !== 'object' || value?.type == 'NONE') {
                        this.getSegmentedButton().setValue('NONE');
                        value = null;
                    }
                    else {
                        const type = value?.type ?? 'NONE';
                        const icon = value?.icon ?? null;
                        this.getSegmentedButton().setValue(type);
                        if (type !== 'NONE') {
                            if (type == 'CLASS' || type == 'URL') {
                                this.getTextField().setValue(icon);
                            }
                            else if (type == 'FILE') {
                                this.getFileField().setValue(icon);
                            }
                        }
                        value = { type: type, icon: icon };
                    }
                    super.setValue(value, is_origin);
                }
                /**
                 * 필드값을 가져온다..
                 *
                 * @return {any} value - 값
                 */
                getValue() {
                    const type = this.getSegmentedButton().getValue();
                    if (type == null || type == 'NONE') {
                        return null;
                    }
                    if (type == 'CLASS' || type == 'URL') {
                        return { type: type, icon: this.getTextField().getValue() };
                    }
                    else if (type == 'FILE') {
                        return { type: type, icon: this.getFileField().getValue() };
                    }
                    return null;
                }
                /**
                 * 필드태그를 랜더링한다.
                 */
                renderContent() {
                    const segmentedButton = this.getSegmentedButton();
                    this.$getContent().append(segmentedButton.$getComponent());
                    segmentedButton.render();
                    const textField = this.getTextField();
                    this.$getContent().append(textField.$getComponent());
                    textField.render();
                    const fileField = this.getFileField();
                    this.$getContent().append(fileField.$getComponent());
                    fileField.render();
                }
            }
            Field.Icon = Icon;
            class Page extends Admin.Form.Field.Base {
                field = 'page';
                host;
                language;
                $pages;
                store;
                rawValue;
                loading;
                /**
                 * 페이지필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Page.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.host = this.properties.host;
                    this.language = this.properties.language;
                    this.rawValue = this.properties.value ?? null;
                    this.loading = new Admin.Loading(this, {
                        type: 'column',
                        direction: 'row',
                    });
                }
                /**
                 * 페이지목록이 보일 DOM 을 가져온다.
                 *
                 * @return {Dom} $pages
                 */
                $getPages() {
                    if (this.$pages === undefined) {
                        this.$pages = Html.create('ul', { 'data-role': 'pages' });
                    }
                    return this.$pages;
                }
                /**
                 * 데이터스토어를 가져온다.
                 *
                 * @return {Admin.Store} store
                 */
                getStore() {
                    if (this.store === undefined) {
                        this.store = new Admin.Store.Ajax({
                            url: Admin.getProcessUrl('module', 'admin', 'pages'),
                            params: { host: this.host, language: this.language },
                            listeners: {
                                beforeLoad: () => {
                                    this.onBeforeLoad();
                                },
                                update: () => {
                                    this.onUpdate();
                                },
                            },
                        });
                    }
                    return this.store;
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    this.rawValue = value;
                    if (this.getStore().isLoaded() == false) {
                        this.getStore().load();
                        return;
                    }
                    if (Array.isArray(value) == true) {
                    }
                    else {
                        const record = this.getStore().find({ name: value });
                        if (record == null) {
                            value = null;
                        }
                        else {
                            value = record.get('name');
                            const $pages = this.$getPages();
                            Html.all('li', $pages).forEach(($item) => {
                                if ($item.getData('name') == value) {
                                    $item.addClass('selected');
                                }
                                else {
                                    $item.removeClass('selected');
                                }
                            });
                        }
                    }
                    super.setValue(value, is_origin);
                }
                /**
                 * 필드를 랜더링한다.
                 */
                renderContent() {
                    const $pages = this.$getPages();
                    this.$getContent().append($pages);
                }
                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender() {
                    if (this.getStore().isLoaded() == false) {
                        this.getStore().load();
                    }
                    if (this.rawValue !== null) {
                        if (this.getStore().isLoaded() === true) {
                            this.setValue(this.rawValue, true);
                        }
                    }
                }
                /**
                 * 셀렉트폼의 목록 데이터를 로딩하기전 이벤트를 처리한다.
                 */
                onBeforeLoad() {
                    this.getForm()?.setLoading(this, true, false);
                    this.$getPages().empty();
                    this.loading.show();
                }
                /**
                 * 셀렉트폼의 목록 데이터가 변경되었을 때 이벤트를 처리한다.
                 */
                onUpdate() {
                    const $pages = this.$getPages();
                    for (const record of this.getStore().getRecords()) {
                        const $page = Html.create('li', { 'data-name': record.get('name') });
                        const $iframe = Html.create('iframe', { 'src': record.get('preview'), 'tabindex': '-1' });
                        $page.append($iframe);
                        const $name = Html.create('b', null, record.get('name'));
                        $page.append($name);
                        const $button = Html.create('button', { type: 'button' });
                        $button.setData('name', record.get('name'));
                        $button.on('click', () => {
                            this.setValue($button.getData('name'));
                        });
                        $page.append($button);
                        $pages.append($page);
                    }
                    this.loading.hide();
                    if (this.rawValue !== null) {
                        this.setValue(this.rawValue);
                    }
                    this.getForm()?.setLoading(this, false);
                }
            }
            Field.Page = Page;
            class Context extends Admin.Form.Field.Base {
                type = 'form';
                role = 'field';
                field = 'context';
                modules;
                contexts;
                fieldset;
                rawValue;
                /**
                 * 템플릿필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Context.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    const module = this.properties.value?.module ?? null;
                    const context = this.properties.value?.context ?? null;
                    const configs = this.properties.value?.configs ?? {};
                    this.rawValue = { module: module, context: context, configs: configs };
                    this.value = null;
                }
                /**
                 * 폼 패널의 하위 컴포넌트를 정의한다.
                 */
                initItems() {
                    if (this.items === null) {
                        this.items = [];
                        this.items.push(this.getModules());
                        this.items.push(this.getContexts());
                        this.items.push(this.getFieldSet());
                    }
                    super.initItems();
                }
                /**
                 * 테마설정을 위한 셀렉트필드를 가져온다.
                 *
                 * @return {Admin.Form.Field.Select} select
                 */
                getModules() {
                    if (this.modules === undefined) {
                        this.modules = new Admin.Form.Field.Select({
                            id: 'abc',
                            store: new Admin.Store.Ajax({
                                url: Admin.getProcessUrl('module', 'admin', 'modules'),
                                filters: {
                                    properties: {
                                        value: 'CONTEXT',
                                        operator: 'inset',
                                    },
                                },
                                sorters: { title: 'ASC' },
                            }),
                            valueField: 'name',
                            displayField: 'title',
                            emptyText: Admin.printText('components.form.context.module_help'),
                            search: true,
                            listRenderer: (display, record) => {
                                const $icon = Html.html(record.get('icon'));
                                $icon.setStyle('width', '22px');
                                $icon.setStyle('height', '22px');
                                $icon.setStyle('background-size', '16px 16px');
                                $icon.setStyle('margin-right', '4px');
                                $icon.setStyle('vertical-align', 'middle');
                                $icon.setStyle('line-height', '22px');
                                $icon.setStyle('border-radius', '3px');
                                const $text = Html.create('span', null, display);
                                $text.setStyle('display', 'inline-block');
                                $text.setStyle('vertical-align', 'middle');
                                $icon.setStyle('height', '22px');
                                $text.setStyle('line-height', '22px');
                                return $icon.toHtml() + $text.toHtml();
                            },
                            renderer: (display, record) => {
                                if (record === null) {
                                    return display;
                                }
                                const $icon = Html.html(record.get('icon'));
                                $icon.setStyle('width', '22px');
                                $icon.setStyle('height', '22px');
                                $icon.setStyle('background-size', '16px 16px');
                                $icon.setStyle('margin-right', '4px');
                                $icon.setStyle('vertical-align', 'middle');
                                $icon.setStyle('line-height', '22px');
                                $icon.setStyle('border-radius', '3px');
                                const $text = Html.create('span', null, display);
                                $text.setStyle('display', 'inline-block');
                                $text.setStyle('vertical-align', 'middle');
                                $icon.setStyle('height', '22px');
                                $text.setStyle('line-height', '22px');
                                return $icon.toHtml() + $text.toHtml();
                            },
                            listeners: {
                                change: (_field, value) => {
                                    const store = this.getContexts().getStore();
                                    store.setParam('module', value);
                                    store.reload();
                                },
                            },
                        });
                    }
                    return this.modules;
                }
                /**
                 * 모듈 컨텍스트 셀렉트필드를 가져온다.
                 *
                 * @return {Admin.Form.Field.Select} contexts
                 */
                getContexts() {
                    if (this.contexts === undefined) {
                        this.contexts = new Admin.Form.Field.Select({
                            store: new Admin.Store.Ajax({
                                url: Admin.getProcessUrl('module', 'admin', 'module.contexts'),
                            }),
                            valueField: 'name',
                            displayField: 'title',
                            emptyText: Admin.printText('components.form.context.context_help'),
                            search: true,
                            disabled: true,
                            listeners: {
                                update: (store, field) => {
                                    field.setDisabled(store.getCount() == 0);
                                    if (this.rawValue.module == this.getModules().getValue()) {
                                        field.setValue(this.rawValue.context);
                                    }
                                },
                                change: async (field, value) => {
                                    if (value === null) {
                                        this.updateValue();
                                        this.getFieldSet().empty();
                                        this.getFieldSet().hide();
                                        return;
                                    }
                                    this.getForm()?.setLoading(this, true);
                                    field.disable();
                                    const configs = await Admin.Ajax.get(Admin.getProcessUrl('module', 'admin', 'module.context'), {
                                        module: this.getModules().getValue(),
                                        context: value,
                                    });
                                    this.getFieldSet().empty();
                                    if ((configs?.fields?.length ?? 0) == 0) {
                                        this.getFieldSet().hide();
                                    }
                                    else {
                                        for (const field of configs.fields) {
                                            field.allowBlank = false;
                                            const item = Admin.Form.Field.Create(field);
                                            item.addEvent('change', () => {
                                                this.updateValue();
                                            });
                                            this.getFieldSet().append(item);
                                        }
                                        if ((this.rawValue?.configs ?? null) !== null) {
                                            for (const name in this.rawValue.configs) {
                                                this.getFieldSet()
                                                    .getField(name)
                                                    ?.setValue(this.rawValue.configs[name]);
                                            }
                                        }
                                        this.getFieldSet().show();
                                    }
                                    field.enable();
                                    this.fireEvent('configs', [this, configs]);
                                    this.getForm()?.setLoading(this, false);
                                },
                            },
                        });
                    }
                    return this.contexts;
                }
                /**
                 * 컨텍스트설정을 위한 필드셋을 가져온다.
                 *
                 * @return {Admin.Form.FieldSet} fieldset
                 */
                getFieldSet() {
                    if (this.fieldset === undefined) {
                        this.fieldset = new Admin.Form.FieldSet({
                            title: Admin.printText('components.form.context_configs'),
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
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    if (typeof value != 'object') {
                        value = null;
                    }
                    else {
                        value = {
                            module: value?.module ?? null,
                            context: value?.context ?? null,
                            configs: value?.configs ?? {},
                        };
                    }
                    this.rawValue = value;
                    if (this.getModules().getValue() != value?.module) {
                        this.getModules().setValue(value?.module ?? null);
                    }
                    super.setValue(value, is_origin);
                }
                /**
                 * 필드값을 가져온다.
                 *
                 * @return {Object} value
                 */
                getValue() {
                    const module = this.getModules().getValue();
                    const context = this.getContexts().getValue();
                    const configs = {};
                    for (const item of this.getFieldSet().getFields()) {
                        configs[item.name] = item.getValue();
                    }
                    if (module === null || context == null) {
                        return null;
                    }
                    return { module: module, context: context, configs: configs };
                }
                /**
                 * 현재 입력된 값으로 값을 업데이트한다.
                 */
                updateValue() {
                    super.setValue(this.getValue());
                }
                /**
                 * 필드값이 유효한지 확인한다.
                 *
                 * @return {boolean|string} validation
                 */
                async validate() {
                    if (this.allowBlank == false && this.isBlank() == true) {
                        return await Admin.getErrorText('REQUIRED');
                    }
                    let valid = true;
                    for (const item of this.getFieldSet().getFields()) {
                        valid = (await item.isValid()) && valid;
                    }
                    if (valid == false) {
                        return null;
                    }
                    return true;
                }
                /**
                 * 에러메시지를 변경한다.
                 *
                 * @param {boolean} is_error - 에러여부
                 * @param {string} message - 에러메시지 (NULL 인 경우 에러메시지를 출력하지 않는다.)
                 */
                setError(is_error, message = null) {
                    this.getModules().setError(is_error, null);
                    if (this.getModules().getValue() !== null) {
                        this.getContexts().setError(is_error, null);
                    }
                    super.setError(is_error, message);
                }
                /**
                 * 필드 비활성화여부를 설정한다.
                 *
                 * @param {boolean} disabled - 비활성화여부
                 * @return {this} this
                 */
                setDisabled(disabled) {
                    if (disabled == true) {
                        //
                    }
                    else if (this.readonly === false) {
                        //
                    }
                    super.setDisabled(disabled);
                    return this;
                }
                /**
                 * 필드 컨테이너에 속한 필드를 랜더링한다.
                 */
                renderContent() {
                    const $fields = Html.create('div', { 'data-role': 'fields' });
                    this.$getContent().append($fields);
                    $fields.setStyle('row-gap', '5px');
                    for (let item of this.getItems()) {
                        $fields.append(item.$getComponent());
                        if (item.isRenderable() == true) {
                            item.render();
                        }
                    }
                }
            }
            Field.Context = Context;
            class Include extends Admin.Form.Field.Base {
                field = 'include';
                /**
                 * 텍스트필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Include.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    value = null;
                    super.setValue(value, is_origin);
                }
                /**
                 * 필드값을 가져온다..
                 *
                 * @return {any} value - 값
                 */
                getValue() {
                    return null;
                }
            }
            Field.Include = Include;
            class Permission extends Admin.Form.Field.Base {
                field = 'permission';
                /**
                 * 텍스트필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Permission.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    value = null;
                    super.setValue(value, is_origin);
                }
                /**
                 * 필드값을 가져온다..
                 *
                 * @return {any} value - 값
                 */
                getValue() {
                    return 'true';
                }
            }
            Field.Permission = Permission;
            class Explorer extends Admin.Form.Field.Base {
                field = 'explorer';
                explorer;
                explorerHeight;
                /**
                 * 텍스트필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Explorer.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.explorerHeight = this.height ?? 299;
                    this.height = null;
                }
                getExplorer() {
                    if (this.explorer === undefined) {
                        this.explorer = new Admin.Explorer({
                            border: true,
                            height: this.explorerHeight,
                        });
                    }
                    return this.explorer;
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    value = null;
                    super.setValue(value, is_origin);
                }
                /**
                 * 필드값을 가져온다..
                 *
                 * @return {any} value - 값
                 */
                getValue() {
                    return null;
                }
                /**
                 * 필드를 랜더링한다.
                 */
                renderContent() {
                    this.$getContent().append(this.getExplorer().$getComponent());
                    this.getExplorer().render();
                }
            }
            Field.Explorer = Explorer;
            class Check extends Admin.Form.Field.Base {
                field = 'check';
                boxLabel;
                onValue;
                offValue;
                checked;
                displayType;
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
                    this.displayType = this.properties.displayType ?? 'input';
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
                        this.$label = Html.create('label', { class: this.displayType });
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
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    this.$getInput().setValue(value);
                    this.checked = this.getValue();
                    super.setValue(this.checked, is_origin);
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
                    if (this.inputName === null || this.isDisabled() == true) {
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
                    if (this.checked === true) {
                        this.setValue(this.checked);
                    }
                    super.onRender();
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
                                checked: this.value?.includes(value),
                                readonly: this.readonly,
                                boxLabel: this.options[value],
                                displayType: this.properties.displayType ?? 'input',
                                style: this.properties.inputStyle ?? null,
                                class: this.properties.inputClass ?? null,
                                listeners: {
                                    change: () => {
                                        this.setValue(this.getValue());
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
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    if (typeof value == 'string') {
                        value = [value];
                    }
                    if (value !== null) {
                        this.items.forEach((item) => {
                            if (value.includes(item.onValue) == true && item.getValue() == false) {
                                item.setValue(true);
                            }
                            if (value.includes(item.onValue) == false && item.getValue() == true) {
                                item.setValue(false);
                            }
                        });
                    }
                    super.setValue(this.getValue(), is_origin);
                }
                /**
                 * 필드값을 가져온다.
                 *
                 * @return {string[]} value - 값
                 */
                getValue() {
                    const value = [];
                    this.items.forEach((item) => {
                        if (item.isDisabled() == false && item.getRawValue() !== null) {
                            value.push(item.getRawValue());
                        }
                    });
                    return value.length == 0 ? null : value;
                }
                /**
                 * 필드 비활성화여부를 설정한다.
                 *
                 * @param {boolean} disabled - 비활성화여부
                 * @return {this} this
                 */
                setDisabled(disabled) {
                    this.items.forEach((item) => {
                        item.setDisabled(disabled);
                    });
                    super.setDisabled(disabled);
                    return this;
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
            }
            Field.CheckGroup = CheckGroup;
            class Radio extends Admin.Form.Field.Base {
                field = 'radio';
                boxLabel;
                onValue;
                checked;
                displayType;
                $input;
                $label;
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
                    this.displayType = this.properties.displayType ?? 'input';
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
                 * LABEL DOM 을 가져온다.
                 *
                 * @return {Dom} $label
                 */
                $getLabel() {
                    if (this.$label === undefined) {
                        this.$label = Html.create('label', { class: this.displayType });
                    }
                    return this.$label;
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
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    this.$getInput().setValue(value);
                    this.updateChecked();
                    this.checked = this.getValue();
                    super.setValue(this.checked, is_origin);
                }
                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 */
                updateValue(value) {
                    this.checked = value;
                    super.setValue(this.checked);
                }
                /**
                 * 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValue() {
                    return this.$getInput().isChecked();
                }
                /**
                 * 모든 필드값을 가져온다.
                 *
                 * @return {any} value - 값
                 */
                getValues() {
                    const values = {};
                    if (this.inputName === null && this.isDisabled() == true) {
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
                                if (input.checked != $input.isChecked()) {
                                    input.updateValue($input.isChecked());
                                }
                            }
                        }
                    });
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
                    this.scrollable = 'x';
                    this.$scrollable = this.$getContent();
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
                                displayType: this.properties.displayType ?? 'input',
                                style: this.properties.inputStyle ?? null,
                                class: this.properties.inputClass ?? null,
                                listeners: {
                                    change: (field, value) => {
                                        if (value === true) {
                                            this.setValue(field.getRawValue());
                                        }
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
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    for (const item of this.items) {
                        if (item.onValue == value && item.getValue() !== true) {
                            item.setValue(true);
                        }
                    }
                    super.setValue(this.getValue(), is_origin);
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
                    if (this.inputName === null && this.isDisabled() == true) {
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
            }
            Field.RadioGroup = RadioGroup;
            class Theme extends Admin.Form.Field.Base {
                type = 'form';
                role = 'field';
                field = 'theme';
                listUrl;
                listParams;
                configsUrl;
                configsParams;
                select;
                fieldset;
                fieldsetTitle;
                rawValue;
                /**
                 * 템플릿필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Theme.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    if (typeof this.properties.value == 'string') {
                        this.rawValue = { name: this.properties.value, configs: {} };
                    }
                    else {
                        const name = this.properties.value?.name ?? null;
                        const configs = this.properties.value?.configs ?? null;
                        this.rawValue = { name: name, configs: configs };
                    }
                    this.listUrl = Admin.getProcessUrl('module', 'admin', 'themes');
                    this.listParams = null;
                    this.configsUrl = Admin.getProcessUrl('module', 'admin', 'theme');
                    this.configsParams = this.properties.configsParams ?? {};
                    this.fieldsetTitle = Admin.printText('components.form.theme_configs');
                }
                /**
                 * 폼 패널의 하위 컴포넌트를 정의한다.
                 */
                initItems() {
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
                getConfigsParams(name) {
                    const params = this.configsParams;
                    params.name = name;
                    return params;
                }
                /**
                 * 테마설정을 위한 셀렉트필드를 가져온다.
                 *
                 * @return {Admin.Form.Field.Select} select
                 */
                getSelect() {
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
                                    if (value === null || value === '#') {
                                        this.updateValue();
                                        this.getFieldSet().empty();
                                        this.getFieldSet().hide();
                                        return;
                                    }
                                    this.getForm()?.setLoading(this, true);
                                    field.disable();
                                    const configs = await Admin.Ajax.get(this.configsUrl, this.getConfigsParams(value));
                                    this.getFieldSet().empty();
                                    if ((configs?.fields?.length ?? 0) == 0) {
                                        this.getFieldSet().hide();
                                    }
                                    else {
                                        for (const field of configs.fields) {
                                            field.allowBlank = false;
                                            const item = Admin.Form.Field.Create(field);
                                            item.addEvent('change', () => {
                                                this.updateValue();
                                            });
                                            this.getFieldSet().append(item);
                                        }
                                        if ((this.rawValue?.configs ?? null) !== null) {
                                            for (const name in this.rawValue.configs) {
                                                this.getFieldSet()
                                                    .getField(name)
                                                    ?.setValue(this.rawValue.configs[name]);
                                            }
                                        }
                                        this.getFieldSet().show();
                                    }
                                    field.enable();
                                    this.fireEvent('configs', [this, configs]);
                                    this.getForm()?.setLoading(this, false);
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
                getFieldSet() {
                    if (this.fieldset === undefined) {
                        this.fieldset = new Admin.Form.FieldSet({
                            title: this.fieldsetTitle,
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
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value, is_origin = false) {
                    if (typeof value == 'string') {
                        value = { name: value, configs: this.value?.configs ?? {} };
                    }
                    else {
                        value = { name: value?.name ?? null, configs: value?.configs ?? {} };
                    }
                    this.rawValue = value;
                    this.getSelect().setValue(value.name);
                    super.setValue(value, is_origin);
                }
                /**
                 * 필드값을 가져온다.
                 *
                 * @return {Object} value
                 */
                getValue() {
                    const name = this.getSelect().getValue();
                    const configs = {};
                    for (const item of this.getFieldSet().getFields()) {
                        configs[item.name] = item.getValue();
                    }
                    if (name === null) {
                        return null;
                    }
                    return { name: name, configs: configs };
                }
                /**
                 * 현재 입력된 값으로 값을 업데이트한다.
                 */
                updateValue() {
                    super.setValue(this.getValue());
                }
                /**
                 * 필드값이 유효한지 확인한다.
                 *
                 * @return {boolean|string} validation
                 */
                async validate() {
                    if (this.allowBlank == false && this.isBlank() == true) {
                        return await Admin.getErrorText('REQUIRED');
                    }
                    let valid = true;
                    for (const item of this.getFieldSet().getFields()) {
                        valid = (await item.isValid()) && valid;
                    }
                    if (valid == false) {
                        return null;
                    }
                    return true;
                }
                /**
                 * 에러메시지를 변경한다.
                 *
                 * @param {boolean} is_error - 에러여부
                 * @param {string} message - 에러메시지 (NULL 인 경우 에러메시지를 출력하지 않는다.)
                 */
                setError(is_error, message = null) {
                    this.getSelect().setError(is_error, null);
                    super.setError(is_error, message);
                }
                /**
                 * 필드 컨테이너에 속한 필드를 랜더링한다.
                 */
                renderContent() {
                    const $fields = Html.create('div', { 'data-role': 'fields' });
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
                type = 'form';
                role = 'field';
                field = 'template';
                componentType;
                componentName;
                use_default;
                context = null;
                /**
                 * 템플릿필드 클래스 생성한다.
                 *
                 * @param {Admin.Form.Field.Template.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.componentType = this.properties.componentType;
                    this.componentName = this.properties.componentName;
                    this.use_default = this.properties.use_default ?? false;
                    this.listUrl = Admin.getProcessUrl('module', 'admin', 'templates');
                    this.listParams = {
                        componentType: this.componentType,
                        componentName: this.componentName,
                        use_default: this.use_default == true ? 'true' : 'false',
                    };
                    this.configsUrl = Admin.getProcessUrl('module', 'admin', 'template');
                    this.configsParams.componentType = this.componentType;
                    this.configsParams.componentName = this.componentName;
                    this.fieldsetTitle = Admin.printText('components.form.template_configs');
                }
                /**
                 * 컨텍스트 템플릿설정을 불러오기 위해 context 정보를 설정한다.
                 *
                 * @param {string} host - 호스트명
                 * @param {string} language - 언어코드
                 * @param {string} path - 컨텍스트경로
                 */
                setContext(host, language, path) {
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
                getConfigsParams(name) {
                    const params = this.configsParams;
                    params.name = name;
                    params.componentType = this.componentType;
                    params.componentName = this.componentName;
                    if (this.context !== null) {
                        params.host = this.context.host;
                        params.language = this.context.language;
                        params.path = this.context.path;
                    }
                    return params;
                }
            }
            Field.Template = Template;
        })(Field = Form.Field || (Form.Field = {}));
    })(Form = Admin.Form || (Admin.Form = {}));
})(Admin || (Admin = {}));
