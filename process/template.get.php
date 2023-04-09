<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 템플릿 정보를 가져온다.
 *
 * @file /modules/admin/process/template.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 4. 7.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->checkPermission('/sites') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$targetType = Request::get('targetType', true);
$targetName = Request::get('targetName', true);

if ($targetType == 'module') {
    $component = Modules::get($targetName);
}

$name = Request::get('name', true);
$template = new Template($component, (object) ['name' => $name]);
$results->success = true;
$results->template = $name;

// @todo 실제 기존의 템플릿설정값을 가져온다.
$configs = null;
$results->fields = $template->getPackage()->getConfigsFields($configs);
