<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 목록을 가져온다.
 *
 * @file /modules/admin/processes/administrators.get.php
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

$group_id = Request::get('group_id') ?? 'user';
$sorters = Request::getJson('sorters');
$start = Request::getInt('start') ?? 0;
$limit = Request::getInt('limit') ?? 50;
$keyword = Request::get('keyword');

$member_ids = [];

if ($group_id == 'user') {
    $group_member_ids = $me
        ->db()
        ->select(['member_id'])
        ->from($me->table('group_administrators'))
        ->get('member_id');

    $administrator_member_ids = $me
        ->db()
        ->select(['member_id'])
        ->from($me->table('administrators'))
        ->get('member_id');

    $member_ids = array_unique(array_merge($group_member_ids, $administrator_member_ids));
} elseif ($group_id == 'component') {
    $member_ids = [];
    foreach (\Modules::all() as $module) {
        foreach ($module->getAdmin()?->getGroups() ?? [] as $group) {
            $member_ids = array_merge($member_ids, $group->getAdministrators() ?? []);
        }
    }
    $member_ids = array_unique($member_ids);
} elseif (preg_match('/^component-(module|plugin|widget)-([^-]+)$/', $group_id, $matched) == true) {
    $member_ids = [];
    if ($matched[1] == 'module') {
        foreach (
            \Modules::get($matched[2])
                ?->getAdmin()
                ?->getGroups() ?? []
            as $group
        ) {
            $member_ids = array_merge($member_ids, $group->getAdministrators() ?? []);
        }
    }
    $member_ids = array_unique($member_ids);
} else {
    $group = $me->getAdminGroup($group_id);
    $member_ids = $group?->getAdministrators() ?? [];
}

if (count($member_ids) == 0) {
    $results->success = true;
    $results->records = [];
    return;
}

$results->member_ids = $member_ids;

/**
 * @var \modules\member\Member $mMember
 */
$mMember = Modules::get('member');

$records = $me
    ->db()
    ->select(['m.member_id', 'm.name', 'm.email', 'm.logged_at'])
    ->from($mMember->table('members'), 'm')
    ->join($me->table('administrators'), 'a', 'a.member_id=m.member_id', 'LEFT')
    ->where('m.member_id', $member_ids, 'IN');

if ($keyword !== null) {
    $records->where('(m.member_id = ? or m.name like ? or m.nickname like ? or m.email like ?)', [
        $keyword,
        '%' . $keyword . '%',
        '%' . $keyword . '%',
        '%' . $keyword . '%',
    ]);
}

$total = $records->copy()->count();
if ($sorters !== null) {
    foreach ($sorters as $field => $direction) {
        $records->orderBy('m.' . $field, $direction);
    }
}

$records = $records->limit($start, $limit)->get();

$results->q = $me->db()->getLastQuery();
foreach ($records as &$record) {
    $record = $me->getAdministrator($record->member_id)?->getJson() ?? null;
}

$results->success = true;
$results->records = array_filter($records);
$results->total = $total;
