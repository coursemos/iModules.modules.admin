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
 * @modified 2023. 6. 3.
 */
namespace modules\admin;
class Admin extends \Module
{
    /**
     * @var \modules\admin\dto\Context[] $_contexts 전체 관리자 컨텍스트 정보
     */
    private static array $_contexts;

    /**
     * @var \modules\admin\dto\Context[] $_tree 유저가 설정한 컨텍스트 트리
     */
    private static array $_tree;

    /**
     * @var \modules\admin\admin\Admin[] $_classes 각 컴포넌트의 관리자 클래스
     */
    private static array $_classes = [];

    /**
     * @var object $_member 개인화 설정
     */
    private static $_member;

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
            foreach (\Modules::all() as $module) {
                $this->getAdminClass('module', $module->getName())?->init();
            }

            uksort(self::$_contexts, function ($left, $right) {
                return $left <=> $right;
            });
        }
    }

    /**
     * 관리자 컨텍스트를 추가한다.
     */
    public function addContext(\modules\admin\dto\Context $context): void
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
     * 관리자 개인화 설정을 가져온다.
     *
     * @return object $member
     */
    public function getMember(): object
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        $member_id = $mMember->getLogged();

        if (isset(self::$_member) == true && self::$_member->member_id == $member_id) {
            return self::$_member;
        }

        $member = $this->db()
            ->select()
            ->from($this->table('members'))
            ->where('member_id', $member_id)
            ->getOne();
        if ($member == null) {
            $this->db()
                ->replace($this->table('members'), [
                    'member_id' => $member_id,
                    'language' => \Request::languages(true),
                    'contexts' => 'null',
                ])
                ->execute();
            $member = new \stdClass();
            $member->member_id = $member_id;
            $member->language = \Request::languages(true);
            $member->contexts = null;
        } else {
            $member->contexts = json_decode($member->contexts);
        }

        self::$_member = $member;

        return self::$_member;
    }

    /**
     * 관리자 전체 컨텍스트를 가져온다.
     *
     * @param bool $is_all_contexts 전체 컨텍스트를 경로와 함께 반환할지 여부
     * @return \modules\admin\dto\Context[] $contexts
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

        $contexts = $this->getMember()->contexts;

        /**
         * 메뉴설정이 없다면 기본메뉴 설정을 생성한다.
         */
        if ($contexts == null) {
            $tree = ['/', '/modules', '/plugins'];

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

            $sites = new \stdClass();
            $sites->title = '@sites';
            $sites->icon = 'xi xi-home';
            $sites->smart = 'none';
            $sites->children = ['/sites', '/sitemap'];
            $tree[] = $sites;

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
                if ($this->checkPermission($item) !== false) {
                    $contexts[] = self::$_contexts[$item];
                }
            } else {
                $children = [];
                foreach ($item->children as $child) {
                    if ($this->checkPermission($child) !== false) {
                        $children[] = self::$_contexts[$child];
                    }
                }

                if (strpos($item->title, '@') === 0) {
                    if (count($children) == 0) {
                        continue;
                    }

                    $item->title = $this->getText('admin.navigation.folder.preset.' . substr($item->title, 1));
                }

                $folder = new \modules\admin\dto\Context(
                    $this->getAdminClass('module', 'admin'),
                    $item->title,
                    $item->icon
                );
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
        return $this->getMember()->language;
    }

    /**
     * 현재 관리자 경로에 해당하는 컨텍스트를 가져온다.
     *
     * @param \Route $route 현재 경로
     * @return ?\modules\admin\dto\Context $context
     */
    public function getAdminContext(\Route $route): ?\modules\admin\dto\Context
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
     * @return ?\modules\admin\admin\Admin $admin
     */
    public function getAdminClass(string $type, string $name): ?\modules\admin\admin\Admin
    {
        if (in_array($type, ['module', 'plugin', 'widget']) == false) {
            return null;
        }
        $classPaths = explode('/', $name);
        $className = ucfirst(end($classPaths));
        $className = '\\' . $type . 's\\' . implode('\\', $classPaths) . '\\admin\\' . $className . 'Admin';
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
     * 관리자 권한이 있는지 사용자인지 확인한다.
     *
     * @return bool $is_admin
     */
    public function hasPermission(): bool
    {
        return true;
    }

    /**
     * 특정경로의 관리자 권한을 확인한다.
     *
     * @param string $path
     * @return bool|string $permission
     */
    public function checkPermission(string $path): bool|string
    {
        $this->initContexts();
        $context = self::$_contexts[$path] ?? null;
        if ($context == null) {
            return false;
        }

        return true;
    }

    /**
     * 관리자페이지 라우팅을 처리한다.
     *
     * @param \Route $route 현재경로
     */
    public function doRoute(\Route $route): string
    {
        $context = $this->getAdminContext($route);
        if ($context === null) {
            \ErrorHandler::print('NOT_FOUND_URL');
        }

        if (preg_match('/^' . \Format::reg($context->getPath()) . '/', $route->getSubPath()) == false) {
            \Header::location($route->getUrl() . $context->getPath());
        }

        if ($this->checkPermission($context->getPath()) === false) {
            \ErrorHandler::print('FORBIDDEN');
        }

        /**
         * 기본 자바스크립트파일을 불러온다.
         * 사용되는 모든 스크립트 파일을 캐시를 이용해 압축한다.
         */
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Base.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Loading.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Ajax.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Scrollbar.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Drag.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Resizer.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Data.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Component.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Absolute.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Store.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Title.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Text.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Button.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Panel.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Explorer.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.List.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Toolbar.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Tab.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Grid.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Form.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Window.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Message.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Viewport.js');
        \Cache::script('admin', $this->getBase() . '/scripts/Admin.Menu.js');
        \Html::script(\Cache::script('admin'), 10);

        \Cache::script('admin.interfaces', $this->getBase() . '/admin/scripts/Admin.js');
        foreach (\Modules::all() as $module) {
            if (is_file($module->getPath() . '/admin/scripts/' . $module->getClassName() . 'Admin.js') == true) {
                \Cache::script(
                    'admin.interfaces',
                    $module->getBase() . '/admin/scripts/' . $module->getClassName() . 'Admin.js'
                );
            }

            $scripts = $this->getAdminClass('module', $module->getName())?->scripts() ?? [];
            foreach ($scripts as $script) {
                \Cache::script('admin.interfaces', $script);
            }
        }
        \Html::script(\Cache::script('admin.interfaces'), 15);

        \Cache::style('admin', $this->getBase() . '/styles/Admin.Base.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Loading.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Scrollbar.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Component.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Absolute.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Resizer.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Title.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Text.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Button.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Panel.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Explorer.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.List.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Toolbar.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Tab.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Grid.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Form.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Window.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Message.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Viewport.scss');
        \Cache::style('admin', $this->getBase() . '/styles/Admin.Menu.scss');
        \Html::style(\Cache::style('admin'), 10);

        \Cache::style('admin.interfaces', $this->getBase() . '/admin/styles/Admin.scss');
        foreach (\Modules::all() as $module) {
            if (is_file($module->getPath() . '/admin/styles/' . $module->getClassName() . 'Admin.css') == true) {
                \Cache::style(
                    'admin.interfaces',
                    $module->getBase() . '/admin/styles/' . $module->getClassName() . 'Admin.css'
                );
            }

            if (is_file($module->getPath() . '/admin/styles/' . $module->getClassName() . 'Admin.scss') == true) {
                \Cache::style(
                    'admin.interfaces',
                    $module->getBase() . '/admin/styles/' . $module->getClassName() . 'Admin.scss'
                );
            }

            $styles = $this->getAdminClass('module', $module->getName())?->styles() ?? [];
            foreach ($styles as $style) {
                \Cache::style('admin.interfaces', $style);
            }
        }
        \Html::style(\Cache::style('admin.interfaces'), 15);

        /**
         * 웹폰트를 불러온다.
         */
        \Html::font('XEIcon');
        \Html::font('FontAwesome');

        /**
         * 현재 접속한 유저의 정보를 가져온다.
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        $member = $mMember->getMember();

        /**
         * 아이모듈 관리자 테마를 설정한다.
         */
        $theme = new \Theme($this->getConfigs('theme'));
        $theme->assign('mMember', $mMember);
        $theme->assign('member', $member);

        $subPath = preg_replace('/^' . \Format::reg($context->getPath()) . '/', '', $route->getSubPath());
        $theme->assign('content', $context->getContent($subPath ? $subPath : null));

        \Html::body('data-context-url', $context->getPath());

        return $theme->getLayout();
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

        \Html::style($this->getBase() . '/styles/preview.scss');
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
                $error = \ErrorHandler::data();
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
                $error = \ErrorHandler::data();
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
     * 관리자모듈이 설치된 이후 관리자 메뉴를 업데이트한다.
     *
     * @param string $previous 이전설치버전 (NULL 인 경우 신규설치)
     * @param object $configs 모듈설정
     * @return bool $success 설치성공여부
     */
    public function install(string $previous = null, object $configs = null): bool
    {
        $success = parent::install($previous);
        if ($success == true) {
            /**
             * @var \modules\admin\Admin $mAdmin
             */
            //$mAdmin = \Modules::get('admin');
        }

        return $success;
    }
}
