<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 요청된 경로의 폴더구조를 가져온다.
 *
 * @file /modules/admin/process/explorer.get.php
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

$path = Request::get('path', true);
$items = File::getDirectoryItems(Configs::path() . $path);
$records = [];
foreach ($items as $item) {
    $record = new stdClass();
    $record->type = is_dir($item) == true ? 'DIR' : 'FILE';
    $record->name = preg_replace('/^' . Format::reg(Configs::path()) . '/', '', $item);
    $record->basename = basename($item);
    $records[] = $record;
}

usort($records, function ($left, $right) {
    if ($left->type != $right->type) {
        return $left->type == 'DIR' ? -1 : 1;
    } else {
        return $left->basename <=> $right->basename;
    }
});

$results->success = true;
$results->records = $records;
