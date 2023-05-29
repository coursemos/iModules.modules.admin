<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트를 저장한다.
 *
 * @file /modules/admin/process/site.post.php
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
if ($me->isAdmin('sites') == false) {
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
$insert['language'] = $input->get('language', $errors) ?? '';
$insert['title'] = $input->get('title', $errors) ?? '';
$insert['description'] = $input->get('description') ?? '';
$insert['theme'] = Format::toJson($input->get('theme', $errors));
$insert['header'] = $input->get('header');
$insert['footer'] = $input->get('footer');
$insert['logo'] = $input->get('logo');
$insert['emblem'] = $input->get('emblem');
$insert['favicon'] = $input->get('favicon');
$insert['image'] = $input->get('image');

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
    if ($input->get('logo') !== null) {
        $mAttachment->publishFile($input->get('logo'), $me, 'logo', $insert['host'] . '/' . $insert['language']);
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
        if ($site->logo !== null && $input->get('logo') !== $site->logo) {
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
