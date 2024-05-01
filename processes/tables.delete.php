<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 데이터베이스 테이블을 비우거나 삭제한다.
 *
 * @file /modules/admin/processes/tables.delete.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 4. 23.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('sitemap', ['database']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$mode = Request::get('mode', true);
$tables = Request::getJson('tables', true);
foreach ($tables as $table) {
    if ($mode == 'drop') {
        $me->db()->drop($table);
    } else {
        $me->db()->truncate($table);
    }
}

$results->success = true;
$results->tables = $tables;
