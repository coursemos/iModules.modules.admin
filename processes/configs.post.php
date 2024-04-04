<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 환경설정을 저장한다.
 *
 * @file /modules/admin/processes/configs.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 4. 5.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdministrator()?->isAdministrator() !== true) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$key = Input::get('key');
$value = Input::get('value');

$insert = [];
if ($key == 'color') {
    $insert = ['color' => $value ?? 'auto'];
}

if ($key == 'scale') {
    $insert = ['scale' => $value ?? 16];
}

if (count($insert) > 0) {
    $administrator = $me->getAdministrator();

    $me->db()
        ->update($me->table('administrators'), $insert)
        ->where('member_id', $administrator->getId())
        ->execute();
}

$results->success = true;
