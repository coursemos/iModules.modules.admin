/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 데이터스토어 클래스를 정의한다.
 *
 * @file /scripts/Aui.Store.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 2. 2.
 */
var Aui;
(function (Aui) {
    class Store extends Aui.Base {
        primaryKeys;
        fields;
        params;
        sorters;
        remoteSort = false;
        filters;
        filterMode = 'AND';
        remoteFilter = false;
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
         * @param {Aui.Store.Properties} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.primaryKeys = this.properties.primaryKeys ?? [];
            this.fields = this.properties.fields ?? [];
            this.params = this.properties.params ?? null;
            this.sorters = this.properties.sorters ?? null;
            this.remoteSort = this.properties.remoteSort === true;
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
         * @return {Promise<Aui.Store>} this
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
            return this.data?.getRecords()[index] ?? null;
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
         * 데이터를 추가한다.
         *
         * @param {Object|Object[]} record
         */
        async add(record) {
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
         * @return {Promise<Aui.Store>} this
         */
        async load() {
            return this;
        }
        /**
         * 현재 데이터를 새로고침한다.
         *
         * @return {Promise<Aui.Store>} this
         */
        async reload() {
            this.loaded = false;
            return await this.load();
        }
        /**
         * 특정 필드의 특정값을 가진 레코드를 찾는다.
         *
         * @param {object} target - 검색대상
         * @return {Aui.Data.Record} record - 검색된 레코드
         */
        find(target) {
            for (const record of this.getRecords()) {
                let matched = true;
                for (const field in target) {
                    if (record.get(field) !== target[field]) {
                        matched = false;
                        break;
                    }
                }
                if (matched === true) {
                    return record;
                }
            }
            return null;
        }
        /**
         * 특정 필드의 특정값을 가진 레코드 인덱스를 찾는다.
         *
         * @param {object} target - 검색대상
         * @return {number} index - 검색된 레코드의 인덱스
         */
        findIndex(target) {
            for (const key in this.getRecords()) {
                const index = parseInt(key, 10);
                const record = this.getRecords().at(index);
                let matched = true;
                for (const field in target) {
                    if (record.get(field) !== target[field]) {
                        matched = false;
                        break;
                    }
                }
                if (matched == true) {
                    return index;
                }
            }
            return null;
        }
        /**
         * 데이터와 일치하는 레코드를 찾는다.
         *
         * @param {Aui.Data.Record|Object} matcher - 찾을 레코드
         * @return {Aui.Data.Record} record - 검색된 레코드
         */
        match(matcher) {
            let matched = null;
            this.getRecords().some((record) => {
                if (record.isEqual(matcher) === true) {
                    matched = record;
                    return true;
                }
            });
            return matched;
        }
        /**
         * 데이터와 일치하는 레코드의 인덱스를 찾는다.
         *
         * @param {Aui.Data.Record|Object} matcher - 찾을 레코드
         * @return {number} index - 검색된 데이터의 인덱스
         */
        matchIndex(matcher) {
            let matched = null;
            this.getRecords().some((record, index) => {
                if (record.isEqual(matcher) === true) {
                    matched = index;
                    return true;
                }
            });
            return matched;
        }
        /**
         * 데이터를 정렬한다.
         *
         * @param {string} field - 정렬할 필드명
         * @param {string} direction - 정렬방향 (asc, desc)
         */
        sort(field, direction) {
            let sorters = {};
            sorters[field] = direction;
            this.multiSort(sorters);
        }
        /**
         * 데이터를 다중 정렬기준에 따라 정렬한다.
         *
         * @param {Object} sorters - 정렬기준
         */
        async multiSort(sorters) {
            this.sorters = sorters;
            if (this.remoteSort == true) {
                await this.reload();
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
    }
    Aui.Store = Store;
    (function (Store) {
        class Array extends Aui.Store {
            records;
            /**
             * Array 스토어를 생성한다.
             *
             * @param {Aui.Store.Array.Properties} properties - 객체설정
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
             * @return {Promise<Aui.Store.Array>} this
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
                this.data = new Aui.Data(records, this.fields, this.primaryKeys);
                this.count = records.length;
                this.total = this.count;
                await this.onLoad();
                return this;
            }
        }
        Store.Array = Array;
        class Ajax extends Aui.Store {
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
             * @return {Promise<Aui.Store.Ajax>} this
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
                    this.data = new Aui.Data(results[this.recordsField] ?? [], this.fields, this.primaryKeys);
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
                    this.loaded = true;
                }
                return this;
            }
        }
        Store.Ajax = Ajax;
    })(Store = Aui.Store || (Aui.Store = {}));
})(Aui || (Aui = {}));
