import { Slider, Switch } from "antd";
import styles from './Weather.less';
import { useSetState, useUnmount } from 'ahooks';
import type { SliderSingleProps } from 'antd';
import { useModel } from 'umi';

export default () => {
    const { objmState } = useModel('useEarthsdk3');
    const [state, setState] = useSetState({
        startTime: 1747584000000,
        endTime: 1747670400000,
        WeatherList: [
            {
                title: '时间线',
                enName: 'currentTime'
            },
            {
                title: '云',
                enName: 'cloud'
            },
            {
                title: '雨',
                enName: 'rain'
            },
            {
                title: '雪',
                enName: 'snow'
            },

        ],
        WeatherList_2: [
            {
                title: '大气层',
                value: false,
                enName: 'atmosphere'
            },
        ],
        WeatherVlaue: {
            '时间线': 0,
            '云': 0,
            '雨': 0,
            '雪': 0,
            '大气层': false,
        }
    });

    const changeNum = (value, item) => {
        const objm = objmState.objm

        const WeatherVlaue = state.WeatherVlaue
        WeatherVlaue[item.title] = value
        if (item.enName === 'currentTime') {
            objm.activeViewer.currentTime = value * (state.endTime - state.startTime) + state.startTime
        } else {
            objm.activeViewer[item.enName] = value
        }
        setState({
            WeatherVlaue
        })
    }

    useUnmount(() => {
        const objm = objmState.objm
        state.WeatherList.forEach(v => {
            objm.activeViewer[v.enName] = 0
        })
        state.WeatherList_2.forEach(v => {
            objm.activeViewer[v.enName] = false
        })
    })

    const formatter: NonNullable<SliderSingleProps['tooltip']>['formatter'] = (value) => `${value}%`;

    return (
        <>
            <div className={styles.WeatherBox}>
                {
                    state.WeatherList.map(v => (
                        <div className={styles.Box}>
                            <span className={styles.title}>{v.title}</span>
                            <Slider value={state.WeatherVlaue[v.title]} max={1} min={0} step={0.01} tooltip={{ formatter }} onChange={(e) => changeNum(e, v)} />
                        </div>
                    ))
                }
                {
                    state.WeatherList_2.map(v => (
                        <div className={styles.Box}>
                            <span className={styles.title}>{v.title}</span>
                            <Switch checked={state.WeatherVlaue[v.title]} onChange={(e) => changeNum(e, v)} />
                        </div>
                    ))
                }
            </div>
        </>

    );
};
