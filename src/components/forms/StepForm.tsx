import type { FormInstance, StepFormProps } from '@ant-design/pro-form';
import { StepsForm } from '@ant-design/pro-form';
import { Children, cloneElement, useRef } from 'react';

function StepForm<T = Record<string, any>>(props: StepFormProps<T>) {
  const formRef = useRef<FormInstance<T>>();

  const { children, ...stepProps } = props;

  return (
    <StepsForm.StepForm<T> {...stepProps} formRef={formRef}>
      {Children.map(children, (child) => child && cloneElement(child, { ...child.props, formRef }))}
    </StepsForm.StepForm>
  );
}

export default StepForm;
