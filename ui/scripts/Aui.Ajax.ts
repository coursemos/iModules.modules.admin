/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈에서 사용되는 비동기호출 클래스를 정의한다.
 *
 * @file /scripts/Aui.Ajax.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 */
namespace Aui {
    export namespace Ajax {
        export interface Params {
            [key: string]: string | number;
        }

        export interface Data {
            [key: string]: any;
        }

        export interface Results {
            success: boolean;
            message?: string;
            total?: number;
            records?: any[];
            data?: Aui.Ajax.Data;
            [key: string]: any;
        }
    }

    export class Ajax {
        static fetchs: Map<string, Promise<Aui.Ajax.Results>> = new Map();

        /**
         * Fetch 요청의 UUID 값을 생성한다.
         *
         * @param {string} method - 요청방식
         * @param {string} url - 요청주소
         * @param {Aui.Ajax.Params} params - GET 데이터
         * @param {Aui.Ajax.Data} data - 전송할 데이터
         * @param {boolean|number} is_retry - 재시도여부
         * @return {string} uuid
         */
        static #uuid(
            method: string = 'GET',
            url: string,
            params: Aui.Ajax.Params = {},
            data: Aui.Ajax.Data = {},
            is_retry: boolean | number = true
        ): string {
            return Format.sha1(
                JSON.stringify({ method: method, url: url, params: params, data: data, is_retry: is_retry })
            );
        }

