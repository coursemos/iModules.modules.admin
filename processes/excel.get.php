<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 엑셀파일을 다운로드 받는다.
 *
 * @file /modules/admin/processes/excel.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 9.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

$path = explode('/', $path);
if (count($path) != 2) {
    Header::type('html');
    ErrorHandler::print(ErrorHandler::error('NOT_FOUND_URL'));
}

/**
 * @var \modules\attachment\Attachment $mAttachment
 */
$mAttachment = Modules::get('attachment');
if (is_file($mAttachment->getTempPath() . '/' . $path[0] . '.xlsx') == false) {
    Header::type('html');
    ErrorHandler::print(ErrorHandler::error('NOT_FOUND_URL'));
}

Header::type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
Header::length(filesize($mAttachment->getTempPath() . '/' . $path[0] . '.xlsx'));
Header::attachment($path[1]);

readfile($mAttachment->getTempPath() . '/' . $path[0] . '.xlsx');
exit();
