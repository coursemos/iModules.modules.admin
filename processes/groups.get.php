<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 그룹 목록을 가져온다.
 *
 * @file /modules/admin/processes/groups.get.php
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

$type = Request::get('type') ?? 'tree';
$records = [];
$user = [
    'group_id' => 'user',
    'type' => 'user',
    'title' => $me->getText('admin.administrators.groups.types.user'),
    'administrators' => count(
        array_unique(
            array_merge(
                $me
                    ->db()
                    ->select(['member_id'])
                    ->from($me->table('administrators'))
                    ->get('member_id'),
                $me
                    ->db()
                    ->select(['member_id'])
                    ->from($me->table('group_administrators'))
                    ->get('member_id')
            )
        )
    ),
    'sort' => 0,
    'children' => [],
];
$group_ids = $me
    ->db()
    ->select(['group_id'])
    ->from($me->table('groups'))
    ->orderBy('title', 'ASC')
    ->get('group_id');
foreach ($group_ids as $group_id) {
    $group = $me->getAdminGroup($group_id);
    if ($group !== null) {
        $user['children'][] = $group->getJson();
    }
}
$records = [$user];

if ($type == 'user') {
    $results->success = true;
    $results->records = $user['children'];
    return;
}

$components = [
    'group_id' => 'component',
    'type' => 'component',
    'title' => $me->getText('admin.administrators.groups.types.component'),
    'administrators' => 0,
    'sort' => 1,
    'children' => [],
];
$components_member_ids = [];

foreach (Modules::all() as $module) {
    $modules = [
        'group_id' => 'component-module-' . $module->getName(),
        'type' => 'module',
        'title' => $module->getTitle(),
        'administrators' => 0,
        'sort' => 0,
        'children' => [],
    ];

    $modules_member_ids = [];
    foreach ($module->getAdmin()?->getGroups() ?? [] as $group) {
        $modules_member_ids = array_merge($modules_member_ids, $group->getAdministrators());
        $modules['children'][] = $group->getJson();
    }

    if (count($modules['children']) > 0) {
        $modules_member_ids = array_unique($modules_member_ids);
        $modules['administrators'] = count($modules_member_ids);
        $components['children'][] = $modules;

        $components_member_ids = array_merge($components_member_ids, $modules_member_ids);
    }
}

if (count($components['children']) > 0) {
    $components_member_ids = array_unique($components_member_ids);
    $components['administrators'] = count($components_member_ids);
    $records[] = $components;
}

$results->success = true;
$results->records = $records;
