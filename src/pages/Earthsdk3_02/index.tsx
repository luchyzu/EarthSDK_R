import { ESObjectsManager, ESImageryLayer } from 'earthsdk3'
import { ESCesiumViewer } from 'earthsdk3-cesium'
import { ESUeViewer } from 'earthsdk3-ue'
import FormSelect from '@/components/forms/FormSelect'


import styles from './index.less';
import { useSetState, useMount, useCreation } from 'ahooks';

export default () => {
  const [state, setState] = useSetState({
    objm: null as any,
    onlineUrl: null as unknown,
    viewer: null as any,
    onlineUrlBox: [
      {
        label: 'mapbox影像',
        value: 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.webp?sku=101sYi3y1mcMa&access_token=pk.eyJ1IjoiMTUyMzE5ODg5MzIiLCJhIjoiY2x6bWgzNWY3MDFrOTJscXd4cHVjYXoxNiJ9.sYA8NW_bR9mTTNpROFoznw'
      },
      {
        label: '高德',
        value: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
      },
      {
        label: 'arcgis影像',
        value: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      },
    ]
  });



  //通过ESImageryLayer添加影像图层
  const addESImageryLayer = () => {
    const sceneObject = state.objm.createSceneObject(ESImageryLayer, 'image')
    if (!sceneObject) return
    //mapbox
    sceneObject.url = state.onlineUrl
    sceneObject.zIndex = 100 //层级覆盖
  }


  const switchOnlineUrl = (e: string) => {
    // 1.获取影像图层
    const imageLayer = state.objm.getSceneObjectById('image')
    if (!imageLayer) return
    // 2.设置图层的url地址
    imageLayer.url = state.onlineUrl
    setState({
      onlineUrl: e,
    })
  }

  useMount(() => {
    // 1. 初始化场景管理器
    // 参数说明：注册UE和Cesium两种渲染引擎
    const objm = new ESObjectsManager(ESUeViewer, ESCesiumViewer)
    const earth = document.getElementById("earth");
    const onlineUrl = 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.webp?sku=101sYi3y1mcMa&access_token=pk.eyJ1IjoiMTUyMzE5ODg5MzIiLCJhIjoiY2x6bWgzNWY3MDFrOTJscXd4cHVjYXoxNiJ9.sYA8NW_bR9mTTNpROFoznw'
    const viewer = objm.createCesiumViewer(earth)
    setState({
      objm,
      onlineUrl,
      viewer,
    })

  })

  useCreation(() => {
    if (state.objm && state.onlineUrl) {
      addESImageryLayer()
    }
  }, [state.objm, state.onlineUrl])

  return (
    <>
      <div className={styles.Earthsdk3_02}>
        <div
          id="earth"
          className={styles.Earthsdk3Box}
        />
        <div className={styles.selectBox}>
          <FormSelect
            options={state.onlineUrlBox}
            value={state.onlineUrl}
            style={{width: 150}}
            fieldProps={{
              Search: false,
              onChange: (e: string) => {
                switchOnlineUrl(e)
              }
            }}
          />
        </div>

      </div>
    </>

  );
};
