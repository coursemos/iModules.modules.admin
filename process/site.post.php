<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트를 저장한다.
 *
 * @file /modules/admin/process/site.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 4. 7.
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
if ($me->isAdmin() == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$errors = [];

$host = Request::get('host', true);
$origin = Request::get('language');
if ($origin !== null) {
    $origin = $me
        ->db()
        ->select()
        ->from(iModules::table('sites'))
        ->where('host', $host)
        ->where('language', $origin)
        ->getOne();
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

$check = $me
    ->db()
    ->select()
    ->from(iModules::table('sites'))
    ->where('host', $insert['host'])
    ->where('language', $insert['language']);
if ($origin !== null) {
    $check->where('language', $origin->language, '!=');
}
if ($check->has() == true) {
    $errors['language'] = $me->getErrorText('DUPLICATED');
}

if (count($errors) == 0) {
    if ($input->get('logo') !== null) {
        $mAttachment->publishFile($input->get('logo'), $me, 'logo', $insert['host'] . '/' . $insert['language']);
    }

    if ($origin === null) {
        $insert['sort'] = $me
            ->db()
            ->select()
            ->from(iModules::table('sites'))
            ->count();

        $me->db()
            ->insert(iModules::table('sites'), $insert)
            ->execute();
    } else {
        if ($origin->logo !== null && $input->get('logo') !== $origin->logo) {
            $mAttachment->deleteFile($origin->logo);
        }

        $me->db()
            ->update(iModules::table('sites'), $insert)
            ->where('host', $origin->host)
            ->where('language', $origin->language)
            ->execute();
    }

    Cache::remove('domains');

    $results->success = false;
    $results->m = $insert;
} else {
    $results->success = false;
    $results->errors = $errors;
}
