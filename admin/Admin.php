<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리자 클래스를 정의한다.
 *
 * @file /modules/admin/admin/Admin.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 2. 26.
 */
namespace modules\admin\admin;
class Admin
{
    /**
     * @var \modules\admin\Admin $_admin 관리자모듈
     */
    private static \modules\admin\Admin $_admin;

    /**
     * 관리자 클래스를 정의한다.
     */
    public function __construct(\modules\admin\Admin $admin)
    {
        self::$_admin = $admin;
    }

    /**
     * 관리자 컨텍스트를 초기화한다.
     */
    public function init(): void
    {
    }

    /**
     * 언어팩 코드 문자열을 가져온다.
     *
     * @param string $text 코드
     * @param ?array $placeHolder 치환자
     * @return string|array $message 치환된 메시지
     */
    public function getText(string $text, ?array $placeHolder = null): string|array
    {
        return \Language::getText(
            $text,
            $placeHolder,
            ['/' . $this->getComponent()->getType() . 's/' . $this->getComponent()->getName(), '/'],
            [self::$_admin->getLanguage()]
        );
    }

    /**
     * 언어팩 에러코드 문자열을 가져온다.
     *
     * @param string $code 에러코드
     * @param ?array $placeHolder 치환자
     * @return string $message 치환된 메시지
     */
    public function getErrorText(string $code, ?array $placeHolder = null): string
    {
        return self::getText('errors/' . $code, $placeHolder);
    }

    /**
     * 컴포넌트타입 컨텍스트를 추가한다.
     *
     * @param string $path 경로
     * @param string $title 컨텍스트명
     * @param ?string $icon 컨텍스트아이콘
     */
    public function addContext(string $path, string $title, string $icon = '', bool $is_root = false): void
    {
        $context = new \modules\admin\dto\Context($this, $title, $icon);
        $context->setContext($path, $is_root);

        self::$_admin->addContext($context);
    }

    /**
     * 링크타입 컨텍스트를 추가한다.
     *
     * @param string $url 링크주소
     * @param string $title 컨텍스트명
     * @param string $target 링크대상 (_self : 현재창, _blank : 새창)
     * @param ?string $icon 컨텍스트아이콘
     */
    public function addLink(string $url, string $title, string $target = '_self', string $icon = ''): void
    {
        $context = new \modules\admin\dto\Context($this, $title, $icon);
        $context->setLink($url, $target);
        self::$_admin->addContext($context);
    }

    /**
     * 컨텍스트를 처리할 컴포넌트 클래스를 가져온다.
     *
     * @return \Component $component
     */
    public function getComponent(): \Component
    {
        $regExp = '/^(module|plugin|widget)s\\\(.*?)\\\admin\\\(.*?)Admin$/';
        if (preg_match($regExp, get_called_class(), $match) == true) {
            $type = $match[1];
            $name = $match[2];

            if ($type == 'module') {
                return \Modules::get($name);
            }
        }

        return null;
    }

    /**
     * 관리자 기본경로를 가져온다.
     *
     * @return string $base
     */
    public function getBase(): string
    {
        return $this->getComponent()->getBase() . '/admin';
    }

    /**
     * 관리자 상대경로를 가져온다.
     *
     * @return string $dir
     */
    public function getDir(): string
    {
        return $this->getComponent()->getDir() . '/admin';
    }

    /**
     * 관리자 절대경로를 가져온다.
     *
     * @return string $path
     */
    public function getPath(): string
    {
        return $this->getComponent()->getPath() . '/admin';
    }

    /**
     * 현재 모듈 관리자에서 추가로 사용하는 자바스크립트를 가져온다.
     * /admin/scripts/Admin.js 파일은 자동으로 불러온다.
     *
     * @return string[] $scripts
     */
    public function scripts(): array
    {
        return [];
    }

    /**
     * 현재 모듈 관리자에서 추가로 사용하는 스타일시트를 가져온다.
     * /admin/scripts/Admin.css, /admin/scripts/Admin.scss 파일은 자동으로 불러온다.
     *
     * @return string[] $styles
     */
    public function styles(): array
    {
        return [];
    }

    /**
     * 각 컨텍스트의 콘텐츠를 가져온다.
     *
     * @param string $path 컨텍스트 경로
     * @param ?string $subPath 컨텍스트 하위경로
     */
    public function getContent(string $path, ?string $subPath = null): string
    {
        return '';
    }
}
