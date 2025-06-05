import styles from './PoiSelector.less';
import { useSetState, useUnmount, useMemoizedFn } from 'ahooks';
import { useModel } from 'umi';
import FormSelect from '@/components/forms/FormSelect'
import { ESImageLabel, ESPoi3D, ESPoi2D, ESHuman, ESHumanPoi, ESCar } from 'earthsdk3'
import { Button, Row, Col } from 'antd';
import { imagePoiOptions, poi3DOptions, poi2DOptions, humanOptions, humanPoiOptions, } from '@/utils/utils';


interface PropsType {
    handlePoiCreated: Function;
}
export default (props: PropsType) => {
    const { objmState } = useModel('useEarthsdk3');
    const [state, setState] = useSetState({
        carData: [],
        humanData: [],
        humanPoiData: [],
        PoiSelectorValueMap: {
            '选择图片POI样式': undefined,
            '选择3DPOI样式': undefined,
            '选择2DPOI样式': undefined,
            '选择人员创建': undefined,
            '选择人员Poi创建': undefined,
        },
        PoiSelectorList: [
            {
                title: '选择图片POI样式',
                options: imagePoiOptions.map(v => ({ ...v, label: v.name, value: v.id })),
                enName: 'createImagePoi',
            },
            {
                title: '选择3DPOI样式',
                options: poi3DOptions.map(v => ({ ...v, label: v.name, value: v.id })),
                enName: 'create3DPoi',
            },
            {
                title: '选择2DPOI样式',
                options: poi2DOptions.map(v => ({ ...v, label: v.name, value: v.id })),
                enName: 'create2DPoi',
            },
            {
                title: '选择人员创建',
                options: humanOptions.map(v => ({ ...v, label: v.name, value: v.id })),
                enName: 'createESHuman',
            },
            {
                title: '选择人员Poi创建',
                options: humanPoiOptions.map(v => ({ ...v, label: v.name, value: v.id })),
                enName: 'createESHumanPoi',
            },
        ]
    });

    const changeSelect = (item, value) => {
        const findItem = item.options.find(v => v.value === value)

        handleAction(item.enName, { ...findItem, title: item.title })

    }

    const handleAction = useMemoizedFn(async (action: 'createImagePoi' | 'create3DPoi' | 'create2DPoi' | 'createESHuman' | 'createESHumanPoi', record?: Record<string, any>) => {
        const objm = objmState.objm
        const PoiSelectorValueMap = state.PoiSelectorValueMap
        switch (action) {
            case 'createImagePoi':
                const url = record?.url
                const createImagePoi = objm.createSceneObject(ESImageLabel)
                if (!createImagePoi) return
                createImagePoi.url = url
                createImagePoi.editing = true
                // 监听widgetEvent事件   图片对象被拾取事件
                createImagePoi.allowPicking = true //允许被拾取
                createImagePoi.widgetEvent.don((e) => {
                    console.log('widgetEvent信息', e, '拾取的可视化对象', createImagePoi.name)
                    switch (e.type) {
                        // case 'mouseEnter':
                        //   alert('鼠标进入!')
                        //   break
                        // case 'mouseLeave':
                        //   alert('鼠标移出!')
                        //   break
                        case 'leftClick':
                            console.log(createImagePoi.name, '被鼠标左键点击')
                            break
                        case 'rightClick':
                            console.log(createImagePoi.name, '被鼠标右键点击')
                            break
                        default:
                            break
                    }
                })
                props.handlePoiCreated({ type: 'image', instance: createImagePoi })

                break;
            case 'create3DPoi':
                const create3DPoi = objm.createSceneObject(ESPoi3D)
                if (!create3DPoi) return
                create3DPoi.mode = record?.mode
                create3DPoi.editing = true
                props.handlePoiCreated({ type: '3d', instance: create3DPoi })

                break;
            case 'create2DPoi':
                const create2DPoi = objm.createSceneObject(ESPoi2D)
                if (!create2DPoi) return
                create2DPoi.mode = record?.mode
                create2DPoi.editing = true

                props.handlePoiCreated({ type: '2d', instance: create2DPoi })

                break;
            case 'createESHuman':
                const humanData = state.humanData
                const selectedHumen = humanOptions.find((item) => item.id === record?.value)
                if (!selectedHumen) return
                const human = objm.createSceneObject(ESHuman)
                if (!human) return
                human.mode = selectedHumen.mode
                human.animation = selectedHumen.animation
                human.scale = [20, 20, 20]
                human.editing = true
                humanData.push(human)
                setState({
                    humanData,
                })
                props.handlePoiCreated({ type: 'human', instance: human, humanArr: humanData })

                break;
            case 'createESHumanPoi':
                const humanPoiData = state.humanPoiData
                const selectedHumenPoi = humanPoiOptions.find((item) => item.id === record?.value)
                if (!selectedHumenPoi) return
                const humanPoi = objm.createSceneObject(ESHumanPoi)
                if (!humanPoi) return
                humanPoi.mode = selectedHumenPoi.mode
                humanPoi.animation = selectedHumenPoi.animation
                humanPoi.poiMode = selectedHumenPoi.poiMode
                humanPoi.editing = true
                humanPoiData.push(humanPoi)
                setState({
                    humanPoiData,
                })
                props.handlePoiCreated({ type: 'humanPoi', instance: humanPoi, humanPoiArr: humanPoiData })

                break;
            // no default
        }
    },
    );


    useUnmount(() => {

    })


    const createESCar = () => {
        const objm = objmState.objm
        const carData = state.carData
        const car = objm.createSceneObject(ESCar)
        if (!car) return
        car.mode = 'policeCar' //警车模型 (仅有)
        car.scale = [20, 20, 20] //缩放
        car.editing = true
        carData.push(car)
        setState({
            carData
        })
        props.handlePoiCreated({ type: 'car', instance: car, carArr: carData })
    }

    return (
        <>
            <div className={styles.PoiSelector}>
                <Row gutter={8}>
                    {
                        state.PoiSelectorList.map(item => (
                            <Col span={12}>
                                <div className={styles.Box}>
                                    <FormSelect
                                        options={item.options}
                                        key={item.title}
                                        value={undefined}
                                        style={{ width: 150 }}
                                        fieldProps={{
                                            placeholder: item.title,
                                            Search: false,
                                            onChange: (e: string) => {
                                                changeSelect(item, e)
                                            }
                                        }}
                                    />
                                </div>
                            </Col>
                        ))
                    }
                    <Col span={12}>
                        <Button className={styles.btn} type="primary" onClick={createESCar}>创建车辆</Button>
                    </Col>
                </Row>
            </div>
        </>

    );
};
