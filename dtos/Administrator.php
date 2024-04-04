<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 정보 구조체를 정의한다.
 *
 * @file /modules/admin/dtos/Administrator.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 4. 5.
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

            /**
             * 접속한 관리자 네비게이션 설정을 가져온다.
             */
            $navigation = $this->_administrator->navigation;

            /**
             * 네비게이션 설정이 없다면 기본메뉴 설정을 생성한다.
             */
            if ($navigation === null) {
                $navigation = ['/dashboard'];

                $components = new \stdClass();
                $components->title = '@components';
                $components->icon = 'xi xi-cube';
                $components->smart = 'components';
                $components->children = [];
                $navigation[] = $components;

                $modules = new \stdClass();
                $modules->title = '@modules';
                $modules->icon = 'mi mi-module';
                $modules->smart = 'modules';
                $modules->children = [];
                $navigation[] = $modules;

                $plugins = new \stdClass();
                $plugins->title = '@plugins';
                $plugins->icon = 'mi mi-plugin';
                $plugins->smart = 'plugins';
                $plugins->children = [];
                $navigation[] = $plugins;

                $navigation[] = '/sitemap';
                $navigation[] = '/administrators';
                $navigation[] = '/database';
            }

            /**
             * 메뉴설정에서 스마트폴더 설정을 검색한다.
             */
            $folders = [];
            $exists = [];
            $smarts = [];
            foreach ($navigation as $item) {
                if (is_object($item) == true) {
                    $folders[$item->title] = $item;

                    if ($item->smart !== null) {
                        $smarts[$item->smart] = $item;
                    }

                    foreach ($item->children as $child) {
                        $exists[] = $child;
                    }
                } else {
                    $exists[] = $item;
                }
            }

            /**
             * 기존 메뉴설정에서 누락된 신규 관리자메뉴를 추가한다.
             */
            foreach ($contexts as $path => $context) {
                if (in_array($path, $exists) == true) {
                    continue;
                }

                if ($context->getDefaultFolderTitle() !== null) {
                    if (isset($folders[$context->getDefaultFolderTitle()]) == true) {
                        $folders[$context->getDefaultFolderTitle()]->children[] = $path;
                    } else {
                        $folder = new \stdClass();
                        $folder->icon = $context->getDefaultFolderIcon();
                        $folder->smart = 'none';
                        $folder->title = $context->getDefaultFolderTitle();
                        $folder->children = [$path];
                        $folders[$context->getDefaultFolderTitle()] = $folder;
                        $navigation[] = $folder;
                    }

                    continue;
                }

                if (in_array($path, ['/modules', '/plugins', '/widgets']) == true) {
                    $smarts['components']->children[] = $path;
                    continue;
                }

                if ($context->getComponent()->getType() == 'module' && isset($smarts['modules']) == true) {
                    $smarts['modules']->children[] = $path;
                    continue;
                }

                if ($context->getComponent()->getType() == 'plugin' && isset($smarts['plugins']) == true) {
                    $smarts['plugins']->children[] = $path;
                    continue;
                }

                if ($context->getComponent()->getType() == 'widget' && isset($smarts['widgets']) == true) {
                    $smarts['widgets']->children[] = $path;
                    continue;
                }

                $navigation[] = $path;
            }

            /**
             * 최종 메뉴설정에서 권한여부를 확인하고 네비게이션을 재설정한다.
             */
            $this->_navigation = [];
            foreach ($navigation as $item) {
                if (is_string($item) == true) {
                    if (isset($contexts[$item]) == false) {
                        continue;
                    }

                    $this->_navigation[] = $contexts[$item];
                } else {
                    $children = [];
                    foreach ($item->children as $child) {
                        if (isset($contexts[$child]) == false) {
                            continue;
                        }

                        $children[] = $contexts[$child];
                    }

                    if (strpos($item->title, '@') === 0) {
                        if (count($children) == 0) {
                            continue;
                        }

                        $item->title = $mAdmin->getText('admin.navigation.folder.preset.' . substr($item->title, 1));
                    }

                    $folder = new \modules\admin\dtos\Context($mAdmin->getAdmin());
                    $folder->setTitle($item->title, $item->icon);
                    $folder->setFolder($children, $item->smart);

                    $this->_navigation[] = $folder;
                }
            }

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
