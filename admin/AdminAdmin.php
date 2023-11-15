<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리자 클래스를 정의한다.
 *
 * @file /modules/admin/admin/AdminAdmin.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 28.
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
        $this->addContext('/dashboard', $this->getText('admin.contexts.dashboard'), 'xi xi-presentation', true);

        if ($this->checkPermission('modules') == true) {
            $this->addContext('/modules', $this->getText('admin.contexts.modules'), 'xi xi-box', true);
        }
        if ($this->checkPermission('plugins') == true) {
            $this->addContext('/plugins', $this->getText('admin.contexts.plugins'), 'xi xi-plug', true);
        }
        if ($this->checkPermission('sitemap') == true) {
            $this->addContext('/sitemap', $this->getText('admin.contexts.sitemap'), 'xi xi xi-sitemap', true);
        }
        if ($this->checkPermission('administrators') == true) {
            $this->addContext(
                '/administrators',
                $this->getText('admin.contexts.administrators'),
                'xi xi-user-lock',
                true
            );
        }
        if ($this->checkPermission('database') == true) {
            $this->addContext('/database', $this->getText('admin.contexts.database'), 'xi xi-db-full', true);
        }
    }

    /**
     * 컨텍스트 객체를 JSON 데이터로 변환한다.
     *
     * @param \Context $context 변환할 컨텍스트 객체
     * @param int $sort 정렬순서
     * @return object $context
     */
    private function getSitemapContextToJson(\Context $context, int $sort = 0): object
    {
        $json = new \stdClass();
        $json->host = $context->getHost();
        $json->language = $context->getLanguage();
        $json->path = $context->getPath();
        $json->title = $context->getTitle();
        $json->type = $context->getType();
        $json->layout = $context->getLayout();
        $temp = explode('/', $context->getPath());
        $json->display = $context->getPath() == '/' ? '/' : '/' . end($temp);
        $json->sort = $sort;

        switch ($json->type) {
            case 'EMPTY':
                $json->context = \Modules::get('admin')->getText('admin.sitemap.contexts.types.EMPTY');
                break;

            case 'CHILD':
                $children = $context->getChildren(false, false);
                $json->context = count($children) == 0 ? 'NOT_FOUND_CHILD' : $children[0]->getTitle();
                break;

            case 'PAGE':
                $json->context = $context->getContext() . '.html';
                break;

            case 'MODULE':
                $json->context = \Modules::get($context->getTarget())->getTitle();
                $json->context .= '-' . \Modules::get($context->getTarget())->getContextTitle($context->getContext());
                break;

            default:
                $json->context = '';
        }

        return $json;
    }

    /**
     * 컨텍스트의 자식 컨텍스트를 재귀적으로 가져온다.
     *
     * @param \Context $parent 부모 컨텍스트
     * @param string $mode 가져올 방식 (tree, list)
     * @param int $sort 정렬 순서
     * @return array $chilren
     */
    private function getSitemapContextChildren(\Context $parent, string $mode = 'tree', int &$sort = 0): array
    {
        if ($parent->hasChild(false) == false) {
            return [];
        }

        $children = [];
        if ($mode == 'tree') {
            foreach ($parent->getChildren(false, false) as $context) {
                $child = $this->getSitemapContextToJson($context, $sort++);
                if ($context->hasChild(false) == true) {
                    $child->children = $this->getSitemapContextChildren($context, $mode, $sort);
                }
                $children[] = $child;
            }
        } else {
            foreach ($parent->getChildren(false, false) as $context) {
                $child = $this->getSitemapContextToJson($context, $sort++);
                $children[] = $child;
                $children = [...$children, ...$this->getSitemapContextChildren($context, $mode, $sort)];
            }
        }

        return $children;
    }

    /**
     * 사이트의 전체 컨텍스트 목록을 가져온다.
     *
     * @param \Site $site 컨텍스트목록을 가져올 사이트 객체
     * @param string $mode 가져올 방식 (tree, list)
     * @return array $contexts
     */
    public function getSitemapContexts(\Site $site, string $mode): array
    {
        $index = $site->getIndex();

        $sort = 0;
        if ($mode == 'tree') {
            $context = $this->getSitemapContextToJson($index);
            if ($index->hasChild(false) == true) {
                $context->children = $this->getSitemapContextChildren($index, $mode, $sort);
            }

            return [$context];
        } else {
            return [
                $this->getSitemapContextToJson($index, $sort++),
                ...$this->getSitemapContextChildren($index, $mode, $sort),
            ];
        }
    }

    /**
     * 현재 모듈의 관리자 권한종류를 가져온다.
     *
     * @return array $permissions 권한
     */
    public function getPermissions(): array
    {
        return [
            'modules' => [
                'label' => $this->getText('admin.permissions.modules.title'),
                'permissions' => [
                    'configs' => $this->getText('admin.permissions.modules.configs'),
                    'install' => $this->getText('admin.permissions.modules.install'),
                ],
            ],
            'plugins' => [
                'label' => $this->getText('admin.permissions.plugins.title'),
                'permissions' => [
                    'configs' => $this->getText('admin.permissions.plugins.configs'),
                    'install' => $this->getText('admin.permissions.plugins.install'),
                ],
            ],
            'sitemap' => [
                'label' => $this->getText('admin.permissions.sitemap.title'),
                'permissions' => [
                    'domain' => $this->getText('admin.permissions.sitemap.domain'),
                    'site' => $this->getText('admin.permissions.sitemap.site'),
                    'context' => $this->getText('admin.permissions.sitemap.context'),
                ],
            ],
            'administrators' => [
                'label' => $this->getText('admin.permissions.administrators'),
                'permissions' => [],
            ],
            'databases' => [
                'label' => $this->getText('admin.permissions.databases'),
                'permissions' => [],
            ],
        ];
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
            case '/':
                \Html::script($this->getBase() . '/scripts/dashboard.js');
                break;

            case '/modules':
                \Html::script($this->getBase() . '/scripts/modules.js');
                break;

            case '/sitemap':
                \Html::script($this->getBase() . '/scripts/sitemap.js');
                break;

            case '/administrators':
                \Html::script($this->getBase() . '/scripts/administrators.js');
                break;
        }

        return '';
    }
}
