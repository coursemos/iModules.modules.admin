<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그룹정보를 가져온다.
 *
 * @file /modules/admin/processes/group.get.php
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
if ($me->getAdmin()->checkPermission('administrators') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$group_id = Request::get('group_id', true);
$group = $me->getAdminGroup($group_id);

if ($group === null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND');
    return;
}

$data = new stdClass();
$data->title = $group->getTitle();
$data->description = $group->getDescription();

if ($group->getPermission()->getPermissions() === true) {
    $data->master = true;
}

$results->success = true;
$results->data = $data;
$results->permissions = $group->getPermission()->getPermissions();
