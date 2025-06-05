import type { TransferProps } from 'antd';
import { Transfer } from 'antd';

interface PropsType extends TransferProps<any> {
  value?: string[];
}

export default (props: PropsType) => {
  const { value, ...otherProps } = props;

  return <Transfer targetKeys={value} {...otherProps} />;
};
