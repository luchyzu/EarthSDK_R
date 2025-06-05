import { styleConfig } from '@/utils/constants';
import type { FormInstance, DrawerFormProps } from '@ant-design/pro-form';
import { DrawerForm } from '@ant-design/pro-form';
import type { SubmitterProps } from '@ant-design/pro-form/lib/components/Submitter';
import { useCreation, useDebounceFn, useSetState } from 'ahooks';
import { cloneDeep } from 'lodash-es';

export type FormModalProps<T> = Omit<DrawerFormProps<T>, 'submitter'> & {
  submitter?:
    | (Omit<
        SubmitterProps<{
          form?: FormInstance<any>;
        }>,
        'render'
      > & {
        render?:
          | ((
              props: SubmitterProps &
                T & {
                  submit: () => void;
                  reset: () => void;
                },
              dom: JSX.Element[],
              changeFields: Record<string, any>[],
            ) => React.ReactNode[] | React.ReactNode | false)
          | false;
      })
    | false;
};

export default <T,>({ visible, initialValues, submitter, ...props }: FormModalProps<T>) => {
  const [state, setState] = useSetState({
    changeFields: [] as Record<string, any>[],
    initialValues: {} as Record<string, any>,
  });

  useCreation(() => {
    if (visible) {
      setState({
        initialValues: cloneDeep(initialValues),
        changeFields: [],
      });
    }
  }, [visible]);

  const { run } = useDebounceFn(
    (changeFields: Record<string, any>[]) => {
      if (visible)
        setState({
          changeFields,
        });
    },
    { wait: 500 },
  );

  const drawerProps: DrawerFormProps<T> = {
    width: styleConfig.modalWidth,
    centered: true,
    onFieldsChange: (_, allFields) => {
      const fields = allFields.filter(
        (o) => o.touched && state.initialValues[o.name[0]] !== o.value,
      );
      run(fields);
    },
    ...props,
    drawerProps: { destroyOnClose: true, ...props.drawerProps },
    submitter:
      submitter === false || !submitter
        ? submitter
        : {
            ...submitter,
            render: submitter.render
              ? (...args) => submitter.render(...args, state.changeFields)
              : submitter.render,
          },
    visible,
    initialValues,
  };

  return <DrawerForm {...drawerProps} />;
};
