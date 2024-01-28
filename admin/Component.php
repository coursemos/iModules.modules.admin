<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 컴포넌트 관리자 클래스를 정의하기 위한 가상 컴포넌트 클래스를 정의한다.
 *
 * @file /modules/admin/admin/Component.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
namespace modules\admin\admin;
abstract class Component
{
    /**
     * @var \modules\admin\Admin $_mAdmin 관리자모듈
     */
    private static \modules\admin\Admin $_mAdmin;

    /**
     * @var \modules\admin\dtos\Group[] $_groups 관리자그룹
     */
    private array $_groups;

    /**
     * @var \modules\admin\dtos\Scope[] $_scopes 권한범위
     */
    private array $_scopes;

    /**
     * 관리자모듈 클래스를 가져온다.
     *
     * @return \modules\admin\Admin $mAdmin
     */
    final public function getAdminModule(): \modules\admin\Admin
    {
        if (isset(self::$_mAdmin) == false) {
            self::$_mAdmin = \Modules::get('admin');
        }
        return self::$_mAdmin;
    }

    /**
     * 관리자 컨텍스트를 처리할 컴포넌트 클래스를 가져온다.
     *
     * @return \Component $component
     */
    final public function getComponent(): \Component
    {
        $regExp = '/^(module|plugin|widget)s\\\(.*?)\\\admin\\\(.*?)$/';
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
     * 각 컴포넌트에서 사용할 데이터베이스 인터페이스 클래스를 가져온다.
     *
     * @param ?string $name 데이터베이스 인터페이스 고유명
     * @param ?DatabaseConnector $connector 데이터베이스정보
     * @return DatabaseInterface $interface
     */
    final public function db(?string $name = null, ?\DatabaseConnector $connector = null): \DatabaseInterface
    {
        return \Database::getInterface(
            $name ?? $this->getComponent()->getType() . '/' . $this->getComponent()->getName(),
            $connector ?? \Configs::db()
        );
    }

    /**
     * 간략화된 테이블명으로 실제 데이터베이스 테이블명을 가져온다.
     *
     * @param string $table;
     * @return string $table;
     */
    final public function table(string $table): string
    {
        return \iModules::table(
            $this->getComponent()->getType() .
                '_' .
                str_replace('/', '_', $this->getComponent()->getName()) .
                '_' .
                $table
        );
    }

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
            [$this->getAdminModule()->getLanguage()]
        );
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
     * 현재 컴포넌트의 관리자에서 추가적으로 사용하는 자바스크립트를 가져온다.
     * 컴포넌트 관리자 자바스크립트 (컴포넌트경로/admin/scripts/컴포넌트명.js) 파일을 자동으로 불러온다.
     *
     * @return string[] $scripts
     */
    public function getScripts(): array
    {
        return [];
    }

    /**
     * 현재 컴포넌트의 관리자에서 추가적으로 사용하는 스타일시트를 가져온다.
     * 컴포넌트 관리자 자바스크립트 (컴포넌트경로/admin/styles/컴포넌트명.css 또는 scss) 파일을 자동으로 불러온다.
     *
     * @return string[] $styles
     */
    public function getStyles(): array
    {
        return [];
    }

    /**
     * 관리자 컨텍스트 목록을 가져온다.
     * 각 컴포넌트 관리자 클래스에서 재정의한다.
     *
     * @return \modules\admin\dtos\Context[] $contexts
     */
    abstract function getContexts(): array;

    /**
     * 현재 컴포넌트의 관리자 컨텍스트를 가져온다.
     * 각 컴포넌트 관리자 클래스에서 재정의한다.
     *
     * @param string $path 컨텍스트 경로
     * @return string $html
     */
    abstract public function getContext(string $path): string;

    /**
     * 현재 컴포넌트의 관리자 권한범위를 가져온다.
     * 각 컴포넌트 관리자 클래스에서 재정의한다.
     *
     * @return \modules\admin\dtos\Scope[] $scopes
     */
    abstract public function getScopes(): array;

