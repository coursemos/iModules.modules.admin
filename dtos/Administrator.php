<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 정보 구조체를 정의한다.
 *
 * @file /modules/admin/dtos/Administrator.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 8. 25.
 */
namespace modules\admin\dtos;
class Administrator
{
    /**
     * @var object $_administrator 관리자정보
     */
    private object $_administrator;

    /**
     * @var int $_member_id 회원고유값
     */
    private int $_member_id;

    /**
     * @var string $_language 관리자 언어설정
     */
    private string $_language;

    /**
     * @var string $_color 관리자 컬러모드
     */
    private string $_color;

    /**
     * @var ?string $_scale 관리자 스케일
     */
    private int $_scale;

    /**
     * @var \modules\admin\dtos\AdministratorGroup[] $_groups 관리자가 속한 그룹
     */
    private array $_groups;

    /**
     * @var \modules\admin\dtos\Context[] $_navigation 관리자 네비게이션 설정
     */
    private array $_navigation;

    /**
     * @var \modules\member\dtos\Member $_member
     */
    private \modules\member\dtos\Member $_member;

    /**
     * @var \modules\admin\dtos\Permission $_permission
     */
    private \modules\admin\dtos\Permission $_permission;

    /**
     * 관리자 정보 구조체를 정의한다.
     *
     * @param object $administrator
     */
    public function __construct($administrator)
    {
        $this->_administrator = $administrator;

        $this->_member_id = $administrator->member_id;
        $this->_language = $administrator->language ?? \Domains::get()->getLanguage();
        $this->_color = $administrator->color ?? 'auto';
        $this->_scale = $administrator->scale ?? 16;
        $this->_member_id = $administrator->member_id;
    }

    /**
     * 회원정보를 가져온다.
     *
     * @return \modules\member\dtos\Member $member
     */
    public function getMember(): \modules\member\dtos\Member
    {
        if (isset($this->_member) == false) {
            /**
             * @var \modules\member\Member $mMember
             */
            $mMember = \Modules::get('member');
            $this->_member = $mMember->getMember($this->_member_id);
        }

        return $this->_member;
    }

    /**
     * 회원고유값을 가져온다.
     *
     * @return int $member_id
     */
    public function getId(): int
    {
        return $this->_member_id;
    }

    /**
     * 관리자 컬러모드를 가져온다.
     *
     * @return string $color
     */
    public function getColor(): string
    {
        return $this->_color;
    }

    /**
     * 관리자 언어설정을 가져온다.
     *
     * @return int $scale
     */
    public function getScale(): int
    {
        return $this->_scale;
    }

    /**
     * 관리자 언어설정을 가져온다.
     *
     * @return string $langauge
     */
    public function getLanguage(): string
    {
        return $this->_language;
    }

    /**
     * 관리자그룹을 가져온다.
     *
     * @return \modules\admin\dtos\AdministratorGroup[] $groups
     */
    public function getGroups(): array
    {
        if (isset($this->_groups) == false) {
            /**
             * @var \modules\admin\Admin $mAdmin
             */
            $mAdmin = \Modules::get('admin');
            $this->_groups = [];
            $groups = $mAdmin
                ->db()
                ->select()
                ->from($mAdmin->table('group_administrators'))
                ->where('member_id', $this->_member_id)
                ->get();
            foreach ($groups as $group) {
                $this->_groups[] = new \modules\admin\dtos\AdministratorGroup($group);
            }

            /**
             * 관리자기능을 사용하는 모든 모듈에서 자동으로 할당된 관리자그룹을 가져온다.
             */
            foreach (\Modules::all() as $module) {
                foreach ($module->getAdmin()?->getMemberGroups($this->_member_id) ?? [] as $group) {
                    $this->_groups[] = new \modules\admin\dtos\AdministratorGroup(
                        (object) ['group_id' => $group->getGroupId(), 'member_id' => $this->_member_id]
                    );
                }
            }
        }

        return $this->_groups;
    }

    /**
     * 네비게이션 설정에 따라 컨텍스트 목록을 가져온다.
     *
     * @return \modules\admin\dtos\Context[] $navigation
     */
    public function getNavigation(): array
    {
        if (isset($this->_navigation) == false) {
            if ($this->isAdministrator() == false) {
                $this->_navigation = [];
                return [];
            }

            /**
             * 관리자모듈을 통해 전체 관리자 컨텍스트를 가져온다.
             *
             * @var \modules\admin\Admin $mAdmin
             */
            $mAdmin = \Modules::get('admin');
            $contexts = $mAdmin->getAdminContexts();

            $smarts = [];

            /**
             * 접속한 관리자 네비게이션 설정을 가져온다.
             */
            foreach ($this->_administrator->navigation ?? [] as $sort => $item) {
                $item = \modules\admin\dtos\NavigationItem::set($item, $sort, true);
                if ($item->isFolder() == true && $item->getSmart() !== 'none') {
                    $smarts[$item->getSmart()] = $item;
                }
            }

            $components = [];
            $components['module'] = new \stdClass();
            $components['module']->title = \Modules::get('admin')->getText('admin.navigation.folder.preset.module');
            $components['module']->icon = 'mi mi-module';
            $components['module']->smart = 'module';

            $components['plugin'] = new \stdClass();
            $components['plugin']->title = \Modules::get('admin')->getText('admin.navigation.folder.preset.plugin');
            $components['plugin']->icon = 'mi mi-plugin';
            $components['plugin']->smart = 'plugin';

            $components['widget'] = new \stdClass();
            $components['widget']->title = \Modules::get('admin')->getText('admin.navigation.folder.preset.widget');
            $components['widget']->icon = 'mi mi-widget';
            $components['widget']->smart = 'widget';

            if (isset($smarts['module']) == false) {
                $smarts['module'] = \modules\admin\dtos\NavigationItem::set($components['module'], 1, false);
            }

            if (isset($smarts['plugin']) == false) {
                $smarts['plugin'] = \modules\admin\dtos\NavigationItem::set($components['plugin'], 1, false);
            }

            if (isset($smarts['widget']) == false) {
                $smarts['widget'] = \modules\admin\dtos\NavigationItem::set($components['widget'], 1, false);
            }

            /**
             * 전체 관리자 컨텍스트를 가져온다.
             */
            foreach ($contexts as $path => $context) {
                /**
                 * 접속한 관리자 네비게이션 설정에 포함되어 있지 않은 경우, 현재 컨텍스트를 네비게이션에 추가한다.
                 */
                if (\modules\admin\dtos\NavigationItem::has($path) == true) {
                    continue;
                }

                /**
                 * 폴더에 포함되어 있는 경우
                 */
                if ($context->isRoot() === false) {
                    if ($context->getDefaultFolder() !== null) {
                        $folder = \modules\admin\dtos\NavigationItem::set(
                            $context->getDefaultFolder(),
                            $context->getDefaultFolderSort(),
                            false
                        );
                    } else {
                        $folder = $smarts[$context->getComponent()->getType()];
                    }

                    $folder->addChild($context->getPath(), $context->getSort());
                } else {
                    \modules\admin\dtos\NavigationItem::set($context->getPath(), $context->getSort(), false);
                }
            }

            /**
             * 네비게이션 설정에서 접근가능한 모든 네비게이션을 가져온다.
             */
            $this->_navigation = \modules\admin\dtos\NavigationItem::all($contexts);

            return $this->_navigation;
        }
    }

