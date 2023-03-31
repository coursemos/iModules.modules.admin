<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈을 설치한다.
 *
 * @file /modules/admin/process/module.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 12.
 *
 * @var Input $input
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

$errors = [];
$name = $input->get('name', $errors);
$module = Modules::get($name);
if ($module === null) {
    $results->success = false;
    $results->message = $mAdmin->getErrorText('NOT_FOUND_MODULE', ['module' => $name]);
    return;
}
$configs = $input->get('configs') ? $module->getPackage()->getConfigs($input->get('configs')) : null;

$installable = Modules::installable($name);
if ($installable->success == false) {
    $results->success = false;
    if (isset($installable->dependencies['core']) == true) {
        $results->message = $mAdmin->getErrorText('DEPENDENCY_ERROR_CORE', [
            'requirement' => $installable->dependencies['core']->requirement,
            'current' => $installable->dependencies['core']->current,
        ]);
    } else {
        $dependencies = [];
        foreach ($installable->dependencies as $name => $versions) {
            $dependencies[] = $mAdmin->getErrorText('DEPENDENCY_ERROR_MODULE', [
                'name' => $name,
                'requirement' => $versions->requirement,
                'current' => $versions->current,
            ]);
        }
        $results->message = implode('<br>', $dependencies);
    }
    return;
}

$success = Modules::install($name, $configs);

$results->success = $success;
