/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 기본 뷰포트를 생성한다.
 *
 * @file /modules/admin/scripts/script.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 2. 14.
 */
window.onload = () => {
    new Admin.Viewport.Panel({
        id: 'Admin-Viewport',
        navigation: new Admin.Viewport.Navigation.Panel({
            id: this.id + '-Navigation',
            getUrl: Admin.getProcessUrl('module', 'admin', 'contexts'),
            saveUrl: Admin.getProcessUrl('module', 'admin', 'contexts'),
        }),
    }).doLayout();
};
