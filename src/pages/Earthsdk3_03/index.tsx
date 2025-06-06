import { ESWidget } from 'earthsdk3'
import styles from './index.less';
import { useSetState, useMount, useCreation, useMemoizedFn } from 'ahooks';
import { useModel } from 'umi';
import { Button, message, Switch } from 'antd';
import Weather from './components/Weather'
import VisualParameters from './components/VisualParameters'
import PoiSelector from './components/PoiSelector'
import CeLiang from './components/CeLiang'
import Effect from './components/Effect'
import PictureViewer from './components/PictureViewer'
import MorePicture from './components/MorePicture'
import Tileset3D from './components/Tileset3D'
import ContextMenu from './components/ContextMenu'

import { useRef } from 'react';
import classNames from 'classnames';

let carData: { smoothMove: (arg0: any, arg1: number) => void; }[]
let humanData: { smoothMove: (arg0: any, arg1: number) => void; }[]
let humanPoiData: { smoothMove: (arg0: any, arg1: number) => void; }[]
let BIMtileset: any

export default () => {
  const { objmState, objmAction } = useModel('useEarthsdk3');
  const ContextMenuRef = useRef()

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
      {
        title: '测量',
      },
    ],
    switchBtn_2: [
      {
        title: 'Poi标绘',
      },
      {
        title: '特效',
      },
      {
        title: '缩略图定位',
      },
      {
        title: '多视图定位',
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
          if (BIMtileset) {
            // 高亮Feature
            BIMtileset?.resetFeatureStyle() //恢复feature，还原setFeatureVisable和setFeatureColor和setFeatureStyle的更改
            //根据属性名和条件值设置feature颜色；
            BIMtileset?.setFeatureColor('id', [
              {
                value: id,
                rgba: [1, 0, 0, 1],
              },
            ])
          }


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
    objm.switchToUEViewer(earth, 'http://localhost:8000/', 'demoUE5.3', true, undefined, true)
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
  const switchChange = useMemoizedFn(async (action: 'changeImageLayerShow', record?: Record<string, any>) => {
    let activedSwitch = state.activedSwitch
    const findOne = activedSwitch.find(v => v === record?.title)
    if (findOne) {
      activedSwitch = activedSwitch.filter(v => v !== record?.title)
    } else {
      activedSwitch.push(record?.title)
    }
    setState({
      activedSwitch,
    })
    switch (action) {
      case 'changeImageLayerShow':
        // @ts-ignore
        objmAction('changeImageLayerShow', findOne ? false : true)
        break
      // no default
    }
    return false
  })

  // 状态提升触发handlePoiCreated  poi绑定控制台调试   //可直接在PoiSelector对应方法中绑定
  // @ts-ignore
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
        // @ts-ignore
        window.ESimagepoi = instance
        break
      case '3d':
        // @ts-ignore
        window.ESpoi3d = instance
        break
      case '2d':
        // @ts-ignore
        window.ESpoi2d = instance
        break
      case 'human':
        // @ts-ignore
        window.EShuman = instance
        break
      case 'humanPoi':
        // @ts-ignore
        window.EShumanPoi = instance
        break
      case 'car':
        // @ts-ignore
        window.EScar = instance
        break
      default:
        console.warn(`未知的POI类型: ${type}`)
        break
    }
  }

  const handleBIMtilesetReady = (tileset: any) => {
    BIMtileset = tileset
    // console.log('接受Tileset3D 的 BIMtileset', tileset)
  }

  const showContextMenu = (e: { preventDefault: () => void; }) => {
    // 阻止默认的浏览器右键菜单
    e.preventDefault()
    console.log(ContextMenuRef, 'ContextMenuRef')
    // 调用右键菜单组件的显示方法
    if (ContextMenuRef) {
      // @ts-ignore
      ContextMenuRef?.current?.show(e)
    }
  }

  const handleContextMenuCommand = ({ command, event }: any) => {
    console.log('执行命令:', command)
    const objm = objmState.objm
    let findOne = null
    // 根据不同命令执行相应操作
    switch (command) {
      case 'checkLocation':
        // 获取当前鼠标位置的地理坐标
        if (objm.activeViewer) {
          // 使用右键点击的屏幕位置
          const screenPosition = { x: event.clientX, y: event.clientY }

          // 调用地球SDK的拾取位置方法
          objm.activeViewer.pickPosition(screenPosition).then((position: string | any[]) => {
            if (position && position.length) {
              // 格式化坐标显示
              const formattedPosition = `
                经度: ${position[0].toFixed(6)}°
                纬度: ${position[1].toFixed(6)}°
                高度: ${position[2].toFixed(2)}米
              `
              console.log('当前位置坐标:', position)

              // 使用Element Plus的消息提示显示坐标
              message.success(formattedPosition)
            }
          })
        }
        break

      case 'checkView':
        // 获取当前视角信息
        if (objm.activeViewer) {
          const camera = objm.activeViewer.getCurrentCameraInfo()
          if (!camera?.position?.length) return false
          // 格式化视角信息
          const viewInfo = `
            经度: ${camera?.position[0].toFixed(6)}°
                纬度: ${camera?.position[1].toFixed(6)}°
                高度: ${camera?.position[2].toFixed(2)}米
          `
          console.log('当前视角信息:', camera.position, camera.heading, camera.pitch, camera.roll)
          // 显示视角信息
          message.info(viewInfo)

        }
        break

      case 'measure1':
        // 启动距离量算功能
        console.log('启动距离量算')
        findOne = state.activedSwitch.find(v => v === '测量')
        if (!findOne) {
          setState({
            activedSwitch: [...state.activedSwitch, '测量']
          })
        }
        // 这里可以调用量算组件的相关方法
        message.success('已启动距离量算功能，请在地图上点击起点')
        break

      case 'measure2':
        // 启动面积量算功能
        console.log('启动面积量算')
        findOne = state.activedSwitch.find(v => v === 'Poi标绘')
        if (!findOne) {
          setState({
            activedSwitch: [...state.activedSwitch, 'Poi标绘']
          })
        }
        // 这里可以调用量算组件的相关方法
        message.success('已启动面积量算功能，请在地图上绘制多边形')
        break

      case 'effect1':
        // 雨天特效
        findOne = state.activedSwitch.find(v => v === '天气')
        if (!findOne) {
          setState({
            activedSwitch: [...state.activedSwitch, '天气']
          })
        }
        // 调用天气组件的雨天方法
        message.success('已开启雨天特效')
        break

      case 'effect2':
        // 雪天特效
        findOne = state.activedSwitch.find(v => v === '天气')
        if (!findOne) {
          setState({
            activedSwitch: [...state.activedSwitch, '天气']
          })
        }
        // 调用天气组件的雪天方法
        message.success('已开启雪天特效')
        break

      case 'mark1':
        // 点标记功能
        console.log('启动点标记')
        // 实现点标记逻辑
        message.info('请在地图上点击添加标记点')
        break

      case 'view1':
        // 切换到预设视角1
        if (objm.activeViewer) {
          // 这里可以设置预定义的视角参数
          objm.activeViewer.camera.flyTo({
            destination: [116.3, 39.9, 10000], // 示例坐标
            orientation: {
              heading: 0,
              pitch: -90,
              roll: 0,
            },
            duration: 2, // 飞行时间(秒)
          })
        }
        break

      // 其他命令的处理...
      default:
        console.log('未处理的命令:', command)
        message.info(`执行命令: ${command}`)
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
          className={classNames(styles.Earthsdk3Box, 'earth')}
          onContextMenu={showContextMenu}
        />

        <div className={styles.TopTool}>

          <div className={styles.changeViewer}>
            <Button className={styles.btn} onClick={switchToCesiumViewer}>切换Cesium视口</Button>
            <Button className={styles.btn} onClick={switchToUEViewer}>切换UE视口</Button>
            <Button className={styles.btn} onClick={getLocationInfo}>定位锚点</Button>
            <Button className={styles.btn} onClick={myFly}>飞向锚点</Button>

          </div>
          <div className={styles.switchBtnViewer}>
            {
              state.switchBtn_1.map(v => (
                <div className={styles.switchBtn}>
                  <span className={styles.title}>{v.title}</span>
                  <Switch checked={state.activedSwitch.find(vv => vv === v.title) ? true : false} onChange={() => {
                    switchChange(v?.Fn as any, v)
                  }} />
                </div>
              ))
            }
            {
              state.switchBtn_2.map((v: any) => (
                <div className={styles.switchBtn}>
                  <span className={styles.title}>{v.title}</span>
                  <Switch checked={state.activedSwitch.find(vv => vv === v.title) ? true : false} onChange={() => {
                    switchChange(v?.Fn as any, v)
                  }} />
                </div>
              ))
            }
          </div>


        </div>
        {
          state.activedSwitch.find(v => v === '3D模型') &&
          <div className={styles.Tileset3D}>
            <Tileset3D handleBIMtilesetReady={handleBIMtilesetReady} />
          </div>
        }
        {
          state.activedSwitch.find(v => v === '测量') &&
          <div className={styles.CeLiang}>
            <CeLiang />
          </div>
        }
        {
          state.activedSwitch.find(v => v === 'Poi标绘') &&
          <div className={styles.PoiSelector}>
            {/* @ts-ignore */}
            <PoiSelector handlePoiCreated={handlePoiCreated} />
          </div>
        }
        {
          state.activedSwitch.find(v => v === '特效') &&
          <div className={styles.Effect}>
            <Effect />
          </div>
        }
        {
          state.activedSwitch.find(v => v === '缩略图定位') &&
          <div className={styles.PictureViewer}>
            <PictureViewer />
          </div>
        }
        {
          state.activedSwitch.find(v => v === '多视图定位') &&
          <div className={styles.MorePicture}>
            <MorePicture />
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
        <ContextMenu ref={ContextMenuRef} command={handleContextMenuCommand} />
      </div>
    </>

  );
};
