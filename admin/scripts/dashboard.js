/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 대시보드 화면을 구성한다.
 *
 * @file /modules/admin/admin/scripts/dashboard.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 3.
 */
Admin.ready(async () => {
    return new Admin.Panel({
        id: 'MiPanel',
        border: false,
        layout: 'fit',
        scrollable: false,
        items: [
            new Admin.Tab.Panel({
                activeTab: 2,
                border: false,
                layout: 'fit',
                topbar: [
                    new Admin.Button({
                        iconClass: 'mi mi-trash',
                        text: '나는 버튼입니다.',
                    }),
                    new Admin.Button({
                        text: '버튼2',
                    }),
                    '->',
                    '나는 텍스트입니다.',
                ],
                bottombar: [
                    '나는 바닥툴바',
                    '-',
                    '툴바텍스트',
                    new Admin.Button({
                        text: '바닥버튼',
                    }),
                    '-',
                    new Admin.Button({
                        text: '바닥버튼',
                    }),
                    new Admin.Button({
                        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                    }),
                ],
                items: [
                    new Admin.Panel({
                        layout: 'fit',
                        title: '일반패널',
                        iconClass: 'mi mi-home',
                        html: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eu nulla nibh. Nunc condimentum lacus augue, id semper purus venenatis eu. Duis pretium dolor et quam dignissim malesuada. Phasellus eu leo felis. Praesent mi enim, porttitor a imperdiet sed, condimentum id elit. Proin metus eros, porta quis tortor at, dapibus efficitur nunc. Aenean sollicitudin nibh eget urna scelerisque, commodo imperdiet tellus tincidunt.<br><br><br>
                        
                        Duis blandit non sem in scelerisque. Sed dictum massa non sapien laoreet, ut auctor tellus sagittis. Ut blandit mauris fermentum, ultricies lacus eu, elementum odio. Curabitur non risus tristique, pellentesque ex in, ullamcorper risus. Phasellus non nulla mollis nunc vulputate vestibulum egestas quis nulla. Vestibulum eu elit ut odio sodales dapibus. Duis non odio id dui condimentum interdum sed et felis. Sed eleifend diam vel dui mollis, ut egestas tortor auctor. Donec mattis odio ipsum, eget sollicitudin arcu tempor quis.<br><br><br>
                        
                        Duis faucibus justo ut leo congue hendrerit. Cras ut lacus tincidunt, facilisis arcu aliquet, blandit nibh. Mauris ornare, enim in fermentum tincidunt, ante ante congue est, eu ullamcorper risus velit nec odio. Nam at consequat ante. Curabitur eleifend nunc non eros sodales, non venenatis ex suscipit. Nulla iaculis dictum enim. Nunc justo metus, pulvinar sit amet eros interdum, mattis dapibus ligula. Phasellus dapibus rutrum sapien, in posuere nibh euismod eu. Fusce ac elit turpis. Nullam fringilla justo quis nisl mollis mattis. Duis quis feugiat eros, a posuere lorem. Pellentesque eu urna vitae dolor auctor lacinia. Nulla ac rutrum nibh. Curabitur pulvinar neque eu leo consequat consectetur eget sit amet lacus.<br><br><br>
                        
                        Suspendisse iaculis aliquam sapien eget condimentum. Suspendisse vel feugiat elit. Phasellus in tincidunt risus. Etiam dignissim finibus augue nec mattis. Curabitur ac egestas erat. Etiam rutrum, arcu eu sagittis tristique, lacus risus euismod purus, eu pellentesque nibh dui nec dui. Aliquam feugiat augue ac lectus volutpat rhoncus. Donec in convallis sapien, eget euismod eros. Sed lorem est, sagittis et quam ultricies, malesuada mollis ante. Proin ac pulvinar mi, non imperdiet sem. Curabitur lacinia nisl vel cursus tristique.<br><br><br>
                        
                        Integer suscipit risus ac nisi ornare tincidunt. Pellentesque hendrerit nunc nec lorem consectetur dignissim. Nullam ac bibendum elit. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur malesuada nulla non ligula ullamcorper, at fermentum magna varius. Vestibulum sit amet tortor sem. Pellentesque fringilla ornare rutrum. Praesent lacus est, viverra et felis in, sodales sollicitudin lorem. Etiam sollicitudin viverra augue, finibus dictum augue aliquet sed. Nulla ipsum tortor, porttitor quis posuere ut, elementum nec augue. In eu nisi vel erat lobortis ultricies ac et velit. Sed venenatis id ligula eget scelerisque. Suspendisse mauris ligula, cursus et massa eu, consectetur imperdiet lectus. Sed sollicitudin malesuada semper.`,
                    }),
                    new Admin.Grid.Panel({
                        title: '그리드',
                        border: false,
                        layout: 'fit',
                        freeze: 4,
                        topbar: [
                            new Admin.Button({
                                text: '그리드버튼',
                            }),
                        ],
                        columns: [
                            new Admin.Grid.Column({
                                width: 100,
                                text: '고정 100',
                                dataIndex: 'hello',
                            }),
                            {
                                text: '가변폭, 최소 200',
                                dataIndex: 'f',
                                minWidth: 100,
                            },
                        ],
                        store: new Admin.Store.Ajax({
                            url: '/test.json',
                        }),
                    }),
                    new Admin.Grid.Panel({
                        id: 'grid',
                        title: '나는 마진이 있는 그리드',
                        border: true,
                        layout: 'fit',
                        margin: '10px',
                        selectionMode: 'SIMPLE',
                        freeze: 4,
                        columns: [
                            new Admin.Grid.Column({
                                width: 100,
                                text: '고정 100',
                                dataIndex: 'hello',
                            }),
                            {
                                text: '가변, 최소 200, 아주아주 긴 헤더라면 어떻습니까?',
                                dataIndex: 'a',
                                minWidth: 200,
                                headerAlign: 'center',
                            },
                            {
                                text: '고정 150',
                                dataIndex: 'world',
                                headerVerticalAlign: 'bottom',
                                width: 150,
                            },
                            {
                                text: '아주 길게 합체된 컬럼의 이름을 정해봅시다.',
                                columns: [
                                    {
                                        text: '1',
                                        dataIndex: 'a',
                                    },
                                    {
                                        text: '2',
                                        dataIndex: 'b',
                                    },
                                ],
                            },
                            {
                                text: '합체1',
                                headerAlign: 'center',
                                columns: [
                                    {
                                        text: '고정폭 100',
                                        dataIndex: 'c',
                                        headerVerticalAlign: 'top',
                                        width: 100,
                                    },
                                    {
                                        text: '합체2',
                                        headerAlign: 'center',
                                        columns: [
                                            {
                                                text: '고정폭 80',
                                                headerAlign: 'center',
                                                dataIndex: 'd',
                                                width: 80,
                                            },
                                            {
                                                text: '가변폭, 최소 120',
                                                minWidth: 120,
                                                dataIndex: 'e',
                                            },
                                        ],
                                    },
                                    {
                                        text: '고정폭 200',
                                        dataIndex: 'world',
                                        width: 200,
                                    },
                                ],
                            },
                            {
                                text: '합체3',
                                columns: [
                                    {
                                        text: '가변폭, 최소 120',
                                        dataIndex: 'f',
                                        minWidth: 120,
                                    },
                                    {
                                        text: '가변폭, 최소 200',
                                        minWidth: 200,
                                    },
                                ],
                            },
                            {
                                text: '가변폭, 최소 200',
                                dataIndex: 'ko',
                                minWidth: 200,
                            },
                            {
                                text: '안녕',
                                columns: [
                                    { text: '안녕', width: 100 },
                                    { text: '안녕', width: 100 },
                                    {
                                        text: 'Hello',
                                        columns: [
                                            { text: '안녕', width: 100 },
                                            { text: '안녕', width: 100 },
                                        ],
                                    },
                                ],
                            },
                        ],
                        store: new Admin.Store.Ajax({
                            url: '/test.json',
                        }),
                    }),
                    new Admin.Panel({
                        title: '탭2 (일반 HTML 패널)',
                        html: 'Im Panel',
                    }),
                    new Admin.Panel({
                        title: '패널안에 패널',
                        layout: 'fit',
                        border: false,
                        items: [
                            new Admin.Panel({
                                margin: 10,
                                title: '패널안의 패널 제목',
                                layout: 'fit',
                                border: true,
                                html: '패널안의 패널 본문',
                            }),
                        ],
                    }),
                    new Admin.Grid.Panel({
                        title: '마진없는 그리드!',
                        layout: 'fit',
                        border: false,
                        columns: [
                            new Admin.Grid.Column(),
                            {
                                text: '컬럼1',
                                dataIndex: 'hello',
                            },
                            {
                                text: '컬럼2',
                                dataIndex: 'world',
                            },
                            {
                                text: '합체1',
                                columns: [
                                    {
                                        text: '컬럼3',
                                    },
                                    {
                                        text: '합체2',
                                        columns: [
                                            {
                                                text: '컬럼4',
                                            },
                                            {
                                                text: '컬럼5',
                                            },
                                        ],
                                    },
                                    {
                                        text: '컬럼6',
                                    },
                                ],
                            },
                            {
                                text: '컬럼7',
                                dataIndex: 'world',
                            },
                        ],
                        store: new Admin.Store.Ajax({
                            url: '/test.json',
                        }),
                    }),
                ],
            }),
        ],
    });
});
