<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 컨텍스트 목록을 저장한다.
 *
 * @file /modules/admin/process/contexts.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 4. 7.
 *
 * @var \modules\admin\Admin $me
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

$member = $this->getMember();
$contexts = json_encode($values->contexts);

$this->db()
    ->update($this->table('members'), ['contexts' => $contexts])
    ->where('member_id', $member->member_id)
    ->execute();

sleep(1);

$results->success = true;
$results->contexts = $values->contexts;
