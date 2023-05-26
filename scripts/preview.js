/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 미리보기 페이지 이벤트를 처리한다.
 *
 * @file /modules/admin/scripts/preview.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 5. 26.
 */
function resize() {
    const windowWidth = window.innerWidth;
    const $preview = Html.get('#preview');
    const previewWidth = $preview.getWidth();
    const scale = windowWidth / previewWidth;
    $preview.setStyle('transform', 'scale(' + scale + ')');
    $preview.setStyle('height', (1 / scale) * 100 + '%');
}
Html.ready(() => {
    resize();
    window.addEventListener('resize', resize);
});
