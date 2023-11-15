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
namespace Admin {
    export namespace Store {
        export interface Listeners extends Admin.Base.Listeners {
            /**
             * @type {Function} load - 데이터스토어가 로딩되기 직전
             */
            beforeLoad?: (store: Admin.Store) => void;

            /**
             * @type {Function} load - 데이터스토어가 로딩되었을 때
             */
            load?: (store: Admin.Store, records: Admin.Data) => void;

            /**
             * @type {Function} update - 데이터스토어가 변경되었을 때
             */
            update?: (store: Admin.Store, records: Admin.Data) => void;
        }

        export interface Properties extends Admin.Base.Properties {
            /**
             * @type {string[]} - 레코드 고유값
             */
            primaryKeys?: string[];

            /**
             * @type {(string|Object)[]} fields - 필드값 타입
             */
            fields?: (string | { name: string; type: 'int' | 'float' | 'string' | 'boolean' | 'object' })[];

            /**
             * @type {Object} params - 데이터를 가져올때 사용할 매개변수
             */
            params?: { [key: string]: any };

            /**
             * @type {Object} sorters - 데이터 정렬방식
             */
            sorters?: { [field: string]: 'ASC' | 'DESC' };

            /**
             * @type {boolean} remoteSort - store 외부에서 데이터를 정렬할지 여부
             */
            remoteSort?: boolean;

            /**
             * @type {Object} filters - 데이터 필터
             */
            filters?: { [field: string]: { value: any; operator?: string } | string };

            /**
             * @type {boolean} remoteFilter - store 외부에서 데이터를 필터링할지 여부
             */
            remoteFilter?: boolean;

            /**
             * @type {Admin.Store.Listeners} listeners - 이벤트리스너
             */
            listeners?: Admin.Store.Listeners;
        }
    }

    export class Store extends Admin.Base {
        primaryKeys: string[];
        fields: (string | { name: string; type: 'int' | 'float' | 'string' | 'boolean' | 'object' })[];
        params: { [key: string]: any };
        sorters: { [field: string]: 'ASC' | 'DESC' };
        remoteSort: boolean = false;
        filters: { [field: string]: { value: any; operator: string } };
        remoteFilter: boolean = false;
        loading: boolean = false;
        loaded: boolean = false;
        data: Admin.Data;
        limit: number;
        page: number;
        count: number = 0;
        total: number = 0;

