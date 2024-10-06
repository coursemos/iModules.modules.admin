<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 전체 컴포넌트 목록을 가져온다.
 *
 * @file /modules/admin/processes/components.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 6.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdministrator()?->isAdministrator() !== true) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$modules = Modules::all();
foreach ($modules as &$module) {
    $module = [
        'name' => 'module@' . $module->getName(),
        'icon' => $module->getIcon(),
        'title' => $module->getTitle(),
        'sort' => 0,
    ];
}

$records = [
    [
        'name' => 'module',
        'icon' => '<i class="icon mi mi-module"></i>',
        'title' => $me->getText('admin.components.module'),
        'sort' => 0,
        'children' => $modules,
    ],
];

$results->success = true;
$results->records = $records;
