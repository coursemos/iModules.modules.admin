/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 페이지를 위한 Aui Form 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/ui/AdminUi.Form.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 4. 18.
 */
namespace AdminUi {
    export namespace Form {
        export namespace Field {
            /**
             * 필드 컴포넌트를 생성한다.
             *
             * @param {Object} field - 필드정보
             * @return {AdminUi.Form.Field.Base|AdminUi.Form.FieldSet} field
             */
            export namespace Create {
                export interface Properties {
                    name?: string;
                    label?: string;
                    type?: string;
                    value?: any;
                    default?: any;
                    options?: { [value: string]: string };
                    items?: AdminUi.Form.Field.Create.Properties[];
                    [key: string]: any;
                }
            }
            export function Create(
                field: AdminUi.Form.Field.Create.Properties
            ): Aui.Form.Field.Base | Aui.Form.FieldSet {
                switch (field.type) {
                    case 'select':
                        return new Aui.Form.Field.Select({
                            name: field.name ?? null,
                            label: field.label ?? null,
                            value: field.value ?? null,
                            allowBlank: field.allowBlank ?? true,
                            store: new Aui.Store.Local({
                                fields: ['display', 'value'],
                                records: ((options: { [value: string]: string }) => {
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
                            items: ((fields: AdminUi.Form.Field.Create.Properties[]) => {
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
                            value: field.value?.name ?? field.value ?? null,
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

            export namespace Icon {
                export interface Properties extends Aui.Form.Field.Base.Properties {}
            }

            export class Icon extends Aui.Form.Field.Base {
                field: string = 'icon';
                segmentedButton: Aui.SegmentedButton;

                textField: Aui.Form.Field.Text;
                fileField: Aui.Form.Field.Image;

                /**
                 * 텍스트필드 클래스 생성한다.
                 *
                 * @param {AdminUi.Form.Field.Text.Properties} properties - 객체설정
                 */
                constructor(properties: AdminUi.Form.Field.Icon.Properties = null) {
                    super(properties);
                }

                /**
                 * 아이콘종류 선택 버튼을 가져온다.
                 *
                 * @return {Aui.SegmentedButton} segmentedButton
                 */
                getSegmentedButton(): Aui.SegmentedButton {
                    if (this.segmentedButton === undefined) {
                        this.segmentedButton = new Aui.SegmentedButton({
                            items: [
                                {
                                    iconClass: 'mi mi-placeholder',
                                    text: Admin.printText('components.form.icons.NONE'),
                                    value: 'NONE',
                                },
                                {
                                    iconClass: 'mi mi-layers',
                                    text: Admin.printText('components.form.icons.ICON'),
                                    value: 'ICON',
                                },
                                {
                                    iconClass: 'mi mi-code',
                                    text: Admin.printText('components.form.icons.CLASS'),
                                    value: 'CLASS',
                                },
                                {
                                    iconClass: 'mi mi-image',
                                    text: Admin.printText('components.form.icons.URL'),
                                    value: 'URL',
                                },
                                {
                                    iconClass: 'mi mi-upload',
                                    text: Admin.printText('components.form.icons.FILE'),
                                    value: 'FILE',
                                },
                            ],
                            listeners: {
                                change: (_button: Aui.SegmentedButton, value: string) => {
                                    this.setIconType(value);
                                },
                            },
                        });
                    }

                    return this.segmentedButton;
                }

                getIcons(): Aui.Panel {
                    return null;
                }

                getTextField(): Aui.Form.Field.Text {
                    if (this.textField === undefined) {
                        this.textField = new Aui.Form.Field.Text({
                            emptyText: '',
                            hidden: true,
                        });
                    }

                    return this.textField;
                }

                getFileField(): Aui.Form.Field.Image {
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
                setIconType(type: string): void {
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
                setValue(value: any, is_origin: boolean = false): void {
                    if (value === null || typeof value !== 'object' || value?.type == 'NONE') {
                        this.getSegmentedButton().setValue('NONE');
                        value = null;
                    } else {
                        const type = value?.type ?? 'NONE';
                        const icon = value?.icon ?? null;
                        this.getSegmentedButton().setValue(type);

                        if (type !== 'NONE') {
                            if (type == 'CLASS' || type == 'URL') {
                                this.getTextField().setValue(icon);
                            } else if (type == 'FILE') {
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
                getValue(): any {
                    const type = this.getSegmentedButton().getValue();
                    if (type == null || type == 'NONE') {
                        return null;
                    }

                    if (type == 'CLASS' || type == 'URL') {
                        return { type: type, icon: this.getTextField().getValue() };
                    } else if (type == 'FILE') {
                        return { type: type, icon: this.getFileField().getValue() };
                    }

                    return null;
                }

                /**
                 * 필드태그를 랜더링한다.
                 */
                renderContent(): void {
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

            export namespace Page {
                export interface Properties extends Aui.Form.Field.Base.Properties {
                    /**
                     * @type {string} host - 사이트테마에서 페이지를 검색하기 위한 도메인호스트명
                     */
                    host: string;

                    /**
                     * @type {string} host - 사이트테마에서 페이지를 검색하기 위한 사이트언어코드
                     */
                    language: string;
                }
            }

            export class Page extends Aui.Form.Field.Base {
                field: string = 'page';

                host: string;
                language: string;

                $pages: Dom;
                store: Aui.Store.Remote;
                rawValue: any;

                loading: Aui.Loading;

                /**
                 * 페이지필드 클래스 생성한다.
                 *
                 * @param {AdminUi.Form.Field.Page.Properties} properties - 객체설정
                 */
                constructor(properties: AdminUi.Form.Field.Page.Properties = null) {
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
                $getPages(): Dom {
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
                getStore(): Aui.Store {
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
                setValue(value: any, is_origin: boolean = false): void {
                    this.rawValue = value;

                    if (this.getStore().isLoaded() == false) {
                        this.getStore().load();
                        return;
                    }

                    if (Array.isArray(value) == true) {
                    } else {
                        const record = this.getStore().find({ name: value });

                        if (record == null) {
                            value = null;
                        } else {
                            value = record.get('name');
                            const $pages = this.$getPages();
                            Html.all('li', $pages).forEach(($item) => {
                                if ($item.getData('name') == value) {
                                    $item.addClass('selected');
                                } else {
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
                renderContent(): void {
                    const $pages = this.$getPages();
                    this.$getContent().append($pages);
                }

                /**
                 * 필드가 랜더링이 완료되었을 때 이벤트를 처리한다.
                 */
                onRender(): void {
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
                onBeforeLoad(): void {
                    this.getForm()?.setLoading(this, true, false);
                    this.$getPages().empty();
                    this.loading.show();
                }

                /**
                 * 셀렉트폼의 목록 데이터가 변경되었을 때 이벤트를 처리한다.
                 */
                onUpdate(): void {
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

            export namespace Context {
                export interface Properties extends Aui.Form.Field.Base.Properties {
                    /**
                     * @type {Object} configsParams - 설정필드값을 가져오기 위한 추가변수
                     */
                    configsParams?: { [key: string]: string };
                }
            }

            export class Context extends Aui.Form.Field.Base {
                type: string = 'form';
                role: string = 'field';
                field: string = 'context';

                modules: Aui.Form.Field.Select;
                contexts: Aui.Form.Field.Select;
                fieldset: Aui.Form.FieldSet;

                rawValue: { module: string; context: string; configs: { [key: string]: any } };

                /**
                 * 템플릿필드 클래스 생성한다.
                 *
                 * @param {AdminUi.Form.Field.Context.Properties} properties - 객체설정
                 */
                constructor(properties: AdminUi.Form.Field.Context.Properties = null) {
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
                initItems(): void {
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
                getModules(): Aui.Form.Field.Select {
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
                            listRenderer: (display: string, record: Aui.Data.Record) => {
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
                            renderer: (display: string, record: Aui.Data.Record) => {
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
                                change: (_field: Aui.Form.Field.Select, value: string) => {
                                    this.rawValue ??= { module: null, context: null, configs: {} };
                                    this.rawValue.module = value;
                                    const store = this.getContexts().getStore() as Aui.Store.Remote;
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
                getContexts(): Aui.Form.Field.Select {
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
                                update: (store: Aui.Store.Remote, field: Aui.Form.Field.Select) => {
                                    field.setDisabled(store.getCount() == 0);
                                    if (this.rawValue.module == this.getModules().getValue()) {
                                        if (this.rawValue.context !== this.getContexts().getValue()) {
                                            field.setValue(this.rawValue.context);
                                        }
                                    }
                                },
                                change: async (field: Aui.Form.Field.Select, value: string) => {
                                    if (value === null) {
                                        this.updateValue();
                                        this.getFieldSet().empty();
                                        this.getFieldSet().hide();
                                        return;
                                    }

                                    this.rawValue.context = value;

                                    this.getForm()?.setLoading(this, true);
                                    field.disable();

                                    const configs = await Ajax.get(
                                        Admin.getProcessUrl('module', 'admin', 'module.context'),
                                        {
                                            module: this.getModules().getValue(),
                                            context: value,
                                        }
                                    );
                                    this.getFieldSet().empty();

                                    if ((configs?.fields?.length ?? 0) == 0) {
                                        this.getFieldSet().hide();
                                    } else {
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
                getFieldSet(): Aui.Form.FieldSet {
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
                setValue(value: any, is_origin: boolean = false): void {
                    if (typeof value != 'object') {
                        value = null;
                    } else {
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
                getValue(): Object {
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
                updateValue(): void {
                    super.setValue(this.getValue());
                }

                /**
                 * 필드값이 유효한지 확인한다.
                 *
                 * @return {boolean|string} validation
                 */
                async validate(): Promise<boolean | string> {
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
                setError(is_error: boolean, message: string = null): void {
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
                setDisabled(disabled: boolean): this {
                    if (disabled == true) {
                        //
                    } else if (this.readonly === false) {
                        //
                    }

                    super.setDisabled(disabled);

                    return this;
                }

                /**
                 * 필드 컨테이너에 속한 필드를 랜더링한다.
                 */
                renderContent(): void {
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

            export namespace Include {
                export interface Properties extends Aui.Form.Field.Base.Properties {
                    //
                }
            }

            export class Include extends Aui.Form.Field.Base {
                field: string = 'include';

                /**
                 * 텍스트필드 클래스 생성한다.
                 *
                 * @param {AdminUi.Form.Field.Include.Properties} properties - 객체설정
                 */
                constructor(properties: AdminUi.Form.Field.Include.Properties = null) {
                    super(properties);
                }

                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value: any, is_origin: boolean = false): void {
                    value = null;

                    super.setValue(value, is_origin);
                }

                /**
                 * 필드값을 가져온다..
                 *
                 * @return {any} value - 값
                 */
                getValue(): any {
                    return null;
                }
            }

            export namespace Permission {
                export interface Properties extends Aui.Form.Field.Base.Properties {
                    //
                }
            }

            export class Permission extends Aui.Form.Field.Base {
                field: string = 'permission';

                /**
                 * 텍스트필드 클래스 생성한다.
                 *
                 * @param {AdminUi.Form.Field.Permission.Properties} properties - 객체설정
                 */
                constructor(properties: AdminUi.Form.Field.Permission.Properties = null) {
                    super(properties);
                }

                /**
                 * 필드값을 지정한다.
                 *
                 * @param {any} value - 값
                 * @param {boolean} is_origin - 원본값 변경여부
                 */
                setValue(value: any, is_origin: boolean = false): void {
                    value = null;

                    super.setValue(value, is_origin);
                }

                /**
                 * 필드값을 가져온다..
                 *
                 * @return {any} value - 값
                 */
                getValue(): any {
                    return 'true';
                }
            }

            export namespace Theme {
                export interface Properties extends Aui.Form.Field.Base.Properties {
                    /**
                     * @type {number} gap - 설정필드간 간격
                     */
                    gap?: number;

                    /**
                     * @type {Object} configsParams - 설정필드값을 가져오기 위한 추가변수
                     */
                    configsParams?: { [key: string]: string };
                }
            }

            export class Theme extends Aui.Form.Field.Base {
                type: string = 'form';
                role: string = 'field';
                field: string = 'theme';

                listUrl: string;
                listParams: { [key: string]: string };
                configsUrl: string;
                configsParams: { [key: string]: string };
                select: Aui.Form.Field.Select;
                fieldset: Aui.Form.FieldSet;
                fieldsetTitle: string;

                rawValue: { name: string; configs: { [key: string]: any } };

                /**
                 * 템플릿필드 클래스 생성한다.
                 *
                 * @param {AdminUi.Form.Field.Theme.Properties} properties - 객체설정
                 */
                constructor(properties: AdminUi.Form.Field.Theme.Properties = null) {
                    super(properties);

                    if (typeof this.properties.value == 'string') {
                        this.rawValue = { name: this.properties.value, configs: {} };
                    } else {
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
                 * @return {Aui.Form.Field.Select} select
                 */
                getSelect(): Aui.Form.Field.Select {
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
                            listRenderer: (_display: string, record: Aui.Data.Record) => {
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
                                change: async (field: Aui.Form.Field.Select, value: string) => {
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
                                    } else {
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
                getFieldSet(): Aui.Form.FieldSet {
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
                setValue(value: any, is_origin: boolean = false): void {
                    if (typeof value == 'string') {
                        value = { name: value, configs: this.value?.configs ?? {} };
                    } else {
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
                getValue(): Object {
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
                updateValue(): void {
                    super.setValue(this.getValue());
                }

                /**
                 * 필드값이 유효한지 확인한다.
                 *
                 * @return {boolean|string} validation
                 */
                async validate(): Promise<boolean | string> {
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
                setError(is_error: boolean, message: string = null): void {
                    this.getSelect().setError(is_error, null);
                    super.setError(is_error, message);
                }

                /**
                 * 필드 컨테이너에 속한 필드를 랜더링한다.
                 */
                renderContent(): void {
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

            export namespace Template {
                export interface Properties extends AdminUi.Form.Field.Theme.Properties {
                    /**
                     * @type {'module'|'plugin'|'widget'} componentType - 템플릿을 불러올 컴포넌트타입
                     */
                    componentType: 'module' | 'plugin' | 'widget';

                    /**
                     * @type {string} componentName - 컴포넌트 대상명
                     */
                    componentName: string;

                    /**
                     * @type {boolean} use_default - 기본설정 사용여부
                     */
                    use_default?: boolean;
                }
            }

            export class Template extends AdminUi.Form.Field.Theme {
                type: string = 'form';
                role: string = 'field';
                field: string = 'template';

                componentType: 'module' | 'plugin' | 'widget';
                componentName: string;
                use_default: boolean;

                context?: { host: string; language: string; path: string } = null;

                /**
                 * 템플릿필드 클래스 생성한다.
                 *
                 * @param {AdminUi.Form.Field.Template.Properties} properties - 객체설정
                 */
                constructor(properties: AdminUi.Form.Field.Template.Properties = null) {
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
        }
    }
}
