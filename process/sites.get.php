<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트 목록을 가져온다.
 *
 * @file /modules/admin/process/sites.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 3.
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

$host = Request::get('host', true);
$sites = Domains::has($host)?->getSites() ?? [];

$records = [];
foreach ($sites as $site) {
    $record = new stdClass();
    $record->host = $site->getHost();
    $record->language = $site->getLanguage();
    $record->title = $site->getTitle();

    $records[] = $record;
}

$results->success = true;
$results->records = $records;
