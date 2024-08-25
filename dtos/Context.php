<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 컨텍스트 구조체를 정의한다.
 *
 * @file /modules/admin/dtos/Context.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 8. 25.
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
     * @var bool $_default_folder 기본폴더여부 (false 인 경우 폴더에 포함되어 있지 않은 최상위 컨텍스트)
     */
    private bool $_default_folder = true;

    /**
     * @var string $_default_folder_title 기본폴더명
     */
    private ?string $_default_folder_title = null;

    /**
     * @var string $_default_folder_icon 기본폴더아이콘
     */
    private ?string $_default_folder_icon = null;

    /**
     * @var int $_default_folder_sort 기본폴더정렬순서
     */
    private int $_default_folder_sort = 0;

    /**
     * @var string $_target 링크타겟
     */
    private string $_target = '_self';

    /**
     * @var ?string $_icon 컨텍스트 아이콘
     */
    private ?string $_icon;

    /**
     * @var int $_sort 컨텍스트 정렬순서
     */
    private int $_sort = 0;

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
     * @param int $sort 정렬순서
     * @return \modules\admin\dtos\Context $this
     */
    public function setTitle(string $title, ?string $icon = null, int $sort = 0): \modules\admin\dtos\Context
    {
        $this->_title = $title;
        $this->_icon = $icon;
        $this->_sort = $sort;
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
     * 관리자가 네비게이션 설정을 하지 않았을 때 기본적으로 담길 폴더명을 설정한다.
     * 해당 폴더명을 가진 폴더가 없을 경우 자동으로 해당 폴더명을 생성한다.
     *
     * @param string|bool $title 기본폴더명 (false 인 경우 최상위 컨텍스트로 설정한다.)
     * @param ?string $icon 기본폴더아이콘
     * @param int $sort 기본폴더정렬순서
     * @return \modules\admin\dtos\Context $this
     */
    public function setDefaultFolder(
        string|bool $title,
        ?string $icon = null,
        int $sort = 0
    ): \modules\admin\dtos\Context {
        if ($title === false) {
            $this->_default_folder = false;
        } else {
            $this->_default_folder = true;
            if (is_bool($title) === true) {
                $this->_default_folder_title = null;
                $this->_default_folder_icon = null;
                $this->_default_folder_sort = 0;
            } else {
                $this->_default_folder_title = $title;
                $this->_default_folder_icon = $icon;
                $this->_default_folder_sort = $sort;
            }
        }

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
     * 해당 컨텍스트가 폴더에 포함되어 있지 않는 최상위 컨텍스트인지를 가져온다.
     *
     * @return bool $is_root
     */
    public function isRoot(): bool
    {
        return $this->_default_folder === false;
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
     * 컨텍스트 정렬순서를 가져온다.
     *
     * @return int $sort
     */
    public function getSort(): int
    {
        return $this->_sort;
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
     * 링크대상을 가져온다.
     *
     * @return string $target (_self, _blank)
     */
    public function getTarget(): string
    {
        return $this->_target;
    }

    /**
     * 기본폴더를 가져온다.
     *
     * @return ?object $default_folder 기본폴더설정
     */
    public function getDefaultFolder(): ?object
    {
        if ($this->_default_folder === false) {
            return null;
        }

        if ($this->_default_folder_title === null) {
            return null;
        }

        $folder = new \stdClass();
        $folder->title = $this->_default_folder_title;
        $folder->icon = $this->_default_folder_icon ?? 'mi mi-folder';

        return $folder;
    }

    /**
     * 기본폴더 정렬순서를 가져온다.
     *
     * @return int $sort
     */
    public function getDefaultFolderSort(): int
    {
        return $this->_default_folder_sort;
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
