// https://umijs.org/config/
import { defineConfig } from 'umi';
import path, { join } from 'path';

import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV } = process.env;
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';
const cesiumBaseUrl = 'cesiumStatic';

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'root-entry-name': 'variable',
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  openAPI: [
    {
      requestLibPath: "import { request } from 'umi'",
      // 或者使用在线的版本
      // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
      schemaPath: join(__dirname, 'oneapi.json'),
      mock: false,
    },
    {
      requestLibPath: "import { request } from 'umi'",
      schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
      projectName: 'swagger',
    },
  ],
  nodeModulesTransform: { type: 'none' },
  mfsu: {},
  webpack5: {},
  exportStatic: {},
  copy: [
    { from: path.join(cesiumSource, cesiumWorkers), to: `${cesiumBaseUrl}/Workers` },
    { from: path.join(cesiumSource, 'ThirdParty'), to: `${cesiumBaseUrl}/ThirdParty` },
    { from: path.join(cesiumSource, 'Assets'), to: `${cesiumBaseUrl}/Assets` },
    { from: path.join(cesiumSource, 'Widgets'), to: `${cesiumBaseUrl}/Widgets` },
    { from: path.join('./node_modules/earthsdk3-assets'), to: 'js/earthsdk3-assets' },
  ],
  chainWebpack: (conf) => {
    conf.plugin('define').tap(([option, ...rest]) => {
      const options = {
        ...option,
        CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
      };
      return [options, ...rest];
    });
    conf.module
      .rule('mp4')
      .test(/\.(mp4|zip)(\?.*)?$/)
      .use(require('file-loader'))
      .loader('file-loader')
      .options({
        name: 'static/[name].[hash:8].[ext]',
      });
  },
});
