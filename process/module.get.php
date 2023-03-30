<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈 정보를 가져온다.
 *
 * @file /modules/admin/process/module.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 12.
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 * @var \modules\admin\Admin $mAdmin
 */
$mAdmin = Modules::get('admin');
if ($mAdmin->isAdmin() == false) {
    $results->success = false;
    $results->message = $mAdmin->getErrorText('FORBIDDEN');
    return;
}

$name = Request::get('name', true);
$module = Modules::get($name);

$properties = [];
if ($module->isGlobal() == true) {
    $properties[] = 'GLOBAL';
}
if ($module->isAdmin() == true) {
    $properties[] = 'ADMIN';
}
if ($module->isContext() == true) {
    $properties[] = 'CONTEXT';
}
if ($module->isWidget() == true) {
    $properties[] = 'WIDGET';
}
if ($module->isTheme() == true) {
    $properties[] = 'THEME';
}
if ($module->isCron() == true) {
    $properties[] = 'CRON';
}
if ($module->isConfigs() == true) {
    $properties[] = 'CONFIGS';
}

$results->success = true;
$results->data = [
    'icon' => $module->getIcon(),
    'title' => $module->getTitle(),
    'version' => $module->getVersion(),
    'author' => $module->getPackage()->getAuthor(true),
    'homepage' => $module->getPackage()->getHomepage(true),
    'language' => $module->getPackage()->getLanguage(true),
    'hash' => $module->getPackage()->getHash(),
    'description' => $module->getPackage()->getDescription(),
    'properties' => $properties,
    'status' =>
        $module->isInstalled() == false
            ? 'NOT_INSTALLED'
            : ($module->getPackage()->getHash() != $module->getInstalled()->hash
                ? 'NEED_UPDATE'
                : 'INSTALLED'),
];
$results->fields = $module->getPackage()->getConfigsFields();
