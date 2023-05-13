/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 데이터스토어 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Store.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 20.
 */
var Admin;
(function (Admin) {
    class Store extends Admin.Base {
        fieldTypes;
        remoteSort = false;
        sorters;
        primaryKeys;
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
            this.fieldTypes = this.properties.fieldTypes ?? {};
            this.remoteSort = this.properties.remoteSort === true;
            this.sorters = this.properties.sorters ?? [];
            this.primaryKeys = this.properties.primaryKeys ?? [];
            if (this.properties.sorter) {
                this.sorters.push({ field: this.properties.sorter[0], direction: this.properties.sorter[1] });
            }
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
            this.sorters = [{ field: field, direction: direction }];
            if (this.remoteSort == true) {
            }
            else {
                this.onUpdate();
            }
        }
        /**
         * 데이터를 다중 정렬기준에 따라 정렬한다.
         *
         * @param {Object} sorters - 정렬기준 [{field:string, direction:(ASC|DESC)}, ...]
         */
        multiSort(sorters) {
            this.sorters = sorters;
            if (this.remoteSort == true) {
            }
            else {
                this.onUpdate();
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
            if (this.remoteSort === false && this.sorters.length > 0) {
                this.data?.sort(this.sorters);
            }
            this.fireEvent('load', [this, this.data]);
            this.fireEvent('update', [this, this.data]);
        }
        /**
         * 데이터가 변경되었을 때 이벤트를 처리한다.
         */
        onUpdate() {
            if (this.remoteSort === false && this.sorters.length > 0) {
                this.data?.sort(this.sorters);
            }
            this.fireEvent('update', [this, this.data]);
        }
    }
    Admin.Store = Store;
    (function (Store) {
        class Array extends Admin.Store {
            fields;
            datas;
            /**
             * Array 스토어를 생성한다.
             *
             * @param {Admin.Store.Array.Properties} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.fields = this.properties.fields ?? [];
                this.datas = this.properties.datas ?? [];
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
                this.datas.forEach((data) => {
                    const record = {};
                    this.fields.forEach((name, index) => {
                        record[name] = data[index];
                    });
                    records.push(record);
                });
                this.loaded = true;
                this.data = new Admin.Data(records, this.fieldTypes);
                this.count = records.length;
                this.total = this.count;
                if (this.sorters.length > 0) {
                    this.data.sort(this.sorters);
                }
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
            params;
            limit;
            page;
            /**
             * Ajax 스토어를 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.url = this.properties?.url ?? null;
                this.params = this.properties.params ?? null;
                this.method = this.properties?.method?.toUpperCase() == 'POST' ? 'POST' : 'GET';
                this.limit = typeof this.properties?.limit == 'number' ? this.properties?.limit : 50;
                this.page = typeof this.properties?.page == 'number' ? this.properties?.page : 50;
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
                Admin.Ajax.get(this.url, this.params)
                    .then((results) => {
                    if (results.success == true) {
                        this.loaded = true;
                        this.data = new Admin.Data(results.records, this.fieldTypes);
                        this.count = results.records.length;
                        this.total = results.total;
                        if (this.remoteSort === false && this.sorters.length > 0) {
                            this.data.sort(this.sorters);
                        }
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
