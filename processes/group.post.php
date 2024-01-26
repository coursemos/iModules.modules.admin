<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그룹정보를 저장한다.
 *
 * @file /modules/admin/processes/group.post.php
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

$group_id = Request::get('group_id');
$errors = [];
$title = Input::get('title', $errors);
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

$permission = new \modules\admin\dtos\Permission();
if (Input::get('master')) {
    $permission->setMaster();
}

foreach (Input::all() as $key => $value) {
    if (in_array($key, ['group_id', 'title']) == true) {
        continue;
    }

    $permission->addScopeCode($key);
}

if ($permission->getPermissions() === false) {
    $results->success = false;
    $results->message = $me->getText('admin.administrators.lists.actions.unselected_permissions');
    return;
}

if (count($errors) == 0) {
    $group_id ??= UUID::v1($title);
    $me->db()
        ->insert(
            $me->table('groups'),
            [
                'group_id' => $group_id,
                'title' => $title,
                'permissions' => Format::toJson($permission->getPermissions()),
            ],
            ['title', 'permissions']
        )
        ->execute();

    $results->success = true;
    $results->group_id = $group_id;
} else {
    $results->success = false;
    $results->errors = $errors;
}
