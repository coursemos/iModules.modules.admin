<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트 테마 정보를 가져온다.
 *
 * @file /modules/admin/processes/theme.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

$name = Request::get('name', true);
$theme = new Theme((object) ['name' => $name]);
$results->success = true;
$results->theme = $name;

$configs = null;
$results->fields = $theme->getPackage()->getConfigsFields($configs);
$logo = $theme->getPackage()->get('logo');
if ($logo !== null) {
    $results->logo = new stdClass();
    $results->logo->width = $logo->width ?? null;
    $results->logo->height = $logo->height ?? null;
    $results->logo->message = $theme->getPackage()->getByLanguage('logo.message', $me->getLanguage());
} else {
    $results->logo = null;
}
