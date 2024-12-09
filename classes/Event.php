<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈의 이벤트를 정의한다.
 *
 * @file /modules/admin/classes/Event.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 11. 18.
 */
namespace modules\admin;
class Event extends \Event
{
    /**
     * 권한식 프리셋을 가져올 때 발생한다.
     *
     * @param array $permissions 현재 설정된 권한식 프리셋 목록
     * @param \modules\admin\admin\Admin $mAdmin 관리자 객체
     */
    public static function getPermissionPresets(array &$permissions, \modules\admin\admin\Admin $mAdmin): void
    {
    }

    /**
     * 어드민페이지가 열렸을 때
     */
    public static function beforeAdminLayout(): void
    {
    }
}
