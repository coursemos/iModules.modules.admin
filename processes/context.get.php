<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 컨텍스트 정보를 가져온다.
 *
 * @file /modules/admin/processes/context.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 5. 30.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->isAdministrator() == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$host = Request::get('host', true);
$language = Request::get('language', true);
$path = Request::get('path', true);
$context = iModules::db()
    ->select()
    ->from(iModules::table('contexts'))
    ->where('host', $host)
    ->where('language', $language)
    ->where('path', $path)
    ->getOne();

if ($context === null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND_DATA');
    return;
}

if ($context->path == '/') {
    $parent = null;
    $basename = '/';
} else {
    $temp = explode('/', $context->path);
    $basename = array_pop($temp);
    $parent = implode('/', $temp);
}

$context->parent = $parent == '' ? '/' : $parent;
$context->basename = $basename;
$context->icon = json_decode($context->icon ?? '');

switch ($context->type) {
    case 'EMPTY':
        break;

    case 'CHILD':
        break;

    case 'PAGE':
        $site = Sites::get($host, $language);
        if ($site->getTheme()->getPathName() == $context->target) {
            $context->page = $context->context;
        }
        $context->is_routing = $context->is_routing == 'TRUE';
        break;

    case 'MODULE':
        $context->module = [
            'module' => $context->target,
            'context' => $context->context,
            'configs' => json_decode($context->context_configs),
        ];
        break;

    case 'HTML':
        break;

    case 'LINK':
        break;
}

$context->header = json_decode($context->header ?? '');
$context->footer = json_decode($context->footer ?? '');
$context->is_sitemap = $context->is_sitemap == 'TRUE';
$context->is_footer_menu = $context->is_footer_menu == 'TRUE';

$results->success = true;
$results->data = $context;
