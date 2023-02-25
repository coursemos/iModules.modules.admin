<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 컨텍스트 목록을 가져온다.
 *
 * @file /modules/admin/process/contexts.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 2. 14.
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

$results->success = true;

$contexts = [];
foreach ($mAdmin->getContexts() as $context) {
    $item = [
        'icon' => $context->getIcon(),
        'title' => $context->getTitle(),
        'type' => $context->getType(),
        'target' => $context->getTarget(),
    ];

    if ($context->getType() == 'FOLDER') {
        $item['smart'] = $context->getSmart();
        $item['children'] = [];
        foreach ($context->getChildren() as $child) {
            $item['children'][] = [
                'icon' => $child->getIcon(),
                'title' => $child->getTitle(),
                'path' => $child->getPath(),
                'type' => $child->getType(),
            ];
        }
    } else {
        $item['path'] = $context->getPath();
    }

    $contexts[] = $item;
}
$results->contexts = $contexts;
