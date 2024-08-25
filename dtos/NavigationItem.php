<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 네비게이션 구조체를 정의한다.
 *
 * @file /modules/admin/dtos/Navigation.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 8. 25.
 */
namespace modules\admin\dtos;
class NavigationItem
{
    /**
     * @var \modules\admin\dtos\NavigationItem[] $_items 현재 정의된 전체 네비게이션 객체
     */
    static array $_items = [];

    /**
     * @var \modules\admin\dtos\NavigationItem[] $_navitaion 현재 정의된 네비게이션
     */
    static array $_navitaion = [];

    /**
     * @var ?string $_path 컨텍스트경로 (경로가 NULL 인 경우, 폴더)
     */
    private ?string $_path = null;

    /**
     * @var ?string $_path 폴더인경우 폴더아이콘
     */
    private ?string $_icon = null;

    /**
     * @var ?string $_path 폴더인경우 폴더명
     */
    private ?string $_title = null;

    /**
     * @var string $_smart 폴더인경우 스마트폴더설정
     */
    private string $_smart = 'none';

    /**
     * @var string[] $_children 폴더인경우 자식메뉴경로
     */
    private array $_children = [];

    /**
     * @var int $_sort 정렬순서
     */
    private int $_sort = 0;

    /**
     * @var bool $_is_user 유저설정여부
     */
    private bool $_is_user = false;

    /**
     * 네비게이션 객체를 지정한다.
     *
     * @param string|object $path 네비게이션 객체 설정
     * @param int $sort 네비게이션정렬순서
     * @param bool $is_user 유저설정여부
     * @param bool $is_child 자식여부
     * @return \modules\admin\dtos\NavigationItem $item
     */
    public static function set(
        string|object $path,
        int $sort,
        bool $is_user,
        bool $is_child = false
    ): \modules\admin\dtos\NavigationItem {
        if (is_string($path) == true) {
            if (isset(self::$_items[$path]) == false) {
                self::$_items[$path] = new \modules\admin\dtos\NavigationItem($path, $sort, $is_user);
            }

            if ($is_child == false && isset(self::$_navitaion[$path]) == false) {
                self::$_navitaion[$path] = self::$_items[$path];
            }

            return \modules\admin\dtos\NavigationItem::get($path);
        } else {
            if (isset(self::$_items[$path->title]) == false) {
                self::$_items[$path->title] = new \modules\admin\dtos\NavigationItem($path, $sort, $is_user);
            }

            if ($is_child == false && isset(self::$_navitaion[$path->title]) == false) {
                self::$_navitaion[$path->title] = self::$_items[$path->title];
            }

            return \modules\admin\dtos\NavigationItem::get($path->title);
        }
    }

    /**
     * 네비게이션 객체를 가져온다.
     *
     * @param string $path 네비게이션경로 또는 폴더명
     * @return ?\modules\admin\dtos\NavigationItem $item
     */
    public static function get(string $path): ?\modules\admin\dtos\NavigationItem
    {
        return isset(self::$_items[$path]) == true ? self::$_items[$path] : null;
    }

    /**
     * 특정 컨텍스트 경로가 이미 네비게이션에 정의되어 있는지 확인한다. 객체를 가져온다.
     *
     * @param string $path 컨텍스트경로
     * @return bool $exists
     */
    public static function has(string $path): bool
    {
        return isset(self::$_items[$path]) == true;
    }

