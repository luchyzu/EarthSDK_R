import { findTree } from '@/utils/utils';
import { useMount, useSetState } from 'ahooks';
import type { CascaderProps } from 'antd';
import { Cascader } from 'antd';
import type { CascaderValueType } from 'antd/lib/cascader';
import { get, last, slice } from 'lodash-es';

export default (props: CascaderProps & { value?: string; onKeyChange?: (key: string) => void }) => {
  const {
    value,
    onChange,
    onKeyChange,
    fieldNames = { label: 'label', value: 'value', children: 'children' },
    options,
    ...other
  } = props;

  const [state, setState] = useSetState({
    value: [] as CascaderValueType,
    newProps: {
      fieldNames,
      getPopupContainer: (triggerNode) => triggerNode.parentElement!,
      ...other,
    } as CascaderProps,
  });

  useMount(() => {
    const item = findTree(options, value, fieldNames.value);
    if (item) {
      const keys = item.key.split('.');
      setState({
        value: keys.map(
          (v, i) => get(options, slice(keys, 0, i + 1).join('.'))?.[fieldNames.value],
        ),
      });
    }
  });
  return (
    <Cascader
      {...state.newProps}
      value={state.value}
      options={options}
      placeholder="请选择"
      onChange={(values, selectedOptions) => {
        setState({ value: values });
        // @ts-ignore
        onChange?.(values.length ? last(values) : undefined, selectedOptions);
      }}
    />
  );
};
