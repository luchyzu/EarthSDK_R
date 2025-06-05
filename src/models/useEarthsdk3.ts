import { useSetState } from 'ahooks';
import { ESObjectsManager, ESImageryLayer, ESTerrainLayer } from 'earthsdk3'
import { ESCesiumViewer } from 'earthsdk3-cesium'
import { ESUeViewer } from 'earthsdk3-ue'

export default () => {
  const [objmState, setObjmState] = useSetState({
    objm: null as any,
    imageryLayer: null as any,
  });

  const objmAction = (async (action: 'create' | 'addESImageryLayer' | 'addESTerrainLayer' | 'changeImageLayerShow', record?: Record<string, any>) => {
    switch (action) {
      case 'create':
        const objm = new ESObjectsManager(ESCesiumViewer, ESUeViewer)
        setObjmState({
          objm,
        })
        break;
      // 添加影像
      case 'addESImageryLayer': {
        let { objm, imageryLayer } = objmState
        imageryLayer = objm.createSceneObject(ESImageryLayer)
        if (!imageryLayer) return
        imageryLayer.url =
          'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        imageryLayer.zIndex = 1
        setObjmState({
          imageryLayer,
        })
      }
        break;
      // 添加地形
      case 'addESTerrainLayer': {
        let { objm } = objmState
        const sceneObject = objm.createSceneObject(ESTerrainLayer)
        if (!sceneObject) return
        sceneObject.url = 'http://114.242.26.126:6003/terrain/globe/layer.json'

      }
        break;
      case 'changeImageLayerShow': {
        console.log(123,record)
        let { imageryLayer } = objmState
        if (!imageryLayer) return
        imageryLayer.show = record
      }
        break;
      // no default
    }
  });

  return { objmState, objmAction };
}
