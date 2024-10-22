/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 네비게이션 클래스를 정의한다.
 *
 * @file /scripts/Aui.Navigation.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 22.
 */
var Aui;
(function (Aui) {
    let Navigation;
    (function (Navigation) {
        class Panel extends Aui.Panel {
            type = 'navigation';
            role = 'panel';
            getUrl;
            saveUrl;
            contexts = [];
            sorter;
            /**
             * 컨텍스트 목록을 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.layout = 'fit';
                this.border = false;
                this.scrollable = 'Y';
                this.getUrl = this.properties.getUrl;
                this.saveUrl = this.properties.saveUrl;
                this.$setTop();
                this.$scrollable = this.$getContent();
                this.getScroll().addEvent('scroll', (_x, y) => {
                    this.storeScroll(y);
                });
                if (Aui.session('navigation')?.collapsed === true) {
                    this.$component.addClass('collapsed');
                }
            }
            /**
             * 네비게이션의 현재 상태를 저장하고, 페이지가 새로고침되었을 때 네비게이션의 마지막 상태를 복원한다.
             *
             * @param {string} name - 상태명
             * @param {any} value - 상태값
             */
            storeStatus(name, value) {
                let navigation = Aui.storage('navigation') ?? {};
                navigation[name] = value;
                Aui.storage('navigation', navigation);
            }
            /**
             * 네비게이션의 마지막 상태를 가져온다.
             *
             * @param {string} name - 상태명
             * @return {any} status - 상태값
             */
            getStoredStatus(name) {
                let navigation = Aui.storage('navigation') ?? {};
                return navigation[name] ?? null;
            }
            /**
             * 네비게이션의 스크롤 위치를 저장하고, 페이지가 새로고침되었을 때 네비게이션의 마지막 스크롤 위치를 복원한다.
             *
             * @param {number} y - Y 스크롤 좌표
             */
            storeScroll(y) {
                let navigation = Aui.session('navigation') ?? {};
                navigation.scroll = y;
                Aui.session('navigation', navigation);
            }
            /**
             * 네비게이션의 스크롤 위치를 저장하고, 페이지가 새로고침되었을 때 네비게이션의 마지막 스크롤 위치를 복원한다.
             *
             * @return {number} y - Y 스크롤 좌표
             */
            getStoredScroll() {
                let navigation = Aui.session('navigation') ?? {};
                return navigation.scroll ?? 0;
            }
            /**
             * 뷰포트를 가져온다.
             *
             * @return {Aui.Viewport.Panel} viewport
             */
            getViewport() {
                return this.getParent();
            }
            /**
             * 네비게이션 영역을 축소한다.
             */
            collapse() {
                this.$getComponent().addClass('collapsed');
                this.storeStatus('collapsed', true);
            }
            /**
             * 네비게이션 영역을 확장한다.
             */
            expand() {
                this.$getComponent().removeClass('collapsed');
                this.storeStatus('collapsed', false);
            }
            /**
             * 네비게이션 영역을 토글한다.
             */
            toggle() {
                if (this.$getComponent().hasClass('collapsed') == true) {
                    this.expand();
                }
                else {
                    this.collapse();
                }
            }
            /**
             * 폴더를 추가하거나 수정한다.
             *
             * @param {Aui.Navigation.Context} folder - 수정할 폴더
             */
            addFolder(folder = null) {
                new Aui.Window({
                    id: this.id + '-Folder-Window',
                    title: folder == null
                        ? Aui.printText('components.navigation.folder.add')
                        : Aui.printText('components.navigation.folder.edit'),
                    width: 400,
                    resizable: false,
                    items: [
                        new Aui.Form.Panel({
                            layout: 'fit',
                            border: false,
                            items: [
                                new Aui.Form.Field.Container({
                                    direction: 'row',
                                    items: [
                                        new Aui.Form.Field.Select({
                                            name: 'icon',
                                            store: new Aui.Store.Local({
                                                fields: ['value'],
                                                records: [
                                                    ['mi mi-folder'],
                                                    ['mi mi-folder-lock'],
                                                    ['mi mi-module'],
                                                    ['mi mi-plugin'],
                                                    ['xi xi-home'],
                                                    ['xi xi-archive'],
                                                    ['xi xi-cloud'],
                                                    ['xi xi-sitemap'],
                                                    ['xi xi-pen'],
                                                    ['xi xi-eraser'],
                                                    ['xi xi-magnifier'],
                                                    ['xi xi-slip-tongs'],
                                                    ['xi xi-cube'],
                                                    ['xi xi-cog'],
                                                    ['xi xi-paper'],
                                                    ['xi xi-layout-top-left'],
                                                    ['xi xi-user'],
                                                    ['xi xi-envelope-open'],
                                                    ['xi xi-heart'],
                                                    ['xi xi-book-spread'],
                                                    ['xi xi-crown'],
                                                    ['xi xi-plug'],
                                                    ['xi xi-trophy'],
                                                    ['xi xi-form'],
                                                    ['xi xi-notice'],
                                                    ['xi xi-slash-circle'],
                                                    ['xi xi-new'],
                                                    ['xi xi-image'],
                                                ],
                                            }),
                                            displayField: 'value',
                                            valueField: 'value',
                                            value: folder?.icon ?? 'xi xi-folder',
                                            renderer: (display) => {
                                                return '<i class="' + display + '"></i>';
                                            },
                                            listRenderer: (display) => {
                                                return '<i class="' + display + '"></i>';
                                            },
                                            width: 60,
                                        }),
                                        new Aui.Form.Field.Text({
                                            name: 'title',
                                            flex: true,
                                            allowBlank: false,
                                            value: folder?.title ?? null,
                                            emptyText: Aui.printText('components.navigation.folder.title'),
                                        }),
                                    ],
                                }),
                                new Aui.Form.Field.Select({
                                    name: 'smart',
                                    store: new Aui.Store.Local({
                                        fields: ['display', 'value'],
                                        records: (() => {
                                            const records = [];
                                            const smarts = Aui.getTexts('components.navigation.smart');
                                            for (const value in smarts) {
                                                const record = [smarts[value], value];
                                                records.push(record);
                                            }
                                            return records;
                                        })(),
                                    }),
                                    value: folder?.smart ?? 'none',
                                }),
                            ],
                        }),
                    ],
                    buttons: [
                        new Aui.Button({
                            text: Aui.printText('components.navigation.folder.delete'),
                            buttonClass: 'danger',
                            hidden: folder === null,
                            handler: (button) => {
                                folder.remove();
                                button.getParent().close();
                            },
                        }),
                        '->',
                        new Aui.Button({
                            text: Aui.printText('buttons.cancel'),
                            handler: (button) => {
                                button.getParent().close();
                            },
                        }),
                        new Aui.Button({
                            text: Aui.printText('buttons.ok'),
                            buttonClass: 'confirm',
                            handler: async (button) => {
                                const form = button.getParent().getItemAt(0);
                                const isValid = await form.isValid();
                                if (isValid == true) {
                                    const values = form.getValues();
                                    const $folders = Html.all('div[data-component][data-role=context][data-context=FOLDER]').getList();
                                    for (const $folder of $folders) {
                                        if (folder?.getId() === $folder.getAttr('data-component')) {
                                            continue;
                                        }
                                        const properties = $folder.getData('properties');
                                        if (properties.title == values.title) {
                                            form.getField('title').setError(true, await Admin.getText('admin.navigation.folder.duplicated'));
                                            return;
                                        }
                                    }
                                    if (folder === null) {
                                        const folder = new Aui.Navigation.Context({
                                            icon: values.icon,
                                            title: values.title,
                                            type: 'FOLDER',
                                            target: '_self',
                                            smart: values.smart,
                                        });
                                        folder.setParent(this);
                                        this.contexts.push(folder);
                                        this.$getContent().append(folder.$getComponent());
                                        folder.render();
                                        Html.get('a', folder.$getContent()).setAttr('disabled', 'disabled');
                                        this.sorter.setEvent();
                                    }
                                    else {
                                        folder.setTitle(values.title);
                                        folder.setIcon(values.icon);
                                        folder.setSmart(values.smart);
                                    }
                                    button.getParent().close();
                                }
                            },
                        }),
                    ],
                }).show();
            }
            /**
             * 패널의 상단을 랜더링한다.
             */
            renderTop() {
                const $top = this.$getTop();
                const collapse = new Aui.Button({
                    iconClass: 'mi mi-fast-backward',
                    buttonClass: 'action',
                    handler: () => {
                        this.toggle();
                    },
                });
                $top.append(collapse.$getComponent());
                collapse.render();
                const keyword = new Aui.Form.Field.Text({
                    id: this.id + '-Keyword',
                    flex: 1,
                    layout: 'column-item',
                    emptyText: 'Search...',
                });
                keyword.setParent(this);
                $top.append(keyword.$getComponent());
                keyword.render();
                const folder = new Aui.Button({
                    id: this.id + '-Folder',
                    iconClass: 'mi mi-folder-plus',
                    handler: async () => {
                        this.addFolder();
                    },
                });
                $top.append(folder.$getComponent());
                folder.render();
                const configs = new Aui.Button({
                    id: this.id + '-Configs',
                    iconClass: 'mi mi-config',
                    toggle: true,
                    listeners: {
                        toggle: (button, pressed) => {
                            if (pressed == true) {
                                this.$getComponent().addClass('sorting');
                                button.setIconClass('mi mi-check');
                                Html.all('a', this.$getContent()).setAttr('disabled', 'disabled');
                            }
                            else {
                                button.setIconClass('mi mi-loading');
                                button.disable();
                                this.disable();
                                this.saveContexts().then((success) => {
                                    if (success == true) {
                                        button.setIconClass('mi mi-config');
                                        button.enable();
                                        this.$getComponent().removeClass('sorting');
                                        this.enable();
                                    }
                                    else {
                                        button.setIconClass('mi mi-config');
                                        button.enable();
                                        button.setPressed(true);
                                    }
                                });
                            }
                        },
                    },
                });
                $top.append(configs.$getComponent());
                configs.render();
            }
            /**
             * 컴포넌트 컨텐츠를 랜더링한다.
             */
            renderContent() {
                this.getContexts();
            }
            /**
             * 컨텍스트 목록을 출력한다.
             *
             * @return {Promise<boolean>} success
             */
            async getContexts() {
                const $content = this.$getContent();
                $content.empty();
                const results = await Ajax.get(this.getUrl);
                if (results.success == true) {
                    this.contexts = [];
                    for (let context of results.contexts) {
                        context = new Aui.Navigation.Context(context);
                        context.setParent(this);
                        this.contexts.push(context);
                        $content.append(context.$getComponent());
                        context.render();
                    }
                    this.sorter = new Aui.Navigation.Sorter(this);
                    this.getScroll().setPosition(0, this.getStoredScroll(), false, false);
                    const $selected = Html.get('div[data-role=content].selected', this.$getContent());
                    if ($selected.getEl() !== null) {
                        const selectedTop = $selected.getOffset().top - $content.getOffset().top;
                        const selectedHeight = $selected.getOuterHeight();
                        if (selectedTop - selectedHeight < selectedHeight) {
                            this.getScroll().movePosition(null, selectedTop - selectedHeight);
                        }
                        else if (selectedTop + selectedHeight * 2 > $content.getHeight()) {
                            this.getScroll().movePosition(null, selectedTop - $content.getHeight() + selectedHeight * 2);
                        }
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
            /**
             * 컨텍스트 목록을 저장한다.
             *
             * @return {Promise<boolean>} success
             */
            async saveContexts() {
                const contexts = this.sorter.getContexts();
                const save = await Ajax.post(this.saveUrl, {
                    contexts: contexts,
                });
                if (save.success == true) {
                    await this.getContexts();
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        Navigation.Panel = Panel;
        class Context extends Aui.Component {
            type = 'navigation';
            role = 'context';
            icon;
            title;
            smart;
            path;
            target;
            contextType;
            children = [];
            /**
             * 컨텍스트 목록을 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.icon = this.properties.icon;
                this.title = this.properties.title;
                this.smart = this.properties.smart;
                this.path = this.properties.path ?? '';
                this.target = this.properties.target ?? '_self';
                this.scrollable = false;
                this.children = [];
                for (let child of this.properties.children ?? []) {
                    child = new Aui.Navigation.Context(child);
                    child.setParent(this);
                    this.children.push(child);
                }
                this.contextType = this.properties.type;
                if (this.contextType == 'FOLDER') {
                    this.$setBottom();
                }
            }
            /**
             * 컨텍스트의 현재 상태를 저장하고, 페이지가 새로고침되었을 때 컨텍스트의 마지막 상태를 복원한다.
             *
             * @param {string} name - 상태명
             * @param {any} value - 상태값
             */
            storeStatus(name, value) {
                const navigation = this.getParent();
                let contexts = navigation.getStoredStatus('contexts') ?? {};
                contexts[name] = value;
                navigation.storeStatus('contexts', contexts);
            }
            /**
             * 메뉴명을 변경한다.
             *
             * @param {string} title
             */
            setTitle(title) {
                const $content = this.$getContent();
                const $title = Html.get('span', $content);
                $title.html(title);
                this.title = title;
                this.properties.title = title;
                this.$getComponent().setData('properties', this.properties, false);
            }
            /**
             * 아이콘을 변경한다.
             *
             * @param {string} icon
             */
            setIcon(icon) {
                const $content = this.$getContent();
                const $icon = Html.get('i.icon', $content);
                $icon.removeClass(...this.icon.split(' '));
                $icon.addClass(...icon.split(' '));
                this.icon = icon;
                this.properties.icon = icon;
                this.$getComponent().setData('properties', this.properties, false);
            }
            /**
             * 스마트폴더 설정을 변경한다.
             *
             * @param {string} smart
             */
            setSmart(smart) {
                const $content = this.$getContent();
                $content.setAttr('data-smart', smart);
                this.smart = smart;
                this.properties.smart = smart;
                this.$getComponent().setData('properties', this.properties, false);
            }
            /**
             * 메뉴를 랜더링한다.
             */
            renderContent() {
                const navigation = this.getParent();
                const $content = this.$getContent();
                const $context = Html.create('a', { draggable: 'false' });
                $context.on('click', (e) => {
                    const $target = Html.el(e.currentTarget);
                    if ($target.getData('type') == 'folder' || $target.getAttr('disabled') == 'disabled') {
                        e.preventDefault();
                    }
                });
                if (this.contextType == 'CONTEXT') {
                    const url = Admin.getUrl() + this.path;
                    $context.setAttr('href', url);
                    $context.setAttr('target', this.target);
                    if (Admin.getContextUrl() == url) {
                        $content.addClass('selected');
                    }
                }
                else if (this.contextType == 'LINK') {
                    $context.setAttr('href', this.path);
                    $context.setAttr('target', this.target);
                }
                const $icon = Html.create('i', { 'class': 'icon' });
                $icon.addClass(...this.icon.split(' '));
                const $title = Html.create('span', {}, this.title);
                const $button = Html.create('button', { type: 'button', 'data-action': 'sort' });
                if (this.contextType == 'FOLDER') {
                    if ((navigation.getStoredStatus('contexts') ?? {})[this.title] === true) {
                        this.$getComponent().addClass('collapsed');
                    }
                    $content.setAttr('data-smart', this.smart);
                    $context.on('click', () => {
                        if (this.getParent().$getComponent().hasClass('sorting') == true) {
                            return;
                        }
                        this.$getComponent().toggleClass('collapsed');
                        this.storeStatus(this.title, this.$getComponent().hasClass('collapsed'));
                    });
                    $title.on('click', (e) => {
                        if (this.getParent().$getComponent().hasClass('sorting') == true) {
                            this.getParent().addFolder(this);
                            e.stopImmediatePropagation();
                        }
                    });
                }
                $context.append($icon);
                $context.append($title);
                $context.append($button);
                $content.append($context);
            }
            /**
             * 폴더의 경우 하위 메뉴를 랜더링한다.
             */
            renderBottom() {
                if (this.contextType != 'FOLDER')
                    return;
                const $bottom = this.$getBottom();
                $bottom.setAttr('data-empty', '빈 폴더');
                for (const child of this.children) {
                    $bottom.append(child.$getComponent());
                    child.render();
                }
            }
            /**
             * 컨텍스트 메뉴를 랜더링한다.
             */
            render() {
                super.render();
                this.$getComponent().setData('context', this.contextType);
                this.$getComponent().setData('properties', this.properties, false);
            }
            /**
             * 컨텍스트를 제거한다.
             */
            remove() {
                if (this.contextType == 'FOLDER') {
                    const $bottom = this.$getBottom();
                    const navigation = this.getParent();
                    Html.all('> div[data-component]', $bottom).forEach(($child) => {
                        const child = Aui.getComponent($child.getAttr('data-component'));
                        navigation.$getContent().append(child.$getComponent());
                        navigation.sorter.setEvent();
                    });
                }
                super.remove();
            }
        }
        Navigation.Context = Context;
        class Sorter {
            panel;
            context = null;
            $context = null;
            $drag = null;
            $drop = null;
            tops = [];
            bottoms = [];
            $contexts = [];
            currentDropIndex = [null, null];
            /**
             * 컨텍스트 목록을 생성한다.
             *
             * @param {Aui.Navigation.Panel} panel
             */
            constructor(panel) {
                this.panel = panel;
                this.setEvent();
            }
            /**
             * 이벤트를 등록한다.
             */
            setEvent() {
                Html.all('button[data-action=sort]', this.panel.$getContent()).forEach(($button) => {
                    if ($button.getData('drag') == null) {
                        const drag = new Aui.Drag($button, {
                            pointerType: ['mouse', 'touch', 'pen'],
                            listeners: {
                                start: ($dom) => {
                                    /**
                                     * 드래그를 하는동안 마우스를 따라 다닐 객체를 생성한다.
                                     */
                                    this.$setDrag($dom.getParents('div[data-component][data-role=context]'));
                                    /**
                                     * 드래그 시작시 컨텍스트 목록의 좌표를 갱신한다.
                                     */
                                    this.updatePositions();
                                },
                                drag: ($dom, tracker) => {
                                    if (this.$drag == null) {
                                        this.$setDrag($dom.getParents('div[data-component][data-role=context]'));
                                    }
                                    const { x, y } = tracker.getDelta();
                                    const { top, left } = this.$drag.getPosition();
                                    this.$drag.setStyle('top', top + y + 'px');
                                    this.$drag.setStyle('left', left + x + 'px');
                                    const contentRect = this.panel.$getContent().getEl().getBoundingClientRect();
                                    /**
                                     * 현재 마우스 좌표가 네비게이션 상/하단 위치에 존재할 경우 네비게이션을 스크롤 한다.
                                     */
                                    if (top > contentRect.bottom - 50) {
                                        this.panel.getScroll().setAutoScroll(0, 5);
                                    }
                                    else if (top < contentRect.top + 40) {
                                        this.panel.getScroll().setAutoScroll(0, -5);
                                    }
                                    else {
                                        this.panel.getScroll().setAutoScroll(0, 0);
                                    }
                                    /**
                                     * 현재 마우스좌표를 구한다.
                                     */
                                    let position = top + y;
                                    /**
                                     * 컨텍스트 목록의 DOM 의 위치를 마우스의 Y 좌표에 반영한다.
                                     */
                                    position -= this.panel.$getContent().getOffset().top;
                                    /**
                                     * 컨텍스트 목록의 스크롤 위치를 마우스의 Y 좌표에 반영한다.
                                     */
                                    position += this.panel.getScroll().getPosition().y;
                                    this.setDropPosition(position);
                                },
                                end: () => {
                                    if (this.$drag == null) {
                                        return;
                                    }
                                    if (this.$drop === null) {
                                        const { top, left } = this.$context.getOffset();
                                        this.$drag.animate({ top: top + 'px', left: left + 'px' }, { duration: 300, easing: 'ease-in-out' }, () => {
                                            this.$drag.remove();
                                            this.$context.removeAttr('data-drag');
                                            this.$drag = null;
                                            this.$drop = null;
                                            this.context = null;
                                            this.$context = null;
                                        });
                                    }
                                    else {
                                        this.$context.remove();
                                        const { top, left } = this.$drop.getOffset();
                                        this.$drag.animate({ top: top + 'px', left: left + 'px' }, { duration: 300, easing: 'ease-in-out' }, () => {
                                            this.$drag.remove();
                                            this.context.$getComponent().removeAttr('data-drag');
                                            this.$drop.replaceWith(this.context.$getComponent());
                                            this.$drag = null;
                                            this.$drop = null;
                                            this.context = null;
                                            this.$context = null;
                                        });
                                    }
                                },
                            },
                        });
                        $button.setData('drag', drag, false);
                    }
                });
            }
            /**
             * 현재 정렬된 트리구조를 가져온다.
             *
             * @return {any[]} contexts
             */
            getContexts() {
                const contexts = [];
                Html.all('> div[data-component][data-role=context]', this.panel.$getContent()).forEach(($context) => {
                    const properties = $context.getData('properties');
                    if ($context.getData('context') == 'FOLDER') {
                        const folder = {
                            title: properties.title,
                            icon: properties.icon,
                            smart: properties.smart,
                            children: [],
                        };
                        const $children = Html.get('div[data-role=bottom]', $context);
                        Html.all('div[data-component][data-role=context]', $children).forEach(($child) => {
                            const properties = $child.getData('properties');
                            folder.children.push(properties.path);
                        });
                        contexts.push(folder);
                    }
                    else {
                        contexts.push(properties.path);
                    }
                });
                return contexts;
            }
            /**
             * 드래그를 하는 동안 마우스를 따라 다닐 객체를 생성한다.
             *
             * @param {Dom} $target - 드래그되는 컨텍스트 DOM
             * @return {Dom} $drag
             */
            $setDrag($target) {
                if (this.$drag !== null) {
                    this.$drag.remove();
                }
                this.$drag = $target.clone();
                this.$drag.setAttr('data-drag', 'drag');
                this.$drag.setStyle('width', $target.getOuterWidth() + 'px');
                this.$drag.setStyle('top', $target.getOffset().top + 'px');
                this.$drag.setStyle('left', $target.getOffset().left + 'px');
                this.context = Aui.get($target.getData('component'));
                $target.setAttr('data-drag', 'origin');
                this.$context = $target;
                this.panel.$getComponent().append(this.$drag);
                return this.$drag;
            }
            /**
             * 현재 컨텍스트 목록의 좌표를 갱신한다.
             */
            updatePositions() {
                Html.get('div[data-drag=drop]', this.panel.$getContent()).remove();
                this.tops = [];
                this.$contexts = [];
                Html.all('> div[data-component][data-role=context]', this.panel.$getContent()).forEach(($context) => {
                    const $link = Html.get('> div[data-role=container] > div[data-role=content] > a', $context);
                    let top = $link.getOffset().top - this.panel.$getContent().getOffset().top;
                    top += this.panel.getScroll().getPosition().y;
                    let bottom = top + $link.getOuterHeight();
                    this.tops.push(top);
                    this.bottoms.push(bottom);
                    this.$contexts.push($context);
                    if ($context.getData('context') == 'FOLDER') {
                        const tops = [];
                        const bottoms = [];
                        const $children = Html.get('div[data-role=bottom]', $context);
                        Html.all('div[data-component][data-role=context]', $children).forEach(($child) => {
                            const $link = Html.get('> div[data-role=container] > div[data-role=content] > a', $child);
                            let top = $link.getOffset().top - this.panel.$getContent().getOffset().top;
                            top += this.panel.getScroll().getPosition().y;
                            let bottom = top + $link.getOuterHeight();
                            tops.push(top);
                            bottoms.push(bottom);
                        });
                        if (tops.length == 0) {
                            let top = $link.getOffset().top - this.panel.$getContent().getOffset().top;
                            top += this.panel.getScroll().getPosition().y + 5;
                            tops.push(top);
                            bottoms.push(top + 10);
                        }
                        $context.setData('tops', tops, false);
                        $context.setData('bottoms', bottoms, false);
                    }
                });
            }
            /**
             * 이동할 위치를 정의한다.
             *
             * @param {number} y - 이동할 위치의 Y 좌표
             */
            setDropPosition(y) {
                let isLast = true;
                let dropIndex = [0, null];
                this.tops.forEach((top, index) => {
                    if (top >= y) {
                        isLast = false;
                        return false;
                    }
                    dropIndex = [index, null];
                });
                if (isLast == true && this.bottoms[dropIndex[0]] < y) {
                    dropIndex = [dropIndex[0] + 1, null];
                }
                const $next = this.$contexts[dropIndex[0]] ?? null;
                if (this.context.contextType != 'FOLDER' && $next?.getData('context') == 'FOLDER') {
                    isLast = true;
                    dropIndex[1] = null;
                    const tops = $next.getData('tops');
                    const bottoms = $next.getData('bottoms');
                    tops.forEach((top, index) => {
                        if (top >= y) {
                            isLast = false;
                            return false;
                        }
                        dropIndex[1] = index;
                    });
                    if (isLast == true && bottoms[dropIndex[1]] < y) {
                        dropIndex[1] = dropIndex[1] + 1;
                    }
                }
                if (this.currentDropIndex[0] === dropIndex[0] && this.currentDropIndex[1] === dropIndex[1]) {
                    return;
                }
                this.currentDropIndex = dropIndex;
                if (dropIndex[1] === null) {
                    const $prev = this.$contexts[dropIndex[0] - 1] ?? null;
                    const $next = this.$contexts[dropIndex[0]] ?? null;
                    if ($prev?.getAttr('data-drag') == 'origin') {
                        $prev.addClass('drop');
                        Html.get('div[data-drag=drop]', this.panel.$getContent()).remove();
                        this.$drop = null;
                        return;
                    }
                    if ($next?.getAttr('data-drag') == 'origin') {
                        $next.addClass('drop');
                        Html.get('div[data-drag=drop]', this.panel.$getContent()).remove();
                        this.$drop = null;
                        return;
                    }
                }
                else {
                    const $children = Html.all('div[data-component]', this.$contexts[dropIndex[0]]).getList();
                    const $prev = $children[dropIndex[1] - 1] ?? null;
                    const $next = $children[dropIndex[1]] ?? null;
                    if ($prev?.getAttr('data-drag') == 'origin') {
                        $prev.addClass('drop');
                        Html.get('div[data-drag=drop]', this.panel.$getContent()).remove();
                        this.$drop = null;
                        return;
                    }
                    if ($next?.getAttr('data-drag') == 'origin') {
                        $next.addClass('drop');
                        Html.get('div[data-drag=drop]', this.panel.$getContent()).remove();
                        this.$drop = null;
                        return;
                    }
                }
                Html.get('div[data-drag=origin]', this.panel.$getContent()).removeClass('drop');
                Html.get('div[data-drag=drop]', this.panel.$getContent()).remove();
                this.$drop = this.$context.clone();
                this.$drop.setAttr('data-drag', 'drop');
                if (dropIndex[1] == null) {
                    this.panel.$getContent().append(this.$drop, dropIndex[0]);
                }
                else {
                    Html.get('div[data-role=bottom]', this.$contexts[dropIndex[0]]).append(this.$drop, dropIndex[1]);
                }
            }
        }
        Navigation.Sorter = Sorter;
    })(Navigation = Aui.Navigation || (Aui.Navigation = {}));
})(Aui || (Aui = {}));
