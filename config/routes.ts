export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    name: 'Earthsdk3',
    icon: 'table',
    path: '/earthsdk3',
    component: './Earthsdk3',
  },
  {
    name: '在线影像加载',
    icon: 'table',
    path: '/earthsdk3_02',
    component: './Earthsdk3_02',
  },
  {
    name: '3DTileset加载',
    icon: 'table',
    path: '/Earthsdk3_03',
    component: './Earthsdk3_03',
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './404',
  },
];
