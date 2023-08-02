<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈 컨텍스트 정보를 가져온다.
 *
 * @file /modules/admin/process/module.context.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 5. 30.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->isAdministrator() == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$module = Request::get('module', true);
$context = Request::get('context', true);
$mModule = Modules::get($module);

$results->success = true;
$results->fields = $mModule->getContextConfigsFields($context);
