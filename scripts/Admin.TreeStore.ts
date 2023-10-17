/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 트리 데이터스토어 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.TreeStore.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 4.
 */
namespace Admin {
    export namespace TreeStore {
        export interface Listeners extends Admin.Base.Listeners {
            /**
             * @type {Function} load - 데이터스토어가 로딩되기 직전
             */
            beforeLoad?: (store: Admin.TreeStore) => void;

            /**
             * @type {Function} load - 데이터스토어가 로딩되었을 때
             */
            load?: (store: Admin.TreeStore, records: Admin.TreeData) => void;

            /**
             * @type {Function} update - 데이터스토어가 변경되었을 때
             */
            update?: (store: Admin.TreeStore, records: Admin.TreeData) => void;
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
             * @type {string} childrenField - 자식노드가 존재하는 필드명
             */
            childrenField?: string;

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
             * @type {Function} remoteSort - store 외부에서 자식 데이터를 확장할지 여부
             */
            remoteExpand?: (record: Admin.TreeData.Record) => Admin.TreeData.Record[];

            /**
             * @type {Object} filters - 데이터 필터
             */
            filters?: { [field: string]: { value: any; operator?: string } | string };

            /**
             * @type {boolean} remoteFilter - store 외부에서 데이터를 필터링할지 여부
             */
            remoteFilter?: boolean;

            /**
             * @type {Admin.TreeStore.Listeners} listeners - 이벤트리스너
             */
            listeners?: Admin.TreeStore.Listeners;
        }
    }

    export class TreeStore extends Admin.Base {
        primaryKeys: string[];
        fields: (string | { name: string; type: 'int' | 'float' | 'string' | 'boolean' | 'object' })[];
        childrenField: string;
        params: { [key: string]: any };
        sorters: { [field: string]: 'ASC' | 'DESC' };
        remoteSort: boolean = false;
        filters: { [field: string]: { value: any; operator: string } };
        remoteFilter: boolean = false;
        remoteExpand: (record: Admin.TreeData.Record) => Admin.TreeData.Record[];
        loading: boolean = false;
        loaded: boolean = false;
        data: Admin.TreeData;
        limit: number;
        page: number;
        count: number = 0;
        total: number = 0;

