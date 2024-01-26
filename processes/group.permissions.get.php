<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그룹의 권한정보를 가져온다.
 *
 * @file /modules/admin/processes/group.permissions.get.php
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
if ($me->getAdmin()->checkPermission('administrators') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$group_ids = explode(',', Request::get('group_ids', true));

$permission = new \modules\admin\dtos\Permission();
foreach ($group_ids as $group_id) {
    $permission->addPermissions(
        $me
            ->getAdminGroup($group_id)
            ?->getPermission()
            ?->getPermissions() ?? false
    );
}

$results->success = true;
$results->permissions = $permission->getPermissions();
