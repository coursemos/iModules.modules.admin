<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그룹의 권한정보를 가져온다.
 *
 * @file /modules/admin/process/group.permissions.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 8. 1.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('administrators', 'edit') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$group_ids = explode(',', Request::get('group_ids', true));
$groups = $me
    ->db()
    ->select()
    ->from($me->table('groups'))
    ->where('group_id', $group_ids, 'IN')
    ->get();
if (count($groups) == 0) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND');
    return;
}

$permissions = [];
foreach ($groups as $group) {
    $permissions = $me->mergePermissions($permissions, json_decode($group->permissions, true));
}

$results->success = true;
$results->permissions = $permissions;
