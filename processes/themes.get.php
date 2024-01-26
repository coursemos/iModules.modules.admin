<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트 테마목록을 가져온다.
 *
 * @file /modules/admin/processes/themes.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * @var Theme[] $themes
 */
$themes = [];
$names = File::getDirectoryItems(Configs::path() . '/themes', 'directory', false);
foreach ($names as $name) {
    $themes[] = new Theme((object) ['name' => basename($name)]);
}

$modules = Modules::all();
foreach ($modules as $module) {
    if ($module->hasPackageProperty('THEME') == true) {
        $names = File::getDirectoryItems($module->getPath() . '/themes', 'directory', false);
        foreach ($names as $name) {
            $themes[] = new Theme((object) ['name' => '/modules/' . $module->getName() . '/' . basename($name)]);
        }
    }
}

$records = [];
foreach ($themes as $theme) {
    $records[] = [
        'name' => $theme->getPathName(),
        'title' => $theme->getTitle(),
        'dir' => $theme->getBase(),
        'screenshot' => $theme->getScreenshot() ?? $me->getDir() . '/images/noimage.png',
    ];
}

$results->success = true;
$results->records = $records;
