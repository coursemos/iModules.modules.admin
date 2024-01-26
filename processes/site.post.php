<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트를 저장한다.
 *
 * @file /modules/admin/processes/site.post.php
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
$insert['color'] = Input::get('color');
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
    if (Input::get('logo') !== null) {
        $mAttachment->publishFile(Input::get('logo'), $me, 'logo', $insert['host'] . '/' . $insert['language']);
    }

    if ($site === null) {
        $insert['sort'] = iModules::db()
            ->select()
            ->from(iModules::table('sites'))
            ->count();

        iModules::db()
            ->insert(iModules::table('sites'), $insert)
            ->execute();
    } else {
        if ($site->logo !== null && Input::get('logo') !== $site->logo) {
            $mAttachment->deleteFile($site->logo);
        }

        iModules::db()
            ->update(iModules::table('sites'), $insert)
            ->where('host', $site->host)
            ->where('language', $site->language)
            ->execute();
    }

    Cache::remove('sites');

    $results->success = true;
} else {
    $results->success = false;
    $results->errors = $errors;
}
