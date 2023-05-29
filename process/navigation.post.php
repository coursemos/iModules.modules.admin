<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 네비게이션을 저장한다.
 *
 * @file /modules/admin/process/navigation.post.php
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
if ($me->hasPermission() == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$member = $me->getMember();
$contexts = json_encode($input->get('contexts'));

$me->db()
    ->update($me->table('members'), ['contexts' => $contexts])
    ->where('member_id', $member->member_id)
    ->execute();

$results->success = true;
$results->contexts = $input->get('contexts');
