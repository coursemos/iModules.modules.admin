/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자를 사용하는 컴포넌트의 관리자 클래스 공통요소를 정의한다.
 *
 * @file /modules/admin/admin/scripts/Component.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 22.
 */
var modules;
(function (modules) {
    let admin;
    (function (admin_1) {
        let admin;
        (function (admin) {
            class Component {
                type;
                name;
                /**
                 * 관리자 인터페이스 클래스를 정의한다.
                 *
                 * @param {string} type - 컴포넌트타입 (module, plugin, widget)
                 * @param {string} name - 컴포넌트명
                 */
                constructor(type, name) {
                    this.type = type;
                    this.name = name;
                }
                /**
                 * 컴포넌트타입을 가져온다.
                 *
                 * @return {string} type - 컴포넌트타입(module, plugin, widget)
                 */
                getType() {
                    return this.type;
                }
                /**
                 * 컴포넌트명을 가져온다.
                 *
                 * @return {string} name - 컴포넌트명
                 */
                getName() {
                    return this.name;
                }
                /**
                 * 언어팩을 불러온다.
                 *
                 * @param {string} text - 언어팩코드
                 * @param {Object} placeHolder - 치환자
                 * @return {promise<string>} message 치환된 메시지
                 */
                async getText(text, placeHolder = null) {
                    const paths = ['/' + this.type + '/' + this.name + '/language', '/languages'];
                    return Language.getText(text, placeHolder, paths);
                }
                /**
                 * 언어팩 객체를 불러온다.
                 *
                 * @param {string} key - 언어팩키
                 * @return {Promise<object>} message 치환된 메시지
                 */
                async getTexts(key) {
                    const paths = ['/' + this.type + '/' + this.name + '/language', '/languages'];
                    return Language.getTexts(key, paths);
                }
                /**
                 * 에러메시지를 불러온다.
                 *
                 * @param {string} error - 에러코드
                 * @param {Object} placeHolder - 치환자
                 * @return {string} message 치환된 메시지
                 */
                async getErrorText(error, placeHolder = null) {
                    const paths = ['/' + this.type + '/' + this.name + '/language', '/languages'];
                    return Language.getErrorText(error, placeHolder, paths);
                }
                /**
                 * 언어팩을 출력한다.
                 * 언어팩을 비동기방식으로 가져오기때문에 치환자를 먼저 반환하고, 언어팩이 로딩완료되면 언어팩으로 대치한다.
                 *
                 * @param {string} text - 언어팩코드
                 * @param {Object} placeHolder - 치환자
                 * @return {string} message - 치환된 메시지
                 */
                printText(text, placeHolder = null) {
                    const paths = ['/' + this.type + '/' + this.name + '/language', '/languages'];
                    return Language.printText(text, placeHolder, paths);
                }
                /**
                 * 에러메시지를 출력한다.
                 * 언어팩을 비동기방식으로 가져오기때문에 치환자를 먼저 반환하고, 언어팩이 로딩완료되면 언어팩으로 대치한다.
                 *
                 * @param {string} error - 에러코드
                 * @param {Object} placeHolder - 치환자
                 * @return {string} message - 치환된 메시지
                 */
                printErrorText(error, placeHolder = null) {
                    const paths = ['/' + this.type + '/' + this.name + '/language', '/languages'];
                    return Language.printErrorText(error, placeHolder, paths);
                }
                /**
                 * 관리자 인터페이스를 구성하는 요소의 기본 상대경로를 가져온다.
                 *
                 * @return {string} baseUrl
                 */
                getBase() {
                    return Html.get('body').getAttr('data-base') + '/' + this.type + 's/' + this.name;
                }
                /**
                 * 관리자 인터페이스를 구성하는 요소의 관리자 상대경로를 가져온다.
                 *
                 * @return {string} adminUrl
                 */
                getAdmin() {
                    return this.getBase() + '/admin';
                }
                /**
                 * 관리자 인터페이스를 구성하는 요소의 프로세스 URL 경로를 가져온다.
                 *
                 * @param {string} path - 요청주소
                 * @return {string} processUrl
                 */
                getProcessUrl(path) {
                    return globalThis.Admin.getProcessUrl(this.type, this.name, path);
                }
                /**
                 * 사용자정의 환경설정 폼을 가져온다.
                 * 각 컴포넌트 관리자 클래스에서 재정의한다.
                 *
                 * @return {Aui.Form.Panel} configsForm - 설정폼
                 */
                async getConfigsForm() {
                    return null;
                }
            }
            admin.Component = Component;
        })(admin = admin_1.admin || (admin_1.admin = {}));
    })(admin = modules.admin || (modules.admin = {}));
})(modules || (modules = {}));
