<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 플러그인목록을 가져온다.
 *
 * @file /modules/admin/processes/plugins.get.php
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
if ($me->getAdmin()->checkPermission('plugins', ['configs']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$plugins = Plugins::all(false);

$records = [];
foreach ($plugins as $plugin) {
    $records[] = [
        'name' => $plugin->getName(),
        'icon' => $plugin->getIcon(),
        'title' => $plugin->getTitle(),
        'version' => $plugin->getVersion(),
        'description' => $plugin->getPackage()->getDescription(),
        'author' => $plugin->getPackage()->getAuthor(),
        'properties' => $plugin->getPackageProperties(),
        'status' =>
            $plugin->isInstalled() == false
                ? 'NOT_INSTALLED'
                : ($plugin->isUpdatable() == true
                    ? 'NEED_UPDATE'
                    : 'INSTALLED'),
        'databases' => $plugin->getInstalled()?->databases ?? 0,
        'attachments' => $plugin->getInstalled()?->attachments ?? 0,
    ];
}

$results->success = true;
$results->records = $records;
