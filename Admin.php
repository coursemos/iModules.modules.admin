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
 * @modified 2022. 12. 1.
 */
namespace modules\admin;
use \Router;
use \Route;
use \Request;
use \Cache;
use \Theme;
use \Modules;
use \Html;
use \ErrorHandler;
use \ErrorData;
use \stdClass;
class Admin extends \Module
{
    /**
     * @var \modules\admin\dto\Context[] $_contexts 전체 컨텍스트 정보
     */
    private static array $_contexts = [];

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
        Router::add('/admin', '#', 'html', [$this, 'doRoute']);
        Router::add('/admin/*', '#', 'html', [$this, 'doRoute']);
    }

    /**
     * 전체 관리자 메뉴를 초기화한다.
     */
    public function initContexts(): void
    {
        foreach (\Modules::all() as $module) {
            if ($module->name == 'member' || $module->name == 'admin') {
                $class = $this->getAdminClass('module', $module->name);
                $class->init();
            }
        }

        uksort(self::$_contexts, function ($left, $right) {
            return $left <=> $right;
        });
    }

    /**
     * 관리자 컨텍스트를 추가한다.
     */
    public function addContext(\modules\admin\dto\Context $context): void
    {
        if (isset(self::$_contexts[$context->getPath()]) == true) {
            ErrorHandler::print(
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
        $mMember = Modules::get('member');
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
                    'language' => Request::languages(true),
                    'contexts' => 'null',
                ])
                ->execute();
            $member = new stdClass();
            $member->language = Request::languages(true);
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
     * @return \modules\admin\dto\Context[] $contexts
     */
    public function getContexts(): array
    {
        $this->initContexts();
        $contexts = $this->getMember()->contexts;

        /**
         * 메뉴설정이 없다면 기본메뉴 설정을 생성한다.
         */
        if ($contexts == null) {
            $tree = ['/', '/modules', '/plugins'];

            $modules = new stdClass();
            $modules->title = '@modules';
            $modules->icon = 'xi xi-folder';
            $modules->smart = 'modules';
            $modules->children = [];
            $tree[] = $modules;

            $plugins = new stdClass();
            $plugins->title = '@plugins';
            $plugins->icon = 'xi xi-folder';
            $plugins->smart = 'plugins';
            $plugins->children = [];
            $tree[] = $plugins;

            $sites = new stdClass();
            $sites->title = '@sites';
            $sites->icon = 'xi xi-folder';
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

                if (count($children) > 0) {
                    if (strpos($item->title, '@') === 0) {
                        $item->title = $this->getText('admin/groups/' . substr($item->title, 1));
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
        }

        return $contexts;
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
        $className = '\\' . $type . 's\\' . implode('\\', $classPaths) . '\\admin\\Admin';
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
    public function isAdmin(): bool
    {
        return true;
    }

    /**
     * 권한을 확인한다.
     *
     * @param string $path
     * @return bool|string $permission
     */
    public function checkPermission(string $path): bool|string
    {
        $context = self::$_contexts[$path] ?? null;
        if ($context == null) {
            return false;
        }

        return true;
    }

    /**
     * 관리자페이지 라우팅을 처리한다.
     *
     * @param Route $route 현재경로
     */
    public function doRoute(Route $route): string
    {
        $contexts = $this->getContexts();

        /**
         * 기본 자바스크립트파일을 불러온다.
         * 사용되는 모든 스크립트 파일을 캐시를 이용해 압축한다.
         */
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Base.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Ajax.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Scrollbar.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Drag.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Resizer.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Data.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Component.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Absolute.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Store.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Title.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Text.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Button.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Panel.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.List.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Contexts.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Toolbar.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Tab.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Grid.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Form.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Window.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Message.js');
        Html::script(Cache::script('admin'), 10);

        Cache::style('admin', $this->getBase() . '/styles/Admin.Base.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Scrollbar.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Component.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Absolute.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Resizer.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Title.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Text.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Button.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Panel.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.List.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Contexts.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Toolbar.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Tab.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Grid.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Form.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Window.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Message.scss');
        Html::style(Cache::style('admin'), 10);

        /**
         * 웹폰트를 불러온다.
         */
        Html::font('XEIcon');
        Html::font('FontAwesome');

        /**
         * 아이모듈 관리자 테마를 설정한다.
         */
        $theme = new Theme($this->getConfigs('theme'));
        $this->setTemplate($this->getConfigs('template'));

        $templet = $this->getTemplate();
        $templet->assign('contexts', $contexts);

        /**
         * todo: 관리자 라우팅 처리
         */
        $paths = explode('/', $route->getSubPath());
        $menu = count($paths) > 1 ? $paths[1] : 'dashboard';
        $content = $this->getTemplate()->getLayout($menu);
        $theme->assign('content', $content);

        return $theme->getLayout('index');
    }

    /**
     * 특수한 에러코드의 경우 에러데이터를 현재 클래스에서 처리하여 에러클래스로 전달한다.
     *
     * @param string $code 에러코드
     * @param ?string $message 에러메시지
     * @param ?object $details 에러와 관련된 추가정보
     * @return \ErrorData $error
     */
    public function error(string $code, ?string $message = null, ?object $details = null): ErrorData
    {
        switch ($code) {
            /**
             * 게시판이 존재하지 않는 경우
             */
            case 'DUPLICATED_ADMIN_CONTEXT_PATH':
                $error = ErrorHandler::data();
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
                $error = ErrorHandler::data();
                /**
                 * @var ModuleMember $mMember
                 */
                $mMember = Modules::get('member');
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
     * @param string $previous 이전설치버전
     * @return bool $success 설치성공여부
     */
    public static function install(string $previous = null): bool
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