        /**
         * 데이터스토어를 생성한다.
         *
         * @param {Admin.TreeStore.Properties} properties - 객체설정
         */
        constructor(properties: Admin.TreeStore.Properties = null) {
            super(properties);

            this.primaryKeys = this.properties.primaryKeys ?? [];
            this.fields = this.properties.fields ?? [];
            this.childrenField = this.properties.childrenField ?? 'children';
            this.params = this.properties.params ?? null;
            this.sorters = this.properties.sorters ?? null;
            this.remoteSort = this.properties.remoteSort === true;
            this.remoteExpand = this.properties.remoteExpand ?? null;
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
         * @return {Admin.TreeData} data
         */
        getData(): Admin.TreeData {
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
            return this.count ?? 0;
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
         * @return {Admin.TreeData.Record[]} records
         */
        getRecords(): Admin.TreeData.Record[] {
            return this.data?.getRecords() ?? [];
        }

        /**
         * 특정인덱스의 데이터를 가져온다.
         *
         * @return {Admin.TreeData.Record} record
         */
        get(index: number[]): Admin.TreeData.Record {
            if (index.length == 0) {
                return null;
            }
            let record: Admin.TreeData.Record = null;
            let children: Admin.TreeData.Record[] = this.data?.getRecords();

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
        getPrimaryKeys(): string[] {
            return this.primaryKeys;
        }

        /**
         * 데이터를 추가한다.
         *
         * @param {Object|Object[]} record
         * @param {number[]} parents - 부모인덱스
         */
        add(record: { [key: string]: any } | { [key: string]: any }[], parents: number[] = []): void {
            let records = [];
            if (Array.isArray(record) == true) {
                records = record as { [key: string]: any }[];
            } else {
                records.push(record);
            }
            this.data?.add(records);
            this.onUpdate();
        }

        /**
         * 데이터를 가져온다.
         */
        async load(): Promise<Admin.TreeStore> {
            return this;
        }

        /**
         * 현재 데이터를 새로고침한다.
         */
        async reload(): Promise<Admin.TreeStore> {
            return this;
        }

        /**
         * 특정 필드의 특정값을 가진 레코드를 찾는다.
         *
         * @param {string} field - 검색필드
         * @param {any} value - 검색값
         * @return {Admin.TreeData.Record} record - 검색된 레코드
         */
        find(field: string, value: any): Admin.TreeData.Record {
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
         * @param {Admin.TreeData.Record|Object} matcher - 찾을 레코드
         * @return {Admin.TreeData.Record} record - 검색된 레코드
         */
        match(matcher: Admin.TreeData.Record | { [key: string]: any }): Admin.TreeData.Record {
            let matched: Admin.TreeData.Record = null;
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
         * @param {Admin.TreeData.Record|Object} matcher - 찾을 레코드
         * @param {number[]} treeIndex - 재귀호출을 위한 변수
         * @param {Admin.TreeData.Record} record - 재귀호출을 위한 변수
         * @return {number[]} index - 검색된 데이터의 인덱스
         */
        matchIndex(
            matcher: Admin.TreeData.Record | { [key: string]: any },
            treeIndex: number[] = [],
            record: Admin.TreeData.Record = null
        ): number[] {
            if (treeIndex.length == 0) {
                let matched: number[] = null;
                this.getRecords().some((record, index) => {
                    matched = this.matchIndex(matcher, [index], record);

                    if (matched !== null) {
                        return true;
                    }
                });

                return matched;
            } else {
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

                let matched: number[] = null;
                record.getChildren().some((record, index) => {
                    matched = this.matchIndex(matcher, [...treeIndex, index], record);
                    if (matched !== null) {
                        return true;
                    }
                });

                return matched;
            }
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
                this.reload();
            } else {
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
        setFilter(field: string, value: any, operator: string = '='): void {
            this.filters ??= {};
            this.filters[field] = { value: value, operator: operator };
            this.filter();
        }

        /**
         * 특정 필드의 필터를 제거한다.
         *
         * @param {string} field
         */
        removeFilter(field: string): void {
            delete this.filters[field];
            this.filter();
        }

        /**
         * 모든 필터를 초기화한다.
         */
        resetFilter(): void {
            this.filters = null;
            this.filter();
        }

        /**
         * 정의된 필터링 규칙에 따라 필터링한다.
         */
        async filter(): Promise<void> {
            if (this.remoteFilter === true) {
                this.reload();
            } else {
                this.data?.filter(this.filters).then(() => {
                    this.onUpdate();
                });
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
            this.fireEvent('load', [this, this.data]);
            this.onUpdate();
        }

        /**
         * 데이터가 변경되었을 때 이벤트를 처리한다.
         */
        onUpdate(): void {
            if (Format.isEqual(this.data?.sorters, this.sorters) == false) {
                if (this.remoteSort == true) {
                    this.reload();
                } else {
                    this.data?.sort(this.sorters).then(() => {
                        this.onUpdate();
                    });
                }
            } else if (Format.isEqual(this.data?.filters, this.filters) == false) {
                if (this.remoteFilter == true) {
                    this.reload();
                } else {
                    this.data?.filter(this.filters).then(() => {
                        this.onUpdate();
                    });
                }
            } else {
                this.fireEvent('update', [this, this.data]);
            }
        }
    }

    export namespace TreeStore {
        export namespace Array {
            export interface Properties extends Admin.TreeStore.Properties {
                /**
                 * @type {string[][]} records - 데이터
                 */
                records?: any[][];
            }
        }

        export class Array extends Admin.TreeStore {
            records: any[][];

            /**
             * Array 스토어를 생성한다.
             *
             * @param {Admin.TreeStore.Array.Properties} properties - 객체설정
             */
            constructor(properties: Admin.TreeStore.Array.Properties = null) {
                super(properties);

                this.records = this.properties.records ?? [];
                this.remoteSort = false;
                this.load();
            }

            /**
             * 데이터를 가져온다.
             */
            async load(): Promise<Admin.TreeStore.Array> {
                this.onBeforeLoad();

                if (this.loaded == true) {
                    this.onLoad();
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
                this.data = new Admin.TreeData(records, this.fields, this.primaryKeys, this.childrenField);
                this.count = records.length;
                this.total = this.count;

                this.onLoad();

                return this;
            }

            /**
             * 현재 데이터를 새로고침한다.
             */
            async reload(): Promise<Admin.TreeStore.Array> {
                this.loaded = false;
                return await this.load();
            }
        }

        export namespace Ajax {
            export interface Properties extends Admin.TreeStore.Properties {
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

        export class Ajax extends Admin.TreeStore {
            method: string;
            url: string;
            recordsField: string;
            totalField: string;

            /**
             * Ajax 스토어를 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties: Admin.TreeStore.Ajax.Properties = null) {
                super(properties);

                this.url = this.properties?.url ?? null;
                this.method = this.properties?.method?.toUpperCase() == 'POST' ? 'POST' : 'GET';
                this.recordsField = this.properties.recordsField ?? 'records';
                this.totalField = this.properties.totalField ?? 'total';
            }

            /**
             * 데이터를 가져온다.
             */
            async load(): Promise<Admin.TreeStore.Ajax> {
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
                        } else if (field?.name !== undefined) {
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
                    } else {
                        this.params.sorters = JSON.stringify(this.sorters);
                    }
                }

                if (this.remoteFilter == true) {
                    if (this.filters === null) {
                        this.params.filters = null;
                    } else {
                        this.params.filters = JSON.stringify(this.filters);
                    }
                }

                Admin.Ajax.get(this.url, this.params)
                    .then((results: Admin.Ajax.Results) => {
                        if (results.success == true) {
                            this.loaded = true;
                            this.data = new Admin.TreeData(
                                results[this.recordsField] ?? [],
                                this.fields,
                                this.primaryKeys,
                                this.childrenField
                            );
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
            async reload(): Promise<Admin.TreeStore.Ajax> {
                this.loaded = false;
                return await this.load();
            }
        }
    }
}
