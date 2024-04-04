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
 * @modified 2024. 4. 4.
 */
namespace modules\admin;
class Admin extends \Module
{
    /**
     * @var \modules\admin\dtos\Administrator[] $_administrators 관리자 회원 정보
     */
    private static array $_administrators = [];

    /**
     * @var \modules\admin\dtos\Context[] $_contexts 전체 컴포넌트의 관리자 컨텍스트 정보
     */
    private static array $_contexts;

    /**
     * @var \modules\admin\dtos\Scope[] $_scopes 전체 컴포넌트의 관리자 권한범위 정보
     */
    private static array $_scopes;

    /**
     * @var \modules\admin\dtos\Group[] $_groups 관리자그룹정보
     */
    private static array $_groups = [];

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
     * 현재 관리자화면의 언어코드를 가져온다.
     *
     * @return string $langauge
     */
    public function getLanguage(): string
    {
        return $this->getAdministrator()?->getLanguage() ?? \Request::languages(true);
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
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');
        $member = $mMember->getMember($member_id);
        if ($member->isMember() === false) {
            return null;
        }

        $member_id = $member->getId();

        if ($refresh === false && isset(self::$_administrators[$member_id]) == true) {
            return self::$_administrators[$member_id];
        }

        $administrator = $this->db()
            ->select()
            ->from($this->table('administrators'))
            ->where('member_id', $member_id)
            ->getOne();
        if ($administrator === null) {
            $administrator = new \stdClass();
            $administrator->member_id = $member_id;
            $administrator->language = null;
            $administrator->navigation = null;
            $administrator->permissions = false;
        } else {
            $administrator->navigation = json_decode($administrator->navigation ?? 'null');
            $administrator->permissions = json_decode($administrator->permissions ?? 'false');
        }

        self::$_administrators[$member_id] = new \modules\admin\dtos\Administrator($administrator);

        return self::$_administrators[$member_id];
    }

