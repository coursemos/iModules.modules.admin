<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 컨텍스트를 저장한다.
 *
 * @file /modules/admin/process/context.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 5. 30.
 *
 * @var \modules\admin\Admin $me
 * @var Input $input
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('sitemap', 'context') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$host = Request::get('host', true);
$language = Request::get('language', true);
$path = Request::get('path');

if ($path !== null) {
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
        $results->a = iModules::db()->getLastQuery();
        return;
    }
} else {
    $context = null;
}

$errors = [];
$insert = [];
$insert['host'] = $host;
$insert['language'] = $language;

if ($input->get('path') !== null) {
    if (strpos($input->get('path'), '/') !== false) {
        $errors['path'] = '/';
    }
}

$insert['path'] = $input->get('parent') . ($input->get('path') ? '/' . $input->get('path') : '');
$insert['icon'] = $input->get('icon');
$insert['title'] = $input->get('title', $errors);
$insert['description'] = $input->get('description');
$insert['image'] = $input->get('image');
$insert['type'] = $input->get('type') ?? 'EMPTY';
$insert['target'] = null;
$insert['context'] = null;
$insert['context_configs'] = null;
$insert['is_routing'] = 'FALSE';

switch ($input->get('type')) {
    case 'EMPTY':
        break;

    case 'CHILD':
        break;

    case 'PAGE':
        $site = Sites::get($host, $language);
        $insert['target'] = $site->getTheme()->getPathName();
        $insert['context'] = $input->get('page', $errors);
        $insert['is_routing'] = $input->get('is_routing') ? 'TRUE' : 'FALSE';
        break;

    case 'MODULE':
        $module = $input->get('module');
        $insert['target'] = $module->module;
        $insert['context'] = $module->context;
        $insert['context_configs'] = Format::toJson($module->configs);
        $insert['is_routing'] = 'TRUE';
        break;

    case 'HTML':
        break;

    case 'LINK':
        break;
}

if (in_array($input->get('type'), ['CHILD', 'LINK'])) {
    $insert['layout'] = null;
    $insert['header'] = null;
    $insert['footer'] = null;
} else {
    $insert['layout'] = $input->get('layout', $errors);
    $insert['header'] = $input->get('header');
    $insert['footer'] = $input->get('footer');
}

$insert['permission'] = $input->get('permission') ?? 'true';
$insert['is_sitemap'] = $input->get('is_sitemap') ? 'TRUE' : 'FALSE';
$insert['is_footer_menu'] = $input->get('is_footer_menu') ? 'TRUE' : 'FALSE';

$check = iModules::db()
    ->select()
    ->from(iModules::table('contexts'))
    ->where('host', $host)
    ->where('language', $language)
    ->where('path', $insert['path']);
if ($context !== null) {
    $check->where('path', $context->path, '!=');
}
if ($check->has() == true) {
    $errors['host'] = $me->getErrorText('DUPLICATED');
}

if (count($errors) == 0) {
    if ($input->get('image') !== null) {
        $mAttachment->publishFile(
            $input->get('image'),
            $me,
            'context',
            $insert['host'] . '/' . $insert['language'] . $insert['path']
        );
    }

    if ($context === null) {
    } else {
        iModules::db()
            ->update(iModules::table('contexts'), $insert)
            ->where('host', $context->host)
            ->where('language', $context->language)
            ->where('path', $context->path)
            ->execute();
    }

    Cache::remove('contexts');

    $results->success = true;
    $results->insert = $insert;
} else {
    $results->success = false;
    $results->errors = $errors;
}
