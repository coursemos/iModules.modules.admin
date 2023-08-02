<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 권한을 수정한다.
 *
 * @file /modules/admin/process/administrator.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 7. 17.
 *
 * @var \modules\admin\Admin $me
 * @var Input $input
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

$errors = [];
/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('administrators', 'edit') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$member_ids = $input->get('member_ids') ?? [];
if (is_array($member_ids) === false || count($member_ids) == 0) {
    $results->success = false;
    $results->message = $me->getText('admin.administrators.actions.unselected_members');
    return;
}

$group_ids = $input->get('group_ids') ?? [];
if (is_array($group_ids) === false) {
    $results->success = false;
    $results->message = $me->getErrorText('INVALID_DATA');
    return;
}

$mode = $input->get('mode') ?? 'permission';
if ($mode == 'permission') {
    $permissions = $input->get('master') ? true : [];
    if ($permissions !== true) {
        foreach ($input->all() as $key => $value) {
            if ($key == 'member_ids') {
                continue;
            }

            $temp = explode('-', $key);
            $component = $temp[0];
            $type = isset($temp[1]) == true ? $temp[1] : null;
            if (isset($permissions[$component]) == false) {
                $permissions[$component] = $type === null ? true : [];
            }
            if ($permissions[$component] === true) {
                continue;
            }

            $temp = explode('@', $type);
            $type = $temp[0];
            $permission = isset($temp[1]) == true ? $temp[1] : null;
            if (isset($permissions[$component][$type]) == false) {
                $permissions[$component][$type] = $permission === null ? true : [];
            }
            if ($permissions[$component][$type] === true) {
                continue;
            }
            $permissions[$component][$type][] = $permission;
        }

        if (count($permissions) == 0) {
            $permissions = false;
        }
    }
}

if ($mode == 'move_group') {
    $me->db()
        ->delete($me->table('administrator_groups'))
        ->where('member_id', $member_ids, 'IN')
        ->execute();
}

foreach ($member_ids as $member_id) {
    $administrator = $me->getAdministrator($member_id);

    if ($mode == 'permission') {
        $merged = $me->mergePermissions($administrator?->permissions ?? [], $permissions);

        $me->db()
            ->insert(
                $me->table('administrators'),
                ['member_id' => $member_id, 'permissions' => Format::toJson($merged)],
                ['permissions']
            )
            ->execute();

        $administrator = true;
    }

    if ($administrator === null) {
        continue;
    }

    foreach ($group_ids as $group_id) {
        if (
            $me
                ->db()
                ->select()
                ->from($me->table('administrator_groups'))
                ->where('member_id', $member_id)
                ->where('group_id', $group_id)
                ->has() == false
        ) {
            $me->db()
                ->insert($me->table('administrator_groups'), [
                    'member_id' => $member_id,
                    'group_id' => $group_id,
                    'assigned_at' => time(),
                ])
                ->execute();
        }
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
        ->from($me->table('administrator_groups'))
        ->where('group_id', $group->group_id)
        ->count();

    $me->db()
        ->update($me->table('groups'), ['administrators' => $administrators])
        ->where('group_id', $group->group_id)
        ->execute();
}

$results->success = true;
