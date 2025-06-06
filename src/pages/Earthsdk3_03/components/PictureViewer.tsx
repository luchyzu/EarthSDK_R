import styles from './PictureViewer.less';
import { useSetState } from 'ahooks';
import { useModel } from 'umi';
import { ESCameraView } from 'earthsdk3'
import { Button, Image } from 'antd';
import { PictureViewerimageUrl } from '@/utils/utils';

export default () => {
    const { objmState } = useModel('useEarthsdk3');
    const sceneObject = objmState.objm.createSceneObject(ESCameraView)
    sceneObject.position = [117.81737566151948, 34.57576364830162, 1148.38952607802]
    sceneObject.rotation = [275.18149884348827, -30.58065712810649, 359.9993753392597]
    sceneObject.duration = 3

    const [state, setState] = useSetState({
        imageUrl: PictureViewerimageUrl,
    });

    //thumbnail缩略图   监听thumbnail
    sceneObject.thumbnailChanged.don((newValue: any) => {
        setState({
            imageUrl: newValue
        })
    })

    //更新缩略图
    const updateThumbnail = (width: number, height: number) => {
        sceneObject.capture(width, height) //获取缩略图并直接设置到thumbnail属性上
    }
    // 设置为当前视角
    const updateView = () => {
        console.log('当前视角更新成功')
        //sceneObject.resetWithCurrentCamera()//设置为当前视角   //本质修改的是该对象的position和rotation
        sceneObject.resetWithCurrentCamera()
    }

    // 飞行定位
    const updateFlyTo = () => {
        sceneObject.flyTo()
    }

    return (
        <>
            <div className={styles.PictureViewer}>
                <Image className={styles.img} src={state.imageUrl} />
                <div className={styles.btnBox}>
                    <Button className={styles.btn} type="primary" onClick={() => updateThumbnail(220, 180)}>更新缩略图</Button>
                    <Button className={styles.btn} type="primary" onClick={updateView}>更新锚点</Button>
                    <Button className={styles.btn} type="primary" onClick={updateFlyTo}>飞行到锚点</Button>
                </div>
            </div>
        </>

    );
};
