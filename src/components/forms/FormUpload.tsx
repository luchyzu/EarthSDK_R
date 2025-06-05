import useCallApi from '@/hooks/useCallApi';
import { DOWNLOAD_URL, fileFind, fileInfo } from '@/services/FILE_SYSTEM_API/file';
import { DEFAULT_DATE_TIME_FORMAT, typeMap } from '@/utils/constants';
import { convertSearchList } from '@/utils/utils';
import { useCreation, useDebounce, useDebounceFn, useMemoizedFn, useSetState } from 'ahooks';
import type { FormItemProps, PopoverProps, UploadProps } from 'antd';
import { Form, Image, Row, Select, Space, Typography } from 'antd';
import moment from 'moment';
import type { UploadParamsType } from '../buttons/ButtonUpload';
import InputUpload from '../inputs/InputUpload';
import PreviewJson from '../previews/PreviewJson';
import styles from './style.less';

export default <T,>({
  uploadParams,
  uploadProps,
  onInfoChange,
  searchOnly,
  ...formItemProps
}: FormItemProps<T> & {
  uploadParams?: UploadParamsType;
  uploadProps?: UploadProps;
  disabled?: boolean;
  onInfoChange?: (info?: Record<string, any>) => void;
  searchOnly?: boolean;
}) => {
  const [state, setState] = useSetState<{
    popoverProps?: PopoverProps & { key: string; fullPath: string };
    model: string;
    isSearch: boolean;
    options: { label: string; value: string }[];
    loading: boolean;
    open: boolean;
  }>({
    model: 'upload',
    options: [],
    loading: false,
    open: false,
    isSearch: searchOnly || false,
  });

  const [callApi] = useCallApi({
    info: fileInfo,
    list: fileFind,
  });

  const waitOpen = useDebounce(state.open, { wait: 500 });

  const { run } = useDebounceFn(
    async (v) => {
      if (v.length === 32) return;
      setState({ loading: true });
      const { result } = await callApi('list', {
        pageNum: 0,
        searchList: convertSearchList({
          _keyword: v,
        }),
      });
      setState({
        loading: false,
        open: true,
        options: result.data.data.map((o) => ({
          label: (
            <Space>
              {o.name}
              <Typography.Text type="secondary">{`( 存储类型: ${o.typeName} 上传时间: ${moment(
                o.createTime,
              ).format(DEFAULT_DATE_TIME_FORMAT)} )`}</Typography.Text>
            </Space>
          ),
          value: o.fileId,
        })),
      });
    },
    { wait: 500 },
  );

  const validator = useMemoizedFn(async (rule, id) => {
    if (id?.length === 32) {
      try {
        if (id !== state.popoverProps?.key) {
          const { result } = await callApi('info', {
            id,
          });
          setState({
            popoverProps: {
              key: result.data.fileId,
              fullPath: result.data.fullPath,
              title: '资源详情',
              content: (
                <Space>
                  <PreviewJson src={result.data} />
                  {/^image/.test(result.data.mimeType) && (
                    <Row justify="center">
                      <Image
                        style={{ maxWidth: 300, maxHeight: 300 }}
                        src={`${DOWNLOAD_URL}${result.data.fileId}`}
                        alt={result.data.name}
                      />
                    </Row>
                  )}
                </Space>
              ),
            },
          });
        }
        return Promise.resolve();
        // eslint-disable-next-line no-empty
      } catch {}
    }
    return id?.length ? Promise.reject() : Promise.resolve();
  });

  useCreation(() => {
    onInfoChange?.(state.popoverProps);
  }, [state.popoverProps]);

  return (
    <Form.Item
      className={styles.upload}
      {...formItemProps}
      rules={[
        ...(formItemProps.rules || []),
        {
          validator,
          message: '资源 ID 无效',
        },
      ]}
    >
      <InputUpload
        loading={state.loading}
        onBlur={() => setState({ open: false })}
        onFocus={() => setState({ open: true })}
        isSearch={state.isSearch}
        popoverProps={state.popoverProps}
        uploadParams={uploadParams}
        uploadProps={uploadProps}
        disabled={formItemProps.disabled}
        mountFn={validator}
        onChange={(v) => {
          if (!v.length) setState({ options: [] });
          if (state.isSearch && v.length > 2) run(v);
        }}
        addonAfter={
          !searchOnly && (
            <Select
              size="small"
              value={state.model}
              onSelect={(v) => setState({ isSearch: v === 'search', model: v, options: [] })}
              options={[
                { label: typeMap.upload, value: 'upload' },
                { label: typeMap.search, value: 'search' },
              ]}
            />
          )
        }
        selectProps={{
          open: state.isSearch && waitOpen,
          options: state.options,
          onSelect: () => setState({ open: false, options: [] }),
        }}
      />
    </Form.Item>
  );
};
