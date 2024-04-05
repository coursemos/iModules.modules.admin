/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 페이지를 위한 Aui Form 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/ui/AdminUi.Form.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 2. 24.
 */
var AdminUi;
(function (AdminUi) {
    let Form;
    (function (Form) {
        let Field;
        (function (Field) {
            function Create(field) {
                switch (field.type) {
                    case 'select':
                        return new Aui.Form.Field.Select({
                            name: field.name ?? null,
                            label: field.label ?? null,
                            value: field.value ?? null,
                            allowBlank: field.allowBlank ?? true,
                            store: new Aui.Store.Local({
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
                        return new Aui.Form.FieldSet({
                            title: field.label ?? null,
                            items: ((fields) => {
                                const items = [];
                                for (const field of fields) {
                                    items.push(AdminUi.Form.Field.Create(field));
                                }
                                return items;
                            })(field.items ?? []),
                        });
                    case 'number':
                        return new Aui.Form.Field.Number({
                            name: field.name ?? null,
                            label: field.label ?? null,
                            value: field.value ?? null,
                            allowBlank: field.allowBlank ?? true,
                            width: 200,
                        });
                    case 'theme':
                        return new AdminUi.Form.Field.Theme({
                            name: field.name ?? null,
                            label: field.label ?? null,
                            value: field.value?.name ?? null,
                            category: field.category ?? 'website',
                            allowBlank: field.allowBlank ?? true,
                        });
                    case 'template':
                        return new AdminUi.Form.Field.Template({
                            name: field.name ?? null,
                            label: field.label ?? null,
                            value: field.value?.name ?? null,
                            componentType: field.component.type,
                            componentName: field.component.name,
                            use_default: field.component.use_default ?? false,
                            allowBlank: field.allowBlank ?? true,
                        });
                    case 'color':
                        return new Aui.Form.Field.Color({
                            name: field.name ?? null,
                            label: field.label ?? null,
                            value: field.value ?? null,
                            allowBlank: field.allowBlank ?? true,
                        });
                    case 'textarea':
                        return new Aui.Form.Field.TextArea({
                            name: field.name ?? null,
                            label: field.label ?? null,
                            value: field.value ?? null,
                            allowBlank: field.allowBlank ?? true,
                        });
                    default:
                        return new Aui.Form.Field.Text({
                            name: field.name ?? null,
                            label: field.label ?? null,
                            value: field.value ?? null,
                            allowBlank: field.allowBlank ?? true,
                        });
                }
            }
            Field.Create = Create;
            class Icon extends Aui.Form.Field.Base {
                field = 'icon';
                segmentedButton;
                textField;
                fileField;
                /**
                 * 텍스트필드 클래스 생성한다.
                 *
                 * @param {AdminUi.Form.Field.Text.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                }
                /**
                 * 아이콘종류 선택 버튼을 가져온다.
                 *
                 * @return {Aui.SegmentedButton} segmentedButton
                 */
                getSegmentedButton() {
                    if (this.segmentedButton === undefined) {
                        this.segmentedButton = new Aui.SegmentedButton({
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
                        this.textField = new Aui.Form.Field.Text({
                            emptyText: '',
                            hidden: true,
                        });
                    }
                    return this.textField;
                }
                getFileField() {
                    if (this.fileField === undefined) {
                        this.fileField = new Aui.Form.Field.Image({
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
            class Page extends Aui.Form.Field.Base {
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
                 * @param {AdminUi.Form.Field.Page.Properties} properties - 객체설정
                 */
                constructor(properties = null) {
                    super(properties);
                    this.host = this.properties.host;
                    this.language = this.properties.language;
                    this.scrollable = true;
                    this.rawValue = this.properties.value ?? null;
                    this.loading = new Aui.Loading(this, {
                        type: 'column',
                        direction: 'row',
                    });
                    this.$scrollable = this.$getContent();
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
                 * @return {Aui.Store} store
                 */
                getStore() {
                    if (this.store === undefined) {
                        this.store = new Aui.Store.Remote({
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
                    $pages.empty();
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
            class Context extends Aui.Form.Field.Base {
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
                 * @param {AdminUi.Form.Field.Context.Properties} properties - 객체설정
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
                 * @return {Aui.Form.Field.Select} select
                 */
                getModules() {
                    if (this.modules === undefined) {
                        this.modules = new Aui.Form.Field.Select({
                            store: new Aui.Store.Remote({
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
                                    this.rawValue ??= { module: null, context: null, configs: {} };
                                    this.rawValue.module = value;
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
                 * @return {Aui.Form.Field.Select} contexts
                 */
                getContexts() {
                    if (this.contexts === undefined) {
                        this.contexts = new Aui.Form.Field.Select({
                            store: new Aui.Store.Remote({
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
                                        if (this.rawValue.context !== this.getContexts().getValue()) {
                                            field.setValue(this.rawValue.context);
                                        }
                                    }
                                },
                                change: async (field, value) => {
                                    if (value === null) {
                                        this.updateValue();
                                        this.getFieldSet().empty();
                                        this.getFieldSet().hide();
                                        return;
                                    }
                                    this.rawValue.context = value;
                                    this.getForm()?.setLoading(this, true);
                                    field.disable();
                                    const configs = await Ajax.get(Admin.getProcessUrl('module', 'admin', 'module.context'), {
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
                                            const item = AdminUi.Form.Field.Create(field);
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
                 * @return {Aui.Form.FieldSet} fieldset
                 */
                getFieldSet() {
                    if (this.fieldset === undefined) {
                        this.fieldset = new Aui.Form.FieldSet({
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
            class Include extends Aui.Form.Field.Base {
                field = 'include';
                /**
                 * 텍스트필드 클래스 생성한다.
                 *
                 * @param {AdminUi.Form.Field.Include.Properties} properties - 객체설정
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
            class Permission extends Aui.Form.Field.Base {
                field = 'permission';
                /**
                 * 텍스트필드 클래스 생성한다.
                 *
                 * @param {AdminUi.Form.Field.Permission.Properties} properties - 객체설정
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
            class Theme extends Aui.Form.Field.Base {
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
                 * @param {AdminUi.Form.Field.Theme.Properties} properties - 객체설정
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
                    this.listParams = { category: this.properties.category ?? 'website' };
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
                 * @return {Aui.Form.Field.Select} select
                 */
                getSelect() {
                    if (this.select === undefined) {
                        this.select = new Aui.Form.Field.Select({
                            name: this.name,
                            flex: true,
                            store: new Aui.Store.Remote({
                                url: this.listUrl,
                                params: this.listParams,
                            }),
                            displayField: 'title',
                            valueField: 'name',
                            listField: 'name',
                            listClass: 'template',
                            listRenderer: (_display, record) => {
                                const html = [
                                    '<div class="theme">',
                                    '    <i style="background-image:url(' + record.get('screenshot') + ');"></i>',
                                    '    <div class="text">',
                                    '        <b>' + record.get('title') + '</b>',
                                    '        <small>(' + record.get('dir') + ')</small>',
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
                                    const configs = await Ajax.get(this.configsUrl, this.getConfigsParams(value));
                                    this.getFieldSet().empty();
                                    if ((configs?.fields?.length ?? 0) == 0) {
                                        this.getFieldSet().hide();
                                    }
                                    else {
                                        for (const field of configs.fields) {
                                            field.allowBlank = false;
                                            const item = AdminUi.Form.Field.Create(field);
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
                 * @return {AdminUi.Form.FieldSet} fieldset
                 */
                getFieldSet() {
                    if (this.fieldset === undefined) {
                        this.fieldset = new Aui.Form.FieldSet({
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
            class Template extends AdminUi.Form.Field.Theme {
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
                 * @param {AdminUi.Form.Field.Template.Properties} properties - 객체설정
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
    })(Form = AdminUi.Form || (AdminUi.Form = {}));
})(AdminUi || (AdminUi = {}));
