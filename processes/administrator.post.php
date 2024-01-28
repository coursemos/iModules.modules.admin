<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 권한을 수정한다.
 *
 * @file /modules/admin/processes/administrator.post.php
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

$errors = [];

$member_ids = Input::get('member_ids') ?? [];
if (is_array($member_ids) === false || count($member_ids) == 0) {
    $results->success = false;
    $results->message = $me->getText('admin.administrators.lists.actions.unselected_members');
    return;
}

$group_ids = Input::get('group_ids') ?? [];
if (is_array($group_ids) === false) {
    $results->success = false;
    $results->message = $me->getErrorText('INVALID_DATA');
    return;
}

$mode = Input::get('mode') ?? 'permission';
$permission = new \modules\admin\dtos\Permission();
if ($mode == 'permission') {
    if (Input::get('master')) {
        $permission->setMaster();
    }

    foreach (Input::all() as $key => $value) {
        if (in_array($key, ['mode', 'member_ids', 'group_ids']) == true) {
            continue;
        }

        $permission->addScopeCode($key);
    }
}

if ($mode == 'move_group') {
    $me->db()
        ->delete($me->table('group_administrators'))
        ->where('member_id', $member_ids, 'IN')
        ->execute();
}

foreach ($member_ids as $member_id) {
    $administrator = $me->getAdministrator($member_id);
    if ($administrator !== null) {
        foreach ($group_ids as $group_id) {
            if (
                $me
                    ->db()
                    ->select()
                    ->from($me->table('group_administrators'))
                    ->where('member_id', $member_id)
                    ->where('group_id', $group_id)
                    ->has() == false
            ) {
                $me->db()
                    ->insert($me->table('group_administrators'), [
                        'member_id' => $member_id,
                        'group_id' => $group_id,
                        'assigned_at' => time(),
                    ])
                    ->execute();
            }
        }
    }

    if ($mode == 'permission') {
        $administrator = $me->getAdministrator($member_id, true);
        $permission = $administrator->updatePermissions($permission);

        $me->db()
            ->insert(
                $me->table('administrators'),
                ['member_id' => $member_id, 'permissions' => Format::toJson($permission->getPermissions())],
                ['permissions']
            )
            ->execute();
    }
}

$groups = $me
    ->db()
    ->select()
    ->from($me->table('groups'))
    ->get();
foreach ($groups as $group) {
    $administrators = $me
        ->db()
        ->select()
        ->from($me->table('group_administrators'))
        ->where('group_id', $group->group_id)
        ->count();

    $me->db()
        ->update($me->table('groups'), ['administrators' => $administrators])
        ->where('group_id', $group->group_id)
        ->execute();
}

$results->success = true;
