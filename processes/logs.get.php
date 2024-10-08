<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자접속기록을 가져온다.
 *
 * @file /modules/admin/processes/logs.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 8.
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

$start = Request::getInt('start') ?? 0;
$limit = Request::getInt('limit') ?? 50;
$keyword = Request::get('keyword');
$sorters = Request::getJson('sorters');
$filters = Request::getJson('filters');

/**
 * @var \modules\member\Member $mMember
 */
$mMember = Modules::get('member');
$records = $me
    ->db()
    ->select([
        'l.time',
        'l.member_id',
        'l.method',
        'l.component_type',
        'l.component_name',
        'l.url',
        'l.ip',
        'm.name',
        'm.email',
    ])
    ->from($me->table('logs'), 'l')
    ->join($mMember->table('members'), 'm', 'm.member_id=l.member_id', 'LEFT');

if ($filters !== null) {
    $records->setFilters($filters, 'AND', [
        'name' => 'm.member_id',
        'url' => 'l.method',
    ]);

    if (isset($filters->component) == true) {
        $records->where('(');
        foreach ($filters->component->value as $value) {
            $temp = explode('@', $value);
            if (count($temp) == 2) {
                $records->orWhere('(');
                $records->where('l.component_type', $temp[0]);
                $records->where('l.component_name', $temp[1]);
                $records->where(')');
            } else {
                $records->orWhere('l.component_type', $temp[0]);
            }
        }
        $records->where(')');
    }
}

$total = $records->copy()->count();
if ($sorters !== null) {
    foreach ($sorters as $field => $direction) {
        $records->orderBy('l.' . $field, $direction);
    }
}
$records = $records->limit($start, $limit)->get();
foreach ($records as &$record) {
    $component = Component::get($record->component_type, $record->component_name);
    $record->component = [
        'icon' => $component?->getIcon() ?? '',
        'title' => $component?->getTitle() ?? '',
    ];
    $record->photo = $mMember->getMemberPhoto($record->member_id);
}

$results->success = true;
$results->records = $records;
$results->total = $total;
