<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 로그인을 처리한다.
 *
 * @file /modules/admin/processes/login.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 24.
 *
 * @var \modules\admin\Admin $me
 * @var Input $input
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

$errors = [];
$email = $input->get('email', $errors);
$password = $input->get('password', $errors);
$auto_login = $input->get('auto_login') === 'true';

if (count($errors) == 0) {
    /**
     * @var \modules\member\Member $mMember
     */
    $mMember = Modules::get('member');
    $login = $mMember->login($email, $password, $auto_login);

    if ($login === true) {
        if ($me->isAdministrator() === true) {
            $results->success = true;
        } else {
            $results->success = false;
            $results->message = $me->getErrorText('PERMISSION_DENIED');
        }
    } else {
        $results->success = false;
        $results->message = $login;
    }
} else {
    $results->success = false;
    $results->errors = $errors;
}
