<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 컨텍스트를 가져온다.
 *
 * @file /modules/admin/processes/contexts.get.php
 * @author sungjin <esung246@naddle.net>
 * @license MIT License
 * @modified 2025. 3. 19.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('sitemap', ['contexts']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

/**
 * @var \modules\admin\Admin\Admin $mAdmin
 */
$mAdmin = $me->getAdmin();

Cache::remove('contexts');
$host = Request::get('host', true);
$language = Request::get('language', true);
$site = Sites::get($host, $language);

$results->success = true;
$results->records = $mAdmin->getSitemapContexts($site);
