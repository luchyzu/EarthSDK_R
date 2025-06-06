import styles from './Tileset3D.less';
import { useSetState, useMount } from 'ahooks';
import { useModel } from 'umi';
import { ES3DTileset } from 'earthsdk3'
import { Button } from 'antd';


interface PropsType {
    handleBIMtilesetReady: Function;
}
export default (props: PropsType) => {
    const { objmState } = useModel('useEarthsdk3');
    const [state,] = useSetState({
        tileset3Ddata: [
            {
                id: 'title1',
                name: '倾斜摄影',
                url: 'http://www.pipeser.com/cesiumlab/G7qC5vBk/tileset.json',
            },
            {
                id: 'title2',
                name: '白模数据',
                url: 'http://www.pipeser.com/cesiumlab/7hfKb4S4/tileset.json',
                materialMode: 'technology',
            },
            {
                id: 'title3',
                name: '点云数据',
                url: 'http://www.pipeser.com/cesiumlab/KJSkNM0X/tileset.json',
                style: true,
            },
            // {
            //   id: 'title4',
            //   name: 'BIM建模',
            //   url: 'http://www.pipeser.com/cesiumlab/jgYgbe3y/tileset.json',
            //   bimStyle: true,
            // },
            {
                id: 'title5',
                name: '人工建模',
                url: 'http://www.pipeser.com/cesiumlab/L3NoFf4V/tileset.json',
            },
            {
                id: 'title6',
                name: '地下管线',
                url: 'http://www.pipeser.com/3dtiles/phipxrow1/tileset.json',
                style: true,
            },
        ]
    });


    useMount(() => {
        const objm = objmState.objm
        const { tileset3Ddata } = state
        tileset3Ddata.forEach((item) => {
            const tileset = objm.createSceneObject(ES3DTileset, item.id)
            if (tileset) {
                tileset.url = item.url
                if (item.materialMode) {
                    tileset.materialMode = item.materialMode //科技感
                }
                if (item.style) {
                    tileset.czmStyleJson = { color: 'vec4(1,0,0,1)' } //设置样式
                }
            }
        })

        const BIMtileset = objm.createSceneObject(ES3DTileset, 'title4')
        BIMtileset.url = 'http://www.pipeser.com/cesiumlab/jgYgbe3y/tileset.json'
        if (BIMtileset) {
            //// 屋顶着色
            BIMtileset.setFeatureColor('id', [
                {
                    value: '6949fe393e9a4d4db7fe71339c61513800022318',
                    rgba: [1, 0, 0, 1],
                },
            ])
            // 提供给其他组件使用
            //屋顶隐藏
            // tileset.setFeatureVisable('id', [
            //   {
            //     value: '6949fe393e9a4d4db7fe71339c61513800022318',
            //     visable: false,
            //   },
            // ])
        }
        if (BIMtileset) {
            // ... 设置属性
            props.handleBIMtilesetReady(BIMtileset)
        }

    })

    //根据3DTileset  id 飞行定位
    const flyIn3DTileset = (id: string) => {
        const objm = objmState.objm
        const tileset = objm.getSceneObjectById(id)
        if (tileset) {
            tileset.flyTo()
        }
    }

    return (
        <>
            <div className={styles.Tileset3D}>
                {
                    state.tileset3Ddata.map(item => (
                        <Button className={styles.btn} key={item.id} type="primary" onClick={() => flyIn3DTileset(item.id)}>{item.name}</Button>
                    ))
                }
                <Button className={styles.btn} type="primary" onClick={() => flyIn3DTileset('title4')}>BIM建模</Button>
            </div>
        </>

    );
};
