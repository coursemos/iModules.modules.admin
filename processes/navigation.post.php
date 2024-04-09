<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 네비게이션을 저장한다.
 *
 * @file /modules/admin/processes/navigation.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 4. 9.
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

$contexts = json_encode(Input::get('contexts'));

$results->success = $me->getAdministrator()->update(['navigation' => $contexts]);
$results->contexts = Input::get('contexts');
