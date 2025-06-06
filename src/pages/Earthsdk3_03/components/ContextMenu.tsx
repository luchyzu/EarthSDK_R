import styles from './ContextMenu.less';
import { useSetState, useMount, useUnmount } from 'ahooks';
import { forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';

interface PropsType {
    command: Function;
}

let visible = false
export default forwardRef((props: PropsType, ref) => {
    useImperativeHandle(ref, () => {
        return {
            show: (e: any) => {
                show(e)
            },
        }
    });

    // const { objmState } = useModel('useEarthsdk3');
    const [state, setState] = useSetState({
        top: 0,
        left: 0,
        visible: false,
        lastEvent: null,
        BTNList: [
            {
                title: '查看此处坐标',
                icon: '',
                hasChil: false,
                Fn: 'checkLocation'
            },
            {
                title: '查看当前视角',
                icon: '',
                hasChil: false,
                Fn: 'checkView'
            },
            {
                title: '常用工具',
                icon: '',
                list: [
                    {
                        title: '工具1',
                        icon: '',
                        Fn: 'tool1'
                    },
                    {
                        title: '工具2',
                        icon: '',
                        Fn: 'tool2'
                    }
                ],
                hasChil: true,
            },
            {
                title: '图上量算',
                icon: '',
                list: [
                    {
                        title: '距离量算',
                        icon: '',
                        Fn: 'measure1'
                    },
                    {
                        title: '面积量算',
                        icon: '',
                        Fn: 'measure2'
                    }
                ],
                hasChil: true,
            },
            {
                title: '图上标记',
                icon: '',
                list: [
                    {
                        title: '点标记',
                        icon: '',
                        Fn: 'mark1'
                    },
                    {
                        title: '线标记',
                        icon: '',
                        Fn: 'mark2'
                    },
                    {
                        title: '面标记',
                        icon: '',
                        Fn: 'mark3'
                    }
                ],
                hasChil: true,
            },
            {
                title: '特效效果',
                icon: '',
                list: [
                    {
                        title: '雨天',
                        icon: '',
                        Fn: 'effect1'
                    },
                    {
                        title: '雪天',
                        icon: '',
                        Fn: 'effect2'
                    },
                    {
                        title: '雾天',
                        icon: '',
                        Fn: 'effect3'
                    }
                ],
                hasChil: true,
            },
            {
                title: '地形服务',
                icon: '',
                list: [
                    {
                        title: '地形1',
                        icon: '',
                        Fn: 'terrain1'
                    },
                    {
                        title: '地形2',
                        icon: '',
                        Fn: 'terrain2'
                    }
                ],
                hasChil: true,
            },
            {
                title: '场景设置',
                icon: '',
                list: [
                    {
                        title: '设置1',
                        icon: '',
                        Fn: 'setting1'
                    },
                    {
                        title: '设置2',
                        icon: '',
                        Fn: 'setting2'
                    }
                ],
                hasChil: true,
            },
        ] as any[]
    });

    const show = (e: any) => {
        let { top, left, lastEvent } = state
        // 阻止默认的浏览器右键菜单
        e.preventDefault()

        // 显示自定义菜单
        visible = true

        // 设置菜单位置为鼠标点击位置
        top = e.clientY
        left = e.clientX

        // 保存事件对象，用于后续处理
        lastEvent = e

        // 防止菜单超出视窗边界的处理
        // 使用 setTimeout 确保在 DOM 更新后再获取菜单尺寸
        setTimeout(() => {
            const menu = document.querySelector('.ContextMenu')
            console.log(menu, 'menu')
            if (!menu) return
            //getBoundingClientRect返回一个 DOMRect 对象，其提供了元素的大小及其相对于视口的位置。
            const menuRect = menu.getBoundingClientRect()
            const windowWidth = window.innerWidth // window.innerWidth 返回视口的宽度
            const windowHeight = window.innerHeight

            // 如果菜单右侧超出窗口，则将菜单左移
            if (menuRect.right > windowWidth) {
                left = windowWidth - menuRect.width
            }

            // 如果菜单底部超出窗口，则将菜单上移
            if (menuRect.bottom > windowHeight) {
                top = windowHeight - menuRect.height
            }

            setState({
                left,
                top,
                visible,
                lastEvent,
            })
        }, 0)
    }


    const hide = () => {
        setState({
            visible: false,
        })
    }

    const handleClickOutside = (e: MouseEvent) => {
        // 如果菜单可见且点击位置不在菜单内，则隐藏菜单
        // @ts-ignore
        const closest = e.target.closest('.ContextMenu')
        console.log(closest, visible, visible && !closest, 'eeeeeeeeee')

        if (visible && !closest) {
            hide()
        }
    }

    const handleCommand = (command: string | undefined) => {
        // 向父组件发送命令和事件对象
        props.command({ command, event: state.lastEvent })
        // 执行命令后隐藏菜单
        hide()
    }


    // 组件挂载时添加全局事件监听
    useMount(() => {
        // 监听全局点击事件，用于关闭菜单
        document.addEventListener('click', (e) => {
            console.log(e, 'eeeeeeeeee')
            handleClickOutside(e)
        })

        // 监听全局右键事件，阻止地球区域的默认右键菜单     //通常在鼠标点击右键或者按下键盘上的菜单键时被触发
        document.addEventListener('contextmenu', (e) => {
            // @ts-ignore
            if (e?.target?.closest('.earth')) {
                e.preventDefault()
            }
        })
    })

    // 组件卸载时移除全局事件监听，防止内存泄漏
    useUnmount(() => {
        document.removeEventListener('click', (e) => {
            handleClickOutside(e)
        })
        document.removeEventListener('contextmenu', (e) => {
            // @ts-ignore
            if (e?.target?.closest('.earth')) {
                e.preventDefault()
            }
        })
    })

    return (
        <>
            <div className={classNames(styles.ContextMenu, 'ContextMenu')} style={{ top: state.top, left: state.left, display: state.visible ? 'block' : 'none' }}>
                <ul className={styles.menuList} >
                    {
                        state.BTNList.map(item => (
                            item.hasChil ?
                                <li className={classNames(styles.menuItem, styles.submenu)}>
                                    <i></i>
                                    <span>{item.title}</span>
                                    <ul className={styles.submenuList} >
                                        {
                                            item?.list.map((chil: { Fn: string | undefined; }) => (
                                                <li className={styles.menuItem} onClick={() => handleCommand(chil.Fn)}>工具1</li>
                                            ))
                                        }
                                    </ul>
                                </li>
                                :
                                <li className={styles.menuItem} onClick={() => handleCommand(item.Fn)}>
                                    <i ></i>
                                    <span>{item.title}</span>
                                </li>

                        ))
                    }
                </ul>
            </div>
        </>

    );
});
