<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈목록을 가져온다.
 *
 * @file /modules/admin/processes/modules.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 4. 19.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if (
    $me->getAdmin()->checkPermission('modules', ['configs']) == false &&
    $me->getAdmin()->checkPermission('sitemap', ['contexts']) == false
) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$modules = Modules::all(false);

$records = [];
foreach ($modules as $module) {
    $records[] = [
        'name' => $module->getName(),
        'icon' => $module->getIcon(),
        'title' => $module->getTitle(),
        'version' => $module->getVersion(),
        'description' => $module->getPackage()->getDescription(),
        'author' => $module->getPackage()->getAuthor(),
        'properties' => $module->getPackageProperties(),
        'status' =>
            $module->isInstalled() == false
                ? 'NOT_INSTALLED'
                : ($module->getPackage()->getHash() != $module->getInstalled()->hash
                    ? 'NEED_UPDATE'
                    : 'INSTALLED'),
        'databases' => $module->getInstalled()?->databases ?? 0,
        'attachments' => $module->getInstalled()?->attachments ?? 0,
    ];
}

$results->success = true;
$results->records = $records;
