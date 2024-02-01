/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 트리 데이터스토어 클래스를 정의한다.
 *
 * @file /scripts/Aui.TreeStore.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 2. 2.
 */
var Aui;
(function (Aui) {
    class TreeStore extends Aui.Base {
        primaryKeys;
        fields;
        childrenField;
        params;
        sorters;
        remoteSort = false;
        filters;
        filterMode = 'AND';
        remoteFilter = false;
        remoteExpand = false;
        remoteExpander;
        remotePathFinder;
        loaded = false;
        data;
        limit = 0;
        page = 0;
        count = 0;
        total = 0;
        currentParams = null;
        /**
         * 데이터스토어를 생성한다.
         *
         * @param {Aui.TreeStore.Properties} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.primaryKeys = this.properties.primaryKeys ?? [];
            this.fields = this.properties.fields ?? [];
            this.childrenField = this.properties.childrenField ?? 'children';
            this.params = this.properties.params ?? null;
            this.sorters = this.properties.sorters ?? null;
            this.remoteSort = this.properties.remoteSort === true;
            this.remoteExpand = this.properties.remoteExpand === true;
            this.remoteExpander = this.properties.remoteExpander ?? null;
            this.remotePathFinder = this.properties.remotePathFinder ?? null;
            this.filters = this.properties.filters ?? null;
            this.filterMode = this.properties.filterMode?.toUpperCase() == 'OR' ? 'OR' : 'AND';
            this.remoteFilter = this.properties.remoteFilter === true;
            if (this.filters !== null) {
                for (const field in this.filters) {
                    if (typeof this.filters[field] == 'string') {
                        this.filters[field] = { value: this.filters[field], operator: '=' };
                    }
                    else {
                        this.filters[field].operator ??= '=';
                    }
                }
            }
            this.limit = typeof this.properties?.limit == 'number' ? this.properties?.limit : 0;
            this.page = typeof this.properties?.page == 'number' ? this.properties?.page : 1;
        }
        /**
         * 데이터가 로딩되었는지 확인한다.
         *
         * @return {boolean} is_loaded
         */
        isLoaded() {
            return this.loaded;
        }
        /**
         * 데이터셋을 가져온다.
         *
         * @return {Aui.Data} data
         */
        getData() {
            return this.data;
        }
        /**
         * 현재페이지를 가져온다.
         *
         * @return {number} page
         */
        getPage() {
            return this.page;
        }
        /**
         * 전체페이지를 가져온다.
         *
         * @returns {number} totalPage
         */
        getTotalPage() {
            return this.limit > 0 ? Math.ceil(this.total / this.limit) : 1;
        }
        /**
         * 특정페이지를 로딩한다.
         *
         * @param {number} page - 불러올 페이지
         * @return {Promise<Aui.TreeStore>} this
         */
        async loadPage(page) {
            this.page = page;
            return this.reload();
        }
        /**
         * 데이터 갯수를 가져온다.
         *
         * @return {number} count
         */
        getCount() {
            return this.data?.getCount() ?? 0;
        }
        /**
         * 데이터를 불러오기 위한 매개변수를 설정한다.
         *
         * @param {Object} params - 매개변수
         */
        setParams(params) {
            for (const key in params) {
                this.setParam(key, params[key]);
            }
        }
        /**
         * 데이터를 불러오기 위한 매개변수를 설정한다.
         *
         * @param {string} key - 매개변수명
         * @param {any} value - 매개변수값
         */
        setParam(key, value) {
            this.params ??= {};
            this.params[key] = value;
        }
        /**
         * 데이터를 불러오기 위한 매개변수를 가져온다.
         *
         * @return {Object} params - 매개변수
         */
        getParams() {
            return this.params ?? {};
        }
        /**
         * 데이터를 불러오기 위한 매개변수를 가져온다.
         *
         * @param {string} key - 매개변수명
         * @return {any} value - 매개변수값
         */
        getParam(key) {
            return this.getParams()[key] ?? null;
        }
        /**
         * 데이터 로딩이 완료되었을 시점의 매개변수를 저장한다.
         */
        setCurrentParams() {
            this.currentParams = this.params ?? {};
            this.currentParams.filters = this.filters;
            this.currentParams.sorters = this.sorters;
            this.currentParams.page = this.page;
            this.currentParams.limit = this.limit;
        }
        /**
         * 현재 데이터를 로딩하는데 사용한 매개변수를 가져온다.
         */
        getCurrentParams() {
            return this.currentParams;
        }
        /**
         * 데이터를 가져온다.
         *
         * @return {Aui.Data.Record[]} records
         */
        getRecords() {
            return this.data?.getRecords() ?? [];
        }
        /**
         * 특정인덱스의 데이터를 가져온다.
         *
         * @return {Aui.Data.Record} record
         */
        get(index) {
            if (index.length == 0) {
                return null;
            }
            index = index.slice();
            let record = null;
            let children = this.data?.getRecords();
            while (index.length > 0) {
                record = children[index.shift()] ?? null;
                if (record === null) {
                    return null;
                }
                // @todo 원격불러오기
                children = record.hasChild() == true ? record.getChildren() : null;
            }
            return record;
        }
        /**
         * 고유키값을 가져온다.
         *
         * @return {string[]} primary_keys
         */
        getPrimaryKeys() {
            return this.primaryKeys;
        }
        /**
         * 부모 데이터를 가져온다.
         *
         * @param {Aui.Data.Record|Object} child - 부모데이터를 가져올 자식데이터
         * @return {Promise<Object[]>} parents - 전체 부모레코드 배열
         */
        async getParents(child) {
            if (this.isLoaded() == false) {
                await this.load();
            }
            if (child instanceof Aui.Data.Record) {
                return child.getParents();
            }
            else {
                const record = this.find(child);
                if (record !== null) {
                    return this.getParents(record);
                }
                if (this.remoteExpand == true) {
                    await this.loadParents(child);
                    const record = this.find(child);
                    if (record !== null) {
                        return this.getParents(record);
                    }
                }
                return null;
            }
        }
        /**
         * 데이터를 추가한다.
         *
         * @param {Object|Object[]} record
         * @param {number[]} parents - 부모인덱스
         */
        async add(record, parents = []) {
            let records = [];
            if (Array.isArray(record) == true) {
                records = record;
            }
            else {
                records.push(record);
            }
            this.data?.add(records);
            await this.onUpdate();
        }
        /**
         * 모든 데이터를 삭제한다.
         */
        async empty() {
            this.data?.empty();
            await this.onUpdate();
        }
        /**
         * 데이터를 가져온다.
         *
         * @return {Promise<Aui.TreeStore>} this
         */
        async load() {
            return this;
        }
        /**
         * 현재 데이터를 새로고침한다.
         *
         * @return {Promise<Aui.TreeStore>} this
         */
        async reload() {
            this.loaded = false;
            return await this.load();
        }
        /**
         * 자식 데이터를 확장한다.
         *
         * @param {number[]|Aui.Data.Record} index - 확장할 인덱스 또는 레코드
         * @return {Promise<Aui.TreeStore>} this
         */
        async expand(index) {
            const record = index instanceof Aui.Data.Record ? index : this.get(index);
            if (this.remoteExpander !== null) {
                const children = await this.remoteExpander(record);
                record.setChildren(children);
                await this.onUpdateChildren(record);
            }
            else {
                await this.loadChildren(record);
            }
            return this;
        }
        /**
         * 전체 데이터의 자식 데이터를 확장한다.
         *
         * @param {number|boolean} depth - 확장할 깊이 (true인 경우 전체를 확장한다.)
         */
        async expandAll(depth, parents = []) {
            if (depth === false || (depth !== true && parents.length > depth)) {
                return;
            }
            if (parents.length == 0) {
                for (let i = 0; i < this.getData().getCount(); i++) {
                    await this.expandAll(depth, [i]);
                }
            }
            else {
                const record = this.get(parents);
                if (record.hasChild() == true) {
                    await this.expand(parents);
                    for (let i = 0, loop = record.getChildren().length; i < loop; i++) {
                        await this.expandAll(depth, [...parents, i]);
                    }
                }
            }
        }
        /**
         * 자식데이터를 불러온다.
         *
         * @param {Aui.Data.Record} record - 자식데이터를 불러올 부모레코드
         * @return {Promise<Aui.TreeStore>} this
         */
        async loadChildren(record) {
            return this;
        }
        /**
         * 부모데이터를 불러온다.
         *
         * @param {Object} record - 부모데이터를 불러올 자식 레코드
         * @return {Promise<Aui.TreeStore>} this
         */
        async loadParents(record) {
            return this;
        }
        /**
         * 특정 필드의 특정값을 가진 레코드를 찾는다.
         *
         * @param {Object} target - 검색대상
         * @param {number[]} treeIndex - 재귀호출을 위한 변수
         * @param {Aui.Data.Record} record - 재귀호출을 위한 변수
         * @return {Aui.Data.Record} record - 검색된 레코드
         */
        find(target, treeIndex = [], record = null) {
            let matched = null;
            if (treeIndex.length == 0) {
                this.getRecords().some((record, index) => {
                    matched = this.find(target, [index], record);
                    if (matched !== null) {
                        return true;
                    }
                });
            }
            else {
                if (record === null) {
                    const root = treeIndex.shift();
                    record = this.getRecords()[root] ?? null;
                    if (record === null) {
                        return null;
                    }
                    while (treeIndex.length > 0) {
                        const current = treeIndex.shift();
                        record = record.getChildren()[current] ?? null;
                        if (record === null) {
                            return null;
                        }
                    }
                }
                matched = record;
                for (const field in target) {
                    if (record.get(field) !== target[field]) {
                        matched = null;
                        break;
                    }
                }
                if (matched === null) {
                    record.getChildren().some((record, index) => {
                        matched = this.find(target, [...treeIndex, index], record);
                        if (matched !== null) {
                            return true;
                        }
                    });
                }
            }
            return matched;
        }
        /**
         * 특정 필드의 특정값을 가진 레코드 인덱스를 찾는다.
         *
         * @param {object} target - 검색대상
         * @param {number[]} treeIndex - 재귀호출을 위한 변수
         * @param {Aui.Data.Record} record - 재귀호출을 위한 변수
         * @return {number[]} index - 검색된 레코드의 인덱스
         */
        findIndex(target, treeIndex = [], record = null) {
            let matched = null;
            if (treeIndex.length == 0) {
                this.getRecords().some((record, index) => {
                    matched = this.findIndex(target, [index], record);
                    if (matched !== null) {
                        return true;
                    }
                });
            }
            else {
                if (record === null) {
                    const root = treeIndex.shift();
                    record = this.getRecords()[root] ?? null;
                    if (record === null) {
                        return null;
                    }
                    while (treeIndex.length > 0) {
                        const current = treeIndex.shift();
                        record = record.getChildren()[current] ?? null;
                        if (record === null) {
                            return null;
                        }
                    }
                }
                matched = treeIndex;
                for (const field in target) {
                    if (record.get(field) !== target[field]) {
                        matched = null;
                        break;
                    }
                }
                if (matched === null) {
                    record.getChildren().some((record, index) => {
                        matched = this.findIndex(target, [...treeIndex, index], record);
                        if (matched !== null) {
                            return true;
                        }
                    });
                }
            }
            return matched;
        }
        /**
         * 데이터와 일치하는 레코드를 찾는다.
         *
         * @param {Aui.Data.Record|Object} matcher - 찾을 레코드
         * @param {number[]} treeIndex - 재귀호출을 위한 변수
         * @param {Aui.Data.Record} record - 재귀호출을 위한 변수
         * @return {Aui.Data.Record} record - 검색된 레코드
         */
        match(matcher, treeIndex = [], record = null) {
            let matched = null;
            if (treeIndex.length == 0) {
                this.getRecords().some((record, index) => {
                    matched = this.match(matcher, [index], record);
                    if (matched !== null) {
                        return true;
                    }
                });
            }
            else {
                if (record === null) {
                    const root = treeIndex.shift();
                    record = this.getRecords()[root] ?? null;
                    if (record === null) {
                        return null;
                    }
                    while (treeIndex.length > 0) {
                        const current = treeIndex.shift();
                        record = record.getChildren()[current] ?? null;
                        if (record === null) {
                            return null;
                        }
                    }
                }
                if (record.isEqual(matcher) == true) {
                    return record;
                }
                record.getChildren().some((record, index) => {
                    matched = this.match(matcher, [...treeIndex, index], record);
                    if (matched !== null) {
                        return true;
                    }
                });
            }
            return matched;
        }
        /**
         * 데이터와 일치하는 레코드의 인덱스를 찾는다.
         *
         * @param {Aui.Data.Record|Object} matcher - 찾을 레코드
         * @param {number[]} treeIndex - 재귀호출을 위한 변수
         * @param {Aui.Data.Record} record - 재귀호출을 위한 변수
         * @return {number[]} index - 검색된 데이터의 인덱스
         */
        matchIndex(matcher, treeIndex = [], record = null) {
            let matched = null;
            if (treeIndex.length == 0) {
                this.getRecords().some((record, index) => {
                    matched = this.matchIndex(matcher, [index], record);
                    if (matched !== null) {
                        return true;
                    }
                });
            }
            else {
                if (record === null) {
                    const root = treeIndex.shift();
                    record = this.getRecords()[root] ?? null;
                    if (record === null) {
                        return null;
                    }
                    while (treeIndex.length > 0) {
                        const current = treeIndex.shift();
                        record = record.getChildren()[current] ?? null;
                        if (record === null) {
                            return null;
                        }
                    }
                }
                if (record.isEqual(matcher) == true) {
                    return treeIndex;
                }
                record.getChildren().some((record, index) => {
                    matched = this.matchIndex(matcher, [...treeIndex, index], record);
                    if (matched !== null) {
                        return true;
                    }
                });
            }
            return matched;
        }
        /**
         * 데이터를 정렬한다.
         *
         * @param {string} field - 정렬할 필드명
         * @param {string} direction - 정렬방향 (asc, desc)
         */
        async sort(field, direction) {
            let sorters = {};
            sorters[field] = direction;
            await this.multiSort(sorters);
        }
        /**
         * 데이터를 다중 정렬기준에 따라 정렬한다.
         *
         * @param {Object} sorters - 정렬기준
         */
        async multiSort(sorters) {
            this.sorters = sorters;
            if (this.remoteSort == true) {
                this.reload();
            }
            else {
                await this.data?.sort(this.sorters);
                await this.onUpdate();
            }
        }
        /**
         * 현재 정렬기준을 가져온다.
         *
         * @return {Object} sorters
         */
        getSorters() {
            return this.data?.sorters ?? this.sorters;
        }
        /**
         * 필터를 설정한다.
         *
         * @param {string} field - 필터링할 필드명
         * @param {any} value - 필터링에 사용할 기준값
         * @param {string} operator - 필터 명령어 (=, !=, >=, <= 또는 remoteFilter 가 true 인 경우 사용자 정의 명령어)
         */
        async setFilter(field, value, operator = '=') {
            this.filters ??= {};
            this.filters[field] = { value: value, operator: operator };
            await this.filter();
        }
        /**
         * 다중필터를 설정한다.
         *
         * @param {Object} filters - 필터설정
         * @param {'OR'|'AND'} filterMode - 필터모드
         */
        async setFilters(filters, filterMode = 'AND') {
            this.filters = filters;
            this.filterMode = filterMode.toUpperCase() == 'OR' ? 'OR' : 'AND';
            await this.filter();
        }
        /**
         * 현재 필터를 가져온다.
         *
         * @return {Object} filters
         */
        getFilters() {
            return this.data?.filters ?? this.filters;
        }
        /**
         * 특정 필드의 필터를 제거한다.
         *
         * @param {string} field
         */
        async removeFilter(field) {
            delete this.filters[field];
            await this.filter();
        }
        /**
         * 모든 필터를 초기화한다.
         */
        async resetFilter() {
            this.filters = null;
            await this.filter();
        }
        /**
         * 필터모드를 변경한다.
         * 모드변경시에는 필터함수를 자동으로 호출하지 않으므로,
         * 변경된 모드로 필터링하고자 할때는 filter() 함수를 호출하여야 한다.
         *
         * @param {'OR'|'AND'} filterMode - 필터모드
         */
        setFilterMode(filterMode) {
            this.filterMode = filterMode.toUpperCase() == 'OR' ? 'OR' : 'AND';
        }
        /**
         * 정의된 필터링 규칙에 따라 필터링한다.
         */
        async filter() {
            if (this.remoteFilter === true) {
                await this.reload();
            }
            else {
                await this.data?.filter(this.filters, this.filterMode);
                await this.onUpdate();
            }
        }
        /**
         * 데이터가 로딩되기 전 이벤트를 처리한다.
         */
        onBeforeLoad() {
            this.fireEvent('beforeLoad', [this]);
        }
        /**
         * 데이터가 로딩되었을 때 이벤트를 처리한다.
         */
        async onLoad() {
            this.setCurrentParams();
            this.fireEvent('load', [this, this.data]);
            await this.onUpdate();
        }
        /**
         * 데이터가 변경되었을 때 이벤트를 처리한다.
         */
        async onUpdate() {
            this.setCurrentParams();
            if (Format.isEqual(this.data?.sorters, this.sorters) == false) {
                if (this.remoteSort == true) {
                    await this.reload();
                }
                else {
                    await this.data?.sort(this.sorters);
                }
            }
            if (Format.isEqual(this.data?.filters, this.filters) == false || this.filterMode != this.data?.filterMode) {
                if (this.remoteFilter == true) {
                    await this.reload();
                }
                else {
                    await this.data?.filter(this.filters, this.filterMode);
                }
            }
            this.fireEvent('update', [this, this.data]);
        }
        /**
         * 자식 데이터가 변경되었을 때 이벤트를 처리한다.
         *
         * @param {Aui.Data.Record} record
         */
        async onUpdateChildren(record) {
            if (Format.isEqual(record.sorters, this.sorters) == false) {
                if (this.remoteSort == true) {
                    await this.loadChildren(record);
                }
                else {
                    await record.sort(this.sorters);
                }
            }
            else if (Format.isEqual(record.filters, this.filters) == false || record.filterMode != this.filterMode) {
                if (this.remoteFilter == true) {
                    await this.loadChildren(record);
                }
                else {
                    await record.filter(this.filters, this.filterMode);
                }
            }
            this.fireEvent('updateChildren', [this, record, record.getChildren()]);
        }
    }
    Aui.TreeStore = TreeStore;
    (function (TreeStore) {
        class Array extends Aui.TreeStore {
            records;
            /**
             * Array 스토어를 생성한다.
             *
             * @param {Aui.TreeStore.Array.Properties} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.records = this.properties.records ?? [];
                this.remoteSort = false;
                this.load();
            }
            /**
             * 데이터를 가져온다.
             *
             * @return {Promise<Aui.TreeStore.Array>} this
             */
            async load() {
                this.onBeforeLoad();
                if (this.loaded == true) {
                    await this.onLoad();
                    return this;
                }
                const records = [];
                this.records.forEach((item) => {
                    const record = {};
                    this.fields.forEach((field, index) => {
                        if (typeof field == 'string') {
                            record[field] = item[index];
                        }
                        else {
                            record[field.name] = item[index];
                        }
                    });
                    records.push(record);
                });
                this.loaded = true;
                this.data = new Aui.Data(records, this.fields, this.primaryKeys, this.childrenField);
                this.count = records.length;
                this.total = this.count;
                await this.onLoad();
                return this;
            }
        }
        TreeStore.Array = Array;
        class Ajax extends Aui.TreeStore {
            method;
            url;
            recordsField;
            totalField;
            /**
             * Ajax 스토어를 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.url = this.properties?.url ?? null;
                this.method = this.properties?.method?.toUpperCase() == 'POST' ? 'POST' : 'GET';
                this.recordsField = this.properties.recordsField ?? 'records';
                this.totalField = this.properties.totalField ?? 'total';
            }
            /**
             * 데이터를 가져온다.
             *
             * @return {Promise<Aui.TreeStore.Ajax>} this
             */
            async load() {
                this.onBeforeLoad();
                if (this.loaded == true) {
                    await this.onLoad();
                    return this;
                }
                const params = { ...this.params };
                if (this.fields.length > 0) {
                    const fields = [];
                    for (const field of this.fields) {
                        if (typeof field == 'string') {
                            fields.push(field);
                        }
                        else if (field?.name !== undefined) {
                            fields.push(field.name);
                        }
                    }
                    params.fields = fields.join(',');
                }
                if (this.limit > 0) {
                    params.start = (this.page - 1) * this.limit;
                    params.limit = this.limit;
                }
                if (this.remoteSort == true) {
                    if (this.sorters === null) {
                        params.sorters = null;
                    }
                    else {
                        params.sorters = JSON.stringify(this.sorters);
                    }
                }
                if (this.remoteFilter == true) {
                    if (this.filters === null) {
                        params.filters = null;
                    }
                    else {
                        params.filters = JSON.stringify(this.filters);
                        params.filterMode = this.filterMode;
                    }
                }
                const results = await Aui.Ajax.get(this.url, params);
                if (results.success == true) {
                    this.loaded = true;
                    this.data = new Aui.Data(results[this.recordsField] ?? [], this.fields, this.primaryKeys, this.childrenField);
                    this.count = results[this.recordsField].length;
                    this.total = results[this.totalField] ?? this.count;
                    if (this.remoteSort == true) {
                        const sorters = params.sorters ? JSON.parse(params.sorters) : null;
                        this.data.sort(sorters, false);
                    }
                    if (this.remoteFilter == true) {
                        const filters = params.filters ? JSON.parse(params.filters) : null;
                        this.data.filter(filters, params.filterMode, false);
                    }
                    await this.onLoad();
                }
                else {
                    this.loaded = false;
                }
                return this;
            }
            /**
             * 자식데이터를 불러온다.
             *
             * @param {Aui.Data.Record} record - 자식데이터를 불러올 부모레코드
             * @return {Promise<Aui.TreeStore.Ajax>} this
             */
            async loadChildren(record) {
                const params = { ...this.params };
                params.parent = JSON.stringify(record.getPrimary());
                if (this.fields.length > 0) {
                    const fields = [];
                    for (const field of this.fields) {
                        if (typeof field == 'string') {
                            fields.push(field);
                        }
                        else if (field?.name !== undefined) {
                            fields.push(field.name);
                        }
                    }
                    params.fields = fields.join(',');
                }
                if (this.remoteSort == true) {
                    if (this.sorters === null) {
                        params.sorters = null;
                    }
                    else {
                        params.sorters = JSON.stringify(this.sorters);
                    }
                }
                if (this.remoteFilter == true) {
                    if (this.filters === null) {
                        params.filters = null;
                    }
                    else {
                        params.filters = JSON.stringify(this.filters);
                        params.filterMode = this.filterMode;
                    }
                }
                const results = await Aui.Ajax.get(this.url, params);
                if (results.success == true) {
                    if (this.remoteSort == true) {
                        const sorters = params.sorters ? JSON.parse(params.sorters) : null;
                        this.data.sort(sorters, false);
                    }
                    if (this.remoteFilter == true) {
                        const filters = params.filters ? JSON.parse(params.filters) : null;
                        this.data.filter(filters, params.filterMode, false);
                    }
                    record.setChildren(results.records);
                    await this.onUpdateChildren(record);
                }
                else {
                }
                return this;
            }
            /**
             * 부모데이터를 불러온다.
             *
             * @param {Object} record - 부모데이터를 불러올 자식 레코드
             * @return {Promise<Aui.TreeStore.Ajax>} this
             */
            async loadParents(record) {
                const params = { ...this.params };
                params.child = JSON.stringify(record);
                if (this.fields.length > 0) {
                    const fields = [];
                    for (const field of this.fields) {
                        if (typeof field == 'string') {
                            fields.push(field);
                        }
                        else if (field?.name !== undefined) {
                            fields.push(field.name);
                        }
                    }
                    params.fields = fields.join(',');
                }
                const results = await Aui.Ajax.get(this.url, params);
                if (results.success == true) {
                    for (const parent of results.records) {
                        const index = this.matchIndex(parent);
                        if (index === null) {
                            break;
                        }
                        await this.expand(index);
                    }
                }
                else {
                }
                return this;
            }
        }
        TreeStore.Ajax = Ajax;
    })(TreeStore = Aui.TreeStore || (Aui.TreeStore = {}));
})(Aui || (Aui = {}));
