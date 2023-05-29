<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트 정보를 가져온다.
 *
 * @file /modules/admin/process/site.get.php
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
if ($me->hasPermission() == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$host = Request::get('host', true);
$language = Request::get('language', true);
$domain = iModules::db()
    ->select()
    ->from(iModules::table('domains'))
    ->where('host', $host)
    ->getOne();
$site = iModules::db()
    ->select()
    ->from(iModules::table('sites'))
    ->where('host', $host)
    ->where('language', $language)
    ->getOne();

if ($domain === null || $site === null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND');
    return;
}

$site->theme = json_decode($site->theme);
$site->is_default = $domain->language == $site->language;
$site->logos = json_decode($site->logos ?? 'null') ?? new stdClass();

$results->success = true;
$results->data = $site;
