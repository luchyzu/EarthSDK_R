import { Button, Col, Row } from "antd";
import styles from './CeLiang.less';
import { useSetState, useUnmount, useMemoizedFn } from 'ahooks';
import { useModel } from 'umi';
import {
    ESLocationMeasurement,
    ESDistanceMeasurement,
    ESHeightMeasurement,
    ESSurfaceAreaMeasurement,
    ESAreaMeasurement,
    ESDirectionMeasurement,
} from 'earthsdk3'

export default () => {
    const { objmState } = useModel('useEarthsdk3');
    const [state, setState] = useSetState({
        celiangData: [] as any[],
        celiangSurfaceArea: null as any,
        CeLiangList: [
            {
                title: '点位测量',
                enName: 'createPoint',
                createSceneObject: ESLocationMeasurement,
            },
            {
                title: '距离测量',
                enName: 'createDistance',
                createSceneObject: ESDistanceMeasurement,
            },
            {
                title: '高度测量',
                enName: 'createHeight',
                createSceneObject: ESHeightMeasurement,
            },
            {
                title: '面积测量',
                enName: 'createArea',
                createSceneObject: ESAreaMeasurement,
            },
            {
                title: '表面积测量',
                enName: 'createSurfaceArea',
                createSceneObject: ESSurfaceAreaMeasurement,
            },
            {
                title: '表面积分析',
                enName: 'startAnalysis',
            },
            {
                title: '方位角测量',
                enName: 'createDirection',
                createSceneObject: ESDirectionMeasurement,
            },
        ],
    });

    const handleAction = useMemoizedFn(async (action: 'createSurfaceArea' | 'startAnalysis' | 'other', record?: Record<string, any>) => {
        const objm = objmState.objm
        let { celiangData, celiangSurfaceArea } = state
        const ESMap = {
            'createPoint': ESLocationMeasurement,
            'createDistance': ESDistanceMeasurement,
            'createHeight': ESHeightMeasurement,
            'createArea': ESAreaMeasurement,
            'createSurfaceArea': ESSurfaceAreaMeasurement,
            'createDirection': ESDirectionMeasurement,
        } as any
        switch (action) {
            case 'createSurfaceArea':
                celiangSurfaceArea = objm.createSceneObject(ESSurfaceAreaMeasurement) //表面积
                if (!celiangSurfaceArea) return
                celiangData.push(celiangSurfaceArea)
                celiangSurfaceArea.editing = true
                break;
            case 'startAnalysis':
                celiangSurfaceArea?.start()
                break;
            default: {
                const celiangPoint = objm.createSceneObject(ESMap[record?.enName]) as any
                if (!celiangPoint) return
                celiangData.push(celiangPoint)
                celiangPoint.editing = true
            }
                break;
        }
        setState({
            celiangData,
        })
    },
    );

    //撤回最近一次测量
    const clearLately = () => {
        let { celiangData } = state
        const objm = objmState.objm
        if (celiangData.length > 0) {
            // 获取数组最后一项（最近创建的警报）
            const lately = celiangData.pop() //1.删除数组中的最后一个元素 2.返回被删除的元素
            // 销毁该警报对象
            objm.destroySceneObject(lately)
            // ElMessage({
            //   message: '已删除最近创建的测量',
            //   type: 'success',
            //   showClose: true, //信息关闭按钮
            //   grouping: true, //相同信息合并
            //   duration: 1000, //显示时间
            // })
        }
    }
    //清除全部测量
    const clearAll = () => {
        let { celiangData } = state
        const objm = objmState.objm
        celiangData.forEach((item) => {
            if (item) objm.destroySceneObject(item)
        })
        celiangData = []
        setState({
            celiangData
        })
    }


    useUnmount(() => {
        clearAll()
    })


    return (
        <>
            <div className={styles.CeLiang}>
                <Row gutter={8}>
                    {
                        state.CeLiangList.map((item: any) => (
                            <Col span={12}>
                                <Button className={styles.btn} type="primary" onClick={() => handleAction('other', item)}>{item.title}</Button>
                            </Col>
                        ))
                    }
                    <Col span={12}>
                        <Button className={styles.btn} disabled={!(state.celiangData.length > 0)} type="primary" onClick={() => clearLately()}>撤回测量</Button>
                    </Col>
                    <Col span={12}>
                        <Button className={styles.btn} disabled={!(state.celiangData.length > 0)} type="primary" onClick={() => clearAll()}>清除全部</Button>
                    </Col>
                </Row>
            </div>
        </>

    );
};
