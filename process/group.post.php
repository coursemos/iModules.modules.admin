<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그룹정보를 저장한다.
 *
 * @file /modules/admin/process/group.post.php
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

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('administrators', 'edit') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$group_id = Request::get('group_id');
$errors = [];
$title = $input->get('title', $errors);
if ($title !== null) {
    $checked = $me
        ->db()
        ->select()
        ->from($me->table('groups'))
        ->where('title', $title);
    if ($group_id !== null) {
        $checked->where('group_id', $group_id, '!=');
    }
    if ($checked->has() == true) {
        $errors['title'] = $me->getErrorText('DUPLICATED');
    }
}

$permissions = $input->get('master') ? true : [];
if ($permissions !== true) {
    foreach ($input->all() as $key => $value) {
        if (in_array($key, ['group_id', 'title']) == true) {
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
        $results->success = false;
        $results->message = $me->getText('admin.administrators.actions.unselected_permissions');
        return;
    }
}

if (count($errors) == 0) {
    $group_id ??= UUID::v1($title);
    $me->db()
        ->insert(
            $me->table('groups'),
            ['group_id' => $group_id, 'title' => $title, 'permissions' => Format::toJson($permissions)],
            ['title', 'permissions']
        )
        ->execute();

    $results->success = true;
    $results->group_id = $group_id;
} else {
    $results->success = false;
    $results->errors = $errors;
}
