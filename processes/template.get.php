<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 템플릿 정보를 가져온다.
 *
 * @file /modules/admin/processes/template.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

$componentType = Request::get('componentType', true);
$componentName = Request::get('componentName', true);

if ($componentType == 'module') {
    $component = Modules::get($componentName);
}

$name = Request::get('name', true);
$template = new Template($component, (object) ['name' => $name]);
$results->success = true;
$results->template = $name;
$results->fields = $template->getPackage()->getConfigsFields();
