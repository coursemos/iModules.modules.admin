<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자기능을 가진 컴포넌트의 관리자 권한범위를 가져온다.
 *
 * @file /modules/admin/processes/scopes.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자 관리권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('administrator', [], false) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$components = [];

/**
 * @var string $type 컴포넌트종류
 * @var string[] $names 컴포넌트명
 */
foreach ($me->getAdminScopes() as $type => $names) {
    /**
     * @var string $name 컴포넌트명
     * @var string[] $scopes 권한범위명
     */
    foreach ($names as $name => $scopes) {
        $component = new stdClass();
        $component->type = $type;
        $component->name = $name;
        $component->code = $type . '/' . $name;

        if ($type == 'module') {
            $component->title = \Modules::get($name)->getTitle();
        }

        $component->scopes = [];

        /**
         * @var string $code 권한범위코드
         * @var \modules\admin\dtos\Scope $scope
         */
        foreach ($scopes as $code => $scope) {
            $component->scopes[] = $scope->getJson();
        }

        $components[] = $component;
    }
}

$results->success = true;
$results->components = $components;
