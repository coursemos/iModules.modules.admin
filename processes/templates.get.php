<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 템플릿 목록을 가져온다.
 *
 * @file /modules/admin/processes/templates.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

$componentType = Request::get('componentType', true);
$componentName = Request::get('componentName', true);
$use_default = Request::get('use_default') === 'true';

if ($componentType == 'module') {
    $component = Modules::get($componentName);
}

/**
 * @var Template[] $templates
 */
$templates = [];
$names = File::getDirectoryItems($component->getPath() . '/templates', 'directory', false);
foreach ($names as $name) {
    $templates[] = new Template($component, (object) ['name' => basename($name)]);
}

/**
 * 사이트테마는 모듈의 템플릿을 가지고 있을 수 있으므로, 사이트테마 폴더에서 템플릿을 검색한다.
 */
$themes = File::getDirectoryItems(Configs::path() . '/themes', 'directory', false);
foreach ($themes as $name) {
    $theme = basename($name);
    $names = File::getDirectoryItems(
        $name . '/' . $component->getType() . 's/' . $component->getName(),
        'directory',
        false
    );
    foreach ($names as $name) {
        $templates[] = new Template($component, (object) ['name' => '/' . $theme . '/' . basename($name)]);
    }
}

$modules = Modules::all();
foreach ($modules as $module) {
    if ($module->hasPackageProperty('THEME') == true) {
        $themes = File::getDirectoryItems($module->getPath() . '/themes', 'directory', false);
        foreach ($themes as $name) {
            $theme = basename($name);
            $names = File::getDirectoryItems(
                $name . '/' . $component->getType() . 's/' . $component->getName(),
                'directory',
                false
            );
            foreach ($names as $name) {
                $templates[] = new Template(
                    $component,
                    (object) ['name' => '/modules/' . $module->getName() . '/' . $theme . '/' . basename($name)]
                );
            }
        }
    }
}

$records = [];
if ($use_default === true) {
    $records[] = [
        'name' => '#',
        'title' => $me->getText('components.form.use_default_template'),
        'dir' => $me->getText('components.form.use_default_template_help'),
        'screenshot' => $me->getDir() . '/images/noimage.png',
    ];
}
foreach ($templates as $template) {
    $records[] = [
        'name' => $template->getPathName(),
        'title' => $template->getTitle(),
        'dir' => $template->getBase(),
        'screenshot' => $template->getScreenshot() ?? $me->getDir() . '/images/noimage.png',
    ];
}

$results->success = true;
$results->records = $records;
