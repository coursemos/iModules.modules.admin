/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 페이지 기본 이벤트를 처리한다.
 *
 * @file /modules/admin/scripts/script.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 24.
 */
Html.ready(() => {
    const $body = Html.get('body');
    const type = $body.getData('type');

    if (type == 'login') {
        const $form = Html.get('form', $body);
        const form = Form.get($form);

        Html.get('input', $form).on('input', () => {
            const $message = Html.get('div[data-role=message]', $form);
            $message.remove();
        });

        form.onSubmit(async () => {
            const $message = Html.get('div[data-role=message]', $form);
            $message.remove();

            const results = await form.submit(iModules.getProcessUrl('module', 'admin', 'login'));
            if (results.success == true) {
                location.replace(location.href);
            } else {
                if (results.message) {
                    const $message = Html.create('div', { 'data-role': 'message' });
                    $message.html(results.message);
                    $form.append($message);
                }

                $form.shake();
            }
        });
    }
});
