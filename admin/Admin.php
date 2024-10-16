<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리자 클래스를 정의한다.
 *
 * @file /modules/admin/admin/Admin.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 16.
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
            ->setDefaultFolder(false)
            ->setTitle($this->getText('admin.contexts.dashboard'), 'mi mi-dashboard', -1000);

        if ($this->hasPermission('modules') == true) {
            $contexts[] = \modules\admin\dtos\Context::init($this)
                ->setContext('modules')
                ->setDefaultFolder($this->getText('admin.navigation.folder.preset.component'), 'xi xi-cube', -999)
                ->setTitle($this->getText('admin.contexts.modules'), 'mi mi-module');
        }

        if ($this->hasPermission('plugins') == true) {
            $contexts[] = \modules\admin\dtos\Context::init($this)
                ->setContext('plugins')
                ->setDefaultFolder($this->getText('admin.navigation.folder.preset.component'), 'xi xi-cube', -999)
                ->setTitle($this->getText('admin.contexts.plugins'), 'mi mi-plugin');
        }

        if ($this->hasPermission('widgets') == true) {
            $contexts[] = \modules\admin\dtos\Context::init($this)
                ->setContext('widgets')
                ->setDefaultFolder($this->getText('admin.navigation.folder.preset.component'), 'xi xi-cube', -999)
                ->setTitle($this->getText('admin.contexts.widgets'), 'mi mi-widget');
        }

        if ($this->hasPermission('sitemap') == true) {
            $contexts[] = \modules\admin\dtos\Context::init($this)
                ->setContext('sitemap')
                ->setDefaultFolder(false)
                ->setTitle($this->getText('admin.contexts.sitemap'), 'mi mi-sitemap', 10000);
        }

        if ($this->hasPermission('administrators') == true) {
            $contexts[] = \modules\admin\dtos\Context::init($this)
                ->setContext('administrators')
                ->setDefaultFolder(false)
                ->setTitle($this->getText('admin.contexts.administrators'), 'mi mi-admin', 10001);
        }

        if ($this->hasPermission('database') == true) {
            $database = new \modules\admin\dtos\Context($this);
            $database
                ->setContext('database')
                ->setDefaultFolder(false)
                ->setTitle($this->getText('admin.contexts.database'), 'mi mi-database', 10002);
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

            case 'plugins':
                \Html::script($this->getBase() . '/scripts/contexts/plugins.js');
                break;

            case 'sitemap':
                \Html::script($this->getBase() . '/scripts/contexts/sitemap.js');
                break;

            case 'administrators':
                \Html::script($this->getBase() . '/scripts/contexts/administrators.js');
                break;

            case 'database':
                \Html::script($this->getBase() . '/scripts/contexts/database.js');
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
            'database',
            $this->getText('admin.scopes.database')
        );

        return $this->setScopes($scopes);
    }

    /**
     * 컨텍스트 객체를 JSON 데이터로 변환한다.
     *
     * @param \Context $context 변환할 컨텍스트 객체
     * @return object $context
     */
    private function getSitemapContextToJson(\Context $context): object
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
        $json->sort = $context->getSort();

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
     * @return array $chilren
     */
    private function getSitemapContextChildren(\Context $parent): array
    {
        if ($parent->hasChild(false) == false) {
            return [];
        }

        $children = [];
        foreach ($parent->getChildren(false, false) as $sort => $context) {
            $context->setSort($sort);
            $child = $this->getSitemapContextToJson($context);
            if ($context->hasChild(false) == true) {
                $child->children = $this->getSitemapContextChildren($context);
            }
            $children[] = $child;
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
    public function getSitemapContexts(\Site $site): array
    {
        $index = $site->getIndex();
        $context = $this->getSitemapContextToJson($index);
        if ($index->hasChild(false) == true) {
            $context->children = $this->getSitemapContextChildren($index);
        }

        return [$context];
    }

    /**
     * 사이트를 삭제한다.
     *
     * @param string $host 삭제할 사이트 호스트명
     * @param string $language 삭제할 사이트 언어코드
     */
    public function deleteSite(string $host, string $language): void
    {
        $domain = \iModules::db()
            ->select()
            ->from(\iModules::table('domains'))
            ->where('host', $host)
            ->getOne();
        $site = \iModules::db()
            ->select()
            ->from(\iModules::table('sites'))
            ->where('host', $host)
            ->where('language', $language)
            ->getOne();

        if ($domain === null || $site === null) {
            return;
        }

        /**
         * @var \modules\attachment\Attachment $mAttachment
         */
        $mAttachment = \Modules::get('attachment');

        if ($site->logo !== null) {
            $mAttachment->deleteFile($site->logo);
        }

        if ($site->emblem !== null) {
            $mAttachment->deleteFile($site->emblem);
        }

        if ($site->favicon !== null) {
            $mAttachment->deleteFile($site->favicon);
        }

        if ($site->image !== null) {
            $mAttachment->deleteFile($site->image);
        }

        \iModules::db()
            ->delete(\iModules::table('sites'))
            ->where('host', $host)
            ->where('language', $language)
            ->execute();

        $this->deleteContext($host, $language, '/');

        if ($domain->language == $language) {
            $language = \iModules::db()
                ->select(['language'])
                ->from(\iModules::table('sites'))
                ->where('host', $host)
                ->getOne('language');
            if ($language !== null) {
                \iModules::db()
                    ->update(\iModules::table('domains'), ['language' => $language])
                    ->where('host', $host)
                    ->execute();
            }
        }
    }

    /**
     * 사이트 컨텍스트를 삭제한다.
     *
     * @param string $host 삭제할 컨텍스트 호스트명
     * @param string $language 삭제할 컨텍스트 언어코드
     * @param string $path 삭제할 컨텍스트 경로
     */
    public function deleteContext(string $host, string $language, string $path): void
    {
        $context = \iModules::db()
            ->select()
            ->from(\iModules::table('contexts'))
            ->where('host', $host)
            ->where('language', $language)
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
            ->where('host', $host)
            ->where('language', $language)
            ->where('path', $path)
            ->execute();

        $children = \iModules::db()
            ->select(['path'])
            ->from(\iModules::table('contexts'))
            ->where('host', $host)
            ->where('language', $language);
        if ($path == '/') {
            $children->where('path', '/', '!=');
        } else {
            $children->where('(path = ? or path like ?)', [$path, $path . '/%']);
        }
        $children = $children->get('path');
        foreach ($children as $child) {
            $this->deleteContext($host, $language, $child);
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

    /**
     * 권한식 프리셋을 가져온다.
     *
     * @return array $permissions
     */
    public function getPermissionPresets(): array
    {
        $permissions = [
            $this->getPermissionExpression($this->getText('permissions.true'), 'true', 0),
            $this->getPermissionExpression($this->getText('permissions.false'), 'false', 1),
        ];

        \Events::fireEvent($this->getComponent(), 'getPermissionPresets', [&$permissions, $this]);

        return $permissions;
    }

    /**
     * 권한식 객체를 반환한다.
     *
     * @param string $label 권한명
     * @param string $expression 권한식
     * @return object $permission 권한식객체
     */
    public function getPermissionExpression(string $label, string $expression, int $sort = 10): object
    {
        $permission = new \stdClass();
        $permission->label = $label;
        $permission->expression = $expression;
        $permission->sort = $sort;

        return $permission;
    }

    /**
     * 특정 테이블명을 가진 컴포넌트를 검색하여 테이블 구조를 가져온다.
     *
     * @param string $table 테이블명
     * @param ?object $scheme 테이블구조
     */
    public function findScheme(string $table): ?object
    {
        $prefix = \Configs::get('db')?->prefix ?? 'im_';
        if (preg_match('/^' . $prefix . '/', $table) == false) {
            return null;
        }

        $table = preg_replace('/^' . $prefix . '/', '', $table);
        $split = explode('_', $table);

        if (in_array($split[0], ['module', 'plugin', 'widget']) == true) {
            $component_type = array_shift($split);
            $path = \Configs::path() . '/' . $component_type . 's';
            while ($name = array_shift($split)) {
                $path .= '/' . $name;
                if (is_dir($path) == false) {
                    return null;
                }

                if (is_file($path . '/package.json') == true) {
                    $package = json_decode(file_get_contents($path . '/package.json'));
                    return $package?->databases?->{implode('_', $split)} ?? null;
                }
            }

            return null;
        } else {
            $package = json_decode(file_get_contents(\Configs::path() . '/package.json'));
            return $package?->databases?->{$table} ?? null;
        }
    }
}
