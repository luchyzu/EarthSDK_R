import { Slider } from "antd";
import styles from './Weather.less';
import { useSetState, useUnmount } from 'ahooks';
import type { SliderSingleProps } from 'antd';
import { useModel } from 'umi';

export default () => {
    const { objmState } = useModel('useEarthsdk3');
    const [state, setState] = useSetState({
        WeatherList: [
            {
                title: '透明度',
                enName: 'czmAlpha'
            },
            {
                title: '对比度',
                enName: 'czmContrast'
            },
            {
                title: '亮度',
                enName: 'czmBrightness'
            },
            {
                title: '色相',
                enName: 'czmHue'
            },
            {
                title: '饱和度',
                enName: 'czmSaturation'
            },
            {
                title: 'gamma',
                enName: 'czmGamma'
            },
        ],
        WeatherVlaue: {
            '透明度': 1,
            '对比度': 1,
            '亮度': 1,
            '色相': 0,
            '饱和度': 1,
            'gamma': 1,
        } as any
    });

    const changeNum = (value: number, item: { title: any; enName: any; }) => {
        const imageryLayer = objmState.imageryLayer
        const WeatherVlaue = state.WeatherVlaue
        WeatherVlaue[item.title] = value
        imageryLayer[item.enName] = value
        setState({
            WeatherVlaue
        })
    }

    useUnmount(() => {
        const imageryLayer = objmState.imageryLayer
        state.WeatherList.forEach(v => {
            if (v.enName === 'czmHue') {
                imageryLayer[v.enName] = 0
            } else {
                imageryLayer[v.enName] = 1
            }
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
            </div>
        </>

    );
};
