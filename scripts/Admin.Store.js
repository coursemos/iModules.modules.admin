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
        autoLoad = true;
        remoteSort = false;
        loading = false;
        loaded = false;
        data;
        count = 0;
        total = 0;
        fieldTypes;
        /**
         * 데이터스토어를 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.autoLoad = this.properties.autoLoad !== false;
            this.remoteSort = this.properties.remoteSort !== true;
            this.fieldTypes = this.properties.fieldTypes ?? {};
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
         * 데이터를 가져온다.
         */
        load() { }
        /**
         * 데이터를 정렬한다.
         *
         * @param {string} field - 정렬할 필드명
         * @param {string} direction - 정렬방향 (asc, desc)
         */
        sort(field, direction) {
            this.onBeforeLoad();
            this.data?.sort([{ field: field, direction: direction }]);
            this.onLoad();
        }
        /**
         * 데이터를 다중 정렬기준에 따라 정렬한다.
         *
         * @param {Object} sorters - 정렬기준 [{field:string, direction:(ASC|DESC)}, ...]
         */
        multiSort(sorters) {
            this.onBeforeLoad();
            this.data?.sort(sorters);
            this.onLoad();
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
        }
    }
    Admin.Store = Store;
    (function (Store) {
        class Ajax extends Admin.Store {
            method;
            url;
            limit;
            page;
            /**
             * 데이터스토어를 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.url = this.properties?.url ?? null;
                this.method = this.properties?.method?.toUpperCase() == 'POST' ? 'POST' : 'GET';
                this.limit = typeof this.properties?.limit == 'number' ? this.properties?.limit : 50;
                this.page = typeof this.properties?.page == 'number' ? this.properties?.page : 50;
            }
            /**
             * 데이터를 가져온다.
             */
            load() {
                if (this.loading == true) {
                    return;
                }
                this.loading = true;
                this.onBeforeLoad();
                Admin.Ajax.get(this.url)
                    .then((results) => {
                    if (results.success == true) {
                        this.loaded = true;
                        this.data = new Admin.Data(results.records, this.fieldTypes);
                        this.count = results.records.length;
                        this.total = results.total;
                        this.onLoad();
                    }
                    else {
                        this.loaded = true;
                        if (results.message) {
                        }
                    }
                    this.loading = false;
                })
                    .catch((e) => {
                    console.error(e);
                    this.loading = false;
                    this.loaded = false;
                });
            }
        }
        Store.Ajax = Ajax;
    })(Store = Admin.Store || (Admin.Store = {}));
})(Admin || (Admin = {}));
