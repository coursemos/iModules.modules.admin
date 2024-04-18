<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 컨텍스트를 저장한다.
 *
 * @file /modules/admin/processes/context.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 4. 18.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('sitemap', ['contexts']) == false) {
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
if ($path === '/') {
    $insert['path'] = '/';
} else {
    if (strlen(Input::get('basename')) == 0) {
        $errors['basename'] = $me->getErrorText('REQUIRED');
    }

    if (strpos('/', Input::get('basename')) !== false) {
        $errors['basename'] = $me->getErrorText('NOT_ALLOWED_SLASH_IN_BASENAME');
    }

    $insert['path'] = Input::get('parent');
    $insert['path'] .= $insert['path'] !== '/' ? '/' : '';
    $insert['path'] .= Input::get('basename');
}

$insert['icon'] = Input::get('icon');
$insert['title'] = Input::get('title', $errors);
$insert['description'] = Input::get('description');
$insert['keywords'] = Input::get('keywords');
$insert['image'] = Input::get('image');
$insert['type'] = Input::get('type') ?? 'EMPTY';
$insert['target'] = null;
$insert['context'] = null;
$insert['context_configs'] = null;
$insert['is_routing'] = 'FALSE';

switch (Input::get('type')) {
    case 'EMPTY':
        break;

    case 'CHILD':
        break;

    case 'PAGE':
        $site = Sites::get($host, $language);
        $insert['target'] = $site->getTheme()->getPathName();
        $insert['context'] = Input::get('page', $errors);
        $insert['is_routing'] = Input::get('is_routing') ? 'TRUE' : 'FALSE';
        break;

    case 'MODULE':
        $module = Input::get('module');
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

if (in_array(Input::get('type'), ['CHILD', 'LINK'])) {
    $insert['layout'] = null;
    $insert['header'] = null;
    $insert['footer'] = null;
} else {
    $insert['layout'] = Input::get('layout', $errors);
    $insert['header'] = Input::get('header');
    $insert['footer'] = Input::get('footer');
}

$insert['permission'] = Input::get('permission') ?? 'true';
$insert['is_sitemap'] = Input::get('is_sitemap') ? 'TRUE' : 'FALSE';
$insert['is_footer_menu'] = Input::get('is_footer_menu') ? 'TRUE' : 'FALSE';

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
    /**
     * @var \modules\attachment\Attachment $mAttachment
     */
    $mAttachment = Modules::get('attachment');

    if ($context === null) {
        $insert['sort'] = iModules::db()
            ->select()
            ->from(iModules::table('contexts'))
            ->where('host', $host)
            ->where('language', $language)
            ->count();

        iModules::db()
            ->insert(iModules::table('contexts'), $insert)
            ->execute();
    } else {
        if ($context->image != Input::get('image')) {
            $mAttachment->deleteFile($context->image);
        }

        iModules::db()
            ->update(iModules::table('contexts'), $insert)
            ->where('host', $context->host)
            ->where('language', $context->language)
            ->where('path', $context->path)
            ->execute();

        $children = iModules::db()
            ->select()
            ->from(iModules::table('contexts'))
            ->where('host', $host)
            ->where('language', $language)
            ->where('path', $context->path . '/%', 'LIKE')
            ->get();
        foreach ($children as $child) {
            $childpath = preg_replace('/^' . Format::reg($context->path) . '\//', $insert['path'] . '/', $child->path);
            $mAttachment->moveFile($child->image, $me, 'context', $childpath, true);

            iModules::db()
                ->update(iModules::table('contexts'), ['path' => $childpath])
                ->where('host', $child->host)
                ->where('language', $child->language)
                ->where('path', $child->path)
                ->execute();
        }
    }

    $mAttachment->moveFile(
        Input::get('image'),
        $me,
        'context',
        $insert['host'] . '/' . $insert['language'] . $insert['path'],
        true
    );

    Cache::remove('contexts');

    $results->success = true;
    $results->path = $insert['path'];
} else {
    $results->success = false;
    $results->errors = $errors;
}
