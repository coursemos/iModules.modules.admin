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
        load() { }
        /**
         * 현재 데이터를 새로고침한다.
         */
        reload() { }
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
         * 데이터와 일치하는 레코드의 인덱스를 찾는다.
         *
         * @param {Admin.Data.Record} matcher - 찾을 레코드
         * @param {string[]} fields - PRIMARY 필드 (NULL 인 경우 matcher 의 전체 필드가 일치하는 레코드를, 설정된 경우 해당 필드만 검색한다.)
         * @return {number} index - 검색된 데이터의 인덱스
         */
        matchIndex(matcher, fields = null) {
            if (fields === null || fields.length == 0) {
                fields = matcher.getKeys();
            }
            for (const key in this.getRecords()) {
                const index = parseInt(key, 10);
                const record = this.getRecords().at(index);
                let isMatched = true;
                for (const field of fields) {
                    if (matcher.get(field) !== record.get(field)) {
                        isMatched = false;
                        continue;
                    }
                }
                if (isMatched === true) {
                    return index;
                }
            }
            return null;
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
            load() {
                this.onBeforeLoad();
                if (this.loaded == true) {
                    this.onLoad();
                    return;
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
                this.data = new Admin.Data(records, this.fields);
                this.count = records.length;
                this.total = this.count;
                this.onLoad();
            }
            /**
             * 현재 데이터를 새로고침한다.
             */
            reload() {
                this.loaded = false;
                this.load();
            }
        }
        Store.Array = Array;
        class Ajax extends Admin.Store {
            method;
            url;
            limit;
            page;
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
                this.limit = typeof this.properties?.limit == 'number' ? this.properties?.limit : 50;
                this.page = typeof this.properties?.page == 'number' ? this.properties?.page : 50;
                this.recordsField = this.properties.recordsField ?? 'records';
                this.totalField = this.properties.totalField ?? 'total';
            }
            /**
             * 데이터를 가져온다.
             */
            load() {
                this.onBeforeLoad();
                if (this.loaded == true) {
                    this.onLoad();
                    return;
                }
                if (this.loading == true) {
                    return;
                }
                this.loading = true;
                if (this.remoteSort == true && this.sorters !== null) {
                    this.params ??= {};
                    this.params.sorters = JSON.stringify(this.sorters);
                }
                if (this.remoteFilter == true && this.filters !== null) {
                    this.params ??= {};
                    this.params.filters = JSON.stringify(this.filters);
                }
                Admin.Ajax.get(this.url, this.params)
                    .then((results) => {
                    if (results.success == true) {
                        this.loaded = true;
                        this.data = new Admin.Data(results[this.recordsField] ?? [], this.fields);
                        this.count = results[this.recordsField].length;
                        this.total = results[this.totalField] ?? this.count;
                        if (this.remoteSort == true) {
                            const sorters = this.params?.sorters ? JSON.parse(this.params.sorters) : null;
                            if (sorters !== null) {
                                this.data.sort(sorters, false);
                            }
                        }
                        if (this.remoteFilter == true) {
                            const filters = this.params?.filters ? JSON.parse(this.params.filters) : null;
                            if (filters !== null) {
                                this.data.filter(filters, false);
                            }
                        }
                        this.loading = false;
                        this.onLoad();
                    }
                    this.loading = false;
                })
                    .catch((e) => {
                    console.error(e);
                    this.loading = false;
                    this.loaded = false;
                });
            }
            /**
             * 현재 데이터를 새로고침한다.
             */
            reload() {
                this.loaded = false;
                this.load();
            }
        }
        Store.Ajax = Ajax;
    })(Store = Admin.Store || (Admin.Store = {}));
})(Admin || (Admin = {}));
