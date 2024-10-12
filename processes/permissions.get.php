<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 권한 프리셋을 가져온다.
 *
 * @file /modules/admin/processes/permissions.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 12.
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

/**
 * @var \modules\admin\admin\Admin $mAdmin
 */
$mAdmin = $me->getAdmin();

$results->success = true;
$results->records = $mAdmin->getPermissionPresets();
