<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트 테마의 레이아웃 목록을 가져온다.
 *
 * @file /modules/admin/processes/layouts.get.php
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

$host = Request::get('host', true);
$language = Request::get('language', true);
$site = Sites::get($host, $language);
$package = $site->getTheme()->getPackage();

$layouts = $package->get('layouts') ?? [];
$records = [];
foreach ($layouts as $name => $title) {
    $record = new stdClass();
    $record->name = $name;
    $record->title = $package->getByLanguage('layouts.' . $name) . ' (' . $name . ')';

    $records[] = $record;
}
$results->success = true;
$results->records = $records;
