<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그룹정보를 가져온다.
 *
 * @file /modules/admin/process/group.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 7. 17.
 *
 * @var \modules\admin\Admin $me
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

$group_id = Request::get('group_id', true);
$group = $me
    ->db()
    ->select()
    ->from($me->table('groups'))
    ->where('group_id', $group_id)
    ->getOne();
if ($group === null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND');
    return;
}

$data = new stdClass();
$data->title = $group->title;
$permissions = json_decode($group->permissions);
if ($permissions === true) {
    $data->master = true;
} else {
    foreach ($permissions as $component => $types) {
        if ($types === true) {
            $data->{$component} = true;
        } else {
            foreach ($types as $type => $values) {
                if ($values === true) {
                    $data->{$component . '-' . $type} = true;
                } else {
                    foreach ($values as $value) {
                        $data->{$component . '-' . $type . '@' . $value} = true;
                    }
                }
            }
        }
    }
}

$results->success = true;
$results->data = $data;
