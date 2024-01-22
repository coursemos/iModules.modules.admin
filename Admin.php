<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 클래스를 정의한다.
 * 아이모듈 관리자 페이지를 구성한다.
 *
 * @file /modules/admin/Admin.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
namespace modules\admin;
class Admin extends \Module
{
    /**
     * @var \modules\admin\dtos\Context[] $_contexts 전체 관리자 컨텍스트 정보
     */
    private static array $_contexts;

    /**
     * @var \modules\admin\dtos\Context[] $_tree 유저가 설정한 컨텍스트 트리
     */
    private static array $_tree;

    /**
     * @var \modules\admin\admin\Admin[] $_classes 각 컴포넌트의 관리자 클래스
     */
    private static array $_classes = [];

    /**
     * @var array $_administrators 관리자 회원정보
     */
    private static array $_administrators = [];

    /**
     * @var array $_permissions 관리자 권한정보
     */
    private static array $_permissions = [];

    /**
     * 모듈 설정을 초기화한다.
     */
    public function init(): void
    {
        /**
         * 관리자 페이지를 위한 모듈 라우터를 초기화한다.
         */
        \Router::add('/admin', '#', 'html', [$this, 'doRoute']);
        \Router::add('/admin/*', '#', 'html', [$this, 'doRoute']);

        \Router::add('/preview', '#', 'html', [$this, 'doPreview']);
        \Router::add('/preview/*', '#', 'html', [$this, 'doPreview']);
    }

    /**
     * 전체 관리자 메뉴를 초기화한다.
     */
    public function initContexts(): void
    {
        if (isset(self::$_contexts) === false) {
            self::$_contexts = [];
            foreach (\Modules::all() as $module) {
                $this->getAdminClass($module)?->init();
            }

            uksort(self::$_contexts, function ($left, $right) {
                return $left <=> $right;
            });
        }
    }

    /**
     * 관리자 컨텍스트를 추가한다.
     */
    public function addContext(\modules\admin\dtos\Context $context): void
    {
        if (isset(self::$_contexts[$context->getPath()]) == true) {
            \ErrorHandler::print(
                $this->error(
                    'DUPLICATED_ADMIN_CONTEXT_PATH',
                    $context->getPath(),
                    self::$_contexts[$context->getPath()]
                )
            );
        }
        self::$_contexts[$context->getPath()] = $context;
    }

    /**
     * 관리자 정보를 가져온다.
     *
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @return ?object $member
     */
    public function getAdministrator(?int $member_id = null): ?object
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        //$mMember->loginTo(84, false);
        $member_id ??= $mMember->getLogged();
        if ($member_id === 0) {
            return null;
        }

        if (isset(self::$_administrators[$member_id]) == true) {
            return self::$_administrators[$member_id];
        }

        $administrator = $this->db()
            ->select()
            ->from($this->table('administrators'))
            ->where('member_id', $member_id)
            ->getOne();

        if ($administrator !== null) {
            $administrator->language ??= \Domains::get()->getLanguage();
            $administrator->contexts = json_decode($administrator->contexts ?? 'null');
            $administrator->permissions = json_decode($administrator->permissions ?? 'null');
        }

        self::$_administrators[$member_id] = $administrator;

