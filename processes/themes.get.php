<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트 테마목록을 가져온다.
 *
 * @file /modules/admin/processes/themes.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 4. 5.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

$category = Request::get('category') ?? 'website';

/**
 * @var Theme[] $themes
 */
$themes = [];

/**
 * 기본 테마 경로를 탐색한다.
 */
$names = File::getDirectoryItems(Configs::path() . '/themes', 'directory', false);
foreach ($names as $name) {
    if (is_file($name . '/package.json') == true) {
        $themes[] = new Theme((object) ['name' => basename($name)]);
    }
}

/**
 * 테마를 가진 모듈의 테마 경로를 탐색한다.
 */
$modules = Modules::all();
foreach ($modules as $module) {
    if ($module->hasPackageProperty('THEME') == true) {
        $names = File::getDirectoryItems($module->getPath() . '/themes', 'directory', false);
        foreach ($names as $name) {
            if (is_file($name . '/package.json') == true) {
                $themes[] = new Theme((object) ['name' => '/modules/' . $module->getName() . '/' . basename($name)]);
            }
        }
    }
}

$records = [];
foreach ($themes as $theme) {
    if ($category == $theme->getCategory()) {
        $records[] = [
            'name' => $theme->getPathName(),
            'title' => $theme->getTitle(),
            'dir' => $theme->getBase(),
            'screenshot' => $theme->getScreenshot() ?? $me->getDir() . '/images/noimage.png',
        ];
    }
}

$results->success = true;
$results->records = $records;
