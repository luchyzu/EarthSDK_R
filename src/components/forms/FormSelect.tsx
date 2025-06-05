import { ProFormSelect } from '@ant-design/pro-form';
import type { ProFormSelectProps } from '@ant-design/pro-form/lib/components/Select';
import { useCreation, useSetState } from 'ahooks';
import { includes, values } from 'lodash-es';

export default (
  props: ProFormSelectProps & {
    optionDynamic?: boolean;
  },
) => {
  const [state, setState] = useSetState({
    search: '',
    labels: [],
    valueEnum: {},
  });

  useCreation(
    () =>
      setState({
        labels: values(props.valueEnum),
        valueEnum: props.valueEnum,
      }),
    [props.valueEnum],
  );

  const fromProps: ProFormSelectProps = {
    ...props,
    valueEnum: state.valueEnum,
    fieldProps: {
      ...props.fieldProps,
      showSearch: true,
      optionFilterProp: 'label',
      searchValue: state.search,
      onSearch: (v) => {
        let valueEnum = props.valueEnum;
        if (valueEnum && props.optionDynamic && !includes(state.labels, v)) {
          valueEnum = { ...valueEnum, [v]: v };
        }
        setState({ search: v, valueEnum });
      },
      getPopupContainer: (triggerNode) => triggerNode.parentElement,
    },
  };
  return <ProFormSelect {...fromProps} />;
};