        return self::$_administrators[$member_id];
    }

    /**
     * 관리자 전체 컨텍스트를 가져온다.
     *
     * @param bool $is_all_contexts 전체 컨텍스트를 경로와 함께 반환할지 여부
     * @return \modules\admin\dtos\Context[] $contexts
     */
    public function getAdminContexts(bool $is_all_contexts = false): array
    {
        if (isset(self::$_tree) === true) {
            return self::$_tree;
        }

        $this->initContexts();
        if ($is_all_contexts === true) {
            return self::$_contexts;
        }

        $contexts = $this->getAdministrator()->contexts;

        /**
         * 메뉴설정이 없다면 기본메뉴 설정을 생성한다.
         */
        if ($contexts == null) {
            $tree = ['/dashboard', '/members', '/modules', '/plugins'];

            $modules = new \stdClass();
            $modules->title = '@modules';
            $modules->icon = 'xi xi-box';
            $modules->smart = 'modules';
            $modules->children = [];
            $tree[] = $modules;

            $plugins = new \stdClass();
            $plugins->title = '@plugins';
            $plugins->icon = 'xi xi-plug';
            $plugins->smart = 'plugins';
            $plugins->children = [];
            $tree[] = $plugins;

            $tree[] = '/sites';
            $tree[] = '/administrators';
            $tree[] = '/database';
        } else {
            $tree = $contexts;
        }

        /**
         * 메뉴설정에서 스마트폴더 설정을 검색한다.
         */
        $exists = [];
        $smarts = [];
        foreach ($tree as $index => $item) {
            if (is_object($item) == true) {
                if ($item->smart !== null) {
                    $smarts[$item->smart] = $index;
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
        foreach (self::$_contexts as $path => $item) {
            if (in_array($path, $exists) == true) {
                continue;
            }

            if (strpos($path, '/module/') === 0 && isset($smarts['modules']) == true) {
                $tree[$smarts['modules']]->children[] = $path;
                continue;
            }

            if (strpos($path, '/plugin/') === 0 && isset($smarts['plugins']) == true) {
                $tree[$smarts['plugins']]->children[] = $path;
                continue;
            }

            $tree[] = $path;
        }

        /**
         * 최종 메뉴설정에서 권한여부를 확인하고 컨텍스트를 반환한다.
         */
        $contexts = [];
        foreach ($tree as $item) {
            if (is_string($item) == true) {
                if (isset(self::$_contexts[$item]) == false) {
                    continue;
                }

                $contexts[] = self::$_contexts[$item];
            } else {
                $children = [];
                foreach ($item->children as $child) {
                    if (isset(self::$_contexts[$child]) == false) {
                        continue;
                    }

                    $children[] = self::$_contexts[$child];
                }

                if (strpos($item->title, '@') === 0) {
                    if (count($children) == 0) {
                        continue;
                    }

                    $item->title = $this->getText('admin.navigation.folder.preset.' . substr($item->title, 1));
                }

                $folder = new \modules\admin\dtos\Context($this->getAdminClass($this), $item->title, $item->icon);
                $folder->setFolder($children, $item->smart);

                $contexts[] = $folder;
            }
        }

        self::$_tree = $contexts;

        return self::$_tree;
    }

    /**
     * 현재 사용자의 관리자 언어코드를 가져온다.
     *
     * @return string $langauge
     */
    public function getLanguage(): string
    {
        return $this->getAdministrator()?->language ?? \Request::languages(true);
    }

    /**
     * 현재 관리자 경로에 해당하는 컨텍스트를 가져온다.
     *
     * @param \Route $route 현재 경로
     * @return ?\modules\admin\dtos\Context $context
     */
    public function getAdminContext(\Route $route): ?\modules\admin\dtos\Context
    {
        $contexts = $this->getAdminContexts();
        $paths = array_keys(self::$_contexts);

        $routes = explode('/', $route->getSubPath());

        /**
         * 관리자 루트인 경우, 관리자의 첫번째 컨텍스트를 반환한다.
         */
        if (count($routes) == 1) {
            foreach ($contexts as $context) {
                if ($context->getType() == 'FOLDER') {
                    foreach ($context->getChildren() as $child) {
                        if ($child->getType() != 'LINK') {
                            return $child;
                        }
                    }
                } elseif ($context->getType() != 'LINK') {
                    return $context;
                }
            }

            return self::$_contexts['/dashboard'];
        }

        /**
         * 전체 컨텍스트에서 경로와 일치하는 컨텍스트를 찾는다.
         */
        while (count($routes) > 1) {
            $path = implode('/', $routes);
            if (in_array($path, $paths) == true) {
                return self::$_contexts[$path];
                break;
            }

            array_pop($routes);
        }

        return null;
    }

    /**
     * 각 컴포넌트의 관리자 클래스를 가져온다.
     *
     * @param \Component $component 컴포넌트객체
     * @return ?\modules\admin\admin\Admin $admin
     */
    public function getAdminClass(\Component $component): ?\modules\admin\admin\Admin
    {
        $classPaths = explode('/', $component->getName());
        $className = ucfirst(end($classPaths));
        $className =
            '\\' . $component->getType() . 's\\' . implode('\\', $classPaths) . '\\admin\\' . $className . 'Admin';
        if (class_exists($className) == false) {
            return null;
        }

        if (isset(self::$_classes[$className]) == true) {
            return self::$_classes[$className];
        }

        self::$_classes[$className] = new $className($this);
        return self::$_classes[$className];
    }

    /**
     * 사용자의 관리자 그룹 권한을 포함한 전체 관리자 권한을 가져온다.
     *
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @return array|bool $permissions 권한
     */
    public function getAdministratorPermissions(?int $member_id = null): array|bool
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        $member_id ??= $mMember->getLogged();
        if ($member_id === 0) {
            return false;
        }

        if (isset(self::$_permissions[$member_id]) == true) {
            return self::$_permissions[$member_id];
        }

        $administrator = $this->getAdministrator($member_id);
        if ($administrator === null) {
            $permissions = false;
        } else {
            $permissions = $administrator->permissions;

            $groups = $this->db()
                ->select(['g.group_id', 'g.title', 'g.permissions'])
                ->from($this->table('group_administrators'), 'ag')
                ->join($this->table('groups'), 'g', 'g.group_id=ag.group_id', 'LEFT')
                ->where('ag.member_id', $member_id)
                ->orderBy('g.title', 'ASC')
                ->get();

            foreach ($groups as $group) {
                $permissions = $this->mergePermissions($permissions, json_decode($group->permissions ?? [], true));
            }
        }

        self::$_permissions[$member_id] = $permissions;

        return self::$_permissions[$member_id];
    }

    /**
     * 두개의 권한을 병합한다.
     *
     * @param array|bool $left
     * @param array|bool $right
     * @return array|bool $permissions
     */
    public function mergePermissions(array|bool $left, array|bool $right): array|bool
    {
        if ($left === true || $right === true) {
            return true;
        }

        if ($left === false && $right === false) {
            return false;
        }

        if ($left === false) {
            return $right;
        }

        if ($right === false) {
            return $left;
        }

        $merged = $left;
        foreach ($merged as $component => $types) {
            if ($types === true) {
                continue;
            }

            if (isset($right[$component]) == true) {
                if ($right[$component] === true) {
                    $merged[$component] = true;
                } else {
                    foreach ($types as $type => $permissions) {
                        if ($permissions === true) {
                            continue;
                        }

                        if (isset($right[$component][$type]) == true) {
                            if ($right[$component][$type] === true) {
                                $merged[$component][$type] = true;
                            } else {
                                $merged[$component][$type] = array_values(
                                    array_unique(array_merge($permissions, $right[$component][$type]))
                                );
                            }
                        }
                    }
                }
            }
        }

        foreach ($right as $component => $types) {
            if (isset($merged[$component]) == false) {
                $merged[$component] = $types;
            }
        }

        return $merged;
    }

    /**
     * 관리자 권한이 있는지 사용자인지 확인한다.
     *
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @return bool $is_admin
     */
    public function isAdministrator(?int $member_id = null): bool
    {
        return $this->getAdministratorPermissions($member_id) !== false;
    }

    /**
     * 최고관리자인지 확인한다.
     *
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @return bool $is_master 최고관리자 여부
     */
    public function isMaster(?int $member_id = null): bool
    {
        return $this->getAdministratorPermissions($member_id) === true;
    }

    /**
     * 관리자페이지 라우팅을 처리한다.
     *
     * @param \Route $route 현재경로
     */
    public function doRoute(\Route $route): string
    {
        /**
         * 아이모듈 관리자 테마를 설정한다.
         */
        $theme = new \Theme($this->getConfigs('theme'));

        /**
         * 현재 접속한 유저의 정보를 가져온다.
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        $member = $mMember->getMember();

        /**
         * 웹폰트를 불러온다.
         */
        \Html::font('XEIcon');
        \Html::font('FontAwesome');

        /**
         * 관리자 기본 리소스를 불러온다.
         */
        \Html::script($this->getBase() . '/scripts/script.js');
        \Html::style($this->getBase() . '/styles/styles.css');

        /**
         * 관리자가 아니라면 로그인 레이아웃을 출력한다.
         */
        if ($this->isAdministrator() == false) {
            /**
             * BODY 타입을 지정한다.
             */
            \Html::body('data-type', 'login');

            return $theme->getLayout('login');
        }

        /**
         * BODY 타입을 지정한다.
         */
        \Html::body('data-type', 'admin');

        $theme->assign('mMember', $mMember);
        $theme->assign('member', $member);

        $context = $this->getAdminContext($route);
        if ($context === null) {
            \ErrorHandler::print(\ErrorHandler::error('NOT_FOUND_URL'));
        }

        if (
            $context->getPath() != '/' &&
            preg_match('/^' . \Format::reg($context->getPath()) . '/', $route->getSubPath()) == false
        ) {
            \Header::location($route->getUrl() . $context->getPath());
        }

        /**
         * 기본 자바스크립트파일을 불러온다.
         * 사용되는 모든 스크립트 파일을 캐시를 이용해 압축한다.
         */

        \Cache::script('admin.interfaces', $this->getBase() . '/admin/scripts/Admin.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Base.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Loading.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Ajax.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Scroll.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Drag.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Resizer.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Data.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.TreeData.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Component.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Absolute.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Store.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.TreeStore.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Title.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Text.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Button.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Panel.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Explorer.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Toolbar.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Tab.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Grid.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Tree.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Form.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Window.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Message.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Viewport.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Menu.js');
        \Html::script(\Cache::script('Aui'), 10);
        foreach (\Modules::all(false) as $module) {
            if (is_file($module->getPath() . '/admin/scripts/' . $module->getClassName() . 'Admin.js') == true) {
                \Cache::script(
                    'admin.interfaces',
                    $module->getBase() . '/admin/scripts/' . $module->getClassName() . 'Admin.js'
                );
            }

            $scripts = $this->getAdminClass($module)?->scripts() ?? [];
            foreach ($scripts as $script) {
                \Cache::script('admin.interfaces', $script);
            }
        }
        \Html::script(\Cache::script('admin.interfaces'), 15);


        \Cache::style('admin.interfaces', $this->getBase() . '/admin/styles/Admin.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Base.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Loading.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Scroll.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Component.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Absolute.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Resizer.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Title.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Text.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Button.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Panel.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Explorer.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Toolbar.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Tab.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Grid.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Tree.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Form.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Window.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Message.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Viewport.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Menu.css');
        \Html::style(\Cache::style('Aui'), 10);
        foreach (\Modules::all() as $module) {
            if (is_file($module->getPath() . '/admin/styles/' . $module->getClassName() . 'Admin.css') == true) {
                \Cache::style(
                    'admin.interfaces',
                    $module->getBase() . '/admin/styles/' . $module->getClassName() . 'Admin.css'
                );
            }

            if (is_file($module->getPath() . '/admin/styles/' . $module->getClassName() . 'Admin.css') == true) {
                \Cache::style(
                    'admin.interfaces',
                    $module->getBase() . '/admin/styles/' . $module->getClassName() . 'Admin.css'
                );
            }

            $styles = $this->getAdminClass($module)?->styles() ?? [];
            foreach ($styles as $style) {
                \Cache::style('admin.interfaces', $style);
            }
        }
        \Html::style(\Cache::style('admin.interfaces'), 15);

        $subPath = preg_replace('/^' . \Format::reg($context->getPath()) . '/', '', $route->getSubPath());
        $theme->assign('content', $context->getContent($subPath ? $subPath : null));

        \Html::body('data-context-url', $context->getPath());

        return $theme->getLayout('admin');
    }

    /**
     * 관리자페이지 라우팅을 처리한다.
     *
     * @param \Route $route 현재경로
     */
    public function doPreview(\Route $route): string
    {
        $subPath = explode('/', $route->getSubPath());
        $type = $subPath[1];
        $is_viewer = end($subPath) === 'viewer';

        \Html::style($this->getBase() . '/styles/preview.css');
        \Html::body('data-type', 'preview');

        if ($is_viewer === true) {
            \Cache::use(false);
            if ($type == 'page') {
                \Html::body('data-preview', 'page');

                $host = \Request::get('host', true);
                $language = \Request::get('language', true);
                $page = \Request::get('page', true);

                $site = \Sites::get($host, $language);
                $theme = $site->getTheme();
                $theme->assign('site', $site);
                $theme->assign('route', \Router::get('/'));
                $theme->assign('context', \Contexts::get(\Router::get('/')));
                return $theme->getLayout('NONE', $theme->getPage($page));
            }
        } else {
            \Html::script($this->getBase() . '/scripts/preview.js');
            \Html::body('data-preview', 'body');

            if ($type == 'page') {
                $host = \Request::get('host', true);
                $language = \Request::get('language', true);
                $page = \Request::get('page', true);

                $queryString = [
                    'host' => $host,
                    'language' => $language,
                    'page' => $page,
                ];
            }

            $src = $route->getSubUrl('/' . $type . '/viewer', $queryString);
            $frame = \Html::element('iframe', ['src' => $src, 'frameborder' => 0], 'NOT_SUPPORTED');

            return \Html::element('div', ['id' => 'preview', 'style' => 'width:1400px;'], $frame);
        }
    }

    /**
     * 특수한 에러코드의 경우 에러데이터를 현재 클래스에서 처리하여 에러클래스로 전달한다.
     *
     * @param string $code 에러코드
     * @param ?string $message 에러메시지
     * @param ?object $details 에러와 관련된 추가정보
     * @return \ErrorData $error
     */
    public function error(string $code, ?string $message = null, ?object $details = null): \ErrorData
    {
        switch ($code) {
            /**
             * 관리자 컨텍스트 URL 이 이미 정의된 경우
             */
            case 'DUPLICATED_ADMIN_CONTEXT_PATH':
                $error = \ErrorHandler::data($code, $this);
                $error->message = $this->getErrorText('DUPLICATED_ADMIN_CONTEXT_PATH', [
                    'path' => $message,
                    'name' => $details->getComponent()->getTitle($this->getLanguage()),
                    'component' => get_class($details->getComponent()),
                ]);
                return $error;

            /**
             * 권한이 부족한 경우, 로그인이 되어 있지 않을 경우, 로그인관련 에러메시지를 표시하고
             * 그렇지 않은 경우 권한이 부족하다는 에러메시지를 표시한다.
             */
            case 'FORBIDDEN':
                $error = \ErrorHandler::data($code, $this);
                /**
                 * @var ModuleMember $mMember
                 */
                $mMember = \Modules::get('member');
                if ($mMember->isLogged() == true) {
                    $error->prefix = $this->getErrorText('FORBIDDEN');
                    $error->message = $this->getErrorText('FORBIDDEN_DETAIL', [
                        'code' => $this->getErrorText('FORBIDDEN_CODE/' . $message),
                    ]);
                } else {
                    $error->prefix = $this->getErrorText('REQUIRED_LOGIN');
                }
                return $error;

            default:
                return parent::error($code, $message, $details);
        }
    }

    /**
     * 관리자모듈이 설치된 이후 최고관리자(회원고유값=1) 권한을 설정한다.
     *
     * @param string $previous 이전설치버전 (NULL 인 경우 신규설치)
     * @param object $configs 모듈설정
     * @return bool $success 설치성공여부
     */
    public function install(string $previous = null, object $configs = null): bool
    {
        $success = parent::install($previous);
        if ($success == true) {
            $this->db()
                ->replace($this->table('administrators'), [
                    'member_id' => 1,
                    'language' => $this->getLanguage(),

                    'permissions' => 'true',
                ])
                ->execute();
        }

        return $success;
    }
}
