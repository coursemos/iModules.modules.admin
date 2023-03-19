<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 도메인을 저장한다.
 *
 * @file /modules/admin/process/domain.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 12.
 *
 * @var Input $input
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 * @var \modules\admin\Admin $mAdmin
 */
$mAdmin = Modules::get('admin');
if ($mAdmin->isAdmin() == false) {
    $results->success = false;
    $results->message = $mAdmin->getErrorText('FORBIDDEN');
    return;
}

$errors = [];

$insert = [];
$insert['host'] = $input->get('host', $errors) ?? '';
$insert['alias'] = $input->get('alias') ?? '';
$insert['is_rewrite'] = $input->get('is_rewrite') ?? 'FALSE';
$insert['is_internationalization'] = $input->get('is_internationalization') ?? 'FALSE';
$insert['membership'] = $input->get('membership') ?? 'DEPENDENCE';

$origin = $input->get('origin');
$check = $this->db()
    ->select()
    ->from(iModules::table('domains'))
    ->where('host', $insert['host']);
if ($origin !== null) {
    $check->where('host', $origin, '!=');
}
if ($check->has() == true) {
    $errors['host'] = $this->getErrorText('DUPLICATED');
}

if (count($errors) == 0) {
    if ($origin === null) {
        $insert['language'] = Router::getLanguage();
        $insert['sort'] = $this->db()
            ->select()
            ->from(iModules::table('domains'))
            ->count();

        $this->db()
            ->insert(iModules::table('domains'), $insert)
            ->execute();
    } else {
        $this->db()
            ->update(iModules::table('domains'), $insert)
            ->where('host', $origin)
            ->execute();
    }

    Cache::remove('domains');

    $results->success = true;
} else {
    $results->success = false;
    $results->errors = $errors;
}
