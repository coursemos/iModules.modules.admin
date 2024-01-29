<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 정보를 가져온다.
 *
 * @file /modules/admin/processes/administrator.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('administrators', ['edit']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$member_id = Request::get('member_id', true);
$administrator = $me->getAdmin()->getAdministrator($member_id);
if ($administrator == null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND_DATA');
    return;
}

$permission = new \modules\admin\dtos\Permission();

$results->success = true;
$results->groups = [];
foreach ($administrator->getGroups() as $group) {
    $results->groups[] = $group->getGroup()->getJson();
    $permission->addPermissions(
        $group
            ->getGroup()
            ->getPermission()
            ->getPermissions()
    );
}

$results->member_id = $administrator->getId();
$results->permissions = $administrator->getPermission()->getPermissions();
$results->group_permissions = $permission->getPermissions();
