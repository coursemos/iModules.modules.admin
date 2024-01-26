<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 그룹 구조체를 정의한다.
 *
 * @file /modules/admin/dtos/Group.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 */
namespace modules\admin\dtos;
class Group
{
    /**
     * @var \modules\admin\admin\Component $_admin 컴포넌트의 관리자클래스
     */
    private \modules\admin\admin\Component $_admin;

    /**
     * @var string $_group_id 그룹고유값
     */
    private string $_id;

    /**
     * @var string $_title 그룹명
     */
    private string $_title;

    /**
     * @var ?string $_description 그룹설명
     */
    private ?string $_description = null;

    /**
     * @var int[] $_administrators 그룹구성원의 회원고유값
     */
    private array $_administrators;

    /**
     * @var \Closure $_getter 그룹구성원의 회원고유값을 가져오기 위한 함수
     */
    private \Closure $_getter;

    /**
     * @var ?int $_count 그룹구성원의 인원수 (NULL 인 경우 전체 구성원을 구한 뒤 인원수를 계산한다.)
     */
    private ?int $_count = null;

    /**
     * @var \modules\admin\dtos\Permission $_permission 그룹권한
     */
    private \modules\admin\dtos\Permission $_permission;

    /**
     * 관리자 그룹 구조체를 정의한다.
     *
     * @param \modules\admin\admin\Admin $admin 컨텍스트의 관리자클래스
     */
    public function __construct(\modules\admin\admin\Component $admin)
    {
        $this->_admin = $admin;
    }

    /**
     * 새로운 관리자 그룹 구조체를 가져온다.
     *
     * @param \modules\admin\admin\Admin $admin 컨텍스트의 관리자클래스
     * @return \modules\admin\dtos\Group $group
     */
    public static function init(\modules\admin\admin\Component $admin): \modules\admin\dtos\Group
    {
        return new \modules\admin\dtos\Group($admin);
    }

    /**
     * 관리자그룹을 정의한다.
     *
     * @param string $group_id 그룹아이디 (같은 컴포넌트내에서 중복중가)
     * @param string $title 그룹명
     * @return \modules\admin\dtos\Group $this
     */
    public function setGroup(string $group_id, string $title): \modules\admin\dtos\Group
    {
        $this->_id = $group_id;
        $this->_title = $title;
        return $this;
    }

    /**
     * 그룹설명을 설정한다.
     *
     * @param ?string $description 그룹설명
     * @return \modules\admin\dtos\Group $this
     */
    public function setDescription(?string $description): \modules\admin\dtos\Group
    {
        $this->_description = $description;
        return $this;
    }

    /**
     * 그룹설명을 가져온다.
     *
     * @return ?string $description 그룹설명
     */
    public function getDescription(): ?string
    {
        return $this->_description;
    }

    /**
     * 관리자그룹의 권한을 추가한다.
     *
     * @param \modules\admin\dtos\Permission $permission 권한
     * @return \modules\admin\dtos\Group $this
     */
    public function setPermission(\modules\admin\dtos\Permission $permission): \modules\admin\dtos\Group
    {
        $this->_permission = $permission;
        return $this;
    }

    /**
     * 관리자그룹의 권한을 가져온다.
     *
     * @return \modules\admin\dtos\Permission $permission
     */
    public function getPermission(): \modules\admin\dtos\Permission
    {
        return $this->_permission ?? \modules\admin\dtos\Permission::init();
    }

    /**
     * 그룹구성원의 회원고유값 배열을 받아오기 위한 콜백함수를 등록한다.
     *
     * @param callable $getter 콜백함수 ( ($this)=>int[] )
     * @return \modules\admin\dtos\Group $this
     */
    public function setGetter(callable $getter): \modules\admin\dtos\Group
    {
        $this->_getter = \Closure::fromCallable($getter);
        return $this;
    }

    /**
     * 이미 계산된 그룹구성원 인원수가 있다면 설정한다.
     *
     * @param ?int $count 그룹인원수 (NULL 인 경우 전체 구성원을 구한 뒤 인원수를 계산한다.)
     * @return \modules\admin\dtos\Group $this
     */
    public function setCount(?int $count = null): \modules\admin\dtos\Group
    {
        $this->_count = $count;
        return $this;
    }

    /**
     * 그룹을 소유한 컴포넌트의 관리자 클래스를 가져온다.
     *
     * @return \modules\admin\admin\Component $component
     */
    public function getAdmin(): \modules\admin\admin\Component
    {
        return $this->_admin;
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
     * 그룹 고유값을 가져온다.
     *
     * @return string $group_id
     */
    public function getId(): string
    {
        return $this->_id;
    }

    /**
     * 그룹 종류를 포함한 전체 그룹고유값을 가져온다.
     *
     * @return string $component_group_id
     */
    public function getGroupId(): string
    {
        if ($this->isUserGroup() == true) {
            return $this->_id;
        } else {
            return 'component-' .
                $this->getComponent()->getType() .
                '-' .
                $this->getComponent()->getName() .
                '-' .
                $this->_id;
        }
    }

    /**
     * 그룹종류를 가져온다.
     *
     * @return string $type (user : 사용자정의그룹, module|plugin : 컴포넌트에서 생성한 자동화그룹)
     */
    public function getType(): string
    {
        if ($this->isUserGroup() == true) {
            return 'user';
        } else {
            return $this->getComponent()->getType();
        }
    }

    /**
     * 그룹명을 가져온다.
     *
     * @return string $title
     */
    public function getTitle(): string
    {
        return $this->_title;
    }

    /**
     * 그룹구성원의 회원고유값을 배열로 가져온다.
     *
     * @return int[] $member_ids 회원고유값
     */
    public function getAdministrators(): array
    {
        if (isset($this->_administrators) == false) {
            if (isset($this->_getter) == true) {
                $member_ids = call_user_func_array($this->_getter, [$this]);
                if (is_array($member_ids) == true) {
                    return $member_ids;
                }
            }
        }

        return [];
    }

    /**
     * 그룹구성원의 인원수를 가져온다.
     *
     * @return int $administrators 그룹인원수
     */
    public function getCount(): int
    {
        return $this->_count ?? count($this->getAdministrators());
    }

    /**
     * 관리자그룹을 JSON 으로 가져온다.
     *
     * @return object $json
     */
    public function getJson(): object
    {
        $group = new \stdClass();
        $group->group_id = $this->getGroupId();
        $group->type = $this->getType();
        $group->title = $this->_title;
        $group->administrators = $this->getCount();
        $group->sort = 0;

        return $group;
    }

    /**
     * 관리자모듈에서 생성한 사용자정의그룹인지 확인한다.
     *
     * @return {bool} $is_user_group
     */
    private function isUserGroup(): bool
    {
        return $this->getComponent()->getType() == 'module' && $this->getComponent()->getName() == 'admin';
    }
}
