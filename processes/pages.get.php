<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트 테마의 페이지 목록을 가져온다.
 *
 * @file /modules/admin/processes/pages.get.php
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
$theme = $site->getTheme();

$records = [];
$pages = File::getDirectoryItems($theme->getPath() . '/pages', 'file');
foreach ($pages as $page) {
    if (preg_match('/\.html$/', $page) == true) {
        $record = new stdClass();
        $record->name = preg_replace('/\.html$/', '', basename($page));
        $record->preview = Router::get('/preview/page')->getSubUrl('/page', [
            'host' => $host,
            'language' => $language,
            'page' => $record->name,
        ]);
        $records[] = $record;
    }
}

$results->success = true;
$results->records = $records;