    /**
     * 관리자 권한을 가져온다.
     *
     * @param \modules\admin\dtos\Permission $permission
     */
    public function getPermission(): \modules\admin\dtos\Permission
    {
        if (isset($this->_permission) == false) {
            $permission = new \modules\admin\dtos\Permission();
            $permission->setPermissions($this->_administrator->permissions);

            if ($permission->getPermissions() === true) {
                $this->_permission = $permission;
                return $this->_permission;
            }

            /**
             * 현재 관리자가 속한 모든 관리자그룹을 가져와 그룹권한을 추가한다.
             */
            foreach ($this->getGroups() as $group) {
                $permission->addPermissions(
                    $group
                        ->getGroup()
                        ->getPermission()
                        ->getPermissions()
                );
            }

            $this->_permission = $permission;
        }

        return $this->_permission;
    }

    /**
     * 관리자 권한이 존재하는지 확인한다.
     *
     * @return bool $is_administrator 권리권한 존재여부
     */
    public function isAdministrator(): bool
    {
        return ($this->getPermission()?->getPermissions() ?? false) !== false;
    }

    /**
     * 최고관리자인지 확인한다.
     *
     * @return bool $is_master 최고관리자여부
     */
    public function isMaster(): bool
    {
        return ($this->getPermission()?->getPermissions() ?? false) === true;
    }

    /**
     * 설정하고자 하는 관리자권한에서 그룹으로 부터 받은 권한을 제외한 나머지 권한을 관리자권한으로 갱신한다.
     *
     * @param \modules\admin\dtos\Permission $permission 설정할 권한
     * @return \modules\admin\dtos\Permission $permission 최종 설정권한
     */
    public function updatePermissions(\modules\admin\dtos\Permission $permission): \modules\admin\dtos\Permission
    {
        $permissions = new \modules\admin\dtos\Permission();
        foreach ($this->getGroups() as $group) {
            $permissions->addPermissions(
                $group
                    ->getGroup()
                    ->getPermission()
                    ->getPermissions()
            );
        }

        $permission->separate($permissions->getPermissions());

        return $permission;
    }

    /**
     * 관리자정보를 업데이트한다.
     * 관리자 권한이 존재하나, 관리자 정보가 데이터베이스에 없는 경우에는 관리자정보를 추가한 뒤 정보를 업데이트한다.
     *
     * @param array $updated 업데이트 할 정보
     * @return bool $success
     */
    public function update(array $updated): bool
    {
        /**
         * @var \modules\admin\Admin $mAdmin
         */
        $mAdmin = \Modules::get('admin');
        $checked = $mAdmin
            ->db()
            ->select()
            ->from($mAdmin->table('administrators'))
            ->where('member_id', $this->getId())
            ->getOne();

        if ($checked === null) {
            if ($this->isAdministrator() === false) {
                return false;
            }
        }

        $insert = array_merge(['member_id' => $this->getId()], $updated);
        $results = $mAdmin
            ->db()
            ->insert($mAdmin->table('administrators'), $insert, array_keys($updated))
            ->execute();

        return $results->success;
    }

    /**
     * 네비게이션 설정에 따라 컨텍스트 목록을 가져온다.
     *
     * @return object $json
     */
    public function getJson(): object
    {
        $administrator = new \stdClass();
        $administrator->member_id = $this->_member_id;
        $administrator->name = $this->getMember()->getName();
        $administrator->photo = $this->getMember()->getPhoto();
        $administrator->email = $this->getMember()->getEmail();
        $administrator->logged_at = $this->getMember()->getLoggedAt();

        $administrator->member_groups = [];
        foreach ($this->getMember()->getGroups(true) as $group) {
            $administrator->member_groups[] = $group->getGroup()->getTitle();
        }
        sort($administrator->member_groups);

        $administrator->administrator_groups = [];
        foreach ($this->getGroups() as $group) {
            $administrator->administrator_groups[] = $group->getGroup()->getTitle();
        }
        sort($administrator->administrator_groups);

        return $administrator;
    }
}
