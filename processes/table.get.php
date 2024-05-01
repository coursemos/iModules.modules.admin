<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 데이터베이스 테이블 정보를 가져온다.
 *
 * @file /modules/admin/processes/table.get.php
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

$table = Request::get('table', true);

/**
 * @var \modules\admin\admin\Admin $mAdmin
 */
$mAdmin = $me->getAdmin();

$results->success = true;
$results->columns = $me->db()->columns($table);
$results->indexes = $me->db()->indexes($table);
$results->scheme = $mAdmin->findScheme($table);
$results->need_update = $results->scheme === null ? false : $me->db()->compare($table, $results->scheme) !== true;
