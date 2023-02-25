/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 기본테마 - UI 처리
 *
 * @file /modules/admin/templates/default/scripts/script.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 2. 13.
 */
Admin.ready(() => {
    new Admin.Contexts.Panel().doLayout(Html.get('main > aside > nav'));
});
