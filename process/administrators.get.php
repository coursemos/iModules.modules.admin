<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 목록을 가져온다.
 *
 * @file /modules/admin/process/administrators.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 7. 18.
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

$group_id = Request::get('group_id') ?? 'ALL';
$sorters = Request::getJson('sorters');
$start = Request::getInt('start') ?? 0;
$limit = Request::getInt('limit') ?? 50;
$keyword = Request::get('keyword');

/**
 * @var \modules\member\Member $mMember
 */
$mMember = Modules::get('member');

$records = $me
    ->db()
    ->select(['m.member_id', 'm.name', 'm.email', 'm.logged_at'])
    ->from($me->table('administrators'), 'a')
    ->join($mMember->table('members'), 'm', 'm.member_id=a.member_id', 'LEFT');

if ($group_id != 'ALL') {
    $records->join($me->table('group_administrators'), 'ag', 'ag.member_id=a.member_id', 'LEFT');
    if ($group_id == 'EMPTY') {
        $records->where('ag.group_id', null);
    } else {
        $records->where('ag.group_id', $group_id);
    }
}

$total = $records->copy()->count();
if ($sorters !== null) {
    foreach ($sorters as $field => $direction) {
        $records->orderBy('m.' . $field, $direction);
    }
}

$records = $records->limit($start, $limit)->get();
foreach ($records as &$record) {
    $record->photo = $mMember->getMemberPhotoUrl($record->member_id);
    $administrator = $me->getAdministrator($record->member_id);
    $record->groups = $me
        ->db()
        ->select(['g.title'])
        ->from($me->table('group_administrators'), 'ag')
        ->join($me->table('groups'), 'g', 'g.group_id=ag.group_id', 'LEFT')
        ->where('ag.member_id', $record->member_id)
        ->get('title');
    $permissions = $administrator->permissions;
    if ($permissions === true) {
        $record->permissions = $permissions;
    } else {
        $record->permissions = [];
        foreach ($permissions as $component => $types) {
            $temp = explode('/', $component);
            $type = array_shift($temp);
            $name = implode('/', $temp);
            if ($type == 'module') {
                $component = Modules::get($name);
                $record->permissions[$component->getTitle()] = $types;
            }
        }
    }
}

$results->success = true;
$results->records = $records;
$results->total = $total;
