import { useSetState } from 'ahooks';
import { Empty, Space } from 'antd';
import type { CheckableTagProps } from 'antd/lib/tag/CheckableTag';
import CheckableTag from 'antd/lib/tag/CheckableTag';
import { keys } from 'lodash-es';

import styles from './style.less';

interface PropsType {
  value?: string[];
  valueEnum?: Record<string, { icon?: React.ReactElement; title: string }>;
  onChange?: (selectTags: string[]) => void;
  tagProps?: CheckableTagProps;
}

export default (props: PropsType) => {
  const { onChange, value = [], valueEnum = {} } = props;
  const [state] = useSetState({
    tags: keys(valueEnum) as string[],
  });

  return (
    <div className={styles.tags}>
      {state.tags.length ? (
        state.tags.map((tag) => (
          <CheckableTag
            key={tag}
            checked={value.indexOf(tag) > -1}
            onChange={(checked) =>
              onChange?.(checked ? [...value, tag] : value.filter((v) => v !== tag))
            }
            {...props.tagProps}
          >
            <Space>
              {valueEnum[tag].icon}
              {valueEnum[tag].title}
            </Space>
          </CheckableTag>
        ))
      ) : (
        <Empty />
      )}
    </div>
  );
};