    /**
     * 접근가능한 전체 네비게이션을 가져온다.
     *
     * @param \modules\admin\dtos\Context[] $contexts 접근가능한 전체 컨텍스트
     * @return object[] $navigation
     */
    public static function all(array $contexts): array
    {
        $navitaion = [];

        foreach (self::$_navitaion as $item) {
            if ($item->isFolder() == true) {
                $folder = new \stdClass();
                $folder->icon = $item->getIcon();
                $folder->title = $item->getTitle();
                $folder->type = 'FOLDER';
                $folder->smart = $item->getSmart();
                $folder->sort = $item->getSort();
                $folder->children = [];

                foreach ($item->getChildren() as $child) {
                    if (isset($contexts[$child->getPath()]) == true) {
                        $context = new \stdClass();
                        $context->icon = $contexts[$child->getPath()]->getIcon();
                        $context->title = $contexts[$child->getPath()]->getTitle();
                        $context->path = $child->getPath();
                        $context->type = $contexts[$child->getPath()]->getType();
                        $context->target = $contexts[$child->getPath()]->getTarget();
                        $context->sort = $child->getSort();

                        $folder->children[] = $context;
                    }
                }

                usort($folder->children, function ($left, $right) {
                    if ($left->sort == $right->sort) {
                        return $left->title <=> $right->title;
                    } else {
                        return $left->sort <=> $right->sort;
                    }
                });

                if (count($folder->children) > 0 || $item->isUser() == true) {
                    $navitaion[] = $folder;
                }
            } else {
                $context = new \stdClass();
                $context->icon = $contexts[$item->getPath()]->getIcon();
                $context->title = $contexts[$item->getPath()]->getTitle();
                $context->path = $item->getPath();
                $context->type = $contexts[$item->getPath()]->getType();
                $context->target = $contexts[$item->getPath()]->getTarget();
                $context->sort = $item->getSort();

                $navitaion[] = $context;
            }
        }

        usort($navitaion, function ($left, $right) {
            if ($left->sort == $right->sort) {
                return $left->title <=> $right->title;
            } else {
                return $left->sort <=> $right->sort;
            }
        });

        return $navitaion;
    }

    /**
     * 네비게이션 객체를 정의한다.
     *
     * @param string|object $path 네비게이션 객체 설정
     * @param int $sort 네비게이션 정렬순서
     * @param bool $is_user 유저설정여부
     */
    public function __construct(string|object $path, int $sort, bool $is_user)
    {
        if (is_string($path) == true) {
            $this->_path = $path;
        } else {
            $this->_icon = $path->icon;
            $this->_title = $path->title;
            $this->_smart = $path->smart ?? 'none';
            $children = $path->children ?? [];
            foreach ($children as $sort => $child) {
                $this->_children[] = \modules\admin\dtos\NavigationItem::set($child, $sort, $is_user, true);
            }

            $this->_smart = $path->smart ?? 'none';
        }

        $this->_sort = $is_user === true ? $sort : $sort + 1000;
        $this->_is_user = $is_user;
    }

    /**
     * 폴더여부를 확인한다.
     *
     * @return bool $is_folder
     */
    public function isFolder(): bool
    {
        return $this->_path === null;
    }

    /**
     * 유저설정여부를 확인한다.
     *
     * @return bool $is_user
     */
    public function isUser(): bool
    {
        return $this->_is_user;
    }

    /**
     * 스마트폴더여부를 확인한다.
     *
     * @return bool $is_smart
     */
    public function getSmart(): string
    {
        return $this->_smart;
    }

    /**
     * 폴더인 경우 자식 컨텍스트 경로를 추가한다.
     *
     * @param string $path 컨텍스트경로
     * @param int $sort 컨텍스트정렬순서
     */
    public function addChild(string $path, int $sort): void
    {
        if ($this->_path !== null) {
            return;
        }

        if (\modules\admin\dtos\NavigationItem::has($path) === false) {
            $this->_children[] = \modules\admin\dtos\NavigationItem::set($path, $sort, false, true);
        }
    }

    /**
     * 폴더인 경우 폴더아이콘을 가져온다.
     *
     * @return ?string $path
     */
    public function getIcon(): ?string
    {
        return $this->_icon;
    }

    /**
     * 폴더인 경우 폴더명을 가져온다.
     *
     * @return ?string $title
     */
    public function getTitle(): ?string
    {
        return $this->_title;
    }

    /**
     * 네비게이션 객체의 컨텍스트 경로를 가져온다.
     *
     * @return ?string $path
     */
    public function getPath(): ?string
    {
        return $this->_path;
    }

    /**
     * 네비게이션 객체의 정렬순서를 가져온다.
     *
     * @return int $sort
     */
    public function getSort(): int
    {
        return $this->_sort;
    }

    /**
     * 폴더인 경우 자식 컨텍스트를 가져온다.
     *
     * @return \modules\admin\dtos\NavigationItem[] $children
     */
    public function getChildren(): array
    {
        return $this->_children;
    }
}