    /**
     * 현재 컴포넌트의 관리자 권한범위를 저장하고,
     * 그 데이터를 반환한다.
     *
     * @param \modules\admin\dtos\Scope[] $scopes
     * @return \modules\admin\dtos\Scope[] $scopes
     */
    final protected function setScopes(array $scopes): array
    {
        $this->_scopes = $scopes;
        return $this->_scopes;
    }

    /**
     * 현재 컴포넌트의 권한범위를 가져온다.
     *
     * @param string $code 권한코드
     * @return ?\modules\admin\dtos\Scope $scope
     */
    final public function getScope(string $code): ?\modules\admin\dtos\Scope
    {
        if (isset($this->_groups) == false) {
            $this->getScopes();
        }

        foreach ($this->_scopes as $scope) {
            if ($scope->getCode() == $code) {
                return $scope;
            }
        }
        return null;
    }

    /**
     * 현재 컴포넌트에서 자동으로 관리하는 관리자 전체그룹을 가져온다.
     * 각 컴포넌트 관리자 클래스에서 재정의한다.
     *
     * @return \modules\admin\dtos\Group[] $groups
     */
    public function getGroups(): array
    {
        return [];
    }

    /**
     * 현재 컴포넌트에서 자동으로 관리하는 관리자 전체그룹을 저장하고,
     * 그 데이터를 반환한다.
     *
     * @param \modules\admin\dtos\Group[] $groups
     * @return \modules\admin\dtos\Group[] $groups
     */
    final protected function setGroups(array $groups): array
    {
        $this->_groups = $groups;
        return $this->_groups;
    }

    /**
     * 현재 컴포넌트에서 자동으로 관리하는 관리자 그룹정보를 가져온다.
     *
     * @return ?\modules\admin\dtos\Group $groups
     */
    final public function getGroup(string $group_id): ?\modules\admin\dtos\Group
    {
        if (isset($this->_groups) == false) {
            $this->getGroups();
        }

        foreach ($this->_groups as $group) {
            if ($group->getId() == $group_id) {
                return $group;
            }
        }
        return null;
    }

    /**
     * 현재 컴포넌트에서 회원에게 자동으로 할당된 그룹고유값을 가져온다.
     * 각 컴포넌트 관리자 클래스에서 재정의한다.
     *
     * @return \modules\admin\dtos\Group[] $groups
     */
    public function getMemberGroups(?int $member_id): array
    {
        return [];
    }

    /**
     * 관리자 정보를 가져온다.
     *
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @param bool $refresh 정보를 갱신할지 여부
     * @return ?\modules\admin\dtos\Administrator $administrator
     */
    public function getAdministrator(?int $member_id = null, bool $refresh = false): ?\modules\admin\dtos\Administrator
    {
        return $this->getAdminModule()->getAdministrator($member_id, $refresh);
    }

    /**
     * 현재 접속한 관리자의 현재 컴포넌트에 대한 모든 권한을 가져온다.
     *
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @return bool|object $member_id
     */
    private function getAdministratorPermissions(?int $member_id = null): bool|object
    {
        $permissions =
            $this->getAdministrator($member_id)
                ?->getPermission()
                ?->getPermissions() ?? false;
        if (is_bool($permissions) == true) {
            return $permissions;
        }

        return $permissions->{$this->getComponent()->getType()}?->{$this->getComponent()->getName()} ?? false;
    }

