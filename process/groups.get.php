<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 그룹 목록을 가져온다.
 *
 * @file /modules/admin/process/groups.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 7. 19.
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

$records = [
    [
        'group_id' => 'ALL',
        'title' => $me->getText('admin.administrators.groups.all'),
        'administrators' => $me
            ->db()
            ->select()
            ->from($me->table('administrators'))
            ->count(),
        'sort' => -1,
    ],
];

$sort = 0;
$groups = $me
    ->db()
    ->select()
    ->from($me->table('groups'))
    ->orderBy('title', 'ASC')
    ->get();
foreach ($groups as $sort => $group) {
    $group->sort = $sort;
    $records[] = $group;
}

$records[] = [
    'group_id' => 'EMPTY',
    'title' => $me->getText('admin.administrators.groups.ungrouped'),
    'administrators' => $me
        ->db()
        ->select()
        ->from($me->table('administrators'), 'a')
        ->join($me->table('administrator_groups'), 'ag', 'ag.member_id=a.member_id', 'LEFT')
        ->where('ag.group_id', null)
        ->count(),
    'sort' => ++$sort,
];

$results->success = true;
$results->records = $records;
