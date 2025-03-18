<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 권한범위 구조체를 정의한다.
 *
 * @file /modules/admin/dtos/Scope.php
 * @author sungjin <esung246@naddle.net>
 * @license MIT License
 * @modified 2025. 3. 18.
 */
namespace modules\admin\dtos;
class Scope
{
    /**
     * @var \modules\admin\admin\Component $_admin 컴포넌트의 관리자클래스
     */
    private \modules\admin\admin\Component $_admin;

    /**
     * @var string $_code 범위코드
     */
    private string $_code;

    /**
     * @var string $_title 범위명
     */
    private string $_title;

    /**
     * @var array $_children 현재 권한범위의 세부범위
     */
    private array $_children = [];

    /**
     * 관리자 권한범위 구조체를 정의한다.
     *
     * @param \modules\admin\admin\Admin $admin 컨텍스트의 관리자클래스
     */
    public function __construct(\modules\admin\admin\Component $admin)
    {
        $this->_admin = $admin;
    }

    /**
     * 새로운 관리자 권한범위 구조체를 가져온다.
     *
     * @param \modules\admin\admin\Component $admin 컨텍스트의 관리자클래스
     * @return \modules\admin\dtos\Scope $scope
     */
    public static function init(\modules\admin\admin\Component $admin): \modules\admin\dtos\Scope
    {
        return new \modules\admin\dtos\Scope($admin);
    }

    /**
     * 권한범위를 정의한다.
     *
     * @param string $code 범위코드
     * @param string $title 범위명
     * @return \modules\admin\dtos\Scope $this
     */
    public function setScope(string $code, string $title): \modules\admin\dtos\Scope
    {
        $this->_code = $code;
        $this->_title = $title;

        return $this;
    }

    /**
     * 현재 권한범위에 세부범위가 있다면 추가한다.
     *
     * @param string $child_code 자식범위코드
     * @param string $child_title 자식범위명
     * @return \modules\admin\dtos\Scope $this
     */
    public function addChild(string $child_code, string $chile_title): \modules\admin\dtos\Scope
    {
        $this->_children[$child_code] = $chile_title;
        return $this;
    }

    /**
     * 범위코드를 가져온다.
     *
     * @return string $code
     */
    public function getCode(): string
    {
        return $this->_code;
    }

    /**
     * 범위코드 종류를 포함한 전체 범위코드를 가져온다.
     *
     * @return string $component_scope_code
     */
    public function getScopeCode(): string
    {
        return $this->getComponent()->getType() . '/' . $this->getComponent()->getName() . ':' . $this->_code;
    }

    /**
     * 세부범위코드를 가져온다.
     *
     * @return string[] $children_codes
     */
    public function getChildCodes(): array
    {
        return array_keys($this->_children);
    }

    /**
     * 범위코드 종류를 포함한 전체 범위코드를 가져온다.
     *
     * @return string[] $component_scope_code
     */
    public function getChildScopeCodes(): array
    {
        $scope = $this->getScopeCode();
        return array_map(function ($code) use ($scope) {
            return $scope . '@' . $code;
        }, $this->getChildCodes());
    }

    /**
     * 범위명을 가져온다.
     *
     * @return string $title
     */
    public function getTitle(): string
    {
        return $this->_title;
    }

    /**
     * 현재 권한범위를 가진 컴포넌트를 가져온다.
     *
     * @return \Component $component
     */
    public function getComponent(): \Component
    {
        return $this->_admin->getComponent();
    }

    /**
     * 권한범위를 JSON 으로 가져온다.
     *
     * @return object $json
     */
    public function getJson(): object
    {
        $scope = new \stdClass();
        $scope->code = $this->getScopeCode();
        $scope->title = $this->_title;
        $scope->children = [];
        foreach ($this->_children as $child_code => $child_title) {
            $child = new \stdClass();
            $child->code = $this->getScopeCode() . '@' . $child_code;
            $child->title = $child_title;

            $scope->children[] = $child;
        }

        return $scope;
    }
}
