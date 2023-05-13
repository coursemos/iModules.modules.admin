<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 네비게이션을 가져온다.
 *
 * @file /modules/admin/process/navigation.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 4. 7.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->isAdmin() == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$results->success = true;

$contexts = [];
foreach ($me->getContexts() as $context) {
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
