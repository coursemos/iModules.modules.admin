<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈의 이벤트를 정의한다.
 *
 * @file /modules/admin/classes/Admin.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 12.
 */
namespace modules\admin;
class Event extends \Listeners
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
}