        /**
         * 데이터스토어를 생성한다.
         *
         * @param {Admin.Store.Properties} properties - 객체설정
         */
        constructor(properties: Admin.Store.Properties = null) {
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
                    } else {
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
         * 현재페이지를 가져온다.
         *
         * @return {number} page
         */
        getPage(): number {
            return this.page;
        }

        /**
         * 전체페이지를 가져온다.
         *
         * @returns {number} totalPage
         */
        getTotalPage(): number {
            return this.limit > 0 ? Math.ceil(this.total / this.limit) : 1;
        }

        /**
         * 특정페이지를 로딩한다.
         *
         * @return {number} totalPage
         */
        loadPage(page: number): void {
            this.page = page;
            this.reload();
        }

        /**
         * 데이터 갯수를 가져온다.
         *
         * @return {number} count
         */
        getCount(): number {
            return this.data?.getCount() ?? 0;
        }

        /**
         * 데이터를 불러오기 위한 매개변수를 설정한다.
         *
         * @param {Object} params - 매개변수
         */
        setParams(params: { [key: string]: any }): void {
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
        setParam(key: string, value: any) {
            this.params ??= {};
            this.params[key] = value;
        }

        /**
         * 데이터를 불러오기 위한 매개변수를 가져온다.
         *
         * @return {Object} params - 매개변수
         */
        getParams(): { [key: string]: any } {
            return this.params ?? {};
        }

        /**
         * 데이터를 불러오기 위한 매개변수를 가져온다.
         *
         * @param {string} key - 매개변수명
         * @return {any} value - 매개변수값
         */
        getParam(key: string): any {
            return this.getParams()[key] ?? null;
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
         * 특정인덱스의 데이터를 가져온다.
         *
         * @return {Admin.Data.Record} record
         */
        get(index: number): Admin.Data.Record {
            return this.data?.getRecords()[index] ?? null;
        }

        /**
         * 고유키값을 가져온다.
         *
         * @return {string[]} primary_keys
         */
        getPrimaryKeys(): string[] {
            return this.primaryKeys;
        }

        /**
         * 데이터를 추가한다.
         *
         * @param {Object|Object[]} record
         */
        async add(record: { [key: string]: any } | { [key: string]: any }[]): Promise<void> {
            let records = [];
            if (Array.isArray(record) == true) {
                records = record as { [key: string]: any }[];
            } else {
                records.push(record);
            }
            this.data?.add(records);
            await this.onUpdate();
        }

        /**
         * 데이터를 가져온다.
         */
        async load(): Promise<Admin.Store> {
            return this;
        }

        /**
         * 현재 데이터를 새로고침한다.
         */
        async reload(): Promise<Admin.Store> {
            return this;
        }

        /**
         * 특정 필드의 특정값을 가진 레코드를 찾는다.
         *
         * @param {string} field - 검색필드
         * @param {any} value - 검색값
         * @return {Admin.Data.Record} record - 검색된 레코드
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
         * 특정 필드의 특정값을 가진 레코드 인덱스를 찾는다.
         *
         * @param {string} field - 검색필드
         * @param {any} value - 검색값
         * @return {number} index - 검색된 레코드의 인덱스
         */
        findIndex(field: string, value: any): number {
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
        match(matcher: Admin.Data.Record | { [key: string]: any }): Admin.Data.Record {
            let matched: Admin.Data.Record = null;
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
        matchIndex(matcher: Admin.Data.Record | { [key: string]: any }): number {
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
        sort(field: string, direction: string): void {
            let sorters = {};
            sorters[field] = direction;
            this.multiSort(sorters);
        }

        /**
         * 데이터를 다중 정렬기준에 따라 정렬한다.
         *
         * @param {Object} sorters - 정렬기준
         */
        async multiSort(sorters: { [field: string]: 'ASC' | 'DESC' }): Promise<void> {
            this.sorters = sorters;
            if (this.remoteSort == true) {
                await this.reload();
            } else {
                await this.data?.sort(this.sorters);
                await this.onUpdate();
            }
        }

        /**
         * 현재 정렬기준을 가져온다.
         *
         * @return {Object} sorters
         */
        getSorters(): { [field: string]: 'ASC' | 'DESC' } {
            return this.data?.sorters ?? this.sorters;
        }

        /**
         * 필터를 설정한다.
         *
         * @param {string} field - 필터링할 필드명
         * @param {any} value - 필터링에 사용할 기준값
         * @param {string} operator - 필터 명령어 (=, !=, >=, <= 또는 remoteFilter 가 true 인 경우 사용자 정의 명령어)
         */
        async setFilter(field: string, value: any, operator: string = '='): Promise<void> {
            this.filters ??= {};
            this.filters[field] = { value: value, operator: operator };
            await this.filter();
        }

        /**
         * 특정 필드의 필터를 제거한다.
         *
         * @param {string} field
         */
        async removeFilter(field: string): Promise<void> {
            delete this.filters[field];
            await this.filter();
        }

        /**
         * 모든 필터를 초기화한다.
         */
        async resetFilter(): Promise<void> {
            this.filters = null;
            await this.filter();
        }

        /**
         * 정의된 필터링 규칙에 따라 필터링한다.
         */
        async filter(): Promise<void> {
            if (this.remoteFilter === true) {
                await this.reload();
            } else {
                await this.data?.filter(this.filters);
                await this.onUpdate();
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
        async onLoad(): Promise<void> {
            this.fireEvent('load', [this, this.data]);
            await this.onUpdate();
        }

        /**
         * 데이터가 변경되었을 때 이벤트를 처리한다.
         */
        async onUpdate(): Promise<void> {
            if (Format.isEqual(this.data?.sorters, this.sorters) == false) {
                if (this.remoteSort == true) {
                    await this.reload();
                } else {
                    await this.data?.sort(this.sorters);
                }
            }

            if (Format.isEqual(this.data?.filters, this.filters) == false) {
                if (this.remoteFilter == true) {
                    await this.reload();
                } else {
                    await this.data?.filter(this.filters);
                }
            }

            this.fireEvent('update', [this, this.data]);
        }
    }

    export namespace Store {
        export namespace Array {
            export interface Properties extends Admin.Store.Properties {
                /**
                 * @type {string[][]} records - 데이터
                 */
                records?: any[][];
            }
        }

        export class Array extends Admin.Store {
            records: any[][];

            /**
             * Array 스토어를 생성한다.
             *
             * @param {Admin.Store.Array.Properties} properties - 객체설정
             */
            constructor(properties: Admin.Store.Array.Properties = null) {
                super(properties);

                this.records = this.properties.records ?? [];
                this.remoteSort = false;
                this.load();
            }

            /**
             * 데이터를 가져온다.
             */
            async load(): Promise<Admin.Store.Array> {
                this.onBeforeLoad();

                if (this.loaded == true) {
                    await this.onLoad();
                    return this;
                }

                const records = [];
                this.records.forEach((item) => {
                    const record: { [key: string]: any } = {};
                    this.fields.forEach((field, index) => {
                        if (typeof field == 'string') {
                            record[field] = item[index];
                        } else {
                            record[field.name] = item[index];
                        }
                    });
                    records.push(record);
                });
                this.loaded = true;
                this.data = new Admin.Data(records, this.fields, this.primaryKeys);
                this.count = records.length;
                this.total = this.count;

                await this.onLoad();

                return this;
            }

            /**
             * 현재 데이터를 새로고침한다.
             */
            async reload(): Promise<Admin.Store.Array> {
                this.loaded = false;
                return await this.load();
            }
        }

        export namespace Ajax {
            export interface Properties extends Admin.Store.Properties {
                /**
                 * @type {'get'|'post'} method - 데이터를 가져올 방식
                 */
                method?: 'get' | 'post';

                /**
                 * @type {string} url - 데이터를 가져올 URL
                 */
                url: string;

                /**
                 * @type {number} limit - 페이지당 가져올 갯수
                 */
                limit?: number;

                /**
                 * @type {number} page - 가져올 페이지 번호
                 */
                page?: number;

                /**
                 * @type {string} recordsField - 데이터가 있는 필드명
                 */
                recordsField?: string;

                /**
                 * @type {string} totalField - 데이터 총 갯수가 있는 필드명
                 */
                totalField?: string;
            }
        }

        export class Ajax extends Admin.Store {
            method: string;
            url: string;
            recordsField: string;
            totalField: string;

            /**
             * Ajax 스토어를 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties: Admin.Store.Ajax.Properties = null) {
                super(properties);

                this.url = this.properties?.url ?? null;
                this.method = this.properties?.method?.toUpperCase() == 'POST' ? 'POST' : 'GET';
                this.recordsField = this.properties.recordsField ?? 'records';
                this.totalField = this.properties.totalField ?? 'total';
            }

            /**
             * 데이터를 가져온다.
             */
            async load(): Promise<Admin.Store.Ajax> {
                this.onBeforeLoad();

                if (this.loaded == true) {
                    await this.onLoad();
                    return this;
                }

                if (this.loading == true) {
                    return this;
                }

                this.loading = true;

                const params = { ...this.params };

                if (this.fields.length > 0) {
                    const fields = [];
                    for (const field of this.fields) {
                        if (typeof field == 'string') {
                            fields.push(field);
                        } else if (field?.name !== undefined) {
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
                    } else {
                        params.sorters = JSON.stringify(this.sorters);
                    }
                }

                if (this.remoteFilter == true) {
                    if (this.filters === null) {
                        params.filters = null;
                    } else {
                        params.filters = JSON.stringify(this.filters);
                    }
                }

                const results = await Admin.Ajax.get(this.url, params);
                if (results.success == true) {
                    this.loaded = true;
                    this.data = new Admin.Data(results[this.recordsField] ?? [], this.fields, this.primaryKeys);
                    this.count = results[this.recordsField].length;
                    this.total = results[this.totalField] ?? this.count;

                    if (this.remoteSort == true) {
                        const sorters = params.sorters ? JSON.parse(params.sorters) : null;
                        this.data.sort(sorters, false);
                    }

                    if (this.remoteFilter == true) {
                        const filters = params.filters ? JSON.parse(params.filters) : null;
                        this.data.filter(filters, false);
                    }

                    this.loading = false;

                    await this.onLoad();
                } else {
                    this.loaded = false;
                }

                this.loading = false;

                return this;
            }

            /**
             * 현재 데이터를 새로고침한다.
             */
            async reload(): Promise<Admin.Store.Ajax> {
                this.loaded = false;
                return await this.load();
            }
        }
    }
}
