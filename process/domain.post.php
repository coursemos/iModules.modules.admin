<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 도메인을 저장한다.
 *
 * @file /modules/admin/process/domain.post.php
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
$insert['host'] = $input->get('host', $errors) ?? '';
$insert['alias'] = $input->get('alias') ?? '';
$insert['is_rewrite'] = $input->get('is_rewrite') ?? 'FALSE';
$insert['is_internationalization'] = $input->get('is_internationalization') ?? 'FALSE';
$insert['membership'] = $input->get('membership') ?? 'DEPENDENCE';

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
    }

    Cache::remove('domains');

    $results->success = true;
} else {
    $results->success = false;
    $results->errors = $errors;
}
