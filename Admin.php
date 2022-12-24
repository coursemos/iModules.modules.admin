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
use \Cache;
use \Theme;
use \Templet;
use \Html;
use \ErrorHandler;
use \ErrorData;
class Admin extends \Module
{
    /**
     * 모듈을 설정을 초기화한다.
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
     * 관리자페이지 라우팅을 처리한다.
     *
     * @param Route $route 현재경로
     */
    public function doRoute(Route $route): string
    {
        /**
         * 기본 자바스크립트파일을 불러온다.
         * 사용되는 모든 스크립트 파일을 캐시를 이용해 압축한다.
         */
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Base.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Scrollbar.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Drag.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Resizer.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Data.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Component.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Store.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Title.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Text.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Button.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Panel.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Toolbar.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Tab.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Grid.js');
        Cache::script('admin', $this->getBase() . '/scripts/Admin.Window.js');
        Html::script(Cache::script('admin'), 10);

        Cache::style('admin', $this->getBase() . '/styles/Admin.Base.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Scrollbar.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Component.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Resizer.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Title.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Text.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Button.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Panel.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Toolbar.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Tab.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Grid.scss');
        Cache::style('admin', $this->getBase() . '/styles/Admin.Window.scss');
        Html::style(Cache::style('admin'), 10);

        /**
         * 아이모듈 관리자 테마를 설정한다.
         */
        $theme = new Theme($this->getConfigs('theme'));
        $this->setTemplet($this->getConfigs('templet'));

        /**
         * @todo 관리자 라우팅 처리
         */
        $paths = explode('/', $route->getSubPath());
        $menu = count($paths) > 1 ? $paths[1] : 'dashboard';
        $content = $this->getTemplet()->getLayout($menu);
        $theme->assign('content', $content);

        return $theme->getLayout('index');
    }
}
