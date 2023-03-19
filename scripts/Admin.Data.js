/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 데이터셋 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Data.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 1.
 */
var Admin;
(function (Admin) {
    class Data {
        records = [];
        types = {};
        /**
         * 데이터셋을 생성한다.
         *
         * @param {Object} datas - 데이터 [{key:value}]
         * @param {Object} types - 데이터유형 [{key:type}]
         */
        constructor(datas, types = {}) {
            this.types = types;
            for (const data of datas) {
                for (const key in data) {
                    if (types[key] !== undefined) {
                    }
                    data[key] = data[key];
                }
                this.records.push(new Admin.Data.Record(data));
            }
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
        add(datas) {
            for (const data of datas) {
                for (const key in data) {
                    if (this.types[key] !== undefined) {
                    }
                    data[key] = data[key];
                }
                this.records.push(new Admin.Data.Record(data));
            }
        }
        /**
         * 데이터를 정렬한다.
         *
         * @param {Object} sorters - 정렬기준 [{field:string, direction:(ASC|DESC)}, ...]
         */
        sort(sorters) {
            this.records.sort((left, right) => {
                for (const sorter of sorters) {
                    sorter.direction = sorter.direction.toUpperCase() == 'DESC' ? 'DESC' : 'ASC';
                    const leftValue = left.get(sorter.field);
                    const rightValue = right.get(sorter.field);
                    if (leftValue < rightValue) {
                        return sorter.direction == 'DESC' ? 1 : -1;
                    }
                    else if (leftValue > rightValue) {
                        return sorter.direction == 'ASC' ? 1 : -1;
                    }
                }
                return 0;
            });
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
