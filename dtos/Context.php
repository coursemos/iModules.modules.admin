<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 컨텍스트 구조체를 정의한다.
 *
 * @file /modules/admin/dtos/Context.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 */
namespace modules\admin\dtos;
class Context
{
    /**
     * @var \modules\admin\admin\Component $_admin 컴포넌트의 관리자클래스
     */
    private \modules\admin\admin\Component $_admin;

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
     * @var string $_default_folder_title 기본폴더명
     */
    private ?string $_default_folder_title = null;

    /**
     * @var string $_default_folder_icon 기본폴더아이콘
     */
    private ?string $_default_folder_icon = null;

    /**
     * @var string $_target 링크타겟
     */
    private string $_target = '_self';

    /**
     * @var ?string $_icon 컨텍스트 아이콘
     */
    private ?string $_icon;

    /**
     * @var string $_smart 스마트폴더 여부 (none, modules, plugins, widgets, others)
     */
    private string $_smart = 'none';

    /**
     * @var \modules\admin\dtos\Context[] $_children 자식 컨텍스트
     */
    private array $_children = [];

    /**
     * 관리자 컨텍스트 구조체를 정의한다.
     *
     * @param \modules\admin\admin\Admin $admin 컨텍스트의 관리자클래스
     */
    public function __construct(\modules\admin\admin\Component $admin)
    {
        $this->_admin = $admin;
    }

    /**
     * 새로운 관리자 컨텍스트 구조체를 가져온다.
     *
     * @param \modules\admin\admin\Admin $admin 컨텍스트의 관리자클래스
     * @return \modules\admin\dtos\Context $context
     */
    public static function init(\modules\admin\admin\Component $admin): \modules\admin\dtos\Context
    {
        return new \modules\admin\dtos\Context($admin);
    }

    /**
     * 컨텍스트 제목을 정의한다.
     *
     * @param string $title 컨텍스트명
     * @param ?string $icon 컨텍스트 아이콘 (CSS 스타일명 또는 이미지파일 경로)
     * @return \modules\admin\dtos\Context $this
     */
    public function setTitle(string $title, ?string $icon = null): \modules\admin\dtos\Context
    {
        $this->_title = $title;
        $this->_icon = $icon;
        return $this;
    }

    /**
     * 컴포넌트타입 컨텍스트를 설정한다.
     *
     * @param string $path 경로
     * @return \modules\admin\dtos\Context $this
     */
    public function setContext(string $path): \modules\admin\dtos\Context
    {
        $this->_type = 'CONTEXT';
        $this->_path = $path;
        return $this;
    }

    /**
     * 링크타입 컨텍스트를 설정한다.
     *
     * @param string $url 링크주소
     * @param string $target 대상 (_self : 현재창, _blank : 새창)
     * @return \modules\admin\dtos\Context $this
     */
    public function setLink(string $url, string $target = '_self'): \modules\admin\dtos\Context
    {
        $this->_type = 'LINK';
        $this->_path = $url;
        $this->_target = $target;
        return $this;
    }

    /**
     * 폴더 컨텍스트를 설정한다.
     *
     * @param \modules\admin\dtos\Context[] $children 자식컨텍스트
     * @param string $smart 스마트폴더 여부
     * @return \modules\admin\dtos\Context $this
     */
    public function setFolder(array $children, string $smart = 'none'): \modules\admin\dtos\Context
    {
        $this->_type = 'FOLDER';
        $this->_smart = $smart;
        $this->_children = $children;
        return $this;
    }

    /**
     * 관리자가 네비게이션 설정을 하지 않았을 때 기본적으로 담길 폴더명을 설정한다.
     * 해당 폴더명을 가진 폴더가 없을 경우 자동으로 해당 폴더명을 생성한다.
     *
     * @param ?string $title 기본폴더명 (NULL 인 경우 기본적으로 폴더에 담지 않는다.)
     * @param ?string $icon 기본폴더아이콘
     * @return \modules\admin\dtos\Context $this
     */
    public function setDefaultFolder(?string $title, ?string $icon = null): \modules\admin\dtos\Context
    {
        $this->_default_folder_title = $title;
        $this->_default_folder_icon = $icon;
        return $this;
    }

    /**
     * 컨텍스트를 처리할 컴포넌트 관리자 클래스를 가져온다.
     *
     * @return \modules\admin\admin\Component $admin
     */
    public function getAdmin(): \modules\admin\admin\Component
    {
        return $this->_admin;
    }

    /**
     * 컨텍스트를 처리할 컴포넌트 클래스를 가져온다.
     *
     * @return \Component $component
     */
    public function getComponent(): \Component
    {
        return $this->_admin->getComponent();
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
                $component = $this->getComponent();
                if ($component->getType() == 'module' && $component->getName() == 'admin') {
                    return '/' . $this->_path;
                } else {
                    return '/' . $component->getType() . '/' . $component->getName() . '/' . $this->_path;
                }
                break;

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
        if ($this->_icon === null || strlen($this->_icon) === 0) {
            switch ($this->_type) {
                case 'CONTEXT':
                    $this->_icon = $this->getComponent()->getIcon();
                    break;

                case 'LINK':
                    $this->_icon = 'xi xi-external-link';
                    break;

                case 'FORDER':
                    $this->_icon = 'xi xi-folder';
                    break;

                default:
                    $this->_icon = 'xi xi-marquee-add';
            }
        }

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
     * @return \modules\admin\dtos\Context[] $children
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
     * 기본폴더명을 가져온다.
     * 컨텍스트 종류가 폴더인 경우 무조건 NULL 이 반환된다.
     *
     * @return ?string $title
     */
    public function getDefaultFolderTitle(): ?string
    {
        return $this->_type == 'FOLDER' ? null : $this->_default_folder_title;
    }

    /**
     * 기본폴더아이콘을 가져온다.
     * 컨텍스트 종류가 폴더인 경우 무조건 NULL 이 반환된다.
     *
     * @return ?string $icon
     */
    public function getDefaultFolderIcon(): ?string
    {
        return $this->getDefaultFolderTitle() !== null ? $this->_default_folder_icon ?? 'xi xi-folder' : null;
    }

    /**
     * 컨텍스트의 콘텐츠를 가져온다.
     *
     * @return string $content 콘텐츠
     */
    public function getContent(): string
    {
        return $this->_admin->getContext($this->_path);
    }
}
