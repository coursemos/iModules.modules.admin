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
namespace Admin {
    export class Store extends Admin.Base {
        fieldTypes: { [key: string]: string };
        autoLoad: boolean = true;
        remoteSort: boolean = false;
        sorters: { field: string; direction: string }[];
        loading: boolean = false;
        loaded: boolean = false;
        data: Admin.Data;
        count: number = 0;
        total: number = 0;

        /**
         * 데이터스토어를 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties: { [key: string]: any } = null) {
            super(properties);

            this.fieldTypes = this.properties.fieldTypes ?? {};
            this.autoLoad = this.properties.autoLoad !== false;
            this.remoteSort = this.properties.remoteSort !== true;
            this.sorters = this.properties.sorters ?? [];
            if (this.properties.sorter) {
                this.sorters.push({ field: this.properties.sorter[0], direction: this.properties.sorter[1] });
            }
        }

        /**
         * 데이터가 로딩되었는지 확인한다.
         *
         * @return {boolean} is_loaded
         */
        isLoaded(): boolean {
            return this.loaded;
        }

        /**
         * 데이터셋을 가져온다.
         *
         * @return {Admin.Data} data
         */
        getData(): Admin.Data {
            return this.data;
        }

        /**
         * 데이터 갯수를 가져온다.
         *
         * @return {number} count
         */
        getCount(): number {
            return this.count ?? 0;
        }

        /**
         * 데이터를 가져온다.
         *
         * @return {Admin.Data.Record[]} records
         */
        getRecords(): Admin.Data.Record[] {
            return this.data?.getRecords() ?? [];
        }

        /**
         * 데이터를 가져온다.
         */
        load(): void {}

        /**
         * 데이터의 특정 필드의 특정값을 찾는다.
         *
         * @param {string} field
         * @param {any} value
         * @return {Admin.Data.Record} record
         */
        find(field: string, value: any): Admin.Data.Record {
            for (const record of this.getRecords()) {
                if (record.get(field) == value) {
                    return record;
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
        sort(field: string, direction: string): void {
            this.sorters = [{ field: field, direction: direction }];
            if (this.remoteSort == true) {
            } else {
                this.onLoad();
            }
        }

        /**
         * 데이터를 다중 정렬기준에 따라 정렬한다.
         *
         * @param {Object} sorters - 정렬기준 [{field:string, direction:(ASC|DESC)}, ...]
         */
        multiSort(sorters: { field: string; direction: string }[]): void {
            this.sorters = sorters;
            if (this.remoteSort == true) {
            } else {
                this.onLoad();
            }
        }

        /**
         * 데이터가 로딩되기 전 이벤트를 처리한다.
         */
        onBeforeLoad(): void {
            this.fireEvent('beforeLoad', [this]);
        }

        /**
         * 데이터가 로딩되었을 때 이벤트를 처리한다.
         */
        onLoad(): void {
            if (this.remoteSort === false && this.sorters.length > 0) {
                this.data?.sort(this.sorters);
            }
            this.fireEvent('load', [this, this.data]);
        }
    }

    export namespace Store {
        export class Array extends Admin.Store {
            fields: string[];
            datas: any[][];

            /**
             * Array 스토어를 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties: { [key: string]: any } = null) {
                super(properties);

                this.fields = this.properties.fields ?? [];
                this.datas = this.properties.datas ?? [];
                this.remoteSort = false;

                this.load();
            }

            /**
             * 데이터를 가져온다.
             */
            load(): void {
                if (this.loaded == true) {
                    return;
                }

                const records = [];
                this.datas.forEach((data) => {
                    const record: { [key: string]: any } = {};
                    this.fields.forEach((name, index) => {
                        record[name] = data[index];
                    });
                    records.push(record);
                });
                this.loaded = true;
                this.data = new Admin.Data(records, this.fieldTypes);
                this.count = records.length;
                this.total = this.count;

                this.onLoad();
            }
        }

        export class Ajax extends Admin.Store {
            method: string;
            url: string;
            limit: number;
            page: number;

            /**
             * Ajax 스토어를 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties: { [key: string]: any } = null) {
                super(properties);

                this.url = this.properties?.url ?? null;
                this.method = this.properties?.method?.toUpperCase() == 'POST' ? 'POST' : 'GET';
                this.limit = typeof this.properties?.limit == 'number' ? this.properties?.limit : 50;
                this.page = typeof this.properties?.page == 'number' ? this.properties?.page : 50;

                if (this.autoLoad == true) {
                    this.load();
                }
            }

            /**
             * 데이터를 가져온다.
             */
            load(): void {
                if (this.loaded == true || this.loading == true) {
                    return;
                }
                this.loading = true;

                this.onBeforeLoad();

                Admin.Ajax.get(this.url)
                    .then((results: { success: boolean; message?: string; records: object[]; total: number }) => {
                        if (results.success == true) {
                            this.loaded = true;
                            this.data = new Admin.Data(results.records, this.fieldTypes);
                            this.count = results.records.length;
                            this.total = results.total;

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
        }
    }
}