    /**
     * 특정 권한종류에 특정 권한이 존재하는지 확인한다.
     *
     * @param string $scope 권한범위코드
     * @param string[] $children 권한이 존재하는지 확인할 세부권한 (빈 배열인 경우 어떤 권한이라도 존재하는지 확인)
     * @param int|bool $member_id_or_store_log 회원고유값 또는 로그기록여부 (회원고유값이나 false 인 경우 로그기록을 하지 않는다.)
     * @return bool $has_permission
     */
    final public function checkPermission(
        string $scope,
        array $children = [],
        int|bool $member_id_or_store_log = true
    ): bool {
        $is_store_log = $member_id_or_store_log === true;
        if (is_int($member_id_or_store_log) == true) {
            $permissions = $this->getAdministratorPermissions($member_id_or_store_log);
            $is_store_log = false;
        } else {
            $permissions = $this->getAdministratorPermissions();
        }

        if (is_bool($permissions) == true) {
            return $this->storeLog($is_store_log, $permissions);
        }

        /**
         * 확인하려고 하는 권한범위의 권한을 가져온다.
         */
        $permission = $permissions->{$scope} ?? false;
        if (is_bool($permission) == true) {
            return $this->storeLog($is_store_log, $permission);
        }

        /**
         * 확인하려는 세부권한범위가 없고, 권한이 비어 있지 않다면 true 를 반환한다.
         */
        if (count($children) == 0 && empty($permission) == false) {
            return $this->storeLog($is_store_log, true);
        }

        /**
         * 확인하려는 세부권한범위에 대한 모든 권한을 가지고 있는지 확인한다.
         */
        foreach ($children as $child) {
            if (in_array($child, $permission) == false) {
                return $this->storeLog($is_store_log, false);
            }
        }

        return $this->storeLog($is_store_log, true);
    }

    /**
     * 현재 컴포넌트의 특정 권한범위에 대한 권한이 존재하는지 확인한다.
     *
     * @param string $scope 권한범위코드
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     */
    final protected function hasPermission(string $scope, ?int $member_id = null): bool
    {
        $permissions = $this->getAdministratorPermissions($member_id);
        if (is_bool($permissions) == true) {
            return $permissions;
        }

        /**
         * 현재 컴포넌트에 부여된 권한을 가져온다.
         */
        $permission = $permissions->{$scope} ?? false;
        if (is_bool($permission) == true) {
            return $permission;
        }

        return count($permission) > 0;
    }

    /**
     * 현재 컴포넌트의 관리권한이 존재하는지 확인한다.
     *
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @return bool $is_administrator 권리권한 존재여부
     */
    final public function isAdministrator(?int $member_id = null): bool
    {
        return $this->getAdministratorPermissions($member_id) !== false;
    }

    /**
     * 현재 컴포넌트의 모든 관리권한을 가진 컴포넌트 최고관리자인지 확인한다.
     *
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @return bool $is_master 최고관리자 여부
     */
    final public function isMaster(?int $member_id = null): bool
    {
        return $this->getAdministratorPermissions($member_id) === true;
    }

    /**
     * 관리자 권한에 따른 관리자접근로그를 기록한다.
     *
     * @param bool $is_store_log 로그기록여부
     * @param bool $permission 접근당시의 관리자권한
     * @return bool $permission 접근당시의 관리자권한
     */
    final public function storeLog(bool $is_store_log = true, bool $permission = true): bool
    {
        if ($permission === false) {
            return false;
        }

        if ($is_store_log === true) {
            $mAdmin = $this->getAdminModule();
            $administrator = $mAdmin->getAdministrator();
            $member_id = $administrator?->getId() ?? 0;
            $component = $this->getComponent();
            $mAdmin
                ->db()
                ->replace($mAdmin->table('logs'), [
                    'time' => \Format::microtime(3),
                    'member_id' => $member_id,
                    'response' => $permission == true ? 'OK' : 'FORBIDDEN',
                    'method' => \Request::method(),
                    'component_type' => $component->getType(),
                    'component_name' => $component->getName(),
                    'url' => \Request::url(false),
                    'params' => \Request::query([], true),
                    'input' => \Input::log(),
                    'ip' => \Format::ip(),
                    'agent' => \Format::agent(),
                ])
                ->execute();
        }

        return $permission;
    }
}
