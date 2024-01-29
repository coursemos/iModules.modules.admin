<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리자 클래스를 정의한다.
 *
 * @file /modules/admin/admin/Admin.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 */
namespace modules\admin\admin;
class Admin extends \modules\admin\admin\Component
{
    /**
     * 관리자 컨텍스트 목록을 가져온다.
     *
     * @return \modules\admin\dtos\Context[] $contexts
     */
    public function getContexts(): array
    {
        $contexts = [];

        $contexts[] = \modules\admin\dtos\Context::init($this)
            ->setContext('dashboard')
            ->setTitle($this->getText('admin.contexts.dashboard'), 'xi xi-presentation');

        if ($this->hasPermission('modules') == true) {
            $contexts[] = \modules\admin\dtos\Context::init($this)
                ->setContext('modules')
                ->setTitle($this->getText('admin.contexts.modules'), 'xi xi-box');
        }

        if ($this->hasPermission('plugins') == true) {
            $contexts[] = \modules\admin\dtos\Context::init($this)
                ->setContext('plugins')
                ->setTitle($this->getText('admin.contexts.plugins'), 'xi xi-plug');
        }

        if ($this->hasPermission('widgets') == true) {
            $contexts[] = \modules\admin\dtos\Context::init($this)
                ->setContext('widgets')
                ->setTitle($this->getText('admin.contexts.widgets'), 'xi xi-contents-left');
        }

        if ($this->hasPermission('modules') == true) {
            $contexts[] = \modules\admin\dtos\Context::init($this)
                ->setContext('sitemap')
                ->setTitle($this->getText('admin.contexts.sitemap'), 'xi xi-sitemap');
        }

        if ($this->hasPermission('administrators') == true) {
            $contexts[] = \modules\admin\dtos\Context::init($this)
                ->setContext('administrators')
                ->setTitle($this->getText('admin.contexts.administrators'), 'xi xi-user-lock');
        }

        if ($this->hasPermission('database') == true) {
            $database = new \modules\admin\dtos\Context($this);
            $database->setContext('database')->setTitle($this->getText('admin.contexts.database'), 'xi xi-db-full');
            $contexts[] = $database;
        }

        return $contexts;
    }

    /**
     * 현재 모듈의 관리자 컨텍스트를 가져온다.
     *
     * @param string $path 컨텍스트 경로
     * @return string $html
     */
    public function getContext(string $path): string
    {
        switch ($path) {
            case 'dashboard':
                \Html::script($this->getBase() . '/scripts/contexts/dashboard.js');
                break;

            case 'modules':
                \Html::script($this->getBase() . '/scripts/contexts/modules.js');
                break;

            case 'sitemap':
                \Html::script($this->getBase() . '/scripts/contexts/sitemap.js');
                break;

            case 'administrators':
                \Html::script($this->getBase() . '/scripts/contexts/administrators.js');
                break;
        }

        return '';
    }

    /**
     * 현재 컴포넌트의 관리자 권한범위를 가져온다.
     *
     * @return \modules\admin\dtos\Scope[] $scopes
     */
    public function getScopes(): array
    {
        $scopes = [];

        $scopes[] = \modules\admin\dtos\Scope::init($this)
            ->setScope('modules', $this->getText('admin.scopes.modules.title'))
            ->addChild('configs', $this->getText('admin.scopes.modules.configs'))
            ->addChild('install', $this->getText('admin.scopes.modules.install'));

        $scopes[] = \modules\admin\dtos\Scope::init($this)
            ->setScope('plugins', $this->getText('admin.scopes.plugins.title'))
            ->addChild('configs', $this->getText('admin.scopes.plugins.configs'))
            ->addChild('install', $this->getText('admin.scopes.plugins.install'));

        $scopes[] = \modules\admin\dtos\Scope::init($this)->setScope(
            'widgets',
            $this->getText('admin.scopes.widgets.title')
        );

        $scopes[] = \modules\admin\dtos\Scope::init($this)
            ->setScope('sitemap', $this->getText('admin.scopes.sitemap.domains'))
            ->addChild('domains', $this->getText('admin.scopes.sitemap.domains'))
            ->addChild('sites', $this->getText('admin.scopes.sitemap.sites'))
            ->addChild('contexts', $this->getText('admin.scopes.sitemap.contexts'));

        $scopes[] = \modules\admin\dtos\Scope::init($this)->setScope(
            'administrators',
            $this->getText('admin.scopes.administrators')
        );

        $scopes[] = \modules\admin\dtos\Scope::init($this)->setScope(
            'databases',
            $this->getText('admin.scopes.databases')
        );

        return $this->setScopes($scopes);
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
     * 사이트 컨텍스트를 삭제한다.
     *
     * @param \Site $site 사이트 객체
     * @param string $path 삭제할 컨텍스트 경로
     */
    public function deleteContext(\Site $site, string $path): void
    {
        $context = \iModules::db()
            ->select()
            ->from(\iModules::table('contexts'))
            ->where('host', $site->getHost())
            ->where('language', $site->getLanguage())
            ->where('path', $path)
            ->getOne();

        if ($context === null) {
            return;
        }

        if ($context->image !== null) {
            /**
             * @var \modules\attachment\Attachment $mAttachment
             */
            $mAttachment = \Modules::get('attachment');
            $mAttachment->deleteFile($context->image);
        }

        \iModules::db()
            ->delete(\iModules::table('contexts'))
            ->where('host', $site->getHost())
            ->where('language', $site->getLanguage())
            ->where('path', $path)
            ->execute();

        $children = \iModules::db()
            ->select(['path'])
            ->from(\iModules::table('contexts'))
            ->where('host', $site->getHost())
            ->where('language', $site->getLanguage());

        if ($path == '/') {
            $children->where('path', '/', '!=');
        } else {
            $children->where('(path = ? or path like ?)', [$path, $path . '/%']);
        }

        $children = $children->get('path');
        foreach ($children as $child) {
            $this->deleteContext($site, $child);
        }
    }

    /**
     * 관리자 그룹의 인원수를 갱신한다.
     *
     * @param string $group_id 그룹고유값 (NULL 인 경우 전체 그룹을 갱신한다.)
     */
    public function updateGroup(string $group_id = null): void
    {
        if ($group_id === null) {
            foreach (
                $this->db()
                    ->select(['group_id'])
                    ->from($this->table('groups'))
                    ->get('group_id')
                as $group_id
            ) {
                $this->updateGroup($group_id);
            }
            return;
        }

        $administrators = $this->db()
            ->select()
            ->from($this->table('group_administrators'))
            ->where('group_id', $group_id)
            ->count();

        $this->db()
            ->update($this->table('groups'), ['administrators' => $administrators])
            ->where('group_id', $group_id)
            ->execute();
    }
}
