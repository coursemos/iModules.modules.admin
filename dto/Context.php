<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리자 컨텍스트 구조체를 정의한다.
 *
 * @file /modules/admin/dto/Context.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 2. 26.
 */
namespace modules\admin\dto;
class Context
{
    /**
     * @var \modules\admin\admin\Admin $_admin 관리자 클래스
     */
    private \modules\admin\admin\Admin $_admin;

    /**
     * @var string $_type 타입 (COMPONENT, LINK, BUTTON)
     */
    private string $_type;

    /**
     * @var string $_path 관리자경로
     */
    private string $_path;

    /**
     * @var string $_title 컨텍스트명
     */
    private string $_title;

    /**
     * @var string $_target 링크타겟
     */
    private string $_target = '_self';

    /**
     * @var string $_icon 컨텍스트 아이콘
     */
    private string $_icon;

    /**
     * @var string $_smart 스마트폴더 여부 (none, modules, plugins, widgets, others)
     */
    private string $_smart = 'none';

    /**
     * @var \modules\admin\dto\Context[] $_children 자식 컨텍스트
     */
    private array $_children = [];

    /**
     * @var bool $is_root 최상위메뉴 여부
     */
    private bool $_is_root;

    /**
     * 관리자 컨텍스트 구조체를 정의한다.
     *
     * @param \modules\admin\admin\Admin $admin 관리자클래스
     * @param string $title 컨텍스트명
     * @param string $icon 컨텍스트 아이콘
     */
    public function __construct(\modules\admin\admin\Admin $admin, string $title, string $icon = '')
    {
        $this->_admin = $admin;
        $this->_title = $title;
        $this->_icon = $icon;
    }

    /**
     * 컴포넌트타입 컨텍스트를 설정한다.
     *
     * @param string $path 경로
     * @param bool $is_root 최상위메뉴 여부
     */
    public function setContext(string $path, bool $is_root = false): void
    {
        $this->_type = 'CONTEXT';
        $this->_path = $path;
        $this->_is_root = $is_root;
    }

    /**
     * 링크타입 컨텍스트를 설정한다.
     *
     * @param string $url 링크주소
     * @param string $target 대상 (_self : 현재창, _blank : 새창)
     */
    public function setLink(string $url, string $target = '_self'): void
    {
        $this->_type = 'LINK';
        $this->_path = $url;
        $this->_target = $target;
    }

    /**
     * 폴더 컨텍스트를 설정한다.
     *
     * @param \modules\admin\dto\Context[] $children 자식컨텍스트
     * @param string $smart 스마트폴더 여부
     */
    public function setFolder(array $children, string $smart = 'none'): void
    {
        $this->_type = 'FOLDER';
        $this->_smart = $smart;
        $this->_children = $children;
    }

    /**
     * 컨텍스트를 처리할 컴포넌트 관리자 클래스를 가져온다.
     *
     * @return \Modules\admin\admin\Admin $admin
     */
    public function getAdmin(): \Modules\admin\admin\Admin
    {
        return $this->_admin;
    }

    /**
     * 관리자 경로를 가져온다.
     *
     * @return string $path
     */
    public function getPath(): string
    {
        switch ($this->_type) {
            case 'CONTEXT':
                $regExp = '/^(module|plugin|widget)s\\\(.*?)\\\admin\\\Admin$/';
                if (preg_match($regExp, get_class($this->_admin), $match) == true) {
                    $type = $match[1];
                    $name = $match[2];
                    if ($this->_is_root == true) {
                        return $this->_path == '/' ? '/' : preg_replace('/\/$/', '', $this->_path);
                    } else {
                        return '/' . $type . '/' . $name . preg_replace('/\/$/', '', $this->_path);
                    }
                } else {
                    return '#';
                }

            case 'LINK':
                return $this->_path;

            default:
                return '#';
        }
    }

    /**
     * 컨텍스트 종류를 가져온다.
     *
     * @return string $type
     */
    public function getType(): string
    {
        return $this->_type;
    }

    /**
     * 컨텍스트 제목을 가져온다.
     *
     * @return string $title
     */
    public function getTitle(): string
    {
        return $this->_title;
    }

    /**
     * 컨텍스트 아이콘을 가져온다.
     *
     * @param bool $is_tag <i> 태그 반환여부
     * @return string $icon
     */
    public function getIcon(bool $is_tag = false): string
    {
        if ($is_tag === false) {
            return $this->_icon;
        }

        $class = 'icon';
        $image = '';
        if (strpos($this->_icon, '/') === false) {
            $class .= ' ' . $this->_icon;
        } else {
            $image = ' style="background-image:url(' . $this->_icon . ');"';
        }
        $icon = '<i class="' . $class . '"' . $image . '></i>';

        return $icon;
    }

    /**
     * 스마트폴더 설정을 가져온다.
     *
     * @return string $smart
     */
    public function getSmart(): string
    {
        return $this->_smart;
    }

    /**
     * 자식 컨텍스트를 종류를 가져온다.
     *
     * @return \modules\admin\dto\Context[] $children
     */
    public function getChildren(): array
    {
        return $this->_children;
    }

    /**
     * 링크대상을 가져온다.
     *
     * @return string $target (_self, _blank)
     */
    public function getTarget(): string
    {
        return $this->_target;
    }

    /**
     * 컨텍스트의 콘텐츠를 가져온다.
     *
     * @return ?string $subPath 하위경로
     * @return string $content 콘텐츠
     */
    public function getContent(string $subPath = null): string
    {
        $this->getAdmin()->header();
        return $this->_admin->getContent($this->_path, $subPath);
    }
}
