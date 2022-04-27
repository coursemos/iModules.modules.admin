/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈 UI 를 처리하기 위한 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.js
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 4. 27.
 */
let Admin = {
	components:[],
	index:0,
	set:function(component) {
		this.components[component.id] = component;
	},
	get:function(id) {
		return this.components[id] ?? null;
	},
	getIndex:function() {
		return ++this.index;
	},
	ready:function(callback) {
		$(document).ready(callback);
	}
};