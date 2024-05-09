<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 도메인을 저장한다.
 *
 * @file /modules/admin/processes/domain.post.php
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
if ($me->getAdmin()->checkPermission('sitemap', ['domains']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$host = Request::get('host');
if ($host !== null) {
    $domain = iModules::db()
        ->select()
        ->from(iModules::table('domains'))
        ->where('host', $host)
        ->getOne();

    if ($domain === null) {
        $results->success = false;
        $results->message = $me->getErrorText('NOT_FOUND_DATA');
        return;
    }
} else {
    $domain = null;
}

$errors = [];

$insert = [];
$insert['host'] = Input::get('host', $errors) ?? '';
$insert['alias'] = Input::get('alias') ?? '';
$insert['is_rewrite'] = Input::get('is_rewrite') ?? 'FALSE';
$insert['is_internationalization'] = Input::get('is_internationalization') ?? 'FALSE';

$check = iModules::db()
    ->select()
    ->from(iModules::table('domains'))
    ->where('host', $insert['host']);
if ($domain !== null) {
    $check->where('host', $domain->host, '!=');
}
if ($check->has() == true) {
    $errors['host'] = $me->getErrorText('DUPLICATED');
}

if (count($errors) == 0) {
    if ($domain === null) {
        $insert['language'] = Router::getLanguage();
        $insert['sort'] = iModules::db()
            ->select()
            ->from(iModules::table('domains'))
            ->count();

        $me->db()
            ->insert(iModules::table('domains'), $insert)
            ->execute();
    } else {
        $me->db()
            ->update(iModules::table('domains'), $insert)
            ->where('host', $domain->host)
            ->execute();

        /**
         * @var \modules\attachment\Attachment $mAttachment
         */
        $mAttachment = Modules::get('attachment');

        $sites = $me
            ->db()
            ->select()
            ->from(iModules::table('sites'))
            ->where('host', $domain->host)
            ->get();
        foreach ($sites as $site) {
            $me->db()
                ->update(iModules::table('sites'), ['host' => $insert['host']])
                ->where('host', $domain->host)
                ->execute();

            $mAttachment->moveFile($site->logo, $me, 'logo', $insert['host'] . '/' . $site->language, true);
            $mAttachment->moveFile($site->emblem, $me, 'emblem', $insert['host'] . '/' . $site->language, true);
            $mAttachment->moveFile($site->favicon, $me, 'favicon', $insert['host'] . '/' . $site->language, true);
            $mAttachment->moveFile($site->image, $me, 'image', $insert['host'] . '/' . $site->language, true);

            $contexts = $me
                ->db()
                ->select()
                ->from(iModules::table('contexts'))
                ->where('host', $site->host)
                ->where('language', $site->language)
                ->get();
            foreach ($contexts as $context) {
                $me->db()
                    ->update(iModules::table('contexts'), ['host' => $insert['host']])
                    ->where('host', $site->host)
                    ->where('language', $site->host)
                    ->execute();

                $mAttachment->moveFile(
                    $context->image,
                    $me,
                    'context',
                    $insert['host'] . '/' . $context->language . '/' . $context->path,
                    true
                );
            }
        }

        Cache::remove('sites');
        Cache::remove('contexts');
    }

    Cache::remove('domains');

    $results->success = true;
} else {
    $results->success = false;
    $results->errors = $errors;
}
