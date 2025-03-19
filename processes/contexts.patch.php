<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 컨텍스트를 변경사항을 저장한다.
 *
 * @file /modules/admin/processes/contexts.patch.php
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

$records = Input::get('records') ?? [];
foreach ($records as $record) {
    iModules::db()
        ->update(iModules::table('contexts'), (array) $record->updated)
        ->where('host', $record->origin->host)
        ->where('language', $record->origin->language)
        ->where('path', $record->origin->path)
        ->execute();
}

Cache::remove('contexts');

$results->success = true;
