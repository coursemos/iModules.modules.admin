<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 플러그인 정보를 가져온다.
 *
 * @file /modules/admin/processes/plugin.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 13.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('plugins') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$name = Request::get('name', true);
$plugin = Plugins::get($name);
if ($plugin === null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND_PLUGIN', ['plugin' => $name]);
    return;
}

$results->success = true;
$results->data = [
    'icon' => $plugin->getIcon(),
    'title' => $plugin->getTitle(),
    'version' => $plugin->getVersion(),
    'author' => $plugin->getPackage()->getAuthor(true),
    'homepage' => $plugin->getPackage()->getHomepage(true),
    'language' => $plugin->getPackage()->getLanguage(true),
    'hash' => $plugin->getPackage()->getHash(),
    'description' => $plugin->getPackage()->getDescription(),
    'properties' => $plugin->getPackageProperties(),
    'status' =>
        $plugin->isInstalled() == false
            ? 'NOT_INSTALLED'
            : ($plugin->getPackage()->getHash() != $plugin->getInstalled()->hash
                ? 'NEED_UPDATE'
                : 'INSTALLED'),
];
$results->fields = $plugin->getPackage()->getConfigsFields();
$results->configs = $plugin->getConfigs();
