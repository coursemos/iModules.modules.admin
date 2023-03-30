<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 도메인 정보를 가져온다.
 *
 * @file /modules/admin/process/domain.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 12.
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

$host = Request::get('host', true);
$domain = $this->db()
    ->select()
    ->from(iModules::table('domains'))
    ->where('host', $host)
    ->getOne();

if ($domain === null) {
    $results->success = false;
    $results->message = $this->getErrorText('NOT_FOUND');
    return;
}

$results->success = true;
$results->data = $domain;
