
import { ESObjectsManager } from 'earthsdk3'
// 导入UE引擎支持模块
import { ESUeViewer } from 'earthsdk3-ue'
// 导入Cesium引擎支持模块
import { ESCesiumViewer } from 'earthsdk3-cesium'

import styles from './index.less';
import { useSetState, useMount } from 'ahooks';

export default () => {
  const [_, setState] = useSetState({
    objm: null as any,
    viewer: null as any,
    imageryLayer: null as unknown,
  });

  useMount(() => {
    // 1. 初始化场景管理器
    // 参数说明：注册UE和Cesium两种渲染引擎
    const objm = new ESObjectsManager(ESUeViewer, ESCesiumViewer)
    const earth = document.getElementById("earth");
    const viewer = objm.createCesiumViewer(earth)
    viewer.ionAccessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZmQzMDI1OC1kMWYyLTQ1ZjEtYTJmNS0yMjY1ZDcxZjEyOTkiLCJpZCI6NjQ3MTgsImlhdCI6MTYyOTQzNDM5M30.m8vkzG05QiAfe6JQ0XPK8z_6KuUVMf_CoSY-YlMnAIg'

    /**-------------------------------------通过json创建一个Cesium影像图层-------------------------------**/
    const imageryLayer = objm.createSceneObjectFromJson({
      id: '9812a65f-0de0-4f7b-b234-809c0c2fb8ef',
      type: 'ESImageryLayer',
      url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    })


    setState({
      objm,
      viewer,
      imageryLayer,
    })

  })

  return (
    <>
      <div className={styles.Earthsdk3_02}>
        <div
          id="earth"
          className={styles.Earthsdk3Box}
        />
      </div>
    </>

  );
};
