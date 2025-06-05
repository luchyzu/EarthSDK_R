import { useEffect } from 'react';

import { useModel } from 'umi';

import { useUnmount, useSetState } from 'ahooks';

export default () => {
    const { mapData, setMap } = useModel('useLeaflet');
    const [state, setState] = useSetState({

    });

    useEffect(() => {

    }, []);



    return (
        <div
            id="map"
            style={{ zoom: state.scale, width: '100%', height: '80vh', position: 'relative', zIndex: 0 }}
        />
    );
};
