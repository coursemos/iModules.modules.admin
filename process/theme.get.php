<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트 테마 정보를 가져온다.
 *
 * @file /modules/admin/process/theme.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 20.
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 * @var \modules\admin\Admin $mAdmin
 */
$mAdmin = Modules::get('admin');
if ($mAdmin->checkPermission('/sites') == false) {
    $results->success = false;
    $results->message = $mAdmin->getErrorText('FORBIDDEN');
    return;
}

$name = Request::get('name', true);
$theme = new Theme((object) ['name' => $name]);
$results->success = true;
$results->theme = $name;

// @todo 실제 기존의 테마설정값을 가져온다.
$configs = null;
$results->fields = $theme->getPackage()->getConfigsFields($configs);
