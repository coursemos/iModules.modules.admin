<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈목록을 가져온다.
 *
 * @file /modules/admin/process/modules.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 27.
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 * @var \modules\admin\Admin $mAdmin
 */
$mAdmin = Modules::get('admin');
if ($mAdmin->checkPermission('/sites') == false) {
    $results->success = false;
    $results->message = $mAdmin->getErrorText('FORBIDDEN');
    return;
}

/**
 * 모듈폴더를 탐색하여 모듈을 가져온다.
 */
function GetModules(string $path, array &$modules): void
{
    $names = File::getDirectoryItems($path, 'directory', false);
    foreach ($names as $name) {
        if (is_file($name . '/package.json') == true) {
            $modules[] = Modules::get(str_replace(Configs::path() . '/modules/', '', $name));
        } else {
            GetModules($name, $modules);
        }
    }
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
