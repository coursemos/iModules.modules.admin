/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 데이터셋 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Data.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 5. 26.
 */
namespace Admin {
    export class Data {
        originRecoreds: Admin.Data.Record[] = [];
        records: Admin.Data.Record[] = [];
        types: { [key: string]: string } = {};

        /**
         * 데이터셋을 생성한다.
         *
         * @param {Object} datas - 데이터 [{key:value}]
         * @param {Object} types - 데이터유형 [{key:type}]
         */
        constructor(datas: { [key: string]: any }[], types: { [key: string]: string } = {}) {
            this.types = types;

            for (const data of datas) {
                for (const key in data) {
                    if (types[key] !== undefined) {
                    }

                    data[key] = data[key];
                }

                this.records.push(new Admin.Data.Record(data));
            }
            this.originRecoreds = this.records;
        }

        /**
         * 전체 데이터를 가져온다.
         *
         * @return {Admin.Data.Record[]} records - 데이터 레코드셋
         */
        getRecords(): Admin.Data.Record[] {
            return this.records;
        }

        /**
         * 데이터를 추가한다.
         *
         * @param {Object[]} records
         */
        add(datas: { [key: string]: any }[]): void {
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
         * @param {Object} sorters - 정렬기준
         */
        sort(sorters: { field: string; direction: string }[]): void {
            this.records.sort((left: Admin.Data.Record, right: Admin.Data.Record) => {
                for (const sorter of sorters) {
                    sorter.direction = sorter.direction.toUpperCase() == 'DESC' ? 'DESC' : 'ASC';
                    const leftValue = left.get(sorter.field);
                    const rightValue = right.get(sorter.field);

                    if (leftValue < rightValue) {
                        return sorter.direction == 'DESC' ? 1 : -1;
                    } else if (leftValue > rightValue) {
                        return sorter.direction == 'ASC' ? 1 : -1;
                    }
                }

                return 0;
            });
        }

        /**
         * 데이터를 필터링한다.
         *
         * @param {Object} filters - 필터기준
         */
        filter(filters: { [field: string]: { value: any; operator: string } }): void {
            if (Object.keys(filters).length > 0) {
                const records: Admin.Data.Record[] = [];
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
            } else {
                this.records = this.originRecoreds;
            }
        }
    }

    export namespace Data {
        export class Record {
            data: { [key: string]: any };

            /**
             * 데이터 레코드를 생성한다.
             *
             * @param {Object} data - 데이터
             */
            constructor(data: { [key: string]: any }) {
                this.data = data;
            }

            /**
             * 데이터를 가져온다.
             *
             * @param {string} key - 가져올 데이터키
             * @return {any} value
             */
            get(key: string): any {
                return this.data[key] ?? null;
            }

            /**
             * 데이터의 모든 키값을 가져온다.
             *
             * @return {string[]} keys
             */
            getKeys(): string[] {
                return Object.keys(this.data);
            }
        }
    }
}
