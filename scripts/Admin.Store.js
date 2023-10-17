/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 데이터스토어 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Store.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 4.
 */
var Admin;
(function (Admin) {
    class Store extends Admin.Base {
        primaryKeys;
        fields;
        params;
        sorters;
        remoteSort = false;
        filters;
        remoteFilter = false;
        loading = false;
        loaded = false;
        data;
        limit;
        page;
        count = 0;
        total = 0;
        /**
         * 데이터스토어를 생성한다.
         *
         * @param {Admin.Store.Properties} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.primaryKeys = this.properties.primaryKeys ?? [];
            this.fields = this.properties.fields ?? [];
            this.params = this.properties.params ?? null;
            this.sorters = this.properties.sorters ?? null;
            this.remoteSort = this.properties.remoteSort === true;
            this.filters = this.properties.filters ?? null;
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
         * @return {Admin.Data} data
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
         * @return {number} totalPage
         */
        loadPage(page) {
            this.page = page;
            this.reload();
        }
        /**
         * 데이터 갯수를 가져온다.
         *
         * @return {number} count
         */
        getCount() {
            return this.count ?? 0;
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
         * 데이터를 가져온다.
         *
         * @return {Admin.Data.Record[]} records
         */
        getRecords() {
            return this.data?.getRecords() ?? [];
        }
        /**
         * 특정인덱스의 데이터를 가져온다.
         *
         * @return {Admin.Data.Record} record
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
        add(record) {
            let records = [];
            if (Array.isArray(record) == true) {
                records = record;
            }
            else {
                records.push(record);
            }
            this.data?.add(records);
            this.onUpdate();
        }
        /**
         * 데이터를 가져온다.
         */
        async load() {
            return this;
        }
        /**
         * 현재 데이터를 새로고침한다.
         */
        async reload() {
            return this;
        }
        /**
         * 특정 필드의 특정값을 가진 레코드를 찾는다.
         *
         * @param {string} field - 검색필드
         * @param {any} value - 검색값
         * @return {Admin.Data.Record} record - 검색된 레코드
         */
        find(field, value) {
            for (const record of this.getRecords()) {
                if (record.get(field) == value) {
                    return record;
                }
            }
            return null;
        }
        /**
         * 특정 필드의 특정값을 가진 레코드 인덱스를 찾는다.
         *
         * @param {string} field - 검색필드
         * @param {any} value - 검색값
         * @return {number} index - 검색된 레코드의 인덱스
         */
        findIndex(field, value) {
            for (const key in this.getRecords()) {
                const index = parseInt(key, 10);
                const record = this.getRecords().at(index);
                if (record.get(field) == value) {
                    return index;
                }
            }
            return null;
        }
        /**
         * 데이터와 일치하는 레코드를 찾는다.
         *
         * @param {Admin.Data.Record|Object} matcher - 찾을 레코드
         * @return {Admin.Data.Record} record - 검색된 레코드
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
         * @param {Admin.Data.Record|Object} matcher - 찾을 레코드
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
                this.reload();
            }
            else {
                this.data?.sort(this.sorters).then(() => {
                    this.onUpdate();
                });
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
        setFilter(field, value, operator = '=') {
            this.filters ??= {};
            this.filters[field] = { value: value, operator: operator };
            this.filter();
        }
        /**
         * 특정 필드의 필터를 제거한다.
         *
         * @param {string} field
         */
        removeFilter(field) {
            delete this.filters[field];
            this.filter();
        }
        /**
         * 모든 필터를 초기화한다.
         */
        resetFilter() {
            this.filters = null;
            this.filter();
        }
        /**
         * 정의된 필터링 규칙에 따라 필터링한다.
         */
        async filter() {
            if (this.remoteFilter === true) {
                this.reload();
            }
            else {
                this.data?.filter(this.filters).then(() => {
                    this.onUpdate();
                });
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
        onLoad() {
            this.fireEvent('load', [this, this.data]);
            this.onUpdate();
        }
        /**
         * 데이터가 변경되었을 때 이벤트를 처리한다.
         */
        onUpdate() {
            if (Format.isEqual(this.data?.sorters, this.sorters) == false) {
                if (this.remoteSort == true) {
                    this.reload();
                }
                else {
                    this.data?.sort(this.sorters).then(() => {
                        this.onUpdate();
                    });
                }
            }
            else if (Format.isEqual(this.data?.filters, this.filters) == false) {
                if (this.remoteFilter == true) {
                    this.reload();
                }
                else {
                    this.data?.filter(this.filters).then(() => {
                        this.onUpdate();
                    });
                }
            }
            else {
                this.fireEvent('update', [this, this.data]);
            }
        }
    }
    Admin.Store = Store;
    (function (Store) {
        class Array extends Admin.Store {
            records;
            /**
             * Array 스토어를 생성한다.
             *
             * @param {Admin.Store.Array.Properties} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.records = this.properties.records ?? [];
                this.remoteSort = false;
                this.load();
            }
            /**
             * 데이터를 가져온다.
             */
            async load() {
                this.onBeforeLoad();
                if (this.loaded == true) {
                    this.onLoad();
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
                this.data = new Admin.Data(records, this.fields, this.primaryKeys);
                this.count = records.length;
                this.total = this.count;
                this.onLoad();
                return this;
            }
            /**
             * 현재 데이터를 새로고침한다.
             */
            async reload() {
                this.loaded = false;
                return await this.load();
            }
        }
        Store.Array = Array;
        class Ajax extends Admin.Store {
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
             */
            async load() {
                this.onBeforeLoad();
                if (this.loaded == true) {
                    this.onLoad();
                    return;
                }
                if (this.loading == true) {
                    return;
                }
                this.loading = true;
                this.params ??= {};
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
                    this.params.fields = fields.join(',');
                }
                if (this.limit > 0) {
                    this.params.start = (this.page - 1) * this.limit;
                    this.params.limit = this.limit;
                }
                if (this.remoteSort == true) {
                    if (this.sorters === null) {
                        this.params.sorters = null;
                    }
                    else {
                        this.params.sorters = JSON.stringify(this.sorters);
                    }
                }
                if (this.remoteFilter == true) {
                    if (this.filters === null) {
                        this.params.filters = null;
                    }
                    else {
                        this.params.filters = JSON.stringify(this.filters);
                    }
                }
                Admin.Ajax.get(this.url, this.params)
                    .then((results) => {
                    if (results.success == true) {
                        this.loaded = true;
                        this.data = new Admin.Data(results[this.recordsField] ?? [], this.fields, this.primaryKeys);
                        this.count = results[this.recordsField].length;
                        this.total = results[this.totalField] ?? this.count;
                        if (this.remoteSort == true) {
                            const sorters = this.params?.sorters ? JSON.parse(this.params.sorters) : null;
                            this.data.sort(sorters, false);
                        }
                        if (this.remoteFilter == true) {
                            const filters = this.params?.filters ? JSON.parse(this.params.filters) : null;
                            this.data.filter(filters, false);
                        }
                        this.loading = false;
                        this.onLoad();
                    }
                    this.loading = false;
                    return this;
                })
                    .catch((e) => {
                    console.error(e);
                    this.loading = false;
                    this.loaded = false;
                    return this;
                });
            }
            /**
             * 현재 데이터를 새로고침한다.
             */
            async reload() {
                this.loaded = false;
                return await this.load();
            }
        }
        Store.Ajax = Ajax;
    })(Store = Admin.Store || (Admin.Store = {}));
})(Admin || (Admin = {}));
