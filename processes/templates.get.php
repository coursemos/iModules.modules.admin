<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 템플릿 목록을 가져온다.
 *
 * @file /modules/admin/processes/templates.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 4. 5.
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

/**
 * 해당 컴포넌트의 기본 템플릿 경로를 탐색한다.
 */
$path = $component->getPath() . '/templates';
if (is_dir($path) == true) {
    $names = File::getDirectoryItems($path, 'directory', false);
    foreach ($names as $name) {
        if (is_file($name . '/package.json') == true) {
            $templates[] = new Template($component, (object) ['name' => basename($name)]);
        }
    }
}

/**
 * 사이트테마는 컴포넌트의 템플릿을 가질 수 있으므로,
 * 해당 경로에서 템플릿을 탐색한다.
 */
$themes = File::getDirectoryItems(Configs::path() . '/themes', 'directory', false);
foreach ($themes as $name) {
    $theme = basename($name);

    $names = [];
    if ($componentType == 'module') {
        $path = $name . '/' . $component->getType() . 's/' . $component->getName() . '/templates';
        if (is_dir($path) == true) {
            $names = File::getDirectoryItems($path, 'directory', false);
        }
    }

    foreach ($names as $name) {
        if (is_file($name . '/package.json') == true) {
            $templates[] = new Template($component, (object) ['name' => '/' . $theme . '/' . basename($name)]);
        }
    }
}

/**
 * 모듈은 사이트테마를 가질 수 있고, 사이트테마는 컴포넌트의 템플릿을 가질 수 있으므로,
 * 해당 경로에서 템플릿을 탐색한다.
 */
$modules = Modules::all();
foreach ($modules as $module) {
    if ($module->hasPackageProperty('THEME') == true) {
        $themes = File::getDirectoryItems($module->getPath() . '/themes', 'directory', false);
        foreach ($themes as $name) {
            $theme = basename($name);

            $names = [];
            if ($componentType == 'module') {
                $path = $name . '/' . $component->getType() . 's/' . $component->getName() . '/templates';
                if (is_dir($path) == true) {
                    $names = File::getDirectoryItems($path, 'directory', false);
                }
            }

            foreach ($names as $name) {
                if (is_file($name . '/package.json') == true) {
                    $templates[] = new Template(
                        $component,
                        (object) ['name' => '/modules/' . $module->getName() . '/' . $theme . '/' . basename($name)]
                    );
                }
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
