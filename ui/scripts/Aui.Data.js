/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 데이터셋 클래스를 정의한다.
 *
 * @file /scripts/Aui.Data.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 5. 6.
 */
var Aui;
(function (Aui) {
    class Data {
        originRecords = [];
        records = [];
        updatedRecords = {};
        fields = {};
        primaryKeys = [];
        childrenField;
        sorting;
        sorters;
        filtering;
        filters;
        filterMode = 'AND';
        /**
         * 데이터셋을 생성한다.
         *
         * @param {Object} records - 데이터
         * @param {Object} fields - 필드명
         * @param {string[]} primaryKeys - 레코드 고유값 필드명
         * @param {string} childrenFields - 자식 레코드 필드명
         */
        constructor(records, fields = [], primaryKeys = [], childrenField = null) {
            this.fields = {};
            for (const field of fields) {
                if (typeof field == 'string') {
                    this.fields[field] = 'string';
                }
                else {
                    this.fields[field.name] = field.type;
                }
            }
            this.primaryKeys = primaryKeys;
            this.childrenField = childrenField;
            for (const record of records) {
                for (const key in record) {
                    if (key !== this.childrenField && this.fields[key] !== undefined) {
                        record[key] = this.setType(record[key], this.fields[key]);
                    }
                }
                this.records.push(new Aui.Data.Record(this, record, this.primaryKeys, this.childrenField));
            }
            this.originRecords = this.records;
            this.sorting = false;
            this.sorters = null;
            this.filtering = false;
            this.filters = null;
        }
        /**
         * 데이터를 타입을 지정하여 반환한다.
         *
         * @param {any} value - 데이터
         * @param {'int'|'float'|'string'|'boolean'|'object'} type - 타입
         * @return {any} value - 타입지정된 데이터
         */
        setType(value, type) {
            if (value === null || value === undefined) {
                return null;
            }
            switch (type) {
                case 'int':
                    value = parseInt(value, 10);
                    break;
                case 'float':
                    value = parseFloat(value);
                    break;
                case 'boolean':
                    value = value == 'true' || value == 'TRUE' || value === true || value === 1;
                    break;
                case 'string':
                    value = value.toString();
                    break;
            }
            return value;
        }
        /**
         * 전체 데이터를 가져온다.
         *
         * @return {Aui.Data.Record[]} records - 데이터 레코드셋
         */
        getRecords() {
            return this.records;
        }
        /**
         * 변경된 데이터를 가져온다.
         *
         * @return {Aui.Data.Record[]} updatedRecords - 변경된 데이터 레코드셋
         */
        getUpdatedRecords() {
            return Object.values(this.updatedRecords);
        }
        /**
         * 데이터 갯수를 가져온다.
         *
         * @return {number} count
         */
        getCount() {
            return this.records.length;
        }
        /**
         * 데이터를 추가한다.
         *
         * @param {Object[]} records
         */
        add(records) {
            for (const record of records) {
                for (const key in record) {
                    if (this.fields[key] !== undefined) {
                        record[key] = this.setType(record[key], this.fields[key]);
                    }
                }
                this.records.push(new Aui.Data.Record(this, record, this.primaryKeys, this.childrenField));
            }
        }
        /**
         * 데이터를 삭제한다.
         *
         * @param {Aui.Data.Record[]} records
         */
        delete(records) {
            for (const record of records) {
                for (const index in this.records) {
                    if (this.records[index].isEqual(record) == true) {
                        this.records.splice(parseInt(index, 10), 1);
                    }
                }
            }
        }
        /**
         * 전체 데이터를 삭제한다.
         */
        empty() {
            this.records = [];
        }
        /**
         * 데이터를 정렬한다.
         *
         * @param {Object} sorters - 정렬기준
         * @param {boolean} execute - 실제 정렬을 할지 여부
         */
        async sort(sorters, execute = true) {
            if (execute === false) {
                this.sorters = sorters;
                for (const record of this.records) {
                    await record.sort(sorters, execute);
                }
                return;
            }
            if (this.sorting == true) {
                return;
            }
            if (sorters === null) {
                this.sorters = null;
                return;
            }
            this.sorting = true;
            this.records.sort((left, right) => {
                for (const field in sorters) {
                    const direction = sorters[field].toUpperCase() == 'DESC' ? 'DESC' : 'ASC';
                    const leftValue = left.get(field);
                    const rightValue = right.get(field);
                    if (leftValue < rightValue) {
                        return direction == 'DESC' ? 1 : -1;
                    }
                    else if (leftValue > rightValue) {
                        return direction == 'ASC' ? 1 : -1;
                    }
                }
                return 0;
            });
            for (const record of this.records) {
                await record.sort(sorters, execute);
            }
            this.sorters = sorters;
            this.sorting = false;
        }
        /**
         * 데이터를 필터링한다.
         *
         * @param {Object} filters - 필터기준
         * @param {'OR'|'AND'} filterMode - 필터모드
         * @param {boolean} execute - 실제 필터링을 할지 여부
         */
        async filter(filters, filterMode = 'AND', execute = true) {
            if (execute === false) {
                this.filters = filters;
                for (const record of this.records) {
                    await record.filter(filters, filterMode, execute);
                }
                return;
            }
            if (this.filtering == true) {
                return;
            }
            if (filters === null) {
                this.filters = null;
                this.records = this.originRecords;
                for (const record of this.originRecords) {
                    await record.filter(null, filterMode, true);
                }
                return;
            }
            this.filtering = true;
            if (Object.keys(filters).length > 0) {
                const records = [];
                for (const record of this.originRecords) {
                    const matched = Format.filter(record.record, filters, filterMode);
                    await record.filter(filters, filterMode, true);
                    if (matched == true || record.getChildren().length > 0) {
                        records.push(record);
                    }
                }
                this.records = records;
            }
            else {
                this.records = this.originRecords;
            }
            this.filters = filters;
            this.filterMode = filterMode;
            this.filtering = false;
        }
    }
    Aui.Data = Data;
    (function (Data) {
        class Record {
            primaryKeys = [];
            hash;
            data;
            record;
            origin = null;
            updated = null;
            children;
            originChildren;
            childrenField;
            parents;
            sorting;
            sorters;
            filtering;
            filters;
            filterMode = 'AND';
            observer = null;
            /**
             * 데이터 레코드를 생성한다.
             *
             * @param {Object} data - 데이터
             * @param {string[]} primaryKeys - 레코드 고유값 필드명
             * @param {string} childrenField - 자식 레코드 필드명
             * @param {Aui.Data.Record[]} parents - 부모
             */
            constructor(data, record, primaryKeys = [], childrenField = null, parents = null) {
                this.data = data;
                this.record = record;
                this.primaryKeys = primaryKeys;
                this.childrenField = childrenField;
                this.parents = parents;
                if (childrenField === null || this.record[childrenField] === undefined) {
                    this.children = false;
                }
                else if (typeof this.record[childrenField] == 'boolean') {
                    this.children = this.record[childrenField];
                    delete this.record[childrenField];
                }
                else {
                    const parents = this.parents?.slice() ?? [];
                    parents.push(this);
                    this.children = [];
                    for (const child of this.record[childrenField]) {
                        this.children.push(new Aui.Data.Record(data, child, primaryKeys, childrenField, parents));
                    }
                    delete this.record[childrenField];
                }
                this.originChildren = this.children;
                this.sorting = false;
                this.sorters = null;
                this.filtering = false;
                this.filters = null;
            }
            /**
             * 데이터를 가져온다.
             *
             * @param {string} key - 가져올 데이터키
             * @return {any} value
             */
            get(key) {
                return this.record[key] ?? null;
            }
            /**
             * 데이터를 변경한다.
             *
             * @param {string} key - 변경할 데이터키
             * @param {any} value - 변경할 데이터
             */
            set(key, value) {
                const hash = this.getHash();
                this.origin ??= JSON.parse(JSON.stringify(this.record));
                const updated = this.updated ?? {};
                if (Format.isEqual(this.origin[key], value) == false) {
                    updated[key] = value;
                }
                else if (updated[key] !== undefined) {
                    delete updated[key];
                }
                if (Object.keys(updated).length > 0) {
                    this.updated = updated;
                    this.data.updatedRecords[hash] = this;
                }
                else {
                    this.updated = null;
                    if (this.data.updatedRecords[hash] !== undefined) {
                        delete this.data.updatedRecords[hash];
                    }
                }
                if (Format.isEqual(this.record[key], value) == false) {
                    this.record[key] = value;
                    if (this.observer !== null) {
                        this.observer(key, value, this.origin[key] ?? null);
                    }
                }
            }
            /**
             * 변경된 데이터를 커밋한다.
             */
            commit(key = null) {
                if (this.isUpdated(key) === false) {
                    return;
                }
                const keys = [];
                const hash = this.getHash();
                if (key === null) {
                    this.origin = this.record;
                    keys.push(...Object.keys(this.updated));
                    this.updated = null;
                    delete this.data.updatedRecords[hash];
                }
                else {
                    this.origin[key] = this.record[key];
                    keys.push(key);
                    delete this.updated[key];
                    if (Object.keys(this.updated).length == 0) {
                        this.updated = null;
                        delete this.data.updatedRecords[hash];
                    }
                    else {
                        this.data.updatedRecords[hash] = this;
                    }
                }
                if (this.observer !== null) {
                    for (const key of keys) {
                        this.observer(key, this.record[key], this.origin[key] ?? null);
                    }
                }
            }
            /**
             * 데이터가 변경된 상태인지 확인한다.
             *
             * @param {string} key - 변경된 상태를 확인할 컬럼명 (NULL 인 경우 레코드 전체의 변경여부를 반환한다.)
             * @return {boolean} is_updated
             */
            isUpdated(key = null) {
                if (this.updated === null) {
                    return false;
                }
                if (key === null) {
                    return this.updated !== null;
                }
                if (this.updated[key] !== undefined) {
                    return true;
                }
                return false;
            }
            /**
             * 전체 부모트리를 가져온다.
             *
             * @return {Aui.Data.Record[]} parents
             */
            getParents() {
                return this.parents?.slice() ?? [];
            }
            /**
             * 자식 데이터를 가져온다.
             *
             * @return {Aui.Data.Record[]} children
             */
            getChildren() {
                if (typeof this.children == 'boolean') {
                    return [];
                }
                return this.children;
            }
            /**
             * 자식 데이터를 설정한다.
             *
             * @param {Object[]} children
             */
            setChildren(children) {
                const parents = this.parents?.slice() ?? [];
                parents.push(this);
                this.children = [];
                for (const child of children) {
                    this.children.push(new Aui.Data.Record(this.data, child, this.primaryKeys, this.childrenField, parents));
                }
                this.originChildren = this.children;
            }
            /**
             * 자식 데이터가 존재하는지 확인한다.
             *
             * @return {boolean} hasChild
             */
            hasChild() {
                return this.children !== false;
            }
            /**
             * 자식 데이터를 불러왔는지 확인한다.
             *
             * @return {boolean} is_expanded
             */
            isExpanded() {
                return this.children !== true;
            }
            /**
             * 데이터의 모든 키값을 가져온다.
             *
             * @return {string[]} keys
             */
            getKeys() {
                return Object.keys(this.record);
            }
            /**
             * 고유값을 가져온다.
             *
             * @param {boolean} is_origin - 원본데이터의 PK 를 가져올지 여부 (기본값 false)
             * @return {Object} primary
             */
            getPrimary(is_origin = false) {
                let primaryKeys = {};
                let keys = this.primaryKeys;
                if (keys.length == 0) {
                    keys = this.getKeys();
                }
                for (const key of keys) {
                    if (is_origin == true && this.origin !== null) {
                        primaryKeys[key] = this.origin[key] ?? this.record[key] ?? null;
                    }
                    else {
                        primaryKeys[key] = this.record[key] ?? null;
                    }
                }
                return primaryKeys;
            }
            /**
             * 변경사항을 가져온다.
             *
             * @param {string} key - 변경사항을 가져올 데이터키 (NULL 인 경우 전체 변경사항을 가져온다.)
             * @return {Object} primary
             */
            getUpdated(key = null) {
                let updated = {};
                if (key === null) {
                    updated = { ...this.updated };
                }
                else {
                    if (this.updated[key] !== undefined) {
                        updated = { key: this.updated[key] };
                    }
                    else {
                        updated = null;
                    }
                }
                return updated;
            }
            /**
             * 데이터의 고유값 해시(SHA1)를 가져온다.
             *
             * @return {string} hash
             */
            getHash() {
                if (this.hash === undefined) {
                    this.hash = Format.sha1(JSON.stringify(this.getPrimary()));
                }
                return this.hash;
            }
            setObserver(observer) {
                this.observer = observer;
            }
            /**
             * 자식데이터를 정렬한다.
             *
             * @param {Object} sorters - 정렬기준
             * @param {boolean} execute - 실제 정렬을 할지 여부
             */
            async sort(sorters, execute = true) {
                if (execute === false) {
                    this.sorters = sorters;
                    for (const child of this.getChildren()) {
                        await child.sort(sorters, execute);
                    }
                    return;
                }
                if (this.sorting == true) {
                    return;
                }
                if (sorters === null) {
                    this.sorters = null;
                    return;
                }
                if (this.children instanceof Array) {
                    this.sorting = true;
                    this.children.sort((left, right) => {
                        for (const field in sorters) {
                            const direction = sorters[field].toUpperCase() == 'DESC' ? 'DESC' : 'ASC';
                            const leftValue = left.get(field);
                            const rightValue = right.get(field);
                            if (leftValue < rightValue) {
                                return direction == 'DESC' ? 1 : -1;
                            }
                            else if (leftValue > rightValue) {
                                return direction == 'ASC' ? 1 : -1;
                            }
                        }
                        return 0;
                    });
                    for (const child of this.children) {
                        await child.sort(sorters, execute);
                    }
                    this.sorters = sorters;
                    this.sorting = false;
                }
            }
            /**
             * 자식데이터를 필터링한다.
             *
             * @param {Object} filters - 필터기준
             * @param {'OR'|'AND'} filterMode - 필터모드
             * @param {boolean} execute - 실제 필터링을 할지 여부
             */
            async filter(filters, filterMode = 'AND', execute = true) {
                if (execute === false) {
                    this.filters = filters;
                    this.filterMode = filterMode;
                    for (const child of this.getChildren()) {
                        await child.filter(filters, filterMode, execute);
                    }
                    return;
                }
                if (typeof this.originChildren == 'boolean') {
                    return;
                }
                if (this.filtering == true) {
                    return;
                }
                if (filters === null) {
                    this.filters = null;
                    this.children = this.originChildren;
                    for (const child of this.children) {
                        await child.filter(null, filterMode, true);
                    }
                    return;
                }
                this.filtering = true;
                if (Object.keys(filters).length > 0) {
                    const children = [];
                    for (const child of this.originChildren) {
                        const matched = Format.filter(child.record, filters, filterMode);
                        await child.filter(filters, filterMode, true);
                        if (matched == true || child.getChildren().length > 0) {
                            children.push(child);
                        }
                    }
                    this.children = children;
                }
                else {
                    this.children = this.originChildren;
                }
                for (const child of this.getChildren()) {
                    await child.filter(filters, filterMode, execute);
                }
                this.filters = filters;
                this.filterMode = filterMode;
                this.filtering = false;
            }
            /**
             * 현재 레코드가 특정 데이터와 일치하는지 확인한다.
             *
             * @param {Aui.Data.Record|Object} matcher - 일치여부를 확인할 레코드 또는 데이터
             * @return {boolean} is_equal - 일치여부
             */
            isEqual(matcher) {
                let record = null;
                if (matcher instanceof Aui.Data.Record) {
                    record = matcher.record;
                }
                else {
                    record = matcher;
                }
                let keys = this.primaryKeys;
                if (keys.length == 0) {
                    keys = this.getKeys();
                }
                for (const key of keys) {
                    if (record[key] === undefined || Format.isEqual(record[key], this.record[key]) == false) {
                        return false;
                    }
                }
                return true;
            }
        }
        Data.Record = Record;
    })(Data = Aui.Data || (Aui.Data = {}));
})(Aui || (Aui = {}));
