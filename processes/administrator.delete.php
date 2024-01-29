<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자를 삭제하거나, 그룹에서 제외한다.
 *
 * @file /modules/admin/processes/administrator.delete.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 29.
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

$member_ids = Request::get('member_ids', true);
$member_ids = explode(',', $member_ids);
$group_id = Request::get('group_id');

/**
 * @var \modules\admin\admin\Admin $mAdmin
 */
$mAdmin = $me->getAdmin();

foreach ($member_ids as $member_id) {
    $groups = $me
        ->db()
        ->select(['group_id'])
        ->from($me->table('group_administrators'))
        ->where('member_id', $member_id);
    if ($group_id === null) {
        $group_ids = $groups->get('group_id');
    } else {
        $group_ids = $groups->where('group_id', $group_id)->get('group_id');
    }

    foreach ($group_ids as $id) {
        $me->db()
            ->delete($me->table('group_administrators'))
            ->where('member_id', $member_id)
            ->where('group_id', $id)
            ->execute();
        $mAdmin->updateGroup($id);
    }

    if ($group_id === null) {
        $me->db()
            ->delete($me->table('administrators'))
            ->where('member_id', $member_id)
            ->execute();
    }
}

$results->success = true;
