<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그룹을 삭제한다.
 *
 * @file /modules/admin/processes/group.delete.php
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
$group = $me
    ->db()
    ->select()
    ->from($me->table('groups'))
    ->where('group_id', $group_id)
    ->getOne();
if ($group === null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND_DATA');
    return;
}

$me->db()
    ->delete($me->table('groups'))
    ->where('group_id', $group_id)
    ->execute();
$me->db()
    ->delete($me->table('group_administrators'))
    ->where('group_id', $group_id)
    ->execute();

$results->success = true;
