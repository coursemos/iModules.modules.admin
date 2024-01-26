<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈의 컨텍스트를 가져온다.
 *
 * @file /modules/admin/processes/module.contexts.get.php
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
if ($me->getAdmin()->checkPermission('sitemap', ['contexts'], false) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$module = Request::get('module');
if ($module === null) {
    $records = [];
} else {
    $mModule = Modules::get($module);
    $records = $mModule->getContexts();
}

$results->success = true;
$results->records = $records;
