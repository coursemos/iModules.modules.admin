<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 네비게이션을 가져온다.
 *
 * @file /modules/admin/processes/navigation.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 8. 25.
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

$results->success = true;
$results->contexts = $me->getAdministrator()?->getNavigation();
