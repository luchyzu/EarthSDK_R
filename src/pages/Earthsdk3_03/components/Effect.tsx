import { Button, message, Select } from "antd";
import styles from './Effect.less';
import { useSetState, } from 'ahooks';
import { useModel } from 'umi';
import {
    ESAlarm,
} from 'earthsdk3'

export default () => {
    const { objmState } = useModel('useEarthsdk3');
    const [state, setState] = useSetState({
        ESAlarmData: [
            { value: '1', label: '柱状警告', mode: 'cylinder', radius: 20 },
            { value: '2', label: '圆形警告', mode: 'circle', radius: 50 },
        ],
        selectedESAlarm: undefined,
        alarmList: [] as any[],
    });

    const createESAlarm = (value: string) => {
        const objm = objmState.objm
        let { alarmList } = state
        // 根据选中的ID找到对应的警报配置
        const selectedAlarm = state.ESAlarmData.find((item) => item.value === value)
        if (!selectedAlarm) return
        const sceneObjectESAlarm = objm.createSceneObject(ESAlarm) //objm.createSceneObject('ESAlarm')  根据类名 'ES' 无需引入
        if (!sceneObjectESAlarm) return
        sceneObjectESAlarm.mode = selectedAlarm.mode //报警样式
        sceneObjectESAlarm.radius = selectedAlarm.radius //报警半径大小
        sceneObjectESAlarm.allowPicking = true
        sceneObjectESAlarm.editing = true //打开编辑
        sceneObjectESAlarm.pickedEvent.don((e: { attachedInfo: any; }) => {
            switch (e.attachedInfo) {
                case 'clickPick':
                    console.log('单击拾取了报警对象')
                    break
                case 'hoverPick':
                    console.log('悬浮拾取了报警对象')
                    break
                default:
                    break
            }
        })

        // 将新创建的警报添加到列表中
        alarmList.push(sceneObjectESAlarm)
        // 绑定到window对象方便调试 
        // @ts-ignore
        window.ESAlarm = sceneObjectESAlarm
        // 创建后清空选择
        setState({
            selectedESAlarm: undefined
        })
    }

    // 销毁最近创建的警报
    const destroyLastAlarm = () => {
        const objm = objmState.objm
        const { alarmList } = state
        if (alarmList.length > 0) {
            // 获取数组最后一项（最近创建的警报）
            const lastAlarm = alarmList.pop() //1.删除数组中的最后一个元素 2.返回被删除的元素
            // 销毁该警报对象
            objm.destroySceneObject(lastAlarm)
            message.success('已删除最近创建的一项警报')
        }
        setState({
            alarmList
        })
    }
    // 销毁所有警报
    const destroyAllAlarms = () => {
        const objm = objmState.objm
        const { alarmList } = state
        if (alarmList.length > 0) {
            // 遍历销毁所有警报对象
            alarmList.forEach((alarm) => {
                objm.destroySceneObject(alarm)
            })
            // 清空列表
            setState({
                alarmList: []
            })
            message.success('已删除所有警报')
        }
    }


    return (
        <>
            <div className={styles.Effect}>
                <Select
                    placeholder={'请选择警报样式'}
                    onChange={(e: string) => {
                        createESAlarm(e)
                    }}
                    style={{ width: '100%', marginBottom: 8 }}
                    value={state.selectedESAlarm}
                    options={state.ESAlarmData}
                />
                <div className={styles.btnBox}>
                    <Button className={styles.btn} danger type="primary" disabled={state.alarmList.length === 0} onClick={destroyLastAlarm}>销毁最近警报</Button>
                    <Button className={styles.btn} danger type="primary" disabled={state.alarmList.length === 0} onClick={destroyAllAlarms}>销毁所有警报</Button>
                </div>
            </div>
        </>

    );
};