    /**
     * 관리자 전체 컨텍스트를 가져온다.
     *
     * @return \modules\admin\dtos\Context[] $contexts
     */
    public function getAdminContexts(): array
    {
        if (isset(self::$_contexts) == false) {
            self::$_contexts = [];

            /**
             * 모듈의 관리자 컨텍스트를 가져온다.
             */
            foreach (\Modules::all() as $module) {
                foreach ($module->getAdmin()?->getContexts() ?? [] as $context) {
                    self::$_contexts[$context->getPath()] = $context;
                }
            }

            /**
             * @todo 플러그인의 관리자 컨텍스트를 가져온다.
             */

            /**
             * @todo 위젯의 관리자 컨텍스트를 가져온다.
             */
        }

        return self::$_contexts;
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
        $navigation = $this->getAdministrator()->getNavigation();
        $paths = array_keys($contexts);
        $routes = explode('/', $route->getSubPath());

        /**
         * 관리자 루트인 경우, 관리자의 첫번째 컨텍스트를 반환한다.
         */
        if (count($routes) == 1) {
            foreach ($navigation as $context) {
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

            return $contexts['/dashboard'];
        }

        /**
         * 전체 컨텍스트에서 경로와 일치하는 컨텍스트를 찾는다.
         */
        while (count($routes) > 1) {
            $path = implode('/', $routes);
            if (in_array($path, $paths) == true) {
                return $contexts[$path];
                break;
            }

            array_pop($routes);
        }

        return null;
    }

    /**
     * 관리자 전체 권한범위를 가져온다.
     *
     * @return \modules\admin\dtos\Scope[] $scope
     */
    public function getAdminScopes(): array
    {
        if (isset(self::$_scopes) == false) {
            self::$_scopes = [];

            /**
             * 모듈의 관리자 권한범위를 가져온다.
             */
            self::$_scopes['module'] = [];
            foreach (\Modules::all() as $module) {
                $scopes = [];
                foreach ($module->getAdmin()?->getScopes() ?? [] as $scope) {
                    $scopes[$scope->getCode()] = $scope;
                }

                if (count($scopes) > 0) {
                    self::$_scopes['module'][$scope->getComponent()->getName()] = $scopes;
                }
            }

            /**
             * @todo 플러그인의 관리자 컨텍스트를 가져온다.
             */
            self::$_scopes['plugin'] = [];

            /**
             * @todo 위젯의 관리자 컨텍스트를 가져온다.
             */
            self::$_scopes['widget'] = [];
        }

        return self::$_scopes;
    }

    /**
     * 관리자그룹정보를 가져온다.
     *
     * @param string $group_id
     * @return ?\modules\admin\dtos\Group $group
     */
    public function getAdminGroup(string $group_id): ?\modules\admin\dtos\Group
    {
        if (isset(self::$_groups[$group_id]) == true) {
            return self::$_groups[$group_id];
        }

        self::$_groups[$group_id] = null;
        if (
            $group_id == 'user' ||
            $group_id == 'component' ||
            preg_match('/^component-(module|plugin|widget)-[^-]+$/', $group_id) == true
        ) {
            return null;
        } else {
            $temp = explode('-', $group_id);
            if ($temp[0] == 'component') {
                if (count($temp) != 4) {
                    return null;
                }

                if ($temp[1] == 'module') {
                    self::$_groups[$group_id] =
                        \Modules::get($temp[2])
                            ->getAdmin()
                            ?->getGroup($temp[3]) ?? null;
                }
            } else {
                $group = $this->db()
                    ->select()
                    ->from($this->table('groups'))
                    ->where('group_id', $group_id)
                    ->getOne();
                if ($group === null) {
                    self::$_groups[$group_id] = null;
                } else {
                    self::$_groups[$group_id] = new \modules\admin\dtos\Group($this->getAdmin());
                    self::$_groups[$group_id]
                        ->setGroup($group->group_id, $group->title)
                        ->setCount($group->administrators)
                        ->setPermission(
                            \modules\admin\dtos\Permission::init()->setPermissions(json_decode($group->permissions))
                        )
                        ->setGetter(function ($group) {
                            /**
                             * @var \modules\admin\admin\Admin $mAdmin
                             */
                            $mAdmin = $group->getAdmin();
                            return $mAdmin
                                ->db()
                                ->select()
                                ->from($mAdmin->table('group_administrators'))
                                ->where('group_id', $group->getId())
                                ->get('member_id');
                        });
                }
            }
        }

        return self::$_groups[$group_id];
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
         * BODY 타입을 지정한다.
         */
        \Html::body('data-role', 'module');
        \Html::body('data-module', 'admin');
        \Html::body('data-type', 'admin');

        /**
         * 관리자가 아니라면 로그인 레이아웃을 출력한다.
         */
        if ($this->getAdministrator()?->isAdministrator() !== true) {
            \Html::style($this->getBase() . '/ui/styles/Aui.Base.css');
            \Html::style($this->getBase() . '/admin/styles/Admin.css', 15);

            return $theme->getLayout('login');
        }

        \Html::body('data-color-scheme', $this->getAdministrator()?->getColor() ?? 'auto');
        \Html::body('data-scale', $this->getAdministrator()?->getScale() ?? 16);

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
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Base.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Loading.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Scroll.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Drag.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Resizer.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Data.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Component.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Absolute.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Store.js');
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
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Progress.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Viewport.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Navigation.js');
        \Cache::script('Aui', $this->getBase() . '/ui/scripts/Aui.Menu.js');
        \Html::script(\Cache::script('Aui'), 10);

        \Cache::script('Admin.ui', $this->getBase() . '/admin/scripts/ui/Admin.js');
        \Cache::script('Admin.ui', $this->getBase() . '/admin/scripts/ui/AdminUi.Form.js');
        \Html::script(\Cache::script('Admin.ui'), 15);

        \Cache::script('Admin.component', $this->getBase() . '/admin/scripts/Component.js');
        foreach (\Modules::all(false) as $module) {
            if (is_file($module->getPath() . '/admin/scripts/' . $module->getClassName() . '.js') == true) {
                \Cache::script(
                    'Admin.component',
                    $module->getBase() . '/admin/scripts/' . $module->getClassName() . '.js'
                );
            }

            $scripts = $module->getAdmin()?->getScripts() ?? [];
            foreach ($scripts as $script) {
                \Cache::script('Admin.component', $script);
            }
        }
        \Html::script(\Cache::script('Admin.component'), 20);

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
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Progress.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Viewport.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Navigation.css');
        \Cache::style('Aui', $this->getBase() . '/ui/styles/Aui.Menu.css');
        \Html::style(\Cache::style('Aui'), 10);

        \Cache::style('Admin.Component', $this->getBase() . '/admin/styles/Admin.css');
        foreach (\Modules::all() as $module) {
            if (is_file($module->getPath() . '/admin/styles/' . $module->getClassName() . '.scss') == true) {
                \Cache::style(
                    'Admin.Component',
                    $module->getBase() . '/admin/styles/' . $module->getClassName() . '.scss'
                );
            }

            if (is_file($module->getPath() . '/admin/styles/' . $module->getClassName() . '.css') == true) {
                \Cache::style(
                    'Admin.Component',
                    $module->getBase() . '/admin/styles/' . $module->getClassName() . '.css'
                );
            }

            $styles = $module->getAdmin()?->getStyles() ?? [];
            foreach ($styles as $style) {
                \Cache::style('Admin.Component', $style);
            }
        }
        \Html::style(\Cache::style('Admin.Component'), 20);

        /**
         * @var \modules\wysiwyg\Wysiwyg $mWysiwyg 위지윅에디터를 위한 스크립트를 불러온다.
         */
        $mWysiwyg = \Modules::get('wysiwyg');
        $mWysiwyg->preload();

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

        \Html::style($this->getBase() . '/admin/styles/preview.css');
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
            \Html::script($this->getBase() . '/admin/scripts/preview.js');
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
                $error = \ErrorHandler::data($code);
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
                $error = \ErrorHandler::data($code);
                /**
                 * @var \modules\member\Member $mMember
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
     * @return bool|string $success 설치성공여부
     */
    public function install(string $previous = null, object $configs = null): bool|string
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
