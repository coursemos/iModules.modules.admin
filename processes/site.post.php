<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트를 저장한다.
 *
 * @file /modules/admin/processes/site.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 2. 4.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('sitemap', ['sites']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$errors = [];

$host = Request::get('host', true);
$language = Request::get('language');
if ($language !== null) {
    $site = iModules::db()
        ->select()
        ->from(iModules::table('sites'))
        ->where('host', $host)
        ->where('language', $language)
        ->getOne();

    if ($site === null) {
        $results->success = false;
        $results->message = $me->getErrorText('NOT_FOUND_DATA');
        return;
    }
} else {
    $site = null;
}

/**
 * @var \modules\attachment\Attachment $mAttachment
 */
$mAttachment = Modules::get('attachment');

$insert = [];
$insert['host'] = $host;
$insert['language'] = Input::get('language', $errors) ?? '';
$insert['title'] = Input::get('title', $errors) ?? '';
$insert['description'] = Input::get('description') ?? '';
$insert['theme'] = Format::toJson(Input::get('theme', $errors));
$insert['color'] = Input::get('color') ?? '#0077be';
$insert['header'] = Input::get('header');
$insert['footer'] = Input::get('footer');
$insert['logo'] = Input::get('logo');
$insert['emblem'] = Input::get('emblem');
$insert['favicon'] = Input::get('favicon');
$insert['image'] = Input::get('image');

$check = iModules::db()
    ->select()
    ->from(iModules::table('sites'))
    ->where('host', $insert['host'])
    ->where('language', $insert['language']);
if ($site !== null) {
    $check->where('language', $site->language, '!=');
}
if ($check->has() == true) {
    $errors['language'] = $me->getErrorText('DUPLICATED');
}

if (count($errors) == 0) {
    if ($site === null) {
        iModules::db()
            ->insert(iModules::table('sites'), $insert)
            ->execute();
    } else {
        iModules::db()
            ->update(iModules::table('sites'), $insert)
            ->where('host', $site->host)
            ->where('language', $site->language)
            ->execute();
    }

    $mAttachment->publishFile(Input::get('logo'), $me, 'logo', $insert['host'] . '/' . $insert['language'], true);
    if (Input::get('logo') !== null) {
        $mAttachment->getAttachment(Input::get('logo'))->setName('logo', false);
    }

    $mAttachment->publishFile(Input::get('emblem'), $me, 'emblem', $insert['host'] . '/' . $insert['language'], true);
    if (Input::get('emblem') !== null) {
        $mAttachment->getAttachment(Input::get('emblem'))->setName('emblem', false);
    }

    $mAttachment->publishFile(Input::get('favicon'), $me, 'favicon', $insert['host'] . '/' . $insert['language'], true);
    if (Input::get('favicon') !== null) {
        $mAttachment->getAttachment(Input::get('favicon'))->setName('favicon', false);
    }

    $mAttachment->publishFile(Input::get('image'), $me, 'image', $insert['host'] . '/' . $insert['language'], true);
    if (Input::get('image') !== null) {
        $mAttachment->getAttachment(Input::get('image'))->setName('image', false);
    }

    Cache::remove('sites');

    $results->success = true;
} else {
    $results->success = false;
    $results->errors = $errors;
}