        /**
         * 짧은시간내에 동일한 Fetch 요청이 될 경우,
         * 제일 처음 요청된 Fetch 만 수행하고 응답된 데이터를 다른 중복요청한 곳으로 반환한다.
         *
         * @param {string} method - 요청방식
         * @param {string} url - 요청주소
         * @param {Aui.Ajax.Params} params - GET 데이터
         * @param {Aui.Ajax.Data} data - 전송할 데이터
         * @param {boolean|number} is_retry - 재시도여부
         * @return {Promise<Aui.Ajax.Results>} promise - 동일한 요청의 제일 첫번째 요청
         */
        static async #call(
            method: string = 'GET',
            url: string,
            params: Aui.Ajax.Params = {},
            data: Aui.Ajax.Data = {},
            is_retry: boolean | number = true
        ): Promise<Aui.Ajax.Results> {
            const uuid = Aui.Ajax.#uuid(method, url, params, data, is_retry);
            if (Aui.Ajax.fetchs.has(uuid) == true) {
                return Aui.Ajax.fetchs.get(uuid);
            }

            Aui.Ajax.fetchs.set(uuid, Aui.Ajax.#fetch(method, url, params, data, is_retry));
            return Aui.Ajax.fetchs.get(uuid);
        }

        /**
         * 실제 Fetch 함수를 실행한다.
         *
         * @param {string} method - 요청방식
         * @param {string} url - 요청주소
         * @param {Aui.Ajax.Params} params - GET 데이터
         * @param {Aui.Ajax.Data} data - 전송할 데이터
         * @param {boolean|number} is_retry - 재시도여부
         * @return {Promise<Aui.Ajax.Results>} results - 요청결과
         */
        static async #fetch(
            method: string = 'GET',
            url: string,
            params: Aui.Ajax.Params = {},
            data: Aui.Ajax.Data = {},
            is_retry: boolean | number = true
        ): Promise<Aui.Ajax.Results> {
            const uuid = Aui.Ajax.#uuid(method, url, params, data, is_retry);

            const requestUrl = new URL(url, location.origin);
            for (const name in params) {
                if (params[name] === null) {
                    requestUrl.searchParams.delete(name);
                } else {
                    requestUrl.searchParams.append(name, params[name].toString());
                }
            }
            url = requestUrl.toString();
            let retry = (is_retry === false ? 10 : is_retry) as number;

            try {
                const response: Response = (await fetch(url, {
                    // @todo DELETE 등 웹서버에서 지원하지 않을 경우 대체필요
                    method: method,
                    headers: {
                        'X-Method': method,
                        'Accept-Language': Aui.getLanguage(),
                        'Accept': 'application/json',
                        'Content-Type': 'application/json; charset=utf-8',
                    },
                    cache: 'no-store',
                    redirect: 'follow',
                    body: method == 'POST' || method == 'PUT' ? JSON.stringify(data) : null,
                }).catch((e) => {
                    Aui.Ajax.fetchs.delete(uuid);

                    if (retry <= 3) {
                        return Aui.Ajax.#call(method, url, params, data, ++retry);
                    } else {
                        Aui.Message.show({
                            icon: Aui.Message.ERROR,
                            title: Aui.getErrorText('TITLE'),
                            message: Aui.getErrorText('CONNECT_ERROR'),
                            buttons: Aui.Message.OK,
                            closable: true,
                        });

                        console.error(e);

                        return { success: false };
                    }
                })) as Response;

                const results: Aui.Ajax.Results = (await response.json()) as Aui.Ajax.Results;
                if (results.success == false && results.message !== undefined) {
                    Aui.Message.show({
                        icon: Aui.Message.ERROR,
                        title: Aui.getErrorText('TITLE'),
                        message: results.message,
                        buttons: Aui.Message.OK,
                        closable: true,
                    });
                }

                Aui.Ajax.fetchs.delete(uuid);

                return results;
            } catch (e) {
                Aui.Ajax.fetchs.delete(uuid);

                if (retry <= 3) {
                    return Aui.Ajax.#call(method, url, params, data, ++retry);
                } else {
                    Aui.Message.show({
                        icon: Aui.Message.ERROR,
                        title: Aui.getErrorText('TITLE'),
                        message: Aui.getErrorText('CONNECT_ERROR'),
                        buttons: Aui.Message.OK,
                        closable: true,
                    });

                    console.error(e);

                    return { success: false };
                }
            }
        }

        /**
         * GET 방식으로 데이터를 가져온다.
         *
         * @param {string} url - 요청주소
         * @param {Aui.Ajax.Params} params - GET 데이터
         * @param {boolean|number} is_retry - 재시도여부
         * @return {Promise<Aui.Ajax.Results>} results - 요청결과
         */
        static async get(
            url: string,
            params: Aui.Ajax.Params = {},
            is_retry: boolean | number = true
        ): Promise<Aui.Ajax.Results> {
            return Aui.Ajax.#call('GET', url, params, null, is_retry);
        }

        /**
         * POST 방식으로 데이터를 가져온다.
         * 전송할 데이터는 JSON 방식으로 전송된다.
         *
         * @param {string} url - 요청주소
         * @param {Aui.Ajax.Data} data - 전송할 데이터
         * @param {Aui.Ajax.Params} params - GET 데이터
         * @param {boolean|number} is_retry - 재시도여부
         * @return {Promise<Aui.Ajax.Results>} results - 요청결과
         */
        static async post(
            url: string,
            data: Aui.Ajax.Data = {},
            params: Aui.Ajax.Params = {},
            is_retry: boolean | number = true
        ): Promise<Aui.Ajax.Results> {
            return Aui.Ajax.#call('POST', url, params, data, is_retry);
        }

        /**
         * DELETE 방식으로 데이터를 가져온다.
         * 전송할 데이터는 JSON 방식으로 전송된다.
         *
         * @param {string} url - 요청주소
         * @param {Aui.Ajax.Params} params - GET 데이터
         * @param {boolean|number} is_retry - 재시도여부
         * @return {Promise<Aui.Ajax.Results>} results - 요청결과
         */
        static async delete(
            url: string,
            params: Aui.Ajax.Params = {},
            is_retry: boolean | number = true
        ): Promise<Aui.Ajax.Results> {
            return Aui.Ajax.#call('DELETE', url, params, null, is_retry);
        }
    }
}
