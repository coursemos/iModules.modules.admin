<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 그룹할당 구조체를 정의한다.
 *
 * @file /modules/admin/dtos/AdministratorGroup.php
 * @author sungjin <esung246@naddle.net>
 * @license MIT License
 * @modified 2025. 3. 19.
 */
namespace modules\admin\dtos;
class AdministratorGroup
{
    /**
     * @var int $_member_id 회원고유값
     */
    private int $_member_id;

    /**
     * @var string $_group_id 그룹고유값
     */
    private string $_group_id;

    /**
     * @var int $_assigned_at 그룹할당일시
     */
    private int $_assigned_at;

    /**
     * @var \modules\admin\dtos\Group $_group 그룹정보
     */
    private \modules\admin\dtos\Group $_group;

    /**
     * 관리자 그룹할당 구조체를 정의한다.
     *
     * @param $joined 그룹할당정보
     */
    public function __construct(object $assigned)
    {
        $this->_member_id = $assigned->member_id;
        $this->_group_id = $assigned->group_id;
        $this->_assigned_at = $assigned->assigned_at ?? 0;
    }

    /**
     * 회원고유값을 가져온다.
     *
     * @return int $member_id
     */
    public function getMemberId(): int
    {
        return $this->_member_id;
    }

    /**
     * 그룹고유값을 가져온다.
     *
     * @return string $group_id
     */
    public function getGroupId(): string
    {
        return $this->_group_id;
    }

    /**
     * 그룹에 할당된 시각
     *
     * @return int $assigned_at
     */
    public function getAssignedAt(): int
    {
        return $this->_assigned_at;
    }

    /**
     * 그룹정보를 가져온다.
     *
     * @return \modules\admin\dtos\Group $group
     */
    public function getGroup(): \modules\admin\dtos\Group
    {
        if (isset($this->_group) == false) {
            /**
             * @var \modules\admin\Admin $mAdmin
             */
            $mAdmin = \Modules::get('admin');
            $this->_group = $mAdmin->getAdminGroup($this->_group_id);
        }

        return $this->_group;
    }
}
