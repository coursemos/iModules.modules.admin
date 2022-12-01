/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 데이터스토어 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Store.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 1.
 */
var Admin;
(function (Admin) {
    class Store extends Admin.Base {
        autoLoad = true;
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
            this.autoLoad = this.properties?.autoLoad !== false;
            this.fieldTypes = this.properties?.fieldTypes ?? {};
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
         * 데이터가 로딩되었을 때 이벤트를 처리한다.
         */
        onLoad() {
            if (!this.listeners.load)
                return;
            for (var listener of this.listeners.load) {
                listener.listener(...listener.params);
            }
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
             * JSON 데이터를 서버로부터 가져온다.
             *
             * @return {Promise<Object>} promise
             */
            async getJson() {
                console.log('getJson', this.url, this.method);
                const jsonFetch = await fetch(this.url, {
                    method: this.method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    redirect: 'follow',
                });
                return jsonFetch.json();
            }
            /**
             * 데이터를 가져온다.
             */
            load() {
                console.log('load');
                if (this.loading == true) {
                    return;
                }
                this.loading = true;
                this.getJson()
                    .then((results) => {
                    console.log('datas', results);
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
                    console.log('error', e);
                    this.loading = false;
                    this.loaded = false;
                });
            }
        }
        Store.Ajax = Ajax;
    })(Store = Admin.Store || (Admin.Store = {}));
})(Admin || (Admin = {}));
