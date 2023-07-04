/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 데이터셋 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Data.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 1.
 */
var Admin;
(function (Admin) {
    class Data {
        originRecoreds = [];
        records = [];
        fields = {};
        sorting;
        sorters;
        filtering;
        filters;
        /**
         * 데이터셋을 생성한다.
         *
         * @param {Object} records - 데이터
         * @param {Object} fields - 필드명
         */
        constructor(records, fields = []) {
            this.fields = {};
            for (const field of fields) {
                if (typeof field == 'string') {
                    this.fields[field] = 'string';
                }
                else {
                    this.fields[field.name] = field.type;
                }
            }
            for (const record of records) {
                for (const key in record) {
                    if (this.fields[key] !== undefined) {
                        record[key] = this.setType(record[key], this.fields[key]);
                    }
                }
                this.records.push(new Admin.Data.Record(record));
            }
            this.originRecoreds = this.records;
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
         * @return {Admin.Data.Record[]} records - 데이터 레코드셋
         */
        getRecords() {
            return this.records;
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
                this.records.push(new Admin.Data.Record(record));
            }
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
            this.sorters = sorters;
            this.sorting = false;
        }
        /**
         * 데이터를 필터링한다.
         *
         * @param {Object} filters - 필터기준
         * @param {boolean} execute - 실제 필터링을 할지 여부
         */
        async filter(filters, execute = true) {
            if (execute === false) {
                this.filters = filters;
                return;
            }
            if (this.filtering == true) {
                return;
            }
            if (filters === null) {
                this.filters = null;
                return;
            }
            this.filtering = true;
            if (Object.keys(filters).length > 0) {
                const records = [];
                for (const record of this.originRecoreds) {
                    let passed = true;
                    for (const field in filters) {
                        const filter = filters[field];
                        const value = record.get(field) ?? null;
                        switch (filter.operator) {
                            case '=':
                                if (value !== filter.value) {
                                    passed = false;
                                }
                                break;
                            case '!=':
                                if (value === filter.value) {
                                    passed = false;
                                }
                                break;
                            case '>=':
                                if (value < filter.value) {
                                    passed = false;
                                }
                                break;
                            case '>':
                                if (value <= filter.value) {
                                    passed = false;
                                }
                                break;
                            case '<=':
                                if (value > filter.value) {
                                    passed = false;
                                }
                                break;
                            case '<':
                                if (value >= filter.value) {
                                    passed = false;
                                }
                                break;
                            case 'in':
                                if (Array.isArray(filter.value) == false ||
                                    Array.isArray(value) == true ||
                                    filter.value.includes(value) == false) {
                                    passed = false;
                                }
                                break;
                            case 'inset':
                                if (Array.isArray(value) == false ||
                                    Array.isArray(filter.value) == true ||
                                    value.includes(filter.value) == false) {
                                    passed = false;
                                }
                                break;
                            case 'like':
                                if (value.search(filter.value) == -1) {
                                    passed = false;
                                }
                                break;
                            case 'likecode':
                                const keycode = Format.keycode(filter.value);
                                const valuecode = Format.keycode(value);
                                if (valuecode.search(keycode) == -1) {
                                    passed = false;
                                }
                                break;
                            default:
                                passed = false;
                        }
                        if (passed == false) {
                            break;
                        }
                    }
                    if (passed == true) {
                        records.push(record);
                    }
                }
                this.records = records;
            }
            else {
                this.records = this.originRecoreds;
            }
            this.filters = filters;
            this.filtering = false;
        }
    }
    Admin.Data = Data;
    (function (Data) {
        class Record {
            data;
            /**
             * 데이터 레코드를 생성한다.
             *
             * @param {Object} data - 데이터
             */
            constructor(data) {
                this.data = data;
            }
            /**
             * 데이터를 가져온다.
             *
             * @param {string} key - 가져올 데이터키
             * @return {any} value
             */
            get(key) {
                return this.data[key] ?? null;
            }
            /**
             * 데이터의 모든 키값을 가져온다.
             *
             * @return {string[]} keys
             */
            getKeys() {
                return Object.keys(this.data);
            }
        }
        Data.Record = Record;
    })(Data = Admin.Data || (Admin.Data = {}));
})(Admin || (Admin = {}));
