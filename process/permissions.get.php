<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자기능을 가진 컴포넌트의 관리자 권한 종류를 가져온다.
 *
 * @file /modules/admin/process/permissions.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 8. 2.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자 관리권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('administrator') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$results->success = true;
$results->permissions = [];
$modules = Modules::all();
foreach ($modules as $module) {
    $types = $module->getAdmin()?->getPermissions() ?? [];
    if (count($types) == 0) {
        continue;
    }

    $component = new stdClass();
    $component->title = $module->getTitle();
    $component->name = $module->getType() . '/' . $module->getName();
    $component->types = [];

    foreach ($types as $name => $type) {
        $type['name'] = $component->name . '-' . $name;
        $permissions = [];
        foreach ($type['permissions'] as $permission => $display) {
            $permissions[] = [
                'label' => $display,
                'name' => $type['name'] . '@' . $permission,
            ];
        }
        $type['permissions'] = $permissions;
        $component->types[] = $type;
    }

    $results->components[] = $component;
}
