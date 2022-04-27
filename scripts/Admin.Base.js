/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈에서 사용되는 기본객체의 공통 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Base.js
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 4. 27.
 */
Admin.Base = class {
	/**
	 * 객체 아이디
	 */
	id = null
	
	/**
	 * 객체 이벤트리스너
	 */
	listeners = {}
	
	/**
	 * 객체를 생성하고, Admin 객체에 등록한다.
	 *
	 * @param ?object configs 객체설정
	 */
	constructor(configs) {
		this.id = configs?.id ?? "Admin-" + Admin.getIndex();
		Admin.set(this);
	}
	
	/**
	 * 현재 객체의 ID 를 가져온다.
	 *
	 * @return string id
	 */
	getId() {
		return this.id;
	}
	
	/**
	 * 객체의 이벤트를 등록한다.
	 *
	 * @param string name 이벤트명
	 * @param function handler 이벤트핸들러
	 * @param ?array params 이벤트리스너에 전달될 변수
	 */
	addEvent(name,handler,params) {
		if (this.listeners[name] === undefined) {
			this.listeners[name] = [];
		}
		
		this.listeners[name].push({handler:handler,params:params ?? []});
	}
}