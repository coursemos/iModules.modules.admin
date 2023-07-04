<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리자 클래스를 정의한다.
 *
 * @file /modules/admin/admin/Admin.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 28.
 */
namespace modules\admin\admin;
abstract class Admin
{
    /**
     * @var \modules\admin\Admin $_mAdmin 관리자모듈
     */
    private static \modules\admin\Admin $_mAdmin;

    /**
     * @var array $_permissions 사용자별 현재 모듈의 관리자 권한
     */
    private static $_permissions = [];

    /**
     * 관리자 클래스를 정의한다.
     */
    final public function __construct(\modules\admin\Admin $admin)
    {
        self::$_mAdmin = $admin;
    }

    /**
     * 관리자 컨텍스트를 초기화한다.
     */
    abstract public function init(): void;

    /**
     * 언어팩 코드 문자열을 가져온다.
     *
     * @param string $text 코드
     * @param ?array $placeHolder 치환자
     * @return string|array $message 치환된 메시지
     */
    final public function getText(string $text, ?array $placeHolder = null): string|array
    {
        return \Language::getText(
            $text,
            $placeHolder,
            ['/' . $this->getComponent()->getType() . 's/' . $this->getComponent()->getName(), '/'],
            [$this->getAdmin()->getLanguage()]
        );
    }

    /**
     * 관리자모듈 클래스를 가져온다.
     *
     * @return \modules\admin\Admin $mAdmin
     */
    final public function getAdmin(): \modules\admin\Admin
    {
        return self::$_mAdmin;
    }

    /**
     * 언어팩 에러코드 문자열을 가져온다.
     *
     * @param string $code 에러코드
     * @param ?array $placeHolder 치환자
     * @return string $message 치환된 메시지
     */
    final public function getErrorText(string $code, ?array $placeHolder = null): string
    {
        return self::getText('errors/' . $code, $placeHolder);
    }

    /**
     * 컴포넌트타입 컨텍스트를 추가한다.
     *
     * @param string $path 경로
     * @param string $title 컨텍스트명
     * @param ?string $icon 컨텍스트아이콘
     */
    final public function addContext(string $path, string $title, string $icon = '', bool $is_root = false): void
    {
        $context = new \modules\admin\dto\Context($this, $title, $icon);
        $context->setContext($path, $is_root);

        $this->getAdmin()->addContext($context);
    }

    /**
     * 링크타입 컨텍스트를 추가한다.
     *
     * @param string $url 링크주소
     * @param string $title 컨텍스트명
     * @param string $target 링크대상 (_self : 현재창, _blank : 새창)
     * @param ?string $icon 컨텍스트아이콘
     */
    final public function addLink(string $url, string $title, string $target = '_self', string $icon = ''): void
    {
        $context = new \modules\admin\dto\Context($this, $title, $icon);
        $context->setLink($url, $target);
        $this->getAdmin()->addContext($context);
    }

    /**
     * 컨텍스트를 처리할 컴포넌트 클래스를 가져온다.
     *
     * @return \Component $component
     */
    final public function getComponent(): \Component
    {
        $regExp = '/^(module|plugin|widget)s\\\(.*?)\\\admin\\\(.*?)Admin$/';
        if (preg_match($regExp, get_called_class(), $match) == true) {
            $type = $match[1];
            $name = str_replace('\\', '/', $match[2]);

            if ($type == 'module') {
                return \Modules::get($name);
            }
        }

        return null;
    }

    /**
     * 관리자 기본경로를 가져온다.
     *
     * @return string $base
     */
    final public function getBase(): string
    {
        return $this->getComponent()->getBase() . '/admin';
    }

    /**
     * 관리자 상대경로를 가져온다.
     *
     * @return string $dir
     */
    final public function getDir(): string
    {
        return $this->getComponent()->getDir() . '/admin';
    }

    /**
     * 관리자 절대경로를 가져온다.
     *
     * @return string $path
     */
    final public function getPath(): string
    {
        return $this->getComponent()->getPath() . '/admin';
    }

    /**
     * 현재 모듈 관리자에서 추가로 사용하는 자바스크립트를 가져온다.
     * /admin/scripts/Admin.js 파일은 자동으로 불러온다.
     *
     * @return string[] $scripts
     */
    public function scripts(): array
    {
        return [];
    }

    /**
     * 현재 모듈 관리자에서 추가로 사용하는 스타일시트를 가져온다.
     * /admin/scripts/Admin.css, /admin/scripts/Admin.scss 파일은 자동으로 불러온다.
     *
     * @return string[] $styles
     */
    public function styles(): array
    {
        return [];
    }

    /**
     * 현재 모듈의 모든 관리자 권한을 가져온다.
     *
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @return array $permissions 권한
     */
    final public function getPermissions(?int $member_id = null): array
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        $member_id ??= $mMember->getLogged();

        if (isset(self::$_permissions[$member_id]) == true) {
            return self::$_permissions[$member_id];
        }

        $permissions = self::$_mAdmin->getPermissions($member_id);
        $component = $this->getComponent()->getType() . '/' . $this->getComponent()->getName();
        self::$_permissions = isset($permissions[$component]) == true ? $permissions[$component] : [];

        return self::$_permissions;
    }

    /**
     * 권한종류에 따른 권한을 가져온다.
     *
     * @param string $permission_type 권한종류
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @return bool|array $permission
     */
    final public function getPermission(string $permission_type, ?int $member_id = null): bool|array
    {
        if ($this->isMaster($member_id) == true) {
            return true;
        }

        $permissions = $this->getPermissions($member_id);
        if (isset($permissions[$permission_type]) == false) {
            return false;
        }

        return $permissions[$permission_type];
    }

    /**
     * 특정 권한종류에 특정 권한이 존재하는지 확인한다.
     *
     * @param string $permission_type 권한종류
     * @param ?string $check 권한이 존재하는지 확인할 권한 (NULL 인 경우 어떤 권한이라도 존재하는지 확인)
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @return bool $has_permission
     */
    final public function checkPermission(string $permission_type, ?string $check = null, ?int $member_id = null): bool
    {
        $permission = $this->getPermission($permission_type, $member_id);
        if (is_bool($permission) == true) {
            return $permission;
        } else {
            return $check === null ? count($permission) > 0 : in_array($check, $permission) === true;
        }
    }

    /**
     * 최고관리자인지 확인한다.
     *
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @return bool $is_master 최고관리자 여부
     */
    final public function isMaster(?int $member_id = null): bool
    {
        return self::$_mAdmin->isMaster($member_id);
    }

    /**
     * 관리자 컨텍스트의 접근권한을 확인한다.
     *
     * @param string $path 컨텍스트경로
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @return bool $has_permission
     */
    abstract public function hasContextPermission(string $path, ?int $member_id = null): bool;

    /**
     * 각 컨텍스트의 콘텐츠를 가져온다.
     *
     * @param string $path 컨텍스트 경로
     * @param ?string $subPath 컨텍스트 하위경로
     */
    abstract public function getContent(string $path, ?string $subPath = null): string;
}
