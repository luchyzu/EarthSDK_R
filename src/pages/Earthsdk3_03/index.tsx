import { ESWidget } from 'earthsdk3'
import styles from './index.less';
import { useSetState, useMount, useCreation, useMemoizedFn } from 'ahooks';
import { useModel } from 'umi';
import { Button, message, Switch } from 'antd';
import Weather from './components/Weather'
import VisualParameters from './components/VisualParameters'
import PoiSelector from './components/PoiSelector'

let carData
let humanData
let humanPoiData
let BIMtileset

export default () => {
  const { objmState, objmAction } = useModel('useEarthsdk3');

  const [state, setState] = useSetState({
    objm: null as any,
    onlineUrl: null as unknown,
    viewer: null as any,
    earth: null as any,
    location: null as any,
    camera: null as any,
    activedSwitch: ['影像显隐控制'] as string[],
    switchBtn_1: [
      {
        title: '影像显隐控制',
        Fn: 'changeImageLayerShow',
      },
      {
        title: '3D模型',
      },
    ],
    switchBtn_2: [
      {
        title: 'Poi标绘',
      },
      {
        title: '可视化参数',
      },
      {
        title: '天气',
      },
    ],
  });




  useMount(() => {
    // 1. 初始化场景管理器
    // 参数说明：注册UE和Cesium两种渲染引擎
    objmAction('create')
  })

  const init = () => {
    const objm = objmState.objm
    const eSWidget = objm.createSceneObject(ESWidget)

    const earth = document.getElementById("earth");
    objm.createCesiumViewer(earth)
    //Cesium  token
    objm.activeViewer.ionAccessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNjVkZDYxOC01NmEwLTQ1ZmEtOGE2ZS1lYWUyODM4ZWQxYzQiLCJpZCI6MjU5LCJpYXQiOjE3NDYxMTA0Njl9.uyhPpCQKB1dodfbqTx0ZUPOLhnrSXd-qWixDxc4GYXk'
    // // 通过json创建一个影像图层
    // objm.createSceneObjectFromJson({
    //   id: '9812a65f-0de0-4f7b-b234-809c0c2fb8ef',
    //   type: 'ESImageryLayer',
    //   url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    // })
    // 3. 调用封装的方法加载影像 / 地形
    // initEarthLayers(objm, state.value)
    objmAction('addESImageryLayer')
    objmAction('addESTerrainLayer')
    //监听视口状态
    objm.activeViewer.statusChanged.don((value: string) => {
      console.log('监听视口的变化', value)
      if (value === 'Created') {
        console.log('statusChanged视口创建完成', value)
        // setTimeout(() => {
        //   //即使 statusChanged 触发 'Created'，Viewer 可能仍未完全加载地形或影像
        //   objm.activeViewer.flyIn(
        //     [109.00683438952149, 15.271693222726297, 2168741.372762946],
        //     [15.175646391806431, -55.3102300877878, 0.09839208246353574],
        //     3,
        //   )
        // }, 1000) // 延迟 1 秒确保 Viewer 完全就绪
      }
    })
    //每当有新视口创建的时候便会触发这个事件
    objm.viewerCreatedEvent.don((viewer: { clickEvent: { don: (arg0: (e: any) => void) => void; }; pickPosition: (arg0: any) => Promise<string | any[]>; pick: (arg0: any, arg1: string) => Promise<{ tilesetPickInfo: any; sceneObject: { name: any; }; }>; hoverEvent: { don: (arg0: (e: any) => void) => void; }; }) => {
      // 监听clickEvent鼠标事件
      viewer.clickEvent.don((e) => {
        // pickPosition拾取经纬度
        viewer.pickPosition(e.screenPosition).then((position: string | any[]) => {
          if (!position || !position?.length) return
          console.log('点击位置处的三维经纬高坐标：', position)
          eSWidget.position = [...position]
          if (humanData?.length > 0) {
            humanData.forEach((item: { smoothMove: (arg0: any, arg1: number) => void; }) => {
              // item.animation = 'running'
              item.smoothMove(position, 3)
            })
          }
          if (humanPoiData?.length > 0) {
            humanPoiData.forEach((item: { smoothMove: (arg0: any, arg1: number) => void; }) => {
              // item.animation = 'running'
              item.smoothMove(position, 10)
            })
          }
          if (carData?.length > 0) {
            carData.forEach((item: { smoothMove: (arg0: any, arg1: number) => void; }) => {
              // item.animation = 'running'
              item.smoothMove(position, 10)
            })
          }
        })
        // pick拾取
        viewer.pick(e.screenPosition, 'clickPick').then((res: { tilesetPickInfo: any; sceneObject: { name: any; }; }) => {
          // 判断是否拾取到信息
          if (!res || !res.tilesetPickInfo) {
            eSWidget.info = { title: '基本信息' }
            eSWidget.show = false
            return
          }
          console.log('拾取属性信息', res.sceneObject.name, res)
          // tilset属性信息
          const tilesetPickInfo = res.tilesetPickInfo
          // featureId
          const id = tilesetPickInfo['id']
          // 高亮Feature
          BIMtileset.resetFeatureStyle() //恢复feature，还原setFeatureVisable和setFeatureColor和setFeatureStyle的更改
          //根据属性名和条件值设置feature颜色；
          BIMtileset.setFeatureColor('id', [
            {
              value: id,
              rgba: [1, 0, 0, 1],
            },
          ])

          const data = {
            title: '基本信息',
            ...tilesetPickInfo,
          }
          eSWidget.info = data
          eSWidget.show = true
        })
        //   //hoverEvent 鼠标悬停事件 悬停时长可由viewer.hoverTime属性控制
        viewer.hoverEvent.don((e) => {
          console.log('鼠标悬浮事件hoverEvent', e)
          viewer.pick(e.screenPosition, 'hoverPick')
        })
      })

      //默认飞入点
      objm.activeViewer.flyIn(
        [120.26895628709843, 31.99890350891649, 1269.9201196285085],
        [333.4666903019263, -44.392623459065334, 0.0027997885275428858],
        3,
      )
    })
    setState({
      earth,
    })
  }

  const switchToCesiumViewer = () => {
    const { earth } = state
    const objm = objmState.objm
    if (!earth) return
    objm.switchToCesiumViewer(earth, undefined, undefined, true)

  }

  const switchToUEViewer = () => {
    const { earth } = state
    const objm = objmState.objm
    if (!earth) return
    objm.switchToUEViewer(earth, 'http://localhost:9007/', 'demoUE5.3', true, undefined, true)
  }

  // 获取当前视角信息
  const getLocationInfo = () => {
    const objm = objmState.objm

    const view = objm.activeViewer.getCurrentCameraInfo()
    console.log('当前视角信息', view)
    if (!view) {
      message.warning('当前视角信息为空');
      return
    }
    const { position, rotation } = view
    message.success('定位成功')
    setState({
      location: position,
      camera: rotation
    })
  }
  const myFly = () => {
    const objm = objmState.objm
    objm.activeViewer.flyIn(state.location, state.camera, 3)
  }
  const switchChange = useMemoizedFn(async (action: 'changeImageLayerShow' | 'apply', record?: Record<string, any>) => {
    let activedSwitch = state.activedSwitch
    const findOne = activedSwitch.find(v => v === record?.title)
    if (findOne) {
      activedSwitch = activedSwitch.filter(v => v !== record?.title)
    } else {
      activedSwitch.push(record.title)
    }
    setState({
      activedSwitch,
    })
    switch (action) {
      case 'changeImageLayerShow':
        objmAction('changeImageLayerShow', findOne ? false : true)
        break
      // no default
    }
    return false
  })

  // 状态提升触发handlePoiCreated  poi绑定控制台调试   //可直接在PoiSelector对应方法中绑定
  const handlePoiCreated = ({ type, instance, humanArr, humanPoiArr, carArr }) => {
    if (humanArr) {
      humanData = humanArr
    }
    if (humanPoiArr) {
      humanPoiData = humanPoiArr
    }
    if (carArr) {
      carData = carArr
    }
    console.log(`创建的POI类型: ${type}`, instance)
    switch (type) {
      case 'image':
        window.ESimagepoi = instance
        break
      case '3d':
        window.ESpoi3d = instance
        break
      case '2d':
        window.ESpoi2d = instance
        break
      case 'human':
        window.EShuman = instance
        break
      case 'humanPoi':
        window.EShumanPoi = instance
        break
      case 'car':
        window.EScar = instance
        break
      default:
        console.warn(`未知的POI类型: ${type}`)
        break
    }
  }


  useCreation(() => {
    if (objmState.objm) {
      init()
    }
  }, [objmState.objm])

  return (
    <>
      <div className={styles.Earthsdk3_03}>

        <div
          id="earth"
          className={styles.Earthsdk3Box}
        // onContextMenu={ }
        />

        <div className={styles.TopTool}>

          <div className={styles.changeViewer}>
            <Button className={styles.btn} type="info" onClick={switchToCesiumViewer}>切换Cesium视口</Button>
            <Button className={styles.btn} type="info" onClick={switchToUEViewer}>切换UE视口</Button>
            <Button className={styles.btn} type="info" onClick={getLocationInfo}>定位锚点</Button>
            <Button className={styles.btn} type="info" onClick={myFly}>飞向锚点</Button>

          </div>
          <div className={styles.switchBtnViewer}>
            {
              state.switchBtn_1.map(v => (
                <div className={styles.switchBtn}>
                  <span className={styles.title}>{v.title}</span>
                  <Switch checked={state.activedSwitch.find(vv => vv === v.title)} onChange={() => {
                    switchChange(v?.Fn, v)
                  }} />
                </div>
              ))
            }
            {
              state.switchBtn_2.map(v => (
                <div className={styles.switchBtn}>
                  <span className={styles.title}>{v.title}</span>
                  <Switch checked={state.activedSwitch.find(vv => vv === v.title)} onChange={() => {
                    switchChange(v?.Fn, v)
                  }} />
                </div>
              ))
            }
          </div>


        </div>

        {
          state.activedSwitch.find(v => v === 'Poi标绘') &&
          <div className={styles.PoiSelector}>
            <PoiSelector handlePoiCreated={handlePoiCreated} />
          </div>
        }
        {
          state.activedSwitch.find(v => v === '可视化参数') &&
          <div className={styles.VisualParameters}>
            <VisualParameters />
          </div>
        }
        {
          state.activedSwitch.find(v => v === '天气') &&
          <div className={styles.Weather}>
            <Weather />
          </div>
        }
      </div>
    </>

  );
};
