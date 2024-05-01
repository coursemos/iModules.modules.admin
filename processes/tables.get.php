<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 데이터베이스 테이블 목록을 가져온다.
 *
 * @file /modules/admin/processes/tables.get.php
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

iModules::session_stop();

/**
 * @var \modules\admin\admin\Admin $mAdmin
 */
$mAdmin = $me->getAdmin();

$used = [];

/**
 * 아이모듈코어에 정의된 테이블을 가져온다.
 */
$package = json_decode(file_get_contents(Configs::path() . '/package.json'));
$databases = (array) ($package?->databases ?? new stdClass());
foreach ($databases as $name => $scheme) {
    $used[iModules::table($name)] = new stdClass();
    $used[iModules::table($name)]->component = 'core';
    $used[iModules::table($name)]->scheme = $scheme;
}

/**
 * 설치된 모듈에 정의된 테이블을 가져온다.
 */
foreach (Modules::all() as $module) {
    $package = json_decode(file_get_contents($module->getPath() . '/package.json'));
    $databases = (array) ($package?->databases ?? new stdClass());
    foreach ($databases as $name => $scheme) {
        $used[$module->table($name)] = new stdClass();
        $used[$module->table($name)]->component = $module;
        $used[$module->table($name)]->scheme = $scheme;
    }
}

$mode = Request::get('mode') ?? 'list';
$records = $me->db()->tables();
foreach ($records as &$record) {
    $record->status = isset($used[$record->name]) == true ? 'USED' : 'UNKNOWN';
    if ($record->status == 'UNKNOWN') {
        $origin = preg_replace('/_BACKUP_[0-9\-_:]+$/', '', $record->name);
        if (isset($used[$origin]) == true) {
            $record->status = 'BACKUP';
        }
    }

    if ($mode == 'list' && $record->status == 'USED') {
        if ($me->db()->compare($record->name, $used[$record->name]->scheme) == false) {
            $record->status = 'NEED_UPDATE';
        }
    }
}

$results->success = true;
if ($mode == 'tree') {
    $results->records = [['name' => '@', 'children' => $records]];
} else {
    $results->records = $records;
}
