<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리자 클래스를 정의한다.
 *
 * @file /modules/admin/admin/AdminAdmin.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 31.
 */
namespace modules\admin\admin;
class AdminAdmin extends \modules\admin\admin\Admin
{
    /**
     * 관리자 컨텍스트를 초기화한다.
     */
    public function init(): void
    {
        /**
         * 관리자 메뉴를 추가한다.
         */
        $this->addContext('/dashboard', $this->getText('admin/contexts/dashboard'), 'xi xi-presentation', true);
        $this->addContext('/modules', $this->getText('admin/contexts/modules'), 'xi xi-box', true);
        $this->addContext('/plugins', $this->getText('admin/contexts/plugins'), 'xi xi-plug', true);
        $this->addContext('/sites', $this->getText('admin/contexts/sites'), 'xi xi-check-home-o', true);
        $this->addContext('/sitemap', $this->getText('admin/contexts/sitemap'), 'xi xi-sitemap', true);
        $this->addContext('/database', $this->getText('admin/contexts/database'), 'xi xi-db-full', true);
    }

    /**
     * 각 컨텍스트의 콘텐츠를 가져온다.
     *
     * @param string $path 컨텍스트 경로
     * @param ?string $subPath 컨텍스트 하위경로
     */
    public function getContent(string $path, ?string $subPath = null): string
    {
        switch ($path) {
            case '/dashboard':
                \Html::script($this->getBase() . '/scripts/dashboard.js');
                break;

            case '/modules':
                \Html::script($this->getBase() . '/scripts/modules.js');
                break;

            case '/sites':
                \Html::script($this->getBase() . '/scripts/sites.js');
                break;
        }

        return '';
    }
}
