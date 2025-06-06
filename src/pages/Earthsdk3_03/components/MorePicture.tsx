import styles from './MorePicture.less';
import { useMount, useSetState } from 'ahooks';
import { useModel } from 'umi';
import { ESCameraViewCollection } from 'earthsdk3'
import { Button, Image, Input } from 'antd';
import classNames from 'classnames';

export default () => {
    const { objmState } = useModel('useEarthsdk3');

    const [state, setState] = useSetState({
        views: [] as any[],
        viewCollection: null as any,
        currentViewIndex: -1,
    });


    // 添加视角
    const addView = () => {
        let { viewCollection, views } = state
        // 异步
        viewCollection.addView() //保存当前视角信息至views
        setTimeout(() => {
            // 手动触发响应式更新
            views = [...viewCollection.views]
            console.log('添加视角', viewCollection.views)
            setState({
                views
            })
        }, 200);
    }
    // 重命名视角
    const resetViewName = (index: number, value: any) => {
        let { viewCollection } = state
        viewCollection.resetViewName(index, value) //resetViewName  更改index位置的视角信息的name
        setState({
            viewCollection
        })
    }

    // 飞向视角
    const flyToView = (index: number) => {
        let { viewCollection } = state
        viewCollection.flyToView(index) //飞入指定index的视角；
        viewCollection.setCurrentView(index) //把views的index位置的视角设置为当前轮播高亮视角
        setState({
            viewCollection
        })
    }

    // 清空全部视角
    const clearAllViews = () => {
        let { viewCollection, views } = state

        viewCollection.clearAllViews() //清空视角
        views = [...viewCollection.views]
        setState({
            viewCollection,
            views,
        })
    }

    // 删除指定视角；
    const deleteView = (index: number) => {
        let { viewCollection, views } = state
        console.log('删除index', index)
        viewCollection.deleteView(index)
        views = [...viewCollection.views]
        setState({
            viewCollection,
            views,
        })
    }

    useMount(() => {
        let { viewCollection, currentViewIndex } = state
        const objm = objmState.objm
        // 初始化视角集合

        viewCollection = objm.createSceneObject(ESCameraViewCollection)
        // 监听当前索引值  currentViewIndex属性变化便会触发
        //点击对应的视角  currentViewIndex属性值会改变
        viewCollection?.currentViewIndexChanged.don((val: number) => {
            console.log(val, 11111111111)
            currentViewIndex = val //用于绑定选中样式
            setState({
                currentViewIndex
            })
        })
        setState({
            viewCollection
        })
    })


    return (
        <>
            <div className={styles.MorePicture}>
                <Button className={styles.btn} type="primary" onClick={addView}>添加视角</Button>
                <Button className={styles.btn} type="primary" onClick={clearAllViews}>清空视角</Button>

                <div className={styles.imgBox}>
                    {
                        state.views.map((item, index) => (
                            <div className={styles.viewItem}>
                                <Image preview={false} onClick={() => flyToView(index)} className={classNames(styles.img, state.currentViewIndex === index ? styles.focus : '')} src={item.thumbnail} />
                                <div className={styles.nameBox}>
                                    <Input onBlur={() => resetViewName(index, item.name)} placeholder={'视角' + index} />
                                    <span className={styles.close} onClick={() => deleteView(index)}>❌</span>
                                </div>
                            </div>
                        ))
                    }

                </div>
            </div>
        </>

    );
};
